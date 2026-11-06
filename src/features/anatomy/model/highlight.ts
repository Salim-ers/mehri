import type * as THREE from "three";
import type { RegionId } from "@/content/anatomy";
import type { AnatomyMaterials } from "./materials";

/** Matériau d'origine de chaque os sélectionnable. */
export function captureMaterials(meshes: readonly THREE.Mesh[]): Map<THREE.Mesh, THREE.Material> {
  const map = new Map<THREE.Mesh, THREE.Material>();
  for (const m of meshes) map.set(m, m.material as THREE.Material);
  return map;
}

/** Met en évidence la région choisie, atténue les autres ; null = état d'origine. */
export function applyRegionHighlight(originals: ReadonlyMap<THREE.Mesh, THREE.Material>, materials: AnatomyMaterials, selected: RegionId | null): void {
  for (const [mesh, original] of originals) {
    const region = mesh.userData.region as RegionId | undefined;
    mesh.material = !selected ? original : region === selected ? materials.highlight : materials.boneDim;
  }
}
