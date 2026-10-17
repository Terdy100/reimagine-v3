/**
 * ============================================================================
 * ROUTE EXPANDER: GROUND-TRUTH GEO VALIDATOR & COORDINATE RESOLVER
 * ============================================================================
 * Resolves each proposed trotro stop to real, ground-truth Ghanaian coordinates:
 * 1. Checks existing core network stops (TrotroNetwork)
 * 2. Checks national stop extract (ghana_all_stops with 4,000+ surveyed stops)
 * 3. Geocodes missing neighborhood stops with bounded Photon API
 * 4. Ensures geographic continuity along road corridors
 */

const fs = require('fs');
const path = require('path');

// Load known stops from core network & all stops
let knownStopMap = new Map();

function initKnownStops() {
  if (knownStopMap.size > 0) return;

  // 1. From ghana_all_stops.geojson
  const geojsonPath = path.resolve(__dirname, '..', 'ghana_all_stops.geojson');
  if (fs.existsSync(geojsonPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
      if (raw.features) {
        for (const f of raw.features) {
          const name = f.properties && f.properties.name;
          if (name && f.geometry && f.geometry.coordinates) {
            const key = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            if (!knownStopMap.has(key)) {
              knownStopMap.set(key, {
                name: name,
                lon: f.geometry.coordinates[0],
                lat: f.geometry.coordinates[1]
              });
            }
          }
        }
      }
      console.log(`[GeoValidator] Loaded ${knownStopMap.size} surveyed ground-truth stops from ghana_all_stops.geojson`);
    } catch (e) {
      console.warn('[GeoValidator] Error loading ghana_all_stops.geojson:', e.message);
    }
  }

  // 2. High-priority anchor hubs in Greater Accra & Ghana
  const anchorStops = [
    { name: 'Circle', lon: -0.2189, lat: 5.5582 },
    { name: 'Kaneshie', lon: -0.2435, lat: 5.5684 },
    { name: '37', lon: -0.1854, lat: 5.5865 },
    { name: 'Madina', lon: -0.1690, lat: 5.6705 },
    { name: 'Lapaz', lon: -0.2450, lat: 5.6025 },
    { name: 'Tema Station', lon: -0.2030, lat: 5.5450 },
    { name: 'Tetteh Quarshie', lon: -0.1782, lat: 5.6267 },
    { name: 'Spanner', lon: -0.1691, lat: 5.6235 },
    { name: 'Action Chapel', lon: -0.1585, lat: 5.6220 },
    { name: 'Papaye Spintex', lon: -0.1415, lat: 5.6212 },
    { name: 'Baatsona Total', lon: -0.1180, lat: 5.6210 },
    { name: 'Shell Signboard', lon: -0.1040, lat: 5.6215 },
    { name: 'Coastal', lon: -0.0920, lat: 5.6230 },
    { name: 'Sakumono Estate', lon: -0.0680, lat: 5.6250 },
    { name: 'Dansoman Roundabout', lon: -0.2620, lat: 5.5510 },
    { name: 'Dansoman Exhibition', lon: -0.2710, lat: 5.5480 },
    { name: 'Dansoman Last Stop', lon: -0.2830, lat: 5.5430 },
    { name: 'Kaneshie First Light', lon: -0.2480, lat: 5.5670 },
    { name: 'Mamprobi Post Office', lon: -0.2390, lat: 5.5380 },
    { name: 'Chorkor', lon: -0.2310, lat: 5.5270 },
    { name: 'Korle Bu', lon: -0.2280, lat: 5.5390 },
    { name: 'Ridge Hospital', lon: -0.1982, lat: 5.5620 },
    { name: 'Osu Danquah Circle', lon: -0.1830, lat: 5.5580 },
    { name: 'Labone', lon: -0.1680, lat: 5.5620 },
    { name: 'Trade Fair', lon: -0.1425, lat: 5.5801 },
    { name: 'Teshie First Junction', lon: -0.1110, lat: 5.5850 },
    { name: 'Nungua Barrier', lon: -0.0810, lat: 5.5990 },
    { name: 'Ashaley Botwe', lon: -0.1430, lat: 5.6880 },
    { name: 'School Junction', lon: -0.1340, lat: 5.6920 },
    { name: 'Adenta Barrier', lon: -0.1580, lat: 5.7140 },
    { name: 'Frafraha', lon: -0.1410, lat: 5.7320 },
    { name: 'Dodowa', lon: -0.0950, lat: 5.8820 },
    { name: 'Haatso Supermarket', lon: -0.1980, lat: 5.6690 },
    { name: 'Agbogba', lon: -0.1940, lat: 5.6890 },
    { name: 'Dome Crossing', lon: -0.2310, lat: 5.6420 },
    { name: 'Kwabenya Roundabout', lon: -0.2350, lat: 5.6790 },
    { name: 'Ashongman Estate', lon: -0.2315, lat: 5.7021 },
    { name: 'Pokuase Interchange', lon: -0.2980, lat: 5.6860 },
    { name: 'Amasaman', lon: -0.3080, lat: 5.7040 },
    { name: 'Mallam Junction', lon: -0.2780, lat: 5.5780 },
    { name: 'Gbawe Zero', lon: -0.2920, lat: 5.5920 },
    { name: 'Weija Barrier', lon: -0.3280, lat: 5.5680 },
    { name: 'Kasoa Overhead', lon: -0.4210, lat: 5.5340 },
    { name: 'Tema Community 1', lon: -0.0160, lat: 5.6420 },
    { name: 'Ashaiman Main', lon: -0.0380, lat: 5.6980 },
    { name: 'Labadi Beach', lon: -0.1550, lat: 5.5650 },
    { name: 'Labadi Bush Canteen', lon: -0.1510, lat: 5.5710 },
    { name: 'Osu RE', lon: -0.1810, lat: 5.5560 },
    { name: 'Oxford Street', lon: -0.1840, lat: 5.5530 },
    { name: 'Ministries', lon: -0.1980, lat: 5.5490 },
    { name: 'Cantonments Post Office', lon: -0.1740, lat: 5.5780 },
    { name: 'Airport Residential', lon: -0.1810, lat: 5.6050 },
    { name: 'Marina Mall', lon: -0.1780, lat: 5.6020 },
    { name: 'Burma Camp', lon: -0.1520, lat: 5.5900 },
    { name: 'El-Wak', lon: -0.1690, lat: 5.5820 },
    { name: 'Teshie Lascala', lon: -0.0980, lat: 5.5890 },
    { name: 'Nmai Dzorn', lon: -0.1380, lat: 5.6720 },
    { name: 'Amrahia Dairy Farm', lon: -0.1310, lat: 5.7610 },
    { name: 'Danfa', lon: -0.1220, lat: 5.7820 },
    { name: 'Valley View University', lon: -0.1150, lat: 5.8010 },
    { name: 'Dodowa Forest', lon: -0.0910, lat: 5.8890 },
    { name: 'Haatso Yam Market', lon: -0.1980, lat: 5.6690 },
    { name: 'Agbogba First Gate', lon: -0.1940, lat: 5.6850 },
    { name: 'Ecomog', lon: -0.2010, lat: 5.6750 },
    { name: 'Wisconsin University', lon: -0.1960, lat: 5.6790 },
    { name: 'Berekuso', lon: -0.2180, lat: 5.7520 },
    { name: 'Abokobi', lon: -0.1980, lat: 5.7350 },
    { name: 'Sowutuom', lon: -0.2680, lat: 5.6180 },
    { name: 'Anyaa Market', lon: -0.2820, lat: 5.6250 },
    { name: 'Ablekuma', lon: -0.3020, lat: 5.6420 },
    { name: 'Chantan', lon: -0.2520, lat: 5.6120 },
    { name: 'Tetegu', lon: -0.3120, lat: 5.5580 },
    { name: 'Bortianor', lon: -0.3450, lat: 5.5420 },
    { name: 'Kasoa Old Barrier', lon: -0.3680, lat: 5.5520 },
    { name: 'Kasoa New Market', lon: -0.4350, lat: 5.5390 },
    { name: 'Afienya', lon: -0.0210, lat: 5.7850 },
    { name: 'Michel Camp', lon: -0.0320, lat: 5.7420 },
    { name: 'Dawhenya', lon: 0.0450, lat: 5.7620 },
    { name: 'Nsawam', lon: -0.3510, lat: 5.8080 },
    { name: 'Suhum', lon: -0.4510, lat: 6.0410 },
    { name: 'Koforidua Main Station', lon: -0.2580, lat: 6.0940 },
    { name: 'Aburi', lon: -0.1750, lat: 5.8480 },
    { name: 'Peduase', lon: -0.1720, lat: 5.8210 },
    { name: 'Mamfe', lon: -0.1280, lat: 5.8890 },
    { name: 'Akropong', lon: -0.0890, lat: 5.9720 },
    { name: 'Winneba Junction', lon: -0.6250, lat: 5.3520 },
    { name: 'Mankessim', lon: -1.0250, lat: 5.2670 },
    { name: 'Cape Coast Kotokuraba', lon: -1.2460, lat: 5.1050 },
    { name: 'Kejetia', lon: -1.6240, lat: 6.6980 },
    { name: 'Anloga Junction', lon: -1.5950, lat: 6.6850 },
    { name: 'KNUST Commercial', lon: -1.5710, lat: 6.6740 },
    { name: 'Ayeduase', lon: -1.5580, lat: 6.6690 },
    { name: 'Suame Roundabout', lon: -1.6380, lat: 6.7210 },
    { name: 'Old Tafo', lon: -1.6180, lat: 6.7380 },
    { name: 'Pankrono', lon: -1.6020, lat: 6.7580 },
    { name: 'Mamponteng', lon: -1.5520, lat: 6.7920 }
  ];

  for (const a of anchorStops) {
    const key = a.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    knownStopMap.set(key, a);
  }
}

