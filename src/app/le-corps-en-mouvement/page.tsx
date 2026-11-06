import Link from "next/link";
import { Suspense } from "react";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { Reveal } from "@/components/shared/Reveal";
import { anatomyRegions } from "@/content/anatomy";
import { getMotif } from "@/content/motifs";
import { AtlasExplorer } from "@/features/anatomy/components/AtlasExplorer";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Le corps en mouvement — atlas anatomique 3D",
  description:
    "Explorez en 3D la colonne vertébrale, les cervicales, les épaules, le thorax, le bassin, les hanches et les genoux : un atlas pédagogique proposé par le cabinet d'ostéopathie de Creil.",
  path: "/le-corps-en-mouvement",
});

export default function AtlasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Le corps en mouvement", path: "/le-corps-en-mouvement" }])),
        }}
      />
      <PlateHeader
        plate="II"
        latin="Systema skeletale"
        title={<Lines lines={["Le corps", <>en <em>mouvement.</em></>]} />}
        lede={
          <p>
            Un atlas anatomique interactif pour comprendre comment les structures du corps s&apos;articulent. Faites pivoter le squelette,
            choisissez une région et observez son mouvement. Ce contenu est éducatif : il ne remplace pas un examen.
          </p>
        }
      />
      <Suspense fallback={<div className="min-h-[70svh] bg-umber" aria-hidden="true" />}>
        <AtlasExplorer />
      </Suspense>

      {/* Version textuelle complète : accessible et indexable même sans 3D */}
      <section aria-labelledby="regions-texte" className="px-[var(--gutter)] py-24 md:py-32">
        <div className="mx-auto max-w-[110rem]">
          <Reveal>
            <p className="caption-mono text-bronze-ink">Légendes de l&apos;atlas</p>
            <h2 id="regions-texte" className="display mt-4 max-w-3xl text-[clamp(2rem,1.2rem+3vw,4rem)] text-umber">
              Les sept régions, <em>en texte.</em>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {anatomyRegions.map((r, i) => {
              const motif = getMotif(r.motifSlug);
              return (
                <Reveal as="article" key={r.id} delay={(i % 3) * 80} className="border-t border-umber/15 pt-6" id={`region-${r.id}`}>
                  <p className="caption-mono text-bronze-ink">
                    Planche {r.plate} · <span lang="la" className="italic normal-case tracking-normal">{r.latin}</span>
                  </p>
                  <h3 className="display mt-3 text-3xl text-umber">{r.label}</h3>
                  <p className="prose-atlas mt-4">{r.summary}</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{r.movement.caption}</p>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
                    <Link href={`/le-corps-en-mouvement?region=${r.id}#atlas`} className="link-atlas text-umber">
                      Voir en 3D
                    </Link>
                    {motif ? (
                      <Link href={`/motifs-de-consultation/${motif.slug}`} className="link-atlas text-umber">
                        {motif.title}
                      </Link>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
