import { getRegion, type MotionDemo, type RegionId } from "@/content/anatomy";
import { copyPose, lerpPose, pose, poseFromLookAt, type OrbitPose } from "./orbit";

/**
 * Mise en scène : cadrages par mode et par format d'écran (fonctions pures, testées).
 * Unités de scène : squelette ≈ 9,3 unités de haut (1 unité ≈ 19 cm), pieds à y = 0,
 * face antérieure vers +z.
 */
export const FOV = 30;
export const SKELETON_UNITS = 1 / 190;
export const BODY = { top: 9.45, bottom: -0.15, centerY: 4.65, halfWidth: 1.4 } as const;

const tanHalf = Math.tan(((FOV / 2) * Math.PI) / 180);

/** Distance pour que le squelette entier occupe `fraction` de la hauteur, sans dépasser en largeur. */
export function fitFullBody(aspect: number, fraction = 0.9): number {
  const halfH = ((BODY.top - BODY.bottom) / 2) * 1.04;
  const byHeight = halfH / (tanHalf * fraction);
  const byWidth = (BODY.halfWidth * 1.25) / (tanHalf * Math.max(0.2, aspect) * Math.min(1, fraction + 0.1));
  return Math.max(byHeight, byWidth);
}

export type Format = "portrait" | "tablet" | "desktop" | "ultrawide";

export function formatOf(aspect: number): Format {
  if (aspect < 0.8) return "portrait";
  if (aspect < 1.3) return "tablet";
  if (aspect > 2.1) return "ultrawide";
  return "desktop";
}

/** Plus l'écran est étroit, plus la caméra recule pour garder le sujet entier. */
function narrowFactor(aspect: number): number {
  return aspect >= 1.2 ? 1 : 1 + (1.2 - aspect) * 0.75;
}

/* ── Accueil : chapitres au défilement ─────────────────────── */

export interface HeroChapter {
  readonly region: RegionId | null;
  readonly demo: MotionDemo | null;
}

/** Ordre des chapitres de l'accueil (le texte correspondant est rendu côté serveur). */
export const HERO_CHAPTERS: readonly HeroChapter[] = [
  { region: null, demo: null },
  { region: "cervicales", demo: "neck-rotation" },
  { region: "epaules", demo: "shoulder-abduction" },
  { region: "bassin", demo: "pelvic-tilt" },
  { region: null, demo: null },
];

/** Début et fin (en chapitres) de la bascule radiographique de l'accueil. */
export const HERO_XRAY_RANGE = [3.3, 3.95] as const;

export function heroKeyframes(aspect: number): OrbitPose[] {
  const f = formatOf(aspect);
  const portrait = f === "portrait";
  const side = f === "ultrawide" ? 0.24 : f === "desktop" ? 0.2 : f === "tablet" ? 0.15 : 0;
  // portrait : sujet dans la moitié haute, texte en bas
  const up = portrait ? 0.215 : 0;
  const n = narrowFactor(aspect);
  const full = fitFullBody(aspect, portrait ? 0.4 : 0.8);
  // le sujet descend légèrement : l'en-tête flottant ne coupe jamais le crâne
  const down = portrait ? 0 : -0.035;
  return [
    pose({ ty: BODY.centerY, yaw: 0.55, pitch: 0.05, distance: full, shiftX: side, shiftY: up + down }),
    // nuque vue de trois quarts arrière : les cervicales et le pivot atlas–axis restent lisibles
    pose({ tx: 0, ty: 8.0, tz: -0.05, yaw: 2.45, pitch: 0.16, distance: 5.4 * n, shiftX: side * 0.9, shiftY: up }),
    pose({ tx: 0.7, ty: 7.0, yaw: 0.5, pitch: 0.06, distance: 8.6 * n, shiftX: -side * 0.85, shiftY: up }),
    pose({ ty: 5.15, yaw: 1.3, pitch: 0.05, distance: 7.6 * n, shiftX: side * 0.9, shiftY: up }),
    pose({ ty: BODY.centerY, yaw: 0.22, pitch: 0.03, distance: full * 1.04, shiftX: side, shiftY: up + down }),
  ];
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Pose de l'accueil pour une progression continue (0 → nombre de chapitres − 1). */
export function heroPose(progress: number, keys: readonly OrbitPose[], out: OrbitPose): OrbitPose {
  const last = keys.length - 1;
  const p = Math.min(last, Math.max(0, progress));
  const i = Math.min(last - 1, Math.floor(p));
  const a = keys[i];
  const b = keys[i + 1];
  if (!a || !b) return copyPose(out, keys[0] ?? out);
  // chaque chapitre « tient » sa pose sur une partie du défilement, puis transite
  const local = p - i;
  const t = smooth(Math.min(1, Math.max(0, (local - 0.18) / 0.64)));
  return lerpPose(out, a, b, t);
}

/** Chapitre dont la démonstration est jouée (null entre deux chapitres). */
export function heroChapterAt(progress: number): HeroChapter | null {
  const i = Math.round(progress);
  if (Math.abs(progress - i) > 0.3) return null;
  return HERO_CHAPTERS[i] ?? null;
}

/** Hauteur de la ligne radiographique de l'accueil selon la progression. */
export function heroXRayLine(progress: number): number {
  const [a, b] = HERO_XRAY_RANGE;
  const t = smooth(Math.min(1, Math.max(0, (progress - a) / (b - a))));
  return BODY.top + 1.2 - t * (BODY.top - BODY.bottom + 2.4);
}

/** Pose de départ de l'ouverture : la colonne en gros plan, avant le recul de la caméra. */
export function introPose(aspect: number): OrbitPose {
  const f = formatOf(aspect);
  return pose({ ty: 6.6, yaw: 1.05, pitch: 0.12, distance: 3.6 * narrowFactor(aspect), shiftX: f === "portrait" ? 0 : 0.12, shiftY: f === "portrait" ? 0.12 : 0 });
}

/* ── Explorateur, sélection des zones, fiches ──────────────── */

export type StageMode = "hero" | "explore" | "finder" | "region";

/** Décentrage du sujet selon le mode (panneaux d'interface autour de la scène). */
function stageShift(mode: StageMode, aspect: number): number {
  const f = formatOf(aspect);
  if (mode === "explore") return f === "portrait" ? 0 : f === "tablet" ? -0.08 : -0.13;
  return 0;
}

export function overviewPose(mode: StageMode, aspect: number): OrbitPose {
  return pose({ ty: BODY.centerY, yaw: 0.42, pitch: 0.05, distance: fitFullBody(aspect, 0.86), shiftX: stageShift(mode, aspect) });
}

export function regionPose(region: RegionId, mode: StageMode, aspect: number): OrbitPose {
  const { position, target } = getRegion(region).camera;
  const p = poseFromLookAt(position, target);
  // un peu de recul : l'articulation reste lisible pendant son mouvement (bras levé, genou fléchi)
  p.distance *= 1.32 * narrowFactor(aspect);
  p.shiftX = stageShift(mode, aspect);
  return p;
}
