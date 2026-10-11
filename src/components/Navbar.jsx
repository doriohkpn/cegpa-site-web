import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const uacLogo = '/src/assets/images/logouac.png';
const cegpaLogo = '/src/assets/images/logoCeGPA.png';

export default function Navbar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fermer le menu mobile lors d'un changement d'URL
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Bloquer rigoureusement le défilement de l'arrière-plan quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileOpen) {
      document.body.classList.add('menu-open');
      document.documentElement.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileOpen]);

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/exposition', label: 'Expositions' },
    { to: '/a-propos', label: 'A propos' },
  ];

  const checkIsActive = (to) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/exposition') {
      return location.pathname.startsWith('/exposition') || location.pathname.startsWith('/biographie');
    }
    return location.pathname.startsWith(to);
  };


  return (
    <>
      <nav className="site-navbar">
        <div className="container nav-container">
          {/* Dual Logos: UAC logo links to uac.bj, CeGPA logo links to home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://www.uac.bj/"
              target="_blank"
              rel="noopener noreferrer"
              title="Université d'Abomey-Calavi"
            >
              <img
                src={uacLogo}
                alt="Logo Université d'Abomey-Calavi (UAC)"
                style={{
                  height: 'clamp(38px, 5.5vw, 52px)',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </a>
            <Link to="/" title="Accueil CeGPA" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src={cegpaLogo}
                alt="Logo CeGPA-UAC"
                style={{
                  height: 'clamp(38px, 5.5vw, 52px)',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  cursor: 'pointer'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <ul className="nav-links nav-links-desktop">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.to);
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Tablet & Mobile Right Controls: Navigation Toggle Button */}
          <div className="nav-controls-right">
            <button
              type="button"
              className="nav-hamburger"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileOpen}
              style={{
                background: 'transparent',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isMobileOpen ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="nav-mobile-overlay open"
          onClick={() => setIsMobileOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileOpen && (
        <div className="nav-mobile-drawer open">
          <ul className="nav-mobile-links">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.to);
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`nav-mobile-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
