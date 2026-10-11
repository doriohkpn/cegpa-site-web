import React from 'react';
import { Link } from 'react-router-dom';
import { contactInfo } from '../data';

const uacLogo = '/src/assets/images/logouac.png';
const cegpaLogo = '/src/assets/images/logoCeGPA (2).png';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Liens utiles (à gauche) */}
          <div className="footer-col-links">
            <div className="footer-title-wrap">
              <span className="footer-bar" />
              <h3>Liens utiles</h3>
            </div>

            <ul className="footer-links">
              <li>
                <Link to="/">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span>Accueil</span>
                </Link>
              </li>
              <li>
                <Link to="/exposition">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span>Exposition</span>
                </Link>
              </li>
              <li>
                <Link to="/a-propos">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span>A propos</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Contacts (au centre) */}
          <div className="footer-col-contacts">
            <div className="footer-title-wrap">
              <span className="footer-bar" />
              <h3>Contacts</h3>
            </div>

            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="footer-text-desktop">{contactInfo.address}</span>
                <span className="footer-text-mobile">Université d'Abomey-Calavi, Bénin</span>
              </div>
              <div className="footer-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{contactInfo.phone}</span>
              </div>
              <div className="footer-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>{contactInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Dual Logos (UAC Logo first, then CeGPA Logo) & UAC Green Outline Button (à droite) */}
          <div className="footer-brand-col footer-col-brand">
            <div className="footer-brand-inner">
              <div className="footer-logos">
                <a href="https://www.uac.bj/" target="_blank" rel="noopener noreferrer" title="Université d'Abomey-Calavi">
                  <img
                    src={uacLogo}
                    alt="Logo Université d'Abomey-Calavi (UAC)"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </a>
                <Link to="/" title="Accueil CeGPA">
                  <img
                    src={cegpaLogo}
                    alt="Logo CeGPA-UAC"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </Link>
              </div>

              <a href="https://www.uac.bj/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <div className="uac-badge">
                  UAC
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
