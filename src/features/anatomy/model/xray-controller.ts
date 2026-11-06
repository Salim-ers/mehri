import * as THREE from "three";
import { createXRayMaterials, XRayScan, type XRayMaterials } from "./materials";
import { createSkeletonAsync, type SkeletonModel } from "./skeleton";
import type { Detail } from "./vertebra-geometry";

/**
 * Visualisation « radiographique » de l'accueil : le squelette pédagogique est
 * révélé par une bande lumineuse qui le balaie de haut en bas, puis tourne
 * lentement. Purement illustratif — aucun lien avec un examen réel.
 */
export const SKELETON_UNITS = 1 / 190; // 1 unité ≈ 19 cm (même échelle que l'atlas)
const TOP = 9.6;
const BOTTOM = -0.2;
/** vue de trois quarts face : la cage thoracique et le bassin restent lisibles */
const BASE_YAW = 0.3;

export interface XRayFrameInput {
  readonly elapsed: number;
  readonly delta: number;
  /** vrai lorsque la scène est visible et que l'animation n'est pas suspendue */
  readonly running: boolean;
  readonly pointer: THREE.Vector2;
  readonly camera: THREE.PerspectiveCamera;
  readonly viewport: { readonly width: number; readonly height: number };
}

/** Distance de caméra pour que le squelette (≈ 9,8 unités) tienne dans le cadre. */
export function xrayFraming(width: number, height: number, fovDeg: number): { distance: number; targetY: number } {
  const aspect = width / Math.max(1, height);
  const half = THREE.MathUtils.degToRad(fovDeg / 2);
  // portrait étroit : on cadre le tronc (crâne → bassin), plus lisible qu'un squelette minuscule
  if (aspect < 0.62) return { distance: 3.6 / Math.tan(half), targetY: 6.1 };
  const fitHeight = 4.95 / Math.tan(half);
  const fitWidth = 2.6 / (Math.tan(half) * aspect);
  return { distance: Math.max(fitHeight, fitWidth), targetY: 4.75 };
}

export class XRaySkeletonController {
  readonly rig = new THREE.Group();
  private readonly turntable = new THREE.Group();
  private readonly scan: XRayScan;
  private spin = 0;
  private readonly look = new THREE.Vector3();

  static async create(detail: Detail, reducedMotion: boolean, signal?: AbortSignal): Promise<XRaySkeletonController> {
    const materials = createXRayMaterials();
    try {
      const model = await createSkeletonAsync(detail, materials, signal);
      return new XRaySkeletonController(materials, model, reducedMotion);
    } catch (e) {
      materials.dispose();
      throw e;
    }
  }

  private constructor(
    readonly materials: XRayMaterials,
    readonly model: SkeletonModel,
    private readonly reducedMotion: boolean,
  ) {
    const scaled = new THREE.Group();
    scaled.scale.setScalar(SKELETON_UNITS);
    scaled.add(model.root);
    this.turntable.add(scaled);
    this.turntable.rotation.y = BASE_YAW;
    this.rig.add(this.turntable);
    // le rendu additif n'a pas besoin de tri ni de lumière
    model.root.traverse((o) => {
      o.frustumCulled = true;
    });
    this.scan = new XRayScan(materials.uniforms, TOP, BOTTOM, { duration: 3.2, idleEvery: 10 });
    if (reducedMotion) this.scan.showStatic();
  }

  /** Rejoue la révélation lorsque la scène revient à l'écran. */
  replay(): void {
    if (!this.reducedMotion) this.scan.restart();
  }

  update(input: XRayFrameInput): void {
    const { delta, running, pointer, camera, viewport } = input;
    if (!this.reducedMotion) this.scan.update(delta, running);
    // rotation lente, en va-et-vient autour d'une vue de trois quarts (jamais de profil « fil de fer »)
    if (running && !this.reducedMotion) this.spin += delta * 0.22;
    const k = 1 - Math.pow(0.003, delta);
    const pointerYaw = this.reducedMotion ? 0 : pointer.x * 0.35;
    this.turntable.rotation.y = THREE.MathUtils.lerp(this.turntable.rotation.y, BASE_YAW + Math.sin(this.spin) * 0.5 + pointerYaw, k);

    const frame = xrayFraming(viewport.width, viewport.height, camera.fov);
    const k2 = 1 - Math.pow(0.05, delta);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, k2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, frame.targetY + 0.4, k2);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, frame.distance, k2);
    this.look.set(0, frame.targetY, 0);
    camera.lookAt(this.look);
  }

  dispose(): void {
    for (const g of this.model.geometries) g.dispose();
    this.materials.dispose();
  }
}
