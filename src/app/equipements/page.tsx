import Link from "next/link";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { PendingBadge } from "@/components/shared/Pending";
import { equipment, equipmentPageValidation } from "@/content/equipment";
import { EquipmentShowcase } from "@/features/cabinet/EquipmentList";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Le matériel du cabinet",
  description:
    "Le matériel visible au cabinet d'ostéopathie de Creil : tables de soins réglables, appareils et modèles anatomiques, présentés de manière factuelle.",
  path: "/equipements",
});

export default function EquipementsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Cabinet", path: "/cabinet" }, { name: "Le matériel", path: "/equipements" }])),
        }}
      />
      <PageIntro
        eyebrow="Le matériel du cabinet"
        title={<Lines lines={["Le matériel", <>du <em>cabinet.</em></>]} />}
        lede={
          <>
            <p>
              Le matériel présenté ici est celui visible au cabinet. Il est décrit de façon factuelle : sa présence ne constitue ni une
              indication, ni la promesse d&apos;un effet. <PendingBadge fact={equipmentPageValidation} />
            </p>
            <p className="mt-4">
              Au cœur de la consultation reste l&apos;approche manuelle du praticien :{" "}
              <Link href="/conseils#seance" className="link-more text-ink">
                le déroulement d&apos;une séance
              </Link>
              .
            </p>
          </>
        }
      />
      <div className="wrap pb-28 md:pb-40">
        <EquipmentShowcase items={equipment} />
      </div>
    </>
  );
}
