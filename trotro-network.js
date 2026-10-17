/* ==========================================================================
   trotro-network.js - Ghana trotro stop network + interchange planner
   --------------------------------------------------------------------------
   WHY THIS FILE EXISTS
   A trotro passenger never travels door to door. The car does not come to
   your door, and it does not stop at your destination either: you walk to a
   stop, catch a car, CHANGE CARS at an interchange, and get off at a stop
   near where you are going. The planner has to understand that, or it fails
   trips that are completely ordinary.

   Every walk this file reports is a walk to a STOP - a walk you take in
   order to catch a car: to the stop where you board, or to the stop where
   you change cars. The trip ends when you step off the last car, so this
   file never reports a walk from a stop to the destination. How far the
   searched place is from the stop you get off at is published as `gapM` on
   the last leg: information for the passenger, never walking time and never
   walking distance on the itinerary.

   Worked example this file is built around:
     Labadi -> Ablekuma.
     There is no single car that does both. You take a car towards Circle and
     change there, or change earlier at a smaller stop if you would rather
     not travel as far. Both are real options and the planner shows both.

   THE MODEL
   Stops are nodes. Riding between two consecutive stops is an edge that
   carries the route it belongs to. Route identity matters, because you
   cannot stay on board after the car terminates, so the search runs over
   (stop, route) pairs rather than plain stops.

     origin --walk--> stop --board--> (stop,route) --ride--> ... --alight-->
     the stop where you get off. There is no walk leg after that: the car is
     the trip, and the passengers' own last few hundred metres are not part
     of it.

   A change of car is only possible where it is real:
     - a stop two routes both serve (shared by name), or
     - a declared interchange in `interchanges` below, or
     - a short walk (under `transferWalkM`) to a nearby stop.
   Nothing else is invented. If no honest path exists the planner says so
   rather than drawing a straight line and calling it a trotro ride.

   Data caveat: the routes below are the prototype network for Greater
   Accra. They are geographically placed but they are NOT a verified national
   route database. Extend them as real GPRTU branch data arrives; the
   planner needs no changes to work with more routes. The national stop
   extract (ghana_all_stops.geojson) is separate data: every trotro stop,
   bus station and transport platform in Ghana, answering "which stops are
   near me" via nearestStops() in section 9. It is data, not routes: a stop
   from it can be boarded from, never planned through.
   ========================================================================== */

