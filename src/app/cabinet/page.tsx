import Link from "next/link";
import { BookingButton } from "@/components/shared/BookingButton";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { equipment } from "@/content/equipment";
import { galleryScenes } from "@/content/media";
import { identity, practice } from "@/content/practice";
import { CabinetGallery } from "@/features/cabinet/CabinetGallery";
import { EquipmentList } from "@/features/cabinet/EquipmentList";
import { directionLinks, formatAddress } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Le cabinet d'ostéopathie à Creil",
  description: `Le cabinet d'ostéopathie de ${identity.name} à ${identity.city} en images : salle de consultation lumineuse, tables de soins réglables, bureau et modèles anatomiques.`,
  path: "/cabinet",
  image: "/images/salle-consultation.jpg",
});

export default function CabinetPage() {
  const address = hasValue(practice.address) ? practice.address.value : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Le cabinet", path: "/cabinet" }])) }}
      />
      <PageIntro
        eyebrow="Le cabinet"
        title={<Lines lines={["Un lieu calme,", <><em>baigné de lumière.</em></>]} />}
        lede={
          <p>
            Murs blancs, sol en pierre, bois brun et lumière filtrée, à {identity.city}. Les photographies montrent les espaces réels du cabinet.{" "}
            <PendingBadge fact={practice.photosAuthorization} />
          </p>
        }
      />

      <CabinetGallery scenes={galleryScenes} />

      {/* Le matériel (version courte ; détail sur /equipements) */}
      <section aria-labelledby="materiel" className="relative z-[1] bg-paper px-[var(--gutter)] py-24 md:py-32">
        <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Le matériel</p>
            <h2 id="materiel" className="display mt-5 text-[clamp(2.1rem,1.3rem+2.6vw,3.8rem)]">
              Des tables réglables, <em>des modèles pour expliquer.</em>
            </h2>
            <p className="prose-body mt-6 max-w-sm">
              Le matériel est décrit de façon factuelle : sa présence ne constitue ni une indication, ni la promesse d&apos;un effet.
            </p>
            <Link href="/equipements" className="link-more mt-8 text-ink">
              Le matériel en détail
            </Link>
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            <EquipmentList items={equipment} />
          </div>
        </div>
      </section>

      {/* Accès */}
      <section aria-labelledby="acces" className="relative z-[1] bg-ivory px-[var(--gutter)] py-24 md:py-32">
        <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">Accès</p>
            {address ? (
              <h2 id="acces" className="display mt-5 text-[clamp(2.1rem,1.3rem+2.6vw,4rem)]">
                {address.street}, <em>{address.locality}</em>
              </h2>
            ) : (
              <h2 id="acces" className="display mt-5 text-[clamp(2.1rem,1.3rem+2.6vw,4rem)]">
                {identity.city}
              </h2>
            )}
            {address ? <p className="lede mt-5 text-ink-soft">{address.hint}</p> : null}
            {hasValue(practice.accessibility) ? (
              <p className="prose-body mt-4">
                {practice.accessibility.value}. <PendingBadge fact={practice.accessibility} />
              </p>
            ) : null}
          </Reveal>
          <Reveal className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-4 lg:col-start-9 lg:self-end" delay={120}>
            <BookingButton size="lg" />
            {address ? (
              <a href={directionLinks(address).google} target="_blank" rel="noopener noreferrer" className="link-more text-ink">
                Itinéraire<span className="sr-only"> vers {formatAddress(address)} (Google Maps, nouvel onglet)</span>
              </a>
            ) : null}
          </Reveal>
        </div>
      </section>
    </>
  );
}
