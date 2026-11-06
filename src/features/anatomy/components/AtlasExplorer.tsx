"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { anatomyRegions, getRegion, isRegionId, type RegionId } from "@/content/anatomy";
import { getMotif } from "@/content/motifs";
import { useDeviceTier, useInView, useMediaQuery, useReducedMotion, useWebGLSupport } from "@/hooks/use-environment";
import { BodyMap } from "./BodyMap";

const AtlasScene = dynamic(() => import("./AtlasScene"), {
  ssr: false,
  loading: () => <SceneLoading />,
});

function SceneLoading() {
  return (
    <div className="flex h-full items-center justify-center" role="status">
      <span className="caption-mono text-bone/60">Assemblage du squelette…</span>
    </div>
  );
}

const LABELS = Object.fromEntries(anatomyRegions.map((r) => [r.id, r.label])) as Record<RegionId, string>;

/**
 * Atlas « Le corps en mouvement » : squelette 3D interactif + panneau
 * pédagogique. Navigation entièrement possible au clavier via la liste des
 * régions ; version vectorielle sans WebGL ; animations suspendables.
 */
export function AtlasExplorer() {
  const webgl = useWebGLSupport();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage);
  const params = useSearchParams();
  const q = params.get("region");
  const selected: RegionId | null = q && isRegionId(q) ? q : null;
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const [lite, setLite] = useState(false);

  // mouvement réduit : les démonstrations ne démarrent pas seules
  const [playPref, setPlayPref] = useState<boolean | null>(null);
  const isPlaying = playPref ?? !reduced;

  // la région sélectionnée vit dans l'URL (?region=genoux) : lien partageable,
  // synchronisé par Next.js avec useSearchParams, sans navigation ni rechargement
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
    <section id="atlas" aria-labelledby="atlas-stage-title" className="on-dark relative scroll-mt-[var(--header-h)] bg-umber text-bone">
      <h2 id="atlas-stage-title" className="sr-only">
        Atlas anatomique interactif
      </h2>
      <p className="sr-only" role="status" aria-live="polite">
        {region ? `Région sélectionnée : ${region.label}` : "Vue d'ensemble du squelette"}
      </p>
      <div className="mx-auto grid max-w-[120rem] grid-cols-12 lg:min-h-[100svh]">
        {/* Liste des régions */}
        <nav aria-label="Régions anatomiques" className="order-2 col-span-12 border-bone/10 px-[var(--gutter)] py-6 lg:order-1 lg:col-span-3 lg:border-r lg:py-14">
          <p className="caption-mono mb-4 text-bronze-light">Choisir une région</p>
          <ul className="-mx-[var(--gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--gutter)] pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
            {anatomyRegions.map((r) => {
              const on = selected === r.id;
              return (
                <li key={r.id} className="snap-start">
                  <button
                    type="button"
                    onClick={() => select(on ? null : r.id)}
                    aria-pressed={on}
                    className={`group flex w-max min-h-11 items-baseline gap-3 rounded-full border px-4 py-2 text-left transition-colors lg:w-full lg:rounded-none lg:border-0 lg:border-b lg:border-bone/10 lg:px-0 lg:py-4 ${
                      on ? "border-bronze-light bg-bronze/25 lg:bg-transparent" : "border-bone/20 hover:border-bone/50"
                    } ${hovered === r.id ? "lg:text-bronze-light" : ""}`}
                  >
                    <span className="caption-mono w-7 text-bronze-light">{r.plate}</span>
                    <span className={`transition-colors lg:text-lg ${on ? "text-bronze-light" : "group-hover:text-bronze-light"}`}>{r.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 hidden flex-col gap-3 lg:flex">
            <button type="button" onClick={() => select(null)} className="caption-mono self-start text-bone/60 hover:text-bone" disabled={!selected}>
              ↺ Vue d&apos;ensemble
            </button>
            {webgl === "supported" ? (
              <button type="button" onClick={() => setLite((v) => !v)} className="caption-mono self-start text-bone/60 hover:text-bone" aria-pressed={lite}>
                {lite ? "◐ Revenir à la 3D" : "◑ Version allégée sans 3D"}
              </button>
            ) : null}
          </div>
        </nav>

        {/* Scène */}
        <div ref={stage} className="relative order-1 col-span-12 h-[64svh] min-h-[420px] lg:order-2 lg:col-span-5 lg:h-auto">
          {webgl === "pending" ? (
            <SceneLoading />
          ) : use3D ? (
            <AtlasScene
              selected={selected}
              playing={isPlaying}
              detail={tier}
              active={inView}
              onSelect={(id) => select(id)}
              onHover={setHovered}
            />
          ) : (
            <div className="flex h-full items-center justify-center py-8">
              <BodyMap selected={selected} onSelect={(id) => select(id)} labels={LABELS} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-4 flex items-end justify-between gap-4">
            <p className="caption-mono text-bone/55">
              {use3D ? (hovered ? `Région : ${LABELS[hovered]}` : coarse ? "Deux doigts pour tourner · toucher un os" : "Glisser pour tourner · cliquer sur un os") : "Version vectorielle"}
            </p>
            {region ? (
              <button
                type="button"
                onClick={() => setPlayPref(!isPlaying)}
                className="caption-mono pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border border-bone/25 px-4 hover:border-bone"
                aria-pressed={!isPlaying}
              >
                {isPlaying ? "❚❚ Pause" : "▶ Lire le mouvement"}
              </button>
            ) : null}
          </div>
          {webgl === "unsupported" ? (
            <p className="absolute left-[var(--gutter)] top-4 max-w-xs text-sm text-bone/70">
              La 3D n&apos;est pas disponible sur cet appareil : l&apos;atlas s&apos;affiche en version vectorielle, avec le même contenu.
            </p>
          ) : null}
        </div>

        {/* Panneau explicatif */}
        <aside className="order-3 col-span-12 border-bone/10 px-[var(--gutter)] pb-14 pt-6 lg:col-span-4 lg:border-l lg:py-14">
          {region ? (
            <article key={region.id} className="atlas-panel">
              <p className="caption-mono text-bronze-light">
                Planche {region.plate} · <span lang="la" className="italic normal-case tracking-normal">{region.latin}</span>
              </p>
              <h3 className="display mt-4 text-[clamp(2rem,1.4rem+2vw,3.4rem)]">{region.label}</h3>
              <p className="mt-5 text-lg leading-relaxed text-bone/90">{region.summary}</p>
              <div className="prose-atlas mt-5">
                {region.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-bone/12 bg-bone/12">
                {region.keyFacts.map((f) => (
                  <div key={f.label} className="bg-umber p-4">
                    <dt className="caption-mono text-bone/55">{f.label}</dt>
                    <dd className="display mt-2 text-2xl text-bronze-light">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 border-l-2 border-bronze pl-4 text-[0.95rem] text-bone/80">
                <span className="caption-mono block text-bronze-light">Le mouvement</span>
                {region.movement.caption}
              </p>
              {motif ? (
                <Link href={`/motifs-de-consultation/${motif.slug}`} className="btn btn-light mt-8">
                  Motif associé : {motif.shortTitle} <span className="btn-arrow" aria-hidden="true">→</span>
                </Link>
              ) : null}
            </article>
          ) : (
            <div>
              <p className="caption-mono text-bronze-light">Mode d&apos;emploi</p>
              <h3 className="display mt-4 text-[clamp(2rem,1.4rem+2vw,3.2rem)]">Choisissez une région du corps.</h3>
              <p className="prose-atlas mt-5">
                Sélectionnez une région dans la liste ou cliquez directement sur le squelette. La caméra se rapproche, la structure est mise en
                évidence et une courte animation illustre son mouvement.
              </p>
              <p className="mt-8 text-sm text-bone/60">
                Contenu éducatif : il ne constitue ni un diagnostic ni une promesse de traitement. Pour toute douleur inhabituelle, consultez un
                médecin.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
