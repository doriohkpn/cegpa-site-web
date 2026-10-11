// src/services/api.js - Service d'intégration API RESTful PHP & Synchronisation Local/Remote

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const DATA_VERSION = 'cegpa_v6_clean_two_official';

// Purge automatique et synchronisation immédiate des 2 expositions officielles CeGPA
if (typeof window !== 'undefined' && window.localStorage) {
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
}

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
    // Reset cache if old data version detected
    if (typeof window !== 'undefined' && localStorage.getItem('cegpa_data_version') !== DATA_VERSION) {
      localStorage.removeItem('cegpa_expositions');
      localStorage.removeItem('cegpa_current_expo');
      localStorage.setItem('cegpa_data_version', DATA_VERSION);
    }
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

export const ARTISTES_JEUNESSE = [
  {
    id: 1,
    prenoms: 'Amina',
    nom: 'DOSSA',
    first_name: 'Amina',
    last_name: 'DOSSA',
    name: 'Amina DOSSA',
    specialite: "Peinture à l'huile, pigments minéraux et feuille d'or sur toile",
    specialty: "Peinture à l'huile, pigments minéraux et feuille d'or sur toile",
    profession: 'Artiste Peintre',
    nationalite: 'Béninoise',
    nationality: 'Béninoise',
    mouvement: 'Figuration contemporaine & Portraitisme néo-luministe',
    movement: 'Figuration contemporaine & Portraitisme néo-luministe',
    activite: '2014',
    yearsActive: 'Depuis 2014',
    photo_url: '/src/assets/images/amina_dossa.jpg',
    photo: '/src/assets/images/amina_dossa.jpg',
    bio: `Née à Cotonou en 1989, Amina Dossa est une artiste peintre béninoise diplômée avec les félicitations du jury de l'École Nationale Supérieure d'Art et de Design de Porto-Novo en 2014. Après avoir enrichi sa pratique lors de résidences de création à Abidjan, Dakar et Casablanca, elle s'est imposée comme une voix majeure du renouveau du portrait contemporain ouest-africain. Sa démarche picturale se concentre sur l'exploration de l'intériorité, de l'estime de soi et du rayonnement émotionnel des jeunes citadins. Développant une approche singulière qu'elle qualifie de « figuration luministe », Amina Dossa marie une pâte à l'huile généreuse, travaillée au couteau et à la brosse large, avec l'application délicate de feuilles d'or pur et d'ocres minéraux traditionnels. Cette technique confère à ses sujets une aura bienveillante et solennelle, évoquant les codes de l'iconographie sacrée pour élever les visages ordinaires de la jeunesse au rang d'icônes de dignité et de résilience. Engagée dans la transmission pédagogique, elle anime régulièrement des ateliers d'émancipation artistique destinés aux jeunes femmes dans les quartiers populaires. Ses créations ont été présentées lors de prestigieuses manifestations internationales, notamment à la Biennale Dak'Art de Dakar, au Salon International d'Art Contemporain de Marrakech et lors de salons d'art contemporain à Paris et Bruxelles.`,
    biographie: `Née à Cotonou en 1989, Amina Dossa est une artiste peintre béninoise diplômée avec les félicitations du jury de l'École Nationale Supérieure d'Art et de Design de Porto-Novo en 2014. Après avoir enrichi sa pratique lors de résidences de création à Abidjan, Dakar et Casablanca, elle s'est imposée comme une voix majeure du renouveau du portrait contemporain ouest-africain. Sa démarche picturale se concentre sur l'exploration de l'intériorité, de l'estime de soi et du rayonnement émotionnel des jeunes citadins. Développant une approche singulière qu'elle qualifie de « figuration luministe », Amina Dossa marie une pâte à l'huile généreuse, travaillée au couteau et à la brosse large, avec l'application délicate de feuilles d'or pur et d'ocres minéraux traditionnels. Cette technique confère à ses sujets une aura bienveillante et solennelle, évoquant les codes de l'iconographie sacrée pour élever les visages ordinaires de la jeunesse au rang d'icônes de dignité et de résilience. Engagée dans la transmission pédagogique, elle anime régulièrement des ateliers d'émancipation artistique destinés aux jeunes femmes dans les quartiers populaires. Ses créations ont été présentées lors de prestigieuses manifestations internationales, notamment à la Biennale Dak'Art de Dakar, au Salon International d'Art Contemporain de Marrakech et lors de salons d'art contemporain à Paris et Bruxelles.`
  },
  {
    id: 2,
    prenoms: 'Sèdjro',
    nom: 'ADANHO',
    first_name: 'Sèdjro',
    last_name: 'ADANHO',
    name: 'Sèdjro ADANHO',
    specialite: "Acrylique, liants végétaux et pigments d'argile sur lin",
    specialty: "Acrylique, liants végétaux et pigments d'argile sur lin",
    profession: 'Artiste Peintre & Plasticien',
    nationalite: 'Béninois',
    nationality: 'Béninois',
    mouvement: 'Symbolisme spirituel & Figuration mémorielle',
    movement: 'Symbolisme spirituel & Figuration mémorielle',
    activite: '2013',
    yearsActive: 'Depuis 2013',
    photo_url: '/src/assets/images/sedjro_adanho.jpg',
    photo: '/src/assets/images/sedjro_adanho.jpg',
    bio: `Né à Ouidah en 1987, Sèdjro Adanho est un peintre et plasticien béninois issu d'une lignée d'artisans d'art et de dignitaires traditionnels du littoral béninois. Formé à l'Institut des Métiers d'Art d'Abomey-Calavi puis au cours d'ateliers de compagnonnage auprès des grands maîtres de la peinture d'Afrique de l'Ouest, il a développé un langage visuel profondément habité par la spiritualité, la philosophie vodun et la symbolique de l'alliance communautaire. Son travail interroge la place des valeurs morales et du respect des anciens au cœur d'une société en voie de métropolisation accélérée. Sèdjro Adanho élabore lui-même une grande partie de ses pigments à partir de terres rouges concassées, d'argiles de berges fluviales, de liants végétaux et de cendres rituelles, créant des textures brutes d'une profondeur organique incomparable. Ses compositions sobres et hiératiques mettent souvent en scène des gestes sacrificiels, des mains ouvertes ou des objets cultuels tenus avec gravité, soulignant que le progrès moderne ne saurait s'accomplir sans la bénédiction et la conscience de la mémoire ancestrale. Lauréat du Prix Découverte des Rencontres d'Art Contemporain de Cotonou en 2017, ses œuvres ont fait l'objet de plusieurs expositions personnelles remarquées au Bénin, au Nigéria, en Côte d'Ivoire ainsi qu'au Musée d'Art Africain Contemporain de Johannesburg.`,
    biographie: `Né à Ouidah en 1987, Sèdjro Adanho est un peintre et plasticien béninois issu d'une lignée d'artisans d'art et de dignitaires traditionnels du littoral béninois. Formé à l'Institut des Métiers d'Art d'Abomey-Calavi puis au cours d'ateliers de compagnonnage auprès des grands maîtres de la peinture d'Afrique de l'Ouest, il a développé un langage visuel profondément habité par la spiritualité, la philosophie vodun et la symbolique de l'alliance communautaire. Son travail interroge la place des valeurs morales et du respect des anciens au cœur d'une société en voie de métropolisation accélérée. Sèdjro Adanho élabore lui-même une grande partie de ses pigments à partir de terres rouges concassées, d'argiles de berges fluviales, de liants végétaux et de cendres rituelles, créant des textures brutes d'une profondeur organique incomparable. Ses compositions sobres et hiératiques mettent souvent en scène des gestes sacrificiels, des mains ouvertes ou des objets cultuels tenus avec gravité, soulignant que le progrès moderne ne saurait s'accomplir sans la bénédiction et la conscience de la mémoire ancestrale. Lauréat du Prix Découverte des Rencontres d'Art Contemporain de Cotonou en 2017, ses œuvres ont fait l'objet de plusieurs expositions personnelles remarquées au Bénin, au Nigéria, en Côte d'Ivoire ainsi qu'au Musée d'Art Africain Contemporain de Johannesburg.`
  },
  {
    id: 3,
    prenoms: 'Naïma',
    nom: 'SOGLO',
    first_name: 'Naïma',
    last_name: 'SOGLO',
    name: 'Naïma SOGLO',
    specialite: "Huile sur toile grand format, couteau et glacis lumineux",
    specialty: "Huile sur toile grand format, couteau et glacis lumineux",
    profession: 'Artiste Peintre',
    nationalite: 'Béninoise',
    nationality: 'Béninoise',
    mouvement: 'Néo-impressionnisme urbain & Chronique sociale',
    movement: 'Néo-impressionnisme urbain & Chronique sociale',
    activite: '2016',
    yearsActive: 'Depuis 2016',
    photo_url: '/src/assets/images/naima_soglo.jpg',
    photo: '/src/assets/images/naima_soglo.jpg',
    bio: `Née à Parakou en 1991, Naïma Soglo a d'abord mené un double cursus en sociologie urbaine et en arts appliqués à l'Université de Parakou et à Lomé, avant de se consacrer exclusivement à la peinture de chevalet dès 2016. Passionnée par la respiration vivante et le dynamisme économique des grandes agglomérations d'Afrique de l'Ouest, elle a fait des marchés populaires — notamment Dantokpa à Cotonou et les carrefours marchands de Parakou — son atelier à ciel ouvert et sa source d'inspiration première. À travers un style néo-impressionniste affirmé, caractérisé par une touche vive, rythmée et une juxtaposition audacieuse de couleurs pures, Naïma Soglo capte l'énergie brute, la clameur des foules et la lumière zénithale qui inonde les rues d'Afrique subsaharienne. Ses toiles célèbrent avec force le courage et l'ingéniosité des femmes commerçantes et des jeunes marchands qui constituent le poumon vital de l'économie informelle. Refusant l'esthétisation passive de la précarité, son pinceau sublime au contraire l'ingéniosité, la joie de vivre et la solidarité spontanée qui émergent du tumulte quotidien. Présente dans de nombreuses collections privées en Afrique et en Europe, Naïma Soglo a participé à des expositions collectives majeures à Accra, Douala et Genève, s'affirmant comme l'une des observatrices les plus fines et chaleureuses de la vie urbaine africaine actuelle.`,
    biographie: `Née à Parakou en 1991, Naïma Soglo a d'abord mené un double cursus en sociologie urbaine et en arts appliqués à l'Université de Parakou et à Lomé, avant de se consacrer exclusivement à la peinture de chevalet dès 2016. Passionnée par la respiration vivante et le dynamisme économique des grandes agglomérations d'Afrique de l'Ouest, elle a fait des marchés populaires — notamment Dantokpa à Cotonou et les carrefours marchands de Parakou — son atelier à ciel ouvert et sa source d'inspiration première. À travers un style néo-impressionniste affirmé, caractérisé par une touche vive, rythmée et une juxtaposition audacieuse de couleurs pures, Naïma Soglo capte l'énergie brute, la clameur des foules et la lumière zénithale qui inonde les rues d'Afrique subsaharienne. Ses toiles célèbrent avec force le courage et l'ingéniosité des femmes commerçantes et des jeunes marchands qui constituent le poumon vital de l'économie informelle. Refusant l'esthétisation passive de la précarité, son pinceau sublime au contraire l'ingéniosité, la joie de vivre et la solidarité spontanée qui émergent du tumulte quotidien. Présente dans de nombreuses collections privées en Afrique et en Europe, Naïma Soglo a participé à des expositions collectives majeures à Accra, Douala et Genève, s'affirmant comme l'une des observatrices les plus fines et chaleureuses de la vie urbaine africaine actuelle.`
  },
  {
    id: 4,
    prenoms: 'Malik',
    nom: 'GBAGUIDI',
    first_name: 'Malik',
    last_name: 'GBAGUIDI',
    name: 'Malik GBAGUIDI',
    specialite: "Huile, couteau à peindre et techniques mixtes sur toile",
    specialty: "Huile, couteau à peindre et techniques mixtes sur toile",
    profession: 'Artiste Peintre et Musicien',
    nationalite: 'Béninois',
    nationality: 'Béninois',
    mouvement: 'Néo-expressionnisme musical & Art narratif',
    movement: 'Néo-expressionnisme musical & Art narratif',
    activite: '2014',
    yearsActive: 'Depuis 2014',
    photo_url: '/src/assets/images/malik_gbaguidi.jpg',
    photo: '/src/assets/images/malik_gbaguidi.jpg',
    bio: `Né à Abomey en 1988, Malik Gbaguidi est un artiste peintre et musicien ouest-africain qui explore avec ferveur les passerelles sensibles entre l'art pictural et les traditions musicales du continent. Élevé dans l'environnement sonore des cours royales et des cérémonies de tambours du Danxomè, il a appris la guitare acoustique parallèlement à sa pratique de la peinture sur toile lin et bois. Après des études aux Beaux-Arts et des résidences de création à Bamako et Praia, il développe une œuvre figurative vibrante dédiée à la figure du musicien urbain en tant qu'héritier direct des griots d'autrefois. Sa technique se distingue par un geste pictural ample et expressif, appliquant la couleur en couches denses au couteau pour donner une dimension quasi sculpturale à la vibration sonore. Les fonds enflammés d'or, d'orangé et de vermillon qui enveloppent ses musiciens matérialisent la résonance des accords et la chaleur de la parole chantée. Malik Gbaguidi conçoit son travail comme un plaidoyer pour la liberté d'expression de la jeunesse et la valorisation du patrimoine musical comme outil universel de rassemblement et de résistance poétique. Ses œuvres ont été présentées lors de festivals pluridisciplinaires et d'expositions à Lagos, Ouagadougou, Paris et Berlin, remportant le Prix Spécial du Jury lors de la Biennale des Jeunes Créateurs de l'UEMOA en 2019.`,
    biographie: `Né à Abomey en 1988, Malik Gbaguidi est un artiste peintre et musicien ouest-africain qui explore avec ferveur les passerelles sensibles entre l'art pictural et les traditions musicales du continent. Élevé dans l'environnement sonore des cours royales et des cérémonies de tambours du Danxomè, il a appris la guitare acoustique parallèlement à sa pratique de la peinture sur toile lin et bois. Après des études aux Beaux-Arts et des résidences de création à Bamako et Praia, il développe une œuvre figurative vibrante dédiée à la figure du musicien urbain en tant qu'héritier direct des griots d'autrefois. Sa technique se distingue par un geste pictural ample et expressif, appliquant la couleur en couches denses au couteau pour donner une dimension quasi sculpturale à la vibration sonore. Les fonds enflammés d'or, d'orangé et de vermillon qui enveloppent ses musiciens matérialisent la résonance des accords et la chaleur de la parole chantée. Malik Gbaguidi conçoit son travail comme un plaidoyer pour la liberté d'expression de la jeunesse et la valorisation du patrimoine musical comme outil universel de rassemblement et de résistance poétique. Ses œuvres ont été présentées lors de festivals pluridisciplinaires et d'expositions à Lagos, Ouagadougou, Paris et Berlin, remportant le Prix Spécial du Jury lors de la Biennale des Jeunes Créateurs de l'UEMOA en 2019.`
  }
];

