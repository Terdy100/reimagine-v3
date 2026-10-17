import React, { useEffect, useRef, useState } from 'react';
import { X, Banknote, Footprints, ArrowRight, MapPin, LocateFixed, CheckCircle2, Info, GitFork } from 'lucide-react';
import TrotroNetwork from '../utils/trotro-network.js';
import AddStopModal from './AddStopModal.jsx';
import LandmarkCueCard from './LandmarkCueCard.jsx';
import TrotroSleepAlarm from './TrotroSleepAlarm.jsx';
import { getStopLandmarkCue } from '../utils/landmark-cues.js';
import './MapCard.css';

/* ---------- OSRM road snapping ------------------------------------------
   The network gives each car only its stop coordinates. Joining those with
   straight lines cuts across buildings, so every ride is snapped to real roads 
   with OSRM. One request per car, with all its stops as waypoints. */
const OSRM_CACHE = new Map();
const OSRM_MAX_WAYPOINTS = 90;

async function osrmRoute(coords) {
  const key = coords.map(c => c[0].toFixed(5) + ',' + c[1].toFixed(5)).join(';');
  if (OSRM_CACHE.has(key)) return OSRM_CACHE.get(key);
  const url = 'https://router.project-osrm.org/route/v1/driving/' + key + '?overview=full&geometries=geojson';
  const r = await fetch(url);
  if (!r.ok) throw new Error('OSRM ' + r.status);
  const d = await r.json();
  if (d.code !== 'Ok' || !d.routes || !d.routes[0]) throw new Error('OSRM no route');
  OSRM_CACHE.set(key, d.routes[0]);
  return d.routes[0];
}

// Snap one car's stops to the road. Long rides are split into chunks.
async function snapRide(coords) {
  const pieces = [];
  let meters = 0, seconds = 0, complete = true;
  for (let i = 0; i < coords.length - 1; i += OSRM_MAX_WAYPOINTS - 1) {
    const chunk = coords.slice(i, i + OSRM_MAX_WAYPOINTS);
    if (chunk.length < 2) break;
    try {
      const r = await osrmRoute(chunk);
      meters += r.distance; seconds += r.duration;
      pieces.push(r.geometry.coordinates);
    } catch (e) {
      console.warn('OSRM failed, drawing straight for this part', e);
      complete = false;
      pieces.push(chunk);
    }
  }
  return { line: pieces.flat(), meters, seconds, complete };
}

const LAYERS = ['itin-casing', 'itin-line', 'itin-walk-line', 'itin-change-casing', 'itin-change-line', 'itin-stops', 'itin-stops-label'];
const SOURCES = ['itin-route', 'itin-walk', 'itin-change', 'itin-stops'];

function makePin(color, label) {
  const el = document.createElement('div');
  el.style.cssText = `width:26px;height:26px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font:700 11px Outfit,sans-serif;`;
  el.textContent = label;
  return el;
}

function getAltSummary(itin, idx) {
  const cars = itin.legs ? itin.legs.filter(l => l.kind === 'ride').length : (itin.rideCount || 1);
  const total = itin.legs ? itin.legs.reduce((s, l) => s + (l.minutes || 0) + (l.gapMinutes || 0), 0) : (itin.totalMinutes || 0);
  const timeStr = `~ ${Math.round(total)} min`;
  
  let viaText = '';
  if (itin.changeAt && itin.changeAt.length > 0) {
    const names = [];
    itin.changeAt.forEach(c => {
      const name = c.name || '';
      if (!names.length || names[names.length - 1] !== name) {
        names.push(name);
      }
    });
    viaText = `Via ${names.join(' & ')}`;
  } else if (cars === 1) {
    viaText = 'Direct Trotro';
  } else if (!itin.hasRide) {
    viaText = 'Walk only';
  } else {
    viaText = `${cars} cars`;
  }
  
  return {
    title: `Option ${idx + 1}`,
    time: timeStr,
    via: viaText,
    cars: `${cars} car${cars === 1 ? '' : 's'}`,
    isDirect: cars === 1 && (!itin.changeAt || itin.changeAt.length === 0)
  };
}

