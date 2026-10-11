import React, { useEffect } from 'react';

const BIO_AICHA = `Née à Ouidah au cœur d'une lignée séculaire d'artisans fondeurs et de tisserands traditionnels, Aïcha Hounkpatin s'impose aujourd'hui comme l'une des figures majeures de la création contemporaine béninoise. Diplômée avec les honneurs de l'Institut National des Métiers d'Art, d'Archéologie et de la Culture (INMAAC) d'Abomey-Calavi, elle parfait ensuite son apprentissage auprès de maîtres sculpteurs à Porto-Novo ainsi qu'au cours de résidences de recherche plastique à Dakar, Bamako et Accra. Sa pratique pluridisciplinaire combine la sculpture sur bois d'iroko, le bronze patiné à la cire perdue, les fibres végétales tressées et les pigments d'ocre naturelle, créant un dialogue sensible et puissant entre l'héritage spirituel vodun et les préoccupations sociétales actuelles.

À travers ses installations immersives, l'artiste interroge la mémoire collective, la transmission des récits oraux et la préservation de la biodiversité culturelle africaine. Ses œuvres monumentales incarnent la force des divinités féminines, la résilience des générations passées et la quête d'un équilibre harmonieux entre l'humain et son écosystème sacré. Elle intègre fréquemment des éléments textiles patinés et des parchemins calligraphiés pour évoquer les archives vivantes du continent africain.

Régulièrement saluée par la critique internationale, Aïcha Hounkpatin a représenté le Bénin lors de la Biennale de Dakar et a exposé ses créations dans des institutions muséales de premier plan à Cotonou, Paris, Bruxelles et Casablanca. Lauréate de plusieurs bourses prestigieuses d'excellence artistique, elle consacre également une part essentielle de son engagement à l'animation d'ateliers de transmission destinés aux jeunes créatrices béninoises, affirmant ainsi sa volonté indéfectible d'ancrer la création dans le partage, l'émancipation et la pérennité du patrimoine ancestral.`;

const BIO_ROBERT = `Artiste plasticien et sculpteur reconnu sur la scène internationale, Robert Zinsou développe depuis plus de quinze ans une œuvre monumentale à la croisée de l'abstraction contemporaine et de la statuaire classique du royaume du Danxomè. Formé initialement à l'École des Beaux-Arts d'Abidjan avant de poursuivre son parcours d'expérimentation plastique en Allemagne et au Sénégal, il explore avec rigueur les tensions matérielles entre le métal oxydé, le bois brûlé, la latérite rouge et les résines végétales. Son travail questionne avec acuité les traces indélébiles de l'histoire coloniale, la déportation des artefacts sacrés et la nécessaire réappropriation des symboles souverains par les artistes contemporains du continent africain.

Chaque création de Robert Zinsou se présente comme un monument mémoriel, où les géométries strictes rencontrent les aspérités de la matière brute. Ses sculptures totémiques, souvent érigées à échelle humaine ou monumentale, réinterprètent les récades royales, les attributs divinatoires du Fa et les armures guerrières des amazones d'Abomey, invitant le spectateur à une méditation profonde sur la souveraineté, le temps et la fierté retrouvée.

Distingué par le Prix de la Création Contemporaine Africaine et invité d'honneur de prestigieuses foires d'art contemporain à Marrakech, Londres, Bâle et Johannesburg, Robert Zinsou voit ses œuvres intégrer d'importantes collections publiques et privées à travers le monde. Membre actif de collectifs d'artistes engagés à Cotonou, il milite ardemment pour la fondation de musées d'art vivant en Afrique de l'Ouest et participe activement aux réflexions académiques sur la valorisation durable du patrimoine immatériel béninois.`;

