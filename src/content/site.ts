import { photos, type Photo } from "@/content/media";

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly plate: string;
  readonly hint: string;
  readonly primary?: boolean;
  /** libellé court pour la barre de navigation */
  readonly short?: string;
}

/** Navigation : chaque page est une « planche » de l'atlas. */
export const navigation: readonly NavItem[] = [
  { href: "/", label: "Accueil", plate: "0", hint: "L'art du mouvement" },
  { href: "/osteopathe", label: "Votre ostéopathe", plate: "I", hint: "Mohamed Merhi", primary: true, short: "L'ostéopathe" },
  { href: "/le-corps-en-mouvement", label: "Le corps en mouvement", plate: "II", hint: "Atlas anatomique 3D", primary: true, short: "Le corps en mouvement" },
  { href: "/motifs-de-consultation", label: "Motifs de consultation", plate: "III", hint: "Huit fiches pédagogiques", primary: true, short: "Motifs" },
  { href: "/cabinet", label: "Le cabinet", plate: "IV", hint: "Les espaces en images", primary: true, short: "Cabinet" },
  { href: "/equipements", label: "Équipements", plate: "V", hint: "Tables et matériel" },
  { href: "/deroulement-consultation", label: "Déroulement", plate: "VI", hint: "Une consultation en 4 temps" },
  { href: "/rendez-vous", label: "Prendre rendez-vous", plate: "VII", hint: "Réserver simplement" },
  { href: "/contact", label: "Contact & accès", plate: "VIII", hint: "Adresse, itinéraire", primary: true, short: "Contact" },
];

export interface ConsultationStep {
  readonly number: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: readonly string[];
  readonly photo: Photo;
  /** Segment vertébral symbolique associé à l'étape (fil narratif). */
  readonly segment: string;
}

export const consultationSteps: readonly ConsultationStep[] = [
  {
    number: "01",
    title: "L'échange",
    summary: "Comprendre vos besoins, votre contexte et votre histoire.",
    detail: [
      "La consultation commence par une discussion : motif de la visite, apparition de la gêne, activités, sommeil, antécédents médicaux et chirurgicaux, traitements en cours.",
      "Pensez à apporter vos éventuels comptes rendus d'examens et ordonnances. Ces informations permettent aussi de repérer les situations qui relèvent d'abord d'un avis médical.",
    ],
    photo: photos.desk,
    segment: "C1 — C7",
  },
  {
    number: "02",
    title: "L'évaluation",
    summary: "Un examen général, dans le respect des compétences de l'ostéopathe.",
    detail: [
      "Observation de la posture, tests de mobilité et palpation des régions concernées et de celles qui leur sont liées.",
      "Chaque test est expliqué. Vous pouvez poser vos questions ou demander une pause à tout moment.",
    ],
    photo: photos.shoulder,
    segment: "T1 — T12",
  },
  {
    number: "03",
    title: "La prise en charge",
    summary: "Une approche manuelle adaptée, lorsqu'elle est indiquée.",
    detail: [
      "Selon l'évaluation, le praticien propose des techniques manuelles adaptées à votre âge, votre condition et votre tolérance. Elles sont décrites avant d'être réalisées et ne sont pratiquées qu'avec votre accord.",
      "Si vos symptômes nécessitent un diagnostic ou un traitement médical, l'ostéopathe vous oriente vers un médecin.",
    ],
    photo: photos.cervical,
    segment: "L1 — L5",
  },
  {
    number: "04",
    title: "Les conseils",
    summary: "Des repères pour la suite, à l'issue du rendez-vous.",
    detail: [
      "En fin de séance, le praticien vous donne des informations sur ce qui a été observé et des conseils adaptés : activité, postures, reprise progressive.",
      "Il vous indique également les signes qui doivent vous amener à consulter un médecin.",
    ],
    photo: photos.office,
    segment: "Sacrum",
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
