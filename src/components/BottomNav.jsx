import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Route, MapPinPlus, LayoutGrid } from 'lucide-react';
import './BottomNav.css';

const NAV_ITEMS = [
  { 
    path: '/home', 
    label: 'Home', 
    icon: Home, 
    color: '#0f172a',
    gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    glow: 'rgba(15, 23, 42, 0.35)',
    bgTint: 'rgba(15, 23, 42, 0.10)'
  },
  { 
    path: '/app', 
    label: 'Explore', 
    icon: Compass, 
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
    glow: 'rgba(16, 185, 129, 0.35)',
    bgTint: 'rgba(16, 185, 129, 0.12)'
  },
  { 
    path: '/trips', 
    label: 'My trips', 
    icon: Route, 
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    glow: 'rgba(59, 130, 246, 0.35)',
    bgTint: 'rgba(59, 130, 246, 0.12)'
  },
  { 
    path: '/add-stop', 
    label: 'Add stop', 
    icon: MapPinPlus, 
    color: '#16a34a',
    gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
    glow: 'rgba(22, 163, 74, 0.35)',
    bgTint: 'rgba(22, 163, 74, 0.12)',
    isAction: true
  },
  { 
    path: '/more', 
    label: 'More', 
    icon: LayoutGrid, 
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    glow: 'rgba(139, 92, 246, 0.35)',
    bgTint: 'rgba(139, 92, 246, 0.12)'
  }
];

export default function BottomNav({ onTriggerAddStop, isAddStopActive, setIsAddStopActive }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [clickedIndex, setClickedIndex] = useState(null);

  // Find active index (0: Home, 1: Explore, 2: My trips, 3: Add stop, 4: More)
  const activeIndex = isAddStopActive 
    ? 3 
    : NAV_ITEMS.findIndex(item => {
        if (item.path === '/home') return location.pathname === '/home';
        if (item.path === '/app') return location.pathname === '/app' || location.pathname === '/' || location.pathname === '/map';
        return location.pathname.startsWith(item.path);
      });

  const validIndex = activeIndex >= 0 ? activeIndex : 1;
  const currentItem = NAV_ITEMS[validIndex];

  const handleTabClick = (e, item, idx) => {
    setClickedIndex(idx);
    setTimeout(() => setClickedIndex(null), 400);

    if (item.isAction || item.path === '/add-stop') {
      e.preventDefault();
      if (location.pathname !== '/app' && location.pathname !== '/') {
        navigate('/app');
      }
      if (onTriggerAddStop) {
        onTriggerAddStop();
      }
    } else {
      if (setIsAddStopActive) {
        setIsAddStopActive(false);
      }
    }
  };

  return (
    <nav className="bottom-nav-container" aria-label="Bottom Navigation">
      <div className="bottom-nav-dock">
        {/* Dynamic Liquid Glowing Track */}
        <div 
          className="liquid-sliding-pill" 
          style={{ 
            transform: `translateX(${validIndex * 100}%)`,
            background: currentItem.bgTint,
            borderColor: `${currentItem.color}33`,
            boxShadow: `0 4px 18px ${currentItem.glow}`
          }}
        />

        {NAV_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = validIndex === idx;
          const isClicked = clickedIndex === idx;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-tab-item ${isActive ? 'active' : ''} ${isClicked ? 'clicked' : ''}`}
              onClick={(e) => handleTabClick(e, item, idx)}
            >
              {/* Full Block Coloured Icon Badge */}
              <div 
                className="block-icon-badge"
                style={{
                  background: isActive ? item.gradient : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? `0 6px 16px ${item.glow}` : 'none'
                }}
              >
                <Icon 
                  className="nav-svg-icon" 
                  size={18} 
                  strokeWidth={isActive ? 2.6 : 2.1} 
                />
              </div>

              {/* Label */}
              <span 
                className="nav-item-label"
                style={{ 
                  color: isActive ? '#0f172a' : '#64748b',
                  fontWeight: isActive ? 800 : 600
                }}
              >
                {item.label}
              </span>

              {/* Active Sub-Dot Indicator */}
              <span 
                className="active-indicator-dot" 
                style={{ 
                  backgroundColor: item.color,
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(0)'
                }}
              />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
