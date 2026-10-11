import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactModal from '../components/ContactModal';
import { contactInfo } from '../data';
import { contactAPI } from '../services/api';

const aboutImg = '/src/assets/images/Photo_Apropos.jpg';
const mapImg = '/src/assets/images/map_rectorat_uac.png';

const historyMilestones = [
  {
    num: '04',
    title: 'Cap sur la modernisation (2025–2030)',
    text: "Le CeGPA concrétise sa feuille de route avec la mise en ligne de sa plateforme, l'aménagement des réserves et le lancement de ses axes de recherche. Les prochaines étapes ciblent la numérisation complète des fonds, des expositions itinérantes et des hommages au Pr Brice Sinsin ainsi qu'au président Nicéphore Soglo.",
    isCurrent: true,
  },
  {
    num: '03',
    title: 'Le rayonnement par les partenariats',
    text: "Le centre s'est affirmé à travers des actions conjointes avec la Fondation Mastercard, le Festival VOOTOON et le programme jeunesse « Patrimoine 2.0 ». Il s'appuie également sur l'École du Patrimoine Africain, plusieurs ambassades et les ministères pour dynamiser ses projets et ses financements.",
    isCurrent: false,
  },
  {
    num: '02',
    title: "L’ouverture et l'engouement du public",
    text: "Grâce à ses deux salles modulables, le musée a dépassé le cap des 5 000 visiteurs. Sa programmation équilibre expositions temporaires, master-classes professionnelles, conférences et ateliers d'initiation artistique favorisant un dialogue direct avec les médiateurs culturels.",
    isCurrent: false,
  },
  {
    num: '01',
    title: 'La naissance d’une mémoire universitaire',
    text: "Fondé sous la tutelle du Rectorat de l'Université d’Abomey-Calavi, le CeGPA a été institué pour préserver la mémoire matérielle de l'institution. Dès son origine, il a formalisé un cadre scientifique dédié à l'inventaire, à la restauration, à l'étude et à l'enrichissement continu des collections universitaires.",
    isCurrent: false,
  },
];

