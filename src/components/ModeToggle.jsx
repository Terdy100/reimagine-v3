import React from 'react';
import { Navigation2, Package } from 'lucide-react';
import './ModeToggle.css';

export default function ModeToggle({ activeMode = 'ride', onModeChange }) {
  const isRide = activeMode === 'ride';

  return (
    <div className="mode-toggle-container">
      <button 
        className={`mode-pill-btn ${isRide ? 'active ride-active' : ''}`}
        onClick={() => onModeChange && onModeChange('ride')}
        type="button"
        aria-pressed={isRide}
      >
        <div className="mode-pill-icon">
          <Navigation2 size={13} fill="currentColor" />
        </div>
        <span className="mode-pill-label">Find a ride</span>
      </button>

      <button 
        className={`mode-pill-btn ${!isRide ? 'active package-active' : ''}`}
        onClick={() => onModeChange && onModeChange('package')}
        type="button"
        aria-pressed={!isRide}
      >
        <div className="mode-pill-icon">
          <Package size={14} />
        </div>
        <span className="mode-pill-label">Send a package</span>
        <span className="mode-badge-new">NEW</span>
      </button>
    </div>
  );
}