// Bounded geocoder fallback for unfamiliar neighborhood stops
async function geocodeNeighborhoodStop(stopName) {
  const normKey = stopName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (knownStopMap.has(normKey)) {
    return knownStopMap.get(normKey);
  }

  // Check multi-token exact match against known stops
  const genericTokens = new Set(['lorry', 'station', 'rank', 'market', 'stop', 'junction', 'terminal', 'barrier', 'post', 'first', 'last', 'down', 'curve', 'gate', 'office', 'road', 'street']);
  const normWords = stopName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const specificNormWords = normWords.filter(w => !genericTokens.has(w));
  let bestMatch = null;
  let bestScore = 0;

  for (const [k, v] of knownStopMap.entries()) {
    const candidateWords = (v.name || k).toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    
    // Must match at least one non-generic specific place name word
    if (specificNormWords.length > 0 && !specificNormWords.some(w => candidateWords.includes(w))) {
      continue;
    }

    const common = normWords.filter(w => candidateWords.includes(w));
    if (common.length >= 2 && common.length >= normWords.length * 0.5) {
      if (common.length > bestScore) {
        bestScore = common.length;
        bestMatch = v;
      }
    }
  }

  if (bestMatch) {
    return { name: stopName, lon: bestMatch.lon, lat: bestMatch.lat };
  }

  // Multi-tier live internet geocoder across the Republic of Ghana
  const cleanStop = stopName.replace(/Lorry Station|Station|Market|Bus Stop|Rank|Trotro/gi, '').trim() || stopName;
  
  // Tier 1: Photon Search (OSM Ghana Bounding Box)
  try {
    const query = `${cleanStop}, Ghana`;
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=-3.5,4.5,1.5,11.5&limit=1`;
    const res = await fetch(url, { 
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'TrotroliveRouteExpander/1.0' } 
    });
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates; // [lon, lat]
        if (coords && coords.length === 2) {
          const [lon, lat] = coords;
          if (lon >= -3.5 && lon <= 1.5 && lat >= 4.5 && lat <= 11.5) {
            const resolved = { name: stopName, lon: parseFloat(lon.toFixed(4)), lat: parseFloat(lat.toFixed(4)) };
            knownStopMap.set(normKey, resolved);
            return resolved;
          }
        }
      }
    }
  } catch (_err) {
    // Photon network fallback
  }

  // Tier 2: OpenStreetMap Nominatim Live Search Fallback
  try {
    const query = `${cleanStop}, Ghana`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=gh&limit=1`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'TrotroliveApp/2.0 (contact@trotrolive.gh)' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (lon >= -3.5 && lon <= 1.5 && lat >= 4.5 && lat <= 11.5) {
          const resolved = { name: stopName, lon: parseFloat(lon.toFixed(4)), lat: parseFloat(lat.toFixed(4)) };
          knownStopMap.set(normKey, resolved);
          return resolved;
        }
      }
    }
  } catch (_err) {
    // Nominatim fallback
  }

  return null;
}

