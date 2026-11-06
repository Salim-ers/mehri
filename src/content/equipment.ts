import { photos, type Photo } from "@/content/media";
import { confirmed, notPublished, type Fact } from "@/lib/facts";

/** Fiches « Validé » sans dénomination ni usage (questionnaire du 06/11/2026) : seule l'observation est affichée. */
const sansDetail = (): Fact<string> =>
  notPublished("Questionnaire du praticien, 06/11/2026 : fiche validée sans dénomination ni usage.");

/**
 * Équipements visibles sur les photographies.
 * Fiches validées par le praticien (questionnaire du 06/11/2026) : aucune propriété thérapeutique
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

export const equipmentPageValidation: Fact<boolean> = confirmed(true);

export const equipment: readonly Equipment[] = [
  {
    id: "tables-articulees",
    index: "E·01",
    family: "Tables de soins articulées",
    observed:
      "Tables à hauteur variable, à plusieurs segments réglables. La marque Manuthera est lisible sur l'une d'elles.",
    name: confirmed("Tables Manuthera"),
    usage: confirmed("Installation du patient pendant l'examen et les techniques manuelles"),
    role: confirmed("Les segments réglables permettent d'adapter la position du patient à la région étudiée et à son confort."),
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
    // le brief propose « table de décompression » : dénomination non reprise
    // (elle suggère un effet thérapeutique)
    name: sansDetail(),
    usage: sansDetail(),
    role: sansDetail(),
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
    name: sansDetail(),
    usage: sansDetail(),
    role: sansDetail(),
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
    name: sansDetail(),
    usage: sansDetail(),
    role: sansDetail(),
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
    name: sansDetail(),
    usage: sansDetail(),
    role: sansDetail(),
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
    name: confirmed("Modèles anatomiques pédagogiques"),
    usage: confirmed("Support visuel pour expliquer l'anatomie au patient"),
    role: confirmed("Ils aident à visualiser les structures évoquées pendant l'échange et les conseils."),
    photo: photos.office,
    focus: [62, 50],
    zoom: 1.8,
    illustration: "none",
  },
];
