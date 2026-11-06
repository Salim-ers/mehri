import * as THREE from "three";
import type { MotionDemo } from "@/content/anatomy";
import type { SkeletonModel } from "./skeleton";

/**
 * Animations articulaires pédagogiques. Les amplitudes restent dans des ordres
 * de grandeur physiologiques (ex. flexion du genou ≈ 100°, élévation du bras ≈ 95°
 * avec participation de la ceinture scapulaire).
 */
interface Rest {
  readonly local: THREE.Quaternion;
  readonly world: THREE.Quaternion;
  readonly position: THREE.Vector3;
}

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);

export class SkeletonAnimator {
  private readonly rest = new Map<THREE.Object3D, Rest>();
  private readonly q = new THREE.Quaternion();
  private readonly d = new THREE.Quaternion();
  private readonly inv = new THREE.Quaternion();
  private readonly animated: THREE.Object3D[];
  private weight = 0;
  private current: MotionDemo | null = null;
  private target: MotionDemo | null = null;
  private phase = 0;

  constructor(private readonly model: SkeletonModel) {
    const { rig, spine } = model;
    this.animated = [
      rig.pelvis,
      rig.head,
      rig.sternum,
      ...rig.girdles,
      ...rig.shoulders,
      ...rig.elbows,
      ...rig.hips,
      ...rig.knees,
      ...rig.ribs.map((r) => r.pivot),
      ...spine.segments.map((s) => s.joint),
    ];
    model.root.updateMatrixWorld(true);
    for (const o of this.animated) {
      this.rest.set(o, {
        local: o.quaternion.clone(),
        world: o.getWorldQuaternion(new THREE.Quaternion()),
        position: o.position.clone(),
      });
    }
  }

  /** Démo demandée (null = position de repos). */
  setDemo(demo: MotionDemo | null): void {
    this.target = demo;
  }

  /** Rotation autour d'un axe exprimé dans le repère monde de repos. */
  private rotateWorld(obj: THREE.Object3D, axis: THREE.Vector3, angle: number): void {
    const r = this.rest.get(obj);
    if (!r) return;
    this.q.setFromAxisAngle(axis, angle);
    this.inv.copy(r.world).invert();
    this.d.copy(this.inv).multiply(this.q).multiply(r.world);
    obj.quaternion.copy(obj.quaternion).multiply(this.d);
  }

  /** Rotation autour d'un axe local (articulations vertébrales). */
  private rotateLocal(obj: THREE.Object3D, axis: THREE.Vector3, angle: number): void {
    this.q.setFromAxisAngle(axis, angle);
    obj.quaternion.multiply(this.q);
  }

  private reset(): void {
    for (const [obj, r] of this.rest) {
      obj.quaternion.copy(r.local);
      obj.position.copy(r.position);
    }
  }

  /** @returns vrai si une animation est en cours (pour le rendu à la demande). */
  update(delta: number, playing: boolean): boolean {
    // fondu entre démos : on revient au repos avant de changer de mouvement
    const fadeSpeed = 2.2;
    if (this.current !== this.target) {
      this.weight = Math.max(0, this.weight - delta * fadeSpeed);
      if (this.weight === 0) {
        this.current = this.target;
        this.phase = 0;
      }
    } else if (this.current) {
      this.weight = Math.min(1, this.weight + delta * fadeSpeed);
    }
    if (playing) this.phase += delta;
    this.reset();
    if (!this.current || this.weight === 0) return this.current !== this.target;

    const w = this.weight * this.weight * (3 - 2 * this.weight);
    const t = this.phase * 1.15;
    const wave = Math.sin(t) * w;
    const lift = ((1 - Math.cos(t)) / 2) * w;
    const { rig, spine } = this.model;
    const segs = spine.segments;

    switch (this.current) {
      case "spine-wave": {
        for (const s of segs) {
          const amp = s.region === "lumbar" ? 0.05 : s.region === "thoracic" ? 0.028 : 0.04;
          this.rotateLocal(s.joint, X, amp * wave);
        }
        break;
      }
      case "neck-rotation": {
        segs.forEach((s) => {
          if (s.label === "C1") this.rotateLocal(s.joint, Y, 0.62 * wave);
          else if (s.region === "cervical") this.rotateLocal(s.joint, Y, 0.07 * wave);
        });
        break;
      }
      case "shoulder-abduction": {
        const theta = 1.65 * lift;
        rig.shoulders.forEach((sh, i) => {
          const side = i === 0 ? -1 : 1;
          this.rotateWorld(sh, Z, side * theta * 0.84);
        });
        rig.girdles.forEach((g, i) => {
          const side = i === 0 ? -1 : 1;
          this.rotateWorld(g, Z, side * theta * 0.14);
        });
        break;
      }
      case "breathing": {
        for (const r of rig.ribs) {
          const amp = 0.035 + (r.level / 12) * 0.03;
          this.rotateWorld(r.pivot, X, -amp * lift);
        }
        rig.sternum.position.y += 5 * lift;
        rig.sternum.position.z += 3 * lift;
        break;
      }
      case "pelvic-tilt": {
        const tilt = 0.17 * wave;
        this.rotateLocal(rig.pelvis, X, tilt);
        for (const s of segs) if (s.region === "lumbar") this.rotateLocal(s.joint, X, -tilt / 5);
        break;
      }
      case "hip-flexion": {
        this.rotateLocal(rig.hips[0], X, -1.15 * lift);
        this.rotateLocal(rig.knees[0], X, 1.25 * lift);
        break;
      }
      case "knee-flexion": {
        this.rotateLocal(rig.knees[0], X, 1.75 * lift);
        this.rotateLocal(rig.hips[0], X, -0.3 * lift);
        break;
      }
    }
    return true;
  }
}
