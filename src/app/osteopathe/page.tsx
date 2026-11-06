import Image from "next/image";
import Link from "next/link";
import { BookingButton } from "@/components/shared/BookingButton";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Photo } from "@/components/shared/Photo";
import { Reveal } from "@/components/shared/Reveal";
import { plates, xrays } from "@/content/imagery";
import { photos } from "@/content/media";
import { identity, practice, reviewMode } from "@/content/practice";
import { approach, approachValidation } from "@/content/practitioner";
import { ImageCredit } from "@/features/imagery/ScrollCrossfade";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "L'ostéopathe",
  description: `${identity.name}, ${identity.title} à ${identity.city} : son approche du patient, sa manière de conduire les consultations et sa philosophie professionnelle.`,
  path: "/osteopathe",
});

export default function OsteopathePage() {
  const { diplomas, background, publics } = practice;
  const hasProfile = hasValue(diplomas) || hasValue(background) || hasValue(publics);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "L'ostéopathe", path: "/osteopathe" }])) }}
      />
      <PageIntro
        eyebrow="L'ostéopathe"
        title={<Lines lines={[identity.name]} />}
        lede={
          <p>
            {identity.title} au cabinet de {identity.city}. Une approche manuelle, attentive et expliquée, qui commence toujours par
            l&apos;écoute. <PendingBadge fact={practice.practitionerName} />
          </p>
        }
      />

      {/* Approche : composition anatomique, sans portrait */}
      <section aria-labelledby="approche" className="px-[var(--gutter)] pb-24 md:pb-36">
        <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <Photo
            photo={photos.office}
            sizes="(min-width: 1024px) 42vw, 100vw"
            priority
            focus={[62, 62]}
            className="h-[64svh] min-h-[380px] lg:col-span-5 lg:h-[86vh]"
            caption="Le bureau du cabinet et ses modèles anatomiques, supports des explications données en consultation."
          />
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-20">
            <Reveal>
              <p className="eyebrow">
                Approche du patient <PendingBadge fact={approachValidation} />
              </p>
              <h2 id="approche" className="display mt-6 text-[clamp(2.3rem,1.4rem+3.4vw,4.8rem)]">
                {approach.statement}
              </h2>
              <div className="prose-body mt-9 max-w-xl">
                {approach.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Conduite de la consultation : quatre verbes, sans numérotation */}
      <section aria-labelledby="principes" className="on-dark xray-stage grain overflow-hidden px-[var(--gutter)] py-24 text-bone md:py-36">
        <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">À chaque séance</p>
              <h2 id="principes" className="display mt-5 text-[clamp(2.3rem,1.4rem+3vw,4.4rem)]">
                Écouter, expliquer, <em>adapter, orienter.</em>
              </h2>
            </Reveal>
            <Reveal className="mt-12 hidden lg:block" delay={150}>
              <figure>
                <div className="xray-frame relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[4px]">
                  <Image src={xrays.cervical.src} alt={xrays.cervical.alt} fill sizes="30vw" className="xray-img object-cover" />
                  <div className="scan-sweep" aria-hidden="true" />
                </div>
                <figcaption>
                  <ImageCredit image={xrays.cervical} tone="dark" />
                </figcaption>
              </figure>
            </Reveal>
          </div>
          <ul className="lg:col-span-6 lg:col-start-7">
            {approach.principles.map((p, i) => (
              <li key={p.title} className="border-t border-bone/12 py-9 first:border-t-0 first:pt-0 lg:py-12">
                <Reveal delay={i * 80}>
                  <h3 className="display text-[clamp(2.2rem,1.6rem+2.2vw,3.8rem)]">{p.title}</h3>
                  <p className="mt-4 max-w-lg text-[1.05rem] leading-relaxed text-bone/80">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Qualification : uniquement des informations confirmées par le praticien */}
      <section aria-labelledby="qualification" className="px-[var(--gutter)] py-24 md:py-32">
        <div className="wrap grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="space-y-8 lg:col-span-5">
          <Reveal>
            <p className="eyebrow">Qualification</p>
            <h2 id="qualification" className="display mt-5 text-[clamp(2.1rem,1.3rem+2.6vw,3.8rem)]">
              {identity.title}
            </h2>
            <p className="prose-body mt-6 max-w-md">
              En France, l&apos;ostéopathe intervient dans le cadre des troubles fonctionnels et oriente vers un médecin lorsque les symptômes
              nécessitent un diagnostic ou un traitement médical (décret n° 2007-435 du 25 mars 2007).
            </p>
          </Reveal>
          <div className="space-y-6">
            {hasProfile || reviewMode ? (
              <>
                {hasValue(background) ? <p className="lede">{background.value}</p> : <MissingSlot fact={background} />}
                {hasValue(diplomas) ? (
                  <ul className="space-y-3">
                    {diplomas.value.map((d) => (
                      <li key={d} className="border-b border-ink/10 pb-3 text-[1.05rem]">
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <MissingSlot fact={diplomas} />
                )}
                {hasValue(publics) ? <p className="prose-body">Publics accueillis : {publics.value.join(", ")}.</p> : <MissingSlot fact={publics} />}
              </>
            ) : null}
            <p className="prose-body">
              Le détail d&apos;une consultation, de l&apos;échange aux conseils, est présenté pas à pas.{" "}
              <Link href="/deroulement-consultation" className="link-line text-ink">
                Le déroulement d&apos;une consultation
              </Link>
            </p>
          </div>
          </div>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={120}>
            <figure>
              <div className="relative mx-auto aspect-[1708/2400] max-h-[86vh] overflow-hidden rounded-[4px] bg-mineral">
                <Image src={plates.engraving.src} alt={plates.engraving.alt} fill sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover" />
              </div>
              <figcaption>
                <ImageCredit image={plates.engraving} />
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Philosophie */}
      <section aria-labelledby="philosophie" className="bg-paper px-[var(--gutter)] py-24 md:py-36">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 id="philosophie" className="eyebrow">
              Philosophie
            </h2>
            <p className="display mt-8 text-[clamp(1.9rem,1.2rem+2.4vw,3.6rem)] leading-[1.12]">{approach.philosophy}</p>
            <div className="mt-12 flex justify-center">
              <BookingButton size="lg" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
