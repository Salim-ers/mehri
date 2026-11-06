/**
 * "Fact" = une donnée client dont la fiabilité est explicitement tracée.
 *
 * - confirmed  : validée par le praticien → affichée normalement.
 * - to-confirm : valeur candidate relevée sur une source publique → affichée,
 *                signalée en mode relecture, bloque la mise en production.
 * - missing    : aucune valeur fiable → jamais inventée ; un emplacement « À fournir »
 *                apparaît en mode relecture, rien n'est affiché sinon.
 *
 * Le script `npm run check:content` refuse la publication tant qu'un fait public
 * n'est pas « confirmed » (Production Quality Gate QuadCore).
 */
export type FactStatus = "confirmed" | "to-confirm" | "missing";

export interface Fact<T> {
  readonly value: T | null;
  readonly status: FactStatus;
  /** Où la valeur candidate a été relevée (jamais affichée au public). */
  readonly source?: string;
  /** Ce qui doit être demandé au praticien. */
  readonly ask: string;
  /** donnée facultative : n'empêche pas la mise en production si elle manque */
  readonly optional?: boolean;
}

export function confirmed<T>(value: T, ask = ""): Fact<T> {
  return { value, status: "confirmed", ask };
}

export function toConfirm<T>(value: T, source: string, ask: string): Fact<T> {
  return { value, status: "to-confirm", source, ask };
}

export function missing<T>(ask: string, options: { optional?: boolean } = {}): Fact<T> {
  return { value: null, status: "missing", ask, optional: options.optional };
}

export function hasValue<T>(fact: Fact<T>): fact is Fact<T> & { value: T } {
  return fact.value !== null && fact.status !== "missing";
}

export interface PendingItem {
  readonly path: string;
  readonly optional: boolean;
  readonly status: Exclude<FactStatus, "confirmed">;
  readonly ask: string;
  readonly source?: string;
}

function isFact(node: unknown): node is Fact<unknown> {
  return (
    typeof node === "object" &&
    node !== null &&
    "status" in node &&
    "ask" in node &&
    "value" in node &&
    ["confirmed", "to-confirm", "missing"].includes((node as { status: string }).status)
  );
}

/** Parcourt récursivement un objet de contenu et liste les faits non confirmés. */
export function collectPending(root: unknown, path = ""): PendingItem[] {
  if (isFact(root)) {
    if (root.status === "confirmed") return [];
    return [{ path: path || "(racine)", status: root.status, ask: root.ask, source: root.source, optional: root.optional === true }];
  }
  if (Array.isArray(root)) {
    return root.flatMap((item, index) => collectPending(item, `${path}[${index}]`));
  }
  if (typeof root === "object" && root !== null) {
    return Object.entries(root).flatMap(([key, value]) =>
      collectPending(value, path ? `${path}.${key}` : key),
    );
  }
  return [];
}
