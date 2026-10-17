import React, { useState } from 'react';
import { 
  Package, 
  User, 
  Phone, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Share2, 
  Copy, 
  ShieldCheck, 
  Send,
  Boxes
} from 'lucide-react';
import './PackageDeliveryCard.css';

const STATIONS = [
  { name: 'Circle Neoplan Station', short: 'Circle', lon: -0.219, lat: 5.560 },
  { name: '37 Military Hospital Station', short: '37', lon: -0.1854, lat: 5.5865 },
  { name: 'Kaneshie Main Station', short: 'Kaneshie', lon: -0.237, lat: 5.568 },
  { name: 'Madina Station (Zongo Jn)', short: 'Madina', lon: -0.166, lat: 5.670 },
  { name: 'Accra Central (Tema Station)', short: 'Tema Station', lon: -0.201, lat: 5.545 },
  { name: 'Lapaz Station (Tetteh Quarshie)', short: 'Lapaz', lon: -0.244, lat: 5.602 },
  { name: 'Achimota Station', short: 'Achimota', lon: -0.228, lat: 5.617 },
  { name: 'Osu Oxford Street Station', short: 'Osu', lon: -0.182, lat: 5.5577 },
  { name: 'Kasoa Main Station', short: 'Kasoa', lon: -0.424, lat: 5.534 }
];

const PACKAGE_SIZES = [
  { id: 'small', label: 'Document / Small', desc: 'Envelope, keys, small pouch (up to 1kg)', basePrice: 15, Icon: FileText },
  { id: 'medium', label: 'Medium Box / Bag', desc: 'Shoebox, backpack, provisions (up to 5kg)', basePrice: 25, Icon: Package },
  { id: 'large', label: 'Heavy Sack / Bulk', desc: 'Ghana-Must-Go bag, bulk items (up to 20kg)', basePrice: 40, Icon: Boxes }
];

