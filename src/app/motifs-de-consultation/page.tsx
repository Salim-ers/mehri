import Link from "next/link";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { PendingBadge } from "@/components/shared/Pending";
import { RedFlags } from "@/components/shared/RedFlags";
import { Reveal } from "@/components/shared/Reveal";
import { getRegion } from "@/content/anatomy";
import { motifs, motifsValidation } from "@/content/motifs";
import { RegionGlyph } from "@/features/anatomy/components/RegionGlyph";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Motifs de consultation en ostéopathie à Creil",
  description:
    "Dos, cervicales, épaules, mobilité articulaire, tensions musculaires, sportifs : les motifs fréquents de consultation au cabinet d'ostéopathie de Creil, le déroulement et les précautions.",
  path: "/motifs-de-consultation",
});

export default function MotifsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Motifs de consultation", path: "/motifs-de-consultation" }])),
        }}
      />
      <PlateHeader
        plate="III"
        latin="Indicationes"
        title={<Lines lines={["Motifs de", <><em>consultation.</em></>]} />}
        lede={
          <p>
            Huit fiches pour comprendre les situations qui amènent fréquemment à consulter un ostéopathe, le déroulement possible d&apos;une
            séance et les signes qui doivent d&apos;abord conduire chez un médecin. <PendingBadge fact={motifsValidation} />
          </p>
        }
      />

      <section aria-label="Liste des motifs" className="px-[var(--gutter)] pb-24 md:pb-32">
        <ol className="mx-auto grid max-w-[110rem] gap-px overflow-hidden rounded-lg border border-umber/12 bg-umber/12 md:grid-cols-2 xl:grid-cols-4">
          {motifs.map((m, i) => {
            const region = getRegion(m.region);
            return (
              <li key={m.slug} className="bg-ivory">
                <Reveal delay={(i % 4) * 70} className="h-full">
                  <Link
                    href={`/motifs-de-consultation/${m.slug}`}
                    className="group relative flex h-full min-h-[22rem] flex-col p-7 transition-colors duration-500 hover:bg-paper md:p-8"
                  >
                    <div className="flex items-start justify-between">
                      <span className="caption-mono text-bronze-ink">Fiche {m.number}</span>
                      <RegionGlyph region={m.region} className="h-28 w-auto text-umber/70 transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <h2 className="display mt-auto pt-8 text-[clamp(1.6rem,1.2rem+1vw,2.2rem)] text-umber">{m.title}</h2>
                    <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-soft">{m.lede}</p>
                    <p className="caption-mono mt-6 flex items-center justify-between text-ink-soft">
                      <span>{region.label}</span>
                      <span className="text-lg text-bronze-ink transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true">
                        →
                      </span>
                    </p>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="px-[var(--gutter)] pb-24 md:pb-32">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-10">
          <Reveal className="col-span-12 lg:col-span-5">
            <p className="caption-mono text-bronze-ink">Le cadre de l&apos;ostéopathie</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3.4rem)] text-umber">
              Des troubles fonctionnels, <em>un cadre précis.</em>
            </h2>
            <div className="prose-atlas mt-6">
              <p>
                En France, l&apos;ostéopathe peut pratiquer des manipulations et mobilisations destinées à prévenir ou à remédier à des troubles
                fonctionnels du corps humain. Il n&apos;intervient pas sur les pathologies organiques nécessitant un traitement médical ou
                chirurgical, et oriente vers un médecin lorsque c&apos;est nécessaire (décret n° 2007-435 du 25 mars 2007).
              </p>
              <p>Aucune séance ne peut garantir un résultat : chaque situation est différente.</p>
            </div>
          </Reveal>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <RedFlags />
          </div>
        </div>
      </section>
    </>
  );
}
