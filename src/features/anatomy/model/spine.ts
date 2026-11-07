import * as THREE from "three";
import { runSync, type Builder } from "./scheduler";
import { computeFrames, SACRAL_SLOPE, VERTEBRAE, type SpineRegion } from "./spine-profile";
import {
  createCoccyxGeometry,
  createDiscGeometry,
  createSacrumGeometry,
  createVertebraGeometry,
  type Detail,
} from "./vertebra-geometry";

export interface SpineSegment {
  readonly label: string;
  readonly region: SpineRegion;
  /** Pivot articulaire (centre du disque sous la vertèbre). Les vertèbres sus-jacentes sont ses enfants. */
  readonly joint: THREE.Group;
  readonly mesh: THREE.Mesh;
  readonly disc: THREE.Mesh | null;
  /** rotation de repos du pivot (sagittale), pour les animations */
  readonly restX: number;
}

export interface SpineModel {
  /** Origine = centre du plateau sacré (S1). */
  readonly root: THREE.Group;
  /** C1 → L5 */
  readonly segments: readonly SpineSegment[];
  readonly sacrum: THREE.Mesh;
  readonly coccyx: THREE.Mesh;
  /** Pivot portant le crâne (au-dessus de C1). */
  readonly headMount: THREE.Group;
  readonly geometries: readonly THREE.BufferGeometry[];
}

export interface SpineMaterials {
  readonly bone: THREE.Material;
  readonly disc: THREE.Material;
}

/** Région de l'atlas d'un étage vertébral : cervicales, thorax (T1–T12) ou lombaires (L1–L5). */
export function spineRegion(region: SpineRegion): "cervicales" | "thorax" | "lombaires" {
  return region === "cervical" ? "cervicales" : region === "thoracic" ? "thorax" : "lombaires";
}

export function createSpine(detail: Detail, materials: SpineMaterials): SpineModel {
  return runSync(spineBuilder(detail, materials));
}

/** Version découpée (un « yield » par vertèbre). */
export function* spineBuilder(detail: Detail, materials: SpineMaterials): Builder<SpineModel> {
  const frames = computeFrames(); // C1 → L5
  const geometries: THREE.BufferGeometry[] = [];
  const root = new THREE.Group();
  root.name = "spine-root";

  const segments: SpineSegment[] = [];
  let parent: THREE.Object3D = root;
  let parentY = 0;
  let parentZ = 0;
  let parentTilt = 0;

  const ordered = [...frames].reverse(); // L5 → C1
  for (const f of ordered) {
    const joint = new THREE.Group();
    joint.name = `joint-${f.spec.label}`;
    // pivot au centre du disque (ou à la base de C1)
    const jy = f.spec.discBelow > 0 ? f.discY : f.y - f.spec.height / 2;
    const jz = f.spec.discBelow > 0 ? f.discZ : f.z;
    const jt = f.spec.discBelow > 0 ? f.discTilt : f.tilt;
    const dy = jy - parentY;
    const dz = jz - parentZ;
    const c = Math.cos(parentTilt);
    const s = Math.sin(parentTilt);
    joint.position.set(0, dy * c + dz * s, -dy * s + dz * c);
    const restX = jt - parentTilt;
    joint.rotation.x = restX;
    parent.add(joint);

    let disc: THREE.Mesh | null = null;
    if (f.spec.discBelow > 0) {
      const dg = createDiscGeometry(f.spec, detail, f.spec.discBelow);
      geometries.push(dg);
      disc = new THREE.Mesh(dg, materials.disc);
      disc.name = `disc-${f.spec.label}`;
      disc.userData = { region: spineRegion(f.spec.region), label: `Disque ${f.spec.label}` };
      joint.add(disc);
    }

    const vg = createVertebraGeometry(f.spec, detail);
    geometries.push(vg);
    const mesh = new THREE.Mesh(vg, materials.bone);
    mesh.name = f.spec.label;
    mesh.userData = { region: spineRegion(f.spec.region), label: f.spec.label };
    // centre du corps relatif au pivot
    const by = f.y - jy;
    const bz = f.z - jz;
    const cj = Math.cos(jt);
    const sj = Math.sin(jt);
    mesh.position.set(0, by * cj + bz * sj, -by * sj + bz * cj);
    mesh.rotation.x = f.tilt - jt;
    joint.add(mesh);

    segments.unshift({ label: f.spec.label, region: f.spec.region, joint, mesh, disc, restX });
    parent = joint;
    parentY = jy;
    parentZ = jz;
    parentTilt = jt;
    yield;
  }

  // Support du crâne : au sommet de C1
  const c1 = frames[0]!;
  const headMount = new THREE.Group();
  headMount.name = "head-mount";
  headMount.position.set(0, c1.spec.height * 0.55, 2);
  segments[0]!.mesh.add(headMount);

  // Sacrum + coccyx
  const l5 = VERTEBRAE[VERTEBRAE.length - 1]!;
  const sg = createSacrumGeometry(l5, detail);
  geometries.push(sg);
  const sacrum = new THREE.Mesh(sg, materials.bone);
  sacrum.name = "Sacrum";
  sacrum.userData = { region: "bassin", label: "Sacrum" };
  sacrum.rotation.x = SACRAL_SLOPE;
  root.add(sacrum);

  const cg = createCoccyxGeometry(detail);
  geometries.push(cg);
  const coccyx = new THREE.Mesh(cg, materials.bone);
  coccyx.name = "Coccyx";
  coccyx.userData = { region: "bassin", label: "Coccyx" };
  coccyx.position.set(0, -104, 9);
  coccyx.rotation.x = -0.35;
  sacrum.add(coccyx);

  return { root, segments, sacrum, coccyx, headMount, geometries };
}

export function disposeGeometries(list: readonly THREE.BufferGeometry[]): void {
  for (const g of list) g.dispose();
}
