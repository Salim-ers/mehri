import Link from "next/link";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { PendingBadge } from "@/components/shared/Pending";
import { equipment, equipmentPageValidation } from "@/content/equipment";
import { EquipmentList } from "@/features/cabinet/EquipmentList";
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
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Le cabinet", path: "/cabinet" }, { name: "Le matériel", path: "/equipements" }])),
        }}
      />
      <PageIntro
        eyebrow="Le cabinet · Matériel"
        title={<Lines lines={["Le matériel", <>du <em>cabinet.</em></>]} />}
        lede={
          <>
            <p>
              Le matériel présenté ici est celui visible au cabinet. Il est décrit de façon factuelle : sa présence ne constitue ni une
              indication, ni la promesse d&apos;un effet. <PendingBadge fact={equipmentPageValidation} />
            </p>
            <p className="mt-4">
              Au cœur de la consultation reste l&apos;approche manuelle du praticien :{" "}
              <Link href="/deroulement-consultation" className="link-line text-ink">
                le déroulement d&apos;une consultation
              </Link>
              .
            </p>
          </>
        }
      />
      <div className="px-[var(--gutter)] pb-28 md:pb-40">
        <div className="wrap">
          <EquipmentList items={equipment} detailed />
        </div>
      </div>
    </>
  );
}
