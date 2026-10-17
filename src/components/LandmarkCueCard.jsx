import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  MapPin, 
  Volume2, 
  Camera, 
  Maximize2, 
  X, 
  Bell, 
  CheckCircle, 
  Compass, 
  Upload,
  Sparkles,
  Smartphone,
  Navigation,
  Loader2
} from 'lucide-react';
import { 
  getStopLandmarkCue, 
  saveContributorCue, 
  fetchWikimediaPhoto,
  findNearestTrotroStop,
  compressImageFile
} from '../utils/landmark-cues.js';
import './LandmarkCueCard.css';

export default function LandmarkCueCard({ 
  stopName, 
  role = 'alight', // 'board' | 'alight' | 'transfer'
  destinationName = '',
  coords = null, // [lon, lat] or { lon, lat }
  simulatedDistance = 680,
  onPhotoUploaded
}) {
  const [cue, setCue] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [customTextCue, setCustomTextCue] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inProximity, setInProximity] = useState(true);

  // Direct camera capture & auto-GPS state
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [detectedGpsStop, setDetectedGpsStop] = useState(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const cameraInputRef = useRef(null);

  // Load cue for this stop name
  useEffect(() => {
    if (!stopName) return;
    const resolved = getStopLandmarkCue(stopName, role, coords);
    setCue(resolved);

    // If cue has no photo, automatically query authentic Wikimedia Commons
    if (!resolved.photoUrl) {
      let lat = null, lon = null;
      if (coords) {
        if (Array.isArray(coords) && coords.length >= 2) {
          lon = coords[0]; lat = coords[1];
        } else if (coords.lat && coords.lon) {
          lat = coords.lat; lon = coords.lon;
        }
      }

      fetchWikimediaPhoto(stopName, lat, lon).then((wikiPhoto) => {
        if (wikiPhoto) {
          setCue(prev => prev ? { ...prev, photoUrl: wikiPhoto, source: 'Wikimedia Commons (Ghana Ground-Truth)' } : prev);
        }
      });
    }
  }, [stopName, role, coords]);

  if (!cue || !stopName) return null;

  const isAlight = role === 'alight' || role === 'transfer';
  const isBoard = role === 'board';

  // Speak alert cue using SpeechSynthesis
  const handleSpeakCue = () => {
    if (!cue.mateCall) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const clean = cue.mateCall.replace(/"/g, '');
        const utter = new SpeechSynthesisUtterance(clean);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      } else {
        handleCopyCue();
      }
    } catch (_e) {
      handleCopyCue();
    }
  };

  const handleCopyCue = () => {
    if (!cue.mateCall) return;
    navigator.clipboard?.writeText(cue.mateCall.replace(/"/g, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Open direct mobile camera snap
  const handleTriggerCamera = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGps(false);
          const matched = findNearestTrotroStop(pos.coords.latitude, pos.coords.longitude);
          if (matched) {
            setDetectedGpsStop(matched);
          }
        },
        (_err) => {
          setIsDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsDetectingGps(false);
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Process mobile camera file capture & compress
  const handleCameraFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setIsCapturing(true);
      const compressedDataUrl = await compressImageFile(file, 800, 0.75);
      setCapturedPreview(compressedDataUrl);
      setUploadUrl(compressedDataUrl);
    } catch (err) {
      console.warn('Image capture failed', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSavePhotoSubmission = (e) => {
    e.preventDefault();
    if (!uploadUrl.trim() && !customTextCue.trim() && !capturedPreview) return;

    const targetStopToSave = detectedGpsStop ? detectedGpsStop.name : stopName;

    const payload = {};
    if (uploadUrl.trim()) payload.photoUrl = uploadUrl.trim();
    if (customTextCue.trim()) {
      if (isAlight) payload.lookOutFor = customTextCue.trim();
      if (isBoard) payload.boardingCue = customTextCue.trim();
    }

    saveContributorCue(targetStopToSave, payload);
    const updated = getStopLandmarkCue(stopName, role, coords);
    setCue(updated);
    setIsUploadModalOpen(false);
    setUploadUrl('');
    setCustomTextCue('');
    setCapturedPreview(null);
    setDetectedGpsStop(null);
    if (onPhotoUploaded) onPhotoUploaded();
  };

  return (
    <div className={`landmark-cue-card ${isAlight ? 'alight-theme' : 'board-theme'}`}>
      {/* Header Bar */}
      <div className="landmark-header-bar">
        <div className="landmark-badge-group">
          {isAlight ? (
            <span className="landmark-tag alight-tag">
              <Eye size={12} />
              Look Out For Drop
            </span>
          ) : (
            <span className="landmark-tag board-tag">
              <Compass size={12} />
              Boarding Spot
            </span>
          )}

          {isAlight && inProximity && (
            <span 
              className="landmark-proximity-pill"
              title="Approaching drop-off zone (500m - 1km alert)"
            >
              <Bell size={11} />
              ~{simulatedDistance}m away
            </span>
          )}
        </div>

        <button 
          type="button" 
          className="contribute-photo-btn"
          onClick={() => setIsUploadModalOpen(true)}
          title="Add or update street photo for this stop"
        >
          <Camera size={12} />
          <span>{cue.photoUrl ? 'Update Photo' : 'Snap / Add Photo'}</span>
        </button>
      </div>

      <div className="landmark-card-content">
        {/* Signal the Mate (Alight Cue) */}
        {isAlight && cue.mateCall && (
          <div className="mate-call-banner">
            <div className="mate-call-text-box">
              <span className="mate-call-label">📢 Tell the Mate Now</span>
              <span className="mate-call-quote">{cue.mateCall}</span>
            </div>
            <button 
              type="button" 
              className="mate-call-btn"
              onClick={handleSpeakCue}
              title="Play alert sound or speak cue"
            >
              <Volume2 size={13} />
              <span>{isSpeaking ? 'Speaking...' : isCopied ? 'Copied!' : 'Shout Cue'}</span>
            </button>
          </div>
        )}

        {/* Visual Cue Text */}
        <div className="visual-cue-description">
          <Eye size={15} className="visual-cue-icon" />
          <div>
            <strong>{isAlight ? 'Visual Landmark: ' : 'Where to Stand: '}</strong>
            {isAlight ? cue.lookOutFor : cue.boardingCue}
          </div>
        </div>

        {/* Lightweight Photo Preview (Only loaded for Boarding & Alight) */}
        {cue.photoUrl ? (
          <div 
            className="landmark-photo-wrapper" 
            onClick={() => setIsLightboxOpen(true)}
            title="Click to view full photo"
          >
            <img 
              src={cue.photoUrl} 
              alt={`${stopName} landmark preview`}
              className="landmark-photo-img"
              loading="lazy"
            />
            <div className="photo-overlay-badge">
              <MapPin size={11} />
              <span>{cue.source || 'Wikimedia Commons'}</span>
            </div>
            <div className="photo-expand-hint">
              <Maximize2 size={12} />
            </div>
          </div>
        ) : (
          <div className="landmark-no-photo-box">
            <div className="no-photo-info">
              <Sparkles size={14} color="#f59e0b" />
              <span>Text cues active • No photo yet for this local stop</span>
            </div>
            <button 
              type="button"
              className="contribute-photo-btn"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Camera size={12} />
              <span>Snap Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && cue.photoUrl && (
        <div className="landmark-lightbox-backdrop" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button 
              className="lightbox-close-btn" 
              onClick={() => setIsLightboxOpen(false)}
            >
              <X size={18} />
            </button>
            <img 
              src={cue.photoUrl} 
              alt={`${stopName} Full View`} 
              className="lightbox-full-img"
            />
            <div className="lightbox-caption">
              <strong>{stopName}</strong> — {isAlight ? cue.lookOutFor : cue.boardingCue}
            </div>
          </div>
        </div>
      )}

      {/* Community Contributor Upload & Direct Phone Snap Modal */}
      {isUploadModalOpen && (
        <div className="landmark-lightbox-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div className="photo-upload-dialog" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="photo-upload-title">
                📸 Add Landmark Photo
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Help other commuters spot where to board or alight. Use your camera or paste a link.
            </p>

            {/* Direct Mobile Camera Button */}
            <div style={{ marginBottom: '12px' }}>
              <input 
                ref={cameraInputRef}
                type="file" 
                accept="image/*" 
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleCameraFileChange}
              />

              <button 
                type="button"
                className="camera-snap-action-btn"
                onClick={handleTriggerCamera}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <>
                    <Loader2 size={16} className="spin-loader" />
                    <span>Compressing photo...</span>
                  </>
                ) : (
                  <>
                    <Smartphone size={16} />
                    <span>Snap Photo with Phone Camera</span>
                  </>
                )}
              </button>
            </div>

            {/* GPS Detection Indicator */}
            {isDetectingGps && (
              <div className="gps-detecting-pill">
                <Navigation size={12} className="spin-nav" />
                <span>Locking GPS to detect your current stop...</span>
              </div>
            )}

            {detectedGpsStop && (
              <div className="gps-matched-pill">
                <CheckCircle size={14} color="#16a34a" />
                <div>
                  <strong>Location Verified:</strong> You are standing at <strong>{detectedGpsStop.name}</strong> ({detectedGpsStop.distanceM}m away). Photo will save to this stop!
                </div>
              </div>
            )}

            {/* Captured Image Preview */}
            {capturedPreview && (
              <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <img 
                  src={capturedPreview} 
                  alt="Captured preview" 
                  style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }} 
                />
              </div>
            )}

            <form onSubmit={handleSavePhotoSubmission}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                OR PASTE IMAGE URL
              </label>
              <input 
                type="url" 
                className="photo-upload-input"
                placeholder="https://example.com/street-view.jpg"
                value={uploadUrl}
                onChange={e => setUploadUrl(e.target.value)}
              />

              <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                LANDMARK HINT (OPTIONAL)
              </label>
              <input 
                type="text" 
                className="photo-upload-input"
                placeholder="e.g. Opposite Shell station, near the market gate"
                value={customTextCue}
                onChange={e => setCustomTextCue(e.target.value)}
              />

              <div className="photo-upload-actions">
                <button 
                  type="button" 
                  className="contribute-photo-btn"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="contribute-photo-btn"
                  style={{ background: '#0f172a', color: '#fff', borderColor: '#0f172a' }}
                >
                  <Upload size={12} />
                  <span>Save Landmark</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
