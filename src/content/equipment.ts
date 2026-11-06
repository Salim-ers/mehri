import { photos, type Photo } from "@/content/media";
import { missing, toConfirm, type Fact } from "@/lib/facts";

/**
 * Équipements visibles sur les photographies.
 * Les dénominations et usages sont à confirmer : aucune propriété thérapeutique
 * n'est attribuée aux appareils. Rappel : le décret n° 2007-435 autorise
 * l'ostéopathe à pratiquer des manipulations et mobilisations non instrumentales —
 * la présentation d'appareils doit être validée par le praticien.
 */
export interface Equipment {
  readonly id: string;
  readonly index: string;
  readonly family: string;
  readonly observed: string;
  readonly name: Fact<string>;
  readonly usage: Fact<string>;
  readonly role: Fact<string>;
  readonly photo: Photo;
  /** Cadrage de détail dans la photo source. */
  readonly focus: readonly [number, number];
  readonly zoom: number;
  readonly illustration: "table-articulation" | "segments" | "percussion" | "none";
}

export const equipmentPageValidation: Fact<boolean> = toConfirm(
  true,
  "Section demandée par le brief",
  "Valider l'opportunité de présenter des appareils sur le site, au regard du cadre réglementaire de l'ostéopathie (actes non instrumentaux).",
);

export const equipment: readonly Equipment[] = [
  {
    id: "tables-articulees",
    index: "E·01",
    family: "Tables de soins articulées",
    observed:
      "Tables à hauteur variable, à plusieurs segments réglables. La marque Manuthera est lisible sur l'une d'elles.",
    name: toConfirm("Tables Manuthera", "Marque lisible sur la photographie de la salle principale", "Confirmer la marque et les modèles exacts."),
    usage: toConfirm(
      "Installation du patient pendant l'examen et les techniques manuelles",
      "Usage courant de ce type de matériel",
      "Confirmer l'usage effectif.",
    ),
    role: toConfirm(
      "Les segments réglables permettent d'adapter la position du patient à la région étudiée et à son confort.",
      "Description générale",
      "Valider la description.",
    ),
    photo: photos.room,
    focus: [60, 55],
    zoom: 1.5,
    illustration: "table-articulation",
  },
  {
    id: "table-segmentee",
    index: "E·02",
    family: "Table segmentée",
    observed: "Table rouge à segments indépendants, équipée de poignées verticales.",
    name: toConfirm(
      "Table de décompression",
      "Dénomination proposée par le brief",
      "Confirmer le nom exact, la marque, le modèle et l'usage réel de cette table.",
    ),
    usage: missing("Décrire l'usage réel de cette table en consultation."),
    role: missing("Préciser son rôle éventuel dans la consultation."),
    photo: photos.tables,
    focus: [30, 66],
    zoom: 1.6,
    illustration: "segments",
  },
  {
    id: "table-inclinable",
    index: "E·03",
    family: "Table inclinable",
    observed: "Table bleue et blanche à dossier inclinable, accompagnée d'un équipement de maintien noir.",
    name: missing("Indiquer le nom, la marque et le modèle."),
    usage: missing("Décrire l'usage réel."),
    role: missing("Préciser son rôle éventuel."),
    photo: photos.tables,
    focus: [75, 58],
    zoom: 1.7,
    illustration: "none",
  },
  {
    id: "percussion",
    index: "E·04",
    family: "Appareil de percussion",
    observed: "Appareil portatif noir à tête sphérique, de type pistolet de massage.",
    name: missing("Indiquer la marque et le modèle."),
    usage: missing("Décrire dans quel cadre l'appareil est utilisé (et s'il l'est en consultation d'ostéopathie)."),
    role: missing("Préciser son rôle éventuel."),
    photo: photos.percussion,
    focus: [50, 42],
    zoom: 1.2,
    illustration: "percussion",
  },
  {
    id: "applicateur",
    index: "E·05",
    family: "Appareil à embout circulaire",
    observed: "Appareil cylindrique noir terminé par un embout circulaire métallique.",
    name: missing("Identifier précisément cet appareil (nom, marque, modèle, marquage CE)."),
    usage: missing("Décrire l'usage réel."),
    role: missing("Préciser son rôle éventuel."),
    photo: photos.applicator,
    focus: [68, 60],
    zoom: 1.3,
    illustration: "none",
  },
  {
    id: "modeles",
    index: "E·06",
    family: "Modèles anatomiques",
    observed: "Colonnes vertébrales, articulation du genou et squelettes miniatures disposés sur le bureau.",
    name: toConfirm("Modèles anatomiques pédagogiques", "Observation de la photographie du bureau", "Confirmer."),
    usage: toConfirm(
      "Support visuel pour expliquer l'anatomie au patient",
      "Usage habituel de ces modèles",
      "Confirmer l'usage pédagogique.",
    ),
    role: toConfirm(
      "Ils aident à visualiser les structures évoquées pendant l'échange et les conseils.",
      "Description générale",
      "Valider la description.",
    ),
    photo: photos.office,
    focus: [62, 50],
    zoom: 1.8,
    illustration: "none",
  },
];
