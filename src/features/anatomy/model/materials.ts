import * as THREE from "three";
import { colors } from "@/styles/tokens";

/**
 * Matériaux partagés (un seul exemplaire par type → moins de changements d'état GPU).
 * Os : ivoire légèrement mat, reflets satinés ; mise en évidence : bronze du logo.
 */
export interface AnatomyMaterials {
  readonly bone: THREE.MeshPhysicalMaterial;
  readonly boneDim: THREE.MeshPhysicalMaterial;
  readonly highlight: THREE.MeshPhysicalMaterial;
  readonly disc: THREE.MeshPhysicalMaterial;
  readonly cartilage: THREE.MeshPhysicalMaterial;
  dispose(): void;
}

export function createAnatomyMaterials(): AnatomyMaterials {
  const bone = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colors.bone),
    roughness: 0.52,
    metalness: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.55,
    sheen: 0.4,
    sheenColor: new THREE.Color(colors.bronzeLight),
    sheenRoughness: 0.7,
  });
  const boneDim = bone.clone();
  boneDim.color = new THREE.Color("#b9ad9c");
  boneDim.roughness = 0.7;
  boneDim.sheen = 0.1;

  const highlight = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#c99a68"),
    roughness: 0.32,
    metalness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    emissive: new THREE.Color(colors.bronze),
    emissiveIntensity: 0.22,
  });
  const disc = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#d8d3c9"),
    roughness: 0.38,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    sheen: 0.6,
    sheenColor: new THREE.Color("#e9f0f2"),
  });
  const cartilage = disc.clone();
  cartilage.color = new THREE.Color("#e2dacd");

  return {
    bone,
    boneDim,
    highlight,
    disc,
    cartilage,
    dispose() {
      bone.dispose();
      boneDim.dispose();
      highlight.dispose();
      disc.dispose();
      cartilage.dispose();
    },
  };
}
