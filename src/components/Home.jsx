import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import SearchCard from './SearchCard';
import PackageDeliveryCard from './PackageDeliveryCard';
import MapCard from './MapCard';

export default function Home({ 
  routeData, 
  setRouteData, 
  onRouteFound, 
  onClearRoute,
  addStopTrigger,
  isAddStopActive,
  setIsAddStopActive
}) {
  const location = useLocation();
  const [activeMode, setActiveMode] = useState('ride'); // 'ride' | 'package'

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'package') {
      setActiveMode('package');
    }
    const fromParam = params.get('from');
    const toParam = params.get('to');
    if (toParam) {
      handleSearch(fromParam || 'My current location', toParam);
    }
  }, [location.search]);

  const [cachedGps, setCachedGps] = useState([-0.1854, 5.5865]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          let lon = pos.coords.longitude;
          let lat = pos.coords.latitude;
          if (lat >= 5.4 && lat <= 5.8 && lon >= -0.4 && lon <= 0.1) {
            setCachedGps([lon, lat]);
          }
        },
        () => {}
      );
    }
  }, []);

  const handleSearch = (startInput, endInput, startCoords = null, endCoords = null) => {
    const fromLoc = (startInput && startInput.trim()) ? startInput.trim() : 'My current location';
    const toLoc = (endInput && endInput.trim()) ? endInput.trim() : '';
    if (!toLoc) return;

    if (fromLoc === 'My current location') {
      setRouteData({
        start: 'My current location',
        startCoords: startCoords || cachedGps,
        end: toLoc,
        endCoords: endCoords
      });

      if (!startCoords && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            let lon = pos.coords.longitude;
            let lat = pos.coords.latitude;
            if (lat >= 5.4 && lat <= 5.8 && lon >= -0.4 && lon <= 0.1) {
              setCachedGps([lon, lat]);
              setRouteData({
                start: 'My current location',
                startCoords: [lon, lat],
                end: toLoc,
                endCoords: endCoords
              });
            }
          },
          () => {}
        );
      }
    } else {
      // User typed a specific FROM location
      setRouteData({
        start: fromLoc,
        startCoords: startCoords,
        end: toLoc,
        endCoords: endCoords
      });
    }
  };

  const handlePackageDispatch = (startName, endName, startCoords, endCoords) => {
    setRouteData({
      start: startName,
      startCoords,
      end: endName,
      endCoords
    });
  };

  return (
    <main className="home-main">
      <MapCard 
        routeData={routeData} 
        onRouteFound={onRouteFound}
        onClearRoute={onClearRoute}
        addStopTrigger={addStopTrigger}
        isAddStopActive={isAddStopActive}
        setIsAddStopActive={setIsAddStopActive}
      />
      
      <div className="home-top-panel">
        <ModeToggle 
          activeMode={activeMode} 
          onModeChange={(mode) => {
            setActiveMode(mode);
            if (onClearRoute) onClearRoute();
          }} 
        />

        {activeMode === 'ride' ? (
          <SearchCard 
            onSearch={handleSearch} 
            onClearRoute={onClearRoute}
            routeData={routeData}
          />
        ) : (
          <PackageDeliveryCard onDispatchRoute={handlePackageDispatch} />
        )}
      </div>
    </main>
  );
}
