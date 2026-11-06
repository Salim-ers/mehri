"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { anatomyRegions, getRegion, type RegionId } from "@/content/anatomy";
import { motifs } from "@/content/motifs";
import { useDeviceTier, useInView, useReducedMotion, useWebGLSupport } from "@/hooks/use-environment";
import { BodyMap } from "./BodyMap";

const AtlasScene = dynamic(() => import("./AtlasScene"), { ssr: false, loading: () => null });

const LABELS = Object.fromEntries(anatomyRegions.map((r) => [r.id, r.label])) as Record<RegionId, string>;

/**
 * « Où se situe la gêne ? » : squelette en rendu radiographique. La zone choisie
 * s'éclaire, la caméra s'en approche et une courte explication apparaît, avec les
 * fiches correspondantes. Orientation vers l'information — jamais un diagnostic.
 */
export function RegionFinder() {
  const webgl = useWebGLSupport();
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const near = useInView(stage, "300px");
  const visible = useInView(stage, "0px");
  const [selected, setSelected] = useState<RegionId | null>(null);
  const region = selected ? getRegion(selected) : null;
  const related = selected ? motifs.filter((m) => m.region === selected) : [];
  const use3D = webgl === "supported" && near;

  return (
    <section id="zones" aria-labelledby="zones-title" className="on-dark xray-stage grain relative scroll-mt-[var(--header-h)] overflow-hidden text-bone">
      <div className="wrap px-[var(--gutter)] pt-20 md:pt-28">
        <p className="eyebrow">Où se situe la gêne ?</p>
        <h2 id="zones-title" className="display mt-5 max-w-3xl text-[clamp(2.3rem,1.4rem+3.4vw,4.8rem)]">
          Choisissez une <em>zone du corps.</em>
        </h2>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {region ? `Zone sélectionnée : ${region.label}` : "Aucune zone sélectionnée"}
      </p>

      <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-y-6 pb-20 md:pb-28 lg:grid-cols-[minmax(12rem,16rem)_1fr_minmax(19rem,25rem)] lg:gap-x-4">
        <nav aria-label="Zones du corps" className="order-2 px-[var(--gutter)] lg:order-1 lg:flex lg:flex-col lg:justify-center lg:pr-0">
          <ul className="-mx-[var(--gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--gutter)] pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {anatomyRegions.map((r) => {
              const on = selected === r.id;
              return (
                <li key={r.id} className="snap-start">
                  <button
                    type="button"
                    onClick={() => setSelected(on ? null : r.id)}
                    aria-pressed={on}
                    className={`flex min-h-11 w-max items-center gap-3 rounded-full border px-4 text-left text-[0.95rem] transition-colors lg:w-full lg:rounded-none lg:border-0 lg:px-0 lg:text-[1.05rem] ${
                      on ? "border-bronze-light bg-bronze-light/15 text-bone lg:bg-transparent" : "border-bone/15 text-bone/70 hover:text-bone"
                    }`}
                  >
                    <span aria-hidden="true" className={`hidden h-1.5 w-1.5 rounded-full lg:block ${on ? "bg-bronze-light" : "bg-bone/25"}`} />
                    {r.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div ref={stage} className="relative order-1 h-[58svh] min-h-[420px] lg:order-2 lg:h-[78svh] lg:max-h-[860px]">
          {use3D ? (
            <AtlasScene
              look="xray"
              selected={selected}
              playing={!reduced}
              detail={tier}
              active={visible}
              reducedMotion={reduced}
              onSelect={setSelected}
              onHover={() => undefined}
            />
          ) : webgl === "unsupported" ? (
            <div className="flex h-full items-center justify-center py-6">
              <BodyMap selected={selected} onSelect={setSelected} labels={LABELS} tone="dark" />
            </div>
          ) : null}
        </div>

        <aside aria-label="Explication de la zone" className="order-3 px-[var(--gutter)] lg:flex lg:flex-col lg:justify-center lg:pl-0">
          {region ? (
            <div key={region.id} className="panel-in">
              <h3 className="display text-[clamp(2rem,1.5rem+1.8vw,3.2rem)]">{region.label}</h3>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-bone/85">{region.summary}</p>
              {related.length ? (
                <ul className="mt-8 border-t border-bone/12">
                  {related.map((m) => (
                    <li key={m.slug} className="border-b border-bone/12">
                      <Link href={`/motifs-de-consultation/${m.slug}`} className="group flex items-center justify-between gap-4 py-4">
                        <span className="text-[1.05rem] transition-colors group-hover:text-bronze-light">{m.title}</span>
                        <span aria-hidden="true" className="text-bronze-light transition-transform duration-500 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="text-[1.05rem] leading-relaxed text-bone/80">
              Sélectionnez une zone dans la liste ou directement sur le squelette pour lire une courte explication et les fiches correspondantes.
            </p>
          )}
          <p className="mt-8 text-sm leading-relaxed text-bone/60">
            Une orientation vers une information générale : elle ne remplace ni un examen, ni un avis médical.
          </p>
        </aside>
      </div>
    </section>
  );
}
