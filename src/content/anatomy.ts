/**
 * Régions de la page « Anatomie » (sélection, mouvements, motifs associés).
 * Contenu pédagogique général — ni diagnostic, ni promesse de traitement.
 */
export const REGION_IDS = [
  "cervicales",
  "thorax",
  "lombaires",
  "bassin",
  "epaules",
  "hanches",
  "genoux",
] as const;

export type RegionId = (typeof REGION_IDS)[number];

export type MotionDemo = "spine-wave" | "neck-rotation" | "shoulder-abduction" | "breathing" | "pelvic-tilt" | "hip-flexion" | "knee-flexion";

export interface AnatomyRegion {
  readonly id: RegionId;
  readonly label: string;
  readonly summary: string;
  readonly body: readonly string[];
  readonly keyFacts: readonly { readonly label: string; readonly value: string }[];
  readonly movement: { readonly demo: MotionDemo; readonly caption: string };
  readonly motifSlug: string;
  /** Caméra : position et cible (repère du squelette, unités ≈ 1 = 25 cm). */
  readonly camera: { readonly position: readonly [number, number, number]; readonly target: readonly [number, number, number] };
}

export const anatomyRegions: readonly AnatomyRegion[] = [
  {
    id: "cervicales",
    label: "Cervicales et nuque",
    summary:
      "Sept vertèbres légères portent la tête et autorisent une grande amplitude de rotation, d'inclinaison et de flexion.",
    body: [
      "Les deux premières vertèbres ont une forme particulière : l'atlas (C1) soutient le crâne, l'axis (C2) porte une saillie verticale, la dent, autour de laquelle l'atlas pivote.",
      "Une part importante de la rotation de la tête se fait entre ces deux vertèbres, le reste étant réparti sur les étages cervicaux inférieurs.",
    ],
    keyFacts: [
      { label: "Vertèbres", value: "C1 → C7" },
      { label: "Pivot principal", value: "C1 – C2" },
    ],
    movement: {
      demo: "neck-rotation",
      caption: "Rotation de la tête : le mouvement débute entre l'atlas et l'axis puis se répartit vers le bas.",
    },
    motifSlug: "tensions-cervicales",
    camera: { position: [2.8, 8.9, -3.2], target: [0, 8.3, 0] },
  },
  {
    id: "thorax",
    label: "Thorax et côtes",
    summary:
      "Douze vertèbres thoraciques, douze paires de côtes et le sternum forment une cage à la fois protectrice et mobile.",
    body: [
      "Les sept premières paires de côtes rejoignent directement le sternum, les trois suivantes s'y relient par un cartilage commun et les deux dernières restent libres en avant.",
      "À chaque respiration, les côtes s'élèvent et s'écartent légèrement : le volume du thorax varie sans cesse, au rythme de la ventilation.",
    ],
    keyFacts: [
      { label: "Vertèbres", value: "T1 → T12" },
      { label: "Paires de côtes", value: "12" },
      { label: "Côtes flottantes", value: "2 paires" },
    ],
    movement: {
      demo: "breathing",
      caption: "Ventilation : élévation et ouverture des côtes à l'inspiration.",
    },
    motifSlug: "tensions-musculaires",
    camera: { position: [3.0, 7.6, 5.4], target: [0, 7.0, 0.3] },
  },
  {
    id: "lombaires",
    label: "Colonne lombaire",
    summary:
      "Cinq vertèbres massives, de L1 à L5, portent le poids du tronc entre le thorax et le bassin.",
    body: [
      "Les vertèbres lombaires sont les plus volumineuses de la colonne : elles supportent une grande partie du poids du corps. Ensemble, elles dessinent une courbure à concavité postérieure, la lordose lombaire.",
      "L'orientation de leurs articulations favorise la flexion et l'extension — se pencher en avant, se redresser — et limite la rotation. Entre deux vertèbres, un disque intervertébral participe à la répartition des contraintes.",
    ],
    keyFacts: [
      { label: "Vertèbres", value: "L1 → L5" },
      { label: "Courbure", value: "Lordose" },
      { label: "Disques lombaires", value: "5" },
    ],
    movement: {
      demo: "spine-wave",
      caption: "Flexion et extension : chaque vertèbre participe pour une petite part au mouvement global de la colonne.",
    },
    motifSlug: "dos-et-lombalgies",
    camera: { position: [3.6, 6.3, -5.6], target: [0, 5.75, -0.1] },
  },
  {
    id: "bassin",
    label: "Bassin",
    summary:
      "Le bassin relie la colonne aux membres inférieurs. Il transmet le poids du tronc vers les hanches.",
    body: [
      "Il est formé des deux os coxaux, du sacrum et du coccyx. En arrière, les articulations sacro-iliaques, peu mobiles, unissent le sacrum aux os coxaux ; en avant, la symphyse pubienne les relie entre eux.",
      "L'orientation du bassin — antéversion ou rétroversion — influence directement la courbure lombaire située juste au-dessus.",
    ],
    keyFacts: [
      { label: "Os", value: "4" },
      { label: "Articulations sacro-iliaques", value: "2" },
    ],
    movement: {
      demo: "pelvic-tilt",
      caption: "Bascule du bassin : l'antéversion accentue la lordose lombaire, la rétroversion l'atténue.",
    },
    motifSlug: "accompagnement-selon-l-age",
    camera: { position: [2.6, 5.9, 4.8], target: [0, 4.9, 0] },
  },
  {
    id: "epaules",
    label: "Épaules",
    summary:
      "L'épaule est un complexe articulaire : la clavicule, l'omoplate et l'humérus travaillent ensemble pour orienter le bras.",
    body: [
      "La tête de l'humérus s'articule avec une surface peu profonde de l'omoplate, la glène. Cette configuration offre une très grande mobilité, au prix d'une stabilité qui repose largement sur les muscles et les tissus environnants.",
      "Lorsque le bras s'élève sur le côté, l'omoplate pivote elle aussi sur le thorax : on parle de rythme scapulo-huméral.",
    ],
    keyFacts: [
      { label: "Os principaux", value: "3" },
      { label: "Rythme scapulo-huméral", value: "≈ 2 : 1" },
    ],
    movement: {
      demo: "shoulder-abduction",
      caption: "Élévation latérale du bras : l'humérus et l'omoplate se coordonnent.",
    },
    motifSlug: "inconfort-des-epaules",
    camera: { position: [3.4, 8.0, 4.6], target: [0.6, 7.3, 0] },
  },
  {
    id: "hanches",
    label: "Hanches",
    summary:
      "Articulation profonde et stable, la hanche emboîte la tête du fémur dans la cavité acétabulaire du bassin.",
    body: [
      "Sa forme sphérique autorise des mouvements dans les trois plans : flexion et extension, abduction et adduction, rotations interne et externe.",
      "Puissamment entourée de muscles et de ligaments, elle est sollicitée à chaque pas, à chaque montée d'escalier et à chaque passage de la position assise à debout.",
    ],
    keyFacts: [
      { label: "Type", value: "Sphéroïde" },
      { label: "Plans de mouvement", value: "3" },
    ],
    movement: {
      demo: "hip-flexion",
      caption: "Flexion de hanche : la tête fémorale tourne dans l'acétabulum.",
    },
    motifSlug: "mobilite-articulaire",
    camera: { position: [4.2, 5.2, 3.0], target: [0.3, 4.4, 0.2] },
  },
  {
    id: "genoux",
    label: "Genoux",
    summary:
      "Le genou associe le fémur, le tibia et la rotule. Il porte le poids du corps tout en autorisant une large flexion.",
    body: [
      "Entre le fémur et le tibia, les ménisques améliorent l'emboîtement des surfaces articulaires. En avant, la rotule glisse dans une gorge du fémur et accompagne chaque flexion.",
      "Plus bas, la cheville et le pied adaptent l'appui au sol et participent à l'équilibre de l'ensemble du membre inférieur.",
    ],
    keyFacts: [
      { label: "Articulations", value: "Fémoro-tibiale · fémoro-patellaire" },
      { label: "Ménisques", value: "2" },
    ],
    movement: {
      demo: "knee-flexion",
      caption: "Flexion du genou : le tibia roule et glisse sous le fémur, la rotule suit le mouvement.",
    },
    motifSlug: "consultation-de-sportifs",
    camera: { position: [5.0, 3.2, 2.2], target: [0.2, 2.2, 0.3] },
  },
];

export function getRegion(id: RegionId): AnatomyRegion {
  const region = anatomyRegions.find((r) => r.id === id);
  if (!region) throw new Error(`Région inconnue : ${id}`);
  return region;
}

export function isRegionId(value: string): value is RegionId {
  return (REGION_IDS as readonly string[]).includes(value);
}
