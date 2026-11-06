import { reviewMode } from "@/content/practice";
import type { Fact } from "@/lib/facts";
import type { ReactNode } from "react";

/**
 * Badge « À confirmer » visible uniquement en mode relecture client.
 * Il ne remplace jamais la donnée : il signale qu'elle doit être validée.
 */
export function PendingBadge({ fact, className = "" }: { fact: Fact<unknown>; className?: string }) {
  if (!reviewMode || fact.status === "confirmed") return null;
  return (
    <span className={`review-badge ${className}`} title={fact.ask}>
      <span aria-hidden="true">◌</span>
      {fact.status === "missing" ? "À fournir" : "À confirmer"}
      <span className="sr-only"> : {fact.ask}</span>
    </span>
  );
}

/**
 * Emplacement réservé à une donnée manquante : affiché en mode relecture
 * avec la question à poser au praticien, absent en production.
 */
export function MissingSlot({ fact, children }: { fact: Fact<unknown>; children?: ReactNode }) {
  // donnée confirmée sans valeur = le praticien a choisi de ne pas la publier : plus rien à demander
  if (!reviewMode || fact.status === "confirmed") return children ?? null;
  return (
    <div className="rounded-md border border-dashed border-review/50 bg-review-bg/70 px-4 py-3 text-sm text-review">
      <p className="caption-mono mb-1">À fournir par le praticien</p>
      <p>{fact.ask}</p>
      {children}
    </div>
  );
}