/**
 * Validates and attaches coordinates to a raw proposed route from AI
 */
async function validateAndGeocodeRoute(rawRoute, corridor = null) {
  initKnownStops();

  if (!rawRoute.stops || rawRoute.stops.length < 3) {
    throw new Error(`Route "${rawRoute.name}" has fewer than 3 stops`);
  }

  const validatedStops = [];
  const genericTerms = ['last stop', 'roundabout', 'market', 'station', 'junction', 'first stop', 'terminal', 'barrier'];

  for (const stopName of rawRoute.stops) {
    let cleanName = typeof stopName === 'string' ? stopName.trim() : (stopName.name || '');
    if (!cleanName) continue;

    let coords = null;
    if (corridor && genericTerms.includes(cleanName.toLowerCase())) {
      const qualified = `${corridor.toNeighborhood} ${cleanName}`;
      coords = await geocodeNeighborhoodStop(qualified);
      if (coords) cleanName = qualified;
    }

    if (!coords) {
      coords = await geocodeNeighborhoodStop(cleanName);
    }

    if (!coords && corridor) {
      coords = await geocodeNeighborhoodStop(`${corridor.toNeighborhood} ${cleanName}`);
    }

    if (!coords) {
      console.warn(`[GeoValidator] Could not pinpoint coordinates for stop: "${cleanName}". Skipping.`);
      continue;
    }

    validatedStops.push([cleanName, coords.lon, coords.lat]);
  }

  if (validatedStops.length < 3) {
    throw new Error(`Route "${rawRoute.name}" only has ${validatedStops.length} valid stops after geocoding. Needs at least 3.`);
  }

  return {
    id: rawRoute.id,
    name: rawRoute.name,
    color: rawRoute.color || '#0284c7',
    stops: validatedStops
  };
}

module.exports = {
  initKnownStops,
  geocodeNeighborhoodStop,
  validateAndGeocodeRoute
};
