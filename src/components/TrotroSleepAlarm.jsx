import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, BellRing, Navigation, Volume2, VolumeX, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { calculateDistanceMeters } from '../utils/landmark-cues.js';
import './TrotroSleepAlarm.css';

/**
 * ============================================================================
 * TROTRO SLEEP ALARM & 800M GEOFENCE WAKE-UP ENGINE
 * ============================================================================
 * Ensures commuters never miss their drop-off when asleep or distracted in traffic.
 * Continuously tracks GPS coordinates and triggers audio + vibration + voice alert
 * when entering the 800m geofence radius.
 */
export default function TrotroSleepAlarm({
  destinationName,
  destinationCoords, // [lon, lat] or { lon, lat }
  lookOutFor = '',
  mateCall = '"Driver, Bus Stop!"'
}) {
  const [isArmed, setIsArmed] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [distanceM, setDistanceM] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);

  const watchIdRef = useRef(null);
  const audioCtxRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const vibrateIntervalRef = useRef(null);

  // Normalize destination coordinates to [lat, lon]
  const getDestLatLon = () => {
    if (!destinationCoords) return null;
    if (Array.isArray(destinationCoords) && destinationCoords.length >= 2) {
      const a = destinationCoords[0];
      const b = destinationCoords[1];
      // Ghana coordinates: Lon is -0.x (W), Lat is 5.x (N)
      if (a < 0 && b > 0) return { lat: b, lon: a };
      return { lat: a, lon: b };
    }
    if (destinationCoords.lat && destinationCoords.lon) {
      return { lat: destinationCoords.lat, lon: destinationCoords.lon };
    }
    return null;
  };

  const destPoint = getDestLatLon();

  // Web Audio API offline alarm sound synthesizer
  const playAlarmTone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Beep 1 (high pitch)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5 note
      osc1.frequency.exponentialRampToValueAtTime(1174, now + 0.15); // D6
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Beep 2 (rapid chime)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, now + 0.15); // E6
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  };

  // Start continuous alarm effects (audio + vibration + speech)
  const fireGeofenceAlert = () => {
    setIsTriggered(true);

    // 1. Play immediate audio tone
    playAlarmTone();
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(playAlarmTone, 800);

    // 2. Continuous phone vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([500, 250, 500, 250, 500, 250, 800]);
      if (vibrateIntervalRef.current) clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = setInterval(() => {
        navigator.vibrate([500, 250, 500, 250, 500, 250, 800]);
      }, 3000);
    }

    // 3. Spoken voice alert
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
          `Wake up! You are 800 meters from ${destinationName || 'your stop'}. Tell the mate now!`
        );
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      } catch (_e) {}
    }
  };

  // Stop alarm
  const dismissAlarm = () => {
    setIsTriggered(false);
    setIsArmed(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // GPS tracking effect
  useEffect(() => {
    if (!isArmed || isSimulated) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported on this device.');
      return;
    }

    setGpsError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        setGpsAccuracy(Math.round(pos.coords.accuracy));

        if (destPoint) {
          const dist = calculateDistanceMeters(userLat, userLon, destPoint.lat, destPoint.lon);
          setDistanceM(dist);

          // 800M GEOFENCE BREACH TRIGGER
          if (dist <= 800 && !isTriggered) {
            fireGeofenceAlert();
          }
        }
      },
      (err) => {
        console.warn('GPS Watch error:', err);
        setGpsError('Unable to lock GPS location. Ensure location is enabled.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isArmed, isSimulated, destPoint, isTriggered]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dismissAlarm();
    };
  }, []);

  // Simulate 800m test
  const handleSimulate800m = () => {
    setIsArmed(true);
    setIsSimulated(true);
    setDistanceM(650);
    fireGeofenceAlert();
  };

  return (
    <div className={`trotro-sleep-alarm-card ${isArmed ? 'armed' : ''} ${isTriggered ? 'triggered' : ''}`}>
      <div className="alarm-header-row">
        <div className="alarm-title-group">
          <div className={`alarm-icon-badge ${isArmed ? 'pulse-active' : ''}`}>
            {isTriggered ? (
              <BellRing size={20} className="ring-icon" />
            ) : isArmed ? (
              <Bell size={20} color="#16a34a" />
            ) : (
              <BellOff size={20} color="#64748b" />
            )}
          </div>
          <div>
            <div className="alarm-main-title">
              Trotro Sleep Alarm (800m Geofence)
            </div>
            <div className="alarm-sub-title">
              {isArmed ? (
                <span className="live-gps-tracking">
                  <Navigation size={12} className="spin-nav" />
                  Live GPS tracking destination: <strong>{destinationName}</strong>
                </span>
              ) : (
                'Relax in traffic — phone will vibrate & chime when 800m away'
              )}
            </div>
          </div>
        </div>

        <div className="alarm-controls">
          {isArmed ? (
            <button 
              className="alarm-toggle-btn active"
              onClick={dismissAlarm}
              title="Disarm sleep alarm"
            >
              <BellOff size={15} />
              <span>Alarm On</span>
            </button>
          ) : (
            <button 
              className="alarm-toggle-btn inactive"
              onClick={() => {
                setIsArmed(true);
                setIsSimulated(false);
              }}
              title="Arm sleep alarm for drop-off stop"
            >
              <Bell size={15} />
              <span>Turn On Alarm</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time distance status bar when armed */}
      {isArmed && (
        <div className="alarm-distance-status">
          <div className="status-metric">
            <span className="metric-label">DISTANCE TO DROP-OFF:</span>
            <span className={`metric-value ${distanceM && distanceM <= 800 ? 'urgent' : ''}`}>
              {distanceM !== null ? (
                distanceM > 1000 ? `${(distanceM / 1000).toFixed(2)} km` : `${distanceM} meters`
              ) : (
                'Acquiring satellite lock...'
              )}
            </span>
          </div>

          <div className="geofence-threshold-pill">
            <Smartphone size={13} />
            <span>Triggers at &le; 800m</span>
          </div>
        </div>
      )}

      {/* Simulator Test Action */}
      <div className="alarm-simulation-row">
        <span className="sim-hint">Want to test how it sounds and vibrates?</span>
        <button 
          className="sim-test-btn" 
          onClick={handleSimulate800m}
          title="Test 800m Geofence Wake-Up Trigger right now"
        >
          <Volume2 size={13} />
          <span>Simulate 800m Alert (Test)</span>
        </button>
      </div>

      {gpsError && (
        <div className="alarm-error-notice">
          <AlertTriangle size={13} />
          <span>{gpsError}</span>
        </div>
      )}

      {/* FULL WAKE-UP ALERT MODAL / SCREEN OVERLAY */}
      {isTriggered && (
        <div className="wakeup-alert-overlay">
          <div className="wakeup-modal-box">
            <div className="wakeup-header">
              <div className="wakeup-alarm-ring">
                <BellRing size={36} color="#ffffff" className="huge-ring" />
              </div>
              <h2>WAKE UP! 800M AWAY!</h2>
              <p className="wakeup-stop-target">
                Approaching: <strong>{destinationName}</strong>
              </p>
            </div>

            <div className="wakeup-content">
              {lookOutFor && (
                <div className="wakeup-cue-card">
                  <span className="wakeup-cue-label">LOOK OUT FOR:</span>
                  <p className="wakeup-cue-text">{lookOutFor}</p>
                </div>
              )}

              <div className="wakeup-mate-banner">
                <span className="mate-banner-tag">TELL THE MATE NOW:</span>
                <span className="mate-banner-phrase">{mateCall}</span>
              </div>
            </div>

            <button className="wakeup-dismiss-btn" onClick={dismissAlarm}>
              <CheckCircle size={20} />
              <span>I'M AWAKE — DISMISS ALARM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
