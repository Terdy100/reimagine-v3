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
    transferPenaltyMinutes: 12.0,  // preference for fewer transfers
    accessWalkM: 3500,            // maximum walking distance to catch first car
    egressWalkM: 4500,            // maximum distance from alight stop to destination
    transferWalkM: 850,           // maximum walk between stops to change cars
    maxWalkOnlyM: 2500,           // offer walk-only option if under 2.5km
    maxTransfers: 3,
    maxItineraries: 4,
    alternativePenaltyMinutes: 8,
    stopMergeRadiusM: 200,        // same-name entries closer than this are one physical stop
    accessWalkWeight: 2.0         // walking to the first car / from the last car counts double vs riding
  };

  /* ======================================================================
     1. COMPLETE REAL ACCRA & GHANA TRANSIT CORRIDORS
     With dense, surveyed intermediate bus stops.
     ====================================================================== */
  var routes = [
  {
    "id": "bushcanteen-osu",
    "name": "Bush Canteen ⇄ Osu",
    "color": "#0284c7",
    "stops": [
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ],
      [
        "Villas",
        -0.15,
        5.57
      ],
      [
        "Kpogas",
        -0.1502,
        5.567
      ],
      [
        "La Traffic Light",
        -0.151,
        5.568
      ],
      [
        "Palm Wine",
        -0.152,
        5.5695
      ],
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ],
      [
        "Labadi Bush Canteen",
        -0.15419,
        5.57527
      ],
      [
        "Wireless Station",
        -0.158,
        5.5705
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "Cantonments",
        -0.17,
        5.575
      ],
      [
        "Labone",
        -0.1725,
        5.5621
      ],
      [
        "Danquah Circle",
        -0.1795,
        5.5645
      ],
      [
        "Osu",
        -0.1822,
        5.5562
      ]
    ]
  },
  {
    "id": "osu-bushcanteen",
    "name": "Osu ⇄ Bush Canteen",
    "color": "#0284c7",
    "stops": [
      [
        "Osu",
        -0.1822,
        5.5562
      ],
      [
        "Danquah Circle",
        -0.1795,
        5.5645
      ],
      [
        "Labone",
        -0.1725,
        5.5621
      ],
      [
        "Cantonments",
        -0.17,
        5.575
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "Wireless Station",
        -0.158,
        5.5705
      ],
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ],
      [
        "La Traffic Light",
        -0.151,
        5.568
      ],
      [
        "Kpogas",
        -0.1502,
        5.567
      ],
      [
        "Villas",
        -0.15,
        5.57
      ],
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ]
    ]
  },
  {
    "id": "bushcanteen-circle",
    "name": "Bush Canteen ⇄ Circle",
    "color": "#0369a1",
    "stops": [
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ],
      [
        "Villas",
        -0.15,
        5.57
      ],
      [
        "Kpogas",
        -0.1502,
        5.567
      ],
      [
        "La Traffic Light",
        -0.151,
        5.568
      ],
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ],
      [
        "Wireless Station",
        -0.158,
        5.5705
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "Cantonments",
        -0.17,
        5.575
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Pig Farm",
        -0.1962,
        5.589
      ],
      [
        "Nima Overhead",
        -0.1947,
        5.5941
      ],
      [
        "Kanda",
        -0.2018,
        5.5728
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "circle-bushcanteen",
    "name": "Circle ⇄ Bush Canteen",
    "color": "#0369a1",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Kanda",
        -0.2018,
        5.5728
      ],
      [
        "Nima Overhead",
        -0.1947,
        5.5941
      ],
      [
        "Pig Farm",
        -0.1962,
        5.589
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Cantonments",
        -0.17,
        5.575
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "Wireless Station",
        -0.158,
        5.5705
      ],
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ],
      [
        "La Traffic Light",
        -0.151,
        5.568
      ],
      [
        "Kpogas",
        -0.1502,
        5.567
      ],
      [
        "Villas",
        -0.15,
        5.57
      ],
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ]
    ]
  },
  {
    "id": "bushcanteen-madina",
    "name": "Bush Canteen ⇄ Madina",
    "color": "#2563eb",
    "stops": [
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ],
      [
        "Wireless Station",
        -0.158,
        5.5705
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Okponglo",
        -0.1791,
        5.6325
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "UPSA",
        -0.1691,
        5.6575
      ],
      [
        "Zongo Junction",
        -0.1672,
        5.6721
      ],
      [
        "Madina",
        -0.168,
        5.683
      ]
    ]
  },
  {
    "id": "madina-bushcanteen",
    "name": "Madina ⇄ Bush Canteen",
    "color": "#2563eb",
    "stops": [
      [
        "Madina",
        -0.168,
        5.683
      ],
      [
        "Zongo Junction",
        -0.1672,
        5.6721
      ],
      [
        "UPSA",
        -0.1691,
        5.6575
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "Okponglo",
        -0.1791,
        5.6325
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "Wireless Station",
        -0.158,
        5.5705
      ],
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ]
    ]
  },
  {
    "id": "temastation-tema",
    "name": "Accra Central ⇄ Tema",
    "color": "#059669",
    "stops": [
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ],
      [
        "Ministries",
        -0.1983,
        5.5492
      ],
      [
        "Osu",
        -0.1822,
        5.5562
      ],
      [
        "Danquah Circle",
        -0.1795,
        5.5645
      ],
      [
        "Labone",
        -0.1725,
        5.5621
      ],
      [
        "La General Hospital",
        -0.1601,
        5.5684
      ],
      [
        "Labadi Station",
        -0.1542,
        5.567
      ],
      [
        "Labadi Beach",
        -0.1491,
        5.5641
      ],
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ],
      [
        "Teshie First Junction",
        -0.1189,
        5.5843
      ],
      [
        "Teshie Police Station",
        -0.1084,
        5.5862
      ],
      [
        "Teshie Tsuibleoo",
        -0.1021,
        5.5995
      ],
      [
        "Nungua Barrier",
        -0.0862,
        5.6021
      ],
      [
        "Nungua Station",
        -0.0768,
        5.6048
      ],
      [
        "Sakumono Village",
        -0.0531,
        5.6262
      ],
      [
        "Tema Comm 2",
        -0.0151,
        5.6565
      ],
      [
        "Tema Comm 1",
        -0.0078,
        5.6482
      ],
      [
        "Tema Harbour",
        -0.0019,
        5.6415
      ]
    ]
  },
  {
    "id": "tema-temastation",
    "name": "Tema ⇄ Accra Central",
    "color": "#059669",
    "stops": [
      [
        "Tema Harbour",
        -0.0019,
        5.6415
      ],
      [
        "Tema Comm 1",
        -0.0078,
        5.6482
      ],
      [
        "Tema Comm 2",
        -0.0151,
        5.6565
      ],
      [
        "Sakumono Village",
        -0.0531,
        5.6262
      ],
      [
        "Nungua Station",
        -0.0768,
        5.6048
      ],
      [
        "Nungua Barrier",
        -0.0862,
        5.6021
      ],
      [
        "Teshie Tsuibleoo",
        -0.1021,
        5.5995
      ],
      [
        "Teshie Police Station",
        -0.1084,
        5.5862
      ],
      [
        "Teshie First Junction",
        -0.1189,
        5.5843
      ],
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ],
      [
        "Labadi Beach",
        -0.1491,
        5.5641
      ],
      [
        "Labadi Station",
        -0.1542,
        5.567
      ],
      [
        "La General Hospital",
        -0.1601,
        5.5684
      ],
      [
        "Labone",
        -0.1725,
        5.5621
      ],
      [
        "Danquah Circle",
        -0.1795,
        5.5645
      ],
      [
        "Osu",
        -0.1822,
        5.5562
      ],
      [
        "Ministries",
        -0.1983,
        5.5492
      ],
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ]
    ]
  },
  {
    "id": "circle-nungua",
    "name": "Circle ⇄ Nungua",
    "color": "#0891b2",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Paloma",
        -0.2059,
        5.5721
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ],
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ],
      [
        "Teshie First Junction",
        -0.1189,
        5.5843
      ],
      [
        "Nungua Barrier",
        -0.0862,
        5.6021
      ]
    ]
  },
  {
    "id": "nungua-circle",
    "name": "Nungua ⇄ Circle",
    "color": "#0891b2",
    "stops": [
      [
        "Nungua Barrier",
        -0.0862,
        5.6021
      ],
      [
        "Teshie First Junction",
        -0.1189,
        5.5843
      ],
      [
        "Trade Fair",
        -0.1425,
        5.5801
      ],
      [
        "Palmwine Bush Canteen",
        -0.153,
        5.572
      ],
      [
        "Burma Camp",
        -0.16,
        5.571
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Paloma",
        -0.2059,
        5.5721
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "madina-circle",
    "name": "Madina ⇄ Circle",
    "color": "#1d4ed8",
    "stops": [
      [
        "Madina",
        -0.168,
        5.683
      ],
      [
        "Zongo Junction",
        -0.1672,
        5.6721
      ],
      [
        "UPSA",
        -0.1691,
        5.6575
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "Okponglo",
        -0.1791,
        5.6325
      ],
      [
        "Bawaleshie",
        -0.1649,
        5.6421
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Accra Mall",
        -0.1743,
        5.6236
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Airport First",
        -0.1773,
        5.6065
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Pig Farm",
        -0.1962,
        5.589
      ],
      [
        "Nima Overhead",
        -0.1947,
        5.5941
      ],
      [
        "Kanda",
        -0.2018,
        5.5728
      ],
      [
        "Paloma",
        -0.2059,
        5.5721
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "circle-madina",
    "name": "Circle ⇄ Madina",
    "color": "#1d4ed8",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Paloma",
        -0.2059,
        5.5721
      ],
      [
        "Kanda",
        -0.2018,
        5.5728
      ],
      [
        "Nima Overhead",
        -0.1947,
        5.5941
      ],
      [
        "Pig Farm",
        -0.1962,
        5.589
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "Airport First",
        -0.1773,
        5.6065
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Accra Mall",
        -0.1743,
        5.6236
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Bawaleshie",
        -0.1649,
        5.6421
      ],
      [
        "Okponglo",
        -0.1791,
        5.6325
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "UPSA",
        -0.1691,
        5.6575
      ],
      [
        "Zongo Junction",
        -0.1672,
        5.6721
      ],
      [
        "Madina",
        -0.168,
        5.683
      ]
    ]
  },
  {
    "id": "adenta-madina",
    "name": "Adenta ⇄ Madina",
    "color": "#d93025",
    "stops": [
      [
        "Dodowa",
        -0.0952,
        5.8821
      ],
      [
        "Oyibi",
        -0.1215,
        5.7891
      ],
      [
        "Amrahia",
        -0.1342,
        5.7621
      ],
      [
        "Frafraha",
        -0.1451,
        5.7381
      ],
      [
        "Adenta Housing",
        -0.1542,
        5.7191
      ],
      [
        "Adenta Barrier",
        -0.1581,
        5.7082
      ],
      [
        "Ritz Junction",
        -0.1645,
        5.6912
      ],
      [
        "Madina",
        -0.168,
        5.683
      ]
    ]
  },
  {
    "id": "madina-adenta",
    "name": "Madina ⇄ Adenta",
    "color": "#d93025",
    "stops": [
      [
        "Madina",
        -0.168,
        5.683
      ],
      [
        "Ritz Junction",
        -0.1645,
        5.6912
      ],
      [
        "Adenta Barrier",
        -0.1581,
        5.7082
      ],
      [
        "Adenta Housing",
        -0.1542,
        5.7191
      ],
      [
        "Frafraha",
        -0.1451,
        5.7381
      ],
      [
        "Amrahia",
        -0.1342,
        5.7621
      ],
      [
        "Oyibi",
        -0.1215,
        5.7891
      ],
      [
        "Dodowa",
        -0.0952,
        5.8821
      ]
    ]
  },
  {
    "id": "temastation-madina",
    "name": "Accra Central ⇄ Madina",
    "color": "#1e40af",
    "stops": [
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ],
      [
        "Ministries",
        -0.1983,
        5.5492
      ],
      [
        "Ridge",
        -0.185,
        5.57
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "UPSA",
        -0.1691,
        5.6575
      ],
      [
        "Madina",
        -0.168,
        5.683
      ]
    ]
  },
  {
    "id": "madina-temastation",
    "name": "Madina ⇄ Accra Central",
    "color": "#1e40af",
    "stops": [
      [
        "Madina",
        -0.168,
        5.683
      ],
      [
        "UPSA",
        -0.1691,
        5.6575
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Ridge",
        -0.185,
        5.57
      ],
      [
        "Ministries",
        -0.1983,
        5.5492
      ],
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ]
    ]
  },
  {
    "id": "circle-kasoa",
    "name": "Circle ⇄ Kasoa",
    "color": "#ea580c",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Abossey Okai",
        -0.2371,
        5.5532
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "Odorkor Tipper",
        -0.2711,
        5.5719
      ],
      [
        "Darkuman Junction",
        -0.278,
        5.571
      ],
      [
        "Kwashieman",
        -0.2711,
        5.584
      ],
      [
        "Mallam Market",
        -0.2882,
        5.5739
      ],
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ],
      [
        "Gbawe",
        -0.3021,
        5.5901
      ],
      [
        "Weija",
        -0.3341,
        5.5645
      ],
      [
        "Tetegu",
        -0.3451,
        5.5581
      ],
      [
        "West Hills Mall",
        -0.3582,
        5.5539
      ],
      [
        "Bortianor",
        -0.3725,
        5.5492
      ],
      [
        "Kasoa Barrier",
        -0.4191,
        5.5358
      ],
      [
        "Kasoa",
        -0.4262,
        5.5342
      ]
    ]
  },
  {
    "id": "kasoa-circle",
    "name": "Kasoa ⇄ Circle",
    "color": "#ea580c",
    "stops": [
      [
        "Kasoa",
        -0.4262,
        5.5342
      ],
      [
        "Kasoa Barrier",
        -0.4191,
        5.5358
      ],
      [
        "Bortianor",
        -0.3725,
        5.5492
      ],
      [
        "West Hills Mall",
        -0.3582,
        5.5539
      ],
      [
        "Tetegu",
        -0.3451,
        5.5581
      ],
      [
        "Weija",
        -0.3341,
        5.5645
      ],
      [
        "Gbawe",
        -0.3021,
        5.5901
      ],
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ],
      [
        "Mallam Market",
        -0.2882,
        5.5739
      ],
      [
        "Kwashieman",
        -0.2711,
        5.584
      ],
      [
        "Darkuman Junction",
        -0.278,
        5.571
      ],
      [
        "Odorkor Tipper",
        -0.2711,
        5.5719
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "Abossey Okai",
        -0.2371,
        5.5532
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "kaneshie-madina",
    "name": "Kaneshie ⇄ Madina",
    "color": "#8b5cf6",
    "stops": [
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "Abossey Okai",
        -0.2371,
        5.5532
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "Madina",
        -0.168,
        5.683
      ]
    ]
  },
  {
    "id": "madina-kaneshie",
    "name": "Madina ⇄ Kaneshie",
    "color": "#8b5cf6",
    "stops": [
      [
        "Madina",
        -0.168,
        5.683
      ],
      [
        "Legon",
        -0.186,
        5.65
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Abossey Okai",
        -0.2371,
        5.5532
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ]
    ]
  },
  {
    "id": "temastation-kasoa",
    "name": "Accra Central ⇄ Kasoa",
    "color": "#f59e0b",
    "stops": [
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ],
      [
        "Makola",
        -0.2098,
        5.5419
      ],
      [
        "Korle Bu",
        -0.228,
        5.538
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ],
      [
        "Weija",
        -0.3341,
        5.5645
      ],
      [
        "Kasoa Barrier",
        -0.4191,
        5.5358
      ],
      [
        "Kasoa",
        -0.4262,
        5.5342
      ]
    ]
  },
  {
    "id": "kasoa-temastation",
    "name": "Kasoa ⇄ Accra Central",
    "color": "#f59e0b",
    "stops": [
      [
        "Kasoa",
        -0.4262,
        5.5342
      ],
      [
        "Kasoa Barrier",
        -0.4191,
        5.5358
      ],
      [
        "Weija",
        -0.3341,
        5.5645
      ],
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "Korle Bu",
        -0.228,
        5.538
      ],
      [
        "Makola",
        -0.2098,
        5.5419
      ],
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ]
    ]
  },
  {
    "id": "mallam-lapaz-tema",
    "name": "Mallam ⇄ Lapaz ⇄ Tema",
    "color": "#0e7490",
    "stops": [
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ],
      [
        "Kwashieman",
        -0.2711,
        5.584
      ],
      [
        "Darkuman Junction",
        -0.2581,
        5.5762
      ],
      [
        "Nyamekye",
        -0.2564,
        5.6029
      ],
      [
        "Lapaz",
        -0.2458,
        5.5998
      ],
      [
        "Lapaz Market",
        -0.2405,
        5.609
      ],
      [
        "Bambolino",
        -0.2424,
        5.6087
      ],
      [
        "Akweteyman",
        -0.2318,
        5.6111
      ],
      [
        "Achimota",
        -0.2281,
        5.6111
      ],
      [
        "Abofu",
        -0.2229,
        5.614
      ],
      [
        "Dzorwulu Junction",
        -0.2071,
        5.6071
      ],
      [
        "Roman Ridge",
        -0.1989,
        5.6018
      ],
      [
        "Airport Junction",
        -0.1795,
        5.622
      ],
      [
        "Accra Mall",
        -0.1743,
        5.6236
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Action Chapel",
        -0.1655,
        5.6268
      ],
      [
        "Manet",
        -0.1281,
        5.6409
      ],
      [
        "Trasacco",
        -0.1177,
        5.6451
      ],
      [
        "18 Junction",
        -0.0757,
        5.6606
      ],
      [
        "Abattoir",
        -0.0714,
        5.6622
      ],
      [
        "Under Bridge",
        -0.0436,
        5.6748
      ],
      [
        "Ashaiman",
        -0.0381,
        5.6982
      ],
      [
        "Tema Comm 1",
        -0.0078,
        5.6482
      ]
    ]
  },
  {
    "id": "tema-lapaz-mallam",
    "name": "Tema ⇄ Lapaz ⇄ Mallam",
    "color": "#0e7490",
    "stops": [
      [
        "Tema Comm 1",
        -0.0078,
        5.6482
      ],
      [
        "Ashaiman",
        -0.0381,
        5.6982
      ],
      [
        "Under Bridge",
        -0.0436,
        5.6748
      ],
      [
        "Abattoir",
        -0.0714,
        5.6622
      ],
      [
        "18 Junction",
        -0.0757,
        5.6606
      ],
      [
        "Trasacco",
        -0.1177,
        5.6451
      ],
      [
        "Manet",
        -0.1281,
        5.6409
      ],
      [
        "Action Chapel",
        -0.1655,
        5.6268
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Accra Mall",
        -0.1743,
        5.6236
      ],
      [
        "Airport Junction",
        -0.1795,
        5.622
      ],
      [
        "Roman Ridge",
        -0.1989,
        5.6018
      ],
      [
        "Dzorwulu Junction",
        -0.2071,
        5.6071
      ],
      [
        "Abofu",
        -0.2229,
        5.614
      ],
      [
        "Achimota",
        -0.2281,
        5.6111
      ],
      [
        "Akweteyman",
        -0.2318,
        5.6111
      ],
      [
        "Bambolino",
        -0.2424,
        5.6087
      ],
      [
        "Lapaz Market",
        -0.2405,
        5.609
      ],
      [
        "Lapaz",
        -0.2458,
        5.5998
      ],
      [
        "Nyamekye",
        -0.2564,
        5.6029
      ],
      [
        "Darkuman Junction",
        -0.2581,
        5.5762
      ],
      [
        "Kwashieman",
        -0.2711,
        5.584
      ],
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ]
    ]
  },
  {
    "id": "lapaz-circle",
    "name": "Lapaz ⇄ Circle",
    "color": "#16a34a",
    "stops": [
      [
        "Lapaz",
        -0.2458,
        5.5998
      ],
      [
        "Abeka",
        -0.24,
        5.591
      ],
      [
        "Fadama",
        -0.235,
        5.582
      ],
      [
        "Caprice",
        -0.222,
        5.578
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "circle-lapaz",
    "name": "Circle ⇄ Lapaz",
    "color": "#16a34a",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Caprice",
        -0.222,
        5.578
      ],
      [
        "Fadama",
        -0.235,
        5.582
      ],
      [
        "Abeka",
        -0.24,
        5.591
      ],
      [
        "Lapaz",
        -0.2458,
        5.5998
      ]
    ]
  },
  {
    "id": "lapaz-kaneshie",
    "name": "Lapaz ⇄ Kaneshie",
    "color": "#15803d",
    "stops": [
      [
        "Lapaz",
        -0.2458,
        5.5998
      ],
      [
        "Nyamekye",
        -0.2564,
        5.6029
      ],
      [
        "Darkuman Junction",
        -0.2581,
        5.5762
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ]
    ]
  },
  {
    "id": "kaneshie-lapaz",
    "name": "Kaneshie ⇄ Lapaz",
    "color": "#15803d",
    "stops": [
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "Darkuman Junction",
        -0.2581,
        5.5762
      ],
      [
        "Nyamekye",
        -0.2564,
        5.6029
      ],
      [
        "Lapaz",
        -0.2458,
        5.5998
      ]
    ]
  },
  {
    "id": "temastation-ablekuma",
    "name": "Accra Central ⇄ Ablekuma ⇄ Manhean",
    "color": "#0284c7",
    "stops": [
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ],
      [
        "Makola",
        -0.2098,
        5.5419
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "Awoshie Vineyard",
        -0.2744,
        5.5845
      ],
      [
        "Awoshie",
        -0.2789,
        5.587
      ],
      [
        "Awoshie Last Stop",
        -0.2872,
        5.5919
      ],
      [
        "Anyaa Market",
        -0.2907,
        5.5991
      ],
      [
        "Anyaa",
        -0.2945,
        5.6051
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Pentecost Junction",
        -0.3067,
        5.6259
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ],
      [
        "Ablekuma CP",
        -0.3236,
        5.6317
      ],
      [
        "Ablekuma Block Factory",
        -0.3244,
        5.6323
      ],
      [
        "Oduman",
        -0.3337,
        5.6399
      ],
      [
        "Manhean",
        -0.3458,
        5.6423
      ]
    ]
  },
  {
    "id": "ablekuma-temastation",
    "name": "Manhean ⇄ Ablekuma ⇄ Accra Central",
    "color": "#0284c7",
    "stops": [
      [
        "Manhean",
        -0.3458,
        5.6423
      ],
      [
        "Oduman",
        -0.3337,
        5.6399
      ],
      [
        "Ablekuma Block Factory",
        -0.3244,
        5.6323
      ],
      [
        "Ablekuma CP",
        -0.3236,
        5.6317
      ],
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "Pentecost Junction",
        -0.3067,
        5.6259
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Anyaa",
        -0.2945,
        5.6051
      ],
      [
        "Anyaa Market",
        -0.2907,
        5.5991
      ],
      [
        "Awoshie Last Stop",
        -0.2872,
        5.5919
      ],
      [
        "Awoshie",
        -0.2789,
        5.587
      ],
      [
        "Awoshie Vineyard",
        -0.2744,
        5.5845
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "Makola",
        -0.2098,
        5.5419
      ],
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ]
    ]
  },
  {
    "id": "circle-ablekuma",
    "name": "Circle ⇄ Awoshie ⇄ Ablekuma",
    "color": "#0369a1",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Abossey Okai",
        -0.2371,
        5.5532
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "Awoshie",
        -0.2789,
        5.587
      ],
      [
        "Anyaa",
        -0.2945,
        5.6051
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ]
    ]
  },
  {
    "id": "ablekuma-circle",
    "name": "Ablekuma ⇄ Awoshie ⇄ Circle",
    "color": "#0369a1",
    "stops": [
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Anyaa",
        -0.2945,
        5.6051
      ],
      [
        "Awoshie",
        -0.2789,
        5.587
      ],
      [
        "Odorkor",
        -0.2642,
        5.5668
      ],
      [
        "First Light",
        -0.2561,
        5.5632
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "Abossey Okai",
        -0.2371,
        5.5532
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "lapaz-sowutuom-ablekuma",
    "name": "Lapaz ⇄ Sowutuom ⇄ Ablekuma",
    "color": "#16a34a",
    "stops": [
      [
        "Lapaz",
        -0.2458,
        5.5998
      ],
      [
        "Tabora Number 1",
        -0.2578,
        5.6037
      ],
      [
        "Race Course",
        -0.264,
        5.6091
      ],
      [
        "Sowutuom Market",
        -0.2768,
        5.62
      ],
      [
        "Sowutuom Last Stop",
        -0.2845,
        5.6252
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ],
      [
        "Manhean",
        -0.3458,
        5.6423
      ]
    ]
  },
  {
    "id": "ablekuma-sowutuom-lapaz",
    "name": "Ablekuma ⇄ Sowutuom ⇄ Lapaz",
    "color": "#16a34a",
    "stops": [
      [
        "Manhean",
        -0.3458,
        5.6423
      ],
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Sowutuom Last Stop",
        -0.2845,
        5.6252
      ],
      [
        "Sowutuom Market",
        -0.2768,
        5.62
      ],
      [
        "Race Course",
        -0.264,
        5.6091
      ],
      [
        "Tabora Number 1",
        -0.2578,
        5.6037
      ],
      [
        "Lapaz",
        -0.2458,
        5.5998
      ]
    ]
  },
  {
    "id": "lapaz-awoshie-ablekuma",
    "name": "Lapaz ⇄ Awoshie ⇄ Ablekuma",
    "color": "#15803d",
    "stops": [
      [
        "Lapaz",
        -0.2458,
        5.5998
      ],
      [
        "Nyamekye",
        -0.2564,
        5.6029
      ],
      [
        "Kwashieman",
        -0.2711,
        5.584
      ],
      [
        "Awoshie",
        -0.2789,
        5.587
      ],
      [
        "Anyaa Market",
        -0.2907,
        5.5991
      ],
      [
        "Anyaa",
        -0.2945,
        5.6051
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ]
    ]
  },
  {
    "id": "ablekuma-awoshie-lapaz",
    "name": "Ablekuma ⇄ Awoshie ⇄ Lapaz",
    "color": "#15803d",
    "stops": [
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Junction",
        -0.3087,
        5.627
      ],
      [
        "FanMilk Junction",
        -0.2992,
        5.6219
      ],
      [
        "Anyaa",
        -0.2945,
        5.6051
      ],
      [
        "Anyaa Market",
        -0.2907,
        5.5991
      ],
      [
        "Awoshie",
        -0.2789,
        5.587
      ],
      [
        "Kwashieman",
        -0.2711,
        5.584
      ],
      [
        "Nyamekye",
        -0.2564,
        5.6029
      ],
      [
        "Lapaz",
        -0.2458,
        5.5998
      ]
    ]
  },
  {
    "id": "mallam-gbawe-ablekuma",
    "name": "Mallam ⇄ Gbawe ⇄ Ablekuma",
    "color": "#ca8a04",
    "stops": [
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ],
      [
        "Gbawe",
        -0.3021,
        5.5901
      ],
      [
        "Tarrazzo",
        -0.312,
        5.616
      ],
      [
        "Agape",
        -0.3295,
        5.6092
      ],
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ]
    ]
  },
  {
    "id": "ablekuma-gbawe-mallam",
    "name": "Ablekuma ⇄ Gbawe ⇄ Mallam",
    "color": "#ca8a04",
    "stops": [
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma Curve",
        -0.312,
        5.6271
      ],
      [
        "Agape",
        -0.3295,
        5.6092
      ],
      [
        "Tarrazzo",
        -0.312,
        5.616
      ],
      [
        "Gbawe",
        -0.3021,
        5.5901
      ],
      [
        "Mallam Junction",
        -0.2938,
        5.5771
      ]
    ]
  },
  {
    "id": "pokuase-ablekuma",
    "name": "Pokuase ⇄ Ablekuma",
    "color": "#4f46e5",
    "stops": [
      [
        "Pokuase",
        -0.2921,
        5.6952
      ],
      [
        "ACP Junction",
        -0.2773,
        5.6841
      ],
      [
        "Ablekuma CP",
        -0.3236,
        5.6317
      ],
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ]
    ]
  },
  {
    "id": "ablekuma-pokuase",
    "name": "Ablekuma ⇄ Pokuase",
    "color": "#4f46e5",
    "stops": [
      [
        "Ablekuma",
        -0.3102,
        5.6272
      ],
      [
        "Ablekuma CP",
        -0.3236,
        5.6317
      ],
      [
        "ACP Junction",
        -0.2773,
        5.6841
      ],
      [
        "Pokuase",
        -0.2921,
        5.6952
      ]
    ]
  },
  {
    "id": "circle-nsawam",
    "name": "Circle ⇄ Nsawam",
    "color": "#4b5563",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Caprice",
        -0.222,
        5.578
      ],
      [
        "Tesano",
        -0.2259,
        5.6045
      ],
      [
        "Abofu",
        -0.2229,
        5.614
      ],
      [
        "Achimota",
        -0.2312,
        5.6192
      ],
      [
        "Achimota Mall",
        -0.2415,
        5.6374
      ],
      [
        "Mile 7",
        -0.2424,
        5.6389
      ],
      [
        "St Johns",
        -0.245,
        5.642
      ],
      [
        "Ofankor",
        -0.2681,
        5.6582
      ],
      [
        "ACP Junction",
        -0.2773,
        5.6841
      ],
      [
        "Pokuase",
        -0.2921,
        5.6952
      ],
      [
        "Fusi Junction",
        -0.292,
        5.6984
      ],
      [
        "Amasaman",
        -0.3051,
        5.7092
      ],
      [
        "Medie",
        -0.3282,
        5.7581
      ],
      [
        "Nsawam",
        -0.3512,
        5.8081
      ]
    ]
  },
  {
    "id": "nsawam-circle",
    "name": "Nsawam ⇄ Circle",
    "color": "#4b5563",
    "stops": [
      [
        "Nsawam",
        -0.3512,
        5.8081
      ],
      [
        "Medie",
        -0.3282,
        5.7581
      ],
      [
        "Amasaman",
        -0.3051,
        5.7092
      ],
      [
        "Fusi Junction",
        -0.292,
        5.6984
      ],
      [
        "Pokuase",
        -0.2921,
        5.6952
      ],
      [
        "ACP Junction",
        -0.2773,
        5.6841
      ],
      [
        "Ofankor",
        -0.2681,
        5.6582
      ],
      [
        "St Johns",
        -0.245,
        5.642
      ],
      [
        "Mile 7",
        -0.2424,
        5.6389
      ],
      [
        "Achimota Mall",
        -0.2415,
        5.6374
      ],
      [
        "Achimota",
        -0.2312,
        5.6192
      ],
      [
        "Abofu",
        -0.2229,
        5.614
      ],
      [
        "Tesano",
        -0.2259,
        5.6045
      ],
      [
        "Caprice",
        -0.222,
        5.578
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "achimota-madina",
    "name": "Achimota ⇄ Madina",
    "color": "#b45309",
    "stops": [
      [
        "Achimota",
        -0.2312,
        5.6192
      ],
      [
        "Mile 7",
        -0.2424,
        5.6389
      ],
      [
        "Dome Pillar 2",
        -0.235,
        5.645
      ],
      [
        "Dome",
        -0.238,
        5.648
      ],
      [
        "Taifa",
        -0.2524,
        5.6495
      ],
      [
        "Kwabenya",
        -0.245,
        5.665
      ],
      [
        "Haatso",
        -0.21,
        5.658
      ],
      [
        "Atomic Junction",
        -0.18,
        5.665
      ],
      [
        "Madina",
        -0.168,
        5.683
      ]
    ]
  },
  {
    "id": "madina-achimota",
    "name": "Madina ⇄ Achimota",
    "color": "#b45309",
    "stops": [
      [
        "Madina",
        -0.168,
        5.683
      ],
      [
        "Atomic Junction",
        -0.18,
        5.665
      ],
      [
        "Haatso",
        -0.21,
        5.658
      ],
      [
        "Kwabenya",
        -0.245,
        5.665
      ],
      [
        "Taifa",
        -0.2524,
        5.6495
      ],
      [
        "Dome",
        -0.238,
        5.648
      ],
      [
        "Dome Pillar 2",
        -0.235,
        5.645
      ],
      [
        "Mile 7",
        -0.2424,
        5.6389
      ],
      [
        "Achimota",
        -0.2312,
        5.6192
      ]
    ]
  },
  {
    "id": "dansoman-circle",
    "name": "Dansoman ⇄ Circle",
    "color": "#be123c",
    "stops": [
      [
        "Dansoman",
        -0.2652,
        5.53
      ],
      [
        "Agege Last Stop",
        -0.264,
        5.5293
      ],
      [
        "Dansoman Exhibition",
        -0.254,
        5.545
      ],
      [
        "Banana Inn",
        -0.2362,
        5.5643
      ],
      [
        "Chorkor",
        -0.235,
        5.535
      ],
      [
        "Korle Bu",
        -0.228,
        5.538
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "circle-dansoman",
    "name": "Circle ⇄ Dansoman",
    "color": "#be123c",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Korle Bu",
        -0.228,
        5.538
      ],
      [
        "Chorkor",
        -0.235,
        5.535
      ],
      [
        "Banana Inn",
        -0.2362,
        5.5643
      ],
      [
        "Dansoman Exhibition",
        -0.254,
        5.545
      ],
      [
        "Agege Last Stop",
        -0.264,
        5.5293
      ],
      [
        "Dansoman",
        -0.2652,
        5.53
      ]
    ]
  },
  {
    "id": "dansoman-temastation",
    "name": "Dansoman ⇄ Accra Central",
    "color": "#c026d3",
    "stops": [
      [
        "Dansoman",
        -0.2652,
        5.53
      ],
      [
        "Agege Last Stop",
        -0.264,
        5.5293
      ],
      [
        "Dansoman Exhibition",
        -0.254,
        5.545
      ],
      [
        "Banana Inn",
        -0.2362,
        5.5643
      ],
      [
        "Mamprobi",
        -0.24,
        5.534
      ],
      [
        "Chorkor",
        -0.235,
        5.535
      ],
      [
        "Korle Bu",
        -0.228,
        5.538
      ],
      [
        "Makola",
        -0.2098,
        5.5419
      ],
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ]
    ]
  },
  {
    "id": "temastation-dansoman",
    "name": "Accra Central ⇄ Dansoman",
    "color": "#c026d3",
    "stops": [
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ],
      [
        "Makola",
        -0.2098,
        5.5419
      ],
      [
        "Korle Bu",
        -0.228,
        5.538
      ],
      [
        "Chorkor",
        -0.235,
        5.535
      ],
      [
        "Mamprobi",
        -0.24,
        5.534
      ],
      [
        "Banana Inn",
        -0.2362,
        5.5643
      ],
      [
        "Dansoman Exhibition",
        -0.254,
        5.545
      ],
      [
        "Agege Last Stop",
        -0.264,
        5.5293
      ],
      [
        "Dansoman",
        -0.2652,
        5.53
      ]
    ]
  },
  {
    "id": "osu-circle",
    "name": "Osu ⇄ Circle",
    "color": "#0e7490",
    "stops": [
      [
        "Osu",
        -0.1822,
        5.5562
      ],
      [
        "Danquah Circle",
        -0.1795,
        5.5645
      ],
      [
        "Ridge",
        -0.185,
        5.57
      ],
      [
        "Adabraka",
        -0.205,
        5.5595
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "circle-osu",
    "name": "Circle ⇄ Osu",
    "color": "#0e7490",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Adabraka",
        -0.205,
        5.5595
      ],
      [
        "Ridge",
        -0.185,
        5.57
      ],
      [
        "Danquah Circle",
        -0.1795,
        5.5645
      ],
      [
        "Osu",
        -0.1822,
        5.5562
      ]
    ]
  },
  {
    "id": "spintex-tettehquarshie",
    "name": "Spintex ⇄ Tetteh Quarshie",
    "color": "#0d9488",
    "stops": [
      [
        "Sakumono Village",
        -0.0531,
        5.6262
      ],
      [
        "Baatsona",
        -0.1197,
        5.6197
      ],
      [
        "Coca-Cola",
        -0.1055,
        5.65
      ],
      [
        "Spintex",
        -0.125,
        5.628
      ],
      [
        "Kasapreko",
        -0.12,
        5.635
      ],
      [
        "Manet",
        -0.1281,
        5.6409
      ],
      [
        "Action Chapel",
        -0.1655,
        5.6268
      ],
      [
        "Flower Pot",
        -0.1548,
        5.6302
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ]
    ]
  },
  {
    "id": "tettehquarshie-spintex",
    "name": "Tetteh Quarshie ⇄ Spintex",
    "color": "#0d9488",
    "stops": [
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Flower Pot",
        -0.1548,
        5.6302
      ],
      [
        "Action Chapel",
        -0.1655,
        5.6268
      ],
      [
        "Manet",
        -0.1281,
        5.6409
      ],
      [
        "Kasapreko",
        -0.12,
        5.635
      ],
      [
        "Spintex",
        -0.125,
        5.628
      ],
      [
        "Coca-Cola",
        -0.1055,
        5.65
      ],
      [
        "Baatsona",
        -0.1197,
        5.6197
      ],
      [
        "Sakumono Village",
        -0.0531,
        5.6262
      ]
    ]
  },
  {
    "id": "eastlegon-circle",
    "name": "East Legon ⇄ Circle",
    "color": "#7c3aed",
    "stops": [
      [
        "East Legon",
        -0.158,
        5.639
      ],
      [
        "Bawaleshie",
        -0.1649,
        5.6421
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Pig Farm",
        -0.1962,
        5.589
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "circle-eastlegon",
    "name": "Circle ⇄ East Legon",
    "color": "#7c3aed",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Pig Farm",
        -0.1962,
        5.589
      ],
      [
        "37",
        -0.1854,
        5.5865
      ],
      [
        "Airport Junction",
        -0.1785,
        5.5971
      ],
      [
        "Tetteh Quarshie",
        -0.1752,
        5.6112
      ],
      [
        "Shiashie",
        -0.1745,
        5.6225
      ],
      [
        "Bawaleshie",
        -0.1649,
        5.6421
      ],
      [
        "East Legon",
        -0.158,
        5.639
      ]
    ]
  },
  {
    "id": "accra-kumasi",
    "name": "Accra (Circle) ⇄ Kumasi (Kejetia)",
    "color": "#b91c1c",
    "stops": [
      [
        "Circle",
        -0.2189,
        5.5582
      ],
      [
        "Achimota",
        -0.2312,
        5.6192
      ],
      [
        "Pokuase",
        -0.2921,
        5.6952
      ],
      [
        "Nsawam",
        -0.3512,
        5.8081
      ],
      [
        "Suhum",
        -0.4512,
        6.0412
      ],
      [
        "Nkawkaw",
        -0.7681,
        6.5512
      ],
      [
        "Konongo",
        -1.2212,
        6.6212
      ],
      [
        "Kumasi Kejetia",
        -1.6251,
        6.6961
      ]
    ]
  },
  {
    "id": "kumasi-accra",
    "name": "Kumasi (Kejetia) ⇄ Accra (Circle)",
    "color": "#b91c1c",
    "stops": [
      [
        "Kumasi Kejetia",
        -1.6251,
        6.6961
      ],
      [
        "Konongo",
        -1.2212,
        6.6212
      ],
      [
        "Nkawkaw",
        -0.7681,
        6.5512
      ],
      [
        "Suhum",
        -0.4512,
        6.0412
      ],
      [
        "Nsawam",
        -0.3512,
        5.8081
      ],
      [
        "Pokuase",
        -0.2921,
        5.6952
      ],
      [
        "Achimota",
        -0.2312,
        5.6192
      ],
      [
        "Circle",
        -0.2189,
        5.5582
      ]
    ]
  },
  {
    "id": "accra-takoradi",
    "name": "Accra (Kaneshie) ⇄ Cape Coast ⇄ Takoradi",
    "color": "#c2410c",
    "stops": [
      [
        "Kaneshie",
        -0.249,
        5.5598
      ],
      [
        "Kasoa",
        -0.4262,
        5.5342
      ],
      [
        "Winneba",
        -0.6281,
        5.3851
      ],
      [
        "Mankessim",
        -1.0212,
        5.2681
      ],
      [
        "Cape Coast Tantri",
        -1.2481,
        5.1082
      ],
      [
        "Takoradi Market Circle",
        -1.7551,
        4.8872
      ]
    ]
  },
  {
    "id": "takoradi-accra",
    "name": "Takoradi ⇄ Cape Coast ⇄ Accra (Kaneshie)",
    "color": "#c2410c",
    "stops": [
      [
        "Takoradi Market Circle",
        -1.7551,
        4.8872
      ],
      [
        "Cape Coast Tantri",
        -1.2481,
        5.1082
      ],
      [
        "Mankessim",
        -1.0212,
        5.2681
      ],
      [
        "Winneba",
        -0.6281,
        5.3851
      ],
      [
        "Kasoa",
        -0.4262,
        5.5342
      ],
      [
        "Kaneshie",
        -0.249,
        5.5598
      ]
    ]
  },
  {
    "id": "accra-aflao",
    "name": "Accra (Tema Station) ⇄ Sogakope ⇄ Aflao",
    "color": "#047857",
    "stops": [
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ],
      [
        "Tema Comm 1",
        -0.0078,
        5.6482
      ],
      [
        "Sogakope",
        0.5891,
        5.9981
      ],
      [
        "Akatsi",
        0.7981,
        6.1281
      ],
      [
        "Aflao",
        1.1912,
        6.1192
      ]
    ]
  },
  {
    "id": "aflao-accra",
    "name": "Aflao ⇄ Sogakope ⇄ Accra (Tema Station)",
    "color": "#047857",
    "stops": [
      [
        "Aflao",
        1.1912,
        6.1192
      ],
      [
        "Akatsi",
        0.7981,
        6.1281
      ],
      [
        "Sogakope",
        0.5891,
        5.9981
      ],
      [
        "Tema Comm 1",
        -0.0078,
        5.6482
      ],
      [
        "Tema Station Accra",
        -0.2017,
        5.5458
      ]
    ]
  },
  {
    "id": "gtfs_7589525_344",
    "name": "Nima Overhead Maamobi ↔ Achimota Terminal",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Abofu",
        -0.22623,
        5.6137
      ],
      [
        "Marwako",
        -0.22509,
        5.61218
      ],
      [
        "Vulcanizer",
        -0.22237,
        5.61266
      ],
      [
        "White House",
        -0.21699,
        5.60966
      ],
      [
        "Aquettey",
        -0.21593,
        5.60775
      ],
      [
        "Abelenkpe Curve",
        -0.21522,
        5.60738
      ],
      [
        "Abelemkpe Junction",
        -0.21023,
        5.60925
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Pig Farm Junction",
        -0.19624,
        5.59907
      ],
      [
        "Accra Girls",
        -0.19431,
        5.59775
      ],
      [
        "Konka",
        -0.19496,
        5.59663
      ],
      [
        "Konka Curve",
        -0.19384,
        5.59573
      ],
      [
        "Nima Overhead",
        -0.19474,
        5.59412
      ],
      [
        "Mamobi Market",
        -0.19486,
        5.59391
      ],
      [
        "Maamobi",
        -0.19545,
        5.59221
      ],
      [
        "Mawarko",
        -0.19584,
        5.59098
      ],
      [
        "Gutter",
        -0.19659,
        5.5885
      ],
      [
        "Bridge",
        -0.20361,
        5.58271
      ],
      [
        "Nima Station",
        -0.19865,
        5.58147
      ]
    ]
  },
  {
    "id": "gtfs_7437148_0",
    "name": "Amasaman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ],
      [
        "Best Point",
        -0.2402,
        5.63532
      ],
      [
        "Achimota Mall",
        -0.24147,
        5.63737
      ],
      [
        "St. Johns",
        -0.24243,
        5.63885
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "John Teye",
        -0.27042,
        5.66733
      ],
      [
        "ACP Junction",
        -0.27726,
        5.68409
      ],
      [
        "Pokuase Junction",
        -0.28199,
        5.68779
      ],
      [
        "Festus",
        -0.28858,
        5.69311
      ],
      [
        "Fusi Junction",
        -0.29195,
        5.69838
      ],
      [
        "Amasaman",
        -0.29761,
        5.70493
      ]
    ]
  },
  {
    "id": "gtfs_7435747_346",
    "name": "Ashaiman Main Station ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "GSL",
        -0.19926,
        5.61685
      ],
      [
        "Dzorwulu Junction",
        -0.19445,
        5.61734
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "Accra Mall",
        -0.17431,
        5.62357
      ],
      [
        "KICC",
        -0.09531,
        5.65412
      ],
      [
        "Trasacco",
        -0.11768,
        5.64506
      ],
      [
        "18 Junction",
        -0.07565,
        5.66056
      ],
      [
        "Abattoir",
        -0.07139,
        5.66224
      ],
      [
        "Washing Bay",
        -0.02792,
        5.68514
      ],
      [
        "Ashaiman Traffic Junction",
        -0.029,
        5.68648
      ],
      [
        "Ashaiman Police Station",
        -0.031,
        5.68754
      ],
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ]
    ]
  },
  {
    "id": "gtfs_7476946_340",
    "name": "Nima ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21329,
        5.57067
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Mami Dokuno",
        -0.21269,
        5.57015
      ],
      [
        "Equip",
        -0.21088,
        5.57058
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Kanda",
        -0.20183,
        5.57285
      ],
      [
        "Nima Police Station",
        -0.20072,
        5.5744
      ],
      [
        "Frankies Hotel Junction",
        -0.19868,
        5.57767
      ],
      [
        "Nima Mamobi",
        -0.19778,
        5.58008
      ],
      [
        "Nima Station",
        -0.19824,
        5.58197
      ]
    ]
  },
  {
    "id": "gtfs_7472304_342",
    "name": "Nima Mamobi ↔ Ashiaman",
    "color": "#1779c2",
    "stops": [
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ],
      [
        "Ashaiman Overhead",
        -0.02556,
        5.68261
      ],
      [
        "Tetteh Quarshie / Roundabout",
        -0.17385,
        5.62402
      ],
      [
        "Spanner",
        -0.17649,
        5.62051
      ],
      [
        "Nyaho",
        -0.18517,
        5.61486
      ],
      [
        "Container First",
        -0.18194,
        5.61695
      ],
      [
        "Jack and Jill",
        -0.18955,
        5.60202
      ],
      [
        "SGS",
        -0.19191,
        5.60224
      ],
      [
        "Frensho",
        -0.19339,
        5.60181
      ],
      [
        "Power House",
        -0.19428,
        5.59977
      ],
      [
        "Accra Girls",
        -0.19404,
        5.59819
      ],
      [
        "Konka",
        -0.19496,
        5.59663
      ],
      [
        "Nima Overhead",
        -0.19474,
        5.59412
      ],
      [
        "Maamobi",
        -0.19545,
        5.59221
      ],
      [
        "Mawarko",
        -0.19584,
        5.59098
      ],
      [
        "Gutter",
        -0.19659,
        5.5885
      ],
      [
        "Nima Roundabout",
        -0.20058,
        5.57828
      ],
      [
        "Nima Mamobi",
        -0.19778,
        5.58008
      ]
    ]
  },
  {
    "id": "gtfs_7518975_348",
    "name": "Ashiaman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Bambolino",
        -0.24254,
        5.60826
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "GSL",
        -0.19926,
        5.61685
      ],
      [
        "Dzorwulu Junction",
        -0.19445,
        5.61734
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "Accra Mall",
        -0.17431,
        5.62357
      ],
      [
        "Action Chapel",
        -0.16577,
        5.62636
      ],
      [
        "Manet",
        -0.12812,
        5.64091
      ],
      [
        "Coca-Cola / Police Station",
        -0.10552,
        5.64999
      ],
      [
        "KICC",
        -0.09531,
        5.65412
      ],
      [
        "Trasacco",
        -0.11768,
        5.64506
      ],
      [
        "18 Junction",
        -0.07565,
        5.66056
      ],
      [
        "Abattoir",
        -0.07139,
        5.66224
      ],
      [
        "Biscuit Factory",
        -0.06689,
        5.66409
      ],
      [
        "Under Bridge",
        -0.0436,
        5.67479
      ],
      [
        "Washing Bay",
        -0.02792,
        5.68514
      ],
      [
        "Ashaiman Traffic Junction",
        -0.029,
        5.68648
      ],
      [
        "Ashaiman Police Station",
        -0.031,
        5.68754
      ],
      [
        "Ashaiman Last Stop",
        -0.03175,
        5.68692
      ],
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ]
    ]
  },
  {
    "id": "gtfs_7582949_298",
    "name": "Mallam Attah ↔ Kotobabi Down/Polo park",
    "color": "#1779c2",
    "stops": [
      [
        "Kotobabi Down (Polo Park)",
        -0.2092,
        5.59581
      ],
      [
        "Ojawe",
        -0.20809,
        5.59501
      ],
      [
        "Kotobabi Night Market",
        -0.20768,
        5.59469
      ],
      [
        "Prempeh",
        -0.20677,
        5.59372
      ],
      [
        "Tobinco Junction",
        -0.20631,
        5.59328
      ],
      [
        "CJ School",
        -0.20567,
        5.59271
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Ghana Commercial Bank",
        -0.20811,
        5.58469
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Nima Junction",
        -0.20858,
        5.58237
      ],
      [
        "Mallam Atta",
        -0.20905,
        5.58166
      ]
    ]
  },
  {
    "id": "gtfs_7477772_296",
    "name": "Mallam Atta ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Abelenkpe Curve",
        -0.21522,
        5.60738
      ],
      [
        "Abelemkpe Junction",
        -0.21023,
        5.60925
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Pig Farm",
        -0.198,
        5.59876
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Mallam Attah",
        -0.20979,
        5.57939
      ]
    ]
  },
  {
    "id": "gtfs_7477513_294",
    "name": "Legon ↔ Dome",
    "color": "#1779c2",
    "stops": [
      [
        "Dome",
        -0.24226,
        5.63874
      ],
      [
        "Dome Market",
        -0.238,
        5.64386
      ],
      [
        "Adehyeman",
        -0.23704,
        5.64556
      ],
      [
        "Dome Crossing",
        -0.23653,
        5.64717
      ],
      [
        "Coca Cola",
        -0.23027,
        5.64849
      ],
      [
        "Transformer",
        -0.22846,
        5.64746
      ],
      [
        "Lebo",
        -0.22633,
        5.64577
      ],
      [
        "Koforidua House",
        -0.22488,
        5.64449
      ],
      [
        "Container",
        -0.22328,
        5.64297
      ],
      [
        "Parakuo",
        -0.22188,
        5.64177
      ],
      [
        "Cemetary",
        -0.21994,
        5.64008
      ],
      [
        "Damresco",
        -0.21834,
        5.63842
      ],
      [
        "Colf store",
        -0.21698,
        5.63714
      ],
      [
        "Christian Village",
        -0.21465,
        5.63539
      ],
      [
        "Kisseman Junction",
        -0.21323,
        5.63725
      ],
      [
        "Pure Fire",
        -0.21189,
        5.63788
      ],
      [
        "Airways Junction",
        -0.21086,
        5.63818
      ],
      [
        "Forestry Commission",
        -0.20883,
        5.6391
      ],
      [
        "GIMPA",
        -0.20524,
        5.64138
      ],
      [
        "Legon Barrier",
        -0.19791,
        5.64158
      ],
      [
        "18",
        -0.19511,
        5.64087
      ],
      [
        "Ayido",
        -0.19374,
        5.64071
      ],
      [
        "Legon Primary School",
        -0.18994,
        5.64269
      ],
      [
        "Okponglo Roundabout",
        -0.18376,
        5.64037
      ],
      [
        "Legon Traffic Light",
        -0.17925,
        5.64055
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon police station",
        -0.17966,
        5.65129
      ],
      [
        "Legon",
        -0.17901,
        5.65125
      ]
    ]
  },
  {
    "id": "gtfs_7445275_292",
    "name": "Agape ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ],
      [
        "Abrantie",
        -0.25276,
        5.60515
      ],
      [
        "Kata",
        -0.25959,
        5.60225
      ],
      [
        "Hong Kong",
        -0.26108,
        5.60129
      ],
      [
        "Kwashieman Junction",
        -0.26685,
        5.59416
      ],
      [
        "Been To",
        -0.27172,
        5.58739
      ],
      [
        "Vineyard",
        -0.27294,
        5.58596
      ],
      [
        "FanMilk Junction",
        -0.29923,
        5.6219
      ],
      [
        "Ablekuma",
        -0.31022,
        5.62724
      ],
      [
        "Ablekuma Curve",
        -0.31196,
        5.62714
      ],
      [
        "Pentecost Junction",
        -0.3069,
        5.62551
      ],
      [
        "Block Factory",
        -0.30585,
        5.62219
      ],
      [
        "Container",
        -0.30694,
        5.61997
      ],
      [
        "Pentecost",
        -0.30878,
        5.61927
      ],
      [
        "Offtown",
        -0.31047,
        5.61783
      ],
      [
        "Tarrazzo",
        -0.31201,
        5.61598
      ],
      [
        "Waakye",
        -0.32798,
        5.60918
      ],
      [
        "Agape",
        -0.32955,
        5.60922
      ]
    ]
  },
  {
    "id": "gtfs_7481124_290",
    "name": "Yellow House ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ],
      [
        "Lapaz Community Junction",
        -0.25495,
        5.60658
      ],
      [
        "Lapaz Market",
        -0.25688,
        5.60736
      ],
      [
        "Tabora Number 3",
        -0.25861,
        5.60723
      ],
      [
        "Tabora Number 4",
        -0.26039,
        5.60887
      ],
      [
        "Lapaz Borlaso",
        -0.26124,
        5.60946
      ],
      [
        "Tabora Number 5",
        -0.26119,
        5.61039
      ],
      [
        "Tabora Number 6",
        -0.26106,
        5.61221
      ],
      [
        "Scorpion",
        -0.26069,
        5.61571
      ],
      [
        "Tabora Lighthouse",
        -0.26104,
        5.61697
      ],
      [
        "Tabora Junction",
        -0.26188,
        5.61935
      ],
      [
        "Tabora Asoredanho",
        -0.26262,
        5.62145
      ],
      [
        "Star Junction",
        -0.26177,
        5.62228
      ],
      [
        "Taste",
        -0.262,
        5.62346
      ],
      [
        "Walaako",
        -0.26216,
        5.62505
      ],
      [
        "Alhaji Curve",
        -0.26176,
        5.62644
      ],
      [
        "Alhaji Station",
        -0.26174,
        5.62829
      ],
      [
        "Israel Junction",
        -0.26386,
        5.63085
      ],
      [
        "Masalaashi Israel",
        -0.26667,
        5.63094
      ],
      [
        "Isreal Station",
        -0.26905,
        5.63118
      ],
      [
        "Yellow House",
        -0.269,
        5.63822
      ]
    ]
  },
  {
    "id": "gtfs_7406253_199",
    "name": "Shalom ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Shalom",
        -0.23223,
        5.53123
      ],
      [
        "Asoredan ho",
        -0.23227,
        5.53147
      ],
      [
        "Market",
        -0.23526,
        5.53189
      ],
      [
        "Market Junction",
        -0.23724,
        5.53216
      ],
      [
        "Shell",
        -0.23738,
        5.53299
      ],
      [
        "Mamprobi Station",
        -0.23777,
        5.53467
      ],
      [
        "Sempe First",
        -0.23834,
        5.537
      ],
      [
        "Sempe Second",
        -0.23872,
        5.5386
      ],
      [
        "Salvation Army",
        -0.23928,
        5.54097
      ],
      [
        "Korle Bu Junction",
        -0.23993,
        5.5436
      ],
      [
        "Radio Gold",
        -0.24013,
        5.54807
      ],
      [
        "Black Smith",
        -0.24012,
        5.55111
      ],
      [
        "Pipeier Naa",
        -0.24013,
        5.5535
      ],
      [
        "Kasoa Station",
        -0.24014,
        5.55627
      ],
      [
        "Zongo Junction",
        -0.23979,
        5.55779
      ],
      [
        "Asoredan ho",
        -0.23872,
        5.5614
      ],
      [
        "Dansoman Junction",
        -0.23764,
        5.56321
      ],
      [
        "Kaneshie",
        -0.23598,
        5.56414
      ]
    ]
  },
  {
    "id": "gtfs_7445109_195",
    "name": "Circle Indust. Area ↔ Abeka Main Market",
    "color": "#1779c2",
    "stops": [
      [
        "Circle Industrial Area",
        -0.21942,
        5.56922
      ],
      [
        "Fan Milk Junction",
        -0.22269,
        5.57274
      ],
      [
        "Ashfoam Junction",
        -0.22386,
        5.58238
      ],
      [
        "Melcom",
        -0.22673,
        5.58785
      ],
      [
        "Abeka Total",
        -0.2335,
        5.59779
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Abeka Bcos Junction",
        -0.23495,
        5.59894
      ],
      [
        "PnP Junction",
        -0.23579,
        5.59922
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Abeka Main Market",
        -0.23913,
        5.6008
      ]
    ]
  },
  {
    "id": "gtfs_7422818_197",
    "name": "Russia ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Russia Station",
        -0.25463,
        5.55463
      ],
      [
        "Omanko",
        -0.25361,
        5.5558
      ],
      [
        "Russia",
        -0.25105,
        5.55641
      ],
      [
        "Paa Willie",
        -0.25185,
        5.5596
      ],
      [
        "Seventh Day Adventist",
        -0.24626,
        5.55911
      ],
      [
        "JT",
        -0.24526,
        5.56262
      ],
      [
        "First Light",
        -0.24265,
        5.56789
      ],
      [
        "Kaneshie",
        -0.23495,
        5.56457
      ]
    ]
  },
  {
    "id": "gtfs_7423611_191",
    "name": "Mamprobi Alhaji ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Mamprobi Alhaji Station",
        -0.25041,
        5.53092
      ],
      [
        "Alhaji Junction",
        -0.24761,
        5.5312
      ],
      [
        "Bamboi",
        -0.24623,
        5.53278
      ],
      [
        "Methodist",
        -0.24474,
        5.5344
      ],
      [
        "Abodwe",
        -0.24229,
        5.53506
      ],
      [
        "Sempe Second",
        -0.24008,
        5.53751
      ],
      [
        "Sempe First",
        -0.23906,
        5.53859
      ],
      [
        "Salvation Army",
        -0.23928,
        5.54097
      ],
      [
        "Korle Bu Junction",
        -0.23993,
        5.5436
      ],
      [
        "Radio Gold",
        -0.24013,
        5.54807
      ],
      [
        "Black Smith",
        -0.24012,
        5.55111
      ],
      [
        "Pipeier Naa",
        -0.24013,
        5.5535
      ],
      [
        "Kasoa Station",
        -0.24014,
        5.55627
      ],
      [
        "Zongo Junction",
        -0.23979,
        5.55779
      ],
      [
        "Asoredan ho",
        -0.23872,
        5.5614
      ],
      [
        "Dansoman Junction",
        -0.23764,
        5.56321
      ],
      [
        "Kaneshie",
        -0.23598,
        5.56414
      ],
      [
        "Kaneshie Takoradi Station",
        -0.23708,
        5.56481
      ]
    ]
  },
  {
    "id": "gtfs_7424983_193",
    "name": "New Town ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Caprice",
        -0.21704,
        5.58396
      ],
      [
        "Pamprom",
        -0.23076,
        5.56563
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7484467_270",
    "name": "Adenta ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "GSL",
        -0.19926,
        5.61685
      ],
      [
        "Dzorwulu Junction",
        -0.19445,
        5.61734
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "Accra Mall Roundabout",
        -0.17473,
        5.62204
      ],
      [
        "Shiashie",
        -0.17644,
        5.62768
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon Second",
        -0.17999,
        5.65188
      ],
      [
        "UPS",
        -0.17824,
        5.6607
      ],
      [
        "Presec",
        -0.17783,
        5.66255
      ],
      [
        "Atomic First",
        -0.17706,
        5.66624
      ],
      [
        "Atomic Second",
        -0.17663,
        5.66798
      ],
      [
        "Fire Stone",
        -0.17511,
        5.6713
      ],
      [
        "Madina Zongo Junction",
        -0.17378,
        5.67536
      ],
      [
        "Madina Masalachi",
        -0.17268,
        5.67915
      ],
      [
        "Ritz Junction",
        -0.17137,
        5.68764
      ],
      [
        "Assemblies",
        -0.17154,
        5.69143
      ],
      [
        "SDA",
        -0.17157,
        5.69668
      ],
      [
        "Goil Filling Station",
        -0.1716,
        5.70006
      ],
      [
        "Wass",
        -0.17117,
        5.70451
      ],
      [
        "Adenta Barrier",
        -0.17103,
        5.70585
      ]
    ]
  },
  {
    "id": "gtfs_7480604_272",
    "name": "Alhaji ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ],
      [
        "Lapaz Community Junction",
        -0.25495,
        5.60658
      ],
      [
        "Lapaz Market",
        -0.25688,
        5.60736
      ],
      [
        "Tabora Number 3",
        -0.25861,
        5.60723
      ],
      [
        "Tabora Number 4",
        -0.26039,
        5.60887
      ],
      [
        "Lapaz Borlaso",
        -0.26124,
        5.60946
      ],
      [
        "Tabora Number 5",
        -0.26119,
        5.61039
      ],
      [
        "Tabora Number 6",
        -0.26106,
        5.61221
      ],
      [
        "Scorpion",
        -0.26069,
        5.61571
      ],
      [
        "Tabora Lighthouse",
        -0.26104,
        5.61697
      ],
      [
        "Tabora Junction",
        -0.26188,
        5.61935
      ],
      [
        "Star Junction",
        -0.26177,
        5.62228
      ],
      [
        "Taste",
        -0.262,
        5.62346
      ],
      [
        "Walaako",
        -0.26216,
        5.62505
      ],
      [
        "Alhaji Curve",
        -0.26176,
        5.62644
      ],
      [
        "Tabora Alhaji",
        -0.26166,
        5.62801
      ]
    ]
  },
  {
    "id": "gtfs_7499803_274",
    "name": "Ashaiman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "18 Junction",
        -0.07565,
        5.66056
      ],
      [
        "Abattoir",
        -0.07139,
        5.66224
      ],
      [
        "Under Bridge",
        -0.0436,
        5.67479
      ],
      [
        "Ashaiman Overhead",
        -0.02578,
        5.68205
      ],
      [
        "Washing Bay",
        -0.02792,
        5.68514
      ],
      [
        "Ashaiman Traffic Junction",
        -0.029,
        5.68648
      ],
      [
        "Ashaiman Police Station",
        -0.031,
        5.68754
      ],
      [
        "Ashaiman Last Stop",
        -0.03175,
        5.68692
      ],
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ]
    ]
  },
  {
    "id": "gtfs_7480899_276",
    "name": "Lomnava ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ],
      [
        "Lapaz Community Junction",
        -0.25495,
        5.60658
      ],
      [
        "Lapaz Market",
        -0.25688,
        5.60736
      ],
      [
        "Tabora Number 3",
        -0.25861,
        5.60723
      ],
      [
        "Tabora Number 4",
        -0.26039,
        5.60887
      ],
      [
        "Lapaz Borlaso",
        -0.26124,
        5.60946
      ],
      [
        "Tabora Number 5",
        -0.26119,
        5.61039
      ],
      [
        "Tabora Number 6",
        -0.26106,
        5.61221
      ],
      [
        "Scorpion",
        -0.26069,
        5.61571
      ],
      [
        "Tabora Lighthouse",
        -0.26104,
        5.61697
      ],
      [
        "Tabora Junction",
        -0.26188,
        5.61935
      ],
      [
        "Tabora Asoredanho",
        -0.26262,
        5.62145
      ],
      [
        "Taste",
        -0.262,
        5.62346
      ],
      [
        "Walaako",
        -0.26216,
        5.62505
      ],
      [
        "Alhaji Curve",
        -0.26176,
        5.62644
      ],
      [
        "Alhaji Station",
        -0.26174,
        5.62829
      ],
      [
        "Israel Junction",
        -0.26386,
        5.63085
      ],
      [
        "Masalaashi Israel",
        -0.26667,
        5.63094
      ],
      [
        "Isreal Station",
        -0.26905,
        5.63118
      ],
      [
        "Lomnava First Curve",
        -0.27146,
        5.6316
      ],
      [
        "Second Curve",
        -0.27176,
        5.63449
      ],
      [
        "Wele Junction",
        -0.2738,
        5.63431
      ],
      [
        "Stelee Drug store",
        -0.27404,
        5.63573
      ],
      [
        "Lomnava Last Stop",
        -0.27858,
        5.63589
      ],
      [
        "Agenda",
        -0.27881,
        5.63961
      ],
      [
        "Lomnava",
        -0.28265,
        5.6401
      ]
    ]
  },
  {
    "id": "gtfs_7483085_278",
    "name": "Madina ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "GSL",
        -0.19926,
        5.61685
      ],
      [
        "Dzorwulu Junction",
        -0.19445,
        5.61734
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "Accra Mall Roundabout",
        -0.17473,
        5.62204
      ],
      [
        "Shiashie",
        -0.17644,
        5.62768
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon Second",
        -0.17999,
        5.65188
      ],
      [
        "UPS",
        -0.17824,
        5.6607
      ],
      [
        "Presec",
        -0.17783,
        5.66255
      ],
      [
        "Atomic First",
        -0.17706,
        5.66624
      ],
      [
        "Atomic Second",
        -0.17663,
        5.66798
      ],
      [
        "Fire Stone",
        -0.17511,
        5.6713
      ],
      [
        "Madina Zongo Junction",
        -0.17378,
        5.67536
      ],
      [
        "Madina",
        -0.17164,
        5.67668
      ]
    ]
  },
  {
    "id": "gtfs_7452139_524",
    "name": "Kuntunse/Satelite ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota Old Station",
        -0.22898,
        5.61516
      ],
      [
        "Achimota Overhead",
        -0.23031,
        5.61993
      ],
      [
        "Neoplan",
        -0.23295,
        5.62409
      ],
      [
        "ABC Junction",
        -0.23629,
        5.62918
      ],
      [
        "Mile 7",
        -0.23967,
        5.63445
      ],
      [
        "Best Point",
        -0.2402,
        5.63532
      ],
      [
        "St. Johns",
        -0.24243,
        5.63885
      ],
      [
        "Tantra Hills",
        -0.24727,
        5.64606
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "Spot M",
        -0.25971,
        5.65412
      ],
      [
        "Income Tax",
        -0.2631,
        5.65644
      ],
      [
        "Ofankor Barrier",
        -0.26479,
        5.65761
      ],
      [
        "John Teye",
        -0.27042,
        5.66733
      ],
      [
        "Agya Herbal",
        -0.27173,
        5.67265
      ],
      [
        "ACP Junction",
        -0.27726,
        5.68409
      ],
      [
        "Pokuase Junction",
        -0.28199,
        5.68779
      ],
      [
        "Festus",
        -0.28858,
        5.69311
      ],
      [
        "Fusi Junction",
        -0.29195,
        5.69838
      ],
      [
        "Amasaman",
        -0.29761,
        5.70493
      ],
      [
        "Puma",
        -0.3034,
        5.71062
      ],
      [
        "Shikpontele",
        -0.30847,
        5.71826
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.31035,
        5.72316
      ],
      [
        "Sarpeiman",
        -0.31109,
        5.72564
      ],
      [
        "Macedonia",
        -0.3124,
        5.72998
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.313,
        5.73217
      ],
      [
        "Pobiman",
        -0.31382,
        5.73525
      ],
      [
        "Kontunse",
        -0.316,
        5.74169
      ]
    ]
  },
  {
    "id": "gtfs_7541690_526",
    "name": "Akweteman Zongo ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Achimota Overhead",
        -0.23052,
        5.6198
      ],
      [
        "Achimota Old Station",
        -0.22949,
        5.61546
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Kopevi",
        -0.2336,
        5.61457
      ],
      [
        "Adwenpa",
        -0.23497,
        5.61495
      ],
      [
        "Akwetteyman Zongo",
        -0.23742,
        5.61579
      ],
      [
        "Akweteman Zongo (Last Stop)",
        -0.24026,
        5.61399
      ]
    ]
  },
  {
    "id": "gtfs_7453025_520",
    "name": "Adenta Station ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Achimota Club House",
        -0.21925,
        5.62209
      ],
      [
        "PWD",
        -0.21889,
        5.624
      ],
      [
        "Achimota Hospital",
        -0.21914,
        5.6275
      ],
      [
        "Golf Park",
        -0.21944,
        5.63017
      ],
      [
        "Christian Village",
        -0.21465,
        5.63539
      ],
      [
        "Pure Fire",
        -0.21189,
        5.63788
      ],
      [
        "Airways Junction",
        -0.21086,
        5.63818
      ],
      [
        "Supermarket",
        -0.19603,
        5.66737
      ],
      [
        "Agbogba Junction",
        -0.18729,
        5.6673
      ],
      [
        "Atomic First",
        -0.17813,
        5.66725
      ],
      [
        "Atomic Second",
        -0.17663,
        5.66798
      ],
      [
        "Madina Zongo Junction",
        -0.17378,
        5.67536
      ],
      [
        "Ritz Junction",
        -0.17137,
        5.68764
      ],
      [
        "Assemblies",
        -0.17154,
        5.69143
      ],
      [
        "SDA",
        -0.17157,
        5.69668
      ],
      [
        "Goil Filling Station",
        -0.1716,
        5.70006
      ],
      [
        "Wass",
        -0.17117,
        5.70451
      ],
      [
        "Adenta Barrier",
        -0.17103,
        5.70585
      ],
      [
        "Adenta Station",
        -0.16561,
        5.70609
      ]
    ]
  },
  {
    "id": "gtfs_7519069_522",
    "name": "Adjiringanor ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Achimota Forest",
        -0.21857,
        5.62076
      ],
      [
        "Forestry",
        -0.21595,
        5.61733
      ],
      [
        "GSL",
        -0.19926,
        5.61685
      ],
      [
        "Dzorwulu Junction",
        -0.19445,
        5.61734
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "Accra Mall Roundabout",
        -0.17473,
        5.62204
      ],
      [
        "Shiashie",
        -0.17582,
        5.6275
      ],
      [
        "Block Factory",
        -0.17367,
        5.62845
      ],
      [
        "Shiashie",
        -0.1736,
        5.62908
      ],
      [
        "Puplampu",
        -0.17267,
        5.63283
      ],
      [
        "Yeboah",
        -0.17176,
        5.63625
      ],
      [
        "Mensvic",
        -0.1716,
        5.63694
      ],
      [
        "Banku Junction",
        -0.16954,
        5.63959
      ],
      [
        "Bawaleshie Traffic Light",
        -0.16914,
        5.64163
      ],
      [
        "Bawaleshie First",
        -0.16732,
        5.64182
      ],
      [
        "Bawaleshie Second",
        -0.16494,
        5.6421
      ],
      [
        "Beduwa",
        -0.16135,
        5.64241
      ],
      [
        "Bawaleshie Acheampong",
        -0.16007,
        5.64282
      ],
      [
        "MTN",
        -0.15673,
        5.64494
      ],
      [
        "Bridge",
        -0.15514,
        5.64614
      ],
      [
        "American House",
        -0.15007,
        5.64757
      ],
      [
        "Adjiringanor Curve",
        -0.14873,
        5.64565
      ],
      [
        "Adjiringanor Bridge",
        -0.14457,
        5.64579
      ],
      [
        "Block Factory",
        -0.13925,
        5.64572
      ],
      [
        "Gate",
        -0.1371,
        5.64568
      ],
      [
        "Adjringanor/Otanor",
        -0.13452,
        5.64671
      ],
      [
        "Adjiringanor (Block Factory)",
        -0.13237,
        5.64853
      ],
      [
        "Rawlings Junction",
        -0.12928,
        5.65124
      ],
      [
        "Adjiringanor Second Curve",
        -0.12924,
        5.65171
      ],
      [
        "Otanor Bus Stop",
        -0.12997,
        5.65334
      ],
      [
        "Ability",
        -0.13137,
        5.65664
      ],
      [
        "Zion",
        -0.13236,
        5.65916
      ],
      [
        "Container",
        -0.13168,
        5.66095
      ],
      [
        "Caterpillar",
        -0.13048,
        5.66429
      ],
      [
        "Salaam",
        -0.12845,
        5.66979
      ],
      [
        "Morocco",
        -0.12802,
        5.67103
      ],
      [
        "Obinim",
        -0.12734,
        5.67288
      ],
      [
        "Bishop",
        -0.12664,
        5.6748
      ],
      [
        "Adjiringanor Last stop",
        -0.12508,
        5.67705
      ]
    ]
  },
  {
    "id": "gtfs_7453712_528",
    "name": "Asofan ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Neoplan",
        -0.23295,
        5.62409
      ],
      [
        "ABC Junction",
        -0.23629,
        5.62918
      ],
      [
        "Mile 7",
        -0.23967,
        5.63445
      ],
      [
        "Best Point",
        -0.2402,
        5.63532
      ],
      [
        "Achimota Mall",
        -0.24147,
        5.63737
      ],
      [
        "St. Johns",
        -0.24243,
        5.63885
      ],
      [
        "St Johns Second",
        -0.24413,
        5.64151
      ],
      [
        "Tantra Hills",
        -0.24727,
        5.64606
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "Spot M",
        -0.25971,
        5.65412
      ],
      [
        "Income Tax",
        -0.2631,
        5.65644
      ],
      [
        "Ofankor Barrier",
        -0.26479,
        5.65761
      ],
      [
        "Ofankor Taxi Rank",
        -0.26696,
        5.65817
      ],
      [
        "Phobia",
        -0.27121,
        5.65894
      ],
      [
        "Market",
        -0.27535,
        5.65841
      ],
      [
        "1st Power",
        -0.27668,
        5.65812
      ],
      [
        "2nd Power",
        -0.27809,
        5.65786
      ],
      [
        "Soldier Line",
        -0.27957,
        5.65745
      ],
      [
        "Abodwe Se",
        -0.28173,
        5.65657
      ],
      [
        "Presby",
        -0.28363,
        5.65494
      ],
      [
        "Asofan School Juntion",
        -0.28488,
        5.6544
      ],
      [
        "Asofan Old Station",
        -0.2861,
        5.65399
      ],
      [
        "Jojo Water",
        -0.28506,
        5.65113
      ],
      [
        "Chairman",
        -0.28603,
        5.64927
      ],
      [
        "Asofan Block Factory",
        -0.28685,
        5.64735
      ],
      [
        "Transformer",
        -0.28896,
        5.64707
      ],
      [
        "Curve",
        -0.29013,
        5.64703
      ],
      [
        "Pentecost Station",
        -0.29023,
        5.64617
      ],
      [
        "Abe Asi",
        -0.29085,
        5.64524
      ],
      [
        "Royco",
        -0.29261,
        5.64388
      ],
      [
        "Asofan New Station",
        -0.29351,
        5.64348
      ]
    ]
  },
  {
    "id": "gtfs_7443816_449",
    "name": "Korle Bu ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Total",
        -0.23102,
        5.55817
      ],
      [
        "Swanlake",
        -0.23171,
        5.5853
      ],
      [
        "Old Stop",
        -0.23272,
        5.58752
      ],
      [
        "Sunlight",
        -0.23204,
        5.58974
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Abeka Bcos Junction",
        -0.23495,
        5.59894
      ],
      [
        "PnP Junction",
        -0.23579,
        5.59922
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Abeka Main Market",
        -0.23913,
        5.6008
      ],
      [
        "Fadama",
        -0.24055,
        5.60164
      ],
      [
        "Eno",
        -0.24157,
        5.60263
      ],
      [
        "Fadama Junction",
        -0.2425,
        5.60308
      ],
      [
        "Abeka Post Office",
        -0.24359,
        5.6039
      ],
      [
        "Abotare",
        -0.24527,
        5.60508
      ],
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ]
    ]
  },
  {
    "id": "gtfs_7571475_443",
    "name": "Chemuna ↔ Accra Salaga",
    "color": "#1779c2",
    "stops": [
      [
        "Chokor/ Chemuna",
        -0.25046,
        5.5262
      ],
      [
        "Lantemame",
        -0.24615,
        5.52654
      ],
      [
        "Korle Gonno",
        -0.23043,
        5.52874
      ],
      [
        "Korle beach resort junction",
        -0.22765,
        5.52931
      ],
      [
        "Fire Service",
        -0.21553,
        5.53237
      ],
      [
        "Boodi",
        -0.21471,
        5.53274
      ],
      [
        "Lighthouse",
        -0.2117,
        5.53359
      ],
      [
        "Mantse Agbonaa",
        -0.21067,
        5.53639
      ],
      [
        "One Way",
        -0.21025,
        5.53703
      ],
      [
        "Ussher Fort",
        -0.20893,
        5.53834
      ],
      [
        "Salaga Market",
        -0.20907,
        5.53978
      ],
      [
        "Accra Salaga",
        -0.20885,
        5.54055
      ]
    ]
  },
  {
    "id": "gtfs_7459958_441",
    "name": "Osu Penta Hotel ↔ Accra Rawlings Park",
    "color": "#1779c2",
    "stops": [
      [
        "Papaye",
        -0.18222,
        5.55957
      ],
      [
        "SSNIT",
        -0.1817,
        5.56273
      ],
      [
        "Agric",
        -0.19858,
        5.54784
      ],
      [
        "E. C. Quaye Road",
        -0.20643,
        5.54434
      ],
      [
        "Market",
        -0.2068,
        5.5446
      ],
      [
        "Tema Station Union of GPRTU",
        -0.20075,
        5.5487
      ],
      [
        "Court",
        -0.20435,
        5.54444
      ],
      [
        "Ministries",
        -0.1946,
        5.54875
      ],
      [
        "Shell",
        -0.18241,
        5.5583
      ],
      [
        "Presby School Junction",
        -0.18335,
        5.55498
      ],
      [
        "Accra Rawlings Park",
        -0.20681,
        5.5458
      ],
      [
        "Penta Hotel",
        -0.18116,
        5.56536
      ],
      [
        "Frankies",
        -0.18197,
        5.56109
      ],
      [
        "Traffic Light",
        -0.18504,
        5.55323
      ],
      [
        "Osu Shell",
        -0.18268,
        5.5566
      ]
    ]
  },
  {
    "id": "gtfs_7459283_447",
    "name": "Camara ↔ Accra Salaga",
    "color": "#1779c2",
    "stops": [
      [
        "Camara",
        -0.25682,
        5.53709
      ],
      [
        "Mangoase",
        -0.25292,
        5.53568
      ],
      [
        "Camara Junction",
        -0.25075,
        5.53564
      ],
      [
        "Nku Kpotoi",
        -0.24941,
        5.53559
      ],
      [
        "IBE (Camara)",
        -0.24764,
        5.53558
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24636,
        5.53554
      ],
      [
        "Mamprobi Methodist",
        -0.24386,
        5.53506
      ],
      [
        "Abodwe",
        -0.24232,
        5.53464
      ],
      [
        "Rainbow",
        -0.24006,
        5.53398
      ],
      [
        "Mamprobi Post Office",
        -0.23705,
        5.53384
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Boxing Arena",
        -0.22062,
        5.53734
      ],
      [
        "UTC",
        -0.21797,
        5.53793
      ],
      [
        "Lighthouse",
        -0.2117,
        5.53359
      ],
      [
        "One Way",
        -0.21025,
        5.53703
      ],
      [
        "Ussher Fort",
        -0.20893,
        5.53834
      ],
      [
        "Salaga Market",
        -0.20907,
        5.53978
      ],
      [
        "Accra Salaga",
        -0.20885,
        5.54055
      ]
    ]
  },
  {
    "id": "gtfs_7571419_445",
    "name": "Appiah Danquah ↔ Accra Salaga",
    "color": "#1779c2",
    "stops": [
      [
        "Appiah Danquah",
        -0.2465,
        5.54667
      ],
      [
        "Taxi Rank",
        -0.24594,
        5.54673
      ],
      [
        "School Junction",
        -0.24543,
        5.54672
      ],
      [
        "Junction Appiah Danquah",
        -0.24389,
        5.54671
      ],
      [
        "Lotto Kiosk",
        -0.24378,
        5.54752
      ],
      [
        "Radio Gold",
        -0.24037,
        5.548
      ],
      [
        "Korle Bu Junction",
        -0.24001,
        5.54371
      ],
      [
        "Salvation Army",
        -0.23953,
        5.54165
      ],
      [
        "Sempe First",
        -0.2389,
        5.5391
      ],
      [
        "Sempe Second",
        -0.23835,
        5.53678
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Electricity",
        -0.23342,
        5.53464
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Boxing Arena",
        -0.22062,
        5.53734
      ],
      [
        "UTC",
        -0.21797,
        5.53793
      ],
      [
        "UTC",
        -0.21721,
        5.53809
      ],
      [
        "Agbado",
        -0.21512,
        5.53859
      ],
      [
        "Akoto Lante",
        -0.21312,
        5.53887
      ],
      [
        "Methodist Church of Ghana",
        -0.21214,
        5.53634
      ],
      [
        "Mantse Agbonaa",
        -0.21067,
        5.53639
      ],
      [
        "One Way",
        -0.21025,
        5.53703
      ],
      [
        "Ussher Fort",
        -0.20893,
        5.53834
      ],
      [
        "Salaga Market",
        -0.20907,
        5.53978
      ],
      [
        "Accra Salaga",
        -0.20885,
        5.54055
      ]
    ]
  },
  {
    "id": "gtfs_7473856_108",
    "name": "Circle Overhead ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz Last Stop",
        -0.24692,
        5.6061
      ],
      [
        "Abotare",
        -0.24545,
        5.60516
      ],
      [
        "Abeka Post Office",
        -0.24395,
        5.60404
      ],
      [
        "Fadama Junction",
        -0.24271,
        5.6032
      ],
      [
        "Eno",
        -0.24198,
        5.60275
      ],
      [
        "Fadama",
        -0.24079,
        5.60175
      ],
      [
        "Abeka Main Market",
        -0.2393,
        5.60081
      ],
      [
        "Free Pipe",
        -0.23766,
        5.59986
      ],
      [
        "Adom Junction",
        -0.23686,
        5.59957
      ],
      [
        "PnP Junction",
        -0.23571,
        5.59913
      ],
      [
        "Abeka Bcos Junction",
        -0.2348,
        5.5988
      ],
      [
        "Total",
        -0.23335,
        5.59803
      ],
      [
        "Tesano Gardens",
        -0.23113,
        5.59829
      ],
      [
        "Fitting Shop",
        -0.22628,
        5.59918
      ],
      [
        "Abeka Junction Curve",
        -0.22459,
        5.5994
      ],
      [
        "Abeka Junction",
        -0.22397,
        5.59892
      ],
      [
        "CAT",
        -0.22196,
        5.59518
      ],
      [
        "Alajo",
        -0.21816,
        5.58794
      ],
      [
        "Caprice",
        -0.21704,
        5.58396
      ],
      [
        "Circle Asoredanho",
        -0.21673,
        5.57563
      ],
      [
        "Circle",
        -0.21676,
        5.56975
      ]
    ]
  },
  {
    "id": "gtfs_7473841_102",
    "name": "Circle ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "Old Tema Station",
        -0.19963,
        5.54995
      ],
      [
        "Tigo Office",
        -0.20557,
        5.55819
      ],
      [
        "Cathedral",
        -0.20615,
        5.56357
      ],
      [
        "Total",
        -0.20779,
        5.5652
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "Circle",
        -0.21595,
        5.56885
      ]
    ]
  },
  {
    "id": "gtfs_7418804_100",
    "name": "Tema (Motorway) ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Neoplan",
        -0.21857,
        5.56952
      ],
      [
        "Trasacco",
        -0.11768,
        5.64506
      ],
      [
        "Ashaiman Overhead",
        -0.02578,
        5.68205
      ],
      [
        "Tema Motorway Total",
        -0.014,
        5.6826
      ],
      [
        "Community 9",
        -0.01226,
        5.67898
      ],
      [
        "Community 8",
        -0.00993,
        5.67321
      ],
      [
        "Community 7",
        -0.00623,
        5.6647
      ],
      [
        "Community 4",
        -0.00355,
        5.65801
      ],
      [
        "Site 10",
        0.00024,
        5.65104
      ],
      [
        "Site 20",
        0.00226,
        5.64744
      ],
      [
        "Tema Main Harbour",
        0.00313,
        5.64529
      ]
    ]
  },
  {
    "id": "gtfs_7604967_106",
    "name": "Circle Lido ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Abotare",
        -0.24545,
        5.60516
      ],
      [
        "Abeka Post Office",
        -0.24395,
        5.60404
      ],
      [
        "Eno",
        -0.24198,
        5.60275
      ],
      [
        "Fadama",
        -0.24079,
        5.60175
      ],
      [
        "Abeka Main Market",
        -0.2393,
        5.60081
      ],
      [
        "Free Pipe",
        -0.23766,
        5.59986
      ],
      [
        "Adom Junction",
        -0.23686,
        5.59957
      ],
      [
        "PnP Junction",
        -0.23571,
        5.59913
      ],
      [
        "Abeka Bcos Junction",
        -0.2348,
        5.5988
      ],
      [
        "Total",
        -0.23335,
        5.59803
      ],
      [
        "Tesano Gardens",
        -0.23113,
        5.59829
      ],
      [
        "Fitting Shop",
        -0.22628,
        5.59918
      ],
      [
        "Abeka Junction Curve",
        -0.22459,
        5.5994
      ],
      [
        "Abeka Junction",
        -0.22397,
        5.59892
      ],
      [
        "CAT",
        -0.22196,
        5.59518
      ],
      [
        "Caprice",
        -0.21704,
        5.58396
      ],
      [
        "Avenor",
        -0.21681,
        5.58065
      ],
      [
        "Circle Asoredanho",
        -0.21673,
        5.57563
      ],
      [
        "Ashongman",
        -0.21667,
        5.57426
      ],
      [
        "Vodafone",
        -0.21614,
        5.57186
      ],
      [
        "Circle",
        -0.21329,
        5.57067
      ]
    ]
  },
  {
    "id": "gtfs_7452837_104",
    "name": "Circle ↔ WAEC",
    "color": "#1779c2",
    "stops": [
      [
        "WAEC",
        -0.19945,
        5.56475
      ],
      [
        "Ridge Hospital",
        -0.19904,
        5.56121
      ],
      [
        "Adabraka Market",
        -0.21107,
        5.5637
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Circle",
        -0.21483,
        5.56885
      ]
    ]
  },
  {
    "id": "gtfs_7546845_39",
    "name": "Kaneshie ↔ Arena",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23495,
        5.56457
      ],
      [
        "Pamprom",
        -0.23173,
        5.56264
      ],
      [
        "Abossey Okai",
        -0.22992,
        5.56048
      ],
      [
        "Seconds",
        -0.22324,
        5.55267
      ],
      [
        "Market",
        -0.2216,
        5.5512
      ],
      [
        "Arena",
        -0.21575,
        5.54577
      ]
    ]
  },
  {
    "id": "gtfs_7546726_33",
    "name": "Kotobabi Police Station ↔ Alajo Junction",
    "color": "#1779c2",
    "stops": [
      [
        "Kotobabi Police Station",
        -0.20478,
        5.59201
      ],
      [
        "Prempeh",
        -0.20592,
        5.59301
      ],
      [
        "Tobinco Junction",
        -0.20629,
        5.59332
      ],
      [
        "Labour Centre",
        -0.20652,
        5.59357
      ],
      [
        "Kotobabi Market junction",
        -0.20763,
        5.59474
      ],
      [
        "Social",
        -0.20822,
        5.59516
      ],
      [
        "Kotobabi Down (Polo Park)",
        -0.20915,
        5.59589
      ],
      [
        "Modest",
        -0.20971,
        5.59635
      ],
      [
        "Polo Junction",
        -0.21237,
        5.59846
      ],
      [
        "Merciful Hotel",
        -0.21359,
        5.59855
      ],
      [
        "Alajo T-Junction",
        -0.2171,
        5.59854
      ],
      [
        "Pele",
        -0.21701,
        5.59731
      ],
      [
        "Taxi Rank Alajo",
        -0.2169,
        5.59603
      ],
      [
        "Filling Station",
        -0.21676,
        5.59405
      ],
      [
        "Alajo Market",
        -0.21708,
        5.59107
      ],
      [
        "Alajo Junction",
        -0.21807,
        5.59055
      ]
    ]
  },
  {
    "id": "gtfs_7475836_31",
    "name": "Circle ↔ Alajo",
    "color": "#1779c2",
    "stops": [
      [
        "Circle (Alajo Station)",
        -0.21424,
        5.57114
      ],
      [
        "Hubtel",
        -0.2158,
        5.57849
      ],
      [
        "Avalley",
        -0.21584,
        5.58057
      ],
      [
        "Caprice Juntion",
        -0.21585,
        5.58138
      ],
      [
        "Alajo Market",
        -0.21737,
        5.59073
      ],
      [
        "Filling Station",
        -0.21672,
        5.59403
      ],
      [
        "Taxi Rank Alajo",
        -0.21683,
        5.59586
      ],
      [
        "Pele",
        -0.21692,
        5.59708
      ],
      [
        "Alajo T-Junction",
        -0.21704,
        5.59859
      ]
    ]
  },
  {
    "id": "gtfs_7476180_37",
    "name": "Apapa ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Apapa",
        -0.16379,
        5.56735
      ],
      [
        "Labone",
        -0.17356,
        5.56299
      ],
      [
        "Bridge",
        -0.17714,
        5.56497
      ],
      [
        "Koala",
        -0.18113,
        5.56614
      ],
      [
        "Afridom",
        -0.18135,
        5.56483
      ],
      [
        "SSNIT",
        -0.18231,
        5.56301
      ],
      [
        "Osu Shell",
        -0.18268,
        5.5566
      ],
      [
        "Presby School Junction",
        -0.18335,
        5.55498
      ],
      [
        "Five junction",
        -0.18442,
        5.55231
      ],
      [
        "Ministries",
        -0.1946,
        5.54875
      ],
      [
        "Agric",
        -0.19858,
        5.54784
      ],
      [
        "Accra New Tema Station",
        -0.20105,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7440787_35",
    "name": "Sapeiman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Sapeiman",
        -0.31139,
        5.72574
      ],
      [
        "Agya Appiah",
        -0.30745,
        5.71583
      ],
      [
        "Toman",
        -0.30475,
        5.71145
      ],
      [
        "Amasaman",
        -0.29829,
        5.70553
      ],
      [
        "Fusi Junction",
        -0.29215,
        5.6982
      ],
      [
        "Festus",
        -0.28752,
        5.69179
      ],
      [
        "Pokuase Junction",
        -0.28164,
        5.68718
      ],
      [
        "ACP Junction",
        -0.27746,
        5.68392
      ],
      [
        "Agya Herbal",
        -0.27196,
        5.67237
      ],
      [
        "John Teye",
        -0.27114,
        5.66912
      ],
      [
        "Ofankor Barrier",
        -0.26547,
        5.65766
      ],
      [
        "Income Tax",
        -0.26118,
        5.65458
      ],
      [
        "Spot M",
        -0.2586,
        5.65294
      ],
      [
        "Taifa Junction",
        -0.25123,
        5.64838
      ],
      [
        "Tantra Hills",
        -0.24708,
        5.64479
      ],
      [
        "Tantra Reservoir",
        -0.25065,
        5.64165
      ],
      [
        "Tantra Hills Estate",
        -0.25064,
        5.63617
      ],
      [
        "Roman",
        -0.25087,
        5.63446
      ],
      [
        "Rasta Park",
        -0.2516,
        5.63257
      ],
      [
        "T-Junction Down",
        -0.25157,
        5.62796
      ],
      [
        "Mile 7 T-Junction Top",
        -0.25058,
        5.6263
      ],
      [
        "Pharmacy",
        -0.24906,
        5.6239
      ],
      [
        "Family Life",
        -0.24853,
        5.62248
      ],
      [
        "Fishpond",
        -0.24996,
        5.61858
      ],
      [
        "Alhadji No Front",
        -0.24905,
        5.61669
      ],
      [
        "High Tension",
        -0.2484,
        5.61602
      ],
      [
        "Links Garden",
        -0.24667,
        5.6148
      ],
      [
        "Nii Boi Station",
        -0.24525,
        5.61373
      ],
      [
        "Container",
        -0.24503,
        5.61295
      ],
      [
        "MTN",
        -0.24574,
        5.60943
      ],
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ]
    ]
  },
  {
    "id": "gtfs_7573256_438",
    "name": "Nungua Authority ↔ Accra Rawlings Park",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Rawlings Park",
        -0.20681,
        5.5458
      ],
      [
        "Accra Bishop",
        -0.20451,
        5.54393
      ],
      [
        "Ama",
        -0.20383,
        5.54482
      ],
      [
        "Ministries",
        -0.19469,
        5.54857
      ],
      [
        "Second Stop",
        -0.18545,
        5.55039
      ],
      [
        "Anoorhor",
        -0.18222,
        5.55073
      ],
      [
        "Osu Police Station",
        -0.17816,
        5.55223
      ],
      [
        "Rigal Bus stop",
        -0.17586,
        5.55309
      ],
      [
        "Arko Adjei",
        -0.1708,
        5.55482
      ],
      [
        "Curve",
        -0.16793,
        5.55589
      ],
      [
        "Polyclinic",
        -0.16661,
        5.55638
      ],
      [
        "Kpogas",
        -0.1647,
        5.55713
      ],
      [
        "Jokers",
        -0.16373,
        5.55749
      ],
      [
        "Olympia",
        -0.15871,
        5.55788
      ],
      [
        "Court",
        -0.15537,
        5.55729
      ],
      [
        "Dreamland",
        -0.15148,
        5.5587
      ],
      [
        "Alonte Bar",
        -0.14902,
        5.55966
      ],
      [
        "Regimanuel",
        -0.14493,
        5.56226
      ],
      [
        "T-Junction",
        -0.14345,
        5.56316
      ],
      [
        "La-Palm Hotel",
        -0.1431,
        5.56332
      ],
      [
        "Labadi Beach",
        -0.14061,
        5.56394
      ],
      [
        "La Beach Hotel",
        -0.13877,
        5.56431
      ],
      [
        "Bush Road",
        -0.1318,
        5.56639
      ],
      [
        "First Gate",
        -0.12769,
        5.56753
      ],
      [
        "Second Gate",
        -0.12381,
        5.56853
      ],
      [
        "Next Door",
        -0.11776,
        5.57056
      ],
      [
        "Kofi Annan",
        -0.1126,
        5.57385
      ],
      [
        "Laskala",
        -0.10983,
        5.57803
      ],
      [
        "Addoemi",
        -0.10787,
        5.58017
      ],
      [
        "Mobil",
        -0.104,
        5.58357
      ],
      [
        "First Junction",
        -0.09943,
        5.58749
      ],
      [
        "A-life",
        -0.09321,
        5.59121
      ],
      [
        "Brigade",
        -0.089,
        5.59379
      ],
      [
        "Cold Store",
        -0.08565,
        5.59582
      ],
      [
        "C5",
        -0.08239,
        5.59781
      ],
      [
        "Bank",
        -0.08029,
        5.60016
      ],
      [
        "Nungua",
        -0.07911,
        5.60223
      ]
    ]
  },
  {
    "id": "gtfs_7573493_436",
    "name": "La Olympia ↔ Accra Rawlings Park",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Rawlings Park",
        -0.20681,
        5.5458
      ],
      [
        "Accra Bishop",
        -0.20451,
        5.54393
      ],
      [
        "Ama",
        -0.20383,
        5.54482
      ],
      [
        "Ministries",
        -0.19469,
        5.54857
      ],
      [
        "Stadium Junction",
        -0.1909,
        5.55025
      ],
      [
        "Osu Cemetry Junction",
        -0.18939,
        5.55314
      ],
      [
        "Osu Salem",
        -0.18597,
        5.55591
      ],
      [
        "Kelewele",
        -0.1815,
        5.55364
      ],
      [
        "Osu Police Station",
        -0.17816,
        5.55223
      ],
      [
        "Rigal Bus stop",
        -0.17586,
        5.55309
      ],
      [
        "Kaadzano Junction",
        -0.17441,
        5.55365
      ],
      [
        "Arko Adjei",
        -0.1708,
        5.55482
      ],
      [
        "Curve",
        -0.16793,
        5.55589
      ],
      [
        "Polyclinic",
        -0.16661,
        5.55638
      ],
      [
        "Kpogas",
        -0.1647,
        5.55713
      ],
      [
        "Jokers",
        -0.16373,
        5.55749
      ],
      [
        "Total",
        -0.16,
        5.55914
      ],
      [
        "La Olympia",
        -0.15855,
        5.55969
      ]
    ]
  },
  {
    "id": "gtfs_7598186_434",
    "name": "Sakaman Blue Lagoon ↔ Accra Rawlings Park",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Rawlings Park",
        -0.20851,
        5.54555
      ],
      [
        "Accra Post Office",
        -0.20977,
        5.54198
      ],
      [
        "Atta Quarshie",
        -0.21182,
        5.5415
      ],
      [
        "Akoto Lante",
        -0.21541,
        5.54078
      ],
      [
        "Agbado",
        -0.21666,
        5.54045
      ],
      [
        "UTC",
        -0.21727,
        5.53742
      ],
      [
        "Fire Service",
        -0.21693,
        5.53211
      ],
      [
        "Korle er naa",
        -0.21939,
        5.53141
      ],
      [
        "Nzunzu",
        -0.22411,
        5.53011
      ],
      [
        "Korle gonno shell",
        -0.22491,
        5.52994
      ],
      [
        "1st stop",
        -0.22702,
        5.5295
      ],
      [
        "Korle beach resort",
        -0.22791,
        5.5293
      ],
      [
        "Ama Mensah",
        -0.23003,
        5.52888
      ],
      [
        "Galilee",
        -0.2335,
        5.52816
      ],
      [
        "Hotel Junction",
        -0.23426,
        5.528
      ],
      [
        "Wolarm",
        -0.23557,
        5.52775
      ],
      [
        "White House",
        -0.23614,
        5.52763
      ],
      [
        "Market Junction",
        -0.23724,
        5.53216
      ],
      [
        "Shell",
        -0.23738,
        5.53299
      ],
      [
        "Mamprobi Shell",
        -0.23781,
        5.53374
      ],
      [
        "Mamprobi Police Station",
        -0.23974,
        5.53396
      ],
      [
        "Rainbow",
        -0.24084,
        5.53425
      ],
      [
        "Mamprobi Methodist",
        -0.24382,
        5.53511
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24626,
        5.53563
      ],
      [
        "IBE (Camara)",
        -0.24755,
        5.53564
      ],
      [
        "Nku Kpotoi",
        -0.2486,
        5.53562
      ],
      [
        "Camara Junction",
        -0.2505,
        5.53567
      ],
      [
        "Mangoase",
        -0.25269,
        5.53568
      ],
      [
        "Bank",
        -0.25439,
        5.53626
      ],
      [
        "Camara (Station)",
        -0.25523,
        5.5366
      ],
      [
        "Camara",
        -0.25715,
        5.53731
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "St. Martin Depores",
        -0.26512,
        5.55978
      ],
      [
        "Oxygen (o2)",
        -0.26521,
        5.56126
      ],
      [
        "Ave Maria",
        -0.26875,
        5.56536
      ],
      [
        "Thirteen",
        -0.27022,
        5.56762
      ],
      [
        "Dela",
        -0.27122,
        5.57052
      ],
      [
        "Sakaman Blue Lagoon",
        -0.27214,
        5.57149
      ]
    ]
  },
  {
    "id": "gtfs_7573629_432",
    "name": "Mamprobi ↔ Accra Post Office",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Post Office",
        -0.20899,
        5.5405
      ],
      [
        "Atta Quarshie",
        -0.21182,
        5.5415
      ],
      [
        "Akoto Lante",
        -0.21541,
        5.54078
      ],
      [
        "Agbado",
        -0.21666,
        5.54045
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Korle Bu",
        -0.22705,
        5.53612
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Shell",
        -0.23781,
        5.53374
      ],
      [
        "Mamprobi Police Station",
        -0.23974,
        5.53396
      ],
      [
        "Rainbow",
        -0.24084,
        5.53425
      ],
      [
        "Mamprobi Methodist",
        -0.24382,
        5.53511
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24626,
        5.53563
      ]
    ]
  },
  {
    "id": "gtfs_7421719_430",
    "name": "Kaneshie ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Old Stop",
        -0.2329,
        5.58771
      ],
      [
        "Masalakyi",
        -0.23166,
        5.58494
      ],
      [
        "Green Hand",
        -0.23046,
        5.58207
      ],
      [
        "Kaneshie Polyclinic",
        -0.23069,
        5.57426
      ],
      [
        "Roundabout",
        -0.23115,
        5.57207
      ],
      [
        "Social Welfare",
        -0.23433,
        5.56881
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7589313_339",
    "name": "Nima ↔ Ashaiman",
    "color": "#1779c2",
    "stops": [
      [
        "Nima",
        -0.19785,
        5.58013
      ],
      [
        "Nima Junction",
        -0.19438,
        5.58261
      ],
      [
        "441",
        -0.19248,
        5.58688
      ],
      [
        "Library",
        -0.19182,
        5.58856
      ],
      [
        "Kaukudi",
        -0.18941,
        5.59319
      ],
      [
        "National Service",
        -0.18313,
        5.60966
      ],
      [
        "Airport Second",
        -0.17658,
        5.60983
      ],
      [
        "Shangrila",
        -0.17591,
        5.61719
      ],
      [
        "Accra Mall",
        -0.17405,
        5.62277
      ],
      [
        "Action Chapel",
        -0.16577,
        5.62636
      ],
      [
        "Flower Pot",
        -0.15549,
        5.62966
      ],
      [
        "Toll Booth",
        -0.14384,
        5.63445
      ],
      [
        "Manet",
        -0.12812,
        5.64091
      ],
      [
        "Trasacco",
        -0.11768,
        5.64506
      ],
      [
        "Coca-Cola / Police Station",
        -0.10552,
        5.64999
      ],
      [
        "KICC",
        -0.09531,
        5.65412
      ],
      [
        "18 Junction",
        -0.07565,
        5.66056
      ],
      [
        "Abattoir",
        -0.07139,
        5.66224
      ],
      [
        "Biscuit Factory",
        -0.06689,
        5.66409
      ],
      [
        "Under Bridge",
        -0.0436,
        5.67479
      ],
      [
        "Ashaiman Overhead",
        -0.02578,
        5.68205
      ],
      [
        "Hospital Roundabout Junction",
        -0.02457,
        5.68163
      ],
      [
        "Washing Bay",
        -0.02792,
        5.68514
      ],
      [
        "Ashaiman Traffic Junction",
        -0.029,
        5.68648
      ],
      [
        "Ashaiman Police Station",
        -0.031,
        5.68754
      ],
      [
        "Ashaiman Last Stop",
        -0.03175,
        5.68692
      ],
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ]
    ]
  },
  {
    "id": "gtfs_7477058_335",
    "name": "Nima Maamobi ↔ Accra New Town",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station",
        -0.19843,
        5.58204
      ],
      [
        "Nima Market",
        -0.1995,
        5.58012
      ],
      [
        "Nima Roundabout",
        -0.20058,
        5.57828
      ],
      [
        "New town",
        -0.20865,
        5.5826
      ]
    ]
  },
  {
    "id": "gtfs_7588801_337",
    "name": "Nima ↔ Accra",
    "color": "#1779c2",
    "stops": [
      [
        "Nima",
        -0.19838,
        5.58057
      ],
      [
        "Nima Market",
        -0.1995,
        5.58012
      ],
      [
        "Nima Roundabout",
        -0.20086,
        5.57748
      ],
      [
        "Nima School Junction",
        -0.20083,
        5.57628
      ],
      [
        "Kanda Overhead",
        -0.19834,
        5.57472
      ],
      [
        "Sunny FM",
        -0.20007,
        5.57033
      ],
      [
        "Accra High School",
        -0.2009,
        5.56885
      ],
      [
        "Second Gate",
        -0.20211,
        5.56487
      ],
      [
        "Ridge",
        -0.20022,
        5.56166
      ],
      [
        "Accra High",
        -0.2016,
        5.56007
      ],
      [
        "Accra Technical University",
        -0.2054,
        5.55541
      ],
      [
        "Novotel",
        -0.2048,
        5.55397
      ],
      [
        "Kinbu",
        -0.20419,
        5.55128
      ],
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7477085_331",
    "name": "Madina ↔ Accra New Town",
    "color": "#1779c2",
    "stops": [
      [
        "Madina",
        -0.17164,
        5.67668
      ],
      [
        "UPS",
        -0.16668,
        5.65986
      ],
      [
        "High Tension",
        -0.17002,
        5.6435
      ],
      [
        "Okponglo",
        -0.17815,
        5.63961
      ],
      [
        "Legon Second Gate",
        -0.17746,
        5.63576
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Spanner",
        -0.17649,
        5.62051
      ],
      [
        "Nyaho",
        -0.18517,
        5.61486
      ],
      [
        "Container First",
        -0.18194,
        5.61695
      ],
      [
        "Sign Board",
        -0.18827,
        5.60195
      ],
      [
        "Jack and Jill",
        -0.18955,
        5.60202
      ],
      [
        "SGS",
        -0.19191,
        5.60224
      ],
      [
        "Frensho",
        -0.19339,
        5.60181
      ],
      [
        "Power House",
        -0.19428,
        5.59977
      ],
      [
        "Pig Farm",
        -0.198,
        5.59876
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ]
    ]
  },
  {
    "id": "gtfs_7456425_333",
    "name": "Antie-Eku Pallas Town ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Antie-Eku Pallas Town",
        -0.2848,
        5.61267
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27269,
        5.59936
      ],
      [
        "Kwashieman Junction",
        -0.26846,
        5.59258
      ],
      [
        "Kwashieman",
        -0.26786,
        5.59225
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abeka Lapaz",
        -0.2491,
        5.60694
      ]
    ]
  },
  {
    "id": "gtfs_7474831_6",
    "name": "Mallam Attah ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Abelenkpe Curve",
        -0.21522,
        5.60738
      ],
      [
        "Abelemkpe Junction",
        -0.21023,
        5.60925
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Pig Farm",
        -0.198,
        5.59876
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Mallam Attah",
        -0.20979,
        5.57939
      ]
    ]
  },
  {
    "id": "gtfs_7471831_99",
    "name": "Teachers Hall ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Teachers Hall",
        -0.20795,
        5.55768
      ],
      [
        "Adabraka Market",
        -0.21107,
        5.5637
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "Circle",
        -0.21595,
        5.56885
      ]
    ]
  },
  {
    "id": "gtfs_7471406_91",
    "name": "Ridge Hospital ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Ridge Hospital",
        -0.19904,
        5.56121
      ],
      [
        "Mental",
        -0.20457,
        5.56263
      ],
      [
        "Cathedral",
        -0.20615,
        5.56357
      ],
      [
        "Total",
        -0.20779,
        5.5652
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "Circle",
        -0.21595,
        5.56885
      ]
    ]
  },
  {
    "id": "gtfs_7471624_93",
    "name": "Stadium ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Stadium",
        -0.19044,
        5.55347
      ],
      [
        "Ridge Hospital",
        -0.19904,
        5.56121
      ],
      [
        "Mental",
        -0.20457,
        5.56263
      ],
      [
        "Cathedral",
        -0.20615,
        5.56357
      ],
      [
        "Total",
        -0.20779,
        5.5652
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "Circle",
        -0.21595,
        5.56885
      ]
    ]
  },
  {
    "id": "gtfs_7418569_95",
    "name": "Swanlake Last Stop ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Swanlake Last Stop",
        -0.23399,
        5.58406
      ],
      [
        "Circle Asoredanho",
        -0.21673,
        5.57563
      ],
      [
        "Circle",
        -0.21676,
        5.56975
      ]
    ]
  },
  {
    "id": "gtfs_7441993_97",
    "name": "Dome ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Dome",
        -0.23722,
        5.64516
      ],
      [
        "Dome Market",
        -0.23783,
        5.64386
      ],
      [
        "St. Johns",
        -0.24217,
        5.63959
      ],
      [
        "Tantra Hills",
        -0.24551,
        5.64292
      ],
      [
        "Mile 7 Junction",
        -0.24051,
        5.63457
      ],
      [
        "Presby Junction",
        -0.24269,
        5.63328
      ],
      [
        "Mile 7 Park",
        -0.24422,
        5.63229
      ],
      [
        "Jesus and Mary",
        -0.24654,
        5.63062
      ],
      [
        "Mile 7 Clinic",
        -0.24795,
        5.62972
      ],
      [
        "Mile 7 T-Junction Top",
        -0.25058,
        5.6263
      ],
      [
        "School Junction",
        -0.25024,
        5.62586
      ],
      [
        "Pharmacy",
        -0.24906,
        5.6239
      ],
      [
        "Family Life",
        -0.24853,
        5.62248
      ],
      [
        "Fishpond",
        -0.24996,
        5.61858
      ],
      [
        "Alhadji No Front",
        -0.24905,
        5.61669
      ],
      [
        "High Tension",
        -0.2484,
        5.61602
      ],
      [
        "Links Garden",
        -0.24667,
        5.6148
      ],
      [
        "Nii Boi Station",
        -0.24525,
        5.61373
      ],
      [
        "Container",
        -0.24503,
        5.61295
      ],
      [
        "MTN",
        -0.24574,
        5.60943
      ],
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ]
    ]
  },
  {
    "id": "gtfs_7425145_551",
    "name": "Circle Overhead ↔ Ashaiaman",
    "color": "#1779c2",
    "stops": [
      [
        "Neoplan",
        -0.21857,
        5.56952
      ],
      [
        "Accra Mall",
        -0.17431,
        5.62357
      ],
      [
        "Trasacco",
        -0.11768,
        5.64506
      ],
      [
        "Abattoir",
        -0.07139,
        5.66224
      ],
      [
        "Ashaiman Overhead",
        -0.02578,
        5.68205
      ],
      [
        "Washing Bay",
        -0.02792,
        5.68514
      ],
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ]
    ]
  },
  {
    "id": "gtfs_7563457_553",
    "name": "Sowutuom ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Sowutuom",
        -0.29233,
        5.63114
      ],
      [
        "Duase",
        -0.29095,
        5.63107
      ],
      [
        "Block factory Sowutuom",
        -0.2893,
        5.63104
      ],
      [
        "Mambo",
        -0.28566,
        5.63109
      ],
      [
        "Heavenly Church",
        -0.28563,
        5.62708
      ],
      [
        "Sowutuom Last stop",
        -0.28448,
        5.62517
      ],
      [
        "Printing press",
        -0.27977,
        5.62367
      ],
      [
        "Pentecost",
        -0.2788,
        5.62271
      ],
      [
        "Transformer Sowutuom",
        -0.27802,
        5.622
      ],
      [
        "Sowutuom Market",
        -0.27685,
        5.62004
      ],
      [
        "Sowutuom Chopbar",
        -0.27636,
        5.6174
      ],
      [
        "Dega Junction",
        -0.27568,
        5.61524
      ],
      [
        "Mystical Rose Int School Junction",
        -0.2745,
        5.6153
      ],
      [
        "Race Course",
        -0.27143,
        5.6141
      ],
      [
        "Phobia Junction",
        -0.26973,
        5.61329
      ],
      [
        "Gyedu Junction",
        -0.26778,
        5.61196
      ],
      [
        "Rasta Junction",
        -0.2661,
        5.61128
      ],
      [
        "Attah Junction",
        -0.26532,
        5.61025
      ],
      [
        "Container Race Course",
        -0.26405,
        5.60906
      ],
      [
        "School Junction Race Course",
        -0.26325,
        5.60828
      ],
      [
        "Race Course Blue Gate",
        -0.26239,
        5.60749
      ],
      [
        "Ahenfie",
        -0.26094,
        5.6065
      ],
      [
        "Tabora Number2",
        -0.25986,
        5.60605
      ],
      [
        "Tabora Number 3",
        -0.25866,
        5.60707
      ],
      [
        "Lapaz Market",
        -0.25719,
        5.60743
      ],
      [
        "Abrantie",
        -0.25491,
        5.6067
      ],
      [
        "Lapaz Community Hospital",
        -0.25404,
        5.60884
      ],
      [
        "Lapaz Masalaashie",
        -0.25269,
        5.60981
      ],
      [
        "Lapaz Last stop",
        -0.25089,
        5.6095
      ],
      [
        "Lapaz Station",
        -0.24978,
        5.60808
      ],
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ]
    ]
  },
  {
    "id": "gtfs_7499299_238",
    "name": "Korle Bu ↔ Darkuman",
    "color": "#1779c2",
    "stops": [
      [
        "Darkuman",
        -0.251,
        5.58895
      ],
      [
        "Quarters",
        -0.24999,
        5.58626
      ],
      [
        "Mangoase",
        -0.24822,
        5.58626
      ],
      [
        "Asoredanho",
        -0.24215,
        5.58624
      ],
      [
        "Wireless",
        -0.24028,
        5.58624
      ],
      [
        "Washingbay",
        -0.23954,
        5.58623
      ],
      [
        "Awony3",
        -0.23907,
        5.58529
      ],
      [
        "Awonye",
        -0.23632,
        5.58253
      ],
      [
        "St. Johns",
        -0.23522,
        5.58235
      ],
      [
        "School Junction",
        -0.23546,
        5.58087
      ],
      [
        "Presby",
        -0.23332,
        5.57504
      ],
      [
        "Mothers Inn",
        -0.23129,
        5.57335
      ],
      [
        "Roundabout",
        -0.23062,
        5.57193
      ],
      [
        "Awudome",
        -0.22819,
        5.5692
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "STC",
        -0.22638,
        5.56401
      ],
      [
        "Rana Motors",
        -0.22359,
        5.55962
      ],
      [
        "Cold store",
        -0.22221,
        5.55695
      ],
      [
        "Graphic",
        -0.2197,
        5.55551
      ],
      [
        "First Gate",
        -0.21472,
        5.55425
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra UTC",
        -0.21063,
        5.54959
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ]
    ]
  },
  {
    "id": "gtfs_7580705_234",
    "name": "Mallam ↔ Korle Bu",
    "color": "#1779c2",
    "stops": [
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Station",
        -0.23777,
        5.53467
      ],
      [
        "Sempe First",
        -0.23834,
        5.537
      ],
      [
        "Sempe Second",
        -0.23872,
        5.5386
      ],
      [
        "Salvation Army",
        -0.23928,
        5.54097
      ],
      [
        "Korle Bu Junction",
        -0.23993,
        5.5436
      ],
      [
        "Radio Gold",
        -0.24013,
        5.54807
      ],
      [
        "Black Smith",
        -0.24012,
        5.55111
      ],
      [
        "Pipeier Naa",
        -0.24013,
        5.5535
      ],
      [
        "Kasoa Station",
        -0.24014,
        5.55627
      ],
      [
        "Zongo Junction",
        -0.23979,
        5.55779
      ],
      [
        "Mataheko",
        -0.24395,
        5.56298
      ],
      [
        "Flamingo",
        -0.24451,
        5.56454
      ],
      [
        "Kateco",
        -0.24392,
        5.56574
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Atico",
        -0.25072,
        5.57437
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor",
        -0.26242,
        5.5807
      ],
      [
        "Odorkor (Main Bus stop)",
        -0.26369,
        5.58043
      ],
      [
        "Busia Junction",
        -0.26784,
        5.57912
      ],
      [
        "Tipper",
        -0.26991,
        5.5785
      ],
      [
        "Sakaman",
        -0.27399,
        5.57666
      ],
      [
        "Chabaar",
        -0.27501,
        5.57606
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "Mallam Junction",
        -0.28551,
        5.57101
      ],
      [
        "Masalaachi Mallam",
        -0.28675,
        5.57278
      ],
      [
        "Abase Mallam",
        -0.28746,
        5.57438
      ],
      [
        "Mallam Station",
        -0.29002,
        5.57524
      ],
      [
        "Mallam",
        -0.28943,
        5.57536
      ]
    ]
  },
  {
    "id": "gtfs_7462998_236",
    "name": "Kaneshie ↔ Dansoman",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.2653,
        5.53004
      ],
      [
        "Kofi ne Ama",
        -0.26531,
        5.53305
      ],
      [
        "Seven Great",
        -0.26517,
        5.53567
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "MTN",
        -0.26131,
        5.55868
      ],
      [
        "Dansoman First Stop",
        -0.26019,
        5.55998
      ],
      [
        "Dansoman Polyclinic",
        -0.26019,
        5.56114
      ],
      [
        "Abomatte",
        -0.26019,
        5.56268
      ],
      [
        "Akukofoto",
        -0.25985,
        5.56463
      ],
      [
        "Wesley Grammar",
        -0.25824,
        5.56685
      ],
      [
        "Asoredanho Curve",
        -0.25653,
        5.56804
      ],
      [
        "Dansoman Asoredanho",
        -0.2554,
        5.57023
      ],
      [
        "1 plus 1",
        -0.25356,
        5.56988
      ],
      [
        "Mataheko Pharmacy",
        -0.25145,
        5.56848
      ],
      [
        "Mataheko Police Quarters",
        -0.2499,
        5.56741
      ],
      [
        "JT",
        -0.24503,
        5.56445
      ],
      [
        "Kateco",
        -0.24392,
        5.56574
      ],
      [
        "Central University",
        -0.24256,
        5.56534
      ],
      [
        "Kant",
        -0.24054,
        5.56484
      ],
      [
        "Ashleys",
        -0.23884,
        5.56381
      ],
      [
        "Dansoman Trotro Station",
        -0.2379,
        5.56357
      ],
      [
        "Kaneshie",
        -0.23778,
        5.56404
      ]
    ]
  },
  {
    "id": "gtfs_7462415_230",
    "name": "Kasoa ↔ Korle Bu",
    "color": "#1779c2",
    "stops": [
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Station",
        -0.23777,
        5.53467
      ],
      [
        "Sempe First",
        -0.23834,
        5.537
      ],
      [
        "Sempe Second",
        -0.23872,
        5.5386
      ],
      [
        "Salvation Army",
        -0.23928,
        5.54097
      ],
      [
        "Korle Bu Junction",
        -0.23993,
        5.5436
      ],
      [
        "Radio Gold",
        -0.24013,
        5.54807
      ],
      [
        "Black Smith",
        -0.24012,
        5.55111
      ],
      [
        "Pipeier Naa",
        -0.24013,
        5.5535
      ],
      [
        "Kasoa Station",
        -0.24014,
        5.55627
      ],
      [
        "Zongo Junction",
        -0.24077,
        5.55759
      ],
      [
        "Club Corner",
        -0.24348,
        5.55822
      ],
      [
        "Seventh Day Adventist",
        -0.24626,
        5.55911
      ],
      [
        "Kembs Hotel",
        -0.24577,
        5.56084
      ],
      [
        "JT",
        -0.24526,
        5.56262
      ],
      [
        "Kateco",
        -0.24392,
        5.56574
      ],
      [
        "First Light",
        -0.24265,
        5.56789
      ],
      [
        "Odorkor (Main Bus stop)",
        -0.26369,
        5.58043
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "McCarthy Junction",
        -0.28894,
        5.56551
      ],
      [
        "Weija-Gbawe Municipal Hospital",
        -0.28955,
        5.56416
      ],
      [
        "Benjys",
        -0.29034,
        5.56242
      ],
      [
        "Jayeemens",
        -0.29228,
        5.56033
      ],
      [
        "Mendskrom",
        -0.29718,
        5.55834
      ],
      [
        "Weija Junction",
        -0.30385,
        5.55591
      ],
      [
        "Tetegu",
        -0.30967,
        5.55394
      ],
      [
        "Modex",
        -0.32232,
        5.5533
      ],
      [
        "Weija Barrier",
        -0.33036,
        5.55093
      ],
      [
        "Block Factory",
        -0.33548,
        5.54885
      ],
      [
        "SCC",
        -0.33874,
        5.54754
      ],
      [
        "Shoprite",
        -0.34208,
        5.54639
      ],
      [
        "Bortianor",
        -0.34822,
        5.54779
      ],
      [
        "Ayigbe Town",
        -0.35383,
        5.55023
      ],
      [
        "Mile Eleven",
        -0.35566,
        5.55095
      ],
      [
        "Broadcasting",
        -0.35896,
        5.5523
      ],
      [
        "Tuba",
        -0.38253,
        5.54688
      ],
      [
        "Chinese",
        -0.38978,
        5.54341
      ],
      [
        "Kalabule",
        -0.39054,
        5.54303
      ],
      [
        "Brigade",
        -0.39465,
        5.54108
      ],
      [
        "Galelia",
        -0.39889,
        5.53907
      ],
      [
        "Galelia Market",
        -0.40138,
        5.53824
      ],
      [
        "Washing Bay",
        -0.40629,
        5.53688
      ],
      [
        "Iron City",
        -0.41096,
        5.53578
      ],
      [
        "Amanfrom",
        -0.41282,
        5.53569
      ],
      [
        "Pink FM",
        -0.41634,
        5.53568
      ],
      [
        "Second",
        -0.41895,
        5.53554
      ],
      [
        "Kasoa",
        -0.4238,
        5.53479
      ]
    ]
  },
  {
    "id": "gtfs_7559533_232",
    "name": "Kwashieman/Santa Maria ↔ Korle Bu",
    "color": "#1779c2",
    "stops": [
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Ayigbe Town",
        -0.23121,
        5.55374
      ],
      [
        "Happy Days",
        -0.23238,
        5.55569
      ],
      [
        "Laskia",
        -0.23557,
        5.55639
      ],
      [
        "Flamingo",
        -0.24451,
        5.56454
      ],
      [
        "Kateco",
        -0.24392,
        5.56574
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Atico",
        -0.25072,
        5.57437
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor",
        -0.26242,
        5.5807
      ],
      [
        "Odorkor Station",
        -0.26377,
        5.58188
      ],
      [
        "Odorkor Market",
        -0.26413,
        5.58296
      ],
      [
        "Off town junction",
        -0.26478,
        5.58506
      ],
      [
        "School junction",
        -0.26536,
        5.5868
      ],
      [
        "Kwashieman School Junction",
        -0.26701,
        5.58967
      ],
      [
        "Kwashieman Junction",
        -0.26796,
        5.59123
      ]
    ]
  },
  {
    "id": "gtfs_7488778_146",
    "name": "Santa Maria ↔ Dansoman",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.2653,
        5.53004
      ],
      [
        "Kofi ne Ama",
        -0.26524,
        5.53246
      ],
      [
        "Seven Great",
        -0.26513,
        5.53523
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "St. Martin Depores",
        -0.26512,
        5.55978
      ],
      [
        "Oxygen (o2)",
        -0.26521,
        5.56126
      ],
      [
        "Ave Maria",
        -0.26875,
        5.56536
      ],
      [
        "Thirteen",
        -0.27022,
        5.56762
      ],
      [
        "Dela",
        -0.27122,
        5.57052
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "Water Works",
        -0.27782,
        5.57955
      ],
      [
        "Vineyard",
        -0.27552,
        5.58219
      ],
      [
        "Been To",
        -0.27151,
        5.5873
      ],
      [
        "Kwashieman",
        -0.26986,
        5.58939
      ],
      [
        "Kwashieman Junction",
        -0.26843,
        5.5927
      ],
      [
        "Christ Mission",
        -0.26961,
        5.59442
      ],
      [
        "Jah Love",
        -0.27066,
        5.59638
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27208,
        5.59859
      ],
      [
        "Family Friend",
        -0.27323,
        5.60036
      ],
      [
        "Drug Store",
        -0.27477,
        5.60297
      ],
      [
        "Santa Maria",
        -0.27568,
        5.60577
      ]
    ]
  },
  {
    "id": "gtfs_7426651_144",
    "name": "Odorkor ↔ Dansoman",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.26531,
        5.5297
      ],
      [
        "Dansoman Last Stop",
        -0.2653,
        5.53004
      ],
      [
        "Kofi ne Ama",
        -0.26524,
        5.53246
      ],
      [
        "Seven Great",
        -0.26513,
        5.53523
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "St. Martin Depores",
        -0.26512,
        5.55978
      ],
      [
        "Oxygen (o2)",
        -0.26521,
        5.56126
      ],
      [
        "Ave Maria",
        -0.26875,
        5.56536
      ],
      [
        "Thirteen",
        -0.27022,
        5.56762
      ],
      [
        "Dela",
        -0.27122,
        5.57052
      ],
      [
        "Crystal",
        -0.26659,
        5.57618
      ],
      [
        "Busia Junction",
        -0.26729,
        5.5788
      ],
      [
        "Cold Store",
        -0.2657,
        5.57943
      ],
      [
        "Odorkor",
        -0.26376,
        5.58122
      ]
    ]
  },
  {
    "id": "gtfs_7498588_142",
    "name": "Circle Overhead ↔ Bawaleshie",
    "color": "#1779c2",
    "stops": [
      [
        "Bawaleshi Second",
        -0.16732,
        5.64187
      ],
      [
        "Mensvic",
        -0.17161,
        5.63709
      ],
      [
        "Emmanuel Eye Clinic",
        -0.17461,
        5.63012
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Spanner",
        -0.17649,
        5.62051
      ],
      [
        "Shangrila",
        -0.1761,
        5.61607
      ],
      [
        "Airport First",
        -0.17725,
        5.60808
      ],
      [
        "Airport Second",
        -0.17812,
        5.60419
      ],
      [
        "Opeibea First",
        -0.17951,
        5.59801
      ],
      [
        "Opeibea Second",
        -0.18012,
        5.59526
      ],
      [
        "37",
        -0.18105,
        5.59117
      ],
      [
        "37 Hospital",
        -0.18311,
        5.58762
      ],
      [
        "37 Water Works",
        -0.18549,
        5.58253
      ],
      [
        "Flagstaff House",
        -0.18811,
        5.57637
      ],
      [
        "Sankara",
        -0.19122,
        5.5728
      ],
      [
        "GBC",
        -0.19267,
        5.5735
      ],
      [
        "Mobil",
        -0.19752,
        5.57413
      ],
      [
        "Nima Junction",
        -0.20137,
        5.57318
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ]
    ]
  },
  {
    "id": "gtfs_7499300_140",
    "name": "Nyamekye ↔ Dansoman",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.2653,
        5.53004
      ],
      [
        "Kofi ne Ama",
        -0.26524,
        5.53246
      ],
      [
        "Seven Great",
        -0.26513,
        5.53523
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "MTN",
        -0.26131,
        5.55868
      ],
      [
        "Dansoman First Stop",
        -0.26019,
        5.55998
      ],
      [
        "Dansoman Polyclinic",
        -0.26019,
        5.56114
      ],
      [
        "Abomatte",
        -0.26019,
        5.56268
      ],
      [
        "Akukofoto",
        -0.25985,
        5.56463
      ],
      [
        "Wesley Grammar",
        -0.25824,
        5.56685
      ],
      [
        "Asoredanho Curve",
        -0.25653,
        5.56804
      ],
      [
        "Dansoman Asoredanho",
        -0.2554,
        5.57023
      ],
      [
        "Hansonic",
        -0.25294,
        5.57402
      ],
      [
        "Darkuman Junction",
        -0.25448,
        5.57761
      ],
      [
        "Kokompe",
        -0.25296,
        5.57993
      ],
      [
        "Masalatsi",
        -0.25161,
        5.58275
      ],
      [
        "Quarters",
        -0.2516,
        5.58557
      ],
      [
        "Darkuman Station",
        -0.25133,
        5.58917
      ],
      [
        "Circle Station",
        -0.25222,
        5.59093
      ],
      [
        "Alafia",
        -0.25222,
        5.59346
      ],
      [
        "Bombay",
        -0.2529,
        5.59568
      ],
      [
        "Fadama Junction",
        -0.25398,
        5.59745
      ],
      [
        "Mampong",
        -0.25592,
        5.60159
      ],
      [
        "Nyamekye",
        -0.2563,
        5.60292
      ]
    ]
  },
  {
    "id": "gtfs_7552568_148",
    "name": "Darkuman ↔ Agbogbloshie",
    "color": "#1779c2",
    "stops": [
      [
        "Agbogbloshie",
        -0.21984,
        5.55169
      ],
      [
        "Abossey Okai",
        -0.23031,
        5.55945
      ],
      [
        "Kaneshie",
        -0.23196,
        5.56329
      ],
      [
        "First junction",
        -0.23556,
        5.57241
      ],
      [
        "Five Five",
        -0.23569,
        5.57281
      ],
      [
        "Presby junction",
        -0.23613,
        5.57415
      ],
      [
        "A.M.A",
        -0.23629,
        5.57548
      ],
      [
        "Council",
        -0.23637,
        5.57617
      ],
      [
        "Cemetry",
        -0.23855,
        5.57727
      ],
      [
        "Bubuashie Control (Old Station )",
        -0.23949,
        5.58071
      ],
      [
        "Fita",
        -0.23898,
        5.58139
      ],
      [
        "Bubiashie Ayigbe Town",
        -0.24014,
        5.583
      ],
      [
        "Ayigbe town",
        -0.23988,
        5.5835
      ],
      [
        "Paradise",
        -0.23937,
        5.5861
      ],
      [
        "Wireless",
        -0.24016,
        5.58629
      ],
      [
        "Asoredanho",
        -0.24227,
        5.58631
      ],
      [
        "Police Station",
        -0.24498,
        5.58628
      ],
      [
        "Mangoase",
        -0.24831,
        5.58632
      ],
      [
        "Presby",
        -0.24982,
        5.58889
      ],
      [
        "Darkuman",
        -0.251,
        5.58895
      ]
    ]
  },
  {
    "id": "gtfs_7498005_133",
    "name": "Dansoman ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "St. Martin Depores",
        -0.26512,
        5.55978
      ],
      [
        "Oxygen (o2)",
        -0.26521,
        5.56126
      ],
      [
        "Ave Maria",
        -0.26875,
        5.56536
      ],
      [
        "Thirteen",
        -0.27022,
        5.56762
      ],
      [
        "Dela",
        -0.27122,
        5.57052
      ],
      [
        "Sakaman",
        -0.27404,
        5.57493
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "Water Works",
        -0.27782,
        5.57955
      ],
      [
        "Vineyard",
        -0.27552,
        5.58219
      ],
      [
        "Awoshie",
        -0.27345,
        5.58476
      ],
      [
        "Been To",
        -0.27151,
        5.5873
      ],
      [
        "Kwashieman",
        -0.26986,
        5.58939
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Abeka Lapaz",
        -0.24808,
        5.60678
      ],
      [
        "Bambolino",
        -0.24254,
        5.60826
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.2277,
        5.61205
      ],
      [
        "Achimota Old Station",
        -0.2294,
        5.61639
      ]
    ]
  },
  {
    "id": "gtfs_7480162_131",
    "name": "Weija ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Weija",
        -0.33738,
        5.57225
      ],
      [
        "Weija Junction",
        -0.30375,
        5.55646
      ],
      [
        "McCarthy",
        -0.28792,
        5.56701
      ],
      [
        "Mallam Junction",
        -0.28618,
        5.56908
      ],
      [
        "Mallam Market",
        -0.28039,
        5.57254
      ],
      [
        "Sakaman",
        -0.27423,
        5.57628
      ],
      [
        "Busia Junction",
        -0.26791,
        5.57891
      ],
      [
        "Odorkor",
        -0.26485,
        5.57968
      ],
      [
        "Darkuman Junction",
        -0.25445,
        5.57611
      ],
      [
        "Atico",
        -0.25118,
        5.57416
      ],
      [
        "Mataheko Quarters",
        -0.24754,
        5.57197
      ],
      [
        "Accra Academy",
        -0.24551,
        5.57077
      ],
      [
        "First Light",
        -0.24297,
        5.56926
      ],
      [
        "Kaneshie First Bridge",
        -0.23737,
        5.56602
      ],
      [
        "Kaneshie",
        -0.23495,
        5.56457
      ],
      [
        "Pamprom",
        -0.23173,
        5.56264
      ],
      [
        "Kaneshie Roundabout",
        -0.22797,
        5.56041
      ],
      [
        "Graphic",
        -0.2197,
        5.55551
      ],
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ]
    ]
  },
  {
    "id": "gtfs_7552498_137",
    "name": "Dansoman ↔ Awoshie",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.2653,
        5.53004
      ],
      [
        "Kofi ne Ama",
        -0.26524,
        5.53246
      ],
      [
        "Seven Great",
        -0.26513,
        5.53523
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "St. Martin Depores",
        -0.26512,
        5.55978
      ],
      [
        "Oxygen (o2)",
        -0.26521,
        5.56126
      ],
      [
        "Ave Maria",
        -0.26875,
        5.56536
      ],
      [
        "Thirteen",
        -0.27022,
        5.56762
      ],
      [
        "Dela",
        -0.27122,
        5.57052
      ],
      [
        "Sakaman",
        -0.27404,
        5.57493
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "Water Works",
        -0.27782,
        5.57955
      ],
      [
        "Vineyard",
        -0.27552,
        5.58219
      ],
      [
        "Awoshie Vineyard",
        -0.27437,
        5.5845
      ],
      [
        "Awoshie Amangoase",
        -0.27783,
        5.58645
      ],
      [
        "Awoshie",
        -0.2789,
        5.58704
      ],
      [
        "Abrantie",
        -0.28187,
        5.58881
      ],
      [
        "Abrantie",
        -0.28187,
        5.58881
      ],
      [
        "Awoshie Onyinase",
        -0.28654,
        5.59155
      ],
      [
        "Awoshie Last stop",
        -0.28723,
        5.59194
      ],
      [
        "Calvary",
        -0.28857,
        5.59356
      ],
      [
        "Nii Bortey",
        -0.28964,
        5.5964
      ],
      [
        "Anyaa Market (Awoshie)",
        -0.29069,
        5.59912
      ]
    ]
  },
  {
    "id": "gtfs_7552156_135",
    "name": "Dansoman ↔ Arena",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman (SSNIT flats)",
        -0.27303,
        5.56242
      ],
      [
        "Old School",
        -0.27251,
        5.56042
      ],
      [
        "Abam Kofi",
        -0.27085,
        5.56165
      ],
      [
        "Mt Olivet",
        -0.26795,
        5.56066
      ],
      [
        "St. Martin Depores",
        -0.26521,
        5.55965
      ],
      [
        "Dansoman Roundabout",
        -0.26485,
        5.55728
      ],
      [
        "King Solomon",
        -0.2646,
        5.55525
      ],
      [
        "Mamas Inn",
        -0.2646,
        5.55441
      ],
      [
        "Beecham",
        -0.26462,
        5.5521
      ],
      [
        "Sahara",
        -0.26465,
        5.54981
      ],
      [
        "Emmanuel Presby",
        -0.26463,
        5.5484
      ],
      [
        "Dansoman Control",
        -0.26465,
        5.54629
      ],
      [
        "Dansoman Police Station",
        -0.2647,
        5.54403
      ],
      [
        "Dansoman Market",
        -0.26475,
        5.54151
      ],
      [
        "Exhibition (Dansoman)",
        -0.26489,
        5.53799
      ],
      [
        "Banana Inn",
        -0.25494,
        5.54139
      ],
      [
        "Banana Inn Transformer",
        -0.2532,
        5.54083
      ],
      [
        "Abodoo Bridge",
        -0.25114,
        5.53965
      ],
      [
        "St.Marys",
        -0.24909,
        5.5387
      ],
      [
        "IBE",
        -0.24738,
        5.53903
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24636,
        5.53554
      ],
      [
        "Mamprobi Methodist",
        -0.24386,
        5.53506
      ],
      [
        "Abodwe",
        -0.24232,
        5.53464
      ],
      [
        "Rainbow",
        -0.24006,
        5.53398
      ],
      [
        "Mamprobi Shell",
        -0.23804,
        5.53365
      ],
      [
        "Mamprobi Post Office",
        -0.23705,
        5.53384
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Electricity",
        -0.23342,
        5.53464
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Boxing Arena",
        -0.22062,
        5.53734
      ],
      [
        "UTC",
        -0.21721,
        5.53809
      ],
      [
        "Agbado",
        -0.21512,
        5.53859
      ],
      [
        "Palledium",
        -0.21544,
        5.5416
      ],
      [
        "Timber Market",
        -0.21614,
        5.54341
      ],
      [
        "Arena",
        -0.21588,
        5.54518
      ]
    ]
  },
  {
    "id": "gtfs_7496962_494",
    "name": "Race Course ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ],
      [
        "Lapaz Market",
        -0.25688,
        5.60736
      ],
      [
        "Tabora Number 3",
        -0.25861,
        5.60723
      ],
      [
        "Tabora Number2",
        -0.25995,
        5.60602
      ],
      [
        "Ahenfie",
        -0.26111,
        5.60671
      ],
      [
        "School Junction Race Course",
        -0.26307,
        5.6082
      ],
      [
        "Container Race Course",
        -0.26406,
        5.60913
      ],
      [
        "Attah Junction",
        -0.26516,
        5.61019
      ],
      [
        "Rasta Junction",
        -0.26617,
        5.61134
      ],
      [
        "Gyedu Junction",
        -0.26762,
        5.61239
      ],
      [
        "Appiah Junction",
        -0.2691,
        5.61308
      ],
      [
        "Phobia Junction",
        -0.26968,
        5.61334
      ],
      [
        "Race Course",
        -0.27159,
        5.61422
      ]
    ]
  },
  {
    "id": "gtfs_7501043_139",
    "name": "Dansoman ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.2653,
        5.53004
      ],
      [
        "Kofi ne Ama",
        -0.26524,
        5.53246
      ],
      [
        "Seven Great",
        -0.26513,
        5.53523
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "MTN",
        -0.26131,
        5.55868
      ],
      [
        "Dansoman First Stop",
        -0.26019,
        5.55998
      ],
      [
        "Dansoman Polyclinic",
        -0.26019,
        5.56114
      ],
      [
        "Abomatte",
        -0.26019,
        5.56268
      ],
      [
        "Akukofoto",
        -0.25985,
        5.56463
      ],
      [
        "Wesley Grammar",
        -0.25824,
        5.56685
      ],
      [
        "Asoredanho Curve",
        -0.25653,
        5.56804
      ],
      [
        "Dansoman Asoredanho",
        -0.2554,
        5.57023
      ],
      [
        "Hansonic",
        -0.25294,
        5.57402
      ],
      [
        "Atico",
        -0.25118,
        5.57416
      ],
      [
        "Mataheko Quarters",
        -0.24754,
        5.57197
      ],
      [
        "Accra Academy",
        -0.24551,
        5.57077
      ],
      [
        "First Light",
        -0.24297,
        5.56926
      ],
      [
        "Kaneshie",
        -0.23949,
        5.56733
      ],
      [
        "Kaneshie First Bridge",
        -0.23737,
        5.56602
      ],
      [
        "Kaneshie Foot Bridge",
        -0.23595,
        5.56517
      ],
      [
        "Kaneshie Second Bridge",
        -0.23549,
        5.56489
      ],
      [
        "Pamprom",
        -0.23173,
        5.56264
      ],
      [
        "Roundabout",
        -0.22882,
        5.562
      ],
      [
        "State Transport",
        -0.22551,
        5.56518
      ],
      [
        "Neoplan",
        -0.21853,
        5.56873
      ],
      [
        "Circle Last Stop",
        -0.21713,
        5.5691
      ],
      [
        "Circle",
        -0.21736,
        5.56972
      ]
    ]
  },
  {
    "id": "gtfs_7585190_490",
    "name": "Zongo Junction ↔ Korle Bu",
    "color": "#1779c2",
    "stops": [
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22907,
        5.5354
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Kaneshie Zongo",
        -0.23601,
        5.55254
      ],
      [
        "Lamptey Mills Junction",
        -0.23588,
        5.55615
      ],
      [
        "Great Lamptey",
        -0.2372,
        5.55678
      ],
      [
        "Zongo Junction",
        -0.23979,
        5.55779
      ]
    ]
  },
  {
    "id": "gtfs_7458538_492",
    "name": "Osu ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ],
      [
        "Abrantie",
        -0.25276,
        5.60515
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Tesano",
        -0.22595,
        5.60456
      ],
      [
        "Abeka Junction",
        -0.22397,
        5.59892
      ],
      [
        "CAT",
        -0.22196,
        5.59518
      ],
      [
        "Alajo",
        -0.21816,
        5.58794
      ],
      [
        "NDC",
        -0.21289,
        5.57927
      ],
      [
        "Challenge",
        -0.20973,
        5.57691
      ],
      [
        "Bayport",
        -0.20876,
        5.57603
      ],
      [
        "PIWC Accra",
        -0.20838,
        5.57447
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Mobil",
        -0.19751,
        5.5738
      ],
      [
        "GBC First",
        -0.19375,
        5.5739
      ],
      [
        "GBC Second",
        -0.19221,
        5.57301
      ],
      [
        "Police Headquarters",
        -0.18727,
        5.5703
      ],
      [
        "Fire Service",
        -0.18544,
        5.5693
      ],
      [
        "Danquah",
        -0.18258,
        5.56699
      ],
      [
        "Afridom",
        -0.18197,
        5.56504
      ],
      [
        "SSNIT",
        -0.18231,
        5.56301
      ],
      [
        "Papaye",
        -0.18222,
        5.55957
      ],
      [
        "Osu Shell",
        -0.18268,
        5.5566
      ],
      [
        "Presby School Junction",
        -0.18335,
        5.55498
      ],
      [
        "Osu",
        -0.18359,
        5.55408
      ]
    ]
  },
  {
    "id": "gtfs_7542142_24",
    "name": "Teshie-Nungua ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Achimota Forest",
        -0.21857,
        5.62076
      ],
      [
        "Forestry",
        -0.21595,
        5.61733
      ],
      [
        "Abelemkpe Junction",
        -0.21023,
        5.60925
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Pig Farm Junction",
        -0.19595,
        5.59989
      ],
      [
        "Accra Girls",
        -0.19347,
        5.59824
      ],
      [
        "Kankudi",
        -0.18852,
        5.59477
      ],
      [
        "Culture",
        -0.18524,
        5.5933
      ],
      [
        "37 First Gate",
        -0.1829,
        5.59027
      ],
      [
        "37 Last Stop",
        -0.18031,
        5.58858
      ],
      [
        "El-Wak Stadium",
        -0.17472,
        5.58738
      ],
      [
        "Home Touch",
        -0.16815,
        5.58713
      ],
      [
        "Congo Junction",
        -0.16192,
        5.58734
      ],
      [
        "Soul Clinic",
        -0.15914,
        5.58177
      ],
      [
        "Villas",
        -0.15438,
        5.57825
      ],
      [
        "Palm Wine",
        -0.15254,
        5.57647
      ],
      [
        "Kpogas",
        -0.15021,
        5.57312
      ],
      [
        "Trade Fair",
        -0.14743,
        5.56916
      ],
      [
        "Green Court",
        -0.14487,
        5.56557
      ],
      [
        "La-Palm Hotel",
        -0.1431,
        5.56332
      ],
      [
        "Labadi Beach",
        -0.14061,
        5.56394
      ],
      [
        "La Beach Hotel",
        -0.13877,
        5.56431
      ],
      [
        "Bush Road",
        -0.1318,
        5.56639
      ],
      [
        "First Gate",
        -0.12769,
        5.56753
      ],
      [
        "Second Gate",
        -0.12381,
        5.56853
      ],
      [
        "Next Door",
        -0.11776,
        5.57056
      ],
      [
        "Kofi Annan",
        -0.1126,
        5.57385
      ],
      [
        "Laskala",
        -0.10983,
        5.57803
      ],
      [
        "Addoemi",
        -0.10787,
        5.58017
      ],
      [
        "Mobil",
        -0.104,
        5.58357
      ],
      [
        "First Junction",
        -0.09943,
        5.58749
      ],
      [
        "A-life",
        -0.09321,
        5.59121
      ],
      [
        "Brigade",
        -0.089,
        5.59379
      ],
      [
        "Cold Store",
        -0.08565,
        5.59582
      ],
      [
        "C5",
        -0.08239,
        5.59781
      ],
      [
        "Bank",
        -0.08029,
        5.60016
      ],
      [
        "Nungua",
        -0.07911,
        5.60223
      ]
    ]
  },
  {
    "id": "gtfs_7416167_26",
    "name": "Dome Kwabenya ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ],
      [
        "Fishpond",
        -0.24991,
        5.61856
      ],
      [
        "St. Johns",
        -0.24243,
        5.63885
      ],
      [
        "Family Life",
        -0.24845,
        5.6224
      ],
      [
        "Mile 7 T-Junction",
        -0.2506,
        5.6264
      ],
      [
        "High Tension",
        -0.24833,
        5.61603
      ],
      [
        "Mile 7 Clinic",
        -0.24787,
        5.62967
      ],
      [
        "Jesus and Mary",
        -0.24607,
        5.63083
      ],
      [
        "Masalaashi",
        -0.2452,
        5.63148
      ],
      [
        "Mile 7 Park",
        -0.24417,
        5.63225
      ],
      [
        "Presby Junction",
        -0.24291,
        5.63306
      ],
      [
        "Mile 7 Junction",
        -0.24097,
        5.63421
      ],
      [
        "Best Point",
        -0.2402,
        5.63532
      ],
      [
        "Achimota Mall",
        -0.24147,
        5.63737
      ],
      [
        "Dome Market",
        -0.2382,
        5.64289
      ],
      [
        "Adehyeman",
        -0.23704,
        5.64556
      ],
      [
        "Dome Crossing",
        -0.23653,
        5.64717
      ],
      [
        "Dome Old Station",
        -0.23743,
        5.65166
      ],
      [
        "Dome Mobil",
        -0.23733,
        5.6538
      ],
      [
        "Gym",
        -0.2373,
        5.65603
      ],
      [
        "Born again",
        -0.23733,
        5.65796
      ],
      [
        "Dome New Station",
        -0.23734,
        5.66051
      ],
      [
        "Atomic First",
        -0.23877,
        5.66725
      ],
      [
        "Atomic Second",
        -0.23885,
        5.66853
      ],
      [
        "Stores",
        -0.24037,
        5.67297
      ],
      [
        "Point 1",
        -0.24129,
        5.67623
      ],
      [
        "Point 2",
        -0.24193,
        5.67786
      ],
      [
        "Mosuku Junction",
        -0.24274,
        5.68028
      ],
      [
        "White House",
        -0.24319,
        5.6813
      ],
      [
        "Oscar Junction",
        -0.24523,
        5.68532
      ],
      [
        "Kwabenya Market",
        -0.2468,
        5.6882
      ],
      [
        "Kwabenya",
        -0.24775,
        5.69073
      ]
    ]
  },
  {
    "id": "gtfs_7499479_20",
    "name": "Tema ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "18 Junction",
        -0.07565,
        5.66056
      ],
      [
        "Abattoir",
        -0.07139,
        5.66224
      ],
      [
        "Tema Motorway Total",
        -0.014,
        5.6826
      ],
      [
        "Community 9",
        -0.01226,
        5.67898
      ],
      [
        "Community 8",
        -0.00993,
        5.67321
      ],
      [
        "Community 4",
        -0.00355,
        5.65801
      ],
      [
        "Site 7",
        -0.00084,
        5.65283
      ],
      [
        "Site 10",
        0.00024,
        5.65104
      ],
      [
        "Site 20",
        0.00226,
        5.64744
      ],
      [
        "Tema",
        0.00235,
        5.6445
      ],
      [
        "Tema Community One Market",
        0.00126,
        5.64519
      ]
    ]
  },
  {
    "id": "gtfs_7542061_22",
    "name": "Accra New Tema Station ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Abelemkpe Junction",
        -0.21023,
        5.60925
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Pig Farm Junction",
        -0.19595,
        5.59989
      ],
      [
        "Accra Girls",
        -0.19347,
        5.59824
      ],
      [
        "Kaukudi",
        -0.18949,
        5.59405
      ],
      [
        "Kanda Masalaachi",
        -0.19272,
        5.58673
      ],
      [
        "Nima Junction",
        -0.19481,
        5.58199
      ],
      [
        "Overhead",
        -0.19704,
        5.57718
      ],
      [
        "Sunny FM",
        -0.20007,
        5.57033
      ],
      [
        "Accra High School",
        -0.2009,
        5.56885
      ],
      [
        "Second Gate",
        -0.20211,
        5.56487
      ],
      [
        "Mental",
        -0.20457,
        5.56263
      ],
      [
        "Museum",
        -0.20612,
        5.56119
      ],
      [
        "Tigo Office",
        -0.20573,
        5.5576
      ],
      [
        "Accra Technical University",
        -0.2054,
        5.55541
      ],
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7475647_28",
    "name": "Kaneshie ↔ Akoto Lante",
    "color": "#1779c2",
    "stops": [
      [
        "Akoto Lante",
        -0.21309,
        5.53893
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.22941,
        5.54983
      ],
      [
        "Ayigbe Town",
        -0.23121,
        5.55374
      ],
      [
        "Total",
        -0.23102,
        5.55817
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ]
    ]
  },
  {
    "id": "gtfs_7574301_407",
    "name": "Okponglo ↔ American House",
    "color": "#1779c2",
    "stops": [
      [
        "Okponglo",
        -0.17639,
        5.6409
      ],
      [
        "Bawaleshie Traffic Light",
        -0.16914,
        5.64163
      ],
      [
        "Bawaleshie First",
        -0.16732,
        5.64182
      ],
      [
        "Bawaleshie Second",
        -0.16494,
        5.6421
      ],
      [
        "Beduwa",
        -0.16135,
        5.64241
      ],
      [
        "Bawaleshie Acheampong",
        -0.16007,
        5.64282
      ],
      [
        "MTN",
        -0.15673,
        5.64494
      ],
      [
        "Bridge",
        -0.15514,
        5.64614
      ],
      [
        "American House",
        -0.15007,
        5.64757
      ]
    ]
  },
  {
    "id": "gtfs_7597906_405",
    "name": "Odorkor ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Odorkor",
        -0.26391,
        5.58119
      ],
      [
        "Waterworks junction",
        -0.26018,
        5.5796
      ],
      [
        "Glory Land",
        -0.25805,
        5.57827
      ],
      [
        "Odorkor Police Station",
        -0.25648,
        5.57732
      ],
      [
        "Darkuman Junction",
        -0.25445,
        5.57611
      ],
      [
        "Dansoman Junction",
        -0.25256,
        5.575
      ],
      [
        "Atico",
        -0.25118,
        5.57416
      ],
      [
        "Goil",
        -0.24901,
        5.57286
      ],
      [
        "Mataheko Quarters",
        -0.24754,
        5.57197
      ],
      [
        "Accra Academy",
        -0.24551,
        5.57077
      ],
      [
        "First Light",
        -0.24297,
        5.56926
      ],
      [
        "Kaneshie",
        -0.23949,
        5.56733
      ],
      [
        "Kaneshie First Bridge",
        -0.23737,
        5.56602
      ],
      [
        "Kaneshie Second Bridge",
        -0.23549,
        5.56489
      ],
      [
        "Pamprom",
        -0.23173,
        5.56264
      ],
      [
        "Kaneshie Roundabout",
        -0.22797,
        5.56041
      ],
      [
        "Rana motors",
        -0.2254,
        5.55886
      ],
      [
        "Fatale",
        -0.22374,
        5.55782
      ],
      [
        "Cold store",
        -0.22221,
        5.55695
      ],
      [
        "Graphic",
        -0.2197,
        5.55551
      ],
      [
        "First Gate",
        -0.21472,
        5.55425
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra UTC",
        -0.21063,
        5.54959
      ],
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7597729_403",
    "name": "South Odorkor ↔ Odorkor",
    "color": "#1779c2",
    "stops": [
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Atico",
        -0.25072,
        5.57437
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Odorkor Police Station",
        -0.25611,
        5.57765
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor",
        -0.26376,
        5.58122
      ]
    ]
  },
  {
    "id": "gtfs_7461761_400",
    "name": "Official Town ↔ Odorkor",
    "color": "#1779c2",
    "stops": [
      [
        "Odorkor",
        -0.26376,
        5.58122
      ],
      [
        "Market",
        -0.26056,
        5.58876
      ],
      [
        "Macedonia",
        -0.25972,
        5.59109
      ],
      [
        "Blue Kiosk",
        -0.25926,
        5.59224
      ],
      [
        "Mangoase",
        -0.25874,
        5.59413
      ],
      [
        "Official Town",
        -0.25879,
        5.59499
      ]
    ]
  },
  {
    "id": "gtfs_7575488_409",
    "name": "Okponglo ↔ Bawaleshie",
    "color": "#1779c2",
    "stops": [
      [
        "Okponglo",
        -0.17639,
        5.6409
      ],
      [
        "Bawaleshie Traffic Light",
        -0.16914,
        5.64163
      ],
      [
        "Bawaleshie First",
        -0.16732,
        5.64182
      ],
      [
        "Bawaleshie Second",
        -0.16494,
        5.6421
      ],
      [
        "Beduwa",
        -0.16135,
        5.64241
      ],
      [
        "Bawaleshie Acheampong",
        -0.16007,
        5.64282
      ]
    ]
  },
  {
    "id": "gtfs_7463740_379",
    "name": "Odorna ↔ Agblezah",
    "color": "#1779c2",
    "stops": [
      [
        "Odorna",
        -0.21732,
        5.56733
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Kanda",
        -0.20183,
        5.57285
      ],
      [
        "Mobil",
        -0.19751,
        5.5738
      ],
      [
        "GBC First",
        -0.19375,
        5.5739
      ],
      [
        "GBC Second",
        -0.19221,
        5.57301
      ],
      [
        "Police Headquarters",
        -0.18727,
        5.5703
      ],
      [
        "Fire Service",
        -0.18544,
        5.5693
      ],
      [
        "Labone",
        -0.17251,
        5.56215
      ],
      [
        "Curve",
        -0.16793,
        5.55589
      ],
      [
        "Polyclinic",
        -0.16661,
        5.55638
      ],
      [
        "Kpogas",
        -0.1647,
        5.55713
      ],
      [
        "La Beach Hotel",
        -0.13877,
        5.56431
      ],
      [
        "Container",
        -0.1306,
        5.57872
      ],
      [
        "Block Factory",
        -0.13085,
        5.58261
      ],
      [
        "Rasta",
        -0.131,
        5.58509
      ],
      [
        "Curve",
        -0.13081,
        5.59574
      ],
      [
        "Curve",
        -0.12591,
        5.59677
      ],
      [
        "Junction",
        -0.1217,
        5.59481
      ],
      [
        "Tsui Bleoo",
        -0.11599,
        5.60604
      ],
      [
        "Lekma",
        -0.12129,
        5.60388
      ],
      [
        "Agblezaa",
        -0.12462,
        5.61692
      ],
      [
        "Agblezah",
        -0.12498,
        5.61728
      ]
    ]
  },
  {
    "id": "gtfs_7466926_371",
    "name": "Nima Station ↔ Madina",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station (Gutter Station)",
        -0.19666,
        5.58827
      ],
      [
        "Mawarko",
        -0.19578,
        5.59092
      ],
      [
        "Maamobi",
        -0.1954,
        5.59211
      ],
      [
        "Nima Overhead",
        -0.19463,
        5.59424
      ],
      [
        "Jack and Jill",
        -0.18976,
        5.60199
      ],
      [
        "Shangrila",
        -0.17591,
        5.61719
      ],
      [
        "Spanner",
        -0.17613,
        5.62042
      ],
      [
        "Shiashie",
        -0.17644,
        5.62768
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon Second",
        -0.17999,
        5.65188
      ],
      [
        "UPS",
        -0.17824,
        5.6607
      ],
      [
        "Presec",
        -0.17783,
        5.66255
      ],
      [
        "Atomic First",
        -0.17706,
        5.66624
      ],
      [
        "Madina",
        -0.17394,
        5.67875
      ]
    ]
  },
  {
    "id": "gtfs_7466637_373",
    "name": "Nyaho ↔ Nima Station",
    "color": "#1779c2",
    "stops": [
      [
        "Container First",
        -0.18194,
        5.61695
      ],
      [
        "Second Container",
        -0.18283,
        5.61638
      ],
      [
        "School Junction",
        -0.18414,
        5.61553
      ],
      [
        "Nyaho",
        -0.18517,
        5.61486
      ],
      [
        "T Junction",
        -0.18754,
        5.61334
      ],
      [
        "Chinese",
        -0.18666,
        5.61198
      ],
      [
        "Chinese Curve",
        -0.18576,
        5.61101
      ],
      [
        "High Flow",
        -0.18627,
        5.61024
      ],
      [
        "Bostal First",
        -0.18753,
        5.60832
      ],
      [
        "Bostal Second",
        -0.18822,
        5.60727
      ],
      [
        "Bostal",
        -0.1888,
        5.60641
      ],
      [
        "Sign Board",
        -0.18827,
        5.60195
      ],
      [
        "Jack and Jill",
        -0.18955,
        5.60202
      ],
      [
        "SGS",
        -0.19191,
        5.60224
      ],
      [
        "Frensho",
        -0.19339,
        5.60181
      ],
      [
        "Power House",
        -0.19428,
        5.59977
      ],
      [
        "Accra Girls",
        -0.19404,
        5.59819
      ],
      [
        "Konka",
        -0.19496,
        5.59663
      ],
      [
        "Nima Overhead",
        -0.19474,
        5.59412
      ],
      [
        "Maamobi",
        -0.19545,
        5.59221
      ],
      [
        "Mawarko",
        -0.19584,
        5.59098
      ],
      [
        "Gutter",
        -0.19659,
        5.5885
      ],
      [
        "Borla",
        -0.1979,
        5.58386
      ],
      [
        "Nima Station",
        -0.19875,
        5.58151
      ]
    ]
  },
  {
    "id": "gtfs_7463990_375",
    "name": "Cantonments ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Cantonments",
        -0.17079,
        5.57761
      ],
      [
        "IGP",
        -0.17124,
        5.57887
      ],
      [
        "Junction",
        -0.1746,
        5.57884
      ],
      [
        "Roundabout",
        -0.17893,
        5.57616
      ],
      [
        "Aquinas",
        -0.17944,
        5.5743
      ],
      [
        "Prisons",
        -0.1803,
        5.57091
      ],
      [
        "Police Hospital",
        -0.18083,
        5.56781
      ],
      [
        "Koala",
        -0.18113,
        5.56614
      ],
      [
        "Afridom",
        -0.18135,
        5.56483
      ],
      [
        "SSNIT",
        -0.1817,
        5.56273
      ],
      [
        "Frankies",
        -0.18197,
        5.56109
      ],
      [
        "Papaye",
        -0.18222,
        5.55957
      ],
      [
        "Shell",
        -0.18241,
        5.5583
      ],
      [
        "Osu Shell",
        -0.18268,
        5.5566
      ],
      [
        "Presby School Junction",
        -0.18335,
        5.55498
      ],
      [
        "Five junction",
        -0.18442,
        5.55231
      ],
      [
        "Second Stop/Ataa Adjettey",
        -0.18559,
        5.55044
      ],
      [
        "Castle Junction",
        -0.1896,
        5.54965
      ],
      [
        "Ministries",
        -0.1946,
        5.54875
      ],
      [
        "Agric",
        -0.19858,
        5.54784
      ],
      [
        "Accra New Tema Station",
        -0.20105,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7594941_377",
    "name": "Nima Station ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station",
        -0.19895,
        5.58079
      ],
      [
        "Nima Mamobi",
        -0.19792,
        5.58024
      ],
      [
        "Kanda Overhead",
        -0.19834,
        5.57472
      ],
      [
        "Sunny FM",
        -0.20007,
        5.57033
      ],
      [
        "Accra High School",
        -0.2009,
        5.56885
      ],
      [
        "Second Gate",
        -0.20211,
        5.56487
      ],
      [
        "Ridge",
        -0.20022,
        5.56166
      ],
      [
        "Accra High",
        -0.2016,
        5.56007
      ],
      [
        "Accra Technical University",
        -0.2054,
        5.55541
      ],
      [
        "Novotel",
        -0.2048,
        5.55397
      ],
      [
        "Kinbu",
        -0.20419,
        5.55128
      ],
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7457677_393",
    "name": "Bubiashie ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Bubuashie",
        -0.23989,
        5.58029
      ],
      [
        "Darkuman Station",
        -0.25133,
        5.58917
      ],
      [
        "Masalatsi",
        -0.25161,
        5.58275
      ],
      [
        "Fadama Junction",
        -0.25398,
        5.59745
      ],
      [
        "Mampong",
        -0.25592,
        5.60159
      ],
      [
        "Abeka Lapaz",
        -0.24941,
        5.60582
      ]
    ]
  },
  {
    "id": "gtfs_7471365_88",
    "name": "Osu RE ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21595,
        5.56885
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Mami Dokuno",
        -0.21269,
        5.57015
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Kanda",
        -0.20183,
        5.57285
      ],
      [
        "Mobil",
        -0.19751,
        5.5738
      ],
      [
        "GBC First",
        -0.19375,
        5.5739
      ],
      [
        "GBC Second",
        -0.19221,
        5.57301
      ],
      [
        "Police Headquarters",
        -0.18727,
        5.5703
      ],
      [
        "Fire Service",
        -0.18544,
        5.5693
      ],
      [
        "Danquah",
        -0.18258,
        5.56699
      ],
      [
        "Zenith",
        -0.18192,
        5.56531
      ],
      [
        "Afridom",
        -0.18197,
        5.56504
      ],
      [
        "SSNIT",
        -0.18231,
        5.56301
      ],
      [
        "Frankies",
        -0.18197,
        5.56109
      ],
      [
        "Papaye",
        -0.18222,
        5.55957
      ],
      [
        "Shell",
        -0.18241,
        5.5583
      ],
      [
        "Osu Shell",
        -0.18268,
        5.5566
      ],
      [
        "Presby School Junction",
        -0.18335,
        5.55498
      ],
      [
        "Osu",
        -0.18361,
        5.55404
      ]
    ]
  },
  {
    "id": "gtfs_7586940_397",
    "name": "Odorkor ↔ Anyah",
    "color": "#1779c2",
    "stops": [
      [
        "Odorkor",
        -0.26376,
        5.58122
      ],
      [
        "Awoshie Vineyard",
        -0.27437,
        5.5845
      ],
      [
        "Awoshie Amangoase",
        -0.27783,
        5.58645
      ],
      [
        "Awoshie",
        -0.2789,
        5.58704
      ],
      [
        "Abrantie",
        -0.28187,
        5.58881
      ],
      [
        "Odogorno",
        -0.2837,
        5.58987
      ],
      [
        "Awoshie Onyinase",
        -0.28654,
        5.59155
      ],
      [
        "Awoshie Last stop",
        -0.28723,
        5.59194
      ],
      [
        "Calvary",
        -0.28857,
        5.59356
      ],
      [
        "Nii Bortey",
        -0.28964,
        5.5964
      ],
      [
        "Anyaa Market (Awoshie)",
        -0.29069,
        5.59912
      ],
      [
        "Anyaa School Junction",
        -0.29302,
        5.60288
      ],
      [
        "Anyaa",
        -0.29452,
        5.60508
      ],
      [
        "Academy",
        -0.29513,
        5.60596
      ],
      [
        "Anyah Last Stop",
        -0.29644,
        5.60781
      ]
    ]
  },
  {
    "id": "gtfs_7462969_395",
    "name": "Korle Bu ↔ Circle Odorna",
    "color": "#1779c2",
    "stops": [
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Total",
        -0.23102,
        5.55817
      ],
      [
        "Roundabout",
        -0.22882,
        5.562
      ],
      [
        "State Transport",
        -0.22551,
        5.56518
      ],
      [
        "Neoplan",
        -0.21853,
        5.56873
      ],
      [
        "Circle Last Stop",
        -0.21713,
        5.5691
      ]
    ]
  },
  {
    "id": "gtfs_7551952_82",
    "name": "Orgle Road ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Times",
        -0.22185,
        5.56979
      ],
      [
        "Azumah Nelson Complex",
        -0.22703,
        5.57486
      ],
      [
        "Orgle Road",
        -0.23572,
        5.57735
      ]
    ]
  },
  {
    "id": "gtfs_7467971_80",
    "name": "Novotel ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21595,
        5.56885
      ],
      [
        "Dance Bar",
        -0.2147,
        5.56604
      ],
      [
        "Adabraka Market",
        -0.21392,
        5.5631
      ],
      [
        "Tigo Office",
        -0.20573,
        5.5576
      ],
      [
        "Accra Technical University",
        -0.2054,
        5.55541
      ],
      [
        "Kinbu",
        -0.20419,
        5.55128
      ],
      [
        "Novotel",
        -0.19956,
        5.54998
      ]
    ]
  },
  {
    "id": "gtfs_7468339_84",
    "name": "Osu Presby ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21483,
        5.56885
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "Dance Bar",
        -0.2147,
        5.56604
      ],
      [
        "Mental",
        -0.20452,
        5.56246
      ],
      [
        "Ridge Hospital",
        -0.19944,
        5.56128
      ],
      [
        "Stadium",
        -0.19068,
        5.55356
      ],
      [
        "Osu",
        -0.18359,
        5.55408
      ]
    ]
  },
  {
    "id": "gtfs_7480337_245",
    "name": "Kotobabi Down ↔ Circle Lido",
    "color": "#1779c2",
    "stops": [
      [
        "Kotobabi Down (Polo Park)",
        -0.2092,
        5.59581
      ],
      [
        "Ojawe",
        -0.20809,
        5.59501
      ],
      [
        "Tobinco Junction",
        -0.20631,
        5.59328
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Nima Junction",
        -0.20858,
        5.58237
      ],
      [
        "Mallam Atta",
        -0.20905,
        5.58166
      ],
      [
        "Asantewaa",
        -0.2105,
        5.57969
      ],
      [
        "Fidelity",
        -0.21203,
        5.57763
      ],
      [
        "Express",
        -0.21268,
        5.57677
      ],
      [
        "Quarters",
        -0.21405,
        5.57497
      ],
      [
        "City Lights",
        -0.21447,
        5.57436
      ],
      [
        "Circle Lido",
        -0.21455,
        5.5733
      ]
    ]
  },
  {
    "id": "gtfs_7406210_247",
    "name": "37 ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "37",
        -0.1796,
        5.58886
      ],
      [
        "Culture",
        -0.18518,
        5.59345
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Abelenkpe Junction",
        -0.21092,
        5.60993
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Lapaz Market",
        -0.24051,
        5.60902
      ],
      [
        "Bambolino",
        -0.24237,
        5.60871
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ],
      [
        "Abeka Lapaz",
        -0.24817,
        5.60728
      ]
    ]
  },
  {
    "id": "gtfs_7486143_241",
    "name": "Kotobabi Down ↔ 37",
    "color": "#1779c2",
    "stops": [
      [
        "Kotobabi Down (Polo Park)",
        -0.2092,
        5.59581
      ],
      [
        "Ojawe",
        -0.20809,
        5.59501
      ],
      [
        "Tobinco Junction",
        -0.20631,
        5.59328
      ],
      [
        "Kotobabi Police Station",
        -0.20446,
        5.59207
      ],
      [
        "Vulcanizer",
        -0.20339,
        5.59326
      ],
      [
        "Abavana",
        -0.20274,
        5.59401
      ],
      [
        "Club 1000",
        -0.20051,
        5.59594
      ],
      [
        "Top Class",
        -0.19941,
        5.5965
      ],
      [
        "Pig Farm",
        -0.19832,
        5.59811
      ],
      [
        "Accra Girls",
        -0.19392,
        5.59815
      ],
      [
        "Kankudi",
        -0.18852,
        5.59477
      ],
      [
        "Culture",
        -0.18524,
        5.5933
      ],
      [
        "37 First Gate",
        -0.1829,
        5.59027
      ],
      [
        "37 Last Stop",
        -0.18031,
        5.58858
      ]
    ]
  },
  {
    "id": "gtfs_7480290_243",
    "name": "Kotobabi Down ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Kotobabi Down",
        -0.20934,
        5.59567
      ],
      [
        "Ojawe",
        -0.20809,
        5.59501
      ],
      [
        "Tobinco Junction",
        -0.20631,
        5.59328
      ],
      [
        "Deeper life junction",
        -0.20751,
        5.59119
      ],
      [
        "Bakery",
        -0.20916,
        5.5884
      ],
      [
        "Mallam Attah Market",
        -0.20993,
        5.58534
      ],
      [
        "Olympic junction",
        -0.21013,
        5.58524
      ],
      [
        "Roman Junction",
        -0.21307,
        5.58525
      ],
      [
        "Akoko Darko Junction",
        -0.21564,
        5.58516
      ],
      [
        "Caprice",
        -0.21704,
        5.58396
      ],
      [
        "Avenor",
        -0.21681,
        5.58065
      ],
      [
        "Vodafone",
        -0.21614,
        5.57186
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "Dance Bar",
        -0.2147,
        5.56604
      ],
      [
        "Adabraka",
        -0.2144,
        5.5649
      ],
      [
        "Adabraka Market",
        -0.21392,
        5.5631
      ],
      [
        "Roxy Cinema",
        -0.21244,
        5.55777
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ]
    ]
  },
  {
    "id": "gtfs_7485974_249",
    "name": "Kotobabi Down ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Kotobabi Down",
        -0.19888,
        5.59741
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Lapaz Station",
        -0.20822,
        5.58482
      ],
      [
        "Olympic junction",
        -0.21013,
        5.58524
      ],
      [
        "Roman Junction",
        -0.21307,
        5.58525
      ],
      [
        "Akoko Darko Junction",
        -0.21564,
        5.58516
      ],
      [
        "Alajo",
        -0.21796,
        5.58877
      ],
      [
        "CAT",
        -0.22205,
        5.59573
      ],
      [
        "Abeka Junction",
        -0.2235,
        5.59855
      ],
      [
        "Abeka Junction Curve",
        -0.22478,
        5.59952
      ],
      [
        "Fitting Shop",
        -0.22617,
        5.59928
      ],
      [
        "Abrantie",
        -0.22865,
        5.59877
      ],
      [
        "Tesano Gardens",
        -0.23053,
        5.59845
      ],
      [
        "Total",
        -0.23301,
        5.59811
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Abeka Bcos Junction",
        -0.23495,
        5.59894
      ],
      [
        "PnP Junction",
        -0.23579,
        5.59922
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Abeka Main Market",
        -0.23913,
        5.6008
      ],
      [
        "Fadama",
        -0.24055,
        5.60164
      ],
      [
        "Eno",
        -0.24157,
        5.60263
      ],
      [
        "Fadama Junction",
        -0.2425,
        5.60308
      ],
      [
        "Abeka Post Office",
        -0.24359,
        5.6039
      ],
      [
        "Abotare",
        -0.24527,
        5.60508
      ],
      [
        "Abeka Lapaz (Nii Boi)",
        -0.24524,
        5.60774
      ]
    ]
  },
  {
    "id": "gtfs_7437100_519",
    "name": "Tema Community One Market ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Tema Community One Market",
        0.00126,
        5.64519
      ],
      [
        "Ashaiman Overhead",
        -0.02556,
        5.68261
      ],
      [
        "Dzorwulu Junction",
        -0.19115,
        5.6185
      ],
      [
        "CP",
        -0.21189,
        5.61574
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Lapaz Market",
        -0.24051,
        5.60902
      ],
      [
        "Bambolino",
        -0.24237,
        5.60871
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ],
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ]
    ]
  },
  {
    "id": "gtfs_7452660_511",
    "name": "Adjringanor/Otanor ↔ Accra End of the Motorway",
    "color": "#1779c2",
    "stops": [
      [
        "Adjringanor/Otanor",
        -0.13457,
        5.64678
      ],
      [
        "American House",
        -0.15068,
        5.64835
      ],
      [
        "Bawaleshi Second",
        -0.16732,
        5.64187
      ],
      [
        "Shiashie",
        -0.1736,
        5.62908
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Accra End of the Motorway",
        -0.17601,
        5.62735
      ]
    ]
  },
  {
    "id": "gtfs_7466042_513",
    "name": "American House ↔ Accra End of the Motorway",
    "color": "#1779c2",
    "stops": [
      [
        "American House",
        -0.15068,
        5.64835
      ],
      [
        "Beduwa",
        -0.16117,
        5.64252
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Accra End of the Motorway",
        -0.17601,
        5.62735
      ]
    ]
  },
  {
    "id": "gtfs_7425412_514",
    "name": "Caprice ↔ Accra New Town",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Town Taxi Station",
        -0.20887,
        5.58152
      ],
      [
        "Akoko Darko Junction",
        -0.21564,
        5.58516
      ],
      [
        "Caprice Taxi Station",
        -0.21727,
        5.58447
      ]
    ]
  },
  {
    "id": "gtfs_7420442_517",
    "name": "37 ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "37",
        -0.1796,
        5.58886
      ],
      [
        "Culture",
        -0.18518,
        5.59345
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Abelenkpe Junction",
        -0.21092,
        5.60993
      ],
      [
        "Abelenkpe Curve",
        -0.21571,
        5.60753
      ],
      [
        "Dua Ase",
        -0.21769,
        5.61116
      ],
      [
        "Junction",
        -0.22234,
        5.61273
      ],
      [
        "Achimota New Station",
        -0.2259,
        5.62195
      ]
    ]
  },
  {
    "id": "gtfs_7599683_458",
    "name": "Sukura ↔ Nima-Mamobi",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station",
        -0.19875,
        5.58151
      ],
      [
        "Nima Market",
        -0.1995,
        5.58012
      ],
      [
        "Nima Roundabout",
        -0.20058,
        5.57828
      ],
      [
        "Nima School Junction",
        -0.20083,
        5.57628
      ],
      [
        "Nima Police Station",
        -0.20079,
        5.57421
      ],
      [
        "Nima Junction",
        -0.20137,
        5.57318
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "Times",
        -0.2246,
        5.56624
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Roundabout",
        -0.22858,
        5.56259
      ],
      [
        "Abossey Okai",
        -0.22992,
        5.56048
      ],
      [
        "Total",
        -0.23051,
        5.55947
      ],
      [
        "Happy Days",
        -0.23238,
        5.55569
      ],
      [
        "Abossey Okai Zongo Junction",
        -0.23441,
        5.55611
      ],
      [
        "Laskia",
        -0.23557,
        5.55639
      ],
      [
        "Great Lamptey",
        -0.2372,
        5.55678
      ],
      [
        "Zongo Junction",
        -0.24077,
        5.55759
      ],
      [
        "Club Corner",
        -0.24348,
        5.55822
      ],
      [
        "Flamingo",
        -0.24651,
        5.55804
      ],
      [
        "Banku Junction",
        -0.24755,
        5.55378
      ],
      [
        "Sukura Market",
        -0.25121,
        5.5524
      ],
      [
        "Sukura (Kwahu Store)",
        -0.25222,
        5.55218
      ]
    ]
  },
  {
    "id": "gtfs_7571332_450",
    "name": "Shiabu ↔ Agbogbloshie",
    "color": "#1779c2",
    "stops": [
      [
        "Agbogbloshie",
        -0.21984,
        5.55169
      ],
      [
        "Galloway",
        -0.21806,
        5.54802
      ],
      [
        "Timber Market",
        -0.21624,
        5.54357
      ],
      [
        "Palledium",
        -0.21565,
        5.54201
      ],
      [
        "Fire Service",
        -0.21693,
        5.53211
      ],
      [
        "Korle er naa",
        -0.21939,
        5.53141
      ],
      [
        "Nzunzu",
        -0.22411,
        5.53011
      ],
      [
        "Korle gonno shell",
        -0.22491,
        5.52994
      ],
      [
        "1st stop",
        -0.22702,
        5.5295
      ],
      [
        "Korle beach resort",
        -0.22791,
        5.5293
      ],
      [
        "Ama Mensah",
        -0.23003,
        5.52888
      ],
      [
        "Galilee",
        -0.2335,
        5.52816
      ],
      [
        "Hotel Junction",
        -0.23426,
        5.528
      ],
      [
        "Wolarm",
        -0.23557,
        5.52775
      ],
      [
        "White House",
        -0.23614,
        5.52763
      ],
      [
        "JB Spot",
        -0.24762,
        5.53124
      ],
      [
        "Mamprobi Alhaji Station",
        -0.25041,
        5.53097
      ],
      [
        "Curve Shiabu",
        -0.25466,
        5.52582
      ],
      [
        "Shiabu",
        -0.25674,
        5.52536
      ]
    ]
  },
  {
    "id": "gtfs_7598208_452",
    "name": "Soko ↔ Accra Post Office",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Post Office",
        -0.20899,
        5.5405
      ],
      [
        "Salaga Junction",
        -0.20919,
        5.54158
      ],
      [
        "Atta Quarshie",
        -0.21182,
        5.5415
      ],
      [
        "Shell - Accra",
        -0.21311,
        5.54122
      ],
      [
        "Akoto Lante",
        -0.21541,
        5.54078
      ],
      [
        "Agbado",
        -0.21666,
        5.54045
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Korle Bu",
        -0.22705,
        5.53612
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Station",
        -0.23777,
        5.53467
      ],
      [
        "Sempe First",
        -0.23834,
        5.537
      ],
      [
        "Sempe Second",
        -0.23872,
        5.5386
      ],
      [
        "Salvation Army",
        -0.23928,
        5.54097
      ],
      [
        "Premier",
        -0.24484,
        5.54299
      ],
      [
        "Soko Junction",
        -0.24861,
        5.54532
      ],
      [
        "Second",
        -0.2502,
        5.54525
      ],
      [
        "Masalaachi",
        -0.25169,
        5.54524
      ],
      [
        "Appiah Danquah/Soko",
        -0.2524,
        5.54524
      ]
    ]
  },
  {
    "id": "gtfs_7458729_456",
    "name": "Sukura ↔ Arena",
    "color": "#1779c2",
    "stops": [
      [
        "Arena",
        -0.2159,
        5.54526
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Laskia",
        -0.23557,
        5.55639
      ],
      [
        "Great Lamptey",
        -0.2372,
        5.55678
      ],
      [
        "Zongo Junction",
        -0.24077,
        5.55759
      ],
      [
        "Flamingo",
        -0.24651,
        5.55804
      ],
      [
        "Banku Junction",
        -0.24755,
        5.55378
      ],
      [
        "Borla Junction",
        -0.24762,
        5.55093
      ],
      [
        "Sukura",
        -0.24929,
        5.55062
      ]
    ]
  },
  {
    "id": "gtfs_7485664_179",
    "name": "Kaneshie ↔ Chorkor",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23587,
        5.5641
      ],
      [
        "Zongo Junction",
        -0.23992,
        5.55756
      ],
      [
        "Pipeier Naa",
        -0.2402,
        5.55294
      ],
      [
        "Black Smith",
        -0.24021,
        5.55083
      ],
      [
        "Radio Gold",
        -0.24021,
        5.54863
      ],
      [
        "Salvation Army",
        -0.23953,
        5.54165
      ],
      [
        "Sempe First",
        -0.2389,
        5.5391
      ],
      [
        "Sempe Second",
        -0.23982,
        5.53785
      ],
      [
        "Liju",
        -0.24135,
        5.53616
      ],
      [
        "Abodwe",
        -0.2423,
        5.53513
      ],
      [
        "Girl School",
        -0.24262,
        5.53192
      ],
      [
        "Kakalika",
        -0.24255,
        5.53101
      ],
      [
        "Extra O",
        -0.24237,
        5.52878
      ],
      [
        "Tea Gadern",
        -0.24227,
        5.52764
      ],
      [
        "Alomo Junction",
        -0.24372,
        5.5268
      ],
      [
        "Lantemame",
        -0.24591,
        5.52663
      ],
      [
        "Bridge",
        -0.24897,
        5.52638
      ],
      [
        "Chokor/ Chemuna",
        -0.25046,
        5.52625
      ]
    ]
  },
  {
    "id": "gtfs_7488333_177",
    "name": "Kaneshie ↔ Camara",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23587,
        5.5641
      ],
      [
        "Zongo Junction",
        -0.23992,
        5.55756
      ],
      [
        "Pipeier Naa",
        -0.2402,
        5.55294
      ],
      [
        "Black Smith",
        -0.24021,
        5.55083
      ],
      [
        "Radio Gold",
        -0.24021,
        5.54863
      ],
      [
        "Salvation Army",
        -0.23953,
        5.54165
      ],
      [
        "Summerhut",
        -0.23959,
        5.54053
      ],
      [
        "Downright",
        -0.24294,
        5.53975
      ],
      [
        "Clinic",
        -0.24504,
        5.53833
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24626,
        5.53563
      ],
      [
        "IBE (Camara)",
        -0.24755,
        5.53564
      ],
      [
        "Nku Kpotoi",
        -0.2486,
        5.53562
      ],
      [
        "Camara Junction",
        -0.2505,
        5.53567
      ],
      [
        "Mangoase",
        -0.25269,
        5.53568
      ],
      [
        "Bank",
        -0.25439,
        5.53626
      ],
      [
        "Camara (Station)",
        -0.25523,
        5.5366
      ]
    ]
  },
  {
    "id": "gtfs_7488448_175",
    "name": "Kaneshie ↔ Bubuashie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ],
      [
        "Bazaza",
        -0.23854,
        5.57165
      ],
      [
        "Cottage",
        -0.23805,
        5.57357
      ],
      [
        "Ola Balm",
        -0.23832,
        5.57574
      ],
      [
        "Cemetry",
        -0.23855,
        5.57727
      ],
      [
        "Bubuashie",
        -0.23992,
        5.58037
      ]
    ]
  },
  {
    "id": "gtfs_7488566_173",
    "name": "Kaneshie ↔ Appiah Danquah/ Soko",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23587,
        5.5641
      ],
      [
        "Zongo Junction",
        -0.23992,
        5.55756
      ],
      [
        "Junction",
        -0.24328,
        5.55611
      ],
      [
        "First Junction",
        -0.24386,
        5.55315
      ],
      [
        "Printing Press",
        -0.24386,
        5.5505
      ],
      [
        "Transformer",
        -0.24384,
        5.54899
      ],
      [
        "Lotto Kiosk",
        -0.24382,
        5.54793
      ],
      [
        "Video City",
        -0.24393,
        5.54678
      ],
      [
        "School Junction",
        -0.24462,
        5.54678
      ],
      [
        "Pentecost",
        -0.24671,
        5.54446
      ],
      [
        "Adonteng",
        -0.24676,
        5.54296
      ],
      [
        "Toilets",
        -0.24703,
        5.54284
      ],
      [
        "Bridge",
        -0.24756,
        5.54279
      ],
      [
        "Curve",
        -0.24847,
        5.54276
      ],
      [
        "Container",
        -0.24889,
        5.54399
      ],
      [
        "Soko Junction",
        -0.24891,
        5.54521
      ],
      [
        "Second",
        -0.2502,
        5.54525
      ],
      [
        "Masalaachi",
        -0.25169,
        5.54524
      ],
      [
        "Appiah Danquah/Soko",
        -0.2524,
        5.54524
      ]
    ]
  },
  {
    "id": "gtfs_7516618_171",
    "name": "Afropa ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Afropa",
        -0.24687,
        5.59035
      ],
      [
        "Wireless",
        -0.24028,
        5.58624
      ],
      [
        "Washingbay",
        -0.23954,
        5.58623
      ],
      [
        "Awony3",
        -0.23907,
        5.58529
      ],
      [
        "Awonye",
        -0.23632,
        5.58253
      ],
      [
        "St. Johns",
        -0.23522,
        5.58235
      ],
      [
        "School Junction",
        -0.23546,
        5.58087
      ],
      [
        "Tsofi",
        -0.23547,
        5.57803
      ],
      [
        "Cocoa Clinic",
        -0.23597,
        5.57166
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7485398_253",
    "name": "Kwashieman ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Kwashieman",
        -0.26786,
        5.59225
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Abeka Lapaz",
        -0.24907,
        5.60641
      ],
      [
        "Bambolino",
        -0.24254,
        5.60826
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.2277,
        5.61205
      ],
      [
        "Achimota Old Station",
        -0.2294,
        5.61639
      ],
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ]
    ]
  },
  {
    "id": "gtfs_7488146_182",
    "name": "Korlebu ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23587,
        5.5641
      ],
      [
        "Zongo Junction",
        -0.23992,
        5.55756
      ],
      [
        "Pipeier Naa",
        -0.2402,
        5.55294
      ],
      [
        "Black Smith",
        -0.24021,
        5.55083
      ],
      [
        "Radio Gold",
        -0.24021,
        5.54863
      ],
      [
        "Salvation Army",
        -0.23953,
        5.54165
      ],
      [
        "Sempe First",
        -0.2389,
        5.5391
      ],
      [
        "Sempe Second",
        -0.23835,
        5.53678
      ],
      [
        "Mamprobi Station",
        -0.23774,
        5.53426
      ],
      [
        "Mamprobi Post Office",
        -0.23705,
        5.53384
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Electricity",
        -0.23342,
        5.53464
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ]
    ]
  },
  {
    "id": "gtfs_7488223_180",
    "name": "Good Shepherd ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ],
      [
        "Kaneshie Market bus stop",
        -0.2356,
        5.56658
      ],
      [
        "Cocoa Clinic",
        -0.23663,
        5.57139
      ],
      [
        "Five Five",
        -0.23569,
        5.57281
      ],
      [
        "Council",
        -0.23637,
        5.57617
      ],
      [
        "Tsofi",
        -0.23468,
        5.5786
      ],
      [
        "Sakora",
        -0.2341,
        5.57908
      ],
      [
        "Mangoase",
        -0.23468,
        5.58029
      ],
      [
        "Been to",
        -0.23546,
        5.58142
      ],
      [
        "St. Johns",
        -0.23506,
        5.58229
      ],
      [
        "Awonye",
        -0.23633,
        5.58268
      ],
      [
        "Good Shepherd",
        -0.23632,
        5.58388
      ]
    ]
  },
  {
    "id": "gtfs_7423322_186",
    "name": "Madina-Adenta ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ],
      [
        "Social Welfare",
        -0.23433,
        5.56881
      ],
      [
        "Kaneshie Polyclinic",
        -0.23062,
        5.57425
      ],
      [
        "St. Theresas",
        -0.2283,
        5.57945
      ],
      [
        "Pentecost",
        -0.22904,
        5.58027
      ],
      [
        "Green Hand",
        -0.23036,
        5.58197
      ],
      [
        "Masalakyi",
        -0.23153,
        5.58473
      ],
      [
        "Swanlake",
        -0.23171,
        5.5853
      ],
      [
        "Old Stop",
        -0.23272,
        5.58752
      ],
      [
        "Sunlight",
        -0.23204,
        5.58974
      ],
      [
        "Second",
        -0.23334,
        5.59664
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Abeka Bcos Junction",
        -0.23495,
        5.59894
      ],
      [
        "PnP Junction",
        -0.23579,
        5.59922
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Fly Top",
        -0.23737,
        5.60911
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "GSL",
        -0.19926,
        5.61685
      ],
      [
        "Dzorwulu Junction",
        -0.19445,
        5.61734
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "Accra Mall Roundabout",
        -0.17473,
        5.62204
      ],
      [
        "Shiashie",
        -0.17644,
        5.62768
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon Second",
        -0.17999,
        5.65188
      ],
      [
        "UPS",
        -0.17824,
        5.6607
      ],
      [
        "Atomic First",
        -0.17706,
        5.66624
      ],
      [
        "Atomic Second",
        -0.17663,
        5.66798
      ],
      [
        "Fire Stone",
        -0.17511,
        5.6713
      ],
      [
        "Madina Zongo Junction",
        -0.17378,
        5.67536
      ],
      [
        "Madina Masalachi",
        -0.17268,
        5.67915
      ],
      [
        "Ritz Junction",
        -0.17137,
        5.68764
      ],
      [
        "Assemblies",
        -0.17154,
        5.69143
      ],
      [
        "SDA",
        -0.17157,
        5.69668
      ],
      [
        "Goil Filling Station",
        -0.1716,
        5.70006
      ],
      [
        "Adenta Barrier",
        -0.17103,
        5.70585
      ],
      [
        "Adenta Station",
        -0.16561,
        5.70609
      ]
    ]
  },
  {
    "id": "gtfs_7488069_184",
    "name": "Maamobi ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ],
      [
        "Kaneshie Market bus stop",
        -0.2356,
        5.56658
      ],
      [
        "Social Welfare",
        -0.23426,
        5.56879
      ],
      [
        "Roundabout",
        -0.23062,
        5.57193
      ],
      [
        "Awudome",
        -0.22819,
        5.5692
      ],
      [
        "Fan milk",
        -0.22225,
        5.57006
      ],
      [
        "Neoplan",
        -0.21853,
        5.56873
      ],
      [
        "Circle Last Stop",
        -0.21713,
        5.5691
      ],
      [
        "Mami Dokuno",
        -0.21269,
        5.57015
      ],
      [
        "Equip",
        -0.21088,
        5.57058
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Kanda",
        -0.20183,
        5.57285
      ],
      [
        "Nima Police Station",
        -0.20072,
        5.5744
      ],
      [
        "Nima Roundabout",
        -0.20055,
        5.57812
      ],
      [
        "Gutter",
        -0.19673,
        5.58821
      ],
      [
        "Mawarko",
        -0.19578,
        5.59092
      ],
      [
        "Maamobi",
        -0.1954,
        5.59211
      ]
    ]
  },
  {
    "id": "gtfs_7423582_188",
    "name": "Mamponse ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23587,
        5.5641
      ],
      [
        "Methodist",
        -0.24442,
        5.53486
      ],
      [
        "Bamboi",
        -0.24623,
        5.53286
      ],
      [
        "USA",
        -0.24838,
        5.53228
      ],
      [
        "Lotto House",
        -0.25116,
        5.53246
      ],
      [
        "205",
        -0.254,
        5.53196
      ],
      [
        "Agege",
        -0.25499,
        5.5318
      ],
      [
        "Zone 6",
        -0.25758,
        5.53144
      ],
      [
        "Karikari",
        -0.26144,
        5.53098
      ],
      [
        "Agege Last Stop",
        -0.26399,
        5.52932
      ],
      [
        "Atomic",
        -0.266,
        5.52764
      ],
      [
        "Point 6",
        -0.26838,
        5.52828
      ],
      [
        "Ebenezer",
        -0.26984,
        5.52951
      ],
      [
        "Mamponse",
        -0.27365,
        5.52768
      ]
    ]
  },
  {
    "id": "gtfs_7541948_11",
    "name": "Medie/Kotoku ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Kotokou",
        -0.35681,
        5.74011
      ],
      [
        "Rafiki",
        -0.34961,
        5.74491
      ],
      [
        "Akotoshi no.1",
        -0.34857,
        5.74561
      ],
      [
        "Rush",
        -0.34529,
        5.74794
      ],
      [
        "Akotoshi No 2",
        -0.34197,
        5.75009
      ],
      [
        "Bridge",
        -0.33183,
        5.75702
      ],
      [
        "Voltic",
        -0.32954,
        5.75861
      ],
      [
        "Medie",
        -0.32579,
        5.76056
      ],
      [
        "Gaogao",
        -0.32384,
        5.75731
      ],
      [
        "Kontunse",
        -0.3159,
        5.74094
      ],
      [
        "Container",
        -0.31503,
        5.73847
      ],
      [
        "Macedonia",
        -0.3144,
        5.73627
      ],
      [
        "Pobiman",
        -0.31418,
        5.73542
      ],
      [
        "Sapeiman",
        -0.31139,
        5.72574
      ],
      [
        "Shikpontele",
        -0.30891,
        5.71866
      ],
      [
        "Agya Appiah",
        -0.30745,
        5.71583
      ],
      [
        "Toman",
        -0.30475,
        5.71145
      ],
      [
        "Chop bar",
        -0.30082,
        5.7087
      ],
      [
        "Amasaman",
        -0.29829,
        5.70553
      ],
      [
        "Fusi Junction",
        -0.29215,
        5.6982
      ],
      [
        "Festus",
        -0.28752,
        5.69179
      ],
      [
        "Pokuase Junction",
        -0.28164,
        5.68718
      ],
      [
        "Pokuase Junction main Road",
        -0.28065,
        5.68641
      ],
      [
        "ACP Junction",
        -0.27746,
        5.68392
      ],
      [
        "Agya Herbal",
        -0.27196,
        5.67237
      ],
      [
        "John Teye",
        -0.27114,
        5.66912
      ],
      [
        "Ofankor Barrier",
        -0.26547,
        5.65766
      ],
      [
        "Income Tax",
        -0.26118,
        5.65458
      ],
      [
        "Spot M",
        -0.2586,
        5.65294
      ],
      [
        "Taifa Junction",
        -0.25123,
        5.64838
      ],
      [
        "Tantra Hills",
        -0.24551,
        5.64292
      ],
      [
        "St. Johns",
        -0.24359,
        5.6399
      ],
      [
        "Mile 7",
        -0.23978,
        5.63394
      ],
      [
        "ABC Junction",
        -0.23655,
        5.62887
      ],
      [
        "Neoplan",
        -0.23487,
        5.62631
      ],
      [
        "Achimota Overhead",
        -0.23144,
        5.62108
      ],
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ]
    ]
  },
  {
    "id": "gtfs_7467672_13",
    "name": "Ofankor ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Ofankor Taxi Rank",
        -0.26722,
        5.65787
      ],
      [
        "Ofankor Barrier",
        -0.26547,
        5.65766
      ],
      [
        "Income Tax",
        -0.26118,
        5.65458
      ],
      [
        "Spot M",
        -0.2586,
        5.65294
      ],
      [
        "Taifa Junction",
        -0.25123,
        5.64838
      ],
      [
        "Tantra Hills",
        -0.24551,
        5.64292
      ],
      [
        "St. Johns",
        -0.24359,
        5.6399
      ],
      [
        "Mile 7",
        -0.23978,
        5.63394
      ],
      [
        "ABC Junction",
        -0.23655,
        5.62887
      ],
      [
        "Neoplan",
        -0.23487,
        5.62631
      ],
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ]
    ]
  },
  {
    "id": "gtfs_7415878_15",
    "name": "Circle Accra ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21329,
        5.57067
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Circle",
        -0.21587,
        5.57146
      ],
      [
        "Circle Asoredanho",
        -0.21653,
        5.57545
      ],
      [
        "Caprice",
        -0.21668,
        5.58253
      ],
      [
        "Alajo",
        -0.2183,
        5.59091
      ],
      [
        "Abeka Junction",
        -0.2235,
        5.59855
      ],
      [
        "Abeka Junction Curve",
        -0.22478,
        5.59952
      ],
      [
        "Total",
        -0.23301,
        5.59811
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Abeka Main Market",
        -0.23913,
        5.6008
      ],
      [
        "Eno",
        -0.24157,
        5.60263
      ],
      [
        "Fadama Junction",
        -0.2425,
        5.60308
      ],
      [
        "Abeka Post Office",
        -0.24359,
        5.6039
      ],
      [
        "Abotare",
        -0.24527,
        5.60508
      ],
      [
        "Abeka Lapaz Last Stop",
        -0.24692,
        5.6061
      ],
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ]
    ]
  },
  {
    "id": "gtfs_7475350_17",
    "name": "Ashaiman Main Station ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ],
      [
        "Ashaiman Overhead",
        -0.02556,
        5.68261
      ],
      [
        "Manet",
        -0.12908,
        5.64083
      ],
      [
        "Tetteh Quarshie / Roundabout",
        -0.17385,
        5.62402
      ],
      [
        "Dzorwulu Junction",
        -0.19115,
        5.6185
      ],
      [
        "CP",
        -0.21189,
        5.61574
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Achimota Old Station",
        -0.2294,
        5.61639
      ],
      [
        "Achimota New Station",
        -0.2259,
        5.62195
      ]
    ]
  },
  {
    "id": "gtfs_7478164_19",
    "name": "Taifa ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Taifa",
        -0.25285,
        5.65839
      ],
      [
        "Junction",
        -0.25248,
        5.65283
      ],
      [
        "Taifa Post Office",
        -0.25076,
        5.65206
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "Ofankor Barrier",
        -0.26547,
        5.65766
      ],
      [
        "Income Tax",
        -0.26118,
        5.65458
      ],
      [
        "Spot M",
        -0.2586,
        5.65294
      ],
      [
        "Tantra Hills",
        -0.24551,
        5.64292
      ],
      [
        "St. Johns",
        -0.24359,
        5.6399
      ],
      [
        "Mile 7",
        -0.23978,
        5.63394
      ],
      [
        "ABC Junction",
        -0.23655,
        5.62887
      ],
      [
        "Neoplan",
        -0.23487,
        5.62631
      ],
      [
        "Achimota Overhead",
        -0.23144,
        5.62108
      ],
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ]
    ]
  },
  {
    "id": "gtfs_7548114_62",
    "name": "Chorkor ↔ Agbogbloshie",
    "color": "#1779c2",
    "stops": [
      [
        "Agbogbloshie",
        -0.21683,
        5.54908
      ],
      [
        "Galloway",
        -0.21806,
        5.54802
      ],
      [
        "Timber Market",
        -0.21624,
        5.54357
      ],
      [
        "Palledium",
        -0.21565,
        5.54201
      ],
      [
        "Jamestown Police Station",
        -0.21358,
        5.53614
      ],
      [
        "Accra Royal",
        -0.21499,
        5.53547
      ],
      [
        "Korle er naa",
        -0.21939,
        5.53141
      ],
      [
        "Korle gonno shell",
        -0.22491,
        5.52994
      ],
      [
        "Korle beach resort",
        -0.22791,
        5.5293
      ],
      [
        "White House",
        -0.23264,
        5.52834
      ],
      [
        "Galilee",
        -0.2335,
        5.52816
      ],
      [
        "Hotel Junction",
        -0.23426,
        5.528
      ],
      [
        "Wolarm",
        -0.23557,
        5.52775
      ],
      [
        "Tei Abaa",
        -0.23808,
        5.5273
      ],
      [
        "Tea Garden",
        -0.24168,
        5.52698
      ],
      [
        "Alomo Junction",
        -0.24372,
        5.5268
      ],
      [
        "Lantemame",
        -0.24591,
        5.52663
      ],
      [
        "Bridge",
        -0.24897,
        5.52638
      ],
      [
        "Chokor/ Chemuna",
        -0.25046,
        5.52625
      ]
    ]
  },
  {
    "id": "gtfs_7584959_322",
    "name": "Ashaiman Main Station ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20105,
        5.54867
      ],
      [
        "National Theatre",
        -0.20102,
        5.5543
      ],
      [
        "Childrens Park First",
        -0.20012,
        5.5555
      ],
      [
        "Childrens Park Second",
        -0.19882,
        5.55724
      ],
      [
        "Ridge",
        -0.19664,
        5.56005
      ],
      [
        "ADB House",
        -0.194,
        5.56492
      ],
      [
        "Sankara",
        -0.18944,
        5.57343
      ],
      [
        "Flagstaff House",
        -0.18795,
        5.57621
      ],
      [
        "37 Water Works",
        -0.18491,
        5.5834
      ],
      [
        "37 Hospital",
        -0.18261,
        5.58791
      ],
      [
        "Ecobank",
        -0.18121,
        5.58995
      ],
      [
        "License Office",
        -0.18061,
        5.59193
      ],
      [
        "Opeibea First",
        -0.17961,
        5.59636
      ],
      [
        "Opeibea Second",
        -0.17864,
        5.60071
      ],
      [
        "Airport First",
        -0.17731,
        5.60645
      ],
      [
        "Airport Second",
        -0.17658,
        5.60983
      ],
      [
        "Shangrila",
        -0.17591,
        5.61719
      ],
      [
        "Accra Mall",
        -0.17405,
        5.62277
      ],
      [
        "Action Chapel",
        -0.16577,
        5.62636
      ],
      [
        "Manet",
        -0.12812,
        5.64091
      ],
      [
        "Coca-Cola / Police Station",
        -0.10552,
        5.64999
      ],
      [
        "KICC",
        -0.09531,
        5.65412
      ],
      [
        "Trasacco",
        -0.11768,
        5.64506
      ],
      [
        "18 Junction",
        -0.07565,
        5.66056
      ],
      [
        "Abattoir",
        -0.07139,
        5.66224
      ],
      [
        "Biscuit Factory",
        -0.06689,
        5.66409
      ],
      [
        "Under Bridge",
        -0.0436,
        5.67479
      ],
      [
        "Ashaiman Overhead",
        -0.02578,
        5.68205
      ],
      [
        "Hospital Roundabout Junction",
        -0.02457,
        5.68163
      ],
      [
        "Washing Bay",
        -0.02792,
        5.68514
      ],
      [
        "Ashaiman Traffic Junction",
        -0.029,
        5.68648
      ],
      [
        "Ashaiman Police Station",
        -0.031,
        5.68754
      ],
      [
        "Ashaiman Last Stop",
        -0.03175,
        5.68692
      ],
      [
        "Ashaiman",
        -0.03271,
        5.68691
      ]
    ]
  },
  {
    "id": "gtfs_7481388_320",
    "name": "Haatso ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "Achimota Club House",
        -0.21925,
        5.62209
      ],
      [
        "PWD",
        -0.21889,
        5.624
      ],
      [
        "Achimota Hospital",
        -0.21914,
        5.6275
      ],
      [
        "Golf Park",
        -0.21944,
        5.63017
      ],
      [
        "Polo",
        -0.21825,
        5.63163
      ],
      [
        "Christian Village",
        -0.21465,
        5.63539
      ],
      [
        "Kisseman Junction",
        -0.21323,
        5.63725
      ],
      [
        "Pure Fire",
        -0.21189,
        5.63788
      ],
      [
        "Airways Junction",
        -0.21086,
        5.63818
      ],
      [
        "Westlands junction",
        -0.20975,
        5.65025
      ],
      [
        "Clinic",
        -0.20783,
        5.65658
      ],
      [
        "Allied fuel station",
        -0.20664,
        5.65924
      ],
      [
        "Pharmacy",
        -0.20607,
        5.66045
      ],
      [
        "Haatso",
        -0.20465,
        5.66728
      ]
    ]
  },
  {
    "id": "gtfs_7587970_326",
    "name": "New Town ↔ Adenta",
    "color": "#1779c2",
    "stops": [
      [
        "Goil Filling Station",
        -0.17199,
        5.70004
      ],
      [
        "SDA",
        -0.17203,
        5.69653
      ],
      [
        "Assemblies",
        -0.17193,
        5.69293
      ],
      [
        "Ritz First",
        -0.17168,
        5.6882
      ],
      [
        "Ritz Second",
        -0.17155,
        5.68524
      ],
      [
        "Madina Masalachi",
        -0.17164,
        5.68215
      ],
      [
        "Madina Station",
        -0.17126,
        5.67603
      ],
      [
        "Madina Firestone Junction",
        -0.17125,
        5.66853
      ],
      [
        "Atomic Second",
        -0.17756,
        5.66638
      ],
      [
        "Presec",
        -0.17836,
        5.66176
      ],
      [
        "UPS",
        -0.17895,
        5.65909
      ],
      [
        "Power House",
        -0.18015,
        5.65606
      ],
      [
        "Legon First",
        -0.18071,
        5.65361
      ],
      [
        "Legon Second",
        -0.17987,
        5.64816
      ],
      [
        "Okponglo",
        -0.17815,
        5.63961
      ],
      [
        "Legon Second Gate",
        -0.17746,
        5.63576
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Spanner",
        -0.17649,
        5.62051
      ],
      [
        "Shangrila",
        -0.17642,
        5.61723
      ],
      [
        "Container First",
        -0.18194,
        5.61695
      ],
      [
        "Jack and Jill",
        -0.18955,
        5.60202
      ],
      [
        "SGS",
        -0.19191,
        5.60224
      ],
      [
        "Frensho",
        -0.19339,
        5.60181
      ],
      [
        "Power House",
        -0.19428,
        5.59977
      ],
      [
        "First Total",
        -0.19738,
        5.59969
      ],
      [
        "Pig Farm",
        -0.198,
        5.59876
      ],
      [
        "Kotobabi Down",
        -0.19888,
        5.59741
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ]
    ]
  },
  {
    "id": "gtfs_7481117_324",
    "name": "Accra New Town ↔ 37",
    "color": "#1779c2",
    "stops": [
      [
        "37",
        -0.1796,
        5.58886
      ],
      [
        "Culture",
        -0.18518,
        5.59345
      ],
      [
        "First Total",
        -0.19738,
        5.59969
      ],
      [
        "Pig Farm",
        -0.198,
        5.59876
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ]
    ]
  },
  {
    "id": "gtfs_7588610_328",
    "name": "Kasoa ↔ Accra New Town",
    "color": "#1779c2",
    "stops": [
      [
        "New town",
        -0.20865,
        5.5826
      ],
      [
        "Commandos",
        -0.20529,
        5.58026
      ],
      [
        "Nima Roundabout",
        -0.20086,
        5.57748
      ],
      [
        "Nima School Junction",
        -0.20083,
        5.57628
      ],
      [
        "Nima Police Station",
        -0.20079,
        5.57421
      ],
      [
        "Nima Junction",
        -0.20137,
        5.57318
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "Times",
        -0.2246,
        5.56624
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Roundabout",
        -0.22858,
        5.56259
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Market",
        -0.2343,
        5.56444
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ],
      [
        "Mallam Station",
        -0.23801,
        5.56667
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Atico",
        -0.25072,
        5.57437
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor",
        -0.26242,
        5.5807
      ],
      [
        "Odorkor (Main Bus stop)",
        -0.26369,
        5.58043
      ],
      [
        "Busia Junction",
        -0.26784,
        5.57912
      ],
      [
        "Tipper",
        -0.26991,
        5.5785
      ],
      [
        "Sakaman",
        -0.27399,
        5.57666
      ],
      [
        "Chabaar",
        -0.27501,
        5.57606
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "Mallam Junction",
        -0.28595,
        5.56983
      ],
      [
        "McCarthy Junction",
        -0.28894,
        5.56551
      ],
      [
        "Weija-Gbawe Municipal Hospital",
        -0.28955,
        5.56416
      ],
      [
        "Benjys",
        -0.29034,
        5.56242
      ],
      [
        "Jayeemens",
        -0.29228,
        5.56033
      ],
      [
        "Mendskrom",
        -0.29718,
        5.55834
      ],
      [
        "Weija Junction",
        -0.30385,
        5.55591
      ],
      [
        "Tetegu",
        -0.30967,
        5.55394
      ],
      [
        "Modex",
        -0.32232,
        5.5533
      ],
      [
        "Choice Second",
        -0.32673,
        5.55241
      ],
      [
        "Weija Barrier",
        -0.33036,
        5.55093
      ],
      [
        "Block Factory",
        -0.33548,
        5.54885
      ],
      [
        "SCC",
        -0.33874,
        5.54754
      ],
      [
        "Shoprite",
        -0.34208,
        5.54639
      ],
      [
        "Bortianor",
        -0.34822,
        5.54779
      ],
      [
        "Ayigbe Town",
        -0.35383,
        5.55023
      ],
      [
        "Mile Eleven",
        -0.35566,
        5.55095
      ],
      [
        "Broadcasting",
        -0.35896,
        5.5523
      ],
      [
        "Tuba",
        -0.38253,
        5.54688
      ],
      [
        "Chinese",
        -0.38978,
        5.54341
      ],
      [
        "Kalabule",
        -0.39054,
        5.54303
      ],
      [
        "Brigade",
        -0.39465,
        5.54108
      ],
      [
        "Galelia",
        -0.39889,
        5.53907
      ],
      [
        "Galelia Market",
        -0.40138,
        5.53824
      ],
      [
        "Washing Bay",
        -0.40629,
        5.53688
      ],
      [
        "Iron City",
        -0.41096,
        5.53578
      ],
      [
        "Amanfrom",
        -0.41282,
        5.53569
      ],
      [
        "Pink FM",
        -0.41634,
        5.53568
      ],
      [
        "Second",
        -0.41895,
        5.53554
      ],
      [
        "Kasoa",
        -0.4238,
        5.53479
      ]
    ]
  },
  {
    "id": "gtfs_7459791_201",
    "name": "Makola Tudu ↔ Kaneshie Foot Bridge",
    "color": "#1779c2",
    "stops": [
      [
        "Makola Tudu",
        -0.20709,
        5.54765
      ],
      [
        "Tudu",
        -0.2079,
        5.55122
      ],
      [
        "Accra Poly",
        -0.20843,
        5.55349
      ],
      [
        "Starlite",
        -0.20908,
        5.55596
      ],
      [
        "After Dat",
        -0.21491,
        5.55712
      ],
      [
        "Graphic",
        -0.2188,
        5.55553
      ],
      [
        "Fata",
        -0.22196,
        5.55702
      ],
      [
        "Mtn office / Kaneshie Roundabout",
        -0.22741,
        5.56029
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ]
    ]
  },
  {
    "id": "gtfs_7459986_203",
    "name": "Kaneshie Market Station ↔ Agyapa Ye North Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ],
      [
        "Social Welfare",
        -0.23426,
        5.56879
      ],
      [
        "Roundabout",
        -0.23079,
        5.57284
      ],
      [
        "Kaneshie Polyclinic",
        -0.23062,
        5.57425
      ],
      [
        "Dance Bar",
        -0.22793,
        5.57675
      ],
      [
        "St. Theresas",
        -0.2283,
        5.57945
      ],
      [
        "Pentecost",
        -0.22904,
        5.58027
      ],
      [
        "Obaatanpa",
        -0.22994,
        5.58131
      ],
      [
        "Green Hand",
        -0.23036,
        5.58197
      ],
      [
        "CPP",
        -0.23074,
        5.58281
      ],
      [
        "Masalakyi",
        -0.23153,
        5.58473
      ],
      [
        "Swanlake",
        -0.23171,
        5.5853
      ],
      [
        "Old Stop",
        -0.23272,
        5.58752
      ],
      [
        "Meridian Chemist",
        -0.23536,
        5.5878
      ],
      [
        "Adodo",
        -0.23611,
        5.58868
      ],
      [
        "CMB Flats",
        -0.23739,
        5.5896
      ],
      [
        "Amankwah",
        -0.23844,
        5.58906
      ],
      [
        "Agya Paye",
        -0.24031,
        5.59471
      ]
    ]
  },
  {
    "id": "gtfs_7460324_205",
    "name": "New Fadama ↔ Kaneshie Market Station",
    "color": "#1779c2",
    "stops": [
      [
        "New Fadama",
        -0.24813,
        5.59999
      ],
      [
        "New Fadama (Market)",
        -0.2454,
        5.59614
      ],
      [
        "North Last Stop",
        -0.24254,
        5.59486
      ],
      [
        "Point 4",
        -0.24219,
        5.59234
      ],
      [
        "Ziggy",
        -0.24161,
        5.59068
      ],
      [
        "Demod",
        -0.2408,
        5.58901
      ],
      [
        "Assemblies of God",
        -0.24016,
        5.58814
      ],
      [
        "Amankwah",
        -0.23826,
        5.58911
      ],
      [
        "CMB Flats",
        -0.23713,
        5.58966
      ],
      [
        "Adodo",
        -0.23635,
        5.58907
      ],
      [
        "Meridian Chemist",
        -0.23547,
        5.58768
      ],
      [
        "Old Stop",
        -0.2329,
        5.58771
      ],
      [
        "Swanlake",
        -0.23207,
        5.58599
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7460562_207",
    "name": "North Industrial Area ↔ Kaneshie Market Station",
    "color": "#1779c2",
    "stops": [
      [
        "North Industrial Area",
        -0.23149,
        5.58551
      ],
      [
        "Swanlake",
        -0.23171,
        5.5853
      ],
      [
        "Masalakyi",
        -0.23166,
        5.58494
      ],
      [
        "CPP",
        -0.23078,
        5.58272
      ],
      [
        "Green Hand",
        -0.23046,
        5.58207
      ],
      [
        "Obaatanpa",
        -0.22999,
        5.58133
      ],
      [
        "Pentecost",
        -0.2291,
        5.58024
      ],
      [
        "St. Theresas",
        -0.22831,
        5.57937
      ],
      [
        "Picadilly",
        -0.22771,
        5.57826
      ],
      [
        "Dance Bar",
        -0.22797,
        5.57685
      ],
      [
        "Ga Mantse",
        -0.22925,
        5.57559
      ],
      [
        "Kaneshie Polyclinic",
        -0.23069,
        5.57426
      ],
      [
        "Mothers Inn",
        -0.23129,
        5.57335
      ],
      [
        "Roundabout",
        -0.23115,
        5.57207
      ],
      [
        "Big Boss",
        -0.23242,
        5.57092
      ],
      [
        "Fire Armour",
        -0.23296,
        5.57042
      ],
      [
        "Social Welfare",
        -0.23433,
        5.56881
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7460717_209",
    "name": "Swanlake ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Swanlake Last Stop",
        -0.23399,
        5.58406
      ],
      [
        "Obaatanpa",
        -0.22999,
        5.58133
      ],
      [
        "Pentecost",
        -0.2291,
        5.58024
      ],
      [
        "St. Theresas",
        -0.22831,
        5.57937
      ],
      [
        "Picadilly",
        -0.22771,
        5.57826
      ],
      [
        "Dance Bar",
        -0.22797,
        5.57685
      ],
      [
        "Ga Mantse",
        -0.22925,
        5.57559
      ],
      [
        "Kaneshie Polyclinic",
        -0.23069,
        5.57426
      ],
      [
        "Mothers Inn",
        -0.23129,
        5.57335
      ],
      [
        "Roundabout",
        -0.23115,
        5.57207
      ],
      [
        "Big Boss",
        -0.23242,
        5.57092
      ],
      [
        "Fire Armour",
        -0.23296,
        5.57042
      ],
      [
        "Social Welfare",
        -0.23433,
        5.56881
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7420855_77",
    "name": "Accra UTC ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Accra UTC",
        -0.20999,
        5.54688
      ],
      [
        "Accra Poly",
        -0.20843,
        5.55349
      ],
      [
        "Starlite",
        -0.20908,
        5.55596
      ],
      [
        "Champion",
        -0.20938,
        5.55724
      ],
      [
        "Adabraka Market",
        -0.21107,
        5.5637
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Circle",
        -0.21587,
        5.57146
      ],
      [
        "Circle Asoredanho",
        -0.21653,
        5.57545
      ],
      [
        "Caprice",
        -0.21668,
        5.58253
      ],
      [
        "Alajo",
        -0.21796,
        5.58877
      ],
      [
        "Abeka Junction",
        -0.2235,
        5.59855
      ],
      [
        "Abeka Junction Curve",
        -0.22478,
        5.59952
      ],
      [
        "Fitting Shop",
        -0.22617,
        5.59928
      ],
      [
        "Abrantie",
        -0.22865,
        5.59877
      ],
      [
        "Tesano Gardens",
        -0.23053,
        5.59845
      ],
      [
        "Total",
        -0.23301,
        5.59811
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Abeka Bcos Junction",
        -0.23495,
        5.59894
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Abeka Main Market",
        -0.23913,
        5.6008
      ],
      [
        "Fadama",
        -0.24055,
        5.60164
      ],
      [
        "Eno",
        -0.24157,
        5.60263
      ],
      [
        "Fadama Junction",
        -0.2425,
        5.60308
      ],
      [
        "Abeka Post Office",
        -0.24359,
        5.6039
      ],
      [
        "Abeka Lapaz",
        -0.24814,
        5.60636
      ]
    ]
  },
  {
    "id": "gtfs_7421019_75",
    "name": "Osu (37 Station) ↔ 37 Lorry Park",
    "color": "#1779c2",
    "stops": [
      [
        "Osu",
        -0.18359,
        5.55408
      ],
      [
        "Osu Shell",
        -0.18272,
        5.55626
      ],
      [
        "Papaye",
        -0.18214,
        5.55975
      ],
      [
        "SNNIT",
        -0.1816,
        5.56277
      ],
      [
        "Penta Hotel",
        -0.18116,
        5.56536
      ],
      [
        "Police Hospital",
        -0.18074,
        5.56799
      ],
      [
        "Prisons",
        -0.18041,
        5.56997
      ],
      [
        "Morning Star",
        -0.1796,
        5.57342
      ],
      [
        "Roundabout",
        -0.17812,
        5.57722
      ],
      [
        "GIS",
        -0.17627,
        5.58145
      ],
      [
        "Post Office",
        -0.17618,
        5.58534
      ],
      [
        "37",
        -0.1796,
        5.58886
      ]
    ]
  },
  {
    "id": "gtfs_7479635_73",
    "name": "Kotobabi Down Polo Park ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Kotobabi Down (Polo Park)",
        -0.2092,
        5.59581
      ],
      [
        "Tobinco Junction",
        -0.20631,
        5.59328
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.2073,
        5.59005
      ],
      [
        "Bakery",
        -0.20916,
        5.5884
      ],
      [
        "Mallam Attah Market",
        -0.20993,
        5.58534
      ],
      [
        "Roman Junction",
        -0.21307,
        5.58525
      ],
      [
        "Akoko Darko Junction",
        -0.21564,
        5.58516
      ],
      [
        "Caprice Juntion",
        -0.2159,
        5.58125
      ],
      [
        "Circle Lido",
        -0.21455,
        5.5733
      ]
    ]
  },
  {
    "id": "gtfs_7479359_71",
    "name": "Immesco Rice ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Immesco Rice",
        -0.23144,
        5.58976
      ],
      [
        "Melcom",
        -0.22693,
        5.58794
      ],
      [
        "New Melcom",
        -0.22144,
        5.58519
      ],
      [
        "Electricity Junction",
        -0.22012,
        5.57996
      ],
      [
        "Circle Asoredanho",
        -0.21673,
        5.57563
      ],
      [
        "Vodafone",
        -0.21614,
        5.57186
      ],
      [
        "Circle",
        -0.21676,
        5.56975
      ]
    ]
  },
  {
    "id": "gtfs_7467946_79",
    "name": "New Melcom ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "New Melcom",
        -0.22144,
        5.58519
      ],
      [
        "Circle Asoredanho",
        -0.21673,
        5.57563
      ],
      [
        "Circle",
        -0.21676,
        5.56975
      ]
    ]
  },
  {
    "id": "gtfs_7473825_2",
    "name": "Legon Station ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Achimota Club House",
        -0.21925,
        5.62209
      ],
      [
        "PWD",
        -0.21889,
        5.624
      ],
      [
        "Achimota Hospital",
        -0.21914,
        5.6275
      ],
      [
        "Golf Park",
        -0.21944,
        5.63017
      ],
      [
        "Polo",
        -0.21825,
        5.63163
      ],
      [
        "Christian Village",
        -0.21465,
        5.63539
      ],
      [
        "Kisseman Junction",
        -0.21323,
        5.63725
      ],
      [
        "Pure Fire",
        -0.21189,
        5.63788
      ],
      [
        "Airways Junction",
        -0.21086,
        5.63818
      ],
      [
        "Forestry Commission",
        -0.20883,
        5.6391
      ],
      [
        "GIMPA",
        -0.20524,
        5.64138
      ],
      [
        "Legon Barrier",
        -0.19791,
        5.64158
      ],
      [
        "18",
        -0.19511,
        5.64087
      ],
      [
        "Ayido",
        -0.19374,
        5.64071
      ],
      [
        "Legon Primary School",
        -0.18994,
        5.64269
      ],
      [
        "Okponglo Roundabout",
        -0.18376,
        5.64037
      ],
      [
        "Legon Traffic Light",
        -0.17925,
        5.64055
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon police station",
        -0.17966,
        5.65129
      ],
      [
        "Legon station",
        -0.17896,
        5.65017
      ]
    ]
  },
  {
    "id": "gtfs_7455439_542",
    "name": "SSNIT Flats ↔ Circle Odorna",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "Social Welfare",
        -0.23433,
        5.56881
      ],
      [
        "First Light",
        -0.24386,
        5.56626
      ],
      [
        "JT",
        -0.24535,
        5.56474
      ],
      [
        "Peace Clinic",
        -0.24738,
        5.56594
      ],
      [
        "Mataheko Police Quarters",
        -0.24983,
        5.56745
      ],
      [
        "Mataheko Pharmacy",
        -0.25135,
        5.56847
      ],
      [
        "1 plus 1",
        -0.25361,
        5.57
      ],
      [
        "Curve",
        -0.25442,
        5.57248
      ],
      [
        "Vice",
        -0.2555,
        5.57309
      ],
      [
        "Lotto Kiosk",
        -0.25785,
        5.57336
      ],
      [
        "Pentecost",
        -0.26042,
        5.57322
      ],
      [
        "Yellow Kiosk",
        -0.26178,
        5.57316
      ],
      [
        "Saint Anthony",
        -0.26419,
        5.57282
      ],
      [
        "Masalachi",
        -0.26579,
        5.57231
      ],
      [
        "Bola",
        -0.2674,
        5.57183
      ],
      [
        "All Days",
        -0.26869,
        5.57153
      ],
      [
        "Blue Lagoon",
        -0.27081,
        5.57156
      ],
      [
        "Dela",
        -0.2714,
        5.57087
      ],
      [
        "Thirteen",
        -0.27031,
        5.56766
      ],
      [
        "Ave Maria",
        -0.26819,
        5.56481
      ],
      [
        "Alaba",
        -0.27057,
        5.56403
      ],
      [
        "SSNIT Flats",
        -0.27324,
        5.56331
      ]
    ]
  },
  {
    "id": "gtfs_7463356_540",
    "name": "Legon ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Achimota Club House",
        -0.21925,
        5.62209
      ],
      [
        "PWD",
        -0.21889,
        5.624
      ],
      [
        "Achimota Hospital",
        -0.21914,
        5.6275
      ],
      [
        "Golf Park",
        -0.21944,
        5.63017
      ],
      [
        "Polo",
        -0.21825,
        5.63163
      ],
      [
        "Christian Village",
        -0.21465,
        5.63539
      ],
      [
        "Kisseman Junction",
        -0.21323,
        5.63725
      ],
      [
        "Pure Fire",
        -0.21189,
        5.63788
      ],
      [
        "Airways Junction",
        -0.21086,
        5.63818
      ],
      [
        "Forestry Commission",
        -0.20883,
        5.6391
      ],
      [
        "GIMPA",
        -0.20524,
        5.64138
      ],
      [
        "Legon Barrier",
        -0.19791,
        5.64158
      ],
      [
        "Ayido",
        -0.19374,
        5.64071
      ],
      [
        "Legon Primary School",
        -0.18994,
        5.64269
      ],
      [
        "Okponglo Roundabout",
        -0.18376,
        5.64037
      ],
      [
        "Legon Traffic Light",
        -0.17925,
        5.64055
      ]
    ]
  },
  {
    "id": "gtfs_7563536_546",
    "name": "Zamrama Line ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "Court",
        -0.20435,
        5.54444
      ],
      [
        "Accra Bishop",
        -0.20486,
        5.54374
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "Accra Post Office",
        -0.20977,
        5.54198
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Market",
        -0.23701,
        5.55281
      ],
      [
        "Pipeier Naa",
        -0.24013,
        5.5535
      ],
      [
        "Waterworks",
        -0.24042,
        5.55608
      ],
      [
        "Junction",
        -0.24328,
        5.55611
      ],
      [
        "La bay",
        -0.24686,
        5.55568
      ],
      [
        "Banku Junction",
        -0.24755,
        5.55378
      ],
      [
        "Borla Junction",
        -0.24762,
        5.55093
      ],
      [
        "Sukura",
        -0.24929,
        5.55062
      ],
      [
        "Sukura Market",
        -0.25121,
        5.5524
      ],
      [
        "Loso",
        -0.2546,
        5.55102
      ],
      [
        "Akoo Store",
        -0.2548,
        5.55005
      ],
      [
        "Zambrama Line",
        -0.25735,
        5.54969
      ]
    ]
  },
  {
    "id": "gtfs_7563714_544",
    "name": "Chemuna ↔ Accra Rawlings Park",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Rawlings Park",
        -0.20763,
        5.54574
      ],
      [
        "Accra Post Office",
        -0.20977,
        5.54198
      ],
      [
        "Akoto Lante",
        -0.21312,
        5.53887
      ],
      [
        "Jamestown Police Station",
        -0.21358,
        5.53614
      ],
      [
        "Accra Royal",
        -0.21499,
        5.53547
      ],
      [
        "Korle er naa",
        -0.21939,
        5.53141
      ],
      [
        "Korle gonno shell",
        -0.22491,
        5.52994
      ],
      [
        "Korle beach resort",
        -0.22791,
        5.5293
      ],
      [
        "White House",
        -0.23264,
        5.52834
      ],
      [
        "Galilee",
        -0.2335,
        5.52816
      ],
      [
        "Hotel Junction",
        -0.23426,
        5.528
      ],
      [
        "Wolarm",
        -0.23557,
        5.52775
      ],
      [
        "White House",
        -0.23614,
        5.52763
      ],
      [
        "Tei Abaa",
        -0.23808,
        5.5273
      ],
      [
        "Tea Garden",
        -0.24168,
        5.52698
      ],
      [
        "Alomo Junction",
        -0.24372,
        5.5268
      ],
      [
        "Lantemame",
        -0.24591,
        5.52663
      ],
      [
        "Bridge",
        -0.24897,
        5.52638
      ],
      [
        "Chokor/ Chemuna",
        -0.25046,
        5.52625
      ]
    ]
  },
  {
    "id": "gtfs_7541891_8",
    "name": "Mayera/Adusa ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Neoplan",
        -0.23295,
        5.62409
      ],
      [
        "ABC Junction",
        -0.23629,
        5.62918
      ],
      [
        "Mile 7",
        -0.23967,
        5.63445
      ],
      [
        "Best Point",
        -0.2402,
        5.63532
      ],
      [
        "Achimota Mall",
        -0.24147,
        5.63737
      ],
      [
        "St. Johns",
        -0.24243,
        5.63885
      ],
      [
        "St Johns Second",
        -0.24413,
        5.64151
      ],
      [
        "Tantra Hills",
        -0.24727,
        5.64606
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "Spot M",
        -0.25971,
        5.65412
      ],
      [
        "Income Tax",
        -0.2631,
        5.65644
      ],
      [
        "Ofankor Barrier",
        -0.26479,
        5.65761
      ],
      [
        "John Teye",
        -0.27042,
        5.66733
      ],
      [
        "Agya Herbal",
        -0.27173,
        5.67265
      ],
      [
        "ACP Junction",
        -0.27726,
        5.68409
      ],
      [
        "Pokuase Junction",
        -0.28132,
        5.68734
      ],
      [
        "Pokuase Old Station",
        -0.28309,
        5.6908
      ],
      [
        "Pokuase Agric",
        -0.28647,
        5.69625
      ],
      [
        "Quarters Junction",
        -0.28554,
        5.69826
      ],
      [
        "Thank You Jesus",
        -0.28689,
        5.70851
      ],
      [
        "Afiaman Pamprom",
        -0.28648,
        5.70996
      ],
      [
        "White House",
        -0.28368,
        5.7147
      ],
      [
        "Alosa",
        -0.2831,
        5.71608
      ],
      [
        "Agbodji",
        -0.28159,
        5.718
      ],
      [
        "New Life",
        -0.28064,
        5.71926
      ],
      [
        "Osofo Ama",
        -0.27826,
        5.72267
      ],
      [
        "Fase Junction",
        -0.27705,
        5.7239
      ],
      [
        "Mayera Market",
        -0.2765,
        5.72622
      ],
      [
        "Okaiman Junction",
        -0.27586,
        5.72842
      ],
      [
        "Adusah Quarters",
        -0.27268,
        5.73251
      ],
      [
        "Mayera/Adusa",
        -0.27185,
        5.73562
      ]
    ]
  },
  {
    "id": "gtfs_7480396_548",
    "name": "Nima - Maamobi ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21329,
        5.57067
      ],
      [
        "Mami Dokuno",
        -0.21269,
        5.57015
      ],
      [
        "Equip",
        -0.21088,
        5.57058
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Kanda",
        -0.20183,
        5.57285
      ],
      [
        "Nima Police Station",
        -0.20072,
        5.5744
      ],
      [
        "Nima Roundabout",
        -0.20048,
        5.57786
      ],
      [
        "School Junction Nima",
        -0.19867,
        5.57803
      ],
      [
        "Nima Mamobi",
        -0.19778,
        5.58008
      ],
      [
        "Curve",
        -0.19718,
        5.58152
      ],
      [
        "Nima Station",
        -0.19824,
        5.58197
      ],
      [
        "Alaska",
        -0.19713,
        5.58625
      ],
      [
        "Gutter",
        -0.1966,
        5.58816
      ],
      [
        "Mawarko",
        -0.19578,
        5.59092
      ],
      [
        "Maamobi",
        -0.1954,
        5.59211
      ],
      [
        "Mamobi Market",
        -0.19479,
        5.59389
      ],
      [
        "Nima Overhead",
        -0.19463,
        5.59424
      ],
      [
        "Konka",
        -0.19485,
        5.59667
      ],
      [
        "Accra Girls",
        -0.19392,
        5.59815
      ],
      [
        "Power House",
        -0.19422,
        5.59971
      ],
      [
        "Frensho",
        -0.19332,
        5.60174
      ],
      [
        "SGS",
        -0.1921,
        5.60213
      ],
      [
        "Jack and Jill",
        -0.18976,
        5.60199
      ],
      [
        "Sign Board",
        -0.18844,
        5.60184
      ],
      [
        "Bostal",
        -0.18873,
        5.60639
      ],
      [
        "Bostal First",
        -0.1882,
        5.6072
      ],
      [
        "Bostal Second",
        -0.1874,
        5.60841
      ],
      [
        "High Flow",
        -0.18624,
        5.6102
      ],
      [
        "Chinese",
        -0.18691,
        5.61239
      ],
      [
        "T Junction",
        -0.18749,
        5.61326
      ],
      [
        "Nyaho",
        -0.18502,
        5.6149
      ],
      [
        "School Junction",
        -0.18416,
        5.61546
      ],
      [
        "Container First",
        -0.183,
        5.61617
      ],
      [
        "Container Second",
        -0.18204,
        5.61682
      ],
      [
        "Mangoase",
        -0.17866,
        5.61726
      ],
      [
        "Shangrila",
        -0.1771,
        5.61709
      ]
    ]
  },
  {
    "id": "gtfs_7467938_68",
    "name": "Fadama Last stop ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Fan Milk Junction",
        -0.22269,
        5.57274
      ],
      [
        "Ashfoam",
        -0.22337,
        5.57882
      ],
      [
        "Ashfoam Junction",
        -0.22386,
        5.58238
      ],
      [
        "Access Bank",
        -0.22451,
        5.58424
      ],
      [
        "Melcom",
        -0.22673,
        5.58785
      ],
      [
        "Adodo",
        -0.23611,
        5.58868
      ],
      [
        "CMB Flats",
        -0.23739,
        5.5896
      ],
      [
        "Amankwah",
        -0.23844,
        5.58906
      ],
      [
        "Demod",
        -0.24063,
        5.58881
      ],
      [
        "Point 4",
        -0.24222,
        5.59275
      ],
      [
        "Point 4 (last stop)",
        -0.24253,
        5.59531
      ],
      [
        "Market",
        -0.24529,
        5.59586
      ],
      [
        "Musulley",
        -0.24534,
        5.59869
      ],
      [
        "School",
        -0.24733,
        5.59862
      ],
      [
        "New Fadama",
        -0.24801,
        5.60001
      ]
    ]
  },
  {
    "id": "gtfs_7479896_120",
    "name": "Pigfarm ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21423,
        5.57314
      ],
      [
        "Fidelity",
        -0.21207,
        5.57749
      ],
      [
        "Asantewaa",
        -0.21052,
        5.57957
      ],
      [
        "Mallam Atta",
        -0.20927,
        5.58125
      ],
      [
        "New town",
        -0.20865,
        5.5826
      ],
      [
        "College",
        -0.20834,
        5.5833
      ],
      [
        "Ghana Commercial Bank",
        -0.20805,
        5.58484
      ],
      [
        "Newtown Total",
        -0.2079,
        5.58557
      ],
      [
        "Accra New Town (37 Station)",
        -0.20766,
        5.58674
      ],
      [
        "Agbadinar",
        -0.20748,
        5.58791
      ],
      [
        "Master Chef",
        -0.20732,
        5.58907
      ],
      [
        "Five Five",
        -0.20724,
        5.58964
      ],
      [
        "Nkansah Gyan",
        -0.20649,
        5.59083
      ],
      [
        "Taxi Rank",
        -0.20546,
        5.59198
      ],
      [
        "Kotobabi Police Station",
        -0.20446,
        5.59207
      ],
      [
        "Vulcanizer",
        -0.20339,
        5.59326
      ],
      [
        "Abavana",
        -0.20274,
        5.59401
      ],
      [
        "Club 1000",
        -0.20051,
        5.59594
      ],
      [
        "Top Class",
        -0.19941,
        5.5965
      ],
      [
        "Pig Farm",
        -0.19832,
        5.59811
      ]
    ]
  },
  {
    "id": "gtfs_7548984_122",
    "name": "Manhean ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ],
      [
        "Gate",
        -0.21466,
        5.55261
      ],
      [
        "Graphic junction",
        -0.21429,
        5.55415
      ],
      [
        "Graphic",
        -0.2188,
        5.55553
      ],
      [
        "Fata",
        -0.22196,
        5.55702
      ],
      [
        "Rana motors",
        -0.22445,
        5.55852
      ],
      [
        "Mtn office / Kaneshie Roundabout",
        -0.22741,
        5.56029
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Market",
        -0.2343,
        5.56444
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ],
      [
        "Mallam Station",
        -0.23801,
        5.56667
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor (Main Bus stop)",
        -0.26369,
        5.58043
      ],
      [
        "Awoshie Vineyard",
        -0.27437,
        5.5845
      ],
      [
        "Awoshie Amangoase",
        -0.27783,
        5.58645
      ],
      [
        "Awoshie",
        -0.2789,
        5.58704
      ],
      [
        "Abrantie",
        -0.28187,
        5.58881
      ],
      [
        "Abrantie",
        -0.28187,
        5.58881
      ],
      [
        "Awoshie Onyinase",
        -0.28654,
        5.59155
      ],
      [
        "Awoshie Last stop",
        -0.28723,
        5.59194
      ],
      [
        "Calvary",
        -0.28857,
        5.59356
      ],
      [
        "Nii Bortey",
        -0.28964,
        5.5964
      ],
      [
        "Anyaa Market (Awoshie)",
        -0.29069,
        5.59912
      ],
      [
        "Anyaa School Junction",
        -0.29302,
        5.60288
      ],
      [
        "Anyaa",
        -0.29452,
        5.60508
      ],
      [
        "Academy",
        -0.29513,
        5.60596
      ],
      [
        "Anyah Last Stop",
        -0.29644,
        5.60781
      ],
      [
        "NIC",
        -0.29621,
        5.61371
      ],
      [
        "Nsunfa",
        -0.29427,
        5.61645
      ],
      [
        "CP",
        -0.29455,
        5.61872
      ],
      [
        "Block Factory",
        -0.29634,
        5.62035
      ],
      [
        "FanMilk Junction",
        -0.29923,
        5.6219
      ],
      [
        "Galilee",
        -0.30221,
        5.62349
      ],
      [
        "Pentecost Junction",
        -0.30674,
        5.62588
      ],
      [
        "Ablekuma Junction",
        -0.30874,
        5.62696
      ],
      [
        "Ablekuma",
        -0.31022,
        5.62724
      ],
      [
        "Ablekuma Park",
        -0.31354,
        5.62731
      ],
      [
        "Bokorbokor",
        -0.32014,
        5.62907
      ],
      [
        "Ablekuma CP",
        -0.32356,
        5.63169
      ],
      [
        "Ablekuma Block Factory",
        -0.32444,
        5.63227
      ],
      [
        "Point 5",
        -0.32634,
        5.63366
      ],
      [
        "Paradise",
        -0.32837,
        5.6353
      ],
      [
        "Mangoase",
        -0.33147,
        5.63772
      ],
      [
        "Waakye",
        -0.33227,
        5.63863
      ],
      [
        "Oduman",
        -0.33367,
        5.6399
      ],
      [
        "Twibleoo",
        -0.33656,
        5.64162
      ],
      [
        "Nuumo Tse",
        -0.33893,
        5.6421
      ],
      [
        "Alavanyo",
        -0.34135,
        5.64264
      ],
      [
        "Junction",
        -0.34486,
        5.64307
      ],
      [
        "Manhean",
        -0.34584,
        5.64226
      ]
    ]
  },
  {
    "id": "gtfs_7549788_124",
    "name": "Odorkor ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ],
      [
        "Gate",
        -0.21466,
        5.55261
      ],
      [
        "Graphic junction",
        -0.21429,
        5.55415
      ],
      [
        "Graphic",
        -0.2188,
        5.55553
      ],
      [
        "Fata",
        -0.22196,
        5.55702
      ],
      [
        "Rana motors",
        -0.22445,
        5.55852
      ],
      [
        "Mtn office / Kaneshie Roundabout",
        -0.22741,
        5.56029
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Market",
        -0.2343,
        5.56444
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ],
      [
        "Mallam Station",
        -0.23801,
        5.56667
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor",
        -0.26391,
        5.58119
      ]
    ]
  },
  {
    "id": "gtfs_7442241_126",
    "name": "Teshie Nungua ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "Abelenkpe Junction",
        -0.21152,
        5.61025
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Pig Farm Junction",
        -0.19595,
        5.59989
      ],
      [
        "Accra Girls",
        -0.19347,
        5.59824
      ],
      [
        "Kankudi",
        -0.18852,
        5.59477
      ],
      [
        "Culture",
        -0.18524,
        5.5933
      ],
      [
        "37 First Gate",
        -0.1829,
        5.59027
      ],
      [
        "37 Last Stop",
        -0.18031,
        5.58858
      ],
      [
        "Giffard Road",
        -0.17464,
        5.58736
      ],
      [
        "Home Touch",
        -0.16815,
        5.58713
      ],
      [
        "Villas",
        -0.15438,
        5.57825
      ],
      [
        "Palm Wine",
        -0.15254,
        5.57647
      ],
      [
        "Kpogas",
        -0.15021,
        5.57312
      ],
      [
        "Trade Fair",
        -0.14743,
        5.56916
      ],
      [
        "La Beach Hotel",
        -0.13877,
        5.56431
      ],
      [
        "Kofi Annan",
        -0.1126,
        5.57385
      ],
      [
        "First Junction",
        -0.09943,
        5.58749
      ],
      [
        "Brigade",
        -0.089,
        5.59379
      ],
      [
        "Cold Store",
        -0.08565,
        5.59582
      ],
      [
        "Nungua",
        -0.07911,
        5.60223
      ]
    ]
  },
  {
    "id": "gtfs_7549831_128",
    "name": "Omanjor ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ],
      [
        "Graphic junction",
        -0.21429,
        5.55415
      ],
      [
        "Graphic",
        -0.2188,
        5.55553
      ],
      [
        "Fata",
        -0.22196,
        5.55702
      ],
      [
        "Rana motors",
        -0.22445,
        5.55852
      ],
      [
        "Mtn office / Kaneshie Roundabout",
        -0.22741,
        5.56029
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Market",
        -0.2343,
        5.56444
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ],
      [
        "Mallam Station",
        -0.23801,
        5.56667
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor",
        -0.26242,
        5.5807
      ],
      [
        "Odorkor Station",
        -0.26377,
        5.58188
      ],
      [
        "Odorkor Market",
        -0.26413,
        5.58296
      ],
      [
        "Off town junction",
        -0.26478,
        5.58506
      ],
      [
        "School junction",
        -0.26536,
        5.5868
      ],
      [
        "Kwashieman School Junction",
        -0.26701,
        5.58967
      ],
      [
        "Kwashieman Junction",
        -0.26788,
        5.59119
      ],
      [
        "Goil",
        -0.26896,
        5.59359
      ],
      [
        "Christ Mission",
        -0.26961,
        5.59442
      ],
      [
        "Jah Love",
        -0.27066,
        5.59638
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27208,
        5.59859
      ],
      [
        "Family Friend",
        -0.27323,
        5.60036
      ],
      [
        "Video Junction",
        -0.2738,
        5.60139
      ],
      [
        "Drug Store",
        -0.27477,
        5.60297
      ],
      [
        "Santa Maria",
        -0.27568,
        5.60577
      ],
      [
        "Assiamah",
        -0.27435,
        5.607
      ],
      [
        "Auntie Aku",
        -0.2746,
        5.60824
      ],
      [
        "Ebenezer",
        -0.27479,
        5.60916
      ],
      [
        "Polo",
        -0.27503,
        5.61056
      ],
      [
        "Africa",
        -0.27542,
        5.61274
      ],
      [
        "Rescue point",
        -0.27559,
        5.6137
      ],
      [
        "Dega",
        -0.2759,
        5.61532
      ],
      [
        "Chop Bar",
        -0.27614,
        5.6166
      ],
      [
        "Market",
        -0.2769,
        5.62056
      ],
      [
        "Vulcanizer",
        -0.27888,
        5.62289
      ],
      [
        "Printing press",
        -0.27961,
        5.62363
      ],
      [
        "Sowutuom",
        -0.28344,
        5.62484
      ],
      [
        "Ga Central Assembly",
        -0.28453,
        5.62529
      ],
      [
        "Mambo",
        -0.28535,
        5.6308
      ],
      [
        "Mensah Addo",
        -0.2839,
        5.6334
      ],
      [
        "Mensah Addo Transfomer",
        -0.28739,
        5.63363
      ],
      [
        "Curve Omanjor",
        -0.2888,
        5.63383
      ],
      [
        "Junction",
        -0.29062,
        5.63595
      ],
      [
        "Old Station",
        -0.29259,
        5.63633
      ],
      [
        "Transformer (Omanjor)",
        -0.29383,
        5.63686
      ],
      [
        "School Junction (Omanjor)",
        -0.29599,
        5.63775
      ],
      [
        "Omanjor New Station",
        -0.29653,
        5.63865
      ]
    ]
  },
  {
    "id": "gtfs_7574385_414",
    "name": "Opetekwei ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Times",
        -0.22185,
        5.56979
      ],
      [
        "School Junction",
        -0.2288,
        5.56769
      ],
      [
        "Accra Wesley Girls School Junction",
        -0.23039,
        5.56711
      ],
      [
        "Social Welfare",
        -0.23433,
        5.56881
      ],
      [
        "Kaneshie Market junction",
        -0.23491,
        5.56829
      ],
      [
        "First Light",
        -0.24386,
        5.56626
      ],
      [
        "JT",
        -0.24535,
        5.56474
      ],
      [
        "Peace Clinic",
        -0.24738,
        5.56594
      ],
      [
        "Mataheko Police Quarters",
        -0.24983,
        5.56745
      ],
      [
        "Mataheko Pharmacy",
        -0.25135,
        5.56847
      ],
      [
        "1 plus 1",
        -0.25361,
        5.57
      ],
      [
        "Dansoman Asoredanho",
        -0.25536,
        5.5704
      ],
      [
        "Asoredanho Curve",
        -0.25763,
        5.56758
      ],
      [
        "Wesley Grammar",
        -0.25851,
        5.56659
      ],
      [
        "Akukofoto",
        -0.26001,
        5.56439
      ],
      [
        "Abomatte",
        -0.26022,
        5.56317
      ],
      [
        "Dansoman Polyclinic",
        -0.26023,
        5.56129
      ],
      [
        "Dansoman First Stop",
        -0.26044,
        5.56044
      ],
      [
        "Zodiac",
        -0.26228,
        5.56016
      ],
      [
        "Dansoman Roundabout",
        -0.26485,
        5.55728
      ],
      [
        "King Solomon",
        -0.2646,
        5.55525
      ],
      [
        "Mamas Inn",
        -0.2646,
        5.55441
      ],
      [
        "Beecham",
        -0.26462,
        5.5521
      ],
      [
        "Sahara",
        -0.26465,
        5.54981
      ],
      [
        "Emmanuel Presby",
        -0.26463,
        5.5484
      ],
      [
        "Dansoman Control",
        -0.26465,
        5.54629
      ],
      [
        "Dansoman Police Station",
        -0.2647,
        5.54403
      ],
      [
        "Dansoman Market",
        -0.26475,
        5.54151
      ],
      [
        "Exhibition (Dansoman)",
        -0.26489,
        5.53799
      ],
      [
        "Seven Great",
        -0.26517,
        5.53567
      ],
      [
        "Kofi ne Ama",
        -0.26531,
        5.53305
      ],
      [
        "Dansoman Last Stop",
        -0.26531,
        5.5297
      ],
      [
        "Agege",
        -0.26469,
        5.529
      ],
      [
        "Atomic",
        -0.266,
        5.52764
      ],
      [
        "Curve",
        -0.26772,
        5.52785
      ],
      [
        "Point 6",
        -0.26838,
        5.52828
      ],
      [
        "Ebenezer",
        -0.26984,
        5.52951
      ],
      [
        "Academy",
        -0.27119,
        5.52916
      ],
      [
        "Opetekwei",
        -0.27365,
        5.52766
      ]
    ]
  },
  {
    "id": "gtfs_7461641_416",
    "name": "Opetekwei ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "Tema Station Union of GPRTU",
        -0.20075,
        5.5487
      ],
      [
        "Court",
        -0.20435,
        5.54444
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Korle Bu",
        -0.22705,
        5.53612
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Rainbow",
        -0.24084,
        5.53425
      ],
      [
        "Mamprobi Methodist",
        -0.24382,
        5.53511
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24626,
        5.53563
      ],
      [
        "IBE",
        -0.24779,
        5.53906
      ],
      [
        "Abodoo Bridge",
        -0.25158,
        5.54003
      ],
      [
        "Banana Inn",
        -0.25488,
        5.54165
      ],
      [
        "Mr Mensah",
        -0.26149,
        5.53902
      ],
      [
        "Exhibition",
        -0.26425,
        5.5374
      ],
      [
        "Seven Great",
        -0.26517,
        5.53567
      ],
      [
        "Kofi ne Ama",
        -0.26531,
        5.53305
      ],
      [
        "Opetekwei",
        -0.27365,
        5.52766
      ]
    ]
  },
  {
    "id": "gtfs_7579940_410",
    "name": "Okponglo ↔ Christian Centre",
    "color": "#1779c2",
    "stops": [
      [
        "Christian Centre",
        -0.15024,
        5.63841
      ],
      [
        "A&C Mall",
        -0.15164,
        5.64208
      ],
      [
        "American House",
        -0.14967,
        5.64704
      ],
      [
        "Bridge",
        -0.155,
        5.64632
      ],
      [
        "Bawaleshie Acheampong",
        -0.15992,
        5.64296
      ],
      [
        "Beduwa",
        -0.16117,
        5.64252
      ],
      [
        "Bawaleshie First",
        -0.16485,
        5.64217
      ],
      [
        "Bawaleshi Second",
        -0.16732,
        5.64187
      ],
      [
        "Bawaleshie Traffic Light",
        -0.16923,
        5.64166
      ],
      [
        "Okponglo",
        -0.17639,
        5.64094
      ]
    ]
  },
  {
    "id": "gtfs_7586572_412",
    "name": "Agbogbloshie ↔ Opetekwei",
    "color": "#1779c2",
    "stops": [
      [
        "Opetekwei",
        -0.27365,
        5.52766
      ],
      [
        "Ebenezer",
        -0.26992,
        5.52951
      ],
      [
        "Point 6",
        -0.26735,
        5.52755
      ],
      [
        "Atomic",
        -0.26646,
        5.52722
      ],
      [
        "Last stop",
        -0.26512,
        5.52824
      ],
      [
        "Agege Last Stop",
        -0.26418,
        5.52913
      ],
      [
        "Karikari",
        -0.26123,
        5.53105
      ],
      [
        "Zone 6",
        -0.25771,
        5.53137
      ],
      [
        "Agege",
        -0.25519,
        5.53172
      ],
      [
        "205",
        -0.25357,
        5.53196
      ],
      [
        "Lotto House",
        -0.25087,
        5.53239
      ],
      [
        "USA",
        -0.24794,
        5.53225
      ],
      [
        "Bamboi",
        -0.24623,
        5.53278
      ],
      [
        "Methodist",
        -0.24474,
        5.5344
      ],
      [
        "Methodist",
        -0.24431,
        5.53493
      ],
      [
        "Mamprobi Methodist",
        -0.24386,
        5.53506
      ],
      [
        "Abodwe",
        -0.24232,
        5.53464
      ],
      [
        "Rainbow",
        -0.24006,
        5.53398
      ],
      [
        "Mamprobi Shell",
        -0.23804,
        5.53365
      ],
      [
        "Mamprobi Post Office",
        -0.23705,
        5.53384
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Electricity",
        -0.23342,
        5.53464
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Boxing Arena",
        -0.22062,
        5.53734
      ],
      [
        "UTC",
        -0.21797,
        5.53793
      ],
      [
        "Agbado",
        -0.21586,
        5.53861
      ],
      [
        "Palledium",
        -0.21544,
        5.5416
      ],
      [
        "Timber Market",
        -0.21614,
        5.54341
      ],
      [
        "Arena",
        -0.21667,
        5.54496
      ],
      [
        "Galloway",
        -0.21773,
        5.54778
      ],
      [
        "Agbobloshie Market",
        -0.22018,
        5.55036
      ],
      [
        "Agbogbloshie",
        -0.21984,
        5.55169
      ]
    ]
  },
  {
    "id": "gtfs_7418141_498",
    "name": "Sakumono Estate ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Flower Pot",
        -0.15256,
        5.62679
      ],
      [
        "Energy",
        -0.14304,
        5.63085
      ],
      [
        "Second",
        -0.14123,
        5.63162
      ],
      [
        "Cylinder",
        -0.13285,
        5.63505
      ],
      [
        "Zain Office",
        -0.12953,
        5.6364
      ],
      [
        "Manet",
        -0.12642,
        5.63766
      ],
      [
        "Lion",
        -0.12327,
        5.6389
      ],
      [
        "Printex",
        -0.11945,
        5.64044
      ],
      [
        "Herbalife",
        -0.11748,
        5.64123
      ],
      [
        "Blue Gate",
        -0.11466,
        5.64235
      ],
      [
        "Junction Wise",
        -0.11277,
        5.64314
      ],
      [
        "Coke",
        -0.11081,
        5.64319
      ],
      [
        "Shell",
        -0.10759,
        5.64025
      ],
      [
        "Shell Signboard",
        -0.1045,
        5.63742
      ],
      [
        "Costal",
        -0.10042,
        5.63496
      ],
      [
        "Bedford",
        -0.09867,
        5.63409
      ],
      [
        "First Choice",
        -0.09704,
        5.63327
      ],
      [
        "Rainbow",
        -0.09572,
        5.6325
      ],
      [
        "Basket",
        -0.09236,
        5.63015
      ],
      [
        "Kotobaabi",
        -0.08978,
        5.62869
      ],
      [
        "Total",
        -0.08711,
        5.62766
      ],
      [
        "White House",
        -0.08551,
        5.627
      ],
      [
        "Victory Signboard",
        -0.08261,
        5.626
      ],
      [
        "Texpo",
        -0.0793,
        5.62546
      ],
      [
        "18 Junction",
        -0.07593,
        5.62485
      ],
      [
        "Parakuo",
        -0.07319,
        5.62334
      ],
      [
        "Traffic",
        -0.07106,
        5.6217
      ],
      [
        "Sakumono",
        -0.06941,
        5.62262
      ]
    ]
  },
  {
    "id": "gtfs_7605813_418",
    "name": "Orgle Street ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ],
      [
        "Kaneshie Market bus stop",
        -0.2356,
        5.56658
      ],
      [
        "Cocoa Clinic",
        -0.23663,
        5.57139
      ],
      [
        "First junction",
        -0.23556,
        5.57241
      ],
      [
        "Five Five",
        -0.23569,
        5.57281
      ],
      [
        "Presby junction",
        -0.23613,
        5.57415
      ],
      [
        "A.M.A",
        -0.23629,
        5.57548
      ],
      [
        "Council",
        -0.23637,
        5.57617
      ],
      [
        "Tsofi",
        -0.23468,
        5.5786
      ],
      [
        "Sakora",
        -0.2341,
        5.57908
      ],
      [
        "Mangoase",
        -0.23468,
        5.58029
      ],
      [
        "Been to",
        -0.23546,
        5.58142
      ],
      [
        "St. Johns",
        -0.23506,
        5.58229
      ],
      [
        "Awonye",
        -0.23633,
        5.58268
      ],
      [
        "Good Shepherd",
        -0.23632,
        5.58388
      ],
      [
        "Peps",
        -0.2363,
        5.58406
      ],
      [
        "Orgle Street",
        -0.2363,
        5.58505
      ]
    ]
  },
  {
    "id": "gtfs_7584515_313",
    "name": "Pigfarm ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Pig Farm Station",
        -0.19844,
        5.59828
      ],
      [
        "Kotobabi Down",
        -0.19888,
        5.59741
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Commercial Bank",
        -0.20793,
        5.58532
      ],
      [
        "College",
        -0.2069,
        5.58327
      ],
      [
        "Nima Roundabout",
        -0.20086,
        5.57748
      ],
      [
        "Nima School Junction",
        -0.20083,
        5.57628
      ],
      [
        "Kanda Overhead",
        -0.19834,
        5.57472
      ],
      [
        "Sunny FM",
        -0.20007,
        5.57033
      ],
      [
        "Accra High School",
        -0.2009,
        5.56885
      ],
      [
        "Second Gate",
        -0.20211,
        5.56487
      ],
      [
        "Ridge",
        -0.20168,
        5.56356
      ],
      [
        "Mental",
        -0.20457,
        5.56263
      ],
      [
        "Museum",
        -0.20612,
        5.56119
      ],
      [
        "Tigo Office",
        -0.20573,
        5.5576
      ],
      [
        "Accra Technical University",
        -0.2054,
        5.55541
      ],
      [
        "Novotel",
        -0.2048,
        5.55397
      ],
      [
        "Kinbu",
        -0.20419,
        5.55128
      ],
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7502383_311",
    "name": "Dzorwulu ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Dzorwolu",
        -0.19588,
        5.61647
      ],
      [
        "Special Ice",
        -0.19779,
        5.61228
      ],
      [
        "Last Chance",
        -0.19896,
        5.61156
      ],
      [
        "Vulcanizer",
        -0.20069,
        5.61177
      ],
      [
        "Sea Theatre",
        -0.20355,
        5.61149
      ],
      [
        "Fidelity",
        -0.20451,
        5.61061
      ],
      [
        "Dzorwulu Junction",
        -0.20672,
        5.60843
      ],
      [
        "Ebony",
        -0.20315,
        5.60226
      ],
      [
        "Asore Junction",
        -0.20224,
        5.60168
      ],
      [
        "Pig Farm Station",
        -0.19844,
        5.59828
      ],
      [
        "Kotobabi Down",
        -0.19888,
        5.59741
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Nima Junction",
        -0.20858,
        5.58237
      ],
      [
        "Mallam Atta",
        -0.20905,
        5.58166
      ],
      [
        "Asantewaa",
        -0.2105,
        5.57969
      ],
      [
        "School Junction",
        -0.21107,
        5.579
      ],
      [
        "Pro credit",
        -0.21152,
        5.57839
      ],
      [
        "Express",
        -0.21268,
        5.57677
      ],
      [
        "Quarters",
        -0.21405,
        5.57497
      ],
      [
        "City Lights",
        -0.21447,
        5.57436
      ],
      [
        "Circle",
        -0.21585,
        5.57302
      ],
      [
        "Vodafone",
        -0.21614,
        5.57186
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "PTC",
        -0.21515,
        5.56776
      ],
      [
        "Dance Bar",
        -0.2147,
        5.56604
      ],
      [
        "Adabraka",
        -0.2144,
        5.5649
      ],
      [
        "Adabraka Market",
        -0.21392,
        5.5631
      ],
      [
        "Roxy Cinema",
        -0.21244,
        5.55777
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra New Tema Station",
        -0.20105,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7481516_317",
    "name": "Awoshie ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Awoshie",
        -0.27948,
        5.58698
      ],
      [
        "Been To",
        -0.27151,
        5.5873
      ],
      [
        "Kwashieman",
        -0.26986,
        5.58939
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Abeka Lapaz",
        -0.24907,
        5.60641
      ]
    ]
  },
  {
    "id": "gtfs_7584600_315",
    "name": "Ashongman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Ashongman",
        -0.21044,
        5.70331
      ],
      [
        "Bridge (Ashongman last stop)",
        -0.20724,
        5.70076
      ],
      [
        "Islamic",
        -0.2049,
        5.69815
      ],
      [
        "Agbogba",
        -0.19789,
        5.69117
      ],
      [
        "Gods way",
        -0.19461,
        5.68734
      ],
      [
        "Pawpaw",
        -0.19427,
        5.68583
      ],
      [
        "ECOMOG",
        -0.20188,
        5.68057
      ],
      [
        "Afari Gyan",
        -0.20207,
        5.67984
      ],
      [
        "Sam J",
        -0.20283,
        5.67734
      ],
      [
        "Manmay",
        -0.20319,
        5.67613
      ],
      [
        "Block Factory",
        -0.20448,
        5.67221
      ],
      [
        "Haatso",
        -0.20476,
        5.66736
      ],
      [
        "Barclays",
        -0.20472,
        5.66562
      ],
      [
        "Barrier",
        -0.20527,
        5.66219
      ],
      [
        "Post Box",
        -0.20554,
        5.66162
      ],
      [
        "Pharmarcy",
        -0.20604,
        5.66063
      ],
      [
        "Flower pot",
        -0.2069,
        5.6589
      ],
      [
        "Clinic/ police container",
        -0.20771,
        5.65717
      ],
      [
        "Brainy School Junction",
        -0.20839,
        5.65486
      ],
      [
        "Communication",
        -0.20862,
        5.65421
      ],
      [
        "Sign board",
        -0.20934,
        5.65211
      ],
      [
        "Westlands junction",
        -0.20991,
        5.65008
      ],
      [
        "Kwashieman Junction",
        -0.21012,
        5.64931
      ],
      [
        "Blue Kiosk",
        -0.21052,
        5.64728
      ],
      [
        "Bridge",
        -0.21056,
        5.64514
      ],
      [
        "1st curve",
        -0.20996,
        5.64267
      ],
      [
        "2nd curve",
        -0.21093,
        5.64192
      ],
      [
        "Gimpa Junction",
        -0.20942,
        5.63897
      ],
      [
        "Airways Junction",
        -0.21064,
        5.6383
      ],
      [
        "Pure Fire",
        -0.21132,
        5.63812
      ],
      [
        "Kisseman Junction",
        -0.21295,
        5.63761
      ],
      [
        "Christian Village Jucntion",
        -0.21493,
        5.63515
      ],
      [
        "Polo",
        -0.21798,
        5.6319
      ],
      [
        "Golf Park",
        -0.21896,
        5.63089
      ],
      [
        "Achimota Hospital Curve",
        -0.22025,
        5.62929
      ],
      [
        "Achimota Hospital",
        -0.21883,
        5.62705
      ],
      [
        "PWD",
        -0.21882,
        5.62446
      ],
      [
        "Achimota Club House",
        -0.21919,
        5.62289
      ],
      [
        "Achimota Forest",
        -0.21857,
        5.62076
      ],
      [
        "Forestry",
        -0.21595,
        5.61733
      ],
      [
        "CP",
        -0.21402,
        5.61576
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Lapaz Market",
        -0.24051,
        5.60902
      ],
      [
        "Bambolino",
        -0.24237,
        5.60871
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ],
      [
        "Abeka Lapaz",
        -0.2465,
        5.60798
      ]
    ]
  },
  {
    "id": "gtfs_7451505_496",
    "name": "Six to Six Market ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "High Tension",
        -0.24833,
        5.61603
      ],
      [
        "Fishpond",
        -0.24991,
        5.61856
      ],
      [
        "St. Anthony School",
        -0.25008,
        5.6194
      ]
    ]
  },
  {
    "id": "gtfs_7594861_368",
    "name": "Nima Station ↔ Agbogbloshie",
    "color": "#1779c2",
    "stops": [
      [
        "Agbogbloshie",
        -0.21984,
        5.55169
      ],
      [
        "Cold store",
        -0.22221,
        5.55695
      ],
      [
        "Graphic",
        -0.2197,
        5.55551
      ],
      [
        "Circle",
        -0.21181,
        5.56644
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Kanda",
        -0.20183,
        5.57285
      ],
      [
        "Nima Police Station",
        -0.20072,
        5.5744
      ],
      [
        "Frankies Hotel Junction",
        -0.19868,
        5.57767
      ],
      [
        "School Junction Nima",
        -0.19867,
        5.57803
      ],
      [
        "Nima Mamobi",
        -0.19778,
        5.58008
      ],
      [
        "Curve",
        -0.19718,
        5.58152
      ],
      [
        "Nima Station",
        -0.19824,
        5.58197
      ],
      [
        "Borla",
        -0.19783,
        5.58373
      ],
      [
        "Alaska",
        -0.19713,
        5.58625
      ],
      [
        "Frytol",
        -0.19687,
        5.58716
      ],
      [
        "Gutter",
        -0.1966,
        5.58816
      ]
    ]
  },
  {
    "id": "gtfs_7467291_366",
    "name": "Sukura Station ↔ Nima Overhead",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station",
        -0.19875,
        5.58151
      ],
      [
        "Nima Market",
        -0.1995,
        5.58012
      ],
      [
        "Nima Roundabout",
        -0.20086,
        5.57748
      ],
      [
        "Nima Police Station",
        -0.20079,
        5.57421
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Roundabout",
        -0.22858,
        5.56259
      ],
      [
        "Abossey Okai",
        -0.22992,
        5.56048
      ],
      [
        "Total",
        -0.23051,
        5.55947
      ],
      [
        "Happy Days",
        -0.23238,
        5.55569
      ],
      [
        "Laskia",
        -0.23557,
        5.55639
      ],
      [
        "Great Lamptey",
        -0.2372,
        5.55678
      ],
      [
        "Zongo Junction",
        -0.24077,
        5.55759
      ],
      [
        "Club Corner",
        -0.24348,
        5.55822
      ],
      [
        "Flamingo",
        -0.24651,
        5.55804
      ],
      [
        "Banku Junction",
        -0.24755,
        5.55378
      ],
      [
        "Borla Junction",
        -0.24762,
        5.55093
      ],
      [
        "Sukura",
        -0.24929,
        5.55062
      ]
    ]
  },
  {
    "id": "gtfs_7456493_364",
    "name": "Asofan ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ],
      [
        "High Tension",
        -0.24833,
        5.61603
      ],
      [
        "Fishpond",
        -0.24991,
        5.61856
      ],
      [
        "St. Anthony School",
        -0.25008,
        5.6194
      ],
      [
        "Family Life",
        -0.24845,
        5.6224
      ],
      [
        "Pharmacy",
        -0.24903,
        5.62392
      ],
      [
        "Mile 7 T-Junction",
        -0.2506,
        5.6264
      ],
      [
        "Roman",
        -0.25083,
        5.63418
      ],
      [
        "Tantra Resevoir",
        -0.25066,
        5.64158
      ],
      [
        "Nii Ayi Kushie Street",
        -0.2498,
        5.64224
      ],
      [
        "Champion",
        -0.24935,
        5.64259
      ],
      [
        "Tantra Hills",
        -0.24727,
        5.64606
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "Spot M",
        -0.25971,
        5.65412
      ],
      [
        "Income Tax",
        -0.2631,
        5.65644
      ],
      [
        "Ofankor Barrier",
        -0.26479,
        5.65761
      ],
      [
        "Ofankor Taxi Rank",
        -0.26696,
        5.65817
      ],
      [
        "Assemblies",
        -0.27223,
        5.6589
      ],
      [
        "Market",
        -0.27535,
        5.65841
      ],
      [
        "1st Power",
        -0.27668,
        5.65812
      ],
      [
        "2nd Power",
        -0.27809,
        5.65786
      ],
      [
        "Soldier Line",
        -0.27957,
        5.65745
      ],
      [
        "Abodwe Se",
        -0.28173,
        5.65657
      ],
      [
        "Presby",
        -0.28363,
        5.65494
      ],
      [
        "Asofan School Juntion",
        -0.28488,
        5.6544
      ],
      [
        "Asofan Old Station",
        -0.2861,
        5.65399
      ],
      [
        "Jojo Water",
        -0.28506,
        5.65113
      ],
      [
        "Chairman",
        -0.28603,
        5.64927
      ],
      [
        "Asofan Block Factory",
        -0.28685,
        5.64735
      ],
      [
        "Transformer",
        -0.28896,
        5.64707
      ],
      [
        "Curve",
        -0.29013,
        5.64703
      ],
      [
        "Pentecost Station",
        -0.29023,
        5.64617
      ],
      [
        "Abe Asi",
        -0.29085,
        5.64524
      ],
      [
        "Royco",
        -0.29261,
        5.64388
      ],
      [
        "Asofan New Station",
        -0.29351,
        5.64348
      ]
    ]
  },
  {
    "id": "gtfs_7594749_362",
    "name": "Pokuase Amasaman ↔ Nima Overhead",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station",
        -0.19865,
        5.58147
      ],
      [
        "Alaska",
        -0.19713,
        5.58625
      ],
      [
        "Gutter",
        -0.1966,
        5.58816
      ],
      [
        "Mawarko",
        -0.19578,
        5.59092
      ],
      [
        "Maamobi",
        -0.1954,
        5.59211
      ],
      [
        "Mamobi Market",
        -0.19479,
        5.59389
      ],
      [
        "Nima Overhead",
        -0.19463,
        5.59424
      ],
      [
        "Konka",
        -0.19485,
        5.59667
      ],
      [
        "Konka Curve",
        -0.19378,
        5.59568
      ],
      [
        "Accra Girls",
        -0.19392,
        5.59815
      ],
      [
        "Pig Farm Junction",
        -0.19754,
        5.60123
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Abelenkpe Junction",
        -0.21092,
        5.60993
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Achimota Old Station",
        -0.2294,
        5.61639
      ],
      [
        "Neoplan",
        -0.23295,
        5.62409
      ],
      [
        "ABC Junction",
        -0.23629,
        5.62918
      ],
      [
        "Mile 7",
        -0.23967,
        5.63445
      ],
      [
        "Best Point",
        -0.2402,
        5.63532
      ],
      [
        "Achimota Mall",
        -0.24147,
        5.63737
      ],
      [
        "St. Johns",
        -0.24243,
        5.63885
      ],
      [
        "St Johns Second",
        -0.24413,
        5.64151
      ],
      [
        "Tantra Hills",
        -0.24727,
        5.64606
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "Spot M",
        -0.25971,
        5.65412
      ],
      [
        "Income Tax",
        -0.2631,
        5.65644
      ],
      [
        "Ofankor Barrier",
        -0.26479,
        5.65761
      ],
      [
        "John Teye",
        -0.27042,
        5.66733
      ],
      [
        "Agya Herbal",
        -0.27173,
        5.67265
      ],
      [
        "ACP Junction",
        -0.27726,
        5.68409
      ],
      [
        "Pokuase Junction",
        -0.28199,
        5.68779
      ],
      [
        "Festus",
        -0.28858,
        5.69311
      ],
      [
        "Fusi Junction",
        -0.29195,
        5.69838
      ],
      [
        "Amasaman",
        -0.29761,
        5.70493
      ]
    ]
  },
  {
    "id": "gtfs_7585974_360",
    "name": "Nima Overhead ↔ Mallam",
    "color": "#1779c2",
    "stops": [
      [
        "Mallam Station",
        -0.29002,
        5.57524
      ],
      [
        "Abase Mallam",
        -0.28751,
        5.57434
      ],
      [
        "Masalaachi Mallam",
        -0.28705,
        5.57325
      ],
      [
        "Mallam Junction",
        -0.28543,
        5.57083
      ],
      [
        "Water Works",
        -0.27782,
        5.57955
      ],
      [
        "Vineyard",
        -0.27552,
        5.58219
      ],
      [
        "Awoshie",
        -0.27345,
        5.58476
      ],
      [
        "Been To",
        -0.27151,
        5.5873
      ],
      [
        "Kwashieman",
        -0.26986,
        5.58939
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Abeka Lapaz",
        -0.24907,
        5.60641
      ],
      [
        "Abeka Lapaz (Nii Boi)",
        -0.24524,
        5.60774
      ],
      [
        "Bambolino",
        -0.24254,
        5.60826
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "Abelemkpe Junction",
        -0.21023,
        5.60925
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Pig Farm Junction",
        -0.19595,
        5.59989
      ],
      [
        "Accra Girls",
        -0.19404,
        5.59819
      ],
      [
        "Konka",
        -0.19496,
        5.59663
      ],
      [
        "Konka Curve",
        -0.19384,
        5.59573
      ],
      [
        "Nima Overhead",
        -0.19474,
        5.59412
      ],
      [
        "Mamobi Market",
        -0.19486,
        5.59391
      ],
      [
        "Maamobi",
        -0.19545,
        5.59221
      ],
      [
        "Mawarko",
        -0.19584,
        5.59098
      ],
      [
        "Gutter",
        -0.19659,
        5.5885
      ],
      [
        "Alaska (Nima Maamobi)",
        -0.19725,
        5.58614
      ],
      [
        "Borla",
        -0.1979,
        5.58386
      ],
      [
        "Traffic",
        -0.19825,
        5.58264
      ],
      [
        "Nima Station",
        -0.19843,
        5.58204
      ]
    ]
  },
  {
    "id": "gtfs_7432164_380",
    "name": "Kotobabi Down ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "Tigo Office",
        -0.20557,
        5.55819
      ],
      [
        "Cathedral",
        -0.20615,
        5.56357
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Nima Police Station",
        -0.20072,
        5.5744
      ],
      [
        "Commandos",
        -0.20459,
        5.58031
      ],
      [
        "College",
        -0.20681,
        5.58349
      ],
      [
        "Commercial Bank",
        -0.20632,
        5.58537
      ],
      [
        "Curve",
        -0.20605,
        5.5865
      ],
      [
        "37 Station",
        -0.20752,
        5.58699
      ],
      [
        "Five Five",
        -0.20724,
        5.58964
      ],
      [
        "Nkansah Gyan",
        -0.20649,
        5.59083
      ],
      [
        "Taxi Rank",
        -0.20546,
        5.59198
      ],
      [
        "Tobinco Junction",
        -0.20629,
        5.59332
      ],
      [
        "Kotobabi Down",
        -0.2094,
        5.59568
      ]
    ]
  },
  {
    "id": "gtfs_7432489_382",
    "name": "Madina/Adenta ↔ Circle Odorna",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21327,
        5.56961
      ],
      [
        "Spanner",
        -0.17613,
        5.62042
      ],
      [
        "Shiashie",
        -0.17644,
        5.62768
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon Second",
        -0.17999,
        5.65188
      ],
      [
        "UPS",
        -0.17824,
        5.6607
      ],
      [
        "Presec",
        -0.17783,
        5.66255
      ],
      [
        "Atomic First",
        -0.17706,
        5.66624
      ],
      [
        "Atomic Second",
        -0.17663,
        5.66798
      ],
      [
        "Fire Stone",
        -0.17511,
        5.6713
      ],
      [
        "Madina Zongo Junction",
        -0.17378,
        5.67536
      ],
      [
        "Madina",
        -0.17164,
        5.67668
      ]
    ]
  },
  {
    "id": "gtfs_7463528_384",
    "name": "Odorna ↔ Nima Mamobi",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Overhead",
        -0.19463,
        5.59424
      ],
      [
        "Maamobi",
        -0.19545,
        5.59221
      ],
      [
        "Mawarko",
        -0.19584,
        5.59098
      ],
      [
        "Gutter",
        -0.19659,
        5.5885
      ],
      [
        "Traffic",
        -0.19825,
        5.58264
      ],
      [
        "Nima Roundabout",
        -0.20086,
        5.57748
      ],
      [
        "Nima Police Station",
        -0.20079,
        5.57421
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle",
        -0.21329,
        5.57067
      ]
    ]
  },
  {
    "id": "gtfs_7605661_386",
    "name": "Odorna ↔ Nungua",
    "color": "#1779c2",
    "stops": [
      [
        "Nungua",
        -0.07967,
        5.60177
      ],
      [
        "Bank",
        -0.08039,
        5.60016
      ],
      [
        "Nungua Market",
        -0.08052,
        5.59992
      ],
      [
        "C5",
        -0.08151,
        5.59848
      ],
      [
        "Cold Store",
        -0.08554,
        5.59599
      ],
      [
        "Brigade",
        -0.08933,
        5.59373
      ],
      [
        "A-life",
        -0.09362,
        5.59109
      ],
      [
        "First Junction",
        -0.09781,
        5.58854
      ],
      [
        "Abotsi Anya",
        -0.1025,
        5.58507
      ],
      [
        "Mobil",
        -0.10564,
        5.58226
      ],
      [
        "Addoemi",
        -0.10784,
        5.58032
      ],
      [
        "Laskala",
        -0.10939,
        5.57896
      ],
      [
        "Police Station",
        -0.11107,
        5.57655
      ],
      [
        "Kofi Annan",
        -0.11438,
        5.5729
      ],
      [
        "Next Door",
        -0.11689,
        5.5714
      ],
      [
        "First Gate",
        -0.12373,
        5.56886
      ],
      [
        "Second Gate",
        -0.12824,
        5.56768
      ],
      [
        "Bush Road",
        -0.13126,
        5.56687
      ],
      [
        "Gas",
        -0.13787,
        5.56485
      ],
      [
        "Total",
        -0.14122,
        5.56412
      ],
      [
        "T-Junction",
        -0.14281,
        5.56374
      ],
      [
        "Regimanuel",
        -0.14515,
        5.56249
      ],
      [
        "Alonte Bar",
        -0.1492,
        5.55982
      ],
      [
        "Dreamland",
        -0.15101,
        5.55911
      ],
      [
        "Court",
        -0.15541,
        5.55749
      ],
      [
        "Olympia",
        -0.15857,
        5.55811
      ],
      [
        "Sergeant Adjettey",
        -0.16113,
        5.5586
      ],
      [
        "Polyclinic",
        -0.16468,
        5.55742
      ],
      [
        "Veterinary",
        -0.16708,
        5.55684
      ],
      [
        "Barracks",
        -0.16845,
        5.55945
      ],
      [
        "Labone",
        -0.17356,
        5.56299
      ],
      [
        "Bridge",
        -0.17714,
        5.56497
      ],
      [
        "Danquah First",
        -0.17976,
        5.56643
      ],
      [
        "Danquah Second",
        -0.18172,
        5.56751
      ],
      [
        "Fire Service",
        -0.18464,
        5.56913
      ],
      [
        "Police Headquarters",
        -0.18841,
        5.57127
      ],
      [
        "Sankara",
        -0.19122,
        5.5728
      ],
      [
        "GBC",
        -0.19267,
        5.5735
      ],
      [
        "Mobil",
        -0.19752,
        5.57413
      ],
      [
        "Nima Junction",
        -0.20137,
        5.57318
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ]
    ]
  },
  {
    "id": "gtfs_7502905_388",
    "name": "Nungua ↔ Circle Odorna",
    "color": "#1779c2",
    "stops": [
      [
        "Odorna",
        -0.21732,
        5.56733
      ],
      [
        "Last Stop Odawnaa",
        -0.21699,
        5.56821
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Mami Dokuno",
        -0.21269,
        5.57015
      ],
      [
        "Equip",
        -0.21088,
        5.57058
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Kanda",
        -0.20183,
        5.57285
      ],
      [
        "Mobil",
        -0.19751,
        5.5738
      ],
      [
        "GBC First",
        -0.19375,
        5.5739
      ],
      [
        "GBC Second",
        -0.19221,
        5.57301
      ],
      [
        "Police Headquarters",
        -0.18727,
        5.5703
      ],
      [
        "Fire Service",
        -0.18544,
        5.5693
      ],
      [
        "Danquah First",
        -0.18237,
        5.56763
      ],
      [
        "Danquah Second",
        -0.17974,
        5.56616
      ],
      [
        "Labone",
        -0.17251,
        5.56215
      ],
      [
        "Barracks",
        -0.16798,
        5.55825
      ],
      [
        "Veterinary",
        -0.16759,
        5.5572
      ],
      [
        "Vet",
        -0.16776,
        5.55625
      ],
      [
        "Curve",
        -0.16793,
        5.55589
      ],
      [
        "Polyclinic",
        -0.16661,
        5.55638
      ],
      [
        "Kpogas",
        -0.1647,
        5.55713
      ],
      [
        "Jokers",
        -0.16373,
        5.55749
      ],
      [
        "Olympia",
        -0.15871,
        5.55788
      ],
      [
        "Court",
        -0.15537,
        5.55729
      ],
      [
        "Dreamland",
        -0.15148,
        5.5587
      ],
      [
        "Alonte Bar",
        -0.14902,
        5.55966
      ],
      [
        "Regimanuel",
        -0.14493,
        5.56226
      ],
      [
        "T-Junction",
        -0.14345,
        5.56316
      ],
      [
        "Labadi Beach",
        -0.14061,
        5.56394
      ],
      [
        "La Beach Hotel",
        -0.13877,
        5.56431
      ],
      [
        "Bush Road",
        -0.1318,
        5.56639
      ],
      [
        "First Gate",
        -0.12769,
        5.56753
      ],
      [
        "Second Gate",
        -0.12381,
        5.56853
      ],
      [
        "Next Door",
        -0.11776,
        5.57056
      ],
      [
        "Kofi Annan",
        -0.1126,
        5.57385
      ],
      [
        "Laskala",
        -0.10983,
        5.57803
      ],
      [
        "Addoemi",
        -0.10787,
        5.58017
      ],
      [
        "Mobil",
        -0.104,
        5.58357
      ],
      [
        "First Junction",
        -0.09943,
        5.58749
      ],
      [
        "A-life",
        -0.09321,
        5.59121
      ],
      [
        "Brigade",
        -0.089,
        5.59379
      ],
      [
        "Cold Store",
        -0.08565,
        5.59582
      ],
      [
        "C5",
        -0.08239,
        5.59781
      ],
      [
        "Bank",
        -0.08029,
        5.60016
      ],
      [
        "Nungua",
        -0.07911,
        5.60223
      ]
    ]
  },
  {
    "id": "gtfs_7439593_60",
    "name": "Kasoa ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24817,
        5.60728
      ],
      [
        "Abrantie",
        -0.25276,
        5.60515
      ],
      [
        "Kata",
        -0.25959,
        5.60225
      ],
      [
        "Hong Kong",
        -0.26108,
        5.60129
      ],
      [
        "Kwashieman Junction",
        -0.26685,
        5.59416
      ],
      [
        "Been To",
        -0.27172,
        5.58739
      ],
      [
        "Vineyard",
        -0.27294,
        5.58596
      ],
      [
        "Water Works",
        -0.27794,
        5.5798
      ],
      [
        "Mallam Junction",
        -0.28595,
        5.56983
      ],
      [
        "McCarthy Junction",
        -0.28894,
        5.56551
      ],
      [
        "Weija-Gbawe Municipal Hospital",
        -0.28955,
        5.56416
      ],
      [
        "Mendskrom",
        -0.29718,
        5.55834
      ],
      [
        "Weija Junction",
        -0.30385,
        5.55591
      ],
      [
        "Tetegu",
        -0.30967,
        5.55394
      ],
      [
        "Weija Barrier",
        -0.33036,
        5.55093
      ],
      [
        "Block Factory",
        -0.33548,
        5.54885
      ],
      [
        "SCC",
        -0.33874,
        5.54754
      ],
      [
        "Shoprite",
        -0.34208,
        5.54639
      ],
      [
        "Bortianor",
        -0.34822,
        5.54779
      ],
      [
        "Ayigbe Town",
        -0.35383,
        5.55023
      ],
      [
        "Mile Eleven",
        -0.35566,
        5.55095
      ],
      [
        "Broadcasting",
        -0.35896,
        5.5523
      ],
      [
        "Tuba",
        -0.38253,
        5.54688
      ],
      [
        "Chinese",
        -0.38978,
        5.54341
      ],
      [
        "Brigade",
        -0.39465,
        5.54108
      ],
      [
        "Galelia",
        -0.39889,
        5.53907
      ],
      [
        "Galelia Market",
        -0.40138,
        5.53824
      ],
      [
        "Washing Bay",
        -0.40629,
        5.53688
      ],
      [
        "Iron City",
        -0.41096,
        5.53578
      ],
      [
        "Amanfrom",
        -0.41282,
        5.53569
      ],
      [
        "Pink FM",
        -0.41634,
        5.53568
      ],
      [
        "Second",
        -0.41895,
        5.53554
      ],
      [
        "Kasoa",
        -0.4238,
        5.53479
      ]
    ]
  },
  {
    "id": "gtfs_7485244_258",
    "name": "Kwashieman Junction ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ],
      [
        "Gate",
        -0.21466,
        5.55261
      ],
      [
        "Graphic junction",
        -0.21429,
        5.55415
      ],
      [
        "Graphic",
        -0.2188,
        5.55553
      ],
      [
        "Fata",
        -0.22196,
        5.55702
      ],
      [
        "Mtn office / Kaneshie Roundabout",
        -0.22741,
        5.56029
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor",
        -0.26242,
        5.5807
      ],
      [
        "Off town junction",
        -0.26478,
        5.58506
      ],
      [
        "School junction",
        -0.26536,
        5.5868
      ],
      [
        "Kwashieman Junction",
        -0.26788,
        5.59119
      ]
    ]
  },
  {
    "id": "gtfs_7473843_64",
    "name": "Circle ↔ Asore Danho",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Asoredanho",
        -0.2554,
        5.57023
      ],
      [
        "1 plus 1",
        -0.25356,
        5.56988
      ],
      [
        "Mataheko Pharmacy",
        -0.25145,
        5.56848
      ],
      [
        "Mataheko Police Quarters",
        -0.2499,
        5.56741
      ],
      [
        "JT",
        -0.24503,
        5.56445
      ],
      [
        "Kateco",
        -0.24392,
        5.56574
      ],
      [
        "First Light",
        -0.24265,
        5.56789
      ],
      [
        "Cocoa Clinic",
        -0.23663,
        5.57139
      ],
      [
        "Neoplan",
        -0.21853,
        5.56873
      ],
      [
        "Circle Last Stop",
        -0.21713,
        5.5691
      ]
    ]
  },
  {
    "id": "gtfs_7439761_66",
    "name": "Kotokuo ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ],
      [
        "High Tension",
        -0.24833,
        5.61603
      ],
      [
        "Fishpond",
        -0.24991,
        5.61856
      ],
      [
        "St. Anthony School",
        -0.25008,
        5.6194
      ],
      [
        "Family Life",
        -0.24845,
        5.6224
      ],
      [
        "Mile 7 T-Junction",
        -0.2506,
        5.6264
      ],
      [
        "Nii Ayi Kushie Street",
        -0.2498,
        5.64224
      ],
      [
        "Taifa Junction",
        -0.25243,
        5.64951
      ],
      [
        "Ofankor Barrier",
        -0.26479,
        5.65761
      ],
      [
        "John Teye",
        -0.27042,
        5.66733
      ],
      [
        "ACP Junction",
        -0.27726,
        5.68409
      ],
      [
        "Pokuase Junction",
        -0.28199,
        5.68779
      ],
      [
        "Festus",
        -0.28858,
        5.69311
      ],
      [
        "Fusi Junction",
        -0.29195,
        5.69838
      ],
      [
        "Amasaman",
        -0.29761,
        5.70493
      ],
      [
        "Puma",
        -0.3034,
        5.71062
      ],
      [
        "Toman",
        -0.30505,
        5.71225
      ],
      [
        "Shikpontele",
        -0.30847,
        5.71826
      ],
      [
        "Sarpeiman",
        -0.31109,
        5.72564
      ],
      [
        "Macedonia",
        -0.3124,
        5.72998
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.313,
        5.73217
      ],
      [
        "Kontunse",
        -0.316,
        5.74169
      ],
      [
        "Satellite",
        -0.31861,
        5.74668
      ],
      [
        "Medie",
        -0.32598,
        5.76195
      ],
      [
        "School Junction",
        -0.35498,
        5.74136
      ],
      [
        "Kotokou",
        -0.35681,
        5.74011
      ]
    ]
  },
  {
    "id": "gtfs_7485324_250",
    "name": "Kwashieman ↔ A Lang",
    "color": "#1779c2",
    "stops": [
      [
        "A Lang",
        -0.27817,
        5.59779
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27269,
        5.59936
      ],
      [
        "Jah Love",
        -0.27088,
        5.59665
      ],
      [
        "Kwashieman",
        -0.26859,
        5.59217
      ]
    ]
  },
  {
    "id": "gtfs_7582474_256",
    "name": "Kwashieman Junction ↔ Kwashieman",
    "color": "#1779c2",
    "stops": [
      [
        "Kwashieman",
        -0.26786,
        5.59225
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Abeka Lapaz",
        -0.24808,
        5.60678
      ],
      [
        "Bambolino",
        -0.24254,
        5.60826
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.22639,
        5.61267
      ],
      [
        "Abofu",
        -0.22287,
        5.61373
      ],
      [
        "CP",
        -0.21649,
        5.61454
      ],
      [
        "GSL",
        -0.19926,
        5.61685
      ],
      [
        "Dzorwulu Junction",
        -0.19445,
        5.61734
      ],
      [
        "Airport Junction",
        -0.17948,
        5.62195
      ],
      [
        "Accra Mall Roundabout",
        -0.17473,
        5.62204
      ],
      [
        "Shiashie",
        -0.17644,
        5.62768
      ],
      [
        "Legon Second Gate",
        -0.17737,
        5.63756
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon Second",
        -0.17999,
        5.65188
      ],
      [
        "UPS",
        -0.17824,
        5.6607
      ],
      [
        "Presec",
        -0.17783,
        5.66255
      ],
      [
        "Atomic First",
        -0.17706,
        5.66624
      ],
      [
        "Atomic Second",
        -0.17663,
        5.66798
      ],
      [
        "Fire Stone",
        -0.17511,
        5.6713
      ],
      [
        "Madina Zongo Junction",
        -0.17378,
        5.67536
      ],
      [
        "Madina",
        -0.17164,
        5.67668
      ]
    ]
  },
  {
    "id": "gtfs_7485408_254",
    "name": "Kwashieman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ],
      [
        "Abrantie",
        -0.25276,
        5.60515
      ],
      [
        "Nyamekye Junction",
        -0.25474,
        5.60449
      ],
      [
        "Kata",
        -0.25959,
        5.60225
      ],
      [
        "Kwashieman Junction",
        -0.26685,
        5.59416
      ],
      [
        "Kwashieman",
        -0.2682,
        5.5926
      ]
    ]
  },
  {
    "id": "gtfs_7436193_508",
    "name": "Taifa ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ],
      [
        "High Tension",
        -0.24833,
        5.61603
      ],
      [
        "Fishpond",
        -0.24991,
        5.61856
      ],
      [
        "St. Anthony School",
        -0.25008,
        5.6194
      ],
      [
        "Family Life",
        -0.24845,
        5.6224
      ],
      [
        "Mile 7 T-Junction",
        -0.2506,
        5.6264
      ],
      [
        "Nii Ayi Kushie Street",
        -0.2498,
        5.64224
      ],
      [
        "Taifa Junction",
        -0.25161,
        5.64936
      ],
      [
        "Airport",
        -0.25272,
        5.65332
      ],
      [
        "Daavi",
        -0.25247,
        5.65512
      ],
      [
        "Taifa",
        -0.25285,
        5.65839
      ]
    ]
  },
  {
    "id": "gtfs_7473312_504",
    "name": "Darkuman ↔ Accra",
    "color": "#1779c2",
    "stops": [
      [
        "Accra",
        -0.21396,
        5.5524
      ],
      [
        "Graphic",
        -0.2188,
        5.55553
      ],
      [
        "Fata",
        -0.22196,
        5.55702
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "State Transport",
        -0.22551,
        5.56518
      ],
      [
        "Roundabout",
        -0.23079,
        5.57284
      ],
      [
        "Mothers Inn",
        -0.23125,
        5.57343
      ],
      [
        "Presby",
        -0.23299,
        5.57469
      ],
      [
        "Tsofi",
        -0.23468,
        5.5786
      ],
      [
        "Sakora",
        -0.2341,
        5.57908
      ],
      [
        "Mangoase",
        -0.23468,
        5.58029
      ],
      [
        "Been to",
        -0.23546,
        5.58142
      ],
      [
        "St. Johns",
        -0.23506,
        5.58229
      ],
      [
        "Alhadji",
        -0.23899,
        5.58469
      ],
      [
        "Washing Bay",
        -0.23953,
        5.5863
      ],
      [
        "Asoredanho",
        -0.24227,
        5.58631
      ],
      [
        "Police Station",
        -0.24498,
        5.58628
      ],
      [
        "Quarters",
        -0.25108,
        5.5863
      ],
      [
        "Darkuman",
        -0.251,
        5.58895
      ]
    ]
  },
  {
    "id": "gtfs_7501604_502",
    "name": "Kasoa ↔ Abossey-Okai",
    "color": "#1779c2",
    "stops": [
      [
        "Abossey-Okai",
        -0.23657,
        5.56516
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor (Main Bus stop)",
        -0.26369,
        5.58043
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "Mallam Junction",
        -0.28595,
        5.56983
      ],
      [
        "McCarthy Junction",
        -0.28894,
        5.56551
      ],
      [
        "Benjys",
        -0.29034,
        5.56242
      ],
      [
        "Jayeemens",
        -0.29228,
        5.56033
      ],
      [
        "Mendskrom",
        -0.29718,
        5.55834
      ],
      [
        "Tetegu",
        -0.30967,
        5.55394
      ],
      [
        "Modex",
        -0.32232,
        5.5533
      ],
      [
        "Weija Barrier",
        -0.33036,
        5.55093
      ],
      [
        "Block Factory",
        -0.33548,
        5.54885
      ],
      [
        "SCC",
        -0.33874,
        5.54754
      ],
      [
        "Shoprite",
        -0.34208,
        5.54639
      ],
      [
        "Bortianor",
        -0.34822,
        5.54779
      ],
      [
        "Ayigbe Town",
        -0.35383,
        5.55023
      ],
      [
        "Mile Eleven",
        -0.35566,
        5.55095
      ],
      [
        "Broadcasting",
        -0.35896,
        5.5523
      ],
      [
        "Tuba",
        -0.38253,
        5.54688
      ],
      [
        "Chinese",
        -0.38978,
        5.54341
      ],
      [
        "Kalabule",
        -0.39054,
        5.54303
      ],
      [
        "Brigade",
        -0.39465,
        5.54108
      ],
      [
        "Galelia",
        -0.39889,
        5.53907
      ],
      [
        "Galelia Market",
        -0.40138,
        5.53824
      ],
      [
        "Washing Bay",
        -0.40629,
        5.53688
      ],
      [
        "Iron City",
        -0.41096,
        5.53578
      ],
      [
        "Amanfrom",
        -0.41282,
        5.53569
      ],
      [
        "Pink FM",
        -0.41634,
        5.53568
      ],
      [
        "Second",
        -0.41895,
        5.53554
      ],
      [
        "Kasoa",
        -0.4238,
        5.53479
      ]
    ]
  },
  {
    "id": "gtfs_7559234_500",
    "name": "Accra ↔ Abelemkpe",
    "color": "#1779c2",
    "stops": [
      [
        "Abelenkpe",
        -0.2182,
        5.60782
      ],
      [
        "Abelenkpe Curve",
        -0.21522,
        5.60738
      ],
      [
        "Abelenkpe Fire Station",
        -0.21217,
        5.6093
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "First Total",
        -0.19738,
        5.59969
      ],
      [
        "Pig Farm",
        -0.198,
        5.59876
      ],
      [
        "Kotobabi Down",
        -0.19888,
        5.59741
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Nima Junction",
        -0.20858,
        5.58237
      ],
      [
        "Mallam Atta",
        -0.20905,
        5.58166
      ],
      [
        "Asantewaa",
        -0.2105,
        5.57969
      ],
      [
        "School Junction",
        -0.21107,
        5.579
      ],
      [
        "Pro credit",
        -0.21152,
        5.57839
      ],
      [
        "Fidelity",
        -0.21203,
        5.57763
      ],
      [
        "Express",
        -0.21268,
        5.57677
      ],
      [
        "Sadisco",
        -0.21349,
        5.57569
      ],
      [
        "Quarters",
        -0.21405,
        5.57497
      ],
      [
        "City Lights",
        -0.21447,
        5.57436
      ],
      [
        "Circle",
        -0.21585,
        5.57302
      ],
      [
        "Vodafone",
        -0.21614,
        5.57186
      ],
      [
        "Commercial Bank",
        -0.21529,
        5.56835
      ],
      [
        "PTC",
        -0.21515,
        5.56776
      ],
      [
        "Dance Bar",
        -0.2147,
        5.56604
      ],
      [
        "Adabraka",
        -0.2144,
        5.5649
      ],
      [
        "Adabraka Market",
        -0.21392,
        5.5631
      ],
      [
        "Roxy Cinema",
        -0.21244,
        5.55777
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra UTC",
        -0.21063,
        5.54959
      ]
    ]
  },
  {
    "id": "gtfs_7571264_469",
    "name": "Camara ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Camara",
        -0.25682,
        5.53709
      ],
      [
        "Mangoase",
        -0.25292,
        5.53568
      ],
      [
        "Camara Junction",
        -0.25075,
        5.53564
      ],
      [
        "Nku Kpotoi",
        -0.24941,
        5.53559
      ],
      [
        "IBE (Camara)",
        -0.24764,
        5.53558
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24636,
        5.53554
      ],
      [
        "Mamprobi Methodist",
        -0.24386,
        5.53506
      ],
      [
        "Abodwe",
        -0.24232,
        5.53464
      ],
      [
        "Rainbow",
        -0.24006,
        5.53398
      ],
      [
        "Mamprobi Shell",
        -0.23804,
        5.53365
      ],
      [
        "Mamprobi Post Office",
        -0.23705,
        5.53384
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Electricity",
        -0.23342,
        5.53464
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Fire Service",
        -0.21553,
        5.53237
      ],
      [
        "Boodi",
        -0.21471,
        5.53274
      ],
      [
        "Lighthouse",
        -0.2117,
        5.53359
      ],
      [
        "One Way",
        -0.21025,
        5.53703
      ],
      [
        "Ussher Fort",
        -0.20893,
        5.53834
      ],
      [
        "Accra Bishop",
        -0.20451,
        5.54393
      ],
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7559071_465",
    "name": "Manhia Afuaman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Manhia Afuaman",
        -0.35157,
        5.63832
      ],
      [
        "Manhean",
        -0.3458,
        5.64223
      ],
      [
        "Junction",
        -0.34463,
        5.64321
      ],
      [
        "Twibleoo",
        -0.33722,
        5.64164
      ],
      [
        "Oduman",
        -0.33439,
        5.64046
      ],
      [
        "Block Factory",
        -0.32451,
        5.63227
      ],
      [
        "Ablekuma Park",
        -0.31378,
        5.62725
      ],
      [
        "Ablekuma Curve",
        -0.31196,
        5.62714
      ],
      [
        "Pentecost Junction",
        -0.3069,
        5.62551
      ],
      [
        "Fanmilk Junction",
        -0.29847,
        5.62199
      ],
      [
        "Mawulolo",
        -0.29487,
        5.62672
      ],
      [
        "VRA",
        -0.29283,
        5.63114
      ],
      [
        "Mambo",
        -0.28566,
        5.63109
      ],
      [
        "Heavenly Church",
        -0.28563,
        5.62708
      ],
      [
        "Sowutuom Last stop",
        -0.28448,
        5.62517
      ],
      [
        "Printing press",
        -0.27977,
        5.62367
      ],
      [
        "Pentecost",
        -0.2788,
        5.62271
      ],
      [
        "Sowutuom Market",
        -0.27685,
        5.62004
      ],
      [
        "Sowutuom Chopbar",
        -0.27636,
        5.6174
      ],
      [
        "Dega Junction",
        -0.27568,
        5.61524
      ],
      [
        "Gyedu Junction",
        -0.26778,
        5.61196
      ],
      [
        "Rasta Junction",
        -0.2661,
        5.61128
      ],
      [
        "Attah Junction",
        -0.26532,
        5.61025
      ],
      [
        "Container Race Course",
        -0.26405,
        5.60906
      ],
      [
        "School Junction Race Course",
        -0.26325,
        5.60828
      ],
      [
        "Race Course Blue Gate",
        -0.26239,
        5.60749
      ],
      [
        "Ahenfie",
        -0.26094,
        5.6065
      ],
      [
        "Tabora Number2",
        -0.26042,
        5.60605
      ],
      [
        "Tabora Number 3",
        -0.25866,
        5.60707
      ],
      [
        "Lapaz Market",
        -0.25719,
        5.60743
      ],
      [
        "Abrantie",
        -0.25491,
        5.6067
      ],
      [
        "Lapaz Community Hospital",
        -0.25404,
        5.60884
      ],
      [
        "Lapaz Masalaashie",
        -0.25269,
        5.60981
      ],
      [
        "Lapaz Last stop",
        -0.25089,
        5.6095
      ],
      [
        "Lapaz Station",
        -0.24978,
        5.60808
      ],
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ]
    ]
  },
  {
    "id": "gtfs_7458324_467",
    "name": "Mayera ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Mayera/Adusa",
        -0.27185,
        5.73562
      ],
      [
        "Adusah Quarters",
        -0.27267,
        5.73278
      ],
      [
        "Adusah Block Factory",
        -0.27304,
        5.73209
      ],
      [
        "Okaiman Junction",
        -0.2757,
        5.72875
      ],
      [
        "Mayera Market",
        -0.27649,
        5.72643
      ],
      [
        "Fase Junction",
        -0.2769,
        5.72424
      ],
      [
        "Osofo Ama",
        -0.27828,
        5.72274
      ],
      [
        "New Life",
        -0.2805,
        5.71964
      ],
      [
        "Agbodji",
        -0.28152,
        5.71819
      ],
      [
        "Alosa",
        -0.28316,
        5.71609
      ],
      [
        "Afiaman Pamprom",
        -0.28625,
        5.71042
      ],
      [
        "Thank You Jesus",
        -0.28692,
        5.70857
      ],
      [
        "Quarters Junction",
        -0.28561,
        5.70212
      ],
      [
        "Pokuase Agric",
        -0.28642,
        5.69638
      ],
      [
        "Pokuase Old Station",
        -0.28379,
        5.6916
      ],
      [
        "Pokuase New Station",
        -0.28156,
        5.68774
      ],
      [
        "Pokuase Junction",
        -0.28199,
        5.68779
      ],
      [
        "Pokuase Junction main Road",
        -0.28065,
        5.68641
      ],
      [
        "ACP Junction",
        -0.27746,
        5.68392
      ],
      [
        "Agya Herbal",
        -0.27196,
        5.67237
      ],
      [
        "John Teye",
        -0.27114,
        5.66912
      ],
      [
        "Ofankor Barrier",
        -0.26547,
        5.65766
      ],
      [
        "Income Tax",
        -0.26118,
        5.65458
      ],
      [
        "Spot M",
        -0.2586,
        5.65294
      ],
      [
        "Taifa Junction",
        -0.25123,
        5.64838
      ],
      [
        "Tantra Hills",
        -0.24708,
        5.64479
      ],
      [
        "Champion",
        -0.2494,
        5.64264
      ],
      [
        "Tantra Reservoir",
        -0.25065,
        5.64165
      ],
      [
        "Vulcanizer",
        -0.25073,
        5.63799
      ],
      [
        "Tantra Hills Estate",
        -0.25064,
        5.63617
      ],
      [
        "Roman",
        -0.25087,
        5.63446
      ],
      [
        "Rasta Park",
        -0.2516,
        5.63257
      ],
      [
        "Washing Bay",
        -0.25295,
        5.63084
      ],
      [
        "T-Junction Down",
        -0.25157,
        5.62796
      ],
      [
        "Mile 7 T-Junction Top",
        -0.25058,
        5.6263
      ],
      [
        "School Junction",
        -0.25024,
        5.62586
      ],
      [
        "Pharmacy",
        -0.24906,
        5.6239
      ],
      [
        "Family Life",
        -0.24853,
        5.62248
      ],
      [
        "Fishpond",
        -0.24996,
        5.61858
      ],
      [
        "Alhadji No Front",
        -0.24905,
        5.61669
      ],
      [
        "High Tension",
        -0.2484,
        5.61602
      ],
      [
        "Links Garden",
        -0.24667,
        5.6148
      ],
      [
        "Nii Boi Station",
        -0.24525,
        5.61373
      ],
      [
        "Container",
        -0.24503,
        5.61295
      ],
      [
        "MTN",
        -0.24574,
        5.60943
      ],
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ]
    ]
  },
  {
    "id": "gtfs_7458358_461",
    "name": "Tabora Alhaji ↔ Kaneshie Station",
    "color": "#1779c2",
    "stops": [
      [
        "Tabora Alhaji",
        -0.26172,
        5.62803
      ],
      [
        "Tabora Number 3",
        -0.25861,
        5.60723
      ],
      [
        "Tabora Number2",
        -0.25995,
        5.60602
      ],
      [
        "Tabora Number 1",
        -0.25785,
        5.60372
      ],
      [
        "Nyamekye",
        -0.25638,
        5.6029
      ],
      [
        "Fadama Junction",
        -0.25413,
        5.59757
      ],
      [
        "Alafia",
        -0.25241,
        5.59293
      ],
      [
        "Circle Station",
        -0.25195,
        5.59029
      ],
      [
        "Post Office",
        -0.25134,
        5.58198
      ],
      [
        "Atico",
        -0.24606,
        5.58079
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.24353,
        5.58199
      ],
      [
        "Pharmacy",
        -0.24089,
        5.58097
      ],
      [
        "Bubuashie",
        -0.23989,
        5.58029
      ],
      [
        "Bishop",
        -0.23892,
        5.5721
      ],
      [
        "Mighty Power",
        -0.23752,
        5.57026
      ],
      [
        "Ekutu Junction",
        -0.23703,
        5.5685
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7443866_463",
    "name": "Mallam Gbawe ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Mallam Gbawe",
        -0.30954,
        5.57674
      ],
      [
        "Water Works",
        -0.27782,
        5.57955
      ],
      [
        "Vineyard",
        -0.27552,
        5.58219
      ],
      [
        "Been To",
        -0.27151,
        5.5873
      ],
      [
        "Kwashieman",
        -0.26986,
        5.58939
      ],
      [
        "Kwashieman",
        -0.26786,
        5.59225
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Abeka Lapaz",
        -0.24907,
        5.60641
      ],
      [
        "Abeka Lapaz",
        -0.2491,
        5.60694
      ]
    ]
  },
  {
    "id": "gtfs_7488672_168",
    "name": "Sukura ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23587,
        5.5641
      ],
      [
        "Zongo Junction",
        -0.24077,
        5.55759
      ],
      [
        "Club Corner",
        -0.24348,
        5.55822
      ],
      [
        "Great Lamptey",
        -0.24482,
        5.55771
      ],
      [
        "Flamingo",
        -0.24651,
        5.55804
      ],
      [
        "Banku Junction",
        -0.24755,
        5.55378
      ],
      [
        "Borla Junction",
        -0.24762,
        5.55093
      ],
      [
        "Sukura",
        -0.24929,
        5.55062
      ]
    ]
  },
  {
    "id": "gtfs_7493202_164",
    "name": "Glefe ↔ Accra Bishop",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Bishop",
        -0.20451,
        5.54324
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "Korle er naa",
        -0.21939,
        5.53141
      ],
      [
        "Korle beach resort",
        -0.22791,
        5.5293
      ],
      [
        "White House",
        -0.23264,
        5.52834
      ],
      [
        "Galilee",
        -0.2335,
        5.52816
      ],
      [
        "Hotel Junction",
        -0.23426,
        5.528
      ],
      [
        "Wolarm",
        -0.23557,
        5.52775
      ],
      [
        "Tea Gadern",
        -0.24222,
        5.52745
      ],
      [
        "Extra O",
        -0.24236,
        5.52908
      ],
      [
        "Anna Larbi",
        -0.2424,
        5.52966
      ],
      [
        "Aayalolo",
        -0.2475,
        5.53217
      ],
      [
        "USA",
        -0.24838,
        5.53228
      ],
      [
        "Lotto House",
        -0.25116,
        5.53246
      ],
      [
        "205",
        -0.254,
        5.53196
      ],
      [
        "Agege",
        -0.25499,
        5.5318
      ],
      [
        "Zone 6",
        -0.25758,
        5.53144
      ],
      [
        "Karikari",
        -0.26144,
        5.53098
      ],
      [
        "Agege Last Stop",
        -0.26399,
        5.52932
      ],
      [
        "Atomic",
        -0.266,
        5.52764
      ],
      [
        "Curve",
        -0.26772,
        5.52785
      ],
      [
        "Agege Commando",
        -0.26844,
        5.52731
      ],
      [
        "Assemblies",
        -0.26911,
        5.52698
      ],
      [
        "Adofo Aman",
        -0.26994,
        5.52661
      ],
      [
        "Junction",
        -0.27118,
        5.52574
      ],
      [
        "Yellow House",
        -0.27189,
        5.52433
      ],
      [
        "Glefe Station Last Stop",
        -0.27369,
        5.52214
      ]
    ]
  },
  {
    "id": "gtfs_7426683_166",
    "name": "Hansonic ↔ Dansoman Last Stop",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.26531,
        5.5297
      ],
      [
        "Kofi ne Ama",
        -0.26524,
        5.53246
      ],
      [
        "Seven Great",
        -0.26513,
        5.53523
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "MTN",
        -0.26131,
        5.55868
      ],
      [
        "Dansoman First Stop",
        -0.26019,
        5.55998
      ],
      [
        "Dansoman Polyclinic",
        -0.26019,
        5.56114
      ],
      [
        "Abomatte",
        -0.26019,
        5.56268
      ],
      [
        "Akukofoto",
        -0.25985,
        5.56463
      ],
      [
        "Wesley Grammar",
        -0.25824,
        5.56685
      ],
      [
        "Asoredanho Curve",
        -0.25653,
        5.56804
      ],
      [
        "Dansoman Asoredanho",
        -0.2554,
        5.57023
      ],
      [
        "Hansonic Taxi Rank",
        -0.25261,
        5.57473
      ]
    ]
  },
  {
    "id": "gtfs_7442731_160",
    "name": "Accra U.T.C ↔ Abeka Main Market",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Main Market",
        -0.2393,
        5.60081
      ],
      [
        "Free Pipe",
        -0.23766,
        5.59986
      ],
      [
        "Adom Junction",
        -0.23686,
        5.59957
      ],
      [
        "PnP Junction",
        -0.23571,
        5.59913
      ],
      [
        "Total",
        -0.23335,
        5.59803
      ],
      [
        "Abeka Junction Curve",
        -0.22459,
        5.5994
      ],
      [
        "Abeka Junction",
        -0.22397,
        5.59892
      ],
      [
        "CAT",
        -0.22196,
        5.59518
      ],
      [
        "Alajo",
        -0.21816,
        5.58794
      ],
      [
        "Caprice",
        -0.21704,
        5.58396
      ],
      [
        "Circle Asoredanho",
        -0.21673,
        5.57563
      ],
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Dance Bar",
        -0.2147,
        5.56604
      ],
      [
        "Adabraka Market",
        -0.21392,
        5.5631
      ],
      [
        "Roxy Cinema",
        -0.21244,
        5.55777
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Accra UTC",
        -0.21063,
        5.54959
      ]
    ]
  },
  {
    "id": "gtfs_7554159_162",
    "name": "Ebenezer ↔ Accra Bishop",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Bishop",
        -0.20486,
        5.54374
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "Accra Post Office",
        -0.20977,
        5.54198
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Korle Bu",
        -0.22705,
        5.53612
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Shell",
        -0.23781,
        5.53374
      ],
      [
        "Mamprobi Police Station",
        -0.23974,
        5.53396
      ],
      [
        "Rainbow",
        -0.24084,
        5.53425
      ],
      [
        "Mamprobi Methodist",
        -0.24382,
        5.53511
      ],
      [
        "Methodist",
        -0.24442,
        5.53486
      ],
      [
        "Bamboi",
        -0.24623,
        5.53286
      ],
      [
        "USA",
        -0.24838,
        5.53228
      ],
      [
        "Lotto House",
        -0.25116,
        5.53246
      ],
      [
        "205",
        -0.254,
        5.53196
      ],
      [
        "Agege",
        -0.25499,
        5.5318
      ],
      [
        "Zone 6",
        -0.25758,
        5.53144
      ],
      [
        "Karikari",
        -0.26144,
        5.53098
      ],
      [
        "Agege Last Stop",
        -0.26399,
        5.52932
      ],
      [
        "Atomic",
        -0.266,
        5.52764
      ],
      [
        "Curve",
        -0.26772,
        5.52785
      ],
      [
        "Point 6",
        -0.26838,
        5.52828
      ]
    ]
  },
  {
    "id": "gtfs_7471933_357",
    "name": "Nima Overhead ↔ Dome Railway Crossing",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Overhead",
        -0.19463,
        5.59424
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Abelenkpe Junction",
        -0.21092,
        5.60993
      ],
      [
        "Abelenkpe Curve",
        -0.21571,
        5.60753
      ],
      [
        "Dua Ase",
        -0.21769,
        5.61116
      ],
      [
        "Junction",
        -0.22234,
        5.61273
      ],
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Neoplan",
        -0.23295,
        5.62409
      ],
      [
        "ABC Junction",
        -0.23629,
        5.62918
      ],
      [
        "Mile 7",
        -0.23967,
        5.63445
      ],
      [
        "Best Point",
        -0.2402,
        5.63532
      ],
      [
        "Achimota Mall",
        -0.24147,
        5.63737
      ],
      [
        "St. Johns",
        -0.24243,
        5.63885
      ],
      [
        "Dome",
        -0.23722,
        5.64516
      ],
      [
        "Adehyeman",
        -0.23704,
        5.64556
      ],
      [
        "Dome Crossing",
        -0.23653,
        5.64717
      ]
    ]
  },
  {
    "id": "gtfs_7472079_355",
    "name": "Nima Overhead ↔ Awoshie Last Stop",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Overhead",
        -0.19474,
        5.59412
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Abelenkpe Junction",
        -0.21092,
        5.60993
      ],
      [
        "CP",
        -0.21189,
        5.61574
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Lapaz Market",
        -0.24051,
        5.60902
      ],
      [
        "Bambolino",
        -0.24237,
        5.60871
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ],
      [
        "Abeka Lapaz",
        -0.2465,
        5.60798
      ],
      [
        "Abeka Lapaz",
        -0.24817,
        5.60728
      ],
      [
        "Las Palmas",
        -0.24905,
        5.60689
      ],
      [
        "Abrantie",
        -0.25276,
        5.60515
      ],
      [
        "Kata",
        -0.25959,
        5.60225
      ],
      [
        "Hong Kong",
        -0.26108,
        5.60129
      ],
      [
        "Kwashieman Junction",
        -0.26685,
        5.59416
      ],
      [
        "Been To",
        -0.27172,
        5.58739
      ],
      [
        "Vineyard",
        -0.27294,
        5.58596
      ],
      [
        "Awoshie Last stop",
        -0.28723,
        5.59194
      ]
    ]
  },
  {
    "id": "gtfs_7472170_353",
    "name": "Nima Overhead ↔ Israel Lomnava",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Overhead",
        -0.19463,
        5.59424
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Abelenkpe Junction",
        -0.21092,
        5.60993
      ],
      [
        "CP",
        -0.21189,
        5.61574
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Lapaz Market",
        -0.24051,
        5.60902
      ],
      [
        "Bambolino",
        -0.24237,
        5.60871
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ],
      [
        "Container",
        -0.24498,
        5.61299
      ],
      [
        "High Tension",
        -0.24833,
        5.61603
      ],
      [
        "Fishpond",
        -0.24991,
        5.61856
      ],
      [
        "St. Anthony School",
        -0.25008,
        5.6194
      ],
      [
        "Family Life",
        -0.24845,
        5.6224
      ],
      [
        "Pharmacy",
        -0.24903,
        5.62392
      ],
      [
        "Mile 7 T-Junction",
        -0.2506,
        5.6264
      ],
      [
        "T-Junction",
        -0.25162,
        5.62693
      ],
      [
        "Israel Lomnava",
        -0.26884,
        5.63113
      ]
    ]
  },
  {
    "id": "gtfs_7593083_351",
    "name": "Nima Overhead Maamobi ↔ Alajo Station",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station",
        -0.19865,
        5.58147
      ],
      [
        "Alaska",
        -0.19713,
        5.58625
      ],
      [
        "Gutter",
        -0.1966,
        5.58816
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Prempeh",
        -0.20592,
        5.59301
      ],
      [
        "Tobinco Junction",
        -0.20629,
        5.59332
      ],
      [
        "Labour Centre",
        -0.20652,
        5.59357
      ],
      [
        "Kotobabi Market junction",
        -0.20763,
        5.59474
      ],
      [
        "Social",
        -0.20822,
        5.59516
      ],
      [
        "Kotobabi Down (Polo Park)",
        -0.20915,
        5.59589
      ],
      [
        "Modest",
        -0.20971,
        5.59635
      ],
      [
        "Polo Junction",
        -0.21237,
        5.59846
      ],
      [
        "Merciful Hotel",
        -0.21359,
        5.59855
      ],
      [
        "Alajo Blue Kiosk",
        -0.21461,
        5.59858
      ],
      [
        "Alajo T-Junction",
        -0.2171,
        5.59854
      ],
      [
        "Pele",
        -0.21701,
        5.59731
      ],
      [
        "Taxi Rank Alajo",
        -0.2169,
        5.59603
      ],
      [
        "Alajo Station",
        -0.21684,
        5.59507
      ]
    ]
  },
  {
    "id": "gtfs_7467379_359",
    "name": "Nima Overhead ↔ Lapaz-Nii Boi Junction",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Station",
        -0.19843,
        5.58204
      ],
      [
        "Alaska",
        -0.19713,
        5.58625
      ],
      [
        "Mawarko",
        -0.19578,
        5.59092
      ],
      [
        "Maamobi",
        -0.1954,
        5.59211
      ],
      [
        "Nima Overhead",
        -0.19463,
        5.59424
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Abelenkpe Junction",
        -0.21092,
        5.60993
      ],
      [
        "CP",
        -0.21189,
        5.61574
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Lapaz Market",
        -0.24051,
        5.60902
      ],
      [
        "Bambolino",
        -0.24237,
        5.60871
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ]
    ]
  },
  {
    "id": "gtfs_7461658_216",
    "name": "Mamprobi C Lante ↔ Kaneshie Takoradi Station",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Takoradi Station",
        -0.23708,
        5.56481
      ],
      [
        "Zongo Junction",
        -0.23992,
        5.55756
      ],
      [
        "Pipeier Naa",
        -0.2402,
        5.55294
      ],
      [
        "Black Smith",
        -0.24021,
        5.55083
      ],
      [
        "Radio Gold",
        -0.24021,
        5.54863
      ],
      [
        "Salvation Army",
        -0.23953,
        5.54165
      ],
      [
        "Sempe Second",
        -0.23982,
        5.53785
      ],
      [
        "Abodwe",
        -0.2423,
        5.53513
      ],
      [
        "Girl School",
        -0.24262,
        5.53192
      ],
      [
        "Kakalika",
        -0.24255,
        5.53101
      ],
      [
        "Tea Gadern",
        -0.24227,
        5.52764
      ],
      [
        "Alomo Junction",
        -0.24372,
        5.5268
      ],
      [
        "Lantemame",
        -0.24591,
        5.52663
      ]
    ]
  },
  {
    "id": "gtfs_7460919_214",
    "name": "Korle Bu ↔ Kaneshie Takoradi Station",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Takoradi Station",
        -0.23708,
        5.56481
      ],
      [
        "Zongo Junction",
        -0.23992,
        5.55756
      ],
      [
        "Pipeier Naa",
        -0.2402,
        5.55294
      ],
      [
        "Black Smith",
        -0.24021,
        5.55083
      ],
      [
        "Radio Gold",
        -0.24021,
        5.54863
      ],
      [
        "Salvation Army",
        -0.23953,
        5.54165
      ],
      [
        "Sempe First",
        -0.2389,
        5.5391
      ],
      [
        "Sempe Second",
        -0.23835,
        5.53678
      ],
      [
        "Mamprobi Station",
        -0.23774,
        5.53426
      ],
      [
        "Mamprobi Post Office",
        -0.23705,
        5.53384
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Electricity",
        -0.23342,
        5.53464
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ]
    ]
  },
  {
    "id": "gtfs_7460876_212",
    "name": "Kaneshie Takoradi Station ↔ Dansoman Last Stop",
    "color": "#1779c2",
    "stops": [
      [
        "Dansoman Last Stop",
        -0.2653,
        5.53004
      ],
      [
        "Kofi ne Ama",
        -0.26524,
        5.53246
      ],
      [
        "Seven Great",
        -0.26513,
        5.53523
      ],
      [
        "Exhibition (Dansoman)",
        -0.26474,
        5.53791
      ],
      [
        "Dansoman Market",
        -0.26461,
        5.54111
      ],
      [
        "Dansoman Police Station",
        -0.26457,
        5.54353
      ],
      [
        "Dansoman Control",
        -0.26454,
        5.54597
      ],
      [
        "Emmanuel Presby",
        -0.26451,
        5.54835
      ],
      [
        "Sahara",
        -0.26451,
        5.55056
      ],
      [
        "Beecham",
        -0.2645,
        5.55237
      ],
      [
        "Mamas Inn",
        -0.26448,
        5.55437
      ],
      [
        "Dansoman Roundabout",
        -0.26462,
        5.55673
      ],
      [
        "MTN",
        -0.26131,
        5.55868
      ],
      [
        "Paa Willie",
        -0.25185,
        5.5596
      ],
      [
        "Zongo Junction",
        -0.23979,
        5.55779
      ],
      [
        "Asoredan ho",
        -0.23872,
        5.5614
      ],
      [
        "Dansoman Junction",
        -0.23764,
        5.56321
      ],
      [
        "Kaneshie Takoradi Station",
        -0.23708,
        5.56481
      ]
    ]
  },
  {
    "id": "gtfs_7517520_210",
    "name": "Kaneshie ↔ Abeka Main Market",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Main Market",
        -0.2393,
        5.60081
      ],
      [
        "Free Pipe",
        -0.23766,
        5.59986
      ],
      [
        "Adom Junction",
        -0.23686,
        5.59957
      ],
      [
        "PnP Junction",
        -0.23571,
        5.59913
      ],
      [
        "Abeka Bcos Junction",
        -0.2348,
        5.5988
      ],
      [
        "Abeka Total",
        -0.23356,
        5.59795
      ],
      [
        "Junction",
        -0.23331,
        5.59608
      ],
      [
        "Souvenir 2nd",
        -0.23299,
        5.59387
      ],
      [
        "Drug Store",
        -0.23265,
        5.59083
      ],
      [
        "Sunlight",
        -0.23236,
        5.59025
      ],
      [
        "Old Stop",
        -0.2329,
        5.58771
      ],
      [
        "Swanlake",
        -0.23207,
        5.58599
      ],
      [
        "Masalakyi",
        -0.23166,
        5.58494
      ],
      [
        "CPP",
        -0.23078,
        5.58272
      ],
      [
        "Green Hand",
        -0.23046,
        5.58207
      ],
      [
        "Obaatanpa",
        -0.22999,
        5.58133
      ],
      [
        "Pentecost",
        -0.2291,
        5.58024
      ],
      [
        "St. Theresas",
        -0.22831,
        5.57937
      ],
      [
        "Picadilly",
        -0.22771,
        5.57826
      ],
      [
        "Dance Bar",
        -0.22797,
        5.57685
      ],
      [
        "Ga Mantse",
        -0.22925,
        5.57559
      ],
      [
        "Kaneshie Polyclinic",
        -0.23069,
        5.57426
      ],
      [
        "Mothers Inn",
        -0.23129,
        5.57335
      ],
      [
        "Roundabout",
        -0.23115,
        5.57207
      ],
      [
        "Big Boss",
        -0.23242,
        5.57092
      ],
      [
        "Fire Armour",
        -0.23296,
        5.57042
      ],
      [
        "Welfare",
        -0.23417,
        5.56911
      ],
      [
        "Kaneshie Last Stop",
        -0.23397,
        5.5662
      ]
    ]
  },
  {
    "id": "gtfs_7461717_218",
    "name": "New Russia Last Stop ↔ Kaneshie Takoradi Station",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie Takoradi Station",
        -0.23708,
        5.56481
      ],
      [
        "Zongo Junction",
        -0.23992,
        5.55756
      ],
      [
        "Club Corner",
        -0.24348,
        5.55822
      ],
      [
        "Flamingo",
        -0.24704,
        5.55891
      ],
      [
        "Ashtown",
        -0.24905,
        5.55935
      ],
      [
        "Paa Willie",
        -0.25211,
        5.55965
      ],
      [
        "Mars Junction",
        -0.25372,
        5.55915
      ],
      [
        "Okwahu Motors",
        -0.25576,
        5.55868
      ],
      [
        "Slow Down",
        -0.25693,
        5.55841
      ],
      [
        "New Russia Last Stop",
        -0.25698,
        5.55821
      ]
    ]
  },
  {
    "id": "gtfs_7480997_289",
    "name": "Tetteh Quarshie ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Airport Junction",
        -0.17949,
        5.62237
      ],
      [
        "CP",
        -0.21189,
        5.61574
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ],
      [
        "Abeka Lapaz",
        -0.24817,
        5.60728
      ]
    ]
  },
  {
    "id": "gtfs_7474607_4",
    "name": "Madina Station ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ],
      [
        "Achimota Club House",
        -0.21925,
        5.62209
      ],
      [
        "PWD",
        -0.21889,
        5.624
      ],
      [
        "Achimota Hospital",
        -0.21914,
        5.6275
      ],
      [
        "Golf Park",
        -0.21944,
        5.63017
      ],
      [
        "Polo",
        -0.21825,
        5.63163
      ],
      [
        "Christian Village",
        -0.21465,
        5.63539
      ],
      [
        "Kisseman Junction",
        -0.21323,
        5.63725
      ],
      [
        "Pure Fire",
        -0.21189,
        5.63788
      ],
      [
        "Airways Junction",
        -0.21086,
        5.63818
      ],
      [
        "Westlands junction",
        -0.20975,
        5.65025
      ],
      [
        "Allied fuel station",
        -0.20664,
        5.65924
      ],
      [
        "Supermarket",
        -0.19603,
        5.66737
      ],
      [
        "Ebenezer",
        -0.19266,
        5.66733
      ],
      [
        "Agbogba Junction",
        -0.1877,
        5.66749
      ],
      [
        "Madina Zongo Junction",
        -0.17405,
        5.67844
      ],
      [
        "Madina",
        -0.17164,
        5.67668
      ]
    ]
  },
  {
    "id": "gtfs_7482704_281",
    "name": "Omanjor ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Omanjor",
        -0.29802,
        5.64772
      ],
      [
        "Dwenewoho Station",
        -0.29806,
        5.64543
      ],
      [
        "Washing Base",
        -0.29807,
        5.64029
      ],
      [
        "Omanjor Main station",
        -0.29701,
        5.63884
      ],
      [
        "School Junction",
        -0.29353,
        5.63672
      ],
      [
        "Presby",
        -0.28919,
        5.6344
      ],
      [
        "Mensah Addo",
        -0.28409,
        5.63333
      ],
      [
        "Mambo",
        -0.28511,
        5.63108
      ],
      [
        "Lomnava Junction",
        -0.27908,
        5.63114
      ],
      [
        "Kyeiwaa Junction",
        -0.27481,
        5.63116
      ],
      [
        "Lomnava First Curve",
        -0.27164,
        5.63149
      ],
      [
        "Israel Station",
        -0.26911,
        5.63143
      ],
      [
        "Ayigbe Junction",
        -0.26551,
        5.63092
      ],
      [
        "Israel Junction",
        -0.26376,
        5.63067
      ],
      [
        "Alhaji Station",
        -0.26202,
        5.62835
      ],
      [
        "Tabora Alhaji",
        -0.26172,
        5.62803
      ],
      [
        "Alhaji Curve",
        -0.26193,
        5.6266
      ],
      [
        "Walaako",
        -0.262,
        5.62568
      ],
      [
        "Star Junction",
        -0.2617,
        5.62251
      ],
      [
        "Tabora Asoredanho",
        -0.26278,
        5.62181
      ],
      [
        "Tabora Junction",
        -0.26183,
        5.61909
      ],
      [
        "Tabora Lighthouse",
        -0.26115,
        5.61707
      ],
      [
        "Scorpion",
        -0.26078,
        5.61589
      ],
      [
        "Tabora Number 6",
        -0.261,
        5.61265
      ],
      [
        "Tabora Number 5",
        -0.26118,
        5.61082
      ],
      [
        "Borlaso",
        -0.26091,
        5.60914
      ],
      [
        "Tabora Number 4",
        -0.26038,
        5.6088
      ],
      [
        "Tabora Number 3",
        -0.25892,
        5.6071
      ],
      [
        "Lapaz Market",
        -0.25719,
        5.60743
      ],
      [
        "Abrantie",
        -0.25491,
        5.6067
      ],
      [
        "Lapaz Community Hospital",
        -0.25404,
        5.60884
      ],
      [
        "Lapaz Masalaashie",
        -0.25269,
        5.60981
      ],
      [
        "Lapaz Last stop",
        -0.25089,
        5.6095
      ],
      [
        "Lapaz Station",
        -0.24978,
        5.60808
      ],
      [
        "Abeka Lapaz",
        -0.24974,
        5.60688
      ]
    ]
  },
  {
    "id": "gtfs_7482125_285",
    "name": "Santa Maria ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Santa Maria",
        -0.27582,
        5.60572
      ],
      [
        "Video Junction",
        -0.27403,
        5.60164
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27269,
        5.59936
      ],
      [
        "Jah Love",
        -0.27088,
        5.59665
      ],
      [
        "Christ Mission",
        -0.27013,
        5.59496
      ],
      [
        "Kwashieman Junction",
        -0.26846,
        5.59258
      ],
      [
        "Hong Kong",
        -0.2627,
        5.59932
      ],
      [
        "Nyamekye",
        -0.25884,
        5.60234
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Abeka Lapaz",
        -0.2491,
        5.60694
      ]
    ]
  },
  {
    "id": "gtfs_7564678_287",
    "name": "Tema ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Tema Community One Market",
        0.00126,
        5.64519
      ],
      [
        "Community 4",
        -0.01344,
        5.65544
      ],
      [
        "Community 6",
        -0.01435,
        5.65776
      ],
      [
        "Community 7",
        -0.01626,
        5.6625
      ],
      [
        "Community 8",
        -0.01844,
        5.66794
      ],
      [
        "Community 9",
        -0.01995,
        5.67169
      ],
      [
        "Hospital Roundabout",
        -0.0227,
        5.67855
      ],
      [
        "Under Bridge",
        -0.04388,
        5.67501
      ],
      [
        "Biscuit Factory",
        -0.06722,
        5.66432
      ],
      [
        "KICC",
        -0.09356,
        5.65515
      ],
      [
        "Police Station",
        -0.10503,
        5.65057
      ],
      [
        "Manet",
        -0.12908,
        5.64083
      ],
      [
        "Toll booth",
        -0.1455,
        5.63422
      ],
      [
        "Flower Pot",
        -0.15483,
        5.63023
      ],
      [
        "Action Chapel",
        -0.16553,
        5.62678
      ],
      [
        "Tetteh Quarshie / Roundabout",
        -0.17385,
        5.62402
      ],
      [
        "Airport Junction",
        -0.17827,
        5.62261
      ],
      [
        "Dzorwulu Junction",
        -0.19115,
        5.6185
      ],
      [
        "GSL",
        -0.19925,
        5.61708
      ],
      [
        "CP",
        -0.21189,
        5.61574
      ],
      [
        "Abofu",
        -0.22295,
        5.61399
      ],
      [
        "Achimota Overhead",
        -0.22554,
        5.61327
      ],
      [
        "Akweteyman",
        -0.23131,
        5.61157
      ],
      [
        "Fly Top",
        -0.23807,
        5.60951
      ],
      [
        "Lapaz Market",
        -0.24051,
        5.60902
      ],
      [
        "Bambolino",
        -0.24237,
        5.60871
      ],
      [
        "Nii Boi Town Junction",
        -0.24522,
        5.6082
      ],
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ]
    ]
  },
  {
    "id": "gtfs_7582565_263",
    "name": "Santa Maria ↔ Kwashieman Junction",
    "color": "#1779c2",
    "stops": [
      [
        "Santa Maria",
        -0.27582,
        5.60572
      ],
      [
        "Drug store",
        -0.27488,
        5.60302
      ],
      [
        "Video Junction",
        -0.27403,
        5.60164
      ],
      [
        "Family Friend",
        -0.27332,
        5.6004
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27269,
        5.59936
      ],
      [
        "Jah Love",
        -0.27088,
        5.59665
      ],
      [
        "Christ Mission",
        -0.27013,
        5.59496
      ],
      [
        "Kwashieman Junction",
        -0.26846,
        5.59258
      ]
    ]
  },
  {
    "id": "gtfs_7484849_261",
    "name": "Kwashieman Junction ↔ Antie Aku",
    "color": "#1779c2",
    "stops": [
      [
        "Kwashieman Junction",
        -0.26843,
        5.5927
      ],
      [
        "Goil",
        -0.26896,
        5.59359
      ],
      [
        "Christ Mission",
        -0.26961,
        5.59442
      ],
      [
        "Jah Love",
        -0.27066,
        5.59638
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27208,
        5.59859
      ],
      [
        "Family Friend",
        -0.27323,
        5.60036
      ],
      [
        "Drug Store",
        -0.27477,
        5.60297
      ],
      [
        "Santa Maria",
        -0.27568,
        5.60577
      ],
      [
        "Assiamah",
        -0.27435,
        5.607
      ],
      [
        "Junction",
        -0.28328,
        5.61174
      ],
      [
        "Antie-Eku Pallas Town",
        -0.2848,
        5.61267
      ]
    ]
  },
  {
    "id": "gtfs_7582824_267",
    "name": "Rawlings Park ↔ Kwashieman Junction",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Rawlings Park",
        -0.20851,
        5.54555
      ],
      [
        "Palledium",
        -0.21565,
        5.54201
      ],
      [
        "Akoto Lante",
        -0.21541,
        5.54078
      ],
      [
        "Agbado",
        -0.21666,
        5.54045
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.22941,
        5.54983
      ],
      [
        "Ayigbe Town",
        -0.23121,
        5.55374
      ],
      [
        "Happy Days",
        -0.23238,
        5.55569
      ],
      [
        "Abossey Okai Zongo Junction",
        -0.23441,
        5.55611
      ],
      [
        "Laskia",
        -0.23557,
        5.55639
      ],
      [
        "Mataheko",
        -0.23901,
        5.56043
      ],
      [
        "Central University",
        -0.24202,
        5.56623
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Atico",
        -0.25072,
        5.57437
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Kwashieman School Junction",
        -0.26701,
        5.58967
      ],
      [
        "Kwashieman Junction",
        -0.26788,
        5.59119
      ]
    ]
  },
  {
    "id": "gtfs_7484682_265",
    "name": "Sowutuom ↔ Kwashieman Junction",
    "color": "#1779c2",
    "stops": [
      [
        "Sowutuom Last stop",
        -0.28448,
        5.62517
      ],
      [
        "Pentecost",
        -0.2788,
        5.62271
      ],
      [
        "Sowutuom Market",
        -0.27685,
        5.62004
      ],
      [
        "Sowutuom Chopbar",
        -0.27636,
        5.6174
      ],
      [
        "Dega",
        -0.27599,
        5.61515
      ],
      [
        "Rescue point",
        -0.2757,
        5.61387
      ],
      [
        "Africa",
        -0.27554,
        5.61281
      ],
      [
        "Polo",
        -0.27505,
        5.6101
      ],
      [
        "Auntie Aku",
        -0.27468,
        5.6081
      ],
      [
        "Assiamah",
        -0.27448,
        5.60715
      ],
      [
        "Santa Maria",
        -0.27582,
        5.60572
      ],
      [
        "Drug store",
        -0.27488,
        5.60302
      ],
      [
        "Video Junction",
        -0.27403,
        5.60164
      ],
      [
        "Family Friend",
        -0.27332,
        5.6004
      ],
      [
        "Santa Maria Blue Kiosk",
        -0.27269,
        5.59936
      ],
      [
        "Jah Love",
        -0.27088,
        5.59665
      ],
      [
        "Christ Mission",
        -0.27013,
        5.59496
      ],
      [
        "Kwashieman Junction",
        -0.26846,
        5.59258
      ],
      [
        "Kwashieman",
        -0.2682,
        5.5926
      ]
    ]
  },
  {
    "id": "gtfs_7480537_269",
    "name": "Accra ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Kingsway",
        -0.21075,
        5.55187
      ],
      [
        "Starlite",
        -0.20908,
        5.55596
      ],
      [
        "Champion",
        -0.20938,
        5.55724
      ],
      [
        "Adabraka Market",
        -0.21107,
        5.5637
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "Circle",
        -0.21587,
        5.57146
      ],
      [
        "Circle Post Office",
        -0.21602,
        5.572
      ],
      [
        "Circle Asoredanho",
        -0.21653,
        5.57545
      ],
      [
        "Caprice",
        -0.21668,
        5.58253
      ],
      [
        "Alajo",
        -0.2183,
        5.59091
      ],
      [
        "CAT",
        -0.22205,
        5.59573
      ],
      [
        "Abeka Junction",
        -0.2235,
        5.59855
      ],
      [
        "Abeka Junction Curve",
        -0.22478,
        5.59952
      ],
      [
        "Fitting Shop",
        -0.22617,
        5.59928
      ],
      [
        "Abrantie",
        -0.22865,
        5.59877
      ],
      [
        "Tesano Gardens",
        -0.23053,
        5.59845
      ],
      [
        "Total",
        -0.23301,
        5.59811
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Abeka Bcos Junction",
        -0.23495,
        5.59894
      ],
      [
        "PnP Junction",
        -0.23579,
        5.59922
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Abeka Main Market",
        -0.23913,
        5.6008
      ],
      [
        "Eno",
        -0.24157,
        5.60263
      ],
      [
        "Fadama Junction",
        -0.2425,
        5.60308
      ],
      [
        "Abeka Post Office",
        -0.24359,
        5.6039
      ],
      [
        "Abotare",
        -0.24527,
        5.60508
      ],
      [
        "Abeka Lapaz Last Stop",
        -0.24692,
        5.6061
      ],
      [
        "Abeka Lapaz",
        -0.24817,
        5.60628
      ]
    ]
  },
  {
    "id": "gtfs_7547781_59",
    "name": "Bubuashie Ayigbe Town ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Bubiashie Ayigbe Town",
        -0.24014,
        5.583
      ],
      [
        "Fita",
        -0.23905,
        5.58135
      ],
      [
        "Ayigbe Town Old Station",
        -0.23981,
        5.58044
      ],
      [
        "Obeyeyie",
        -0.23901,
        5.57912
      ],
      [
        "Cemetry",
        -0.23875,
        5.57786
      ],
      [
        "Mothers Inn",
        -0.23129,
        5.57335
      ],
      [
        "Roundabout",
        -0.23062,
        5.57193
      ],
      [
        "Awudome",
        -0.22819,
        5.5692
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Roundabout",
        -0.22858,
        5.56259
      ],
      [
        "Kaneshie Roundabout",
        -0.22797,
        5.56041
      ],
      [
        "Cold store",
        -0.22221,
        5.55695
      ],
      [
        "Graphic",
        -0.2197,
        5.55551
      ],
      [
        "First Gate",
        -0.21472,
        5.55425
      ],
      [
        "Maingate",
        -0.21468,
        5.55306
      ],
      [
        "Accra",
        -0.21402,
        5.55238
      ]
    ]
  },
  {
    "id": "gtfs_7495685_55",
    "name": "Circle ↔ Bubiashie Control (Old Station )",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Times",
        -0.22185,
        5.56979
      ],
      [
        "Azumah Nelson Complex",
        -0.22703,
        5.57486
      ],
      [
        "Bongo bar",
        -0.22859,
        5.57377
      ],
      [
        "Roundabout",
        -0.23115,
        5.57207
      ],
      [
        "Cocoa Clinic",
        -0.23597,
        5.57166
      ],
      [
        "Bazaza",
        -0.23854,
        5.57165
      ],
      [
        "Bishop",
        -0.23887,
        5.57206
      ],
      [
        "Cottage",
        -0.23805,
        5.57357
      ],
      [
        "Ola Balm",
        -0.23832,
        5.57574
      ],
      [
        "Cemetry",
        -0.23855,
        5.57727
      ],
      [
        "Bubuashie",
        -0.23992,
        5.58037
      ]
    ]
  },
  {
    "id": "gtfs_7495800_57",
    "name": "Circle ↔ Bubiashie-Atico",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Times",
        -0.22185,
        5.56979
      ],
      [
        "Azumah Nelson Complex",
        -0.22703,
        5.57486
      ],
      [
        "Bongo bar",
        -0.22859,
        5.57377
      ],
      [
        "Roundabout",
        -0.23115,
        5.57207
      ],
      [
        "Cocoa Clinic",
        -0.23597,
        5.57166
      ],
      [
        "Bazaza",
        -0.23854,
        5.57165
      ],
      [
        "Bishop",
        -0.23887,
        5.57206
      ],
      [
        "Cottage",
        -0.23805,
        5.57357
      ],
      [
        "Ola Balm",
        -0.23832,
        5.57574
      ],
      [
        "Cemetry",
        -0.23855,
        5.57727
      ],
      [
        "Bubuashie Control (Old Station )",
        -0.23949,
        5.58071
      ],
      [
        "Fita",
        -0.23898,
        5.58139
      ],
      [
        "Datus",
        -0.24267,
        5.58203
      ],
      [
        "Vulcanizer",
        -0.2445,
        5.58204
      ],
      [
        "Factory",
        -0.24572,
        5.58077
      ],
      [
        "Atico",
        -0.24696,
        5.57986
      ]
    ]
  },
  {
    "id": "gtfs_7478410_51",
    "name": "Circle ↔ Bubiashie Ayigbe Town",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21676,
        5.56975
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Roundabout",
        -0.23115,
        5.57207
      ],
      [
        "Bazaza",
        -0.23854,
        5.57165
      ],
      [
        "Ola Balm",
        -0.23832,
        5.57574
      ],
      [
        "Cemetry",
        -0.23855,
        5.57727
      ],
      [
        "Bubiashie Ayigbe Town",
        -0.24014,
        5.583
      ]
    ]
  },
  {
    "id": "gtfs_7547675_53",
    "name": "Banana Inn/Dansoman ↔ Agbogbloshie",
    "color": "#1779c2",
    "stops": [
      [
        "Banana Inn",
        -0.25504,
        5.54186
      ],
      [
        "Banana Inn Transformer",
        -0.2532,
        5.54083
      ],
      [
        "Abodoo Bridge",
        -0.25114,
        5.53965
      ],
      [
        "St.Marys",
        -0.24909,
        5.5387
      ],
      [
        "IBE",
        -0.24738,
        5.53903
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24636,
        5.53554
      ],
      [
        "Mamprobi Methodist",
        -0.24386,
        5.53506
      ],
      [
        "Abodwe",
        -0.24232,
        5.53464
      ],
      [
        "Rainbow",
        -0.24006,
        5.53398
      ],
      [
        "Mamprobi Post Office",
        -0.23705,
        5.53384
      ],
      [
        "Plaza",
        -0.23618,
        5.53403
      ],
      [
        "Electricity",
        -0.23342,
        5.53464
      ],
      [
        "Awotsɛ Kojo",
        -0.23273,
        5.53479
      ],
      [
        "New Station",
        -0.2298,
        5.53542
      ],
      [
        "Total",
        -0.22885,
        5.53562
      ],
      [
        "Korle Bu",
        -0.22641,
        5.53616
      ],
      [
        "Korle-Bu Barber",
        -0.22285,
        5.53688
      ],
      [
        "Boxing Arena",
        -0.22062,
        5.53734
      ],
      [
        "UTC",
        -0.21797,
        5.53793
      ],
      [
        "UTC",
        -0.21721,
        5.53809
      ],
      [
        "Agbado",
        -0.21586,
        5.53861
      ],
      [
        "Timber Market",
        -0.21614,
        5.54341
      ],
      [
        "Arena",
        -0.21667,
        5.54496
      ],
      [
        "Galloway",
        -0.21773,
        5.54778
      ],
      [
        "Agbobloshie 2",
        -0.2183,
        5.54842
      ],
      [
        "Agbogbloshie",
        -0.21683,
        5.54908
      ]
    ]
  },
  {
    "id": "gtfs_7454872_537",
    "name": "Dome Pillar 2 ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Dome Pillar 2",
        -0.2167,
        5.65317
      ],
      [
        "Container",
        -0.22328,
        5.64297
      ],
      [
        "Parakuo",
        -0.22188,
        5.64177
      ],
      [
        "Christian Village Jucntion",
        -0.21493,
        5.63515
      ],
      [
        "Achimota Hospital",
        -0.21883,
        5.62705
      ],
      [
        "Six Pillars",
        -0.22342,
        5.62103
      ],
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ]
    ]
  },
  {
    "id": "gtfs_7473499_535",
    "name": "Dome /Ashongman Estates ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Dome /Ashongman Estates",
        -0.23584,
        5.70223
      ],
      [
        "Lotto kiosk",
        -0.23382,
        5.69214
      ],
      [
        "K Fori",
        -0.23344,
        5.69073
      ],
      [
        "Melcom",
        -0.23211,
        5.68891
      ],
      [
        "Hospital",
        -0.23143,
        5.68527
      ],
      [
        "Bridge",
        -0.23112,
        5.68369
      ],
      [
        "2nd Lotto kiosk",
        -0.23471,
        5.6815
      ],
      [
        "Emmanuel",
        -0.24038,
        5.68099
      ],
      [
        "Stores",
        -0.24037,
        5.67297
      ],
      [
        "Atomic Junction",
        -0.23895,
        5.66746
      ],
      [
        "Born Again",
        -0.2374,
        5.65784
      ],
      [
        "Gym",
        -0.23737,
        5.6558
      ],
      [
        "Dome Old Station",
        -0.23741,
        5.65128
      ],
      [
        "Dome Crossing",
        -0.23661,
        5.64765
      ],
      [
        "Adehyeman",
        -0.23717,
        5.64542
      ],
      [
        "Dome Market",
        -0.23783,
        5.64386
      ],
      [
        "St. Johns",
        -0.24217,
        5.63959
      ],
      [
        "St Johns Second",
        -0.24413,
        5.64151
      ],
      [
        "Tantra Hills",
        -0.24551,
        5.64292
      ],
      [
        "Mile 7",
        -0.23978,
        5.63394
      ],
      [
        "ABC Junction",
        -0.23655,
        5.62887
      ],
      [
        "Neoplan",
        -0.23487,
        5.62631
      ],
      [
        "Achimota Overhead",
        -0.23144,
        5.62108
      ],
      [
        "Achimota New Station",
        -0.2259,
        5.62195
      ]
    ]
  },
  {
    "id": "gtfs_7466844_533",
    "name": "Darkuman ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Darkuman Junction",
        -0.25448,
        5.57761
      ],
      [
        "Masalatsi",
        -0.25161,
        5.58275
      ],
      [
        "Quarters",
        -0.2516,
        5.58557
      ],
      [
        "Circle Station",
        -0.25222,
        5.59093
      ],
      [
        "Alafia",
        -0.25222,
        5.59346
      ],
      [
        "Bombay",
        -0.2529,
        5.59568
      ],
      [
        "Fadama Junction",
        -0.25398,
        5.59745
      ],
      [
        "Abrantie",
        -0.25168,
        5.60522
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.2277,
        5.61205
      ],
      [
        "Achimota Old Station",
        -0.2294,
        5.61639
      ],
      [
        "Achimota New Station",
        -0.22591,
        5.62149
      ]
    ]
  },
  {
    "id": "gtfs_7517276_531",
    "name": "Adeyman ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Adeyman",
        -0.37189,
        5.71704
      ],
      [
        "Kwashiekuma",
        -0.36147,
        5.71119
      ],
      [
        "Sampahman police station",
        -0.36561,
        5.72216
      ],
      [
        "Estate",
        -0.36505,
        5.72565
      ],
      [
        "Kotokou market",
        -0.36152,
        5.73517
      ],
      [
        "Kwarteman",
        -0.35317,
        5.73627
      ],
      [
        "Kotokou station",
        -0.35656,
        5.74001
      ],
      [
        "Rafiki",
        -0.34961,
        5.74491
      ],
      [
        "Akotoshi no.1",
        -0.34857,
        5.74561
      ],
      [
        "Rush",
        -0.34529,
        5.74794
      ],
      [
        "Akotoshi No 2",
        -0.34197,
        5.75009
      ],
      [
        "Bridge",
        -0.33183,
        5.75702
      ],
      [
        "Voltic",
        -0.32954,
        5.75861
      ],
      [
        "Medie",
        -0.32579,
        5.76056
      ],
      [
        "Kontunse",
        -0.3159,
        5.74094
      ],
      [
        "Container",
        -0.31503,
        5.73847
      ],
      [
        "Macedonia",
        -0.3144,
        5.73627
      ],
      [
        "Pobiman",
        -0.31418,
        5.73542
      ],
      [
        "Sapeiman",
        -0.31233,
        5.72874
      ],
      [
        "Sapeiman",
        -0.31139,
        5.72574
      ],
      [
        "Shikpontele",
        -0.30891,
        5.71866
      ],
      [
        "Agya Appiah",
        -0.30745,
        5.71583
      ],
      [
        "Toman",
        -0.30475,
        5.71145
      ],
      [
        "Chop bar",
        -0.30082,
        5.7087
      ],
      [
        "Amasaman",
        -0.29829,
        5.70553
      ],
      [
        "Fusi Junction",
        -0.29215,
        5.6982
      ],
      [
        "Festus",
        -0.28752,
        5.69179
      ],
      [
        "Pokuase Junction",
        -0.28164,
        5.68718
      ],
      [
        "Pokuase Junction main Road",
        -0.28065,
        5.68641
      ],
      [
        "ACP Junction",
        -0.27746,
        5.68392
      ],
      [
        "Agya Herbal",
        -0.27196,
        5.67237
      ],
      [
        "John Teye",
        -0.27114,
        5.66912
      ],
      [
        "Ofankor Barrier",
        -0.26547,
        5.65766
      ],
      [
        "Income Tax",
        -0.26118,
        5.65458
      ],
      [
        "Spot M",
        -0.2586,
        5.65294
      ],
      [
        "Taifa Junction",
        -0.25123,
        5.64838
      ],
      [
        "Tantra Hills",
        -0.24708,
        5.64479
      ],
      [
        "Champion",
        -0.2494,
        5.64264
      ],
      [
        "Tantra Reservoir",
        -0.25065,
        5.64165
      ],
      [
        "Vulcanizer",
        -0.25073,
        5.63799
      ],
      [
        "Tantra Hills Estate",
        -0.25064,
        5.63617
      ],
      [
        "Roman",
        -0.25087,
        5.63446
      ],
      [
        "Rasta Park",
        -0.2516,
        5.63257
      ],
      [
        "Washing Bay",
        -0.25295,
        5.63084
      ],
      [
        "T-Junction Down",
        -0.25157,
        5.62796
      ],
      [
        "Mile 7 T-Junction Top",
        -0.25058,
        5.6263
      ],
      [
        "School Junction",
        -0.25024,
        5.62586
      ],
      [
        "Pharmacy",
        -0.24906,
        5.6239
      ],
      [
        "Family Life",
        -0.24853,
        5.62248
      ],
      [
        "Fishpond",
        -0.24996,
        5.61858
      ],
      [
        "Alhadji No Front",
        -0.24905,
        5.61669
      ],
      [
        "High Tension",
        -0.2484,
        5.61602
      ],
      [
        "Links Garden",
        -0.24667,
        5.6148
      ],
      [
        "Nii Boi Station",
        -0.24525,
        5.61373
      ],
      [
        "Container",
        -0.24503,
        5.61295
      ],
      [
        "MTN",
        -0.24574,
        5.60943
      ],
      [
        "Abeka Lapaz",
        -0.24718,
        5.6095
      ]
    ]
  },
  {
    "id": "gtfs_7455415_539",
    "name": "Abeka Lapaz ↔ Achimota",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24907,
        5.60641
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Suzzys Inn",
        -0.23271,
        5.6107
      ],
      [
        "Akweteyman",
        -0.23177,
        5.6111
      ],
      [
        "Achimota Overhead",
        -0.2277,
        5.61205
      ],
      [
        "Achimota Old Station",
        -0.2294,
        5.61639
      ],
      [
        "Achimota New Station",
        -0.2259,
        5.62195
      ]
    ]
  },
  {
    "id": "gtfs_7605155_115",
    "name": "Accra CMB ↔ Ablekuma",
    "color": "#1779c2",
    "stops": [
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ],
      [
        "Graphic junction",
        -0.21429,
        5.55415
      ],
      [
        "Graphic",
        -0.2188,
        5.55553
      ],
      [
        "Fata",
        -0.22196,
        5.55702
      ],
      [
        "Rana motors",
        -0.22445,
        5.55852
      ],
      [
        "Mtn office / Kaneshie Roundabout",
        -0.22741,
        5.56029
      ],
      [
        "Pamprom",
        -0.2326,
        5.5634
      ],
      [
        "Kaneshie Market",
        -0.2343,
        5.56444
      ],
      [
        "Kaneshie Foot Bridge",
        -0.2358,
        5.56532
      ],
      [
        "Mallam Station",
        -0.23801,
        5.56667
      ],
      [
        "First Light",
        -0.24263,
        5.56956
      ],
      [
        "Accra Academy",
        -0.24546,
        5.57118
      ],
      [
        "Mataheko Quarters",
        -0.24775,
        5.5726
      ],
      [
        "Goil",
        -0.24909,
        5.57339
      ],
      [
        "Atico",
        -0.25072,
        5.57437
      ],
      [
        "Dansoman Junction",
        -0.25212,
        5.57521
      ],
      [
        "Darkuman junction",
        -0.25508,
        5.57701
      ],
      [
        "Odorkor Police Station",
        -0.25611,
        5.57765
      ],
      [
        "Glory Land junction",
        -0.25746,
        5.57843
      ],
      [
        "Waterworks junction",
        -0.25973,
        5.57981
      ],
      [
        "Odorkor (Main Bus stop)",
        -0.26369,
        5.58043
      ],
      [
        "Awoshie Vineyard",
        -0.27437,
        5.5845
      ],
      [
        "Awoshie Amangoase",
        -0.27783,
        5.58645
      ],
      [
        "Awoshie",
        -0.2789,
        5.58704
      ],
      [
        "Abrantie",
        -0.28187,
        5.58881
      ],
      [
        "Odogorno",
        -0.2837,
        5.58987
      ],
      [
        "Awoshie Onyinase",
        -0.28654,
        5.59155
      ],
      [
        "Awoshie Last stop",
        -0.28723,
        5.59194
      ],
      [
        "Calvary",
        -0.28857,
        5.59356
      ],
      [
        "Nii Bortey",
        -0.28964,
        5.5964
      ],
      [
        "Anyaa Market (Awoshie)",
        -0.29069,
        5.59912
      ],
      [
        "Anyaa School Junction",
        -0.29302,
        5.60288
      ],
      [
        "Anyaa",
        -0.29452,
        5.60508
      ],
      [
        "Academy",
        -0.29513,
        5.60596
      ],
      [
        "Anyah Last Stop",
        -0.29644,
        5.60781
      ],
      [
        "NIC",
        -0.29621,
        5.61371
      ],
      [
        "Nsunfa",
        -0.29427,
        5.61645
      ],
      [
        "CP",
        -0.29455,
        5.61872
      ],
      [
        "Block Factory",
        -0.29634,
        5.62035
      ],
      [
        "FanMilk Junction",
        -0.29923,
        5.6219
      ],
      [
        "Galilee",
        -0.30221,
        5.62349
      ],
      [
        "Pentecost Junction",
        -0.30674,
        5.62588
      ],
      [
        "Ablekuma Junction",
        -0.30874,
        5.62696
      ],
      [
        "Ablekuma",
        -0.31022,
        5.62724
      ],
      [
        "Ablekuma Park",
        -0.31354,
        5.62731
      ]
    ]
  },
  {
    "id": "gtfs_7548761_117",
    "name": "Alajo ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Alajo",
        -0.21836,
        5.6001
      ],
      [
        "Alajo T-Junction",
        -0.2171,
        5.59854
      ],
      [
        "Pele",
        -0.21701,
        5.59731
      ],
      [
        "Taxi Rank Alajo",
        -0.2169,
        5.59603
      ],
      [
        "Filling Station",
        -0.21676,
        5.59405
      ],
      [
        "Alajo Market",
        -0.21708,
        5.59107
      ],
      [
        "Caprice",
        -0.21704,
        5.58396
      ],
      [
        "Avenor",
        -0.21681,
        5.58065
      ],
      [
        "Circle Asoredanho",
        -0.21673,
        5.57563
      ],
      [
        "Ashongman",
        -0.21667,
        5.57426
      ],
      [
        "Vodafone",
        -0.21614,
        5.57186
      ],
      [
        "PTC",
        -0.21515,
        5.56776
      ],
      [
        "Dance Bar",
        -0.2147,
        5.56604
      ],
      [
        "Adabraka",
        -0.2144,
        5.5649
      ],
      [
        "Adabraka Market",
        -0.21392,
        5.5631
      ],
      [
        "Roxy Cinema",
        -0.21244,
        5.55777
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ]
    ]
  },
  {
    "id": "gtfs_7497047_111",
    "name": "Madina ↔ Circle Overhead",
    "color": "#1779c2",
    "stops": [
      [
        "Madina",
        -0.17164,
        5.67668
      ],
      [
        "Madina Zongo Junction",
        -0.17358,
        5.67737
      ],
      [
        "Masalaachi",
        -0.17386,
        5.6765
      ],
      [
        "Fire Stone",
        -0.1757,
        5.67093
      ],
      [
        "Atomic First",
        -0.17702,
        5.66841
      ],
      [
        "Atomic Second",
        -0.17756,
        5.66638
      ],
      [
        "Presec",
        -0.17836,
        5.66176
      ],
      [
        "UPS",
        -0.17895,
        5.65909
      ],
      [
        "Power House",
        -0.18015,
        5.65606
      ],
      [
        "Legon First",
        -0.18071,
        5.65361
      ],
      [
        "Legon Second",
        -0.17987,
        5.64816
      ],
      [
        "Okponglo",
        -0.17815,
        5.63961
      ],
      [
        "Legon Second Gate",
        -0.17746,
        5.63576
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Spanner",
        -0.17649,
        5.62051
      ],
      [
        "Shangrila",
        -0.1761,
        5.61607
      ],
      [
        "Airport First",
        -0.17725,
        5.60808
      ],
      [
        "Airport Second",
        -0.17812,
        5.60419
      ],
      [
        "Opeibea First",
        -0.17951,
        5.59801
      ],
      [
        "Opeibea Second",
        -0.18012,
        5.59526
      ],
      [
        "37",
        -0.18105,
        5.59117
      ],
      [
        "37 Hospital",
        -0.18311,
        5.58762
      ],
      [
        "37 Water Works",
        -0.18549,
        5.58253
      ],
      [
        "Flagstaff House",
        -0.18811,
        5.57637
      ],
      [
        "Sankara",
        -0.19122,
        5.5728
      ],
      [
        "GBC",
        -0.19267,
        5.5735
      ],
      [
        "Mobil",
        -0.19752,
        5.57413
      ],
      [
        "Nima Junction",
        -0.20137,
        5.57318
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Circle",
        -0.21736,
        5.56972
      ]
    ]
  },
  {
    "id": "gtfs_7497118_113",
    "name": "Nima mamobi ↔ Circle Overhead",
    "color": "#1779c2",
    "stops": [
      [
        "Nima Overhead",
        -0.19474,
        5.59412
      ],
      [
        "Frankies Hotel Junction",
        -0.19868,
        5.57767
      ],
      [
        "Nima Roundabout",
        -0.20086,
        5.57748
      ],
      [
        "Nima School Junction",
        -0.20083,
        5.57628
      ],
      [
        "Nima Police Station",
        -0.20079,
        5.57421
      ],
      [
        "Nima Junction",
        -0.20137,
        5.57318
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle",
        -0.21329,
        5.57067
      ]
    ]
  },
  {
    "id": "gtfs_7497485_119",
    "name": "Fan-Milk ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Fan-Milk",
        -0.29811,
        5.63607
      ],
      [
        "White House",
        -0.29815,
        5.63302
      ],
      [
        "Hotel Junction",
        -0.29815,
        5.63257
      ],
      [
        "Ice water junction",
        -0.29811,
        5.63147
      ],
      [
        "VRA Junction",
        -0.29812,
        5.63069
      ],
      [
        "Aba ase",
        -0.29816,
        5.62974
      ],
      [
        "Blue Kiosk",
        -0.29818,
        5.62799
      ],
      [
        "Second Yellow",
        -0.29818,
        5.6271
      ],
      [
        "First Yellow",
        -0.29814,
        5.62485
      ],
      [
        "Fan milk junction",
        -0.2982,
        5.62296
      ],
      [
        "Bridge",
        -0.29654,
        5.61392
      ],
      [
        "Awoshie Junction",
        -0.29585,
        5.60621
      ],
      [
        "Anyaa Market (Awoshie)",
        -0.2911,
        5.59907
      ],
      [
        "Awoshie Last stop",
        -0.28741,
        5.59157
      ],
      [
        "Awoshie",
        -0.27948,
        5.58698
      ],
      [
        "Mallam",
        -0.27708,
        5.58559
      ],
      [
        "Awoshie Vineyard",
        -0.27489,
        5.58336
      ],
      [
        "Water Works",
        -0.27794,
        5.5798
      ],
      [
        "Mallam Market",
        -0.28039,
        5.57254
      ],
      [
        "Sakaman",
        -0.27423,
        5.57628
      ],
      [
        "Busia Junction",
        -0.26791,
        5.57891
      ],
      [
        "Cold Store",
        -0.2657,
        5.57943
      ],
      [
        "Odorkor",
        -0.26485,
        5.57968
      ],
      [
        "Darkuman Junction",
        -0.25445,
        5.57611
      ],
      [
        "Dansoman Junction",
        -0.25256,
        5.575
      ],
      [
        "Atico",
        -0.25118,
        5.57416
      ],
      [
        "Mataheko Quarters",
        -0.24754,
        5.57197
      ],
      [
        "Accra Academy",
        -0.24551,
        5.57077
      ],
      [
        "First Light",
        -0.24297,
        5.56926
      ],
      [
        "Kaneshie",
        -0.23949,
        5.56733
      ],
      [
        "Kaneshie First Bridge",
        -0.23737,
        5.56602
      ],
      [
        "Kaneshie Foot Bridge",
        -0.23595,
        5.56517
      ],
      [
        "Kaneshie Second Bridge",
        -0.23549,
        5.56489
      ],
      [
        "Pamprom",
        -0.23173,
        5.56264
      ],
      [
        "Kaneshie Roundabout",
        -0.22797,
        5.56041
      ],
      [
        "Cold store",
        -0.22221,
        5.55695
      ],
      [
        "Graphic",
        -0.2197,
        5.55551
      ],
      [
        "First Gate",
        -0.21472,
        5.55425
      ],
      [
        "Maingate",
        -0.21468,
        5.55306
      ],
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ]
    ]
  },
  {
    "id": "gtfs_7574341_429",
    "name": "Pigfarm ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Pig Farm Station",
        -0.19844,
        5.59828
      ],
      [
        "Accra Girls",
        -0.19347,
        5.59824
      ],
      [
        "Kaukudi",
        -0.18949,
        5.59405
      ],
      [
        "Kanda Masalaachi",
        -0.19272,
        5.58673
      ],
      [
        "Nima Junction",
        -0.19481,
        5.58199
      ],
      [
        "Overhead",
        -0.19704,
        5.57718
      ],
      [
        "Sunny FM",
        -0.20007,
        5.57033
      ],
      [
        "Accra High School",
        -0.2009,
        5.56885
      ],
      [
        "Second Gate",
        -0.20211,
        5.56487
      ],
      [
        "Ridge",
        -0.20168,
        5.56356
      ],
      [
        "School Junction",
        -0.20844,
        5.56182
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ]
    ]
  },
  {
    "id": "gtfs_7460628_421",
    "name": "Orgle-Road ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Orgle-Road",
        -0.23711,
        5.58646
      ],
      [
        "Awony3",
        -0.23907,
        5.58529
      ],
      [
        "Ayigbe town",
        -0.24,
        5.58343
      ],
      [
        "Fita",
        -0.23905,
        5.58135
      ],
      [
        "Ayigbe Town Old Station",
        -0.23981,
        5.58044
      ],
      [
        "Bubuashie",
        -0.23989,
        5.58029
      ],
      [
        "Obeyeyie",
        -0.23901,
        5.57912
      ],
      [
        "Cemetry",
        -0.23875,
        5.57786
      ],
      [
        "Ola Balm",
        -0.23844,
        5.57601
      ],
      [
        "Cottage",
        -0.2381,
        5.57394
      ],
      [
        "Bishop",
        -0.23892,
        5.5721
      ],
      [
        "Mighty Power",
        -0.23752,
        5.57026
      ],
      [
        "Ekutu Junction",
        -0.23703,
        5.5685
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7431840_423",
    "name": "Circle ↔ Osu",
    "color": "#1779c2",
    "stops": [
      [
        "Circle",
        -0.21327,
        5.56961
      ],
      [
        "Paloma",
        -0.20621,
        5.57172
      ],
      [
        "Multi Choice",
        -0.20318,
        5.57255
      ],
      [
        "Mobil",
        -0.19751,
        5.5738
      ],
      [
        "GBC First",
        -0.19375,
        5.5739
      ],
      [
        "GBC Second",
        -0.19221,
        5.57301
      ],
      [
        "Police Headquarters",
        -0.18727,
        5.5703
      ],
      [
        "Fire Service",
        -0.18544,
        5.5693
      ],
      [
        "Danquah",
        -0.18258,
        5.56699
      ],
      [
        "Papaye",
        -0.18222,
        5.55957
      ],
      [
        "Osu Shell",
        -0.18268,
        5.5566
      ],
      [
        "Presby School Junction",
        -0.18335,
        5.55498
      ],
      [
        "Osu",
        -0.18361,
        5.55404
      ]
    ]
  },
  {
    "id": "gtfs_7460396_425",
    "name": "Osu ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Osu",
        -0.18359,
        5.55408
      ],
      [
        "Osu Shell",
        -0.18272,
        5.55626
      ],
      [
        "SNNIT",
        -0.1816,
        5.56277
      ],
      [
        "Penta Hotel",
        -0.18116,
        5.56536
      ],
      [
        "Danquah Second",
        -0.18172,
        5.56751
      ],
      [
        "Police Headquarters",
        -0.18841,
        5.57127
      ],
      [
        "Sankara",
        -0.19122,
        5.5728
      ],
      [
        "GBC",
        -0.19267,
        5.5735
      ],
      [
        "Mobil",
        -0.19752,
        5.57413
      ],
      [
        "Nima Police Station",
        -0.20079,
        5.57421
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "Pamprom",
        -0.23076,
        5.56563
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7460180_427",
    "name": "Osu ↔ Madina",
    "color": "#1779c2",
    "stops": [
      [
        "Osu",
        -0.18359,
        5.55408
      ],
      [
        "Osu Shell",
        -0.18272,
        5.55626
      ],
      [
        "Papaye",
        -0.18214,
        5.55975
      ],
      [
        "Penta Hotel",
        -0.18116,
        5.56536
      ],
      [
        "Police Hospital",
        -0.18074,
        5.56799
      ],
      [
        "Prisons",
        -0.18041,
        5.56997
      ],
      [
        "Morning Star",
        -0.1796,
        5.57342
      ],
      [
        "Alliance",
        -0.17594,
        5.59798
      ],
      [
        "Airport First",
        -0.17731,
        5.60645
      ],
      [
        "Airport Second",
        -0.17658,
        5.60983
      ],
      [
        "Shangrila",
        -0.17591,
        5.61719
      ],
      [
        "Spanner",
        -0.17613,
        5.62042
      ],
      [
        "Shiashie",
        -0.17644,
        5.62768
      ],
      [
        "Legon Second Gate",
        -0.17737,
        5.63756
      ],
      [
        "Okponglo",
        -0.17807,
        5.64133
      ],
      [
        "Legon First",
        -0.1795,
        5.64893
      ],
      [
        "Legon Second",
        -0.17999,
        5.65188
      ],
      [
        "UPS",
        -0.17824,
        5.6607
      ],
      [
        "Presec",
        -0.17783,
        5.66255
      ],
      [
        "Atomic First",
        -0.17706,
        5.66624
      ],
      [
        "Atomic Second",
        -0.17663,
        5.66798
      ],
      [
        "Fire Stone",
        -0.17511,
        5.6713
      ],
      [
        "Madina Zongo Junction",
        -0.17378,
        5.67536
      ],
      [
        "Madina",
        -0.17164,
        5.67668
      ]
    ]
  },
  {
    "id": "gtfs_7481933_308",
    "name": "Agbogbloshie ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "Tema Station Union of GPRTU",
        -0.20075,
        5.5487
      ],
      [
        "Court",
        -0.20435,
        5.54444
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "Timber Market",
        -0.21614,
        5.54341
      ],
      [
        "Arena",
        -0.21667,
        5.54496
      ],
      [
        "Agbobloshie 2",
        -0.2183,
        5.54842
      ],
      [
        "Agbogbloshie",
        -0.21683,
        5.54908
      ]
    ]
  },
  {
    "id": "gtfs_7517720_300",
    "name": "Agbogbloshie ↔ Abeka Lapaz",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Bambolino",
        -0.24254,
        5.60826
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Free Pipe",
        -0.23766,
        5.59986
      ],
      [
        "Adom Junction",
        -0.23686,
        5.59957
      ],
      [
        "PnP Junction",
        -0.23571,
        5.59913
      ],
      [
        "Abeka Bcos Junction",
        -0.2348,
        5.5988
      ],
      [
        "Abeka Total",
        -0.23356,
        5.59795
      ],
      [
        "Junction",
        -0.23331,
        5.59608
      ],
      [
        "Mesco",
        -0.22992,
        5.59071
      ],
      [
        "Melcom",
        -0.22693,
        5.58794
      ],
      [
        "Ashfoam Junction",
        -0.22411,
        5.58285
      ],
      [
        "Ghana commercial bank",
        -0.22317,
        5.57622
      ],
      [
        "Fan Milk Junction",
        -0.22285,
        5.57319
      ],
      [
        "Fan milk",
        -0.22225,
        5.57006
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "Times",
        -0.2246,
        5.56624
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Roundabout",
        -0.22858,
        5.56259
      ],
      [
        "Abossey Okai",
        -0.22992,
        5.56048
      ],
      [
        "Agbogbloshie",
        -0.22612,
        5.55529
      ]
    ]
  },
  {
    "id": "gtfs_7582991_302",
    "name": "Mataheko ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Kaneshie",
        -0.23787,
        5.56402
      ],
      [
        "JT",
        -0.24535,
        5.56474
      ],
      [
        "Peace Clinic",
        -0.24738,
        5.56594
      ],
      [
        "Mataheko Police Quarters",
        -0.24983,
        5.56745
      ],
      [
        "Mataheko Pharmacy",
        -0.25135,
        5.56847
      ],
      [
        "Station",
        -0.25288,
        5.56668
      ],
      [
        "Mars",
        -0.25597,
        5.56451
      ],
      [
        "Filling Station",
        -0.25393,
        5.55914
      ],
      [
        "Okwahu Motors",
        -0.25576,
        5.55868
      ],
      [
        "Slow Down",
        -0.25693,
        5.55841
      ],
      [
        "New Russia Last Stop",
        -0.25698,
        5.55821
      ],
      [
        "Mataheko",
        -0.25711,
        5.55502
      ]
    ]
  },
  {
    "id": "gtfs_7584117_304",
    "name": "New Fadama ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Accra CMB",
        -0.21306,
        5.55068
      ],
      [
        "Kingsway",
        -0.21075,
        5.55187
      ],
      [
        "Starlite",
        -0.20908,
        5.55596
      ],
      [
        "Champion",
        -0.20938,
        5.55724
      ],
      [
        "Adabraka Market",
        -0.21107,
        5.5637
      ],
      [
        "Mr. Biggs",
        -0.21335,
        5.56777
      ],
      [
        "P.T.C",
        -0.21373,
        5.56833
      ],
      [
        "Circle Neoplan Station",
        -0.2182,
        5.56906
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "Times",
        -0.2246,
        5.56624
      ],
      [
        "Transport",
        -0.22549,
        5.56636
      ],
      [
        "Kaneshie Roundabout",
        -0.22983,
        5.57111
      ],
      [
        "Roundabout",
        -0.23079,
        5.57284
      ],
      [
        "Mothers Inn",
        -0.23125,
        5.57343
      ],
      [
        "Kaneshie Polyclinic",
        -0.23062,
        5.57425
      ],
      [
        "Mantse 1st gate",
        -0.22911,
        5.57563
      ],
      [
        "Mantse 2nd gate",
        -0.2284,
        5.57629
      ],
      [
        "Dance Bar",
        -0.22793,
        5.57675
      ],
      [
        "Picadilly",
        -0.22766,
        5.57811
      ],
      [
        "St. Theresas",
        -0.2283,
        5.57945
      ],
      [
        "Pentecost",
        -0.22904,
        5.58027
      ],
      [
        "Obaatanpa",
        -0.22994,
        5.58131
      ],
      [
        "Green Hand",
        -0.23036,
        5.58197
      ],
      [
        "CPP",
        -0.23074,
        5.58281
      ],
      [
        "Masalakyi",
        -0.23153,
        5.58473
      ],
      [
        "Swanlake",
        -0.23171,
        5.5853
      ],
      [
        "Old Stop",
        -0.23272,
        5.58752
      ],
      [
        "Meridian Chemist",
        -0.23536,
        5.5878
      ],
      [
        "Adodo",
        -0.23611,
        5.58868
      ],
      [
        "CMB Flats",
        -0.23739,
        5.5896
      ],
      [
        "Amankwah",
        -0.23844,
        5.58906
      ],
      [
        "Demod",
        -0.24063,
        5.58881
      ],
      [
        "Point 4",
        -0.24222,
        5.59275
      ],
      [
        "Point 4 (last stop)",
        -0.24253,
        5.59531
      ],
      [
        "Market",
        -0.24529,
        5.59586
      ],
      [
        "Musulley",
        -0.24534,
        5.59869
      ],
      [
        "School",
        -0.24733,
        5.59862
      ],
      [
        "New Fadama",
        -0.24782,
        5.59836
      ]
    ]
  },
  {
    "id": "gtfs_7584341_306",
    "name": "Accra New Tema Station ↔ Abelemkpe",
    "color": "#1779c2",
    "stops": [
      [
        "Abelenkpe",
        -0.2182,
        5.60782
      ],
      [
        "Abelenkpe Curve",
        -0.21522,
        5.60738
      ],
      [
        "Abelenkpe Fire Station",
        -0.21217,
        5.6093
      ],
      [
        "Railway",
        -0.20815,
        5.60782
      ],
      [
        "Dzorwulu Junction",
        -0.20709,
        5.60715
      ],
      [
        "Ebony",
        -0.20352,
        5.60482
      ],
      [
        "Roman Ridge 1st",
        -0.20106,
        5.60322
      ],
      [
        "Roman Ridge 2nd",
        -0.19889,
        5.6018
      ],
      [
        "Club 1000",
        -0.20069,
        5.59579
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Accra New Town (37 Station)",
        -0.2077,
        5.58677
      ],
      [
        "Newtown Total",
        -0.20791,
        5.58577
      ],
      [
        "Ghana Commercial Bank",
        -0.20811,
        5.58469
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Nima Junction",
        -0.20858,
        5.58237
      ],
      [
        "Commandos",
        -0.20529,
        5.58026
      ],
      [
        "Nima Roundabout",
        -0.20086,
        5.57748
      ],
      [
        "Nima School Junction",
        -0.20083,
        5.57628
      ],
      [
        "Kanda Overhead",
        -0.19834,
        5.57472
      ],
      [
        "Sunny FM",
        -0.20007,
        5.57033
      ],
      [
        "Accra High School",
        -0.2009,
        5.56885
      ],
      [
        "Second Gate",
        -0.20211,
        5.56487
      ],
      [
        "Ridge",
        -0.20168,
        5.56356
      ],
      [
        "Mental",
        -0.20457,
        5.56263
      ],
      [
        "Museum",
        -0.20612,
        5.56119
      ],
      [
        "Tigo Office",
        -0.20573,
        5.5576
      ],
      [
        "Accra Technical University",
        -0.2054,
        5.55541
      ],
      [
        "Novotel",
        -0.2048,
        5.55397
      ],
      [
        "Kinbu",
        -0.20419,
        5.55128
      ],
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7554981_229",
    "name": "Mallam Atta ↔ Abeka Main Market",
    "color": "#1779c2",
    "stops": [
      [
        "Mallam Atta",
        -0.20905,
        5.58166
      ],
      [
        "Asantewaa",
        -0.2105,
        5.57969
      ],
      [
        "School Junction",
        -0.21107,
        5.579
      ],
      [
        "Pro credit",
        -0.21152,
        5.57839
      ],
      [
        "Caprice Juntion",
        -0.21585,
        5.58138
      ],
      [
        "Caprice",
        -0.21668,
        5.58253
      ],
      [
        "Alajo",
        -0.21796,
        5.58877
      ],
      [
        "CAT",
        -0.22205,
        5.59573
      ],
      [
        "Abeka Junction",
        -0.2235,
        5.59855
      ],
      [
        "Abeka Junction Curve",
        -0.22478,
        5.59952
      ],
      [
        "Fitting Shop",
        -0.22617,
        5.59928
      ],
      [
        "Abrantie",
        -0.22865,
        5.59877
      ],
      [
        "Tesano Gardens",
        -0.23053,
        5.59845
      ],
      [
        "Total",
        -0.23301,
        5.59811
      ],
      [
        "Total Curve",
        -0.23364,
        5.59845
      ],
      [
        "Abeka Bcos Junction",
        -0.23495,
        5.59894
      ],
      [
        "PnP Junction",
        -0.23579,
        5.59922
      ],
      [
        "Adom Junction",
        -0.23691,
        5.59963
      ],
      [
        "Free Pipe",
        -0.23739,
        5.5998
      ],
      [
        "Abeka Main Market",
        -0.23913,
        5.6008
      ]
    ]
  },
  {
    "id": "gtfs_7441932_227",
    "name": "Tse Addo ↔ 37 Lorry Park",
    "color": "#1779c2",
    "stops": [
      [
        "Tse Addo",
        -0.13854,
        5.58762
      ],
      [
        "Kpogas",
        -0.1497,
        5.57267
      ],
      [
        "Palm Wine",
        -0.15224,
        5.57638
      ],
      [
        "Villas",
        -0.15546,
        5.5791
      ],
      [
        "Congo Junction",
        -0.16315,
        5.58821
      ],
      [
        "Home touch",
        -0.16756,
        5.5874
      ],
      [
        "37",
        -0.1796,
        5.58886
      ]
    ]
  },
  {
    "id": "gtfs_7461923_225",
    "name": "Abeka Lapaz ↔ Korle Bu",
    "color": "#1779c2",
    "stops": [
      [
        "Abeka Lapaz",
        -0.24669,
        5.60721
      ],
      [
        "Lapaz Market",
        -0.24091,
        5.6085
      ],
      [
        "Fly top",
        -0.23808,
        5.60903
      ],
      [
        "Free Pipe",
        -0.23766,
        5.59986
      ],
      [
        "Adom Junction",
        -0.23686,
        5.59957
      ],
      [
        "PnP Junction",
        -0.23571,
        5.59913
      ],
      [
        "Abeka Total",
        -0.23356,
        5.59795
      ],
      [
        "Old Stop",
        -0.2329,
        5.58771
      ],
      [
        "Swanlake",
        -0.23207,
        5.58599
      ],
      [
        "Masalakyi",
        -0.23166,
        5.58494
      ],
      [
        "CPP",
        -0.23078,
        5.58272
      ],
      [
        "Green Hand",
        -0.23046,
        5.58207
      ],
      [
        "Obaatanpa",
        -0.22999,
        5.58133
      ],
      [
        "Pentecost",
        -0.2291,
        5.58024
      ],
      [
        "St. Theresas",
        -0.22831,
        5.57937
      ],
      [
        "Picadilly",
        -0.22771,
        5.57826
      ],
      [
        "Dance Bar",
        -0.22797,
        5.57685
      ],
      [
        "Awudome Cemetery",
        -0.22341,
        5.56741
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Total",
        -0.23051,
        5.55947
      ],
      [
        "Ayigbe Town",
        -0.23147,
        5.55384
      ],
      [
        "Mortuary",
        -0.2265,
        5.54304
      ],
      [
        "Junction",
        -0.22196,
        5.53786
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Korle Bu",
        -0.2308,
        5.53585
      ]
    ]
  },
  {
    "id": "gtfs_7559358_223",
    "name": "Kokomlemle ↔ Dzorwulu",
    "color": "#1779c2",
    "stops": [
      [
        "Kokomlemle (Pro Credit)",
        -0.21144,
        5.57836
      ],
      [
        "Asantewaa",
        -0.21052,
        5.57957
      ],
      [
        "Mallam Atta",
        -0.20927,
        5.58125
      ],
      [
        "Nima Junction",
        -0.20858,
        5.58223
      ],
      [
        "College",
        -0.20834,
        5.5833
      ],
      [
        "Ghana Commercial Bank",
        -0.20805,
        5.58484
      ],
      [
        "Newtown Total",
        -0.2079,
        5.58557
      ],
      [
        "Accra New Town (37 Station)",
        -0.20766,
        5.58674
      ],
      [
        "Agbadinar",
        -0.20748,
        5.58791
      ],
      [
        "Master Chef",
        -0.20732,
        5.58907
      ],
      [
        "Five Five",
        -0.20724,
        5.58964
      ],
      [
        "Nkansah Gyan",
        -0.20649,
        5.59083
      ],
      [
        "Taxi Rank",
        -0.20546,
        5.59198
      ],
      [
        "Kotobabi Police Station",
        -0.20446,
        5.59207
      ],
      [
        "Vulcanizer",
        -0.20339,
        5.59326
      ],
      [
        "Abavana",
        -0.20274,
        5.59401
      ],
      [
        "Club 1000",
        -0.20051,
        5.59594
      ],
      [
        "Top Class",
        -0.19941,
        5.5965
      ],
      [
        "Pig Farm",
        -0.19832,
        5.59811
      ],
      [
        "Pig Farm Junction",
        -0.19754,
        5.60123
      ],
      [
        "Roman Ridge",
        -0.20031,
        5.60294
      ],
      [
        "Ebony",
        -0.20369,
        5.60516
      ],
      [
        "Dzorwulu Junction",
        -0.20701,
        5.60731
      ],
      [
        "Fidelity",
        -0.20455,
        5.61047
      ],
      [
        "Junction",
        -0.20285,
        5.61205
      ],
      [
        "Vulcanizer",
        -0.20085,
        5.61181
      ],
      [
        "Bayere Junction",
        -0.20039,
        5.61132
      ],
      [
        "Last Chance",
        -0.19818,
        5.61184
      ],
      [
        "Special Ice",
        -0.19744,
        5.6125
      ],
      [
        "White Wall",
        -0.19623,
        5.61357
      ],
      [
        "Presby",
        -0.19581,
        5.61392
      ],
      [
        "Dzorwolu",
        -0.19588,
        5.61647
      ]
    ]
  },
  {
    "id": "gtfs_7461829_221",
    "name": "Russia Last Stop ↔ Kaneshie Takoradi Station",
    "color": "#1779c2",
    "stops": [
      [
        "Russia",
        -0.25105,
        5.55641
      ],
      [
        "Paa Willie",
        -0.25185,
        5.5596
      ],
      [
        "Ashtown",
        -0.24952,
        5.55933
      ],
      [
        "Flamingo",
        -0.24733,
        5.55888
      ],
      [
        "Seventh Day Adventist",
        -0.24626,
        5.55911
      ],
      [
        "Kembs Hotel",
        -0.24577,
        5.56084
      ],
      [
        "JT",
        -0.24526,
        5.56262
      ],
      [
        "Kateco",
        -0.24392,
        5.56574
      ],
      [
        "Central University",
        -0.24256,
        5.56534
      ],
      [
        "Kant",
        -0.24054,
        5.56484
      ],
      [
        "Ashleys",
        -0.23884,
        5.56381
      ],
      [
        "Dansoman Trotro Station",
        -0.2379,
        5.56357
      ],
      [
        "Kaneshie Takoradi Station",
        -0.23708,
        5.56481
      ]
    ]
  },
  {
    "id": "gtfs_7463292_391",
    "name": "Tsui Bleoo ↔ Circle Odorna",
    "color": "#1779c2",
    "stops": [
      [
        "Tsui Bleoo",
        -0.11549,
        5.60602
      ],
      [
        "Lekma Hospital",
        -0.12084,
        5.60231
      ],
      [
        "Junction",
        -0.1217,
        5.59497
      ],
      [
        "Hotel",
        -0.13116,
        5.59207
      ],
      [
        "Rasta",
        -0.13118,
        5.58625
      ],
      [
        "Junction",
        -0.13238,
        5.56693
      ],
      [
        "Telephone",
        -0.13919,
        5.56454
      ],
      [
        "Total",
        -0.14122,
        5.56412
      ],
      [
        "Police Station La",
        -0.15319,
        5.56144
      ],
      [
        "Polyclinic",
        -0.16468,
        5.55742
      ],
      [
        "Veterinary",
        -0.16708,
        5.55684
      ],
      [
        "Labone",
        -0.17356,
        5.56299
      ],
      [
        "Danquah First",
        -0.17976,
        5.56643
      ],
      [
        "Danquah Second",
        -0.18172,
        5.56751
      ],
      [
        "Police Headquarters",
        -0.18841,
        5.57127
      ],
      [
        "Sankara",
        -0.19122,
        5.5728
      ],
      [
        "GBC",
        -0.19267,
        5.5735
      ],
      [
        "Mobil",
        -0.19752,
        5.57413
      ],
      [
        "Nima Police Station",
        -0.20079,
        5.57421
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ],
      [
        "Circle",
        -0.21327,
        5.56961
      ]
    ]
  },
  {
    "id": "gtfs_7553882_151",
    "name": "Darkuman ↔ Accra CMB",
    "color": "#1779c2",
    "stops": [
      [
        "Darkuman",
        -0.25121,
        5.58876
      ],
      [
        "Quarters",
        -0.24999,
        5.58626
      ],
      [
        "Mangoase",
        -0.24822,
        5.58626
      ],
      [
        "Asoredanho",
        -0.24215,
        5.58624
      ],
      [
        "Wireless",
        -0.24028,
        5.58624
      ],
      [
        "Washingbay",
        -0.23954,
        5.58623
      ],
      [
        "Awony3",
        -0.23907,
        5.58529
      ],
      [
        "Ayigbe town",
        -0.24,
        5.58343
      ],
      [
        "Fita",
        -0.23905,
        5.58135
      ],
      [
        "Ayigbe Town Old Station",
        -0.23981,
        5.58044
      ],
      [
        "Obeyeyie",
        -0.23901,
        5.57912
      ],
      [
        "Cemetry",
        -0.23875,
        5.57786
      ],
      [
        "Ola Balm",
        -0.23844,
        5.57601
      ],
      [
        "Mothers Inn",
        -0.23129,
        5.57335
      ],
      [
        "Roundabout",
        -0.23062,
        5.57193
      ],
      [
        "Awudome",
        -0.22819,
        5.5692
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Roundabout",
        -0.22858,
        5.56259
      ],
      [
        "Kaneshie Roundabout",
        -0.22797,
        5.56041
      ],
      [
        "Rana motors",
        -0.2254,
        5.55886
      ],
      [
        "Cold store",
        -0.22221,
        5.55695
      ],
      [
        "Graphic",
        -0.2197,
        5.55551
      ],
      [
        "First Gate",
        -0.21472,
        5.55425
      ],
      [
        "Kingsway",
        -0.21123,
        5.55337
      ],
      [
        "Railways",
        -0.211,
        5.55227
      ],
      [
        "Kingsway",
        -0.21093,
        5.55186
      ],
      [
        "Accra",
        -0.21396,
        5.5524
      ]
    ]
  },
  {
    "id": "gtfs_7499148_153",
    "name": "Darkuman ↔ Accra Post - Office",
    "color": "#1779c2",
    "stops": [
      [
        "Darkuman",
        -0.251,
        5.58895
      ],
      [
        "Quarters",
        -0.25168,
        5.58565
      ],
      [
        "Masalatsi",
        -0.2517,
        5.58227
      ],
      [
        "Post Office",
        -0.25134,
        5.58198
      ],
      [
        "Atico",
        -0.24606,
        5.58079
      ],
      [
        "Datus",
        -0.24268,
        5.58197
      ],
      [
        "Pharmacy",
        -0.24089,
        5.58097
      ],
      [
        "Bubuashie",
        -0.23989,
        5.58029
      ],
      [
        "Obeyeyie",
        -0.23901,
        5.57912
      ],
      [
        "Cemetry",
        -0.23875,
        5.57786
      ],
      [
        "Mothers Inn",
        -0.23129,
        5.57335
      ],
      [
        "Roundabout",
        -0.23062,
        5.57193
      ],
      [
        "Awudome",
        -0.22819,
        5.5692
      ],
      [
        "State Transport",
        -0.22551,
        5.56539
      ],
      [
        "Roundabout",
        -0.22858,
        5.56259
      ],
      [
        "Abossey Okai",
        -0.22992,
        5.56048
      ],
      [
        "Total",
        -0.23051,
        5.55947
      ],
      [
        "Ayigbe Town",
        -0.23147,
        5.55384
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.23002,
        5.55069
      ],
      [
        "Mortuary",
        -0.2265,
        5.54304
      ],
      [
        "Junction",
        -0.22196,
        5.53786
      ],
      [
        "Boxing Arena",
        -0.22062,
        5.53734
      ],
      [
        "UTC",
        -0.21797,
        5.53793
      ],
      [
        "UTC",
        -0.21721,
        5.53809
      ],
      [
        "Agbado",
        -0.21512,
        5.53859
      ],
      [
        "Akoto Lante",
        -0.21312,
        5.53887
      ],
      [
        "One Way",
        -0.21025,
        5.53703
      ],
      [
        "Ussher Fort",
        -0.20893,
        5.53834
      ],
      [
        "Salaga Market",
        -0.20907,
        5.53978
      ],
      [
        "Salaga Junction",
        -0.20919,
        5.54158
      ],
      [
        "Accra Post Office",
        -0.20977,
        5.54198
      ]
    ]
  },
  {
    "id": "gtfs_7492935_155",
    "name": "Dzorwulu ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Dzorwolu",
        -0.19588,
        5.61647
      ],
      [
        "Special Ice",
        -0.19779,
        5.61228
      ],
      [
        "Last Chance",
        -0.19896,
        5.61156
      ],
      [
        "Bayere Junction",
        -0.20039,
        5.61132
      ],
      [
        "Vulcanizer",
        -0.20085,
        5.61181
      ],
      [
        "Sea Theatre",
        -0.20355,
        5.61149
      ],
      [
        "Dzorwulu Junction",
        -0.20672,
        5.60843
      ],
      [
        "Ebony",
        -0.20315,
        5.60226
      ],
      [
        "Asore Junction",
        -0.20224,
        5.60168
      ],
      [
        "Pig Farm Station",
        -0.19844,
        5.59828
      ],
      [
        "Kotobabi Down",
        -0.19888,
        5.59741
      ],
      [
        "Top Class",
        -0.19909,
        5.59707
      ],
      [
        "Club 1000",
        -0.20034,
        5.59609
      ],
      [
        "Abavana",
        -0.20247,
        5.59443
      ],
      [
        "Kotobabi Police Station",
        -0.20425,
        5.59239
      ],
      [
        "Taxi Rank",
        -0.2054,
        5.59215
      ],
      [
        "Nkansah Gyan",
        -0.20627,
        5.59115
      ],
      [
        "Five five",
        -0.20726,
        5.58977
      ],
      [
        "Master Chef",
        -0.20742,
        5.58882
      ],
      [
        "Agbadinar",
        -0.20749,
        5.58825
      ],
      [
        "Lapaz Station",
        -0.20824,
        5.58409
      ],
      [
        "College",
        -0.2084,
        5.58326
      ],
      [
        "New Town",
        -0.20849,
        5.58272
      ],
      [
        "Nima Junction",
        -0.20858,
        5.58237
      ],
      [
        "Mallam Atta",
        -0.20905,
        5.58166
      ],
      [
        "Asantewaa",
        -0.2105,
        5.57969
      ],
      [
        "Fidelity",
        -0.21203,
        5.57763
      ],
      [
        "Express",
        -0.21268,
        5.57677
      ],
      [
        "Quarters",
        -0.21405,
        5.57497
      ],
      [
        "City Lights",
        -0.21447,
        5.57436
      ],
      [
        "Circle",
        -0.21585,
        5.57302
      ]
    ]
  },
  {
    "id": "gtfs_7492990_157",
    "name": "East Legon ↔ Circle",
    "color": "#1779c2",
    "stops": [
      [
        "East Legon",
        -0.15077,
        5.64832
      ],
      [
        "Bridge",
        -0.155,
        5.64632
      ],
      [
        "Bawaleshie Acheampong",
        -0.15992,
        5.64296
      ],
      [
        "Beduwa",
        -0.16117,
        5.64252
      ],
      [
        "Banku Junction",
        -0.16911,
        5.63977
      ],
      [
        "Mensvic",
        -0.17161,
        5.63709
      ],
      [
        "Emmanuel Eye Clinic",
        -0.17461,
        5.63012
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Spanner",
        -0.17649,
        5.62051
      ],
      [
        "Shangrila",
        -0.1761,
        5.61607
      ],
      [
        "Airport First",
        -0.17725,
        5.60808
      ],
      [
        "Airport Second",
        -0.17812,
        5.60419
      ],
      [
        "Opeibea First",
        -0.17951,
        5.59801
      ],
      [
        "Opeibea Second",
        -0.18012,
        5.59526
      ],
      [
        "37",
        -0.18105,
        5.59117
      ],
      [
        "37 Hospital",
        -0.18311,
        5.58762
      ],
      [
        "37 Water Works",
        -0.18549,
        5.58253
      ],
      [
        "Flagstaff House",
        -0.18811,
        5.57637
      ],
      [
        "Sankara",
        -0.19122,
        5.5728
      ],
      [
        "GBC",
        -0.19267,
        5.5735
      ],
      [
        "Mobil",
        -0.19752,
        5.57413
      ],
      [
        "Paloma",
        -0.20589,
        5.57206
      ],
      [
        "Equip",
        -0.21019,
        5.57112
      ],
      [
        "Circle Overhead",
        -0.21399,
        5.57014
      ]
    ]
  },
  {
    "id": "gtfs_7554557_159",
    "name": "Adjiringanor ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Adjiringanor (Block factory)",
        -0.13254,
        5.64844
      ],
      [
        "Adjringanor/Otanor",
        -0.13457,
        5.64678
      ],
      [
        "Adringanor Basic School Junction",
        -0.13517,
        5.64639
      ],
      [
        "Gate",
        -0.13736,
        5.64577
      ],
      [
        "Adjiringanor Bridge",
        -0.14498,
        5.64587
      ],
      [
        "Curve",
        -0.1489,
        5.64568
      ],
      [
        "American House",
        -0.14967,
        5.64704
      ],
      [
        "Bridge",
        -0.155,
        5.64632
      ],
      [
        "Bawaleshie Acheampong",
        -0.15992,
        5.64296
      ],
      [
        "Beduwa",
        -0.16117,
        5.64252
      ],
      [
        "Bawaleshie First",
        -0.16485,
        5.64217
      ],
      [
        "Bawaleshi Second",
        -0.16732,
        5.64187
      ],
      [
        "Banku Junction",
        -0.16972,
        5.64125
      ],
      [
        "KFC Junction",
        -0.16969,
        5.63963
      ],
      [
        "Mensvic",
        -0.17161,
        5.63709
      ],
      [
        "Emmanuel Eye Clinic",
        -0.17461,
        5.63012
      ],
      [
        "Shiashie",
        -0.17677,
        5.62841
      ],
      [
        "Spanner",
        -0.17649,
        5.62051
      ],
      [
        "Shangrila",
        -0.1761,
        5.61607
      ],
      [
        "Airport First",
        -0.17725,
        5.60808
      ],
      [
        "Airport Second",
        -0.17812,
        5.60419
      ],
      [
        "Opeibea First",
        -0.17951,
        5.59801
      ],
      [
        "Opeibea Second",
        -0.18012,
        5.59526
      ],
      [
        "37",
        -0.18105,
        5.59117
      ],
      [
        "37 Hospital",
        -0.18311,
        5.58762
      ],
      [
        "37 Water Works",
        -0.18549,
        5.58253
      ],
      [
        "Flagstaff House",
        -0.18811,
        5.57637
      ],
      [
        "Sankara",
        -0.19124,
        5.57071
      ],
      [
        "ADB House",
        -0.1944,
        5.56454
      ],
      [
        "Ridge",
        -0.19663,
        5.5605
      ],
      [
        "Childrens Park First",
        -0.19844,
        5.55801
      ],
      [
        "Childrens Park Second",
        -0.19953,
        5.55666
      ],
      [
        "Novotel",
        -0.20197,
        5.5534
      ],
      [
        "Kinbu",
        -0.20419,
        5.55128
      ],
      [
        "Accra New Tema Station",
        -0.20105,
        5.54867
      ]
    ]
  },
  {
    "id": "gtfs_7461906_399",
    "name": "Odorkor ↔ Kasoa",
    "color": "#1779c2",
    "stops": [
      [
        "Odorkor (Main Bus stop)",
        -0.26369,
        5.58043
      ],
      [
        "Mallam Market",
        -0.27876,
        5.57393
      ],
      [
        "Mallam Junction",
        -0.28595,
        5.56983
      ],
      [
        "McCarthy Junction",
        -0.28894,
        5.56551
      ],
      [
        "Mendskrom",
        -0.29718,
        5.55834
      ],
      [
        "Weija Junction",
        -0.30385,
        5.55591
      ],
      [
        "Tetegu",
        -0.30967,
        5.55394
      ],
      [
        "Modex",
        -0.32232,
        5.5533
      ],
      [
        "Weija Barrier",
        -0.33036,
        5.55093
      ],
      [
        "Block Factory",
        -0.33548,
        5.54885
      ],
      [
        "SCC",
        -0.33874,
        5.54754
      ],
      [
        "Shoprite",
        -0.34208,
        5.54639
      ],
      [
        "Bortianor",
        -0.34822,
        5.54779
      ],
      [
        "Ayigbe Town",
        -0.35383,
        5.55023
      ],
      [
        "Mile Eleven",
        -0.35566,
        5.55095
      ],
      [
        "Broadcasting",
        -0.35896,
        5.5523
      ],
      [
        "Tuba",
        -0.38253,
        5.54688
      ],
      [
        "Chinese",
        -0.38978,
        5.54341
      ],
      [
        "Brigade",
        -0.39465,
        5.54108
      ],
      [
        "Galelia",
        -0.39889,
        5.53907
      ],
      [
        "Galelia Market",
        -0.40138,
        5.53824
      ],
      [
        "Washing Bay",
        -0.40629,
        5.53688
      ],
      [
        "Iron City",
        -0.41096,
        5.53578
      ],
      [
        "Amanfrom",
        -0.41282,
        5.53569
      ],
      [
        "Pink FM",
        -0.41634,
        5.53568
      ],
      [
        "Second",
        -0.41895,
        5.53554
      ],
      [
        "Kasoa",
        -0.4238,
        5.53479
      ]
    ]
  },
  {
    "id": "gtfs_7547619_48",
    "name": "Cantonment ↔ Accra Bishop",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Bishop",
        -0.20451,
        5.54324
      ],
      [
        "Ama",
        -0.20383,
        5.54482
      ],
      [
        "Tema station",
        -0.20154,
        5.54808
      ],
      [
        "Ministries",
        -0.19469,
        5.54857
      ],
      [
        "First Stop",
        -0.18893,
        5.54965
      ],
      [
        "Second Stop",
        -0.18545,
        5.55039
      ],
      [
        "Five Junction",
        -0.18441,
        5.55224
      ],
      [
        "Osu Shell",
        -0.18272,
        5.55626
      ],
      [
        "Shell",
        -0.1823,
        5.55802
      ],
      [
        "Papaye",
        -0.18214,
        5.55975
      ],
      [
        "SNNIT",
        -0.1816,
        5.56277
      ],
      [
        "Penta Hotel",
        -0.18116,
        5.56536
      ],
      [
        "Police Hospital",
        -0.18074,
        5.56799
      ],
      [
        "Prisons",
        -0.18041,
        5.56997
      ],
      [
        "Morning Star",
        -0.1796,
        5.57342
      ],
      [
        "Junction",
        -0.1746,
        5.57884
      ],
      [
        "IGP",
        -0.17124,
        5.57887
      ],
      [
        "Cantonments",
        -0.17079,
        5.57761
      ]
    ]
  },
  {
    "id": "gtfs_7551894_46",
    "name": "Banana Inn ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20105,
        5.54867
      ],
      [
        "Tema Station Union of GPRTU",
        -0.20075,
        5.5487
      ],
      [
        "Court",
        -0.20435,
        5.54444
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "Accra Post Office",
        -0.20977,
        5.54198
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Korle Bu",
        -0.22705,
        5.53612
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Shell",
        -0.23781,
        5.53374
      ],
      [
        "Mamprobi Police Station",
        -0.23974,
        5.53396
      ],
      [
        "Rainbow",
        -0.24084,
        5.53425
      ],
      [
        "Mamprobi Methodist",
        -0.24382,
        5.53511
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24626,
        5.53563
      ],
      [
        "IBE",
        -0.24779,
        5.53906
      ],
      [
        "Abodoo Bridge",
        -0.25158,
        5.54003
      ],
      [
        "Banana Inn",
        -0.2548,
        5.54183
      ]
    ]
  },
  {
    "id": "gtfs_7478026_44",
    "name": "Banana Inn ↔ Accra Post Office",
    "color": "#1779c2",
    "stops": [
      [
        "Accra Post Office",
        -0.20899,
        5.5405
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Korle Bu",
        -0.22705,
        5.53612
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "New Station",
        -0.23023,
        5.53539
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Shell",
        -0.23781,
        5.53374
      ],
      [
        "Rainbow",
        -0.24084,
        5.53425
      ],
      [
        "Mamprobi Methodist",
        -0.24382,
        5.53511
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24626,
        5.53563
      ],
      [
        "IBE",
        -0.24779,
        5.53906
      ],
      [
        "Abodoo Bridge",
        -0.25158,
        5.54003
      ],
      [
        "Banana Inn",
        -0.2548,
        5.54183
      ]
    ]
  },
  {
    "id": "gtfs_7476640_42",
    "name": "Kaneshie ↔ Atico",
    "color": "#1779c2",
    "stops": [
      [
        "Atico",
        -0.24858,
        5.57569
      ],
      [
        "Add a name to the stop with JungleBus app",
        -0.24353,
        5.58199
      ],
      [
        "Pharmacy",
        -0.24089,
        5.58097
      ],
      [
        "Bubuashie",
        -0.23989,
        5.58029
      ],
      [
        "Obeyeyie",
        -0.23901,
        5.57912
      ],
      [
        "Cemetry",
        -0.23875,
        5.57786
      ],
      [
        "Ola Balm",
        -0.23844,
        5.57601
      ],
      [
        "Cottage",
        -0.2381,
        5.57394
      ],
      [
        "Bishop",
        -0.23892,
        5.5721
      ],
      [
        "Mighty Power",
        -0.23752,
        5.57026
      ],
      [
        "Ekutu Junction",
        -0.23703,
        5.5685
      ],
      [
        "Kaneshie Last Stop",
        -0.23401,
        5.56625
      ],
      [
        "Kaneshie Market Station",
        -0.23525,
        5.56582
      ]
    ]
  },
  {
    "id": "gtfs_7547534_40",
    "name": "Russia ↔ Arena",
    "color": "#1779c2",
    "stops": [
      [
        "Arena",
        -0.21588,
        5.54518
      ],
      [
        "Palledium",
        -0.21565,
        5.54201
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Accra Royal",
        -0.22178,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Ayigbe Town",
        -0.23121,
        5.55374
      ],
      [
        "Happy Days",
        -0.23238,
        5.55569
      ],
      [
        "Laskia",
        -0.23557,
        5.55639
      ],
      [
        "Great Lamptey",
        -0.2372,
        5.55678
      ],
      [
        "Zongo Junction",
        -0.24077,
        5.55759
      ],
      [
        "Club Corner",
        -0.24348,
        5.55822
      ],
      [
        "Flamingo",
        -0.24704,
        5.55891
      ],
      [
        "Ashtown",
        -0.24905,
        5.55935
      ],
      [
        "Paa Willie",
        -0.25188,
        5.5595
      ],
      [
        "Russia",
        -0.2514,
        5.5564
      ],
      [
        "Omanko",
        -0.25337,
        5.55591
      ],
      [
        "Russia Station",
        -0.25463,
        5.55463
      ]
    ]
  },
  {
    "id": "gtfs_7563761_489",
    "name": "Zongo Junction ↔ Chorkor",
    "color": "#1779c2",
    "stops": [
      [
        "Zongo Junction",
        -0.24018,
        5.55648
      ],
      [
        "Pipeier Naa",
        -0.2402,
        5.55294
      ],
      [
        "Black Smith",
        -0.24021,
        5.55083
      ],
      [
        "Radio Gold",
        -0.24021,
        5.54863
      ],
      [
        "Salvation Army",
        -0.23953,
        5.54165
      ],
      [
        "Sempe Second",
        -0.23982,
        5.53785
      ],
      [
        "Liju",
        -0.24135,
        5.53616
      ],
      [
        "Abodwe",
        -0.2423,
        5.53513
      ],
      [
        "Girl School",
        -0.24262,
        5.53192
      ],
      [
        "Kakalika",
        -0.24255,
        5.53101
      ],
      [
        "Extra O",
        -0.24237,
        5.52878
      ],
      [
        "Tea Gadern",
        -0.24227,
        5.52764
      ],
      [
        "Alomo Junction",
        -0.24372,
        5.5268
      ],
      [
        "Lantemame",
        -0.24591,
        5.52663
      ],
      [
        "Bridge",
        -0.24897,
        5.52638
      ],
      [
        "Chokor/ Chemuna",
        -0.25046,
        5.52625
      ]
    ]
  },
  {
    "id": "gtfs_7570158_487",
    "name": "Zongo Junction ↔ Agege",
    "color": "#1779c2",
    "stops": [
      [
        "Zongo Junction",
        -0.24077,
        5.55759
      ],
      [
        "Club Corner",
        -0.24348,
        5.55822
      ],
      [
        "Flamingo",
        -0.24704,
        5.55891
      ],
      [
        "Ashtown",
        -0.24905,
        5.55935
      ],
      [
        "Paa Willie",
        -0.25211,
        5.55965
      ],
      [
        "Mars Junction",
        -0.25372,
        5.55915
      ],
      [
        "Okwahu Motors",
        -0.25576,
        5.55868
      ],
      [
        "Slow Down",
        -0.25693,
        5.55841
      ],
      [
        "Dansoman First Stop",
        -0.26019,
        5.55998
      ],
      [
        "Zodiac",
        -0.26228,
        5.56016
      ],
      [
        "Dansoman Roundabout",
        -0.26485,
        5.55728
      ],
      [
        "King Solomon",
        -0.2646,
        5.55525
      ],
      [
        "Mamas Inn",
        -0.2646,
        5.55441
      ],
      [
        "Beecham",
        -0.26462,
        5.5521
      ],
      [
        "Sahara",
        -0.26465,
        5.54981
      ],
      [
        "Emmanuel Presby",
        -0.26463,
        5.5484
      ],
      [
        "Dansoman Control",
        -0.26465,
        5.54629
      ],
      [
        "Dansoman Police Station",
        -0.2647,
        5.54403
      ],
      [
        "Dansoman Market",
        -0.26475,
        5.54151
      ],
      [
        "Exhibition (Dansoman)",
        -0.26489,
        5.53799
      ],
      [
        "Seven Great",
        -0.26517,
        5.53567
      ],
      [
        "Kofi ne Ama",
        -0.26531,
        5.53305
      ],
      [
        "Dansoman Last Stop",
        -0.26531,
        5.5297
      ],
      [
        "Agege",
        -0.26469,
        5.529
      ]
    ]
  },
  {
    "id": "gtfs_7570243_485",
    "name": "Zambrama Line ↔ Odorna-Circle",
    "color": "#1779c2",
    "stops": [
      [
        "Zambrama Line",
        -0.25704,
        5.54962
      ],
      [
        "Akoo Store",
        -0.25522,
        5.54974
      ],
      [
        "Mango Down",
        -0.25652,
        5.54284
      ],
      [
        "Banana Inn",
        -0.25504,
        5.54186
      ],
      [
        "Banana Inn Transformer",
        -0.2532,
        5.54083
      ],
      [
        "Abodoo Bridge",
        -0.25114,
        5.53965
      ],
      [
        "St.Marys",
        -0.24909,
        5.5387
      ],
      [
        "IBE",
        -0.24738,
        5.53903
      ],
      [
        "Downright",
        -0.24294,
        5.53975
      ],
      [
        "Summerhut",
        -0.23959,
        5.54053
      ],
      [
        "Salvation Army",
        -0.23928,
        5.54097
      ],
      [
        "Korle Bu Junction",
        -0.23993,
        5.5436
      ],
      [
        "Ayigbe Town",
        -0.23121,
        5.55374
      ],
      [
        "Total",
        -0.23102,
        5.55817
      ],
      [
        "Abossey Okai",
        -0.23031,
        5.55945
      ],
      [
        "Roundabout",
        -0.22882,
        5.562
      ],
      [
        "State Transport",
        -0.22551,
        5.56518
      ],
      [
        "Neoplan",
        -0.21857,
        5.56952
      ]
    ]
  },
  {
    "id": "gtfs_7571012_483",
    "name": "Zambrama Line ↔ Kaneshie",
    "color": "#1779c2",
    "stops": [
      [
        "Zambrama Line",
        -0.25704,
        5.54962
      ],
      [
        "Akoo Store",
        -0.25522,
        5.54974
      ],
      [
        "Banana Inn",
        -0.25504,
        5.54186
      ],
      [
        "Banana Inn Transformer",
        -0.2532,
        5.54083
      ],
      [
        "Abodoo Bridge",
        -0.25114,
        5.53965
      ],
      [
        "St.Marys",
        -0.24909,
        5.5387
      ],
      [
        "IBE",
        -0.24738,
        5.53903
      ],
      [
        "Downright",
        -0.24285,
        5.53989
      ],
      [
        "Summerhut",
        -0.24005,
        5.54038
      ],
      [
        "Salvation Army",
        -0.23928,
        5.54097
      ],
      [
        "Korle Bu Junction",
        -0.23993,
        5.5436
      ],
      [
        "Radio Gold",
        -0.24013,
        5.54807
      ],
      [
        "Black Smith",
        -0.24012,
        5.55111
      ],
      [
        "Pipeier Naa",
        -0.24013,
        5.5535
      ],
      [
        "Kasoa Station",
        -0.24014,
        5.55627
      ],
      [
        "Zongo Junction",
        -0.24007,
        5.55682
      ],
      [
        "Asoredan ho",
        -0.23859,
        5.56119
      ],
      [
        "Kaneshie",
        -0.2374,
        5.56231
      ]
    ]
  },
  {
    "id": "gtfs_7571156_481",
    "name": "Zambrama Line ↔ Arena",
    "color": "#1779c2",
    "stops": [
      [
        "Zambrama Line",
        -0.25704,
        5.54962
      ],
      [
        "Loso",
        -0.25453,
        5.55114
      ],
      [
        "Sukura Market",
        -0.25139,
        5.55228
      ],
      [
        "Flamingo",
        -0.24656,
        5.55818
      ],
      [
        "Seven great junction",
        -0.24442,
        5.55832
      ],
      [
        "Block Factory junction",
        -0.24353,
        5.55815
      ],
      [
        "Zongo junction",
        -0.24054,
        5.55748
      ],
      [
        "Great Lamptey",
        -0.23738,
        5.55674
      ],
      [
        "Happy Days",
        -0.23447,
        5.55607
      ],
      [
        "Abossey Okai junction",
        -0.23365,
        5.55591
      ],
      [
        "Total",
        -0.23102,
        5.55817
      ],
      [
        "Sabolai",
        -0.2254,
        5.55503
      ],
      [
        "Seconds",
        -0.22324,
        5.55267
      ],
      [
        "Market",
        -0.2216,
        5.5512
      ],
      [
        "Galloway",
        -0.21806,
        5.54802
      ],
      [
        "Arena",
        -0.21588,
        5.54518
      ]
    ]
  },
  {
    "id": "gtfs_7458055_472",
    "name": "Sukura ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "Tema Station Union of GPRTU",
        -0.20075,
        5.5487
      ],
      [
        "Court",
        -0.20435,
        5.54444
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "UTC",
        -0.21836,
        5.53804
      ],
      [
        "Mortuary",
        -0.22634,
        5.54316
      ],
      [
        "Market",
        -0.23701,
        5.55281
      ],
      [
        "Pipeier Naa",
        -0.24013,
        5.5535
      ],
      [
        "Junction",
        -0.24328,
        5.55611
      ],
      [
        "La bay",
        -0.24686,
        5.55568
      ],
      [
        "Banku Junction",
        -0.24755,
        5.55378
      ],
      [
        "Borla Junction",
        -0.24762,
        5.55093
      ],
      [
        "Sukura",
        -0.24929,
        5.55062
      ]
    ]
  },
  {
    "id": "gtfs_7571215_470",
    "name": "Chemuna ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "Court",
        -0.20435,
        5.54444
      ],
      [
        "Accra Bishop",
        -0.20486,
        5.54374
      ],
      [
        "Post Office",
        -0.20858,
        5.54221
      ],
      [
        "Akoto Lante",
        -0.21312,
        5.53887
      ],
      [
        "Jamestown Police Station",
        -0.21358,
        5.53614
      ],
      [
        "Accra Royal",
        -0.21499,
        5.53547
      ],
      [
        "Fire Service",
        -0.21693,
        5.53211
      ],
      [
        "Korle er naa",
        -0.21939,
        5.53141
      ],
      [
        "Nzunzu",
        -0.22411,
        5.53011
      ],
      [
        "Korle gonno shell",
        -0.22491,
        5.52994
      ],
      [
        "1st stop",
        -0.22702,
        5.5295
      ],
      [
        "Korle beach resort",
        -0.22791,
        5.5293
      ],
      [
        "Ama Mensah",
        -0.23003,
        5.52888
      ],
      [
        "Galilee",
        -0.2335,
        5.52816
      ],
      [
        "Hotel Junction",
        -0.23426,
        5.528
      ],
      [
        "Wolarm",
        -0.23557,
        5.52775
      ],
      [
        "White House",
        -0.23614,
        5.52763
      ],
      [
        "Tei Abaa",
        -0.23808,
        5.5273
      ],
      [
        "Tea Garden",
        -0.24168,
        5.52698
      ],
      [
        "Alomo Junction",
        -0.24372,
        5.5268
      ],
      [
        "Lantemame",
        -0.24591,
        5.52663
      ],
      [
        "Bridge",
        -0.24897,
        5.52638
      ],
      [
        "Chokor/ Chemuna",
        -0.25046,
        5.52625
      ]
    ]
  },
  {
    "id": "gtfs_7457826_474",
    "name": "Trade Fair (La) ↔ Accra New Tema Station",
    "color": "#1779c2",
    "stops": [
      [
        "Accra New Tema Station",
        -0.20112,
        5.54867
      ],
      [
        "First Stop",
        -0.18893,
        5.54965
      ],
      [
        "Second Stop",
        -0.18425,
        5.55061
      ],
      [
        "Anoorhor",
        -0.18222,
        5.55073
      ],
      [
        "Osu Police Station",
        -0.17816,
        5.55223
      ],
      [
        "Rigal Bus stop",
        -0.17586,
        5.55309
      ],
      [
        "Arko Adjei",
        -0.1708,
        5.55482
      ],
      [
        "Curve",
        -0.16793,
        5.55589
      ],
      [
        "Polyclinic",
        -0.16661,
        5.55638
      ],
      [
        "Kpogas",
        -0.1647,
        5.55713
      ],
      [
        "Total",
        -0.16,
        5.55914
      ],
      [
        "Maami",
        -0.15806,
        5.55968
      ],
      [
        "Nmotsaanaa",
        -0.15631,
        5.55978
      ],
      [
        "Police Station La",
        -0.1531,
        5.56134
      ],
      [
        "Agus",
        -0.15228,
        5.56337
      ],
      [
        "Auntie Otsoo",
        -0.15145,
        5.56409
      ],
      [
        "New Life",
        -0.14994,
        5.56636
      ],
      [
        "Akrowa House",
        -0.14909,
        5.56772
      ],
      [
        "Trade Fair (La)",
        -0.14832,
        5.5689
      ]
    ]
  },
  {
    "id": "gtfs_7456376_478",
    "name": "Zambrama Line ↔ Agbogbloshie 2",
    "color": "#1779c2",
    "stops": [
      [
        "Agbogbloshie",
        -0.21636,
        5.54997
      ],
      [
        "Korle-Bu Barber",
        -0.22333,
        5.53692
      ],
      [
        "Korle Bu",
        -0.22705,
        5.53612
      ],
      [
        "Total",
        -0.22897,
        5.53567
      ],
      [
        "Awotsɛ Kojo",
        -0.23297,
        5.53483
      ],
      [
        "Plaza",
        -0.23549,
        5.53428
      ],
      [
        "Mamprobi Shell",
        -0.23781,
        5.53374
      ],
      [
        "Rainbow",
        -0.24084,
        5.53425
      ],
      [
        "Mamprobi Methodist",
        -0.24382,
        5.53511
      ],
      [
        "Akoshi Junction Mamprobi",
        -0.24626,
        5.53563
      ],
      [
        "IBE",
        -0.24779,
        5.53906
      ],
      [
        "Abodoo Bridge",
        -0.25158,
        5.54003
      ],
      [
        "Banana Inn",
        -0.2548,
        5.54183
      ],
      [
        "Borla",
        -0.25417,
        5.54412
      ],
      [
        "Masalatsi",
        -0.25407,
        5.54569
      ],
      [
        "Five Five",
        -0.25403,
        5.54691
      ],
      [
        "Station",
        -0.25524,
        5.54701
      ],
      [
        "Zambrama Line",
        -0.25735,
        5.54969
      ]
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
  var stopGroups = {};   // alias group -> every physically distinct stop sharing that name

  function quickMeters(lon1, lat1, lon2, lat2) {
    var dLat = (lat2 - lat1) * 111320;
    var dLon = (lon2 - lon1) * 111320 * Math.cos((lat1 + lat2) * Math.PI / 360);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Aliases (e.g. 'Palm Wine' / 'Labadi Bush Canteen') describe the same NAME, not
   * necessarily the same PLACE. Entries are only merged when they are physically the
   * same spot; otherwise each keeps its real coordinates so walking distances to it
   * are true. Siblings stay linked as walk transfers (see rebuildTransfers).
   */
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

  function indexRoute(r) {
    if (!r || !r.stops || !r.stops.length) return;
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
        // Same-name siblings stay connected (as before) but with their TRUE walking distance.
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
      nb.stop.legs.forEach(function (leg) {
        if (!st.legs.some(function (l) { return l.to.name === leg.to.name && l.route.id === leg.route.id; })) {
          st.legs.push({ to: leg.to, route: leg.route });
        }
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

  /**
   * A name can map to several physical stops (same-name poles that are far apart).
   * When the user types a name, use the best-connected one (the real interchange).
   */
  function bestPole(st) {
    if (!st || !st.group) return st;
    var sibs = stopGroups[st.group];
    if (!sibs || sibs.length < 2) return st;
    var best = st;
    for (var i = 0; i < sibs.length; i++) {
      if (sibs[i].routeIds.length > best.routeIds.length) best = sibs[i];
    }
    return best;
  }

  function matchStop(text) {
    var m = matchStopRaw(text);
    if (m && m.stop && m.stop.group) m.stop = bestPole(m.stop);
    return m;
  }

  function matchStopRaw(text) {
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
  function rideMinutes(meters) {
    var km = meters / 1000;
    if (km > 50) return (km / 65) * 60; // Highway coach/trotro: 65 km/h
    if (km > 15) return (km / 40) * 60; // Arterial motorway: 40 km/h
    return (km / meta.urbanSpeedKph) * 60; // Urban street crawl: 20 km/h
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
          if (route && used['route:' + route.id]) cost += meta.alternativePenaltyMinutes;
          else if (used[edgeKey]) cost += (meta.alternativePenaltyMinutes * 0.25);
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
        if (used['transfer:' + canonical(stop.name)] || used['transfer:' + stop.name]) {
          acost += (meta.alternativePenaltyMinutes * 1.5);
        }
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
          if (used['transfer:' + canonical(other.name)] || used['transfer:' + canonical(stop.name)] ||
              used['transfer:' + other.name] || used['transfer:' + stop.name]) {
            wcost += (meta.alternativePenaltyMinutes * 1.5);
          }
          if (best[wkey] == null || wcost < best[wkey]) {
            push(wkey, wcost);
            prev[wkey] = { from: node.key, move: 'walkTransfer', to: other, fromStop: stop, meters: wm };
          }
        }

        var destM = haversineM([stop.lon, stop.lat], destination);
        if (ridden && (destM <= meta.egressWalkM || best['F'] == null)) {
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
      // (the displayed time stays the honest clock time).
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
      return { ok: false, reason: 'No connecting trotro routes found between these locations.', itineraries: [] };
    }

    results.sort(function (a, b) {
      // All time comparisons use rankMinutes: journey time + extra weight for the walk to the
      // first car, so a car boarded at (or near) the passenger beats one that needs a long walk.
      var aMin = a.rankMinutes != null ? a.rankMinutes : a.totalMinutes;
      var bMin = b.rankMinutes != null ? b.rankMinutes : b.totalMinutes;

      // 1. Commuter preference: Fewer vehicle transfers is strongly favored in Ghana
      if (a.transfers !== b.transfers) {
        var diff = aMin - bMin;
        // A route with fewer transfers wins unless the alternative is massively faster (> 18 min)
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
      if (aHubScore !== bHubScore && Math.abs(aMin - bMin) < 14) {
        return aHubScore - bHubScore;
      }
      // 3. Journey time (effort-adjusted ETA)
      if (Math.abs(aMin - bMin) > 3) {
        return aMin - bMin;
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
    stop: function (name) { return bestPole(stops[canonical(name)]) || null; },
    route: routeName,
    haversineM: haversineM,
    canonical: canonical,
    allStops: allStops,
    setAllStops: setAllStops,
    loadAllStops: loadAllStops,
    nearestStops: nearestStops,
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

export const TRANSIT_HUBS = (typeof globalThis !== 'undefined' && globalThis.TrotroNetwork && globalThis.TrotroNetwork.TRANSIT_HUBS) || {};
export const getStationTier = function (name) { return globalThis.TrotroNetwork ? globalThis.TrotroNetwork.getStationTier(name) : 'MINOR'; };
export const getStationTierWeight = function (name) { return globalThis.TrotroNetwork ? globalThis.TrotroNetwork.getStationTierWeight(name) : 20; };
export const calculateEdgeCost = function (params) { return globalThis.TrotroNetwork ? globalThis.TrotroNetwork.calculateEdgeCost(params) : 0; };
export const findBestTrotroPath = function (start, end) { return globalThis.TrotroNetwork ? globalThis.TrotroNetwork.findBestTrotroPath(start, end) : null; };

export default (typeof globalThis !== 'undefined' && globalThis.TrotroNetwork) ? globalThis.TrotroNetwork : {};