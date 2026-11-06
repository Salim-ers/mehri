import * as THREE from "three";
import type { RegionId } from "@/content/anatomy";
import type { AnatomyMaterials } from "./materials";
import { runAsync, runSync, type Builder } from "./scheduler";
import { spineBuilder, type SpineModel } from "./spine";
import { DETAIL, mergeParts, strut, type Detail, type DetailConfig } from "./vertebra-geometry";

/**
 * Squelette pédagogique procédural (mm, sol à y = 0, face antérieure vers +z).
 * Proportions d'un adulte d'environ 1,75 m. Chaque os est construit en
 * coordonnées « monde » puis rattaché à son pivot articulaire avec
 * Object3D.attach (la transformation monde est conservée), ce qui permet
 * d'animer les articulations autour de centres anatomiquement plausibles.
 */

export interface RibPivot {
  readonly pivot: THREE.Group;
  readonly level: number;
}

export interface SkeletonRig {
  readonly pelvis: THREE.Group;
  readonly head: THREE.Group;
  readonly ribs: readonly RibPivot[];
  readonly sternum: THREE.Object3D;
  readonly girdles: readonly [THREE.Group, THREE.Group];
  readonly shoulders: readonly [THREE.Group, THREE.Group];
  readonly elbows: readonly [THREE.Group, THREE.Group];
  readonly hips: readonly [THREE.Group, THREE.Group];
  readonly knees: readonly [THREE.Group, THREE.Group];
}

export interface SkeletonModel {
  readonly root: THREE.Group;
  readonly spine: SpineModel;
  readonly rig: SkeletonRig;
  readonly selectable: readonly THREE.Mesh[];
  readonly geometries: readonly THREE.BufferGeometry[];
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Os long en révolution : profil [t, rayon] de `from` vers `to`. */
function latheBone(from: THREE.Vector3, to: THREE.Vector3, profile: ReadonlyArray<readonly [number, number]>, cfg: DetailConfig): THREE.BufferGeometry {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const pts = [new THREE.Vector2(0.01, 0), ...profile.map(([t, r]) => new THREE.Vector2(r, t * len)), new THREE.Vector2(0.01, len)];
  const geo = new THREE.LatheGeometry(pts, cfg.radial + 6);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  geo.applyMatrix4(new THREE.Matrix4().compose(from, q, new THREE.Vector3(1, 1, 1)));
  return geo;
}

function ellipsoid(center: THREE.Vector3, radii: THREE.Vector3, cfg: DetailConfig, rotation?: THREE.Euler): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, cfg.radial + 8, Math.round((cfg.radial + 8) * 0.7));
  geo.scale(radii.x, radii.y, radii.z);
  if (rotation) geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(rotation));
  geo.translate(center.x, center.y, center.z);
  return geo;
}

function tube(points: THREE.Vector3[], radius: number, cfg: DetailConfig, segments = 24, closed = false): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  return new THREE.TubeGeometry(curve, segments, radius, Math.max(6, cfg.radial - 2), closed);
}

/** Plaque plane extrudée (omoplate, sternum, os coxal) dans un plan défini par deux axes. */
function plate(outline: THREE.Vector2[], thickness: number, origin: THREE.Vector3, axisU: THREE.Vector3, axisV: THREE.Vector3, cfg: DetailConfig): THREE.BufferGeometry {
  const shape = new THREE.Shape(outline);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: Math.min(3, thickness * 0.4),
    bevelSize: 2.2,
    bevelSegments: cfg.bevelSegments,
    curveSegments: 10,
  });
  geo.translate(0, 0, -thickness / 2);
  const u = axisU.clone().normalize();
  const w = new THREE.Vector3().crossVectors(u, axisV).normalize();
  const vv = new THREE.Vector3().crossVectors(w, u).normalize();
  const basis = new THREE.Matrix4().makeBasis(u, vv, w);
  geo.applyMatrix4(basis);
  geo.translate(origin.x, origin.y, origin.z);
  return geo;
}

interface BoneBuild {
  readonly mesh: THREE.Mesh;
  readonly region: RegionId;
}

export function createSkeleton(detail: Detail, materials: AnatomyMaterials): SkeletonModel {
  return runSync(skeletonBuilder(detail, materials));
}

