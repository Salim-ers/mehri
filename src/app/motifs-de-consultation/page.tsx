import Image from "next/image";
import Link from "next/link";
import { PlusIcon } from "@/components/shared/Icons";
import { OpenOnHash } from "@/components/shared/OpenOnHash";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { PendingBadge } from "@/components/shared/Pending";
import { RedFlags } from "@/components/shared/RedFlags";
import { Reveal } from "@/components/shared/Reveal";
import { categoryVisuals } from "@/content/imagery";
import { getMotif, motifCategories, motifsValidation, type Motif } from "@/content/motifs";
import { ImageCredit } from "@/features/imagery/ScrollCrossfade";
import { RegionFinder } from "@/features/anatomy/components/RegionFinder";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pourquoi consulter un ostéopathe à Creil ?",
  description:
    "Dos, nuque, épaules, hanches, genoux, tensions musculaires, pratique sportive : les motifs fréquents de consultation au cabinet d'ostéopathie de Creil, et les situations qui relèvent d'abord d'un médecin.",
  path: "/motifs-de-consultation",
});

export default function MotifsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Pourquoi consulter ?", path: "/motifs-de-consultation" }])),
        }}
      />
      <OpenOnHash />
      <PageIntro
        eyebrow="Pourquoi consulter ?"
        title={<Lines lines={["Pourquoi consulter", <><em>un ostéopathe ?</em></>]} />}
        lede={
          <p>
            Raideurs, gênes articulaires, tensions : les motifs les plus fréquents, et les situations qui relèvent d&apos;abord d&apos;un
            médecin. <PendingBadge fact={motifsValidation} />
          </p>
        }
      />

      <RegionFinder />

      {/* Catégories d'abord, détail des fiches sur demande */}
      <section aria-labelledby="categories" className="px-[var(--gutter)] py-24 md:py-36">
        <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Motifs de consultation</p>
            <h2 id="categories" className="display mt-5 text-[clamp(2.2rem,1.4rem+2.8vw,4rem)]">
              Quatre grandes <em>familles.</em>
            </h2>
            <p className="prose-body mt-6 max-w-sm">Ouvrez une famille pour découvrir les fiches détaillées : contexte, déroulement possible et précautions.</p>
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            {motifCategories.map((c) => {
              const list = c.slugs.map(getMotif).filter((m): m is Motif => m !== undefined);
              const visual = categoryVisuals[c.id];
              return (
                <details key={c.id} id={c.id} name="familles" className="disclosure scroll-mt-[calc(var(--header-h)+2rem)] border-b border-ink/10 first:border-t">
                  <summary className="flex items-start justify-between gap-6 py-8">
                    <span>
                      <span className="display block text-[clamp(1.9rem,1.5rem+1.4vw,2.9rem)]">{c.title}</span>
                      <span className="mt-3 block max-w-xl text-[1rem] leading-relaxed text-ink-soft">{c.intro}</span>
                    </span>
                    <span className="mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15">
                      <PlusIcon className="disclosure-icon h-4 w-4" />
                    </span>
                  </summary>
                  <div className="grid gap-6 pb-8 sm:grid-cols-[minmax(8rem,11rem)_1fr] sm:gap-8">
                  {visual ? (
                    <figure className="max-w-[11rem]">
                      <div className="xray-frame relative aspect-[4/5] overflow-hidden rounded-[4px]">
                        <Image src={visual.src} alt={visual.alt} fill sizes="11rem" className="xray-img object-cover" />
                      </div>
                      <figcaption>
                        <ImageCredit image={visual} />
                      </figcaption>
                    </figure>
                  ) : null}
                  <ul>
                    {list.map((m) => (
                      <li key={m.slug}>
                        <Link
                          href={`/motifs-de-consultation/${m.slug}`}
                          className="group grid gap-2 rounded-2xl py-4 transition-colors first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:px-4 sm:first:pt-4 sm:hover:bg-paper"
                        >
                          <span>
                            <span className="block text-[1.15rem] font-medium">{m.title}</span>
                            <span className="mt-1.5 block text-[0.97rem] leading-relaxed text-ink-soft">{m.lede}</span>
                          </span>
                          <span className="text-sm font-medium text-bronze-ink transition-transform duration-500 group-hover:translate-x-1">Lire la fiche →</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="cadre" className="px-[var(--gutter)] pb-24 md:pb-36">
        <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Le cadre</p>
            <h2 id="cadre" className="display mt-5 text-[clamp(2rem,1.3rem+2.2vw,3.4rem)]">
              Des troubles fonctionnels, <em>un cadre précis.</em>
            </h2>
            <div className="prose-body mt-6">
              <p>
                L&apos;ostéopathe peut pratiquer des manipulations et mobilisations destinées à prévenir ou à remédier à des troubles fonctionnels
                du corps humain. Il n&apos;intervient pas sur les pathologies organiques nécessitant un traitement médical ou chirurgical, et
                oriente vers un médecin lorsque c&apos;est nécessaire (décret n° 2007-435 du 25 mars 2007).
              </p>
              <p>Aucune séance ne peut garantir un résultat : chaque situation est différente.</p>
            </div>
            <Link href="/deroulement-consultation" className="link-more mt-8 text-ink">
              Le déroulement d&apos;une consultation
            </Link>
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            <RedFlags />
          </div>
        </div>
      </section>
    </>
  );
}
