/**
 * Photographies du cabinet.
 * Dimensions réelles des sources (aucune image n'est présentée comme 4K native).
 * Provenance : fichiers transmis par QuadCore, nommés « Image ChatGPT » (retouches IA).
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
  readonly showsPatient: boolean;
}

const photo = (p: Photo): Photo => p;

export const photos = {
  portrait: photo({
    id: "portrait",
    src: "/images/praticien-portrait.jpg",
    width: 464,
    height: 831,
    alt: "Portrait de Mohamed Merhi, ostéopathe, en polo noir devant un mur sculpté d'un arbre et d'un oiseau en relief blanc.",
    caption: "Mohamed Merhi, au cabinet de Creil.",
    focus: [55, 48],
    showsPatient: false,
  }),
  desk: photo({
    id: "desk",
    src: "/images/praticien-bureau.jpg",
    width: 466,
    height: 831,
    alt: "Mohamed Merhi assis à son bureau en bois, avec un ordinateur portable et des modèles anatomiques de colonne vertébrale posés devant lui.",
    caption: "Le bureau d'accueil, où débute chaque consultation.",
    focus: [55, 45],
    showsPatient: false,
  }),
  cervical: photo({
    id: "cervical",
    src: "/images/consultation-cervicales.jpg",
    width: 464,
    height: 831,
    alt: "Le praticien, assis à la tête d'une table de soins, place ses mains de part et d'autre de la nuque d'une patiente allongée sur le dos.",
    caption: "Consultation au cabinet — région cervicale.",
    focus: [55, 70],
    showsPatient: true,
  }),
  shoulder: photo({
    id: "shoulder",
    src: "/images/consultation-epaule.jpg",
    width: 466,
    height: 831,
    alt: "Le praticien, debout près d'une table de soins brune, place ses mains sur l'épaule et le bras d'une patiente allongée sur le dos.",
    caption: "Consultation au cabinet — épaule et membre supérieur.",
    focus: [50, 55],
    showsPatient: true,
  }),
  room: photo({
    id: "room",
    src: "/images/salle-consultation.jpg",
    width: 941,
    height: 1672,
    alt: "Salle de consultation lumineuse : une table de soins brune et blanche au premier plan, une table articulée grise de marque Manuthera au fond, un sol en pierre beige baigné de lumière à travers un store.",
    caption: "La salle de consultation principale.",
    focus: [45, 60],
    showsPatient: false,
  }),
  tables: photo({
    id: "tables",
    src: "/images/salle-tables-specialisees.jpg",
    width: 941,
    height: 1672,
    alt: "Seconde salle avec une table segmentée rouge munie de poignées et une table bleue et blanche inclinable, sur un sol en pierre beige.",
    caption: "La seconde salle et ses tables spécifiques.",
    focus: [45, 68],
    showsPatient: false,
  }),
  office: photo({
    id: "office",
    src: "/images/bureau-modeles-anatomiques.jpg",
    width: 941,
    height: 1672,
    alt: "Grand bureau d'angle en bois brun avec fauteuil en cuir, sur lequel sont posés de nombreux modèles anatomiques : colonnes vertébrales, genou, squelettes miniatures et un bonsaï.",
    caption: "Le bureau et sa collection de modèles anatomiques.",
    focus: [55, 55],
    showsPatient: false,
  }),
  percussion: photo({
    id: "percussion",
    src: "/images/equipement-percussion.jpg",
    width: 941,
    height: 1672,
    alt: "Main tenant un appareil de percussion noir à tête sphérique, appliqué sur le haut du dos d'une personne allongée.",
    caption: "Appareil de percussion présent au cabinet.",
    focus: [55, 45],
    showsPatient: true,
  }),
  applicator: photo({
    id: "applicator",
    src: "/images/equipement-applicateur.jpg",
    width: 941,
    height: 1672,
    alt: "Main tenant un appareil cylindrique noir à embout circulaire métallique, posé sur le dos d'une personne allongée.",
    caption: "Appareil à embout circulaire présent au cabinet.",
    focus: [60, 60],
    showsPatient: true,
  }),
} as const satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;

export interface GalleryScene {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly text: string;
  readonly photo: Photo;
}

export const galleryScenes: readonly GalleryScene[] = [
  {
    id: "salle",
    index: "A",
    title: "La salle de consultation",
    text: "Une pièce baignée de lumière naturelle, filtrée par des stores à bandes. Le sol en pierre et les murs blancs composent un environnement calme et lisible.",
    photo: photos.room,
  },
  {
    id: "tables",
    index: "B",
    title: "Les tables de soins",
    text: "Plusieurs tables réglables permettent d'installer chaque patient dans une position confortable, adaptée à la région étudiée.",
    photo: photos.tables,
  },
  {
    id: "bureau",
    index: "C",
    title: "Le bureau",
    text: "Un grand bureau en bois brun accueille l'échange qui ouvre chaque consultation, entouré de modèles anatomiques qui servent de support aux explications.",
    photo: photos.office,
  },
  {
    id: "accueil",
    index: "D",
    title: "L'accueil",
    text: "Le praticien reçoit ses patients dans un espace sobre, pensé pour la discussion.",
    photo: photos.desk,
  },
  {
    id: "environnement",
    index: "E",
    title: "L'environnement",
    text: "Un relief sculpté d'arbre et d'oiseau orne l'un des murs du cabinet : une touche de sérénité dans un lieu de soin.",
    photo: photos.portrait,
  },
];