export const ARTISTES_HERITAGE = [
  {
    id: 5,
    prenoms: 'Koffi',
    nom: 'MENSAH',
    first_name: 'Koffi',
    last_name: 'MENSAH',
    name: 'Koffi MENSAH',
    specialite: 'Peinture sur toile, Kanvo traditionnel et pigments minéraux',
    specialty: 'Peinture sur toile, Kanvo traditionnel et pigments minéraux',
    profession: 'Artiste Peintre',
    nationalite: 'Béninois',
    nationality: 'Béninois',
    mouvement: 'Figuration contemporaine & Mémoire ancestrale',
    movement: 'Figuration contemporaine & Mémoire ancestrale',
    activite: '2012',
    yearsActive: 'Depuis 2012',
    photo_url: '/src/assets/images/koffi_mensah.jpg',
    photo: '/src/assets/images/koffi_mensah.jpg',
    bio: `Né à Cotonou, Koffi Mensah est un peintre plasticien majeur de la scène artistique béninoise. Privilégiant l'utilisation de pigments naturels, d'indigo et de fragments de toiles traditionnelles Kanvo, il crée des portraits et compositions où résonnent la mémoire des aïeux et la vitalité des cités contemporaines. Ses œuvres ont été exposées à la Biennale de Dakar et dans des galeries de référence en Afrique de l'Ouest et en Europe.`,
    biographie: `Né à Cotonou, Koffi Mensah est un peintre plasticien majeur de la scène artistique béninoise. Privilégiant l'utilisation de pigments naturels, d'indigo et de fragments de toiles traditionnelles Kanvo, il crée des portraits et compositions où résonnent la mémoire des aïeux et la vitalité des cités contemporaines. Ses œuvres ont été exposées à la Biennale de Dakar et dans des galeries de référence en Afrique de l'Ouest et en Europe.`
  },
  {
    id: 6,
    prenoms: 'Ayaba',
    nom: 'ZINSOU',
    first_name: 'Ayaba',
    last_name: 'ZINSOU',
    name: 'Ayaba ZINSOU',
    specialite: "Sculpture sur bois d'ébène, bronze à la cire perdue et terre cuite",
    specialty: "Sculpture sur bois d'ébène, bronze à la cire perdue et terre cuite",
    profession: 'Sculptrice',
    nationalite: 'Béninoise',
    nationality: 'Béninoise',
    mouvement: 'Art sculptural contemporain et canons royaux',
    movement: 'Art sculptural contemporain et canons royaux',
    activite: '2015',
    yearsActive: 'Depuis 2015',
    photo_url: '/src/assets/images/ayaba_zinsou.jpg',
    photo: '/src/assets/images/ayaba_zinsou.jpg',
    bio: `Ayaba Zinsou s'impose comme une sculptrice incontournable, explorant la rencontre entre les canons sacrés de la statuaire du Danxomè et les lignes épurées du modernisme. Travaillant l'ébène massif et le bronze coulé à la cire perdue, elle donne naissance à des silhouettes totémiques et protectrices chargées d'une force tellurique saisissante.`,
    biographie: `Ayaba Zinsou s'impose comme une sculptrice incontournable, explorant la rencontre entre les canons sacrés de la statuaire du Danxomè et les lignes épurées du modernisme. Travaillant l'ébène massif et le bronze coulé à la cire perdue, elle donne naissance à des silhouettes totémiques et protectrices chargées d'une force tellurique saisissante.`
  }
];

