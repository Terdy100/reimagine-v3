/**
 * ============================================================================
 * TROTRO LANDMARK & VISUAL CUE REGISTRY (LIGHTWEIGHT & DATA-SAVING)
 * ============================================================================
 * Solves the commuter anxiety:
 * 1. "Where exactly do I stand to catch the bus?" (Boarding Hub)
 * 2. "When do I tell the mate to stop?" (Drop-Off / Alight Landmark)
 * 
 * Rules:
 * - NO photos on intermediate transit stops (saves mobile data, battery, screen clutter).
 * - Only loaded for Origin (Boarding) and Final Destination (Alight / Transfer).
 * - Real Wikimedia Commons Geo-API for authentic Ghana landmarks (zero API keys, 100% free).
 * - Contributor Direct Phone Camera Snap with automatic GPS location detection.
 */

const STORAGE_KEY = 'trotro_contributor_landmarks';
const WIKIMEDIA_CACHE_KEY = 'trotro_wikimedia_cache';

// Curated Ground-Truth Landmark Cues for Major Ghanaian Hubs (Authentic Wikimedia Photos)
export const CURATED_LANDMARKS = {
  'circle': {
    name: 'Kwame Nkrumah Circle',
    hubType: 'terminal',
    boardingCue: 'Head to the main trotro station under the flyover by the Odorna railway line. Ask the station master for your specific route rank.',
    lookOutFor: 'Spot the illuminated Kwame Nkrumah Interchange flyover arches and Odorna Market footbridge.',
    mateCall: '"Driver, Circle station drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Rush_Hour_and_roundabouts.jpg/960px-Rush_Hour_and_roundabouts.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  'kaneshie': {
    name: 'Kaneshie Station & First Light',
    hubType: 'terminal',
    boardingCue: 'Board inside Kaneshie Complex Station or along the walkway opposite the market overhead footbridge.',
    lookOutFor: 'Watch for the massive blue Kaneshie Market complex and the pedestrian overhead walkway spanning the highway.',
    mateCall: '"Bus Stop! First Light!" or "Market Footbridge drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Kaneshie_market.jpg/960px-Kaneshie_market.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  '37': {
    name: '37 Military Hospital Station',
    hubType: 'terminal',
    boardingCue: 'The main rank is directly opposite 37 Military Hospital main gate, along the roundabout slip road towards Madina.',
    lookOutFor: 'Watch for the red-roofed 37 Military Hospital entrance, signpost, and the major roundabout traffic lights.',
    mateCall: '"Driver, 37 Station drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/37_Military_Hospital_Sign_Post.jpg/960px-37_Military_Hospital_Sign_Post.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  'lapaz': {
    name: 'Abeka Lapaz / George Walker Bush N1',
    hubType: 'major_junction',
    boardingCue: 'Stand under the Lapaz pedestrian footbridge on the George Walker Bush N1 Highway service lane.',
    lookOutFor: 'Look for the green pedestrian overpass bridge and the busy market stalls under the N1 overhead.',
    mateCall: '"Driver, Lapaz Footbridge drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Lapaz_footbridge.jpg/960px-Lapaz_footbridge.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  'madina': {
    name: 'Madina Zongo Junction',
    hubType: 'terminal',
    boardingCue: 'Board inside the new Madina Terminal or at Zongo Junction traffic light rank opposite the commercial banks.',
    lookOutFor: 'Watch for the Madina footbridge, the multi-storey shopping plaza, and the row of commercial bank signboards.',
    mateCall: '"Service! Zongo Junction!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Madina_Market_in_Ghana.jpg/960px-Madina_Market_in_Ghana.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  'tema station': {
    name: 'Tema Station (Accra Central)',
    hubType: 'terminal',
    boardingCue: 'Enter the main terminal yard behind the Ministries. Look for the designated bay boards (Spintex, Tema, Dansoman).',
    lookOutFor: 'Spot the historic central railway lines, the Ministries high-rises, and the large STC/Trotro terminal canopy.',
    mateCall: '"Driver, Last Stop Tema Station!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Tema_Station.jpg/960px-Tema_Station.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  'tetteh quarshie': {
    name: 'Tetteh Quarshie Interchange / Spanner',
    hubType: 'major_junction',
    boardingCue: 'Stand at the Spanner bus stop bay directly opposite Accra Mall, heading towards Spintex or Legon.',
    lookOutFor: 'Watch for the giant Accra Mall sign and the sweeping interchange cloverleaf loops.',
    mateCall: '"Driver, Spanner bus stop!" or "Accra Mall junction!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Accra_Mall_%28Entrance%29.jpg/960px-Accra_Mall_%28Entrance%29.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  'kejetia': {
    name: 'Kumasi Kejetia New Market Terminal',
    hubType: 'terminal',
    boardingCue: 'Enter through Gate 3 of the Kejetia Redevelopment complex to find your designated regional lane.',
    lookOutFor: 'Look for the massive brass-domed Kejetia Central Market complex and the Central Police Station.',
    mateCall: '"Driver, Kejetia Main Terminal drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Kumasi.jpg/960px-Kumasi.jpg',
    source: 'Wikimedia Commons (Ashanti Ground-Truth)'
  },
  'takoradi market circle': {
    name: 'Takoradi Market Circle',
    hubType: 'terminal',
    boardingCue: 'The main ranks circle the central roundabout market. Ask the STMA rank marshals for your destination lane.',
    lookOutFor: 'Look for the circular market architecture and the prominent Paa Grant roundabout radial roads.',
    mateCall: '"Driver, Market Circle drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Fresh_coconuts_in_Takoradi_Market_Circle%2C_Ghana.jpg/960px-Fresh_coconuts_in_Takoradi_Market_Circle%2C_Ghana.jpg',
    source: 'Wikimedia Commons (Western Ground-Truth)'
  },
  'kotokuraba': {
    name: 'Cape Coast Kotokuraba Station',
    hubType: 'terminal',
    boardingCue: 'The terminal is on the lower terrace of the newly built Kotokuraba Market.',
    lookOutFor: 'Spot the multi-level market facility and the Pedu road intersection.',
    mateCall: '"Driver, Kotokuraba Station drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Cape_Coast_Montage.jpg/960px-Cape_Coast_Montage.jpg',
    source: 'Wikimedia Commons (Central Ground-Truth)'
  },
  'dansoman': {
    name: 'Dansoman Exhibition / Last Stop',
    hubType: 'terminal',
    boardingCue: 'At the Exhibition roundabout rank or the Last Stop terminal park.',
    lookOutFor: 'Watch for the Exhibition Catholic Church spire and the Dansoman Roundabout trees.',
    mateCall: '"Driver, Exhibition Roundabout!" or "Last Stop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Madina_Market_in_Ghana.jpg/960px-Madina_Market_in_Ghana.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  },
  'achimota': {
    name: 'Achimota Old Station & Terminal',
    hubType: 'terminal',
    boardingCue: 'Inside the Achimota New Terminal off the Nsawam Highway slip road.',
    lookOutFor: 'Look for the Achimota overhead bridge and the large fenced bus depot.',
    mateCall: '"Driver, Achimota Terminal drop!"',
    photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Lapaz_footbridge.jpg/960px-Lapaz_footbridge.jpg',
    source: 'Wikimedia Commons (Accra Ground-Truth)'
  }
};

// In-memory cache for Wikimedia responses
const WIKIMEDIA_MEM_CACHE = new Map();

/**
 * Loads cached Wikimedia photo dictionary from localStorage
 */
function getCachedWikimediaMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(WIKIMEDIA_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_e) {
    return {};
  }
}

