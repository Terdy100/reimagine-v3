/**
 * ============================================================================
 * TROTRO NETWORK TRAINER & COMPILER
 * ============================================================================
 * Compiles surveyed routes (Trunk + GTFS Feeders) into a high-density,
 * reconciled transit network graph.
 * 
 * Output is saved to network_trainer/dist/trotro-network.trained.js
 * 100% API-compatible with app/src/utils/trotro-network.js.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== Starting Trotro Network Compilation ===');

// 1. Load Raw GTFS Routes
const gtfsPath = path.resolve(__dirname, '..', '..', 'pipeline', 'generated_routes.js');
let rawGtfsRoutes = [];
if (fs.existsSync(gtfsPath)) {
  const content = fs.readFileSync(gtfsPath, 'utf8');
  const sandbox = {};
  vm.runInNewContext(content + '\n; __out = generated_routes;', sandbox);
  rawGtfsRoutes = sandbox.__out || [];
  console.log(`[Data] Loaded ${rawGtfsRoutes.length} raw GTFS surveyed routes.`);
} else {
  console.warn(`[Data] Warning: ${gtfsPath} not found.`);
}

// Sync custom expanded routes from app into network_trainer
const appCustomRoutesPath = path.resolve(__dirname, '..', '..', 'app', 'src', 'custom-routes', 'custom-routes.js');
const trainerCustomRoutesPath = path.resolve(__dirname, '..', 'custom-routes', 'custom-routes.js');
if (fs.existsSync(appCustomRoutesPath)) {
  fs.copyFileSync(appCustomRoutesPath, trainerCustomRoutesPath);
}

// 2. Load Core Base Network from app
const baseNetworkPath = path.resolve(__dirname, '..', '..', 'app', 'src', 'utils', 'trotro-network.js');
const baseCode = fs.readFileSync(baseNetworkPath, 'utf8');

// Helper to sanitize stop names
function cleanStopName(name) {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
}

// 3. Filter and Validate High-Quality Feeder Routes
// We select well-formed routes with valid coordinates and clear stop sequences
const validGtfsRoutes = [];
const seenIds = new Set();

for (const r of rawGtfsRoutes) {
  if (!r.stops || r.stops.length < 3) continue;
  if (seenIds.has(r.id)) continue;
  seenIds.add(r.id);

  // Validate coordinates
  let sane = true;
  const cleanedStops = [];
  for (const s of r.stops) {
    const sName = cleanStopName(s[0]);
    const lon = parseFloat(s[1]);
    const lat = parseFloat(s[2]);
    // Accra & Ghana bounding box
    if (isNaN(lon) || isNaN(lat) || lon < -3.5 || lon > 1.5 || lat < 4.5 || lat > 11.5) {
      sane = false;
      break;
    }
    cleanedStops.push([sName, Number(lon.toFixed(5)), Number(lat.toFixed(5))]);
  }

  if (sane && cleanedStops.length >= 3) {
    validGtfsRoutes.push({
      id: 'gtfs_' + r.id,
      name: r.name,
      color: r.color || '#0284c7',
      stops: cleanedStops
    });
  }
}

console.log(`[Filter] Selected ${validGtfsRoutes.length} validated GTFS feeder routes.`);

// 4. Extract existing core routes from baseCode
// We read the existing routes array from baseCode
const routesMarker = 'var routes = [';
const routesStart = baseCode.indexOf(routesMarker);
if (routesStart === -1) {
  throw new Error('Could not find var routes = [ in base network file.');
}

// Find matching bracket for routes array
let depth = 0;
let routesEnd = -1;
for (let i = routesStart + routesMarker.length - 1; i < baseCode.length; i++) {
  if (baseCode[i] === '[') depth++;
  else if (baseCode[i] === ']') {
    depth--;
    if (depth === 0) {
      routesEnd = i + 1;
      break;
    }
  }
}

const nextSemicolon = baseCode.indexOf(';', routesEnd);
const statementEnd = nextSemicolon !== -1 ? nextSemicolon + 1 : routesEnd;

const existingRoutesStr = baseCode.substring(routesStart + routesMarker.length - 1, routesEnd);
const existingRoutes = vm.runInNewContext('(' + existingRoutesStr + ')');
console.log(`[Core] Found ${existingRoutes.length} existing core routes.`);

// Combine core trunk routes + vetted GTFS routes
// Avoid duplicate route names
const allCombinedRoutes = [...existingRoutes];
const existingNames = new Set(existingRoutes.map(r => r.name.toLowerCase()));

let addedCount = 0;
for (const gr of validGtfsRoutes) {
  if (!existingNames.has(gr.name.toLowerCase())) {
    allCombinedRoutes.push(gr);
    existingNames.add(gr.name.toLowerCase());
    addedCount++;
  }
}

console.log(`[Merged] Added ${addedCount} new feeder routes. Total network routes: ${allCombinedRoutes.length}`);

// 5. Serialize combined routes into JS format
const serializedRoutes = 'var routes = ' + JSON.stringify(allCombinedRoutes, null, 2) + '.concat(customRoutesList);';

// 6. Generate Trained trotro-network with AI-moderated tunings
let compiledCode = baseCode.substring(0, routesStart) + serializedRoutes + baseCode.substring(statementEnd);

// Apply Tuning 1: Realistic highway speed for intercity trunks (>15km and >50km)
compiledCode = compiledCode.replace(
  'function rideMinutes(meters) { return (meters / 1000) / meta.urbanSpeedKph * 60; }',
  `function rideMinutes(meters) {
    var km = meters / 1000;
    if (km > 50) return (km / 65) * 60; // Highway coach/trotro: 65 km/h
    if (km > 15) return (km / 40) * 60; // Arterial motorway: 40 km/h
    return (km / meta.urbanSpeedKph) * 60; // Urban street crawl: 20 km/h
  }`
);

// Apply Tuning 2: Strong transfer penalty to suppress micro-hop loops
compiledCode = compiledCode.replace(
  'transferPenaltyMinutes: 7.0,',
  'transferPenaltyMinutes: 12.0,'
);

// Ensure dist directory exists
const distDir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const outputPath = path.join(distDir, 'trotro-network.trained.js');
fs.writeFileSync(outputPath, compiledCode, 'utf8');

console.log(`[Success] Compiled trained network to: ${outputPath}`);
console.log(`Total Routes: ${allCombinedRoutes.length}`);
console.log('=== Trotro Network Compilation Complete ===');
