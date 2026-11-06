import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingButton } from "@/components/shared/BookingButton";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { RedFlags } from "@/components/shared/RedFlags";
import { Reveal } from "@/components/shared/Reveal";
import { getRegion } from "@/content/anatomy";
import { getMotif, motifs, motifsValidation } from "@/content/motifs";
import { practice, siteUrl } from "@/content/practice";
import { RegionGlyph } from "@/features/anatomy/components/RegionGlyph";
import { RegionViewer } from "@/features/anatomy/components/RegionViewer";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return motifs.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/motifs-de-consultation/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const motif = getMotif(slug);
  if (!motif) return {};
  return pageMetadata({ title: `${motif.title} — ostéopathe à Creil`, description: motif.metaDescription, path: `/motifs-de-consultation/${motif.slug}` });
}

export default async function MotifPage({ params }: PageProps<"/motifs-de-consultation/[slug]">) {
  const { slug } = await params;
  const motif = getMotif(slug);
  if (!motif) notFound();
  const region = getRegion(motif.region);
  const index = motifs.findIndex((m) => m.slug === motif.slug);
  const prev = motifs[(index - 1 + motifs.length) % motifs.length]!;
  const next = motifs[(index + 1) % motifs.length]!;
  const path = `/motifs-de-consultation/${motif.slug}`;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            breadcrumbJsonLd([
              { name: "Accueil", path: "/" },
              { name: "Motifs de consultation", path: "/motifs-de-consultation" },
              { name: motif.title, path },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "MedicalWebPage",
              name: motif.title,
              description: motif.metaDescription,
              about: { "@type": "AnatomicalStructure", name: region.label },
              audience: { "@type": "Patient" },
              url: `${siteUrl}${path}`,
              author: { "@id": `${siteUrl}/#praticien` },
            },
          ]),
        }}
      />
      <header className="px-[var(--gutter)] pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-8">
          <nav aria-label="Fil d'Ariane" className="caption-mono col-span-12 text-ink-soft">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/motifs-de-consultation" className="hover:text-umber">
                  Motifs de consultation
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-bronze-ink">
                Fiche {motif.number}
              </li>
            </ol>
          </nav>
          <div className="col-span-12 lg:col-span-8">
            <h1 className="display text-[clamp(2.5rem,1.4rem+4.4vw,6.4rem)] text-umber">{motif.title}</h1>
            <p className="mt-8 max-w-2xl font-display text-[clamp(1.2rem,1rem+0.7vw,1.7rem)] leading-snug text-ink">{motif.lede}</p>
            <p className="caption-mono mt-6 text-ink-soft">
              Région associée : {region.label} <PendingBadge fact={motifsValidation} />
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-[110rem]">
          <div className="ruler" />
        </div>
      </header>

      <div className="px-[var(--gutter)] py-16 md:py-24">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-14">
          {/* Illustration 3D de la région */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <figure>
                <div className="registration relative h-[56svh] max-h-[640px] overflow-hidden rounded-lg bg-[radial-gradient(70%_60%_at_50%_45%,#fffaf2,#ece3d6)] text-umber/40">
                  <RegionViewer region={motif.region} fallback={<RegionGlyph region={motif.region} className="h-4/5 w-auto text-umber/70" />} />
                </div>
                <figcaption className="caption-mono mt-3 text-ink-soft">
                  <span className="text-bronze-ink">Fig. {motif.number}</span> — {region.label}. {region.movement.caption}
                </figcaption>
              </figure>
              <Link href={`/le-corps-en-mouvement?region=${region.id}#atlas`} className="link-atlas mt-5 inline-block text-umber">
                Explorer cette région dans l&apos;atlas 3D →
              </Link>
            </div>
          </div>

          <div className="col-span-12 space-y-16 lg:col-span-6 lg:col-start-7">
            <Reveal as="section" aria-labelledby="contexte">
              <p className="caption-mono text-bronze-ink">01 · Contexte</p>
              <h2 id="contexte" className="display mt-3 text-3xl text-umber md:text-4xl">
                Comprendre
              </h2>
              <div className="prose-atlas mt-5">
                {motif.context.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal as="section" aria-labelledby="situations">
              <p className="caption-mono text-bronze-ink">02 · Situations fréquentes</p>
              <h2 id="situations" className="display mt-3 text-3xl text-umber md:text-4xl">
                Ce qui amène à consulter
              </h2>
              <ul className="mt-6 divide-y divide-umber/12 border-y border-umber/12">
                {motif.situations.map((s) => (
                  <li key={s} className="flex gap-4 py-4 text-[1.02rem]">
                    <span aria-hidden="true" className="caption-mono pt-1 text-bronze-ink">
                      ◇
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal as="section" aria-labelledby="deroulement">
              <p className="caption-mono text-bronze-ink">03 · Déroulement possible</p>
              <h2 id="deroulement" className="display mt-3 text-3xl text-umber md:text-4xl">
                Pendant la consultation
              </h2>
              <ol className="mt-6 space-y-5">
                {motif.session.map((s, i) => (
                  <li key={s} className="grid grid-cols-[2.5rem_1fr] gap-3">
                    <span className="display text-2xl text-bronze-ink">{i + 1}</span>
                    <p className="prose-atlas">{s}</p>
                  </li>
                ))}
              </ol>
              {motif.slug === "accompagnement-selon-l-age" ? (
                <div className="mt-6">
                  {hasValue(practice.publics) ? (
                    <p className="prose-atlas">Publics accueillis au cabinet : {practice.publics.value.join(", ")}.</p>
                  ) : (
                    <MissingSlot fact={practice.publics} />
                  )}
                </div>
              ) : null}
              <p className="mt-6">
                <Link href="/deroulement-consultation" className="link-atlas text-umber">
                  Le déroulement d&apos;une consultation en détail
                </Link>
              </p>
            </Reveal>

            <Reveal as="section" aria-label="Précautions">
              <RedFlags extra={motif.caution} />
            </Reveal>

            <div className="flex flex-wrap items-center gap-4">
              <BookingButton />
              <Link href="/motifs-de-consultation" className="btn btn-ghost text-umber">
                Tous les motifs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Fiches voisines" className="border-t border-umber/12 px-[var(--gutter)]">
        <div className="mx-auto grid max-w-[110rem] grid-cols-2">
          <Link href={`/motifs-de-consultation/${prev.slug}`} className="group border-r border-umber/12 py-10 pr-6">
            <span className="caption-mono text-ink-soft">← Fiche {prev.number}</span>
            <span className="display mt-2 block text-xl text-umber transition-colors group-hover:text-bronze-ink md:text-3xl">{prev.title}</span>
          </Link>
          <Link href={`/motifs-de-consultation/${next.slug}`} className="group py-10 pl-6 text-right">
            <span className="caption-mono text-ink-soft">Fiche {next.number} →</span>
            <span className="display mt-2 block text-xl text-umber transition-colors group-hover:text-bronze-ink md:text-3xl">{next.title}</span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
