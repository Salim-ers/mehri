/**
 * Caméra orbitale « pure » (sans three.js ni DOM, testable en Node).
 * Une pose = cible, angles et distance, plus un décentrage d'objectif (lens shift)
 * qui place le sujet dans la composition sans déformer la perspective.
 */
export interface OrbitPose {
  tx: number;
  ty: number;
  tz: number;
  /** azimut (rad) : 0 = face antérieure, > 0 = caméra vers +x */
  yaw: number;
  /** élévation (rad) */
  pitch: number;
  distance: number;
  /** décentrage du sujet en fraction de la largeur (> 0 : vers la droite) */
  shiftX: number;
  /** décentrage vertical en fraction de la hauteur (> 0 : vers le haut) */
  shiftY: number;
}

export const pose = (p: Partial<OrbitPose> & Pick<OrbitPose, "ty" | "distance">): OrbitPose => ({
  tx: 0,
  tz: 0,
  yaw: 0,
  pitch: 0,
  shiftX: 0,
  shiftY: 0,
  ...p,
});

export function copyPose(out: OrbitPose, p: OrbitPose): OrbitPose {
  out.tx = p.tx;
  out.ty = p.ty;
  out.tz = p.tz;
  out.yaw = p.yaw;
  out.pitch = p.pitch;
  out.distance = p.distance;
  out.shiftX = p.shiftX;
  out.shiftY = p.shiftY;
  return out;
}

const KEYS = ["tx", "ty", "tz", "yaw", "pitch", "distance", "shiftX", "shiftY"] as const;

export function lerpPose(out: OrbitPose, a: OrbitPose, b: OrbitPose, t: number): OrbitPose {
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/** Amortissement exponentiel indépendant de la cadence d'affichage. */
export function damp(current: number, goal: number, lambda: number, dt: number): number {
  return goal + (current - goal) * Math.exp(-lambda * dt);
}

/** @returns l'écart résiduel le plus grand (sert à savoir si la caméra est arrivée) */
export function dampPose(current: OrbitPose, goal: OrbitPose, lambda: number, dt: number): number {
  let gap = 0;
  for (const k of KEYS) {
    current[k] = damp(current[k], goal[k], lambda, dt);
    gap = Math.max(gap, Math.abs(current[k] - goal[k]) / (k === "distance" ? Math.max(1, goal.distance) : 1));
  }
  return gap;
}

/** Position de la caméra pour une pose. */
export function cameraPosition(p: OrbitPose, out: { x: number; y: number; z: number }): void {
  const c = Math.cos(p.pitch);
  out.x = p.tx + p.distance * Math.sin(p.yaw) * c;
  out.y = p.ty + p.distance * Math.sin(p.pitch);
  out.z = p.tz + p.distance * Math.cos(p.yaw) * c;
}

/** Pose équivalente à une caméra placée en `position` et visant `target`. */
export function poseFromLookAt(position: readonly [number, number, number], target: readonly [number, number, number]): OrbitPose {
  const dx = position[0] - target[0];
  const dy = position[1] - target[1];
  const dz = position[2] - target[2];
  const distance = Math.hypot(dx, dy, dz);
  return pose({
    tx: target[0],
    ty: target[1],
    tz: target[2],
    yaw: Math.atan2(dx, dz),
    pitch: Math.asin(dy / Math.max(1e-6, distance)),
    distance,
  });
}

/**
 * Manipulation par l'utilisateur : rotation (glisser), zoom contrôlé (boutons, pincement, Ctrl + molette).
 * Les décalages s'ajoutent à la pose de mise en scène et reviennent doucement à zéro
 * lorsqu'une nouvelle région est choisie.
 */
export class OrbitInput {
  yaw = 0;
  pitch = 0;
  zoom = 1;
  /** instant (s) de la dernière manipulation */
  lastInteraction = -Infinity;

  constructor(
    private readonly limits = { minZoom: 0.55, maxZoom: 1.6, minPitch: -0.55, maxPitch: 0.75 },
  ) {}

  /** dx, dy : déplacement en fraction de la largeur de la scène */
  drag(dx: number, dy: number, now: number): void {
    this.yaw -= dx * Math.PI * 1.15;
    this.pitch = Math.min(this.limits.maxPitch, Math.max(this.limits.minPitch, this.pitch + dy * 1.6));
    this.lastInteraction = now;
  }

  zoomBy(factor: number, now: number): void {
    this.zoom = Math.min(this.limits.maxZoom, Math.max(this.limits.minZoom, this.zoom * factor));
    this.lastInteraction = now;
  }

  /** retour progressif (nouvelle région, « recentrer ») */
  relax(lambda: number, dt: number): void {
    this.yaw = damp(this.yaw, 0, lambda, dt);
    this.pitch = damp(this.pitch, 0, lambda, dt);
    this.zoom = damp(this.zoom, 1, lambda, dt);
  }

  get idle(): boolean {
    return Math.abs(this.yaw) < 1e-3 && Math.abs(this.pitch) < 1e-3 && Math.abs(this.zoom - 1) < 1e-3;
  }
}