export default function MapCard({ 
  routeData, 
  onRouteFound, 
  onClearRoute,
  addStopTrigger,
  isAddStopActive,
  setIsAddStopActive
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pins = useRef([]);
  const customStopPins = useRef([]);
  const requestId = useRef(0);
  const [mapReady, setMapReady] = useState(false);
  const [eta, setEta] = useState(null);
  const [fare, setFare] = useState(null);
  const [activeItin, setActiveItin] = useState(null);
  const [allItineraries, setAllItineraries] = useState([]);
  const [selectedItinIndex, setSelectedItinIndex] = useState(0);
  const [showAltPicker, setShowAltPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddStopMode, setIsAddStopMode] = useState(false);
  const [modalCoords, setModalCoords] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [startCoordsResolved, setStartCoordsResolved] = useState(null);
  const isAddStopModeRef = useRef(false);

  useEffect(() => {
    if (addStopTrigger || isAddStopActive) {
      setIsAddStopMode(true);
    } else if (isAddStopActive === false) {
      setIsAddStopMode(false);
    }
  }, [addStopTrigger, isAddStopActive]);

  useEffect(() => {
    if (map.current || !window.maplibregl) return;
    map.current = new window.maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-0.1969, 5.6037],
      zoom: 11.5
    });

    map.current.on('load', () => {
      const m = map.current;
      setMapReady(true);
      if (m) m.resize();

      // Ambient Trotro Stop Network layer across Greater Accra & Ghana
      const addAmbientStops = () => {
        const m = map.current;
        if (!m) return;

        // Build unified stop collection: surveyed stops + all newly trained & custom corridor stops
        const base = window.GHANA_ALL_STOPS || { type: 'FeatureCollection', features: [] };
        const features = [...(base.features || [])];
        const seen = new Set(features.map(f => (f.properties?.name || '').toLowerCase().trim()));

        if (TrotroNetwork) {
          const routesToCheck = [
            ...(TrotroNetwork.routes || []),
            ...(TrotroNetwork.customRoutes || [])
          ];
          routesToCheck.forEach(r => {
            if (r.stops && Array.isArray(r.stops)) {
              r.stops.forEach(s => {
                const name = s[0];
                const lon = s[1];
                const lat = s[2];
                const key = (name || '').toLowerCase().trim();
                if (key && !seen.has(key) && isFinite(lon) && isFinite(lat)) {
                  seen.add(key);
                  features.push({
                    type: 'Feature',
                    properties: { name, amenity: 'bus_stop' },
                    geometry: { type: 'Point', coordinates: [lon, lat] }
                  });
                }
              });
            }
          });
        }

        const geojsonData = { type: 'FeatureCollection', features };

        if (m.getSource('all-ghana-stops')) {
          try {
            m.getSource('all-ghana-stops').setData(geojsonData);
          } catch (_e) {}
          return;
        }

        try {
          m.addSource('all-ghana-stops', {
            type: 'geojson',
            data: geojsonData
          });

          // Soft transit stop dots visible across Greater Accra & Ghana
          m.addLayer({
            id: 'ambient-stops-circle',
            type: 'circle',
            source: 'all-ghana-stops',
            minzoom: 8.5,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 8.5, 2.5, 11.0, 4.0, 13.5, 5.5, 16, 7.5],
              'circle-color': '#10b981',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1.5,
              'circle-opacity': ['interpolate', ['linear'], ['zoom'], 8.5, 0.65, 11.0, 0.85, 14.0, 0.95]
            }
          });

          // Bus stop names on zoom
          m.addLayer({
            id: 'ambient-stops-label',
            type: 'symbol',
            source: 'all-ghana-stops',
            minzoom: 13.8,
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-offset': [0, 1.2],
              'text-anchor': 'top',
              'text-optional': true,
              'text-max-width': 9
            },
            paint: {
              'text-color': '#0f172a',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2.5
            }
          });

          // Hover cursor & popup for ambient stops
          m.on('mouseenter', 'ambient-stops-circle', () => { m.getCanvas().style.cursor = 'pointer'; });
          m.on('mouseleave', 'ambient-stops-circle', () => { m.getCanvas().style.cursor = ''; });
          m.on('click', 'ambient-stops-circle', (e) => {
            const feature = e.features && e.features[0];
            if (!feature) return;
            const name = feature.properties?.name || 'Trotro Stop';
            const kind = feature.properties?.amenity === 'bus_station' ? 'Bus Station' : 'Trotro Stop';
            new window.maplibregl.Popup({ offset: 10, closeButton: false })
              .setLngLat(e.lngLat)
              .setHTML(`<div style="font:600 12px Outfit,sans-serif;padding:4px 8px;color:#0f172a;"><strong>${name}</strong><div style="font-size:10px;color:#0d9488;font-weight:500;margin-top:2px;">${kind}</div></div>`)
              .addTo(m);
          });
        } catch (err) {
          console.warn('Could not add ambient stops layer', err);
        }
      };

    addAmbientStops();
      if (!window.GHANA_ALL_STOPS) {
        const timer = setInterval(() => {
          if (window.GHANA_ALL_STOPS) {
            addAmbientStops();
            clearInterval(timer);
          }
        }, 300);
        setTimeout(() => clearInterval(timer), 10000);
      }
    });

    const handleWindowResize = () => {
      if (map.current) map.current.resize();
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Render and refresh custom user stops on the map
  const refreshCustomStopsOnMap = () => {
    const m = map.current;
    if (!m || !window.maplibregl) return;
    customStopPins.current.forEach(p => p.remove());
    customStopPins.current = [];

    const saved = TrotroNetwork.getCustomStops ? TrotroNetwork.getCustomStops() : [];
    saved.forEach(st => {
      const pinEl = document.createElement('div');
      pinEl.className = 'custom-stop-map-pin';
      pinEl.innerHTML = `
        <div class="custom-pin-inner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="custom-pin-label">${st.displayName || st.name}</div>
      `;

      const popup = new window.maplibregl.Popup({ offset: 12, closeButton: false })
        .setHTML(`
          <div style="font:600 12px Outfit,sans-serif;padding:6px 10px;color:#0f172a;min-width:140px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="color:#16a34a;font-size:14px;">📍</span>
              <strong>${st.displayName || st.name}</strong>
            </div>
            <div style="font-size:10px;color:#16a34a;font-weight:600;margin-top:2px;">⭐ Custom Saved Stop</div>
            <div style="font-size:10px;color:#64748b;margin-top:2px;">${st.lon.toFixed(4)}°, ${st.lat.toFixed(4)}°</div>
          </div>
        `);

      const marker = new window.maplibregl.Marker({ element: pinEl })
        .setLngLat([st.lon, st.lat])
        .setPopup(popup)
        .addTo(m);

      customStopPins.current.push(marker);
    });
  };

  useEffect(() => {
    isAddStopModeRef.current = isAddStopMode;
    if (setIsAddStopActive) {
      setIsAddStopActive(isAddStopMode);
    }
    const m = map.current;
    if (!m) return;
    if (isAddStopMode) {
      m.getCanvas().style.cursor = 'crosshair';
    } else {
      m.getCanvas().style.cursor = '';
    }
  }, [isAddStopMode, setIsAddStopActive]);

  useEffect(() => {
    if (!mapReady || !map.current) return;
    refreshCustomStopsOnMap();

    const m = map.current;
    const onMapClick = (e) => {
      if (isAddStopModeRef.current) {
        const coords = [e.lngLat.lng, e.lngLat.lat];
        setModalCoords(coords);
        setIsAddStopMode(false);
        if (setIsAddStopActive) setIsAddStopActive(false);
      }
    };

    m.on('click', onMapClick);
    return () => m.off('click', onMapClick);
  }, [mapReady, setIsAddStopActive]);

  const handleUseGpsForStop = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          let lon = pos.coords.longitude;
          let lat = pos.coords.latitude;
          if (lat < 5.4 || lat > 5.8 || lon < -0.4 || lon > 0.1) {
            lon = -0.1854;
            lat = 5.5865;
          }
          setModalCoords([lon, lat]);
          setIsAddStopMode(false);
        },
        () => {
          setModalCoords([-0.1854, 5.5865]);
          setIsAddStopMode(false);
        }
      );
    } else {
      setModalCoords([-0.1854, 5.5865]);
      setIsAddStopMode(false);
    }
  };

  const handleStopSaved = (savedStop) => {
    refreshCustomStopsOnMap();
    setToastMsg(`✅ Stop "${savedStop.name || 'Trotro Stop'}" pinned to your map!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const clearRoute = () => {
    const m = map.current;
    if (!m) return;
    LAYERS.forEach(id => { if (m.getLayer(id)) m.removeLayer(id); });
    SOURCES.forEach(id => { if (m.getSource(id)) m.removeSource(id); });
    pins.current.forEach(p => p.remove());
    pins.current = [];
    setEta(null);
    setFare(null);
    setActiveItin(null);
    setAllItineraries([]);
    setSelectedItinIndex(0);
    setShowAltPicker(false);
    setIsExpanded(false);
  };

  const renderItinerary = async (itin, itinIdx, startCoord, endCoord, rData) => {
    const m = map.current;
    if (!m) return;
    const myId = ++requestId.current;

    LAYERS.forEach(id => { if (m.getLayer(id)) m.removeLayer(id); });
    SOURCES.forEach(id => { if (m.getSource(id)) m.removeSource(id); });
    pins.current.forEach(p => p.remove());
    pins.current = [];

    // Snap every car to the road network.
    const rideFeatures = [];
    const walks = [];
    const changeWalks = [];
    const all = [];
    for (const leg of itin.legs) {
      if (leg.kind === 'ride' && leg.coords && leg.coords.length > 1) {
        const snapped = await snapRide(leg.coords);
        if (myId !== requestId.current) return;
        if (snapped.complete) { leg.minutes = snapped.seconds / 60; leg.meters = snapped.meters; }
        rideFeatures.push({ type: 'Feature', properties: { color: leg.color || '#1d4ed8' }, geometry: { type: 'LineString', coordinates: snapped.line } });
        snapped.line.forEach(c => all.push(c));
      } else if ((leg.kind === 'walk' || leg.kind === 'transfer') && leg.coords && leg.coords.length > 1) {
        const into = leg.kind === 'transfer' ? changeWalks : walks;
        for (let i = 0; i < leg.coords.length - 1; i++) into.push([leg.coords[i], leg.coords[i + 1]]);
        leg.coords.forEach(c => all.push(c));
      } else if (leg.kind === 'arrive' && endCoord && leg.lon && leg.lat) {
        // If passenger's destination is beyond the trotro alight stop, draw last-mile walk line
        const dEnd = Math.hypot(leg.lon - endCoord[0], leg.lat - endCoord[1]) * 111000;
        if (dEnd > 45) {
          walks.push([[leg.lon, leg.lat], endCoord]);
          all.push([leg.lon, leg.lat]);
          all.push(endCoord);
        }
      }
    }
    if (myId !== requestId.current) return;

    if (walks.length) {
      m.addSource('itin-walk', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: walks } } });
      m.addLayer({ id: 'itin-walk-line', type: 'line', source: 'itin-walk', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#8a94a6', 'line-width': 3, 'line-dasharray': [1.4, 1.6] } });
    }
    if (changeWalks.length) {
      m.addSource('itin-change', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: changeWalks } } });
      m.addLayer({ id: 'itin-change-casing', type: 'line', source: 'itin-change', paint: { 'line-color': '#fff', 'line-width': 9 } });
      m.addLayer({ id: 'itin-change-line', type: 'line', source: 'itin-change', paint: { 'line-color': '#f6c800', 'line-width': 5, 'line-dasharray': [1.5, 1.4] } });
    }
    if (rideFeatures.length) {
      m.addSource('itin-route', { type: 'geojson', data: { type: 'FeatureCollection', features: rideFeatures } });
      m.addLayer({ id: 'itin-casing', type: 'line', source: 'itin-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#fff', 'line-width': 10 } });
      m.addLayer({ id: 'itin-line', type: 'line', source: 'itin-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 5.5 } });
    }

    // Stops along each car: intermediate stops, boarding, alight with clean visible dots
    const pts = [];
    itin.legs.filter(l => l.kind === 'ride').forEach(leg => {
      leg.coords.forEach((c, i) => {
        const role = i === 0 ? 'board' : i === leg.coords.length - 1 ? 'alight' : 'stop';
        const name = (leg.stopNames && leg.stopNames[i]) || 'Trotro Stop';
        pts.push({ type: 'Feature', properties: { role, color: leg.color || '#1d4ed8', name }, geometry: { type: 'Point', coordinates: c } });
      });
    });
    if (pts.length) {
      m.addSource('itin-stops', { type: 'geojson', data: { type: 'FeatureCollection', features: pts } });
      m.addLayer({ id: 'itin-stops', type: 'circle', source: 'itin-stops', paint: {
        'circle-radius': ['match', ['get', 'role'], 'board', 8, 'alight', 8, 5],
        'circle-color': ['match', ['get', 'role'], 'board', '#16a34a', 'alight', '#dc2626', '#ffffff'],
        'circle-stroke-color': ['get', 'color'],
        'circle-stroke-width': 2.5
      } });
      m.addLayer({
        id: 'itin-stops-label',
        type: 'symbol',
        source: 'itin-stops',
        minzoom: 12.0,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-optional': true,
          'text-max-width': 8
        },
        paint: {
          'text-color': '#0f172a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5
        }
      });

      m.on('mouseenter', 'itin-stops', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'itin-stops', () => { m.getCanvas().style.cursor = ''; });
      m.on('click', 'itin-stops', (e) => {
        const feature = e.features && e.features[0];
        if (!feature) return;
        const name = feature.properties?.name || 'Trotro Stop';
        const role = feature.properties?.role;
        const label = role === 'board' ? 'Boarding Stop' : role === 'alight' ? 'Drop-off / Destination Stop' : 'Intermediate Bus Stop';
        new window.maplibregl.Popup({ offset: 10, closeButton: false })
          .setLngLat(e.lngLat)
          .setHTML(`<div style="font:600 12px Outfit,sans-serif;padding:4px 8px;color:#0f172a;"><strong>${name}</strong><div style="font-size:10px;color:#1d4ed8;font-weight:500;margin-top:2px;">${label}</div></div>`)
          .addTo(m);
      });
    }

    // Pin placement: ensure Pin A is at the exact origin and Pin B is at the actual destination of the trip line
    const actualOrigin = startCoord || ((all.length > 0 && all[0]) ? all[0] : [-0.1854, 5.5865]);
    const actualDest = endCoord || ((all.length > 0 && all[all.length - 1]) ? all[all.length - 1] : null);

    const ML = window.maplibregl;
    pins.current.push(new ML.Marker({ element: makePin('#16a34a', 'A') }).setLngLat(actualOrigin).addTo(m));
    itin.legs.filter(l => l.kind === 'transfer').forEach((t, i) => {
      pins.current.push(new ML.Marker({ element: makePin('#f59e0b', String(i + 1)) }).setLngLat([t.lon, t.lat]).addTo(m));
    });
    if (actualDest) {
      pins.current.push(new ML.Marker({ element: makePin('#dc2626', 'B') }).setLngLat(actualDest).addTo(m));
      all.push(actualDest);
    }

    const total = itin.legs.reduce((s, l) => s + (l.minutes || 0) + (l.gapMinutes || 0), 0);
    const cars = itin.legs.filter(l => l.kind === 'ride').length;
    const etaStr = `~ ${Math.round(total)} min · ${cars} car${cars === 1 ? '' : 's'}`;
    setEta(etaStr);
    setActiveItin(itin);
    setSelectedItinIndex(itinIdx);

    let fareCalculated = null;
    if (window.TrotroPricing && window.TrotroPricing.getFare) {
      try {
        const roadKm = (itin.legs.reduce((s, l) => s + (l.meters || 0), 0)) / 1000;
        const f = window.TrotroPricing.getFare(startCoord, endCoord, { roadKm });
        if (f && f.ok && f.fare) {
          fareCalculated = `GH₵ ${f.fare.toFixed(2)}`;
        }
      } catch (err) {
        console.warn('Fare error', err);
      }
    }
    setFare(fareCalculated);

    if (onRouteFound) {
      onRouteFound(rData || routeData, itin, etaStr, fareCalculated);
    }

    const bounds = new ML.LngLatBounds();
    all.forEach(c => bounds.extend(c));
    m.fitBounds(bounds, { padding: 60, duration: 800 });
  };

  const resolveStop = async (nameOrCoords, isStart = false) => {
    if (!nameOrCoords) {
      return isStart ? [-0.1854, 5.5865] : null;
    }
    if (Array.isArray(nameOrCoords)) return nameOrCoords;
    if (typeof nameOrCoords === 'object') {
      if (nameOrCoords.stop) return [nameOrCoords.stop.lon, nameOrCoords.stop.lat];
      if (nameOrCoords.lon && nameOrCoords.lat) return [nameOrCoords.lon, nameOrCoords.lat];
    }
    if (typeof nameOrCoords === 'string') {
      if (nameOrCoords.toLowerCase().includes('current location')) {
        return [-0.1854, 5.5865];
      }
      const matched = TrotroNetwork.matchStop ? TrotroNetwork.matchStop(nameOrCoords) : null;
      if (matched) {
        if (matched.stop) return [matched.stop.lon, matched.stop.lat];
        if (matched.lon && matched.lat) return [matched.lon, matched.lat];
      }
      // Fallback for custom place/landmark names not in local trotro stop list
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(nameOrCoords)}&bbox=-0.5,5.4,0.1,5.8&limit=1`);
        if (res.ok) {
          const d = await res.json();
          if (d.features && d.features.length > 0 && d.features[0].geometry && d.features[0].geometry.coordinates) {
            return d.features[0].geometry.coordinates; // [lon, lat]
          }
        }
      } catch (err) {
        console.warn('Geocoding fallback failed', err);
      }
    }
    return null;
  };

  const handleSelectAlternative = async (index) => {
    if (index === selectedItinIndex || !allItineraries[index]) return;
    const startCoord = await resolveStop(routeData.startCoords || routeData.start, true);
    const endCoord = await resolveStop(routeData.endCoords || routeData.end, false);
    if (!startCoord || !endCoord) return;
    renderItinerary(allItineraries[index], index, startCoord, endCoord, routeData);
  };

  useEffect(() => {
    if (!mapReady || !routeData || !routeData.end || !map.current) return;
    (async () => {
      try {
        const startCoord = await resolveStop(routeData.startCoords || routeData.start, true);
        const endCoord = await resolveStop(routeData.endCoords || routeData.end, false);
        if (!startCoord || !endCoord) { setEta('Stop not found'); return; }
        setStartCoordsResolved(startCoord);
        setDestinationCoords(endCoord);

        const result = TrotroNetwork.plan(startCoord, endCoord);
        if (!result.ok || !result.itineraries || !result.itineraries.length) {
          clearRoute();
          setEta('No route found');
          return;
        }

        // Prefer a real trotro journey over a walk-only option.
        const validItins = result.itineraries.filter(i => i.hasRide);
        const sourceItins = validItins.length > 0 ? validItins : result.itineraries;

        // UI guarantee: Deduplicate identical 'via' summaries so no duplicate chips appear
        const itinsToUse = [];
        const seenVias = new Set();
        for (const it of sourceItins) {
          const sum = getAltSummary(it, itinsToUse.length);
          const viaKey = sum.via.toLowerCase().trim();
          if (!seenVias.has(viaKey)) {
            seenVias.add(viaKey);
            itinsToUse.push(it);
          }
        }

        setAllItineraries(itinsToUse);
        setSelectedItinIndex(0);
        setShowAltPicker(false);
        setEta('Finding roads…');

        await renderItinerary(itinsToUse[0], 0, startCoord, endCoord, routeData);
      } catch (e) {
        console.error(e);
        setEta('Routing error');
      }
    })();
  }, [routeData, mapReady]);

  return (
    <div className="map-canvas-container">
      <div ref={mapContainer} className="map-frame" />

      {/* Floating Status Pill */}
      <div className="map-status-pill">
        <span className="dot-green"></span>
        <span>LIVE TROTROS</span>
      </div>

      {/* Add Stop Mode Bottom Floating Card (triggered from Bottom Navigation 'Add stop') */}
      {isAddStopMode && (
        <div className="map-add-stop-banner">
          <div className="add-stop-banner-header">
            <div className="add-stop-banner-text">
              <div className="add-stop-banner-pulse-dot"></div>
              <div>
                <span className="add-stop-banner-title">Pin a TroTro Stop</span>
                <span className="add-stop-banner-desc">Click anywhere on map or choose an option below:</span>
              </div>
            </div>
            <button 
              className="banner-close-btn" 
              onClick={() => {
                setIsAddStopMode(false);
                if (setIsAddStopActive) setIsAddStopActive(false);
              }} 
              title="Cancel"
            >
              <X size={15} />
            </button>
          </div>
          <div className="add-stop-banner-actions">
            <button className="banner-gps-btn" onClick={handleUseGpsForStop} title="Pin your current device GPS location">
              <LocateFixed size={14} />
              <span>Use Current GPS</span>
            </button>
            <button 
              className="banner-center-btn" 
              onClick={() => {
                const center = map.current ? map.current.getCenter() : { lng: -0.1969, lat: 5.6037 };
                setModalCoords([center.lng, center.lat]);
                setIsAddStopMode(false);
                if (setIsAddStopActive) setIsAddStopActive(false);
              }} 
              title="Add a stop at the current map center"
            >
              <MapPin size={14} />
              <span>Add at Map Center</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="map-toast-alert">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Add Stop Modal Dialog */}
      <AddStopModal 
        isOpen={modalCoords !== null}
        coords={modalCoords}
        onClose={() => {
          setModalCoords(null);
          setIsAddStopMode(false);
          if (setIsAddStopActive) setIsAddStopActive(false);
        }}
        onSaveStop={(saved) => {
          handleStopSaved(saved);
          setIsAddStopMode(false);
          if (setIsAddStopActive) setIsAddStopActive(false);
        }}
      />

      {/* Floating Route Summary & Expandable Dropdown Breakdown directly on the Map */}
      {eta && (
        <div className={`floating-route-sheet ${isExpanded ? 'expanded' : ''}`}>
          <div className="route-sheet-top">
            <div 
              className="route-sheet-drag-pill" 
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse route details" : "Expand route details"}
            />
            <div className="route-sheet-top-row">
              <div 
                className="route-sheet-info" 
                onClick={() => setIsExpanded(!isExpanded)}
                title="Click to toggle details breakdown"
                style={{ cursor: 'pointer' }}
              >
                <div className="route-sheet-title-row">
                  <span className="route-sheet-title">{routeData.end || 'Destination'}</span>
                  {allItineraries.length > 1 && (
                    <span className="route-alt-count-badge">
                      {allItineraries.length} Options
                    </span>
                  )}
                </div>
                <div className="route-sheet-subtitle-col">
                  <span className="route-sheet-subtitle">From: {routeData.start}</span>
                  {(() => {
                    const arriveLeg = activeItin?.legs?.find(l => l.kind === 'arrive');
                    const lastRideLeg = activeItin?.legs?.slice().reverse().find(l => l.kind === 'ride');
                    const lastAlight = arriveLeg?.atName || lastRideLeg?.toName;
                    const isOffLine = lastAlight && routeData.end && !routeData.end.toLowerCase().includes(lastAlight.toLowerCase());
                    if (isOffLine) {
                      return (
                        <span className="route-sheet-alight-badge">
                          🚏 Alight at: <strong>{lastAlight}</strong>
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {allItineraries.length > 1 && !isExpanded && (
                  <button 
                    type="button"
                    className={`route-alt-toggle-btn ${showAltPicker ? 'active' : ''}`}
                    onClick={() => setShowAltPicker(!showAltPicker)}
                    title={showAltPicker ? "Hide alternative routes" : "View alternative routes"}
                  >
                    <GitFork size={12} />
                    <span>Alt ({allItineraries.length})</span>
                  </button>
                )}
                <button 
                  type="button"
                  className="route-eta-pill clickable"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Collapse details" : "Expand step-by-step breakdown"}
                >
                  <span>{eta}</span>
                  <span className="pill-more-tag">{isExpanded ? 'Details ▲' : 'Details ▾'}</span>
                </button>
                <button 
                  type="button"
                  className="route-sheet-close" 
                  onClick={() => {
                    clearRoute();
                    if (onClearRoute) onClearRoute();
                  }}
                  title="Clear Route"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Alternative Routes Selector Bar */}
          {allItineraries.length > 1 && (showAltPicker || isExpanded) && (
            <div className="alt-routes-bar">
              <div className="alt-routes-header">
                <div className="alt-header-left">
                  <GitFork size={13} className="alt-icon-green" />
                  <span>Alternative Routes ({allItineraries.length})</span>
                </div>
                <span className="alt-header-hint">Tap any option to switch route</span>
              </div>
              <div className="alt-chips-track">
                {allItineraries.map((it, idx) => {
                  const sum = getAltSummary(it, idx);
                  const isActive = selectedItinIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`alt-chip-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectAlternative(idx)}
                      title={`Select ${sum.title}: ${sum.via} (${sum.time})`}
                    >
                      <div className="alt-chip-header">
                        <span className="alt-chip-title">{sum.title}</span>
                        {isActive ? (
                          <span className="alt-chip-badge selected">Active</span>
                        ) : sum.isDirect ? (
                          <span className="alt-chip-badge direct">Direct</span>
                        ) : idx === 0 ? (
                          <span className="alt-chip-badge best">Fastest</span>
                        ) : (
                          <span className="alt-chip-badge alt">Alt</span>
                        )}
                      </div>
                      <div className="alt-chip-time">{sum.time}</div>
                      <div className="alt-chip-via" title={sum.via}>{sum.via}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Step-by-Step Dropdown Breakdown */}
          {isExpanded && activeItin && (
            <div className="route-breakdown-body">
              <div className="breakdown-stat-bar">
                {fare && (
                  <div className="stat-pill fare-pill">
                    <Banknote size={14} />
                    <span>Est. Fare: <strong>{fare}</strong></span>
                  </div>
                )}
                <div className="stat-pill time-pill">
                  <span>Total Duration: <strong>{eta}</strong></span>
                </div>
              </div>

              {fare && (
                <div className="fare-notice-banner">
                  <Info size={13} className="fare-notice-icon" />
                  <span>Estimated fare. Confirm with mate before you board!</span>
                </div>
              )}

              {/* Trotro Sleep Alarm (800m Geofence Alert) */}
              {routeData && routeData.end && (
                <TrotroSleepAlarm 
                  destinationName={routeData.end}
                  destinationCoords={destinationCoords || routeData.endCoords}
                  lookOutFor={getStopLandmarkCue(routeData.end, 'alight')?.lookOutFor || `Watch for approaching ${routeData.end} landmark.`}
                  mateCall={getStopLandmarkCue(routeData.end, 'alight')?.mateCall || `"Driver, ${routeData.end} Bus Stop!"`}
                />
              )}

              {/* Journey Timeline */}
              <div className="journey-timeline">
                {activeItin.legs && activeItin.legs.map((leg, idx) => {
                  if (leg.kind === 'ride') {
                    return (
                      <div key={idx} className="timeline-step">
                        <div className="timeline-marker">
                          <div className="marker-dot ride-dot" style={{ backgroundColor: leg.color || '#114232' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                              <circle cx="6" cy="18" r="2"></circle>
                              <circle cx="18" cy="18" r="2"></circle>
                              <line x1="2" y1="12" x2="22" y2="12"></line>
                            </svg>
                          </div>
                          <div className="marker-line" style={{ backgroundColor: leg.color || '#114232' }}></div>
                        </div>
                        <div className="timeline-details">
                          <div className="step-badge-row">
                            <span className="trotro-name-badge" style={{ backgroundColor: leg.color || '#114232' }}>
                              Trotro: {leg.fromName} → {leg.toName}
                            </span>
                            {leg.minutes > 0 && <span className="leg-duration">~ {Math.round(leg.minutes)} min</span>}
                          </div>
                          <div className="step-station-row">
                            <span className="action-tag board">BOARD</span>
                            <span className="station-name">{leg.fromName}</span>
                          </div>

                          {/* Boarding Cue & Terminal Photo (Only loaded for Origin Hub) */}
                          {idx === 0 && (
                            <LandmarkCueCard 
                              stopName={leg.fromName} 
                              role="board" 
                              coords={startCoordsResolved || routeData.startCoords}
                            />
                          )}

                          {leg.stopNames && leg.stopNames.length > 2 && (
                            <div className="intermediate-stops">
                              Passes {leg.stopNames.length - 2} intermediate stop{leg.stopNames.length - 2 === 1 ? '' : 's'} (text cues only, zero photo bloat)
                            </div>
                          )}
                          <div className="step-station-row alight-row">
                            <span className="action-tag alight">ALIGHT</span>
                            <span className="station-name">{leg.toName}</span>
                          </div>

                          {/* Look Out For Cue Card if this is the final ride with no arrive step */}
                          {(() => {
                            const isLastRide = !activeItin.legs.slice(idx + 1).some(l => l.kind === 'ride');
                            const hasArrive = activeItin.legs.some(l => l.kind === 'arrive');
                            if (isLastRide && !hasArrive) {
                              return (
                                <LandmarkCueCard 
                                  stopName={leg.toName} 
                                  role="alight" 
                                  destinationName={routeData.end} 
                                  coords={destinationCoords || routeData.endCoords}
                                />
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    );
                  }

                  if (leg.kind === 'transfer') {
                    return (
                      <div key={idx} className="timeline-step">
                        <div className="timeline-marker">
                          <div className="marker-dot transfer-dot">
                            <ArrowRight size={12} color="#fff" />
                          </div>
                          <div className="marker-line dashed"></div>
                        </div>
                        <div className="timeline-details">
                          <div className="transfer-card">
                            <div className="transfer-title">
                              Change Trotros at <strong>{leg.atName || leg.fromName}</strong>
                            </div>
                            <div className="transfer-sub">
                              Alight and switch to your next vehicle
                            </div>
                          </div>
                          <LandmarkCueCard 
                            stopName={leg.atName || leg.fromName} 
                            role="transfer" 
                          />
                        </div>
                      </div>
                    );
                  }

                  if (leg.kind === 'walk') {
                    return (
                      <div key={idx} className="timeline-step">
                        <div className="timeline-marker">
                          <div className="marker-dot walk-dot">
                            <Footprints size={12} color="#64748b" />
                          </div>
                          <div className="marker-line dashed"></div>
                        </div>
                        <div className="timeline-details">
                          <div className="walk-row">
                            <span>Walk to <strong>{leg.toName}</strong></span>
                            <span className="walk-meta">
                              {leg.meters ? `${Math.round(leg.meters)}m` : ''} {leg.minutes ? `(~ ${Math.round(leg.minutes)} min)` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (leg.kind === 'arrive') {
                    const isOffNetwork = (leg.gapM && leg.gapM > 45) || (routeData.end && leg.atName && !routeData.end.toLowerCase().includes(leg.atName.toLowerCase()));
                    const gapMeters = Math.round(leg.gapM || 0);
                    const gapMins = Math.round(leg.gapMinutes || Math.round(gapMeters / 80));

                    return (
                      <div key={idx} className="timeline-step">
                        <div className="timeline-marker">
                          <div className="marker-dot arrive-dot">
                            <MapPin size={12} color="#fff" />
                          </div>
                        </div>
                        <div className="timeline-details">
                          {/* Final Drop-Off / Transfer Stop Landmark & "Look Out For" Card */}
                          <LandmarkCueCard 
                            stopName={leg.atName || routeData.end} 
                            role="alight" 
                            destinationName={routeData.end}
                            coords={destinationCoords || routeData.endCoords}
                            simulatedDistance={gapMeters > 0 ? gapMeters : 650}
                          />

                          {isOffNetwork ? (
                            <div className="alight-destination-card">
                              <div className="alight-header-row">
                                <span className="action-tag alight">ALIGHT HERE</span>
                                <span className="alight-stop-name">{leg.atName}</span>
                              </div>
                              <div className="alight-subtext">
                                Last Trotro stop on this corridor
                              </div>
                              <div className="last-mile-connection-card">
                                <div className="last-mile-header">
                                  <span className="last-mile-badge">
                                    {gapMeters > 1200 ? '🛵 Short Taxi / Okada' : '🚶 Final Leg / Walk'}
                                  </span>
                                  <span className="last-mile-dist">
                                    ~{gapMeters > 1000 ? `${(gapMeters / 1000).toFixed(1)} km` : `${gapMeters}m`} {gapMins > 0 ? `(~${gapMins} min)` : ''}
                                  </span>
                                </div>
                                <p className="last-mile-instruction">
                                  Alight the trotro at <strong>{leg.atName}</strong>. 
                                  {gapMeters > 1200 ? (
                                    <> Take a short local taxi or okada directly to your destination at <strong>{routeData.end}</strong>.</>
                                  ) : (
                                    <> Walk the remaining {gapMeters}m directly to your destination at <strong>{routeData.end}</strong>.</>
                                  )}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="arrive-row">
                              <strong>Arrive at {leg.atName || routeData.end}</strong>
                              {leg.gapM > 0 && (
                                <span className="arrive-sub">Destination is ~ {Math.round(leg.gapM)}m walk from final stop</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
