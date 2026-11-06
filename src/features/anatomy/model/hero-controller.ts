import * as THREE from "three";
import { createAnatomyMaterials, type AnatomyMaterials } from "./materials";
import { runAsync } from "./scheduler";
import { disposeGeometries, spineBuilder, type SpineModel } from "./spine";
import type { Detail } from "./vertebra-geometry";

/**
 * Logique impérative de la scène d'accueil : la colonne apparaît dans une
 * lumière douce, tourne lentement sur elle-même et réagit discrètement au
 * pointeur. Le composant React se contente d'appeler `update` à chaque image.
 */

/** Cadrage adapté à la forme de l'écran (calculé par `heroLayout`). */
export interface HeroLayout {
  /** décalage horizontal de la colonne (composition asymétrique sur grand écran) */
  readonly offsetX: number;
  /** hauteur visée par la caméra (cadrage plus serré, colonne plus haute sur mobile) */
  readonly targetY: number;
  /** distance de la caméra */
  readonly distance: number;
  /** légère inclinaison de la composition (mobile) */
  readonly tilt: number;
}

/** Composition propre à chaque format d'écran — pas une simple réduction du bureau. */
export function heroLayout(width: number, height: number): HeroLayout {
  const aspect = width / Math.max(1, height);
  if (aspect >= 1.9) return { offsetX: 3.3, targetY: 0.55, distance: 13, tilt: 0 }; // ultralarge
  if (aspect >= 1.25) return { offsetX: 2.25, targetY: 0.55, distance: 13.2, tilt: 0 }; // ordinateur
  if (aspect >= 0.8) return { offsetX: 1.6, targetY: 0.45, distance: 14.4, tilt: -0.05 }; // tablette
  // portrait : colonne plus grande, décalée à droite dans la moitié haute, légèrement inclinée ;
  // le texte occupe le bas de l'écran
  return { offsetX: 0.78, targetY: 1.55, distance: 11.2, tilt: 0.3 };
}

export interface HeroFrameInput {
  readonly elapsed: number;
  readonly delta: number;
  /** progression de sortie de la section d'ouverture (0 → 1), lue hors React */
  readonly progress: number;
  /** rotation et parallaxe suspendues par l'utilisateur (WCAG 2.2.2) */
  readonly paused: boolean;
  readonly pointer: THREE.Vector2;
  readonly camera: THREE.Camera;
  readonly scene: THREE.Scene;
  readonly layout: HeroLayout;
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Durée de l'entrée en lumière (secondes). */
export const HERO_ENTRANCE = 2.6;

/** Vue de trois quarts profil : face antérieure tournée vers le texte, courbures visibles. */
const BASE_YAW = -1.05;

export class HeroSpineController {
  readonly materials: AnatomyMaterials;
  readonly spine: SpineModel;
  /** objet à ajouter à la scène : colonne + éclairage piloté */
  readonly rig = new THREE.Group();
  private readonly holder = new THREE.Group();
  private readonly turntable = new THREE.Group();
  private readonly settle: { obj: THREE.Object3D; base: THREE.Vector3; order: number }[] = [];
  private readonly lights: { light: THREE.Light; full: number }[] = [];
  private startedAt: number | null = null;
  private spin = 0;
  private yaw = BASE_YAW;
  private readonly look = new THREE.Vector3();

  /** Construction découpée (aucune tâche longue sur le fil principal). */
  static async create(detail: Detail, reducedMotion: boolean, signal?: AbortSignal): Promise<HeroSpineController> {
    const materials = createAnatomyMaterials();
    try {
      const spine = await runAsync(spineBuilder(detail, materials), 8, signal);
      return new HeroSpineController(materials, spine, reducedMotion);
    } catch (e) {
      materials.dispose();
      throw e;
    }
  }

