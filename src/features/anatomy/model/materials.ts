import * as THREE from "three";
import { colors } from "@/styles/tokens";

/**
 * Matériaux partagés (un seul exemplaire par rôle → peu de changements d'état GPU).
 *
 * Deux familles, utilisées ensemble pendant les bascules :
 * - « os » : matière osseuse satinée, éclairée. Un patch de shader ajoute
 *   la matérialisation (la matière apparaît de haut en bas avec un liseré bronze)
 *   et la découpe par la ligne de balayage radiographique ;
 * - « radiographie » : densité additive selon l'angle de vue (les bords rasants
 *   accumulent la matière, comme sur un cliché), révélée au-dessus de la ligne.
 *
 * Le rendu radiographique est un rendu numérique stylisé : jamais un examen d'imagerie.
 */

export type Role = "bone" | "spine" | "disc" | "spineDisc" | "cartilage";

/** Interface attendue par les constructeurs de géométrie (squelette, colonne). */
export interface AnatomyMaterials {
  readonly bone: THREE.Material;
  readonly boneDim: THREE.Material;
  readonly highlight: THREE.Material;
  readonly disc: THREE.Material;
  readonly cartilage: THREE.Material;
  dispose(): void;
}

export type AnatomyLook = "bone" | "xray";
export type MaterialQuality = "high" | "low";

/* ──────────────────────────────────────────────────────────────
   Famille « os »
   ────────────────────────────────────────────────────────────── */

export interface BoneUniforms {
  /** matérialisation du squelette (hors colonne) : visible au-dessus de cette hauteur monde */
  readonly uRevealBody: THREE.IUniform<number>;
  /** matérialisation de la colonne */
  readonly uRevealSpine: THREE.IUniform<number>;
  /** ligne radiographique : la matière osseuse n'est dessinée qu'en dessous */
  readonly uCut: THREE.IUniform<number>;
  /** intensité du liseré de matérialisation */
  readonly uEdgeGain: THREE.IUniform<number>;
}

export interface BoneFamily extends AnatomyMaterials {
  readonly spine: THREE.Material;
  readonly spineDisc: THREE.Material;
  readonly uniforms: BoneUniforms;
}

/** Valeur « tout révélé » / « aucune découpe ». */
export const FAR_BELOW = -1e4;
export const FAR_ABOVE = 1e4;

function patchBone(material: THREE.Material, reveal: THREE.IUniform<number>, u: BoneUniforms): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = reveal;
    shader.uniforms.uCut = u.uCut;
    shader.uniforms.uEdgeGain = u.uEdgeGain;
    shader.uniforms.uEdgeColor = { value: new THREE.Color(colors.bronzeLight) };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vRevealPos;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvRevealPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vRevealPos;\nuniform float uReveal;\nuniform float uCut;\nuniform float uEdgeGain;\nuniform vec3 uEdgeColor;",
      )
      .replace(
        "#include <clipping_planes_fragment>",
        // ondulation légère du front de matérialisation : la matière « pousse », elle n'est pas tranchée
        "#include <clipping_planes_fragment>\nfloat revealFront = uReveal + 0.07 * sin(vRevealPos.x * 9.0 + vRevealPos.z * 7.0);\nif (vRevealPos.y < revealFront || vRevealPos.y > uCut) discard;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEdgeColor * (1.0 - smoothstep(0.0, 0.32, vRevealPos.y - revealFront)) * uEdgeGain;",
      );
  };
  // même code GLSL pour toute la famille : un seul programme compilé
  material.customProgramCacheKey = () => "bone-reveal-v1";
}

function boneMaterial(quality: MaterialQuality, params: THREE.MeshPhysicalMaterialParameters): THREE.MeshStandardMaterial {
  if (quality === "high") return new THREE.MeshPhysicalMaterial(params);
  // appareils modestes : sans vernis ni reflet de velours (bien moins coûteux par pixel)
  const standard: THREE.MeshStandardMaterialParameters = {};
  for (const key of ["color", "roughness", "metalness", "emissive", "emissiveIntensity"] as const) {
    if (params[key] !== undefined) Object.assign(standard, { [key]: params[key] });
  }
  return new THREE.MeshStandardMaterial(standard);
}

