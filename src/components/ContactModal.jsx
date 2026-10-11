import React from 'react';

export default function ContactModal({ isOpen, onClose, status = 'success', messageData, errorMessage }) {
  if (!isOpen) return null;

  const isSuccess = status === 'success';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content contact-modal-card" onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <>
            {/* Minimalist Success Icon */}
            <div
              className="contact-modal-icon"
              style={{
                background: '#ECFDF5',
                color: '#10B981',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            {/* Clean Minimalist Title */}
            <h3 className="contact-modal-title" style={{ marginBottom: '24px' }}>
              Message envoyé avec succès !
            </h3>

            {/* Simple Dismiss Button */}
            <button
              className="contact-modal-btn"
              onClick={onClose}
            >
              Fermer
            </button>
          </>
        ) : (
          <>
            {/* Minimalist Error Icon */}
            <div
              className="contact-modal-icon"
              style={{
                background: '#FEF2F2',
                color: '#EF4444',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>

            <h3 className="contact-modal-title" style={{ color: '#DC2626' }}>
              Échec de l'envoi
            </h3>

            <p className="contact-modal-text">
              {errorMessage || "Une erreur est survenue lors de l'envoi de votre message. Veuillez vérifier votre connexion et réessayer."}
            </p>

            <button
              className="contact-modal-btn"
              onClick={onClose}
              style={{ background: '#DC2626' }}
            >
              Fermer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