/** Construction asynchrone découpée : n'occupe jamais le fil principal plus de quelques ms. */
export function createSkeletonAsync(detail: Detail, materials: AnatomyMaterials, signal?: AbortSignal): Promise<SkeletonModel> {
  return runAsync(skeletonBuilder(detail, materials), 8, signal);
}

export function* skeletonBuilder(detail: Detail, materials: AnatomyMaterials): Builder<SkeletonModel> {
  const cfg = DETAIL[detail];
  const geometries: THREE.BufferGeometry[] = [];
  const selectable: THREE.Mesh[] = [];
  const root = new THREE.Group();
  root.name = "skeleton";

  const bone = (name: string, region: RegionId, parts: THREE.BufferGeometry[], material: THREE.Material = materials.bone): BoneBuild => {
    const geo = mergeParts(parts);
    geometries.push(geo);
    const mesh = new THREE.Mesh(geo, material);
    mesh.name = name;
    mesh.userData = { region, label: name };
    root.add(mesh);
    selectable.push(mesh);
    return { mesh, region };
  };

  const pivotAt = (name: string, at: THREE.Vector3): THREE.Group => {
    const g = new THREE.Group();
    g.name = name;
    g.position.copy(at);
    root.add(g);
    return g;
  };

  // ── Bassin (pivot à l'axe des hanches) ─────────────────────
  const HIP_Y = 880;
  const pelvis = pivotAt("pelvis", v(0, HIP_Y, 12));

  // Colonne : plateau sacré à ~1000 mm
  const spine = yield* spineBuilder(detail, { bone: materials.bone, disc: materials.disc });
  spine.root.position.set(0, 1002, -22);
  root.add(spine.root);
  for (const seg of spine.segments) {
    selectable.push(seg.mesh);
    if (seg.disc) selectable.push(seg.disc);
  }
  selectable.push(spine.sacrum, spine.coccyx);
  geometries.push(...spine.geometries);
  root.updateMatrixWorld(true);

  // Os coxaux
  for (const s of [-1, 1] as const) {
    const acetabulum = v(s * 88, HIP_Y, 18);
    // orientation de la cavité : en dehors, en avant et en bas
    const cupDir = v(s * 0.78, -0.42, 0.46).normalize();
    const rim = new THREE.TorusGeometry(27, 5.2, 8, cfg.radial + 14);
    rim.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), cupDir)));
    rim.translate(acetabulum.x + cupDir.x * 9, acetabulum.y + cupDir.y * 9, acetabulum.z + cupDir.z * 9);
    const parts = [
      iliumGeometry(s, cfg),
      rim,
      // corps de l'os coxal autour du cotyle
      ellipsoid(acetabulum.clone().addScaledVector(cupDir, -16), v(24, 30, 26), cfg),
      // anneau obturé : branches pubiennes et ischiatiques
      tube(
        [
          v(s * 74, 868, 40),
          v(s * 44, 836, 64),
          v(s * 12, 816, 74),
          v(s * 14, 790, 66),
          v(s * 34, 772, 40),
          v(s * 58, 774, 4),
          v(s * 72, 850, -8),
        ],
        9.5,
        cfg,
        28,
      ),
      // tubérosité ischiatique
      ellipsoid(v(s * 58, 778, 2), v(15, 21, 16), cfg),
      // symphyse pubienne
      ellipsoid(v(s * 8, 802, 72), v(7, 18, 9), cfg),
    ];
    const coxal = bone(s < 0 ? "Os coxal droit" : "Os coxal gauche", "bassin", parts);
    pelvis.attach(coxal.mesh);
    yield;
  }
  pelvis.attach(spine.root);

  // ── Côtes, cartilages et sternum ──────────────────────────
  yield;
  const thoracic = spine.segments.filter((sg) => sg.region === "thoracic");
  const ribs: RibPivot[] = [];
  const sternumTop = v(0, 1452, 92);
  const sternumBottom = v(0, 1262, 118);
  const tmp = new THREE.Vector3();
  for (const [i, seg] of thoracic.entries()) {
    const level = i + 1;
    seg.mesh.getWorldPosition(tmp);
    const head = tmp.clone();
    const t = i / 11;
    // demi-largeur et profondeur de la cage à ce niveau
    const half = 58 + 90 * Math.sin(Math.min(1, (i + 1.2) / 8.5) * Math.PI * 0.5) - (i > 8 ? (i - 8) * 6 : 0);
    const frontZ = head.z + 70 + 95 * Math.sin(Math.min(1, (i + 1) / 7) * Math.PI * 0.5);
    const drop = 30 + 70 * t;
    const sternalY = THREE.MathUtils.lerp(sternumTop.y - 10, sternumBottom.y + 20, Math.min(1, i / 6));
    const levelGeos: THREE.BufferGeometry[] = [];
    const cartGeos: THREE.BufferGeometry[] = [];
    for (const s of [-1, 1] as const) {
      const p0 = v(s * 14, head.y + 4, head.z - 12);
      const p1 = v(s * (half * 0.42), head.y + 2, head.z - 30);
      const p2 = v(s * half * 0.86, head.y - drop * 0.25, head.z + 8);
      const p3 = v(s * half, head.y - drop * 0.55, (head.z + frontZ) * 0.5 + 6);
      const p4 = v(s * half * 0.8, head.y - drop * 0.9, frontZ - 22);
      const floating = level >= 11;
      const ribEnd = floating
        ? v(s * half * 0.9, head.y - drop * 0.55, head.z + 58 + (level - 11) * -16)
        : v(s * half * 0.52, head.y - drop, frontZ - 6);
      const pts = floating ? [p0, p1, p2, ribEnd] : [p0, p1, p2, p3, p4, ribEnd];
      const r = level === 1 ? 4.6 : 4.2;
      const rg = tube(pts, r, cfg, floating ? 16 : 30);
      // aplatissement de la côte (section ovale)
      levelGeos.push(rg);
      if (!floating) {
        const target =
          level <= 7
            ? v(s * 12, sternalY, sternumTop.z + (sternalY < 1330 ? 22 : 6))
            : v(s * (20 + (level - 7) * 13), sternumBottom.y + 28 - (level - 8) * 8, sternumBottom.z - 8 - (level - 8) * 6);
        cartGeos.push(tube([ribEnd, ribEnd.clone().lerp(target, 0.5).add(v(0, 6, 4)), target], 3.4, cfg, 12));
      }
    }
    const ribMesh = bone(`Côtes ${level}`, "thorax", levelGeos);
    const pivot = pivotAt(`rib-pivot-${level}`, v(0, head.y + 4, head.z - 12));
    pivot.attach(ribMesh.mesh);
    if (cartGeos.length) {
      const cart = bone(`Cartilages costaux ${level}`, "thorax", cartGeos, materials.cartilage);
      pivot.attach(cart.mesh);
    }
    seg.mesh.attach(pivot);
    ribs.push({ pivot, level });
    yield;
  }

  const sternumOutline = [
    new THREE.Vector2(-26, 0), new THREE.Vector2(-30, -22), new THREE.Vector2(-18, -48), new THREE.Vector2(-16, -60),
    new THREE.Vector2(-20, -110), new THREE.Vector2(-17, -160), new THREE.Vector2(-9, -182), new THREE.Vector2(-4, -205),
    new THREE.Vector2(4, -205), new THREE.Vector2(9, -182), new THREE.Vector2(17, -160), new THREE.Vector2(20, -110),
    new THREE.Vector2(16, -60), new THREE.Vector2(18, -48), new THREE.Vector2(30, -22), new THREE.Vector2(26, 0),
    new THREE.Vector2(8, -6), new THREE.Vector2(-8, -6),
  ];
  const stDir = new THREE.Vector3().subVectors(sternumBottom, sternumTop).normalize();
  const sternum = bone(
    "Sternum",
    "thorax",
    [plate(sternumOutline, 11, sternumTop, v(1, 0, 0), stDir.clone().negate(), cfg)],
  );
  const t4 = thoracic[3];
  if (t4) t4.mesh.attach(sternum.mesh);

  // ── Ceinture scapulaire et membres supérieurs ─────────────
  const t2 = thoracic[1]!;
  const girdles: THREE.Group[] = [];
  const shoulders: THREE.Group[] = [];
  const elbows: THREE.Group[] = [];
  for (const s of [-1, 1] as const) {
    const sc = v(s * 22, 1450, 96); // sterno-claviculaire
    const acromion = v(s * 168, 1478, -18);
    const glenoid = v(s * 170, 1430, -26);
    const girdle = pivotAt(`girdle-${s}`, sc);
    const clavicle = bone(s > 0 ? "Clavicule gauche" : "Clavicule droite", "epaules", [
      tube([sc, v(s * 60, 1462, 92), v(s * 110, 1474, 52), v(s * 150, 1480, 4), acromion], 6.2, cfg, 24),
    ]);
    // Omoplate : plaque triangulaire posterieure + épine + acromion + coracoïde
    const scapOutline = [
      new THREE.Vector2(0, 0), // angle supérieur
      new THREE.Vector2(20, -70),
      new THREE.Vector2(32, -150), // angle inférieur
      new THREE.Vector2(58, -110),
      new THREE.Vector2(92, -38), // bord latéral → col
      new THREE.Vector2(96, -16),
      new THREE.Vector2(60, 2),
    ];
    const scapOrigin = v(s * 72, 1468, -92);
    const scapU = v(s * 0.92, 0, 0.38);
    const scapula = bone(s > 0 ? "Omoplate gauche" : "Omoplate droite", "epaules", [
      plate(
        scapOutline.map((p) => new THREE.Vector2(p.x, p.y)),
        6,
        scapOrigin,
        scapU,
        v(0, 1, -0.12),
        cfg,
      ),
      tube([v(s * 78, 1420, -104), v(s * 120, 1440, -98), v(s * 156, 1468, -60), acromion], 7, cfg, 18),
      ellipsoid(acromion.clone().add(v(s * -4, 0, 4)), v(16, 6, 20), cfg),
      tube([v(s * 150, 1440, -36), v(s * 146, 1452, -4), v(s * 136, 1446, 18)], 5, cfg, 10),
      ellipsoid(glenoid.clone().add(v(s * -10, 0, 0)), v(9, 22, 15), cfg),
    ]);
    girdle.attach(clavicle.mesh);
    girdle.attach(scapula.mesh);

    // Humérus
    const headC = v(s * 182, 1428, -24);
    const elbow = v(s * 205, 1110, -18);
    const shoulder = pivotAt(`shoulder-${s}`, headC);
    const humerus = bone(s > 0 ? "Humérus gauche" : "Humérus droit", "epaules", [
      ellipsoid(headC, v(24, 24, 24), cfg),
      ellipsoid(headC.clone().add(v(s * 16, 8, 12)), v(12, 14, 12), cfg), // tubercules
      latheBone(headC.clone().add(v(s * 6, -20, 0)), elbow.clone().add(v(0, 18, 0)), [
        [0, 15], [0.12, 12], [0.5, 10.5], [0.82, 12], [0.96, 22], [1, 26],
      ], cfg),
      ellipsoid(elbow.clone().add(v(0, 6, 4)), v(30, 13, 15), cfg, new THREE.Euler(0, 0, 0)),
    ]);
    shoulder.attach(humerus.mesh);

    // Avant-bras (radius + ulna) et main
    const wrist = v(s * 222, 860, 12);
    const elbowPivot = pivotAt(`elbow-${s}`, elbow);
    const forearm = bone(s > 0 ? "Avant-bras gauche" : "Avant-bras droit", "epaules", [
      latheBone(elbow.clone().add(v(s * -10, -4, -10)), wrist.clone().add(v(s * -12, 4, -6)), [
        [0, 13], [0.08, 9], [0.5, 7], [0.92, 8], [1, 9],
      ], cfg), // ulna
      ellipsoid(elbow.clone().add(v(s * -10, 4, -22)), v(10, 14, 10), cfg), // olécrane
      latheBone(elbow.clone().add(v(s * 12, -8, 2)), wrist.clone().add(v(s * 10, 2, 4)), [
        [0, 9], [0.1, 7], [0.55, 7.5], [0.92, 12], [1, 14],
      ], cfg), // radius
    ]);
    elbowPivot.attach(forearm.mesh);

    const hand = handGeometry(wrist, s, cfg);
    const handMesh = bone(s > 0 ? "Main gauche" : "Main droite", "epaules", hand);
    elbowPivot.attach(handMesh.mesh);

    shoulder.attach(elbowPivot);
    girdle.attach(shoulder);
    t2.mesh.attach(girdle);
    girdles.push(girdle);
    shoulders.push(shoulder);
    elbows.push(elbowPivot);
    yield;
  }

  // ── Crâne ─────────────────────────────────────────────────
  spine.headMount.updateWorldMatrix(true, false);
  const headBase = spine.headMount.getWorldPosition(new THREE.Vector3());
  const head = pivotAt("head", headBase);
  const cranium = headBase.clone().add(v(0, 96, -8));
  const skull = bone("Crâne", "cervicales", [
    ellipsoid(cranium, v(72, 84, 96), cfg),
    ellipsoid(cranium.clone().add(v(0, -58, 62)), v(46, 44, 34), cfg), // massif facial
    ellipsoid(cranium.clone().add(v(0, -10, 74)), v(56, 22, 22), cfg), // arcades
    tube([cranium.clone().add(v(-58, -38, 36)), cranium.clone().add(v(-62, -44, 10))], 6, cfg, 6),
    tube([cranium.clone().add(v(58, -38, 36)), cranium.clone().add(v(62, -44, 10))], 6, cfg, 6),
    ellipsoid(cranium.clone().add(v(0, -64, -30)), v(46, 26, 40), cfg), // base / occiput
  ]);
  const jaw = bone("Mandibule", "cervicales", [
    tube(
      [
        cranium.clone().add(v(-50, -56, 6)),
        cranium.clone().add(v(-48, -102, 18)),
        cranium.clone().add(v(-34, -118, 52)),
        cranium.clone().add(v(0, -124, 80)),
        cranium.clone().add(v(34, -118, 52)),
        cranium.clone().add(v(48, -102, 18)),
        cranium.clone().add(v(50, -56, 6)),
      ],
      8,
      cfg,
      36,
    ),
    ellipsoid(cranium.clone().add(v(0, -122, 80)), v(16, 10, 9), cfg),
  ]);
  head.attach(skull.mesh);
  head.attach(jaw.mesh);
  spine.headMount.attach(head);
  yield;

  // ── Membres inférieurs ────────────────────────────────────
  const hips: THREE.Group[] = [];
  const knees: THREE.Group[] = [];
  for (const s of [-1, 1] as const) {
    const fhead = v(s * 88, HIP_Y, 18);
    const knee = v(s * 64, 482, 4);
    const ankle = v(s * 62, 78, -6);
    const hip = pivotAt(`hip-${s}`, fhead);
    const femur = bone(s > 0 ? "Fémur gauche" : "Fémur droit", "hanches", [
      ellipsoid(fhead, v(23, 23, 23), cfg),
      strut(fhead, v(s * 128, 852, 10), 13, cfg, 1.15), // col fémoral
      ellipsoid(v(s * 140, 866, 2), v(17, 24, 19), cfg), // grand trochanter
      ellipsoid(v(s * 118, 818, 14), v(10, 10, 10), cfg), // petit trochanter
      latheBone(v(s * 132, 842, 8), knee.clone().add(v(0, 30, 0)), [
        [0, 18], [0.12, 15], [0.5, 13], [0.86, 17], [1, 26],
      ], cfg),
      ellipsoid(knee.clone().add(v(s * -18, 14, -6)), v(19, 24, 30), cfg), // condyle médial
      ellipsoid(knee.clone().add(v(s * 18, 14, -6)), v(18, 23, 29), cfg), // condyle latéral
    ]);
    hip.attach(femur.mesh);

    const kneePivot = pivotAt(`knee-${s}`, knee);
    const tibia = bone(s > 0 ? "Tibia gauche" : "Tibia droit", "genoux", [
      ellipsoid(knee.clone().add(v(0, -16, -2)), v(40, 12, 30), cfg), // plateau tibial
      latheBone(knee.clone().add(v(0, -20, 0)), ankle.clone().add(v(s * -4, 18, 4)), [
        [0, 30], [0.12, 20], [0.5, 13], [0.88, 15], [1, 21],
      ], cfg),
      ellipsoid(knee.clone().add(v(0, -46, 22)), v(10, 14, 8), cfg), // tubérosité tibiale
      ellipsoid(ankle.clone().add(v(s * -18, 8, 4)), v(8, 15, 10), cfg), // malléole médiale
    ]);
    const fibula = bone(s > 0 ? "Fibula gauche" : "Fibula droite", "genoux", [
      ellipsoid(knee.clone().add(v(s * 32, -36, -16)), v(9, 10, 9), cfg),
      latheBone(knee.clone().add(v(s * 33, -40, -16)), ankle.clone().add(v(s * 24, 0, -8)), [
        [0, 7], [0.5, 5.5], [0.94, 7], [1, 9],
      ], cfg),
    ]);
    const patella = bone(s > 0 ? "Rotule gauche" : "Rotule droite", "genoux", [
      ellipsoid(knee.clone().add(v(0, 26, 36)), v(21, 25, 10), cfg),
    ]);
    kneePivot.attach(tibia.mesh);
    kneePivot.attach(fibula.mesh);
    kneePivot.attach(patella.mesh);

    const foot = bone(s > 0 ? "Pied gauche" : "Pied droit", "genoux", footGeometry(ankle, s, cfg));
    kneePivot.attach(foot.mesh);

    hip.attach(kneePivot);
    hips.push(hip);
    knees.push(kneePivot);
    yield;
  }

  root.updateMatrixWorld(true);

  return {
    root,
    spine,
    rig: {
      pelvis,
      head,
      ribs,
      sternum: sternum.mesh,
      girdles: [girdles[0]!, girdles[1]!],
      shoulders: [shoulders[0]!, shoulders[1]!],
      elbows: [elbows[0]!, elbows[1]!],
      hips: [hips[0]!, hips[1]!],
      knees: [knees[0]!, knees[1]!],
    },
    selectable,
    geometries,
  };
}

