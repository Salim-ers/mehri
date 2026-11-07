import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { BookingButton } from "@/components/shared/BookingButton";
import { RouteIcon } from "@/components/shared/Icons";
import { Lines } from "@/components/shared/PageIntro";
import { PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { equipment } from "@/content/equipment";
import { galleryScenes, photos } from "@/content/media";
import { identity, practice } from "@/content/practice";
import { CabinetGallery, type TourScene } from "@/features/cabinet/CabinetGallery";
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

/** Détails recadrés dans les photographies réelles (aucune image générée). */
const DETAILS: Readonly<Record<string, TourScene["detail"]>> = {
  salle: { photo: photos.room, focus: [82, 50], zoom: 2.1, label: "la table articulée Manuthera, au fond de la salle" },
  tables: { photo: photos.tables, focus: [84, 57], zoom: 2.3, label: "la table inclinable bleue et blanche" },
  bureau: { photo: photos.office, focus: [64, 48], zoom: 1.8, label: "les modèles anatomiques posés sur le bureau" },
};

export default function CabinetPage() {
  const address = hasValue(practice.address) ? practice.address.value : null;
  const scenes: TourScene[] = galleryScenes.map((s) => ({ ...s, detail: DETAILS[s.id] }));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Cabinet", path: "/cabinet" }])) }}
      />

      {/* Ouverture : la fenêtre photographique de l'accueil s'agrandit et devient la page */}
      <header className="wrap grid gap-8 pb-20 pt-[calc(var(--header-h)+2rem)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-28 lg:pt-[calc(var(--header-h)+3rem)]">
        <div className="lg:col-span-5">
          <p className="eyebrow fade-up">
            Le cabinet <PendingBadge fact={practice.photosAuthorization} />
          </p>
          <h1 className="display line-rise mt-5 text-[clamp(2.8rem,1.5rem+5vw,7rem)]">
            <Lines lines={["Un lieu calme,", <em key="l">baigné de lumière.</em>]} />
          </h1>
          <p className="lede fade-up mt-6 max-w-md" style={{ ["--d" as string]: "300ms" }}>
            Murs blancs, sol en pierre, bois brun et lumière filtrée, à {identity.city}. Les photographies montrent les espaces réels du cabinet.
          </p>
        </div>
        <div className="lg:col-span-7">
          <ViewTransition name="cabinet-window" share="morph" default="none">
            <div className="relative mx-auto aspect-[4/5] max-h-[82svh] w-full overflow-hidden rounded-panel bg-sand lg:mr-0">
              <Image
                src={photos.room.src}
                alt={photos.room.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 92vw"
                quality={80}
                className="object-cover"
                style={{ objectPosition: `${photos.room.focus[0]}% ${photos.room.focus[1]}%` }}
              />
            </div>
          </ViewTransition>
        </div>
      </header>

      <CabinetGallery scenes={scenes} />

      {/* Le matériel (version courte ; détail sur /equipements) */}
      <section aria-labelledby="materiel" className="wrap pt-28 md:pt-40">
        <div className="panel-sand grid gap-10 p-8 md:p-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Le matériel</p>
            <h2 id="materiel" className="display mt-5 text-[clamp(2.1rem,1.3rem+2.6vw,3.6rem)]">
              Des tables réglables, <em>des modèles pour expliquer.</em>
            </h2>
            <p className="prose-body mt-5">Le matériel est décrit de façon factuelle : sa présence ne constitue ni une indication, ni la promesse d&apos;un effet.</p>
            <Link href="/equipements" className="btn btn-primary mt-7">
              Le matériel en détail <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <div className="lg:col-span-8">
            <EquipmentList items={equipment} />
          </div>
        </div>
      </section>

      {/* Accès */}
      <section aria-labelledby="acces" className="wrap py-24 md:py-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">Accès</p>
            <h2 id="acces" className="display mt-5 text-[clamp(2.1rem,1.3rem+2.6vw,4rem)]">
              {address ? (
                <>
                  {address.street}, <em>{address.locality}</em>
                </>
              ) : (
                identity.city
              )}
            </h2>
            {address?.hint ? <p className="lede mt-5">{address.hint}</p> : null}
            {hasValue(practice.accessibility) ? (
              <p className="prose-body mt-4">
                {practice.accessibility.value}. <PendingBadge fact={practice.accessibility} />
              </p>
            ) : null}
          </Reveal>
          <Reveal className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-4 lg:col-start-9" delay={120}>
            <BookingButton size="lg" />
            {address ? (
              <a href={directionLinks(address).google} target="_blank" rel="noopener noreferrer" className="link-more text-ink">
                <RouteIcon /> Itinéraire<span className="sr-only"> vers {formatAddress(address)} (Google Maps, nouvel onglet)</span>
              </a>
            ) : null}
          </Reveal>
        </div>
      </section>
    </>
  );
}