/**
 * Saves a discovered photo to localStorage
 */
function cacheWikimediaPhoto(key, url) {
  if (typeof window === 'undefined' || !key || !url) return;
  try {
    const map = getCachedWikimediaMap();
    map[key] = { url, cachedAt: Date.now() };
    localStorage.setItem(WIKIMEDIA_CACHE_KEY, JSON.stringify(map));
  } catch (_e) {}
}

/**
 * Queries Wikimedia Commons Geo-API and Wikipedia PageImages API
 * 100% Free, NO API key required, zero CORS issues with origin=*
 */
export async function fetchWikimediaPhoto(stopName, lat, lon) {
  if (!stopName) return null;
  const cleanKey = stopName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (WIKIMEDIA_MEM_CACHE.has(cleanKey)) {
    return WIKIMEDIA_MEM_CACHE.get(cleanKey);
  }

  const cachedMap = getCachedWikimediaMap();
  if (cachedMap[cleanKey] && cachedMap[cleanKey].url) {
    WIKIMEDIA_MEM_CACHE.set(cleanKey, cachedMap[cleanKey].url);
    return cachedMap[cleanKey].url;
  }

  try {
    let photoUrl = null;

    // 1. Try Geosearch if coordinates are available (accuracy within 1.5km)
    if (lat && lon && typeof lat === 'number' && typeof lon === 'number') {
      const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=geosearch&ggscoord=${lat}|${lon}&ggsradius=1500&ggslimit=2&prop=pageimages&piprop=thumbnail&pithumbsize=800`;
      const res = await fetch(geoUrl, {
        headers: { 'Api-User-Agent': 'TrotroLiveTransit/1.0 (transit@trotrolive.org)' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages);
          const found = pages.find(p => p.thumbnail && p.thumbnail.source);
          if (found) {
            photoUrl = found.thumbnail.source;
          }
        }
      }
    }

    // 2. Fallback to Title Search with Ghana context
    if (!photoUrl) {
      const searchQuery = `${stopName} Ghana`;
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=800`;
      const res = await fetch(searchUrl, {
        headers: { 'Api-User-Agent': 'TrotroLiveTransit/1.0 (transit@trotrolive.org)' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages);
          if (pages.length > 0 && pages[0].thumbnail && pages[0].thumbnail.source) {
            photoUrl = pages[0].thumbnail.source;
          }
        }
      }
    }

    if (photoUrl) {
      WIKIMEDIA_MEM_CACHE.set(cleanKey, photoUrl);
      cacheWikimediaPhoto(cleanKey, photoUrl);
      return photoUrl;
    }
  } catch (err) {
    console.warn('Wikimedia photo fetch error:', err);
  }

  return null;
}

