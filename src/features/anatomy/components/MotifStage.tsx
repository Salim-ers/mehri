"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { anatomyRegions, isRegionId, type RegionId } from "@/content/anatomy";
import { useReducedMotion } from "@/hooks/use-environment";
import { AnatomyStage } from "./AnatomyStage";

export interface MotifStageProps {
  /** conteneur des panneaux portant `data-focus-region` (défilement, survol) */
  readonly containerId: string;
  /** motifs liés à chaque région (titres courts et liens) */
  readonly regionMotifs: Readonly<Record<RegionId, readonly { readonly slug: string; readonly title: string }[]>>;
}

/**
 * Modèle anatomique de la page « Motifs » : la caméra suit la famille de motifs
 * lue à l'écran ou survolée ; une région choisie dans les pastilles est isolée.
 */
export function MotifStage({ containerId, regionMotifs }: MotifStageProps) {
  const reduced = useReducedMotion();
  const [scrollFocus, setScrollFocus] = useState<RegionId | null>(null);
  const [hoverFocus, setHoverFocus] = useState<RegionId | null>(null);
  const [selected, setSelected] = useState<RegionId | null>(null);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const panels = Array.from(container.querySelectorAll<HTMLElement>("[data-focus-region]"));
    const regionOf = (el: Element | null): RegionId | null => {
      const value = el?.closest<HTMLElement>("[data-focus-region]")?.dataset.focusRegion ?? null;
      return value && isRegionId(value) ? value : null;
    };
    // panneau situé au milieu de l'écran = région à l'image
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setScrollFocus(regionOf(e.target));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const p of panels) observer.observe(p);
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setHoverFocus(regionOf(e.target as Element));
    };
    const onLeave = () => setHoverFocus(null);
    const onFocus = (e: FocusEvent) => setHoverFocus(regionOf(e.target as Element));
    container.addEventListener("pointerover", onOver);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("focusin", onFocus);
    container.addEventListener("focusout", onLeave);
    return () => {
      observer.disconnect();
      container.removeEventListener("pointerover", onOver);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("focusin", onFocus);
      container.removeEventListener("focusout", onLeave);
    };
  }, [containerId]);

  const region = hoverFocus ?? selected ?? scrollFocus;
  const related = selected ? regionMotifs[selected] : [];

  return (
    <div className="flex h-full flex-col gap-3">
      <AnatomyStage
        className="min-h-[22rem] flex-1 rounded-panel bg-night"
        config={{ mode: "finder", look: "xray", region, isolate: selected !== null && region === selected, demo: selected !== null && !reduced, playing: !reduced, hover: false }}
        fallback={<SpineDrawing className="h-[80%] w-auto text-xray/80" variant="line" />}
      >
        <p className="pointer-events-none absolute left-5 top-5 rounded-full bg-night/80 px-4 py-2 text-sm font-semibold text-bone" aria-live="polite">
          {region ? anatomyRegions.find((r) => r.id === region)?.label : "Vue d'ensemble"}
        </p>
      </AnatomyStage>
      <div className="on-dark rounded-panel bg-night p-4">
        <p id="zones-label" className="px-1 text-sm font-semibold text-mist">
          Où se situe la gêne&nbsp;?
        </p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-labelledby="zones-label">
          {anatomyRegions.map((r) => (
            <li key={r.id}>
              <button type="button" className="chip" aria-pressed={selected === r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}>
                {r.label}
              </button>
            </li>
          ))}
        </ul>
        {selected ? (
          <div className="mt-4 border-t border-xray/15 px-1 pt-4" aria-live="polite">
            <p className="text-sm text-mist">Motifs liés :</p>
            <ul className="mt-2 space-y-1">
              {related.map((m) => (
                <li key={m.slug}>
                  <Link href={`/motifs-de-consultation/${m.slug}`} className="link-more text-bone">
                    {m.title} <span className="btn-arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/anatomie?region=${selected}`} transitionTypes={["to-anatomy"]} className="link-more text-xray">
                  Explorer la région en 3D <span className="btn-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
