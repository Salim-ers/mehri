"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/shared/Icons";
import { anatomyRegions, getRegion, isRegionId, type RegionId } from "@/content/anatomy";
import { getMotif } from "@/content/motifs";
import { useDeviceTier, useIdleAfterLoad, useInView, useMediaQuery, useReducedMotion, useWebGLSupport } from "@/hooks/use-environment";
import { BodyMap } from "./BodyMap";

const AtlasScene = dynamic(() => import("./AtlasScene"), {
  ssr: false,
  loading: () => <SceneLoading />,
});

function SceneLoading() {
  return (
    <div className="flex h-full items-center justify-center" role="status">
      <span className="text-sm text-ink-soft">Préparation du squelette…</span>
    </div>
  );
}

const LABELS = Object.fromEntries(anatomyRegions.map((r) => [r.id, r.label])) as Record<RegionId, string>;

/**
 * « Corps en mouvement » : le squelette 3D au centre, une liste courte de
 * régions, et pour la région choisie un titre, une phrase et son mouvement.
 * Utilisable entièrement au clavier ; version vectorielle sans WebGL.
 */
export function AtlasExplorer() {
  const webgl = useWebGLSupport();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage);
  // la 3D démarre après le chargement de la page : le texte et la navigation restent immédiatement réactifs
  const idle = useIdleAfterLoad(1200);
  const params = useSearchParams();
  const q = params.get("region");
  const selected: RegionId | null = q && isRegionId(q) ? q : null;
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const [lite, setLite] = useState(false);
  // mouvement réduit : les démonstrations ne démarrent pas seules
  const [playPref, setPlayPref] = useState<boolean | null>(null);
  const isPlaying = playPref ?? !reduced;

  // la région vit dans l'URL (?region=genoux) : lien partageable, sans rechargement
  const select = useCallback((id: RegionId | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("region", id);
    else url.searchParams.delete("region");
    window.history.replaceState(null, "", url);
  }, []);

  const region = selected ? getRegion(selected) : null;
  const motif = region ? getMotif(region.motifSlug) : undefined;
  const use3D = webgl === "supported" && !lite;

  return (
    <section id="atlas" aria-labelledby="atlas-stage-title" className="relative scroll-mt-[var(--header-h)] bg-[radial-gradient(60%_70%_at_50%_42%,#fbf9f5_0%,#ece7df_62%,#e2dcd2_100%)]">
      <h2 id="atlas-stage-title" className="sr-only">
        Explorateur anatomique
      </h2>
      <p className="sr-only" role="status" aria-live="polite">
        {region ? `Région sélectionnée : ${region.label}` : "Vue d'ensemble du squelette"}
      </p>
      <div className="wrap grid grid-cols-[minmax(0,1fr)] lg:h-[calc(100svh-var(--header-h))] lg:min-h-[640px] lg:max-h-[1100px] lg:grid-cols-[minmax(13rem,17rem)_1fr_minmax(19rem,25rem)]">
        {/* Régions */}
        <nav aria-label="Régions anatomiques" className="order-2 px-[var(--gutter)] pt-4 lg:order-1 lg:flex lg:flex-col lg:justify-center lg:py-12 lg:pr-0">
          <ul className="-mx-[var(--gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--gutter)] pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {anatomyRegions.map((r) => {
              const on = selected === r.id;
              return (
                <li key={r.id} className="snap-start">
                  <button
                    type="button"
                    onClick={() => select(on ? null : r.id)}
                    aria-pressed={on}
                    className={`group flex min-h-11 w-max items-center gap-3 rounded-full border px-4 text-left text-[0.95rem] transition-colors lg:w-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[1.05rem] ${
                      on ? "border-ink bg-ink text-paper lg:bg-transparent lg:text-ink" : "border-ink/15 text-ink-soft hover:text-ink"
                    } ${hovered === r.id ? "lg:text-ink" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`hidden h-1.5 w-1.5 rounded-full transition-all duration-500 lg:block ${on ? "scale-100 bg-bronze" : "scale-0 bg-ink/40 group-hover:scale-100"}`}
                    />
                    <span className={on ? "font-medium" : ""}>{r.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 hidden flex-col items-start gap-2 text-sm text-ink-soft lg:flex">
            <button type="button" onClick={() => select(null)} disabled={!selected} className="min-h-11 hover:text-ink disabled:opacity-40">
              Vue d&apos;ensemble
            </button>
            {webgl === "supported" ? (
              <button type="button" onClick={() => setLite((v) => !v)} aria-pressed={lite} className="min-h-11 text-left hover:text-ink">
                {lite ? "Revenir à la 3D" : "Version allégée sans 3D"}
              </button>
            ) : null}
          </div>
        </nav>

        {/* Scène */}
        <div ref={stage} className="relative order-1 h-[62svh] min-h-[420px] lg:order-2 lg:h-auto">
          {webgl === "pending" || (webgl === "supported" && !lite && !idle) ? (
            <SceneLoading />
          ) : use3D ? (
            <AtlasScene selected={selected} playing={isPlaying} detail={tier} active={inView} reducedMotion={reduced} onSelect={(id) => select(id)} onHover={setHovered} />
          ) : (
            <div className="flex h-full items-center justify-center py-8 text-ink">
              <BodyMap selected={selected} onSelect={(id) => select(id)} labels={LABELS} tone="light" />
            </div>
          )}
          <p className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-4 text-center text-[0.8rem] text-ink-soft lg:text-left">
            {use3D
              ? hovered
                ? LABELS[hovered]
                : coarse
                  ? "Deux doigts pour tourner · touchez un os"
                  : "Glissez pour tourner · cliquez sur un os"
              : webgl === "unsupported"
                ? "Version vectorielle : la 3D n'est pas disponible sur cet appareil"
                : "Version vectorielle"}
          </p>
        </div>

        {/* Explication courte */}
        <aside className="order-3 px-[var(--gutter)] pb-16 pt-6 lg:flex lg:flex-col lg:justify-center lg:py-12 lg:pl-0">
          {region ? (
            <article key={region.id} className="panel-in">
              <h3 className="display text-[clamp(2.1rem,1.5rem+2vw,3.4rem)]">{region.label}</h3>
              <p className="lede mt-5 text-ink">{region.summary}</p>
              <div className="mt-8 flex items-start gap-4 border-t border-ink/10 pt-6">
                <button
                  type="button"
                  onClick={() => setPlayPref(!isPlaying)}
                  aria-pressed={!isPlaying}
                  className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-medium transition-colors hover:border-ink"
                >
                  {isPlaying ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
                  {isPlaying ? "Pause" : "Lire le mouvement"}
                </button>
                <p className="pt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">{region.movement.caption}</p>
              </div>
              {motif ? (
                <Link href={`/motifs-de-consultation/${motif.slug}`} className="link-more mt-8 text-ink">
                  Motif associé : {motif.shortTitle}
                </Link>
              ) : null}
            </article>
          ) : (
            <div>
              <h3 className="display text-[clamp(2rem,1.5rem+1.8vw,3.1rem)]">Choisissez une région.</h3>
              <p className="prose-body mt-5">
                Touchez un os ou une région de la liste : la caméra s&apos;approche, la structure s&apos;éclaire et un mouvement simple
                s&apos;anime.
              </p>
              <p className="mt-8 text-sm text-ink-soft">Contenu éducatif : ni diagnostic, ni promesse de traitement.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