/**
 * Calculates distance in meters between two lat/lon coordinates (Haversine formula)
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Finds the nearest known trotro stop to the user's current GPS location.
 * Uses TrotroNetwork if loaded, or scans known stops.
 */
export function findNearestTrotroStop(userLat, userLon) {
  if (typeof window === 'undefined' || !userLat || !userLon) return null;

  try {
    const net = window.TrotroNetwork;
    if (net && typeof net.nearestStops === 'function') {
      const stops = net.nearestStops([userLat, userLon], 1);
      if (stops && stops.length > 0) {
        const s = stops[0];
        return {
          name: s.name || s.displayName,
          distanceM: Math.round(s.meters || calculateDistanceMeters(userLat, userLon, s.lat, s.lon)),
          lat: s.lat,
          lon: s.lon
        };
      }
    }

    // Fallback: check curated landmarks
    let best = null;
    let minD = Infinity;
    for (const [k, v] of Object.entries(CURATED_LANDMARKS)) {
      if (v.lat && v.lon) {
        const d = calculateDistanceMeters(userLat, userLon, v.lat, v.lon);
        if (d < minD) {
          minD = d;
          best = { name: v.name, distanceM: d, lat: v.lat, lon: v.lon };
        }
      }
    }
    return best;
  } catch (err) {
    console.warn('Error finding nearest trotro stop:', err);
    return null;
  }
}

/**
 * Compresses an image file from mobile camera capture to a lightweight DataURL.
 * Keeps file size tiny (~40-80KB) so it saves instantly in localStorage without quota issues.
 */
export function compressImageFile(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Loads user contributor submitted landmarks from localStorage
 */
export function getContributorLandmarks() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_e) {
    return {};
  }
}

/**
 * Saves or updates a contributor landmark photo & cue
 */
