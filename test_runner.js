/**
 * ============================================================================
 * TROTRO NETWORK TRAINER - AUTOMATED TEST BENCHMARK RUNNER
 * ============================================================================
 * Tests the compiled/trained network against real Greater Accra commute cases.
 */

const fs = require('fs');
const path = require('path');

const trainedNetworkPath = path.resolve(__dirname, 'dist', 'trotro-network.trained.js');
if (!fs.existsSync(trainedNetworkPath)) {
  console.error(`Error: Compiled network not found at ${trainedNetworkPath}. Run compiler first: node compiler/build_trained_network.js`);
  process.exit(1);
}

const TrotroNetwork = require(trainedNetworkPath).default || require(trainedNetworkPath);
const testCasesPath = path.resolve(__dirname, 'data', 'accra_commute_cases.json');
const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf8'));

console.log(`================================================================`);
console.log(`RUNNING TROTRO NETWORK BENCHMARK SUITE (${testCases.length} Routes)`);
console.log(`================================================================\n`);

let passed = 0;
let failed = 0;
const results = [];

for (const tc of testCases) {
  const tStart = Date.now();
  const res = TrotroNetwork.findBestTrotroPath(tc.from, tc.to);
  const durationMs = Date.now() - tStart;

  if (res && res.ok && res.itineraries && res.itineraries.length > 0) {
    const it = res.itineraries[0];
    const rides = it.legs.filter(l => l.kind === 'ride');
    const walkLegs = it.legs.filter(l => l.kind === 'walk');
    const firstRide = rides[0];
    const initialWalk = walkLegs.length > 0 ? (walkLegs[0].meters || 0) : 0;
    
    const carsText = rides.map(r => r.travelName || `${r.fromName} → ${r.toName}`).join(', ');
    const rideCount = rides.length;
    
    // Check constraints if provided
    let isAcceptable = true;
    let reason = '';
    if (tc.expectedMaxCars && rideCount > tc.expectedMaxCars) {
      isAcceptable = false;
      reason = `Excessive transfers (${rideCount} cars, expected <= ${tc.expectedMaxCars})`;
    }

    if (isAcceptable) {
      passed++;
      console.log(`[PASS] ${tc.from} -> ${tc.to} | Cars: ${rideCount} (${carsText}) | Time: ${it.totalMinutes.toFixed(1)}m (${durationMs}ms)`);
      results.push({ from: tc.from, to: tc.to, ok: true, it, durationMs });
    } else {
      failed++;
      console.log(`[WARN] ${tc.from} -> ${tc.to} | ${reason} | Cars: ${carsText}`);
      results.push({ from: tc.from, to: tc.to, ok: false, reason });
    }
  } else {
    failed++;
    console.log(`[FAIL] ${tc.from} -> ${tc.to} | Reason: ${res ? res.reason : 'No path found'}`);
    results.push({ from: tc.from, to: tc.to, ok: false, reason: res?.reason || 'No path' });
  }
}

console.log(`\n================================================================`);
console.log(`BENCHMARK RESULTS: ${passed}/${testCases.length} PASSED (${((passed / testCases.length) * 100).toFixed(1)}%)`);
console.log(`================================================================`);

if (failed === 0) {
  console.log(`>>> ALL ROUTES VERIFIED. NETWORK IS ROCK SOLID. <<<`);
} else {
  console.log(`>>> ${failed} routes need optimization. <<<`);
}

module.exports = { results, passed, failed };
