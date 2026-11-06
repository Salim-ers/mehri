"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { PauseIcon, PlayIcon } from "@/components/shared/Icons";
import { useDeviceTier, useIdleAfterLoad, useInView, useReducedMotion, useWebGLSupport } from "@/hooks/use-environment";

const HeroSpineScene = dynamic(() => import("./HeroSpineScene"), { ssr: false, loading: () => null });

/**
 * Scène d'ouverture : la colonne vertébrale 3D au centre de la composition.
 * Le texte (rendu serveur) reste lisible et utilisable immédiatement ; la 3D
 * apparaît ensuite en fondu. Sans WebGL ou sur rendu logiciel : dessin vectoriel.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const webgl = useWebGLSupport();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const inView = useInView(section, "0px");
  // la 3D se charge après l'évènement « load » et un temps d'inactivité : le texte (LCP) n'attend jamais WebGL
  const mounted = useIdleAfterLoad();
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      progress.current = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const show3D = webgl === "supported" && mounted;
  const vector = webgl === "unsupported";

  return (
    <section ref={section} aria-labelledby="hero-title" className="hero-stage hero-light relative isolate flex h-[100svh] min-h-[620px] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {vector ? (
          <div className="absolute inset-x-0 top-[calc(var(--header-h)+1rem)] bottom-[42%] flex justify-center lg:inset-y-[calc(var(--header-h)+2rem)] lg:left-[46%] lg:right-[6%] lg:bottom-[6%]">
            <SpineDrawing variant="solid" className="h-full w-auto text-mineral-deep" title="Colonne vertébrale, vue de profil" />
          </div>
        ) : null}
        {show3D ? (
          <div className="hero-canvas absolute inset-0" data-ready={ready}>
            <HeroSpineScene progress={progress} detail={tier} reducedMotion={reduced} active={inView} paused={paused} onReady={onReady} />
          </div>
        ) : null}
      </div>

      {children}

      {show3D && !reduced ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Reprendre la rotation de la colonne" : "Mettre en pause la rotation de la colonne"}
          className="absolute bottom-6 right-[var(--gutter)] z-10 flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-paper/60 text-ink backdrop-blur transition-colors hover:border-ink/40 max-lg:top-[calc(var(--header-h)+0.75rem)] max-lg:bottom-auto"
        >
          {paused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
        </button>
      ) : null}
    </section>
  );
}
