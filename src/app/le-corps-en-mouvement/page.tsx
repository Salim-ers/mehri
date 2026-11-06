import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "@/components/shared/Icons";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { Reveal } from "@/components/shared/Reveal";
import { anatomyRegions } from "@/content/anatomy";
import { getMotif } from "@/content/motifs";
import { AtlasExplorer } from "@/features/anatomy/components/AtlasExplorer";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Corps en mouvement — explorateur anatomique 3D",
  description:
    "Explorez en 3D la colonne vertébrale, les cervicales, les épaules, le thorax, le bassin, les hanches et les genoux, et observez leurs mouvements : un contenu pédagogique du cabinet d'ostéopathie de Creil.",
  path: "/le-corps-en-mouvement",
});

export default function AtlasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Corps en mouvement", path: "/le-corps-en-mouvement" }])),
        }}
      />
      <PageIntro
        eyebrow="Corps en mouvement"
        title={<Lines lines={["Le corps", <>en <em>mouvement.</em></>]} />}
        lede={<p>Choisissez une région du squelette et observez comment elle bouge. Un contenu éducatif, qui ne remplace pas un examen.</p>}
      />
      <Suspense fallback={<div className="min-h-[70svh] bg-mineral" aria-hidden="true" />}>
        <AtlasExplorer />
      </Suspense>

      {/* Version textuelle complète : accessible et indexable, même sans 3D */}
      <section aria-labelledby="regions-texte" className="px-[var(--gutter)] py-24 md:py-32">
        <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">En savoir plus</p>
            <h2 id="regions-texte" className="display mt-5 text-[clamp(2.1rem,1.3rem+2.8vw,3.9rem)]">
              Les sept régions, <em>en détail.</em>
            </h2>
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            {anatomyRegions.map((r) => {
              const motif = getMotif(r.motifSlug);
              return (
                <details key={r.id} id={`region-${r.id}`} className="disclosure group border-b border-ink/10 first:border-t">
                  <summary className="flex min-h-11 items-center justify-between gap-6 py-6">
                    <h3 className="display text-[clamp(1.6rem,1.3rem+1vw,2.3rem)]">{r.label}</h3>
                    <PlusIcon className="disclosure-icon h-5 w-5 shrink-0 text-bronze-ink" />
                  </summary>
                  <div className="pb-8">
                    <p className="lede">{r.summary}</p>
                    <div className="prose-body mt-4">
                      {r.body.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                      {r.keyFacts.map((f) => (
                        <div key={f.label}>
                          <dt className="text-sm text-ink-soft">{f.label}</dt>
                          <dd className="display mt-1 text-2xl">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-6 text-[0.98rem] text-ink-soft">{r.movement.caption}</p>
                    <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                      <Link href={`/le-corps-en-mouvement?region=${r.id}#atlas`} className="link-more text-ink">
                        Voir en 3D
                      </Link>
                      {motif ? (
                        <Link href={`/motifs-de-consultation/${motif.slug}`} className="link-line text-ink">
                          {motif.title}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
