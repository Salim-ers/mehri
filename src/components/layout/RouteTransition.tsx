"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SpineLine } from "@/components/shared/SpineDrawing";

/**
 * Signature de navigation : un fil vertébral traverse l'écran pendant que la
 * nouvelle page entre (voir <ViewTransition> dans le layout). Purement visuel :
 * aucun pointer-event, aucune attente imposée, désactivé en mouvement réduit.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // déclenche le balayage ; l'annonce du changement de page est assurée par le routeur Next.js
    setRun((r) => r + 1);
    const t = window.setTimeout(() => setRun(0), 900);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div className={`route-sweep ${run ? "is-active" : ""}`} aria-hidden="true" key={run}>
      <div className="sweep-veil" />
      <div className="sweep-line text-bronze">
        <SpineLine className="h-full w-full" />
      </div>
    </div>
  );
}
