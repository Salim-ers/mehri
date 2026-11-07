import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { BookingButton } from "@/components/shared/BookingButton";
import { ArrowIcon } from "@/components/shared/Icons";
import { Lines } from "@/components/shared/PageIntro";
import { PendingBadge } from "@/components/shared/Pending";
import { RedFlags } from "@/components/shared/RedFlags";
import { Reveal } from "@/components/shared/Reveal";
import { REGION_IDS, type RegionId } from "@/content/anatomy";
import { categoryVisuals } from "@/content/imagery";
import { getMotif, motifCategories, motifs, motifsValidation, type Motif } from "@/content/motifs";
import { MotifStage } from "@/features/anatomy/components/MotifStage";
import { ImageCredit } from "@/features/imagery/ImageCredit";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pourquoi consulter un ostéopathe à Creil ?",
  description:
    "Dos, nuque, épaules, hanches, genoux, tensions musculaires, pratique sportive : les motifs fréquents de consultation au cabinet d'ostéopathie de Creil, et les situations qui relèvent d'abord d'un médecin.",
  path: "/motifs-de-consultation",
});

const regionMotifs = Object.fromEntries(
  REGION_IDS.map((id) => [id, motifs.filter((m) => m.region === id).map((m) => ({ slug: m.slug, title: m.shortTitle }))]),
) as Record<RegionId, { slug: string; title: string }[]>;

/** Chaque famille a sa propre mise en forme (jamais la même carte répétée). */
const TONES = ["bg-paper", "panel-sand", "bg-paper", "panel-sand"] as const;

export default function MotifsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Motifs de consultation", path: "/motifs-de-consultation" }])),
        }}
      />
      <header className="wrap pb-12 pt-[calc(var(--header-h)+3rem)] md:pb-16 md:pt-[calc(var(--header-h)+5rem)]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow fade-up">
              Motifs de consultation <PendingBadge fact={motifsValidation} />
            </p>
            <h1 className="display line-rise mt-5 text-[clamp(2.8rem,1.5rem+5.4vw,7.6rem)]">
              <Lines lines={["Pourquoi", <em key="c">consulter&nbsp;?</em>]} />
            </h1>
          </div>
          <p className="lede fade-up lg:col-span-4" style={{ ["--d" as string]: "300ms" }}>
            Choisissez une région ou parcourez les familles de motifs : le modèle anatomique vous montre où se situent les structures concernées.
          </p>
        </div>
      </header>

      <section aria-label="Motifs par région du corps" className="wrap grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] lg:gap-8">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+0.75rem)] lg:h-[calc(100svh-var(--header-h)-1.5rem)]">
          <div className="h-[62svh] min-h-[30rem] lg:h-full">
            <MotifStage containerId="familles" regionMotifs={regionMotifs} />
          </div>
        </div>

        <div id="familles" className="flex flex-col gap-5 pb-8">
          {motifCategories.map((cat, i) => {
            const visual = categoryVisuals[cat.id];
            const list = cat.slugs.map((s) => getMotif(s)).filter((m): m is Motif => m !== undefined);
            return (
              <Reveal key={cat.id} className={`${TONES[i] ?? "bg-paper"} rounded-panel p-7 md:p-10 ${i % 2 === 0 ? "panel" : ""}`}>
                <article id={cat.id} data-focus-region={cat.region} aria-labelledby={`${cat.id}-titre`} className="scroll-mt-[calc(var(--header-h)+1rem)]">
                  <div className={`flex gap-6 ${i % 2 ? "flex-row-reverse" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <h2 id={`${cat.id}-titre`} className="display text-[clamp(2rem,1.5rem+1.6vw,3.1rem)]">
                        {cat.title}
                      </h2>
                      <p className="prose-body mt-3">{cat.intro}</p>
                    </div>
                    {visual ? (
                      <div className="xray-frame relative hidden aspect-[3/4] w-28 shrink-0 sm:block md:w-36">
                        <Image src={visual.src} alt="" fill sizes="9rem" quality={65} className="object-cover" />
                      </div>
                    ) : null}
                  </div>
                  <ul className="mt-7 divide-y divide-clay border-y border-clay">
                    {list.map((m) => (
                      <li key={m.slug} data-focus-region={m.region}>
                        <Link href={`/motifs-de-consultation/${m.slug}`} className="group flex items-center gap-5 py-5">
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-[1.45rem] leading-tight">{m.title}</span>
                            <span className="mt-1 line-clamp-2 block text-[0.95rem] text-ink-soft">{m.lede}</span>
                          </span>
                          <span className="icon-btn shrink-0 bg-sand transition-colors group-hover:bg-graphite group-hover:text-paper" aria-hidden="true">
                            <ArrowIcon />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {visual ? <ImageCredit image={visual} tone="light" className="mt-4 sm:hidden" /> : null}
                </article>
              </Reveal>
            );
          })}

          <RedFlags />

          <ViewTransition name="reading-surface" share="morph" default="none">
            <Link href="/conseils" transitionTypes={["to-reading"]} className="panel-graphite on-dark group block p-8 md:p-10">
              <p className="eyebrow">Avant de venir</p>
              <p className="display mt-4 text-[clamp(1.9rem,1.4rem+1.6vw,2.8rem)]">
                Préparer votre consultation, <em>pas à pas.</em>
              </p>
              <span className="link-more mt-6 text-bone">
                Lire les conseils <ArrowIcon className="btn-arrow h-4 w-4" />
              </span>
            </Link>
          </ViewTransition>

          <div className="flex flex-col items-start gap-4 rounded-panel bg-sand p-8 md:flex-row md:items-center md:justify-between">
            <p className="font-display text-2xl">Vous vous reconnaissez dans l&apos;un de ces motifs&nbsp;?</p>
            <BookingButton />
          </div>
        </div>
      </section>
      <div className="h-16 md:h-24" aria-hidden="true" />
    </>
  );
}
