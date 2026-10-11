import React, { useState, useMemo, useEffect, useRef } from 'react';

const SORT_OPTIONS = [
  { id: 'numero', label: 'Numéro' },
  { id: 'alphabet', label: 'Alphabet' },
  { id: 'duree', label: 'Durée' },
  { id: 'statut', label: 'Statut' },
  { id: 'action', label: 'Action' },
];

const SORT_LABELS = {
  alphabet: 'Alphabet',
  numero: 'Numéro',
  duree: 'Durée',
  statut: 'Statut',
  action: 'Action',
};

/* ── Normalisation pour recherche insensible à la casse et aux accents ───── */
export function normalizeSearchText(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/* ── Détermination dynamique du statut selon les dates ────────────────────── */
export function getExpoStatus(expo) {
  if (!expo) return 'En cours';
  if (expo.is_deleted) return 'Supprimée';

  let startDate = parseDateValue(expo.date_debut);
  let endDate = parseDateValue(expo.date_cloture);

  if (!startDate || !endDate) {
    const extracted = extractDatesFromRange(expo.date_range);
    if (!startDate && extracted.start) startDate = extracted.start;
    if (!endDate && extracted.end) endDate = extracted.end;
  }

  // Si aucune date n'a pu être extraite, fallback sur les valeurs de secours
  if (!startDate && !endDate) {
    if (expo.status === 'passee' || expo.status === 'cloture' || expo.status === 'Clôturer') return 'Clôturer';
    if (expo.status === 'a_venir' || expo.status === 'A venir') return 'A venir';
    return 'En cours';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  // 1. Si la date de début est supérieure à aujourd'hui : "A venir"
  if (startDate && startDate.getTime() > today.getTime()) {
    return 'A venir';
  }

  // 3. Date d'aujourd'hui supérieure à la date de clôture : "Clôturer"
  if (endDate && today.getTime() > endDate.getTime()) {
    return 'Clôturer';
  }

  // 2. Compris entre la date de début et la date de clôture : "En cours"
  return 'En cours';
}

const MOIS_FR = {
  janvier: 0, janv: 0,
  fevrier: 1, 'février': 1, fevr: 1, 'févr': 1,
  mars: 2,
  avril: 3, avr: 3,
  mai: 4,
  juin: 5,
  juillet: 6, juil: 6,
  aout: 7, 'août': 7,
  septembre: 8, sept: 8,
  octobre: 9, oct: 9,
  novembre: 10, nov: 10,
  decembre: 11, 'décembre': 11, dec: 11, 'déc': 11
};

function parseDateValue(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val)) return val;
  const str = String(val)
    .replace(/^\s*(?:du|au|le|à|a)\s+/i, '')
    .trim();

  // YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  // DD/MM/YYYY
  const frMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (frMatch) {
    return new Date(Number(frMatch[3]), Number(frMatch[2]) - 1, Number(frMatch[1]));
  }

  // Format texte ex: "02 Janvier 2025"
  const textMatch = str.match(/^(\d{1,2})\s+([a-zA-ZÀ-ÿ]+)(?:\s+(\d{4}))?/i);
  if (textMatch) {
    const m = textMatch[2].toLowerCase();
    if (MOIS_FR[m] !== undefined) {
      const y = textMatch[3] ? Number(textMatch[3]) : new Date().getFullYear();
      return new Date(y, MOIS_FR[m], Number(textMatch[1]));
    }
  }

  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }

  return null;
}

