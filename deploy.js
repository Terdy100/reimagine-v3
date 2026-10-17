/**
 * ============================================================================
 * ONE-CLICK NETWORK DEPLOYMENT & ROLLBACK MANAGER
 * ============================================================================
 * Safely switches your live web app between:
 *   - The Trained Network (331 routes, surveyed GTFS + trunks)
 *   - The Original Baseline Network
 * 
 * Usage:
 *   node network_trainer/deploy.js --apply     (Activate trained network in live app)
 *   node network_trainer/deploy.js --rollback  (Restore original baseline backup)
 *   node network_trainer/deploy.js --status    (Check which network is currently active)
 */

const fs = require('fs');
const path = require('path');

const trainedPath = path.resolve(__dirname, 'dist', 'trotro-network.trained.js');
const liveAppPath = path.resolve(__dirname, '..', 'app', 'src', 'utils', 'trotro-network.js');
const backupPath = path.resolve(__dirname, '..', 'app', 'src', 'utils', 'trotro-network.backup.js');

const action = process.argv[2] || '--status';

console.log('================================================================');
console.log('         TROTRO NETWORK LIVE DEPLOYMENT MANAGER');
console.log('================================================================\n');

if (action === '--apply') {
  if (!fs.existsSync(trainedPath)) {
    console.error(`[Error] Trained bundle not found at: ${trainedPath}`);
    console.error('Run compilation first: node network_trainer/compiler/build_trained_network.js');
    process.exit(1);
  }

  // 1. Create backup if not already present
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(liveAppPath, backupPath);
    console.log(`[Backup] Created safety backup at:\n  -> ${backupPath}`);
  }

  // 2. Deploy trained bundle
  fs.copyFileSync(trainedPath, liveAppPath);
  console.log(`[Success] Deployed trained network to live app!\n  -> ${liveAppPath}`);
  console.log(`\nYour Vite dev server at http://localhost:5173/ has auto-reloaded!`);
  console.log(`Open http://localhost:5173/ in your browser to test all 331 routes live.`);
} else if (action === '--rollback') {
  if (!fs.existsSync(backupPath)) {
    console.error(`[Error] No backup file found at: ${backupPath}`);
    process.exit(1);
  }

  fs.copyFileSync(backupPath, liveAppPath);
  console.log(`[Rollback] Restored original baseline network!\n  -> ${liveAppPath}`);
  console.log(`Your Vite dev server at http://localhost:5173/ has reverted to baseline.`);
} else {
  // Status check
  const liveContent = fs.readFileSync(liveAppPath, 'utf8');
  const hasGtfs = liveContent.includes('gtfs_') || liveContent.length > 200000;
  console.log(`CURRENT ACTIVE NETWORK: ${hasGtfs ? 'TRAINED NETWORK (331 Routes)' : 'ORIGINAL BASELINE (60 Routes)'}`);
  console.log(`\nCommands:`);
  console.log(`  node network_trainer/deploy.js --apply     -> Switch live app to Trained Network`);
  console.log(`  node network_trainer/deploy.js --rollback  -> Revert live app to Original Baseline`);
}

console.log('\n================================================================');