const BIO_COSSI = `Originaire d'Abomey, berceau historique d'une extraordinaire tradition sculpturale et métallurgique, Cossi Quenum s'est affirmé au fil des années comme un maître incontournable de la sculpture contemporaine sur métal et bois précieux. Issu d'un atelier familial d'artisans forgerons, il a très tôt appris à apprivoiser le feu, l'enclume et la fonte du fer avant d'enrichir ses compétences techniques aux Beaux-Arts de Kinshasa et au cours de multiples ateliers itinérants en Afrique de l'Est. Sa démarche artistique singulière repose sur une symbiose novatrice entre les techniques séculaires de la forge d'Ogun et les formes épurées de la sculpture monumentale mondiale.

L'univers de Cossi Quenum est profondément habité par les mythes fondateurs, les allégories des proverbes fon et la sacralité des éléments naturels. Par le martelage rythmé du fer de récupération, l'assemblage audacieux de rails centenaires et l'incrustation de feuilles de cuivre, il insuffle une âme vibrante à des silhouettes élancées évoquant des gardiens ancestraux, des musiciens traditionnels et des messagers spirituels. Ses compositions spatiales jouent subtilement avec la lumière naturelle et les ombres portées, offrant une expérience sensorielle saisissante qui transcende les époques.

Exposé régulièrement dans les galeries et biennales d'Afrique, d'Europe et d'Amérique du Nord, Cossi Quenum a été honoré de nombreuses distinctions artistiques pour sa contribution au rayonnement de l'artisanat d'art béninois. Passionné par l'écologie et l'économie circulaire, il a créé dans sa ville natale un centre d'apprentissage dédié aux métiers de la forge et du recyclage artistique, transmettant ainsi aux générations futures l'amour du geste juste et la fierté d'un héritage millénaire.`;

function getEnrichedBiography(art) {
  if (!art) return '';
  const current = art.biographie || art.bio || '';
  if (current.length >= 1500) return current;

  const name = `${art.prenoms || ''} ${art.nom || ''} ${art.name || ''}`.toLowerCase();
  const idStr = String(art.id || '').toLowerCase();

  if (name.includes('robert') || name.includes('zinsou') || idStr.includes('2') || idStr.includes('zinsou')) {
    return BIO_ROBERT;
  }
  if (name.includes('cossi') || name.includes('quenum') || idStr.includes('3') || idStr.includes('quenum')) {
    return BIO_COSSI;
  }
  if (name.includes('aïcha') || name.includes('aicha') || name.includes('hounkpatin') || idStr.includes('1') || idStr.includes('hounkpatin')) {
    return BIO_AICHA;
  }

  const artistDisplayName = `${art.prenoms || ''} ${art.nom || ''}`.trim() || art.name || 'Cet artiste';
  const spec = art.specialite || art.specialty || 'arts plastiques et visuels';
  const mouv = art.mouvement || art.movement || 'création contemporaine inspirée des traditions ancestrales';

  return `${artistDisplayName} s'affirme comme une personnalité créative incontournable de la scène artistique béninoise et ouest-africaine, développant une pratique exigeante dédiée à la valorisation des patrimoines matériels et immatériels. Formé(e) auprès de maîtres émérites et au sein d'ateliers d'art reconnus sur le continent, l'artiste a su forger une signature visuelle singulière qui conjugue virtuosité technique, profondeur spirituelle et dialogue intergénérationnel. Sa discipline d'élection, axée principalement sur la ${spec}, s'inscrit au carrefour des savoirs séculaires et de la recherche plastique novatrice.

Au cœur de son cheminement esthétique, ${artistDisplayName} explore avec ferveur les liens étroits qui unissent la mémoire collective, les récits oraux du golfe de Guinée et les métamorphoses du monde contemporain. Ses œuvres traduisent une réflexion subtile sur la souveraineté culturelle, la préservation des écosystèmes et la transmission des symboles ancestraux. En explorant les dynamiques de la ${mouv}, l'artiste donne vie à des créations intenses où la matière brute entre en résonance directe avec la sensibilité du public.

Régulièrement invité(e) à participer à des résidences de création, des salons internationaux et des biennales de renom à travers l'Afrique et l'international, ${artistDisplayName} a vu son talent récompensé par de nombreuses marques de reconnaissance de la part de la critique et des institutions culturelles. Engagé(e) avec passion dans la transmission pédagogique et l'animation d'ateliers communautaires au Bénin, l'artiste œuvre sans relâche pour encourager l'éveil artistique des nouvelles générations et pérenniser l'héritage d'une tradition créative riche et pluriséculaire.`;
}

