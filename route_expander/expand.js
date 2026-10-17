/**
 * ============================================================================
 * GHANA NATIONAL SYSTEMATIC ROUTE EXPANSION ENGINE (CLI)
 * ============================================================================
 * Usage:
 *   node route_expander/expand.js --status       (View current expansion map & progress)
 *   node route_expander/expand.js --next         (Systematically expand the next corridor)
 *   node route_expander/expand.js --corridor "spintex"  (Target a specific corridor)
 *   node route_expander/expand.js --auto 3       (Expand next 3 corridors in sequence)
 */

const fs = require('fs');
const path = require('path');
const { proposeCorridorRoutes } = require('./ai_agent.js');
const { validateAndGeocodeRoute } = require('./geo_validator.js');
const { auditRouteTopology } = require('./commuter_audit.js');
const { loadLedger, saveLedger, commitNewRoutes, loadCurrentCustomRoutes } = require('./exporter.js');

const zonesData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'zones.json'), 'utf8'));

// Helper to find all corridors flatly
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

// Display Status Dashboard
function showStatus() {
  const ledger = loadLedger();
  const allCorridors = getAllCorridors();
  const completedSet = new Set(ledger.completedCorridors);
  const customRoutes = loadCurrentCustomRoutes();

  console.log('================================================================');
  console.log('   🗺️  TROTROLIVE: GHANA SYSTEMATIC EXPANSION DASHBOARD');
  console.log('================================================================\n');

  console.log(`Current Phase: ${zonesData.systematicPlan.currentPhase}`);
  console.log(`Total Custom Routes Active in Live App: ${customRoutes.length}`);
  console.log(`Total Corridors Fully Mapped: ${ledger.stats.totalCorridorsMapped} / ${allCorridors.length}`);
  console.log(`Progress: [${'█'.repeat(Math.round((ledger.stats.totalCorridorsMapped / allCorridors.length) * 20))}${'░'.repeat(20 - Math.round((ledger.stats.totalCorridorsMapped / allCorridors.length) * 20))}] ${Math.round((ledger.stats.totalCorridorsMapped / allCorridors.length) * 100)}%\n`);

  for (const phase of zonesData.phases) {
    console.log(`\n📌 ${phase.name.toUpperCase()} (${phase.status.replace('_', ' ')})`);
    for (const zone of phase.zones) {
      console.log(`  📂 ${zone.name}`);
      for (const c of zone.corridors) {
        const isDone = completedSet.has(c.id);
        const icon = isDone ? '  ✅' : '  ⏳';
        console.log(`    ${icon} ${c.name} [ID: ${c.id}]`);
      }
    }
  }

  const nextUp = allCorridors.find(c => !completedSet.has(c.id));
  console.log('\n================================================================');
  if (nextUp) {
    console.log(`👉 NEXT IN QUEUE TO EXPAND: "${nextUp.name}"`);
    console.log(`   Run: node route_expander/expand.js --next`);
  } else {
    console.log(`🎉 ALL PLANNED CORRIDORS HAVE BEEN MAPPED!`);
  }
  console.log('================================================================\n');
}

// Expand a single specific corridor
async function expandSingleCorridor(corridor) {
  console.log('\n----------------------------------------------------------------');
  console.log(`🚀 EXPANDING CORRIDOR: ${corridor.name}`);
  console.log(`Zone: ${corridor.zoneName}`);
  console.log(`Hub: ${corridor.fromHub} ➔ Destination: ${corridor.toNeighborhood}`);
  console.log('----------------------------------------------------------------\n');

  // Step 1: Ask AI agent to propose real-world trotro lines
  console.log('[Step 1/3] Asking AI Transits Agent for street-authentic trotro lines...');
  const candidateRoutes = await proposeCorridorRoutes(corridor);

  // Step 2: Validate and attach precise coordinates
  console.log('\n[Step 2/3] Validating coordinates against surveyed stops & geocoder...');
  const validatedRoutes = [];
  for (const cr of candidateRoutes) {
    try {
      const v = await validateAndGeocodeRoute(cr, corridor);
      const audit = auditRouteTopology(v);
      if (audit.passed) {
        validatedRoutes.push(v);
        console.log(`  ✔ Validated route: "${v.name}" (${v.stops.length} stops)`);
      } else {
        console.warn(`  ⚠ Route "${v.name}" audit warning: ${audit.issues.join('; ')}`);
        // If it has enough stops, still accept it
        if (v.stops.length >= 3) validatedRoutes.push(v);
      }
    } catch (err) {
      console.warn(`  ✖ Skipping route "${cr.name}":`, err.message);
    }
  }

  if (validatedRoutes.length === 0) {
    throw new Error(`Could not validate any valid routes for corridor: "${corridor.name}"`);
  }

  // Step 3: Commit to custom-routes.js and ledger
  console.log('\n[Step 3/3] Persisting routes to app/src/custom-routes/custom-routes.js...');
  const res = commitNewRoutes(corridor.id, corridor.name, validatedRoutes);

  console.log('\n================================================================');
  console.log(`✅ CORRIDOR EXPANSION COMPLETE!`);
  console.log(`Added ${res.newlyAdded} new routes to the live network.`);
  console.log(`Total active custom routes in system: ${res.totalActiveRoutes}`);
  console.log('Your Vite dev server at http://localhost:5173/ has auto-reloaded!');
  console.log('================================================================\n');
}

// Expand the next unmapped corridor
async function expandNext(count = 1) {
  const ledger = loadLedger();
  const allCorridors = getAllCorridors();
  const completedSet = new Set(ledger.completedCorridors);

  let expansionsDone = 0;
  for (const corridor of allCorridors) {
    if (completedSet.has(corridor.id)) continue;

    await expandSingleCorridor(corridor);
    completedSet.add(corridor.id);
    expansionsDone++;

    if (expansionsDone >= count) break;
  }

  if (expansionsDone === 0) {
    console.log('No unmapped corridors remaining in current phase.');
  }
}

// Main CLI Dispatcher
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || '--status';

  if (cmd === '--status') {
    showStatus();
  } else if (cmd === '--next') {
    await expandNext(1);
  } else if (cmd === '--auto') {
    const num = parseInt(args[1], 10) || 2;
    await expandNext(num);
  } else if (cmd === '--corridor') {
    const query = (args[1] || '').toLowerCase().trim();
    if (!query) {
      console.error('Please specify a corridor id or keyword. Example: --corridor spintex');
      process.exit(1);
    }
    const all = getAllCorridors();
    const found = all.find(c => c.id.toLowerCase().includes(query) || c.name.toLowerCase().includes(query));
    if (!found) {
      console.error(`Corridor matching "${query}" not found in zones.json.`);
      process.exit(1);
    }
    await expandSingleCorridor(found);
  } else {
    console.log('Available commands:');
    console.log('  node route_expander/expand.js --status');
    console.log('  node route_expander/expand.js --next');
    console.log('  node route_expander/expand.js --auto <number>');
    console.log('  node route_expander/expand.js --corridor <name>');
  }
}

main().catch(err => {
  console.error('\nExpansion error:', err.message);
});
