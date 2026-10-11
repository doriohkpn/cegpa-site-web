import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { artists } from '../data';

export default function Biographie() {
  const { artistId } = useParams();
  const location = useLocation();

  // Récupération de l'artiste passé via le state ou par id, avec Robert Zinsou comme fallback
  const artist =
    location.state?.artist ||
    (artistId ? artists.find((a) => a.id === artistId || String(a.id) === String(artistId)) : null) ||
    artists[1] ||
    artists[0];

  const expo = location.state?.expo;

  const artistName = `${artist?.prenoms || ''} ${artist?.nom || ''}`.trim() || artist?.name || 'Robert Zinsou';
  const artistPhoto = artist?.photo_url || artist?.photo || '/src/assets/images/4deb2aaf05e81a4bedefb28fc6fbd3ef3c0f977a.png';
  const specialite = artist?.specialite || artist?.specialty || 'Sculpture et art plastique';
  const nationalite = artist?.nationalite || artist?.nationality || 'Béninois';
  const mouvement = artist?.mouvement || artist?.movement || 'Art contemporain africain';
  const activite = artist?.activite
    ? (String(artist.activite).startsWith('Depuis') ? artist.activite : `Depuis ${artist.activite}`)
    : (artist?.yearsActive || 'Depuis 2010');
  const biographie =
    artist?.biographie ||
    artist?.bio ||
    'Robert Zinsou est un artiste plasticien et sculpteur béninois reconnu pour ses œuvres qui mêlent formes abstraites et références culturelles profondes.';

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[
          { label: 'Accueil', to: '/' },
          { label: 'Expositions', to: '/exposition' },
          { label: 'Résumé', to: '/exposition/resume', state: { expo } },
          { label: 'Biographie' },
        ]}
      />

      <div className="container" style={{ marginTop: '24px' }}>
        {/* ===== ARTIST HERO LAYOUT ===== */}
        <div className="artist-bio-hero">
          {/* Left: Portrait Photo */}
          <div className="artist-bio-img-wrapper">
            <img
              src={artistPhoto}
              alt={artistName}
              className="artist-bio-img"
              onError={(e) => { e.target.style.background = '#d4b896'; e.target.src = ''; }}
            />
          </div>

          {/* Right: Name + Specs */}
          <div className="artist-bio-info">
            <h1 className="artist-bio-title">
              {artistName}
            </h1>

            <div className="artist-bio-specs">
              <div>
                <span className="spec-label">Spécialité : </span>
                <span className="spec-val">{specialite}</span>
              </div>

              <div>
                <span className="spec-label">Nationalité : </span>
                <span className="spec-val">{nationalite}</span>
              </div>

              <div>
                <span className="spec-label">Mouvement artistique : </span>
                <span className="spec-val">{mouvement}</span>
              </div>

              <div>
                <span className="spec-label">Années d'activité : </span>
                <span className="spec-val">{activite}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BIOGRAPHIE SECTION ===== */}
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px',
              fontWeight: 700,
              color: '#3D2516',
              marginBottom: '24px',
              letterSpacing: '0.01em',
            }}
          >
            Biographie
          </h2>

          <div className="expo-resume-content">
            {biographie
              .split(/\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>
                  {para}
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
