import type { RegionId } from "@/content/anatomy";
import type { StageMode } from "../model/director";
import type { AnatomyLook } from "../model/materials";

/**
 * Messages échangés entre la page (fil principal) et le moteur 3D (Web Worker,
 * ou fil principal en repli). Données sérialisables uniquement.
 */
export type DeviceTier = "high" | "low";

export interface StageConfig {
  readonly mode: StageMode;
  readonly look: AnatomyLook;
  readonly region: RegionId | null;
  /** isoler la région (les autres os deviennent une silhouette fantôme) */
  readonly isolate: boolean;
  /** jouer la démonstration articulaire de la région */
  readonly demo: boolean;
  /** mouvements automatiques permis (bouton pause, WCAG 2.2.2) */
  readonly playing: boolean;
  /** survol des os : mise en évidence et retour de la région survolée */
  readonly hover: boolean;
}

export type ToWorld =
  | {
      readonly t: "init";
      readonly canvas: OffscreenCanvas | null;
      readonly width: number;
      readonly height: number;
      readonly dpr: number;
      readonly tier: DeviceTier;
      readonly reducedMotion: boolean;
      /** « ?force-webgl » : accepte un rendu logiciel (tests automatisés sans GPU) */
      readonly force: boolean;
    }
  | { readonly t: "resize"; readonly width: number; readonly height: number; readonly dpr: number }
  | { readonly t: "config"; readonly config: StageConfig }
  /** progression continue des chapitres de l'accueil */
  | { readonly t: "progress"; readonly value: number }
  /** pointeur en coordonnées normalisées (−1 → 1) ; inside = au-dessus de la scène */
  | { readonly t: "pointer"; readonly x: number; readonly y: number; readonly inside: boolean }
  /** déplacement du glisser, en fraction de la largeur de la scène */
  | { readonly t: "drag"; readonly dx: number; readonly dy: number }
  | { readonly t: "zoom"; readonly factor: number }
  | { readonly t: "recenter" }
  | { readonly t: "visible"; readonly value: boolean }
  /** la scène vient d'être rattachée à un nouvel emplacement de page */
  | { readonly t: "attached" };

export type FromWorld =
  | { readonly t: "ready" }
  /** première image rendue après un rattachement (fondu d'apparition) */
  | { readonly t: "shown" }
  | { readonly t: "hover"; readonly region: RegionId | null }
  | { readonly t: "error"; readonly message: string }
  | { readonly t: "lost" }
  | { readonly t: "restored" };
