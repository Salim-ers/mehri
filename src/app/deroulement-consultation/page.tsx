import { BookingButton } from "@/components/shared/BookingButton";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { PendingBadge } from "@/components/shared/Pending";
import { RedFlags } from "@/components/shared/RedFlags";
import { Reveal } from "@/components/shared/Reveal";
import { practice } from "@/content/practice";
import { consultationSteps } from "@/content/site";
import { ConsultationTimeline } from "@/features/consultation/ConsultationTimeline";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Déroulement d'une consultation d'ostéopathie",
  description:
    "Comment se déroule une consultation d'ostéopathie au cabinet de Creil : l'échange, l'évaluation, la prise en charge manuelle et les conseils.",
  path: "/deroulement-consultation",
});

export default function DeroulementPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Déroulement d'une consultation", path: "/deroulement-consultation" }])),
        }}
      />
      <PlateHeader
        plate="VI"
        latin="Ordo consultationis"
        title={<Lines lines={["Une consultation,", <>en <em>quatre temps.</em></>]} />}
        lede={
          <p>
            De l&apos;échange initial aux conseils de fin de séance, chaque étape a sa raison d&apos;être. Les photographies montrent le cabinet
            et le praticien en situation de consultation. <PendingBadge fact={practice.patientImageConsent} />
          </p>
        }
      />
      <section aria-label="Étapes de la consultation" className="px-[var(--gutter)] pb-28 md:pb-40">
        <ConsultationTimeline steps={consultationSteps} />
      </section>
      <section className="bg-paper px-[var(--gutter)] py-20 md:py-28">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-10">
          <Reveal className="col-span-12 lg:col-span-5">
            <p className="caption-mono text-bronze-ink">Bon à savoir</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3.4rem)] text-umber">Avant de venir</h2>
            <ul className="prose-atlas mt-6 space-y-3">
              <li>Prévoyez une tenue confortable ; vous restez libre de garder certains vêtements.</li>
              <li>Apportez, si vous en avez, vos comptes rendus d&apos;examens et ordonnances récentes.</li>
              <li>Signalez vos traitements en cours (notamment anticoagulants) et vos antécédents.</li>
              <li>
                Durée et tarif :{" "}
                {hasValue(practice.fees) ? practice.fees.value.map((f) => `${f.label} ${f.price}`).join(", ") : "communiqués lors de la prise de rendez-vous"}
                . <PendingBadge fact={practice.fees} />
              </li>
            </ul>
            <div className="mt-8">
              <BookingButton />
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
