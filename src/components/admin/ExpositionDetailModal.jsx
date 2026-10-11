import React, { useEffect } from 'react';
import { getExpoStatus, formatExpoDateRange } from './ExpositionList';

export default function ExpositionDetailModal({
  isOpen,
  onClose,
  exposition = null,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !exposition) return null;

  const statusLabel = getExpoStatus(exposition);

  const isPublic = exposition.is_public !== false;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 16, 9, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          borderRadius: '6px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '20px 28px',
            background: '#271811',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #593A27',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                {exposition.title}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontWeight: 600,
                  background: isPublic ? '#1F7A4D' : '#888888',
                  color: '#ffffff',
                }}
              >
                {isPublic ? 'Publiée au tableau de bord' : 'Non publiée (En réserve)'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              {formatExpoDateRange(exposition.date_range, exposition.date_debut, exposition.date_cloture)} · Statut : {statusLabel}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px 8px',
              borderRadius: '4px',
              opacity: 0.8,
              transition: 'opacity 0.2s',
            }}
            title="Fermer la fenêtre"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          >
            ✕
          </button>
        </div>

        {/* ── CONTENU ───────────────────────────────────────────────────── */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 140px)' }}>

          {/* BANNIÈRE */}
          {exposition.image_url && (
            <div
              style={{
                marginBottom: '24px',
                borderRadius: '4px',
                overflow: 'hidden',
                maxHeight: '260px',
                background: '#eee',
              }}
            >
              <img
                src={exposition.image_url}
                alt={exposition.title}
                style={{ width: '100%', height: '260px', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* DÉTAILS RAPIDES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              background: '#f8f7f5',
              padding: '16px 20px',
              borderRadius: '4px',
              marginBottom: '24px',
              border: '1px solid #e5e0da',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#777', fontWeight: 600, textTransform: 'uppercase' }}>Période</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1009', marginTop: '2px' }}>
                {formatExpoDateRange(exposition.date_range, exposition.date_debut, exposition.date_cloture)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#777', fontWeight: 600, textTransform: 'uppercase' }}>Date de création / soumission</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1009', marginTop: '2px' }}>
                {exposition.submission_date || (exposition.created_at ? new Date(exposition.created_at).toLocaleDateString('fr-FR') : 'Non renseignée')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#777', fontWeight: 600, textTransform: 'uppercase' }}>Visite virtuelle 3D</div>
              <div style={{ marginTop: '4px' }}>
                {exposition.visite_virtuelle_id || exposition.visite_url ? (
                  <a
                    href={exposition.visite_url || exposition.visite_virtuelle_id}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '13px', color: '#593A27', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Ouvrir la visite virtuelle ↗
                  </a>
                ) : (
                  <span style={{ fontSize: '13px', color: '#888' }}>Aucune URL</span>
                )}
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#271811', margin: '0 0 8px 0' }}>
              Description
            </h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#444' }}>
              {exposition.description || 'Aucune description courte.'}
            </p>
          </div>

          {/* RÉSUMÉ */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#271811', margin: '0 0 8px 0' }}>
              Résumé de l'exposition
            </h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {(exposition.photo_exposition_url || exposition.photo_exposition) && (
                <div style={{ flexShrink: 0, width: '130px', height: '130px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2ded9', background: '#f0ede8' }}>
                  <img
                    src={exposition.photo_exposition_url || exposition.photo_exposition}
                    alt="Photo Exposition"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div
                style={{
                  flex: '1 1 300px',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: '#333',
                  background: '#faf9f7',
                  padding: '16px',
                  borderRadius: '4px',
                  borderLeft: '4px solid #593A27',
                  whiteSpace: 'pre-line',
                }}
              >
                {exposition.summary || 'Aucun résumé détaillé.'}
              </div>
            </div>
          </div>

          {/* ARTISTES PARTICIPANTS */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#271811', margin: '0 0 14px 0' }}>
              Artistes participants ({exposition.artistes?.length || 0})
            </h3>
            {exposition.artistes && exposition.artistes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {exposition.artistes.map((art, idx) => (
                  <div
                    key={art.id || idx}
                    style={{
                      border: '1px solid #e2ded9',
                      borderRadius: '4px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      background: '#ffffff',
                    }}
                  >
                    <img
                      src={art.photo_url || art.photo || '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png'}
                      alt={art.nom || art.name}
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1009' }}>
                        {art.name || `${art.nom || ''} ${art.prenoms || ''}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#593A27', fontWeight: 600 }}>
                        {art.specialite || art.specialty || art.profession || 'Artiste'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>
                        {art.nationalite || art.nationality || 'Béninois(e)'}
                        {art.activite ? ` · Actif depuis ${art.activite}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', fontSize: '13px' }}>Aucun artiste renseigné pour cette exposition.</div>
            )}
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 28px',
            background: '#ffffff',
            borderTop: '1px solid #e0ded9',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              border: 'none',
              background: '#271811',
              color: '#ffffff',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
