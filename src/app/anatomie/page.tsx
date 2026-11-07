import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BookingButton } from "@/components/shared/BookingButton";
import { Lines } from "@/components/shared/PageIntro";
import { Reveal } from "@/components/shared/Reveal";
import { anatomyRegions } from "@/content/anatomy";
import { regionImagery } from "@/content/imagery";
import { AnatomyExplorer } from "@/features/anatomy/components/AnatomyExplorer";
import { ImageCredit } from "@/features/imagery/ImageCredit";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Anatomie : sous la surface, le mouvement",
  description:
    "Explorez en 3D les structures qui participent à la mobilité du corps : cervicales, thorax, lombaires, bassin, épaules, hanches et genoux, en vue anatomique ou radiographique.",
  path: "/anatomie",
});

export default function AnatomyPage() {
  return (
    <div className="on-dark bg-night">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Anatomie", path: "/anatomie" }])) }} />
      <header className="wrap pb-10 pt-[calc(var(--header-h)+2.5rem)] md:pb-14 md:pt-[calc(var(--header-h)+4rem)]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow eyebrow--xray fade-up">Anatomie</p>
            <h1 className="display line-rise mt-5 text-[clamp(2.8rem,1.5rem+5.4vw,7.6rem)]">
              <Lines lines={["Sous la surface,", <em key="m">le mouvement.</em>]} />
            </h1>
          </div>
          <p className="lede fade-up lg:col-span-4" style={{ ["--d" as string]: "300ms" }}>
            Découvrez les structures anatomiques qui participent à la mobilité du corps.
          </p>
        </div>
      </header>

      <section id="explorateur" aria-labelledby="explorateur-titre" className="wrap">
        <h2 id="explorateur-titre" className="sr-only">
          Explorateur anatomique 3D
        </h2>
        <Suspense fallback={<div className="h-[min(68svh,46rem)] rounded-panel bg-night-soft lg:h-[calc(100svh-var(--header-h)-3rem)]" aria-hidden="true" />}>
          <AnatomyExplorer />
        </Suspense>
      </section>

      {/* Contenu complet des régions (lisible sans JavaScript, indexable) */}
      <section aria-labelledby="regions-texte" className="wrap py-24 md:py-32">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow eyebrow--xray">Les régions en détail</p>
            <h2 id="regions-texte" className="display mt-5 text-[clamp(2.2rem,1.4rem+3vw,4.4rem)]">
              Sept régions, <em>sept mouvements.</em>
            </h2>
          </div>
          <p className="lede lg:col-span-5 lg:col-start-8 lg:self-end">
            Contenu pédagogique général : il décrit l&apos;anatomie et la mobilité, sans valeur de diagnostic.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {anatomyRegions.map((r, i) => {
            const image = regionImagery[r.id];
            return (
              <Reveal key={r.id} delay={(i % 2) * 90} className={`card-dark overflow-hidden rounded-panel ${i === 0 ? "md:col-span-2 md:grid md:grid-cols-[1fr_1.2fr]" : ""}`}>
                <article id={`region-${r.id}`} className="contents">
                  <div className={`xray-frame relative m-2 ${i === 0 ? "aspect-[4/3] md:aspect-auto" : "aspect-[16/9]"}`}>
                    <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 45vw, 100vw" quality={70} className="object-cover" />
                    <span className="scan-line" aria-hidden="true" />
                  </div>
                  <div className="p-7 md:p-9">
                    <h3 className="display text-[clamp(1.9rem,1.4rem+1.4vw,2.8rem)]">{r.label}</h3>
                    <p className="lede mt-3">{r.summary}</p>
                    <div className="prose-body mt-4 text-[0.98rem]">
                      {r.body.map((b) => (
                        <p key={b}>{b}</p>
                      ))}
                    </div>
                    <p className="mt-5 text-[0.95rem] text-mist">{r.movement.caption}</p>
                    <Link href={`/anatomie?region=${r.id}#explorateur`} className="link-more mt-6 text-bone">
                      Voir en 3D <span className="btn-arrow" aria-hidden="true">→</span>
                    </Link>
                    <ImageCredit image={image} className="mt-6" />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="wrap pb-24 md:pb-32">
        <div className="card-dark flex flex-col items-start gap-6 rounded-panel p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <p className="display max-w-2xl text-[clamp(1.9rem,1.3rem+2vw,3.2rem)]">
            Une gêne vous empêche de bouger <em>comme avant&nbsp;?</em>
          </p>
          <BookingButton variant="light" size="lg" />
        </div>
      </section>
    </div>
  );
}
