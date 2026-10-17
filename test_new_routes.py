import re

with open('trotro-network.js', 'r', encoding='utf-8') as f:
    src = f.read()

# Routes to insert
new_routes_js = '''
    // --- Giffard Road / Palm Wine / Osu / Labadi Corridors ---
    {
      id: 'palmwine-circle', name: 'Palm Wine -> Circle', color: '#0284c7',
      stops: [['Palm Wine', -0.1522, 5.5764], ['Villas', -0.1544, 5.5782], ['Wireless Station', -0.1580, 5.5780], ['Osu', -0.1820, 5.5577], ['Adabraka', -0.2050, 5.5595], ['Circle', -0.2177, 5.5568]]
    },
    {
      id: 'circle-palmwine', name: 'Circle -> Palm Wine', color: '#0284c7',
      stops: [['Circle', -0.2177, 5.5568], ['Adabraka', -0.2050, 5.5595], ['Osu', -0.1820, 5.5577], ['Wireless Station', -0.1580, 5.5780], ['Villas', -0.1544, 5.5782], ['Palm Wine', -0.1522, 5.5764]]
    },
    {
      id: 'palmwine-madina', name: 'Palm Wine -> Madina', color: '#2563eb',
      stops: [['Palm Wine', -0.1522, 5.5764], ['Wireless Station', -0.1580, 5.5780], ['Burma Camp', -0.1650, 5.5820], ['37', -0.1854, 5.5865], ['Legon', -0.1860, 5.6500], ['Madina', -0.1680, 5.6830]]
    },
    {
      id: 'madina-palmwine', name: 'Madina -> Palm Wine', color: '#2563eb',
      stops: [['Madina', -0.1680, 5.6830], ['Legon', -0.1860, 5.6500], ['37', -0.1854, 5.5865], ['Burma Camp', -0.1650, 5.5820], ['Wireless Station', -0.1580, 5.5780], ['Palm Wine', -0.1522, 5.5764]]
    },
    {
      id: 'labadi-coastal-osu', name: 'Labadi Station -> Osu', color: '#059669',
      stops: [['Labadi Station', -0.1542, 5.5670], ['Kpogas', -0.1502, 5.5731], ['Palm Wine', -0.1522, 5.5764], ['Trade Fair', -0.1425, 5.5801], ['Osu', -0.1820, 5.5577]]
    },
    {
      id: 'osu-coastal-labadi', name: 'Osu -> Labadi Station', color: '#059669',
      stops: [['Osu', -0.1820, 5.5577], ['Trade Fair', -0.1425, 5.5801], ['Palm Wine', -0.1522, 5.5764], ['Kpogas', -0.1502, 5.5731], ['Labadi Station', -0.1542, 5.5670]]
    },
    // --- N6 Kumasi Trunk ---
    {
      id: 'circle-kejetia', name: 'Circle -> Kejetia', color: '#7c3aed',
      stops: [['Circle', -0.2177, 5.5568], ['Achimota', -0.2296, 5.6160], ['Ofankor', -0.2681, 5.6582], ['Pokuase', -0.2921, 5.6952], ['Amasaman', -0.3051, 5.7092], ['Nsawam', -0.4000, 5.8000], ['Suhum', -0.4512, 6.0412], ['Bunso', -0.4651, 6.2912], ['Nkawkaw', -0.7681, 6.5512], ['Konongo', -1.2212, 6.6212], ['Ejisu', -1.4812, 6.7181], ['Tech Junction', -1.5712, 6.6912], ['Kejetia', -1.6251, 6.6961]]
    },
    {
      id: 'kejetia-circle', name: 'Kejetia -> Circle', color: '#7c3aed',
      stops: [['Kejetia', -1.6251, 6.6961], ['Tech Junction', -1.5712, 6.6912], ['Ejisu', -1.4812, 6.7181], ['Konongo', -1.2212, 6.6212], ['Nkawkaw', -0.7681, 6.5512], ['Bunso', -0.4651, 6.2912], ['Suhum', -0.4512, 6.0412], ['Nsawam', -0.4000, 5.8000], ['Amasaman', -0.3051, 5.7092], ['Pokuase', -0.2921, 5.6952], ['Ofankor', -0.2681, 5.6582], ['Achimota', -0.2296, 5.6160], ['Circle', -0.2177, 5.5568]]
    },
    // --- Kumasi Metro Hubs ---
    {
      id: 'kejetia-sofoline', name: 'Kejetia -> Sofoline', color: '#d97706',
      stops: [['Kejetia', -1.6251, 6.6961], ['Bantama', -1.6321, 6.7032], ['Suame', -1.6381, 6.7192], ['Sofoline', -1.6512, 6.7012], ['Abuakwa', -1.7181, 6.6982]]
    },
    {
      id: 'sofoline-kejetia', name: 'Sofoline -> Kejetia', color: '#d97706',
      stops: [['Abuakwa', -1.7181, 6.6982], ['Sofoline', -1.6512, 6.7012], ['Suame', -1.6381, 6.7192], ['Bantama', -1.6321, 6.7032], ['Kejetia', -1.6251, 6.6961]]
    },
    {
      id: 'kejetia-obuasi', name: 'Kejetia -> Obuasi', color: '#b91c1c',
      stops: [['Kejetia', -1.6251, 6.6961], ['Asafo', -1.6152, 6.6892], ['Ahodwo', -1.6212, 6.6681], ['Santasi', -1.6451, 6.6691], ['Bekwai', -1.5812, 6.4521], ['Obuasi', -1.6712, 6.2021]]
    },
    {
      id: 'obuasi-kejetia', name: 'Obuasi -> Kejetia', color: '#b91c1c',
      stops: [['Obuasi', -1.6712, 6.2021], ['Bekwai', -1.5812, 6.4521], ['Santasi', -1.6451, 6.6691], ['Ahodwo', -1.6212, 6.6681], ['Asafo', -1.6152, 6.6892], ['Kejetia', -1.6251, 6.6961]]
    },
    // --- N1 Coastal West ---
    {
      id: 'kasoa-takoradi', name: 'Kasoa -> Takoradi Market Circle', color: '#047857',
      stops: [['Kasoa', -0.4167, 5.5333], ['Winneba', -0.6281, 5.3851], ['Mankessim', -1.0212, 5.2681], ['Yamoransa', -1.1892, 5.1481], ['Cape Coast Pedu', -1.2651, 5.1291], ['Cape Coast Tantri', -1.2481, 5.1082], ['Elmina', -1.3512, 5.0881], ['Takoradi Market Circle', -1.7551, 4.8872]]
    },
    {
      id: 'takoradi-kasoa', name: 'Takoradi Market Circle -> Kasoa', color: '#047857',
      stops: [['Takoradi Market Circle', -1.7551, 4.8872], ['Elmina', -1.3512, 5.0881], ['Cape Coast Tantri', -1.2481, 5.1082], ['Cape Coast Pedu', -1.2651, 5.1291], ['Yamoransa', -1.1892, 5.1481], ['Mankessim', -1.0212, 5.2681], ['Winneba', -0.6281, 5.3851], ['Kasoa', -0.4167, 5.5333]]
    },
    // --- N10 Central-North Trunk ---
    {
      id: 'kejetia-tamale', name: 'Kejetia -> Tamale Central', color: '#4338ca',
      stops: [['Kejetia', -1.6251, 6.6961], ['Techiman', -1.9392, 7.5831], ['Kintampo', -1.7291, 8.0581], ['Buipe', -1.5381, 8.7612], ['Tamale Central', -0.8392, 9.4008]]
    },
    {
      id: 'tamale-kejetia', name: 'Tamale Central -> Kejetia', color: '#4338ca',
      stops: [['Tamale Central', -0.8392, 9.4008], ['Buipe', -1.5381, 8.7612], ['Kintampo', -1.7291, 8.0581], ['Techiman', -1.9392, 7.5831], ['Kejetia', -1.6251, 6.6961]]
    },
    // --- N4 Akuapem / Koforidua ---
    {
      id: 'adenta-koforidua', name: 'Adenta -> Koforidua Central', color: '#c026d3',
      stops: [['Adenta', -0.2000, 5.6120], ['Aburi', -0.1762, 5.8491], ['Mamfe', -0.1281, 5.9312], ['Koforidua Central', -0.2602, 6.0941]]
    },
    {
      id: 'koforidua-adenta', name: 'Koforidua Central -> Adenta', color: '#c026d3',
      stops: [['Koforidua Central', -0.2602, 6.0941], ['Mamfe', -0.1281, 5.9312], ['Aburi', -0.1762, 5.8491], ['Adenta', -0.2000, 5.6120]]
    },
    // --- N2 Volta Trunk ---
    {
      id: 'tema-ho', name: 'Tema -> Ho Central', color: '#0891b2',
      stops: [['Tema', 0.0059, 5.6698], ['Ashaiman', -0.0381, 5.6982], ['Kpong', 0.0612, 6.1481], ['Akosombo', 0.0521, 6.2891], ['Asikuma', 0.2851, 6.4151], ['Ho Central', 0.4712, 6.6119]]
    },
    {
      id: 'ho-tema', name: 'Ho Central -> Tema', color: '#0891b2',
      stops: [['Ho Central', 0.4712, 6.6119], ['Asikuma', 0.2851, 6.4151], ['Akosombo', 0.0521, 6.2891], ['Kpong', 0.0612, 6.1481], ['Ashaiman', -0.0381, 5.6982], ['Tema', 0.0059, 5.6698]]
    },
'''

# Insert new routes into the routes array right after line 244 (id: circle-dansoman)
target_marker = "      stops: [['Circle', -0.2177, 5.5568], ['Chorkor', -0.2200, 5.5400], ['Dansoman', -0.2450, 5.5700]]\n    }"
if target_marker in src and 'palmwine-circle' not in src:
    src = src.replace(target_marker, target_marker + ',\n' + new_routes_js.strip())
    print("Added corridor routes to routes array")

with open('trotro-network.js', 'w', encoding='utf-8') as f:
    f.write(src)
print("Updated trotro-network.js")
