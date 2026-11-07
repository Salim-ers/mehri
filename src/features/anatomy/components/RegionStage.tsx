"use client";

import { useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/shared/Icons";
import type { RegionId } from "@/content/anatomy";
import { useReducedMotion } from "@/hooks/use-environment";
import { AnatomyStage } from "./AnatomyStage";
import { RegionGlyph } from "./RegionGlyph";

/** Fiche motif : la région concernée, mise en évidence, avec son mouvement. */
export function RegionStage({ region }: { region: RegionId }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [requested, setRequested] = useState(false);
  const demo = !paused && (!reduced || requested);
  return (
    <AnatomyStage
      className="h-[56svh] max-h-[44rem] min-h-[24rem] rounded-panel bg-graphite"
      config={{ mode: "region", look: "bone", region, isolate: false, demo, playing: !paused && !reduced, hover: false }}
      fallback={<RegionGlyph region={region} className="h-4/5 w-auto text-bone/60" />}
    >
      <button
        type="button"
        data-stage-ui
        onClick={() => {
          if (demo) setPaused(true);
          else {
            setPaused(false);
            setRequested(true);
          }
        }}
        className="absolute bottom-4 left-4 flex min-h-11 items-center gap-2 rounded-full bg-graphite/85 px-4 text-sm font-semibold text-bone hover:bg-graphite"
      >
        {demo ? <PauseIcon /> : <PlayIcon />}
        {demo ? "Mettre en pause le mouvement" : "Lire le mouvement"}
      </button>
    </AnatomyStage>
  );
}
