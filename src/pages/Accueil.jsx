import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VirtualTourModal from '../components/VirtualTourModal';
import { expositionsAPI } from '../services/api';
import { formatExpoDateRange } from '../components/admin/ExpositionList';

const heroBg = '/src/assets/images/Fond_hero.jpg';
const fallbackImg = '/src/assets/images/68d0ddd61744a1439c26310fe80c4c4f76b088b7.png';

export default function Accueil() {
  const navigate = useNavigate();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [recentExpos, setRecentExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = async () => {
    try {
      const data = await expositionsAPI.getPublic();
      const expos = data || [];
      setRecentExpos(expos.slice(0, 2));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();

    const handleUpdate = () => {
      fetchRecent();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('cegpa_expo_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('cegpa_expo_updated', handleUpdate);
    };
  }, []);

  return (
    <div>
      <style>
        {`
          @keyframes heroFadeSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-hero-content > * {
            animation: heroFadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
          .animate-hero-content > *:nth-child(1) { animation-delay: 0.1s; }
          .animate-hero-content > *:nth-child(2) { animation-delay: 0.3s; }
          .animate-hero-content > *:nth-child(3) { animation-delay: 0.5s; }

          .hero-btn-block {
            animation: heroFadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: 0.7s;
            opacity: 0;
          }

          /* Hero Section Plein Écran (Desktop & Mobile) */
          .accueil-hero-section {
            position: relative;
            min-height: calc(100vh - 80px);
            min-height: calc(100dvh - 80px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: #ffffff;
            padding: 50px 0;
            box-sizing: border-box;
          }

          .accueil-hero-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            width: 100%;
            margin: auto 0;
            position: relative;
            z-index: 2;
            box-sizing: border-box;
          }

          .hero-btn-block {
            margin-top: 34px;
          }

          @media (max-width: 768px) {
            .accueil-hero-section {
              min-height: calc(100vh - 68px) !important;
              min-height: calc(100dvh - 68px) !important;
              padding: 32px 0 !important;
            }
            .hero-btn-block {
              margin-top: 22px;
            }
          }

          /* Alignement horizontal et taille ajustée des cartes récentes (hauteur réduite de 30%) */
          .accueil-recent-expos-container {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: stretch;
            gap: 32px;
            padding: 0 16px;
            box-sizing: border-box;
          }
          .accueil-expo-card {
            flex: 0 1 460px;
            max-width: 460px;
            height: 320px; /* Taille d'origine rétablie pour ordinateur */
            width: 100%;
          }
          @media (max-width: 768px) {
            .accueil-recent-expos-container {
              flex-direction: column;
              align-items: center;
              gap: 16px;
              padding: 0;
            }
            .accueil-expo-card {
              max-width: 100%;
              height: 182px; /* Réduction de 30% par rapport à 260px */
            }
            .accueil-expo-card .expo-card-title {
              font-size: 16px !important;
            }
            .accueil-expo-card .expo-card-date {
              font-size: 12px !important;
              margin-bottom: 2px !important;
            }
            .accueil-expo-card .expo-card-desc {
              font-size: 11px !important;
              -webkit-line-clamp: 2 !important;
            }
          }

          @media (max-width: 480px) {
            .accueil-expo-card {
              height: 160px; /* Réduction de 30% par rapport à 230px */
            }
            .accueil-expo-card .expo-card-overlay {
              padding: 14px 14px 12px !important;
            }
          }

          /* Section "Pourquoi visiter le CeGPA ?" */
          .pourquoi-cegpa-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            width: 100%;
          }

          .pourquoi-cegpa-card {
            background: #555555;
            padding: 44px 28px;
            border-radius: 2px;
            color: #ffffff;
            text-align: center;
            min-height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
            cursor: default;
          }

          /* Tablette : 2 colonnes avec la 3ème carte ("Rencontrer les artistes") centrée sur la 2ème ligne */
          @media (min-width: 601px) and (max-width: 1024px) {
            .pourquoi-cegpa-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
            }
            .pourquoi-card-third {
              grid-column: 1 / -1;
              justify-self: center;
              margin: 0 auto;
              width: 100%;
              max-width: calc((100% - 24px) / 2);
            }
          }

          /* Mobile : 1 colonne pleine largeur */
          @media (max-width: 600px) {
            .pourquoi-cegpa-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            .pourquoi-cegpa-card {
              padding: 32px 20px;
              min-height: auto;
            }
            .pourquoi-card-third {
              grid-column: auto;
              max-width: 100%;
              margin: 0;
            }
          }

          .pourquoi-cegpa-section {
            background: #EAEAEA;
            padding: 56px 0 36px;
          }
          @media (max-width: 768px) {
            .pourquoi-cegpa-section {
              padding: 36px 0 20px !important;
            }
          }
        `}
      </style>

      {/* ===== HERO SECTION ===== */}
      <section
        className="accueil-hero-section"
        style={{
          background: `url(${heroBg}) center/cover no-repeat`,
        }}
      >
        {/* Dark Overlay with Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(20, 12, 6, 0.88) 0%, rgba(20, 12, 6, 0.65) 50%, rgba(20, 12, 6, 0.32) 100%)',
            zIndex: 1,
          }}
        />

        <div className="container accueil-hero-container">
          {/* Éléments textuels sur le haut */}
          <div className="animate-hero-content" style={{ maxWidth: '1050px', textAlign: 'left', marginLeft: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(34px, 5.5vw, 68px)',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '16px',
                lineHeight: 1.15,
              }}
            >
              CeGPA-UAC
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: 1.3,
                maxWidth: '1000px',
              }}
            >
              Centre de Gestion du Patrimoine Muséal et des Arts
            </p>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(16px, 1.5vw, 18px)',
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: '0',
                lineHeight: 1.65,
                maxWidth: '920px',
              }}
            >
              Explorez les trésors historiques et artistiques de notre patrimoine, et partagez un dialogue permanent entre passé et modernité au cœur du pôle muséal de l'Université d'Abomey-Calavi.
            </p>
          </div>

          {/* Bouton rapproché des éléments textuels */}
          <div className="hero-btn-block">
            <button
              onClick={() => navigate('/exposition')}
              className="btn-hero-visit"
              style={{ fontSize: '16px', padding: '14px 34px' }}
            >
              Voir nos expositions
            </button>
          </div>
        </div>
      </section>

      {/* ===== NOS EXPOSITIONS RÉCENTES ===== */}
      <section style={{ padding: '70px 0 90px', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '32px',
                fontWeight: 700,
                color: '#3D2516',
                marginBottom: '16px',
              }}
            >
              Nos expositions récentes
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: '#666666',
                maxWidth: '650px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Découvrez nos expositions et explorez des œuvres qui mettent en valeur notre culture, notre histoire et notre patrimoine
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#777', padding: '40px' }}>Chargement...</div>
          ) : recentExpos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#777', padding: '40px' }}>Aucune exposition récente.</div>
          ) : (
            <div className="accueil-recent-expos-container">
              {recentExpos.slice(0, 2).map((expo) => (
                <div
                  key={expo.id}
                  onClick={() => {
                    try {
                      localStorage.setItem('cegpa_current_expo', JSON.stringify(expo));
                    } catch (e) {}
                    navigate('/exposition/resume', { state: { expo } });
                  }}
                  className="expo-card-framed accueil-expo-card"
                  style={{
                    background: '#ffffff',
                    padding: 0,
                    border: 'none',
                    borderRadius: '0px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06)',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '0px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={expo.image_url || '/src/assets/images/68d0ddd61744a1439c26310fe80c4c4f76b088b7.png'}
                      alt={expo.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.8s ease',
                      }}
                      className="expo-framed-img"
                      onError={(e) => { 
                        e.target.style.background = '#3D2516'; 
                        e.target.src = '/src/assets/images/68d0ddd61744a1439c26310fe80c4c4f76b088b7.png'; 
                      }}
                    />

                    {/* Overlay avec titre permanent et date début/clôture + description au survol */}
                    <div className="expo-card-overlay">
                      <h3 className="expo-card-title">{expo.title}</h3>
                      <div className="expo-card-details">
                        <p className="expo-card-date">
                          {formatExpoDateRange(expo.date_range, expo.date_debut, expo.date_cloture)}
                        </p>
                        <p className="expo-card-desc">
                          {expo.description || expo.summary || 'Voici une courte résume de cette exposition.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== POURQUOI VISITER LE CeGPA ? ===== */}
      <section className="pourquoi-cegpa-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '32px',
                fontWeight: 700,
                color: '#3D2516',
                marginBottom: '16px',
              }}
            >
              Pourquoi visiter le CeGPA ?
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: '#555555',
                maxWidth: '720px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Rien ne remplace l'émotion brute et le contact visuel direct avec une œuvre authentique. Pour ressentir pleinement l'histoire et l'énergie créative qui animent le CeGPA, l'expérience se vit sur place
            </p>
          </div>

          <div className="pourquoi-cegpa-grid">
            {[
              {
                title: 'Accéder à des expositions inédites',
                desc: "Profitez d'expositions temporaires et d'événements exclusifs réservés aux visiteurs.",
              },
              {
                title: 'Participer à des ateliers pratiques',
                desc: 'Mettez la main à la pâte lors de master-classes, dessins et ateliers interactifs.',
              },
              {
                title: 'Échanger avec des passionnés',
                desc: 'Profitez de visites guidées et partagez directement avec nos médiateurs culturels.',
              },
            ].map(({ title, desc }, i) => (
              <div
                key={i}
                className={`pourquoi-cegpa-card ${i === 2 ? 'pourquoi-card-third' : ''}`}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#ffffff',
                    marginBottom: '14px',
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Tour Reader */}
      <VirtualTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}