  private constructor(
    materials: AnatomyMaterials,
    spine: SpineModel,
    private readonly reducedMotion: boolean,
  ) {
    this.materials = materials;
    this.spine = spine;
    this.holder.scale.setScalar(0.01); // 1 unité = 10 cm
    this.holder.position.set(0, -2.55, 0);
    this.holder.add(spine.root);
    this.turntable.add(this.holder);
    this.rig.add(this.turntable);
    this.turntable.rotation.y = BASE_YAW;

    // éclairage latéral (relief), contre-jour chaud ; la lumière « monte » pendant l'entrée
    const hemi = new THREE.HemisphereLight("#fff7ec", "#9d9384", 0.42);
    const key = new THREE.DirectionalLight("#fff3e2", 2.9);
    key.position.set(-6, 7, 5);
    const rim = new THREE.DirectionalLight("#e8bf90", 2.4);
    rim.position.set(6, 4, -6);
    const fill = new THREE.PointLight("#ffffff", 3.5, 16);
    fill.position.set(3, -2, 6);
    for (const [light, full] of [
      [hemi, 0.42],
      [key, 2.9],
      [rim, 2.4],
      [fill, 3.5],
    ] as const) {
      this.lights.push({ light, full });
      this.rig.add(light);
    }

    // apparition de haut en bas : C1 en premier, sacrum en dernier
    spine.segments.forEach((seg, i) => {
      this.settle.push({ obj: seg.mesh, base: seg.mesh.position.clone(), order: i });
      if (seg.disc) this.settle.push({ obj: seg.disc, base: seg.disc.position.clone(), order: i + 0.5 });
    });
    this.settle.push({ obj: spine.sacrum, base: spine.sacrum.position.clone(), order: spine.segments.length + 1 });
    this.settle.push({ obj: spine.coccyx, base: spine.coccyx.position.clone(), order: spine.segments.length + 2 });
  }

  update(input: HeroFrameInput): void {
    const { delta, progress: p, pointer, camera, scene, layout } = input;
    if (this.startedAt === null) this.startedAt = input.elapsed;
    const elapsed = input.elapsed - this.startedAt;
    const still = this.reducedMotion;

    // 1. entrée en lumière : intensités et environnement montent doucement
    const light = still ? 1 : easeInOut(elapsed / HERO_ENTRANCE);
    for (const { light: l, full } of this.lights) l.intensity = full * (0.08 + 0.92 * light);
    scene.environmentIntensity = 0.12 + 0.88 * light;

    // 2. les vertèbres se posent l'une après l'autre (amplitude faible, sans effet gratuit)
    for (const item of this.settle) {
      const t = still ? 1 : easeOut((elapsed - 0.15 - item.order * 0.035) / 1.3);
      item.obj.position.set(item.base.x, item.base.y + (1 - t) * 26, item.base.z + (1 - t) * 10);
      item.obj.scale.setScalar(0.9 + 0.1 * t);
    }

    // 3. rotation lente et naturelle autour d'une vue de trois quarts profil (les courbures
    //    restent toujours lisibles) + réaction discrète au pointeur
    const k = 1 - Math.pow(0.002, delta);
    const calm = still || input.paused;
    if (!calm) this.spin += delta * 0.21;
    const sway = Math.sin(this.spin) * 0.6;
    const targetYaw = BASE_YAW + sway + (calm ? 0 : pointer.x * 0.3) + p * 0.6;
    this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, k);
    this.turntable.rotation.y = this.yaw;
    this.rig.rotation.x = THREE.MathUtils.lerp(this.rig.rotation.x, calm ? 0 : -pointer.y * 0.07, k);
    this.rig.rotation.z = THREE.MathUtils.lerp(this.rig.rotation.z, layout.tilt, k);
    const float = calm ? 0 : Math.sin(elapsed * 0.5) * 0.05;
    this.rig.position.x = THREE.MathUtils.lerp(this.rig.position.x, layout.offsetX, k);
    this.rig.position.y = THREE.MathUtils.lerp(this.rig.position.y, float + p * 1.6, k);

    // 4. caméra : léger travelling avant pendant l'entrée, recul à la sortie
    const dolly = still ? 0 : (1 - easeOut(elapsed / (HERO_ENTRANCE + 0.6))) * 2.2;
    const k2 = 1 - Math.pow(0.03, delta);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, layout.offsetX * 0.18, k2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, layout.targetY + 0.5, k2);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, layout.distance + dolly + p * 2.5, k2);
    this.look.set(camera.position.x, layout.targetY, 0);
    camera.lookAt(this.look);
  }

  dispose(): void {
    disposeGeometries(this.spine.geometries);
    this.materials.dispose();
  }
}
