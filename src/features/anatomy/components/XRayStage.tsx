"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { PauseIcon, PlayIcon } from "@/components/shared/Icons";
import { useDeviceTier, useIdleAfterLoad, useInView, useReducedMotion, useWebGLSupport } from "@/hooks/use-environment";

const XRayScene = dynamic(() => import("./XRayScene"), { ssr: false, loading: () => null });

/**
 * Cadre de la visualisation radiographique : chargée à l'approche de l'écran,
 * rendue seulement lorsqu'elle est visible, suspendable (WCAG 2.2.2).
 * `fallback` (image ou dessin) reste affiché sans WebGL et pendant le chargement.
 */
export function XRayStage({ fallback, className = "" }: { fallback: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, "250px");
  const idle = useIdleAfterLoad(2500);
  const visible = useInView(ref, "0px");
  const webgl = useWebGLSupport();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const show = webgl === "supported" && near && idle;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className={`absolute inset-0 transition-opacity duration-1000 ${show && ready ? "opacity-0" : "opacity-100"}`}>{fallback}</div>
      {show ? (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <XRayScene detail={tier} reducedMotion={reduced} active={visible} paused={paused} onReady={onReady} />
        </div>
      ) : null}
      {show && ready && !reduced ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Reprendre l'animation radiographique" : "Mettre en pause l'animation radiographique"}
          className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 bg-anthracite/50 text-bone backdrop-blur transition-colors hover:border-bone/60"
        >
          {paused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
        </button>
      ) : null}
    </div>
  );
}
