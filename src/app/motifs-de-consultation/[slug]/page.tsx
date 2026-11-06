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
  return pageMetadata({ title: motif.title, description: motif.metaDescription, path: `/motifs-de-consultation/${motif.slug}` });
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
              { name: "Pourquoi consulter ?", path: "/motifs-de-consultation" },
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
            },
          ]),
        }}
      />
      <header className="px-[var(--gutter)] pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5.5rem)]">
        <div className="wrap">
          <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/motifs-de-consultation" className="hover:text-ink">
                  Pourquoi consulter ?
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {motif.shortTitle}
              </li>
            </ol>
          </nav>
          <div className="mt-8 grid gap-y-8 lg:grid-cols-12 lg:gap-x-8">
            <h1 className="display line-rise text-[clamp(2.6rem,1.4rem+4.6vw,6.6rem)] lg:col-span-8">
              <span>
                <span>{motif.title}</span>
              </span>
            </h1>
            <div className="lg:col-span-4 lg:self-end">
              <p className="lede text-ink-soft">{motif.lede}</p>
              <p className="mt-4 text-sm text-ink-soft">
                Région : {region.label} <PendingBadge fact={motifsValidation} />
                {motif.dependsOnPublics ? <PendingBadge fact={practice.publics} className="ml-2" /> : null}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-[var(--gutter)] py-16 md:py-24">
        <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          {/* Illustration 3D (rendu radiographique) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <figure>
                <div className="xray-stage relative h-[58svh] max-h-[680px] overflow-hidden rounded-[4px] text-xray/50">
                  <RegionViewer region={motif.region} fallback={<RegionGlyph region={motif.region} className="h-4/5 w-auto text-xray/60" />} />
                </div>
                <figcaption className="mt-3 text-[0.85rem] text-ink-soft">{region.movement.caption}</figcaption>
              </figure>
              <Link href={`/le-corps-en-mouvement?region=${region.id}#atlas`} className="link-more mt-5 text-ink">
                Explorer cette région en 3D
              </Link>
            </div>
          </div>

          <div className="space-y-16 lg:col-span-6 lg:col-start-7">
            <Reveal as="section" aria-labelledby="contexte">
              <h2 id="contexte" className="display text-[clamp(1.9rem,1.5rem+1.4vw,2.8rem)]">
                Comprendre
              </h2>
              <div className="prose-body mt-5">
                {motif.context.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal as="section" aria-labelledby="situations">
              <h2 id="situations" className="display text-[clamp(1.9rem,1.5rem+1.4vw,2.8rem)]">
                Ce qui amène à consulter
              </h2>
              <ul className="mt-6 border-t border-ink/10">
                {motif.situations.map((s) => (
                  <li key={s} className="border-b border-ink/10 py-4 text-[1.05rem]">
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal as="section" aria-labelledby="deroulement">
              <h2 id="deroulement" className="display text-[clamp(1.9rem,1.5rem+1.4vw,2.8rem)]">
                Pendant la consultation
              </h2>
              <ol className="mt-6 space-y-4">
                {motif.session.map((s) => (
                  <li key={s} className="flex gap-4">
                    <span aria-hidden="true" className="mt-[0.75em] block h-px w-6 shrink-0 bg-bronze" />
                    <p className="prose-body">{s}</p>
                  </li>
                ))}
              </ol>
              {motif.dependsOnPublics ? (
                <div className="mt-6">
                  {hasValue(practice.publics) ? (
                    <p className="prose-body">Publics accueillis au cabinet : {practice.publics.value.join(", ")}.</p>
                  ) : (
                    <MissingSlot fact={practice.publics} />
                  )}
                </div>
              ) : null}
              <p className="mt-6">
                <Link href="/deroulement-consultation" className="link-line text-ink">
                  Le déroulement d&apos;une consultation en détail
                </Link>
              </p>
            </Reveal>

            <Reveal as="section" aria-label="Précautions">
              <RedFlags extra={motif.caution} />
            </Reveal>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <BookingButton size="lg" />
              <Link href="/motifs-de-consultation" className="link-more text-ink">
                Tous les motifs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Fiches voisines" className="border-t border-ink/10 px-[var(--gutter)]">
        <div className="wrap grid grid-cols-2">
          <Link href={`/motifs-de-consultation/${prev.slug}`} className="group border-r border-ink/10 py-10 pr-6">
            <span className="text-sm text-ink-soft">← Précédent</span>
            <span className="display mt-2 block text-xl transition-colors group-hover:text-bronze-ink md:text-3xl">{prev.title}</span>
          </Link>
          <Link href={`/motifs-de-consultation/${next.slug}`} className="group py-10 pl-6 text-right">
            <span className="text-sm text-ink-soft">Suivant →</span>
            <span className="display mt-2 block text-xl transition-colors group-hover:text-bronze-ink md:text-3xl">{next.title}</span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
