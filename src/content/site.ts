export interface NavItem {
  readonly href: string;
  readonly label: string;
  /** libellé court (barre de navigation, mobile) */
  readonly short?: string;
  readonly hint: string;
}

/** Navigation principale : six entrées, dans l'ordre de lecture du site. */
export const navigation: readonly NavItem[] = [
  { href: "/", label: "Accueil", hint: "Le cabinet en un coup d'œil" },
  { href: "/osteopathe", label: "L'ostéopathe", hint: "Approche et parcours" },
  { href: "/motifs-de-consultation", label: "Pourquoi consulter ?", hint: "Les motifs de consultation" },
  { href: "/le-corps-en-mouvement", label: "Corps en mouvement", hint: "Explorateur anatomique 3D" },
  { href: "/cabinet", label: "Le cabinet", hint: "Les lieux et le matériel" },
  { href: "/rendez-vous", label: "Prendre rendez-vous", short: "Prendre RDV", hint: "Par téléphone" },
];

/** Pages complémentaires : regroupées sous les entrées principales, présentes dans le sitemap. */
export const secondaryPages: readonly NavItem[] = [
  { href: "/deroulement-consultation", label: "Déroulement d'une consultation", hint: "Quatre temps" },
  { href: "/equipements", label: "Le matériel du cabinet", hint: "Tables et équipements" },
  { href: "/contact", label: "Contact et accès", hint: "Adresse, plan, itinéraire" },
];

export interface ConsultationStep {
  readonly title: string;
  readonly summary: string;
  readonly detail: readonly string[];
}

export const consultationSteps: readonly ConsultationStep[] = [
  {
    title: "L'échange",
    summary: "Comprendre vos besoins, votre contexte et votre histoire.",
    detail: [
      "La consultation commence par une discussion : motif de la visite, apparition de la gêne, activités, sommeil, antécédents médicaux et chirurgicaux, traitements en cours.",
      "Pensez à apporter vos éventuels comptes rendus d'examens et ordonnances. Ces informations permettent aussi de repérer les situations qui relèvent d'abord d'un avis médical.",
    ],
  },
  {
    title: "L'évaluation",
    summary: "Un examen général, dans le respect des compétences de l'ostéopathe.",
    detail: [
      "Observation de la posture, tests de mobilité et palpation des régions concernées et de celles qui leur sont liées.",
      "Chaque test est expliqué. Vous pouvez poser vos questions ou demander une pause à tout moment.",
    ],
  },
  {
    title: "La prise en charge",
    summary: "Une approche manuelle adaptée, lorsqu'elle est indiquée.",
    detail: [
      "Selon l'évaluation, le praticien propose des techniques manuelles adaptées à votre âge, votre condition et votre tolérance. Elles sont décrites avant d'être réalisées et ne sont pratiquées qu'avec votre accord.",
      "Si vos symptômes nécessitent un diagnostic ou un traitement médical, l'ostéopathe vous oriente vers un médecin.",
    ],
  },
  {
    title: "Les conseils",
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
