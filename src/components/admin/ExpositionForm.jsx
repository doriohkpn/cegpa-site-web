import React, { useState, useEffect } from 'react';

/* ── Liste des Nationalités ──────────────────────────────────────────────── */
const NATIONALITES = [
  'Béninois(e)',
  'Togolais(e)',
  'Nigérian(e)',
  'Ivoirien(ne)',
  'Ghanéen(ne)',
  'Sénégalais(e)',
  'Burkinabè',
  'Malien(ne)',
  'Camerounais(e)',
  'Congolais(e)',
  'Gabonais(e)',
  'Nigérien(ne)',
  'Sud-Africain(e)',
  'Tchadien(ne)',
  'Rwandais(e)',
  'Guinéen(ne)',
  'Mauritanien(ne)',
  'Marocain(e)',
  'Algérien(ne)',
  'Tunisien(ne)',
  'Égyptien(ne)',
  'Éthiopien(ne)',
  'Kényan(e)',
  'Burundais(e)',
  'Cap-Verdien(ne)',
  'Centrafricain(e)',
  'Haïtien(ne)',
  'Français(e)',
  'Américain(e)',
  'Canadien(ne)',
  'Belge',
  'Suisse',
  'Allemand(e)',
  'Britannique',
  'Espagnol(e)',
  'Italien(ne)',
  'Autre nationalité'
];

/* ── Années de l'année en cours jusqu'à 1950 ─────────────────────────────── */
const CURRENT_YEAR = new Date().getFullYear();
const ANNEES = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => String(CURRENT_YEAR - i));

