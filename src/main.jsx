import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Purge automatique ciblée uniquement des anciens placeholders factices CeGPA
(function syncOfficialCeGPAData() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const DATA_VERSION = 'cegpa_v7_dynamic_official';
  const rawExpos = localStorage.getItem('cegpa_expositions');
  let hasLegacyPlaceholders = false;
  if (rawExpos) {
    try {
      const parsed = JSON.parse(rawExpos);
      if (Array.isArray(parsed)) {
        if (parsed.some(e => e.title && (e.title.includes('Mémoire des Racines') || e.title.includes('Lumière des Ombres')))) {
          hasLegacyPlaceholders = true;
        }
      }
    } catch (_) {
      hasLegacyPlaceholders = true;
    }
  }

  if (hasLegacyPlaceholders) {
    localStorage.removeItem('cegpa_expositions');
    localStorage.removeItem('cegpa_current_expo');
    localStorage.removeItem('cegpa_artistes');
    localStorage.removeItem('cegpa_visites');
  }
  localStorage.setItem('cegpa_data_version', DATA_VERSION);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