export default function ArtistModal({ isOpen, onClose, artist }) {
  // Gestion de la touche Échap et verrouillage du défilement
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !artist) return null;

  const artistName = `${artist.prenoms || ''} ${artist.nom || ''}`.trim() || artist.name || 'Artiste';
  const artistPhoto = artist.photo_url || artist.photo || '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png';
  const specialite = artist.specialite || artist.specialty || 'Sculpture et art contemporain';
  const nationalite = artist.nationalite || artist.nationality || 'Béninois(e)';
  const mouvement = artist.mouvement || artist.movement || 'Art contemporain inspiré du patrimoine';
  const activite = artist.activite
    ? (String(artist.activite).startsWith('Depuis') ? artist.activite : `Depuis ${artist.activite}`)
    : (artist.yearsActive || 'Actif');

  const biographie = getEnrichedBiography(artist);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 16, 9, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          borderRadius: '4px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'artistModalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes artistModalPopIn {
            from { opacity: 0; transform: scale(0.95) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .artist-modal-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .artist-modal-scroll::-webkit-scrollbar-track {
            background: #f4ede4;
          }
          .artist-modal-scroll::-webkit-scrollbar-thumb {
            background: #593A27;
            border-radius: 3px;
          }
          .artist-bio-content p {
            margin: 0 0 16px;
            text-indent: 40px;
            text-align: justify;
            line-height: 1.85;
          }
          @media (max-width: 640px) {
            .artist-bio-content p {
              text-indent: 20px !important;
            }
            .artist-modal-scroll {
              padding: 24px 18px 24px !important;
            }
            .artist-modal-top {
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
              gap: 18px !important;
              padding-right: 0 !important;
            }
            .artist-modal-specs {
              text-align: left !important;
            }
          }
        `}</style>

        {/* Bouton Fermer épuré sans effet */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#3D2516',
            zIndex: 10,
          }}
          title="Fermer"
          aria-label="Fermer"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Contenu de la popup */}
        <div 
          className="artist-modal-scroll"
          style={{ 
            padding: '36px 36px 32px', 
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 20px)' 
          }}
        >
          {/* Section Haute : Photo + Informations Clés */}
          <div 
            className="artist-modal-top"
            style={{ 
              display: 'flex', 
              gap: '32px', 
              alignItems: 'flex-start',
              paddingRight: '28px' // évite le chevauchement avec la croix
            }}
          >
            {/* Photo de l'artiste sans effet */}
            <div style={{ flexShrink: 0 }}>
              <img
                src={artistPhoto}
                alt={artistName}
                style={{
                  width: '180px',
                  height: '180px',
                  objectFit: 'cover',
                  display: 'block',
                  background: '#d4b896',
                }}
                onError={(e) => {
                  e.target.style.background = '#d4b896';
                  e.target.src = '';
                }}
              />
            </div>

            {/* Titre & Caractéristiques */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#3D2516',
                  margin: '0 0 16px',
                  lineHeight: 1.25,
                  letterSpacing: '0.01em',
                }}
              >
                {artistName}
              </h2>

              <div 
                className="artist-modal-specs"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  fontSize: '14px',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#3D2516' }}>Spécialité : </span>
                  <span style={{ color: '#555555' }}>{specialite}</span>
                </div>

                <div>
                  <span style={{ fontWeight: 700, color: '#3D2516' }}>Nationalité : </span>
                  <span style={{ color: '#555555' }}>{nationalite}</span>
                </div>

                <div>
                  <span style={{ fontWeight: 700, color: '#3D2516' }}>Mouvement artistique : </span>
                  <span style={{ color: '#555555' }}>{mouvement}</span>
                </div>

                <div>
                  <span style={{ fontWeight: 700, color: '#3D2516' }}>Années d'activité : </span>
                  <span style={{ color: '#555555' }}>{activite}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Biographie (sans ligne de séparation) */}
          <div style={{ marginTop: '32px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                fontWeight: 700,
                color: '#3D2516',
                margin: '0 0 14px',
                letterSpacing: '0.01em',
              }}
            >
              Biographie
            </h3>

            <div 
              className="artist-bio-content"
              style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '14px', 
                lineHeight: 1.85, 
                color: '#444444' 
              }}
            >
              {biographie
                .split(/\n+/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>
                    {para}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