export default function ExpositionForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
}) {
  const currentYearStr = String(CURRENT_YEAR);

  const [currentArtist, setCurrentArtist] = useState({
    nom: '',
    prenoms: '',
    nationalite: 'Béninois(e)',
    mouvement: '',
    specialite: '',
    activite: currentYearStr,
    biographie: '',
    photo: null,
    photo_url: '',
  });

  const [localArtistes, setLocalArtistes] = useState(formData.artistes || []);
  const [focusedField, setFocusedField] = useState(null);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [editingArtistIndex, setEditingArtistIndex] = useState(null);
  const [hoveredAddCard, setHoveredAddCard] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);

  // Erreurs de validation
  const [formErrors, setFormErrors] = useState({});
  const [artistErrors, setArtistErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLocalArtistes(formData.artistes || []);
  }, [formData.artistes]);

  /* ── Mise à jour dynamique des champs et effacement des erreurs ───────── */
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleArtistFieldChange = (field, value) => {
    setCurrentArtist((prev) => ({ ...prev, [field]: value }));
    if (artistErrors[field]) {
      setArtistErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  /* ── Gestion Artiste ──────────────────────────────────────────────────── */
  const handleOpenAddArtist = () => {
    setCurrentArtist({
      nom: '',
      prenoms: '',
      nationalite: 'Béninois(e)',
      mouvement: '',
      specialite: '',
      activite: currentYearStr,
      biographie: '',
      photo: null,
      photo_url: '',
    });
    setArtistErrors({});
    setEditingArtistIndex(null);
    setShowArtistModal(true);
  };

  const handleOpenEditArtist = (index) => {
    setCurrentArtist({ ...localArtistes[index] });
    setArtistErrors({});
    setEditingArtistIndex(index);
    setShowArtistModal(true);
  };

  const handleArtistPhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentArtist((prev) => ({
          ...prev,
          photo: file,
          photo_url: reader.result,
        }));
        if (artistErrors.photo) {
          setArtistErrors((prev) => ({ ...prev, photo: false }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveArtist = () => {
    const errors = {
      nom: !currentArtist.nom?.trim(),
      prenoms: !currentArtist.prenoms?.trim(),
      mouvement: !currentArtist.mouvement?.trim(),
      specialite: !currentArtist.specialite?.trim(),
      biographie: !currentArtist.biographie?.trim(),
      photo: !currentArtist.photo && !currentArtist.photo_url,
    };

    if (Object.values(errors).some(Boolean)) {
      setArtistErrors(errors);
      return;
    }

    const artistData = {
      id: currentArtist.id || `ART-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...currentArtist,
      nationalite: currentArtist.nationalite || 'Béninois(e)',
      activite: currentArtist.activite || currentYearStr,
      photo_url: currentArtist.photo_url || '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png',
    };

    if (editingArtistIndex !== null) {
      const updated = [...localArtistes];
      updated[editingArtistIndex] = artistData;
      setLocalArtistes(updated);
    } else {
      setLocalArtistes([...localArtistes, artistData]);
    }

    // Effacer l'erreur artistes sur le formulaire principal si elle existait
    if (formErrors.artistes) {
      setFormErrors((prev) => ({ ...prev, artistes: false }));
    }

    setShowArtistModal(false);
    setArtistErrors({});
    setCurrentArtist({
      nom: '',
      prenoms: '',
      nationalite: 'Béninois(e)',
      mouvement: '',
      specialite: '',
      activite: currentYearStr,
      biographie: '',
      photo: null,
      photo_url: '',
    });
    setEditingArtistIndex(null);
  };

  const handleRemoveArtist = (index, e) => {
    if (e) e.stopPropagation();
    const updated = localArtistes.filter((_, i) => i !== index);
    setLocalArtistes(updated);
  };

  /* ── Soumission globale du formulaire ─────────────────────────────────── */
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const errors = {
      title: !formData.title?.trim(),
      date_debut: !formData.date_debut,
      date_cloture: !formData.date_cloture,
      summary: !formData.summary?.trim(),
    };

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      const firstKey = Object.keys(errors).find((k) => errors[k]);
      const idMap = {
        title: 'f-titre',
        date_debut: 'f-date-debut',
        date_cloture: 'f-date-cloture',
        summary: 'f-resume',
      };
      if (firstKey && idMap[firstKey]) {
        const el = document.getElementById(idMap[firstKey]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFormErrors({});

    const cleanDescription =
      formData.description?.trim() ||
      (formData.summary ? formData.summary.trim().slice(0, 160) + (formData.summary.length > 160 ? '...' : '') : '');

    try {
      setSubmitting(true);
      await onSubmit(e, {
        ...formData,
        description: cleanDescription,
        artistes: localArtistes || [],
      });
    } catch (err) {
      console.error('Erreur soumission formulaire exposition:', err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Styles d'origine ─────────────────────────────────────────────────── */
  const sectionStyle = {
    background: '#D1D1D1',
    padding: '28px',
    marginBottom: '32px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    marginBottom: '6px',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const getInputStyle = (id, hasError = false) => ({
    width: '100%',
    padding: '10px 12px',
    background: '#ffffff',
    border: hasError ? '1.5px solid #D93838' : (focusedField === id ? '1.5px solid #593A27' : '1.5px solid #cccccc'),
    borderRadius: '2px',
    fontSize: '13px',
    marginBottom: hasError ? '6px' : '20px',
    outline: 'none',
    cursor: 'text',
    transition: 'border-color 0.18s ease',
    fontFamily: 'var(--font-heading)',
    color: '#1a1009',
    boxSizing: 'border-box',
  });

  const errorMsgStyle = {
    color: '#D93838',
    fontSize: '11px',
    fontWeight: 600,
    marginBottom: '16px',
    display: 'block',
  };

  const uploadAreaStyle = {
    width: '100%',
    background: '#ffffff',
    border: '1.5px dashed #aaa',
    borderRadius: '2px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    cursor: 'pointer',
    padding: '20px',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden',
  };

  const fp = (id) => ({ onFocus: () => setFocusedField(id), onBlur: () => setFocusedField(null) });

  return (
    <div>
      {/* En-tête formulaire */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1009', margin: 0 }}>
          {isEditing ? 'Modifier l\'exposition' : 'Formulaire'}
        </h2>
      </div>

      <form onSubmit={handleFinalSubmit} noValidate>
        {/* ══════════════════ BLOC UNIQUE ════════════════════ */}
        <div style={sectionStyle}>
          
          {/* Nom Exposition — text */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Nom Exposition *</label>
            <span style={{ fontSize: '11px', color: (formData.title?.length || 0) >= 120 ? '#D93838' : '#777', fontWeight: 500 }}>
              {formData.title?.length || 0} / 120
            </span>
          </div>
          <input
            id="f-titre"
            type="text"
            maxLength={120}
            placeholder="Nom de l'exposition"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            style={getInputStyle('f-titre', !!formErrors.title)}
            {...fp('f-titre')}
          />
          {formErrors.title && <span style={errorMsgStyle}>Champs non renseigné</span>}

          {/* Dates — type="date" */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date début *</label>
              <input
                id="f-date-debut"
                type="date"
                value={formData.date_debut || ''}
                onChange={(e) => handleFieldChange('date_debut', e.target.value)}
                style={getInputStyle('f-date-debut', !!formErrors.date_debut)}
                {...fp('f-date-debut')}
              />
              {formErrors.date_debut && <span style={errorMsgStyle}>Champs non renseigné</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date clôture *</label>
              <input
                id="f-date-cloture"
                type="date"
                value={formData.date_cloture || ''}
                onChange={(e) => handleFieldChange('date_cloture', e.target.value)}
                style={getInputStyle('f-date-cloture', !!formErrors.date_cloture)}
                {...fp('f-date-cloture')}
              />
              {formErrors.date_cloture && <span style={errorMsgStyle}>Champs non renseigné</span>}
            </div>
          </div>

          {/* Description — text */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Description (Phrase d'accroche)</label>
            <span style={{ fontSize: '11px', color: (formData.description?.length || 0) >= 250 ? '#D93838' : '#777', fontWeight: 500 }}>
              {formData.description?.length || 0} / 250
            </span>
          </div>
          <input
            id="f-description"
            type="text"
            maxLength={250}
            placeholder="Courte description / phrase d'accroche..."
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            style={getInputStyle('f-description', !!formErrors.description)}
            {...fp('f-description')}
          />
          {formErrors.description && <span style={errorMsgStyle}>Champs non renseigné</span>}

          {/* Résumé — textarea (limite 3 000 caractères) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Résumé *</label>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: (formData.summary?.length || 0) >= 3000 ? '#D93838' : ((formData.summary?.length || 0) >= 2700 ? '#BA753F' : '#666'),
            }}>
              {formData.summary?.length || 0} / 3 000 caractères
            </span>
          </div>
          <textarea
            id="f-resume"
            maxLength={3000}
            placeholder="Résumé de l'exposition..."
            value={formData.summary}
            onChange={(e) => handleFieldChange('summary', e.target.value)}
            style={{
              ...getInputStyle('f-resume', !!formErrors.summary),
              height: '140px',
              resize: 'vertical',
              cursor: 'auto',
            }}
            {...fp('f-resume')}
          />
          {formErrors.summary && <span style={errorMsgStyle}>Champs non renseigné</span>}

          {/* URL Visite virtuelle — url */}
          <label style={labelStyle}>URL Visite virtuelle (Optionnel)</label>
          <input
            id="f-url"
            type="text"
            placeholder="https://..."
            value={formData.visite_virtuelle_id}
            onChange={(e) => handleFieldChange('visite_virtuelle_id', e.target.value)}
            style={getInputStyle('f-url', false)}
            {...fp('f-url')}
          />

          {/* Photos : Bannière et Photo Exposition */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              {/* Photo bannière — file */}
              <label style={labelStyle}>Photo bannière (Optionnel - visuel par défaut)</label>
              <FileUpload
                id="f-photo-expo"
                accept="image/*"
                onChange={(e) => {
                  handleFieldChange('image_file', e.target.files[0]);
                }}
                preview={formData.image_url}
                uploadAreaStyle={{ ...uploadAreaStyle, marginBottom: '20px' }}
                hasError={false}
              />
            </div>

            <div style={{ flex: '1 1 280px' }}>
              {/* Photo Exposition — file */}
              <label style={labelStyle}>Photo Exposition (Optionnel - visuel par défaut)</label>
              <FileUpload
                id="f-photo-exposition"
                accept="image/*"
                onChange={(e) => {
                  handleFieldChange('photo_exposition_file', e.target.files[0]);
                }}
                preview={formData.photo_exposition_url}
                uploadAreaStyle={{ ...uploadAreaStyle, marginBottom: '20px' }}
                hasError={false}
              />
            </div>
          </div>

          {/* ══════════════════ CHAMP ARTISTES SOUS FORME DE CARTES CARRÉES (4 PAR LIGNE) ══════════════════ */}
          <label style={{ ...labelStyle, marginTop: '12px', marginBottom: '12px' }}>
            Artistes participants (Optionnel)
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: formErrors.artistes ? '6px' : '10px',
            }}
          >
            {/* 1. Les cartes des artistes déjà ajoutés */}
            {localArtistes.map((art, index) => {
              const photoSrc =
                art.photo_url || art.photo || '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png';

              return (
                <div
                  key={art.id || index}
                  onClick={() => handleOpenEditArtist(index)}
                  onMouseEnter={() => setHoveredCardIndex(index)}
                  onMouseLeave={() => setHoveredCardIndex(null)}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#271811',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  title="Cliquer pour voir / modifier cet artiste"
                >
                  {/* Photo de profil de l'artiste occupant toute la carte carrée */}
                  <img
                    src={photoSrc}
                    alt={art.nom}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {/* Bouton de suppression en haut à droite : visible au survol */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveArtist(index, e)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#271811',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      lineHeight: 1,
                      zIndex: 2,
                      opacity: hoveredCardIndex === index ? 1 : 0,
                      transition: 'opacity 0.2s ease, background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#593A27')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#271811')}
                    title="Supprimer cet artiste"
                  >
                    ✕
                  </button>
                </div>
              );
            })}

            {/* 2. Le bouton d'ajout sous forme de carte carrée à côté des artistes */}
            <div
              onClick={handleOpenAddArtist}
              onMouseEnter={() => setHoveredAddCard(true)}
              onMouseLeave={() => setHoveredAddCard(false)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '4px',
                border: formErrors.artistes
                  ? '2px dashed #D93838'
                  : hoveredAddCard
                  ? '2px dashed #593A27'
                  : '2px dashed #888888',
                background: hoveredAddCard ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: '12px',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
              title="Ajouter un nouvel artiste"
            >
              <div
                style={{
                  fontSize: '36px',
                  color: formErrors.artistes ? '#D93838' : (hoveredAddCard ? '#593A27' : '#666666'),
                  lineHeight: 1,
                  marginBottom: '8px',
                  fontWeight: 300,
                }}
              >
                +
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: formErrors.artistes ? '#D93838' : (hoveredAddCard ? '#593A27' : '#444444'),
                }}
              >
                Ajouter un artiste
              </div>
            </div>
          </div>
        </div>

        {/* ── Bandeau d'alerte s'il manque des champs obligatoires ── */}
        {Object.values(formErrors).some(Boolean) && (
          <div style={{
            background: '#FDF2F2',
            border: '1.5px solid #D93838',
            color: '#D93838',
            padding: '12px 16px',
            borderRadius: '2px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>Veuillez renseigner les champs obligatoires (Nom Exposition, Dates, Résumé).</span>
          </div>
        )}

        {/* ══════════════════ BOUTON SOUMISSION ═════════════════════════════ */}
        <HoverButton type="submit" variant="dark" fullWidth disabled={submitting}>
          {submitting ? 'Enregistrement en cours...' : (isEditing ? 'Enregistrer' : 'Ajouter')}
        </HoverButton>
      </form>

      {/* ══════════════════ MODAL FORMULAIRE ARTISTE ════════════════════════ */}
      {showArtistModal && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowArtistModal(false);
          }}
        >
          <div
            style={{
              background: '#F5F5F5',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              borderRadius: '4px',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermeture ✕ */}
            <button
              type="button"
              onClick={() => setShowArtistModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '22px',
                cursor: 'pointer',
                color: '#1a1009',
                fontWeight: 'bold',
                lineHeight: 1,
              }}
              title="Fermer"
            >
              ✕
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1009', margin: '0 0 20px 0' }}>
              {editingArtistIndex !== null ? 'Modifier l\'artiste' : 'Ajouter un artiste'}
            </h3>

            {/* Bloc formulaire de l'artiste */}
            <div style={{ background: '#D1D1D1', padding: '20px', marginBottom: '20px' }}>
              
              {/* Nom & Prénoms */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Nom *</label>
                  <input
                    type="text"
                    placeholder="Nom de famille"
                    value={currentArtist.nom}
                    onChange={(e) => handleArtistFieldChange('nom', e.target.value)}
                    style={getInputStyle('art-nom', !!artistErrors.nom)}
                    {...fp('art-nom')}
                  />
                  {artistErrors.nom && <span style={errorMsgStyle}>Champs non renseigné</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Prénoms *</label>
                  <input
                    type="text"
                    placeholder="Prénom(s)"
                    value={currentArtist.prenoms}
                    onChange={(e) => handleArtistFieldChange('prenoms', e.target.value)}
                    style={getInputStyle('art-prenoms', !!artistErrors.prenoms)}
                    {...fp('art-prenoms')}
                  />
                  {artistErrors.prenoms && <span style={errorMsgStyle}>Champs non renseigné</span>}
                </div>
              </div>

              {/* Nationalité & Mouvement */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  {/* Champ Nationalité : liste déroulante avec valeur par défaut "Béninois(e)" */}
                  <label style={labelStyle}>Nationalité *</label>
                  <select
                    id="art-nat"
                    value={currentArtist.nationalite || 'Béninois(e)'}
                    onChange={(e) => handleArtistFieldChange('nationalite', e.target.value)}
                    style={{ ...getInputStyle('art-nat', !!artistErrors.nationalite), cursor: 'pointer' }}
                    {...fp('art-nat')}
                  >
                    {NATIONALITES.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat}
                      </option>
                    ))}
                  </select>
                  {artistErrors.nationalite && <span style={errorMsgStyle}>Champs non renseigné</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Mouvement artistique *</label>
                  <input
                    type="text"
                    placeholder="Ex : Art contemporain"
                    value={currentArtist.mouvement}
                    onChange={(e) => handleArtistFieldChange('mouvement', e.target.value)}
                    style={getInputStyle('art-mouv', !!artistErrors.mouvement)}
                    {...fp('art-mouv')}
                  />
                  {artistErrors.mouvement && <span style={errorMsgStyle}>Champs non renseigné</span>}
                </div>
              </div>

              {/* Spécialité & En activité depuis */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Spécialité *</label>
                  <input
                    type="text"
                    placeholder="Ex : Sculpture et art plastique"
                    value={currentArtist.specialite}
                    onChange={(e) => handleArtistFieldChange('specialite', e.target.value)}
                    style={getInputStyle('art-spec', !!artistErrors.specialite)}
                    {...fp('art-spec')}
                  />
                  {artistErrors.specialite && <span style={errorMsgStyle}>Champs non renseigné</span>}
                </div>
                <div style={{ flex: 1 }}>
                  {/* Champ En activité depuis : liste d'années avec valeur par défaut l'année en cours */}
                  <label style={labelStyle}>En activité depuis *</label>
                  <select
                    id="art-act"
                    value={currentArtist.activite || currentYearStr}
                    onChange={(e) => handleArtistFieldChange('activite', e.target.value)}
                    style={{ ...getInputStyle('art-act', !!artistErrors.activite), cursor: 'pointer' }}
                    {...fp('art-act')}
                  >
                    {ANNEES.map((an) => (
                      <option key={an} value={an}>
                        {an}
                      </option>
                    ))}
                  </select>
                  {artistErrors.activite && <span style={errorMsgStyle}>Champs non renseigné</span>}
                </div>
              </div>

              {/* Photo de profil de l'artiste */}
              <label style={labelStyle}>Photo de profil de l'artiste *</label>
              <div style={{ marginBottom: artistErrors.photo ? '6px' : '16px' }}>
                <FileUpload
                  id="modal-art-photo"
                  accept="image/*"
                  onChange={handleArtistPhotoFileChange}
                  uploadAreaStyle={{ ...uploadAreaStyle, padding: '14px', marginBottom: 0 }}
                  hasError={!!artistErrors.photo}
                />
              </div>
              {artistErrors.photo && <span style={errorMsgStyle}>Champs non renseigné</span>}

              {/* Biographie (limite 2 000 caractères) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Biographie *</label>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: (currentArtist.biographie?.length || 0) >= 2000 ? '#D93838' : ((currentArtist.biographie?.length || 0) >= 1800 ? '#BA753F' : '#666'),
                }}>
                  {currentArtist.biographie?.length || 0} / 2 000 caractères
                </span>
              </div>
              <textarea
                id="art-bio"
                maxLength={2000}
                placeholder="Biographie de l'artiste..."
                value={currentArtist.biographie}
                onChange={(e) => handleArtistFieldChange('biographie', e.target.value)}
                style={{
                  ...getInputStyle('art-bio', !!artistErrors.biographie),
                  height: '110px',
                  resize: 'vertical',
                  marginBottom: artistErrors.biographie ? '6px' : '16px',
                }}
                {...fp('art-bio')}
              />
              {artistErrors.biographie && <span style={errorMsgStyle}>Champs non renseigné</span>}
            </div>

            {/* Actions modal artiste */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              {editingArtistIndex !== null && (
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveArtist(editingArtistIndex);
                    setShowArtistModal(false);
                  }}
                  style={{
                    padding: '10px 18px',
                    background: '#ffffff',
                    border: '1.5px solid #271811',
                    color: '#271811',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: '2px',
                    marginRight: 'auto',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#271811';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#271811';
                  }}
                >
                  Supprimer cet artiste
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowArtistModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#ffffff',
                  border: '1.5px solid #271811',
                  color: '#271811',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSaveArtist}
                style={{
                  padding: '10px 24px',
                  background: '#271811',
                  border: '1.5px solid #271811',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#593A27')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#271811')}
              >
                {editingArtistIndex !== null ? 'Enregistrer' : 'Ajouter cet artiste'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Composant zone d'upload fichier (Original) ──────────────────────────── */
function FileUpload({ id, accept, onChange, preview, uploadAreaStyle, hasError = false }) {
  const [fileName, setFileName] = useState('');
  const [previewSrc, setPreviewSrc] = useState(preview || '');
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (preview) setPreviewSrc(preview);
  }, [preview]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewSrc(reader.result);
      reader.readAsDataURL(file);
    }
    if (onChange) onChange(e);
  };

  return (
    <label
      htmlFor={id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...uploadAreaStyle,
        border: hasError ? '1.5px dashed #D93838' : (hovered ? '1.5px dashed #593A27' : '1.5px dashed #aaa'),
        transition: 'border-color 0.2s',
      }}
    >
      {previewSrc ? (
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={previewSrc}
            alt="Aperçu"
            style={{
              maxHeight: '65px',
              maxWidth: '120px',
              objectFit: 'cover',
              borderRadius: '2px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          />
        </div>
      ) : (
        <div style={{ fontSize: '28px', marginBottom: '8px', color: hasError ? '#D93838' : (hovered ? '#593A27' : '#999'), transition: 'color 0.2s' }}>
          ☁
        </div>
      )}
      <div style={{ fontSize: '13px', fontWeight: 600, color: hasError ? '#D93838' : (hovered ? '#593A27' : '#555'), transition: 'color 0.2s' }}>
        {fileName || (previewSrc ? 'Modifier le fichier' : 'Cliquer pour importer')}
      </div>
      <div style={{ fontSize: '11px', color: hasError ? '#D93838' : '#aaa', marginTop: '4px' }}>PNG · JPG · WEBP</div>

      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
      />
    </label>
  );
}

/* ── Bouton avec hover inversé (Original) ─────────────────────────────────── */
function HoverButton({ children, type = 'button', onClick, variant = 'dark', fullWidth = false, disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const isDark = variant === 'dark';
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: fullWidth ? '100%' : undefined,
        background: disabled ? '#888888' : (hovered ? (isDark ? '#ffffff' : '#271811') : (isDark ? '#271811' : '#ffffff')),
        color:      disabled ? '#ffffff' : (hovered ? (isDark ? '#271811' : '#ffffff') : (isDark ? '#ffffff' : '#271811')),
        border: `1.5px solid ${disabled ? '#888888' : (isDark ? '#271811' : '#271811')}`,
        padding: fullWidth ? '20px' : '14px 24px',
        fontSize: fullWidth ? '16px' : '14px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-heading)',
        transition: 'background 0.2s, color 0.2s',
        borderRadius: '2px',
        marginTop: '4px',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}