/**
 * Aile iliaque : nappe galbée tendue entre la crête iliaque et la base de l'ilium,
 * épaissie, avec un bourrelet arrondi tout autour (crête, épines, échancrure).
 */
function iliumGeometry(s: 1 | -1, cfg: DetailConfig): THREE.BufferGeometry {
  const crest = new THREE.CatmullRomCurve3([
    v(s * 50, 968, -74), // épine iliaque postéro-supérieure
    v(s * 72, 1014, -62),
    v(s * 104, 1041, -30),
    v(s * 130, 1030, 8),
    v(s * 120, 975, 58), // épine iliaque antéro-supérieure
  ]);
  const base = new THREE.CatmullRomCurve3([
    v(s * 44, 930, -62),
    v(s * 62, 912, -44), // grande échancrure ischiatique
    v(s * 80, 902, -10),
    v(s * 90, 904, 18),
    v(s * 104, 930, 48), // épine iliaque antéro-inférieure
  ]);
  const nu = cfg.shapePoints;
  const nv = Math.max(6, Math.round(cfg.shapePoints / 3));
  const lateral = v(s, 0, -0.15).normalize();
  const grid: THREE.Vector3[][] = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    const c = crest.getPoint(u);
    const b = base.getPoint(u);
    const row: THREE.Vector3[] = [];
    for (let j = 0; j <= nv; j++) {
      const t = j / nv;
      const p = c.clone().lerp(b, t);
      // fosse iliaque : la face interne est concave (la nappe bombe en dehors)
      p.addScaledVector(lateral, 13 * Math.sin(Math.PI * u) * Math.sin(Math.PI * t));
      row.push(p);
    }
    grid.push(row);
  }
  const half = 4.5;
  const positions: number[] = [];
  const pushTri = (a: THREE.Vector3, b2: THREE.Vector3, c2: THREE.Vector3) => positions.push(a.x, a.y, a.z, b2.x, b2.y, b2.z, c2.x, c2.y, c2.z);
  const normalAt = (i: number, j: number) => {
    const du = grid[Math.min(nu, i + 1)]![j]!.clone().sub(grid[Math.max(0, i - 1)]![j]!);
    const dv = grid[i]![Math.min(nv, j + 1)]!.clone().sub(grid[i]![Math.max(0, j - 1)]!);
    return du.cross(dv).normalize();
  };
  const offset = grid.map((row, i) => row.map((p, j) => {
    const n = normalAt(i, j);
    return [p.clone().addScaledVector(n, half), p.clone().addScaledVector(n, -half)] as const;
  }));
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const [a1, a2] = offset[i]![j]!;
      const [b1, b2] = offset[i + 1]![j]!;
      const [c1, c2] = offset[i + 1]![j + 1]!;
      const [d1, d2] = offset[i]![j + 1]!;
      pushTri(a1, b1, c1);
      pushTri(a1, c1, d1);
      pushTri(a2, c2, b2);
      pushTri(a2, d2, c2);
    }
  }
  const sheet = new THREE.BufferGeometry();
  sheet.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  // bourrelet périphérique (masque les bords de la nappe)
  const loop: THREE.Vector3[] = [];
  for (let i = 0; i <= 8; i++) loop.push(crest.getPoint(i / 8));
  for (let i = 8; i >= 0; i--) loop.push(base.getPoint(i / 8));
  const rimTube = tube(loop, half + 1.6, cfg, 72, true);
  return mergeParts([sheet, rimTube]);
}

