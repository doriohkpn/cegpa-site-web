import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { artworks } from '../data';

const ROOMS = [
  {
    id: 'salle-bronze',
    name: "Hall d'Accueil & Sculptures Bronzes",
    description: "Espace principal mettant en valeur l'art sculptural traditionnel et contemporain du Bénin.",
    image: '/src/assets/images/75ee0d3aa3ba31381bcfc26951f868482f26eea9.png',
    hotspots: [
      { id: 1, x: 28, y: 48, artworkId: 2, label: 'Mémoire Vive' },
      { id: 2, x: 62, y: 55, artworkId: 3, label: 'Racines Profondes' },
      { id: 3, x: 82, y: 42, artworkId: 6, label: "Fragments d'Histoire" },
    ]
  },
  {
    id: 'salle-peinture',
    name: 'Galerie des Toiles et Peintures',
    description: 'Une immersion dans les couleurs, les expressions mixtes et le patrimoine pictural.',
    image: '/src/assets/images/bd8ff6d21ba4c8068f97ef3bb27473eaf474d4be.png',
    hotspots: [
      { id: 4, x: 35, y: 40, artworkId: 1, label: "L'Héritage des Ancêtres" },
      { id: 5, x: 70, y: 48, artworkId: 5, label: 'Lumière Ancestrale' },
      { id: 6, x: 50, y: 68, artworkId: 7, label: 'Dialogue des Terres' },
    ]
  },
  {
    id: 'salle-installations',
    name: 'Pavillon des Installations Textiles',
    description: 'Espace expérimental regroupant le tissage traditionnel et les installations modernes.',
    image: '/src/assets/images/fa9e1e93c236bb8fa92bb994cc3a37f25ad211d6.png',
    hotspots: [
      { id: 7, x: 45, y: 52, artworkId: 4, label: "Tissage de l'Âme" },
      { id: 8, x: 78, y: 45, artworkId: 8, label: "L'Arbre de Vie" },
      { id: 9, x: 22, y: 60, artworkId: 12, label: 'Empreintes' },
    ]
  }
];

export default function VirtualTourModal({ isOpen, onClose, tourUrl }) {
  const navigate = useNavigate();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isPlayingAudioGuide, setIsPlayingAudioGuide] = useState(false);

  const currentRoom = ROOMS[currentRoomIndex];

  useEffect(() => {
    setActiveHotspot(null);
  }, [currentRoomIndex]);

  if (!isOpen) return null;

  const activeArtwork = activeHotspot
    ? artworks.find((a) => a.id === activeHotspot.artworkId)
    : null;

  return (
    <div className="virtual-tour-overlay">
      {/* HEADER */}
      <div className="virtual-tour-header">
        <div className="vt-header-title-wrap">
          <span className="vt-badge">Visite Virtuelle 360° / VR</span>
          <h2>{currentRoom.name}</h2>
          <p>{currentRoom.description}</p>
        </div>

        <div className="vt-header-controls">
          <button 
            className={`btn-vt-audio ${isPlayingAudioGuide ? 'playing' : ''}`}
            onClick={() => setIsPlayingAudioGuide(!isPlayingAudioGuide)}
          >
            {isPlayingAudioGuide ? '🔊 Pause Audio-guide' : '🎧 Écouter l\'Audio-guide'}
          </button>

          <button className="vt-close-btn" onClick={onClose} aria-label="Fermer la visite">
            &times;
          </button>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="virtual-tour-viewport">
        <img 
          src={currentRoom.image} 
          alt={currentRoom.name} 
          className="vt-bg-image" 
        />

        {/* Hotspots */}
        {currentRoom.hotspots.map((hs) => (
          <div
            key={hs.id}
            className={`vt-hotspot ${activeHotspot?.id === hs.id ? 'active' : ''}`}
            style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            onClick={() => setActiveHotspot(hs)}
          >
            <div className="vt-hotspot-pulse"></div>
            <div className="vt-hotspot-pin">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div className="vt-hotspot-tooltip">{hs.label}</div>
          </div>
        ))}

        {/* Hotspot Drawer / Card */}
        {activeArtwork && (
          <div className="vt-artwork-card">
            <button className="vt-card-close" onClick={() => setActiveHotspot(null)}>
              &times;
            </button>
            <div className="vt-card-body">
              <img src={activeArtwork.image} alt={activeArtwork.title} />
              <div>
                <span className="badge badge-accent">{activeArtwork.category}</span>
                <h4>{activeArtwork.title}</h4>
                <p className="vt-card-artist">Par {activeArtwork.artist}</p>
                <p className="vt-card-desc">{activeArtwork.description.substring(0, 120)}...</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onClose();
                    navigate('/exposition/resume');
                  }}
                >
                  Voir la fiche complète
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="virtual-tour-footer">
        <div className="vt-room-selector">
          {ROOMS.map((room, idx) => (
            <button
              key={room.id}
              className={`vt-room-btn ${idx === currentRoomIndex ? 'active' : ''}`}
              onClick={() => setCurrentRoomIndex(idx)}
            >
              <span>{idx + 1}</span> {room.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
