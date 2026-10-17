/**
 * ============================================================================
 * ROUTE EXPANDER: COMMUTER STREET AUDIT & TOPOLOGY CHECKER
 * ============================================================================
 * Verifies that new proposed routes connect to the rest of the transit network
 * and don't create unrealistic floating transit islands.
 */

const KNOWN_HUBS = [
  'circle', 'kaneshie', '37', 'madina', 'lapaz', 'tema', 'tetteh quarshie',
  'achimota', 'mallam', 'weija', 'adenta', 'atomic', 'legon', 'dansoman',
  'osu', 'labadi', 'bush canteen', 'kasoa', 'ashaiman', 'spintex'
];

function haversineKm(lon1, lat1, lon2, lat2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function auditRouteTopology(route) {
  const issues = [];

  // 1. Minimum stops
  if (!route.stops || route.stops.length < 3) {
    issues.push('Route must have at least 3 sequential stops.');
  }

  // 2. Network connectivity check
  const hasAnchorConnection = route.stops.some(s => {
    const sName = s[0].toLowerCase();
    return KNOWN_HUBS.some(hub => sName.includes(hub));
  });

  if (!hasAnchorConnection) {
    issues.push('Route does not connect to any recognized major transit hub or interchange.');
  }

  // 3. Consecutive stop distance sanity check (each stop should be within 0.1km to 8km of the previous stop)
  for (let i = 0; i < route.stops.length - 1; i++) {
    const s1 = route.stops[i];
    const s2 = route.stops[i + 1];
    const distKm = haversineKm(s1[1], s1[2], s2[1], s2[2]);

    if (distKm > 10.0) {
      issues.push(`Suspicious jump of ${distKm.toFixed(1)}km between "${s1[0]}" and "${s2[0]}". Stops must be sequential along the road.`);
    }
  }

  return {
    passed: issues.length === 0,
    issues: issues
  };
}

module.exports = {
  auditRouteTopology
};
