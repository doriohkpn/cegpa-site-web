import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Purge automatique et synchronisation immédiate des 2 expositions officielles CeGPA
(function syncOfficialCeGPAData() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const DATA_VERSION = 'cegpa_v6_clean_two_official';
  const currentVersion = localStorage.getItem('cegpa_data_version');
  const rawExpos = localStorage.getItem('cegpa_expositions');
  let isLegacy = currentVersion !== DATA_VERSION;
  if (!isLegacy && rawExpos) {
    try {
      const parsed = JSON.parse(rawExpos);
      if (Array.isArray(parsed)) {
        if (parsed.length > 2 || parsed.some(e => e.title && (e.title.includes('Mémoire des Racines') || e.title.includes('Lumière des Ombres')))) {
          isLegacy = true;
        }
      }
    } catch (_) {
      isLegacy = true;
    }
  }

  if (isLegacy) {
    localStorage.removeItem('cegpa_expositions');
    localStorage.removeItem('cegpa_current_expo');
    localStorage.removeItem('cegpa_artistes');
    localStorage.removeItem('cegpa_visites');
    localStorage.setItem('cegpa_data_version', DATA_VERSION);
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
