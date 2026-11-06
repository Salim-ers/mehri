import * as THREE from "three";
import { createAnatomyMaterials, type AnatomyMaterials } from "./materials";
import { runAsync } from "./scheduler";
import { disposeGeometries, spineBuilder, type SpineModel } from "./spine";
import type { Detail } from "./vertebra-geometry";

/**
 * Logique impérative de la scène d'accueil (assemblage, étapes de lecture,
 * parallaxe, caméra, légendes). Isolée du composant React : celui-ci ne fait
 * qu'appeler `update` à chaque image.
 */
export type HeroStep = 0 | 1 | 2;

export interface HeroFrameInput {
  readonly elapsed: number;
  readonly delta: number;
  readonly progress: number;
  readonly pointer: THREE.Vector2;
  readonly camera: THREE.Camera;
  readonly viewport: { readonly width: number; readonly height: number };
  readonly labels: { readonly cervical: HTMLElement | null; readonly lumbar: HTMLElement | null };
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export function stepForProgress(p: number): HeroStep {
  return p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
}

export class HeroSpineController {
  readonly materials: AnatomyMaterials;
  readonly spine: SpineModel;
  readonly rig = new THREE.Group();
  private readonly assembly: { obj: THREE.Object3D; base: THREE.Vector3 }[] = [];
  private step: HeroStep | -1 = -1;
  private readonly tmp = new THREE.Vector3();
  private startedAt: number | null = null;
  private readonly look = new THREE.Vector3();

  /** Construction découpée (aucune tâche longue sur le fil principal). */
  static async create(detail: Detail, reducedMotion: boolean, offsetX: number, signal?: AbortSignal): Promise<HeroSpineController> {
    const materials = createAnatomyMaterials();
    try {
      const spine = await runAsync(spineBuilder(detail, materials), 8, signal);
      return new HeroSpineController(materials, spine, reducedMotion, offsetX);
    } catch (e) {
      materials.dispose();
      throw e;
    }
  }

  private constructor(
    materials: AnatomyMaterials,
    spine: SpineModel,
    private readonly reducedMotion: boolean,
    private readonly offsetX: number,
  ) {
    this.materials = materials;
    this.spine = spine;
    const holder = new THREE.Group();
    holder.scale.setScalar(0.01); // 1 unité = 10 cm
    holder.position.set(0, -2.55, 0);
    holder.add(this.spine.root);
    this.rig.add(holder);
    this.rig.position.x = offsetX;
    this.rig.rotation.y = -0.95;

    const push = (obj: THREE.Object3D | null) => {
      if (obj) this.assembly.push({ obj, base: obj.position.clone() });
    };
    push(this.spine.sacrum);
    for (let i = this.spine.segments.length - 1; i >= 0; i--) {
      const seg = this.spine.segments[i]!;
      push(seg.disc);
      push(seg.mesh);
    }
  }

  private applyStep(next: HeroStep, labels: HeroFrameInput["labels"]): void {
    if (this.step === next) return;
    this.step = next;
    const { bone, boneDim, highlight } = this.materials;
    for (const seg of this.spine.segments) {
      const on = (next === 1 && seg.region === "cervical") || (next === 2 && (seg.label === "L4" || seg.label === "L5"));
      seg.mesh.material = next === 0 ? bone : on ? highlight : boneDim;
    }
    this.spine.sacrum.material = next === 2 ? highlight : next === 0 ? bone : boneDim;
    this.spine.coccyx.material = this.spine.sacrum.material;
    if (labels.cervical) labels.cervical.dataset.on = String(next === 1);
    if (labels.lumbar) labels.lumbar.dataset.on = String(next === 2);
  }

  update(input: HeroFrameInput): void {
    const { delta, progress: p, pointer, camera, viewport, labels } = input;
    // l'assemblage démarre au premier rendu, pas au montage du Canvas
    if (this.startedAt === null) this.startedAt = input.elapsed;
    const elapsed = input.elapsed - this.startedAt;

    // 1. assemblage scientifique, de bas en haut
    this.assembly.forEach((item, i) => {
      const t = this.reducedMotion ? 1 : easeOut((elapsed - 0.15 - i * 0.04) / 0.8);
      item.obj.position.set(item.base.x, item.base.y - (1 - t) * 70, item.base.z + (1 - t) * 18);
      item.obj.scale.setScalar(0.55 + 0.45 * t);
      item.obj.visible = t > 0.001;
    });

    // 2. étapes de lecture
    this.applyStep(stepForProgress(p), labels);

    // 3. flottement + parallaxe souris (amplitude limitée)
    const k = 1 - Math.pow(0.0015, delta);
    const float = this.reducedMotion ? 0 : Math.sin(elapsed * 0.45) * 0.08;
    this.rig.rotation.y = THREE.MathUtils.lerp(this.rig.rotation.y, -0.95 + pointer.x * 0.22 + float + p * 0.9, k);
    this.rig.rotation.x = THREE.MathUtils.lerp(this.rig.rotation.x, -pointer.y * 0.06, k);
    this.rig.position.y = THREE.MathUtils.lerp(this.rig.position.y, this.reducedMotion ? 0 : Math.sin(elapsed * 0.6) * 0.06, k);

    // 4. caméra : accompagne la structure vers la région commentée
    const step = stepForProgress(p);
    const focusY = step === 0 ? 0.1 : step === 1 ? 2.4 : -1.6;
    const dist = step === 0 ? 17 : 12;
    const camX = step === 0 ? 0 : this.offsetX * 0.35;
    const k2 = 1 - Math.pow(0.02, delta);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, k2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, focusY + 0.6, k2);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, dist, k2);
    this.look.set(camera.position.x, THREE.MathUtils.lerp(this.look.y, focusY, k2), 0);
    camera.lookAt(this.look);

    // 5. légendes DOM positionnées par projection
    this.place(this.spine.segments[3]?.mesh, labels.cervical, 18, camera, viewport);
    this.place(this.spine.segments[this.spine.segments.length - 1]?.mesh, labels.lumbar, 26, camera, viewport);
  }

  private place(mesh: THREE.Object3D | undefined, el: HTMLElement | null, dx: number, camera: THREE.Camera, viewport: HeroFrameInput["viewport"]) {
    if (!mesh || !el) return;
    mesh.getWorldPosition(this.tmp).project(camera);
    const x = (this.tmp.x * 0.5 + 0.5) * viewport.width + dx;
    const y = (-this.tmp.y * 0.5 + 0.5) * viewport.height;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  dispose(): void {
    disposeGeometries(this.spine.geometries);
    this.materials.dispose();
  }
}
