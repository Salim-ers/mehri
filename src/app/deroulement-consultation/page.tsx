import Image from "next/image";
import { BookingButton } from "@/components/shared/BookingButton";
import { plates } from "@/content/imagery";
import { ImageCredit } from "@/features/imagery/ScrollCrossfade";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
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
      <PageIntro
        eyebrow="Déroulement"
        title={<Lines lines={["Une consultation,", <>en <em>quatre temps.</em></>]} />}
        lede={<p>De l&apos;échange initial aux conseils de fin de séance, chaque étape a sa raison d&apos;être.</p>}
      />
      <div className="px-[var(--gutter)] pb-20 md:pb-28">
        <figure className="wrap">
          <Reveal variant="mask">
            <div className="relative h-[52svh] min-h-[320px] overflow-hidden rounded-[4px] bg-[#3a3a3b] md:h-[64vh]">
              <Image
                src={plates.vertebra.src}
                alt={plates.vertebra.alt}
                fill
                sizes="(min-width: 1600px) 1600px, 100vw"
                className="parallax-img object-cover"
                style={{ objectPosition: "50% 58%" }}
              />
            </div>
          </Reveal>
          <figcaption>
            <ImageCredit image={plates.vertebra} />
          </figcaption>
        </figure>
      </div>
      <section aria-label="Étapes de la consultation" className="px-[var(--gutter)] pb-28 md:pb-40">
        <div className="wrap">
          <ConsultationTimeline steps={consultationSteps} />
        </div>
      </section>
      <section aria-labelledby="avant" className="bg-paper px-[var(--gutter)] py-24 md:py-32">
        <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Bon à savoir</p>
            <h2 id="avant" className="display mt-5 text-[clamp(2rem,1.3rem+2.2vw,3.4rem)]">
              Avant de venir
            </h2>
            <ul className="prose-body mt-6 space-y-3">
              <li>Prévoyez une tenue confortable ; vous restez libre de garder certains vêtements.</li>
              <li>Apportez, si vous en avez, vos comptes rendus d&apos;examens et ordonnances récentes.</li>
              <li>Signalez vos traitements en cours (notamment anticoagulants) et vos antécédents.</li>
              <li>
                Durée et tarif :{" "}
                {hasValue(practice.fees) ? practice.fees.value.map((f) => `${f.label} ${f.price}`).join(", ") : "communiqués lors de la prise de rendez-vous"}
                . <PendingBadge fact={practice.fees} />
              </li>
            </ul>
            <div className="mt-9">
              <BookingButton size="lg" />
            </div>
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            <RedFlags />
          </div>
        </div>
      </section>
    </>
  );
}
