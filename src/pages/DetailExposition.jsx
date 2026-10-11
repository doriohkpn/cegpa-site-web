import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import VirtualTourModal from '../components/VirtualTourModal';
import ArtistModal from '../components/ArtistModal';
import { artists } from '../data';
import { EXTERNAL_VIRTUAL_TOURS, expositionsAPI } from '../services/api';
import { formatExpoDateRange } from '../components/admin/ExpositionList';

const heroImg = '/src/assets/images/bd8ff6d21ba4c8068f97ef3bb27473eaf474d4be.png';
const contentImg = '/src/assets/images/75ee0d3aa3ba31381bcfc26951f868482f26eea9.png';

const DEFAULT_RESUME = `Il est cinq heures du matin, et la ville n'est encore qu'une rumeur souterraine. Dans la pénombre, une lueur bleutée danse sur le plafond, reflet d'un écran resté allumé par négligence ou par nécessité. C'est dans cette demi-lumière que commence notre histoire – non pas une histoire au sens romanesque du terme, avec des héros et des rebondissements, mais l'histoire d'un monde qui s'ignore, d'une humanité branchée à ses propres fantasmes, et d'un silence qui se raréfie comme l'eau douce sur une planète en fièvre.

L'empreinte dont il sera question ici n'est pas celle, carbonée, que les rapports du GIEC épinglent avec des courbes exponentielles. Elle est plus discrète, plus insidieuse : c'est l'empreinte laissée dans nos âmes par le flux continu d'images, de notifications, de promesses et de menaces qui défilent sous nos doigts. Chaque geste, chaque clic, chaque like est une petite marque sur le sable mouvant de notre attention. Et ce sable, aujourd'hui, ressemble de plus en plus à un désert.

Pourtant, tout a commencé dans une chambre d'enfant, il y a trente ou quarante ans – une chambre tapissée de posters, où la fenêtre donnait sur un arbre et non sur un réseau. Là, le temps s'écoulait autrement : il était épais, malléable, plein de trous et de recoins où l'imagination pouvait bâtir des cathédrales. On s'ennuyait, parfois, et cet ennui était une bénédiction. Il forçait le cerveau à inventer, à dériver, à se perdre pour mieux se retrouver. Aujourd'hui, l'ennui est devenu une anomalie, un vide à combler dans la seconde, une faille dans le système que les algorithmes se font un devoir de colmater.`;

