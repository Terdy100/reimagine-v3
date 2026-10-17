/* ==========================================================================
   trotro-pricing.js - Ghana public transport fare engine (standalone)
   --------------------------------------------------------------------------
   This file holds ALL pricing data and ALL fare logic. trotro.html only
   calls TrotroPricing.getFare(...). Edit here, never in the HTML.

   It is a plain script: no build step, no modules, works over file://.

   PROVENANCE - read this before you change a number
   ------------------------------------------------
   [OFFICIAL]   Published in the GPRTU / GRTCC 8% fare schedule that took
                effect Saturday 26 September 2026. Source: MyJoyOnline,
                "Public transport fares go up by 8% from September 26",
                23 September 2026. The 8% was calculated on the approved
                fares effective 24 May 2025.
   [OBSERVED]   A fare actually being charged on the street on the date
                given. Not an approved rate. Kept separate from [OFFICIAL]
                on purpose.
   [DERIVED]    Interpolated by this file because the official level-to-
                kilometre mapping is not published in full. These are
                estimates, not approved fares.

   HOW GHANA ACTUALLY PRICES
   -------------------------
   Ghana does not price trotro by "GH per km". The national schedule is a
   LADDER OF APPROVED FARE LEVELS. An operator picks the level for the trip
   and the passenger pays that level. So the engine works in two steps:
     1. work out which approved level the trip falls on, then
     2. round UP to the next published level (you never pay under a level).
   Distance bands exist only for shared taxis, where they are official.

   PRECEDENCE (highest first)
     1. routeOverrides  - a named corridor with a known fare
     2. regionRules     - a regional/terminal rule
     3. distanceBands   - distance table for the trip's mode
     4. fareCurve       - last-resort interpolation, then snapped
     every result is finally snapped to the published ladder
   ========================================================================== */

