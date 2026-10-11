// src/services/api.js - Service d'intégration API RESTful PHP & Synchronisation Local/Remote

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper Fetch générique avec gestion d'erreurs et jeton Admin
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('cegpa_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`API non disponible sur ${endpoint}, bascule sur le mode local/mock:`, error);
    return null;
  }
}

// ----------------------------------------------------
// 1. AUTHENTIFICATION ADMIN
// ----------------------------------------------------
export const authAPI = {
  login: async (username, password) => {
    const res = await request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res && res.success) {
      localStorage.setItem('cegpa_admin_token', res.data.token);
      localStorage.setItem('cegpa_admin_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user, message: res.message };
    }

    // Fallback mode démo
    if (username === 'admin' && password === 'admin123') {
      const mockUser = { id: 1, username: 'admin', role: 'admin', email: 'admin@cegpa.org' };
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('cegpa_admin_token', mockToken);
      localStorage.setItem('cegpa_admin_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser, message: 'Connexion réussie (mode démo).' };
    }

    return { success: false, message: res?.message || 'Nom d\'utilisateur ou mot de passe incorrect.' };
  },

  logout: () => {
    localStorage.removeItem('cegpa_admin_token');
    localStorage.removeItem('cegpa_admin_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('cegpa_admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('cegpa_admin_token');
  }
};

// ----------------------------------------------------
// 2. VISITES VIRTUELLES
// ----------------------------------------------------
const INITIAL_VISITES = [
  {
    id: 1,
    title: 'Espace d\'Exposition Principal CeGPA 3D',
    url: 'https://my.matterport.com/show/?m=sample1',
    embed_url: 'https://my.matterport.com/show/?m=sample1',
    description: 'Visite immersive à 360° du grand hall d\'exposition contemporaine.'
  },
  {
    id: 2,
    title: 'Pavillon des Sculptures et Bronzes',
    url: 'https://my.matterport.com/show/?m=sample2',
    embed_url: 'https://my.matterport.com/show/?m=sample2',
    description: 'Découvrez la collection permanente de bronzes et sculptures africaines.'
  }
];

export const visitesAPI = {
  getAll: async () => {
    const res = await request('/visites/index.php');
    if (res && res.success && Array.isArray(res.data)) return res.data;
    
    // Fallback local storage
    const local = localStorage.getItem('cegpa_visites');
    if (local) return JSON.parse(local);
    localStorage.setItem('cegpa_visites', JSON.stringify(INITIAL_VISITES));
    return INITIAL_VISITES;
  },

  create: async (visite) => {
    const res = await request('/visites/index.php', {
      method: 'POST',
      body: JSON.stringify(visite)
    });
    if (res && res.success) return res.data;

    // Fallback local
    const visites = await visitesAPI.getAll();
    const newVisite = { ...visite, id: Date.now() };
    const updated = [newVisite, ...visites];
    localStorage.setItem('cegpa_visites', JSON.stringify(updated));
    return newVisite;
  },

  update: async (visite) => {
    const res = await request('/visites/index.php', {
      method: 'PUT',
      body: JSON.stringify(visite)
    });
    if (res && res.success) return res.data;

    // Fallback local
    const visites = await visitesAPI.getAll();
    const updated = visites.map(v => v.id === visite.id ? { ...v, ...visite } : v);
    localStorage.setItem('cegpa_visites', JSON.stringify(updated));
    return visite;
  },

  delete: async (id) => {
    const res = await request(`/visites/index.php?id=${id}`, { method: 'DELETE' });
    if (res && res.success) return true;

    // Fallback local
    const visites = await visitesAPI.getAll();
    const updated = visites.filter(v => v.id !== id);
    localStorage.setItem('cegpa_visites', JSON.stringify(updated));
    return true;
  }
};

// ----------------------------------------------------
// 3. ARTISTES
// ----------------------------------------------------
// Biographies d'artistes enrichies (minimum 1500 caractères)
// ----------------------------------------------------
export const BIO_AICHA = `Née à Ouidah au cœur d'une lignée séculaire d'artisans fondeurs et de tisserands traditionnels, Aïcha Hounkpatin s'impose aujourd'hui comme l'une des figures majeures de la création contemporaine béninoise. Diplômée avec les honneurs de l'Institut National des Métiers d'Art, d'Archéologie et de la Culture (INMAAC) d'Abomey-Calavi, elle parfait ensuite son apprentissage auprès de maîtres sculpteurs à Porto-Novo ainsi qu'au cours de résidences de recherche plastique à Dakar, Bamako et Accra. Sa pratique pluridisciplinaire combine la sculpture sur bois d'iroko, le bronze patiné à la cire perdue, les fibres végétales tressées et les pigments d'ocre naturelle, créant un dialogue sensible et puissant entre l'héritage spirituel vodun et les préoccupations sociétales actuelles.

À travers ses installations immersives, l'artiste interroge la mémoire collective, la transmission des récits oraux et la préservation de la biodiversité culturelle africaine. Ses œuvres monumentales incarnent la force des divinités féminines, la résilience des générations passées et la quête d'un équilibre harmonieux entre l'humain et son écosystème sacré. Elle intègre fréquemment des éléments textiles patinés et des parchemins calligraphiés pour évoquer les archives vivantes du continent africain.

Régulièrement saluée par la critique internationale, Aïcha Hounkpatin a représenté le Bénin lors de la Biennale de Dakar et a exposé ses créations dans des institutions muséales de premier plan à Cotonou, Paris, Bruxelles et Casablanca. Lauréate de plusieurs bourses prestigieuses d'excellence artistique, elle consacre également une part essentielle de son engagement à l'animation d'ateliers de transmission destinés aux jeunes créatrices béninoises, affirmant ainsi sa volonté indéfectible d'ancrer la création dans le partage, l'émancipation et la pérennité du patrimoine ancestral.`;

export const BIO_ROBERT = `Artiste plasticien et sculpteur reconnu sur la scène internationale, Robert Zinsou développe depuis plus de quinze ans une œuvre monumentale à la croisée de l'abstraction contemporaine et de la statuaire classique du royaume du Danxomè. Formé initialement à l'École des Beaux-Arts d'Abidjan avant de poursuivre son parcours d'expérimentation plastique en Allemagne et au Sénégal, il explore avec rigueur les tensions matérielles entre le métal oxydé, le bois brûlé, la latérite rouge et les résines végétales. Son travail questionne avec acuité les traces indélébiles de l'histoire coloniale, la déportation des artefacts sacrés et la nécessaire réappropriation des symboles souverains par les artistes contemporains du continent africain.

Chaque création de Robert Zinsou se présente comme un monument mémoriel, où les géométries strictes rencontrent les aspérités de la matière brute. Ses sculptures totémiques, souvent érigées à échelle humaine ou monumentale, réinterprètent les récades royales, les attributs divinatoires du Fa et les armures guerrières des amazones d'Abomey, invitant le spectateur à une méditation profonde sur la souveraineté, le temps et la fierté retrouvée.

Distingué par le Prix de la Création Contemporaine Africaine et invité d'honneur de prestigieuses foires d'art contemporain à Marrakech, Londres, Bâle et Johannesburg, Robert Zinsou voit ses œuvres intégrer d'importantes collections publiques et privées à travers le monde. Membre actif de collectifs d'artistes engagés à Cotonou, il milite ardemment pour la fondation de musées d'art vivant en Afrique de l'Ouest et participe activement aux réflexions académiques sur la valorisation durable du patrimoine immatériel béninois.`;

export const BIO_COSSI = `Originaire d'Abomey, berceau historique d'une extraordinaire tradition sculpturale et métallurgique, Cossi Quenum s'est affirmé au fil des années comme un maître incontournable de la sculpture contemporaine sur métal et bois précieux. Issu d'un atelier familial d'artisans forgerons, il a très tôt appris à apprivoiser le feu, l'enclume et la fonte du fer avant d'enrichir ses compétences techniques aux Beaux-Arts de Kinshasa et au cours de multiples ateliers itinérants en Afrique de l'Est. Sa démarche artistique singulière repose sur une symbiose novatrice entre les techniques séculaires de la forge d'Ogun et les formes épurées de la sculpture monumentale mondiale.

L'univers de Cossi Quenum est profondément habité par les mythes fondateurs, les allégories des proverbes fon et la sacralité des éléments naturels. Par le martelage rythmé du fer de récupération, l'assemblage audacieux de rails centenaires et l'incrustation de feuilles de cuivre, il insuffle une âme vibrante à des silhouettes élancées évoquant des gardiens ancestraux, des musiciens traditionnels et des messagers spirituels. Ses compositions spatiales jouent subtilement avec la lumière naturelle et les ombres portées, offrant une expérience sensorielle saisissante qui transcende les époques.

Exposé régulièrement dans les galeries et biennales d'Afrique, d'Europe et d'Amérique du Nord, Cossi Quenum a été honoré de nombreuses distinctions artistiques pour sa contribution au rayonnement de l'artisanat d'art béninois. Passionné par l'écologie et l'économie circulaire, il a créé dans sa ville natale un centre d'apprentissage dédié aux métiers de la forge et du recyclage artistique, transmettant ainsi aux générations futures l'amour du geste juste et la fierté d'un héritage millénaire.`;

export function enrichArtistBio(art) {
  if (!art) return art;
  const currentBio = art.biographie || art.bio || '';
  if (currentBio.length >= 1500) {
    return { ...art, biographie: currentBio, bio: currentBio };
  }

  const name = `${art.prenoms || ''} ${art.nom || ''} ${art.name || ''}`.toLowerCase();
  const idStr = String(art.id || '').toLowerCase();

  let targetBio = BIO_AICHA;
  if (name.includes('robert') || name.includes('zinsou') || idStr.includes('2') || idStr.includes('zinsou')) {
    targetBio = BIO_ROBERT;
  } else if (name.includes('cossi') || name.includes('quenum') || idStr.includes('3') || idStr.includes('quenum')) {
    targetBio = BIO_COSSI;
  } else if (name.includes('aïcha') || name.includes('aicha') || name.includes('hounkpatin') || idStr.includes('1') || idStr.includes('hounkpatin')) {
    targetBio = BIO_AICHA;
  } else {
    const artistDisplayName = `${art.prenoms || ''} ${art.nom || ''}`.trim() || art.name || 'Cet artiste';
    const spec = art.specialite || art.specialty || 'arts plastiques et visuels';
    const mouv = art.mouvement || art.movement || 'création contemporaine inspirée des traditions ancestrales';

    targetBio = `${artistDisplayName} s'affirme comme une personnalité créative incontournable de la scène artistique béninoise et ouest-africaine, développant une pratique exigeante dédiée à la valorisation des patrimoines matériels et immatériels. Formé(e) auprès de maîtres émérites et au sein d'ateliers d'art reconnus sur le continent, l'artiste a su forger une signature visuelle singulière qui conjugue virtuosité technique, profondeur spirituelle et dialogue intergénérationnel. Sa discipline d'élection, axée principalement sur la ${spec}, s'inscrit au carrefour des savoirs séculaires et de la recherche plastique novatrice.

Au cœur de son cheminement esthétique, ${artistDisplayName} explore avec ferveur les liens étroits qui unissent la mémoire collective, les récits oraux du golfe de Guinée et les métamorphoses du monde contemporain. Ses œuvres traduisent une réflexion subtile sur la souveraineté culturelle, la préservation des écosystèmes et la transmission des symboles ancestraux. En explorant les dynamiques de la ${mouv}, l'artiste donne vie à des créations intenses où la matière brute entre en résonance directe avec la sensibilité du public.

Régulièrement invité(e) à participer à des résidences de création, des salons internationaux et des biennales de renom à travers l'Afrique et l'international, ${artistDisplayName} a vu son talent récompensé par de nombreuses marques de reconnaissance de la part de la critique et des institutions culturelles. Engagé(e) avec passion dans la transmission pédagogique et l'animation d'ateliers communautaires au Bénin, l'artiste œuvre sans relâche pour encourager l'éveil artistique des nouvelles générations et pérenniser l'héritage d'une tradition créative riche et pluriséculaire.`;
  }

  return {
    ...art,
    biographie: targetBio,
    bio: targetBio
  };
}

const INITIAL_ARTISTES = [
  {
    id: 1,
    prenoms: 'Aïcha',
    first_name: 'Aïcha',
    nom: 'Hounkpatin',
    last_name: 'Hounkpatin',
    name: 'Aïcha Hounkpatin',
    specialite: 'Sculpture',
    specialty: 'Sculpture, peinture et installations artistiques',
    profession: 'Sculpture',
    nationalite: 'Béninoise',
    nationality: 'Béninoise',
    mouvement: 'Sculpture',
    movement: 'Art contemporain inspiré du patrimoine culturel',
    activite: '2018',
    yearsActive: 'Depuis 2018',
    bio: BIO_AICHA,
    biographie: BIO_AICHA,
    photo_url: '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png',
    photo: '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png'
  },
  {
    id: 2,
    prenoms: 'Robert',
    first_name: 'Robert',
    nom: 'Zinsou',
    last_name: 'Zinsou',
    name: 'Robert Zinsou',
    specialite: 'Sculpture et art plastique',
    specialty: 'Sculpture et art plastique',
    profession: 'Sculpture et art plastique',
    nationalite: 'Béninois',
    nationality: 'Béninois',
    mouvement: 'Art contemporain africain',
    movement: 'Art contemporain africain',
    activite: '2010',
    yearsActive: 'Depuis 2010',
    bio: BIO_ROBERT,
    biographie: BIO_ROBERT,
    photo_url: '/src/assets/images/4deb2aaf05e81a4bedefb28fc6fbd3ef3c0f977a.png',
    photo: '/src/assets/images/4deb2aaf05e81a4bedefb28fc6fbd3ef3c0f977a.png'
  },
  {
    id: 3,
    prenoms: 'Cossi',
    first_name: 'Cossi',
    nom: 'Quenum',
    last_name: 'Quenum',
    name: 'Cossi Quenum',
    specialite: 'Sculpture',
    specialty: 'Sculpture',
    profession: 'Sculpture',
    nationalite: 'Béninois',
    nationality: 'Béninois',
    mouvement: 'Art contemporain',
    movement: 'Art contemporain',
    activite: '2015',
    yearsActive: 'Depuis 2015',
    bio: BIO_COSSI,
    biographie: BIO_COSSI,
    photo_url: '/src/assets/images/a7f258fc3065c0288d679d2da49a3aefc7971594.png',
    photo: '/src/assets/images/a7f258fc3065c0288d679d2da49a3aefc7971594.png'
  }
];

export const artistesAPI = {
  getAll: async () => {
    const res = await request('/artistes/index.php');
    if (res && res.success && Array.isArray(res.data)) return res.data.map(enrichArtistBio);

    const local = localStorage.getItem('cegpa_artistes');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const updated = parsed.map(enrichArtistBio);
          localStorage.setItem('cegpa_artistes', JSON.stringify(updated));
          return updated;
        }
      } catch (e) {
        console.warn('Erreur lecture localStorage artistes:', e);
      }
    }
    localStorage.setItem('cegpa_artistes', JSON.stringify(INITIAL_ARTISTES));
    return INITIAL_ARTISTES;
  },

  create: async (artiste) => {
    const res = await request('/artistes/index.php', {
      method: 'POST',
      body: JSON.stringify(artiste)
    });
    if (res && res.success) return res.data;

    const list = await artistesAPI.getAll();
    const newArtiste = { ...artiste, id: Date.now() };
    const updated = [newArtiste, ...list];
    localStorage.setItem('cegpa_artistes', JSON.stringify(updated));
    return newArtiste;
  },

  update: async (artiste) => {
    const res = await request('/artistes/index.php', {
      method: 'PUT',
      body: JSON.stringify(artiste)
    });
    if (res && res.success) return res.data;

    const list = await artistesAPI.getAll();
    const updated = list.map(a => a.id === artiste.id ? { ...a, ...artiste } : a);
    localStorage.setItem('cegpa_artistes', JSON.stringify(updated));
    return artiste;
  },

  delete: async (id) => {
    const res = await request(`/artistes/index.php?id=${id}`, { method: 'DELETE' });
    if (res && res.success) return true;

    const list = await artistesAPI.getAll();
    const updated = list.filter(a => a.id !== id);
    localStorage.setItem('cegpa_artistes', JSON.stringify(updated));
    return true;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch(`${API_BASE_URL}/artistes/upload.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data && data.success) return data.data.url;
    } catch (e) {
      console.warn('Upload API non disponible, conversion en DataURL local:', e);
    }

    // Fallback convert to DataURL for previewing
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
};

// ----------------------------------------------------
// 4. EXPOSITIONS
// ----------------------------------------------------
const RESUME_TEXT = `Il est cinq heures du matin, et la ville n'est encore qu'une rumeur souterraine. Dans la pénombre, une lueur bleutée danse sur le plafond, reflet d'un écran resté allumé par négligence ou par nécessité. C'est dans cette demi-lumière que commence notre histoire – non pas une histoire au sens romanesque du terme, avec des héros et des rebondissements, mais l'histoire d'un monde qui s'ignore, d'une humanité branchée à ses propres fantasmes, et d'un silence qui se raréfie comme l'eau douce sur une planète en fièvre.

L'empreinte dont il sera question ici n'est pas celle, carbonée, que les rapports du GIEC épinglent avec des courbes exponentielles. Elle est plus discrète, plus insidieuse : c'est l'empreinte laissée dans nos âmes par le flux continu d'images, de notifications, de promesses et de menaces qui défilent sous nos doigts. Chaque geste, chaque clic, chaque like est une petite marque sur le sable mouvant de notre attention. Et ce sable, aujourd'hui, ressemble de plus en plus à un désert.`;

// Liens vers des visites virtuelles réelles et prestigieuses d'art et musées africains
export const EXTERNAL_VIRTUAL_TOURS = [
  'https://artsandculture.google.com/story/explore-the-kingdom-of-dahomey/',
  'https://artsandculture.google.com/partner/fondation-zinsou',
  'https://artsandculture.google.com/partner/musee-du-quai-branly-jacques-chirac',
  'https://africa.si.edu/exhibitions/virtual-tours/',
  'https://artsandculture.google.com/partner/national-museum-of-african-art',
  'https://artsandculture.google.com/project/african-heritage',
  'https://artsandculture.google.com/story/vAWhbQJ10-5XLA',
  'https://artsandculture.google.com/exhibit/fQKy5_a8I9o7LQ',
  'https://artsandculture.google.com/pocketgallery/nAXxF6t9Fw-8Lg',
  'https://www.britishmuseum.org/collection/galleries/africa',
  'https://fondationzinsou.org',
  'https://my.matterport.com/show/?m=JGPnGdrfsgW'
];

const INITIAL_EXPOSITIONS = [
  {
    id: 1,
    title: 'Mémoire des Racines',
    date_debut: '2025-01-02',
    date_cloture: '2025-04-27',
    date_range: 'du 2025-01-02 au 2025-04-27',
    description: 'Quand le patrimoine raconte notre identité et nos origines.',
    summary: RESUME_TEXT,
    image_url: '/src/assets/images/bd8ff6d21ba4c8068f97ef3bb27473eaf474d4be.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T10:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 2,
    title: 'Lumière des Ombres',
    date_debut: '2025-01-15',
    date_cloture: '2025-05-10',
    date_range: 'du 2025-01-15 au 2025-05-10',
    description: 'Exploration des ombres et lumières du patrimoine spirituel béninois.',
    summary: "À travers un jeu subtil de contrastes et de clair-obscur, cette exposition invite à contempler les dimensions invisibles de l'art sacré. Les sculptures et peintures dialoguent avec l'espace pour révéler les mystères enfouis dans la mémoire collective.",
    image_url: '/src/assets/images/68d0ddd61744a1439c26310fe80c4c4f76b088b7.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T09:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 3,
    title: 'Échos Royaux du Danxomè',
    date_debut: '2025-02-01',
    date_cloture: '2025-06-30',
    date_range: 'du 2025-02-01 au 2025-06-30',
    description: 'Dialogue contemporain autour des symboles royaux et de la mémoire.',
    summary: "Les symboles des rois d'Abomey renaissent sous le pinceau et le ciseau d'artistes contemporains. Entre récades réinventées, trônes réinterprétés et bas-reliefs modernisés, une véritable passerelle historique se dessine.",
    image_url: '/src/assets/images/51e8eb7c0c9fa6b6fd3f0013da16d55d4ac75287.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T09:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 4,
    title: 'Souffle Ancestral',
    date_debut: '2025-02-15',
    date_cloture: '2025-07-15',
    date_range: 'du 2025-02-15 au 2025-07-15',
    description: 'Exploration tactile et visuelle de la matière et des textiles.',
    summary: "Le souffle des ancêtres habite la trame des tissus indigo, les fibres végétales et les matières brutes. Une immersion poétique au cœur des savoir-faire textiles préservés à travers les âges.",
    image_url: '/src/assets/images/d6477296531c9c7fbc3e76d658c0083d283041b9.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T08:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 5,
    title: 'Masques et Visions',
    date_debut: '2025-03-01',
    date_cloture: '2025-08-01',
    date_range: 'du 2025-03-01 au 2025-08-01',
    description: 'Rétrospective patrimoniale et contemporaine des masques sacrés.',
    summary: "Du Guèlèdè aux figures rituelles modernes, le masque n'est pas un simple déguisement mais le véhicule d'une force spirituelle agissante. Les créateurs explorent ici son impact sur la société actuelle.",
    image_url: '/src/assets/images/20ce0cc7282cf3cd3bf186505f4186749537e3a2.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T08:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 6,
    title: 'Rythmes et Matières',
    date_debut: '2025-03-10',
    date_cloture: '2025-08-15',
    date_range: 'du 2025-03-10 au 2025-08-15',
    description: 'Célébration des maîtres sculpteurs et plasticiens béninois.',
    summary: "Dans cette sélection éclectique, le fer forgé côtoie le bois d'ébène et la terre glaise pour exprimer les polyrythmies du quotidien et les transes cérémonielles.",
    image_url: '/src/assets/images/302e1086eda385e66cdef3fadffcbb5a528daae0.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T07:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 7,
    title: "Regards d'Abomey-Calavi",
    date_debut: '2025-03-20',
    date_cloture: '2025-08-25',
    date_range: 'du 2025-03-20 au 2025-08-25',
    description: 'Les nouvelles signatures visuelles de la scène universitaire et urbaine.',
    summary: "Née au carrefour du campus universitaire d'Abomey-Calavi et de l'effervescence urbaine, cette exposition offre une tribune audacieuse aux artistes émergents qui réinventent l'esthétique contemporaine.",
    image_url: '/src/assets/images/40539747a74e19f9b3ec995d78c4047588292882.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T07:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 8,
    title: "Terres d'Origine",
    date_debut: '2025-04-01',
    date_cloture: '2025-09-01',
    date_range: 'du 2025-04-01 au 2025-09-01',
    description: 'Une immersion dans les argiles, les pigments et les ocres du Sud Bénin.',
    summary: "La terre béninoise se révèle être bien plus qu'un sol : une matière vivante, imprégnée d'histoire et de croyances. Les artistes utilisent des pigments naturels pour célébrer la fertilité et l'enracinement.",
    image_url: '/src/assets/images/4ec00ffb2b716763dc9c474b8085b059e5e067cd.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T06:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 9,
    title: 'Trésors Retrouvés',
    date_debut: '2025-04-10',
    date_cloture: '2025-09-15',
    date_range: 'du 2025-04-10 au 2025-09-15',
    description: 'Réinterprétation sensible des objets rituels et des parures historiques.',
    summary: "Cette exposition rend hommage à la restitution et à la redécouverte des chefs-d'œuvre patrimoniaux. Elle questionne notre relation affective avec les artefacts d'autrefois à travers des créations hybrides.",
    image_url: '/src/assets/images/5458b2fe1e35b9f0c083e4a4429572ad4f9237cc.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T06:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 10,
    title: 'Harmonies du Vaudou',
    date_debut: '2025-04-20',
    date_cloture: '2025-09-30',
    date_range: 'du 2025-04-20 au 2025-09-30',
    description: 'Les divinités et la cosmogonie revisitées par la peinture abstraite.',
    summary: "Loin des clichés, le panthéon vaudou se déploie dans toute sa richesse philosophique et écologique. Les toiles traduisent l'équilibre entre les éléments : l'eau, le fer, le feu et la terre sacrée.",
    image_url: '/src/assets/images/570f378160cb745ecdc7bd2b83dd7684a0ad3c7f.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T05:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 11,
    title: 'Alchimie et Bronze',
    date_debut: '2025-05-01',
    date_cloture: '2025-10-01',
    date_range: 'du 2025-05-01 au 2025-10-01',
    description: "L'art séculaire de la fonte à la cire perdue face au design moderne.",
    summary: "Les fondeurs et sculpteurs dévoilent des pièces en bronze aux lignes à la fois antiques et futuristes. La fusion du métal devient le reflet des métamorphoses culturelles du continent.",
    image_url: '/src/assets/images/574c88a466c221b9f93740120c5fb7cced6c6d37.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T05:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 12,
    title: 'Passerelles Contemporaines',
    date_debut: '2025-05-15',
    date_cloture: '2025-10-15',
    date_range: 'du 2025-05-15 au 2025-10-15',
    description: "Connexions artistiques entre l'Afrique de l'Ouest et les diasporas.",
    summary: "Un voyage sensoriel reliant Cotonou, Salvador de Bahia et Port-au-Prince. Les œuvres explorent les résonances intimes et esthétiques qui transcendent les frontières océaniques.",
    image_url: '/src/assets/images/58b57c383f0b02a3d683662d319c6d2f6f8d226a.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T04:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 13,
    title: "L'Esprit des Tambours",
    date_debut: '2025-06-01',
    date_cloture: '2025-10-30',
    date_range: 'du 2025-06-01 au 2025-10-30',
    description: 'Quand le rythme musical se transcrit en mouvements picturaux vibrants.',
    summary: "Les battements des tambours royaux et des percussions cérémonielles se matérialisent en touches franches, arabesques dynamiques et projections d'encres lumineuses sur la toile.",
    image_url: '/src/assets/images/5d083b8a4282a06b58b68214c523eecec290b72e.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T04:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 14,
    title: 'Rites, Formes et Symboles',
    date_debut: '2025-06-15',
    date_cloture: '2025-11-15',
    date_range: 'du 2025-06-15 au 2025-11-15',
    description: 'Une étude stylistique des signes divinatoires et graphies sacrées.',
    summary: "Le langage secret du Fa et des pictogrammes traditionnels devient le canevas d'une écriture visuelle novatrice. Une immersion dans la géométrie sacrée et les codes ancestraux.",
    image_url: '/src/assets/images/7106ece972324d328ace5488084c8f001c0f4aa3.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T03:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 15,
    title: 'Couleurs de Ouidah',
    date_debut: '2025-07-01',
    date_cloture: '2025-11-30',
    date_range: 'du 2025-07-01 au 2025-11-30',
    description: "Vibrations atlantiques, mémoire de l'océan et poésie des rivages.",
    summary: "Ouidah la mémoire, Ouidah la spirituelle : des marines tourmentées aux scènes de rue baignées de soleil tropical, chaque œuvre capture l'atmosphère si singulière de cette cité mythique.",
    image_url: '/src/assets/images/78a9a7be54cb4bcf99acfd5560cbddde12d2fe6e.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T03:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 16,
    title: 'Géométries Sacrées',
    date_debut: '2025-07-15',
    date_cloture: '2025-12-10',
    date_range: 'du 2025-07-15 au 2025-12-10',
    description: "L'équilibre des lignes et des motifs géométriques dans l'art sculptural.",
    summary: "Dans la lignée des bas-reliefs des palais d'Abomey, les artistes contemporains décomposent les volumes et épurent les structures pour atteindre une harmonie visuelle captivante.",
    image_url: '/src/assets/images/86c6d94ac9e94debd09930d1619be874b3592a36.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T02:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 17,
    title: 'Les Gardiens de la Nuit',
    date_debut: '2025-08-01',
    date_cloture: '2025-12-20',
    date_range: 'du 2025-08-01 au 2025-12-20',
    description: 'Figures protectrices et créatures mythologiques de la nuit béninoise.',
    summary: "Les Zangbéto, veilleurs invincibles de la nuit, inspirent des installations lumineuses et des toiles monumentales qui interrogent les notions de sécurité, de justice et de foi populaire.",
    image_url: '/src/assets/images/87510062e3d1f7470b1e591fe54c62aae6050769.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T02:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 18,
    title: 'Transmission et Héritage',
    date_debut: '2025-08-15',
    date_cloture: '2025-12-31',
    date_range: 'du 2025-08-15 au 2025-12-31',
    description: "Rencontre intergénérationnelle entre maîtres d'art et jeunes talents.",
    summary: "Le flambeau artistique se transmet de main en main. Cette exposition réunit les figures historiques des arts plastiques béninois et leurs élèves les plus audacieux.",
    image_url: '/src/assets/images/8ab1b9fd4448470d75dca0a4e9ffaf0c06f83c49.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T01:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 19,
    title: 'Mémoires Vivantes',
    date_debut: '2025-09-01',
    date_cloture: '2026-01-15',
    date_range: 'du 2025-09-01 au 2026-01-15',
    description: 'Chroniques visuelles de la vie quotidienne et des rites communautaires.',
    summary: "Des marchés flottants de Ganvié aux cérémonies villageoises, les artistes saisissent la vitalité quotidienne du peuple béninois avec un réalisme empreint de tendresse et de respect.",
    image_url: '/src/assets/images/94c4c2b265cecc0f25dd6f77ffb07a3223b8c99a.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T01:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 20,
    title: "Éclats d'Argile",
    date_debut: '2025-09-15',
    date_cloture: '2026-01-30',
    date_range: 'du 2025-09-15 au 2026-01-30',
    description: "La céramique contemporaine comme médium de résistance et d'affirmation.",
    summary: "Poteries façonnées selon les techniques des potières de Sè, revisitées par des designers contemporains. L'argile cuite s'affranchit de l'utilitaire pour devenir pure sculpture méditative.",
    image_url: '/src/assets/images/9dbf4a38c3df96980b6bec3f394aa54241059a32.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T00:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 21,
    title: "L'Appel du Fleuve",
    date_debut: '2025-10-01',
    date_cloture: '2026-02-15',
    date_range: 'du 2025-10-01 au 2026-02-15',
    description: "Poésie liquide et installations inspirées des eaux sacrées de l'Ouémé.",
    summary: "L'eau comme miroir, source de purification et artère vitale du commerce ancestral. Les installations aquatiques et toiles mouvantes rendent grâce à la déesse Mami Wata.",
    image_url: '/src/assets/images/9edeb7dbbe3350eef73fadcd517539ec39b340a3.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-03T00:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 22,
    title: 'Lignes et Matières',
    date_debut: '2025-10-15',
    date_cloture: '2026-02-28',
    date_range: 'du 2025-10-15 au 2026-02-28',
    description: 'Recherches sur le bois fossile, le métal rouillé et le tissu indigo.',
    summary: "L'oxydation, les fibres effilochées et les patines naturelles dialoguent dans des bas-reliefs abstraits d'une puissance plastique remarquable. Une exploration de l'usure poétique du temps.",
    image_url: '/src/assets/images/b4f2f0e97a48debc0d4bfa13a719cc3318f3388a.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T23:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 23,
    title: "L'Ombre du Baobab",
    date_debut: '2025-11-01',
    date_cloture: '2026-03-15',
    date_range: 'du 2025-11-01 au 2026-03-15',
    description: "Rassemblements sous l'arbre tutélaire, contes et légendes illustrés.",
    summary: "Arbre de palabre et repère immuable des savanes béninoises, le baobab symbolise la force tranquille, la mémoire séculaire et la protection fraternelle des communautés.",
    image_url: '/src/assets/images/cb04c22b9f2df927c43e6c91f5e906a02a2f4ca3.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T23:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 24,
    title: 'Figures Mythiques',
    date_debut: '2025-11-15',
    date_cloture: '2026-03-30',
    date_range: 'du 2025-11-15 au 2026-03-30',
    description: "Portraits monumentaux des souverains et reines guerrières d'Abomey.",
    summary: "Les Amazones Mino et les grands rois bâtisseurs s'incarnent dans des portraits monumentaux où l'histoire rencontre la fierté contemporaine avec une intensité visuelle inégalée.",
    image_url: '/src/assets/images/cc49791ae99e58d6b3813ef6dbe6876998672eb0.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T22:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 25,
    title: 'Présences Royales',
    date_debut: '2025-12-01',
    date_cloture: '2026-04-15',
    date_range: 'du 2025-12-01 au 2026-04-15',
    description: "Insignes de pouvoir, récades et trônes sculptés sous un œil novateur.",
    summary: "Les attributs de majesté des cours traditionnelles du Bénin sont réinventés à travers le design contemporain, créant un dialogue saisissant entre tradition et avant-garde.",
    image_url: '/src/assets/images/d9b6d5cb043e0475638e98e83bec1342d0f7b004.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T22:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 26,
    title: 'Tissage de Légendes',
    date_debut: '2025-12-15',
    date_cloture: '2026-04-30',
    date_range: 'du 2025-12-15 au 2026-04-30',
    description: "L'art textile d'Abomey remis à l'honneur par des tapisseries contemporaines.",
    summary: "La technique ancestrale des tentures appliquées d'Abomey trouve ici un nouveau souffle. Les légendes fondatrices sont racontées fil à fil avec des palettes chromatiques audacieuses.",
    image_url: '/src/assets/images/da319f4c8f12a75ab5d11af2cc68699ccb90658f.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T21:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 27,
    title: 'Chants de Bronze',
    date_debut: '2026-01-05',
    date_cloture: '2026-05-15',
    date_range: 'du 2026-01-05 au 2026-05-15',
    description: "La matière métallique chantant l'histoire et l'épopée des bâtisseurs.",
    summary: "Des sculptures en alliage lourd, polies à la main, évoquant la solennité des palais antiques et la résonance des chants guerriers qui traversent les siècles.",
    image_url: '/src/assets/images/dd540e464f175782d4c1c176adf1b76368fc8818.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T21:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 28,
    title: 'Horizons Libres',
    date_debut: '2026-01-20',
    date_cloture: '2026-05-30',
    date_range: 'du 2026-01-20 au 2026-05-30',
    description: "Visions d'un futur radieux guidé par l'humanisme et la créativité panafricaine.",
    summary: "Portée par une jeunesse engagée, cette exposition propose des scénarios d'avenir où la technologie, l'art et les philosophies africaines s'unissent pour imaginer demain.",
    image_url: '/src/assets/images/edd8eb611b62bcb9137097cf8bd514e6eccbe255.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T20:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 29,
    title: 'Le Temps Suspendu',
    date_debut: '2026-02-01',
    date_cloture: '2026-06-15',
    date_range: 'du 2026-02-01 au 2026-06-15',
    description: 'Une expérience immersive où les œuvres invitent au calme et à la contemplation.',
    summary: "Dans le tumulte de notre époque hyperconnectée, cette exposition propose une parenthèse de sérénité absolue. Les toiles monochromes et sculptures minimalistes invitent à la respiration.",
    image_url: '/src/assets/images/ee0ce5f7198c775960df7e5813f41d739fb79300.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T20:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 30,
    title: 'Renaissance Contemporaine',
    date_debut: '2026-02-15',
    date_cloture: '2026-06-30',
    date_range: 'du 2026-02-15 au 2026-06-30',
    description: "Bilan artistique et perspectives vibrantes pour l'art plastique au Bénin.",
    summary: "Pour clore ce cycle d'expositions exceptionnel, le CeGPA réunit une constellation d'œuvres majeures affirmant la place incontournable de la scène artistique béninoise dans le monde.",
    image_url: '/src/assets/images/f1da921d6393e9a11442f88210e88e8bff8b5454.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '03/09/2025',
    created_at: '2025-09-02T19:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 31,
    title: "Échos du Danxomè : Amazones et Souverains",
    date_debut: '2026-03-01',
    date_cloture: '2026-07-15',
    date_range: 'du 2026-03-01 au 2026-07-15',
    description: "Hommage vibrant au courage des guerrières Agoodjié et à la royauté d'Abomey.",
    summary: "À travers des sculptures monumentales, des parures royales et des peintures d'inspiration historique, cette exposition célèbre la bravoure des Amazones du Danxomè et la grandeur des cours royales traditionnelles du Bénin.",
    image_url: '/src/assets/images/0163a50848aa071ee23d5a74a7f693bf5b07110d.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-10T10:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 32,
    title: "Terre de Fer : L'Art du Feu et d'Ogun",
    date_debut: '2026-03-10',
    date_cloture: '2026-07-20',
    date_range: 'du 2026-03-10 au 2026-07-20',
    description: "La forge traditionnelle revisitée par la sculpture contemporaine sur métal.",
    summary: "Le métal de récupération s'embrase sous les coups des forgerons d'art. En invoquant l'énergie d'Ogun, divinité de la forge et du fer, les artistes façonnent des pièces imposantes célébrant la résilience et la force ouvrière africaine.",
    image_url: '/src/assets/images/0667ff30e766b3ee88d6f865f0cd90b8467f36bc.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-10T11:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 33,
    title: "Symphonie Indigo : Tissages et Textures Sacrées",
    date_debut: '2026-03-15',
    date_cloture: '2026-08-01',
    date_range: 'du 2026-03-15 au 2026-08-01',
    description: "Le bleu profond de l'indigo végétal au service de la tapisserie contemporaine.",
    summary: "Une célébration des savoir-faire textiles d'Afrique de l'Ouest. Teintures artisanales à l'indigo, cotonnades tissées main et installations immersives s'accordent pour raconter la mémoire des fils et la poésie des matières organiques.",
    image_url: '/src/assets/images/09a233acf9505628f0f29059285a5feb31626355.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-11T09:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 34,
    title: "L'Arbre à Palabres : Mémoire et Oralité",
    date_debut: '2026-03-20',
    date_cloture: '2026-08-15',
    date_range: 'du 2026-03-20 au 2026-08-15',
    description: "L'art de la rencontre et de la parole partagée au pied du baobab séculaire.",
    summary: "Lieu sacré du dialogue communautaire et de la transmission intergénérationnelle, l'arbre à palabres devient ici le centre d'une scénographie immersive faite d'installations sonores, de bas-reliefs et de portraits sensibles.",
    image_url: '/src/assets/images/0dcee278bfc3c98f8ff22f6a638c4f369be04b27.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-11T14:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 35,
    title: "Trésors Restitués : Le Retour des Ancêtres",
    date_debut: '2026-04-01',
    date_cloture: '2026-08-30',
    date_range: 'du 2026-04-01 au 2026-08-30',
    description: "Le dialogue entre les œuvres royales rapatriées et les artistes vivants du Bénin.",
    summary: "À l'occasion de la restitution des trésors royaux d'Abomey, les créateurs actuels s'emparent de cet héritage pour composer des œuvres de gratitude, de réflexion politique et de renouveau esthétique affirmant la souveraineté africaine.",
    image_url: '/src/assets/images/114edecac06d5527ce5cbe72b7787a698a1ac4cc.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-12T10:15:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 36,
    title: "Regards du Nokoué : La Cité Lacustre Vivante",
    date_debut: '2026-04-10',
    date_cloture: '2026-09-05',
    date_range: 'du 2026-04-10 au 2026-09-05',
    description: "Ganvié et la lagune sous l'œil de photographes et de peintres paysagistes.",
    summary: "Reflets dorés sur l'eau, pirogues chargées de victuailles et habitations sur pilotis : cette rétrospective picturale et photographique révèle l'intimité poétique de la 'Venise de l'Afrique', entre fierté culturelle et défis écologiques.",
    image_url: '/src/assets/images/12e8f65185e6050a6fa91f8d314c5560a38e8f85.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-12T16:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 37,
    title: "Masques Guèlèdè : Hommage aux Mères Primordiales",
    date_debut: '2026-04-15',
    date_cloture: '2026-09-15',
    date_range: 'du 2026-04-15 au 2026-09-15',
    description: "La société des masques Yoruba réinventée par la sculpture et le costume contemporain.",
    summary: "Inscrit au patrimoine immatériel de l'UNESCO, le culte du Guèlèdè magnifie les pouvoirs mystiques et maternels. Les sculptures sur bois polychromes présentées oscillent entre facétie satirique, harmonie cosmique et spiritualité profonde.",
    image_url: '/src/assets/images/20ce0cc7282cf3cd3bf186505f4186749537e3a2.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-13T08:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 38,
    title: "Géométries Vodun : Couleurs et Spiritualités",
    date_debut: '2026-05-01',
    date_cloture: '2026-09-30',
    date_range: 'du 2026-05-01 au 2026-09-30',
    description: "Les symboles religieux traditionnels réinterprétés dans l'abstraction géométrique.",
    summary: "Loin des stéréotypes, cette exposition explore les signes visuels, pigments naturels et formes pures du panthéon Vodun. Des toiles de grands formats aux installations de miroirs, chaque œuvre invite à une contemplation sacrée.",
    image_url: '/src/assets/images/22d9560ab68fbf11657458ea19359dc98cf06939.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-13T13:45:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 39,
    title: "Rythmes de Terre Cuite : La Céramique Antique",
    date_debut: '2026-05-10',
    date_cloture: '2026-10-10',
    date_range: 'du 2026-05-10 au 2026-10-10',
    description: "Argile modelée et poteries cérémonielles issues du bassin du Mono.",
    summary: "L'argile extraite des rives fluviales du Bénin prend vie sous les doigts experts des céramistes. Entre jarres de conservation, statuettes votives et vases sculptés futuristes, le dialogue de la terre et du feu transcende le temps.",
    image_url: '/src/assets/images/230e80e368af81412db3d400c04b6ec16ea08afd.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-14T09:20:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 40,
    title: "Lumières Océanes : L'Estran et les Pêcheurs",
    date_debut: '2026-05-15',
    date_cloture: '2026-10-20',
    date_range: 'du 2026-05-15 au 2026-10-20',
    description: "Chroniques visuelles le long de la côte atlantique, de Grand-Popo à Ouidah.",
    summary: "La houle atlantique, les filets tirés à la force des bras sur le sable fin et la vie des communautés côtières inspirent une série de toiles marines lumineuses, d'aquarelles délicates et d'installations en bois flotté et cordages.",
    image_url: '/src/assets/images/302e1086eda385e66cdef3fadffcbb5a528daae0.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-14T15:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 41,
    title: "Signes du Fa : Cosmologie et Écritures Sacrées",
    date_debut: '2026-06-01',
    date_cloture: '2026-10-30',
    date_range: 'du 2026-06-01 au 2026-10-30',
    description: "Les 256 signes oraculaires du Fa transposés en calligraphies et gravures d'art.",
    summary: "Système de divination et trésor philosophique ouest-africain, le Fa déploie ses idéogrammes et ses paraboles à travers des gravures sur cuivre, des parchemins enluminés et des bas-reliefs bois d'une finesse graphique exceptionnelle.",
    image_url: '/src/assets/images/3622efc5ead9256802d4083f0953d5add3f066ff.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-15T11:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 42,
    title: "Le Souffle du Cuivre : Fondeurs de Cour",
    date_debut: '2026-06-10',
    date_cloture: '2026-11-10',
    date_range: 'du 2026-06-10 au 2026-11-10',
    description: "Statuaire en bronze et laiton à la cire perdue, héritage des cours royales.",
    summary: "Par la technique millénaire de la cire perdue, les fondeurs béninois capturent la noblesse des visages princiers, le dynamisme de la faune sauvage et la solennité des insignes rituels dans des bronzes chatoyants à la patine vénérable.",
    image_url: '/src/assets/images/40539747a74e19f9b3ec995d78c4047588292882.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-15T16:20:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 43,
    title: "Visions Futuristes : Métamorphoses d'Abidjan à Cotonou",
    date_debut: '2026-06-20',
    date_cloture: '2026-11-25',
    date_range: 'du 2026-06-20 au 2026-11-25',
    description: "L'urbanisme africain de demain raconté par la peinture numérique et le collage.",
    summary: "Mégalopoles effervescentes, énergies renouvelables et mobilités solaires : une génération montante de créateurs projette des utopies urbaines audacieuses alliant architecture vernaculaire et technologies d'avant-garde.",
    image_url: '/src/assets/images/4ec00ffb2b716763dc9c474b8085b059e5e067cd.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-16T10:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 44,
    title: "Récades Royales : Bâtons de Commandement et Pouvoir",
    date_debut: '2026-07-01',
    date_cloture: '2026-12-05',
    date_range: 'du 2026-07-01 au 2026-12-05',
    description: "Le makpo des rois du Danxomè, symbole d'autorité, d'éloquence et de justice.",
    summary: "Emblèmes souverains par excellence, les récades conjuguent la sculpture du bois, le placage de feuille d'or et les messages codés en rébus fon. Cette exposition dévoile leur signification historique et leur écho dans la création contemporaine.",
    image_url: '/src/assets/images/51e8eb7c0c9fa6b6fd3f0013da16d55d4ac75287.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-16T14:40:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 45,
    title: "La Danse des Couleurs : Peinture Naïve et Populaire",
    date_debut: '2026-07-10',
    date_cloture: '2026-12-15',
    date_range: 'du 2026-07-10 au 2026-12-15',
    description: "Scènes de marché, fêtes villageoises et ferveur collective en touches éclatantes.",
    summary: "Une explosion chromatique festive ! Des toiles naïves grand format célèbrent la liesse des marchés d'Adjarra et de Dantokpa, les mariages traditionnels et l'énergie débordante des enfants dans les ruelles ensoleillées.",
    image_url: '/src/assets/images/5458b2fe1e35b9f0c083e4a4429572ad4f9237cc.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-17T09:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 46,
    title: "Bois Sacré : Totems et Divinités Végétales",
    date_debut: '2026-07-20',
    date_cloture: '2026-12-28',
    date_range: 'du 2026-07-20 au 2026-12-28',
    description: "Sculptures sur iroko, ébène et teck consacrées aux esprits de la forêt.",
    summary: "Dans les sanctuaires forestiers du Sud-Bénin, chaque essence végétale abrite un souffle mystique. Les sculpteurs révèlent les visages cachés des troncs centenaires dans des totems élancés d'une grande puissance évocatrice.",
    image_url: '/src/assets/images/570f378160cb745ecdc7bd2b83dd7684a0ad3c7f.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-17T10:15:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 47,
    title: "Émancipation et Modernité : Les Pionnières de l'Art",
    date_debut: '2026-08-01',
    date_cloture: '2026-12-31',
    date_range: 'du 2026-08-01 au 2026-12-31',
    description: "Les artistes plasticiennes qui redéfinissent l'avant-garde en Afrique de l'Ouest.",
    summary: "Une mise en lumière éclatante des femmes peintres, céramistes, sculptrices et photographes du Bénin. Leurs œuvres audacieuses questionnent les assignations de genre, la maternité sacrée et les luttes d'émancipation contemporaines.",
    image_url: '/src/assets/images/574c88a466c221b9f93740120c5fb7cced6c6d37.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-17T11:30:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 48,
    title: "Horizons Sahéliens : Caravanes et Trajectoires",
    date_debut: '2026-08-10',
    date_cloture: '2027-01-15',
    date_range: 'du 2026-08-10 au 2027-01-15',
    description: "Les liens historiques et artistiques entre le nord du Bénin et les confins du Sahel.",
    summary: "Cuir repoussé de Djougou, bijoux d'argent peuls et tentes nomades tissées : l'exposition met en dialogue les cultures du Nord et du Sud, retraçant les routes séculaires des marchands et des bardes itinérants.",
    image_url: '/src/assets/images/58b57c383f0b02a3d683662d319c6d2f6f8d226a.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-17T12:00:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 49,
    title: "Mémoires Graphiques : L'Affiche et la Gravure d'Art",
    date_debut: '2026-08-20',
    date_cloture: '2027-01-30',
    date_range: 'du 2026-08-20 au 2027-01-30',
    description: "L'essor de la sérigraphie, de l'illustration et des affiches culturelles militantes.",
    summary: "Des années d'indépendance aux mouvements citoyens contemporains, l'affiche d'art béninoise témoigne des combats pour la liberté, la justice sociale et la fête populaire dans un festival de typographies et de gravures percutantes.",
    image_url: '/src/assets/images/5d083b8a4282a06b58b68214c523eecec290b72e.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-17T13:10:00.000Z',
    artistes: INITIAL_ARTISTES
  },
  {
    id: 50,
    title: "L'Or Noir et la Latérite : Matières en Fusion",
    date_debut: '2026-09-01',
    date_cloture: '2027-02-28',
    date_range: 'du 2026-09-01 au 2027-02-28',
    description: "Quand la terre rouge d'Afrique rencontre les pigments sombres et le basalte volcanique.",
    summary: "Une apothéose minérale pour célébrer le cinquantenaire des expositions du CeGPA. Les artistes marient la latérite rugueuse, le charbon de bois et la résine végétale pour produire des reliefs monumentaux d'une intensité tellurique inoubliable.",
    image_url: '/src/assets/images/7106ece972324d328ace5488084c8f001c0f4aa3.png',
    visite_virtuelle_id: 1,
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '17/09/2026',
    created_at: '2025-09-17T14:00:00.000Z',
    artistes: INITIAL_ARTISTES
  }
].map((expo, idx) => ({
  ...expo,
  numero: expo.id || (idx + 1),
  visite_virtuelle_id: EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length],
  visite_url: EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length]
}));

export function safeSetItem(key, value) {
  const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    localStorage.setItem(key, jsonStr);
    return true;
  } catch (err) {
    console.warn(`localStorage quota dépassé ou indisponible pour la clé "${key}":`, err);
    try {
      if (key === 'cegpa_expositions') {
        const raw = typeof value === 'string' ? JSON.parse(value) : value;
        if (Array.isArray(raw)) {
          // Si le quota est dépassé, alléger les images en data: base64 vers les visuels par défaut
          const sanitized = raw.map(e => ({
            ...e,
            image_url: (typeof e.image_url === 'string' && e.image_url.startsWith('data:image'))
              ? '/src/assets/images/20ce0cc7282cf3cd3bf186505f4186749537e3a2.png'
              : e.image_url,
            photo_exposition_url: (typeof e.photo_exposition_url === 'string' && e.photo_exposition_url.startsWith('data:image'))
              ? '/src/assets/images/75ee0d3aa3ba31381bcfc26951f868482f26eea9.png'
              : e.photo_exposition_url,
            artistes: Array.isArray(e.artistes) ? e.artistes.map(a => ({
              ...a,
              photo_url: (typeof a.photo_url === 'string' && a.photo_url.startsWith('data:image'))
                ? '/src/assets/images/10d1fadddb5f5bdc506b85a532d3b839cc53b17d.png'
                : a.photo_url
            })) : []
          }));
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        }
      }
    } catch (fallbackErr) {
      console.warn('safeSetItem fallback error:', fallbackErr);
    }
    return false;
  }
}

export const expositionsAPI = {
  getAll: async () => {
    try {
      const res = await request('/expositions/index.php');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data.map((expo, idx) => ({
          ...expo,
          numero: expo.numero || expo.id || (idx + 1),
          visite_virtuelle_id: (typeof expo.visite_virtuelle_id === 'string' && expo.visite_virtuelle_id.startsWith('http'))
            ? expo.visite_virtuelle_id
            : (expo.visite_url || EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length]),
          visite_url: (typeof expo.visite_url === 'string' && expo.visite_url.startsWith('http'))
            ? expo.visite_url
            : (typeof expo.visite_virtuelle_id === 'string' && expo.visite_virtuelle_id.startsWith('http')
                ? expo.visite_virtuelle_id
                : EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length]),
          artistes: Array.isArray(expo.artistes) && expo.artistes.length > 0
            ? expo.artistes.map(enrichArtistBio)
            : INITIAL_ARTISTES
        }));
      }
    } catch (err) {
      console.warn('getAll request error:', err);
    }

    const local = localStorage.getItem('cegpa_expositions');
    if (local !== null) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map((e, i) => ({
            ...e,
            numero: e.numero !== undefined ? e.numero : (typeof e.id === 'number' && e.id < 100000 ? e.id : (i + 1))
          }));
        }
      } catch (e) {
        console.warn('Erreur lecture localStorage expositions:', e);
      }
    }

    // Premier chargement si le localStorage n'existe pas du tout :
    // On charge les expositions initiales une seule fois comme point de départ
    const initialized = INITIAL_EXPOSITIONS.map((expo, idx) => ({
      ...expo,
      numero: expo.id || (idx + 1),
      visite_virtuelle_id: EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length],
      visite_url: EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length],
      artistes: Array.isArray(expo.artistes) && expo.artistes.length > 0
        ? expo.artistes.map(enrichArtistBio)
        : INITIAL_ARTISTES,
      in_active_list: true,
      is_deleted: false,
      is_public: true
    }));

    safeSetItem('cegpa_expositions', initialized);
    return initialized;
  },

  resetToDefault: () => {
    const initialized = INITIAL_EXPOSITIONS.map((expo, idx) => ({
      ...expo,
      numero: expo.id || (idx + 1),
      visite_virtuelle_id: EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length],
      visite_url: EXTERNAL_VIRTUAL_TOURS[idx % EXTERNAL_VIRTUAL_TOURS.length],
      artistes: Array.isArray(expo.artistes) && expo.artistes.length > 0
        ? expo.artistes.map(enrichArtistBio)
        : INITIAL_ARTISTES,
      in_active_list: true,
      is_deleted: false,
      is_public: true
    }));
    safeSetItem('cegpa_expositions', initialized);
    return initialized;
  },

  getPublic: async () => {
    try {
      const res = await request('/expositions/index.php?public=1');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data.filter(e => 
          (e.in_active_list === undefined || e.in_active_list == 1) && 
          !e.is_deleted && 
          (e.is_public === undefined || e.is_public == 1)
        );
      }
    } catch (err) {
      console.warn('getPublic request error:', err);
    }

    const all = await expositionsAPI.getAll();
    return all.filter(e => 
      (e.in_active_list === undefined || e.in_active_list === true || e.in_active_list == 1) && 
      !e.is_deleted && 
      (e.is_public === undefined || e.is_public === true || e.is_public == 1)
    );
  },

  create: async (expo) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const newExpoData = {
      ...expo,
      in_active_list: true,
      is_public: expo.is_public !== undefined ? expo.is_public : false,
      submission_date: expo.submission_date || formattedDate,
      created_at: expo.created_at || now.toISOString()
    };

    let res = null;
    try {
      res = await request('/expositions/index.php', {
        method: 'POST',
        body: JSON.stringify(newExpoData)
      });
    } catch (err) {
      console.warn('create request error:', err);
    }

    const list = await expositionsAPI.getAll();
    const maxNum = list.reduce((max, e) => {
      const n = typeof e.numero === 'number' ? e.numero : (typeof e.id === 'number' && e.id < 100000 ? e.id : 0);
      return Math.max(max, n);
    }, 0);
    const nextNum = maxNum > 0 ? maxNum + 1 : list.length + 1;

    let savedExpo = null;
    if (res && res.success && res.data) {
      savedExpo = { ...newExpoData, id: res.data.id || nextNum, numero: nextNum };
    } else {
      savedExpo = { ...newExpoData, id: nextNum, numero: nextNum };
    }

    const updated = [savedExpo, ...list.filter(e => String(e.id) !== String(savedExpo.id))];
    safeSetItem('cegpa_expositions', updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cegpa_expo_updated', { detail: { id: savedExpo.id } }));
    }

    return savedExpo;
  },

  update: async (expo) => {
    try {
      await request('/expositions/index.php', {
        method: 'PUT',
        body: JSON.stringify(expo)
      });
    } catch (err) {
      console.warn('update request error:', err);
    }

    const list = await expositionsAPI.getAll();
    const updated = list.map(e => String(e.id) === String(expo.id) ? { ...e, ...expo } : e);
    safeSetItem('cegpa_expositions', updated);

    try {
      const current = localStorage.getItem('cegpa_current_expo');
      if (current) {
        const parsed = JSON.parse(current);
        if (String(parsed.id) === String(expo.id) || (parsed.title && expo.title && parsed.title.toLowerCase() === expo.title.toLowerCase())) {
          localStorage.setItem('cegpa_current_expo', JSON.stringify({ ...parsed, ...expo }));
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cegpa_expo_updated', { detail: { id: expo.id } }));
    }

    return expo;
  },

  // Supprimer de la liste active (supprime du site public et du dashboard, conserve dans l'historique)
  removeFromList: async (id) => {
    try {
      await request(`/expositions/index.php?id=${id}&action=remove_from_list`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend removeFromList error:', err);
    }
    const list = await expositionsAPI.getAll();
    const updated = list.map(e => String(e.id) === String(id) ? { ...e, in_active_list: false, is_public: false, is_deleted: true } : e);
    safeSetItem('cegpa_expositions', updated);

    try {
      const current = localStorage.getItem('cegpa_current_expo');
      if (current) {
        const parsed = JSON.parse(current);
        if (String(parsed.id) === String(id)) {
          localStorage.setItem('cegpa_current_expo', JSON.stringify({ ...parsed, in_active_list: false, is_public: false, is_deleted: true }));
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cegpa_expo_updated', { detail: { id } }));
    }

    return true;
  },

  // Ajouter / Re-publier sur le site public (et réactiver dans la liste)
  addToPublic: async (id) => {
    try {
      await request('/expositions/index.php', {
        method: 'PUT',
        body: JSON.stringify({ id, toggle_action: 'add_to_public' })
      });
    } catch (err) {
      console.warn('Backend addToPublic error:', err);
    }

    const list = await expositionsAPI.getAll();
    const updated = list.map(e => String(e.id) === String(id) ? { ...e, in_active_list: true, is_public: true, is_deleted: false } : e);
    safeSetItem('cegpa_expositions', updated);

    try {
      const current = localStorage.getItem('cegpa_current_expo');
      if (current) {
        const parsed = JSON.parse(current);
        if (String(parsed.id) === String(id)) {
          localStorage.setItem('cegpa_current_expo', JSON.stringify({ ...parsed, in_active_list: true, is_public: true, is_deleted: false }));
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cegpa_expo_updated', { detail: { id } }));
    }

    return true;
  },

  // Basculer la visibilité publique (En ligne / Non publié)
  togglePublic: async (id, isPublic) => {
    try {
      await request('/expositions/index.php', {
        method: 'PUT',
        body: JSON.stringify({ id, toggle_action: 'toggle_public', is_public: isPublic ? 1 : 0 })
      });
    } catch (err) {
      console.warn('Backend togglePublic error:', err);
    }

    const list = await expositionsAPI.getAll();
    const updated = list.map(e => String(e.id) === String(id) ? { ...e, is_public: !!isPublic } : e);
    safeSetItem('cegpa_expositions', updated);

    try {
      const current = localStorage.getItem('cegpa_current_expo');
      if (current) {
        const parsed = JSON.parse(current);
        if (String(parsed.id) === String(id)) {
          localStorage.setItem('cegpa_current_expo', JSON.stringify({ ...parsed, is_public: !!isPublic }));
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cegpa_expo_updated', { detail: { id } }));
    }

    return true;
  },

  // Supprimer : retire du site public, des expositions au tableau de bord et de la liste des expositions,
  // seul l'historique conserve la trace de cette exposition
  delete: async (id) => {
    try {
      await request(`/expositions/index.php?id=${id}&action=remove_from_list`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete error:', err);
    }
    const list = await expositionsAPI.getAll();
    const updated = list.map(e => String(e.id) === String(id) ? {
      ...e,
      in_active_list: false,
      is_public: false,
      is_deleted: true,
      deleted_at: new Date().toISOString()
    } : e);
    safeSetItem('cegpa_expositions', updated);

    try {
      const current = localStorage.getItem('cegpa_current_expo');
      if (current) {
        const parsed = JSON.parse(current);
        if (String(parsed.id) === String(id)) {
          localStorage.setItem('cegpa_current_expo', JSON.stringify({ ...parsed, in_active_list: false, is_public: false, is_deleted: true }));
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cegpa_expo_updated', { detail: { id } }));
    }

    return true;
  }
};

// ----------------------------------------------------
// 5. MESSAGES DE CONTACT
// ----------------------------------------------------
const INITIAL_MESSAGES = [
  {
    id: 1,
    full_name: 'Jean-Paul Dupont',
    email: 'jp.dupont@example.com',
    subject: 'Demande de visite guidée',
    message: 'Bonjour, nous aimerions organiser une visite de groupe scolaire pour 25 élèves. Quelles sont les modalités ?',
    is_read: 0,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const contactAPI = {
  submit: async (contactData) => {
    // 1. Envoi direct de l'email vers kruzz1140@gmail.com via FormSubmit (HTTPS)
    try {
      await fetch('https://formsubmit.co/ajax/kruzz1140@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          'Nom et Prénom': contactData.full_name,
          'Email': contactData.email,
          'Téléphone': contactData.telephone || 'Non renseigné',
          'Sujet': contactData.subject || 'Contact depuis le site web',
          'Message': contactData.message,
          _subject: `[CeGPA Contact] Nouveau message de ${contactData.full_name} (${contactData.subject || 'Contact'})`,
          _template: 'table',
          _captcha: 'false'
        })
      });
    } catch (e) {
      console.warn('Tentative d\'envoi email direct:', e);
    }

    // 2. Envoi vers le serveur PHP / base de données MySQL si configuré
    const res = await request('/contact/index.php', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
    if (res && res.success) {
      return { success: true, message: res.message, data: res.data };
    }

    // 3. Sauvegarde locale (historique messages pour le tableau de bord admin)
    const list = JSON.parse(localStorage.getItem('cegpa_contact_messages') || JSON.stringify(INITIAL_MESSAGES));
    const newMsg = {
      id: Date.now(),
      ...contactData,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('cegpa_contact_messages', JSON.stringify([newMsg, ...list]));
    return {
      success: true,
      message: 'Votre message a bien été envoyé !',
      data: newMsg
    };
  },

  getAll: async () => {
    const res = await request('/contact/index.php');
    if (res && res.success && Array.isArray(res.data)) return res.data;

    const local = localStorage.getItem('cegpa_contact_messages');
    if (local) return JSON.parse(local);
    localStorage.setItem('cegpa_contact_messages', JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES;
  },

  toggleRead: async (id, isRead) => {
    const res = await request('/contact/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id, is_read: isRead ? 1 : 0 })
    });
    if (res && res.success) return true;

    const list = await contactAPI.getAll();
    const updated = list.map(m => m.id === id ? { ...m, is_read: isRead ? 1 : 0 } : m);
    localStorage.setItem('cegpa_contact_messages', JSON.stringify(updated));
    return true;
  },

  delete: async (id) => {
    const res = await request(`/contact/index.php?id=${id}`, { method: 'DELETE' });
    if (res && res.success) return true;

    const list = await contactAPI.getAll();
    const updated = list.filter(m => m.id !== id);
    localStorage.setItem('cegpa_contact_messages', JSON.stringify(updated));
    return true;
  }
};
