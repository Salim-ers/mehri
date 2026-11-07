import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { getRegion, REGION_IDS } from "@/content/anatomy";
import { BODY, fitFullBody, formatOf, HERO_CHAPTERS, heroChapterAt, heroKeyframes, heroPose, heroXRayLine, overviewPose, regionPose } from "@/features/anatomy/model/director";
import { isShown, LookManager } from "@/features/anatomy/model/looks";
import { createBoneFamily, createXRayFamily, FAR_ABOVE, FAR_BELOW } from "@/features/anatomy/model/materials";
import { SkeletonAnimator } from "@/features/anatomy/model/motion";
import { cameraPosition, dampPose, OrbitInput, pose, poseFromLookAt } from "@/features/anatomy/model/orbit";
import { createSkeleton } from "@/features/anatomy/model/skeleton";
import { computeFrames, sagittalOffset, SPINE_LENGTH_MM, VERTEBRAE } from "@/features/anatomy/model/spine-profile";
import { createSpine } from "@/features/anatomy/model/spine";

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
  const materials = createBoneFamily("low");
  it("génère une colonne complète et des géométries finies", () => {
    const spine = createSpine("low", materials);
    expect(spine.segments).toHaveLength(24);
    for (const g of spine.geometries) {
      const pos = g.attributes.position as THREE.BufferAttribute;
      expect(pos.count).toBeGreaterThan(0);
      for (let i = 0; i < pos.array.length; i++) expect(Number.isFinite(pos.array[i])).toBe(true);
    }
  });
  it("le squelette couvre les sept régions (thorax et lombaires distincts) et reste dans une enveloppe humaine", () => {
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
});

describe("mise en scène (cadrages)", () => {
  it("reconnaît les formats d'écran", () => {
    expect(formatOf(390 / 844)).toBe("portrait");
    expect(formatOf(1024 / 1366)).toBe("portrait");
    expect(formatOf(1024 / 800)).toBe("tablet");
    expect(formatOf(1440 / 900)).toBe("desktop");
    expect(formatOf(3440 / 1440)).toBe("ultrawide");
  });

  it("le squelette entier tient dans le cadre, quel que soit le format", () => {
    const tan = Math.tan((15 * Math.PI) / 180);
    for (const aspect of [0.46, 0.75, 1.33, 1.6, 2.4]) {
      const d = fitFullBody(aspect, 0.9);
      const halfH = d * tan;
      expect(halfH * 2).toBeGreaterThanOrEqual((BODY.top - BODY.bottom) * 0.99);
      expect(halfH * aspect).toBeGreaterThanOrEqual(BODY.halfWidth);
    }
  });

  it("accueil : composition propre à chaque format (pas une simple réduction)", () => {
    const desktop = heroKeyframes(1440 / 900);
    const mobile = heroKeyframes(390 / 844);
    expect(desktop).toHaveLength(HERO_CHAPTERS.length);
    // ordinateur : sujet à droite du texte ; mobile : sujet centré dans la moitié haute
    expect(desktop[0]!.shiftX).toBeGreaterThan(0.1);
    expect(mobile[0]!.shiftX).toBe(0);
    expect(mobile[0]!.shiftY).toBeGreaterThan(0.1);
    // chapitre « nuque » : la caméra se rapproche des cervicales
    expect(desktop[1]!.distance).toBeLessThan(desktop[0]!.distance / 3);
    expect(desktop[1]!.ty).toBeGreaterThan(7.5);
    // chapitre « bassin » : vue de profil pour lire la bascule
    expect(Math.abs(desktop[3]!.yaw)).toBeGreaterThan(1.2);
  });

  it("la pose de l'accueil est continue et tient chaque chapitre", () => {
    const keys = heroKeyframes(1.6);
    const out = pose({ ty: 0, distance: 1 });
    heroPose(1, keys, out);
    expect(out.ty).toBeCloseTo(keys[1]!.ty, 5);
    heroPose(1.1, keys, out);
    expect(out.ty).toBeCloseTo(keys[1]!.ty, 5);
    let prev = heroPose(0, keys, pose({ ty: 0, distance: 1 })).distance;
    for (let p = 0.01; p <= 1; p += 0.01) {
      const d = heroPose(p, keys, out).distance;
      expect(Math.abs(d - prev)).toBeLessThan(2.5);
      prev = d;
    }
  });

  it("chaque chapitre joue la démonstration de sa région, rien entre deux chapitres", () => {
    expect(heroChapterAt(1)?.demo).toBe("neck-rotation");
    expect(heroChapterAt(2.1)?.demo).toBe("shoulder-abduction");
    expect(heroChapterAt(3)?.demo).toBe("pelvic-tilt");
    expect(heroChapterAt(1.5)).toBeNull();
  });

  it("la ligne radiographique ne bascule qu'au dernier chapitre, de haut en bas", () => {
    expect(heroXRayLine(0)).toBeGreaterThan(BODY.top);
    expect(heroXRayLine(3)).toBeGreaterThan(BODY.top);
    expect(heroXRayLine(4)).toBeLessThan(BODY.bottom);
    expect(heroXRayLine(3.6)).toBeLessThan(heroXRayLine(3.4));
  });

  it("chaque région a un cadrage valide, recentré vers la région", () => {
    for (const id of REGION_IDS) {
      const p = regionPose(id, "explore", 1.6);
      expect(p.distance, id).toBeGreaterThan(2);
      expect(p.distance, id).toBeLessThan(14);
      expect(p.ty, id).toBeCloseTo(getRegion(id).camera.target[1], 5);
    }
    expect(overviewPose("explore", 1.6).shiftX).toBeLessThan(0);
    expect(overviewPose("explore", 0.5).shiftX).toBe(0);
  });
});

