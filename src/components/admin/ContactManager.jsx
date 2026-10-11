import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';

export default function ContactManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    const data = await contactAPI.getAll();
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await contactAPI.toggleRead(msg.id, true);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: 1 } : m));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce message ?')) {
      await contactAPI.delete(id);
      if (selectedMessage?.id === id) setSelectedMessage(null);
      setStatusMsg('Message supprimé.');
      loadMessages();
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="admin-module">
      <div className="admin-module-header flex justify-between align-center mb-6">
        <div>
          <h2 className="heading-md text-primary-dark">Gestion des Messages de Contact</h2>
          <p className="text-muted text-sm">Consultez les demandes, réservations et messages envoyés depuis la section « À propos ».</p>
        </div>
      </div>

      {statusMsg && <div className="alert alert-success mb-6">{statusMsg}</div>}

      <div className="grid-2-cols gap-8">
        {/* Liste des messages */}
        <div className="card p-6">
          <h3 className="heading-sm text-primary mb-4">Boîte de Réception ({messages.length})</h3>

          {loading ? (
            <p className="text-muted">Chargement des messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-muted">Aucun message reçu pour le moment.</p>
          ) : (
            <div className="admin-messages-list">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`message-item-card p-4 mb-3 border rounded cursor-pointer ${
                    selectedMessage?.id === m.id ? 'active border-primary' : ''
                  } ${!m.is_read ? 'unread bg-light' : ''}`}
                  onClick={() => handleSelectMessage(m)}
                >
                  <div className="flex justify-between align-center mb-1">
                    <strong className="text-primary-dark">{m.full_name}</strong>
                    {!m.is_read && <span className="badge badge-accent text-xs">Nouveau</span>}
                  </div>
                  <div className="text-sm font-semibold mb-1">{m.subject}</div>
                  <div className="text-xs text-muted truncate">{m.message}</div>
                  <div className="text-xs text-muted text-right mt-2">
                    {new Date(m.created_at || Date.now()).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détail du message sélectionné */}
        <div className="card p-6">
          <h3 className="heading-sm text-primary mb-4">Détail du Message</h3>

          {selectedMessage ? (
            <div className="message-detail-box">
              <div className="flex justify-between align-center mb-4 pb-4 border-b">
                <div>
                  <h4 className="heading-sm text-primary-dark">{selectedMessage.subject}</h4>
                  <p className="text-sm text-muted">De : <strong>{selectedMessage.full_name}</strong> ({selectedMessage.email})</p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDelete(selectedMessage.id)}
                >
                  🗑️ Supprimer
                </button>
              </div>

              <div className="message-body p-4 bg-light rounded mb-6 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              <div className="flex gap-4">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="btn btn-primary btn-sm"
                >
                  ✉️ Répondre par E-mail
                </a>
              </div>
            </div>
          ) : (
            <p className="text-muted text-center py-12">
              Cliquez sur un message dans la liste de gauche pour le lire.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
