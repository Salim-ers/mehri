/**
 * Imagerie anatomique d'illustration (radiographies, pièce osseuse, gravure).
 * - Ressources de Wikimedia Commons sous licence autorisant l'usage commercial
 *   (domaine public, CC0, CC BY, CC BY-SA) ; licences vérifiées via l'API Commons
 *   le 06/11/2026 (assets/imagery-source/credits.json). Auteur, licence et source
 *   sont affichés (légendes + mentions légales).
 * - Jamais présentées comme l'examen d'un patient du cabinet (légende systématique).
 * - Aucune photographie de personne.
 * Fichiers préparés par `scripts/prepare-imagery.mjs` : recadrage (suppression des
 * marqueurs « R », échelles, initiales), niveaux de gris, métadonnées supprimées.
 * Les versions modifiées d'images CC BY-SA sont diffusées sous la même licence.
 */
export interface ImageryCredit {
  readonly author: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly sourceUrl: string;
  /** vrai si l'image a été recadrée / retouchée (obligation d'indiquer les modifications) */
  readonly modified: boolean;
}

export interface Imagery {
  readonly id: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  /** sujet en clair, utilisé dans les crédits */
  readonly subject: string;
  readonly kind: "radiographie" | "illustration" | "piece-anatomique";
  readonly credit: ImageryCredit;
}

const img = (i: Imagery): Imagery => i;

const BONEPIT = "Département de radiologie, UC San Diego Health (bonepit.com)";
const PDM = { license: "Domaine public (Public Domain Mark 1.0)", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/" };
const BY_SA_4 = { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };

export const xrays = {
  lumbar: img({
    id: "lumbar",
    src: "/images/anatomie/radiographie-rachis-lombaire.jpg",
    width: 2079,
    height: 2358,
    alt: "Radiographie de profil du rachis lombaire : cinq vertèbres lombaires empilées, disques intervertébraux et sacrum.",
    subject: "Radiographie latérale du rachis lombaire et du sacrum",
    kind: "radiographie",
    credit: { author: "FitBro", ...BY_SA_4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Lateral_lumbar_x_ray.jpg", modified: true },
  }),
  cervical: img({
    id: "cervical",
    src: "/images/anatomie/radiographie-rachis-cervical.jpg",
    width: 1313,
    height: 2400,
    alt: "Radiographie de profil du rachis cervical : les sept vertèbres de la nuque dessinent une courbe douce sous la base du crâne.",
    subject: "Radiographie latérale du rachis cervical",
    kind: "radiographie",
    credit: {
      author: BONEPIT,
      ...PDM,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:X-ray_of_the_cervical_spine_of_an_20_year_old_male_-_lateral,_case_2.jpg",
      modified: true,
    },
  }),
  pelvis: img({
    id: "pelvis",
    src: "/images/anatomie/radiographie-bassin.jpg",
    width: 2383,
    height: 1684,
    alt: "Radiographie de face du bassin : ailes iliaques, sacrum, articulations des hanches et têtes fémorales.",
    subject: "Radiographie de face du bassin et des hanches",
    kind: "radiographie",
    credit: {
      author: BONEPIT,
      ...PDM,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:X-ray_of_the_pelvis_of_an_18_year_old_male_-_case_3_-_anteroposterior.jpg",
      modified: true,
    },
  }),
  knee: img({
    id: "knee",
    src: "/images/anatomie/radiographie-genou.jpg",
    width: 1553,
    height: 2400,
    alt: "Radiographie de profil du genou : fémur, rotule, tibia et fibula.",
    subject: "Radiographie latérale du genou",
    kind: "radiographie",
    credit: { author: "Ptrump16", ...BY_SA_4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Knee_plain_X-ray.jpg", modified: true },
  }),
  shoulder: img({
    id: "shoulder",
    src: "/images/anatomie/radiographie-epaule.jpg",
    width: 1840,
    height: 1895,
    alt: "Radiographie de face de l'épaule : tête de l'humérus, omoplate, clavicule et premières côtes.",
    subject: "Radiographie de face de l'épaule",
    kind: "radiographie",
    credit: {
      author: "Nevit Dilmen",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Medical_X-Ray_imaging_CID03_nevit.jpg",
      modified: true,
    },
  }),
} as const satisfies Record<string, Imagery>;

export const plates = {
  vertebra: img({
    id: "vertebra",
    src: "/images/anatomie/vertebre-thoracique.jpg",
    width: 1800,
    height: 2400,
    alt: "Vertèbre thoracique humaine (pièce osseuse de collection) vue du dessus, sur fond gris anthracite : corps vertébral, foramen et processus.",
    subject: "Vertèbre thoracique, pièce anatomique de collection (Université Charles, Prague)",
    kind: "piece-anatomique",
    credit: {
      author: "MAKY.OREL",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Vertebra_-_thoracicae.jpg",
      modified: false,
    },
  }),
  engraving: img({
    id: "engraving",
    src: "/images/anatomie/gravure-colonne-vertebrale.jpg",
    width: 1708,
    height: 2400,
    alt: "Gravure ancienne de la colonne vertébrale, vue de face et vue de profil, montrant ses courbures.",
    subject: "Gravure de la colonne vertébrale, vues de face et de profil (Andrew Bell, 1798)",
    kind: "illustration",
    credit: {
      author: "Andrew Bell (gravure, 1798), numérisation Wellcome Collection",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Vertebral_column;_two_figures_showing_front_and_side_views._Wellcome_V0007972.jpg",
      modified: true,
    },
  }),
} as const satisfies Record<string, Imagery>;

/** Visuel associé à chaque grande famille de motifs (voir motifCategories). */
export const categoryVisuals: Readonly<Record<string, Imagery>> = {
  "dos-et-nuque": xrays.lumbar,
  articulations: xrays.knee,
  activite: xrays.shoulder,
  ages: xrays.pelvis,
};

/** Toutes les ressources publiées (crédits des mentions légales). */
export const imageryCredits: readonly Imagery[] = [...Object.values(xrays), ...Object.values(plates)];