describe("caméra orbitale", () => {
  it("une pose déduite d'un regard redonne la même position", () => {
    const p = poseFromLookAt([3, 7, 4], [0, 6, 0]);
    const out = { x: 0, y: 0, z: 0 };
    cameraPosition(p, out);
    expect(out.x).toBeCloseTo(3, 6);
    expect(out.y).toBeCloseTo(7, 6);
    expect(out.z).toBeCloseTo(4, 6);
  });

  it("l'amortissement converge vers la pose visée, indépendamment de la cadence", () => {
    const a = pose({ ty: 0, distance: 10 });
    const b = pose({ ty: 0, distance: 10 });
    const goal = pose({ ty: 5, distance: 4, yaw: 1 });
    for (let i = 0; i < 60; i++) dampPose(a, goal, 3, 1 / 60);
    for (let i = 0; i < 30; i++) dampPose(b, goal, 3, 1 / 30);
    expect(a.ty).toBeCloseTo(b.ty, 6);
    let gap = 1;
    for (let i = 0; i < 600; i++) gap = dampPose(a, goal, 3, 1 / 60);
    expect(gap).toBeLessThan(1e-4);
  });

  it("le zoom et l'inclinaison restent bornés", () => {
    const input = new OrbitInput();
    for (let i = 0; i < 50; i++) input.zoomBy(0.5, 0);
    expect(input.zoom).toBeCloseTo(0.55, 6);
    for (let i = 0; i < 50; i++) input.drag(0, 1, 0);
    expect(input.pitch).toBeLessThanOrEqual(0.75);
    for (let i = 0; i < 400; i++) input.relax(3, 1 / 60);
    expect(input.idle).toBe(true);
  });
});

describe("rendus : os, radiographie, bascule", () => {
  const bone = createBoneFamily("low");
  const xray = createXRayFamily();
  const model = createSkeleton("low", bone);
  const looks = new LookManager(model, bone, xray, { top: 9.75, bottom: -0.45 });

  it("chaque os a un jumeau radiographique qui partage sa géométrie (aucune copie)", () => {
    expect(looks.entries.length).toBe(model.selectable.length);
    for (const e of looks.entries) expect(e.twin.geometry).toBe(e.mesh.geometry);
    expect(looks.entries.some((e) => e.role === "spine")).toBe(true);
    expect(looks.entries.some((e) => e.role === "spineDisc")).toBe(true);
  });

  it("la ligne de balayage fait passer de l'os à la radiographie", () => {
    looks.setLine(FAR_ABOVE);
    looks.apply();
    expect(looks.entries.every((e) => isShown(e.mesh) && !isShown(e.twin))).toBe(true);
    expect(looks.xrayAmount).toBe(0);
    looks.setLine(4.6);
    looks.apply();
    expect(looks.entries.every((e) => isShown(e.mesh) && isShown(e.twin))).toBe(true);
    expect(bone.uniforms.uCut.value).toBe(4.6);
    looks.setLine(FAR_BELOW);
    looks.apply();
    expect(looks.entries.every((e) => !isShown(e.mesh) && isShown(e.twin))).toBe(true);
    expect(looks.xrayAmount).toBe(1);
  });

  it("masquer un os ne masque jamais les os qui lui sont rattachés (crâne, côtes)", () => {
    looks.setLine(FAR_BELOW);
    looks.apply();
    for (const e of looks.entries) {
      let o: THREE.Object3D | null = e.twin;
      while (o) {
        expect(o.visible, e.twin.name).toBe(true);
        o = o.parent;
      }
    }
  });

  it("isoler une région : les autres os deviennent une silhouette fantôme", () => {
    looks.setLine(FAR_ABOVE);
    looks.setRegion("epaules", null, true);
    looks.apply();
    const shoulders = looks.entries.filter((e) => e.region === "epaules");
    const others = looks.entries.filter((e) => e.region !== "epaules");
    expect(shoulders.length).toBeGreaterThan(0);
    expect(shoulders.every((e) => isShown(e.mesh) && e.mesh.material === bone.highlight)).toBe(true);
    expect(others.every((e) => !isShown(e.mesh) && isShown(e.twin) && e.twin.material === xray.ghost)).toBe(true);
    looks.setRegion(null, null, false);
    looks.apply();
    expect(looks.entries.every((e) => isShown(e.mesh) && !isShown(e.twin))).toBe(true);
  });

  it("le rendu radiographique est additif et sans écriture de profondeur", () => {
    for (const m of [xray.bone, xray.spine, xray.highlight, xray.ghost]) {
      expect(m.blending).toBe(THREE.AdditiveBlending);
      expect(m.depthWrite).toBe(false);
    }
  });

  it("la matière osseuse est patchée (matérialisation, découpe) avec un programme partagé", () => {
    for (const m of [bone.bone, bone.spine, bone.highlight, bone.disc]) {
      expect(typeof m.onBeforeCompile).toBe("function");
      expect(m.customProgramCacheKey()).toBe("bone-reveal-v1");
    }
  });
});
