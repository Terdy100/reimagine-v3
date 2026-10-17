import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import './Header.css';

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const playBeep = (freqStart, freqEnd, delay) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }, delay);
    };
    playBeep(800, 1200, 0);
    playBeep(1000, 1500, 150);
  } catch {
    console.error("Audio not supported");
  }
};

export default function Header({ onBellClick, onProfileClick }) {
  const [animating, setAnimating] = useState(false);

  const handleBellClick = () => {
    playNotificationSound();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);
    if (onBellClick) onBellClick();
  };

  return (
    <div className="menu-header">
      <div className="header-left">
        <a href="/" className="header-brand-link" title="Spark Motion Home">
          <div className="logo-box">
            <img src="/logo.png" alt="Spark Motion Logo" className="header-logo-img" />
          </div>
          <div className="header-titles">
            <h1>Spark<span>Motion</span></h1>
            <div className="location-badge">
              <span className="dot"></span>
              <span>Accra, Ghana</span>
            </div>
          </div>
        </a>
      </div>
      <div className="header-right">
        <button className={`icon-btn bell-btn ${animating ? 'ring' : ''}`} onClick={handleBellClick} title="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="avatar" onClick={onProfileClick} title="User Profile">K</div>
      </div>
    </div>
  );
}
