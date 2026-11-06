import Link from "next/link";
import { AtlasPhoto } from "@/components/shared/AtlasPhoto";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { equipment, equipmentPageValidation, type Equipment } from "@/content/equipment";
import { reviewMode } from "@/content/practice";
import { TableIllustration } from "@/features/cabinet/TableIllustration";
import { hasValue, type Fact } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Équipements et approche",
  description:
    "Les équipements visibles au cabinet d'ostéopathie de Creil : tables de soins réglables, matériel et modèles anatomiques, présentés de manière factuelle.",
  path: "/equipements",
});

function FactRow({ label, fact }: { label: string; fact: Fact<string> }) {
  if (!hasValue(fact)) {
    if (!reviewMode) return null;
    return (
      <div className="grid gap-2 border-t border-umber/12 py-4 sm:grid-cols-[9rem_1fr]">
        <dt className="caption-mono text-ink-soft">{label}</dt>
        <dd>
          <MissingSlot fact={fact} />
        </dd>
      </div>
    );
  }
  return (
    <div className="grid gap-2 border-t border-umber/12 py-4 sm:grid-cols-[9rem_1fr]">
      <dt className="caption-mono text-ink-soft">{label}</dt>
      <dd className="text-ink">
        {fact.value} <PendingBadge fact={fact} />
      </dd>
    </div>
  );
}

function EquipmentEntry({ item, index }: { item: Equipment; index: number }) {
  const flip = index % 2 === 1;
  return (
    <section aria-labelledby={`eq-${item.id}`} className="mx-auto grid max-w-[110rem] grid-cols-12 items-center gap-x-6 gap-y-8">
      <AtlasPhoto
        photo={item.photo}
        focus={item.focus}
        zoom={item.zoom}
        sizes="(min-width: 1024px) 40vw, 100vw"
        className={`col-span-12 h-[60svh] sm:col-span-8 lg:col-span-5 lg:h-[72vh] ${flip ? "lg:col-start-8" : "lg:col-start-1"}`}
        caption={`Détail — ${item.photo.caption}`}
        figureNumber={item.index.replace("E·", "5.")}
      />
      <div className={`col-span-12 lg:col-span-5 ${flip ? "lg:col-start-2 lg:row-start-1" : "lg:col-start-7"}`}>
        <Reveal>
          <p className="caption-mono text-bronze-ink">{item.index}</p>
          <h2 id={`eq-${item.id}`} className="display mt-3 text-[clamp(2rem,1.3rem+2.2vw,3.6rem)] text-umber">
            {item.family}
          </h2>
          <p className="prose-atlas mt-4">{item.observed}</p>
          <dl className="mt-8 border-b border-umber/12">
            <FactRow label="Dénomination" fact={item.name} />
            <FactRow label="Utilisation" fact={item.usage} />
            <FactRow label="Rôle en séance" fact={item.role} />
          </dl>
          {item.illustration === "table-articulation" || item.illustration === "segments" ? (
            <div className="mt-8">
              <TableIllustration variant={item.illustration} />
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export default function EquipementsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Équipements", path: "/equipements" }])) }}
      />
      <PlateHeader
        plate="V"
        latin="Instrumenta"
        title={<Lines lines={["Équipements", <>et <em>approche.</em></>]} />}
        lede={
          <>
            <p>
              Les équipements présentés ici sont ceux visibles au cabinet. Ils sont décrits de façon factuelle : leur présence ne constitue ni
              une indication, ni la promesse d&apos;un effet. <PendingBadge fact={equipmentPageValidation} />
            </p>
            <p>
              Au cœur de la consultation reste l&apos;approche manuelle du praticien, présentée dans le{" "}
              <Link href="/deroulement-consultation" className="link-atlas text-umber">
                déroulement d&apos;une consultation
              </Link>
              .
            </p>
          </>
        }
      />
      <div className="space-y-24 px-[var(--gutter)] pb-28 md:space-y-36 md:pb-40">
        {equipment.map((item, i) => (
          <EquipmentEntry key={item.id} item={item} index={i} />
        ))}
      </div>
    </>
  );
}
