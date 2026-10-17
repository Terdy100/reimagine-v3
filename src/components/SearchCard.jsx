import React, { useState, useEffect, useRef } from 'react';
import { LocateFixed, Search, X, MapPin, Building2, ArrowDownUp, Sparkles } from 'lucide-react';
import TrotroNetwork from '../utils/trotro-network.js';
import './SearchCard.css';

const POPULAR_STOPS = [
  'Circle', 'Osu', 'Madina', 'Lapaz', 'Dansoman', 'Spintex', 
  'Kasoa', 'East Legon', 'Achimota', 'Tema', 'Airport', 'Adenta'
];

export default function SearchCard({ onSearch, onClearRoute, routeData }) {
  const [start, setStart] = useState('My current location');
  const [end, setEnd] = useState('');
  const [activeField, setActiveField] = useState('end'); // 'start' | 'end'
  const [isLocating, setIsLocating] = useState(false);
  const [startCoord, setStartCoord] = useState(null);
  const [endCoord, setEndCoord] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const geocodeCache = useRef(new Map());
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!routeData) {
      setEnd('');
      setEndCoord(null);
      setSuggestions([]);
    } else if (routeData.end && routeData.end !== end) {
      setEnd(routeData.end);
    }
  }, [routeData]);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setStart('My current location');
    setStartCoord(null);
    setTimeout(() => {
      setIsLocating(false);
      if (end.trim()) {
        onSearch('My current location', end.trim(), null, endCoord);
      }
    }, 300);
  };

  const handleSwap = () => {
    const oldStart = start;
    const oldEnd = end;
    const oldStartCoord = startCoord;
    const oldEndCoord = endCoord;

    // Only swap if at least one field has text
    if (!oldStart && !oldEnd) return;

    setStart(oldEnd);
    setStartCoord(oldEndCoord);
    setEnd(oldStart);
    setEndCoord(oldStartCoord);

    if (oldEnd && oldStart) {
      onSearch(oldEnd, oldStart, oldEndCoord, oldStartCoord);
    }
  };

  const mergeWithPlaces = (stops, places) => {
    const combined = [...stops];
    const seenNames = new Set(stops.map(s => (s.displayName || s.name || '').toLowerCase()));
    
    for (const p of places) {
      const pName = (p.displayName || p.name || '').toLowerCase();
      if (!seenNames.has(pName)) {
        seenNames.add(pName);
        combined.push(p);
      }
      if (combined.length >= 7) break;
    }
    setSuggestions(combined);
  };

  useEffect(() => {
    const query = activeField === 'start' ? start : end;
    if (!query || query.trim().length < 1 || query === 'My current location') {
      setSuggestions([]);
      return;
    }

    const q = query.trim();

    // 1. Instant local trotro stops & stations
    const localHits = (TrotroNetwork && TrotroNetwork.searchStops)
      ? TrotroNetwork.searchStops(q, 5).map(s => ({ ...s, isTrotroStop: true }))
      : [];

    setSuggestions(localHits);

    // 2. Debounced landmark & place search (OpenStreetMap Photon Ghana)
    if (q.length < 2) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    const timer = setTimeout(async () => {
      try {
        if (geocodeCache.current.has(q.toLowerCase())) {
          const cached = geocodeCache.current.get(q.toLowerCase());
          mergeWithPlaces(localHits, cached);
          return;
        }

        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&bbox=-0.5,5.4,0.1,5.8&limit=4`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = await res.json();
        const placeHits = (data.features || []).map(f => {
          const p = f.properties || {};
          const coords = f.geometry && f.geometry.coordinates;
          const street = p.street || '';
          const district = p.district || p.city || p.county || 'Greater Accra';
          const metaText = [street, district].filter(Boolean).join(', ') || 'Landmark / Area';
          return {
            name: p.name || q,
            displayName: p.name || q,
            lon: coords ? coords[0] : null,
            lat: coords ? coords[1] : null,
            station: false,
            isPlace: true,
            note: metaText
          };
        }).filter(item => item.lon != null && item.lat != null && item.name);

        geocodeCache.current.set(q.toLowerCase(), placeHits);
        mergeWithPlaces(localHits, placeHits);
      } catch {
        // Fallback: keep local trotro stop hits
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [start, end, activeField]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item) => {
    const itemName = typeof item === 'string' ? item : (item.displayName || item.name);
    const itemCoord = (typeof item === 'object' && item.lon != null && item.lat != null) ? [item.lon, item.lat] : null;

    if (activeField === 'start') {
      setStart(itemName);
      setStartCoord(itemCoord);
      setShowSuggestions(false);
      if (end.trim()) {
        onSearch(itemName, end.trim(), itemCoord, endCoord);
      }
    } else {
      setEnd(itemName);
      setEndCoord(itemCoord);
      setShowSuggestions(false);
      const fromLoc = (start && start.trim()) ? start.trim() : 'My current location';
      onSearch(fromLoc, itemName, startCoord, itemCoord);
    }
  };

  const triggerSearch = () => {
    setShowSuggestions(false);
    const fromLoc = (start && start.trim()) ? start.trim() : 'My current location';
    const toLoc = end && end.trim() ? end.trim() : '';
    if (toLoc) {
      let cEnd = endCoord;
      if (!cEnd && suggestions.length > 0) {
        const top = suggestions[0];
        if (top.name.toLowerCase() === toLoc.toLowerCase()) {
          cEnd = [top.lon, top.lat];
        }
      }
      onSearch(fromLoc, toLoc, startCoord, cEnd);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  return (
    <div className="search-card-wrapper" ref={dropdownRef}>
      <div className="search-card">
        {/* Origin Row */}
        <div className="search-row border-bottom">
          <div className="search-node-column">
            <div className="route-node origin-node" title="Starting Point">
              <div className="node-dot-green"></div>
            </div>
            <div className="route-connector-line"></div>
          </div>

          <div className="search-input-col">
            <span className="search-label">FROM</span>
            <input 
              value={start} 
              onChange={e => {
                setStart(e.target.value);
                setStartCoord(null);
                setActiveField('start');
                setShowSuggestions(true);
              }} 
              onFocus={() => {
                setActiveField('start');
                setShowSuggestions(true);
              }}
              placeholder="Enter pickup stop or 'My current location'" 
              className="search-input"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="search-actions-col">
            {start && start !== 'My current location' ? (
              <button 
                className="search-action-btn" 
                onClick={() => {
                  setStart('');
                  setStartCoord(null);
                  setActiveField('start');
                  setShowSuggestions(false);
                }}
                title="Clear start location"
                type="button"
              >
                <X size={15} />
              </button>
            ) : (
              <button 
                className={`search-action-btn gps-btn ${isLocating ? 'locating' : ''}`} 
                onClick={handleUseMyLocation}
                title="Using current GPS location"
                type="button"
              >
                <LocateFixed size={16} />
              </button>
            )}
            
            <button
              className="search-action-btn swap-btn"
              onClick={handleSwap}
              title="Swap pickup and destination"
              type="button"
            >
              <ArrowDownUp size={14} />
            </button>
          </div>
        </div>

        {/* Destination Row */}
        <div className="search-row">
          <div className="search-node-column">
            <div className="route-node dest-node" title="Destination">
              <div className="node-square-red"></div>
            </div>
          </div>

          <div className="search-input-col">
            <span className="search-label">WHERE ARE YOU GOING?</span>
            <input 
              value={end} 
              onChange={e => {
                setEnd(e.target.value);
                setEndCoord(null);
                setActiveField('end');
                setShowSuggestions(true);
              }} 
              onFocus={() => {
                setActiveField('end');
                setShowSuggestions(true);
              }}
              placeholder="e.g. Circle, Ridge Hospital, UG Legon, Osu..." 
              onKeyDown={handleKeyDown}
              className="search-input"
            />
          </div>

          <div className="search-actions-col">
            {end ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button 
                  className="search-action-btn" 
                  onClick={() => {
                    setEnd('');
                    setEndCoord(null);
                    setSuggestions([]);
                    if (onClearRoute) onClearRoute();
                  }} 
                  title="Clear destination"
                  type="button"
                >
                  <X size={14} />
                </button>
                <button 
                  className="search-action-btn primary-search-btn" 
                  onClick={triggerSearch} 
                  title="Find Route"
                  type="button"
                >
                  <Search size={15} />
                </button>
              </div>
            ) : (
              <button 
                className="search-action-btn primary-search-btn" 
                onClick={triggerSearch} 
                title="Search"
                type="button"
              >
                <Search size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Autocomplete & Quick Destination Suggestions */}
      {showSuggestions && (
        <div className="search-suggestions-dropdown">
          {suggestions.length > 0 ? (
            <div className="suggestions-list">
              <div className="suggestions-header">
                {activeField === 'start' ? 'MATCHING PICKUP STOPS & PLACES' : 'MATCHING DESTINATIONS & PLACES'}
              </div>
              {suggestions.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`suggestion-item ${item.isPlace ? 'place-item' : ''}`}
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <div className="suggestion-icon-wrap">
                    {item.isPlace ? (
                      <MapPin size={16} className="place-icon" />
                    ) : item.station ? (
                      <Building2 size={16} className="station-icon" />
                    ) : (
                      <MapPin size={16} className="stop-icon" />
                    )}
                  </div>
                  <div className="suggestion-text">
                    <div className="suggestion-name-row">
                      <span className="suggestion-name">{item.displayName || item.name}</span>
                      {item.isPlace && <span className="suggestion-type-badge place">Landmark</span>}
                      {item.station && <span className="suggestion-type-badge station">Major Hub</span>}
                      {item.isTrotroStop && !item.station && <span className="suggestion-type-badge trotro">Trotro Stop</span>}
                    </div>
                    <span className="suggestion-meta">{item.note || (item.station ? 'Bus Terminal / Hub' : 'Trotro Stop')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="quick-chips-wrapper">
              {TrotroNetwork.getCustomStops && TrotroNetwork.getCustomStops().length > 0 && (
                <div className="custom-stops-group">
                  <div className="suggestions-header custom-header">
                    <Sparkles size={12} />
                    <span>YOUR PINNED STOPS</span>
                  </div>
                  <div className="quick-chips-grid">
                    {TrotroNetwork.getCustomStops().slice(0, 4).map((s) => (
                      <button 
                        key={s.name}
                        type="button"
                        className="quick-dest-chip custom-chip"
                        onClick={() => handleSelectSuggestion(s.displayName || s.name)}
                      >
                        📍 {s.displayName || s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="suggestions-header">
                {activeField === 'start' ? 'POPULAR PICKUP LOCATIONS' : 'POPULAR DESTINATIONS'}
              </div>
              <div className="quick-chips-grid">
                {POPULAR_STOPS.map((stopName) => (
                  <button 
                    key={stopName}
                    type="button"
                    className="quick-dest-chip"
                    onClick={() => handleSelectSuggestion(stopName)}
                  >
                    {stopName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