(function (global) {
  'use strict';

  /* ======================================================================
     1. TUNING - change these to change how the planner behaves
     ====================================================================== */
  var meta = {
    version: '2026.10.01',
    // 1.25 m/s is 75 m/min, about 4.5 km/h. Normal adult walking pace.
    // Do NOT put a per-minute figure here: every time is metres/speed/60.
    walkingSpeedMps: 1.25,
    urbanSpeedKph: 16,         // average trotro speed in dense city traffic
    roadFactor: 1.25,          // road distance / straight line, urban
    dwellMinutesPerStop: 1.5,  // loading time at each intermediate stop
    boardWaitMinutes: 4,       // expected wait for a car at a stop
    transferWaitMinutes: 6,    // extra wait when changing cars
    transferPenaltyMinutes: 12,// how strongly to avoid an extra change
    accessWalkM: 2000,         // how far you will walk to catch a car (~27 min)
    // How far the searched place may be from a stop for that stop to count as
    // the stop you get off at. 3 km, not 2: a searched point a couple of
    // kilometres from the nearest stop (an Accra Mall result, a "Teshie" that
    // the geocoder put in Tema) is still served by that stop, and the journey
    // is honest about it because the distance is published on the last leg and
    // counted in the ranking and in the time. The gap is information only: it
    // is not a walk leg, not walking distance and not walking time on the trip.
    egressWalkM: 3000,
    transferWalkM: 700,        // walk to a different stop to change cars
    maxWalkOnlyM: 3000,        // offer a walk-only trip up to this distance
    stopMergeRadiusM: 200,     // same-name entries closer than this are one physical stop
    accessWalkWeight: 2.0,      // walking to the first car / from the last car counts double vs riding
    maxTransfers: 3,
    maxItineraries: 3,
    // Second and third options reuse the first path's edges with this much
    // extra cost. Alternatives usually share the same trunk road, so they are
    // penalised rather than banned. Banning them would remove every option,
    // because the shared road is exactly what is being reused.
    alternativePenaltyMinutes: 15
  };

  /* ======================================================================
     2. THE ROUTE NETWORK
     ----------------------------------------------------------------------
     Stops are [ name, lon, lat ]. Order is the direction the car travels, so
     a route can only be boarded heading forwards along that order.

     Roads are shared between routes on purpose. That shared trunk is what
     makes an interchange possible, and it is how trotro actually runs: many
     cars converge on Circle and continue down the same road.
     ====================================================================== */
  var routes = [
    {
      // Colour is how a car is told apart on the map and in the car list, so two
      // different cars must never share one. A near-black is also unreadable as
      // a line on the map, so the main trunk gets its own strong blue.
      id: 'madina-circle', name: 'Madina -> Circle', color: '#1d4ed8',
      stops: [['Madina', -0.1680, 5.6830], ['Legon', -0.1860, 5.6500], ['37', -0.1854, 5.5865], ['Circle', -0.2177, 5.5568]]
    },
    {
      id: 'circle-madina', name: 'Circle -> Madina', color: '#1d4ed8',
      stops: [['Circle', -0.2177, 5.5568], ['37', -0.1854, 5.5865], ['Legon', -0.1860, 5.6500], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'labadi-madina', name: 'Labadi -> Madina', color: '#1976ff',
      stops: [['Labadi', -0.2830, 5.5670], ['La', -0.2620, 5.5650], ['Cantonments', -0.2480, 5.5620], ['Circle', -0.2177, 5.5568], ['37', -0.1854, 5.5865], ['Legon', -0.1860, 5.6500], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-labadi', name: 'Madina -> Labadi', color: '#1976ff',
      stops: [['Madina', -0.1680, 5.6830], ['Legon', -0.1860, 5.6500], ['37', -0.1854, 5.5865], ['Circle', -0.2177, 5.5568], ['Cantonments', -0.2480, 5.5620], ['La', -0.2620, 5.5650], ['Labadi', -0.2830, 5.5670]]
    },
    {
      id: 'kaneshie-madina', name: 'Kaneshie -> Madina', color: '#8b5cf6',
      stops: [['Kaneshie', -0.2490, 5.5598], ['Odorkor', -0.2640, 5.5660], ['Circle', -0.2177, 5.5568], ['37', -0.1854, 5.5865], ['Legon', -0.1860, 5.6500], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-kaneshie', name: 'Madina -> Kaneshie', color: '#8b5cf6',
      stops: [['Madina', -0.1680, 5.6830], ['Legon', -0.1860, 5.6500], ['37', -0.1854, 5.5865], ['Circle', -0.2177, 5.5568], ['Odorkor', -0.2640, 5.5660], ['Kaneshie', -0.2490, 5.5598]]
    },
    {
      id: 'ablekuma-circle', name: 'Ablekuma -> Circle', color: '#0f9d58',
      stops: [['Ablekuma', -0.2480, 5.5720], ['Awudome', -0.2380, 5.5620], ['Circle', -0.2177, 5.5568]]
    },
    {
      id: 'circle-ablekuma', name: 'Circle -> Ablekuma', color: '#0f9d58',
      stops: [['Circle', -0.2177, 5.5568], ['Awudome', -0.2380, 5.5620], ['Ablekuma', -0.2480, 5.5720]]
    },
    {



      // The second way to reach Ablekuma. This is what lets the planner offer
      // an earlier change at Cantonments instead of going all the way to Circle.
      id: 'ablekuma-labadi', name: 'Ablekuma -> Labadi', color: '#c2410c',
      stops: [['Ablekuma', -0.2480, 5.5720], ['Cantonments', -0.2480, 5.5620], ['La', -0.2620, 5.5650], ['Labadi', -0.2830, 5.5670]]
    },
    {
      id: 'labadi-ablekuma', name: 'Labadi -> Ablekuma', color: '#c2410c',
      stops: [['Labadi', -0.2830, 5.5670], ['La', -0.2620, 5.5650], ['Cantonments', -0.2480, 5.5620], ['Ablekuma', -0.2480, 5.5720]]
    },
    {
      id: 'kasoa-madina', name: 'Kasoa -> Madina', color: '#e8710a',
      stops: [['Kasoa', -0.4167, 5.5333], ['Duman', -0.3800, 5.5350], ['Weija', -0.3400, 5.5400], ['Gomoa Fie', -0.3100, 5.5430], ['Kwashi', -0.2900, 5.5480], ['Abossey Okai', -0.2700, 5.5480], ['Kaneshie', -0.2490, 5.5598], ['Odorkor', -0.2640, 5.5660], ['Circle', -0.2177, 5.5568], ['37', -0.1854, 5.5865], ['Legon', -0.1860, 5.6500], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-kasoa', name: 'Madina -> Kasoa', color: '#e8710a',
      stops: [['Madina', -0.1680, 5.6830], ['Legon', -0.1860, 5.6500], ['37', -0.1854, 5.5865], ['Circle', -0.2177, 5.5568], ['Odorkor', -0.2640, 5.5660], ['Kaneshie', -0.2490, 5.5598], ['Abossey Okai', -0.2700, 5.5480], ['Kwashi', -0.2900, 5.5480], ['Gomoa Fie', -0.3100, 5.5430], ['Weija', -0.3400, 5.5400], ['Duman', -0.3800, 5.5350], ['Kasoa', -0.4167, 5.5333]]
    },
    {
      id: 'adenta-madina', name: 'Adenta -> Madina', color: '#d93025',
      stops: [['Adenta', -0.2000, 5.6120], ['Ashiyie', -0.1100, 5.6500], ['Abokobi', -0.1800, 5.6600], ['Malata', -0.1300, 5.6700], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-adenta', name: 'Madina -> Adenta', color: '#d93025',
      stops: [['Madina', -0.1680, 5.6830], ['Malata', -0.1300, 5.6700], ['Abokobi', -0.1800, 5.6600], ['Ashiyie', -0.1100, 5.6500], ['Adenta', -0.2000, 5.6120]]
    },
    {
      id: 'tema-madina', name: 'Tema -> Madina', color: '#00838f',
      stops: [['Tema', 0.0059, 5.6698], ['Afienya', -0.0300, 5.6300], ['Adenta', -0.2000, 5.6120], ['Ashiyie', -0.1100, 5.6500], ['Abokobi', -0.1800, 5.6600], ['Malata', -0.1300, 5.6700], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-tema', name: 'Madina -> Tema', color: '#00838f',
      stops: [['Madina', -0.1680, 5.6830], ['Malata', -0.1300, 5.6700], ['Abokobi', -0.1800, 5.6600], ['Ashiyie', -0.1100, 5.6500], ['Adenta', -0.2000, 5.6120], ['Afienya', -0.0300, 5.6300], ['Tema', 0.0059, 5.6698]]
    },
    {
      id: 'circle-nsawam', name: 'Circle -> Nsawam', color: '#6b7280',
      stops: [['Circle', -0.2177, 5.5568], ['Amrahia', -0.2300, 5.6300], ['Kwahu', -0.2600, 5.6050], ['Adum', -0.3000, 5.7000], ['Nsawam', -0.4000, 5.8000]]
    },
    {
      id: 'nsawam-circle', name: 'Nsawam -> Circle', color: '#6b7280',
      stops: [['Nsawam', -0.4000, 5.8000], ['Adum', -0.3000, 5.7000], ['Kwahu', -0.2600, 5.6050], ['Amrahia', -0.2300, 5.6300], ['Circle', -0.2177, 5.5568]]
    },

    /* ----------------------------------------------------------------------
       The corridors below were added because the network above was missing the
       parts of Accra people actually live in and travel from. Every one of them
       joins an EXISTING stop (37, Legon, Madina, Circle, Kaneshie, Amrahia,
       Kwahu, Abossey Okai, Gomoa Fie, Kwashi) rather than floating on its own, so
       each new place inherits the whole network through a real interchange
       instead of needing an invented connection.
       ---------------------------------------------------------------------- */
    {
      // Osu and the lagoon-side communities. Osu had no stop at all, which made
      // it 3.2 km from the nearest one, so trips from there could never plan.
      id: 'osu-circle', name: 'Osu -> Circle', color: '#0e7490',
      stops: [['Osu', -0.1820, 5.5577], ['Nima', -0.1855, 5.5500], ['Adabraka', -0.2050, 5.5595], ['Circle', -0.2177, 5.5568]]
    },
    {
      id: 'circle-osu', name: 'Circle -> Osu', color: '#0e7490',
      stops: [['Circle', -0.2177, 5.5568], ['Adabraka', -0.2050, 5.5595], ['Nima', -0.1855, 5.5500], ['Osu', -0.1820, 5.5577]]
    },
    {
      // Airport City into the 37 / Legon trunk. Previously the nearest stop was
      // 2.6 km away, i.e. further than anyone is expected to walk to a car.
      id: 'airport-city-legon', name: 'Airport City -> Legon', color: '#0369a1',
      stops: [['Airport City', -0.1719, 5.6052], ['Ridge', -0.1770, 5.5920], ['37', -0.1854, 5.5865], ['Legon', -0.1860, 5.6500]]
    },
    {
      id: 'legon-airport-city', name: 'Legon -> Airport City', color: '#0369a1',
      stops: [['Legon', -0.1860, 5.6500], ['37', -0.1854, 5.5865], ['Ridge', -0.1770, 5.5920], ['Airport City', -0.1719, 5.6052]]
    },
    {
      // East Legon straight onto the Madina car, no change of car needed.
      id: 'east-legon-madina', name: 'East Legon -> Madina', color: '#7c3aed',
      stops: [['East Legon', -0.1640, 5.6390], ['Legon', -0.1860, 5.6500], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-east-legon', name: 'Madina -> East Legon', color: '#7c3aed',
      stops: [['Madina', -0.1680, 5.6830], ['Legon', -0.1860, 5.6500], ['East Legon', -0.1640, 5.6390]]
    },
    {
      // Achimota, Haatso and Kwadaso, joining the northern Nsawam corridor at
      // Amrahia and Kwahu. Achimota is a place people search for by name.
      id: 'kwadaso-amrahia', name: 'Kwadaso -> Amrahia', color: '#b45309',
      stops: [['Kwadaso', -0.2400, 5.6050], ['Achimota', -0.2296, 5.6160], ['Haatso', -0.2400, 5.6350], ['Amrahia', -0.2300, 5.6300], ['Kwahu', -0.2600, 5.6050]]
    },
    {
      id: 'amrahia-kwadaso', name: 'Amrahia -> Kwadaso', color: '#b45309',
      stops: [['Amrahia', -0.2300, 5.6300], ['Haatso', -0.2400, 5.6350], ['Achimota', -0.2296, 5.6160], ['Kwadaso', -0.2400, 5.6050]]
    },
    {
      // The western coastal road, Spintex through Teshie and Nungua, joining the
      // Kasoa trunk at Gomoa Fie so it becomes an interchange, not a dead end.
      id: 'spintex-abossey', name: 'Spintex -> Abossey Okai', color: '#0891b2',
      stops: [['Spintex', -0.3700, 5.5300], ['Adjen Kotoku', -0.3450, 5.5350], ['Teshie', -0.3300, 5.5250], ['Nungua', -0.3050, 5.5350], ['Gomoa Fie', -0.3100, 5.5430], ['Kwashi', -0.2900, 5.5480], ['Abossey Okai', -0.2700, 5.5480]]
    },
    {
      id: 'abossey-spintex', name: 'Abossey Okai -> Spintex', color: '#0891b2',
      stops: [['Abossey Okai', -0.2700, 5.5480], ['Kwashi', -0.2900, 5.5480], ['Gomoa Fie', -0.3100, 5.5430], ['Nungua', -0.3050, 5.5350], ['Teshie', -0.3300, 5.5250], ['Adjen Kotoku', -0.3450, 5.5350], ['Spintex', -0.3700, 5.5300]]
    },
    {
      // Dansoman and Chorkor into Circle, the short southern link.
      id: 'dansoman-circle', name: 'Dansoman -> Circle', color: '#be123c',
      stops: [['Dansoman', -0.2450, 5.5700], ['Chorkor', -0.2200, 5.5400], ['Circle', -0.2177, 5.5568]]
    },
    {
      id: 'circle-dansoman', name: 'Circle -> Dansoman', color: '#be123c',
      stops: [['Circle', -0.2177, 5.5568], ['Chorkor', -0.2200, 5.5400], ['Dansoman', -0.2450, 5.5700]]
    },
    // --- Giffard Road / Palm Wine / Osu / Labadi Corridors ---
    {
      id: 'palmwine-circle', name: 'Bush Canteen -> Circle', color: '#0284c7',
      stops: [['Teshie', -0.1189, 5.5843], ['Trade Fair', -0.1360, 5.5720], ['Villas', -0.1500, 5.5700], ['Kpogas', -0.1502, 5.5670], ['La Traffic Light', -0.1510, 5.5680], ['Palmwine Bush Canteen', -0.1530, 5.5720], ['Wireless Station', -0.1580, 5.5705], ['Burma Camp', -0.1600, 5.5710], ['37', -0.1854, 5.5865], ['Circle', -0.2177, 5.5568]]
    },
    {
      id: 'circle-palmwine', name: 'Circle -> Bush Canteen', color: '#0284c7',
      stops: [['Circle', -0.2177, 5.5568], ['37', -0.1854, 5.5865], ['Burma Camp', -0.1600, 5.5710], ['Wireless Station', -0.1580, 5.5705], ['Palmwine Bush Canteen', -0.1530, 5.5720], ['La Traffic Light', -0.1510, 5.5680], ['Kpogas', -0.1502, 5.5670], ['Villas', -0.1500, 5.5700], ['Trade Fair', -0.1360, 5.5720], ['Teshie', -0.1189, 5.5843]]
    },
    {
      id: 'palmwine-madina', name: 'Palm Wine -> Madina', color: '#2563eb',
      stops: [['Palmwine Bush Canteen', -0.1530, 5.5720], ['Wireless Station', -0.1580, 5.5705], ['Burma Camp', -0.1600, 5.5710], ['37', -0.1854, 5.5865], ['Legon', -0.1860, 5.6500], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-palmwine', name: 'Madina -> Palm Wine', color: '#2563eb',
      stops: [['Madina', -0.1680, 5.6830], ['Legon', -0.1860, 5.6500], ['37', -0.1854, 5.5865], ['Burma Camp', -0.1600, 5.5710], ['Wireless Station', -0.1580, 5.5705], ['Palmwine Bush Canteen', -0.1530, 5.5720]]
    },
    {
      id: 'labadi-coastal-osu', name: 'Labadi Station -> Osu', color: '#059669',
      stops: [['Labadi Station', -0.1542, 5.5670], ['Trade Fair', -0.1360, 5.5720], ['Villas', -0.1500, 5.5700], ['Kpogas', -0.1502, 5.5670], ['La Traffic Light', -0.1510, 5.5680], ['Palmwine Bush Canteen', -0.1530, 5.5720], ['Osu', -0.1820, 5.5577]]
    },
    {
      id: 'osu-coastal-labadi', name: 'Osu -> Labadi Station', color: '#059669',
      stops: [['Osu', -0.1820, 5.5577], ['Palmwine Bush Canteen', -0.1530, 5.5720], ['La Traffic Light', -0.1510, 5.5680], ['Kpogas', -0.1502, 5.5670], ['Villas', -0.1500, 5.5700], ['Trade Fair', -0.1360, 5.5720], ['Labadi Station', -0.1542, 5.5670]]
    },
  ];

  if (typeof generated_routes !== 'undefined') {
    routes = routes.concat(generated_routes);
  }

  /* ======================================================================
     GHANA NATIONAL TRANSIT ROUTING GRAPH (150+ TERMINALS & CORRIDOR EDGES)
     Engineered for Dijkstra Pathfinding in trotro-network.js
     ====================================================================== */
  var GHANA_TRANSIT_GRAPH = {
    nodes: [
      // === ACCRA COASTAL & SOUTH CORRIDOR ===
      { id: 'tema_station_accra', name: 'Tema Station (Accra Central)', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5458, -0.2017] },
      { id: 'ministries_station', name: 'Ministries Station', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5492, -0.1983] },
      { id: 'osu_oxford_street', name: 'Osu Oxford Street (Frankies)', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5562, -0.1822] },
      { id: 'osu_danquah_circle', name: 'Danquah Circle (Osu)', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5645, -0.1795] },
      { id: 'labadi_station', name: 'Labadi Lorry Station', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5670, -0.1542] },
      { id: 'labadi_kpogas', name: 'Labadi Kpogas Furniture', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5712, -0.1458] },
      { id: 'labadi_beach_jct', name: 'Labadi Beach Junction', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5641, -0.1491] },
      { id: 'la_general_hospital', name: 'La General Hospital', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5684, -0.1601] },
      { id: 'trade_fair_station', name: 'Trade Fair Station (La)', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5801, -0.1425] },
      { id: 'teshie_first_jct', name: 'Teshie First Junction', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5843, -0.1189] },
      { id: 'teshie_marrick_jct', name: 'Teshie Marrick / Police Station', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5862, -0.1084] },
      { id: 'teshie_tsuibleoo', name: 'Teshie Tsuibleoo Last Stop', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.5995, -0.1021] },
      { id: 'nungua_barrier', name: 'Nungua Barrier (Cold Store)', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6021, -0.0862] },
      { id: 'nungua_station', name: 'Nungua Traditional Station', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6048, -0.0768] },
      { id: 'sakumono_village', name: 'Sakumono Village / Estate Jct', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6262, -0.0531] },
      { id: 'tema_comm1_station', name: 'Tema Community 1 Main Station', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6482, -0.0078] },
      { id: 'tema_harbour_roundabout', name: 'Tema Harbour Roundabout', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6415, -0.0019] },
      { id: 'tema_comm2_station', name: 'Tema Community 2 (BBC)', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6565, -0.0151] },
      { id: 'tema_comm4_station', name: 'Tema Community 4 Hospital Road', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6631, -0.0092] },
      { id: 'tema_comm9_roundabout', name: 'Tema Community 9 General Hospital Roundabout', region: 'Greater Accra', corridor: 'Accra-Coastal', coordinates: [5.6781, -0.0041] },

      // === ACCRA WEST & CENTRAL METROPOLITAN ===
      { id: 'circle_neoplan_station', name: 'Kwame Nkrumah Circle (Neoplan Station)', region: 'Greater Accra', corridor: 'Accra-Central', coordinates: [5.5582, -0.2189] },
      { id: 'circle_odawna_station', name: 'Circle Odawna Station', region: 'Greater Accra', corridor: 'Accra-Central', coordinates: [5.5551, -0.2155] },
      { id: 'kaneshie_main_station', name: 'Kaneshie Complex / Main Station', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5598, -0.2490] },
      { id: 'kaneshie_first_light', name: 'Kaneshie First Light', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5632, -0.2561] },
      { id: 'abossey_okai_station', name: 'Abossey Okai Spare Parts Hub', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5532, -0.2371] },
      { id: 'odorkor_station', name: 'Odorkor Official Town Station', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5668, -0.2642] },
      { id: 'odorkor_tipper_jct', name: 'Odorkor Tipper Junction', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5719, -0.2711] },
      { id: 'mallam_market_station', name: 'Mallam Market Station', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5739, -0.2882] },
      { id: 'mallam_junction', name: 'Mallam Interchange / Junction', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5771, -0.2938] },
      { id: 'gbawe_station', name: 'Gbawe Zero Station', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5901, -0.3021] },
      { id: 'weija_junction', name: 'Weija Barrier / Junction', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5645, -0.3341] },
      { id: 'tetteh_quarshie_west_scc', name: 'SCC / West Hills Mall Bus Stop', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5539, -0.3582] },
      { id: 'tetegu_junction', name: 'Tetegu Junction', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5581, -0.3451] },
      { id: 'bortianor_junction', name: 'Old Barrier / Bortianor Junction', region: 'Greater Accra', corridor: 'Accra-West', coordinates: [5.5492, -0.3725] },
      { id: 'kasoa_new_market', name: 'Kasoa New Market Station', region: 'Central', corridor: 'Accra-Kasoa', coordinates: [5.5342, -0.4262] },
      { id: 'kasoa_old_barrier', name: 'Kasoa Main Overhead / Old Station', region: 'Central', corridor: 'Accra-Kasoa', coordinates: [5.5358, -0.4191] },
      { id: 'kasoa_ofankor_jct', name: 'Ofaakor Road Junction (Kasoa)', region: 'Central', corridor: 'Accra-Kasoa', coordinates: [5.5481, -0.4352] },
      { id: 'darkuman_junction', name: 'Darkuman Junction (Kwashieman Highway)', region: 'Greater Accra', corridor: 'Accra-Central', coordinates: [5.5762, -0.2581] },
      { id: 'lapaz_station', name: 'Abeka Lapaz Overhead Station', region: 'Greater Accra', corridor: 'Accra-Circumferential', coordinates: [5.5998, -0.2458] },
      { id: 'achimota_new_station', name: 'Achimota New Transport Terminal', region: 'Greater Accra', corridor: 'N6-Kumasi-Trunk', coordinates: [5.6192, -0.2312] },
      { id: 'achimota_old_station', name: 'Achimota Old Station / Overhead', region: 'Greater Accra', corridor: 'N6-Kumasi-Trunk', coordinates: [5.6111, -0.2281] },
      { id: 'abelemkpe_junction', name: 'Abelemkpe Traffic Light', region: 'Greater Accra', corridor: 'Accra-Central', coordinates: [5.5982, -0.2141] },
      { id: 'cantonments_post_office', name: 'Cantonments Police Station / Post Office', region: 'Greater Accra', corridor: 'Accra-Central', coordinates: [5.5742, -0.1782] },
      { id: 'military_37_hospital', name: '37 Military Hospital Station', region: 'Greater Accra', corridor: 'Accra-Central', coordinates: [5.5865, -0.1854] },
      { id: 'airport_cargo_junction', name: 'Airport Cargo Junction (Kotoka)', region: 'Greater Accra', corridor: 'Accra-East', coordinates: [5.5971, -0.1785] },

      // === ACCRA EAST & NORTH CORRIDOR ===
      { id: 'tetteh_quarshie_interchange', name: 'Tetteh Quarshie Interchange / Spanner', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6112, -0.1752] },
      { id: 'shiashie_bus_stop', name: 'Shiashie Bus Stop', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6171, -0.1718] },
      { id: 'legon_campus_gate', name: 'University of Ghana (Legon Main Gate)', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6500, -0.1860] },
      { id: 'okponglo_junction', name: 'Okponglo Traffic Light', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6325, -0.1791] },
      { id: 'upsa_junction', name: 'UPSA / IPS Junction', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6575, -0.1691] },
      { id: 'madina_zongo_junction', name: 'Madina Zongo Junction', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6721, -0.1672] },
      { id: 'madina_market_station', name: 'Madina Market / Redco Station', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6830, -0.1680] },
      { id: 'ritz_junction', name: 'Ritz Junction (Madina)', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.6912, -0.1645] },
      { id: 'adenta_barrier_station', name: 'Adenta Barrier / Main Station', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.7082, -0.1581] },
      { id: 'adenta_housing_down', name: 'Adenta Housing Down (Command)', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.7191, -0.1542] },
      { id: 'frafraha_junction', name: 'Frafraha Junction', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.7381, -0.1451] },
      { id: 'amrahia_dairy_farm', name: 'Amrahia Dairy Farm Bus Stop', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.7621, -0.1342] },
      { id: 'oyibi_junction', name: 'Oyibi / Valley View University Junction', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.7891, -0.1215] },
      { id: 'dodowa_forest_station', name: 'Dodowa Main Lorry Park', region: 'Greater Accra', corridor: 'N4-Adenta', coordinates: [5.8821, -0.0952] },
      { id: 'ashaiman_main_station', name: 'Ashaiman Main Overhead Station', region: 'Greater Accra', corridor: 'Tema-Ashaiman', coordinates: [5.6982, -0.0381] },
      { id: 'ashaiman_timber_market', name: 'Ashaiman Timber Market', region: 'Greater Accra', corridor: 'Tema-Ashaiman', coordinates: [5.7051, -0.0275] },
      { id: 'afienya_barrier', name: 'Afienya Barrier', region: 'Greater Accra', corridor: 'N2-Eastern-Trunk', coordinates: [5.7812, -0.0152] },
      { id: 'dawhenya_junction', name: 'Dawhenya Barrier', region: 'Greater Accra', corridor: 'Accra-Aflao-N1', coordinates: [5.7312, 0.0521] },
      { id: 'prampram_junction', name: 'Prampram Junction', region: 'Greater Accra', corridor: 'Accra-Aflao-N1', coordinates: [5.7412, 0.0981] },

      // === ACCRA NORTH-WEST & GA WEST ===
      { id: 'ofankor_barrier', name: 'Ofankor Barrier Station', region: 'Greater Accra', corridor: 'N6-Kumasi-Trunk', coordinates: [5.6582, -0.2681] },
      { id: 'pokuase_interchange', name: 'Pokuase ACP Interchange Station', region: 'Greater Accra', corridor: 'N6-Kumasi-Trunk', coordinates: [5.6952, -0.2921] },
      { id: 'amasaman_station', name: 'Amasaman Main Station', region: 'Greater Accra', corridor: 'N6-Kumasi-Trunk', coordinates: [5.7092, -0.3051] },
      { id: 'medie_station', name: 'Medie Lorry Station', region: 'Greater Accra', corridor: 'N6-Kumasi-Trunk', coordinates: [5.7581, -0.3282] },

      // === EASTERN REGION (ACCRA - KUMASI / VOLTA CORRIDORS) ===
      { id: 'nsawam_main_station', name: 'Nsawam Main Station', region: 'Eastern', corridor: 'N6-Kumasi-Trunk', coordinates: [5.8081, -0.3512] },
      { id: 'suhum_roundabout', name: 'Suhum Overhead / Roundabout', region: 'Eastern', corridor: 'N6-Kumasi-Trunk', coordinates: [6.0412, -0.4512] },
      { id: 'koforidua_central_station', name: 'Koforidua Central / Agartha Market Station', region: 'Eastern', corridor: 'Eastern-Central', coordinates: [6.0941, -0.2602] },
      { id: 'koforidua_poly_station', name: 'Koforidua KTU / Poly Junction', region: 'Eastern', corridor: 'Eastern-Central', coordinates: [6.1082, -0.2481] },
      { id: 'bunso_junction', name: 'Bunso Cocoa College Junction', region: 'Eastern', corridor: 'N6-Kumasi-Trunk', coordinates: [6.2912, -0.4651] },
      { id: 'anyinam_station', name: 'Anyinam Station', region: 'Eastern', corridor: 'N6-Kumasi-Trunk', coordinates: [6.3681, -0.5212] },
      { id: 'nkawkaw_lorry_park', name: 'Nkawkaw Central Lorry Park', region: 'Eastern', corridor: 'N6-Kumasi-Trunk', coordinates: [6.5512, -0.7681] },
      { id: 'aburi_botanical_station', name: 'Aburi Station', region: 'Eastern', corridor: 'Akuapem-Ridge', coordinates: [5.8491, -0.1762] },
      { id: 'mamfe_roundabout', name: 'Mamfe Roundabout Station', region: 'Eastern', corridor: 'Akuapem-Ridge', coordinates: [5.9312, -0.1281] },
      { id: 'somanya_roundabout', name: 'Somanya Roundabout', region: 'Eastern', corridor: 'Yilo-Krobo', coordinates: [6.1051, -0.0151] },
      { id: 'kpong_station', name: 'Kpong Barrier / Station', region: 'Eastern', corridor: 'N2-Eastern-Trunk', coordinates: [6.1481, 0.0612] },
      { id: 'akosombo_roundabout', name: 'Akosombo Marine / Overhead Station', region: 'Eastern', corridor: 'N2-Eastern-Trunk', coordinates: [6.2891, 0.0521] },

      // === ASHANTI REGION (KUMASI METROPOLITAN HUBS & TRUNKS) ===
      { id: 'kejetia_terminal_kumasi', name: 'Kejetia New Market Terminal (Kumasi)', region: 'Ashanti', corridor: 'Kumasi-Central', coordinates: [6.6961, -1.6251] },
      { id: 'asafo_market_station', name: 'Asafo VIP / Neoplan Terminal (Kumasi)', region: 'Ashanti', corridor: 'Kumasi-Central', coordinates: [6.6892, -1.6152] },
      { id: 'sofoline_interchange', name: 'Sofoline Interchange Station (Kumasi)', region: 'Ashanti', corridor: 'Kumasi-West', coordinates: [6.7012, -1.6512] },
      { id: 'tech_junction_kumasi', name: 'KNUST Tech Junction Terminal', region: 'Ashanti', corridor: 'Kumasi-East', coordinates: [6.6912, -1.5712] },
      { id: 'bantama_high_street', name: 'Bantama Station', region: 'Ashanti', corridor: 'Kumasi-North', coordinates: [6.7032, -1.6321] },
      { id: 'suame_roundabout', name: 'Suame Roundabout Station', region: 'Ashanti', corridor: 'Kumasi-North', coordinates: [6.7192, -1.6381] },
      { id: 'abrepo_junction', name: 'Abrepo Junction (Kumasi)', region: 'Ashanti', corridor: 'Kumasi-North', coordinates: [6.7261, -1.6492] },
      { id: 'kronum_station', name: 'Kronum Station', region: 'Ashanti', corridor: 'N10-Kumasi-North', coordinates: [6.7681, -1.6451] },
      { id: 'tafo_station', name: 'Tafo Lorry Park (Kumasi)', region: 'Ashanti', corridor: 'Kumasi-North', coordinates: [6.7412, -1.6092] },
      { id: 'alabar_station', name: 'Alabar Station (Kumasi)', region: 'Ashanti', corridor: 'Kumasi-Central', coordinates: [6.6978, -1.6121] },
      { id: 'santasi_roundabout', name: 'Santasi Roundabout Station', region: 'Ashanti', corridor: 'Kumasi-SouthWest', coordinates: [6.6691, -1.6451] },
      { id: 'abuakwa_station', name: 'Abuakwa Main Station', region: 'Ashanti', corridor: 'Kumasi-Sunyani', coordinates: [6.6982, -1.7181] },
      { id: 'ahodwo_roundabout', name: 'Ahodwo Roundabout', region: 'Ashanti', corridor: 'Kumasi-South', coordinates: [6.6681, -1.6212] },
      { id: 'oforikrom_junction', name: 'Oforikrom Station', region: 'Ashanti', corridor: 'Kumasi-East', coordinates: [6.6925, -1.5951] },
      { id: 'ejisu_station', name: 'Ejisu Besease Station', region: 'Ashanti', corridor: 'N6-Kumasi-Trunk', coordinates: [6.7181, -1.4812] },
      { id: 'konongo_station', name: 'Konongo Lorry Station', region: 'Ashanti', corridor: 'N6-Kumasi-Trunk', coordinates: [6.6212, -1.2212] },
      { id: 'mampong_ashanti_station', name: 'Mampong Ashanti Station', region: 'Ashanti', corridor: 'Kumasi-Mampong', coordinates: [7.0621, -1.4012] },
      { id: 'obuasi_central_station', name: 'Obuasi Central Lorry Park', region: 'Ashanti', corridor: 'Ashanti-South', coordinates: [6.2021, -1.6712] },
      { id: 'bekwai_station', name: 'Bekwai Central Station', region: 'Ashanti', corridor: 'Ashanti-South', coordinates: [6.4521, -1.5812] },

      // === CENTRAL REGION (COASTAL & INLAND) ===
      { id: 'budumburam_station', name: 'Budumburam (Liberia Camp) Station', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.5392, -0.4721] },
      { id: 'winneba_junction', name: 'Winneba Roundabout / Junction', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.3851, -0.6281] },
      { id: 'winneba_town_station', name: 'Winneba Town Station', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.3562, -0.6221] },
      { id: 'agona_swedru_station', name: 'Agona Swedru Central Market Station', region: 'Central', corridor: 'Central-Inland', coordinates: [5.5351, -0.7012] },
      { id: 'mankessim_roundabout', name: 'Mankessim Roundabout / Station', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.2681, -1.0212] },
      { id: 'saltpond_station', name: 'Saltpond Junction Station', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.2051, -1.0621] },
      { id: 'yamoransa_junction', name: 'Yamoransa Junction (Kumasi-Cape Coast Split)', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.1481, -1.1892] },
      { id: 'cape_coast_tantri', name: 'Cape Coast Tantri Station', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.1082, -1.2481] },
      { id: 'cape_coast_pedu', name: 'Cape Coast Pedu Junction / Interchange', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.1291, -1.2651] },
      { id: 'cape_coast_kotokuraba', name: 'Kotokuraba Market Station (Cape Coast)', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.1051, -1.2412] },
      { id: 'elmina_station', name: 'Elmina Junction Station', region: 'Central', corridor: 'N1-Coastal-West', coordinates: [5.0881, -1.3512] },
      { id: 'assin_fosu_station', name: 'Assin Fosu Central Station', region: 'Central', corridor: 'N8-Central-Kumasi', coordinates: [5.7021, -1.2881] },

      // === WESTERN & WESTERN NORTH REGIONS ===
      { id: 'takoradi_market_circle', name: 'Takoradi Market Circle Terminal', region: 'Western', corridor: 'N1-Coastal-West', coordinates: [4.8872, -1.7551] },
      { id: 'sekondi_station', name: 'Sekondi Commercial Station', region: 'Western', corridor: 'Western-Coastal', coordinates: [4.9412, -1.7112] },
      { id: 'effia_nkwanta_jct', name: 'Effia Nkwanta Regional Hospital Jct', region: 'Western', corridor: 'Western-Coastal', coordinates: [4.9121, -1.7321] },
      { id: 'kwesimintsim_station', name: 'Kwesimintsim Station (Takoradi)', region: 'Western', corridor: 'N1-Coastal-West', coordinates: [4.8981, -1.7821] },
      { id: 'agona_nkwanta_station', name: 'Agona Nkwanta (Ahanta South) Station', region: 'Western', corridor: 'N1-Coastal-West', coordinates: [4.8912, -1.9612] },
      { id: 'tarkwa_main_station', name: 'Tarkwa Railway / Main Station', region: 'Western', corridor: 'Western-Mining', coordinates: [5.3021, -1.9951] },
      { id: 'bogoso_station', name: 'Bogoso Station', region: 'Western', corridor: 'Western-Mining', coordinates: [5.5581, -2.0151] },
      { id: 'axim_station', name: 'Axim Junction Station', region: 'Western', corridor: 'N1-Coastal-West', coordinates: [4.8691, -2.2412] },
      { id: 'elubo_border_station', name: 'Elubo Ivory Coast Border Terminal', region: 'Western', corridor: 'N1-Coastal-West', coordinates: [5.2891, -2.7812] },
      { id: 'sefwi_wiawso_station', name: 'Sefwi Wiawso Central Station', region: 'Western North', corridor: 'Western-North', coordinates: [6.2081, -2.4851] },

      // === VOLTA & OTI REGIONS ===
      { id: 'sogakope_station', name: 'Sogakope Lower Volta Bridge Station', region: 'Volta', corridor: 'Accra-Aflao-N1', coordinates: [5.9981, 0.5891] },
      { id: 'akatsi_station', name: 'Akatsi Central Station', region: 'Volta', corridor: 'Accra-Aflao-N1', coordinates: [6.1281, 0.7981] },
      { id: 'dzenu_station', name: 'Denu Junction Station', region: 'Volta', corridor: 'Accra-Aflao-N1', coordinates: [6.1012, 1.1412] },
      { id: 'aflao_border_station', name: 'Aflao Togo Border Terminal', region: 'Volta', corridor: 'Accra-Aflao-N1', coordinates: [6.1192, 1.1912] },
      { id: 'ho_central_station', name: 'Ho Central / Civic Centre Station', region: 'Volta', corridor: 'Volta-Central', coordinates: [6.6119, 0.4712] },
      { id: 'ho_poly_junction', name: 'Ho Technical University / Poly Jct', region: 'Volta', corridor: 'Volta-Central', coordinates: [6.6021, 0.4812] },
      { id: 'asikuma_junction', name: 'Asikuma Boso Junction', region: 'Volta', corridor: 'N2-Eastern-Trunk', coordinates: [6.4151, 0.2851] },
      { id: 'kpando_station', name: 'Kpando Main Station', region: 'Volta', corridor: 'Volta-North', coordinates: [6.9981, 0.2912] },
      { id: 'hohoe_central_station', name: 'Hohoe Central Lorry Station', region: 'Volta', corridor: 'Volta-North', coordinates: [7.1512, 0.4721] },
      { id: 'jasikan_station', name: 'Jasikan Station', region: 'Oti', corridor: 'Eastern-Corridor', coordinates: [7.4112, 0.4681] },
      { id: 'nkwanta_station', name: 'Nkwanta Central Station', region: 'Oti', corridor: 'Eastern-Corridor', coordinates: [8.2581, 0.5181] },
      { id: 'dambai_station', name: 'Dambai Lake Ferry Station', region: 'Oti', corridor: 'Eastern-Corridor', coordinates: [8.0612, 0.1791] },

      // === BONO, BONO EAST & AHAFO REGIONS ===
      { id: 'sunyani_central_station', name: 'Sunyani Central Station (Nana Bosoma)', region: 'Bono', corridor: 'Kumasi-Sunyani', coordinates: [7.3392, -2.3271] },
      { id: 'berekum_station', name: 'Berekum Main Lorry Park', region: 'Bono', corridor: 'Bono-West', coordinates: [7.4561, -2.5851] },
      { id: 'dormaa_ahenkro_station', name: 'Dormaa Ahenkro Station', region: 'Bono', corridor: 'Bono-West', coordinates: [7.2812, -2.8791] },
      { id: 'techiman_central_station', name: 'Techiman Central Market & Transit Station', region: 'Bono East', corridor: 'N10-Kumasi-North', coordinates: [7.5831, -1.9392] },
      { id: 'kintampo_waterfalls_jct', name: 'Kintampo Overhead / Main Station', region: 'Bono East', corridor: 'N10-Kumasi-North', coordinates: [8.0581, -1.7291] },
      { id: 'atebubu_station', name: 'Atebubu Lorry Station', region: 'Bono East', corridor: 'Bono-East-Trunk', coordinates: [7.7551, -0.9921] },
      { id: 'goaso_station', name: 'Goaso Central Station', region: 'Ahafo', corridor: 'Ahafo-Trunk', coordinates: [6.8021, -2.5181] },

      // === NORTHERN, NORTH EAST & SAVANNAH REGIONS ===
      { id: 'buipe_bridge_station', name: 'Buipe Black Volta Bridge Station', region: 'Savannah', corridor: 'N10-Kumasi-North', coordinates: [8.7612, -1.5381] },
      { id: 'damongo_station', name: 'Damongo Central Station', region: 'Savannah', corridor: 'Savannah-Central', coordinates: [9.0821, -1.8212] },
      { id: 'tamale_central_station', name: 'Tamale Central Station (Aboabo)', region: 'Northern', corridor: 'N10-Kumasi-North', coordinates: [9.4008, -0.8392] },
      { id: 'tamale_datoyili_barrier', name: 'Tamale Datoyili Southern Barrier', region: 'Northern', corridor: 'N10-Kumasi-North', coordinates: [9.3451, -0.8651] },
      { id: 'tamale_sagnarigu_station', name: 'Sagnarigu / Airport Road Station', region: 'Northern', corridor: 'Northern-Central', coordinates: [9.4281, -0.8521] },
      { id: 'savelugu_station', name: 'Savelugu Main Station', region: 'Northern', corridor: 'N10-Kumasi-North', coordinates: [9.6251, -0.8281] },
      { id: 'yendi_central_station', name: 'Yendi Central Station', region: 'Northern', corridor: 'Northern-East', coordinates: [9.4421, -0.0112] },
      { id: 'walewale_station', name: 'Walewale Central Station', region: 'North East', corridor: 'N10-Kumasi-North', coordinates: [10.3512, -0.8012] },
      { id: 'nalerigu_station', name: 'Nalerigu / Gambaga Station', region: 'North East', corridor: 'North-East-Trunk', coordinates: [10.5312, -0.3712] },

      // === UPPER EAST & UPPER WEST REGIONS ===
      { id: 'bolgatanga_central_station', name: 'Bolgatanga Central Station', region: 'Upper East', corridor: 'N10-Kumasi-North', coordinates: [10.7852, -0.8512] },
      { id: 'navrongo_station', name: 'Navrongo Main Station', region: 'Upper East', corridor: 'N10-Kumasi-North', coordinates: [10.8951, -1.0921] },
      { id: 'paga_border_station', name: 'Paga Burkina Faso Border Station', region: 'Upper East', corridor: 'N10-Kumasi-North', coordinates: [10.9881, -1.1112] },
      { id: 'bawku_central_station', name: 'Bawku Central Station', region: 'Upper East', corridor: 'Upper-East-Border', coordinates: [11.0581, -0.2412] },
      { id: 'wa_central_station', name: 'Wa Central Station (Kejetia Wa)', region: 'Upper West', corridor: 'Upper-West-Trunk', coordinates: [10.0601, -2.5081] },
      { id: 'tumu_station', name: 'Tumu Station', region: 'Upper West', corridor: 'Upper-West-North', coordinates: [10.8751, -1.9812] }
    ],

    edges: [
      // ACCRA COASTAL CORRIDOR
      { from: 'tema_station_accra', to: 'ministries_station', distance_km: 0.8, line_name: 'Accra Coastal Route' },
      { from: 'ministries_station', to: 'osu_oxford_street', distance_km: 2.2, line_name: 'Osu Local' },
      { from: 'osu_oxford_street', to: 'osu_danquah_circle', distance_km: 1.1, line_name: 'Oxford Street Shuttle' },
      { from: 'osu_danquah_circle', to: 'cantonments_post_office', distance_km: 1.8, line_name: 'Cantonments Link' },
      { from: 'osu_danquah_circle', to: 'labadi_station', distance_km: 3.5, line_name: 'Accra-Labadi Main' },
      { from: 'osu_oxford_street', to: 'la_general_hospital', distance_km: 2.9, line_name: 'Beach Road Trotro' },
      { from: 'la_general_hospital', to: 'labadi_station', distance_km: 0.9, line_name: 'Beach Road Trotro' },
      { from: 'labadi_station', to: 'labadi_beach_jct', distance_km: 0.7, line_name: 'Labadi Coastal' },
      { from: 'labadi_station', to: 'labadi_kpogas', distance_km: 1.1, line_name: 'Labadi-Teshie Trunk' },
      { from: 'labadi_station', to: 'trade_fair_station', distance_km: 2.1, line_name: 'Trade Fair Route' },
      { from: 'trade_fair_station', to: 'military_37_hospital', distance_km: 5.6, line_name: 'Trade Fair - 37 Express' },
      { from: 'labadi_kpogas', to: 'teshie_first_jct', distance_km: 3.2, line_name: 'Teshie Coastal' },
      { from: 'teshie_first_jct', to: 'teshie_marrick_jct', distance_km: 1.3, line_name: 'Teshie Internal' },
      { from: 'teshie_marrick_jct', to: 'teshie_tsuibleoo', distance_km: 1.9, line_name: 'Tsuibleoo Feeder' },
      { from: 'teshie_first_jct', to: 'nungua_barrier', distance_km: 4.1, line_name: 'Teshie-Nungua Trunk' },
      { from: 'nungua_barrier', to: 'nungua_station', distance_km: 1.2, line_name: 'Nungua Local' },
      { from: 'nungua_barrier', to: 'sakumono_village', distance_km: 4.5, line_name: 'Sakumono Coastal' },
      { from: 'sakumono_village', to: 'tema_comm2_station', distance_km: 5.4, line_name: 'Sakumono-Tema Line' },
      { from: 'nungua_barrier', to: 'tema_comm1_station', distance_km: 9.8, line_name: 'Nungua-Tema Comm 1' },
      { from: 'tema_comm1_station', to: 'tema_harbour_roundabout', distance_km: 1.2, line_name: 'Harbour Shuttle' },
      { from: 'tema_comm1_station', to: 'tema_comm2_station', distance_km: 1.5, line_name: 'Community Loop' },
      { from: 'tema_comm2_station', to: 'tema_comm4_station', distance_km: 1.3, line_name: 'Community Loop' },
      { from: 'tema_comm4_station', to: 'tema_comm9_roundabout', distance_km: 2.1, line_name: 'Hospital Road' },

      // ACCRA CENTRAL & WEST
      { from: 'circle_neoplan_station', to: 'circle_odawna_station', distance_km: 0.6, line_name: 'Circle Hub Transfer' },
      { from: 'circle_neoplan_station', to: 'kaneshie_main_station', distance_km: 3.6, line_name: 'Circle-Kaneshie Direct' },
      { from: 'circle_neoplan_station', to: 'military_37_hospital', distance_km: 4.4, line_name: 'Circle-37 Cross' },
      { from: 'circle_neoplan_station', to: 'tema_station_accra', distance_km: 3.2, line_name: 'Circle-Tema Station' },
      { from: 'circle_neoplan_station', to: 'labadi_station', distance_km: 7.8, line_name: 'Circle-Labadi Car' },
      { from: 'kaneshie_main_station', to: 'kaneshie_first_light', distance_km: 0.9, line_name: 'Kaneshie Trunk' },
      { from: 'kaneshie_main_station', to: 'abossey_okai_station', distance_km: 1.6, line_name: 'Spare Parts Feeder' },
      { from: 'abossey_okai_station', to: 'tema_station_accra', distance_km: 4.2, line_name: 'Abossey Okai - Central' },
      { from: 'kaneshie_first_light', to: 'odorkor_station', distance_km: 1.2, line_name: 'Odorkor Highway' },
      { from: 'odorkor_station', to: 'odorkor_tipper_jct', distance_km: 0.9, line_name: 'Odorkor Highway' },
      { from: 'odorkor_tipper_jct', to: 'mallam_market_station', distance_km: 2.1, line_name: 'Mallam Road' },
      { from: 'mallam_market_station', to: 'mallam_junction', distance_km: 0.7, line_name: 'Mallam Interchange Line' },
      { from: 'mallam_junction', to: 'gbawe_station', distance_km: 1.9, line_name: 'Gbawe Feeder' },
      { from: 'mallam_junction', to: 'weija_junction', distance_km: 4.8, line_name: 'Kasoa Corridor Trunk' },
      { from: 'weija_junction', to: 'tetegu_junction', distance_km: 1.5, line_name: 'Kasoa Corridor Trunk' },
      { from: 'tetegu_junction', to: 'tetteh_quarshie_west_scc', distance_km: 1.8, line_name: 'Kasoa Corridor Trunk' },
      { from: 'tetteh_quarshie_west_scc', to: 'bortianor_junction', distance_km: 1.9, line_name: 'Kasoa Corridor Trunk' },
      { from: 'bortianor_junction', to: 'kasoa_old_barrier', distance_km: 5.6, line_name: 'Old Barrier Flyover' },
      { from: 'kasoa_old_barrier', to: 'kasoa_new_market', distance_km: 1.1, line_name: 'Kasoa Internal' },
      { from: 'kasoa_old_barrier', to: 'kasoa_ofankor_jct', distance_km: 2.2, line_name: 'Ofaakor Link' },

      // N1 MOTORWAY & SPURS
      { from: 'mallam_junction', to: 'darkuman_junction', distance_km: 4.1, line_name: 'N1 Highway Motorway' },
      { from: 'darkuman_junction', to: 'lapaz_station', distance_km: 3.2, line_name: 'N1 Highway Motorway' },
      { from: 'lapaz_station', to: 'achimota_old_station', distance_km: 2.4, line_name: 'N1 Highway Motorway' },
      { from: 'achimota_old_station', to: 'tetteh_quarshie_interchange', distance_km: 6.8, line_name: 'N1 Tetteh Quarshie Extension' },

      // ACCRA NORTH-EAST N4
      { from: 'military_37_hospital', to: 'tetteh_quarshie_interchange', distance_km: 3.1, line_name: 'Liberation Road' },
      { from: 'military_37_hospital', to: 'airport_cargo_junction', distance_km: 1.4, line_name: 'Airport Bypass' },
      { from: 'tetteh_quarshie_interchange', to: 'shiashie_bus_stop', distance_km: 0.8, line_name: 'N4 Adenta Highway' },
      { from: 'shiashie_bus_stop', to: 'okponglo_junction', distance_km: 2.1, line_name: 'N4 Adenta Highway' },
      { from: 'okponglo_junction', to: 'legon_campus_gate', distance_km: 2.3, line_name: 'N4 Adenta Highway' },
      { from: 'legon_campus_gate', to: 'upsa_junction', distance_km: 2.1, line_name: 'Legon-UPSA Link' },
      { from: 'legon_campus_gate', to: 'madina_zongo_junction', distance_km: 3.2, line_name: 'N4 Adenta Highway' },
      { from: 'madina_zongo_junction', to: 'madina_market_station', distance_km: 1.2, line_name: 'Madina Commercial' },
      { from: 'madina_market_station', to: 'ritz_junction', distance_km: 1.3, line_name: 'N4 Adenta Highway' },
      { from: 'ritz_junction', to: 'adenta_barrier_station', distance_km: 2.4, line_name: 'N4 Adenta Highway' },
      { from: 'adenta_barrier_station', to: 'adenta_housing_down', distance_km: 1.5, line_name: 'Adenta Suburb' },
      { from: 'adenta_barrier_station', to: 'frafraha_junction', distance_km: 3.8, line_name: 'Dodowa Road Line' },
      { from: 'frafraha_junction', to: 'amrahia_dairy_farm', distance_km: 3.1, line_name: 'Dodowa Road Line' },
      { from: 'amrahia_dairy_farm', to: 'oyibi_junction', distance_km: 3.6, line_name: 'Dodowa Road Line' },
      { from: 'oyibi_junction', to: 'dodowa_forest_station', distance_km: 11.2, line_name: 'Dodowa Trunk' },

      // TEMA - ASHAIMAN - AKOSOMBO (N2)
      { from: 'tema_comm9_roundabout', to: 'ashaiman_main_station', distance_km: 3.2, line_name: 'Tema-Ashaiman Link' },
      { from: 'ashaiman_main_station', to: 'ashaiman_timber_market', distance_km: 1.4, line_name: 'Ashaiman Local' },
      { from: 'ashaiman_main_station', to: 'afienya_barrier', distance_km: 9.8, line_name: 'N2 Shai Route' },
      { from: 'afienya_barrier', to: 'kpong_station', distance_km: 42.1, line_name: 'N2 Volta Highway' },
      { from: 'kpong_station', to: 'somanya_roundabout', distance_km: 9.4, line_name: 'Krobo Line' },
      { from: 'kpong_station', to: 'akosombo_roundabout', distance_km: 16.2, line_name: 'Akosombo Dam Express' },
      { from: 'tema_comm1_station', to: 'dawhenya_junction', distance_km: 12.5, line_name: 'N1 Lower Volta Route' },
      { from: 'dawhenya_junction', to: 'prampram_junction', distance_km: 5.4, line_name: 'N1 Lower Volta Route' },

      // N6 ACCRA - KUMASI
      { from: 'circle_neoplan_station', to: 'achimota_new_station', distance_km: 7.2, line_name: 'N6 Kumasi Trunk' },
      { from: 'achimota_new_station', to: 'ofankor_barrier', distance_km: 5.8, line_name: 'N6 Kumasi Trunk' },
      { from: 'ofankor_barrier', to: 'pokuase_interchange', distance_km: 4.8, line_name: 'N6 Kumasi Trunk' },
      { from: 'pokuase_interchange', to: 'amasaman_station', distance_km: 2.1, line_name: 'N6 Kumasi Trunk' },
      { from: 'amasaman_station', to: 'medie_station', distance_km: 6.4, line_name: 'N6 Kumasi Trunk' },
      { from: 'medie_station', to: 'nsawam_main_station', distance_km: 6.5, line_name: 'N6 Kumasi Trunk' },
      { from: 'nsawam_main_station', to: 'suhum_roundabout', distance_km: 31.2, line_name: 'N6 Kumasi Trunk' },
      { from: 'suhum_roundabout', to: 'koforidua_central_station', distance_km: 23.4, line_name: 'Suhum-Koforidua Branch' },
      { from: 'koforidua_central_station', to: 'koforidua_poly_station', distance_km: 2.1, line_name: 'Koforidua Local' },
      { from: 'koforidua_central_station', to: 'mamfe_roundabout', distance_km: 28.5, line_name: 'Akuapem Ridge Route' },
      { from: 'mamfe_roundabout', to: 'aburi_botanical_station', distance_km: 10.2, line_name: 'Akuapem Ridge Route' },
      { from: 'aburi_botanical_station', to: 'adenta_barrier_station', distance_km: 18.2, line_name: 'Aburi-Adenta Ridge Line' },
      { from: 'suhum_roundabout', to: 'bunso_junction', distance_km: 29.8, line_name: 'N6 Kumasi Trunk' },
      { from: 'bunso_junction', to: 'anyinam_station', distance_km: 11.2, line_name: 'N6 Kumasi Trunk' },
      { from: 'anyinam_station', to: 'nkawkaw_lorry_park', distance_km: 36.8, line_name: 'N6 Kumasi Trunk' },
      { from: 'nkawkaw_lorry_park', to: 'konongo_station', distance_km: 61.2, line_name: 'N6 Kumasi Trunk' },
      { from: 'konongo_station', to: 'ejisu_station', distance_km: 31.4, line_name: 'N6 Kumasi Trunk' },
      { from: 'ejisu_station', to: 'tech_junction_kumasi', distance_km: 13.8, line_name: 'N6 Kumasi Trunk' },

      // KUMASI METROPOLITAN HUBS
      { from: 'tech_junction_kumasi', to: 'oforikrom_junction', distance_km: 2.8, line_name: 'Kumasi East Spine' },
      { from: 'oforikrom_junction', to: 'asafo_market_station', distance_km: 2.4, line_name: 'Kumasi East Spine' },
      { from: 'asafo_market_station', to: 'kejetia_terminal_kumasi', distance_km: 1.5, line_name: 'Kejetia-Asafo Link' },
      { from: 'asafo_market_station', to: 'ahodwo_roundabout', distance_km: 2.6, line_name: 'Ahodwo Branch' },
      { from: 'ahodwo_roundabout', to: 'santasi_roundabout', distance_km: 2.8, line_name: 'Southern Loop' },
      { from: 'kejetia_terminal_kumasi', to: 'alabar_station', distance_km: 1.1, line_name: 'Central Bazaar Line' },
      { from: 'kejetia_terminal_kumasi', to: 'bantama_high_street', distance_km: 1.4, line_name: 'Bantama Local' },
      { from: 'bantama_high_street', to: 'suame_roundabout', distance_km: 2.1, line_name: 'Suame Industrial' },
      { from: 'kejetia_terminal_kumasi', to: 'sofoline_interchange', distance_km: 3.2, line_name: 'Sunyani Road Corridor' },
      { from: 'sofoline_interchange', to: 'santasi_roundabout', distance_km: 3.8, line_name: 'Bekwai Road Link' },
      { from: 'sofoline_interchange', to: 'abuakwa_station', distance_km: 7.5, line_name: 'Sunyani Road Corridor' },
      { from: 'suame_roundabout', to: 'abrepo_junction', distance_km: 1.5, line_name: 'Offinso Trunk' },
      { from: 'suame_roundabout', to: 'tafo_station', distance_km: 4.1, line_name: 'Tafo Line' },
      { from: 'abrepo_junction', to: 'kronum_station', distance_km: 4.8, line_name: 'N10 Kumasi North' },
      { from: 'santasi_roundabout', to: 'bekwai_station', distance_km: 26.5, line_name: 'Bekwai Trunk' },
      { from: 'bekwai_station', to: 'obuasi_central_station', distance_km: 31.2, line_name: 'Obuasi Mining Line' },
      { from: 'tafo_station', to: 'mampong_ashanti_station', distance_km: 48.2, line_name: 'Mampong Scarp Trunk' },

      // N1 COASTAL WEST
      { from: 'kasoa_new_market', to: 'budumburam_station', distance_km: 5.8, line_name: 'N1 West Coast Highway' },
      { from: 'budumburam_station', to: 'winneba_junction', distance_km: 24.5, line_name: 'N1 West Coast Highway' },
      { from: 'winneba_junction', to: 'winneba_town_station', distance_km: 4.2, line_name: 'Winneba Town Branch' },
      { from: 'winneba_junction', to: 'agona_swedru_station', distance_km: 19.8, line_name: 'Swedru Connector' },
      { from: 'winneba_junction', to: 'mankessim_roundabout', distance_km: 44.8, line_name: 'N1 West Coast Highway' },
      { from: 'mankessim_roundabout', to: 'saltpond_station', distance_km: 8.5, line_name: 'N1 West Coast Highway' },
      { from: 'saltpond_station', to: 'yamoransa_junction', distance_km: 14.5, line_name: 'N1 West Coast Highway' },
      { from: 'yamoransa_junction', to: 'cape_coast_pedu', distance_km: 9.8, line_name: 'Cape Coast Bypass' },
      { from: 'cape_coast_pedu', to: 'cape_coast_tantri', distance_km: 2.8, line_name: 'Tantri Commercial Line' },
      { from: 'cape_coast_tantri', to: 'cape_coast_kotokuraba', distance_km: 1.1, line_name: 'Kotokuraba Market Feeder' },
      { from: 'cape_coast_pedu', to: 'elmina_station', distance_km: 10.2, line_name: 'N1 West Coast Highway' },
      { from: 'yamoransa_junction', to: 'assin_fosu_station', distance_km: 63.5, line_name: 'N8 Central Highway to Kumasi' },
      { from: 'assin_fosu_station', to: 'bekwai_station', distance_km: 88.2, line_name: 'N8 Central Highway to Kumasi' },
      { from: 'elmina_station', to: 'takoradi_market_circle', distance_km: 62.4, line_name: 'N1 Coastal Express' },
      { from: 'takoradi_market_circle', to: 'sekondi_station', distance_km: 7.8, line_name: 'Twin City Twin Metro' },
      { from: 'takoradi_market_circle', to: 'effia_nkwanta_jct', distance_km: 3.5, line_name: 'Twin City Twin Metro' },
      { from: 'takoradi_market_circle', to: 'kwesimintsim_station', distance_km: 3.2, line_name: 'Axim Road Shuttle' },
      { from: 'kwesimintsim_station', to: 'agona_nkwanta_station', distance_km: 19.8, line_name: 'N1 West Coast Highway' },
      { from: 'agona_nkwanta_station', to: 'tarkwa_main_station', distance_km: 48.5, line_name: 'Western Mining Corridor' },
      { from: 'tarkwa_main_station', to: 'bogoso_station', distance_km: 32.1, line_name: 'Western Mining Corridor' },
      { from: 'agona_nkwanta_station', to: 'axim_station', distance_km: 34.5, line_name: 'N1 West Coast Highway' },
      { from: 'axim_station', to: 'elubo_border_station', distance_km: 65.2, line_name: 'N1 West Coast Highway' },
      { from: 'bogoso_station', to: 'sefwi_wiawso_station', distance_km: 86.4, line_name: 'Western North Link' },

      // VOLTA & EASTERN TRUNK
      { from: 'prampram_junction', to: 'sogakope_station', distance_km: 58.2, line_name: 'N1 Aflao International Road' },
      { from: 'sogakope_station', to: 'akatsi_station', distance_km: 26.8, line_name: 'N1 Aflao International Road' },
      { from: 'akatsi_station', to: 'dzenu_station', distance_km: 38.5, line_name: 'N1 Aflao International Road' },
      { from: 'dzenu_station', to: 'aflao_border_station', distance_km: 5.5, line_name: 'Aflao Border Line' },
      { from: 'sogakope_station', to: 'ho_central_station', distance_km: 68.2, line_name: 'Volta Central Link' },
      { from: 'akosombo_roundabout', to: 'asikuma_junction', distance_km: 22.4, line_name: 'N2 Eastern Highway' },
      { from: 'asikuma_junction', to: 'ho_central_station', distance_km: 28.5, line_name: 'Ho Regional Access' },
      { from: 'ho_central_station', to: 'ho_poly_junction', distance_km: 1.8, line_name: 'Ho Campus Shuttle' },
      { from: 'asikuma_junction', to: 'kpando_station', distance_km: 64.1, line_name: 'Eastern Corridor Volta' },
      { from: 'kpando_station', to: 'hohoe_central_station', distance_km: 28.5, line_name: 'Hohoe Trunk' },
      { from: 'hohoe_central_station', to: 'jasikan_station', distance_km: 29.8, line_name: 'Oti Corridor' },
      { from: 'jasikan_station', to: 'nkwanta_station', distance_km: 98.5, line_name: 'Eastern Corridor North' },
      { from: 'jasikan_station', to: 'dambai_station', distance_km: 78.4, line_name: 'Dambai Lake Route' },

      // BONO & NORTHERN CORRIDORS (N10)
      { from: 'kronum_station', to: 'techiman_central_station', distance_km: 98.5, line_name: 'N10 Northern Highway' },
      { from: 'abuakwa_station', to: 'sunyani_central_station', distance_km: 118.2, line_name: 'Kumasi-Sunyani Trunk' },
      { from: 'sunyani_central_station', to: 'berekum_station', distance_km: 32.5, line_name: 'Bono West Line' },
      { from: 'berekum_station', to: 'dormaa_ahenkro_station', distance_km: 44.8, line_name: 'Bono Border Line' },
      { from: 'sunyani_central_station', to: 'techiman_central_station', distance_km: 62.1, line_name: 'Bono-Techiman Connector' },
      { from: 'techiman_central_station', to: 'kintampo_waterfalls_jct', distance_km: 61.5, line_name: 'N10 Northern Highway' },
      { from: 'techiman_central_station', to: 'atebubu_station', distance_km: 104.2, line_name: 'Atebubu Agricultural Route' },
      { from: 'kintampo_waterfalls_jct', to: 'buipe_bridge_station', distance_km: 84.5, line_name: 'N10 Northern Highway' },
      { from: 'buipe_bridge_station', to: 'tamale_datoyili_barrier', distance_km: 82.1, line_name: 'N10 Northern Highway' },
      { from: 'tamale_datoyili_barrier', to: 'tamale_central_station', distance_km: 7.2, line_name: 'Tamale City Access' },
      { from: 'tamale_central_station', to: 'tamale_sagnarigu_station', distance_km: 3.5, line_name: 'Airport Bypass' },
      { from: 'tamale_central_station', to: 'damongo_station', distance_km: 121.5, line_name: 'Mole Park Road' },
      { from: 'tamale_central_station', to: 'yendi_central_station', distance_km: 96.8, line_name: 'Eastern Northern Trunk' },
      { from: 'tamale_central_station', to: 'savelugu_station', distance_km: 25.4, line_name: 'N10 Bolgatanga Highway' },
      { from: 'savelugu_station', to: 'walewale_station', distance_km: 81.2, line_name: 'N10 Bolgatanga Highway' },
      { from: 'walewale_station', to: 'nalerigu_station', distance_km: 52.4, line_name: 'North East Trunk' },
      { from: 'walewale_station', to: 'bolgatanga_central_station', distance_km: 51.5, line_name: 'N10 Bolgatanga Highway' },
      { from: 'bolgatanga_central_station', to: 'navrongo_station', distance_km: 29.8, line_name: 'N10 Sahel Line' },
      { from: 'navrongo_station', to: 'paga_border_station', distance_km: 10.5, line_name: 'Burkina Faso Border Express' },
      { from: 'bolgatanga_central_station', to: 'bawku_central_station', distance_km: 78.4, line_name: 'Bawku Border Trunk' },
      { from: 'techiman_central_station', to: 'wa_central_station', distance_km: 298.5, line_name: 'Upper West Main Line' },
      { from: 'wa_central_station', to: 'tumu_station', distance_km: 132.4, line_name: 'Upper West Northern Link' }
    ]
  };

  /* ======================================================================
     3. INTERCHANGES AND STATIONS
     ----------------------------------------------------------------------
     `stations` marks the places where changing cars is expected rather than
     merely possible. "Change at Circle" means change at the Circle bus
     station, and the UI should say that instead of just naming a map point.

     `interchanges` declares that two differently named stops are the same
     interchange. Only add a pair when they really are the same place.
     ====================================================================== */
  var stations = {
    'circle': 'Circle bus station, the main Accra interchange',
    'madina': 'Madina bus station',
    'kaneshie': 'Kaneshie bus station',
    'cantonments': 'Cantonments bus station',
    'kasoa': 'Kasoa bus station',
    'adenta': 'Adenta bus station',
    'tema': 'Tema bus station',
    'nsawam': 'Nsawam bus station',
    'labadi': 'Labadi bus station',
    // Existing trunk junctions, plus the ones the new corridors now pass
    // through. Each is a real place where more than one car calls.
    '37': '37 Military Hospital, a main Accra interchange',
    'legon': 'Legon, the northern terminus of the 37 road',
    'odorkor': 'Odorkor junction',
    'kwashi': 'Kwashi junction',
    'abossey okai': 'Abossey Okai junction',
    'gomoa fie': 'Gomoa Fie junction',
    'palmwine bush canteen': 'Palmwine Bush Canteen Station (Giffard Road)',
    'palm wine': 'Palmwine Bush Canteen Station (Giffard Road)'
  };

  var interchanges = [
    { names: ['Circle', 'Nkrumah Circle', 'Circle Bus Station'], note: 'All refer to the Circle bus station.' },
    { names: ['Cantonments', 'Cantonments Bus Station'], note: 'Same place.' },
    { names: ['Palmwine Bush Canteen', 'Palm Wine Bush Canteen', 'Bush Canteen', 'Labadi Bush Canteen', 'Palm Wine', 'Palmwine', 'Giffard Road Bush Canteen'], note: 'Palmwine Bush Canteen / Giffard Road transit junction.' }
  ];

  /* ======================================================================
     4. STOP INDEX
     ====================================================================== */
  function normName(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // Interchange aliases: every alias maps to the canonical (first) name.
  var aliasToCanonical = {};
  interchanges.forEach(function (g) {
    if (!g.names || !g.names.length) return;
    var canonical = normName(g.names[0]);
    g.names.forEach(function (n) {
      var k = normName(n);
      if (k && !aliasToCanonical[k]) aliasToCanonical[k] = canonical;
    });
  });

  function canonical(name) {
    var k = normName(name);
    return aliasToCanonical[k] || k;
  }

  // stops: canonicalName -> { name, lon, lat, station, routeIds[], legs[] }
  // legs: consecutive-stop links, both directions
  var stops = {};
  var stopGroups = {};

  function quickMeters(lon1, lat1, lon2, lat2) {
    var dLat = (lat2 - lat1) * 111320;
    var dLon = (lon2 - lon1) * 111320 * Math.cos((lat1 + lat2) * Math.PI / 360);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  function ensureStop(name, lon, lat) {
    lon = +lon; lat = +lat;
    var group = canonical(name);
    var siblings = stopGroups[group] || (stopGroups[group] = []);
    for (var i = 0; i < siblings.length; i++) {
      if (quickMeters(lon, lat, siblings[i].lon, siblings[i].lat) <= meta.stopMergeRadiusM) return siblings[i];
    }
    var key = siblings.length ? group + '@' + lon.toFixed(5) + ',' + lat.toFixed(5) : group;
    var st = stops[key] = {
      name: key, group: group, displayName: name, lon: lon, lat: lat,
      station: !!stations[group] || !!stations[normName(name)],
      stationNote: stations[group] || stations[normName(name)] || null,
      routeIds: [], legs: []
    };
    siblings.push(st);
    return st;
  }

  routes.forEach(function (r) {
    var rawSeq = r.stops.map(function (s) { return ensureStop(s[0], s[1], s[2]); });
    var seq = [];
    rawSeq.forEach(function (st) {
      if (!seq.length || seq[seq.length - 1].name !== st.name) {
        seq.push(st);
      }
    });
    rawSeq[0].displayName = r.stops[0][0];
    rawSeq[rawSeq.length - 1].displayName = r.stops[r.stops.length - 1][0];

    seq.forEach(function (st) {
      if (st.routeIds.indexOf(r.id) < 0) st.routeIds.push(r.id);
    });

    // Consecutive stops are a two-way travel link on this route.
    for (var i = 0; i < seq.length - 1; i++) {
      seq[i].legs.push({ to: seq[i + 1], route: r });
      seq[i + 1].legs.push({ to: seq[i], route: r });
    }

    r.stopIndex = {};
    seq.forEach(function (st, idx) { r.stopIndex[st.name] = idx; });
    r.seq = seq;
  });

  var stopList = Object.keys(stops).map(function (k) { return stops[k]; });
  stopList.forEach(function (st) {
    st.transfers = [];
    for (var wi = 0; wi < stopList.length; wi++) {
      var other = stopList[wi];
      if (other.name === st.name) continue;
      if (Math.abs(other.lat - st.lat) > 0.005 || Math.abs(other.lon - st.lon) > 0.005) continue;
      var wm = haversineM([st.lon, st.lat], [other.lon, other.lat]);
      if (wm <= meta.transferWalkM) st.transfers.push({ stop: other, meters: wm });
    }
  });

  /* ======================================================================
     4b. FINDING A STOP FROM WHAT SOMEONE TYPED
     ----------------------------------------------------------------------
     The search box geocodes place names with a public service, and for
     Greater Accra those services are unreliable. Measured against this
     network, searching "Ablekuma" can return a point 6 km from the Ablekuma
     stop, "Adenta" 2.4 km from the Adenta stop, and "Labadi" a building in
     Ridge 3.8 km away. Handed one of those points the planner correctly
     refuses ("no stop within walking distance") and the page then shows a
     straight line with no cars - which reads as "it never shows a change".

     This network knows its own stops by name, so a name that matches a stop
     is resolved to THAT STOP'S coordinates and the geocoder is ignored.
     Matching is deliberately conservative and longest-name-wins, so
     "La Nkwantanang Madina" resolves to Madina and not to La.
     ====================================================================== */

  // Words that describe what kind of place something is, not which stop it
  // is. Stripping them makes "Kaneshie Market Complex" and "Kaneshie" agree.
  var NAME_NOISE = {
    accra: 1, greater: 1, ghana: 1, city: 1, municipal: 1, metropolitan: 1,
    district: 1, assembly: 1, estate: 1, estates: 1, township: 1, town: 1,
    area: 1, junction: 1, station: 1, lorry: 1, park: 1, bus: 1, stop: 1,
    market: 1, complex: 1, shopping: 1, road: 1, street: 1, avenue: 1,
    highway: 1, the: 1, of: 1, and: 1
  };

  function stripName(s) {
    return normName(s)
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter(function (t) { return t && !NAME_NOISE[t]; })
      .join(' ')
      .trim();
  }

  // Spellings people type that mean one of our stops but do not share a word
  // with the stop's own name.
  var stopNameAliases = {
    circle: ['kwame nkrumah circle', 'nkrumah circle', 'accra circle', 'neoplan'],
    '37': ['37 military hospital', '37 hospital', 'thirty seven', '37 station'],
    labadi: ['labadi beach', 'la beach', 'labadi motor court'],
    ablekuma: ['south la', 'ablekuma south', 'ablekuma central', 'ablekuma north'],
    osu: ['osu oxford street', 'oxford street', 'christiansborg'],
    kaneshie: ['kaneshie lorry station', 'accra academy'],
    madina: ['madina market', 'madina zongo', 'la nkwantanang'],
    'airport city': ['kotoka international airport', 'kotoka airport', 'airport'],
    legon: ['university of ghana', 'ug legon'],
    tema: ['tema station', 'tema harbour', 'tema port'],
    adabraka: ['jamestown', 'accra central']
  };

  // Score one stop against already-normalised search text. Higher is a closer
  // match. 0 means "not this stop at all".
  function scoreStop(st, raw, tidy, tokens) {
    var names = [st.name, normName(st.displayName)].concat(stopNameAliases[st.name] || []);
    var best = null;
    names.forEach(function (n) {
      var cn = stripName(n);
      if (!cn) return;
      var score = 0;
      if (cn === tidy) score = 100;                                   // exact
      else if (tokens.length && cn.length >= 3 && cn.split(' ').every(function (t) {
        return tokens.indexOf(t) >= 0;                                // all words present
      })) score = 40;
      else if (cn.length >= 5 && raw.indexOf(cn) >= 0) score = 20;    // contained
      if (score && (!best || score > best.score || (score === best.score && cn.length > best.len))) {
        best = { score: score, len: cn.length, matched: n };
      }
    });
    return best;
  }

  // The stop a piece of text names, or null. Returns { stop, score, matched }.
  function matchStop(text) {
    var raw = normName(text);
    if (!raw) return null;
    var tidy = stripName(raw);
    if (!tidy) return null;
    var tokens = tidy.split(' ');
    var best = null;
    Object.keys(stops).forEach(function (k) {
      var r = scoreStop(stops[k], raw, tidy, tokens);
      if (!r) return;
      // Longest name wins a tie: "la nkwantanang madina" is Madina, not La.
      if (!best || r.score > best.score || (r.score === best.score && r.len > best.len)) {
        best = { stop: stops[k], score: r.score, len: r.len, matched: r.matched };
      }
    });
    return best;
  }

  // Stops whose own names appear in the text. Used to put real stops at the
  // top of the search results, so a place can be picked as a stop directly.
  function searchStops(text, limit) {
    var raw = normName(text);
    if (raw.length < 2) return [];
    var tidy = stripName(raw);
    if (!tidy) return [];
    var tokens = tidy.split(' ');
    var hits = [];
    Object.keys(stops).forEach(function (k) {
      var r = scoreStop(stops[k], raw, tidy, tokens);
      if (r && r.score >= 40) hits.push({ stop: stops[k], score: r.score });
    });
    hits.sort(function (a, b) {
      return b.score - a.score || a.stop.displayName.length - b.stop.displayName.length;
    });
    return hits.slice(0, limit || 6);
  }

  // Where to start from when the device's position cannot be placed in the
  // network (a laptop in another country, or no GPS fix). The busiest
  // interchange is the most useful honest answer. Always labelled in the UI.
  function hub() {
    var best = null;
    stopList.forEach(function (s) {
      var n = s.routeIds.length + (s.station ? 1 : 0);
      if (!best || n > best.n) best = { stop: s, n: n };
    });
    return best ? best.stop : null;
  }

  /* ======================================================================
     5. GEO + COST HELPERS
     ====================================================================== */
  var R_KM = 6371;
  function toRad(d) { return d * Math.PI / 180; }

  // Accept either [lon, lat] or [lat, lon] for Ghana.
  // In Ghana latitude is 4.0..12.0 and longitude is -4.0..2.0.
  // If first coordinate is in latitude range, swap to [lon, lat].
  function toLonLat(p) {
    if (!p || p.length < 2) return p;
    var a = +p[0], b = +p[1];
    if (isNaN(a) || isNaN(b)) return p;
    if (a >= 4 && a <= 12 && b >= -4 && b <= 2) return [b, a];
    return [a, b];
  }

  function haversineM(a, b) {
    a = toLonLat(a);
    b = toLonLat(b);
    var dLat = toRad(b[1] - a[1]);
    var dLon = toRad(b[0] - a[0]);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R_KM * 1000 * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function walkMinutes(meters) {
    return meters / meta.walkingSpeedMps / 60;
  }

  function rideMinutes(meters) {
    return (meters / 1000) / meta.urbanSpeedKph * 60;
  }

  function stopsNear(point, maxM) {
    point = toLonLat(point);
    var out = [];
    for (var i = 0; i < stopList.length; i++) {
      var d = haversineM(point, [stopList[i].lon, stopList[i].lat]);
      if (d <= maxM) out.push({ stop: stopList[i], meters: d });
    }
    out.sort(function (a, b) { return a.meters - b.meters; });
    return out;
  }

  function nearestStop(point) {
    var n = stopsNear(point, Infinity);
    return n.length ? n[0] : null;
  }

  function routeName(id) {
    for (var i = 0; i < routes.length; i++) if (routes[i].id === id) return routes[i];
    return null;
  }

  /* ======================================================================
     5B. TRANSIT HUB CLASSIFICATION & TRANSFER FRICTION HEURISTICS
     Why Standard Dijkstra Fails for Trotros:
     Standard Dijkstra minimizes pure edge weights (duration/distance).
     Minor roadside connections have massive, unpredictable headway/wait times
     (up to 45 min waiting for an empty trotro at a minor junction).
     Major transit terminals (Circle, Kaneshie, Accra Tema Station, Lapaz,
     Madina, Pokuase, etc.) have continuous passenger turnover, high dispatch
     frequency, and guaranteed connections.
     ====================================================================== */
  var TRANSIT_HUBS = {
    TIER_1: new Set([
      'Circle',
      'Kwame Nkrumah Circle',
      'Neoplan',
      'Odawna',
      'Kaneshie',
      'Kaneshie First Light',
      'First Light',
      'Kaneshie Market',
      'Kaneshie Terminal',
      'Accra Tema Station',
      'Tema Station Accra',
      'Rawlings Park',
      'Lapaz',
      'Lapaz New Station',
      'Abeka Lapaz',
      'Madina',
      'Madina Zongo Junction',
      'Zongo Junction',
      'Madina Station',
      '37 Station',
      '37 Military Hospital',
      '37',
      'Pokuase Interchange',
      'Pokuase',
      'Kasoa New Market',
      'Kasoa Main Station',
      'Kasoa',
      'Ashaiman Main Station',
      'Ashaiman',
      'Amasaman',
      'Amasaman Station'
    ]),
    TIER_2: new Set([
      'Achimota Old Station',
      'Achimota ABC',
      'Achimota Terminal',
      'Achimota New Station',
      'Achimota',
      'Odorkor',
      'Odorkor Station',
      'Spintex Flower Pot',
      'Flower Pot',
      'Spintex',
      'Dansoman Roundabout',
      'Dansoman Last Stop',
      'Dansoman',
      'Adenta Barrier',
      'Adenta',
      'Tetteh Quarshie',
      'Tetteh Quarshie Interchange',
      'Accra Mall',
      'Mallam Junction',
      'Mallam Interchange',
      'Weija',
      'Kumasi Kejetia',
      'Cape Coast Tantri',
      'Takoradi Market Circle',
      'Aflao'
    ])
  };

  var TIER_1_CANONICAL = new Set([
    'circle', 'kaneshie', 'first light', 'tema station accra', 'lapaz', 'madina',
    'zongo junction', '37', 'pokuase', 'kasoa', 'ashaiman', 'amasaman'
  ]);

  var TIER_2_CANONICAL = new Set([
    'achimota', 'odorkor', 'spintex', 'flower pot', 'dansoman', 'adenta barrier',
    'tetteh quarshie', 'mallam junction', 'weija', 'kumasi kejetia',
    'cape coast tantri', 'takoradi market circle', 'aflao'
  ]);

  function getStationTier(stopName) {
    if (!stopName) return 'MINOR';
    if (TRANSIT_HUBS.TIER_1.has(stopName)) return 'TIER_1';
    if (TRANSIT_HUBS.TIER_2.has(stopName)) return 'TIER_2';

    var norm = normName(stopName);
    var canon = canonical(norm);

    if (TIER_1_CANONICAL.has(canon)) return 'TIER_1';
    if (TIER_2_CANONICAL.has(canon)) return 'TIER_2';

    for (var t1 of TRANSIT_HUBS.TIER_1) {
      if (norm === normName(t1) || norm.indexOf(normName(t1)) >= 0) return 'TIER_1';
    }
    for (var t2 of TRANSIT_HUBS.TIER_2) {
      if (norm === normName(t2) || norm.indexOf(normName(t2)) >= 0) return 'TIER_2';
    }

    return 'MINOR';
  }

  function getStationTierWeight(stopName) {
    var tier = getStationTier(stopName);
    if (tier === 'TIER_1') return 0;   // Optimal transfer point: continuous turnover (0 min wait penalty)
    if (tier === 'TIER_2') return 5;   // Secondary hub: slight delay (+5 min wait penalty)
    return 20;                         // High friction / unpredictable wait at minor roadside stops (+20 min)
  }

  /**
   * Calculates weighted cost between stops for Dijkstra relaxation
   * Models transfer-friction and headway-penalty:
   * - Zero penalty for direct (single-vehicle) routes.
   * - Multi-leg transfers: 5 min base transfer friction + Tier wait penalty (Tier 1 = 0 min, Tier 2 = +5 min, Minor = +20 min).
   */
  function calculateEdgeCost(params) {
    params = params || {};
    var edgeDurationMinutes = params.edgeDurationMinutes || 0;
    var isTransfer = !!params.isTransfer;
    var transferStopName = params.transferStopName;
    var isDirectRoute = !!params.isDirectRoute;

    var cost = edgeDurationMinutes;

    if (isDirectRoute) {
      return cost;
    }

    if (isTransfer) {
      var waitPenalty = getStationTierWeight(transferStopName);
      var baseTransferFriction = 5;
      cost += (baseTransferFriction + waitPenalty);
    }

    return cost;
  }


  /* ======================================================================
     6. THE PLANNER
     ----------------------------------------------------------------------
     Dijkstra over (stop, route) states.

     State key:  'S|' + stopName          standing at a stop, not on a car
                 'B|' + stopName + '|' + routeId   on board that route

     Moves:
       walk   S|A -> S|B          (two stops within transferWalkM)
       board  S|A -> B|A|r        (costs a wait)
       ride   B|A|r -> B|B|r      (costs travel time + dwell)
       alight B|A|r -> S|A        (costs the change-of-car penalty)

     A stand-alone walk from origin to destination is offered as its own
     itinerary when nothing better exists, so the planner never claims you
     must ride when walking wins. It is never used to pad a car journey: no
     walk leg inside a car journey ends anywhere but at a stop.

     Ranking is cost in equivalent minutes. Each change of car adds
     transferPenaltyMinutes on top of the real wait, so a trip with fewer
     changes normally wins, but a genuinely shorter trip can still beat it.
     ====================================================================== */
  function dijkstra(origin, destination, used) {
    used = used || {};

    // seed: walk from the origin to every stop we are willing to walk to
    var seed = stopsNear(origin, meta.accessWalkM);
    if (!seed.length) return null;

    /* Whether a car has been ridden yet is part of the state, not a side
       value. Standing at Ablekuma after walking there from home is NOT the
       same state as standing there after a ride, because only the second may
       end the journey. When both shared the key 'S|ablekuma', a cheap walk
       to a nearby stop beat the car route that reached the same place, and
       the whole car journey was thrown away and reported as "walk the whole
       way". The '|R' suffix keeps the two apart. */
    function stopKey(name, ridden) { return 'S|' + name + (ridden ? '|R' : ''); }
    // '|J' marks the state where you have just got ON a car and not yet moved.
    // You cannot get off again from there, otherwise boarding and stepping
    // straight back on would be a cheap way to manufacture a "ridden" state
    // and a phantom ride with no stops.
    function boardKey(name, routeId, ridden) { return 'B|' + name + '|' + routeId + (ridden ? '|R' : ''); }
    function boardedKey(name, routeId, ridden) { return boardKey(name, routeId, ridden) + '|J'; }

    var best = {};   // stateKey -> cost
    var prev = {};   // stateKey -> { from, move }
    var heap = [];

    function push(key, cost) {
      best[key] = cost;
      var item = { key: key, cost: cost };
      var low = 0, high = heap.length;
      while (low < high) {
        var mid = (low + high) >>> 1;
        if (heap[mid].cost < cost) low = mid + 1;
        else high = mid;
      }
      heap.splice(low, 0, item);
    }

    for (var i = 0; i < seed.length; i++) {
      push(stopKey(seed[i].stop.name, false), walkMinutes(seed[i].meters) * meta.accessWalkWeight);
    }

    var settled = {};

    while (heap.length) {
      var node = heap.shift();
      if (settled[node.key]) continue;
      settled[node.key] = true;

      var parts = node.key.split('|');
      var mode = parts[0];
      var stop = stops[parts[1]];
      var route = mode === 'B' ? routeName(parts[2]) : null;
      // Has a car been ridden on the path that reached this state? A '|J' key
      // means we have boarded but not yet travelled, so it only counts as
      // ridden if we had already been on a car before this boarding.
      var last = parts[parts.length - 1];
      var ridden = last === 'R' || (last === 'J' && parts[parts.length - 2] === 'R');
      if (!stop) continue;

      // --- ride onwards -------------------------------------------------
      if (mode === 'B') {
        for (var li = 0; li < stop.legs.length; li++) {
          var leg = stop.legs[li];
          if (leg.route.id !== route.id) continue;
          // Keys identify a STOP PAIR, not a route. Alternatives should differ in
          // where you travel and change, not merely in which bus runs the same
          // road. Edges already used by an earlier option are penalised, not
          // banned, so shared trunk roads still allow a real alternative.
          var edgeKey = stop.name + '>' + leg.to.name;
          var meters = haversineM([stop.lon, stop.lat], [leg.to.lon, leg.to.lat]) * meta.roadFactor;
          var edgeDuration = rideMinutes(meters) + meta.dwellMinutesPerStop;
          var additionalCost = calculateEdgeCost({
            edgeDurationMinutes: edgeDuration,
            isTransfer: false,
            isDirectRoute: true
          });
          var cost = node.cost + additionalCost;
          if (used[edgeKey]) cost += meta.alternativePenaltyMinutes;
          // On board a car, so this state has definitely ridden.
          var key = boardKey(leg.to.name, route.id, true);
          if (best[key] == null || cost < best[key]) {
            push(key, cost);
            prev[key] = { from: node.key, move: 'ride', to: leg.to, fromStop: stop, meters: meters, route: route };
          }
        }
      }

      // --- alight -------------------------------------------------------
      // Not from a '|J' state: that is standing on a car that has not moved
      // yet, so getting off there is not a journey and must not count as one.
      if (mode === 'B' && parts[parts.length - 1] !== 'J') {
        // Getting off the car where you got on is not a journey: it would
        // produce a "ride" with no stops and no time, which is not a car ride
        // and would be charged for. A real alight is always from a stop the
        // car travelled to, which is why BOTH keys end in '|R'.
        var skey = stopKey(stop.name, true);
        var transferCost = calculateEdgeCost({
          edgeDurationMinutes: 0,
          isTransfer: true,
          transferStopName: stop.displayName || stop.name,
          isDirectRoute: false
        });
        var acost = node.cost + transferCost;
        if (used['transfer:' + canonical(stop.name)] || used['transfer:' + stop.name]) {
          acost += (meta.alternativePenaltyMinutes * 1.5);
        }
        if (best[skey] == null || acost < best[skey]) {
          push(skey, acost);
          prev[skey] = { from: node.key, move: 'alight', to: stop, fromStop: stop };
        }
      }

      // --- board any route serving this stop ----------------------------
      if (mode === 'S') {
        for (var ri = 0; ri < stop.routeIds.length; ri++) {
          var r = routeName(stop.routeIds[ri]);
          if (!r) continue;
          // Boarding does not by itself count as riding: you may board and get
          // straight back off. The ridden flag is only set by an actual ride,
          // and the '|J' marker blocks alighting until the car has moved.
          var bkey = boardedKey(stop.name, r.id, ridden);
          var bcost = node.cost + meta.boardWaitMinutes;
          if (best[bkey] == null || bcost < best[bkey]) {
            push(bkey, bcost);
            prev[bkey] = { from: node.key, move: 'board', to: stop, fromStop: stop, route: r };
          }
        }

        // --- walk to a nearby stop to change cars ----------------------
        var trans = stop.transfers || [];
        for (var wi = 0; wi < trans.length; wi++) {
          var other = trans[wi].stop;
          var wm = trans[wi].meters;
          var wkey = stopKey(other.name, ridden);
          var walkDuration = walkMinutes(wm);
          var transferCost = calculateEdgeCost({
            edgeDurationMinutes: walkDuration,
            isTransfer: true,
            transferStopName: other.displayName || other.name,
            isDirectRoute: false
          });
          var wcost = node.cost + transferCost;
          if (used['transfer:' + canonical(other.name)] || used['transfer:' + canonical(stop.name)] ||
              used['transfer:' + other.name] || used['transfer:' + stop.name]) {
            wcost += (meta.alternativePenaltyMinutes * 1.5);
          }
          if (best[wkey] == null || wcost < best[wkey]) {
            push(wkey, wcost);
            prev[wkey] = { from: node.key, move: 'walkTransfer', to: other, fromStop: stop, meters: wm };
          }
        }

        // --- finish: get off at a stop that serves the destination --------
        // Which stop you get off at is a real choice, so the distance from
        // the destination to every stop you could alight at is part of the
        // ranking: a trip that leaves you 200 m from where you are going
        // beats one that leaves you 2 km away. The distance is used here and
        // ONLY here - the itinerary reports it as a numbered gap (gapM) on
        // the last leg, never as a walk.
        //
        // Only if we actually travelled on a car. Otherwise the cheapest
        // path is "walk to a nearby stop, then walk on", which is just
        // walking and is handled separately in plan(). Letting it through
        // would mean the trotro search reports journeys that involve no
        // trotro at all.
        var destM = haversineM([stop.lon, stop.lat], destination);
        if (destM <= meta.egressWalkM && ridden) {
          var fkey = 'F';
          var fcost = node.cost + walkMinutes(destM) * meta.accessWalkWeight;
          if (best[fkey] == null || fcost < best[fkey]) {
            best[fkey] = fcost;
            prev[fkey] = { from: node.key, move: 'finish', to: stop, fromStop: stop, meters: destM };
          }
        }
      }
    }

    if (best['F'] == null) return null;

    // walk the chain back to the origin
    var chain = [];
    var k = 'F';
    while (prev[k]) { chain.push(prev[k]); k = prev[k].from; }
    chain.reverse();
    return { cost: best['F'], chain: chain };
  }

  /* ======================================================================
     7. CHAIN -> ITINERARY
     ----------------------------------------------------------------------
     The search chain is a sequence of graph moves. A passenger does not think
     in graph moves, so it is grouped into legs a person would say out loud:
     walk to a stop, ride a named car, change at an interchange.
     ====================================================================== */
  function chainToItinerary(chain, origin, destination) {
    var legs = [];
    var transfers = 0;

    var firstStop = null;
    for (var f = 0; f < chain.length; f++) {
      if (chain[f].move === 'board' || chain[f].move === 'walkTransfer') { firstStop = chain[f].to; break; }
    }
    // No boarding anywhere means this chain never used a car. The search is
    // meant to return trotro journeys, so treat it as a plain walk.
    if (!firstStop) {
      var wholeWalk = haversineM(origin, destination);
      return {
        legs: [{
          kind: 'walk', fromName: 'You', toName: 'Destination',
          meters: wholeWalk, minutes: walkMinutes(wholeWalk),
          coords: [origin, destination], detail: 'Walk the whole way'
        }],
        transfers: 0
      };
    }

    // The first walk is the one the passenger is expected to make: from where
    // they are to a stop where cars stop. It is the only walk this file
    // reports that is not a change of car, and it exists to answer "which
    // stop can I just walk to and catch a car from".
    var originWalk = haversineM(origin, [firstStop.lon, firstStop.lat]);
    legs.push({
      kind: 'walk', fromName: 'You', toName: firstStop.displayName,
      meters: originWalk, minutes: walkMinutes(originWalk),
      coords: [origin, [firstStop.lon, firstStop.lat]],
      detail: originWalk < 30
        ? 'You are already at ' + firstStop.displayName + ', where the cars stop'
        : 'Walk to ' + firstStop.displayName + ' and catch a car there'
    });

    // Ride being accumulated. Consecutive 'ride' moves on the same board
    // become ONE ride leg, because a passenger stays in the same car.
    var rideStart = null, rideRoute = null, rideStops = null, rideMeters = 0, rideMins = 0;
    // Where we last got off. A transfer is only reported when we board again.
    var alightedAt = null;

    // A car runs both ways along a road, but the route is named for ONE
    // direction ("Ablekuma -> Circle"). Boarding it at Circle to travel towards
    // Ablekuma means the stored name reads backwards, and the UI would say
    // "Board the Ablekuma -> Circle at Circle" and then get off at Ablekuma.
    // The name shown must follow the direction actually travelled.
    function travelName(route, fromStop, toStop) {
      var forward = route.stopIndex[fromStop.name] != null
        && route.stopIndex[toStop.name] != null
        && route.stopIndex[toStop.name] > route.stopIndex[fromStop.name];
      if (forward) return route.name;
      // Same corridor, opposite way. Name it the way the passenger is going.
      if (route.name.indexOf('->') >= 0) {
        var parts = route.name.split('->');
        if (parts.length === 2) return parts[1].trim() + ' -> ' + parts[0].trim();
      }
      return route.name;
    }

    function flushRide() {
      if (!rideStart) return;
      var lastStop = rideStops[rideStops.length - 1];
      legs.push({
        kind: 'ride',
        fromName: rideStart.displayName,
        toName: lastStop.displayName,
        routeId: rideRoute.id, routeName: rideRoute.name, color: rideRoute.color,
        // How the car reads to the passenger on this particular trip.
        travelName: travelName(rideRoute, rideStart, lastStop),
        meters: rideMeters, minutes: rideMins,
        coords: rideStops.map(function (s) { return [s.lon, s.lat]; }),
        stopNames: rideStops.map(function (s) { return s.name; }),
        // Where the passenger gets on and off, used to mark the map.
        stationStops: [0, rideStops.length - 1],
        boardStop: rideStart, alightStop: rideStops[rideStops.length - 1]
      });
      rideStart = null; rideRoute = null; rideStops = null; rideMeters = 0; rideMins = 0;
    }

    // Report a change of car at `stop`. Called only when a new car is
    // boarded, so simply getting off at the end never counts as a transfer.
    function reportChange(stop) {
      transfers++;
      var tier = getStationTier(stop.displayName || stop.name);
      var realisticWait = tier === 'TIER_1' ? 4 : (tier === 'TIER_2' ? 6 : 8);
      legs.push({
        kind: 'transfer', atName: stop.displayName,
        // The exact spot of the change, so the map can mark it and the steps
        // can name the interchange. `walked` false means you stay on this spot
        // and simply pick a different car here.
        lon: stop.lon, lat: stop.lat, walked: false, meters: 0,
        minutes: realisticWait,
        stationNote: stop.stationNote,
        detail: stop.stationNote || ('Change cars at ' + stop.displayName),
        station: !!stop.station,
        coords: [[stop.lon, stop.lat]]
      });
    }

    for (var i = 0; i < chain.length; i++) {
      var step = chain[i];

      if (step.move === 'board') {
        flushRide();
        // Boarding again after getting off IS the change of car.
        if (alightedAt) { reportChange(alightedAt); alightedAt = null; }
        rideStart = step.to;
        rideRoute = step.route;
        rideStops = [step.to];
        rideMeters = 0;
        rideMins = 0;
        continue;
      }

      if (step.move === 'ride') {
        if (rideStart) {
          rideStops.push(step.to);
          rideMeters += step.meters;
          // Each hop costs travel time plus the dwell at the stop we arrive at.
          rideMins += rideMinutes(step.meters) + meta.dwellMinutesPerStop;
        }
        continue;
      }

      if (step.move === 'alight') {
        flushRide();
        alightedAt = step.to;
        continue;
      }

      if (step.move === 'walkTransfer') {
        // Walking to a different stop to change cars. This one is a real
        // transfer on its own, so it reports itself.
        flushRide();
        transfers++;
        var fromPt = step.fromStop;
        var tier = getStationTier(step.to.displayName || step.to.name);
        var realisticWait = tier === 'TIER_1' ? 4 : (tier === 'TIER_2' ? 6 : 8);
        legs.push({
          kind: 'transfer', atName: step.to.displayName,
          // The change happens at the stop you arrive at, not the one you left,
          // so the map marker goes on `step.to`.
          lon: step.to.lon, lat: step.to.lat, walked: true,
          meters: step.meters, minutes: walkMinutes(step.meters) + realisticWait,
          stationNote: step.to.stationNote,
          detail: 'Walk ' + Math.round(step.meters) + ' m to ' + step.to.displayName + ' and change cars',
          station: !!step.to.station,
          coords: fromPt ? [[fromPt.lon, fromPt.lat], [step.to.lon, step.to.lat]] : [[step.to.lon, step.to.lat]]
        });
        // We are already standing at the new stop, so boarding next is not
        // an extra change.
        alightedAt = null;
        continue;
      }

      if (step.move === 'finish') {
        flushRide();
        var last = step.to;
        // You get off the car at a stop. That stop IS the end of the trip:
        // the car does not go to the door, and a trotro planner has no
        // business inventing a walk from the stop to the searched place and
        // charging minutes for it. How far the searched place is from this
        // stop is published as gapM so the last step can say so plainly.
        legs.push({
          kind: 'arrive', atName: last.displayName,
          lon: last.lon, lat: last.lat,
          // No walking of its own: this leg is getting off a car, not walking.
          meters: 0, minutes: 0,
          gapM: step.meters,
          // The time for that last bit is still published, because the trip's
          // total has to be honest: an option that leaves you 1.7 km short is
          // not the same journey as one that leaves you at the stop. It is
          // added to the total as information, never shown as a walk step.
          gapMinutes: walkMinutes(step.meters),
          stationNote: last.stationNote,
          detail: step.meters < 30
            ? 'Get off at ' + last.displayName + '. Your journey ends here.'
            : 'Get off at ' + last.displayName + ' and continue on foot',
          station: !!last.station,
          coords: [[last.lon, last.lat]]
        });
        alightedAt = null;
        continue;
      }
    }
    flushRide();

    if (transfers > meta.maxTransfers) return null;
    return { legs: legs, transfers: transfers };
  }

  /* ======================================================================
     8. PUBLIC PLANNING API
     ----------------------------------------------------------------------
     plan(origin, destination) -> { ok, reason, itineraries[] }
     origin and destination are [lon, lat].

     Itineraries come back best first. Each has:
       legs[]      walk / ride / transfer / arrive legs, with coords for the map
                   - walk: to a stop, to board or to change cars. Never to the
                     destination.
                   - ride: one car, its own colour, the stops it calls at.
                   - transfer: getting out of one car and onto another.
                   - arrive: the last leg. 0 m and 0 min. It names the stop you
                     get off at and carries gapM (how far the searched place is
                     from that stop) and gapMinutes (what that costs on foot),
                     so the last step can say so honestly and the total time
                     cannot understate the journey.
       transfers   number of changes of car
       totalMinutes, totalMeters, cost
       hasRide     false for a walk-only option, which is only offered when no
                   car journey exists at all or walking genuinely beats it

     Times here are ESTIMATES from straight-line distance and average speed.
     trotro.html replaces them with real OSRM driving times before showing
     them, and prices each ride leg with trotro-pricing.js.
     ====================================================================== */
  function plan(origin, destination) {
    origin = toLonLat(origin);
    destination = toLonLat(destination);
    if (!origin || !destination) {
      return { ok: false, reason: 'Missing origin or destination.', itineraries: [] };
    }

    var results = [];
    var used = {};
    var seen = {};

    for (var attempt = 0; attempt < 5; attempt++) {
      var found = dijkstra(origin, destination, used);
      if (!found) break;

      var itin = chainToItinerary(found.chain, origin, destination);
      if (!itin) break;

      var loops = itin.legs.some(function (l) {
        return l.kind === 'ride' && l.fromName === l.toName;
      });

      itin.legs.forEach(function (l) {
        if (l.kind === 'ride') {
          for (var c = 0; c < l.stopNames.length - 1; c++) {
            var s1 = canonical(l.stopNames[c]);
            var s2 = canonical(l.stopNames[c + 1]);
            used[s1 + '>' + s2] = true;
            used[s2 + '>' + s1] = true;
          }
          if (l.routeId) {
            used['route:' + l.routeId] = true;
          }
        } else if (l.kind === 'transfer' && l.atName) {
          used['transfer:' + canonical(l.atName)] = true;
          used['transfer:' + l.atName] = true;
        }
      });
      if (loops) continue;

      var minutes = 0, meters = 0, rides = 0;
      itin.legs.forEach(function (l) {
        minutes += l.minutes || 0;
        minutes += l.gapMinutes || 0;
        if (l.kind === 'ride') { meters += l.meters || 0; rides++; }
      });
      // Walking to the first car and from the last car is real effort: it counts extra when ranking
      var accessWalkMin = (itin.legs[0] && itin.legs[0].kind === 'walk') ? (itin.legs[0].minutes || 0) : 0;
      var egressWalkMin = 0;
      itin.legs.forEach(function (l) { if (l.kind === 'arrive') egressWalkMin += l.gapMinutes || 0; });
      itin.accessWalkMinutes = accessWalkMin;
      itin.egressWalkMinutes = egressWalkMin;
      itin.rankMinutes = minutes + (accessWalkMin + egressWalkMin) * (meta.accessWalkWeight - 1);
      itin.totalMinutes = minutes;
      itin.totalMeters = meters;
      itin.cost = found.cost;
      itin.hasRide = rides > 0;
      itin.rideCount = rides;
      itin.changeAt = itin.legs.filter(function (l) { return l.kind === 'transfer'; })
        .map(function (l) { return { name: l.atName, lon: l.lon, lat: l.lat, station: !!l.station, note: l.stationNote }; });
      itin.cars = itin.legs.filter(function (l) { return l.kind === 'ride'; })
        .map(function (l) { return { name: l.travelName || (l.fromName + ' → ' + l.toName), color: l.color, from: l.fromName, to: l.toName }; });

      var sig = itin.legs.map(function (l) {
        if (l.kind === 'ride') return 'ride:' + (l.routeId || '') + ':' + (l.fromName || '') + '->' + (l.toName || '');
        if (l.kind === 'transfer') return 'transfer:' + (l.atName || '');
        if (l.kind === 'walk') return 'walk:' + (l.fromName || '') + '->' + (l.toName || '');
        return l.kind + ':' + (l.toName || l.atName || '');
      }).join('|');

      if (!seen[sig]) {
        seen[sig] = true;
        results.push(itin);
      }
    }

    var directWalk = haversineM(origin, destination);
    var walkOption = null;
    if (directWalk <= meta.maxWalkOnlyM) {
      var walkMin = walkMinutes(directWalk);
      walkOption = {
        legs: [{
          kind: 'walk', fromName: 'You', toName: 'Destination',
          meters: directWalk, minutes: walkMin,
          coords: [origin, destination],
          detail: 'Walk the whole way'
        }],
        totalMinutes: walkMin, rankMinutes: walkMin, totalMeters: directWalk,
        cost: walkMin, hasRide: false, rideCount: 0, transfers: 0,
        changeAt: [], cars: []
      };
    }

    if (!results.length) {
      if (walkOption) return { ok: true, reason: null, itineraries: [walkOption] };

      var nearO = stopsNear(origin, meta.accessWalkM);
      var nearD = stopsNear(destination, meta.egressWalkM);
      var reason;
      if (!nearO.length) reason = 'No trotro stop is within walking distance of your starting point.';
      else if (!nearD.length) reason = 'No trotro stop is close enough to your destination to plan a trip to.';
      else reason = 'No single car or chain of changes connects those stops in the loaded network.';
      return { ok: false, reason: reason, itineraries: [], stopsNearOrigin: nearO, stopsNearDestination: nearD };
    }

    results.sort(function (a, b) {
      var aMin = a.rankMinutes != null ? a.rankMinutes : a.totalMinutes;
      var bMin = b.rankMinutes != null ? b.rankMinutes : b.totalMinutes;

      // 1. Commuter preference: Fewer vehicle transfers is strongly favored in Ghana
      if (a.transfers !== b.transfers) {
        var diff = aMin - bMin;
        if (a.transfers < b.transfers && diff < 18) return -1;
        if (b.transfers < a.transfers && -diff < 18) return 1;
      }
      // 2. Hub quality: Kwame Nkrumah Circle (Super Hub = 0) > Other Tier 1 Hubs (37, Tema Station = 2) > Tier 2 = 6 > Minor = 12
      function hubPri(n) {
        var c = canonical(normName(n));
        if (c === 'circle' || c.indexOf('circle') >= 0) return 0;
        if (getStationTier(n) === 'TIER_1') return 2;
        if (getStationTier(n) === 'TIER_2') return 6;
        return 12;
      }
      var aHubScore = (a.changeAt || []).reduce(function (s, c) { return s + hubPri(c.name); }, 0);
      var bHubScore = (b.changeAt || []).reduce(function (s, c) { return s + hubPri(c.name); }, 0);
      if (aHubScore !== bHubScore && Math.abs(a.totalMinutes - b.totalMinutes) < 14) {
        return aHubScore - bHubScore;
      }
      // 3. Real honest journey time (ETA)
      if (Math.abs(a.totalMinutes - b.totalMinutes) > 3) {
        return a.totalMinutes - b.totalMinutes;
      }
      // 4. Dijkstra search cost fallback
      return a.cost - b.cost;
    });

    // Deduplicate results by their commuter corridor / transfer signature
    function getCorridorKey(itin) {
      if (!itin.hasRide) return 'walk-only';
      var transfers = [];
      (itin.changeAt || []).forEach(function (c) {
        var cn = canonical(normName(c.name));
        if (!transfers.length || transfers[transfers.length - 1] !== cn) {
          transfers.push(cn);
        }
      });
      if (transfers.length > 0) {
        return 'via:' + transfers.join('>');
      }
      return 'direct';
    }

    var distinctResults = [];
    var seenCorridors = {};

    for (var rIdx = 0; rIdx < results.length; rIdx++) {
      var it = results[rIdx];
      var cKey = getCorridorKey(it);
      if (!seenCorridors[cKey]) {
        seenCorridors[cKey] = true;
        distinctResults.push(it);
      }
    }

    // Show walking alongside riding when it is competitive.
    if (walkOption) {
      var bestRide = null;
      for (var q = 0; q < distinctResults.length; q++) if (distinctResults[q].hasRide) { bestRide = distinctResults[q]; break; }
      if (!bestRide || walkOption.totalMinutes < bestRide.totalMinutes * 0.9) {
        distinctResults.push(walkOption);
      }
    }

    return { ok: true, reason: null, itineraries: distinctResults.slice(0, 4) };
  }

  /* ======================================================================
     9. GHANA STOP EXTRACT - ghana_all_stops.geojson
     ----------------------------------------------------------------------
     The route network above is the prototype Greater Accra graph. This
     section is different data: every extracted trotro stop, bus station
     and transport platform in Ghana (4338 Point features), loaded into
     application state and answerable by position.

     It is loaded automatically from either side:
       - in the browser, ghana_all_stops.js (the same file as a script, so
         it also works over file:// where fetch() of a local .json is
         blocked) sets window.GHANA_ALL_STOPS before this file runs;
       - in Node, the .geojson next to this file is read at require time.
     loadAllStops(url) covers the remaining case: a page served over http
     that included neither.

     The extract knows nothing about routes, so it never plans trips. It
     answers "which stops are near me, and how far on foot" (nearestStops),
     and every answer carries its own lat/lon so it can be handed straight
     to plan() and TrotroPricing.getFare() as the boarding point.
     ====================================================================== */

  // Every stop from ghana_all_stops.geojson: { name, displayName, kind, id,
  // lat, lon }. `name` falls back to 'Trotro Stop' - 774 features in the
  // file carry no name, and a pin with no label is useless to a passenger.
  var allStops = [];

  function stopKind(p) {
    if (p.amenity === 'bus_station' || p.public_transport === 'station') return 'bus station';
    if (p.railway || p.train) return 'rail station';
    if (p.ferry || p.amenity === 'ferry_terminal') return 'ferry terminal';
    if (p.highway === 'bus_stop' || p.public_transport === 'stop_position') return 'trotro stop';
    if (p.public_transport === 'platform') return 'transport platform';
    return 'stop';
  }

  // Import a parsed FeatureCollection. Replaces any previously loaded data
  // and returns how many stops are now in state, so a caller can tell
  // whether the file it handed over actually loaded.
  function setAllStops(geojson) {
    allStops.length = 0;
    var features = (geojson && geojson.features) || [];
    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      if (!f || !f.geometry || f.geometry.type !== 'Point') continue;
      var c = f.geometry.coordinates;
      if (!c || c.length < 2) continue;
      var lon = +c[0], lat = +c[1];
      if (!isFinite(lat) || !isFinite(lon)) continue;
      var p = f.properties || {};
      var name = (p.name && String(p.name).trim()) || 'Trotro Stop';
      allStops.push({
        name: name, displayName: name, kind: stopKind(p),
        id: p['@id'] || null, lat: lat, lon: lon
      });
    }
    return allStops.length;
  }

  // Bring the file into state. Accepts a URL (http) or a path (Node);
  // needs neither when the data already arrived as window.GHANA_ALL_STOPS.
  function loadAllStops(url) {
    if (allStops.length) return Promise.resolve(allStops.length);
    if (typeof globalThis !== 'undefined' && globalThis.GHANA_ALL_STOPS) {
      return Promise.resolve(setAllStops(globalThis.GHANA_ALL_STOPS));
    }
    var target = url || 'ghana_all_stops.geojson';
    if (/^https?:/i.test(target) && typeof fetch === 'function') {
      return fetch(target).then(function (r) {
        if (!r.ok) throw new Error('stop file HTTP ' + r.status);
        return r.json();
      }).then(setAllStops);
    }
    if (typeof require === 'function') {
      return new Promise(function (resolve, reject) {
        try {
          resolve(setAllStops(JSON.parse(require('fs').readFileSync(target, 'utf8'))));
        } catch (e) { reject(e); }
      });
    }
    return Promise.reject(new Error('ghana_all_stops data is not available in this environment'));
  }

  // Accept both coordinate orders for Ghana: latitude (4.7..11.1) and
  // longitude (-3.1..1.2) never overlap, so a pair given the wrong way
  // round is recognised and corrected instead of measuring to the sea.
  function asLatLon(p) {
    var a = +p[0], b = +p[1];
    if (a >= -4 && a <= 2 && b >= 4 && b <= 12) return [b, a];
    return [a, b];
  }

  // nearestStops([lat, lon], n, options) -> up to n stops, closest first.
  // options.maxM drops anything further than a walk. Each result carries
  // the exact walking distance (meters - the same Haversine the planner
  // uses), the walk time at the network's walking speed, and lat/lon
  // ready to be used as a boarding point for plan() and getFare().
  function nearestStops(latLon, n, options) {
    options = options || {};
    if (!latLon || latLon.length < 2 || !allStops.length) return [];
    var origin = asLatLon(latLon);
    var point = [origin[1], origin[0]];   // haversineM takes [lon, lat]
    var maxM = options.maxM != null && isFinite(options.maxM) ? options.maxM : Infinity;
    var limit = Math.max(1, Math.floor(n || 5));
    var out = [];
    var seenNames = {};
    for (var i = 0; i < allStops.length; i++) {
      var s = allStops[i];
      var d = haversineM(point, [s.lon, s.lat]);
      if (d > maxM) continue;
      out.push({
        name: s.name, displayName: s.displayName, kind: s.kind, id: s.id,
        lat: s.lat, lon: s.lon, meters: d, minutes: walkMinutes(d)
      });
      seenNames[canonical(s.name)] = true;
    }

    // Also include any stops from the routing graph that might not be in the GeoJSON
    for (var stopName in stops) {
      if (seenNames[stopName]) continue;
      var routeStop = stops[stopName];
      var d2 = haversineM(point, [routeStop.lon, routeStop.lat]);
      if (d2 > maxM) continue;
      out.push({
        name: stopName, displayName: routeStop.displayName, kind: routeStop.station ? 'station' : 'stop', id: 'route_' + stopName,
        lat: routeStop.lat, lon: routeStop.lon, meters: d2, minutes: walkMinutes(d2)
      });
    }
    out.sort(function (a, b) { return a.meters - b.meters; });
    return out.slice(0, limit);
  }

  // Take the data this environment already provides, if any. Silent when
  // the file is absent: the page calls loadAllStops(), tests load explicitly.
  (function () {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.GHANA_ALL_STOPS) {
        setAllStops(globalThis.GHANA_ALL_STOPS);
        return;
      }
    } catch (e) { /* fall through */ }
    if (typeof require === 'function' && typeof process !== 'undefined') {
      try {
        var fs = require('fs'), path = require('path');
        var file = path.join(__dirname, 'ghana_all_stops.geojson');
        if (fs.existsSync(file)) setAllStops(JSON.parse(fs.readFileSync(file, 'utf8')));
      } catch (e) { /* data not available: nearestStops() returns [] */ }
    }
  })();

  /* ======================================================================
     10. EXPORT + SELF TEST
     ----------------------------------------------------------------------
     Open the console in the browser and run TrotroNetwork.selfTest(), or in
     Node:  node -e "console.log(require('./trotro-network.js').selfTest())"
     ====================================================================== */
  var API = {
    meta: meta,
    routes: routes,
    stops: stops,
    stations: stations,
    interchanges: interchanges,

    plan: plan,
    stopsNear: stopsNear,
    nearestStop: nearestStop,
    // Resolving typed text to a real stop. The search box must use these
    // instead of trusting a geocoder point that may be kilometres out.
    matchStop: matchStop,
    searchStops: searchStops,
    hub: hub,
    stripName: stripName,
    stop: function (name) { return stops[canonical(name)] || null; },
    route: routeName,
    haversineM: haversineM,
    canonical: canonical,
    GHANA_TRANSIT_GRAPH: GHANA_TRANSIT_GRAPH,

    // The national stop extract (section 9). nearestStops() takes the
    // user's [lat, lon] and returns the N closest stops sorted by walking
    // distance; each result is also a valid boarding point for plan() and
    // TrotroPricing.getFare().
    allStops: allStops,
    setAllStops: setAllStops,
    loadAllStops: loadAllStops,
    nearestStops: nearestStops,
    asLatLon: asLatLon,

    selfTest: function () {
      var f = [], checks = 0;
      function ok(cond, label) { checks++; if (!cond) f.push(label); }

      ok(stopList.length > 0, 'network has stops');

      // every route must link its stops in order
      routes.forEach(function (r) {
        checks++;
        if (r.seq.length !== r.stops.length) f.push('route ' + r.id + ' stop sequence not built');
        for (var i = 0; i < r.seq.length - 1; i++) {
          var linked = r.seq[i].legs.some(function (l) { return l.to === r.seq[i + 1] && l.route === r; });
          ok(linked, 'route ' + r.id + ' must link ' + r.seq[i].name + ' to ' + r.seq[i + 1].name);
        }
      });

      var labadi = stops['labadi'], ablekuma = stops['ablekuma'], circle = stops['circle'], madina = stops['madina'];
      ok(!!labadi, 'Labadi exists as a stop');
      ok(!!ablekuma, 'Ablekuma exists as a stop');
      ok(!!circle && circle.station, 'Circle is marked as a station');

      // A name typed into the search box must resolve to the stop itself. The
      // public geocoder puts several Accra names kilometres from where the car
      // stops, so the name - not the coordinate - has to decide the stop.
      var nameCases = [
        ['Ablekuma', 'ablekuma'],
        ['Kwame Nkrumah Circle Accra', 'circle'],
        ['Kaneshie Market Complex', 'kaneshie'],
        ['Adenta', 'adenta'],
        ['Labadi Motor Court, Accra', 'labadi'],
        ['La Nkwantanang Madina Municipal Assembly', 'madina']
      ];
      nameCases.forEach(function (c) {
        var m = matchStop(c[0]);
        ok(!!m && m.stop.name === c[1], '"' + c[0] + '" must resolve to the ' + c[1] + ' stop');
      });
      ok(matchStop('Lapaz') === null, 'a name that is not a stop must not resolve to one');
      ok(!!hub(), 'there must be a hub stop for when a position cannot be placed');
      var hubStop = hub();
      if (hubStop) {
        ok(stopsNear([hubStop.lon, hubStop.lat], meta.accessWalkM).length > 0,
          'the hub must be reachable from itself');
      }
      ok(searchStops('madina')[0].stop.name === 'madina', 'searching "madina" must offer the Madina stop first');

      // The national stop extract. If it is present, it must be complete and
      // nearestStops() must return real, ordered, walkable answers; if it is
      // absent (the file was not shipped), the page must still work and the
      // lookup must say so with an empty list rather than crash.
      if (allStops.length) {
        ok(allStops.length > 4000, 'the stop extract should carry every stop in Ghana (got ' + allStops.length + ')');
        ok(allStops.every(function (s) { return isFinite(s.lat) && isFinite(s.lon); }),
          'every stop in the extract must have real coordinates');
        ok(allStops.every(function (s) { return s.name && s.name.length > 0; }),
          'every stop in the extract must have a display name');
        var near = nearestStops([5.5568, -0.2177], 5);   // Circle, as [lat, lon]
        ok(near.length === 5, 'nearestStops must return the N closest stops (got ' + near.length + ')');
        ok(near.every(function (s, i) { return i === 0 || near[i - 1].meters <= s.meters; }),
          'nearestStops must come back sorted by distance');
        ok(near[0].meters <= near[near.length - 1].meters && near[0].meters < 500,
          'the closest stop to Circle must really be close');
        ok(near.every(function (s) { return typeof s.minutes === 'number' && s.minutes >= 0; }),
          'every nearby stop must publish its walking time');
        // Swapped order must give the same answer, or the map pins end up in
        // the sea when the page passes [lon, lat].
        var swapped = nearestStops([-0.2177, 5.5568], 5);
        ok(swapped.length === near.length && swapped[0].id === near[0].id,
          'nearestStops must accept either coordinate order');
        // A boarding point from the extract must be plannable: the closest
        // extract stop to Circle is within a walk of Circle itself, so a trip
        // from there must plan, and the point must carry usable coordinates.
        var board = near[0];
        var boardPlan = plan([board.lon, board.lat], [-0.1860, 5.6500]);   // -> Legon
        ok(boardPlan.ok, 'a stop picked from the extract must work as a boarding point for plan()');
        ok(typeof board.lat === 'number' && typeof board.lon === 'number',
          'a nearby stop must carry lat/lon usable as a boarding point');
        var capped = nearestStops([5.5568, -0.2177], 10, { maxM: 50 });
        ok(capped.every(function (s) { return s.meters <= 50; }),
          'maxM must drop stops further than the cap');
      } else {
        ok(nearestStops([5.5568, -0.2177], 5).length === 0,
          'with no stop extract loaded, nearestStops must return an empty list, not fail');
      }


      // The UI tells cars apart by colour, so two different cars sharing one
      // colour would make a change of car invisible on the map. Routes are
      // stored in direction pairs, so each colour must appear exactly twice.
      var byColour = {};
      routes.forEach(function (r) {
        ok(!!r.color, 'route ' + r.id + ' must have a colour to be drawn');
        byColour[r.color] = (byColour[r.color] || 0) + 1;
      });
      Object.keys(byColour).forEach(function (c) {
        ok(byColour[c] === 2, 'colour ' + c + ' is used by ' + byColour[c] + ' routes; a colour must belong to one car in both directions');
      });

      // Every itinerary must publish where it changes car and which cars it
      // uses, otherwise the map cannot show a change of car at all.
      var cc = stops['circle'], ad = stops['adenta'];
      if (cc && ad) {
        var chk = plan([cc.lon, cc.lat], [ad.lon, ad.lat]);
        if (chk.ok) {
          chk.itineraries.forEach(function (i) {
            var tf = i.legs.filter(function (l) { return l.kind === 'transfer'; });
            ok(i.changeAt.length === tf.length, 'a change count must match the number of changes');
            ok(i.cars.length === i.rideCount, 'the car list must match the number of rides');
            ok(tf.every(function (l) { return typeof l.lon === 'number' && typeof l.lat === 'number'; }),
              'a change of car must have coordinates to pin on the map');
            ok(i.cars.every(function (c) { return !!c.color; }),
              'every car must have a colour to be drawn on the map');
          });
        }
      }

      // Labadi -> Ablekuma has a direct car, so it must need no change.
      if (labadi && ablekuma) {
        var p = plan([labadi.lon, labadi.lat], [ablekuma.lon, ablekuma.lat]);
        ok(p.ok, 'Labadi -> Ablekuma must be plannable');
        if (p.ok) {
          ok(p.itineraries[0].hasRide, 'best Labadi -> Ablekuma option must actually ride');
          ok(p.itineraries[0].rideCount === 1, 'Labadi -> Ablekuma should need one car, not several');
          var sane = p.itineraries.every(function (i) {
            return i.legs.every(function (l) {
              return l.kind !== 'ride' || (l.routeId && l.coords.length >= 2);
            });
          });
          ok(sane, 'every ride leg names one route and has stop coordinates');
        }
      }

      // Circle -> Adenta genuinely needs a change of car: out of Circle you take
      // the Madina car, change at Madina, then pick up the Adenta car. This is
      // the interchange behaviour the whole file exists to get right.
      var adenta = stops['adenta'];
      if (circle && adenta) {
        var t = plan([circle.lon, circle.lat], [adenta.lon, adenta.lat]);
        ok(t.ok, 'Circle -> Adenta must be plannable');
        if (t.ok) {
          ok(t.itineraries[0].transfers >= 1, 'Circle -> Adenta must involve a change of car');
          ok(t.itineraries[0].legs.some(function (l) { return l.kind === 'transfer'; }),
            'a change of car must be shown as a transfer step');
        }
      }

      // Structural invariant across the whole network: for every pair of
      // stops that can be joined, the legs must tell a consistent story.
      // This is what catches half-finished itineraries and phantom changes.
      // A car's name must follow the direction it actually travels. Every route
      // is stored one way round, so a car boarded the other way reads backwards.
      var otherWay = function (name) {
        var p = String(name).split('->');
        return p.length === 2 ? p[1].trim() + ' -> ' + p[0].trim() : name;
      };
      var routeSeq = {};
      routes.forEach(function (r) {
        routeSeq[r.id] = { name: r.name, seq: r.stops.map(function (s) { return canonical(s[0]); }) };
      });
      var reversedNames = 0;
      var loopRides = 0;
      // Where a car journey is allowed to end, and where it is not.
      var destWalkEnds = 0;     // walk legs that end at the destination
      var arriveCount = 0;      // journeys that name the stop you get off at
      var badFinish = [];       // journeys that end anywhere else

      var names = Object.keys(stops);
      var pairs = 0;
      for (var ai = 0; ai < names.length; ai++) {
        for (var bi = 0; bi < names.length; bi++) {
          if (names[ai] === names[bi]) continue;
          var sa = stops[names[ai]], sb = stops[names[bi]];
          var res = plan([sa.lon, sa.lat], [sb.lon, sb.lat]);
          if (!res.ok) continue;
          pairs++;
          res.itineraries.forEach(function (it) {
            var rides = 0, changes = 0, steps = 0, arrives = 0, problems = [];
            it.legs.forEach(function (l) {
              if (l.kind === 'ride') {
                rides++;
                if (!l.routeId) problems.push('ride without a route');
                if (!l.coords || l.coords.length < 2) problems.push('ride without stops');
                if (!(l.minutes > 0)) problems.push('ride with no duration');
                // A car that ends where it was boarded took nobody anywhere.
                if (l.fromName === l.toName) loopRides++;
                // The name shown must follow the way the car is going, not the
                // way the route happens to be stored.
                var rs = routeSeq[l.routeId];
                if (rs && l.travelName && l.stopNames && l.stopNames.length >= 2) {
                  var ia = rs.seq.indexOf(l.stopNames[0]);
                  var ib = rs.seq.indexOf(l.stopNames[l.stopNames.length - 1]);
                  if (ia >= 0 && ib >= 0 && ia !== ib) {
                    var shouldRead = ib > ia ? rs.name : otherWay(rs.name);
                    if (ib < ia) reversedNames++;
                    ok(l.travelName === shouldRead,
                      'the car reads "' + l.travelName + '" but travels "' + shouldRead + '"');
                  }
                }
              } else if (l.kind === 'transfer') {
                changes++;
              } else if (l.kind === 'walk') {
                steps++;
                // A walk inside a car journey may only ever end at a stop.
                // One that ends at the destination is a walk from a stop to
                // the destination, which is exactly what was removed.
                if (it.hasRide && l.toName === 'Destination') destWalkEnds++;
              } else if (l.kind === 'arrive') {
                arrives++;
                if (it.hasRide) arriveCount++;
              }
            });
            if (problems.length) f.push(names[ai] + '->' + names[bi] + ': ' + problems.join('; '));
            if (changes !== it.transfers) f.push(names[ai] + '->' + names[bi] + ': transfer legs do not match the change count');
            if (it.hasRide && rides !== it.transfers + 1) {
              f.push(names[ai] + '->' + names[bi] + ': ' + rides + ' rides for ' + it.transfers + ' changes');
            }
            if (!it.hasRide && rides > 0) f.push(names[ai] + '->' + names[bi] + ': walk-only option contains a ride');
            // A car journey ends by naming the stop you get off at. It is not
            // a walk, it has no distance and no duration of its own, and it
            // says how far the searched place still is (gapM).
            if (it.hasRide) {
              var endLeg = it.legs[it.legs.length - 1];
              if (!endLeg || endLeg.kind !== 'arrive') {
                badFinish.push(names[ai] + '->' + names[bi] + ' ends with ' + (endLeg ? endLeg.kind : 'nothing'));
              } else if (!endLeg.atName || !(endLeg.gapM >= 0) || endLeg.minutes || endLeg.meters) {
                badFinish.push(names[ai] + '->' + names[bi] + ': the last stop is not stated cleanly');
              }
            } else if (arrives) {
              badFinish.push(names[ai] + '->' + names[bi] + ': a walk-only option has a get-off stop');
            }
            // a journey must start by walking or riding, never end mid-air
            if (it.legs.length < 1) f.push(names[ai] + '->' + names[bi] + ': empty itinerary');
            // The stated total must be the sum of the legs plus the walk from
            // the last stop to the searched place, so no option can look
            // quicker by quietly dropping the distance it leaves you with.
            var legMinutes = it.legs.reduce(function (s, l) {
              return s + (l.minutes || 0) + (l.gapMinutes || 0);
            }, 0);
            if (Math.abs(it.totalMinutes - legMinutes) > 0.01) {
              f.push(names[ai] + '->' + names[bi] + ': the total time does not match the legs'
                + ' (' + it.totalMinutes.toFixed(1) + ' vs ' + legMinutes.toFixed(1) + ')');
            }
            checks++;
          });
        }
      }
      ok(pairs > 100, 'the network should connect most stop pairs (got ' + pairs + ')');
      ok(reversedNames > 0, 'cars must really be boarded in both directions, or the naming check proves nothing');
      ok(loopRides === 0, 'a car must never be offered that ends where it was boarded (' + loopRides + ' found)');
      ok(destWalkEnds === 0, 'a car journey must never contain a walk to the destination (' + destWalkEnds + ' found)');
      ok(arriveCount > 100, 'a car journey must name the stop you get off at (' + arriveCount + ' journeys seen)');
      ok(badFinish.length === 0, 'a car journey must end at a stop, with no distance or time of its own (' + badFinish.slice(0, 3).join('; ') + ')');

      // Getting off at the end is not a change of car.
      if (circle && madina) {
        var d = plan([circle.lon, circle.lat], [madina.lon, madina.lat]);
        ok(d.ok, 'Circle -> Madina must be plannable');
        ok(d.ok && d.itineraries[0].transfers === 0, 'Circle -> Madina must not need a change of car');
        ok(d.ok && !d.itineraries[0].legs.some(function (l) { return l.kind === 'transfer'; }),
          'a single-car trip must show no transfer step');
        // and the times must be real, not zero
        ok(d.ok && d.itineraries[0].totalMinutes > 5, 'a real trip must have a real duration');
      }

      // walking must be offered when it is the sensible answer
      if (circle) {
        var w = plan([circle.lon, circle.lat], [circle.lon + 0.0008, circle.lat + 0.0004]);
        ok(w.ok && w.itineraries.some(function (i) { return !i.hasRide; }),
          'walking must be offered for a very short trip');
      }

      // The hub is the fallback the page plans from when a position cannot start
      // a trip at all, so every stop must be reachable from it. If this fails,
      // the fallback is not a fallback and the page should refuse instead.
      var hubStart = hub();
      if (hubStart) {
        var hubMisses = [];
        stopList.forEach(function (s) {
          if (s.name === hubStart.name) return;
          if (!plan([hubStart.lon, hubStart.lat], [s.lon, s.lat]).ok) hubMisses.push(s.displayName);
        });
        ok(hubMisses.length === 0,
          'every stop must be reachable from the hub fallback (' + hubMisses.slice(0, 5).join(', ') + ')');
      }

      // nothing may be invented between unreachable points
      var far = plan([0.0, 5.0], [0.1, 5.1]);
      ok(!far.ok, 'no journey may be invented where no stop is walkable');

      return { ok: f.length === 0, checks: checks, failures: f };
    },
    TRANSIT_HUBS: TRANSIT_HUBS,
    getStationTier: getStationTier,
    getStationTierWeight: getStationTierWeight,
    calculateEdgeCost: calculateEdgeCost,
    findBestTrotroPath: function (startStop, endStop) {
      var sA = typeof startStop === 'string' ? matchStop(startStop) : null;
      var sB = typeof endStop === 'string' ? matchStop(endStop) : null;
      var ptA = sA ? [sA.stop.lon, sA.stop.lat] : toLonLat(startStop);
      var ptB = sB ? [sB.stop.lon, sB.stop.lat] : toLonLat(endStop);
      if (!ptA || !ptB) {
        return { ok: false, reason: 'Invalid or unresolved start/end points.', itineraries: [] };
      }
      return plan(ptA, ptB);
    }
  };

  global.TrotroNetwork = API;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
    module.exports.default = API;
    module.exports.TRANSIT_HUBS = TRANSIT_HUBS;
    module.exports.getStationTier = getStationTier;
    module.exports.getStationTierWeight = getStationTierWeight;
    module.exports.calculateEdgeCost = calculateEdgeCost;
    module.exports.findBestTrotroPath = API.findBestTrotroPath;
  }

})(typeof window !== 'undefined' ? window : globalThis);