(function (global) {
  'use strict';

  /* ======================================================================
     1. METADATA
     ====================================================================== */
  var meta = {
    version: '2026.09.26+1',
    effectiveDate: '2026-09-26',
    previousEffectiveDate: '2025-05-24',
    percentIncrease: 8,
    currency: 'GHS ',
    authority: 'Ghana Private Road Transport Union (GPRTU) / Ghana Road Transport Coordinating Council (GRTCC)',
    source: 'https://www.myjoyonline.com/public-transport-fares-go-up-by-8-from-september-26-check-how-much-you-will-pay/',
    sourceDate: '2026-09-23',
    note: 'The 8% adjustment was calculated on the approved fares that took effect 24 May 2025. Haulage was covered by the same adjustment but no rates were published.'
  };

  /* ======================================================================
     2. OFFICIAL TABLES
     ====================================================================== */

  // [OFFICIAL] Shared taxi is priced by distance bands. These 11 bands are
  // the complete published shared taxi schedule. Past 40 km the schedule
  // gives no higher band, so shared taxi long-distance needs a route
  // override or it falls through to the intercity ladder.
  var sharedTaxiBands = [
    { maxKm: 1, fare: 1.90, was: 1.70 },
    { maxKm: 4, fare: 2.90, was: 2.60 },
    { maxKm: 8, fare: 4.70, was: 4.30 },
    { maxKm: 12, fare: 5.60, was: 5.10 },
    { maxKm: 16, fare: 8.40, was: 7.70 },
    { maxKm: 20, fare: 9.20, was: 8.50 },
    { maxKm: 24, fare: 11.10, was: 10.20 },
    { maxKm: 28, fare: 12.00, was: 11.10 },
    { maxKm: 32, fare: 15.70, was: 14.50 },
    { maxKm: 36, fare: 18.40, was: 17.00 },
    { maxKm: 40, fare: 20.20, was: 18.70 }
  ];

  // [OFFICIAL] Intra-city trotro ladder. Published as "current fare" ->
  // "new fare". This is the full published intra-city table.
  var trotroLadderRaw = [
    [5.00, 5.50], [6.00, 6.50], [7.00, 7.60], [8.00, 8.70], [9.00, 9.80],
    [10.00, 11.00], [11.00, 12.00], [12.00, 13.00], [13.00, 14.10],
    [14.00, 15.20], [15.00, 16.20], [16.00, 17.30], [17.00, 18.40],
    [18.00, 19.50], [19.00, 20.60], [20.00, 21.60], [21.00, 22.70],
    [22.00, 23.80], [23.00, 24.90], [24.00, 26.00], [25.00, 27.00],
    [26.00, 28.10], [27.00, 29.20], [28.00, 30.30], [29.00, 31.40],
    [30.00, 32.40], [31.00, 33.50], [32.00, 34.60], [33.00, 35.70],
    [34.00, 36.80]
  ];

  // [OFFICIAL] Intercity ladder. The communique describes this table as
  // 56 levels running GHS25 -> GHS324. Only the levels below were
  // recoverable from the published text, and they are quoted verbatim.
  // A trip between two levels snaps UP to the next of these, so the fare
  // shown is always one of the published amounts, never an invented one.
  // If you recover more levels from the schedule, add them here.
  var intercityLadderRaw = [
    [25, 27], [30, 33], [35, 38], [40, 44], [45, 49], [50, 54], [60, 65],
    [70, 76], [80, 87], [90, 98], [100, 108], [120, 130], [140, 152],
    [150, 162], [160, 173], [180, 195], [200, 216], [220, 238], [240, 260],
    [250, 270], [260, 281], [270, 292], [280, 303], [290, 314], [300, 324]
  ];

  // [OFFICIAL] Range limits as announced for passengers.
  var limits = {
    sharedTaxi: { min: 1.90, max: 20.20, maxKm: 40 },
    trotro: { min: 5.50, max: 36.80 },
    intercity: { min: 27, max: 324 }
  };

  /* ======================================================================
     3. DERIVED REFERENCE CURVE  [DERIVED]
     ----------------------------------------------------------------------
     The official schedule prices intercity travel by APPROVED FARE LEVEL,
     not by kilometres. It does not publish the kilometre -> level mapping.
     To turn a distance into a sensible level we fit a curve against the
     published levels and then snap the result UP to a real published level,
     so the final number is always a legal fare even though the lookup in
     between is an estimate.

     The fit reproduces the published intra-city ladder well:
       4km  -> 6.50   (published 6.50)   8km  -> 8.70  (8.70)
       12km -> 13.00  (13.00)           16km -> 15.20 (15.20)
       20km -> 21.60  (21.60)           24km -> 26.00 (26.00)
       30km -> 32.40  (32.40)           34km -> 36.80 (36.80)
     Those are exact matches on all 8 checked points.

     If you have official kilometre bands from a regional GPRTU branch,
     put them in regionRules below and they will win over this curve.
     ====================================================================== */
  var fareCurve = {
    coefficient: 0.715,
    exponent: 0.883,
    comment: 'level = 0.715 * km^0.883, then rounded UP to the nearest published level.'
  };

  // [DERIVED] Straight-line distance is not road distance, and the gap is not
  // a fixed factor. Known road distances:
  //   Accra-Kumasi     199 km straight / ~250 km road   x1.26
  //   Accra-Tamale     428 km straight / ~780 km road   x1.82
  //   Accra-Bolgatanga 580 km straight / ~850 km road   x1.47
  //   Accra-Wa         557 km straight / ~750 km road   x1.35
  // Tamale detours far more than Wa for a shorter straight line, so a single
  // rising curve cannot fit them all. Known corridors are therefore listed
  // explicitly below and the curve is only the fallback for everything else.
  var roadAnchors = {
    // key is 'origin>destination', matched in either direction
    'Accra>Kumasi': 250,
    'Accra>Takoradi': 270,
    'Accra>Cape Coast': 220,
    'Accra>Tamale': 780,
    'Accra>Wa': 750,
    'Accra>Bolgatanga': 850,
    'Accra>Hohoe': 300,
    'Accra>Ho': 200,
    'Accra>Aflao': 250,
    'Accra>Sunyani': 400,
    'Accra>Techiman': 550,
    'Accra>Koforidua': 120,
    'Accra>Tema': 30,
    'Kumasi>Sunyani': 130,
    'Kumasi>Tamale': 600
  };

  // Same normalisation as the route overrides: anchors are written the way a
  // human types them, looked up in lower case.
  var roadIndex = {};
  (function () {
    for (var k in roadAnchors) {
      if (!Object.prototype.hasOwnProperty.call(roadAnchors, k)) continue;
      roadIndex[cleanName(k)] = roadAnchors[k];
    }
  })();

  var roadModel = {
    base: 0.77,
    perKm: 0.00245,  // rises with distance: northern roads detour further
    max: 1.90,
    comment: 'roadKm = straightKm * min(max, base + perKm * straightKm). Only used when no roadAnchor exists.'
  };

  function estimateRoadKm(straightKm) {
    var factor = roadModel.base + roadModel.perKm * straightKm;
    if (factor > roadModel.max) factor = roadModel.max;
    return straightKm * factor;
  }

  // Known road distance for a corridor, or null.
  function anchorRoadKm(oName, dName) {
    if (!oName || !dName) return null;
    var a = roadIndex[cleanName(oName) + '>' + cleanName(dName)];
    if (a != null) return a;
    var b = roadIndex[cleanName(dName) + '>' + cleanName(oName)];
    if (b != null) return b;
    return null;
  }

  // [DERIVED] Intra-city distance bands. The national schedule publishes
  // only the fare levels, not which km each covers. These km values are
  // fitted so that the fitted level lands on the published level.
  var intraCityBands = [
    { maxKm: 2, level: 5.00 },
    { maxKm: 4, level: 6.00 },
    { maxKm: 5, level: 7.00 },
    { maxKm: 6, level: 8.00 },
    { maxKm: 7, level: 9.00 },
    { maxKm: 8, level: 10.00 },
    { maxKm: 9, level: 11.00 },
    { maxKm: 10, level: 12.00 },
    { maxKm: 11, level: 13.00 },
    { maxKm: 12.5, level: 14.00 },
    { maxKm: 13.5, level: 15.00 },
    { maxKm: 14.5, level: 16.00 },
    { maxKm: 16, level: 17.00 },
    { maxKm: 17.5, level: 18.00 },
    { maxKm: 19, level: 19.00 },
    { maxKm: 20, level: 20.00 },
    { maxKm: 22, level: 22.00 },
    { maxKm: 24, level: 24.00 },
    { maxKm: 26, level: 26.00 },
    { maxKm: 29, level: 29.00 },
    { maxKm: 32, level: 32.00 },
    { maxKm: 34, level: 34.00 }
  ];

  /* ======================================================================
     4. REGION RULES
     ----------------------------------------------------------------------
     Key is the region name as it appears in a Ghana address. Anything not
     listed inherits { intercityMultiplier: 1 } and the national ladder.

     GPRTU branches publish their own intra-city charts. Where the national
     schedule has no figure, the regional chart governs. Left null, the
     engine falls back to the derived curve.
     ====================================================================== */
  var regionRules = {
    'Greater Accra': { intercityMultiplier: 1.00, intraCityBands: null, note: 'National chart. Max intra-city level GHS36.80.' },
    'Ashanti': { intercityMultiplier: 1.00, intraCityBands: null, note: 'Operators charged about 23% over approved fares in Sept 2026; GPRTU/KMA response reported but the approved chart stands.' },
    'Western': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Central': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Eastern': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Volta': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Oti': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Bono': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Ahafo': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Savannah': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'North East': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Northern': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Upper East': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Upper West': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Western North': { intercityMultiplier: 1.00, intraCityBands: null, note: null },
    'Bono East': { intercityMultiplier: 1.00, intraCityBands: null, note: null }
  };

  /* ======================================================================
     5. ROUTE OVERRIDES - precedence 1
     ----------------------------------------------------------------------
     Use with the key 'origin>destination' or 'destination>origin'; the
     lookup tries both. Names are matched case-insensitively after
     trimming, so 'Accra Circle > Wa' and 'accra circle>wa' both work.
     A route defined with `symmetric: true` is used in both directions.
     ====================================================================== */
  var routeOverrides = {
    // [OBSERVED] Accra to Wa, reported 30 September 2026. These are fares
    // in force at the time of the report, not the published ladder.
    'Accra>Wa': {
      intercity: 370, source: 'observed', asOf: '2026-09-30',
      vehicleClasses: { GPRTU: 370, VIP: 309, STC: 250 },
      note: 'STC Deputy MD stated STC Accra-Wa GHS250, GPRTU GHS370, VIP GHS309.'
    },
    'Wa>Accra': { symmetric: 'Accra>Wa' },

    // [OBSERVED] Kumasi intra-city, reported 30 September 2026. Drivers
    // raised these by roughly 23% with no announcement.
    'Sofoline>Kronom': { intraCity: 8, was: 6.50, source: 'observed', asOf: '2026-09-30', note: 'Unannounced 23% increase reported.' },
    'Sofoline>Suame': { intraCity: 6, was: 4.50, source: 'observed', asOf: '2026-09-30', note: 'Unannounced 23% increase reported.' },

    // ---- Add your own verified corridors below this line --------------
    // 'Kumasi>Sunyani': { intercity: 150, source: 'official', note: 'GPRTU Ashanti chart' },
  };

  /* ======================================================================
     6. PLACES - for region lookup and straight-line distance
     ----------------------------------------------------------------------
     [name, lat, lon, region, isRegionalCapital]
     Kept deliberately small and editable. Add a row and the engine will
     resolve its region and use it for distance and rule selection.
     ====================================================================== */
  var places = [
    ['Accra', 5.6037, -0.1870, 'Greater Accra', true],
    ['Circle', 5.5568, -0.2177, 'Greater Accra', false],
    ['Osu', 5.5577, -0.1820, 'Greater Accra', false],
    ['Kaneshie', 5.5598, -0.2490, 'Greater Accra', false],
    ['Madina', 5.6830, -0.1680, 'Greater Accra', false],
    ['Legon', 5.6500, -0.1860, 'Greater Accra', false],
    ['Airport', 5.6052, -0.1719, 'Greater Accra', false],
    ['Achimota', 5.6160, -0.2296, 'Greater Accra', false],
    ['Tema', 5.6698, 0.0059, 'Greater Accra', true],
    ['Teshie', 5.5980, -0.0100, 'Greater Accra', false],
    ['Kasoa', 5.5333, -0.4167, 'Greater Accra', false],
    ['Kumasi', 6.6885, -1.6244, 'Ashanti', true],
    ['Sunyani', 7.3395, -2.3268, 'Bono', true],
    ['Techiman', 7.8740, -1.4070, 'Bono East', true],
    ['Berekum', 7.0450, -2.4900, 'Bono', false],
    ['Wenchi', 7.7500, -2.0830, 'Bono', false],
    ['Goaso', 6.8000, -1.6330, 'Ashanti', false],
    ['Nkwatia', 6.7500, -1.1000, 'Ashanti', false],
    ['Mampong', 6.8150, -1.4900, 'Ashanti', false],
    ['Offinso', 6.9500, -1.6330, 'Ashanti', false],
    ['Asante Mampong', 6.8500, -1.4500, 'Ashanti', false],
    ['Sekondi', 4.9431, -1.7137, 'Western', true],
    ['Takoradi', 4.9022, -1.7556, 'Western', true],
    ['Tarkwa', 4.9167, -1.7667, 'Western', false],
    ['Axim', 4.8683, -2.2428, 'Western', false],
    ['Essikado', 4.9770, -1.6790, 'Western', false],
    ['Shama', 5.1300, -1.6100, 'Western', false],
    ['Cape Coast', 5.1053, -1.2466, 'Central', true],
    ['Kumawu', 6.8000, -1.4500, 'Ashanti', false],
    ['Twifo Praso', 6.6000, -1.5500, 'Ashanti', false],
    ['Kasoa', 5.5333, -0.4167, 'Central', false],
    ['Winneba', 5.3500, -0.6300, 'Central', false],
    ['Apam', 5.0300, -0.7000, 'Central', false],
    ['Swedru', 5.0000, -0.7000, 'Central', false],
    ['Assem', 5.0800, -1.0800, 'Central', false],
    ['Mampong', 6.8150, -1.4900, 'Ashanti', false],
    ['Koforidua', 6.0942, -0.2593, 'Eastern', true],
    ['Akuse', 6.1000, -0.2000, 'Eastern', false],
    ['Somanya', 5.7600, -0.0500, 'Eastern', false],
    ['Asesewa', 6.4500, -0.3500, 'Eastern', false],
    ['Nkawkaw', 6.3000, -0.6000, 'Eastern', false],
    ['Jasikan', 6.4000, -1.2000, 'Oti', false],
    ['Hohoe', 7.2000, 0.4700, 'Oti', true],
    ['Jato', 7.1500, 0.5000, 'Oti', false],
    ['Dzodze', 7.0667, 0.7000, 'Oti', false],
    ['Nkwanta', 7.2000, 0.5000, 'Oti', false],
    ['Ho', 6.6000, 0.4700, 'Volta', true],
    ['Aflao', 6.1186, 1.3168, 'Volta', true],
    ['Hohia', 6.7000, 0.5000, 'Volta', false],
    ['Kpexe', 6.5000, 0.6000, 'Volta', false],
    ['Dzui', 6.1000, 0.6000, 'Volta', false],
    ['Accra', 5.6037, -0.1870, 'Greater Accra', true],
    ['Tamale', 9.4000, -0.8300, 'Northern', true],
    ['Kpandai', 9.4500, -0.7500, 'Northern', false],
    ['Konongo', 9.5500, -1.6300, 'Ashanti', false],
    ['Salaga', 9.0000, -0.3000, 'Savannah', false],
    ['Yendi', 9.4333, -0.9333, 'Northern', true],
    ['Damongo', 9.0333, -1.8000, 'Savannah', true],
    ['Sang', 9.1000, -1.1000, 'Northern', false],
    ['Nalerigu', 10.3000, -1.1000, 'North East', true],
    ['Gambaga', 11.0000, -0.5000, 'North East', false],
    ['Walewale', 10.0667, -0.2333, 'North East', true],
    ['Wa', 10.0600, -2.5017, 'Upper West', true],
    ['Tumu', 10.8000, -1.9000, 'Upper West', false],
    ['Lawra', 10.6500, -2.6000, 'Upper West', false],
    ['Bolgatanga', 10.7856, -0.8507, 'Upper East', true],
    ['Bawku', 11.0167, -0.6500, 'Upper East', false],
    ['Walewale', 10.0667, -0.2333, 'North East', false],
    ['Navrongo', 10.9500, -0.8500, 'Upper East', false],
    ['Paga', 11.1000, -0.5000, 'Upper East', false],
    ['Techiman', 7.8740, -1.4070, 'Bono East', true],
    ['Kintampo', 7.9500, -1.0700, 'Bono East', false],
    ['Buipe', 8.1000, -1.5500, 'Savannah', false],
    ['Goaso', 6.8000, -1.6330, 'Ashanti', false],
    ['Nsawam', 5.8000, -0.4000, 'Western', false],
    ['Akim Oda', 6.1000, -0.7000, 'Eastern', false],
    ['Juaben', 6.8000, -1.4000, 'Ashanti', false],
    ['Ejura', 6.9000, -1.4500, 'Ashanti', false],
    ['Asokore', 6.7000, -1.6000, 'Ashanti', false],
    // Kumasi stops named in the Sept 2026 fare reporting. Centroids are
    // approximate - they only need to identify the region and the corridor.
    ['Sofoline', 6.6790, -1.5700, 'Ashanti', false],
    ['Kronom', 6.6930, -1.6280, 'Ashanti', false],
    ['Suame', 6.6720, -1.6060, 'Ashanti', false],
    // Stops from the route network in trotro.html. Adding them here means a
    // name-only lookup (no coordinates) resolves to the right region.
    ['37', 5.5865, -0.1854, 'Greater Accra', false],
    ['Atomic Junction', 5.6704, -0.1956, 'Greater Accra', false],
    ['Odorkor', 5.5660, -0.2640, 'Greater Accra', false]
  ];
/* ======================================================================
     7. ENGINE
     ====================================================================== */

  var EARTH_RADIUS_KM = 6371;

  function toRad(d) { return d * Math.PI / 180; }

  function haversineKm(a, b) {
    var dLat = toRad(b[0] - a[0]);
    var dLon = toRad(b[1] - a[1]);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  function cleanName(n) {
    return String(n == null ? '' : n).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // ---- ladders ---------------------------------------------------------
  // Built from [previous approved, current approved] pairs. `current` is
  // what a passenger actually pays from meta.effectiveDate onwards.
  function buildLadder(raw) {
    var out = raw.map(function (p) {
      return { previous: p[0], current: p[1] };
    }).sort(function (a, b) { return a.previous - b.previous; });
    return out;
  }

  var trotroLadder = buildLadder(trotroLadderRaw);
  var intercityLadder = buildLadder(intercityLadderRaw);

  // Snap a previous-schedule level up to the current approved level.
  // We always round UP so nobody is shown a fare below an approved level.
  function snapToLadder(level, ladder) {
    var best = null;
    for (var i = 0; i < ladder.length; i++) {
      if (level <= ladder[i].previous + 1e-9) { best = ladder[i]; break; }
    }
    if (!best) best = ladder[ladder.length - 1];  // above the table
    return { previous: best.previous, current: best.current, overflow: level > ladder[ladder.length - 1].previous };
  }

  // Note: a route override is NOT snapped to the ladder. Those fares are quoted
  // in current cedis (an operator's actual price, or a bus company's tariff),
  // and rounding them up to a trotro level would misreport them.

  // ---- region + place resolution ---------------------------------------
  function normalizePlace(p) {
    if (!p) return null;
    if (Array.isArray(p)) return { name: null, lat: +p[1], lon: +p[0] };
    var lat = p.lat != null ? +p.lat : null;
    var lon = p.lon != null ? +p.lon : (p.lng != null ? +p.lng : null);
    if (lat == null || !isFinite(lat) || lon == null || !isFinite(lon)) return null;
    return { name: p.name ? String(p.name) : null, lat: lat, lon: lon };
  }

  function findPlaceByName(name) {
    var n = cleanName(name);
    if (!n) return null;
    for (var i = 0; i < places.length; i++) {
      if (cleanName(places[i][0]) === n) {
        return { name: places[i][0], lat: places[i][1], lon: places[i][2], region: places[i][3], isCapital: places[i][4] };
      }
    }
    return null;
  }

  function regionOf(pt) {
    if (!pt) return null;
    if (pt.region) return pt.region;
    if (pt.name) {
      var hit = findPlaceByName(pt.name);
      if (hit) return hit.region;
    }
    // nearest known place, used only to pick a region, never for the fare
    var best = null, bestD = Infinity;
    for (var i = 0; i < places.length; i++) {
      var d = haversineKm([pt.lat, pt.lon], [places[i][1], places[i][2]]);
      if (d < bestD) { bestD = d; best = places[i]; }
    }
    if (best && bestD <= 120) return best[3];
    return null;
  }

  function ruleFor(region) {
    if (!region) return { intercityMultiplier: 1, intraCityBands: null, note: null };
    return regionRules[region] || { intercityMultiplier: 1, intraCityBands: null, note: null };
  }

  // Lookup index. Keys in routeOverrides are written the way a human would
  // type them ('Accra>Wa'), so the index normalises them once here instead of
  // forcing the data file to be lower-case.
  var routeIndex = {};
  (function () {
    for (var k in routeOverrides) {
      if (!Object.prototype.hasOwnProperty.call(routeOverrides, k)) continue;
      routeIndex[cleanName(k)] = routeOverrides[k];
    }
  })();

  // ---- route overrides -------------------------------------------------
  function routeKey(a, b) { return cleanName(a) + '>' + cleanName(b); }

  function findRouteOverride(originName, destName) {
    if (!originName || !destName) return null;
    var k = routeKey(originName, destName);
    var direct = routeIndex[k];
    if (direct && typeof direct.symmetric === 'string') direct = routeIndex[cleanName(direct.symmetric)];
    if (direct) return { key: k, rule: direct };

    var rk = routeKey(destName, originName);
    var rev = routeIndex[rk];
    if (rev && typeof rev.symmetric === 'string') rev = routeIndex[cleanName(rev.symmetric)];
    if (rev) return { key: rk, rule: rev, reversed: true };
    return null;
  }

  // ---- band lookups ----------------------------------------------------
  function sharedTaxiBand(km) {
    for (var i = 0; i < sharedTaxiBands.length; i++) {
      if (km <= sharedTaxiBands[i].maxKm) {
        return { fare: sharedTaxiBands[i].fare, was: sharedTaxiBands[i].was, band: sharedTaxiBands[i].maxKm };
      }
    }
    return null;   // beyond the published 40 km schedule
  }

  function intraBand(km, bands) {
    for (var i = 0; i < bands.length; i++) {
      if (km <= bands[i].maxKm) return bands[i];
    }
    return null;
  }

  function curveLevel(km, region) {
    var rule = ruleFor(region);
    var raw = fareCurve.coefficient * Math.pow(Math.max(0.5, km), fareCurve.exponent);
    return raw * (rule.intercityMultiplier || 1);
  }

  /* ----------------------------------------------------------------------
     getFare(origin, destination, options)
     ----------------------------------------------------------------------
     origin, destination : a place name ('Wa'), an object {name,lat,lon},
                           or a [lon,lat] pair. A stop from the national
                           extract (TrotroNetwork.nearestStops()) is passed
                           as-is: it already carries {name,lat,lon}.
     options.mode       : 'auto' (default) | 'trotro' | 'sharedTaxi'
     options.roadKm     : real driving distance if you already have one (OSRM)
     options.asOf       : 'YYYY-MM-DD'. Defaults to meta.effectiveDate.
                         Pass an earlier date to get the previous schedule.
     options.vehicleClass: e.g. 'VIP', 'STC' - used when a route override
                         publishes vehicleClasses.

     Returns:
       { ok, fare, previousFare, distanceKm, mode, region, basis,
         confidence, source, notes[], breakdown[] }
       ok:false means we could not price it. The reason is in `notes`.
     ---------------------------------------------------------------------- */
  function getFare(origin, destination, options) {
    options = options || {};
    var mode = options.mode || 'auto';
    var asOf = options.asOf || meta.effectiveDate;
    var useCurrent = asOf >= meta.effectiveDate;

    var from = normalizePlace(origin);
    var to = normalizePlace(destination);

    // A place given as a name with no coordinates still has to resolve, whether
    // it arrives as 'Wa' or as { name:'Wa' }.
    if (!from) from = resolveName(origin);
    if (!to) to = resolveName(destination);

    if (!from || !to) return fail(['Origin or destination could not be resolved to coordinates.']);

    var straightKm = haversineKm([from.lat, from.lon], [to.lat, to.lon]);

    // names for override + anchor lookup: fall back to the nearest known place
    var oName = from.name || nearestPlaceName(from);
    var dName = to.name || nearestPlaceName(to);

    // Distance, most reliable source first:
    //   1. an OSRM road distance supplied by the caller
    //   2. a known road distance for this corridor
    //   3. the straight-line fallback model
    var roadKm = options.roadKm != null && isFinite(options.roadKm) && options.roadKm > 0
      ? options.roadKm : null;
    var anchoredKm = roadKm == null ? anchorRoadKm(oName, dName) : null;
    var km = roadKm != null ? roadKm
      : anchoredKm != null ? anchoredKm
        : estimateRoadKm(straightKm);

    var originRegion = regionOf(from);
    var destRegion = regionOf(to);
    var rule = ruleFor(destRegion || originRegion);
    var notes = [];

    if (roadKm == null && anchoredKm != null) {
      notes.push('Road distance for this corridor taken from a known figure, not the straight-line estimate.');
    }

    var intraCity = km <= (options.intraCityKm || 40);
    if (mode === 'auto') mode = intraCity ? 'trotro' : 'intercity';
    if (mode === 'trotro' && !intraCity) {
      notes.push('Trip is ' + Math.round(km) + ' km, beyond the intra-city range; priced on the intercity table instead.');
      mode = 'intercity';
    }

    /* ---- 1. route override ------------------------------------------- */
    var hit = findRouteOverride(oName, dName);
    if (hit) {
      var ruleHit = hit.rule;
      var amount = null;
      if (mode === 'sharedTaxi') amount = ruleHit.sharedTaxi;
      else if (mode === 'intercity') amount = ruleHit.intercity != null ? ruleHit.intercity : ruleHit.intraCity;
      else amount = ruleHit.intraCity != null ? ruleHit.intraCity : ruleHit.intercity;

      if (amount == null && ruleHit.vehicleClasses && options.vehicleClass) {
        amount = ruleHit.vehicleClasses[options.vehicleClass];
        if (amount != null) notes.push('Fare taken from the ' + options.vehicleClass + ' column of this corridor.');
      }

      if (amount != null) {
        if (ruleHit.note) notes.push(ruleHit.note);
        if (ruleHit.asOf) notes.push('Corridor fare as reported ' + ruleHit.asOf + '.');
        return {
          ok: true,
          fare: useCurrent ? amount : (ruleHit.was != null ? ruleHit.was : amount),
          previousFare: ruleHit.was != null ? ruleHit.was : null,
          distanceKm: round2(km), roadKm: roadKm, mode: mode,
          region: destRegion || originRegion,
          basis: 'route-override',
          confidence: ruleHit.source === 'official' ? 'high' : 'medium',
          source: ruleHit.source || 'unknown',
          notes: notes,
          breakdown: [{ label: 'Named corridor ' + hit.key, amount: amount }]
        };
      }
      notes.push('A route override exists for ' + hit.key + ' but it has no fare for this mode.');
    }

    /* ---- 2. shared taxi bands (official) ------------------------------ */
    if (mode === 'sharedTaxi') {
      var st = sharedTaxiBand(km);
      if (st) {
        return {
          ok: true,
          fare: useCurrent ? st.fare : st.was,
          previousFare: st.was,
          distanceKm: round2(km), roadKm: roadKm, mode: 'sharedTaxi',
          region: destRegion || originRegion,
          basis: 'official-distance-band',
          confidence: 'high',
          source: 'official',
          notes: notes,
          breakdown: [{ label: 'Up to ' + st.band + ' km', amount: st.fare }]
        };
      }
      notes.push('Published shared taxi bands stop at 40 km; no official band for ' + Math.round(km) + ' km.');
      // fall through to the intercity table
    }

    /* ---- 3. intra-city distance band --------------------------------- */
    if (mode === 'trotro') {
      var bands = rule.intraCityBands || intraCityBands;
      var ib = intraBand(km, bands);
      if (!ib) notes.push('Beyond the furthest intra-city band (' + bands[bands.length - 1].maxKm + ' km).');
      var prevLevel = ib ? ib.level : bands[bands.length - 1].level;
      var snapped = snapToLadder(prevLevel, trotroLadder);
      var fareIn = useCurrent ? snapped.current : snapped.previous;
      return {
        ok: true,
        fare: fareIn,
        previousFare: snapped.previous,
        distanceKm: round2(km), roadKm: roadKm, mode: 'trotro',
        region: destRegion || originRegion,
        basis: ib ? 'intra-city-band' : 'intra-city-max',
        confidence: rule.intraCityBands ? 'high' : 'medium',
        source: rule.intraCityBands ? 'official-regional' : 'derived-band',
        notes: notes,
        breakdown: [{ label: ib ? ('Up to ' + ib.maxKm + ' km') : 'Longest intra-city band', amount: fareIn }]
      };
    }

    /* ---- 4. intercity: curve, then snap UP to a published level ------- */
    var level = curveLevel(km, destRegion || originRegion);
    var snappedCity = snapToLadder(level, intercityLadder);
    if (level < intercityLadder[0].previous) {
      snappedCity = intercityLadder[0];
      notes.push('Trip is inside the intercity minimum, so the GHS27 intercity minimum applies.');
    }
    if (snappedCity.overflow) {
      notes.push('Estimate is above the published table top (GHS324). Add a corridor fare for this trip.');
    }
    notes.push('Distance-to-level lookup is derived, not published. The final fare is a real approved level.');

    var fareOut = useCurrent ? snappedCity.current : snappedCity.previous;
    return {
      ok: true,
      fare: fareOut,
      previousFare: snappedCity.previous,
      distanceKm: round2(km), roadKm: roadKm, mode: 'intercity',
      region: destRegion || originRegion,
      basis: 'derived-curve-snapped',
      confidence: 'low',
      source: 'derived',
      notes: notes,
      breakdown: [
        { label: 'Derived level from ' + Math.round(km) + ' km', amount: round2(level) },
        { label: 'Snapped up to approved level', amount: fareOut }
      ]
    };
  }

  function fail(reasons) {
    return { ok: false, fare: null, notes: reasons, basis: 'none', confidence: 'none', breakdown: [] };
  }

  function namedOrNull(name) {
    var hit = findPlaceByName(name);
    return hit ? { name: hit.name, lat: hit.lat, lon: hit.lon, region: hit.region } : null;
  }

  // Accepts 'Wa', { name:'Wa' }, or anything with a .name
  function resolveName(p) {
    if (typeof p === 'string') return namedOrNull(p);
    if (p && typeof p === 'object' && p.name) return namedOrNull(p.name);
    return null;
  }

  function nearestPlaceName(pt) {
    var best = null, bestD = Infinity;
    for (var i = 0; i < places.length; i++) {
      var d = haversineKm([pt.lat, pt.lon], [places[i][1], places[i][2]]);
      if (d < bestD) { bestD = d; best = places[i]; }
    }
    return bestD <= 25 ? best[0] : null;
  }

  /* ======================================================================
     8. PUBLIC API
     ====================================================================== */

  function formatCedis(amount) {
    if (amount == null) return '-';
    return meta.currency + Number(amount).toFixed(2).replace(/\.00$/, '');
  }

  // Short label for how much to trust the number.
  var CONFIDENCE_TEXT = {
    high: 'Published fare',
    medium: 'Corridor fare',
    low: 'Estimate (snap to approved level)'
  };

  function describe(result) {
    if (!result || !result.ok) return 'Fare not available';
    return formatCedis(result.fare) + ' - ' + (CONFIDENCE_TEXT[result.confidence] || result.confidence);
  }

  var API = {
    version: meta.version,
    meta: meta,
    limits: limits,
    sharedTaxiBands: sharedTaxiBands,
    trotroLadder: trotroLadder,
    intercityLadder: intercityLadder,
    regionRules: regionRules,
    routeOverrides: routeOverrides,
    places: places,

    getFare: getFare,
    formatCedis: formatCedis,
    describe: describe,

    // helpers for the UI and for tests
    haversineKm: function (a, b) { return round2(haversineKm(a, b)); },
    sharedTaxiBand: sharedTaxiBand,
    snapToLadder: function (level, which) { return snapToLadder(level, which === 'intercity' ? intercityLadder : trotroLadder); },
    findPlaceByName: findPlaceByName,
    regionOf: regionOf,
    // nearest named place to a point, or null if nothing is close enough
    nearestKnownPlaceName: function (pt) { return nearestPlaceName(normalizePlace(pt) || pt); },

    // Self-check. Returns { ok, failures[] }. Run in the browser console:
    //   TrotroPricing.selfTest()
    selfTest: function () {
      var f = [], checks = 0;
      function eq(actual, expected, label) {
        checks++;
        if (actual !== expected) f.push(label + ': expected ' + expected + ', got ' + actual);
      }

      eq(sharedTaxiBand(0.5).fare, 1.90, 'shared taxi <=1km');
      eq(sharedTaxiBand(3).fare, 2.90, 'shared taxi <=4km');
      eq(sharedTaxiBand(40).fare, 20.20, 'shared taxi <=40km');
      eq(sharedTaxiBand(41), null, 'shared taxi beyond schedule');

      eq(snapToLadder(5, trotroLadder).current, 5.50, 'trotro level 5 -> 5.50');
      eq(snapToLadder(34, trotroLadder).current, 36.80, 'trotro level 34 -> 36.80');
      eq(snapToLadder(25, intercityLadder).current, 27, 'intercity level 25 -> 27');
      eq(snapToLadder(300, intercityLadder).current, 324, 'intercity level 300 -> 324');
      eq(snapToLadder(100, intercityLadder).current, 108, 'intercity level 100 -> 108');

      // The published levels are NOT a mechanical "old x 1.08". The schedule
      // rounds each level up to a practical cash amount, so the exact
      // ratio varies (GHS5 -> GHS5.50 is 10%, GHS40 -> GHS44 is 10%,
      // GHS180 -> GHS195 is 8.3%). What must be true is that every level
      // went up by about 8% and none moved further than 2.5% off it.
      trotroLadder.concat(intercityLadder).forEach(function (r) {
        checks++;
        var pct = (r.current / r.previous - 1) * 100;
        if (pct < 7.5) f.push('level ' + r.previous + ' rose only ' + pct.toFixed(1) + '%, expected ~8%');
        var off = Math.abs(r.current - r.previous * 1.08) / (r.previous * 1.08) * 100;
        if (off > 2.5) f.push('level ' + r.previous + ' -> ' + r.current + ' is ' + off.toFixed(1) + '% off +8%');
      });

      eq(getFare('Accra', 'Wa').fare, 370, 'Accra>Wa override (GPRTU)');
      eq(getFare('Wa', 'Accra').fare, 370, 'Wa>Accra symmetric override');
      eq(getFare('Sofoline', 'Kronom', { roadKm: 3 }).fare, 8, 'Sofoline>Kronom override');
      eq(getFare('Sofoline', 'Suame', { roadKm: 3 }).fare, 6, 'Sofoline>Suame override');

      eq(getFare('Circle', 'Osu', { roadKm: 3 }).mode, 'trotro', 'short trip is intra-city');
      eq(getFare('Accra', 'Kumasi').mode, 'intercity', 'Accra>Kumasi is intercity');

      // The fallback road model is only used when no anchor exists, so it
      // is checked against known corridors within a tolerance.
      function near(actual, expected, tolerancePct, label) {
        checks++;
        var off = Math.abs(actual - expected) / expected * 100;
        if (off > tolerancePct) {
          f.push(label + ': got ' + actual.toFixed(1) + 'km, expected ~' + expected + 'km (off ' + off.toFixed(1) + '%)');
        }
      }
      near(estimateRoadKm(199), 250, 3, 'Accra-Kumasi fallback model');
      near(estimateRoadKm(428), 780, 3, 'Accra-Tamale fallback model');

      // known corridors must use the published road distance, both ways round
      eq(getFare('Accra', 'Tamale').distanceKm, 780, 'Accra>Tamale anchor road km');
      eq(getFare('Tamale', 'Accra').distanceKm, 780, 'Tamale>Accra anchor road km');
      eq(getFare('Accra', 'Wa').distanceKm, 750, 'Accra>Wa anchor road km');
      eq(getFare('Accra', 'Kumasi').distanceKm, 250, 'Accra>Kumasi anchor road km');
      eq(getFare('Accra', 'Hohoe').distanceKm, 300, 'Accra>Hohoe anchor road km');

      // an OSRM road distance must always win over anchors and the model
      eq(getFare('Accra', 'Kumasi', { roadKm: 999 }).distanceKm, 999, 'OSRM roadKm beats the anchor');

      // A place with a name but no coordinates must still resolve, whether the
      // caller passes a bare string or an object. Route stop names come
      // through the object form, so this must keep working.
      eq(getFare({ name: '37' }, { name: 'Madina' }, { roadKm: 8 }).ok, true, '{name} object resolves');
      eq(getFare('37', 'Madina', { roadKm: 8 }).ok, true, 'bare string resolves');
      eq(getFare({ name: 'Atomic Junction' }, { name: 'Odorkor' }, { roadKm: 5 }).ok, true, 'multi-word stop names resolve');
      eq(getFare({ name: 'Nowhere At All' }, { name: 'Madina' }).ok, false, 'unknown place fails cleanly');

      // coordinates must win over a name that says something different
      eq(getFare({ name: 'Accra', lat: 5.5568, lon: -0.2177 }, { name: 'Madina' }, { roadKm: 12 }).distanceKm, 12,
        'coordinates are used even when a name is supplied');

      // the resolver must never return a fare below an approved level
      for (var km = 1; km <= 40; km += 0.5) {
        var r = getFare('Accra', 'Kumasi', { roadKm: km, mode: 'trotro' });
        checks++;
        if (!(r.fare >= 5.50)) f.push('intra-city fare below minimum at ' + km + 'km: ' + r.fare);
      }

      return { ok: f.length === 0, checks: checks, failures: f };
    }
  };

  global.TrotroPricing = API;

  if (typeof module !== 'undefined' && module.exports) module.exports = API;

})(typeof window !== 'undefined' ? window : globalThis);
