import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Sparkles, Check, X, Loader2, Navigation, Camera, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import TrotroNetwork from '../utils/trotro-network.js';
import { saveContributorCue, compressImageFile } from '../utils/landmark-cues.js';
import './AddStopModal.css';

/**
 * Reverse geocodes [lon, lat] using OpenStreetMap Nominatim with fast timeout.
 */
async function fetchDetectedPlaceName(lon, lat) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' }
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;

    const addr = data.address || {};
    // Check specific landmarks, bus stop name, amenities, road, or neighborhood
    const detected = data.name ||
      addr.bus_stop ||
      addr.amenity ||
      addr.road ||
      addr.neighbourhood ||
      addr.suburb ||
      addr.residential ||
      addr.quarter ||
      addr.village ||
      addr.town;

    if (detected) {
      return detected;
    }

    if (data.display_name) {
      return data.display_name.split(',')[0].trim();
    }
  } catch (err) {
    console.warn('Reverse geocode timeout or offline', err);
  }
  return null;
}

export default function AddStopModal({ isOpen, coords, onClose, onSaveStop }) {
  const [customName, setCustomName] = useState('');
  const [detectedName, setDetectedName] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isStation, setIsStation] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [landmarkCue, setLandmarkCue] = useState('');
  const [showPhotoSection, setShowPhotoSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const cameraInputRef = useRef(null);

  const handleCameraCapture = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      setIsCompressingPhoto(true);
      const dataUrl = await compressImageFile(file, 800, 0.75);
      setPhotoUrl(dataUrl);
    } catch (err) {
      console.warn('Camera compression failed', err);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const lon = coords ? coords[0] : null;
  const lat = coords ? coords[1] : null;

  // When opened with coordinates, automatically trigger place detection
  useEffect(() => {
    if (!isOpen || lon == null || lat == null) {
      setCustomName('');
      setDetectedName('');
      setIsDetecting(false);
      setIsStation(false);
      return;
    }

    let isMounted = true;
    setIsDetecting(true);
    setDetectedName('');
    setCustomName('');

    fetchDetectedPlaceName(lon, lat).then((place) => {
      if (!isMounted) return;
      setIsDetecting(false);
      if (place) {
        setDetectedName(place);
        setCustomName(place); // prefill with detected name
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, lon, lat]);

  if (!isOpen || lon == null || lat == null) return null;

  // Compute what the final name will be based on user rule:
  // 1. User input if entered
  // 2. Detected place name if found
  // 3. Fallback to "Trotro Stop"
  const effectiveName = customName.trim() || detectedName.trim() || 'Trotro Stop';

  const handleSave = () => {
    setIsSaving(true);
    const newStop = TrotroNetwork.addCustomStop({
      name: customName.trim(),
      detectedName: detectedName.trim(),
      lon: lon,
      lat: lat,
      station: isStation,
      stationNote: isStation ? `${effectiveName} Bus Terminal` : null
    });

    if (photoUrl.trim() || landmarkCue.trim()) {
      saveContributorCue(effectiveName, {
        photoUrl: photoUrl.trim() || null,
        lookOutFor: landmarkCue.trim() || `Look for ${effectiveName} landmark along the road`,
        boardingCue: isStation ? `Board inside ${effectiveName} terminal rank` : `Stand by the roadside rank at ${effectiveName}`,
        hubType: isStation ? 'terminal' : 'street_stop'
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      if (onSaveStop) onSaveStop(newStop || { name: effectiveName, lon, lat, station: isStation });
      onClose();
    }, 200);
  };

  return (
    <div className="add-stop-modal-overlay" onClick={onClose}>
      <div className="add-stop-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-stop-modal-header">
          <div className="add-stop-icon-title">
            <div className="add-stop-header-badge">
              <MapPin size={20} color="#16a34a" />
            </div>
            <div>
              <h3>Add New Trotro Stop</h3>
              <p className="add-stop-subtitle">Pin a verified bus stop to your transit map</p>
            </div>
          </div>
          <button className="add-stop-close-btn" onClick={onClose} title="Cancel">
            <X size={18} />
          </button>
        </div>

        {/* GPS Coordinates Bar */}
        <div className="coords-info-bar">
          <div className="coord-item">
            <span className="coord-label">LATITUDE</span>
            <span className="coord-value">{lat.toFixed(5)}° N</span>
          </div>
          <div className="coord-divider"></div>
          <div className="coord-item">
            <span className="coord-label">LONGITUDE</span>
            <span className="coord-value">{lon.toFixed(5)}° W</span>
          </div>
          <div className="coord-pill">
            <Navigation size={12} />
            <span>GPS Locked</span>
          </div>
        </div>

        {/* Place Detection Status */}
        <div className="detected-place-banner">
          {isDetecting ? (
            <div className="detecting-state">
              <Loader2 size={15} className="spin-loader" />
              <span>Detecting nearby landmark & road name...</span>
            </div>
          ) : detectedName ? (
            <div className="detected-state">
              <Sparkles size={15} color="#16a34a" />
              <span>
                Detected: <strong>{detectedName}</strong>
              </span>
            </div>
          ) : (
            <div className="undetected-state">
              <MapPin size={15} color="#64748b" />
              <span>Location pinned (No landmark detected)</span>
            </div>
          )}
        </div>

        {/* Input Field */}
        <div className="add-stop-form-group">
          <label className="input-field-label">
            STOP NAME <span>(Optional)</span>
          </label>
          <div className="input-with-icon">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Kwashieman Junction, Total Station..."
              className="stop-name-input"
              autoFocus
            />
            {customName && (
              <button
                type="button"
                className="clear-input-btn"
                onClick={() => setCustomName('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="input-helper-note">
            {customName.trim() ? (
              <span className="helper-success">✓ Will be added as: <strong>{customName.trim()}</strong></span>
            ) : detectedName.trim() ? (
              <span className="helper-auto">⚡ Left blank: will automatically use detected name <strong>"{detectedName}"</strong></span>
            ) : (
              <span className="helper-fallback">⚡ Left blank: will be saved as <strong>"Trotro Stop"</strong></span>
            )}
          </div>
        </div>

        {/* Station Option Checkbox */}
        <div className="station-toggle-row">
          <label className="station-checkbox-label">
            <input
              type="checkbox"
              checked={isStation}
              onChange={(e) => setIsStation(e.target.checked)}
            />
            <div className="custom-check-box">
              {isStation && <Check size={14} color="#fff" />}
            </div>
            <div className="checkbox-text-group">
              <span className="checkbox-title">Major Station / Lorry Park</span>
              <span className="checkbox-desc">Check if trotro vehicles wait and load passengers here</span>
            </div>
          </label>
        </div>

        {/* Contributor Landmark & Photo Section */}
        <div className="contributor-landmark-section" style={{ margin: '12px 0', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', background: '#f8fafc' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setShowPhotoSection(!showPhotoSection)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Camera size={15} color="#0d9488" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                Add Landmark Cue or Photo (Optional)
              </span>
            </div>
            {showPhotoSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showPhotoSection && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                Help commuters know where to stand and when to alert the mate.
              </p>
              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>
                  LANDMARK HINT / WHAT TO LOOK OUT FOR
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite the Shell station, next to the pharmacy"
                  value={landmarkCue}
                  onChange={(e) => setLandmarkCue(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <input 
                  ref={cameraInputRef}
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleCameraCapture}
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '7px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '6px'
                  }}
                  disabled={isCompressingPhoto}
                >
                  <Smartphone size={14} />
                  <span>{isCompressingPhoto ? 'Compressing photo...' : 'Snap Photo with Phone Camera'}</span>
                </button>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>
                  OR PASTE PHOTO URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/station-photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="add-stop-modal-actions">
          <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button type="button" className="modal-btn-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={16} className="spin-loader" />
                <span>Saving Stop...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save & Pin Stop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
