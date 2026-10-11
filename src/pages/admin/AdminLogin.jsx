import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const uacLogo = '/src/assets/images/logouac.png';
const cegpaLogo = '/src/assets/images/logoCeGPA (2).png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login(username, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.message || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F2EB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-body)',
      }}
    >
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #271811 !important;
          caret-color: #271811 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #E2DED7',
          boxShadow: '0 12px 32px rgba(39, 24, 17, 0.08)',
          padding: '36px 32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Logos Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <img
            src={uacLogo}
            alt="Logo UAC"
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{ width: '1px', height: '36px', background: '#D9D4CC' }} />
          <img
            src={cegpaLogo}
            alt="Logo CeGPA"
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 700,
              color: '#271811',
              margin: '0 0 6px 0',
            }}
          >
            Espace Administrateur
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#77726D' }}>
            Connexion au back-office CeGPA - UAC
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div
            style={{
              background: '#FDF2F2',
              color: '#991B1B',
              border: '1px solid #F87171',
              borderRadius: '2px',
              padding: '10px 14px',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Champ Identifiant */}
          <div>
            <label
              htmlFor="login-username"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#3D2516',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Identifiant ou E-mail
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: '#888', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin"
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  border: '1px solid #D1CAC0',
                  borderRadius: '2px',
                  fontSize: '14px',
                  color: '#271811',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#271811'; }}
                onBlur={(e) => { e.target.style.borderColor = '#D1CAC0'; }}
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#3D2516',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Mot de passe
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: '#888', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 38px',
                  border: '1px solid #D1CAC0',
                  borderRadius: '2px',
                  fontSize: '14px',
                  color: '#271811',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#271811'; }}
                onBlur={(e) => { e.target.style.borderColor = '#D1CAC0'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#777',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bouton de Connexion */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#593A27' : '#271811',
              color: '#ffffff',
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              marginTop: '6px',
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = '#3D2516'; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = '#271811'; }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter au Dashboard'}
          </button>
        </form>
      </div>

      {/* Lien retour site public */}
      <div style={{ marginTop: '20px' }}>
        <Link
          to="/"
          style={{
            fontSize: '13px',
            color: '#593A27',
            textDecoration: 'none',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.color = '#271811'; e.target.style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { e.target.style.color = '#593A27'; e.target.style.textDecoration = 'none'; }}
        >
          <span>←</span>
          <span>Retour au site public</span>
        </Link>
      </div>
    </div>
  );
}
