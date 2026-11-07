/** Types de transition de page (voir globals.css › Transitions de page). */
export type PageTransition = "to-anatomy" | "to-cabinet" | "to-reading";

export interface NavItem {
  readonly href: string;
  readonly label: string;
  /** libellé court (barre de navigation, mobile) */
  readonly short?: string;
  readonly hint: string;
  /** transition jouée en arrivant sur la page */
  readonly transition?: PageTransition;
  /** vignette du menu plein écran (photographie du cabinet ou cliché sous licence) */
  readonly visual?: { readonly src: string; readonly tone: "photo" | "xray" };
}

/** Navigation principale : six entrées, dans l'ordre de lecture du site (ordre figé par un test). */
export const navigation: readonly NavItem[] = [
  { href: "/", label: "Accueil", hint: "Le cabinet en un coup d'œil", visual: { src: "/images/salle-consultation.jpg", tone: "photo" } },
  { href: "/osteopathe", label: "Ostéopathe", hint: "Approche et cadre de pratique", visual: { src: "/images/bureau-modeles-anatomiques.jpg", tone: "photo" } },
  { href: "/motifs-de-consultation", label: "Motifs", hint: "Pourquoi consulter ?", visual: { src: "/images/anatomie/radiographie-rachis-lombaire.jpg", tone: "xray" } },
  { href: "/anatomie", label: "Anatomie", hint: "Squelette 3D et radiographies", transition: "to-anatomy", visual: { src: "/images/anatomie/radiographie-rachis-cervical.jpg", tone: "xray" } },
  { href: "/cabinet", label: "Cabinet", hint: "Les lieux et le matériel", transition: "to-cabinet", visual: { src: "/images/salle-tables-specialisees.jpg", tone: "photo" } },
  { href: "/conseils", label: "Conseils", hint: "Préparer votre rendez-vous", transition: "to-reading", visual: { src: "/images/bureau-modeles-anatomiques.jpg", tone: "photo" } },
];

/** Prise de rendez-vous : toujours visible (bouton « Prendre RDV »), hors des six entrées. */
export const bookingPage: NavItem = { href: "/rendez-vous", label: "Prendre rendez-vous", short: "Prendre RDV", hint: "Par téléphone" };

/** Pages complémentaires : menu et pied de page, présentes dans le sitemap. */
export const secondaryPages: readonly NavItem[] = [
  bookingPage,
  { href: "/equipements", label: "Le matériel du cabinet", hint: "Tables et équipements" },
  { href: "/contact", label: "Contact et accès", hint: "Adresse, plan, itinéraire" },
];

/** Anciennes adresses conservées par redirection permanente (next.config.ts). */
export const legacyRedirects: readonly { readonly source: string; readonly destination: string }[] = [
  { source: "/le-corps-en-mouvement", destination: "/anatomie" },
  { source: "/deroulement-consultation", destination: "/conseils" },
];

export interface ConsultationStep {
  readonly title: string;
  readonly summary: string;
  readonly detail: readonly string[];
}

export const consultationSteps: readonly ConsultationStep[] = [
  {
    title: "Premier échange",
    summary: "Comprendre vos besoins, votre contexte et votre histoire.",
    detail: [
      "La consultation commence par une discussion : motif de la visite, apparition de la gêne, activités, sommeil, antécédents médicaux et chirurgicaux, traitements en cours.",
      "Pensez à apporter vos éventuels comptes rendus d'examens et ordonnances. Ces informations permettent aussi de repérer les situations qui relèvent d'abord d'un avis médical.",
    ],
  },
  {
    title: "Évaluation",
    summary: "Un examen général, dans le respect des compétences de l'ostéopathe.",
    detail: [
      "Observation de la posture, tests de mobilité et palpation des régions concernées et de celles qui leur sont liées.",
      "Chaque test est expliqué. Vous pouvez poser vos questions ou demander une pause à tout moment.",
    ],
  },
  {
    title: "Prise en charge éventuelle",
    summary: "Une approche manuelle adaptée, lorsqu'elle est indiquée.",
    detail: [
      "Selon l'évaluation, le praticien propose des techniques manuelles adaptées à votre âge, votre condition et votre tolérance. Elles sont décrites avant d'être réalisées et ne sont pratiquées qu'avec votre accord.",
      "Si vos symptômes nécessitent un diagnostic ou un traitement médical, l'ostéopathe vous oriente vers un médecin.",
    ],
  },
  {
    title: "Conseils adaptés",
    summary: "Des repères pour la suite, à l'issue du rendez-vous.",
    detail: [
      "En fin de séance, le praticien vous donne des informations sur ce qui a été observé et des conseils adaptés : activité, postures, reprise progressive.",
      "Il vous indique également les signes qui doivent vous amener à consulter un médecin.",
    ],
  },
];

export const redFlags: readonly string[] = [
  "Douleur thoracique, oppression, essoufflement ou malaise",
  "Traumatisme récent : chute, accident, choc violent",
  "Fièvre associée à une douleur",
  "Perte de force, engourdissement ou fourmillements persistants d'un membre",
  "Troubles urinaires ou intestinaux apparus avec une douleur du dos",
  "Douleur nocturne persistante ou perte de poids inexpliquée",
  "Maux de tête brutaux et intenses, troubles de la vision ou de la parole",
];
