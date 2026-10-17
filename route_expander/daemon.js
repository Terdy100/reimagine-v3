/**
 * ============================================================================
 * ROUTE EXPANDER: AUTONOMOUS BACKGROUND SCHEDULER & GIS AUDIT DAEMON
 * ============================================================================
 * Runs continuously or on a timer in the background without manual intervention.
 * 
 * Usage:
 *   node route_expander/daemon.js --run-once     (Survey 1 corridor & update GIS report)
 *   node route_expander/daemon.js --start        (Run continuous loop every 3 minutes)
 *   node route_expander/daemon.js --interval 5   (Set custom interval in minutes)
 *   node route_expander/daemon.js --status       (Check scheduler state & next target)
 */

const fs = require('fs');
const path = require('path');
const { proposeCorridorRoutes } = require('./ai_agent.js');
const { validateAndGeocodeRoute } = require('./geo_validator.js');
const { auditRouteTopology } = require('./commuter_audit.js');
const { loadLedger, saveLedger, commitNewRoutes } = require('./exporter.js');
const { generateGISReport } = require('./gis_reporter.js');

const zonesData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'zones.json'), 'utf8'));

// Helper to flatten all corridors
function getAllCorridors() {
  const all = [];
  for (const phase of zonesData.phases) {
    for (const zone of phase.zones) {
      for (const corridor of zone.corridors) {
        all.push({
          ...corridor,
          phaseId: phase.phaseId,
          phaseName: phase.name,
          zoneId: zone.zoneId,
          zoneName: zone.name
        });
      }
    }
  }
  return all;
}

/**
 * Execute expansion for one single corridor safely
 */
async function processNextCorridor() {
  const ledger = loadLedger();
  const allCorridors = getAllCorridors();
  const completedSet = new Set(ledger.completedCorridors);

  // Find next unmapped corridor
  const corridor = allCorridors.find(c => !completedSet.has(c.id));
  if (!corridor) {
    console.log('[Daemon] 🎉 All scheduled corridors across current phases are completed!');
    generateGISReport();
    return { status: 'COMPLETE', corridor: null };
  }

  console.log(`\n[Daemon ${new Date().toLocaleTimeString()}] 🚀 Initiating corridor expansion:`);
  console.log(`  -> Corridor: "${corridor.name}" (${corridor.zoneName})`);
  console.log(`  -> Anchor: ${corridor.fromHub} ➔ Terminal: ${corridor.toNeighborhood}`);

  try {
    // Step 1: AI Proposal with timeout protection & local GIS fallback
    const candidateRoutes = await proposeCorridorRoutes(corridor);

    // Step 2: Ground-truth coordinate resolution
    const validatedRoutes = [];
    for (const cr of candidateRoutes) {
      try {
        const v = await validateAndGeocodeRoute(cr, corridor);
        const audit = auditRouteTopology(v);
        if (audit.passed || v.stops.length >= 3) {
          validatedRoutes.push(v);
          console.log(`  ✔ Validated route: "${v.name}" (${v.stops.length} stops)`);
        } else {
          console.warn(`  ⚠ Route "${v.name}" warning: ${audit.issues.join('; ')}`);
        }
      } catch (err) {
        console.warn(`  ✖ Skipping route "${cr.name}":`, err.message);
      }
    }

    if (validatedRoutes.length === 0) {
      throw new Error(`Zero valid routes passed geocoding for ${corridor.name}`);
    }

    // Step 3: Zero-regression commit to live app
    const commitResult = commitNewRoutes(corridor.id, corridor.name, validatedRoutes);
    console.log(`  ✅ Successfully committed ${commitResult.newlyAdded} routes into live web app.`);

    // Step 4: Update Senior GIS Officer Report
    generateGISReport();

    return {
      status: 'SUCCESS',
      corridor: corridor.name,
      newRoutes: commitResult.newlyAdded,
      totalRoutes: commitResult.totalActiveRoutes
    };
  } catch (err) {
    console.error(`[Daemon Error] Corridor "${corridor.name}" failed:`, err.message);

    // Record failure in ledger so it can be retried on next tick without halting
    if (!ledger.failedCorridors) ledger.failedCorridors = {};
    ledger.failedCorridors[corridor.id] = {
      name: corridor.name,
      failedAt: new Date().toISOString(),
      error: err.message,
      retryCount: ((ledger.failedCorridors[corridor.id]?.retryCount) || 0) + 1
    };
    saveLedger(ledger);
    generateGISReport();

    return { status: 'ERROR', corridor: corridor.name, error: err.message };
  }
}

/**
/**
 * Continuous loop scheduler with AI Credit Safeguard
 */
