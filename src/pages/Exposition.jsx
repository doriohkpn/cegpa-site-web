import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { expositionsAPI } from '../services/api';
import { formatExpoDateRange } from '../components/admin/ExpositionList';

const fallbackImg = '/src/assets/images/bd8ff6d21ba4c8068f97ef3bb27473eaf474d4be.png';

export default function Exposition() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expositions, setExpositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination adaptative selon la parité du nombre d'expositions par ligne :
  // - Lignes paires (4 colonnes sur desktop, 2 sur smartphone) : 20 par page (5 lignes pleines de 4 ou 10 lignes de 2)
  // - Lignes impaires (3 colonnes sur tablette / intermédiaire) : 21 par page (7 lignes pleines de 3)
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      return (w > 768 && w <= 1100) ? 21 : 20;
    }
    return 20;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const count = (w > 768 && w <= 1100) ? 21 : 20;
      setItemsPerPage(count);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchExpositions = async () => {
      try {
        const data = await expositionsAPI.getPublic();
        setExpositions(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des expositions :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpositions();

    const handleStorageChange = (e) => {
      if (!e || !e.key || e.key === 'cegpa_expositions') {
        fetchExpositions();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cegpa_expo_updated', fetchExpositions);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cegpa_expo_updated', fetchExpositions);
    };
  }, []);

  // Réinitialiser la page quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredItems = expositions.filter((item) => {
    if (!search.trim()) return true;
    const term = String(search)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const titleNorm = String(item.title || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    return titleNorm.includes(term);
  });

  // Pagination dynamique : 20 pour lignes paires (4 ou 2 colonnes), 21 pour lignes impaires (3 colonnes)
  // Le reste est affiché sur la dernière page
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sécurité : si la page courante dépasse le total de pages, réaligner sur la dernière page valide
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const gridEl = document.getElementById('expositions-grid');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    const gridEl = document.getElementById('expositions-grid');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Expositions' }]} />

      {/* Style de la page exposition */}
      <style>
        {`
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }

          /* Barre de recherche adaptative */
          .expo-search-form {
            width: 75%;
            max-width: 960px;
            display: flex;
            align-items: center;
            border: 1px solid #777777;
            border-radius: 2px;
            background: #ffffff;
            padding: 11px 20px;
            box-sizing: border-box;
            transition: width 0.25s ease;
          }
          @media (max-width: 768px) {
            .expo-search-form {
              width: 100% !important;
              padding: 9px 16px;
            }
          }

          /* Grille 4 colonnes pour les expositions */
          .expositions-grid-4col {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            row-gap: 63px;
            column-gap: 22px;
            width: 100%;
            box-sizing: border-box;
          }
          @media (max-width: 1100px) {
            .expositions-grid-4col {
              grid-template-columns: repeat(3, 1fr);
              row-gap: 56px;
              column-gap: 18px;
            }
          }
          @media (max-width: 768px) {
            .expositions-grid-4col {
              grid-template-columns: repeat(2, 1fr) !important;
              row-gap: 42px;
              column-gap: 14px;
            }
            .expositions-grid-container {
              padding: 0 12px !important;
            }
          }
          @media (max-width: 480px) {
            .expositions-grid-4col {
              grid-template-columns: repeat(2, 1fr) !important;
              row-gap: 35px;
              column-gap: 10px;
            }
            .expositions-grid-container {
              padding: 0 8px !important;
            }
          }

          .exposition-page-card {
            width: 100%;
            height: 290px;
            padding: 0;
            border: none;
          }
          @media (max-width: 768px) {
            .exposition-page-card {
              height: 235px;
              padding: 0;
            }
          }
          @media (max-width: 480px) {
            .exposition-page-card {
              height: 195px;
              padding: 0;
              border-radius: 0;
            }
            .exposition-page-card .expo-card-overlay {
              padding: 10px 8px 8px !important;
            }
            .exposition-page-card .expo-card-title {
              font-size: 13px !important;
              line-height: 1.2 !important;
            }
            .exposition-page-card .expo-card-date {
              font-size: 10px !important;
              margin-bottom: 2px !important;
            }
            .exposition-page-card .expo-card-desc {
              font-size: 9.5px !important;
              -webkit-line-clamp: 2 !important;
              display: -webkit-box !important;
              -webkit-box-orient: vertical !important;
            }
          }

          .expo-pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 14px;
            margin-top: 32px;
            padding-bottom: 0;
            flex-wrap: wrap;
          }
          @media (max-width: 480px) {
            .expo-pagination-container {
              gap: 10px;
              margin-top: 20px;
            }
            .expo-pagination-btn {
              width: 115px !important;
              font-size: 13px !important;
            }
          }
        `}
      </style>

      <h1 className="sr-only">Expositions</h1>

      {/* ===== SEARCH BAR (Centrée et pleine largeur sur mobile) ===== */}
      <div className="container" style={{ margin: '28px auto 36px auto', display: 'flex', justifyContent: 'center' }}>
        <form
          onSubmit={handleSearchSubmit}
          className="expo-search-form"
        >
          <input
            type="text"
            placeholder="Rechercher"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#333333',
              background: 'transparent',
            }}
          />
          <button
            type="submit"
            title="Rechercher"
            aria-label="Rechercher"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#333333',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>
      </div>

      {/* ===== EXPOSITIONS CARDS GRID (4 cartes par ligne sur PC, 2 cartes par ligne sur smartphone/tablette) ===== */}
      <div id="expositions-grid" className="container expositions-grid-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
            Chargement des expositions...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
            Aucune exposition trouvée.
          </div>
        ) : (
          <>
            <div className="expositions-grid-4col">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    try {
                      localStorage.setItem('cegpa_current_expo', JSON.stringify(item));
                    } catch (e) {}
                    navigate('/exposition/resume', { state: { expo: item } });
                  }}
                  className="expo-card-framed exposition-page-card"
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
                      src={item.image_url || fallbackImg}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.8s ease',
                      }}
                      className="expo-framed-img"
                      onError={(e) => { 
                        e.target.style.background = '#d4b896'; 
                        e.target.src = fallbackImg; 
                      }}
                    />

                    {/* Overlay avec titre permanent et date début/clôture + description au survol */}
                    <div className="expo-card-overlay" style={{ padding: '16px 14px 12px' }}>
                      <h3 className="expo-card-title" style={{ fontSize: '17px', lineHeight: 1.25 }}>
                        {item.title}
                      </h3>
                      <div className="expo-card-details">
                        <p className="expo-card-date" style={{ fontSize: '13px' }}>
                          {formatExpoDateRange(item.date_range, item.date_debut, item.date_cloture)}
                        </p>
                        <p className="expo-card-desc" style={{ fontSize: '12px' }}>
                          {item.description || item.summary || 'Voici une courte résume de cette exposition.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination au bout de 5 lignes (ou si des expositions existent) */}
            <div className="expo-pagination-container">
              <button
                type="button"
                className="expo-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Précédent
              </button>

              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#3D2516',
                  userSelect: 'none',
                  padding: '0 8px',
                }}
              >
                Page : {currentPage} sur {totalPages}
              </span>

              <button
                type="button"
                className="expo-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
