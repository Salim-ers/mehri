import type { RegionId } from "@/content/anatomy";
import { confirmed, type Fact } from "@/lib/facts";

/**
 * Motifs de consultation — rédaction pédagogique et prudente.
 * Aucune promesse de guérison ni de résultat. La liste doit être validée
 * par le praticien (voir `motifsValidation`).
 */
export interface Motif {
  readonly slug: string;
  readonly number: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly region: RegionId;
  readonly metaDescription: string;
  readonly lede: string;
  readonly context: readonly string[];
  readonly situations: readonly string[];
  readonly session: readonly string[];
  readonly caution: readonly string[];
  /** fiche qui suppose un public pris en charge (practice.publics doit le confirmer) */
  readonly dependsOnPublics?: boolean;
}

/** Motifs et rédaction : « Validé » dans le questionnaire du praticien du 06/11/2026. */
export const motifsValidation: Fact<boolean> = confirmed(true);

export const motifs: readonly Motif[] = [
  {
    slug: "dos-et-lombalgies",
    number: "01",
    title: "Inconfort du dos et lombalgies",
    shortTitle: "Dos & lombaires",
    region: "colonne",
    metaDescription:
      "Inconfort du bas du dos et lombalgies communes : comment se déroule une consultation d'ostéopathie à Creil, et quand consulter d'abord un médecin.",
    lede: "Le bas du dos supporte une grande partie du poids du tronc. Raideur au réveil, gêne après une longue station assise ou après un effort inhabituel : ces inconforts sont fréquents.",
    context: [
      "La région lombaire relie le thorax au bassin. Elle est sollicitée par la posture, le port de charges, la sédentarité ou au contraire par des efforts répétés.",
      "La lombalgie dite « commune » est très répandue. La Haute Autorité de santé recommande notamment de rester actif autant que possible.",
    ],
    situations: [
      "Raideur ou gêne du bas du dos après une position prolongée",
      "Inconfort apparu après un effort, un déménagement, du jardinage",
      "Sensation de dos « bloqué » sans traumatisme",
    ],
    session: [
      "Échange sur l'histoire de la gêne, vos activités et vos antécédents.",
      "Observation de la posture et tests de mobilité de la colonne, du bassin et des hanches.",
      "Le cas échéant, techniques manuelles adaptées et conseils pour la vie quotidienne.",
    ],
    caution: [
      "Douleur après une chute ou un accident",
      "Fièvre, perte de poids inexpliquée ou douleur qui ne cède pas au repos ni la nuit",
      "Engourdissement, perte de force dans une jambe, troubles urinaires ou intestinaux : consultez un médecin sans attendre",
    ],
  },
  {
    slug: "tensions-cervicales",
    number: "02",
    title: "Tensions cervicales",
    shortTitle: "Nuque & cervicales",
    region: "cervicales",
    metaDescription:
      "Tensions de la nuque et des cervicales : informations sur la consultation d'ostéopathie à Creil, déroulement et précautions.",
    lede: "Travail sur écran, conduite, sommeil inconfortable, stress : la nuque supporte le poids de la tête toute la journée et traduit souvent nos postures.",
    context: [
      "Les sept vertèbres cervicales offrent une grande mobilité. Les muscles de la nuque et des épaules travaillent en permanence pour stabiliser la tête.",
      "Conformément à la réglementation, les manipulations du rachis cervical ne peuvent être réalisées par un ostéopathe non médecin qu'après un diagnostic médical attestant l'absence de contre-indication.",
    ],
    situations: [
      "Raideur de la nuque au réveil",
      "Gêne en fin de journée après un travail prolongé sur écran",
      "Sensation de tension entre les omoplates et la base du crâne",
    ],
    session: [
      "Échange sur vos habitudes de travail, de sommeil et sur l'apparition de la gêne.",
      "Évaluation de la mobilité de la nuque, des épaules et du haut du dos.",
      "Approche manuelle adaptée et conseils d'ergonomie, dans le respect du cadre réglementaire.",
    ],
    caution: [
      "Traumatisme récent (accident de la route, chute)",
      "Maux de tête inhabituels et intenses, troubles de la vision, vertiges, difficultés à parler",
      "Douleur associée à de la fièvre ou à une raideur importante : consultez un médecin en urgence",
    ],
  },
  {
    slug: "inconfort-des-epaules",
    number: "03",
    title: "Inconfort des épaules",
    shortTitle: "Épaules",
    region: "epaules",
    metaDescription:
      "Inconfort et raideur des épaules : consultation d'ostéopathie à Creil, déroulement, précautions et orientation médicale.",
    lede: "L'épaule est l'articulation la plus mobile du corps. Cette liberté la rend aussi sensible aux gestes répétés, aux postures et aux efforts en hauteur.",
    context: [
      "Le mouvement de l'épaule implique l'humérus, l'omoplate, la clavicule et le thorax. Une gêne peut donc concerner plusieurs structures à la fois.",
    ],
    situations: [
      "Gêne pour lever le bras ou attraper un objet en hauteur",
      "Raideur après des gestes répétés, professionnels ou sportifs",
      "Inconfort de l'épaule associé à des tensions de la nuque",
    ],
    session: [
      "Échange sur les gestes concernés et sur votre activité.",
      "Évaluation de la mobilité de l'épaule, de l'omoplate, du thorax et des cervicales.",
      "Approche manuelle adaptée si elle est indiquée, et conseils.",
    ],
    caution: [
      "Chute sur l'épaule, déformation visible ou impossibilité de lever le bras",
      "Douleur de l'épaule gauche associée à une oppression thoracique ou un essoufflement : appelez le 15",
      "Douleur persistante la nuit ou fièvre",
    ],
  },
  {
    slug: "mobilite-articulaire",
    number: "04",
    title: "Mobilité articulaire",
    shortTitle: "Mobilité",
    region: "hanches",
    metaDescription:
      "Raideurs et mobilité articulaire (hanches, bassin, membres) : informations sur la consultation d'ostéopathie à Creil.",
    lede: "Se baisser, monter un escalier, enjamber, se relever : la mobilité de nos articulations conditionne les gestes les plus ordinaires.",
    context: [
      "L'ostéopathie s'intéresse à la mobilité des articulations et des tissus qui les entourent, en considérant la manière dont les différentes régions du corps fonctionnent ensemble.",
    ],
    situations: [
      "Sensation de raideur d'une hanche ou d'un genou",
      "Gêne fonctionnelle après une période d'inactivité",
      "Mouvement limité d'un côté par rapport à l'autre",
    ],
    session: [
      "Échange sur la gêne fonctionnelle et vos objectifs du quotidien.",
      "Tests de mobilité articulaire comparatifs.",
      "Le cas échéant, mobilisations et techniques manuelles adaptées.",
    ],
    caution: [
      "Articulation chaude, gonflée ou rouge",
      "Impossibilité de prendre appui sur la jambe",
      "Antécédent récent de prothèse ou de chirurgie : demandez l'avis de votre chirurgien",
    ],
  },
  {
    slug: "tensions-musculaires",
    number: "05",
    title: "Douleurs et tensions musculaires",
    shortTitle: "Tensions musculaires",
    region: "thorax",
    metaDescription:
      "Tensions musculaires du dos et du thorax : déroulement d'une consultation d'ostéopathie à Creil et précautions.",
    lede: "Tension entre les omoplates, sensation de raideur du haut du dos, gêne à la respiration profonde : les muscles du tronc réagissent à nos postures et à nos efforts.",
    context: [
      "Le haut du dos est relié aux côtes, au sternum et aux épaules. Les tensions de cette région accompagnent souvent les postures prolongées et la fatigue.",
    ],
    situations: [
      "Tensions dorsales en fin de journée",
      "Raideur après un effort physique inhabituel",
      "Sensation de gêne en tournant le buste",
    ],
    session: [
      "Échange sur l'apparition de la gêne et sur vos activités.",
      "Évaluation de la mobilité du thorax, de la colonne dorsale et des épaules.",
      "Approche manuelle adaptée et conseils de mobilité.",
    ],
    caution: [
      "Douleur thoracique, oppression, essoufflement ou malaise : appelez immédiatement le 15",
      "Douleur après un choc sur le thorax",
      "Fièvre ou toux associées à la douleur",
    ],
  },
  {
    slug: "consultation-de-sportifs",
    dependsOnPublics: true,
    number: "06",
    title: "Consultation de sportifs",
    shortTitle: "Sportifs",
    region: "genoux",
    metaDescription:
      "Ostéopathie et pratique sportive à Creil : déroulement de la consultation, place de l'ostéopathe et orientation médicale.",
    lede: "Course à pied, football, sports de combat, musculation : la pratique sportive sollicite fortement les articulations et les chaînes musculaires.",
    context: [
      "La consultation prend en compte votre discipline, votre volume d'entraînement et vos échéances. Elle ne remplace ni le suivi médical du sportif ni l'avis d'un médecin du sport.",
    ],
    situations: [
      "Gêne fonctionnelle apparue avec l'augmentation de l'entraînement",
      "Sensation de raideur après une compétition",
      "Souhait de faire le point sur sa mobilité",
    ],
    session: [
      "Échange sur votre pratique, vos gestes et votre calendrier sportif.",
      "Évaluation de la mobilité des régions sollicitées par votre discipline.",
      "Approche manuelle adaptée et conseils de reprise progressive.",
    ],
    caution: [
      "Traumatisme avec craquement, gonflement rapide ou impossibilité d'appui",
      "Suspicion d'entorse grave, de fracture ou de lésion musculaire importante : consultez un médecin",
      "Douleur qui s'aggrave à l'effort malgré le repos",
    ],
  },
  {
    slug: "accompagnement-selon-l-age",
    dependsOnPublics: true,
    number: "07",
    title: "Accompagnement adapté à différents âges",
    shortTitle: "Selon l'âge",
    region: "bassin",
    metaDescription:
      "Une consultation d'ostéopathie adaptée à l'âge et au contexte de chaque patient, au cabinet de Creil.",
    lede: "Les besoins d'un actif sédentaire, d'un sportif ou d'une personne plus âgée ne sont pas les mêmes. La consultation s'adapte à chaque contexte.",
    context: [
      "L'âge, les antécédents, l'activité et l'état de santé général orientent le choix des techniques. Les techniques sont toujours adaptées à la personne et à sa tolérance.",
    ],
    situations: [
      "Raideurs liées à la sédentarité",
      "Gêne fonctionnelle liée aux changements de rythme de vie",
      "Souhait de maintenir sa mobilité au quotidien",
    ],
    session: [
      "Échange approfondi sur vos antécédents et vos traitements en cours.",
      "Évaluation adaptée à votre âge et à votre condition.",
      "Techniques choisies en fonction de votre tolérance, conseils personnalisés.",
    ],
    caution: [
      "Ostéoporose connue, traitement anticoagulant ou antécédent de cancer : signalez-le dès la prise de rendez-vous",
      "Chute récente chez une personne âgée : un avis médical est indispensable",
      "Les publics pris en charge au cabinet sont précisés ci-dessous",
    ],
  },
  {
    slug: "osteopathie-structurelle",
    number: "08",
    title: "Ostéopathie structurelle",
    shortTitle: "Approche structurelle",
    region: "colonne",
    metaDescription:
      "Ostéopathie structurelle à Creil : principes de l'approche, déroulement et cadre réglementaire de la pratique.",
    lede: "L'ostéopathie structurelle s'intéresse en priorité aux articulations et à leur mobilité, à l'aide de techniques manuelles précises.",
    context: [
      "Cette approche repose sur l'évaluation de la mobilité articulaire puis, lorsque c'est indiqué, sur des mobilisations ou des manipulations articulaires.",
      "En France, l'ostéopathe intervient sur les troubles fonctionnels. Il oriente vers un médecin lorsque les symptômes nécessitent un diagnostic ou un traitement médical (décret n° 2007-435).",
    ],
    situations: [
      "Gêne fonctionnelle articulaire de la colonne ou des membres",
      "Raideurs localisées",
      "Souhait d'une approche manuelle articulaire",
    ],
    session: [
      "Échange et recherche d'éventuelles contre-indications.",
      "Tests de mobilité articulaire précis.",
      "Techniques choisies avec vous, expliquées avant d'être réalisées, et toujours avec votre accord.",
    ],
    caution: [
      "Certaines techniques ne sont pas adaptées en cas d'ostéoporose, de traitement anticoagulant ou de certaines pathologies : signalez vos antécédents",
      "Vous pouvez à tout moment demander une approche plus douce ou refuser une technique",
    ],
  },
];

export function getMotif(slug: string): Motif | undefined {
  return motifs.find((m) => m.slug === slug);
}