/** Main en position anatomique (paume vers l'avant) : carpe, métacarpiens, phalanges. */
function handGeometry(wrist: THREE.Vector3, s: 1 | -1, cfg: DetailConfig): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [ellipsoid(wrist.clone().add(v(0, -16, 2)), v(26, 14, 11), cfg)];
  // pouce
  const thumbBase = wrist.clone().add(v(s * -24, -20, 14));
  let prev = thumbBase;
  [34, 28, 22].forEach((len, k) => {
    const next = prev.clone().add(v(s * -7, -len * 0.85, len * 0.45));
    parts.push(strut(prev, next, 5 - k * 0.7, cfg, 0.85));
    prev = next.clone().add(v(0, -2, 1));
  });
  // quatre doigts
  for (let f = 0; f < 4; f++) {
    const x = s * (-12 + f * 10);
    let p = wrist.clone().add(v(x * 0.6, -26, 2));
    const lens = [52 - f * 3, 32 - f * 2, 22 - f * 1.5, 16 - f];
    lens.forEach((len, k) => {
      const next = p.clone().add(v(x * 0.08, -len, 1.5 + k));
      parts.push(strut(p, next, (k === 0 ? 4.4 : 4) - k * 0.55, cfg, 0.82));
      p = next.clone().add(v(0, -2.5, 0));
    });
  }
  return parts;
}

