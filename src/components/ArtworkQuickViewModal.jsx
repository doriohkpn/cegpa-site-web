import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArtworkQuickViewModal({ artwork, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!artwork) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/galerie/${artwork.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content artwork-quickview-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
          &times;
        </button>

        <div className="artwork-modal-grid">
          {/* Image */}
          <div className="artwork-modal-img-wrap">
            <img src={artwork.image} alt={artwork.title} />
          </div>

          {/* Info */}
          <div className="artwork-modal-body">
            <div>
              <span className="badge badge-accent">{artwork.category || 'Œuvre d\'art'}</span>
              <h2 className="artwork-modal-title">{artwork.title}</h2>
              <p className="artwork-modal-artist">
                Par <strong>{artwork.artist}</strong>
              </p>
              <div className="artwork-modal-meta">
                <span><strong>Dimensions :</strong> {artwork.dimensions || 'Variable'}</span>
                <span><strong>Exposition :</strong> {artwork.exposition || 'Collection CeGPA'}</span>
              </div>
              <p className="artwork-modal-desc">{artwork.description}</p>
            </div>

            <div className="artwork-modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  navigate(`/galerie/${artwork.id}`);
                }}
              >
                Fiche complète
              </button>

              <button className="btn btn-secondary" onClick={handleShare}>
                {copied ? '✓ Lien copié !' : 'Partager'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
