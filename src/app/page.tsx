import Link from "next/link";
import { BookingButton } from "@/components/shared/BookingButton";
import { RouteIcon } from "@/components/shared/Icons";
import { Lines } from "@/components/shared/PageIntro";
import { Photo } from "@/components/shared/Photo";
import { Reveal } from "@/components/shared/Reveal";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { categoryVisuals } from "@/content/imagery";
import { photos } from "@/content/media";
import { motifCategories } from "@/content/motifs";
import { identity, practice } from "@/content/practice";
import { approach } from "@/content/practitioner";
import { HeroStage } from "@/features/anatomy/components/HeroStage";
import { XRayStage } from "@/features/anatomy/components/XRayStage";
import { ScrollCrossfade } from "@/features/imagery/ScrollCrossfade";
import { directionLinks, formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${identity.name} — ${identity.title} à ${identity.city} (60100)`,
  absolute: true,
  description: `Ostéopathe à Creil : ${identity.name} vous reçoit pour un accompagnement attentif à votre mobilité et à votre confort. Motifs de consultation, cabinet, rendez-vous par téléphone.`,
  path: "/",
});

export default function HomePage() {
  const address = hasValue(practice.address) ? practice.address.value : null;
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const hours = hasValue(practice.openingHours) ? practice.openingHours.value : [];
  return (
    <>
      {/* 1. Ouverture : la colonne vertébrale 3D, le nom, le rendez-vous */}
      <HeroStage>
        <div className="wrap relative flex flex-1 flex-col justify-end px-[var(--gutter)] pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-[var(--header-h)] lg:justify-center lg:pb-16">
          {/* voile de lisibilité sous le texte (mobile : la colonne occupe le haut de l'écran) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[1] h-[64%] bg-[linear-gradient(to_bottom,transparent_0%,var(--color-ivory)_22%,var(--color-ivory)_100%)] lg:hidden" />
          <div className="max-w-[40rem] lg:max-w-[46%]">
            <p className="eyebrow fade-up" style={{ ["--d" as string]: "50ms" }}>
              Cabinet d&apos;ostéopathie · {identity.city}
            </p>
            <h1 id="hero-title" className="display line-rise mt-5 text-[clamp(3.1rem,1.4rem+6.4vw,8.6rem)] leading-[0.95]">
              <Lines lines={[identity.name]} />
              <span className="mt-3 block font-sans text-[clamp(1.05rem,0.95rem+0.6vw,1.45rem)] font-medium tracking-[0.01em] text-ink-soft fade-up" style={{ ["--d" as string]: "450ms" }}>
                {identity.title}
              </span>
            </h1>
            <p className="lede fade-up mt-7 max-w-md text-ink" style={{ ["--d" as string]: "650ms" }}>
              {approach.statement} Un accompagnement attentif à votre mobilité et à votre confort.
            </p>
            <div className="fade-up mt-9 flex flex-wrap items-center gap-x-7 gap-y-4" style={{ ["--d" as string]: "800ms" }}>
              <BookingButton size="lg" />
              <Link href="/cabinet" className="link-more text-[0.98rem] text-ink">
                Découvrir le cabinet
              </Link>
            </div>
            {address ? (
              <p className="fade-up mt-9 flex items-start gap-2.5 text-[0.95rem] text-ink-soft" style={{ ["--d" as string]: "950ms" }}>
                <RouteIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze-ink" />
                <span>
                  {formatAddress(address)}{" "}
                  <a href={directionLinks(address).google} target="_blank" rel="noopener noreferrer" className="link-line ml-1 whitespace-nowrap text-ink">
                    Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
                  </a>
                </span>
              </p>
            ) : null}
          </div>
        </div>
        <div aria-hidden="true" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink-soft lg:block">
          <span className="scroll-cue" />
        </div>
      </HeroStage>

      {/* 2. Anatomie : visualisation radiographique 3D */}
      <section aria-labelledby="anatomie-titre" className="on-dark xray-stage grain relative overflow-hidden text-bone">
        <div className="wrap grid items-center gap-y-6 px-[var(--gutter)] py-20 md:py-28 lg:grid-cols-12 lg:gap-x-8 lg:py-0">
          <div className="lg:col-span-5 lg:py-32">
            <Reveal>
              <p className="eyebrow">Anatomie</p>
              <h2 id="anatomie-titre" className="display mt-5 text-[clamp(2.4rem,1.4rem+3.8vw,5.4rem)]">
                Comprendre la structure, <em>accompagner le mouvement.</em>
              </h2>
              <p className="prose-body mt-7 max-w-md">
                Le squelette porte, protège et transmet chacun de nos gestes. La consultation commence par une lecture attentive de la façon
                dont ces structures travaillent ensemble.
              </p>
              <Link href="/le-corps-en-mouvement" className="link-more mt-9 text-bone">
                Explorer le corps en mouvement
              </Link>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <XRayStage
              className="h-[72svh] min-h-[440px] lg:h-[92svh] lg:max-h-[960px]"
              fallback={
                <div className="flex h-full items-center justify-center">
                  <SpineDrawing variant="solid" className="h-[78%] w-auto text-xray/40" />
                </div>
              }
            />
            <p className="pb-2 text-center text-[0.78rem] text-bone/60 lg:pb-10">Visualisation 3D pédagogique — il ne s&apos;agit pas d&apos;un examen médical.</p>
          </div>
        </div>
      </section>

      {/* 3. Pourquoi consulter : radiographies en fondu enchaîné */}
      <section aria-labelledby="motifs-titre" className="px-[var(--gutter)] py-24 md:py-36">
        <div className="wrap">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">Pourquoi consulter ?</p>
            <h2 id="motifs-titre" className="display mt-5 text-[clamp(2.4rem,1.4rem+3.6vw,5.2rem)]">
              Quand un mouvement <em>devient moins fluide.</em>
            </h2>
          </Reveal>
          <ScrollCrossfade
            className="mt-14 md:mt-20"
            items={motifCategories.flatMap((c) => {
              const image = categoryVisuals[c.id];
              return image ? [{ id: c.id, title: c.title, text: c.intro, href: `/motifs-de-consultation#${c.id}`, image }] : [];
            })}
          />
        </div>
      </section>

      {/* 4. Le cabinet */}
      <section aria-labelledby="cabinet-titre" className="bg-paper px-[var(--gutter)] py-24 md:py-36">
        <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <Photo
            photo={photos.room}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="h-[70svh] min-h-[420px] lg:col-span-7 lg:h-[88vh]"
            parallax
          />
          <div className="flex flex-col justify-end lg:col-span-4 lg:col-start-9">
            <Reveal>
              <p className="eyebrow">Le cabinet</p>
              <h2 id="cabinet-titre" className="display mt-5 text-[clamp(2.3rem,1.4rem+3.2vw,4.6rem)]">
                Lumière naturelle, <em>pierre et bois.</em>
              </h2>
              <p className="prose-body mt-6">
                Un lieu calme et lumineux à {identity.city} : tables de soins réglables, bureau d&apos;échange et modèles anatomiques pour
                expliquer.
              </p>
              <Link href="/cabinet" className="link-more mt-8 text-ink">
                Visiter le cabinet
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. Rendez-vous */}
      <section aria-labelledby="rdv-titre" className="px-[var(--gutter)] py-24 md:py-36">
        <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">Rendez-vous</p>
            <h2 id="rdv-titre" className="display mt-5 text-[clamp(2.8rem,1.5rem+5vw,7rem)]">
              Prendre <em>rendez-vous.</em>
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <BookingButton size="lg" />
              {phone ? (
                <a href={telHref(phone.e164)} className="display text-[2.2rem] leading-none hover:text-bronze-ink">
                  {phone.display}
                </a>
              ) : null}
            </div>
          </Reveal>
          <Reveal className="space-y-8 lg:col-span-4 lg:col-start-9 lg:self-end" delay={120}>
            {hours.length ? (
              <dl className="space-y-2 text-[1rem]">
                {hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6 border-b border-ink/10 pb-2">
                    <dt className="text-ink-soft">{h.days}</dt>
                    <dd>{h.hours}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {address ? (
              <p className="text-ink-soft">
                {formatAddress(address)}
                <span className="block text-sm">{address.hint}</span>
              </p>
            ) : null}
          </Reveal>
        </div>
      </section>
    </>
  );
}
