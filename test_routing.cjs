const TrotroNetwork = require('./src/utils/trotro-network.js').default || require('./src/utils/trotro-network.js');

const testCases = [
  { from: 'Circle', to: 'Dansoman' },
  { from: '37', to: 'Osu' },
  { from: 'Madina', to: 'Kasoa' },
  { from: 'Kaneshie', to: 'Tema' },
  { from: 'Lapaz', to: 'Accra Central' },
  { from: 'Spintex', to: 'Circle' },
  { from: 'Achimota', to: 'Airport' },
  { from: 'East Legon', to: 'Circle' },
  { from: 'Adenta', to: 'Kaneshie' },
  { from: 'Teshie', to: 'Circle' },
  { from: 'Mallam', to: '37' },
  { from: 'Pokuase', to: 'Circle' },
  { from: 'Ridge', to: 'Legon' },
  { from: 'Nungua', to: 'Accra Central' },
  { from: 'Kwashieman', to: 'Madina' },
  { from: 'Dome', to: 'Circle' },
  { from: 'Taifa', to: '37' },
  { from: 'Makola', to: 'Dansoman' },
  { from: 'Osu', to: 'Lapaz' },
  { from: 'Tema', to: 'Circle' },
  { from: 'Ashaiman', to: 'Accra Central' },
  { from: 'Kotoka', to: 'Kasoa' },
  { from: 'Korle Bu', to: 'Legon' },
  { from: 'Weija', to: 'Osu' },
  { from: 'Trade Fair', to: 'Achimota' },
  { from: 'Bawaleshie', to: 'Kaneshie' },
  { from: 'Amasaman', to: 'Circle' },
  { from: 'Kumasi', to: 'Circle' }
];

console.log('Testing 28 Greater Accra & Ghana Routes:');
let passed = 0;

for (const tc of testCases) {
  const matchFrom = TrotroNetwork.matchStop(tc.from);
  const matchTo = TrotroNetwork.matchStop(tc.to);
  
  if (!matchFrom || !matchTo) {
    console.log(`[FAIL MATCH] ${tc.from} -> ${tc.to} | From: ${matchFrom ? matchFrom.stop.name : 'NULL'} | To: ${matchTo ? matchTo.stop.name : 'NULL'}`);
    continue;
  }
  
  const fromCoord = [matchFrom.stop.lon, matchFrom.stop.lat];
  const toCoord = [matchTo.stop.lon, matchTo.stop.lat];
  const res = TrotroNetwork.plan(fromCoord, toCoord);
  
  if (!res.ok || !res.itineraries.length) {
    console.log(`[FAIL PLAN] ${tc.from} (${matchFrom.stop.name}) -> ${tc.to} (${matchTo.stop.name}) | Reason: ${res.reason}`);
  } else {
    const itin = res.itineraries[0];
    console.log(`[PASS] ${tc.from} -> ${tc.to} | Rides: ${itin.rideCount} | Transfers: ${itin.transfers} | Cars: ${itin.cars.map(c => c.name).join(', ')}`);
    passed++;
  }
}

console.log(`\nResult: ${passed}/${testCases.length} routes passed.`);
