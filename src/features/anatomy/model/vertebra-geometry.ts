import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { VertebraSpec } from "./spine-profile";

/**
 * Géométrie procédurale d'une vertèbre (repère local, mm) :
 *   x = latéral, y = crânial (vers le haut), z = antérieur.
 * Composée du corps vertébral, de l'arc postérieur (pédicules + lames entourant
 * le foramen vertébral), du processus épineux, des processus transverses et des
 * processus articulaires. Modèle original QuadCore — aucune ressource tierce.
 */
export type Detail = "high" | "low";

export interface DetailConfig {
  readonly shapePoints: number;
  readonly bevelSegments: number;
  readonly capsuleCap: number;
  readonly radial: number;
}

export const DETAIL: Record<Detail, DetailConfig> = {
  high: { shapePoints: 40, bevelSegments: 3, capsuleCap: 4, radial: 10 },
  low: { shapePoints: 22, bevelSegments: 1, capsuleCap: 2, radial: 6 },
};

/** Section réniforme (corps vertébral) dans le plan (x, Y) avec Y = -z. */
export function bodyShape(halfWidth: number, halfDepth: number, posteriorIndent: number, points: number): THREE.Shape {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    const x = halfWidth * Math.cos(t);
    let y = halfDepth * Math.sin(t);
    if (y > 0) {
      const k = 1 - (x / halfWidth) ** 2;
      y -= posteriorIndent * halfDepth * k * k * Math.sin(t);
    }
    pts.push(new THREE.Vector2(x, y));
  }
  return new THREE.Shape(pts);
}

/** Extrude une section horizontale le long de y, centrée sur y = 0. */
function extrudeHorizontal(shape: THREE.Shape, height: number, bevel: number, segments: number): THREE.BufferGeometry {
  const core = Math.max(height - 2 * bevel, height * 0.2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: core,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel * 0.9,
    bevelSegments: segments,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -core / 2, 0);
  return geo;
}

/** Extrude une section sagittale (u = postérieur, v = haut) sur une épaisseur latérale. */
function extrudeSagittal(points: THREE.Vector2[], thickness: number, bevel: number, segments: number): THREE.BufferGeometry {
  const shape = new THREE.Shape(points);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(thickness - 2 * bevel, thickness * 0.3),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: segments,
    curveSegments: 6,
  });
  // (u, v, s) → (s, v, -u)
  geo.rotateY(Math.PI / 2);
  geo.translate(-(thickness - 2 * bevel) / 2, 0, 0);
  return geo;
}

const UP = new THREE.Vector3(0, 1, 0);

/** Capsule orientée de `from` vers `to`. */
export function strut(from: THREE.Vector3, to: THREE.Vector3, radius: number, cfg: DetailConfig, taper = 1): THREE.BufferGeometry {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = Math.max(dir.length() - 2 * radius, 0.01);
  const geo = new THREE.CapsuleGeometry(radius, length, cfg.capsuleCap, cfg.radial);
  if (taper !== 1) {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const half = length / 2 + radius;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const f = THREE.MathUtils.lerp(1, taper, (y + half) / (2 * half));
      pos.setX(i, pos.getX(i) * f);
      pos.setZ(i, pos.getZ(i) * f);
    }
    geo.computeVertexNormals();
  }
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  geo.applyMatrix4(new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1)));
  return geo;
}

function ring(outerX: number, outerY: number, innerX: number, innerY: number, cy: number, points: number): THREE.Shape {
  const outer: THREE.Vector2[] = [];
  const inner: THREE.Vector2[] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    outer.push(new THREE.Vector2(outerX * Math.cos(t), cy + outerY * Math.sin(t)));
    // foramen légèrement triangulaire (plus étroit en arrière)
    const tri = 1 - 0.18 * Math.max(0, Math.sin(t));
    inner.push(new THREE.Vector2(innerX * Math.cos(t) * tri, cy + innerY * Math.sin(t)));
  }
  const shape = new THREE.Shape(outer);
  shape.holes.push(new THREE.Path(inner.reverse()));
  return shape;
}

function toPositionOnly(geos: THREE.BufferGeometry[]): THREE.BufferGeometry[] {
  return geos.map((g) => {
    const ng = g.index ? g.toNonIndexed() : g;
    // ExtrudeGeometry porte des groupes de matériaux : on les retire avant fusion
    ng.clearGroups();
    ng.deleteAttribute("normal");
    ng.deleteAttribute("uv");
    return ng;
  });
}

