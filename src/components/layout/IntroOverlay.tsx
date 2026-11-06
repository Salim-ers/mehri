"use client";

import { useEffect, useRef } from "react";
import { SpineDrawing } from "@/components/shared/SpineDrawing";

const NAME = "MOHAMED MERHI";
export const INTRO_KEY = "mm-intro-seen";

/**
 * Ouverture cinématographique (accueil, première visite de la session).
 * - Rendu serveur + disparition purement CSS : jamais bloquante, même sans JS.
 * - Ignorée si déjà vue, en mode « économie de données » (script inline du layout).
 * - Un clic, une touche ou un défilement la referment immédiatement.
 */
export function IntroOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* stockage indisponible (navigation privée) : l'intro reste purement CSS */
    }
    if (root.dataset.intro === "skip") return;
    const el = ref.current;
    let leaveTimer = 0;
    const leave = () => {
      el?.classList.add("is-leaving");
      leaveTimer = window.setTimeout(() => (root.dataset.intro = "skip"), 700);
    };
    // une fois terminée, l'intro est masquée par CSS (html[data-intro="skip"])
    const done = () => {
      root.dataset.intro = "skip";
    };
    el?.addEventListener("animationend", (e) => {
      if (e.animationName === "intro-out") done();
    });
    // filet de sécurité : jamais plus de 3,2 s, même si l'évènement CSS est manqué
    const safety = window.setTimeout(done, 3200);
    window.addEventListener("pointerdown", leave, { once: true });
    window.addEventListener("keydown", leave, { once: true });
    window.addEventListener("wheel", leave, { once: true, passive: true });
    window.addEventListener("touchmove", leave, { once: true, passive: true });
    return () => {
      window.clearTimeout(safety);
      window.clearTimeout(leaveTimer);
      window.removeEventListener("pointerdown", leave);
      window.removeEventListener("keydown", leave);
      window.removeEventListener("wheel", leave);
      window.removeEventListener("touchmove", leave);
    };
  }, []);

  return (
    <div ref={ref} className="intro on-dark" aria-hidden="true" data-testid="intro">
      <div className="intro-glow" />
      <div className="relative flex flex-col items-center">
        <SpineDrawing draw className="intro-spine h-[34vh] max-h-80 w-auto text-bronze-light" />
        <p className="intro-name display mt-8 text-center text-[clamp(1.9rem,1rem+3.6vw,4rem)] tracking-[0.06em] text-bone">
          {NAME.split("").map((c, i) => (
            <span key={i} style={{ ["--i" as string]: i }}>
              {c === " " ? " " : c}
            </span>
          ))}
        </p>
        <p className="intro-sub caption-mono mt-4 text-[0.72rem] text-bronze-light">Ostéopathe D.O. — Creil</p>
      </div>
    </div>
  );
}