/** Pied : talus, calcanéus, tarse, métatarsiens et orteils. */
function footGeometry(ankle: THREE.Vector3, s: 1 | -1, cfg: DetailConfig): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [
    ellipsoid(ankle.clone().add(v(0, -12, 4)), v(17, 13, 24), cfg), // talus
    ellipsoid(ankle.clone().add(v(s * 4, -44, -24)), v(18, 20, 34), cfg, new THREE.Euler(0.35, 0, 0)), // calcanéus
    ellipsoid(ankle.clone().add(v(s * -2, -38, 42)), v(30, 14, 26), cfg), // tarse
  ];
  for (let t = 0; t < 5; t++) {
    const x = s * (-26 + t * 13);
    const base = ankle.clone().add(v(x * 0.7, -46 + t * 1.5, 58));
    const tip = ankle.clone().add(v(x, -68 + t * 2, 128 - t * 9));
    parts.push(strut(base, tip, t === 0 ? 7 : 5, cfg, 0.75));
    let p = tip.clone().add(v(0, -1, 3));
    const lens = t === 0 ? [26, 20] : [18 - t, 12 - t, 9];
    lens.forEach((len, k) => {
      const next = p.clone().add(v(x * 0.03, -2, len));
      parts.push(strut(p, next, (t === 0 ? 6 : 3.8) - k * 0.6, cfg, 0.85));
      p = next.clone().add(v(0, 0, 2));
    });
  }
  return parts;
}