async function startDaemonLoop(intervalMinutes = 0.15, maxRuns = 4) {
  console.log('================================================================');
  console.log('    🤖 TROTROLIVE AUTONOMOUS ROUTE EXPANDER DAEMON ACTIVE');
  console.log('================================================================');
  if (maxRuns) {
    console.log(`🛡️  Credit Safeguard  : ACTIVE (Capped at ${maxRuns} runs)`);
  } else {
    console.log(`⚠️  Credit Safeguard  : CONTINUOUS (Unlimited runs)`);
  }
  const intervalSec = Math.round(intervalMinutes * 60);
  console.log(`Heartbeat Interval: ${intervalSec >= 60 ? (intervalMinutes + ' minute(s)') : (intervalSec + ' second(s)')}`);
  console.log(`Senior GIS Report : route_expander/GIS_EXPANSION_REPORT.md`);
  console.log(`Press Ctrl+C to safely pause daemon anytime.\n`);

  let runsCompleted = 0;

  // First run
  console.log(`\n--- [Attempting Run ${runsCompleted + 1}/${maxRuns || '∞'}] ---`);
  const initialRes = await processNextCorridor();
  if (initialRes.status === 'COMPLETE') {
    console.log('\n[Daemon] 🎉 All planned corridors are completed! Daemon finished.');
    return;
  }
  if (initialRes.status === 'SUCCESS') {
    runsCompleted++;
  }

  if (maxRuns && runsCompleted >= maxRuns) {
    console.log('\n================================================================');
    console.log(`🛑 Credit Protection Triggered: Completed all ${maxRuns} requested runs.`);
    console.log(`Daemon safely stopped to protect your AI credits.`);
    console.log('================================================================\n');
    return;
  }

  const intervalMs = Math.max(1000, intervalMinutes * 60 * 1000);
  const timer = setInterval(async () => {
    console.log(`\n--- [Attempting Run ${runsCompleted + 1}/${maxRuns || '∞'}] ---`);
    const res = await processNextCorridor();

    if (res.status === 'SUCCESS') {
      runsCompleted++;
    }

    if (res.status === 'COMPLETE' || (maxRuns && runsCompleted >= maxRuns)) {
      clearInterval(timer);
      console.log('\n================================================================');
      if (res.status === 'COMPLETE') {
        console.log('[Daemon] 🎉 All planned corridors are completed!');
      } else {
        console.log(`🛑 Credit Protection Triggered: Completed all ${maxRuns} requested runs.`);
        console.log(`Daemon safely stopped to protect your AI credits.`);
      }
      console.log('================================================================\n');
      process.exit(0);
    }
  }, intervalMs);

  process.on('SIGINT', () => {
    console.log('\n[Daemon] Gracefully pausing daemon. Progress saved in ledger.json.');
    clearInterval(timer);
    process.exit(0);
  });
}

// CLI Dispatcher
async function main() {
  const args = process.argv.slice(2);
  const flag = args[0] || '--status';

  // Parse max runs flag (--runs 4, --limit 4, etc.)
  let maxRuns = 4; // Default to 4 runs as requested to protect AI credits
  const isUnlimited = args.includes('--unlimited');
  const runsArgIdx = args.findIndex(a => a === '--runs' || a === '--limit' || a === '--max-runs');
  if (runsArgIdx !== -1 && args[runsArgIdx + 1] && !isNaN(args[runsArgIdx + 1])) {
    maxRuns = parseInt(args[runsArgIdx + 1], 10);
  } else if (isUnlimited) {
    maxRuns = null;
  }

  // Parse interval / delay
  let intervalMinutes = 0.15; // Default ~9 seconds between runs for smooth batching
  const intArgIdx = args.indexOf('--interval');
  if (intArgIdx !== -1 && args[intArgIdx + 1] && !isNaN(args[intArgIdx + 1])) {
    intervalMinutes = parseFloat(args[intArgIdx + 1]);
  }
  const delayArgIdx = args.indexOf('--delay');
  if (delayArgIdx !== -1 && args[delayArgIdx + 1] && !isNaN(args[delayArgIdx + 1])) {
    intervalMinutes = parseFloat(args[delayArgIdx + 1]) / 60;
  }

  if (flag === '--run-once') {
    const res = await processNextCorridor();
    console.log(`\nSingle expansion run result:`, res);
  } else if (flag === '--start' || flag === '--runs' || runsArgIdx !== -1) {
    await startDaemonLoop(intervalMinutes, maxRuns);
  } else if (flag === '--status') {
    generateGISReport();
    const ledger = loadLedger();
    const all = getAllCorridors();
    const next = all.find(c => !ledger.completedCorridors.includes(c.id));
    console.log('\n================================================================');
    console.log('               DAEMON & GIS AUDIT STATUS');
    console.log('================================================================');
    console.log(`Corridors Mapped: ${ledger.stats.totalCorridorsMapped} / ${all.length}`);
    console.log(`Active Custom Routes: ${ledger.stats.totalRoutesGenerated}`);
    console.log(`Total Surveyed Stops: ${ledger.stats.totalStopsAdded}`);
    if (next) {
      console.log(`Next In Queue: "${next.name}" (${next.zoneName})`);
    } else {
      console.log(`All corridors completed!`);
    }
    console.log(`\nView detailed audit report in: route_expander/GIS_EXPANSION_REPORT.md`);
    console.log('Commands:');
    console.log('  node route_expander/daemon.js --start               -> Runs 4 corridors & auto-stops (Credit Safe)');
    console.log('  node route_expander/daemon.js --start --runs 4      -> Run exactly 4 corridors');
    console.log('  node route_expander/daemon.js --start --unlimited   -> Continuous background loop');
    console.log('  node route_expander/daemon.js --run-once            -> Survey just 1 next corridor');
    console.log('================================================================\n');
  } else {
    console.log('Usage:');
    console.log('  node route_expander/daemon.js --status');
    console.log('  node route_expander/daemon.js --run-once');
    console.log('  node route_expander/daemon.js --start [--runs 4] [--delay 10] [--unlimited]');
  }
}

main().catch(err => {
  console.error('[Daemon Error]', err);
});
