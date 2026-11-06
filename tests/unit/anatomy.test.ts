import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { REGION_IDS } from "@/content/anatomy";
import { createAnatomyMaterials } from "@/features/anatomy/model/materials";
import { SkeletonAnimator } from "@/features/anatomy/model/motion";
import { createSkeleton } from "@/features/anatomy/model/skeleton";
import { computeFrames, sagittalOffset, SPINE_LENGTH_MM, VERTEBRAE } from "@/features/anatomy/model/spine-profile";
import { createSpine } from "@/features/anatomy/model/spine";
import { stepForProgress } from "@/features/anatomy/model/hero-controller";

describe("profil rachidien", () => {
  it("compte 7 cervicales, 12 thoraciques et 5 lombaires", () => {
    expect(VERTEBRAE.filter((v) => v.region === "cervical")).toHaveLength(7);
    expect(VERTEBRAE.filter((v) => v.region === "thoracic")).toHaveLength(12);
    expect(VERTEBRAE.filter((v) => v.region === "lumbar")).toHaveLength(5);
  });
  it("a une longueur C1–L5 d'adulte plausible (55–75 cm)", () => {
    expect(SPINE_LENGTH_MM).toBeGreaterThan(550);
    expect(SPINE_LENGTH_MM).toBeLessThan(750);
  });
  it("les corps vertébraux s'élargissent de C3 à L5", () => {
    const widths = VERTEBRAE.slice(2).map((v) => v.width);
    for (let i = 1; i < widths.length; i++) expect(widths[i]!).toBeGreaterThanOrEqual(widths[i - 1]!);
  });
  it("respecte les trois courbures : lordoses cervicale et lombaire, cyphose thoracique", () => {
    const frames = computeFrames();
    const z = (label: string) => frames.find((f) => f.spec.label === label)!.z;
    expect(z("L3")).toBeGreaterThan(0);
    expect(z("T7")).toBeLessThan(0);
    expect(z("C4")).toBeGreaterThan(z("T1"));
    expect(sagittalOffset(0)).toBe(0);
  });
  it("empile les vertèbres sans recouvrement", () => {
    const frames = computeFrames();
    for (let i = 1; i < frames.length; i++) expect(frames[i - 1]!.y).toBeGreaterThan(frames[i]!.y);
  });
});

describe("modèles 3D procéduraux", () => {
  const materials = createAnatomyMaterials();
  it("génère une colonne complète et des géométries finies", () => {
    const spine = createSpine("low", materials);
    expect(spine.segments).toHaveLength(24);
    for (const g of spine.geometries) {
      const pos = g.attributes.position as THREE.BufferAttribute;
      expect(pos.count).toBeGreaterThan(0);
      for (let i = 0; i < pos.array.length; i++) expect(Number.isFinite(pos.array[i])).toBe(true);
    }
  });
  it("le squelette couvre les sept régions de l'atlas et reste dans une enveloppe humaine", () => {
    const model = createSkeleton("low", materials);
    const regions = new Set(model.selectable.map((m) => m.userData.region as string));
    for (const r of REGION_IDS) expect(regions, r).toContain(r);
    const box = new THREE.Box3().setFromObject(model.root);
    expect(box.max.y).toBeGreaterThan(1650);
    expect(box.max.y).toBeLessThan(1850);
    expect(box.min.y).toBeGreaterThan(-60);
    expect(box.max.x - box.min.x).toBeLessThan(700);
  });
  it("les animations reviennent exactement à la position de repos", () => {
    const model = createSkeleton("low", materials);
    const animator = new SkeletonAnimator(model);
    const knee = model.rig.knees[0];
    const rest = knee.quaternion.clone();
    animator.setDemo("knee-flexion");
    for (let i = 0; i < 90; i++) animator.update(1 / 30, true);
    expect(knee.quaternion.angleTo(rest)).toBeGreaterThan(0.2);
    animator.setDemo(null);
    for (let i = 0; i < 90; i++) animator.update(1 / 30, true);
    expect(knee.quaternion.angleTo(rest)).toBeLessThan(1e-6);
  });
  it("découpe la narration d'accueil en trois temps", () => {
    expect([0, 0.2, 0.4, 0.6, 0.8, 1].map(stepForProgress)).toEqual([0, 0, 1, 1, 2, 2]);
  });
});