/**
 * Fusionne les parties puis soude les sommets confondus : les normales deviennent
 * lissées (rendu organique) au lieu de facettes.
 */
export function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(toPositionOnly(parts), false);
  if (!merged) throw new Error("Fusion de géométrie impossible");
  const welded = mergeVertices(merged, 0.05);
  merged.dispose();
  for (const p of parts) p.dispose();
  welded.computeVertexNormals();
  welded.computeBoundingSphere();
  return welded;
}

/** Corps vertébral seul (réutilisé pour les disques). */
export function createBodyGeometry(spec: VertebraSpec, detail: Detail, scale = 1, heightOverride?: number): THREE.BufferGeometry {
  const cfg = DETAIL[detail];
  const indent = spec.region === "lumbar" ? 0.32 : spec.region === "thoracic" ? 0.12 : 0.22;
  const shape = bodyShape((spec.width / 2) * scale, (spec.depth / 2) * scale, indent, cfg.shapePoints);
  const h = heightOverride ?? spec.height;
  const geo = extrudeHorizontal(shape, h, Math.min(h * 0.16, 2.4), cfg.bevelSegments);
  if (heightOverride === undefined) {
    // taille concave du corps vertébral (plus étroit à mi-hauteur que sur les plateaux)
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const v = (2 * pos.getY(i)) / h;
      const f = 1 - 0.085 * Math.max(0, 1 - v * v);
      pos.setX(i, pos.getX(i) * f);
      pos.setZ(i, pos.getZ(i) * f);
    }
  }
  return mergeParts([geo]);
}

