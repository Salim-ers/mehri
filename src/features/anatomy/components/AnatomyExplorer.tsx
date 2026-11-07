"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/shared/Icons";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { anatomyRegions, isRegionId, type RegionId } from "@/content/anatomy";
import { regionImagery } from "@/content/imagery";
import { getMotif } from "@/content/motifs";
import { ImageCredit } from "@/features/imagery/ImageCredit";
import { useReducedMotion } from "@/hooks/use-environment";
import type { AnatomyLook } from "../model/materials";
import { AnatomyStage, postRecenter, postZoom } from "./AnatomyStage";

/** Ancienne région « colonne » (liens existants) → colonne lombaire. */
function readRegion(value: string | null): RegionId | null {
  if (value === "colonne") return "lombaires";
  return value && isRegionId(value) ? value : null;
}

/**
 * Explorateur anatomique : squelette 3D (rotation au glisser, zoom contrôlé),
 * deux rendus — « 3D » et « Radiographie » (balayage numérique stylisé) —,
 * sélection d'une région, isolement de l'articulation, mouvement propre à chaque région.
 * La région choisie est reflétée dans l'URL (?region=…), partageable.
 */
export function AnatomyExplorer() {
  const params = useSearchParams();
  const region = readRegion(params.get("region"));
  const reduced = useReducedMotion();
  const [look, setLook] = useState<AnatomyLook>("bone");
  const [isolate, setIsolate] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const down = useRef<{ x: number; y: number } | null>(null);
  const info = region ? anatomyRegions.find((r) => r.id === region) : null;
  const motif = info ? getMotif(info.motifSlug) : undefined;
  const image = region ? regionImagery[region] : null;

  const select = (id: RegionId | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("region", id);
    else url.searchParams.delete("region");
    window.history.replaceState(null, "", url);
    setPaused(false);
    postRecenter();
  };

  // mouvement : joué automatiquement à la sélection, sauf mouvement réduit (lecture à la demande)
  const [requested, setRequested] = useState(false);
  const demo = region !== null && !paused && (!reduced || requested);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:gap-5">
      <div
        className="relative"
        onPointerDown={(e) => {
          down.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const d = down.current;
          down.current = null;
          // un clic (sans glisser) sur un os sélectionne sa région
          if (d && hovered && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) select(hovered);
        }}
      >
        <AnatomyStage
          interactive
          label="Squelette 3D interactif : faites-le pivoter en glissant, zoomez avec les boutons ou en pinçant."
          className={`h-[min(68svh,46rem)] rounded-panel transition-colors duration-700 lg:h-[calc(100svh-var(--header-h)-3rem)] lg:min-h-[36rem] ${look === "xray" ? "bg-[#0b1218]" : "bg-night-soft"}`}
          config={{ mode: "explore", look, region, isolate: isolate && region !== null, demo, playing: !paused && !reduced, hover: true }}
          onHover={setHovered}
          fallback={<SpineDrawing className="h-[78%] w-auto text-xray/80" variant="line" />}
        >
          {/* rendu : 3D ou radiographie */}
          <div data-stage-ui className="absolute left-3 top-3 flex rounded-full bg-night/80 p-1 text-sm font-semibold sm:left-4 sm:top-4" role="group" aria-label="Rendu">
            {(["bone", "xray"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={look === l}
                onClick={() => setLook(l)}
                className={`min-h-10 rounded-full px-4 transition-colors ${look === l ? "bg-xray text-night" : "text-bone hover:bg-bone/10"}`}
              >
                {l === "bone" ? "3D" : "Radiographie"}
              </button>
            ))}
          </div>

          {/* commandes de vue */}
          <div data-stage-ui className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 sm:bottom-4 sm:left-4 sm:right-auto">
            <div className="flex rounded-full bg-night/80 p-1 text-bone">
              <button type="button" onClick={() => postZoom(0.82)} aria-label="Zoomer" className="icon-btn hover:bg-bone/10">
                <span aria-hidden="true" className="text-xl leading-none">+</span>
              </button>
              <button type="button" onClick={() => postZoom(1.22)} aria-label="Dézoomer" className="icon-btn hover:bg-bone/10">
                <span aria-hidden="true" className="text-xl leading-none">−</span>
              </button>
              <button type="button" onClick={() => postRecenter()} className="min-h-11 rounded-full px-3 text-sm font-semibold hover:bg-bone/10">
                Recentrer
              </button>
            </div>
            {region ? (
              <div className="flex rounded-full bg-night/80 p-1 text-sm font-semibold text-bone">
                <button type="button" aria-pressed={isolate} onClick={() => setIsolate((v) => !v)} className={`min-h-11 rounded-full px-4 ${isolate ? "bg-bone text-night" : "hover:bg-bone/10"}`}>
                  Isoler la région
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (demo) setPaused(true);
                    else {
                      setPaused(false);
                      setRequested(true);
                    }
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-full px-4 hover:bg-bone/10"
                >
                  {demo ? <PauseIcon /> : <PlayIcon />}
                  {demo ? "Pause" : "Lire le mouvement"}
                </button>
              </div>
            ) : null}
          </div>

          <p
            className="hover-label pointer-events-none absolute right-4 top-4 hidden rounded-full bg-night/80 px-4 py-2 text-sm font-semibold text-bone md:block"
            data-visible={hovered && hovered !== region ? "true" : "false"}
            aria-hidden="true"
          >
            {hovered ? anatomyRegions.find((r) => r.id === hovered)?.label : " "}
          </p>
        </AnatomyStage>
        <p className="mt-3 px-2 text-[0.8rem] text-mist">
          {look === "xray"
            ? "Rendu numérique d'inspiration radiographique, à visée pédagogique : ce n'est pas un examen d'imagerie."
            : "Modèle anatomique pédagogique simplifié. Glissez pour faire pivoter, cliquez sur un os pour choisir sa région."}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <nav aria-label="Régions anatomiques" className="card-dark rounded-panel p-3">
          <ul className="flex flex-wrap gap-2">
            {anatomyRegions.map((r) => (
              <li key={r.id}>
                <button type="button" aria-pressed={region === r.id} onClick={() => select(region === r.id ? null : r.id)} className="chip">
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <aside aria-live="polite" className="card-dark flex-1 rounded-panel p-7 md:p-8">
          {info ? (
            <>
              <p className="eyebrow eyebrow--xray">Région sélectionnée</p>
              <h3 className="display mt-4 text-[clamp(2rem,1.5rem+1.6vw,3rem)]">{info.label}</h3>
              <p className="lede mt-4">{info.summary}</p>
              <div className="prose-body mt-5 text-[0.98rem]">
                {info.body.map((b) => (
                  <p key={b}>{b}</p>
                ))}
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-xray/15">
                {info.keyFacts.map((f) => (
                  <div key={f.label} className="bg-night-soft p-4">
                    <dt className="text-[0.78rem] text-mist">{f.label}</dt>
                    <dd className="mt-1 font-display text-xl text-bone">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 border-l-2 border-xray/60 pl-4 text-[0.95rem] text-mist">{info.movement.caption}</p>
              {look === "xray" && image ? (
                <figure className="mt-6">
                  <div className="xray-frame relative aspect-[4/3]">
                    <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 26rem, 100vw" quality={70} className="object-cover" />
                    <span className="scan-line" data-run="true" aria-hidden="true" key={image.id} />
                  </div>
                  <figcaption className="mt-2">
                    <ImageCredit image={image} />
                  </figcaption>
                </figure>
              ) : null}
              {motif ? (
                <p className="mt-7">
                  <Link href={`/motifs-de-consultation/${motif.slug}`} className="link-more text-bone">
                    Motif associé : {motif.title} <span className="btn-arrow" aria-hidden="true">→</span>
                  </Link>
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="eyebrow eyebrow--xray">Mode d&apos;emploi</p>
              <h3 className="display mt-4 text-[clamp(2rem,1.5rem+1.6vw,3rem)]">Choisissez une région</h3>
              <p className="prose-body mt-4">
                Sélectionnez une région ci-dessus ou cliquez directement sur un os. La caméra s&apos;en rapproche, l&apos;articulation s&apos;anime et les explications apparaissent ici.
              </p>
              <p className="prose-body mt-4">Le mode « Radiographie » révèle les structures par un balayage lumineux, à la manière d&apos;un cliché.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
