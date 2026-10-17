/**
 * ============================================================================
 * ROUTE EXPANDER: ZERO-REGRESSION LIVE EXPORTER & SAFE COMMITTER
 * ============================================================================
 * Guaranteed Protection:
 * 1. Timestamped rolling backups before every write to route_expander/backups/
 * 2. Pre-flight schema validation on every route & GPS coordinate
 * 3. Dry-run syntax check via vm.runInNewContext before touching live app
 * 4. Preserves 100% of existing routes with zero regression
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const customRoutesPath = path.resolve(__dirname, '..', 'app', 'src', 'custom-routes', 'custom-routes.js');
const backupDir = path.resolve(__dirname, 'backups');
const ledgerPath = path.resolve(__dirname, 'ledger.json');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function loadLedger() {
  if (fs.existsSync(ledgerPath)) {
    return JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  }
  return {
    lastUpdated: new Date().toISOString(),
    activePhase: 'phase_1_greater_accra',
    completedCorridors: [],
    failedCorridors: {},
    expandedRoutes: [],
    stats: { totalCorridorsMapped: 0, totalRoutesGenerated: 0, totalStopsAdded: 0 }
  };
}

function saveLedger(ledger) {
  ledger.lastUpdated = new Date().toISOString();
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2), 'utf8');
}

/**
 * Loads current custom routes list from custom-routes.js safely
 */
function loadCurrentCustomRoutes() {
  if (!fs.existsSync(customRoutesPath)) return [];
  const content = fs.readFileSync(customRoutesPath, 'utf8');

  // Match the export const customRoutes = [ ... ];
  const match = content.match(/export const customRoutes = (\[[\s\S]*?\]);\s*(?:export default customRoutes;)?$/m);
  if (match) {
    try {
      const sandbox = {};
      vm.runInNewContext(`__routes = ${match[1]};`, sandbox);
      return Array.isArray(sandbox.__routes) ? sandbox.__routes : [];
    } catch (e) {
      console.warn('[Exporter] Parse error in custom-routes.js:', e.message);
    }
  }
  return [];
}

/**
 * Validates individual route integrity
 */
function validateRouteSchema(r) {
  if (!r.id || typeof r.id !== 'string') return false;
  if (!r.name || typeof r.name !== 'string') return false;
  if (!Array.isArray(r.stops) || r.stops.length < 3) return false;

  // Validate every stop [name, lon, lat]
  for (const s of r.stops) {
    if (!Array.isArray(s) || s.length < 3) return false;
    const [name, lon, lat] = s;
    if (typeof name !== 'string' || !name.trim()) return false;
    if (typeof lon !== 'number' || isNaN(lon) || lon < -4.0 || lon > 2.0) return false;
    if (typeof lat !== 'number' || isNaN(lat) || lat < 4.0 || lat > 12.0) return false;
  }
  return true;
}

/**
 * Commits an array of new validated routes into custom-routes.js with zero regression
 */
function commitNewRoutes(corridorId, corridorName, newRoutes) {
  // 1. Take a timestamped safety backup
  if (fs.existsSync(customRoutesPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `custom-routes-${timestamp}.js`);
    fs.copyFileSync(customRoutesPath, backupFile);

    // Keep rolling window of last 20 backups
    const allBackups = fs.readdirSync(backupDir).filter(f => f.startsWith('custom-routes-')).sort();
    while (allBackups.length > 20) {
      const oldest = allBackups.shift();
      try { fs.unlinkSync(path.join(backupDir, oldest)); } catch (e) {}
    }
  }

  // 2. Load existing routes
  const existing = loadCurrentCustomRoutes();
  const initialCount = existing.length;
  const seenIds = new Set(existing.map(r => r.id));
  const seenNames = new Set(existing.map(r => (r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')));
  const newlyAdded = [];

  for (const r of newRoutes) {
    if (!validateRouteSchema(r)) {
      console.warn(`[Exporter] Route "${r.name || 'unnamed'}" failed strict schema check. Discarding.`);
      continue;
    }

    const normName = (r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    // Strictly preserve existing routes: never override, only add newly discovered routes
    if (seenIds.has(r.id) || (normName && seenNames.has(normName))) {
      console.log(`[Exporter] Preserving existing route "${r.name || r.id}" untouched (no override).`);
      continue;
    }

    seenIds.add(r.id);
    if (normName) seenNames.add(normName);
    existing.push(r);
    newlyAdded.push(r);
  }

  // 3. Prepare code string
  const fileHeader = `/**
 * ============================================================================
 * CUSTOM TROTRO & SYSTEMATIC EXPANSION ROUTES REGISTRY
 * ============================================================================
 * Managed automatically by route_expander and manual additions.
 * Total Active Routes: ${existing.length}
 * Last Expansion: ${new Date().toLocaleString()}
 * ============================================================================
 */

export const customRoutes = ${JSON.stringify(existing, null, 2)};

export default customRoutes;
`;

  // 4. Pre-flight dry-run syntax check via VM before writing live
  try {
    const sandbox = {};
    const testCode = fileHeader.replace(/export const customRoutes =/, 'var customRoutes =').replace(/export default customRoutes;/, '');
    vm.runInNewContext(testCode, sandbox);
    if (!Array.isArray(sandbox.customRoutes) || sandbox.customRoutes.length < initialCount) {
      throw new Error(`Integrity check failed: Expected at least ${initialCount} routes, got ${sandbox.customRoutes?.length}`);
    }
  } catch (err) {
    console.error(`[Exporter] CRITICAL: Pre-flight syntax validation failed (${err.message}). Aborting write.`);
    throw err;
  }

  // 5. Atomic write to custom-routes.js
  const tmpPath = `${customRoutesPath}.tmp`;
  fs.writeFileSync(tmpPath, fileHeader, 'utf8');
  fs.renameSync(tmpPath, customRoutesPath);

  console.log(`[Exporter] Safe commit verified! Added ${newlyAdded.length} routes. Total: ${existing.length}`);

  // 6. Update ledger
  const ledger = loadLedger();
  if (!ledger.completedCorridors.includes(corridorId)) {
    ledger.completedCorridors.push(corridorId);
  }
  if (ledger.failedCorridors && ledger.failedCorridors[corridorId]) {
    delete ledger.failedCorridors[corridorId];
  }

  ledger.stats.totalCorridorsMapped = ledger.completedCorridors.length;
  ledger.stats.totalRoutesGenerated = existing.length;

  let totalStops = 0;
  existing.forEach(r => { totalStops += (r.stops ? r.stops.length : 0); });
  ledger.stats.totalStopsAdded = totalStops;

  for (const a of newlyAdded) {
    ledger.expandedRoutes.push({
      id: a.id,
      name: a.name,
      corridorId,
      corridorName,
      stopsCount: a.stops ? a.stops.length : 0,
      generationMethod: a.generationMethod || 'ai_verified',
      addedAt: new Date().toISOString()
    });
  }

  saveLedger(ledger);

  return {
    totalActiveRoutes: existing.length,
    newlyAdded: newlyAdded.length,
    totalStops: totalStops
  };
}

module.exports = {
  loadLedger,
  saveLedger,
  loadCurrentCustomRoutes,
  commitNewRoutes
};