export function createBoneFamily(quality: MaterialQuality): BoneFamily {
  const uniforms: BoneUniforms = {
    uRevealBody: { value: FAR_BELOW },
    uRevealSpine: { value: FAR_BELOW },
    uCut: { value: FAR_ABOVE },
    uEdgeGain: { value: 0 },
  };
  const boneParams: THREE.MeshPhysicalMaterialParameters = {
    color: new THREE.Color(colors.bone),
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.5,
    sheen: 0.45,
    sheenColor: new THREE.Color("#f4ead9"),
    sheenRoughness: 0.65,
  };
  const bone = boneMaterial(quality, boneParams);
  // la colonne, sujet du site, est légèrement plus lumineuse que le reste du squelette
  const spine = boneMaterial(quality, {
    ...boneParams,
    color: new THREE.Color("#f6efe4"),
    roughness: 0.42,
    clearcoat: 0.4,
    emissive: new THREE.Color(colors.bronze),
    emissiveIntensity: 0.07,
  });
  const boneDim = boneMaterial(quality, { ...boneParams, color: new THREE.Color("#b9b1a5"), roughness: 0.74, sheen: 0.1 });
  const highlight = boneMaterial(quality, {
    color: new THREE.Color("#dcb98f"),
    roughness: 0.34,
    metalness: 0.16,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    emissive: new THREE.Color(colors.bronze),
    emissiveIntensity: 0.3,
  });
  const discParams: THREE.MeshPhysicalMaterialParameters = {
    color: new THREE.Color("#d9d9d4"),
    roughness: 0.36,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    sheen: 0.6,
    sheenColor: new THREE.Color("#eef2f3"),
  };
  const disc = boneMaterial(quality, discParams);
  const spineDisc = boneMaterial(quality, { ...discParams, color: new THREE.Color("#e3e6e4") });
  const cartilage = boneMaterial(quality, { ...discParams, color: new THREE.Color("#e4ded3") });

  for (const m of [bone, boneDim, highlight, disc, cartilage]) patchBone(m, uniforms.uRevealBody, uniforms);
  for (const m of [spine, spineDisc]) patchBone(m, uniforms.uRevealSpine, uniforms);

  const all = [bone, spine, boneDim, highlight, disc, spineDisc, cartilage];
  return {
    uniforms,
    bone,
    spine,
    boneDim,
    highlight,
    disc,
    spineDisc,
    cartilage,
    dispose() {
      for (const m of all) m.dispose();
    },
  };
}

/* ──────────────────────────────────────────────────────────────
   Famille « radiographie »
   ────────────────────────────────────────────────────────────── */

/** Uniformes partagés par les matériaux radiographiques. */
export interface XRayUniforms {
  /** hauteur monde de la ligne de balayage (la structure est révélée au-dessus) */
  readonly uScan: THREE.IUniform<number>;
  /** demi-épaisseur de la bande lumineuse (unités monde) */
  readonly uBand: THREE.IUniform<number>;
  /** intensité de la bande (0 = invisible) */
  readonly uBandGain: THREE.IUniform<number>;
  /** 1 = tout est révélé, quelle que soit la position du balayage */
  readonly uRevealAll: THREE.IUniform<number>;
}

export interface XRayFamily {
  readonly uniforms: XRayUniforms;
  readonly bone: THREE.ShaderMaterial;
  readonly spine: THREE.ShaderMaterial;
  readonly disc: THREE.ShaderMaterial;
  readonly spineDisc: THREE.ShaderMaterial;
  readonly cartilage: THREE.ShaderMaterial;
  readonly highlight: THREE.ShaderMaterial;
  readonly boneDim: THREE.ShaderMaterial;
  /** silhouette fantôme (isolement d'une région) : toujours révélée, très ténue */
  readonly ghost: THREE.ShaderMaterial;
  dispose(): void;
}

