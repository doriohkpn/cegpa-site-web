import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { expositionsAPI, visitesAPI, artistesAPI } from '../../services/api';
import ExpositionList, { getExpoStatus, formatExpoDateRange, formatDateFR } from './ExpositionList';
import ExpositionForm from './ExpositionForm';

// Helper pour compresser les images uploadées (évite d'exploser le quota localStorage)
async function compressImageFile(file, maxWidth = 1200, quality = 0.75) {
  if (!file || !(file instanceof File)) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export default function ExpositionManager({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Popup de confirmation de suppression (sans icône, juste confirmation)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    expoId: null,
    expoTitle: '',
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const feedbackTimeoutRef = useRef(null);

  const showFeedback = (msg) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedbackMsg(msg);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMsg('');
    }, 3500);
  };
  
  const [expositions, setExpositions] = useState([]);
  const [visites, setVisites] = useState([]);
  const [artistes, setArtistes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [editingExpo, setEditingExpo] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    date_debut: '',
    date_cloture: '',
    date_range: '',
    summary: '',
    description: '',
    image_url: '',
    photo_exposition_url: '',
    visite_virtuelle_id: '',
    status: 'en_cours',
    artistes: []
  });

  const loadData = async () => {
    setLoading(true);
    const [exposData, visitesData, artistesData] = await Promise.all([
      expositionsAPI.getAll(),
      visitesAPI.getAll(),
      artistesAPI.getAll()
    ]);

    setExpositions(exposData || []);
    setVisites(visitesData || []);
    setArtistes(artistesData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Ouvrir la popup en mode Modification
  const handleEdit = (expo) => {
    setEditingExpo(expo);
    setFormData({
      title: expo.title || '',
      date_debut: expo.date_debut || '',
      date_cloture: expo.date_cloture || '',
      date_range: expo.date_range || '',
      summary: expo.summary || '',
      description: expo.description || '',
      image_url: expo.image_url || '',
      photo_exposition_url: expo.photo_exposition_url || expo.photo_exposition || '/src/assets/images/75ee0d3aa3ba31381bcfc26951f868482f26eea9.png',
      visite_virtuelle_id: expo.visite_virtuelle_id || (expo.visite_url || ''),
      status: expo.status || 'en_cours',
      artistes: expo.artistes || [],
      is_public: expo.is_public !== undefined ? expo.is_public : false,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // 2. Ouvrir la popup en mode Ajout
  const handleAdd = () => {
    setEditingExpo(null);
    setFormData({
      title: '',
      date_debut: '',
      date_cloture: '',
      date_range: '',
      summary: '',
      description: '',
      image_url: '',
      photo_exposition_url: '',
      visite_virtuelle_id: '',
      status: 'en_cours',
      artistes: [],
      is_public: false,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // 3. Bouton Voir : renvoie vers la page publique du détail de l'exposition
  const handleView = (expo) => {
    try {
      localStorage.setItem('cegpa_current_expo', JSON.stringify(expo));
    } catch (e) {
      console.warn('localStorage error', e);
    }
    navigate('/exposition/resume', { state: { expo } });
  };

  // Fermer la popup
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingExpo(null);
  };

  // Soumission du formulaire d'exposition (depuis la popup)
  const handleSubmit = async (e, customData) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const current = { ...formData, ...(customData || {}) };

      // Calcul de la plage de date à partir de date_debut et date_cloture
      let computedRange = '';
      if (current.date_debut && current.date_cloture) {
        computedRange = formatExpoDateRange('', current.date_debut, current.date_cloture);
      } else if (current.date_debut) {
        computedRange = formatDateFR(current.date_debut);
      } else if (current.date_range) {
        computedRange = formatExpoDateRange(current.date_range);
      } else {
        computedRange = 'Dates à venir';
      }

      // Traitement de l'image de bannière importée avec compression
      let bannerImageUrl = current.image_url;
      if (current.image_file instanceof File) {
        try {
          bannerImageUrl = await compressImageFile(current.image_file, 1200, 0.75);
        } catch (err) {
          console.warn('Erreur compression image bannière:', err);
        }
      }
      if (!bannerImageUrl) {
        bannerImageUrl = '/src/assets/images/20ce0cc7282cf3cd3bf186505f4186749537e3a2.png';
      }

      // Traitement de la Photo Exposition importée avec compression
      let photoExpoUrl = current.photo_exposition_url || current.photo_exposition || '';
      if (current.photo_exposition_file instanceof File) {
        try {
          photoExpoUrl = await compressImageFile(current.photo_exposition_file, 1200, 0.75);
        } catch (err) {
          console.warn('Erreur compression photo exposition:', err);
        }
      }
      if (!photoExpoUrl) {
        photoExpoUrl = '/src/assets/images/75ee0d3aa3ba31381bcfc26951f868482f26eea9.png';
      }

      // Traitement des artistes et de leurs photos avec compression
      const processedArtistes = await Promise.all(
        (current.artistes || []).map(async (art) => {
          let photoUrl = art.photo_url || art.photo;
          if (art.photo instanceof File) {
            try {
              photoUrl = await compressImageFile(art.photo, 600, 0.75);
            } catch (e) {
              console.warn('Erreur compression photo artiste:', e);
            }
          }
          return {
            ...art,
            photo_url: photoUrl || '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png'
          };
        })
      );

      const now = new Date();
      const formattedSubmissionDate = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const computedStatus = getExpoStatus({
        ...current,
        date_range: computedRange,
      });

      // Nettoyer les instances File du payload pour éviter les objets non sérialisables
      const cleanCurrent = { ...current };
      delete cleanCurrent.image_file;
      delete cleanCurrent.photo_exposition_file;

      const payload = {
        ...cleanCurrent,
        date_debut: current.date_debut || '',
        date_cloture: current.date_cloture || '',
        date_range: computedRange,
        status: computedStatus,
        image_url: bannerImageUrl,
        photo_exposition_url: photoExpoUrl,
        artistes: processedArtistes,
        in_active_list: true,
        // Lors de l'ajout, non publiée par défaut pour afficher le bouton Publier
        is_public: isEditing ? (current.is_public !== undefined ? current.is_public : false) : false,
        submission_date: current.submission_date || formattedSubmissionDate,
        created_at: current.created_at || now.toISOString()
      };

      if (isEditing && editingExpo) {
        const updatedObj = { id: editingExpo.id, ...payload };
        await expositionsAPI.update(updatedObj);
        try {
          const cur = localStorage.getItem('cegpa_current_expo');
          if (cur) {
            const p = JSON.parse(cur);
            if (String(p.id) === String(editingExpo.id) || (p.title && p.title.toLowerCase() === payload.title.toLowerCase())) {
              localStorage.setItem('cegpa_current_expo', JSON.stringify({ ...p, ...updatedObj }));
            }
          }
        } catch (e) {}
        showFeedback(`L'exposition « ${payload.title} » a été modifiée.`);
      } else {
        const createdObj = await expositionsAPI.create(payload);
        showFeedback(`L'exposition « ${payload.title} » a été ajoutée.`);
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setEditingExpo(null);
      await loadData();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'exposition:', err);
      showFeedback("Une erreur est survenue lors de l'enregistrement de l'exposition.");
    }
  };

  // Publier une exposition (Spécification : disparition du bouton publier après publication)
  const handlePublish = async (id, title) => {
    await expositionsAPI.togglePublic(id, true);
    await loadData();
    showFeedback(`L'exposition « ${title || 'Exposition'} » a été publiée.`);
  };

  // Retirer du tableau de bord (Spécification : disparition de l'exposition après retrait, réapparition du bouton publier)
  const handleRetire = async (id, title) => {
    await expositionsAPI.togglePublic(id, false);
    await loadData();
    showFeedback(`L'exposition « ${title || 'Exposition'} » a été retirée.`);
  };

  // Supprimer une exposition de la liste (ouvre le popup de confirmation sans icône)
  const handleDeleteFromList = (id, title) => {
    setDeleteConfirm({
      isOpen: true,
      expoId: id,
      expoTitle: title || '',
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, expoId: null, expoTitle: '' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.expoId) return;
    const id = deleteConfirm.expoId;
    const title = deleteConfirm.expoTitle;
    setDeleteConfirm({ isOpen: false, expoId: null, expoTitle: '' });
    await expositionsAPI.delete(id);
    await loadData();
    showFeedback(`L'exposition « ${title} » a été supprimée.`);
  };

  return (
    <div className="admin-module">
      {/* Affichage de la liste : s'adapte selon activeTab ('dashboard' ou 'exposition') */}
      <ExpositionList 
        expositions={expositions}
        loading={loading}
        activeTab={activeTab}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDeleteFromList}
        onPublish={handlePublish}
        onRetire={handleRetire}
      />

      {/* ── POPUP MODAL DU FORMULAIRE (Consigne : le formulaire se présentera sous forme de popup) ── */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            boxSizing: 'border-box'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div 
            style={{
              background: '#F5F5F5',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '40px',
              borderRadius: '4px',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton de fermeture de la popup */}
            <button
              onClick={handleCancel}
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#1a1009',
                fontWeight: 'bold',
                lineHeight: 1
              }}
              title="Fermer"
            >
              ✕
            </button>

            {/* Conception exacte du formulaire d'exposition d'origine */}
            <ExpositionForm 
              formData={formData}
              setFormData={setFormData}
              visites={visites}
              artistes={artistes}
              isEditing={isEditing}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* ── POPUP DE CONFIRMATION DE SUPPRESSION (SANS ICÔNE, JUSTE UNE CONFIRMATION) ── */}
      {deleteConfirm.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '440px',
              padding: '32px 36px',
              borderRadius: '4px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
              boxSizing: 'border-box',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 700,
                color: '#1a1009',
                margin: '0 0 14px',
              }}
            >
              Confirmation
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                color: '#444444',
                lineHeight: '1.6',
                margin: '0 0 16px',
              }}
            >
              Voulez-vous vraiment supprimer l'exposition {deleteConfirm.expoTitle ? `« ${deleteConfirm.expoTitle} »` : ''} ?
            </p>

            {/* Message d'alerte : triangle rouge sur la gauche, sans fond ni bordure */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '0 0 24px',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M12 2.5a2 2 0 0 0-1.73 1L1.27 18.5A2 2 0 0 0 3 21.5h18a2 2 0 0 0 1.73-3L13.73 3.5a2 2 0 0 0-1.73-1Z"
                  fill="#D93838"
                />
                <path d="M12 8.5v5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1.2" fill="#ffffff" />
              </svg>
              <p
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  color: '#D93838',
                  lineHeight: '1.5',
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Cette action est irréversible car il s'agit d'une suppression définitive.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCancelDelete}
                style={{
                  padding: '10px 22px',
                  background: '#ffffff',
                  border: '1.5px solid #271811',
                  color: '#271811',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: '10px 22px',
                  background: '#271811',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATION TOAST FEEDBACK (FOND BLANC, LÉGER EFFET OMBRE, PAS DE BORDURE) ── */}
      {feedbackMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            backgroundColor: '#ffffff',
            color: '#1a1009',
            padding: '14px 24px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.04)',
            zIndex: 10001,
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'all 0.25s ease',
          }}
        >
          {feedbackMsg}
        </div>
      )}
    </div>
  );
}
