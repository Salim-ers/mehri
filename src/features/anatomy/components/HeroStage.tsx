"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { useDeviceTier, useInView, useMediaQuery, useReducedMotion, useWebGLSupport } from "@/hooks/use-environment";

const HeroSpineScene = dynamic(() => import("./HeroSpineScene"), { ssr: false, loading: () => null });

interface HeroStageProps {
  /** Composition d'ouverture (H1, CTA) — rendue côté serveur, indexable */
  readonly intro: ReactNode;
  /** Deux « temps » de lecture révélés au défilement */
  readonly beats: readonly [ReactNode, ReactNode];
}

/**
 * Scène d'accueil en défilement narratif : la colonne 3D reste en place
 * (position sticky) pendant que trois temps de lecture se succèdent.
 * Le défilement n'est jamais bloqué ; tous les textes restent dans le DOM.
 */
export function HeroStage({ intro, beats }: HeroStageProps) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [beat, setBeat] = useState(0);
  const webgl = useWebGLSupport();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const inView = useInView(section, "0px");
  const [sceneReady, setSceneReady] = useState(false);
  const cervicalLabel = useRef<HTMLDivElement>(null);
  const lumbarLabel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // charge la 3D après l'évènement « load » et un temps d'inactivité :
    // le texte (LCP) et l'interactivité n'attendent jamais WebGL
    let idle = 0;
    const schedule = () => {
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(() => setSceneReady(true), { timeout: 2000 })
        : window.setTimeout(() => setSceneReady(true), 400);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progress.current = p;
      setBeat(p < 0.34 ? 0 : p < 0.68 ? 1 : 2);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const show3D = webgl === "supported" && sceneReady;

  return (
    <section ref={section} aria-label="Introduction" className="hero-stage relative h-[260vh] lg:h-[300vh]" data-beat={beat}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* fond : lumière chaude + repères de planche */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_70%_45%,#fffaf2_0%,#f6f1e9_55%,#ece3d6_100%)]" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-60" />

        {/* colonne vertébrale */}
        <div className="absolute inset-0 lg:left-[30%]">
          {show3D ? (
            <>
              <HeroSpineScene
                progress={progress}
                detail={tier === "high" && wide ? "high" : "low"}
                reducedMotion={reduced}
                active={inView}
                offsetX={wide ? 0.4 : 0}
                labels={{ cervical: cervicalLabel, lumbar: lumbarLabel }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div ref={cervicalLabel} data-on="false" className="atlas-label absolute left-0 top-0">
                  <span className="atlas-label__line" />
                  <span className="caption-mono">C1 — C7 · Rachis cervical</span>
                </div>
                <div ref={lumbarLabel} data-on="false" className="atlas-label absolute left-0 top-0">
                  <span className="atlas-label__line" />
                  <span className="caption-mono">L4 — S1 · Charnière lombo-sacrée</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center pb-[18vh] lg:pb-0">
              <SpineDrawing variant="solid" highlight={beat === 1 ? ["C1", "C2", "C3", "C4", "C5", "C6", "C7"] : beat === 2 ? ["L4", "L5", "S"] : []} className="h-[72%] w-auto text-stone-deep/80" />
            </div>
          )}
        </div>

        {/* temps 0 : composition d'ouverture */}
        <div className={`hero-beat hero-beat--0 ${beat === 0 ? "is-on" : ""}`}>{intro}</div>
        {/* temps 1 et 2 */}
        <div className={`hero-beat hero-beat--side ${beat === 1 ? "is-on" : ""}`}>
          {beats[0]}
        </div>
        <div className={`hero-beat hero-beat--side ${beat === 2 ? "is-on" : ""}`}>
          {beats[1]}
        </div>

        {/* progression */}
        <ol className="pointer-events-none absolute bottom-6 right-[var(--gutter)] z-10 hidden items-center gap-3 lg:flex" aria-hidden="true">
          {["Colonne", "Cervicales", "Lombo-sacrée"].map((l, i) => (
            <li key={l} className={`caption-mono flex items-center gap-2 transition-colors duration-500 ${beat === i ? "text-bronze-ink" : "text-ink-soft/50"}`}>
              <span className={`block h-px transition-all duration-700 ${beat === i ? "w-10 bg-bronze-ink" : "w-4 bg-ink-soft/40"}`} />
              {l}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
