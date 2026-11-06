import Link from "next/link";
import { BookingButton } from "@/components/shared/BookingButton";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { galleryScenes } from "@/content/media";
import { identity, practice } from "@/content/practice";
import { CabinetGallery } from "@/features/cabinet/CabinetGallery";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Le cabinet d'ostéopathie à Creil",
  description:
    `Découvrez en images le cabinet d'ostéopathie de ${identity.name} à ${identity.city} : salle de consultation lumineuse, tables de soins, bureau et modèles anatomiques.`,
  path: "/cabinet",
  image: "/images/salle-consultation.jpg",
});

export default function CabinetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Le cabinet", path: "/cabinet" }])) }}
      />
      <PlateHeader
        plate="IV"
        latin="Locus curae"
        title={<Lines lines={["Le", <><em>cabinet.</em></>]} />}
        lede={
          <p>
            Murs blancs, sol en pierre, bois brun et lumière filtrée : un lieu sobre et lumineux, à Creil. Les photographies ci-dessous montrent
            les espaces réels du cabinet. <PendingBadge fact={practice.photosAuthorization} />
          </p>
        }
      />
      <div className="px-[var(--gutter)] pb-28 md:pb-40">
        <CabinetGallery scenes={galleryScenes} />
      </div>
      <section className="bg-paper px-[var(--gutter)] py-20 md:py-28">
        <div className="mx-auto flex max-w-[110rem] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="caption-mono text-bronze-ink">Accès</p>
            <p className="display mt-4 max-w-2xl text-[clamp(1.8rem,1.2rem+2vw,3.2rem)] text-umber">
              {hasValue(practice.address) ? `${practice.address.value.street}, ${practice.address.value.locality}` : "Creil"}
              {hasValue(practice.address) ? <span className="block text-ink-soft">{practice.address.value.hint}</span> : null}
            </p>
            {hasValue(practice.accessibility) ? (
              <p className="mt-4 text-ink-soft">
                {practice.accessibility.value} <PendingBadge fact={practice.accessibility} />
              </p>
            ) : null}
          </Reveal>
          <div className="flex flex-wrap gap-3">
            <BookingButton />
            <Link href="/contact" className="btn btn-ghost text-umber">
              Plan et itinéraire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