function extractDatesFromRange(rangeStr) {
  if (!rangeStr) return { start: null, end: null };
  const str = String(rangeStr).trim();

  // Match YYYY-MM-DD
  const isoMatches = [...str.matchAll(/(\d{4})-(\d{1,2})-(\d{1,2})/g)];
  if (isoMatches.length >= 2) {
    return {
      start: new Date(Number(isoMatches[0][1]), Number(isoMatches[0][2]) - 1, Number(isoMatches[0][3])),
      end: new Date(Number(isoMatches[1][1]), Number(isoMatches[1][2]) - 1, Number(isoMatches[1][3])),
    };
  }

  // Match DD/MM/YYYY
  const frMatches = [...str.matchAll(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g)];
  if (frMatches.length >= 2) {
    return {
      start: new Date(Number(frMatches[0][3]), Number(frMatches[0][2]) - 1, Number(frMatches[0][1])),
      end: new Date(Number(frMatches[1][3]), Number(frMatches[1][2]) - 1, Number(frMatches[1][1])),
    };
  }

  // Match format texte ex: "02 Janvier au 27 Avril 2025"
  const textMatches = [...str.matchAll(/(\d{1,2})\s+([a-zA-ZÀ-ÿ]+)(?:\s+(\d{4}))?/gi)];
  if (textMatches.length >= 2) {
    const m1 = textMatches[0][2].toLowerCase();
    const m2 = textMatches[1][2].toLowerCase();
    if (MOIS_FR[m1] !== undefined && MOIS_FR[m2] !== undefined) {
      const yearEnd = textMatches[1][3] ? Number(textMatches[1][3]) : (textMatches[0][3] ? Number(textMatches[0][3]) : new Date().getFullYear());
      const yearStart = textMatches[0][3] ? Number(textMatches[0][3]) : yearEnd;
      return {
        start: new Date(yearStart, MOIS_FR[m1], Number(textMatches[0][1])),
        end: new Date(yearEnd, MOIS_FR[m2], Number(textMatches[1][1]))
      };
    }
  }

  return { start: null, end: null };
}

/* ── Calcul de la durée en jours d'une exposition ── */
export function getExpoDurationDays(expo) {
  if (!expo) return 999999;
  let startDate = parseDateValue(expo.date_debut);
  let endDate = parseDateValue(expo.date_cloture);

  if (!startDate || !endDate) {
    const extracted = extractDatesFromRange(expo.date_range);
    if (!startDate && extracted.start) startDate = extracted.start;
    if (!endDate && extracted.end) endDate = extracted.end;
  }

  if (startDate && endDate) {
    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }
  return 999999;
}

/* ── Extraction du numéro d'une exposition pour le tri et l'affichage numérique ── */
export function getExpoNumericId(val) {
  if (val && typeof val === 'object') {
    if (val.numero !== undefined && val.numero !== null && !isNaN(Number(val.numero))) {
      return Number(val.numero);
    }
    if (val.number !== undefined && val.number !== null && !isNaN(Number(val.number))) {
      return Number(val.number);
    }
    val = val.id;
  }
  if (typeof val === 'number') {
    if (val > 1000000) {
      return Number(String(val).slice(-3)) || 1;
    }
    return val;
  }
  const str = String(val || '');
  const match = str.match(/(\d+)$/);
  if (match) return Number(match[1]);
  const allNums = str.match(/\d+/g);
  if (allNums && allNums.length > 0) return Number(allNums[allNums.length - 1]);
  return 0;
}

