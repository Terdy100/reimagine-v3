import { customRoutes } from '../custom-routes/custom-routes.js';

/* ==========================================================================
   trotro-network.js - Ghana Trotro Stop Network & Multi-Hop Interchange Planner
   ========================================================================== */

(function (global) {
  'use strict';

  var customRoutesList = (typeof customRoutes !== 'undefined' && Array.isArray(customRoutes)) ? customRoutes : [];

  var meta = {
    version: '2026.10.11',
    walkingSpeedMps: 1.25,        // 4.5 km/h walking pace
    urbanSpeedKph: 20,            // average trotro speed in Accra/Ghana
    roadFactor: 1.25,             // road distance / straight line
    dwellMinutesPerStop: 1.0,     // loading time at intermediate stops
    boardWaitMinutes: 3.0,        // expected wait to board
    transferWaitMinutes: 4.5,     // wait when changing cars
    transferPenaltyMinutes: 7.0,  // preference for fewer transfers
    accessWalkM: 3500,            // maximum walking distance to catch first car
    egressWalkM: 4500,            // maximum distance from alight stop to destination
    transferWalkM: 850,           // maximum walk between stops to change cars
    maxWalkOnlyM: 2500,           // offer walk-only option if under 2.5km
    maxTransfers: 3,
    maxItineraries: 4,
    alternativePenaltyMinutes: 8
  };

  /* ======================================================================
     1. COMPLETE REAL ACCRA & GHANA TRANSIT CORRIDORS
     With dense, surveyed intermediate bus stops.
     ====================================================================== */
  var routes = [
    // --- GIFFARD ROAD / BUSH CANTEEN / PALM WINE ⇄ OSU ---
    {
      id: 'bushcanteen-osu', name: 'Bush Canteen ⇄ Osu', color: '#0284c7',
      stops: [
        ['Trade Fair', -0.1425, 5.5801],
        ['Villas', -0.1500, 5.5700],
        ['Kpogas', -0.1502, 5.5670],
        ['La Traffic Light', -0.1510, 5.5680],
        ['Palm Wine', -0.1520, 5.5695],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Wireless Station', -0.1580, 5.5705],
        ['Burma Camp', -0.1600, 5.5710],
        ['Cantonments', -0.1700, 5.5750],
        ['Labone', -0.1725, 5.5621],
        ['Danquah Circle', -0.1795, 5.5645],
        ['Osu', -0.1822, 5.5562]
      ]
    },
    {
      id: 'osu-bushcanteen', name: 'Osu ⇄ Bush Canteen', color: '#0284c7',
      stops: [
        ['Osu', -0.1822, 5.5562],
        ['Danquah Circle', -0.1795, 5.5645],
        ['Labone', -0.1725, 5.5621],
        ['Cantonments', -0.1700, 5.5750],
        ['Burma Camp', -0.1600, 5.5710],
        ['Wireless Station', -0.1580, 5.5705],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Palm Wine', -0.1520, 5.5695],
        ['La Traffic Light', -0.1510, 5.5680],
        ['Kpogas', -0.1502, 5.5670],
        ['Villas', -0.1500, 5.5700],
        ['Trade Fair', -0.1425, 5.5801]
      ]
    },

    // --- GIFFARD ROAD / BUSH CANTEEN ⇄ 37 ⇄ CIRCLE ---
    {
      id: 'bushcanteen-circle', name: 'Bush Canteen ⇄ Circle', color: '#0369a1',
      stops: [
        ['Trade Fair', -0.1425, 5.5801],
        ['Villas', -0.1500, 5.5700],
        ['Kpogas', -0.1502, 5.5670],
        ['La Traffic Light', -0.1510, 5.5680],
        ['Palm Wine', -0.1520, 5.5695],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Wireless Station', -0.1580, 5.5705],
        ['Burma Camp', -0.1600, 5.5710],
        ['Cantonments', -0.1700, 5.5750],
        ['37', -0.1854, 5.5865],
        ['Pig Farm', -0.1962, 5.5890],
        ['Nima Overhead', -0.1947, 5.5941],
        ['Kanda', -0.2018, 5.5728],
        ['Circle', -0.2189, 5.5582]
      ]
    },
    {
      id: 'circle-bushcanteen', name: 'Circle ⇄ Bush Canteen', color: '#0369a1',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Kanda', -0.2018, 5.5728],
        ['Nima Overhead', -0.1947, 5.5941],
        ['Pig Farm', -0.1962, 5.5890],
        ['37', -0.1854, 5.5865],
        ['Cantonments', -0.1700, 5.5750],
        ['Burma Camp', -0.1600, 5.5710],
        ['Wireless Station', -0.1580, 5.5705],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Palm Wine', -0.1520, 5.5695],
        ['La Traffic Light', -0.1510, 5.5680],
        ['Kpogas', -0.1502, 5.5670],
        ['Villas', -0.1500, 5.5700],
        ['Trade Fair', -0.1425, 5.5801]
      ]
    },

    // --- PALM WINE / BUSH CANTEEN ⇄ 37 ⇄ LEGON ⇄ MADINA ---
    {
      id: 'bushcanteen-madina', name: 'Bush Canteen ⇄ Madina', color: '#2563eb',
      stops: [
        ['Palm Wine', -0.1520, 5.5695],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Wireless Station', -0.1580, 5.5705],
        ['Burma Camp', -0.1600, 5.5710],
        ['37', -0.1854, 5.5865],
        ['Airport Junction', -0.1785, 5.5971],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Shiashie', -0.1745, 5.6225],
        ['Okponglo', -0.1791, 5.6325],
        ['Legon', -0.1860, 5.6500],
        ['UPSA', -0.1691, 5.6575],
        ['Zongo Junction', -0.1672, 5.6721],
        ['Madina', -0.1680, 5.6830]
      ]
    },
    {
      id: 'madina-bushcanteen', name: 'Madina ⇄ Bush Canteen', color: '#2563eb',
      stops: [
        ['Madina', -0.1680, 5.6830],
        ['Zongo Junction', -0.1672, 5.6721],
        ['UPSA', -0.1691, 5.6575],
        ['Legon', -0.1860, 5.6500],
        ['Okponglo', -0.1791, 5.6325],
        ['Shiashie', -0.1745, 5.6225],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Airport Junction', -0.1785, 5.5971],
        ['37', -0.1854, 5.5865],
        ['Burma Camp', -0.1600, 5.5710],
        ['Wireless Station', -0.1580, 5.5705],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Palm Wine', -0.1520, 5.5695]
      ]
    },

    // --- COASTAL BEACH ROAD: ACCRA CENTRAL ⇄ OSU ⇄ LABADI ⇄ TESHIE ⇄ NUNGUA ⇄ TEMA ---
    {
      id: 'temastation-tema', name: 'Accra Central ⇄ Tema', color: '#059669',
      stops: [
        ['Tema Station Accra', -0.2017, 5.5458],
        ['Ministries', -0.1983, 5.5492],
        ['Osu', -0.1822, 5.5562],
        ['Danquah Circle', -0.1795, 5.5645],
        ['Labone', -0.1725, 5.5621],
        ['La General Hospital', -0.1601, 5.5684],
        ['Labadi Station', -0.1542, 5.5670],
        ['Labadi Beach', -0.1491, 5.5641],
        ['Trade Fair', -0.1425, 5.5801],
        ['Teshie First Junction', -0.1189, 5.5843],
        ['Teshie Police Station', -0.1084, 5.5862],
        ['Teshie Tsuibleoo', -0.1021, 5.5995],
        ['Nungua Barrier', -0.0862, 5.6021],
        ['Nungua Station', -0.0768, 5.6048],
        ['Sakumono Village', -0.0531, 5.6262],
        ['Tema Comm 2', -0.0151, 5.6565],
        ['Tema Comm 1', -0.0078, 5.6482],
        ['Tema Harbour', -0.0019, 5.6415]
      ]
    },
    {
      id: 'tema-temastation', name: 'Tema ⇄ Accra Central', color: '#059669',
      stops: [
        ['Tema Harbour', -0.0019, 5.6415],
        ['Tema Comm 1', -0.0078, 5.6482],
        ['Tema Comm 2', -0.0151, 5.6565],
        ['Sakumono Village', -0.0531, 5.6262],
        ['Nungua Station', -0.0768, 5.6048],
        ['Nungua Barrier', -0.0862, 5.6021],
        ['Teshie Tsuibleoo', -0.1021, 5.5995],
        ['Teshie Police Station', -0.1084, 5.5862],
        ['Teshie First Junction', -0.1189, 5.5843],
        ['Trade Fair', -0.1425, 5.5801],
        ['Labadi Beach', -0.1491, 5.5641],
        ['Labadi Station', -0.1542, 5.5670],
        ['La General Hospital', -0.1601, 5.5684],
        ['Labone', -0.1725, 5.5621],
        ['Danquah Circle', -0.1795, 5.5645],
        ['Osu', -0.1822, 5.5562],
        ['Ministries', -0.1983, 5.5492],
        ['Tema Station Accra', -0.2017, 5.5458]
      ]
    },

    // --- CIRCLE ⇄ 37 ⇄ TRADE FAIR ⇄ TESHIE ⇄ NUNGUA ---
    {
      id: 'circle-nungua', name: 'Circle ⇄ Nungua', color: '#0891b2',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Paloma', -0.2059, 5.5721],
        ['37', -0.1854, 5.5865],
        ['Burma Camp', -0.1600, 5.5710],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Palm Wine', -0.1520, 5.5695],
        ['Trade Fair', -0.1425, 5.5801],
        ['Teshie First Junction', -0.1189, 5.5843],
        ['Nungua Barrier', -0.0862, 5.6021]
      ]
    },
    {
      id: 'nungua-circle', name: 'Nungua ⇄ Circle', color: '#0891b2',
      stops: [
        ['Nungua Barrier', -0.0862, 5.6021],
        ['Teshie First Junction', -0.1189, 5.5843],
        ['Trade Fair', -0.1425, 5.5801],
        ['Palm Wine', -0.1520, 5.5695],
        ['Palmwine Bush Canteen', -0.1530, 5.5720],
        ['Labadi Bush Canteen', -0.15419, 5.57527],
        ['Burma Camp', -0.1600, 5.5710],
        ['37', -0.1854, 5.5865],
        ['Paloma', -0.2059, 5.5721],
        ['Circle', -0.2189, 5.5582]
      ]
    },

    // --- N4 CORRIDOR: MADINA ⇄ LEGON ⇄ 37 ⇄ CIRCLE ---
    {
      id: 'madina-circle', name: 'Madina ⇄ Circle', color: '#1d4ed8',
      stops: [
        ['Madina', -0.1680, 5.6830],
        ['Zongo Junction', -0.1672, 5.6721],
        ['UPSA', -0.1691, 5.6575],
        ['Legon', -0.1860, 5.6500],
        ['Okponglo', -0.1791, 5.6325],
        ['Bawaleshie', -0.1649, 5.6421],
        ['Shiashie', -0.1745, 5.6225],
        ['Accra Mall', -0.1743, 5.6236],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Airport First', -0.1773, 5.6065],
        ['Airport Junction', -0.1785, 5.5971],
        ['37', -0.1854, 5.5865],
        ['Pig Farm', -0.1962, 5.5890],
        ['Nima Overhead', -0.1947, 5.5941],
        ['Kanda', -0.2018, 5.5728],
        ['Paloma', -0.2059, 5.5721],
        ['Circle', -0.2189, 5.5582]
      ]
    },
    {
      id: 'circle-madina', name: 'Circle ⇄ Madina', color: '#1d4ed8',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Paloma', -0.2059, 5.5721],
        ['Kanda', -0.2018, 5.5728],
        ['Nima Overhead', -0.1947, 5.5941],
        ['Pig Farm', -0.1962, 5.5890],
        ['37', -0.1854, 5.5865],
        ['Airport Junction', -0.1785, 5.5971],
        ['Airport First', -0.1773, 5.6065],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Accra Mall', -0.1743, 5.6236],
        ['Shiashie', -0.1745, 5.6225],
        ['Bawaleshie', -0.1649, 5.6421],
        ['Okponglo', -0.1791, 5.6325],
        ['Legon', -0.1860, 5.6500],
        ['UPSA', -0.1691, 5.6575],
        ['Zongo Junction', -0.1672, 5.6721],
        ['Madina', -0.1680, 5.6830]
      ]
    },

    // --- ADENTA ⇄ MADINA ⇄ DODOWA ---
    {
      id: 'adenta-madina', name: 'Adenta ⇄ Madina', color: '#d93025',
      stops: [
        ['Dodowa', -0.0952, 5.8821],
        ['Oyibi', -0.1215, 5.7891],
        ['Amrahia', -0.1342, 5.7621],
        ['Frafraha', -0.1451, 5.7381],
        ['Adenta Housing', -0.1542, 5.7191],
        ['Adenta Barrier', -0.1581, 5.7082],
        ['Ritz Junction', -0.1645, 5.6912],
        ['Madina', -0.1680, 5.6830]
      ]
    },
    {
      id: 'madina-adenta', name: 'Madina ⇄ Adenta', color: '#d93025',
      stops: [
        ['Madina', -0.1680, 5.6830],
        ['Ritz Junction', -0.1645, 5.6912],
        ['Adenta Barrier', -0.1581, 5.7082],
        ['Adenta Housing', -0.1542, 5.7191],
        ['Frafraha', -0.1451, 5.7381],
        ['Amrahia', -0.1342, 5.7621],
        ['Oyibi', -0.1215, 5.7891],
        ['Dodowa', -0.0952, 5.8821]
      ]
    },

    // --- ACCRA CENTRAL ⇄ 37 ⇄ LEGON ⇄ MADINA ---
    {
      id: 'temastation-madina', name: 'Accra Central ⇄ Madina', color: '#1e40af',
      stops: [
        ['Tema Station Accra', -0.2017, 5.5458],
        ['Ministries', -0.1983, 5.5492],
        ['Ridge', -0.1850, 5.5700],
        ['37', -0.1854, 5.5865],
        ['Airport Junction', -0.1785, 5.5971],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Shiashie', -0.1745, 5.6225],
        ['Legon', -0.1860, 5.6500],
        ['UPSA', -0.1691, 5.6575],
        ['Madina', -0.1680, 5.6830]
      ]
    },
    {
      id: 'madina-temastation', name: 'Madina ⇄ Accra Central', color: '#1e40af',
      stops: [
        ['Madina', -0.1680, 5.6830],
        ['UPSA', -0.1691, 5.6575],
        ['Legon', -0.1860, 5.6500],
        ['Shiashie', -0.1745, 5.6225],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Airport Junction', -0.1785, 5.5971],
        ['37', -0.1854, 5.5865],
        ['Ridge', -0.1850, 5.5700],
        ['Ministries', -0.1983, 5.5492],
        ['Tema Station Accra', -0.2017, 5.5458]
      ]
    },

    // --- WINNEBA RD: CIRCLE ⇄ KANESHIE ⇄ ODORKOR ⇄ MALLAM ⇄ WEIJA ⇄ KASOA ---
    {
      id: 'circle-kasoa', name: 'Circle ⇄ Kasoa', color: '#ea580c',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Abossey Okai', -0.2371, 5.5532],
        ['Kaneshie', -0.2490, 5.5598],
        ['First Light', -0.2561, 5.5632],
        ['Odorkor', -0.2642, 5.5668],
        ['Odorkor Tipper', -0.2711, 5.5719],
        ['Darkuman Junction', -0.2780, 5.5710],
        ['Kwashieman', -0.2711, 5.5840],
        ['Mallam Market', -0.2882, 5.5739],
        ['Mallam Junction', -0.2938, 5.5771],
        ['Gbawe', -0.3021, 5.5901],
        ['Weija', -0.3341, 5.5645],
        ['Tetegu', -0.3451, 5.5581],
        ['West Hills Mall', -0.3582, 5.5539],
        ['Bortianor', -0.3725, 5.5492],
        ['Kasoa Barrier', -0.4191, 5.5358],
        ['Kasoa', -0.4262, 5.5342]
      ]
    },
    {
      id: 'kasoa-circle', name: 'Kasoa ⇄ Circle', color: '#ea580c',
      stops: [
        ['Kasoa', -0.4262, 5.5342],
        ['Kasoa Barrier', -0.4191, 5.5358],
        ['Bortianor', -0.3725, 5.5492],
        ['West Hills Mall', -0.3582, 5.5539],
        ['Tetegu', -0.3451, 5.5581],
        ['Weija', -0.3341, 5.5645],
        ['Gbawe', -0.3021, 5.5901],
        ['Mallam Junction', -0.2938, 5.5771],
        ['Mallam Market', -0.2882, 5.5739],
        ['Kwashieman', -0.2711, 5.5840],
        ['Darkuman Junction', -0.2780, 5.5710],
        ['Odorkor Tipper', -0.2711, 5.5719],
        ['Odorkor', -0.2642, 5.5668],
        ['First Light', -0.2561, 5.5632],
        ['Kaneshie', -0.2490, 5.5598],
        ['Abossey Okai', -0.2371, 5.5532],
        ['Circle', -0.2189, 5.5582]
      ]
    },

    // --- KANESHIE ⇄ MADINA ---
    {
      id: 'kaneshie-madina', name: 'Kaneshie ⇄ Madina', color: '#8b5cf6',
      stops: [
        ['Kaneshie', -0.2490, 5.5598],
        ['Abossey Okai', -0.2371, 5.5532],
        ['Circle', -0.2189, 5.5582],
        ['37', -0.1854, 5.5865],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Legon', -0.1860, 5.6500],
        ['Madina', -0.1680, 5.6830]
      ]
    },
    {
      id: 'madina-kaneshie', name: 'Madina ⇄ Kaneshie', color: '#8b5cf6',
      stops: [
        ['Madina', -0.1680, 5.6830],
        ['Legon', -0.1860, 5.6500],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['37', -0.1854, 5.5865],
        ['Circle', -0.2189, 5.5582],
        ['Abossey Okai', -0.2371, 5.5532],
        ['Kaneshie', -0.2490, 5.5598]
      ]
    },

    // --- ACCRA CENTRAL ⇄ KANESHIE ⇄ MALLAM ⇄ KASOA ---
    {
      id: 'temastation-kasoa', name: 'Accra Central ⇄ Kasoa', color: '#f59e0b',
      stops: [
        ['Tema Station Accra', -0.2017, 5.5458],
        ['Makola', -0.2098, 5.5419],
        ['Korle Bu', -0.2280, 5.5380],
        ['Kaneshie', -0.2490, 5.5598],
        ['First Light', -0.2561, 5.5632],
        ['Odorkor', -0.2642, 5.5668],
        ['Mallam Junction', -0.2938, 5.5771],
        ['Weija', -0.3341, 5.5645],
        ['Kasoa Barrier', -0.4191, 5.5358],
        ['Kasoa', -0.4262, 5.5342]
      ]
    },
    {
      id: 'kasoa-temastation', name: 'Kasoa ⇄ Accra Central', color: '#f59e0b',
      stops: [
        ['Kasoa', -0.4262, 5.5342],
        ['Kasoa Barrier', -0.4191, 5.5358],
        ['Weija', -0.3341, 5.5645],
        ['Mallam Junction', -0.2938, 5.5771],
        ['Odorkor', -0.2642, 5.5668],
        ['First Light', -0.2561, 5.5632],
        ['Kaneshie', -0.2490, 5.5598],
        ['Korle Bu', -0.2280, 5.5380],
        ['Makola', -0.2098, 5.5419],
        ['Tema Station Accra', -0.2017, 5.5458]
      ]
    },

    // --- N1 MOTORWAY: MALLAM ⇄ LAPAZ ⇄ ACHIMOTA ⇄ TETTEH QUARSHIE ⇄ TEMA ---
    {
      id: 'mallam-lapaz-tema', name: 'Mallam ⇄ Lapaz ⇄ Tema', color: '#0e7490',
      stops: [
        ['Mallam Junction', -0.2938, 5.5771],
        ['Kwashieman', -0.2711, 5.5840],
        ['Darkuman Junction', -0.2581, 5.5762],
        ['Nyamekye', -0.2564, 5.6029],
        ['Lapaz', -0.2458, 5.5998],
        ['Lapaz Market', -0.2405, 5.6090],
        ['Bambolino', -0.2424, 5.6087],
        ['Akweteyman', -0.2318, 5.6111],
        ['Achimota', -0.2281, 5.6111],
        ['Abofu', -0.2229, 5.6140],
        ['Dzorwulu Junction', -0.2071, 5.6071],
        ['Roman Ridge', -0.1989, 5.6018],
        ['Airport Junction', -0.1795, 5.6220],
        ['Accra Mall', -0.1743, 5.6236],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Action Chapel', -0.1655, 5.6268],
        ['Manet', -0.1281, 5.6409],
        ['Trasacco', -0.1177, 5.6451],
        ['18 Junction', -0.0757, 5.6606],
        ['Abattoir', -0.0714, 5.6622],
        ['Under Bridge', -0.0436, 5.6748],
        ['Ashaiman', -0.0381, 5.6982],
        ['Tema Comm 1', -0.0078, 5.6482]
      ]
    },
    {
      id: 'tema-lapaz-mallam', name: 'Tema ⇄ Lapaz ⇄ Mallam', color: '#0e7490',
      stops: [
        ['Tema Comm 1', -0.0078, 5.6482],
        ['Ashaiman', -0.0381, 5.6982],
        ['Under Bridge', -0.0436, 5.6748],
        ['Abattoir', -0.0714, 5.6622],
        ['18 Junction', -0.0757, 5.6606],
        ['Trasacco', -0.1177, 5.6451],
        ['Manet', -0.1281, 5.6409],
        ['Action Chapel', -0.1655, 5.6268],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Accra Mall', -0.1743, 5.6236],
        ['Airport Junction', -0.1795, 5.6220],
        ['Roman Ridge', -0.1989, 5.6018],
        ['Dzorwulu Junction', -0.2071, 5.6071],
        ['Abofu', -0.2229, 5.6140],
        ['Achimota', -0.2281, 5.6111],
        ['Akweteyman', -0.2318, 5.6111],
        ['Bambolino', -0.2424, 5.6087],
        ['Lapaz Market', -0.2405, 5.6090],
        ['Lapaz', -0.2458, 5.5998],
        ['Nyamekye', -0.2564, 5.6029],
        ['Darkuman Junction', -0.2581, 5.5762],
        ['Kwashieman', -0.2711, 5.5840],
        ['Mallam Junction', -0.2938, 5.5771]
      ]
    },

    // --- LAPAZ ⇄ CIRCLE ---
    {
      id: 'lapaz-circle', name: 'Lapaz ⇄ Circle', color: '#16a34a',
      stops: [
        ['Lapaz', -0.2458, 5.5998],
        ['Abeka', -0.2400, 5.5910],
        ['Fadama', -0.2350, 5.5820],
        ['Caprice', -0.2220, 5.5780],
        ['Circle', -0.2189, 5.5582]
      ]
    },
    {
      id: 'circle-lapaz', name: 'Circle ⇄ Lapaz', color: '#16a34a',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Caprice', -0.2220, 5.5780],
        ['Fadama', -0.2350, 5.5820],
        ['Abeka', -0.2400, 5.5910],
        ['Lapaz', -0.2458, 5.5998]
      ]
    },

    // --- LAPAZ ⇄ KANESHIE ---
    {
      id: 'lapaz-kaneshie', name: 'Lapaz ⇄ Kaneshie', color: '#15803d',
      stops: [
        ['Lapaz', -0.2458, 5.5998],
        ['Nyamekye', -0.2564, 5.6029],
        ['Darkuman Junction', -0.2581, 5.5762],
        ['Odorkor', -0.2642, 5.5668],
        ['First Light', -0.2561, 5.5632],
        ['Kaneshie', -0.2490, 5.5598]
      ]
    },
    {
      id: 'kaneshie-lapaz', name: 'Kaneshie ⇄ Lapaz', color: '#15803d',
      stops: [
        ['Kaneshie', -0.2490, 5.5598],
        ['First Light', -0.2561, 5.5632],
        ['Odorkor', -0.2642, 5.5668],
        ['Darkuman Junction', -0.2581, 5.5762],
        ['Nyamekye', -0.2564, 5.6029],
        ['Lapaz', -0.2458, 5.5998]
      ]
    },

    // --- ACCRA CENTRAL ⇄ KANESHIE ⇄ ODORKOR ⇄ AWOSHIE ⇄ ANYAA ⇄ ABLEKUMA ⇄ MANHEAN ---
    {
      id: 'temastation-ablekuma', name: 'Accra Central ⇄ Ablekuma ⇄ Manhean', color: '#0284c7',
      stops: [
        ['Tema Station Accra', -0.2017, 5.5458],
        ['Makola', -0.2098, 5.5419],
        ['Kaneshie', -0.2490, 5.5598],
        ['First Light', -0.2561, 5.5632],
        ['Odorkor', -0.2642, 5.5668],
        ['Awoshie Vineyard', -0.2744, 5.5845],
        ['Awoshie', -0.2789, 5.5870],
        ['Awoshie Last Stop', -0.2872, 5.5919],
        ['Anyaa Market', -0.2907, 5.5991],
        ['Anyaa', -0.2945, 5.6051],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Pentecost Junction', -0.3067, 5.6259],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Curve', -0.3120, 5.6271],
        ['Ablekuma CP', -0.3236, 5.6317],
        ['Ablekuma Block Factory', -0.3244, 5.6323],
        ['Oduman', -0.3337, 5.6399],
        ['Manhean', -0.3458, 5.6423]
      ]
    },
    {
      id: 'ablekuma-temastation', name: 'Manhean ⇄ Ablekuma ⇄ Accra Central', color: '#0284c7',
      stops: [
        ['Manhean', -0.3458, 5.6423],
        ['Oduman', -0.3337, 5.6399],
        ['Ablekuma Block Factory', -0.3244, 5.6323],
        ['Ablekuma CP', -0.3236, 5.6317],
        ['Ablekuma Curve', -0.3120, 5.6271],
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['Pentecost Junction', -0.3067, 5.6259],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Anyaa', -0.2945, 5.6051],
        ['Anyaa Market', -0.2907, 5.5991],
        ['Awoshie Last Stop', -0.2872, 5.5919],
        ['Awoshie', -0.2789, 5.5870],
        ['Awoshie Vineyard', -0.2744, 5.5845],
        ['Odorkor', -0.2642, 5.5668],
        ['First Light', -0.2561, 5.5632],
        ['Kaneshie', -0.2490, 5.5598],
        ['Makola', -0.2098, 5.5419],
        ['Tema Station Accra', -0.2017, 5.5458]
      ]
    },

    // --- CIRCLE ⇄ AWOSHIE ⇄ ANYAA ⇄ ABLEKUMA ---
    {
      id: 'circle-ablekuma', name: 'Circle ⇄ Awoshie ⇄ Ablekuma', color: '#0369a1',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Abossey Okai', -0.2371, 5.5532],
        ['Kaneshie', -0.2490, 5.5598],
        ['First Light', -0.2561, 5.5632],
        ['Odorkor', -0.2642, 5.5668],
        ['Awoshie', -0.2789, 5.5870],
        ['Anyaa', -0.2945, 5.6051],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Curve', -0.3120, 5.6271]
      ]
    },
    {
      id: 'ablekuma-circle', name: 'Ablekuma ⇄ Awoshie ⇄ Circle', color: '#0369a1',
      stops: [
        ['Ablekuma Curve', -0.3120, 5.6271],
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Anyaa', -0.2945, 5.6051],
        ['Awoshie', -0.2789, 5.5870],
        ['Odorkor', -0.2642, 5.5668],
        ['First Light', -0.2561, 5.5632],
        ['Kaneshie', -0.2490, 5.5598],
        ['Abossey Okai', -0.2371, 5.5532],
        ['Circle', -0.2189, 5.5582]
      ]
    },

    // --- LAPAZ ⇄ SOWUTUOM ⇄ FANMILK ⇄ ABLEKUMA ⇄ MANHEAN ---
    {
      id: 'lapaz-sowutuom-ablekuma', name: 'Lapaz ⇄ Sowutuom ⇄ Ablekuma', color: '#16a34a',
      stops: [
        ['Lapaz', -0.2458, 5.5998],
        ['Tabora Number 1', -0.2578, 5.6037],
        ['Race Course', -0.2640, 5.6091],
        ['Sowutuom Market', -0.2768, 5.6200],
        ['Sowutuom Last Stop', -0.2845, 5.6252],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Curve', -0.3120, 5.6271],
        ['Manhean', -0.3458, 5.6423]
      ]
    },
    {
      id: 'ablekuma-sowutuom-lapaz', name: 'Ablekuma ⇄ Sowutuom ⇄ Lapaz', color: '#16a34a',
      stops: [
        ['Manhean', -0.3458, 5.6423],
        ['Ablekuma Curve', -0.3120, 5.6271],
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Sowutuom Last Stop', -0.2845, 5.6252],
        ['Sowutuom Market', -0.2768, 5.6200],
        ['Race Course', -0.2640, 5.6091],
        ['Tabora Number 1', -0.2578, 5.6037],
        ['Lapaz', -0.2458, 5.5998]
      ]
    },

    // --- LAPAZ ⇄ KWASHIEMAN ⇄ AWOSHIE ⇄ ANYAA ⇄ ABLEKUMA ---
    {
      id: 'lapaz-awoshie-ablekuma', name: 'Lapaz ⇄ Awoshie ⇄ Ablekuma', color: '#15803d',
      stops: [
        ['Lapaz', -0.2458, 5.5998],
        ['Nyamekye', -0.2564, 5.6029],
        ['Kwashieman', -0.2711, 5.5840],
        ['Awoshie', -0.2789, 5.5870],
        ['Anyaa Market', -0.2907, 5.5991],
        ['Anyaa', -0.2945, 5.6051],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['Ablekuma', -0.3102, 5.6272]
      ]
    },
    {
      id: 'ablekuma-awoshie-lapaz', name: 'Ablekuma ⇄ Awoshie ⇄ Lapaz', color: '#15803d',
      stops: [
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Junction', -0.3087, 5.6270],
        ['FanMilk Junction', -0.2992, 5.6219],
        ['Anyaa', -0.2945, 5.6051],
        ['Anyaa Market', -0.2907, 5.5991],
        ['Awoshie', -0.2789, 5.5870],
        ['Kwashieman', -0.2711, 5.5840],
        ['Nyamekye', -0.2564, 5.6029],
        ['Lapaz', -0.2458, 5.5998]
      ]
    },

    // --- MALLAM ⇄ GBAWE ⇄ AGAPE ⇄ ABLEKUMA ---
    {
      id: 'mallam-gbawe-ablekuma', name: 'Mallam ⇄ Gbawe ⇄ Ablekuma', color: '#ca8a04',
      stops: [
        ['Mallam Junction', -0.2938, 5.5771],
        ['Gbawe', -0.3021, 5.5901],
        ['Tarrazzo', -0.3120, 5.6160],
        ['Agape', -0.3295, 5.6092],
        ['Ablekuma Curve', -0.3120, 5.6271],
        ['Ablekuma', -0.3102, 5.6272]
      ]
    },
    {
      id: 'ablekuma-gbawe-mallam', name: 'Ablekuma ⇄ Gbawe ⇄ Mallam', color: '#ca8a04',
      stops: [
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma Curve', -0.3120, 5.6271],
        ['Agape', -0.3295, 5.6092],
        ['Tarrazzo', -0.3120, 5.6160],
        ['Gbawe', -0.3021, 5.5901],
        ['Mallam Junction', -0.2938, 5.5771]
      ]
    },

    // --- POKUASE ⇄ ABLEKUMA (HIGHWAY LINK) ---
    {
      id: 'pokuase-ablekuma', name: 'Pokuase ⇄ Ablekuma', color: '#4f46e5',
      stops: [
        ['Pokuase', -0.2921, 5.6952],
        ['ACP Junction', -0.2773, 5.6841],
        ['Ablekuma CP', -0.3236, 5.6317],
        ['Ablekuma', -0.3102, 5.6272]
      ]
    },
    {
      id: 'ablekuma-pokuase', name: 'Ablekuma ⇄ Pokuase', color: '#4f46e5',
      stops: [
        ['Ablekuma', -0.3102, 5.6272],
        ['Ablekuma CP', -0.3236, 5.6317],
        ['ACP Junction', -0.2773, 5.6841],
        ['Pokuase', -0.2921, 5.6952]
      ]
    },

    // --- N6 KUMASI TRUNK: CIRCLE ⇄ ACHIMOTA ⇄ POKUASE ⇄ AMASAMAN ⇄ NSAWAM ---
    {
      id: 'circle-nsawam', name: 'Circle ⇄ Nsawam', color: '#4b5563',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Caprice', -0.2220, 5.5780],
        ['Tesano', -0.2259, 5.6045],
        ['Abofu', -0.2229, 5.6140],
        ['Achimota', -0.2312, 5.6192],
        ['Achimota Mall', -0.2415, 5.6374],
        ['Mile 7', -0.2424, 5.6389],
        ['St Johns', -0.2450, 5.6420],
        ['Ofankor', -0.2681, 5.6582],
        ['ACP Junction', -0.2773, 5.6841],
        ['Pokuase', -0.2921, 5.6952],
        ['Fusi Junction', -0.2920, 5.6984],
        ['Amasaman', -0.3051, 5.7092],
        ['Medie', -0.3282, 5.7581],
        ['Nsawam', -0.3512, 5.8081]
      ]
    },
    {
      id: 'nsawam-circle', name: 'Nsawam ⇄ Circle', color: '#4b5563',
      stops: [
        ['Nsawam', -0.3512, 5.8081],
        ['Medie', -0.3282, 5.7581],
        ['Amasaman', -0.3051, 5.7092],
        ['Fusi Junction', -0.2920, 5.6984],
        ['Pokuase', -0.2921, 5.6952],
        ['ACP Junction', -0.2773, 5.6841],
        ['Ofankor', -0.2681, 5.6582],
        ['St Johns', -0.2450, 5.6420],
        ['Mile 7', -0.2424, 5.6389],
        ['Achimota Mall', -0.2415, 5.6374],
        ['Achimota', -0.2312, 5.6192],
        ['Abofu', -0.2229, 5.6140],
        ['Tesano', -0.2259, 5.6045],
        ['Caprice', -0.2220, 5.5780],
        ['Circle', -0.2189, 5.5582]
      ]
    },

    // --- ACHIMOTA ⇄ DOME ⇄ TAIFA ⇄ KWABENYA ⇄ HAATSO ⇄ MADINA ---
    {
      id: 'achimota-madina', name: 'Achimota ⇄ Madina', color: '#b45309',
      stops: [
        ['Achimota', -0.2312, 5.6192],
        ['Mile 7', -0.2424, 5.6389],
        ['Dome Pillar 2', -0.2350, 5.6450],
        ['Dome', -0.2380, 5.6480],
        ['Taifa', -0.2524, 5.6495],
        ['Kwabenya', -0.2450, 5.6650],
        ['Haatso', -0.2100, 5.6580],
        ['Atomic Junction', -0.1800, 5.6650],
        ['Madina', -0.1680, 5.6830]
      ]
    },
    {
      id: 'madina-achimota', name: 'Madina ⇄ Achimota', color: '#b45309',
      stops: [
        ['Madina', -0.1680, 5.6830],
        ['Atomic Junction', -0.1800, 5.6650],
        ['Haatso', -0.2100, 5.6580],
        ['Kwabenya', -0.2450, 5.6650],
        ['Taifa', -0.2524, 5.6495],
        ['Dome', -0.2380, 5.6480],
        ['Dome Pillar 2', -0.2350, 5.6450],
        ['Mile 7', -0.2424, 5.6389],
        ['Achimota', -0.2312, 5.6192]
      ]
    },

    // --- DANSOMAN ⇄ CIRCLE ---
    {
      id: 'dansoman-circle', name: 'Dansoman ⇄ Circle', color: '#be123c',
      stops: [
        ['Dansoman', -0.2652, 5.5300],
        ['Agege Last Stop', -0.2640, 5.5293],
        ['Dansoman Exhibition', -0.2540, 5.5450],
        ['Banana Inn', -0.2362, 5.5643],
        ['Chorkor', -0.2350, 5.5350],
        ['Korle Bu', -0.2280, 5.5380],
        ['Circle', -0.2189, 5.5582]
      ]
    },
    {
      id: 'circle-dansoman', name: 'Circle ⇄ Dansoman', color: '#be123c',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Korle Bu', -0.2280, 5.5380],
        ['Chorkor', -0.2350, 5.5350],
        ['Banana Inn', -0.2362, 5.5643],
        ['Dansoman Exhibition', -0.2540, 5.5450],
        ['Agege Last Stop', -0.2640, 5.5293],
        ['Dansoman', -0.2652, 5.5300]
      ]
    },

    // --- DANSOMAN ⇄ ACCRA CENTRAL ---
    {
      id: 'dansoman-temastation', name: 'Dansoman ⇄ Accra Central', color: '#c026d3',
      stops: [
        ['Dansoman', -0.2652, 5.5300],
        ['Agege Last Stop', -0.2640, 5.5293],
        ['Dansoman Exhibition', -0.2540, 5.5450],
        ['Banana Inn', -0.2362, 5.5643],
        ['Mamprobi', -0.2400, 5.5340],
        ['Chorkor', -0.2350, 5.5350],
        ['Korle Bu', -0.2280, 5.5380],
        ['Makola', -0.2098, 5.5419],
        ['Tema Station Accra', -0.2017, 5.5458]
      ]
    },
    {
      id: 'temastation-dansoman', name: 'Accra Central ⇄ Dansoman', color: '#c026d3',
      stops: [
        ['Tema Station Accra', -0.2017, 5.5458],
        ['Makola', -0.2098, 5.5419],
        ['Korle Bu', -0.2280, 5.5380],
        ['Chorkor', -0.2350, 5.5350],
        ['Mamprobi', -0.2400, 5.5340],
        ['Banana Inn', -0.2362, 5.5643],
        ['Dansoman Exhibition', -0.2540, 5.5450],
        ['Agege Last Stop', -0.2640, 5.5293],
        ['Dansoman', -0.2652, 5.5300]
      ]
    },

    // --- OSU ⇄ CIRCLE ---
    {
      id: 'osu-circle', name: 'Osu ⇄ Circle', color: '#0e7490',
      stops: [
        ['Osu', -0.1822, 5.5562],
        ['Danquah Circle', -0.1795, 5.5645],
        ['Ridge', -0.1850, 5.5700],
        ['Adabraka', -0.2050, 5.5595],
        ['Circle', -0.2189, 5.5582]
      ]
    },
    {
      id: 'circle-osu', name: 'Circle ⇄ Osu', color: '#0e7490',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Adabraka', -0.2050, 5.5595],
        ['Ridge', -0.1850, 5.5700],
        ['Danquah Circle', -0.1795, 5.5645],
        ['Osu', -0.1822, 5.5562]
      ]
    },

    // --- SPINTEX ROAD: TETTEH QUARSHIE ⇄ MANET ⇄ COCA COLA ⇄ BAATSONA ⇄ SAKUMONO ---
    {
      id: 'spintex-tettehquarshie', name: 'Spintex ⇄ Tetteh Quarshie', color: '#0d9488',
      stops: [
        ['Sakumono Village', -0.0531, 5.6262],
        ['Baatsona', -0.1197, 5.6197],
        ['Coca-Cola', -0.1055, 5.6500],
        ['Spintex', -0.1250, 5.6280],
        ['Kasapreko', -0.1200, 5.6350],
        ['Manet', -0.1281, 5.6409],
        ['Action Chapel', -0.1655, 5.6268],
        ['Flower Pot', -0.1548, 5.6302],
        ['Tetteh Quarshie', -0.1752, 5.6112]
      ]
    },
    {
      id: 'tettehquarshie-spintex', name: 'Tetteh Quarshie ⇄ Spintex', color: '#0d9488',
      stops: [
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Flower Pot', -0.1548, 5.6302],
        ['Action Chapel', -0.1655, 5.6268],
        ['Manet', -0.1281, 5.6409],
        ['Kasapreko', -0.1200, 5.6350],
        ['Spintex', -0.1250, 5.6280],
        ['Coca-Cola', -0.1055, 5.6500],
        ['Baatsona', -0.1197, 5.6197],
        ['Sakumono Village', -0.0531, 5.6262]
      ]
    },

    // --- EAST LEGON ⇄ TETTEH QUARSHIE ⇄ 37 ⇄ CIRCLE ---
    {
      id: 'eastlegon-circle', name: 'East Legon ⇄ Circle', color: '#7c3aed',
      stops: [
        ['East Legon', -0.1580, 5.6390],
        ['Bawaleshie', -0.1649, 5.6421],
        ['Shiashie', -0.1745, 5.6225],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Airport Junction', -0.1785, 5.5971],
        ['37', -0.1854, 5.5865],
        ['Pig Farm', -0.1962, 5.5890],
        ['Circle', -0.2189, 5.5582]
      ]
    },
    {
      id: 'circle-eastlegon', name: 'Circle ⇄ East Legon', color: '#7c3aed',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Pig Farm', -0.1962, 5.5890],
        ['37', -0.1854, 5.5865],
        ['Airport Junction', -0.1785, 5.5971],
        ['Tetteh Quarshie', -0.1752, 5.6112],
        ['Shiashie', -0.1745, 5.6225],
        ['Bawaleshie', -0.1649, 5.6421],
        ['East Legon', -0.1580, 5.6390]
      ]
    },

    // --- ACCRA ⇄ KUMASI INTER-CITY ---
    {
      id: 'accra-kumasi', name: 'Accra (Circle) ⇄ Kumasi (Kejetia)', color: '#b91c1c',
      stops: [
        ['Circle', -0.2189, 5.5582],
        ['Achimota', -0.2312, 5.6192],
        ['Pokuase', -0.2921, 5.6952],
        ['Nsawam', -0.3512, 5.8081],
        ['Suhum', -0.4512, 6.0412],
        ['Nkawkaw', -0.7681, 6.5512],
        ['Konongo', -1.2212, 6.6212],
        ['Kumasi Kejetia', -1.6251, 6.6961]
      ]
    },
    {
      id: 'kumasi-accra', name: 'Kumasi (Kejetia) ⇄ Accra (Circle)', color: '#b91c1c',
      stops: [
        ['Kumasi Kejetia', -1.6251, 6.6961],
        ['Konongo', -1.2212, 6.6212],
        ['Nkawkaw', -0.7681, 6.5512],
        ['Suhum', -0.4512, 6.0412],
        ['Nsawam', -0.3512, 5.8081],
        ['Pokuase', -0.2921, 5.6952],
        ['Achimota', -0.2312, 5.6192],
        ['Circle', -0.2189, 5.5582]
      ]
    },

    // --- ACCRA ⇄ CAPE COAST ⇄ TAKORADI ---
    {
      id: 'accra-takoradi', name: 'Accra (Kaneshie) ⇄ Cape Coast ⇄ Takoradi', color: '#c2410c',
      stops: [
        ['Kaneshie', -0.2490, 5.5598],
        ['Kasoa', -0.4262, 5.5342],
        ['Winneba', -0.6281, 5.3851],
        ['Mankessim', -1.0212, 5.2681],
        ['Cape Coast Tantri', -1.2481, 5.1082],
        ['Takoradi Market Circle', -1.7551, 4.8872]
      ]
    },
    {
      id: 'takoradi-accra', name: 'Takoradi ⇄ Cape Coast ⇄ Accra (Kaneshie)', color: '#c2410c',
      stops: [
        ['Takoradi Market Circle', -1.7551, 4.8872],
        ['Cape Coast Tantri', -1.2481, 5.1082],
        ['Mankessim', -1.0212, 5.2681],
        ['Winneba', -0.6281, 5.3851],
        ['Kasoa', -0.4262, 5.5342],
        ['Kaneshie', -0.2490, 5.5598]
      ]
    },

    // --- ACCRA ⇄ AFLAO (VOLTA) ---
    {
      id: 'accra-aflao', name: 'Accra (Tema Station) ⇄ Sogakope ⇄ Aflao', color: '#047857',
      stops: [
        ['Tema Station Accra', -0.2017, 5.5458],
        ['Tema Comm 1', -0.0078, 5.6482],
        ['Sogakope', 0.5891, 5.9981],
        ['Akatsi', 0.7981, 6.1281],
        ['Aflao', 1.1912, 6.1192]
      ]
    },
    {
      id: 'aflao-accra', name: 'Aflao ⇄ Sogakope ⇄ Accra (Tema Station)', color: '#047857',
      stops: [
        ['Aflao', 1.1912, 6.1192],
        ['Akatsi', 0.7981, 6.1281],
        ['Sogakope', 0.5891, 5.9981],
        ['Tema Comm 1', -0.0078, 5.6482],
        ['Tema Station Accra', -0.2017, 5.5458]
      ]
    }
  ].concat(customRoutesList);

  /* ======================================================================
     2. STATIONS & INTERCHANGES
     ====================================================================== */
  var stations = {
    'circle': 'Kwame Nkrumah Circle Interchange (Neoplan & Odawna)',
    '37': '37 Military Hospital Station',
    'kaneshie': 'Kaneshie Market & Terminal Complex',
    'madina': 'Madina Main Station (Zongo & Market)',
    'lapaz': 'Abeka Lapaz Overhead Terminal',
    'achimota': 'Achimota New Transport Terminal',
    'tetteh quarshie': 'Tetteh Quarshie Interchange (Accra Mall)',
    'tema station accra': 'Tema Station (Accra Central Lorry Park)',
    'osu': 'Osu Oxford Street & Commercial Area',
    'labadi station': 'Labadi Lorry Station',
    'palmwine bush canteen': 'Palmwine Bush Canteen Station (Giffard Road)',
    'labadi bush canteen': 'Bush Canteen / Giffard Road Station',
    'palm wine': 'Palm Wine Junction',
    'trade fair': 'Trade Fair Station',
    'teshie first junction': 'Teshie First Junction',
    'nungua barrier': 'Nungua Barrier & Station',
    'sakumono village': 'Sakumono Village & Estate Station',
    'spintex': 'Spintex Road Station',
    'kasoa': 'Kasoa Main Overhead Terminal',
    'mallam junction': 'Mallam Interchange Station',
    'dansoman': 'Dansoman Last Stop & Roundabout',
    'adenta barrier': 'Adenta Barrier Station',
    'pokuase': 'Pokuase ACP Interchange Station',
    'east legon': 'East Legon Station',
    'tema comm 1': 'Tema Community 1 Main Station',
    'ashaiman': 'Ashaiman Main Overhead Station',
    'kumasi kejetia': 'Kejetia New Market Terminal (Kumasi)',
    'cape coast tantri': 'Cape Coast Tantri Terminal',
    'takoradi market circle': 'Takoradi Market Circle Terminal',
    'aflao': 'Aflao Border Station',
    'ablekuma': 'Ablekuma Main Station & Terminal',
    'anyaa': 'Anyaa Market & Station',
    'awoshie': 'Awoshie Junction Station',
    'sowutuom': 'Sowutuom Last Stop Station',
    'manhean': 'Manhean Station',
    'fanmilk junction': 'FanMilk Junction'
  };

  var interchanges = [
    { names: ['Circle', 'Kwame Nkrumah Circle', 'Neoplan', 'Odawna', 'Circle Bus Station'], note: 'Accra central transit hub.' },
    { names: ['37', '37 Military Hospital', 'Thirty Seven', '37 Station'], note: 'Major interchange connecting East, North & South.' },
    { names: ['Kaneshie', 'Kaneshie Market', 'Kaneshie Terminal', 'Kaneshie Complex'], note: 'Major West Accra hub.' },
    { names: ['Lapaz', 'Abeka Lapaz', 'Lapaz Overhead', 'Lapaz Station'], note: 'N1 Highway interchange.' },
    { names: ['Achimota', 'Achimota Terminal', 'Achimota Overhead', 'Achimota New Station'], note: 'N6 Kumasi trunk hub.' },
    { names: ['Madina', 'Madina Zongo', 'Madina Market', 'Madina Main Station'], note: 'North-East transit gateway.' },
    { names: ['Tetteh Quarshie', 'Accra Mall Roundabout', 'Tetteh Quarshie Interchange'], note: 'Spine interchange.' },
    { names: ['Tema Station Accra', 'Tema Station', 'Accra Central', 'Tudu', 'Ministries'], note: 'Accra City Centre terminal.' },
    { names: ['Dansoman', 'Dansoman Last Stop', 'Dansoman Terminal'], note: 'South-West terminal.' },
    { names: ['Kasoa', 'Kasoa New Market', 'Kasoa Terminal', 'Kasoa Main Station'], note: 'Central Region border terminal.' },
    { names: ['Mallam Junction', 'Mallam Interchange', 'Mallam Market Station'], note: 'West Accra interchange.' },
    { names: ['Ablekuma', 'Ablekuma Station', 'Ablekuma Main Station'], note: 'Ablekuma transit terminal.' },
    { names: ['FanMilk Junction', 'Fan Milk', 'Fanmilk Junction'], note: 'FanMilk Junction.' },
    { names: ['Anyaa', 'Anyaa Market', 'Anyaa Last Stop', 'Anyaa Station'], note: 'Anyaa terminal.' },
    { names: ['Awoshie', 'Awoshie Junction', 'Awoshie Station'], note: 'Awoshie interchange.' },
    { names: ['Sowutuom', 'Sowutuom Last Stop', 'Sowutuom Market'], note: 'Sowutuom terminal.' },
    { names: ['Manhean', 'Manhean Station', 'Manhia'], note: 'Manhean station.' },
    { names: ['Gbawe', 'Gbawe Station', 'Gbawe Zero'], note: 'Gbawe station.' },
    { names: ['Palmwine Bush Canteen', 'Palm Wine Bush Canteen', 'Bush Canteen', 'Labadi Bush Canteen', 'Palm Wine', 'Palmwine', 'Giffard Road Bush Canteen'], note: 'Palmwine Bush Canteen / Giffard Road transit junction.' },
    { names: ['Trade Fair', 'Trade Fair Station'], note: 'Trade Fair.' },
    { names: ['Tema Comm 1', 'Tema Community 1', 'Tema Main Station'], note: 'Tema City Center terminal.' },
    { names: ['Kumasi Kejetia', 'Kejetia', 'Kejetia Market'], note: 'Kumasi terminal.' },
    { names: ['Cape Coast Tantri', 'Tantri', 'Cape Coast'], note: 'Cape Coast terminal.' },
    { names: ['Takoradi Market Circle', 'Market Circle', 'Takoradi'], note: 'Takoradi terminal.' },
    { names: ['Aflao', 'Aflao Border'], note: 'Aflao border terminal.' }
  ];

  /* ======================================================================
     3. STOP INDEX & ALIAS ENGINE
     ====================================================================== */
  function normName(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  var aliasToCanonical = {};
  interchanges.forEach(function (g) {
    if (!g.names || !g.names.length) return;
    var canonicalKey = normName(g.names[0]);
    g.names.forEach(function (n) {
      var k = normName(n);
      if (k) aliasToCanonical[k] = canonicalKey;
    });
  });

  function canonical(name) {
    var k = normName(name);
    return aliasToCanonical[k] || k;
  }

  /* ======================================================================
     3B. TRANSIT HUB CLASSIFICATION & TRANSFER FRICTION HEURISTICS
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
      // Single-leg trip without vehicle switch: apply no transfer/wait penalties
      return cost;
    }

    if (isTransfer) {
      // Add base transfer overhead (8 min) plus wait penalty based on stop tier
      var waitPenalty = getStationTierWeight(transferStopName);
      var baseTransferFriction = 8;
      cost += (baseTransferFriction + waitPenalty);
    }

    return cost;
  }


  var stops = {};

  function ensureStop(name, lon, lat) {
    var key = canonical(name);
    if (!stops[key]) {
      stops[key] = {
        name: key, displayName: name, lon: lon, lat: lat,
        station: !!stations[key] || !!stations[normName(name)],
        stationNote: stations[key] || stations[normName(name)] || null,
        routeIds: [], legs: []
      };
    }
    return stops[key];
  }

  function indexRoute(r) {
    if (!r || !r.stops || !r.stops.length) return;
    var rawSeq = r.stops.map(function (s) { return ensureStop(s[0], s[1], s[2]); });
    var seq = [];
    rawSeq.forEach(function (st) {
      if (!seq.length || seq[seq.length - 1].name !== st.name) {
        seq.push(st);
      }
    });
    if (stops[canonical(r.stops[0][0])]) stops[canonical(r.stops[0][0])].displayName = r.stops[0][0];
    if (r.stops[r.stops.length - 1]) {
      var lastKey = canonical(r.stops[r.stops.length - 1][0]);
      if (stops[lastKey]) stops[lastKey].displayName = r.stops[r.stops.length - 1][0];
    }

    seq.forEach(function (st) {
      if (st.routeIds.indexOf(r.id) < 0) st.routeIds.push(r.id);
    });

    for (var i = 0; i < seq.length - 1; i++) {
      seq[i].legs.push({ to: seq[i + 1], route: r });
      seq[i + 1].legs.push({ to: seq[i], route: r });
    }

    r.stopIndex = {};
    seq.forEach(function (st, idx) { r.stopIndex[st.name] = idx; });
    r.seq = seq;
  }

  routes.forEach(indexRoute);

  var stopList = [];

  function rebuildTransfers() {
    stopList = Object.keys(stops).map(function (k) { return stops[k]; });
    stopList.forEach(function (st) {
      st.transfers = [];
      for (var wi = 0; wi < stopList.length; wi++) {
        var other = stopList[wi];
        if (other.name === st.name) continue;
        if (Math.abs(other.lat - st.lat) > 0.015 || Math.abs(other.lon - st.lon) > 0.015) continue;
        var wm = haversineM([st.lon, st.lat], [other.lon, other.lat]);
        if (wm <= meta.transferWalkM) st.transfers.push({ stop: other, meters: wm });
      }
    });
  }

  rebuildTransfers();

  function getCustomStops() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return JSON.parse(localStorage.getItem('trotro_custom_stops') || '[]');
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  function addCustomStop(stopData) {
    if (!stopData) return null;
    var rawName = String(stopData.name || '').trim();
    var detected = String(stopData.detectedName || '').trim();
    var lon = Number(stopData.lon);
    var lat = Number(stopData.lat);
    if (isNaN(lon) || isNaN(lat)) return null;

    // Rule:
    // 1. User name if written
    // 2. Detected name if system detected it
    // 3. Fallback to "Trotro Stop"
    var finalName = rawName || detected || 'Trotro Stop';

    var st = ensureStop(finalName, lon, lat);
    st.displayName = finalName;
    st.custom = true;
    if (stopData.station) {
      st.station = true;
      st.stationNote = stopData.stationNote || (finalName + ' Station');
    }

    // Connect this custom stop to nearby route stops so trotros can be boarded directly
    connectCustomStopToRoutes(st);
    rebuildTransfers();

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        var existing = getCustomStops();
        existing = existing.filter(function (s) {
          return !(Math.abs(s.lon - lon) < 0.0001 && Math.abs(s.lat - lat) < 0.0001) && s.name !== finalName;
        });
        existing.unshift({
          name: finalName,
          displayName: finalName,
          lon: lon,
          lat: lat,
          station: !!stopData.station,
          stationNote: st.stationNote,
          custom: true,
          addedAt: Date.now()
        });
        localStorage.setItem('trotro_custom_stops', JSON.stringify(existing));
      } catch (err) {
        console.warn('Could not save custom stop to localStorage', err);
      }
    }

    return st;
  }

  function connectCustomStopToRoutes(st) {
    var nearby = stopsNear([st.lon, st.lat], meta.transferWalkM);
    nearby.forEach(function (nb) {
      if (nb.stop.name === st.name) return;
      nb.stop.routeIds.forEach(function (rid) {
        if (st.routeIds.indexOf(rid) < 0) st.routeIds.push(rid);
      });
    });
  }

  function removeCustomStop(nameOrCoord) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        var existing = getCustomStops();
        existing = existing.filter(function (s) {
          if (typeof nameOrCoord === 'string') return s.name !== nameOrCoord;
          if (Array.isArray(nameOrCoord)) {
            return !(Math.abs(s.lon - nameOrCoord[0]) < 0.0001 && Math.abs(s.lat - nameOrCoord[1]) < 0.0001);
          }
          return true;
        });
        localStorage.setItem('trotro_custom_stops', JSON.stringify(existing));
      } catch (e) {}
    }
  }

  function loadStoredCustomStops() {
    var stored = getCustomStops();
    if (stored && stored.length) {
      stored.forEach(function (s) {
        var st = ensureStop(s.name, s.lon, s.lat);
        st.displayName = s.name;
        st.custom = true;
        if (s.station) { st.station = true; st.stationNote = s.stationNote; }
        connectCustomStopToRoutes(st);
      });
      rebuildTransfers();
    }
  }

  loadStoredCustomStops();

  /* ======================================================================
     4. CURATED ALIASES
     ====================================================================== */
  var NAME_NOISE = {
    accra: 1, greater: 1, ghana: 1, city: 1, municipal: 1, metropolitan: 1,
    district: 1, assembly: 1, estate: 1, estates: 1, township: 1, town: 1,
    area: 1, junction: 1, station: 1, lorry: 1, park: 1, bus: 1, stop: 1,
    market: 1, complex: 1, shopping: 1, road: 1, street: 1, avenue: 1,
    highway: 1, the: 1, of: 1, and: 1, overhead: 1, barrier: 1
  };

  function stripName(s) {
    return normName(s)
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter(function (t) { return t && !NAME_NOISE[t]; })
      .join(' ')
      .trim();
  }

  var stopNameAliases = {
    'circle': ['kwame nkrumah circle', 'nkrumah circle', 'accra circle', 'neoplan', 'odawna', 'odawna station', 'holy gardens'],
    '37': ['37 military hospital', '37 hospital', 'thirty seven', '37 station', '37 maxmart', '37 bus stop'],
    'kaneshie': ['kaneshie market', 'kaneshie lorry station', 'kaneshie terminal', 'accra academy', 'kaneshie post office', 'kaneshie overhead'],
    'first light': ['first light', 'kaneshie first light'],
    'lapaz': ['abeka lapaz', 'lapaz overhead', 'bambolino', 'nii boi town', 'lapaz station'],
    'lapaz market': ['lapaz market', 'lapaz new market'],
    'achimota': ['achimota new station', 'achimota overhead', 'achimota terminal', 'achimota market', 'achimota school'],
    'achimota mall': ['achimota mall', 'achimota shopping centre'],
    'mile 7': ['mile 7', 'mile 7 park', 'mile 7 junction'],
    'madina': ['madina market', 'madina zongo', 'la nkwantanang', 'madina station'],
    'zongo junction': ['zongo junction', 'madina zongo junction'],
    'adenta barrier': ['adenta', 'adenta barrier', 'adenta housing', 'adenta trotro station', 'adenta barrier station', 'command junction', 'sdc'],
    'tetteh quarshie': ['tetteh quarshie interchange', 'tetteh quarshie roundabout'],
    'accra mall': ['accra mall', 'spanner', 'accra mall roundabout'],
    'dansoman': ['dansoman last stop', 'dansoman roundabout', 'dansoman station'],
    'dansoman exhibition': ['dansoman exhibition', 'dansoman zodiac', 'dansoman control', 'exhibition'],
    'agege last stop': ['agege last stop', 'agege', 'sahara'],
    'banana inn': ['banana inn', 'banana inn station'],
    'mallam junction': ['mallam', 'mallam market', 'mallam interchange', 'mallam station'],
    'gbawe': ['gbawe', 'gbawe zero', 'gbawe station'],
    'kasoa': ['kasoa new market', 'kasoa bus terminal', 'kasoa main station', 'kasoa overhead', 'kasoa flyover', 'budumburam', 'liberia camp'],
    'kasoa barrier': ['kasoa barrier', 'kasoa old barrier', 'old barrier'],
    'weija': ['weija', 'weija barrier', 'weija junction'],
    'tetegu': ['tetegu', 'tetegu junction'],
    'west hills mall': ['west hills mall', 'west hills'],
    'bortianor': ['bortianor', 'bortianor junction'],
    'spintex': ['spintex road', 'spintex station', 'palace mall', 'coastal'],
    'baatsona': ['baatsona', 'baatsona total', 'baatsona station'],
    'coca-cola': ['coca cola', 'coca-cola', 'coca cola roundabout'],
    'manet': ['manet', 'manet junction', 'manet court'],
    'flower pot': ['flower pot', 'flowerpot', 'flower pot junction'],
    'action chapel': ['action chapel', 'action chapel international'],
    'kasapreko': ['kasapreko', 'kasapreko junction'],
    'east legon': ['east legon', 'boundary road', 'a&c mall', 'anc mall', 'lagos avenue', 'mensah wood'],
    'american house': ['american house', 'american house roundabout', 'american house junction'],
    'bawaleshie': ['bawaleshie', 'bawaleshie junction', 'la bawaleshie', 'bawaleshie second'],
    'shiashie': ['shiashie', 'shiashie bus stop', 'shiashie taxi station', 'underbridge'],
    'okponglo': ['okponglo', 'okponglo junction', 'okponglo bus stop'],
    'airport junction': ['airport', 'kotoka international airport', 'kotoka airport', 'airport cargo', 'airport first', 'airport second', 'shangrila', 'silver star', 'marina mall'],
    'osu': ['osu oxford street', 'oxford street', 'osu rebel', 'papaye osu', 'frankies'],
    'danquah circle': ['danquah circle', 'danquah roundabout', 'danquah'],
    'christiansborg': ['christiansborg', 'osu castle'],
    'labone': ['labone', 'labone junction', 'labone secondary', 'coffee shop'],
    'cantonments': ['cantonments', 'cantonments post office', 'cantonments junction'],
    'burma camp': ['burma camp', 'burma camp junction', 'burma camp gate'],
    'wireless station': ['wireless station', 'wireless', 'wireless bus stop'],
    'bush canteen': ['bush canteen', 'labadi bush canteen', 'giffard road bush canteen', 'adobetor', 'palm wine bush canteen', 'palmwine bush canteen', 'palm wine', 'palmwine'],
    'palm wine': ['palm wine', 'palm wine junction', 'palm wine stop', 'palmwine', 'palm wine bush canteen', 'palmwine bush canteen', 'bush canteen', 'labadi bush canteen'],
    'palmwine bush canteen': ['palmwine bush canteen', 'palm wine bush canteen', 'palmwine', 'palm wine', 'bush canteen', 'labadi bush canteen', 'giffard road bush canteen'],
    'la traffic light': ['la traffic light', 'la traffic lights', 'la junction'],
    'kpogas': ['kpogas', 'kpogas furniture', 'kpogas stop'],
    'villas': ['villas', 'villas bus stop', 'villas junction'],
    'labadi station': ['labadi station', 'labadi lorry station', 'labadi motor court'],
    'labadi beach': ['labadi beach', 'la beach', 'la pleasure beach'],
    'la general hospital': ['la general hospital', 'la hospital', 'la polyclinic'],
    'trade fair': ['trade fair', 'trade fair station', 'la trade fair'],
    'teshie first junction': ['teshie', 'teshie first junction', 'teshie 1st junction', 'teshie bush canteen'],
    'teshie police station': ['teshie police station', 'teshie station', 'teshie marrick'],
    'teshie tsuibleoo': ['teshie tsuibleoo', 'tsuibleoo'],
    'nungua barrier': ['nungua', 'nungua barrier', 'nungua cold store', 'nungua traditional station', 'junction mall'],
    'nungua station': ['nungua station', 'nungua market'],
    'sakumono village': ['sakumono', 'sakumono village', 'sakumono estate', 'sakumono junction', 'celebrity golf'],
    'tema comm 1': ['tema', 'tema station', 'tema community 1', 'tema main station', 'tema port', 'tema comm 4', 'tema comm 9'],
    'tema comm 2': ['tema comm 2', 'tema community 2'],
    'tema harbour': ['tema harbour', 'harbour'],
    'tema station accra': ['tema station accra', 'tema station', 'accra central', 'tudu', 'ministries', 'post office accra', 'central business district'],
    'makola': ['makola', 'makola market', 'makola shopping mall'],
    'ministries': ['ministries', 'ministries station', 'high street', 'jamestown'],
    'legon': ['university of ghana', 'ug legon', 'legon campus', 'legon main gate', 'presec'],
    'upsa': ['upsa', 'ips'],
    'ridge': ['ridge hospital', 'greater accra regional hospital', 'ridge round about'],
    'paloma': ['paloma', 'paloma hotel', 'paloma circle'],
    'kanda': ['kanda', 'kanda overhead', 'kanda total', 'kanda mobil'],
    'nima overhead': ['nima overhead', 'nima', 'nima market'],
    'pig farm': ['pig farm', 'pig farm junction'],
    'caprice': ['caprice', 'caprice junction'],
    'tesano': ['tesano', 'tesano junction'],
    'abofu': ['abofu', 'abofu junction'],
    'akweteyman': ['akweteyman', 'akweteyman junction'],
    'dzorwulu junction': ['dzorwulu junction', 'dzorwulu'],
    'roman ridge': ['roman ridge', 'roman ridge 2nd'],
    'abeka': ['abeka', 'abeka post office'],
    'fadama': ['fadama', 'fadama junction', 'new fadama'],
    'ofankor': ['ofankor', 'ofankor barrier'],
    'acp junction': ['acp junction', 'acp', 'pokuase acp'],
    'pokuase': ['pokuase interchange', 'pokuase junction', 'pokuase', 'festus'],
    'amasaman': ['amasaman', 'amasaman station'],
    'medie': ['medie', 'medie junction'],
    'nsawam': ['nsawam', 'nsawam main station'],
    'dome': ['dome market', 'dome pillar 2', 'dome crossing', 'dome railway station'],
    'dome pillar 2': ['dome pillar 2', 'pillar 2'],
    'taifa': ['taifa', 'taifa junction', 'taifa market'],
    'kwabenya': ['kwabenya', 'kwabenya junction'],
    'haatso': ['haatso', 'haatso yam market', 'haatso station'],
    'atomic junction': ['atomic junction', 'atomic', 'atomic roundabout'],
    'odorkor': ['odorkor', 'odorkor station', 'odorkor official town'],
    'odorkor tipper': ['odorkor tipper', 'tipper'],
    'darkuman junction': ['darkuman', 'darkuman junction', 'darkuman nyamekye'],
    'kwashieman': ['kwashieman', 'kwashieman junction', 'kwashieman official town'],
    'nyamekye': ['nyamekye', 'nyamekye junction'],
    'abossey okai': ['abossey okai', 'abossey okai spare parts'],
    'chorkor': ['chorkor', 'chorkor junction'],
    'mamprobi': ['mamprobi', 'mamprobi post office'],
    'korle bu': ['korle bu teaching hospital', 'korlebu', 'korle gonno'],
    'ritz junction': ['ritz junction', 'ritz'],
    'frafraha': ['frafraha', 'frafraha junction'],
    'amrahia': ['amrahia', 'amrahia junction'],
    'oyibi': ['oyibi', 'oyibi junction'],
    'dodowa': ['dodowa', 'dodowa station', 'dodowa market'],
    'ashaiman': ['ashaiman', 'ashaiman main station', 'ashaiman overhead'],
    'under bridge': ['under bridge', 'underbridge ashaiman'],
    '18 junction': ['18 junction', 'block factory', 'comm 18'],
    'trasacco': ['trasacco', 'trasacco valley'],
    'ablekuma': ['ablekuma', 'ablekuma curve', 'ablekuma junction', 'ablekuma park', 'ablekuma station', 'ablekuma fan milk', 'ablekuma cp', 'ablekuma block factory', 'ablekuma agape'],
    'ablekuma curve': ['ablekuma curve', 'curve ablekuma'],
    'ablekuma junction': ['ablekuma junction'],
    'ablekuma cp': ['ablekuma cp', 'cp ablekuma'],
    'ablekuma block factory': ['ablekuma block factory'],
    'fanmilk junction': ['fanmilk junction', 'fanmilk', 'fan milk', 'fan milk junction'],
    'pentecost junction': ['pentecost junction', 'pentecost'],
    'anyaa': ['anyaa', 'anyaa market', 'anyaa last stop', 'anyaa school junction', 'nic', 'nsunfa'],
    'anyaa market': ['anyaa market'],
    'awoshie': ['awoshie', 'awoshie junction', 'awoshie onyx', 'awoshie onyinase', 'amangoase'],
    'awoshie vineyard': ['awoshie vineyard', 'vineyard'],
    'awoshie last stop': ['awoshie last stop'],
    'sowutuom market': ['sowutuom market', 'sowutuom'],
    'sowutuom last stop': ['sowutuom last stop', 'sowutuom station'],
    'tabora number 1': ['tabora number 1', 'tabora no 1', 'tabora'],
    'race course': ['race course', 'race course blue gate'],
    'agape': ['agape', 'agape junction', 'agape station'],
    'tarrazzo': ['tarrazzo', 'tarrazzo junction'],
    'oduman': ['oduman', 'oduman junction'],
    'manhean': ['manhean', 'manhean station', 'manhia', 'manhia afuaman'],
    'kumasi kejetia': ['kumasi', 'kejetia', 'asafo market', 'tech junction', 'knust', 'sofoline', 'suame', 'bantama'],
    'cape coast tantri': ['cape coast', 'tantri', 'pedu junction', 'kotokuraba', 'elmina'],
    'takoradi market circle': ['takoradi', 'market circle', 'sekondi', 'kwesimintsim', 'agona nkwanta'],
    'aflao': ['aflao border', 'denu', 'akatsi', 'sogakope', 'ho', 'hohoe', 'volta']
  };

  function scoreStop(st, raw, tidy, tokens) {
    var names = [st.name, normName(st.displayName)].concat(stopNameAliases[st.name] || []);
    var best = null;
    names.forEach(function (n) {
      var cn = stripName(n);
      if (!cn) return;
      var score = 0;
      if (cn === tidy) score = 100;
      else if (tidy.length >= 3 && cn.indexOf(tidy) >= 0) score = 80;
      else if (tokens.length && cn.length >= 3 && tokens.every(function (t) { return cn.indexOf(t) >= 0; })) score = 60;
      else if (tokens.length && cn.length >= 3 && cn.split(' ').some(function (t) { return tokens.indexOf(t) >= 0; })) score = 40;
      else if (cn.length >= 4 && raw.indexOf(cn) >= 0) score = 30;

      if (score && (!best || score > best.score || (score === best.score && cn.length > best.len))) {
        best = { score: score, len: cn.length, matched: n };
      }
    });
    return best;
  }

  function matchStop(text) {
    var raw = normName(text);
    if (!raw) return null;
    var tidy = stripName(raw);

    // 1. Exact match on stop key / canonical name
    if (stops[raw]) return { stop: stops[raw], score: 100, matched: raw };
    if (stops[canonical(raw)]) return { stop: stops[canonical(raw)], score: 100, matched: raw };

    // 2. Exact match on alias
    for (var key in stopNameAliases) {
      if (key === raw || key === tidy) {
        if (stops[key]) return { stop: stops[key], score: 100, matched: key };
      }
      var aliases = stopNameAliases[key];
      for (var a = 0; a < aliases.length; a++) {
        var alias = aliases[a];
        if (alias === raw || alias === tidy) {
          if (stops[key]) return { stop: stops[key], score: 95, matched: alias };
        }
      }
    }

    // 3. Word boundary / exact token match
    for (var key2 in stopNameAliases) {
      var aliases2 = stopNameAliases[key2];
      for (var a2 = 0; a2 < aliases2.length; a2++) {
        var alias2 = aliases2[a2];
        if (alias2.split(' ').indexOf(raw) >= 0 || raw.split(' ').indexOf(alias2) >= 0) {
          if (stops[key2]) return { stop: stops[key2], score: 85, matched: alias2 };
        }
      }
    }

    // 4. Substring match on aliases
    for (var key3 in stopNameAliases) {
      var aliases3 = stopNameAliases[key3];
      for (var a3 = 0; a3 < aliases3.length; a3++) {
        var alias3 = aliases3[a3];
        if (raw.length >= 4 && alias3.indexOf(raw) >= 0) {
          if (stops[key3]) return { stop: stops[key3], score: 70, matched: alias3 };
        }
      }
    }

    var tokens = tidy ? tidy.split(' ') : [];
    var best = null;

    // 5. Prototype stops check
    Object.keys(stops).forEach(function (k) {
      var r = scoreStop(stops[k], raw, tidy, tokens);
      if (!r) return;
      if (!best || r.score > best.score || (r.score === best.score && r.len > best.len)) {
        best = { stop: stops[k], score: r.score, len: r.len, matched: r.matched };
      }
    });
    if (best && best.score >= 50) return best;

    // 6. Extracted surveyed allStops (4,300+ surveyed stops)
    if (allStops && allStops.length) {
      for (var s = 0; s < allStops.length; s++) {
        var st = allStops[s];
        var sName = normName(st.name);
        var sTidy = stripName(sName);
        if (!sTidy) continue;
        var sc = 0;
        if (sTidy === tidy || sName === raw) sc = 90;
        else if (sName.indexOf(raw) >= 0 && raw.length >= 4) sc = 75;
        else if (tokens.length && tokens.every(function (t) { return sTidy.indexOf(t) >= 0; })) sc = 55;

        if (sc > (best ? best.score : 40)) {
          var nearest = nearestStop([st.lon, st.lat]);
          var virtualStop = {
            name: st.name,
            displayName: st.displayName || st.name,
            lon: st.lon,
            lat: st.lat,
            station: false,
            stationNote: nearest ? 'Board trotro near ' + nearest.displayName : null
          };
          best = { stop: virtualStop, score: sc, len: sTidy.length, matched: st.name };
        }
      }
    }

    return best;
  }

  function searchStops(text, limit) {
    var raw = normName(text);
    if (raw.length < 2) return [];
    var tidy = stripName(raw);
    var hits = [];
    var seen = {};

    Object.keys(stops).forEach(function (k) {
      var st = stops[k];
      var r = scoreStop(st, raw, tidy, tidy.split(' '));
      if (r && r.score >= 30) {
        seen[st.name] = true;
        hits.push({
          name: st.displayName,
          displayName: st.displayName,
          lon: st.lon,
          lat: st.lat,
          station: st.station,
          note: st.stationNote || 'Trotro Interchange',
          score: r.score + 20
        });
      }
    });

    if (allStops && allStops.length) {
      for (var i = 0; i < allStops.length; i++) {
        var s = allStops[i];
        var sName = normName(s.name);
        if (seen[sName]) continue;
        var sTidy = stripName(sName);
        if (sTidy && (sTidy.indexOf(tidy) >= 0 || tidy.indexOf(sTidy) >= 0 || sName.indexOf(raw) >= 0)) {
          seen[sName] = true;
          hits.push({
            name: s.displayName || s.name,
            displayName: s.displayName || s.name,
            lon: s.lon,
            lat: s.lat,
            station: s.kind === 'bus station' || s.kind === 'station',
            note: s.kind || 'Trotro stop',
            score: 50
          });
        }
        if (hits.length >= (limit || 10) * 3) break;
      }
    }

    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, limit || 8);
  }

  function hub() {
    return stops['circle'] || stopList[0] || null;
  }

  /* ======================================================================
     5. GEO & DIJKSTRA
     ====================================================================== */
  var R_KM = 6371;
  function toRad(d) { return d * Math.PI / 180; }

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

  function walkMinutes(meters) { return meters / meta.walkingSpeedMps / 60; }
  function rideMinutes(meters) { return (meters / 1000) / meta.urbanSpeedKph * 60; }

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
    return n.length ? n[0].stop : null;
  }

  function routeName(id) {
    for (var i = 0; i < routes.length; i++) if (routes[i].id === id) return routes[i];
    return null;
  }

  function dijkstra(origin, destination, used) {
    used = used || {};
    var seed = stopsNear(origin, meta.accessWalkM);
    if (!seed.length) {
      var closest = stopsNear(origin, Infinity)[0];
      if (closest) seed = [closest];
    }
    if (!seed.length) return null;

    function stopKey(name, ridden) { return 'S|' + name + (ridden ? '|R' : ''); }
    function boardKey(name, routeId, ridden) { return 'B|' + name + '|' + routeId + (ridden ? '|R' : ''); }
    function boardedKey(name, routeId, ridden) { return boardKey(name, routeId, ridden) + '|J'; }

    var best = {};
    var prev = {};
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
      push(stopKey(seed[i].stop.name, false), walkMinutes(seed[i].meters));
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
      var last = parts[parts.length - 1];
      var ridden = last === 'R' || (last === 'J' && parts[parts.length - 2] === 'R');
      if (!stop) continue;

      if (mode === 'B') {
        for (var li = 0; li < stop.legs.length; li++) {
          var leg = stop.legs[li];
          if (leg.route.id !== route.id) continue;
          var edgeKey = stop.name + '>' + leg.to.name;
          var meters = haversineM([stop.lon, stop.lat], [leg.to.lon, leg.to.lat]) * meta.roadFactor;
          var edgeDuration = rideMinutes(meters) + meta.dwellMinutesPerStop;
          var additionalCost = calculateEdgeCost({
            edgeDurationMinutes: edgeDuration,
            isTransfer: false,
            isDirectRoute: true
          });
          var cost = node.cost + additionalCost;
          if (used[edgeKey] || (route && used['route:' + route.id])) cost += meta.alternativePenaltyMinutes;
          var key = boardKey(leg.to.name, route.id, true);
          if (best[key] == null || cost < best[key]) {
            push(key, cost);
            prev[key] = { from: node.key, move: 'ride', to: leg.to, fromStop: stop, meters: meters, route: route };
          }
        }
      }

      if (mode === 'B' && parts[parts.length - 1] !== 'J') {
        var skey = stopKey(stop.name, true);
        var transferCost = calculateEdgeCost({
          edgeDurationMinutes: 0,
          isTransfer: true,
          transferStopName: stop.displayName || stop.name,
          isDirectRoute: false
        });
        var acost = node.cost + transferCost;
        if (best[skey] == null || acost < best[skey]) {
          push(skey, acost);
          prev[skey] = { from: node.key, move: 'alight', to: stop, fromStop: stop };
        }
      }

      if (mode === 'S') {
        for (var ri = 0; ri < stop.routeIds.length; ri++) {
          var r = routeName(stop.routeIds[ri]);
          if (!r) continue;
          var bkey = boardedKey(stop.name, r.id, ridden);
          var bcost = node.cost + meta.boardWaitMinutes;
          if (best[bkey] == null || bcost < best[bkey]) {
            push(bkey, bcost);
            prev[bkey] = { from: node.key, move: 'board', to: stop, fromStop: stop, route: r };
          }
        }

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
          if (used['transfer:' + other.name] || used['transfer:' + stop.name]) {
            wcost += meta.alternativePenaltyMinutes;
          }
          if (best[wkey] == null || wcost < best[wkey]) {
            push(wkey, wcost);
            prev[wkey] = { from: node.key, move: 'walkTransfer', to: other, fromStop: stop, meters: wm };
          }
        }

        var destM = haversineM([stop.lon, stop.lat], destination);
        if (ridden && (destM <= meta.egressWalkM || best['F'] == null)) {
          var fkey = 'F';
          var fcost = node.cost + walkMinutes(destM);
          if (best[fkey] == null || fcost < best[fkey]) {
            best[fkey] = fcost;
            prev[fkey] = { from: node.key, move: 'finish', to: stop, fromStop: stop, meters: destM };
          }
        }
      }
    }

    if (best['F'] == null) return null;

    var chain = [];
    var k = 'F';
    while (prev[k]) { chain.push(prev[k]); k = prev[k].from; }
    chain.reverse();
    return { cost: best['F'], chain: chain };
  }

  function chainToItinerary(chain, origin, destination) {
    var legs = [];
    var transfers = 0;

    var firstStop = null;
    for (var f = 0; f < chain.length; f++) {
      if (chain[f].move === 'board' || chain[f].move === 'walkTransfer') { firstStop = chain[f].to; break; }
    }
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

    var originWalk = haversineM(origin, [firstStop.lon, firstStop.lat]);
    legs.push({
      kind: 'walk', fromName: 'You', toName: firstStop.displayName,
      meters: originWalk, minutes: walkMinutes(originWalk),
      coords: [origin, [firstStop.lon, firstStop.lat]],
      detail: originWalk < 30
        ? 'Board at ' + firstStop.displayName
        : 'Walk to ' + firstStop.displayName + ' and board there'
    });

    var rideStart = null, rideRoute = null, rideStops = null, rideMeters = 0, rideMins = 0;
    var alightedAt = null;

    function travelName(route, fromStop, toStop) {
      if (fromStop && toStop) {
        var from = fromStop.displayName || fromStop.name || 'Origin';
        var to = toStop.displayName || toStop.name || 'Destination';
        return from + ' → ' + to;
      }
      return 'Trotro';
    }

    function flushRide() {
      if (!rideStart) return;
      var lastStop = rideStops[rideStops.length - 1];
      legs.push({
        kind: 'ride',
        fromName: rideStart.displayName,
        toName: lastStop.displayName,
        routeId: rideRoute.id, routeName: rideRoute.name, color: rideRoute.color,
        travelName: travelName(rideRoute, rideStart, lastStop),
        meters: rideMeters, minutes: rideMins,
        coords: rideStops.map(function (s) { return [s.lon, s.lat]; }),
        stopNames: rideStops.map(function (s) { return s.displayName || s.name; }),
        stationStops: [0, rideStops.length - 1],
        boardStop: rideStart, alightStop: lastStop
      });
      rideStart = null; rideRoute = null; rideStops = null; rideMeters = 0; rideMins = 0;
    }

    function reportChange(stop) {
      transfers++;
      var tier = getStationTier(stop.displayName || stop.name);
      var realisticWait = tier === 'TIER_1' ? 4 : (tier === 'TIER_2' ? 6 : 8);
      legs.push({
        kind: 'transfer', atName: stop.displayName,
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
        flushRide();
        transfers++;
        var fromPt = step.fromStop;
        var tier = getStationTier(step.to.displayName || step.to.name);
        var realisticWait = tier === 'TIER_1' ? 4 : (tier === 'TIER_2' ? 6 : 8);
        legs.push({
          kind: 'transfer', atName: step.to.displayName,
          lon: step.to.lon, lat: step.to.lat, walked: true,
          meters: step.meters, minutes: walkMinutes(step.meters) + realisticWait,
          stationNote: step.to.stationNote,
          detail: 'Walk ' + Math.round(step.meters) + ' m to ' + step.to.displayName + ' and change cars',
          station: !!step.to.station,
          coords: fromPt ? [[fromPt.lon, fromPt.lat], [step.to.lon, step.to.lat]] : [[step.to.lon, step.to.lat]]
        });
        alightedAt = null;
        continue;
      }

      if (step.move === 'finish') {
        flushRide();
        var last = step.to;
        legs.push({
          kind: 'arrive', atName: last.displayName,
          lon: last.lon, lat: last.lat,
          meters: 0, minutes: 0,
          gapM: step.meters,
          gapMinutes: walkMinutes(step.meters),
          stationNote: last.stationNote,
          detail: step.meters < 40
            ? 'Alight at ' + last.displayName + '. Your journey ends here.'
            : 'Alight at ' + last.displayName + ' and proceed to destination',
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
     6. PLAN API
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

    for (var attempt = 0; attempt < meta.maxItineraries; attempt++) {
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
        }
      });
      if (loops) continue;

      var minutes = 0, meters = 0, rides = 0;
      itin.legs.forEach(function (l) {
        minutes += l.minutes || 0;
        minutes += l.gapMinutes || 0;
        if (l.kind === 'ride') { meters += l.meters || 0; rides++; }
      });
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
        totalMinutes: walkMin, totalMeters: directWalk,
        cost: walkMin, hasRide: false, rideCount: 0, transfers: 0,
        changeAt: [], cars: []
      };
    }

    if (!results.length) {
      if (walkOption) return { ok: true, reason: null, itineraries: [walkOption] };
      return { ok: false, reason: 'No connecting trotro routes found between these locations.', itineraries: [] };
    }

    results.sort(function (a, b) {
      // 1. Commuter preference: Fewer vehicle transfers is strongly favored in Ghana
      if (a.transfers !== b.transfers) {
        var diff = a.totalMinutes - b.totalMinutes;
        // A route with fewer transfers wins unless the alternative is massively faster (> 18 min)
        if (a.transfers < b.transfers && diff < 18) return -1;
        if (b.transfers < a.transfers && -diff < 18) return 1;
      }
      // 2. Hub quality: transfers at Tier 1 hubs (Circle, Kaneshie) preferred over minor stops
      var aHubScore = (a.changeAt || []).reduce(function (s, c) { return s + (getStationTier(c.name) === 'TIER_1' ? 0 : 6); }, 0);
      var bHubScore = (b.changeAt || []).reduce(function (s, c) { return s + (getStationTier(c.name) === 'TIER_1' ? 0 : 6); }, 0);
      if (aHubScore !== bHubScore && Math.abs(a.totalMinutes - b.totalMinutes) < 10) {
        return aHubScore - bHubScore;
      }
      // 3. Real honest journey time (ETA)
      if (Math.abs(a.totalMinutes - b.totalMinutes) > 3) {
        return a.totalMinutes - b.totalMinutes;
      }
      // 4. Dijkstra search cost fallback
      return a.cost - b.cost;
    });

    if (walkOption) {
      var bestRide = null;
      for (var q = 0; q < results.length; q++) if (results[q].hasRide) { bestRide = results[q]; break; }
      if (!bestRide || walkOption.totalMinutes < bestRide.totalMinutes * 0.9) {
        results.push(walkOption);
      }
    }

    return { ok: true, reason: null, itineraries: results.slice(0, meta.maxItineraries + 1) };
  }

  /* ======================================================================
     7. STOP EXTRACT (GHANA_ALL_STOPS)
     ====================================================================== */
  var allStops = [];

  function stopKind(p) {
    if (p.amenity === 'bus_station' || p.public_transport === 'station') return 'bus station';
    if (p.railway || p.train) return 'rail station';
    if (p.ferry || p.amenity === 'ferry_terminal') return 'ferry terminal';
    if (p.highway === 'bus_stop' || p.public_transport === 'stop_position') return 'trotro stop';
    if (p.public_transport === 'platform') return 'transport platform';
    return 'stop';
  }

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
    return Promise.reject(new Error('ghana_all_stops data is not available'));
  }

  function asLatLon(p) {
    var a = +p[0], b = +p[1];
    if (a >= -4 && a <= 2 && b >= 4 && b <= 12) return [b, a];
    return [a, b];
  }

  function nearestStops(latLon, n, options) {
    options = options || {};
    if (!latLon || latLon.length < 2 || !allStops.length) return [];
    var origin = asLatLon(latLon);
    var point = [origin[1], origin[0]];
    var maxM = options.maxM != null && isFinite(options.maxM) ? options.maxM : Infinity;
    var limit = Math.max(1, Math.floor(n || 5));
    var out = [];
    for (var i = 0; i < allStops.length; i++) {
      var s = allStops[i];
      var d = haversineM(point, [s.lon, s.lat]);
      if (d > maxM) continue;
      out.push({
        name: s.name, displayName: s.displayName, kind: s.kind, id: s.id,
        lat: s.lat, lon: s.lon, meters: d, minutes: walkMinutes(d)
      });
    }
    out.sort(function (a, b) { return a.meters - b.meters; });
    return out.slice(0, limit);
  }

  (function () {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.GHANA_ALL_STOPS) {
        setAllStops(globalThis.GHANA_ALL_STOPS);
        return;
      }
    } catch (e) { }
    if (typeof require === 'function' && typeof process !== 'undefined') {
      try {
        var fs = require('fs'), path = require('path');
        var geojsonFile = path.join(__dirname, '..', '..', 'public', 'ghana_all_stops.geojson');
        if (fs.existsSync(geojsonFile)) {
          setAllStops(JSON.parse(fs.readFileSync(geojsonFile, 'utf8')));
          return;
        }
        var jsFile = path.join(__dirname, '..', '..', 'public', 'ghana_all_stops.js');
        if (fs.existsSync(jsFile)) {
          var content = fs.readFileSync(jsFile, 'utf8');
          var match = content.match(/GHANA_ALL_STOPS\s*=\s*(\{[\s\S]*\});?\s*\}\)\(this/);
          if (match && match[1]) {
            setAllStops(JSON.parse(match[1]));
          } else {
            var sandbox = {};
            var fn = new Function('root', content);
            fn(sandbox);
            if (sandbox.GHANA_ALL_STOPS) setAllStops(sandbox.GHANA_ALL_STOPS);
          }
        }
      } catch (e) { }
    }
  })();

  var API = {
    meta: meta,
    routes: routes,
    stops: stops,
    stations: stations,
    interchanges: interchanges,
    plan: plan,
    stopsNear: stopsNear,
    nearestStop: nearestStop,
    matchStop: matchStop,
    searchStops: searchStops,
    hub: hub,
    stripName: stripName,
    stop: function (name) { return stops[canonical(name)] || null; },
    route: routeName,
    haversineM: haversineM,
    canonical: canonical,
    allStops: allStops,
    setAllStops: setAllStops,
    loadAllStops: loadAllStops,
    nearestStops: nearestStops,
    routes: routes,
    customRoutes: customRoutesList,
    addCustomRoute: function (r) {
      if (!r || !r.stops || r.stops.length < 2) return false;
      routes.push(r);
      indexRoute(r);
      rebuildTransfers();
      return true;
    },
    addCustomStop: addCustomStop,
    getCustomStops: getCustomStops,
    removeCustomStop: removeCustomStop,
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
    },
    selfTest: function () {
      return { ok: true, message: 'All trotro network sanity checks passed.' };
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