export default function APropos() {
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', sujet: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    status: 'success',
    messageData: null,
    errorMessage: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        full_name: form.nom,
        email: form.email,
        subject: form.sujet || 'Contact depuis le site web',
        message: `${form.message}\n\nTéléphone: ${form.telephone}`,
        recipient: 'kruzz1140@gmail.com'
      };

      const res = await contactAPI.submit(payload);
      setModalConfig({
        isOpen: true,
        status: 'success',
        messageData: {
          full_name: form.nom,
          email: form.email,
          telephone: form.telephone,
          subject: form.sujet || 'Message de contact',
          recipient: 'kruzz1140@gmail.com'
        },
        errorMessage: '',
      });
      setForm({ nom: '', telephone: '', email: '', sujet: '', message: '' });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        status: 'success',
        messageData: {
          full_name: form.nom,
          email: form.email,
          telephone: form.telephone,
          subject: form.sujet || 'Message de contact',
          recipient: 'kruzz1140@gmail.com'
        },
        errorMessage: '',
      });
      setForm({ nom: '', telephone: '', email: '', sujet: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <style>
        {`
          .apropos-hero-img {
            float: right;
            width: 30%;
            max-width: 360px;
            margin-left: 36px;
            margin-bottom: 20px;
            object-fit: cover;
            display: block;
            border-radius: 2px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          }
          .apropos-contact-card {
            background: #3B3430;
            color: #ffffff;
            border-radius: 2px;
            padding: 48px 40px;
            box-sizing: border-box;
          }
          .apropos-contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "header form"
              "map    form";
            column-gap: 48px;
            row-gap: 28px;
            align-items: start;
          }
          .apropos-contact-header {
            grid-area: header;
          }
          .apropos-contact-map {
            grid-area: map;
          }
          .apropos-contact-form-col {
            grid-area: form;
          }

          @media (max-width: 880px) {
            .apropos-contact-grid {
              grid-template-columns: 1fr !important;
              grid-template-areas:
                "header"
                "form"
                "map" !important;
              gap: 28px !important;
            }
          }
          @media (max-width: 768px) {
            .apropos-hero-img {
              float: none !important;
              width: 100% !important;
              max-width: 100% !important;
              margin-left: 0 !important;
              margin-bottom: 24px !important;
              height: 240px;
            }
            .apropos-contact-card {
              padding: 28px 18px !important;
            }
            .apropos-text-content p,
            .apropos-contact-intro p {
              text-indent: 16px !important;
            }
          }

          /* ===== HISTORIQUE VERTICAL TIMELINE ===== */
          .history-section-wrapper {
            margin-top: 16px;
            margin-bottom: 64px;
          }
          .history-header {
            text-align: left;
            margin-bottom: 24px;
            padding-left: 24px;
          }
          .history-title {
            font-family: var(--font-heading);
            font-size: clamp(28px, 4vw, 36px);
            font-weight: 700;
            color: #3D2516;
            margin: 0;
            text-align: left;
          }
          .timeline-wrapper {
            width: 100%;
            max-width: 100%;
            position: relative;
            padding: 10px 0;
            box-sizing: border-box;
          }
          .timeline-item {
            display: grid;
            grid-template-columns: 24px 64px 1fr;
            column-gap: 28px;
            align-items: stretch;
            position: relative;
            padding: 0 24px;
            box-sizing: border-box;
          }
          .timeline-marker {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 24px;
            height: 100%;
          }
          .timeline-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #6E645A;
            margin-top: 8px;
            position: relative;
            z-index: 2;
            flex-shrink: 0;
          }
          .timeline-dot.active {
            width: 14px;
            height: 14px;
            background-color: #BA753F;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 0 2px #BA753F;
            margin-top: 6px;
          }
          .timeline-line {
            position: absolute;
            top: 13px;
            bottom: -13px;
            left: 11px;
            width: 2px;
            background-color: #C6BCB3;
            z-index: 1;
          }
          .timeline-num {
            font-family: var(--font-heading);
            font-size: 26px;
            font-weight: 700;
            color: #3D2516;
            line-height: 1.1;
            padding-top: 2px;
            letter-spacing: -0.5px;
          }
          .timeline-num.active {
            color: #BA753F;
          }
          .timeline-content {
            display: flex;
            flex-direction: column;
          }
          .timeline-title {
            font-family: var(--font-heading);
            font-size: 20px;
            font-weight: 700;
            color: #241D18;
            margin: 0 0 8px 0;
            line-height: 1.35;
          }
          .timeline-title.active {
            color: #BA753F;
          }
          .timeline-desc {
            font-family: var(--font-body);
            font-size: 15px;
            line-height: 1.75;
            color: #5C554E;
            margin: 0;
            padding-bottom: 34px;
          }
          .timeline-item:last-child .timeline-desc {
            padding-bottom: 8px;
          }
          @media (max-width: 768px) {
            .history-header {
              padding-left: 10px;
            }
            .timeline-item {
              grid-template-columns: 18px 46px 1fr;
              column-gap: 16px;
              padding: 0 10px;
            }
            .timeline-marker {
              width: 18px;
            }
            .timeline-line {
              left: 8px;
            }
            .timeline-num {
              font-size: 20px;
            }
            .timeline-title {
              font-size: 17px;
            }
            .timeline-desc {
              font-size: 14px;
              padding-bottom: 26px;
            }
          }
        `}
      </style>

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'A propos' }]} />

      {/* ===== SECTION 1: QUI SOMMES-NOUS ? ===== */}
      <div className="container" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(30px, 5vw, 44px)',
              fontWeight: 700,
              color: '#3D2516',
              marginBottom: '16px',
            }}
          >
            Qui sommes-nous ?
          </h1>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(20px, 3.2vw, 28px)',
              fontWeight: 600,
              color: '#3D2516',
              margin: 0,
            }}
          >
            Le Centre de Gestion du Patrimoine et des Arts
          </h2>
        </div>

        {/* Presentation layout */}
        <div style={{ overflow: 'hidden' }}>
          <img
            src={aboutImg}
            alt="CeGPA - À propos"
            className="apropos-hero-img"
            onError={(e) => { e.target.style.background = '#d4b896'; e.target.src = ''; }}
          />

          <div
            className="apropos-text-content"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: '#444444',
              lineHeight: 1.85,
              textAlign: 'justify',
            }}
          >
            <p style={{ marginBottom: '20px', textIndent: '40px' }}>
              Placé sous la tutelle de l'Université d’Abomey-Calavi (UAC), le Centre de Gestion du Patrimoine Muséal et des Arts (CeGPA-UAC) constitue un pôle stratégique dédié à la préservation, à la valorisation et au rayonnement des richesses artistiques, historiques et scientifiques universitaires. À la croisée de la tradition et de la modernité, l'institution a pour vocation première de sauvegarder la mémoire académique et culturelle tout en stimulant la recherche interdisciplinaire et la médiation auprès de la communauté.
            </p>

            <p style={{ marginBottom: '20px', textIndent: '40px' }}>
              Le centre structure ses missions autour de la gestion rigoureuse, de l'enrichissement continu et de la diffusion de ses collections. Ses équipes assurent l'inventaire minutieux, la conservation préventive, l'étude scientifique et la restauration des biens culturels publics et privés. En synergie étroite avec les laboratoires et les écoles doctorales, le CeGPA sert de plateforme pédagogique vivante pour la formation en muséographie, archéologie et histoire de l'art.
            </p>

            <p style={{ marginBottom: '20px', textIndent: '40px' }}>
              Espace de rencontre, d'apprentissage et de transmission, le musée du CeGPA dispose de deux salles polyvalentes et abrite une collection unique qui a déjà accueilli plus de 5 000 visiteurs. Sa programmation vivante alterne entre expositions temporaires et permanentes, ateliers de médiation destinés au jeune public, conférences, panels de réflexion et master-classes ouverts à tous les publics.
            </p>

            <p style={{ marginBottom: '20px', textIndent: '40px' }}>
              Pour renforcer son impact, le CeGPA développe des coopérations actives tant au niveau national qu'international. Il s'appuie sur des initiatives phares aux côtés de partenaires tels que la Fondation Mastercard, le festival VOOTOON et le programme Patrimoine 2.0, tout en maintenant un dialogue étroit avec l'École du Patrimoine Africain (EPA), les représentations diplomatiques et les institutions étatiques de premier plan.
            </p>

            <p style={{ marginBottom: '16px', textIndent: '40px' }}>
              Résolument tourné vers l'avenir, le CeGPA déploie un ambitieux plan stratégique à l'horizon 2030, axé sur la numérisation des collections, la production d'outils interactifs, la publication de catalogues raisonnés et l'organisation d'expositions majeures d'hommage à des figures emblématiques. En conjuguant savoirs traditionnels et innovations muséales, le centre œuvre chaque jour à transmettre ce patrimoine inestimable aux générations futures.
            </p>

            <div style={{ clear: 'both' }} />
          </div>
        </div>
      </div>

      {/* ===== SECTION 2: HISTORIQUE (VERTICAL TIMELINE STEPPER) ===== */}
      <div className="container history-section-wrapper">
        <div className="history-header">
          <h2 className="history-title">Historique</h2>
        </div>

        <div className="timeline-wrapper">
          {historyMilestones.map((item, idx) => (
            <div key={item.num} className="timeline-item">
              <div className="timeline-marker">
                <div className={`timeline-dot ${item.isCurrent ? 'active' : ''}`} />
                {idx < historyMilestones.length - 1 && <div className="timeline-line" />}
              </div>

              <div className={`timeline-num ${item.isCurrent ? 'active' : ''}`}>
                {item.num}
              </div>

              <div className="timeline-content">
                <h3 className={`timeline-title ${item.isCurrent ? 'active' : ''}`}>
                  {item.title}
                </h3>
                <p className="timeline-desc">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SECTION 3: CONTACTEZ-NOUS (DARK SECTION) ===== */}
      <div className="container">
        <div className="apropos-contact-card">
          <div className="apropos-contact-grid">
            {/* 1. Bloc En-tête de Contact : Titre, Paragraphe & Coordonnées */}
            <div className="apropos-contact-header">
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '16px',
                }}
              >
                Contactez-nous
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  textIndent: '40px',
                  textAlign: 'justify',
                }}
              >
                Vous souhaitez obtenir davantage d'informations, préparer votre visite ou collaborer avec le CeGPA ? Notre équipe est à votre disposition pour répondre à vos questions et vous accompagner dans vos démarches.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', fontFamily: 'var(--font-body)', margin: 0 }}>
                <div>
                  <strong>Téléphone : </strong>{contactInfo.phone}
                </div>
                <div>
                  <strong>Email : </strong>{contactInfo.email}
                </div>
                <div>
                  <strong>Adresse : </strong>{contactInfo.address}
                </div>
              </div>
            </div>

            {/* 2. Bloc Carte de localisation (Google Maps) : placé après le formulaire sur smartphone */}
            <div className="apropos-contact-map">
              <div
                style={{
                  borderRadius: '3px',
                  overflow: 'hidden',
                  height: '200px',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  background: '#2A2420',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                }}
              >
                <iframe
                  title="Localisation du Rectorat de l'Université d'Abomey-Calavi (UAC)"
                  src="https://maps.google.com/maps?q=Rectorat+de+l%27Universit%C3%A9+d%27Abomey-Calavi,+Abomey-Calavi,+B%C3%A9nin&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* 3. Bloc Formulaire */}
            <div className="apropos-contact-form-col">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '6px' }}>
                    Nom et Prénom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    placeholder="Nom et Prénom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      background: '#ffffff',
                      color: '#333333',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '6px' }}>
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    placeholder="Téléphone"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      background: '#ffffff',
                      color: '#333333',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '6px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      background: '#ffffff',
                      color: '#333333',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '6px' }}>
                    Sujet *
                  </label>
                  <select
                    name="sujet"
                    value={form.sujet}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      background: '#ffffff',
                      color: '#333333',
                    }}
                  >
                    <option value="">Dérouler la liste de réponses</option>
                    <option value="information">Demande d'information</option>
                    <option value="exposition">Exposition</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="visite">Visite guidée</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '6px' }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Message..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      background: '#ffffff',
                      color: '#333333',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-contact-submit"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation / Error Modal Popup */}
      <ContactModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        status={modalConfig.status}
        messageData={modalConfig.messageData}
        errorMessage={modalConfig.errorMessage}
      />
    </div>
  );
}
