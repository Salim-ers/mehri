import * as THREE from "three";
import { colors } from "@/styles/tokens";

/**
 * Matériaux partagés (un seul exemplaire par type → moins de changements d'état GPU).
 * Deux rendus :
 * - « bone » : os ivoire satiné, mise en évidence par une lueur bronze douce ;
 * - « xray » : rendu radiographique (transparence additive selon l'angle de vue,
 *   balayage lumineux révélant la structure), mise en évidence par une lumière chaude.
 */
export interface AnatomyMaterials {
  readonly bone: THREE.Material;
  readonly boneDim: THREE.Material;
  readonly highlight: THREE.Material;
  readonly disc: THREE.Material;
  readonly cartilage: THREE.Material;
  dispose(): void;
}

export type AnatomyLook = "bone" | "xray";

export function createAnatomyMaterials(): AnatomyMaterials {
  const bone = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colors.bone),
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.5,
    sheen: 0.45,
    sheenColor: new THREE.Color("#f4ead9"),
    sheenRoughness: 0.65,
  });
  const boneDim = bone.clone();
  boneDim.color = new THREE.Color("#c3bcb1");
  boneDim.roughness = 0.72;
  boneDim.sheen = 0.1;

  const highlight = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#d9b48a"),
    roughness: 0.34,
    metalness: 0.18,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    emissive: new THREE.Color(colors.bronze),
    emissiveIntensity: 0.28,
  });
  const disc = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#dcd8d0"),
    roughness: 0.36,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    sheen: 0.6,
    sheenColor: new THREE.Color("#eef2f3"),
  });
  const cartilage = disc.clone();
  cartilage.color = new THREE.Color("#e4ded3");

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

/* ──────────────────────────────────────────────────────────────
   Rendu radiographique
   ────────────────────────────────────────────────────────────── */

/** Uniformes partagés par tous les matériaux radiographiques d'une scène. */
export interface XRayUniforms {
  /** hauteur monde de la ligne de balayage */
  readonly uScan: THREE.IUniform<number>;
  /** demi-épaisseur de la bande lumineuse (unités monde) */
  readonly uBand: THREE.IUniform<number>;
  /** intensité de la bande (0 = invisible) */
  readonly uBandGain: THREE.IUniform<number>;
  /** 1 = tout est révélé, quelle que soit la position du balayage */
  readonly uRevealAll: THREE.IUniform<number>;
}

export interface XRayMaterials extends AnatomyMaterials {
  readonly uniforms: XRayUniforms;
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
    // les bords « rasants » accumulent la matière, comme sur un cliché radiographique
    float rim = 1.0 - abs(dot(n, v));
    float density = uCore + pow(rim, 1.35) * (1.0 - uCore);
    // au-dessus de la ligne de balayage : structure révélée
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
      uScanColor: { value: new THREE.Color("#f4fbff") },
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

export function createXRayMaterials(): XRayMaterials {
  const uniforms: XRayUniforms = {
    uScan: { value: 20 },
    uBand: { value: 0.35 },
    uBandGain: { value: 0 },
    uRevealAll: { value: 0 },
  };
  const bone = xrayMaterial(uniforms, colors.xray, 0.95, 0.1);
  const boneDim = xrayMaterial(uniforms, "#9fb1b6", 0.42, 0.05);
  const highlight = xrayMaterial(uniforms, "#ffd6a0", 1.45, 0.24);
  const disc = xrayMaterial(uniforms, "#b9cbd0", 0.3, 0.04);
  const cartilage = xrayMaterial(uniforms, "#b9cbd0", 0.26, 0.04);
  return {
    uniforms,
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

/**
 * Animation du balayage : une première passe révèle la structure de haut en bas,
 * puis des passes discrètes reviennent à intervalle régulier (si l'animation est active).
 */
export class XRayScan {
  private time = 0;
  private started = false;

  constructor(
    private readonly uniforms: XRayUniforms,
    private readonly top: number,
    private readonly bottom: number,
    private readonly options: { readonly duration?: number; readonly idleEvery?: number } = {},
  ) {}

  /** Rejoue la révélation (nouvelle sélection, retour à l'écran). */
  restart(): void {
    this.time = 0;
  }

  /** Mouvement réduit : structure entièrement visible, aucune bande. */
  showStatic(): void {
    this.uniforms.uRevealAll.value = 1;
    this.uniforms.uBandGain.value = 0;
    this.uniforms.uScan.value = this.bottom - 1;
  }

  update(delta: number, running: boolean): void {
    if (!running && !this.started) return;
    this.started = true;
    if (running) this.time += delta;
    const duration = this.options.duration ?? 2.8;
    const span = this.top - this.bottom;
    if (this.time <= duration) {
      // première passe : révélation progressive
      const t = this.time / duration;
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.uniforms.uScan.value = this.top + 0.6 - e * (span + 1.2);
      this.uniforms.uBandGain.value = Math.sin(Math.min(1, t * 1.1) * Math.PI) * 0.9 + 0.1;
      this.uniforms.uRevealAll.value = 0;
      return;
    }
    this.uniforms.uRevealAll.value = 1;
    const every = this.options.idleEvery ?? 9;
    if (every <= 0) {
      this.uniforms.uBandGain.value = 0;
      return;
    }
    const local = (this.time - duration) % every;
    const pass = 2.4;
    if (local < pass) {
      const t = local / pass;
      this.uniforms.uScan.value = this.top + 0.6 - t * (span + 1.2);
      this.uniforms.uBandGain.value = Math.sin(t * Math.PI) * 0.35;
    } else {
      this.uniforms.uBandGain.value = 0;
    }
  }
}