const XRAY_VERTEX = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  varying float vWorldY;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldY = world.y;
    vec4 mv = viewMatrix * world;
    vViewPos = -mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const XRAY_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uScanColor;
  uniform float uStrength;
  uniform float uCore;
  uniform float uScan;
  uniform float uBand;
  uniform float uBandGain;
  uniform float uRevealAll;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  varying float vWorldY;
  void main() {
    vec3 n = normalize(vNormalV);
    vec3 v = normalize(vViewPos);
    float rim = 1.0 - abs(dot(n, v));
    float density = uCore + pow(rim, 1.35) * (1.0 - uCore);
    float revealed = max(uRevealAll, smoothstep(uScan - uBand, uScan + uBand * 0.25, vWorldY));
    float d = (vWorldY - uScan) / max(uBand, 0.0001);
    float band = exp(-d * d) * uBandGain;
    float a = density * uStrength * revealed + band * (0.25 + 0.75 * rim);
    vec3 col = mix(uColor, uScanColor, clamp(band, 0.0, 1.0));
    gl_FragColor = vec4(col * a, a);
  }
`;

function xrayMaterial(uniforms: XRayUniforms, color: string, strength: number, core: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uScanColor: { value: new THREE.Color("#f2fbff") },
      uStrength: { value: strength },
      uCore: { value: core },
      uScan: uniforms.uScan,
      uBand: uniforms.uBand,
      uBandGain: uniforms.uBandGain,
      uRevealAll: uniforms.uRevealAll,
    },
    vertexShader: XRAY_VERTEX,
    fragmentShader: XRAY_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

export function createXRayFamily(): XRayFamily {
  const uniforms: XRayUniforms = {
    uScan: { value: FAR_ABOVE },
    uBand: { value: 0.35 },
    uBandGain: { value: 0 },
    uRevealAll: { value: 0 },
  };
  const ghostUniforms: XRayUniforms = {
    uScan: { value: FAR_BELOW },
    uBand: { value: 0.35 },
    uBandGain: { value: 0 },
    uRevealAll: { value: 1 },
  };
  const bone = xrayMaterial(uniforms, colors.xray, 0.92, 0.1);
  const spine = xrayMaterial(uniforms, "#bfe3f2", 1.12, 0.14);
  const disc = xrayMaterial(uniforms, "#9fc3d2", 0.3, 0.04);
  const spineDisc = xrayMaterial(uniforms, "#a9cfde", 0.36, 0.05);
  const cartilage = xrayMaterial(uniforms, "#9fc3d2", 0.26, 0.04);
  const highlight = xrayMaterial(uniforms, "#ffd9a8", 1.45, 0.24);
  const boneDim = xrayMaterial(uniforms, "#7fa3b3", 0.55, 0.06);
  const ghost = xrayMaterial(ghostUniforms, "#7fa3b3", 0.16, 0.02);
  const all = [bone, spine, disc, spineDisc, cartilage, highlight, boneDim, ghost];
  return {
    uniforms,
    bone,
    spine,
    disc,
    spineDisc,
    cartilage,
    highlight,
    boneDim,
    ghost,
    dispose() {
      for (const m of all) m.dispose();
    },
  };
}

/**
 * Passes discrètes de la bande lumineuse une fois la structure révélée
 * (le balayage « vit » sans jamais clignoter).
 */
export class ScanPulse {
  private time = 0;

  constructor(
    private readonly uniforms: XRayUniforms,
    private readonly top: number,
    private readonly bottom: number,
    private readonly every = 9,
  ) {}

  restart(): void {
    this.time = 0;
  }

  /** @param active vrai lorsque l'animation automatique est permise et la vue entièrement radiographique */
  update(delta: number, active: boolean): void {
    if (!active) {
      this.uniforms.uBandGain.value = 0;
      return;
    }
    this.time += delta;
    const local = this.time % this.every;
    const pass = 2.6;
    if (local < pass) {
      const t = local / pass;
      this.uniforms.uScan.value = this.top + 0.6 - t * (this.top - this.bottom + 1.2);
      this.uniforms.uBandGain.value = Math.sin(t * Math.PI) * 0.4;
      this.uniforms.uRevealAll.value = 1;
    } else {
      this.uniforms.uBandGain.value = 0;
    }
  }
}