export const INITIAL_ARTISTES = [...ARTISTES_JEUNESSE, ...ARTISTES_HERITAGE];

export const artistesAPI = {
  getAll: async () => {
    const res = await request('/artistes/index.php');
    if (res && res.success && Array.isArray(res.data)) return res.data.map(enrichArtistBio);

    const local = localStorage.getItem('cegpa_artistes');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length <= 6 && !parsed.some(a => (a.nom === 'HOUNKPATIN' || a.name === 'Aïcha HOUNKPATIN'))) {
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
const RESUME_JEUNESSE = `L'exposition « La Jeunesse Africaine dans la Société » propose une traversée sensible, réflexive et résolument contemporaine au cœur des réalités humaines et des dynamiques collectives qui façonnent les grandes métropoles africaines du XXIe siècle. Réunissant quatre artistes émergents majeurs — deux femmes et deux hommes aux démarches plastiques singulières mais profondément complémentaires —, cet événement artistique d'envergure met en lumière la voix, les aspirations et la vitalité inépuisable des nouvelles générations face aux mutations économiques, technologiques et sociétales en cours.

Loin de tout regard stéréotypé ou misérabiliste, le parcours d'exposition célèbre une jeunesse africaine consciente de ses responsabilités, fière de ses héritages et résolument tournée vers l'avenir. Sur un continent où plus de soixante pour cent de la population a moins de vingt-cinq ans, cette génération constitue le moteur vibrant d'une réinvention globale. À travers un ensemble de quatre toiles figuratives majeures spécialement conçues pour cet événement, l'exposition explore quatre piliers essentiels de l'expérience juvénile contemporaine : l'affirmation rayonnante de soi et l'estime collective portées par le portrait solaire d'Amina Dossa, l'ancrage spirituel et le devoir de transmission intergénérationnelle incarnés par Sèdjro Adanho, le dynamisme économique, la solidarité et l'effervescence des marchés populaires capturés par Naïma Soglo, et enfin la liberté d'expression, la poésie urbaine et l'engagement citoyen transmis par la musique acoustique chez Malik Gbaguidi.

L'agencement des toiles dans cet espace circulaire baigné d'une lumière zénithale favorise un dialogue plastique continu d'une œuvre à l'autre. La palette chromatique chaleureuse, dominée par les jaunes dorés éclatants, les ocres de terre cuite et les bleus d'indigo profonds, unifie visuellement la salle tout en respectant l'identité formelle et la facture picturale propre à chaque artiste. Les personnages représentés interpellent directement le spectateur par leur posture digne, leur intensité émotionnelle et leur regard franc : ils ne sont pas de simples témoins passifs du monde qui les entoure, mais les acteurs déterminés et les bâtisseurs d'une société africaine décomplexée, plurielle et solidaire.

Conçue dès son origine pour être vécue tant dans l'espace physique qu'à travers une visite virtuelle immersive à 360 degrés accessible à l'échelle planétaire, cette exposition offre aux visiteurs une rencontre privilégiée avec la jeune création d'Afrique de l'Ouest, transformant le musée en un carrefour vibrant d'émancipation, de fraternité et de rayonnement culturel international.`;

const RESUME_HERITAGE = `L'exposition « Héritage & Métamorphoses : Tradition et Modernité dans l'Art Africain » propose un dialogue plastique inédit entre deux artistes béninois majeurs aux démarches complémentaires : le peintre Koffi Mensah et la sculptrice Ayaba Zinsou. À travers un ensemble de peintures grand format et de sculptures contemporaines, le parcours interroge la place des mythes fondateurs, des spiritualités coutumières et des rites de passage face à l'accélération numérique et aux mutations métropolitaines du XXIe siècle.

Loin de toute nostalgie figée, Koffi Mensah puise dans les palettes d'indigo et d'ocre pour faire émerger des visages ancestraux au cœur de paysages urbains électriques, célébrant la résilience et la vitalité d'une jeunesse en perpétuel renouveau. En écho, Ayaba Zinsou sculpte l'ébène, le bronze à la cire perdue et la terre cuite pour faire surgir des sentinelles atemporelles, réinterprétant les canons royaux du Danxomè et les symboles sacrés dans une épure résolument moderniste.

Conçue comme une promenade immersive à 360°, cette exposition invite le visiteur à franchir le seuil d'un sanctuaire contemporain où la tradition ne constitue pas un passé révolu, mais le socle vibrant sur lequel s'invente le futur.`;

// Visites virtuelles officielles
export const EXTERNAL_VIRTUAL_TOURS = [
  'https://visite.art-africain-virtuel.bj/jeunesse-africaine/',
  'https://visite.art-africain-virtuel.bj/heritage-metamorphoses/'
];

const INITIAL_EXPOSITIONS = [
  {
    id: 1,
    numero: 1,
    title: 'La Jeunesse Africaine dans la Société',
    date_debut: '2026-10-15',
    date_cloture: '2027-01-15',
    date_range: 'du 15/10/2026 au 15/01/2027',
    description: "L'énergie, la résilience et la créativité vibrante de la jeunesse africaine contemporaine.",
    summary: RESUME_JEUNESSE,
    image_url: '/src/assets/images/expo_jeunesse_africaine.jpg',
    photo_exposition_url: '/src/assets/images/expo_jeunesse_africaine.jpg',
    banniere_url: '/src/assets/images/banniere_jeunesse_africaine.jpg',
    visite_virtuelle_id: 'https://visite.art-africain-virtuel.bj/jeunesse-africaine/',
    visite_url: 'https://visite.art-africain-virtuel.bj/jeunesse-africaine/',
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '15/10/2026',
    created_at: '2026-10-15T09:00:00.000Z',
    artistes: ARTISTES_JEUNESSE
  },
  {
    id: 2,
    numero: 2,
    title: 'Héritage & Métamorphoses',
    date_debut: '2026-10-15',
    date_cloture: '2027-01-15',
    date_range: 'du 15/10/2026 au 15/01/2027',
    description: "Une immersion sensorielle au croisement des mémoires ancestrales et du dynamisme urbain contemporain, réunissant la peinture vibrante de Koffi Mensah et les sculptures telluriques d'Ayaba Zinsou.",
    summary: RESUME_HERITAGE,
    image_url: '/src/assets/images/expo_heritage_metamorphoses.jpg',
    photo_exposition_url: '/src/assets/images/expo_heritage_metamorphoses.jpg',
    banniere_url: '/src/assets/images/banniere_heritage_metamorphoses.jpg',
    visite_virtuelle_id: 'https://visite.art-africain-virtuel.bj/heritage-metamorphoses/',
    visite_url: 'https://visite.art-africain-virtuel.bj/heritage-metamorphoses/',
    status: 'en_cours',
    in_active_list: true,
    is_public: true,
    submission_date: '15/10/2026',
    created_at: '2026-10-15T10:00:00.000Z',
    artistes: ARTISTES_HERITAGE
  }
];

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
    // Nettoyage immédiat du cache localStorage si ancienne version ou données obsolètes détectées
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentVersion = localStorage.getItem('cegpa_data_version');
      const rawExpos = localStorage.getItem('cegpa_expositions');
      let isLegacy = currentVersion !== DATA_VERSION;
      if (!isLegacy && rawExpos) {
        try {
          const parsed = JSON.parse(rawExpos);
          if (Array.isArray(parsed) && (parsed.length > 2 || parsed.some(e => e.title && (e.title.includes('Mémoire des Racines') || e.title.includes('Lumière des Ombres'))))) {
            isLegacy = true;
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
    }

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
        if (Array.isArray(parsed) && parsed.length <= 2 && !parsed.some(e => e.title && (e.title.includes('Mémoire des Racines') || e.title.includes('Lumière des Ombres')))) {
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
    // On charge les 2 expositions officielles comme point de départ
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
