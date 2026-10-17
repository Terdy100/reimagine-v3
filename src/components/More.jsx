import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { 
  Banknote, 
  HelpCircle, 
  Bookmark, 
  MessageSquarePlus, 
  Settings, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import './More.css';

export default function More() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const navigate = useNavigate();

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <main className="subpage-main more-page">
      <div className="more-page-container">
        {/* Top Header inside Menu */}
        <Header onBellClick={toggleNotifications} />

        {/* User Profile Card */}
        <div className="user-profile-card">
          <div className="profile-left">
            <div className="profile-avatar-large">K</div>
            <div className="profile-info">
              <div className="profile-name-row">
                <h3>Kwadwo Marley</h3>
                <span className="verified-badge"><ShieldCheck size={13} /> Verified</span>
              </div>
              <p className="profile-role">Accra Commuter · Free Rider</p>
              <div className="profile-meta">
                <span className="meta-pill">Frequent: Circle ⇄ Osu</span>
              </div>
            </div>
          </div>
          <button className="profile-edit-btn" title="Edit Profile">
            <UserCheck size={16} />
          </button>
        </div>

        {/* Notification Panel (Toggleable / Highlights) */}
        {showNotifications && (
          <div className="menu-notifications-panel">
            <div className="notif-header">
              <span className="notif-title">Recent Alerts</span>
              <span className="notif-count">2 new</span>
            </div>
            <div className="notif-item">
              <span className="notif-dot red"></span>
              <div className="notif-content">
                <strong>Traffic Alert: Kaneshie First Light</strong>
                <p>Heavy trotro queue heading towards Mallam Junction. Expect +15 min delay.</p>
              </div>
            </div>
            <div className="notif-item">
              <span className="notif-dot green"></span>
              <div className="notif-content">
                <strong>Fare Schedule Updated</strong>
                <p>New 2026 GPRTU approved distance tariffs are now reflected in your fare estimator.</p>
              </div>
            </div>
          </div>
        )}

        {/* Commute & Transit Services Section */}
        <div className="menu-section">
          <h4 className="section-label">Transit & Commute</h4>
          <div className="menu-list">
            <div className="menu-item">
              <div className="menu-icon-box green">
                <Banknote size={18} color="var(--green)" />
              </div>
              <div className="menu-item-text">
                <h5>Trotro Fare Guide</h5>
                <p>View approved GPRTU / GRTCC national fare rates</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            <div className="menu-item">
              <div className="menu-icon-box blue">
                <Bookmark size={18} color="#2563eb" />
              </div>
              <div className="menu-item-text">
                <h5>Saved Stops & Routes</h5>
                <p>Quick access to your home, workplace, and favourite stops</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>
        </div>

        {/* Community & Contributions */}
        <div className="menu-section">
          <h4 className="section-label">Community & Feedback</h4>
          <div className="menu-list">
            <div 
              className="menu-item" 
              onClick={() => {
                setFeedbackSuccess(true);
                setTimeout(() => setFeedbackSuccess(false), 3000);
              }}
            >
              <div className="menu-icon-box orange">
                <MessageSquarePlus size={18} color="#ea580c" />
              </div>
              <div className="menu-item-text">
                <h5>Report Missing Stop / Route</h5>
                <p>Help us improve Accra trotro data for all riders</p>
              </div>
              {feedbackSuccess ? (
                <span className="feedback-toast"><CheckCircle2 size={14} color="#16a34a" /> Thank you!</span>
              ) : (
                <ChevronRight size={16} color="#94a3b8" />
              )}
            </div>

            <div className="menu-item">
              <div className="menu-icon-box gray">
                <HelpCircle size={18} color="#475569" />
              </div>
              <div className="menu-item-text">
                <h5>Help & FAQs</h5>
                <p>How routing, stops, and fares are calculated</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>
        </div>

        {/* App Settings & Info */}
        <div className="menu-section">
          <h4 className="section-label">App & System</h4>
          <div className="menu-list">
            <div className="menu-item">
              <div className="menu-icon-box gray">
                <Settings size={18} color="#475569" />
              </div>
              <div className="menu-item-text">
                <h5>Settings & Preferences</h5>
                <p>Audio chimes, GPS accuracy, dark mode options</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            <div className="menu-item" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <div className="menu-icon-box teal">
                <Info size={18} color="#0d9488" />
              </div>
              <div className="menu-item-text">
                <h5>About Spark Motion</h5>
                <p>Version 2.4 · View Interactive Home Showcase</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
