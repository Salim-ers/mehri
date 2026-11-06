import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { REGION_IDS } from "@/content/anatomy";
import { createAnatomyMaterials, createXRayMaterials, XRayScan } from "@/features/anatomy/model/materials";
import { SkeletonAnimator } from "@/features/anatomy/model/motion";
import { createSkeleton } from "@/features/anatomy/model/skeleton";
import { computeFrames, sagittalOffset, SPINE_LENGTH_MM, VERTEBRAE } from "@/features/anatomy/model/spine-profile";
import { createSpine } from "@/features/anatomy/model/spine";
import { heroLayout } from "@/features/anatomy/model/hero-controller";
import { xrayFraming } from "@/features/anatomy/model/xray-controller";

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
  it("adapte la composition de la colonne au format d'écran (pas une simple réduction)", () => {
    const desktop = heroLayout(1440, 900);
    const phone = heroLayout(390, 844);
    const ultrawide = heroLayout(3440, 1440);
    expect(desktop.offsetX).toBeGreaterThan(1.5); // colonne à droite du texte
    expect(phone.offsetX).toBeLessThan(desktop.offsetX); // colonne dans la moitié haute, près du bord droit
    expect(phone.targetY).toBeGreaterThan(desktop.targetY);
    expect(phone.distance).toBeLessThan(desktop.distance); // cadrage plus serré
    expect(ultrawide.offsetX).toBeGreaterThan(desktop.offsetX);
  });
  it("cadre le squelette radiographique entier sur grand écran, le tronc sur mobile", () => {
    const wide = xrayFraming(800, 900, 32);
    const narrow = xrayFraming(390, 700, 32);
    expect(wide.targetY).toBeLessThan(narrow.targetY);
    expect(wide.distance).toBeGreaterThan(narrow.distance);
  });
});

describe("rendu radiographique", () => {
  it("le squelette se construit avec les matériaux radiographiques", () => {
    const xray = createXRayMaterials();
    const model = createSkeleton("low", xray);
    expect(model.selectable.length).toBeGreaterThan(10);
    xray.dispose();
  });
  it("le balayage révèle la structure de haut en bas puis la laisse entièrement visible", () => {
    const { uniforms } = createXRayMaterials();
    const scan = new XRayScan(uniforms, 9.6, -0.2, { duration: 2, idleEvery: 0 });
    scan.update(0.2, true);
    const early = uniforms.uScan.value;
    scan.update(0.8, true);
    expect(uniforms.uScan.value).toBeLessThan(early);
    expect(uniforms.uRevealAll.value).toBe(0);
    scan.update(2, true);
    expect(uniforms.uRevealAll.value).toBe(1);
    expect(uniforms.uBandGain.value).toBe(0);
  });
  it("mouvement réduit : structure visible immédiatement, sans bande lumineuse", () => {
    const { uniforms } = createXRayMaterials();
    new XRayScan(uniforms, 9.6, -0.2).showStatic();
    expect(uniforms.uRevealAll.value).toBe(1);
    expect(uniforms.uBandGain.value).toBe(0);
  });
});