export function createVertebraGeometry(spec: VertebraSpec, detail: Detail): THREE.BufferGeometry {
  const cfg = DETAIL[detail];
  const parts: THREE.BufferGeometry[] = [];
  const h = spec.height;
  const hw = spec.width / 2;
  const hd = spec.depth / 2;
  const isAtlas = spec.label === "C1";
  const isAxis = spec.label === "C2";
  const cervical = spec.region === "cervical";
  const thoracic = spec.region === "thoracic";
  const lumbar = spec.region === "lumbar";

  // Foramen vertébral : large et triangulaire en cervical/lombaire, rond et étroit en thoracique
  const foramenX = cervical ? 12 : thoracic ? 8.5 : 11.5;
  const foramenY = cervical ? 7.5 : thoracic ? 8 : 8.5;
  const archT = cervical ? 3.2 : thoracic ? 4 : 5.2;
  const posteriorWall = hd * (lumbar ? 0.68 : thoracic ? 0.88 : 0.78);
  const foramenCY = posteriorWall + foramenY * 0.92; // centre (Y = -z)
  const archHeight = h * (lumbar ? 0.62 : 0.7);
  const archY = h * 0.12;

  if (isAtlas) {
    // Atlas : anneau sans corps, masses latérales et larges processus transverses
    const atlasRing = ring(hw + 6, 16, hw - 1, 12.5, 4, cfg.shapePoints);
    const g = extrudeHorizontal(atlasRing, h * 0.75, 1.4, cfg.bevelSegments);
    parts.push(g);
    for (const s of [-1, 1]) {
      parts.push(strut(new THREE.Vector3(s * (hw - 1), -2, -1), new THREE.Vector3(s * (hw + 3), 2, -3), 5.2, cfg));
      parts.push(strut(new THREE.Vector3(s * (hw + 3), 0, -2), new THREE.Vector3(s * (hw + 14), 1, -4), 3, cfg, 0.75));
    }
    // tubercule postérieur
    parts.push(strut(new THREE.Vector3(0, 0, -20), new THREE.Vector3(0, -1, -24), 2.6, cfg));
    return mergeParts(parts);
  }

  parts.push(createBodyGeometry(spec, detail));

  // Lèvres unciformes des cervicales
  if (cervical && !isAxis) {
    for (const s of [-1, 1]) {
      parts.push(strut(new THREE.Vector3(s * (hw - 1.5), h * 0.35, 0), new THREE.Vector3(s * (hw - 0.5), h * 0.62, -1), 1.6, cfg));
    }
  }

  // Dent de l'axis
  if (isAxis) {
    parts.push(strut(new THREE.Vector3(0, h * 0.4, hd * 0.25), new THREE.Vector3(0, h * 1.55, hd * 0.25), 4.6, cfg, 0.82));
  }

  // Arc postérieur (pédicules + lames)
  const archShape = ring(foramenX + archT, foramenY + archT, foramenX, foramenY, foramenCY, cfg.shapePoints);
  const arch = extrudeHorizontal(archShape, archHeight, Math.min(archT * 0.35, 1.6), cfg.bevelSegments);
  arch.translate(0, archY, 0);
  parts.push(arch);

  const archBackZ = -(foramenCY + foramenY + archT * 0.6);
  const archSideX = foramenX + archT * 0.5;
  const archMidZ = -foramenCY;

  // Processus épineux
  {
    const len = cervical ? (spec.label === "C7" ? hd * 2.2 : hd * 1.15) : thoracic ? hd * 1.5 + 6 : hd * 1.05;
    const angle = cervical ? 0.32 : thoracic ? THREE.MathUtils.lerp(0.75, 1.0, Math.sin(((spec.index - 7) / 11) * Math.PI)) : 0.08;
    const rootH = lumbar ? h * 0.75 : cervical ? h * 0.6 : h * 0.55;
    const tipH = lumbar ? h * 0.7 : cervical ? h * 0.42 : h * 0.3;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const tipU = len * ca;
    const tipV = -len * sa;
    const pts = [
      new THREE.Vector2(0, rootH / 2 + archY),
      new THREE.Vector2(tipU + 0.5, tipV + tipH / 2 + archY * 0.5),
      new THREE.Vector2(tipU + 1.5, tipV + archY * 0.5),
      new THREE.Vector2(tipU, tipV - tipH / 2 + archY * 0.5),
      new THREE.Vector2(0, -rootH / 2 + archY),
    ];
    const thick = lumbar ? 6 : cervical ? 4 : 5;
    const sp = extrudeSagittal(pts, thick, 1.2, cfg.bevelSegments);
    sp.translate(0, 0, archBackZ + 1.5);
    parts.push(sp);
    if (cervical && spec.label !== "C7") {
      // extrémité bifide
      const tip = new THREE.Vector3(0, tipV + archY * 0.5, archBackZ - tipU);
      for (const s of [-1, 1]) {
        parts.push(strut(tip.clone().add(new THREE.Vector3(s * 0.5, 0, 1)), tip.clone().add(new THREE.Vector3(s * 3.2, -1, -1.2)), 1.9, cfg));
      }
    }
  }

  // Processus transverses
  for (const s of [-1, 1]) {
    const root = new THREE.Vector3(s * archSideX, archY + h * 0.1, archMidZ + 1);
    let tip: THREE.Vector3;
    let radius: number;
    if (cervical) {
      tip = new THREE.Vector3(s * (hw + 9), archY, -hd * 0.1);
      radius = 2.6;
    } else if (thoracic) {
      const t = (spec.index - 7) / 11;
      tip = new THREE.Vector3(s * (archSideX + THREE.MathUtils.lerp(16, 11, t)), archY + h * 0.28, archMidZ - THREE.MathUtils.lerp(9, 6, t));
      radius = THREE.MathUtils.lerp(3.4, 3.8, t);
    } else {
      tip = new THREE.Vector3(s * (hw + 22), archY - h * 0.05, archMidZ + 2);
      radius = 3.4;
    }
    parts.push(strut(root, tip, radius, cfg, cervical ? 0.9 : 0.72));
  }

  // Processus articulaires supérieurs et inférieurs
  const apX = foramenX * (thoracic ? 0.8 : 0.95);
  const apZ = archMidZ - foramenY * 0.25;
  const apR = cervical ? 3 : thoracic ? 2.8 : 4;
  for (const s of [-1, 1]) {
    parts.push(strut(new THREE.Vector3(s * apX, archY + archHeight * 0.3, apZ), new THREE.Vector3(s * apX * 1.02, h * 0.95, apZ - 1), apR, cfg));
    parts.push(strut(new THREE.Vector3(s * apX * 0.85, archY - archHeight * 0.2, apZ - 2), new THREE.Vector3(s * apX * 0.8, -h * 0.85, apZ - 4), apR * 0.9, cfg));
  }

  return mergeParts(parts);
}

