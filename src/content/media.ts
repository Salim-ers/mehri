/**
 * Photographies du cabinet.
 * RÈGLE : aucune photographie représentant une personne (praticien, patient,
 * mains, silhouettes). Seuls les espaces vides et le matériel sont publiés ;
 * un test vérifie `showsPerson: false` pour chaque entrée.
 * Dimensions réelles des sources (aucune image n'est présentée comme 4K native).
 * Provenance : fichiers transmis par QuadCore (« Image ChatGPT », retouches),
 * publication autorisée par le praticien (questionnaire du 06/11/2026).
 */
export interface Photo {
  readonly id: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption: string;
  /** Point focal pour object-position, en %. */
  readonly focus: readonly [number, number];
  readonly showsPerson: false;
}

const photo = (p: Photo): Photo => p;

export const photos = {
  room: photo({
    id: "room",
    src: "/images/salle-consultation.jpg",
    width: 941,
    height: 1672,
    alt: "Salle de consultation lumineuse : une table de soins brune et blanche au premier plan, une table articulée grise de marque Manuthera au fond, un sol en pierre beige baigné de lumière à travers un store.",
    caption: "La salle de consultation principale.",
    focus: [45, 60],
    showsPerson: false,
  }),
  tables: photo({
    id: "tables",
    src: "/images/salle-tables-specialisees.jpg",
    width: 941,
    height: 1672,
    alt: "Seconde salle avec une table segmentée rouge munie de poignées et une table bleue et blanche inclinable, sur un sol en pierre beige.",
    caption: "La seconde salle et ses tables réglables.",
    focus: [45, 68],
    showsPerson: false,
  }),
  office: photo({
    id: "office",
    src: "/images/bureau-modeles-anatomiques.jpg",
    width: 941,
    height: 1672,
    alt: "Grand bureau d'angle en bois brun avec fauteuil en cuir, sur lequel sont posés de nombreux modèles anatomiques : colonnes vertébrales, genou, squelettes miniatures et un bonsaï.",
    caption: "Le bureau et sa collection de modèles anatomiques.",
    focus: [55, 62],
    showsPerson: false,
  }),
} as const satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;

export interface GalleryScene {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly photo: Photo;
}

export const galleryScenes: readonly GalleryScene[] = [
  {
    id: "salle",
    title: "La salle de consultation",
    text: "Une pièce baignée de lumière naturelle, filtrée par des stores à bandes. Le sol en pierre et les murs blancs composent un environnement calme et lisible.",
    photo: photos.room,
  },
  {
    id: "tables",
    title: "Les tables de soins",
    text: "Plusieurs tables réglables permettent d'installer chaque patient dans une position confortable, adaptée à la région étudiée.",
    photo: photos.tables,
  },
  {
    id: "bureau",
    title: "Le bureau",
    text: "Le grand bureau en bois accueille l'échange qui ouvre chaque consultation, entouré de modèles anatomiques qui servent de support aux explications.",
    photo: photos.office,
  },
];
