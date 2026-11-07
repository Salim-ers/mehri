import * as THREE from "three";
import type { RegionId } from "@/content/anatomy";
import { FAR_ABOVE, FAR_BELOW, type BoneFamily, type Role, type XRayFamily } from "./materials";
import type { SkeletonModel } from "./skeleton";

/**
 * Gestion des rendus du squelette, sans état React :
 * - chaque os a un « jumeau » radiographique (même géométrie, aucune copie mémoire) ;
 * - une ligne horizontale fait basculer le rendu : matière osseuse en dessous,
 *   radiographie au-dessus. Déplacer la ligne de haut en bas = balayage radiographique ;
 * - une région peut être mise en évidence (les autres s'atténuent) ou isolée
 *   (les autres deviennent une silhouette radiographique fantôme).
 */

interface Entry {
  readonly mesh: THREE.Mesh;
  readonly twin: THREE.Mesh;
  readonly role: Role;
  readonly region: RegionId | null;
}

const noRaycast: THREE.Mesh["raycast"] = () => undefined;

/** Calque de rendu de la caméra ; un os « masqué » passe sur un autre calque. */
const SHOWN = 0;
const HIDDEN = 1;

/**
 * Masquage par calque et non par `visible` : des os sont rattachés à d'autres
 * (crâne et côtes aux vertèbres) ; `visible = false` masquerait aussi leurs descendants.
 */
export function setShown(object: THREE.Object3D, shown: boolean): void {
  object.layers.set(shown ? SHOWN : HIDDEN);
}

export function isShown(object: THREE.Object3D): boolean {
  return object.layers.isEnabled(SHOWN);
}

/** Hauteurs monde du squelette (unités de scène) — au-delà, la bascule est terminée. */
export interface Span {
  readonly top: number;
  readonly bottom: number;
}

export class LookManager {
  readonly entries: Entry[] = [];
  /** cibles de lancer de rayon (maillages principaux) */
  readonly pickables: THREE.Mesh[] = [];
  private selected: RegionId | null = null;
  private hovered: RegionId | null = null;
  private isolate = false;
  private line = FAR_ABOVE;
  private dirty = true;

  constructor(
    model: SkeletonModel,
    private readonly bone: BoneFamily,
    private readonly xray: XRayFamily,
    private readonly span: Span,
  ) {
    const spineMeshes = new Set<THREE.Object3D>([model.spine.sacrum, model.spine.coccyx]);
    const spineDiscs = new Set<THREE.Object3D>();
    for (const s of model.spine.segments) {
      spineMeshes.add(s.mesh);
      if (s.disc) spineDiscs.add(s.disc);
    }
    for (const mesh of model.selectable) {
      const role: Role = spineMeshes.has(mesh)
        ? "spine"
        : spineDiscs.has(mesh)
          ? "spineDisc"
          : mesh.material === bone.disc
            ? "disc"
            : mesh.material === bone.cartilage
              ? "cartilage"
              : "bone";
      const twin = new THREE.Mesh(mesh.geometry, xray[role]);
      twin.name = `${mesh.name} (radiographie)`;
      twin.position.copy(mesh.position);
      twin.quaternion.copy(mesh.quaternion);
      twin.scale.copy(mesh.scale);
      setShown(twin, false);
      twin.renderOrder = 2;
      twin.raycast = noRaycast;
      mesh.parent?.add(twin);
      const region = (mesh.userData.region as RegionId | undefined) ?? null;
      this.entries.push({ mesh, twin, role, region });
      this.pickables.push(mesh);
    }
  }

  setRegion(selected: RegionId | null, hovered: RegionId | null, isolate: boolean): void {
    if (selected === this.selected && hovered === this.hovered && isolate === this.isolate) return;
    this.selected = selected;
    this.hovered = hovered;
    this.isolate = isolate;
    this.dirty = true;
  }

  /** Position de la ligne de bascule (y monde). FAR_ABOVE = tout en os, FAR_BELOW = tout en radiographie. */
  setLine(y: number): void {
    const prevBand = this.band(this.line);
    this.line = y;
    if (this.band(y) !== prevBand) this.dirty = true;
    this.bone.uniforms.uCut.value = y;
  }

  getLine(): number {
    return this.line;
  }

  /** 0 = rendu osseux, 1 = rendu radiographique (proportion de hauteur basculée). */
  get xrayAmount(): number {
    const { top, bottom } = this.span;
    return THREE.MathUtils.clamp((top - this.line) / (top - bottom), 0, 1);
  }

  /** « bone » : tout en os ; « xray » : tout en radiographie ; « mixed » : bascule en cours. */
  private band(y: number): "bone" | "mixed" | "xray" {
    if (y >= this.span.top + 0.4) return "bone";
    if (y <= this.span.bottom - 0.4) return "xray";
    return "mixed";
  }

  /** Applique les matériaux si l'état a changé (aucune allocation par image). */
  apply(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const band = this.band(this.line);
    const primaries = band !== "xray";
    const twins = band !== "bone";
    const focus = this.hovered ?? this.selected;
    for (const e of this.entries) {
      const mode = !focus ? "base" : e.region === focus ? "hi" : this.isolate ? "ghost" : "dim";
      e.mesh.material = mode === "hi" ? this.bone.highlight : mode === "dim" ? this.bone.boneDim : this.bone[e.role];
      setShown(e.mesh, primaries && mode !== "ghost");
      e.twin.material = mode === "ghost" ? this.xray.ghost : mode === "hi" ? this.xray.highlight : mode === "dim" ? this.xray.boneDim : this.xray[e.role];
      setShown(e.twin, twins || mode === "ghost");
    }
  }

  /** Région de l'os touché par un rayon (null si aucun). */
  pick(raycaster: THREE.Raycaster): RegionId | null {
    // les os masqués (rendu radiographique) restent sélectionnables
    raycaster.layers.enableAll();
    const hit = raycaster.intersectObjects(this.pickables, false)[0];
    if (!hit) return null;
    return (hit.object.userData.region as RegionId | undefined) ?? null;
  }
}

/** Utilisé par la matérialisation : valeurs « rien de visible » / « tout visible ». */
export const REVEAL_HIDDEN = FAR_ABOVE;
export const REVEAL_DONE = FAR_BELOW;
