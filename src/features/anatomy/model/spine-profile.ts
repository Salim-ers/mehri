/**
 * Profil anatomique de la colonne — source unique pour la 3D et les dessins SVG.
 * Dimensions moyennes d'un adulte (mm), d'après les ordres de grandeur usuels
 * des atlas d'anatomie ; elles servent à une représentation pédagogique crédible,
 * pas à un usage clinique.
 */
export type SpineRegion = "cervical" | "thoracic" | "lumbar";

export interface VertebraSpec {
  readonly label: string;
  readonly region: SpineRegion;
  /** index 0 = C1 */
  readonly index: number;
  /** hauteur du corps vertébral */
  readonly height: number;
  /** largeur (latérale) du corps */
  readonly width: number;
  /** profondeur (antéro-postérieure) du corps */
  readonly depth: number;
  /** épaisseur du disque situé SOUS la vertèbre (0 pour C1) */
  readonly discBelow: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function build(): VertebraSpec[] {
  const list: VertebraSpec[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    list.push({
      label: `C${i + 1}`,
      region: "cervical",
      index: list.length,
      height: i === 0 ? 10 : lerp(13, 15, t),
      width: lerp(18, 26, t),
      depth: lerp(15, 17, t),
      discBelow: i === 0 ? 0 : lerp(4.5, 5.5, t),
    });
  }
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    list.push({
      label: `T${i + 1}`,
      region: "thoracic",
      index: list.length,
      height: lerp(17, 24, t),
      width: lerp(27, 40, t),
      depth: lerp(18, 29, t),
      discBelow: lerp(4, 7, t),
    });
  }
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    list.push({
      label: `L${i + 1}`,
      region: "lumbar",
      index: list.length,
      height: lerp(25, 27, t),
      width: lerp(42, 50, t),
      depth: lerp(31, 35, t),
      discBelow: lerp(9, 11, t),
    });
  }
  return list;
}

export const VERTEBRAE: readonly VertebraSpec[] = build();

/** Longueur C1→base de L5 (mm), disques compris. */
export const SPINE_LENGTH_MM = VERTEBRAE.reduce((sum, v) => sum + v.height + (v.index === 0 ? 0 : 0) + v.discBelow, 0);

/**
 * Courbe sagittale normalisée : t ∈ [0,1] de la base de L5 (0) au sommet de C1 (1).
 * Retourne l'avancée antérieure (fraction de la longueur totale).
 * Lordose lombaire, cyphose thoracique, lordose cervicale.
 */
const CURVE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.0],
  [0.07, 0.042],
  [0.15, 0.058],
  [0.24, 0.044],
  [0.33, 0.004],
  [0.48, -0.052],
  [0.62, -0.04],
  [0.73, -0.006],
  [0.84, 0.034],
  [0.94, 0.03],
  [1.0, 0.012],
];

/** Interpolation Catmull-Rom 1D sur les points de contrôle. */
export function sagittalOffset(t: number): number {
  const pts = CURVE;
  const clamped = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < pts.length - 2 && clamped > pts[i + 1]![0]) i++;
  const p0 = pts[Math.max(0, i - 1)]!;
  const p1 = pts[i]!;
  const p2 = pts[i + 1]!;
  const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
  const u = (clamped - p1[0]) / (p2[0] - p1[0] || 1);
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    0.5 *
    (2 * p1[1] +
      (-p0[1] + p2[1]) * u +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)
  );
}

export interface SpineFrame2D {
  readonly spec: VertebraSpec;
  /** position du centre du corps : y vers le haut (mm, base L5 = 0), z antérieur (mm) */
  readonly y: number;
  readonly z: number;
  /** angle d'inclinaison sagittale (radians) de l'axe vertical local */
  readonly tilt: number;
  /** centre du disque sous la vertèbre */
  readonly discY: number;
  readonly discZ: number;
  readonly discTilt: number;
}

/** Calcule la position de chaque vertèbre le long de la courbe (de L5 vers C1). */
export function computeFrames(): SpineFrame2D[] {
  const L = SPINE_LENGTH_MM;
  const ordered = [...VERTEBRAE].reverse(); // L5 → C1
  const frames: SpineFrame2D[] = [];
  let s = 0;
  const pointAt = (arc: number) => {
    const t = arc / L;
    const z = sagittalOffset(t) * L;
    const dt = 0.002;
    const dz = (sagittalOffset(t + dt) - sagittalOffset(t - dt)) / (2 * dt);
    return { y: arc, z, tilt: Math.atan(dz) };
  };
  for (const spec of ordered) {
    const disc = pointAt(s + spec.discBelow / 2);
    s += spec.discBelow;
    const body = pointAt(s + spec.height / 2);
    s += spec.height;
    frames.push({
      spec,
      y: body.y,
      z: body.z,
      tilt: body.tilt,
      discY: disc.y,
      discZ: disc.z,
      discTilt: disc.tilt,
    });
  }
  return frames.reverse(); // C1 → L5
}

/** Inclinaison sagittale du plateau sacré (pente sacrée moyenne ≈ 40°). */
export const SACRAL_SLOPE = (40 * Math.PI) / 180;