export default function DetailExposition() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // État de l'exposition dynamique, réactif aux modifications
  const [expo, setExpo] = useState(() => {
    if (location.state?.expo) return location.state.expo;
    try {
      const stored = localStorage.getItem('cegpa_current_expo');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const checkScrollState = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    }
  };

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector('.artist-carousel-card');
      const step = card ? card.offsetWidth + 24 : 340;
      carouselRef.current.scrollBy({ left: -step, behavior: 'smooth' });
      setTimeout(checkScrollState, 350);
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector('.artist-carousel-card');
      const step = card ? card.offsetWidth + 24 : 340;
      carouselRef.current.scrollBy({ left: step, behavior: 'smooth' });
      setTimeout(checkScrollState, 350);
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const timer = setTimeout(checkScrollState, 150);
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, []);

  // Synchronisation dynamique avec la dernière version de l'exposition en base / localStorage
  useEffect(() => {
    let isMounted = true;

    const refreshExpoData = async () => {
      try {
        const all = await expositionsAPI.getAll();
        const baseExpo = location.state?.expo || expo || (() => {
          try {
            const s = localStorage.getItem('cegpa_current_expo');
            return s ? JSON.parse(s) : null;
          } catch (e) { return null; }
        })();

        if (!baseExpo) return;

        const matched = (all || []).find(e => 
          (baseExpo.id !== undefined && baseExpo.id !== null && String(e.id) === String(baseExpo.id)) ||
          (baseExpo.title && e.title && e.title.trim().toLowerCase() === baseExpo.title.trim().toLowerCase())
        );

        if (matched && isMounted) {
          setExpo(matched);
          try {
            localStorage.setItem('cegpa_current_expo', JSON.stringify(matched));
          } catch (e) {}
        } else if (!matched) {
          const cur = localStorage.getItem('cegpa_current_expo');
          if (cur && isMounted) {
            setExpo(JSON.parse(cur));
          }
        }
      } catch (err) {
        console.warn('Erreur rafraîchissement exposition:', err);
      }
    };

    refreshExpoData();

    const handleUpdate = () => {
      refreshExpoData();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('cegpa_expo_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('cegpa_expo_updated', handleUpdate);
    };
  }, [location.state?.expo]);

  const title = expo?.title || 'Mémoire des Racines';
  const description = expo?.description || 'Quand le patrimoine raconte notre identité.';
  const dateRange = formatExpoDateRange(expo?.date_range, expo?.date_debut, expo?.date_cloture) || '02 Janvier - 27 Avril 2025';
  const bannerPhoto = expo?.image_url || heroImg;
  const expoPhoto = expo?.photo_exposition_url || expo?.photo_exposition || contentImg;
  const resumeText = expo?.summary || DEFAULT_RESUME;
  const artistList = expo?.artistes && expo.artistes.length > 0 ? expo.artistes : artists;

  const handleStartTour = () => {
    const rawUrl = expo?.visite_url || expo?.visite_virtuelle_url || expo?.visite_virtuelle_id;
    let url = typeof rawUrl === 'string' && rawUrl.startsWith('http') ? rawUrl.trim() : null;

    if (!url) {
      // Lien externe culturel officiel selon l'exposition
      const expoIndex = Math.abs(parseInt(expo?.id, 10) || 0);
      url = EXTERNAL_VIRTUAL_TOURS[expoIndex % EXTERNAL_VIRTUAL_TOURS.length] || 'https://artsandculture.google.com/partner/fondation-zinsou';
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-wrapper">
      {/* Style scoped pour la page détail exposition (hero pleine hauteur sur smartphone) */}
      <style>
        {`
          .detail-expo-hero-section {
            width: 100%;
            max-width: 100%;
            margin: 0 0 36px;
            padding: 0;
            box-sizing: border-box;
          }

          .detail-expo-hero-banner {
            position: relative;
            min-height: 400px;
            height: clamp(380px, 45vw, 520px);
            border-radius: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            width: 100%;
          }

          .detail-expo-hero-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .detail-expo-hero-overlay {
            position: absolute;
            inset: 0;
            background: rgba(20, 12, 6, 0.65);
            z-index: 1;
          }

          .detail-expo-hero-container {
            position: relative;
            z-index: 2;
            padding: clamp(24px, 4vw, 40px) 20px 28px;
            height: 100%;
            width: 100%;
            max-width: 850px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            box-sizing: border-box;
          }

          .detail-expo-hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: clamp(20px, 5vw, 60px);
          }

          .detail-expo-hero-title {
            font-family: var(--font-heading);
            font-size: clamp(24px, 3.5vw, 40px);
            font-weight: 300;
            color: #ffffff;
            margin-bottom: 12px;
            letter-spacing: 0.04em;
          }

          .detail-expo-hero-desc {
            font-family: var(--font-heading);
            font-size: clamp(16px, 2.2vw, 24px);
            font-weight: 600;
            color: #ffffff;
            margin: 0;
            line-height: 1.3;
          }

          .detail-expo-hero-btn {
            margin-bottom: 12px;
            padding: 12px 26px;
            font-size: 15px;
          }

          /* SUR SMARTPHONE : SESSION HERO PLEINE COMME POUR LA PAGE D'ACCUEIL */
          @media (max-width: 768px) {
            .detail-expo-breadcrumbs {
              display: none !important;
            }

            .detail-expo-hero-section {
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .detail-expo-hero-banner {
              min-height: calc(100vh - 68px) !important;
              min-height: calc(100dvh - 68px) !important;
              height: calc(100vh - 68px) !important;
              height: calc(100dvh - 68px) !important;
              border-radius: 0 !important;
              padding: 32px 16px !important;
              box-sizing: border-box;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }

            .detail-expo-hero-overlay {
              background: linear-gradient(180deg, rgba(20, 12, 6, 0.78) 0%, rgba(20, 12, 6, 0.60) 45%, rgba(20, 12, 6, 0.85) 100%) !important;
            }

            .detail-expo-hero-container {
              height: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: auto 0 !important;
              justify-content: center !important;
              gap: 32px !important;
            }

            .detail-expo-hero-content {
              margin-top: 0 !important;
            }

            .detail-expo-hero-title {
              font-size: clamp(30px, 8vw, 42px) !important;
              font-weight: 700 !important;
              line-height: 1.2 !important;
              margin-bottom: 16px !important;
              text-shadow: 0 4px 16px rgba(0, 0, 0, 0.65) !important;
            }

            .detail-expo-hero-desc {
              font-size: clamp(16px, 4.4vw, 22px) !important;
              font-weight: 500 !important;
              line-height: 1.4 !important;
              max-width: 90% !important;
              color: rgba(255, 255, 255, 0.95) !important;
              text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55) !important;
            }

            .detail-expo-hero-btn-wrap {
              margin-top: 8px !important;
            }

            .detail-expo-hero-btn {
              padding: 14px 32px !important;
              font-size: 15.5px !important;
              margin-bottom: 0 !important;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
            }

            .detail-expo-date-wrap {
              margin-top: 24px !important;
              margin-bottom: 24px !important;
            }
          }
        `}
      </style>

      {/* Breadcrumb */}
      <div className="detail-expo-breadcrumbs">
        <Breadcrumbs
          items={[
            { label: 'Accueil', to: '/' },
            { label: 'Expositions', to: '/exposition' },
            { label: 'Résumé' },
          ]}
        />
      </div>

      {/* ===== HERO BANNER ===== */}
      <section className="detail-expo-hero-section">
        <div className="detail-expo-hero-banner">
          <img
            src={bannerPhoto}
            alt={title}
            className="detail-expo-hero-img"
            onError={(e) => { e.target.style.background = '#402816'; e.target.src = ''; }}
          />

          <div className="detail-expo-hero-overlay" />

          <div className="detail-expo-hero-container">
            {/* Top Text Block */}
            <div className="detail-expo-hero-content">
              <h1 className="detail-expo-hero-title">
                {title}
              </h1>

              <p className="detail-expo-hero-desc">
                {description}
              </p>
            </div>

            {/* Bottom Button */}
            <div className="detail-expo-hero-btn-wrap">
              <button
                onClick={handleStartTour}
                className="btn-hero-visit detail-expo-hero-btn"
              >
                Commencer la visite virtuelle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DATE SUBHEADER ===== */}
      <div className="container detail-expo-date-wrap" style={{ marginBottom: '32px' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: '#777777',
            margin: 0,
          }}
        >
          {dateRange}
        </p>
      </div>

      {/* ===== MAIN CONTENT SECTION ===== */}
      <div className="container" style={{ marginBottom: '80px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '32px',
            fontWeight: 700,
            color: '#3D2516',
            marginBottom: '32px',
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </h2>

        {/* Clearfix container: image floats left, text flows around it */}
        <div className="expo-resume-block">
          {/* Floating image - left aligned (Carrée 1:1 comme sur l'exemple) */}
          <img
            src={expoPhoto}
            alt={title}
            className="expo-resume-img"
            onError={(e) => { e.target.style.background = '#d4b896'; e.target.src = bannerPhoto; }}
          />

          {/* Text flows naturally around the image (Résumé) */}
          <div className="expo-resume-content">
            {resumeText
              .split(/\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((para, idx) => (
                <p key={idx}>
                  {para}
                </p>
              ))}
          </div>
        </div>
      </div>

      {/* ===== ARTISTES SECTION (AVEC BOUTONS GAUCHE ET DROITE) ===== */}
      <style>
        {`
          /* Masquer la barre de défilement tout en assurant le défilement tactile */
          .artist-carousel-track {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x proximity;
          }
          .artist-carousel-track::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          /* Boutons de défilement gauche / droite */
          .artist-carousel-nav-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1.5px solid #271811;
            background: #ffffff;
            color: #271811;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            outline: none;
            padding: 0;
          }
          .artist-carousel-nav-btn:not(:disabled):hover {
            background: #271811;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(39, 24, 17, 0.22);
          }
          .artist-carousel-nav-btn:not(:disabled):active {
            transform: translateY(0);
          }
          .artist-carousel-nav-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            border-color: #d0d0d0;
            color: #999999;
            background: #f7f7f7;
            box-shadow: none;
          }
          /* Style et léger effet d'ombre sur la carte d'artiste */
          .artist-carousel-card {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
            border: 1px solid #EAEAEA !important;
            transition: box-shadow 0.25s ease, border-color 0.25s ease !important;
            scroll-snap-align: start;
          }
          .artist-carousel-card:hover {
            transform: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
            border-color: #d0d0d0 !important;
          }
          @media (max-width: 992px) {
            .artist-carousel-card {
              flex: 0 0 calc((100% - 20px) / 2) !important;
              min-width: 270px !important;
            }
          }
          @media (max-width: 600px) {
            .artist-carousel-card {
              flex: 0 0 85% !important;
              min-width: 85% !important;
            }
          }
        `}
      </style>

      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px',
              fontWeight: 700,
              color: '#3D2516',
              margin: 0,
            }}
          >
            Artistes
          </h2>

          {/* Boutons de défilement gauche et droite pour les cartes de visite */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Défiler les artistes vers la gauche"
              className="artist-carousel-nav-btn"
              title="Précédent"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Défiler les artistes vers la droite"
              className="artist-carousel-nav-btn"
              title="Suivant"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel horizontal des cartes de visite */}
        <div
          ref={carouselRef}
          className="artist-carousel-track"
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            paddingBottom: '16px',
            boxSizing: 'border-box',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {artistList.map((artist, idx) => {
            const artistName = `${artist.prenoms || ''} ${artist.nom || ''}`.trim() || artist.name || 'Artiste';
            const artistPhoto = artist.photo_url || artist.photo || '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png';
            const artistSubtitle = artist.specialite || artist.mouvement || artist.specialty || '';

            return (
              <div
                key={artist.id || idx}
                onClick={() => setSelectedArtist(artist)}
                className="artist-carousel-card"
                style={{
                  flex: '0 0 calc((100% - 48px) / 3)',
                  minWidth: '310px',
                  background: '#ffffff',
                  border: '1px solid #EAEAEA',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  scrollSnapAlign: 'start',
                  boxSizing: 'border-box',
                  transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
                }}
              >
                <img
                  src={artistPhoto}
                  alt={artistName}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                  onError={(e) => { e.target.style.background = '#d4b896'; e.target.src = ''; }}
                />

                <div style={{ padding: '14px 18px', minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#3D2516',
                      margin: '0 0 6px',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {artistName}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: '#777777',
                      margin: 0,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {artistSubtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Virtual Tour Reader */}
      <VirtualTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      {/* Modal Popup Biographie Artiste */}
      <ArtistModal
        isOpen={!!selectedArtist}
        onClose={() => setSelectedArtist(null)}
        artist={selectedArtist}
      />
    </div>
  );
}
