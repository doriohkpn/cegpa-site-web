import React, { useState, useEffect } from 'react';
import { artistesAPI } from '../../services/api';

export default function ArtisteManager() {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArtiste, setEditingArtiste] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profession: '',
    bio: '',
    photo_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadArtistes = async () => {
    setLoading(true);
    const data = await artistesAPI.getAll();
    setArtistes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadArtistes();
  }, []);

  const handleEdit = (art) => {
    setEditingArtiste(art);
    setFormData({
      first_name: art.first_name || '',
      last_name: art.last_name || '',
      profession: art.profession || art.specialty || '',
      bio: art.bio || '',
      photo_url: art.photo_url || art.photo || ''
    });
  };

  const handleReset = () => {
    setEditingArtiste(null);
    setFormData({ first_name: '', last_name: '', profession: '', bio: '', photo_url: '' });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const photoUrl = await artistesAPI.uploadPhoto(file);
      setFormData((prev) => ({ ...prev, photo_url: photoUrl }));
      setStatusMsg('Photo téléversée avec succès.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      alert("Erreur lors de l'upload de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.profession) return;

    if (editingArtiste) {
      await artistesAPI.update({ id: editingArtiste.id, ...formData });
      setStatusMsg('Fiche artiste mise à jour.');
    } else {
      await artistesAPI.create(formData);
      setStatusMsg('Nouvel artiste ajouté avec succès.');
    }

    handleReset();
    loadArtistes();
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet artiste ?')) {
      await artistesAPI.delete(id);
      setStatusMsg('Artiste supprimé.');
      loadArtistes();
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="admin-module">
      <div className="admin-module-header flex justify-between align-center mb-6">
        <div>
          <h2 className="heading-md text-primary-dark">Gestion des Artistes</h2>
          <p className="text-muted text-sm">Créez et gérez la liste des artistes exposés avec téléversement de leurs photos.</p>
        </div>
      </div>

      {statusMsg && <div className="alert alert-success mb-6">{statusMsg}</div>}

      <div className="grid-2-cols gap-8">
        {/* Formulaire Artiste */}
        <div className="card p-6">
          <h3 className="heading-sm text-primary mb-4">
            {editingArtiste ? '✏️ Modifier la Fiche Artiste' : '➕ Ajouter un Artiste'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid-2-cols gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="ex: Aïcha"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="ex: Hounkpatin"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Métier / Profession *</label>
              <input
                type="text"
                className="form-input"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="ex: Sculptrice & Plasticienne"
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Photo de l'Artiste (Fichier image)</label>
              <input
                type="file"
                accept="image/*"
                className="form-input mb-2"
                onChange={handleFileChange}
              />
              {uploading && <p className="text-xs text-accent">Téléversement en cours...</p>}
              
              {formData.photo_url && (
                <div className="flex align-center gap-4 mt-2 p-2 border rounded bg-light">
                  <img src={formData.photo_url} alt="Aperçu photo" className="w-12 h-12 rounded object-cover" />
                  <span className="text-xs text-muted truncate">{formData.photo_url}</span>
                </div>
              )}
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Biographie & Parcours</label>
              <textarea
                className="form-input"
                rows="4"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Présentation de l'artiste..."
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary flex-1">
                {editingArtiste ? 'Enregistrer' : 'Créer l\'artiste'}
              </button>
              {editingArtiste && (
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste des artistes */}
        <div className="card p-6">
          <h3 className="heading-sm text-primary mb-4">Artistes Référencés ({artistes.length})</h3>

          {loading ? (
            <p className="text-muted">Chargement des artistes...</p>
          ) : artistes.length === 0 ? (
            <p className="text-muted">Aucun artiste enregistré.</p>
          ) : (
            <div className="admin-list-container">
              {artistes.map((art) => (
                <div key={art.id} className="admin-item-card mb-4 p-4 border rounded flex justify-between align-center">
                  <div className="flex align-center gap-4">
                    <img 
                      src={art.photo_url || art.photo || '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png'} 
                      alt={art.first_name} 
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <strong className="text-primary-dark block">{art.first_name} {art.last_name || art.name}</strong>
                      <span className="badge badge-accent text-xs">{art.profession || art.specialty}</span>
                    </div>
                  </div>

                  <div className="admin-actions flex gap-2">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(art)} title="Modifier">✏️</button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(art.id)} title="Supprimer">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
