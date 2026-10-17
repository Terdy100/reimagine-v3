import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Home from './components/Home';
import More from './components/More';
import BottomNav from './components/BottomNav';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [routeData, setRouteData] = useState(null);
  const [addStopTrigger, setAddStopTrigger] = useState(0);
  const [isAddStopActive, setIsAddStopActive] = useState(false);

  const handleRouteFound = (_rData, _itin, _etaStr, _fare) => {};

  const handleClearRoute = () => {
    setRouteData(null);
  };

  const handleTriggerAddStop = () => {
    setIsAddStopActive(true);
    setAddStopTrigger(prev => prev + 1);
  };

  const isLanding = location.pathname === '/home';

  if (isLanding) {
    return (
      <div className="landing-viewport">
        <LandingPage />
        <div className="landing-bottom-nav-dock">
          <BottomNav 
            onTriggerAddStop={handleTriggerAddStop} 
            isAddStopActive={isAddStopActive}
            setIsAddStopActive={setIsAddStopActive}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              routeData={routeData}
              setRouteData={setRouteData}
              onRouteFound={handleRouteFound}
              onClearRoute={handleClearRoute}
              addStopTrigger={addStopTrigger}
              isAddStopActive={isAddStopActive}
              setIsAddStopActive={setIsAddStopActive}
            />
          } 
        />
        <Route 
          path="/app" 
          element={
            <Home 
              routeData={routeData}
              setRouteData={setRouteData}
              onRouteFound={handleRouteFound}
              onClearRoute={handleClearRoute}
              addStopTrigger={addStopTrigger}
              isAddStopActive={isAddStopActive}
              setIsAddStopActive={setIsAddStopActive}
            />
          } 
        />
        <Route 
          path="/map" 
          element={
            <Home 
              routeData={routeData}
              setRouteData={setRouteData}
              onRouteFound={handleRouteFound}
              onClearRoute={handleClearRoute}
              addStopTrigger={addStopTrigger}
              isAddStopActive={isAddStopActive}
              setIsAddStopActive={setIsAddStopActive}
            />
          } 
        />
        
        <Route path="/trips" element={<main className="subpage-main"><div className="empty-state-card"><h3>My Trips</h3><p>Recent trips and tickets will appear here.</p></div></main>} />
        <Route 
          path="/saved" 
          element={
            <Home 
              routeData={routeData}
              setRouteData={setRouteData}
              onRouteFound={handleRouteFound}
              onClearRoute={handleClearRoute}
              addStopTrigger={addStopTrigger || 1}
              isAddStopActive={true}
              setIsAddStopActive={setIsAddStopActive}
            />
          } 
        />
        <Route 
          path="/add-stop" 
          element={
            <Home 
              routeData={routeData}
              setRouteData={setRouteData}
              onRouteFound={handleRouteFound}
              onClearRoute={handleClearRoute}
              addStopTrigger={addStopTrigger || 1}
              isAddStopActive={true}
              setIsAddStopActive={setIsAddStopActive}
            />
          } 
        />
        <Route path="/more" element={<More />} />
      </Routes>

      <BottomNav 
        onTriggerAddStop={handleTriggerAddStop} 
        isAddStopActive={isAddStopActive}
        setIsAddStopActive={setIsAddStopActive}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