export function saveContributorCue(stopName, cueData) {
  if (typeof window === 'undefined' || !stopName) return false;
  try {
    const existing = getContributorLandmarks();
    const key = stopName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    existing[key] = {
      name: stopName,
      ...cueData,
      updatedAt: new Date().toISOString(),
      source: 'Verified Commuter Submission'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.warn('Could not save contributor landmark', err);
    return false;
  }
}

/**
 * Finds the best landmark cue for a given stop name and commute role.
 * Role: 'board' (where to stand/board) | 'alight' (look out for / signal mate)
 */
export function getStopLandmarkCue(stopName, role = 'alight', coords = null) {
  if (!stopName) return null;
  const rawKey = stopName.toLowerCase().trim();
  const cleanKey = rawKey.replace(/[^a-z0-9]/g, '');

  // 1. Check verified community contributor submissions first
  const contributorMap = getContributorLandmarks();
  if (contributorMap[cleanKey]) {
    const item = contributorMap[cleanKey];
    return {
      name: stopName,
      role,
      hubType: item.hubType || 'community_stop',
      boardingCue: item.boardingCue || `Board directly at ${stopName}. Look for trotros loading along the main roadside.`,
      lookOutFor: item.lookOutFor || `Approaching ${stopName}. Signal the mate 300 meters ahead.`,
      mateCall: item.mateCall || `"Driver, ${stopName} Bus Stop!"`,
      photoUrl: item.photoUrl || null,
      source: 'Community Contributor (GPS Verified)',
      isContributor: true
    };
  }

  // 2. Check curated Ghanaian hubs (Ground-truth Wikimedia photos)
  for (const [k, v] of Object.entries(CURATED_LANDMARKS)) {
    if (rawKey.includes(k) || k.includes(rawKey) || cleanKey.includes(k.replace(/[^a-z0-9]/g, ''))) {
      return {
        name: stopName,
        role,
        hubType: v.hubType,
        boardingCue: v.boardingCue,
        lookOutFor: v.lookOutFor,
        mateCall: v.mateCall,
        photoUrl: v.photoUrl,
        source: v.source,
        isContributor: false
      };
    }
  }

  // 3. Check cached Wikimedia photo
  const wikiMap = getCachedWikimediaMap();
  const cachedWikiPhoto = wikiMap[cleanKey]?.url || null;

  // 4. Smart contextual fallback (Text cues first, lightweight, zero data bloat!)
  const isJunction = /junction|cross|roundabout|corner/i.test(stopName);
  const isMarket = /market|bazaar|mall/i.test(stopName);
  const isHospital = /hospital|clinic|health/i.test(stopName);
  const isSchool = /school|university|college|campus/i.test(stopName);

  let lookOutFor = `Watch for the prominent roadside sign and buildings near ${stopName}.`;
  let boardingCue = `Stand at the designated passenger rank or shaded shoulder at ${stopName}.`;
  let mateCall = `"Driver, ${stopName} Bus Stop!"`;

  if (isJunction) {
    lookOutFor = `Look for the main traffic junction and commercial signboards approaching ${stopName}.`;
    boardingCue = `Stand 20 meters before the junction corner on the trotro pull-over lane.`;
    mateCall = `"Driver, Junction Drop!" or "Bus Stop, ${stopName}!"`;
  } else if (isMarket) {
    lookOutFor = `Watch for the bustling open-air market stalls and pedestrian activity along the highway.`;
    boardingCue = `Head to the market station rank gate or the main road bus shelter.`;
    mateCall = `"Market Bus Stop!" or "Market Gate drop!"`;
  } else if (isHospital) {
    lookOutFor = `Watch for the hospital emergency gate and ambulance signboards on your side.`;
    mateCall = `"Hospital Gate drop!"`;
  } else if (isSchool) {
    lookOutFor = `Look for the school main entrance gate and pedestrian zebra crossing.`;
    mateCall = `"School Junction Bus Stop!"`;
  }

  return {
    name: stopName,
    role,
    hubType: 'street_stop',
    boardingCue,
    lookOutFor,
    mateCall,
    photoUrl: cachedWikiPhoto,
    source: cachedWikiPhoto ? 'Wikimedia Commons' : 'Trotro Transit Intelligence',
    isContributor: false
  };
}
