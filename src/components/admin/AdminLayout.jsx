import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const cegpaLogo = '/src/assets/images/logoCeGPA (2).png';

export default function AdminLayout({ activeTab, setActiveTab, children }) {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser() || { username: 'Admin', role: 'admin' };

  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoverSite, setHoverSite]   = useState(false);
  const [hoverLogout, setHoverLogout] = useState(false);

  // Verrouiller tout défilement extérieur : seule la zone grise défile
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'exposition', label: 'Exposition' },
  ];

  return (
    <div
      className="admin-desktop-layout"
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: '#F5F5F5',
        position: 'relative',
      }}
    >
      <style>{`
        /* ── ZONE MARRON FIGÉE (Sidebar) ── */
        .admin-sidebar-desktop {
          width: 280px;
          min-width: 280px;
          height: 100vh;
          background: #271811;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 1001;
        }

        .admin-sidebar-desktop::-webkit-scrollbar {
          width: 4px;
        }
        .admin-sidebar-desktop::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        /* ── ZONE GRISE DÉFILABLE (Main) ── */
        .admin-main-wrapper {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          overflow-x: auto;
          display: flex;
          flex-direction: column;
          background: #F5F5F5;
          min-width: 0;
        }

        .admin-main-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .admin-main-wrapper::-webkit-scrollbar-track {
          background: #eaeaea;
        }
        .admin-main-wrapper::-webkit-scrollbar-thumb {
          background: #c2b8b2;
          border-radius: 4px;
        }
        .admin-main-wrapper::-webkit-scrollbar-thumb:hover {
          background: #593A27;
        }

        .admin-header-desktop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: #F5F5F5;
          border-bottom: 1px solid #e5e5e5;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .admin-content-desktop {
          padding: 24px 40px 48px;
          flex: 1;
        }
      `}</style>

      {/* ── SIDEBAR FIGÉE (Zone marron) ────────────────────────────────── */}
      <aside className="admin-sidebar-desktop">
        {/* Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={cegpaLogo}
              alt="CeGPA Logo"
              style={{ height: '44px', width: '44px', objectFit: 'contain', background: '#fff', borderRadius: '50%', padding: '2px' }}
            />
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                CeGPA Admin
              </h2>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Back-Office Muséal</span>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '32px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredNav === item.id && !isActive;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  textAlign: 'left',
                  padding: '16px 24px',
                  background: isActive ? '#593A27' : (isHovered ? 'rgba(89, 58, 39, 0.4)' : 'transparent'),
                  color: '#ffffff',
                  border: 'none',
                  width: '100%',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'background 0.2s ease',
                  borderLeft: isActive ? '4px solid #ffffff' : '4px solid transparent',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            to="/"
            onMouseEnter={() => setHoverSite(true)}
            onMouseLeave={() => setHoverSite(false)}
            style={{
              background: hoverSite ? '#593A27' : '#ffffff',
              color: hoverSite ? '#ffffff' : '#000000',
              padding: '12px 16px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <span>Voir le site public</span>
            <span style={{ fontSize: '18px' }}>→</span>
          </Link>

          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoverLogout(true)}
            onMouseLeave={() => setHoverLogout(false)}
            style={{
              background: hoverLogout ? '#593A27' : '#000000',
              color: '#ffffff',
              padding: '12px 16px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '2px',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── ZONE PRINCIPALE (Zone grise défilable) ────────────────────── */}
      <main className="admin-main-wrapper">

        {/* HEADER FIGÉ */}
        <header className="admin-header-desktop">
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: '#000' }}>
              {navItems.find((i) => i.id === activeTab)?.label || 'Tableau de bord'}
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
              Espace d'administration de la plateforme CeGPA - UAC
            </p>
          </div>
        </header>

        {/* ZONE DE CONTENU */}
        <div className="admin-content-desktop">
          {children}
        </div>
      </main>
    </div>
  );
}
