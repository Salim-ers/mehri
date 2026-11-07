import { ViewTransition, type ReactNode } from "react";

/**
 * Transitions de page. Le gabarit est recréé à chaque navigation : sa transition
 * de sortie s'applique à l'ancienne page, celle d'entrée à la nouvelle.
 * Le type de transition est porté par le lien (`transitionTypes`) :
 * - « to-anatomy » : la lumière baisse, un masque arrondi dévoile la scène sombre ;
 * - « to-cabinet » / « to-reading » : une fenêtre partagée (photo, panneau) s'agrandit,
 *   le contenu de la nouvelle page se pose ensuite ;
 * - sans type (bouton « Précédent » compris) : fondu et légère montée.
 * Le bouton « Précédent », les liens directs et le chargement ne dépendent jamais de ces effets.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "to-anatomy": "vt-reveal-dark", "to-cabinet": "vt-rise-late", "to-reading": "vt-rise-late", default: "vt-enter" }}
      exit={{ "to-anatomy": "vt-dim", "to-cabinet": "vt-fade-fast", "to-reading": "vt-fade-fast", default: "vt-exit" }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