export default function PackageDeliveryCard({ onDispatchRoute }) {
  const [fromStation, setFromStation] = useState(STATIONS[0].name);
  const [toStation, setToStation] = useState(STATIONS[3].name);
  const [packageSize, setPackageSize] = useState('medium');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packageNotes, setPackageNotes] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'receipt'
  const [waybillData, setWaybillData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Calculate waybill cost
  const selectedSizeObj = PACKAGE_SIZES.find(s => s.id === packageSize) || PACKAGE_SIZES[1];
  const totalWaybillFare = selectedSizeObj.basePrice + 5; // Base + station master handling fee

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientPhone.trim()) {
      alert('Please enter recipient name and Ghana phone number for waybill tracking.');
      return;
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const code = `TRT-WB-${randomId}-GH`;
    const waybill = {
      code,
      from: fromStation,
      to: toStation,
      size: selectedSizeObj.label,
      sizeIcon: selectedSizeObj.icon,
      recipientName,
      recipientPhone,
      notes: packageNotes || 'Standard package handling',
      fee: `GH₵ ${totalWaybillFare.toFixed(2)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      estimatedArrival: '~ 45 - 60 min',
      driverInfo: 'Assigned by Station Master upon drop-off'
    };

    setWaybillData(waybill);
    setStep('receipt');

    // Trigger route drawing between the two stations on the map
    if (onDispatchRoute) {
      const fromObj = STATIONS.find(s => s.name === fromStation) || STATIONS[0];
      const toObj = STATIONS.find(s => s.name === toStation) || STATIONS[3];
      onDispatchRoute(
        fromObj.short,
        toObj.short,
        [fromObj.lon, fromObj.lat],
        [toObj.lon, toObj.lat]
      );
    }
  };

  const handleCopyCode = () => {
    if (!waybillData) return;
    navigator.clipboard.writeText(waybillData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!waybillData) return;
    const msg = encodeURIComponent(
      `📦 *TrotroLive Package Waybill Notice*\n` +
      `Tracking Code: *${waybillData.code}*\n` +
      `From: ${waybillData.from}\n` +
      `To (Pickup Station): *${waybillData.to}*\n` +
      `Recipient: ${waybillData.recipientName} (${waybillData.recipientPhone})\n` +
      `Est. Arrival: ${waybillData.estimatedArrival}\n` +
      `Please present this code to the station master at ${waybillData.to} for pickup.`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  return (
    <div className="package-card-container">
      {step === 'form' ? (
        <form className="package-form" onSubmit={handleSubmit}>
          {/* Header Banner */}
          <div className="package-header-banner">
            <div className="banner-left">
              <span className="banner-badge">TROTRO WAYBILL</span>
              <h3 className="banner-title">Send a Package Across Accra</h3>
            </div>
            <div className="banner-icon-badge">
              <Package size={22} color="#ffffff" strokeWidth={2.4} />
            </div>
          </div>

          {/* Stations Selector */}
          <div className="stations-selector-group">
            <div className="station-select-row">
              <div className="icon-indicator origin-dot"></div>
              <div className="station-select-col">
                <label>DROP OFF STATION (YOU)</label>
                <select value={fromStation} onChange={(e) => setFromStation(e.target.value)}>
                  {STATIONS.map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="station-divider">
              <div className="divider-line"></div>
              <ArrowRight size={16} color="#0f172a" strokeWidth={2.4} />
              <div className="divider-line"></div>
            </div>

            <div className="station-select-row">
              <div className="icon-indicator dest-dot"></div>
              <div className="station-select-col">
                <label>PICKUP STATION (RECIPIENT)</label>
                <select value={toStation} onChange={(e) => setToStation(e.target.value)}>
                  {STATIONS.map((s, idx) => (
                    <option key={idx} value={s.name} disabled={s.name === fromStation}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Package Size Options */}
          <div className="package-sizes-section">
            <label className="section-small-label">PACKAGE TYPE & SIZE</label>
            <div className="package-size-grid">
              {PACKAGE_SIZES.map((item) => {
                const isSelected = packageSize === item.id;
                const SizeIcon = item.Icon;
                return (
                  <div 
                    key={item.id} 
                    className={`size-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setPackageSize(item.id)}
                  >
                    <div className="size-icon-container">
                      <SizeIcon size={22} strokeWidth={2.4} />
                    </div>
                    <span className="size-title">{item.label}</span>
                    <span className="size-price">GH₵ {item.basePrice + 5}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipient Details */}
          <div className="recipient-fields">
            <div className="input-with-icon">
              <User size={18} color="#0f172a" strokeWidth={2.2} className="field-icon" />
              <input 
                type="text" 
                placeholder="Recipient Full Name (e.g. Ama Mensah)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="input-with-icon">
              <Phone size={18} color="#0f172a" strokeWidth={2.2} className="field-icon" />
              <input 
                type="tel" 
                placeholder="Recipient Phone (+233 24 ...)"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                required
              />
            </div>

            <div className="input-with-icon">
              <FileText size={18} color="#0f172a" strokeWidth={2.2} className="field-icon" />
              <input 
                type="text" 
                placeholder="Package notes (e.g. Fragile / Box of shoes)"
                value={packageNotes}
                onChange={(e) => setPackageNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Pricing summary & Dispatch Button */}
          <div className="package-submit-row">
            <div className="fare-estimate-box">
              <span className="fare-label">Total Waybill Fee:</span>
              <span className="fare-value">GH₵ {totalWaybillFare.toFixed(2)}</span>
            </div>
            <button type="submit" className="dispatch-btn">
              <Send size={15} />
              <span>Create Waybill</span>
            </button>
          </div>
        </form>
      ) : (
        /* Generated Digital Waybill Receipt */
        <div className="waybill-receipt-card">
          <div className="receipt-header">
            <div className="receipt-badge-row">
              <span className="waybill-tag">OFFICIAL TROTRO WAYBILL</span>
              <span className="status-live-badge">READY FOR DISPATCH</span>
            </div>
            <h3 className="waybill-code-display">{waybillData.code}</h3>
            <span className="receipt-date">{waybillData.date} · {waybillData.time}</span>
          </div>

          <div className="receipt-station-corridor">
            <div className="corridor-point">
              <span className="point-tag drop">DROP OFF AT</span>
              <strong className="point-station">{waybillData.from}</strong>
              <small>Hand over to station master or driver</small>
            </div>
            <div className="corridor-arrow">
              <ArrowRight size={18} color="var(--green)" />
            </div>
            <div className="corridor-point">
              <span className="point-tag pick">PICKUP AT</span>
              <strong className="point-station">{waybillData.to}</strong>
              <small>Recipient shows tracking code</small>
            </div>
          </div>

          <div className="receipt-details-list">
            <div className="receipt-detail-item">
              <span className="detail-label">Recipient:</span>
              <strong className="detail-val">{waybillData.recipientName} ({waybillData.recipientPhone})</strong>
            </div>
            <div className="receipt-detail-item">
              <span className="detail-label">Package Size:</span>
              <span className="detail-val">{waybillData.sizeIcon} {waybillData.size}</span>
            </div>
            <div className="receipt-detail-item">
              <span className="detail-label">Waybill Fee:</span>
              <strong className="detail-val fare-green">{waybillData.fee}</strong>
            </div>
            <div className="receipt-detail-item">
              <span className="detail-label">Security Code:</span>
              <span className="detail-val code-pill">{waybillData.code.split('-')[2]}</span>
            </div>
          </div>

          <div className="station-guarantee-note">
            <ShieldCheck size={16} color="#059669" />
            <span>Station Master & GPRTU handling guarantee included. SMS tracking alert sent to recipient upon departure.</span>
          </div>

          {/* Action Buttons */}
          <div className="receipt-actions">
            <button className="receipt-btn copy-btn" onClick={handleCopyCode}>
              {copied ? <CheckCircle2 size={16} color="#16a34a" /> : <Copy size={16} />}
              <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
            </button>
            <button className="receipt-btn share-whatsapp-btn" onClick={handleShareWhatsApp}>
              <Share2 size={16} />
              <span>Share Waybill (WhatsApp)</span>
            </button>
          </div>

          <button className="new-package-link" onClick={() => setStep('form')}>
            ← Send Another Package
          </button>
        </div>
      )}
    </div>
  );
}