/** Disque intervertébral : section du corps légèrement réduite. */
export function createDiscGeometry(spec: VertebraSpec, detail: Detail, thickness: number): THREE.BufferGeometry {
  return createBodyGeometry(spec, detail, 0.94, Math.max(thickness, 1.5));
}

/** Sacrum : plaque triangulaire courbe percée de 4 paires de foramens sacrés. */
export function createSacrumGeometry(baseSpec: VertebraSpec, detail: Detail): THREE.BufferGeometry {
  const cfg = DETAIL[detail];
  const top = baseSpec.width * 1.05 + 64; // largeur incluant les ailes
  const height = 104;
  const outline: THREE.Vector2[] = [];
  const steps = cfg.shapePoints;
  // contour dans le plan (x, y) : y = 0 en haut, négatif vers le bas
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // côté droit, de haut en bas
    const y = -t * height;
    const w = (top / 2) * (1 - Math.pow(t, 1.25) * 0.88) * (t < 0.12 ? 1 - (0.12 - t) * 0.5 : 1);
    outline.push(new THREE.Vector2(w, y));
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const y = -t * height;
    const w = (top / 2) * (1 - Math.pow(t, 1.25) * 0.88) * (t < 0.12 ? 1 - (0.12 - t) * 0.5 : 1);
    outline.push(new THREE.Vector2(-w, y));
  }
  const shape = new THREE.Shape(outline.reverse());
  for (let k = 0; k < 4; k++) {
    const y = -18 - k * 19;
    const spread = (top / 2) * (1 - Math.pow((-y) / height, 1.25) * 0.88) * 0.46;
    const r = 4.2 - k * 0.6;
    for (const s of [-1, 1]) {
      const hole = new THREE.Path();
      hole.absellipse(s * spread, y, r, r * 0.85, 0, Math.PI * 2, true, 0);
      shape.holes.push(hole);
    }
  }
  const thickness = baseSpec.depth * 0.72;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness - 6,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 2.4,
    bevelSegments: cfg.bevelSegments,
    curveSegments: 10,
  });
  // épaisseur en z, centrée ; plaque plus fine vers l'apex
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.min(1, Math.max(0, -y / height));
    let z = pos.getZ(i) - (thickness - 6) / 2;
    z *= 1 - t * 0.55;
    // concavité antérieure (courbure sacrée)
    z += 0.0032 * (y + height * 0.15) * (y + height * 0.15) * 0.6 - 4;
    // face dorsale convexe, bords auriculaires épaissis
    const halfW = (top / 2) * (1 - Math.pow(t, 1.25) * 0.88);
    const xr = Math.min(1, Math.abs(pos.getX(i)) / Math.max(halfW, 1));
    if (z < 0) z -= 7 * (1 - xr * xr) * (1 - t * 0.7);
    else z += 3 * xr * xr * (1 - t);
    pos.setZ(i, z);
  }
  geo.clearGroups();
  const parts: THREE.BufferGeometry[] = [geo];
  // corps de S1 (plateau sacré, promontoire)
  const s1 = createBodyGeometry(baseSpec, detail, 1.0, 14);
  s1.translate(0, -7, 4);
  parts.push(s1);
  // crête sacrée médiane
  parts.push(strut(new THREE.Vector3(0, -6, -thickness * 0.55), new THREE.Vector3(0, -height * 0.7, -thickness * 0.2), 2.6, cfg, 0.6));
  return mergeParts(parts);
}

/** Coccyx : 4 segments décroissants. */
export function createCoccyxGeometry(detail: Detail): THREE.BufferGeometry {
  const cfg = DETAIL[detail];
  const parts: THREE.BufferGeometry[] = [];
  let y = 0;
  let z = 0;
  for (let i = 0; i < 4; i++) {
    const len = 9 - i * 1.5;
    const r = 4.6 - i * 0.9;
    const next = new THREE.Vector3(0, y - len, z + 2.2 + i * 0.6);
    const g = strut(new THREE.Vector3(0, y, z), next, r, cfg, 0.85);
    g.scale(1 + (3 - i) * 0.18, 1, 1);
    parts.push(g);
    y = next.y - 1;
    z = next.z;
  }
  return mergeParts(parts);
}
