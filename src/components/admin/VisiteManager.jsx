import React, { useState, useEffect } from 'react';
import { visitesAPI } from '../../services/api';

export default function VisiteManager() {
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVisite, setEditingVisite] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '', embed_url: '', description: '' });
  const [statusMsg, setStatusMsg] = useState('');

  const loadVisites = async () => {
    setLoading(true);
    const data = await visitesAPI.getAll();
    setVisites(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadVisites();
  }, []);

  const handleEdit = (visite) => {
    setEditingVisite(visite);
    setFormData({
      title: visite.title || '',
      url: visite.url || '',
      embed_url: visite.embed_url || visite.url || '',
      description: visite.description || ''
    });
  };

  const handleReset = () => {
    setEditingVisite(null);
    setFormData({ title: '', url: '', embed_url: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    if (editingVisite) {
      await visitesAPI.update({ id: editingVisite.id, ...formData });
      setStatusMsg('Visite virtuelle mise à jour avec succès.');
    } else {
      await visitesAPI.create(formData);
      setStatusMsg('Nouvelle visite virtuelle ajoutée avec succès.');
    }

    handleReset();
    loadVisites();
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette visite virtuelle ?')) {
      await visitesAPI.delete(id);
      setStatusMsg('Visite virtuelle supprimée.');
      loadVisites();
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="admin-module">
      <div className="admin-module-header flex justify-between align-center mb-6">
        <div>
          <h2 className="heading-md text-primary-dark">Gestion des Visites Virtuelles</h2>
          <p className="text-muted text-sm">Ajoutez, modifiez et gérez les liens 3D et Matterport de la galerie.</p>
        </div>
      </div>

      {statusMsg && <div className="alert alert-success mb-6">{statusMsg}</div>}

      <div className="grid-2-cols gap-8">
        {/* Formulaire Add/Edit */}
        <div className="card p-6">
          <h3 className="heading-sm text-primary mb-4">
            {editingVisite ? '✏️ Modifier la Visite Virtuelle' : '➕ Ajouter une Visite Virtuelle'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="form-label">Titre de la Visite Virtuelle *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ex: Pavillon des Sculptures 3D"
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Lien de la Visite (URL Matterport / Web) *</label>
              <input
                type="url"
                className="form-input"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://my.matterport.com/show/?m=..."
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Lien d'intégration iFrame (Optionnel)</label>
              <input
                type="url"
                className="form-input"
                value={formData.embed_url}
                onChange={(e) => setFormData({ ...formData, embed_url: e.target.value })}
                placeholder="https://my.matterport.com/show/?m=..."
              />
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Aperçu des éléments numérisés..."
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary flex-1">
                {editingVisite ? 'Enregistrer' : 'Ajouter la visite'}
              </button>
              {editingVisite && (
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste des visites */}
        <div className="card p-6">
          <h3 className="heading-sm text-primary mb-4">Visites Virtuelles Enregistrées</h3>

          {loading ? (
            <p className="text-muted">Chargement des visites...</p>
          ) : visites.length === 0 ? (
            <p className="text-muted">Aucune visite virtuelle enregistrée.</p>
          ) : (
            <div className="admin-list-container">
              {visites.map((v) => (
                <div key={v.id} className="admin-item-card mb-4 p-4 border rounded">
                  <div className="flex justify-between align-center mb-2">
                    <strong className="text-primary-dark">{v.title}</strong>
                    <div className="admin-actions flex gap-2">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(v)} title="Modifier">✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(v.id)} title="Supprimer">🗑️</button>
                    </div>
                  </div>
                  <p className="text-sm text-muted mb-2">{v.description || 'Pas de description'}</p>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-accent text-xs font-mono">
                    🔗 {v.url} ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
