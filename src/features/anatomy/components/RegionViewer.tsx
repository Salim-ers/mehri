"use client";

import dynamic from "next/dynamic";
import { useRef, type ReactNode } from "react";
import type { RegionId } from "@/content/anatomy";
import { useDeviceTier, useInView, useReducedMotion, useWebGLSupport } from "@/hooks/use-environment";

const AtlasScene = dynamic(() => import("./AtlasScene"), { ssr: false, loading: () => null });

/**
 * Illustration 3D d'une région (fiches motifs) : chargée seulement lorsqu'elle
 * approche de l'écran, rendue uniquement lorsqu'elle est visible. Le glyphe
 * vectoriel `fallback` reste affiché sans WebGL ou pendant le chargement.
 */
export function RegionViewer({ region, fallback }: { region: RegionId; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, "400px");
  const visible = useInView(ref, "0px");
  const webgl = useWebGLSupport();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const show = webgl === "supported" && near;
  return (
    <div ref={ref} className="relative h-full w-full">
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${show ? "opacity-0" : "opacity-100"}`}>{fallback}</div>
      {show ? (
        <div className="absolute inset-0">
          <AtlasScene selected={region} playing={!reduced} detail={tier === "high" ? "high" : "low"} active={visible} interactive={false} onSelect={() => undefined} onHover={() => undefined} />
        </div>
      ) : null}
    </div>
  );
}
