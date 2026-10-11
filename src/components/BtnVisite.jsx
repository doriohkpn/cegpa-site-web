import React, { useState } from 'react';
import VirtualTourModal from './VirtualTourModal';

export default function BtnVisite({ label = "Visite virtuelle", tourUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="btn btn-primary btn-visite" 
        onClick={() => setIsOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <span>{label}</span>
      </button>

      <VirtualTourModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        tourUrl={tourUrl}
      />
    </>
  );
}