/* ── Formatage d'une date en JJ/MM/AAAA (ex: 01/10/2026) ── */
export function formatDateFR(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : parseDateValue(val);
  if (!d || isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/* ── Formatage de l'identifiant de l'exposition (format : EXP-026-001 avec 3 chiffres pour l'année) ── */
export function formatExpoId(id, expo) {
  if (id === undefined || id === null) return '-';

  let year = '2026';
  if (expo) {
    const rawDate = expo.created_at || expo.date_debut || expo.submission_date || '';
    const match = String(rawDate).match(/\b(20\d\d)\b/);
    if (match && Number(match[1]) >= 2026) {
      year = match[1];
    }
  }
  // 3 chiffres pour désigner l'année (ex: 2026 -> 026)
  const year3 = String(year).slice(-3);

  const num = Number(id);
  if (!isNaN(num) && num > 0 && num < 100000) {
    return `EXP-${year3}-${String(num).padStart(3, '0')}`;
  }

  const str = String(id);
  if (str.match(/^EXP-\d{3}-\d{3,}$/)) return str;
  if (str.length > 6) {
    return `EXP-${year3}-${str.slice(-3)}`;
  }
  return `EXP-${year3}-${str.padStart(3, '0')}`;
}

/* ── Formatage de la durée : "JJ/MM/AAAA - JJ/MM/AAAA" sans "du" ni "au" (ex: 01/10/2026 - 15/12/2026) ── */
export function formatExpoDateRange(range, start, end) {
  let startDate = parseDateValue(start);
  let endDate = parseDateValue(end);

  if (!startDate || !endDate) {
    const extracted = extractDatesFromRange(range);
    if (!startDate && extracted.start) startDate = extracted.start;
    if (!endDate && extracted.end) endDate = extracted.end;
  }

  const formattedStart = formatDateFR(startDate);
  const formattedEnd = formatDateFR(endDate);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  if (formattedStart) {
    return formattedStart;
  }

  if (formattedEnd) {
    return formattedEnd;
  }

  if (!range) return 'Dates à venir';

  // Fallback si non parsable en date : retirer "du" et "au" et séparer par un trait
  return String(range)
    .replace(/\bdu\b/gi, '')
    .replace(/\bau\b/gi, '-')
    .replace(/\s*-\s*/g, ' - ')
    .trim()
    .replace(/^-+|-+$/g, '')
    .trim() || 'Dates à venir';
}

export default function ExpositionList({ 
  expositions = [], 
  loading = false, 
  activeTab = 'exposition', // 'dashboard' ou 'exposition'
  onEdit, 
  onDelete, 
  onAdd, 
  onView,
  onPublish, 
  onRetire 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('numero'); // 'numero', 'alphabet', 'duree', 'statut', 'action'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' ou 'desc'
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Bascule du tri : 1er clic = croissant, 2e clic = décroissant
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fermeture du menu déroulant lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rendre la recherche et le tri indépendants d'une page à l'autre (réinitialisation automatique au changement d'onglet)
  useEffect(() => {
    setSearchTerm('');
    setSortField('numero');
    setSortDirection('asc');
    setSortDropdownOpen(false);
  }, [activeTab]);

  // 1. Liste de base selon l'onglet actif (les éléments actifs reçoivent leur numéro séquentiel continu : 1, 2, 3...)
  // Si une exposition (ex: 4) est supprimée, la suivante (5) devient automatiquement le numéro 4 !
  const baseActiveList = useMemo(() => {
    let list = [];
    if (activeTab === 'dashboard') {
      list = expositions.filter(e => 
        e.in_active_list !== false && 
        !e.is_deleted && 
        (e.is_public === true || e.is_public === 1 || e.is_public === '1')
      );
    } else {
      list = expositions.filter(e => e.in_active_list !== false && !e.is_deleted);
    }
    return list.map((expo, idx) => ({
      ...expo,
      _listNumber: idx + 1
    }));
  }, [expositions, activeTab]);

  // 2. Liste de base pour l'Historique (numérotation continue de toutes les expositions enregistrées)
  const baseHistoryList = useMemo(() => {
    return (expositions || []).map((expo, idx) => ({
      ...expo,
      _listNumber: idx + 1
    }));
  }, [expositions]);

  // Helper de filtrage et tri pour une liste avec _listNumber
  const processList = (list) => {
    let result = [...list];
    if (searchTerm.trim()) {
      const rawTerm = searchTerm.trim();
      const term = normalizeSearchText(rawTerm);
      const isNumeric = /^\d+$/.test(rawTerm);

      result = result.filter(expo => {
        // Recherche prioritaire et principale par le titre de l'exposition (insensible à la casse et aux accents)
        const titleNormalized = normalizeSearchText(expo.title);
        if (titleNormalized.includes(term)) {
          return true;
        }

        // Si la recherche est un numéro exact de liste (ex: "1", "2")
        if (isNumeric && (expo._listNumber === Number(rawTerm) || String(expo.id) === rawTerm)) {
          return true;
        }

        // Si la recherche correspond à l'identifiant formaté officiel (ex: "EXP-026-001")
        if (expo.id && normalizeSearchText(formatExpoId(expo.id, expo)).includes(term)) {
          return true;
        }

        return false;
      });
    }

    if (sortField === 'numero') {
      result.sort((a, b) => {
        const numA = a._listNumber || 0;
        const numB = b._listNumber || 0;
        if (numA !== numB) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }
        return (a.title || '').localeCompare(b.title || '', 'fr');
      });
    } else if (sortField === 'alphabet') {
      result.sort((a, b) => {
        const cmp = (a.title || '').localeCompare(b.title || '', 'fr');
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    } else if (sortField === 'duree') {
      result.sort((a, b) => {
        const durA = getExpoDurationDays(a);
        const durB = getExpoDurationDays(b);
        if (durA !== durB) {
          return sortDirection === 'asc' ? durA - durB : durB - durA;
        }
        return (a.title || '').localeCompare(b.title || '', 'fr');
      });
    } else if (sortField === 'statut') {
      const statusPriority = {
        'En cours': 1,
        'A venir': 2,
        'Clôturer': 3,
        'Supprimée': 4
      };
      result.sort((a, b) => {
        const pA = statusPriority[getExpoStatus(a)] || 99;
        const pB = statusPriority[getExpoStatus(b)] || 99;
        if (pA !== pB) {
          return sortDirection === 'asc' ? pA - pB : pB - pA;
        }
        return (a.title || '').localeCompare(b.title || '', 'fr');
      });
    } else if (sortField === 'action') {
      result.sort((a, b) => {
        const aPublic = a.is_public === true || a.is_public === 1 || a.is_public === '1';
        const bPublic = b.is_public === true || b.is_public === 1 || b.is_public === '1';
        if (aPublic !== bPublic) {
          return sortDirection === 'asc' ? (aPublic ? 1 : -1) : (aPublic ? -1 : 1);
        }
        return (a.title || '').localeCompare(b.title || '', 'fr');
      });
    }

    return result;
  };

  // Liste active filtrée et triée
  const activeExpos = useMemo(() => {
    return processList(baseActiveList);
  }, [baseActiveList, searchTerm, sortField, sortDirection]);

  // Liste de l'historique filtrée et triée
  const historyExpos = useMemo(() => {
    return processList(baseHistoryList);
  }, [baseHistoryList, searchTerm, sortField, sortDirection]);

  const buttonStyle = {
    padding: '6px 12px',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s ease',
  };

  const tableHeaderStyle = {
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #e0e0e0',
    fontWeight: 700,
    fontSize: '13px',
    color: '#1a1009',
    position: 'sticky',
    top: 0,
    background: '#ffffff',
    zIndex: 2,
  };

  const tableRowStyle = {
    borderBottom: '1px solid #f0f0f0',
    background: '#ffffff',
  };

  const tableCellStyle = {
    padding: '10px 16px',
    fontSize: '13px',
    color: '#333333',
    lineHeight: '1.4',
    verticalAlign: 'middle',
  };

  const historyHeaderStyle = {
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1.5px solid rgba(0, 0, 0, 0.20)',
    fontWeight: 700,
    fontSize: '13px',
    color: '#1a1009',
    position: 'sticky',
    top: 0,
    background: '#F5F5F5',
    zIndex: 2,
    fontFamily: 'var(--font-heading)',
  };

  const historyRowStyle = {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    background: 'transparent',
  };

  const historyCellStyle = {
    padding: '10px 16px',
    fontSize: '13px',
    color: '#222222',
    fontFamily: 'var(--font-heading)',
    background: 'transparent',
    lineHeight: '1.4',
    verticalAlign: 'middle',
  };

  return (
    <div>
      {/* ── BARRE D'OUTILS HAUT DROITE (Trier par & Recherche) ──────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>Trier par :</span>
          
          <div ref={sortDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen(prev => !prev)}
              style={{ 
                padding: '6px 12px', 
                border: '1px solid #ccc', 
                background: '#ffffff', 
                fontSize: '12px', 
                borderRadius: '2px', 
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#333'
              }}
            >
              <span>{SORT_LABELS[sortField] || 'Numéro'}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {sortDropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '2px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  minWidth: '150px',
                  overflow: 'hidden'
                }}
              >
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = sortField === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        handleSort(opt.id);
                        setSortDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: isSelected ? '#f5efe9' : '#ffffff',
                        border: 'none',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: isSelected ? '#271811' : '#333333',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#fafafa';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <span style={{ fontSize: '12px', color: '#593A27', fontWeight: 700 }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#ffffff', 
          border: '1px solid #ccc', 
          padding: '0 10px', 
          borderRadius: '2px' 
        }}>
          <input 
            type="text" 
            placeholder="Rechercher par titre..." 
            style={{ 
              padding: '6px 0', 
              border: 'none', 
              outline: 'none', 
              fontSize: '12px', 
              width: '180px',
              background: 'transparent'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <span 
              onClick={() => setSearchTerm('')}
              style={{ cursor: 'pointer', fontSize: '12px', color: '#888', fontWeight: 'bold', marginLeft: '4px' }}
              title="Effacer la recherche"
            >
              ✕
            </span>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, cursor: 'pointer' }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>
      </div>

      {/* ── SECTION 1 : LISTE DES EXPOSITIONS (OU EXPOSITIONS SUR TABLEAU DE BORD) ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '22px', 
          fontWeight: 600, 
          color: '#1a1009', 
          margin: 0 
        }}>
          {activeTab === 'dashboard' ? 'Expositions' : 'Liste des expositions'}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Affichage du nombre d'expositions (Côté droit) */}
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#444444',
            whiteSpace: 'nowrap'
          }}>
            {activeExpos.length} Exposition(s)
          </span>

          {/* Bouton "Ajouter une exposition" sur l'onglet Exposition, conforme au croquis du tableau blanc */}
          {activeTab !== 'dashboard' && onAdd && (
            <button
              style={{ 
                ...buttonStyle, 
                background: '#271811', 
                padding: '9px 20px', 
                fontSize: '13px', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={onAdd}
            >
              <span>+</span>
              <span>Ajouter une exposition</span>
            </button>
          )}
        </div>
      </div>

      {/* Carte blanche de la table des expositions */}
      <div 
        className="admin-table-scroll"
        style={{ 
          background: '#ffffff', 
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)', 
          borderRadius: '2px', 
          marginBottom: '28px', 
          maxHeight: activeTab === 'dashboard'
            ? (activeExpos.length > 7 ? '380px' : 'none')
            : (activeExpos.length > 5 ? '285px' : 'none'),
          overflowY: activeTab === 'dashboard'
            ? (activeExpos.length > 7 ? 'auto' : 'visible')
            : (activeExpos.length > 5 ? 'auto' : 'visible'),
          overflowX: 'auto',
          position: 'relative',
          border: '1px solid #e0e0e0'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('numero')}
                style={{ ...tableHeaderStyle, width: '6%', textAlign: 'center', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                title="Trier par numéro"
              >
                N°
              </th>
              <th 
                onClick={() => handleSort('alphabet')}
                style={{ ...tableHeaderStyle, width: '38%', cursor: 'pointer', userSelect: 'none' }}
                title="Trier par titre alphabétique"
              >
                Titre
              </th>
              <th 
                onClick={() => handleSort('duree')}
                style={{ ...tableHeaderStyle, width: '24%', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                title="Trier par durée"
              >
                Durée
              </th>
              <th 
                onClick={() => handleSort('statut')}
                style={{ ...tableHeaderStyle, width: '10%', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                title="Trier par statut"
              >
                Statut
              </th>
              <th 
                onClick={() => handleSort('action')}
                style={{ ...tableHeaderStyle, width: '22%', textAlign: 'right', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                title="Trier par action requise"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                  Chargement...
                </td>
              </tr>
            ) : activeExpos.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '36px', textAlign: 'center', color: '#777' }}>
                  {activeTab === 'dashboard' 
                    ? 'Aucune exposition publiée sur le tableau de bord.' 
                    : 'Aucune exposition dans la liste.'}
                </td>
              </tr>
            ) : (
              activeExpos.map((expo, index) => {
                const isPublic = expo.is_public === true || expo.is_public === 1 || expo.is_public === '1';

                return (
                  <tr key={expo.id} style={tableRowStyle}>
                    <td style={{ ...tableCellStyle, textAlign: 'center', color: '#666', fontWeight: 600 }}>
                      {expo._listNumber || (index + 1)}
                    </td>
                    <td style={{ ...tableCellStyle, fontWeight: 500, color: '#1a1009' }}>
                      {expo.title}
                    </td>
                    <td style={{ ...tableCellStyle, whiteSpace: 'nowrap' }}>
                      {formatExpoDateRange(expo.date_range, expo.date_debut, expo.date_cloture)}
                    </td>
                    <td style={{ ...tableCellStyle, whiteSpace: 'nowrap' }}>
                      {getExpoStatus(expo)}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {activeTab === 'dashboard' ? (
                          <>
                            {/* Sur le Tableau de bord : Voir et Retirer (conforme tableau blanc) */}
                            <button
                              style={{ ...buttonStyle, background: '#271811' }}
                              onClick={() => onView && onView(expo)}
                            >
                              Voir
                            </button>
                            <button
                              style={{ ...buttonStyle, background: '#D93838' }}
                              onClick={() => onRetire && onRetire(expo.id, expo.title)}
                            >
                              Retirer
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Sur Exposition :
                                - À l'ajout (non publiée) : affichage de "Modifier", "Publier" (et "Supprimer")
                                - Après publication : disparition du bouton "Modifier", "Publier"
                                - Après retrait de l'expo : réapparition du bouton "Modifier", "Publier" */}
                            {!isPublic && (
                              <button
                                style={{ ...buttonStyle, background: '#593A27' }}
                                onClick={() => onEdit && onEdit(expo)}
                              >
                                Modifier
                              </button>
                            )}

                            {!isPublic && (
                              <button
                                style={{ ...buttonStyle, background: '#1F7A4D' }}
                                onClick={() => onPublish && onPublish(expo.id, expo.title)}
                              >
                                Publier
                              </button>
                            )}

                            <button
                              style={{ ...buttonStyle, background: '#D93838' }}
                              onClick={() => onDelete && onDelete(expo.id, expo.title)}
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── SECTION 2 : HISTORIQUE (Fond gris comme sur la capture, sans carte blanche ni bordure) ────────────────────────── */}
      {activeTab !== 'dashboard' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '22px', 
              fontWeight: 600, 
              color: '#1a1009', 
              margin: 0 
            }}>
              Historique
            </h2>

            {/* Affichage du nombre d'expositions dans l'historique (Côté droit) */}
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#444444',
              whiteSpace: 'nowrap'
            }}>
              {historyExpos.length} Exposition(s)
            </span>
          </div>
          
          <div 
            className="admin-table-scroll"
            style={{ 
              background: '#F5F5F5',
              boxShadow: 'none',
              borderRadius: '0',
              maxHeight: historyExpos.length > 5 ? '280px' : 'none',
              overflowY: historyExpos.length > 5 ? 'auto' : 'visible',
              overflowX: 'auto',
              position: 'relative',
              border: 'none',
              marginBottom: '24px'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#F5F5F5' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid rgba(0, 0, 0, 0.20)' }}>
                  <th 
                    onClick={() => handleSort('numero')}
                    style={{ ...historyHeaderStyle, width: '6%', textAlign: 'center', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                    title="Trier par numéro"
                  >
                    N°
                  </th>
                  <th 
                    onClick={() => handleSort('alphabet')}
                    style={{ ...historyHeaderStyle, width: '34%', cursor: 'pointer', userSelect: 'none' }}
                    title="Trier par titre"
                  >
                    Titre
                  </th>
                  <th 
                    onClick={() => handleSort('duree')}
                    style={{ ...historyHeaderStyle, width: '26%', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                    title="Trier par durée"
                  >
                    Durée
                  </th>
                  <th 
                    onClick={() => handleSort('statut')}
                    style={{ ...historyHeaderStyle, width: '14%', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                    title="Trier par statut"
                  >
                    Statut
                  </th>
                  <th style={{ ...historyHeaderStyle, width: '20%', whiteSpace: 'nowrap' }}>
                    Date soumission
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyExpos.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px 20px', color: '#666', background: '#F5F5F5' }}>
                      Aucun historique.
                    </td>
                  </tr>
                ) : (
                  historyExpos.map((expo, index) => {
                    const dateSoumission = expo.submission_date || (expo.created_at ? new Date(expo.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : '03/09/2025');

                    const statusLabel = getExpoStatus(expo);

                    return (
                      <tr key={expo.id} style={historyRowStyle}>
                        <td style={{ ...historyCellStyle, textAlign: 'center', color: '#666', fontWeight: 600 }}>
                          {expo._listNumber || (index + 1)}
                        </td>
                        <td style={{ ...historyCellStyle, fontWeight: 500, color: '#1a1009' }}>
                          {expo.title}
                        </td>
                        <td style={{ ...historyCellStyle, whiteSpace: 'nowrap' }}>
                          {formatExpoDateRange(expo.date_range, expo.date_debut, expo.date_cloture)}
                        </td>
                        <td style={{ ...historyCellStyle, whiteSpace: 'nowrap' }}>
                          {statusLabel}
                        </td>
                        <td style={{ ...historyCellStyle, whiteSpace: 'nowrap' }}>
                          {dateSoumission}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
