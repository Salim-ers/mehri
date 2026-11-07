import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { Intro } from "@/components/layout/Intro";
import { BookingButton } from "@/components/shared/BookingButton";
import { ArrowIcon, PhoneIcon, RouteIcon } from "@/components/shared/Icons";
import { Lines } from "@/components/shared/PageIntro";
import { Photo } from "@/components/shared/Photo";
import { Reveal } from "@/components/shared/Reveal";
import { getRegion } from "@/content/anatomy";
import { categoryVisuals } from "@/content/imagery";
import { photos } from "@/content/media";
import { getMotif, motifCategories } from "@/content/motifs";
import { identity, practice } from "@/content/practice";
import { approach } from "@/content/practitioner";
import { HomeHero } from "@/features/home/HomeHero";
import { ImageCredit } from "@/features/imagery/ImageCredit";
import { directionLinks, formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${identity.name} — ${identity.title} à ${identity.city} (60100)`,
  absolute: true,
  description: `Ostéopathe à Creil : ${identity.name} vous reçoit pour une approche personnalisée de votre mobilité et de votre confort. Motifs de consultation, anatomie en 3D, cabinet, conseils et rendez-vous par téléphone.`,
  path: "/",
});

/** Chapitres de mouvement : textes issus du contenu pédagogique validé (anatomy.ts). */
const MOVES = [
  { region: "cervicales", title: "La nuque", verb: "pivote.", side: "left" },
  { region: "epaules", title: "L'épaule", verb: "s'élève.", side: "right" },
  { region: "bassin", title: "Le bassin", verb: "bascule.", side: "left" },
] as const;

/** Composition des familles de motifs : chaque panneau a sa propre forme. */
const CATEGORY_LAYOUT = [
  "lg:col-span-7 sm:grid sm:grid-cols-[0.8fr_1fr] sm:items-center",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7 sm:grid sm:grid-cols-[1fr_0.8fr] sm:items-center",
];

export default function HomePage() {
  const address = hasValue(practice.address) ? practice.address.value : null;
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const hours = hasValue(practice.openingHours) ? practice.openingHours.value : [];
  return (
    <>
      <Intro name={identity.name} title={identity.title} city={identity.city} />

      {/* 1. Accueil : squelette 3D, accroche, rendez-vous — puis chapitres de mouvement au défilement */}
      <HomeHero>
        <div data-chapter className="chapter items-end pb-[calc(1.5rem+var(--actionbar-h))] md:items-center md:pb-0">
          <div className="ml-[var(--gutter)] mr-[var(--gutter)] max-w-[40rem] pt-[var(--header-h)] md:mr-0 md:max-w-[min(54%,52rem)]">
            <p className="eyebrow fade-up hero-after">
              {identity.title} · {identity.city}
            </p>
            <h1 id="hero-title" className="display line-rise hero-title mt-5 text-[clamp(2.7rem,1.3rem+3.9vw,6.6rem)]">
              <Lines lines={["Votre corps mérite", <>toute notre <em>attention.</em></>]} />
            </h1>
            <p className="lede fade-up hero-after mt-4 max-w-lg text-ink sm:mt-6" style={{ "--d": "120ms" } as CSSProperties}>
              {identity.name} — {identity.title} à {identity.city}. Une approche personnalisée de votre mobilité et de votre confort.
            </p>
            <div className="fade-up hero-after mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mt-8" style={{ "--d": "200ms" } as CSSProperties}>
              <BookingButton size="lg" />
              <Link href="/anatomie" transitionTypes={["to-anatomy"]} className="btn btn-ghost btn-lg bg-paper/60 max-sm:hidden">
                Explorer le corps humain <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/anatomie" transitionTypes={["to-anatomy"]} className="link-more py-2 text-ink sm:hidden">
                Explorer le corps humain <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
            {address ? (
              <p className="fade-up hero-after mt-6 flex items-start gap-2 text-[0.95rem] text-ink-soft max-md:hidden" style={{ "--d": "260ms" } as CSSProperties}>
                <RouteIcon className="mt-1 h-4 w-4 shrink-0 text-bronze-ink" />
                <span>
                  {formatAddress(address)}
                  {address.hint ? <span className="block text-sm">{address.hint}</span> : null}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        {MOVES.map((m) => {
          const region = getRegion(m.region);
          return (
            <div key={m.region} data-chapter className={`chapter items-end pb-[calc(1.5rem+var(--actionbar-h))] md:items-center md:pb-0 ${m.side === "right" ? "md:justify-end" : ""}`}>
              <Reveal className="glass mx-[var(--gutter)] max-w-md rounded-panel p-7 md:p-9">
                <p className="eyebrow">{region.label}</p>
                <h2 className="display mt-4 text-[clamp(2.3rem,1.6rem+2.6vw,4rem)]">
                  {m.title} <em>{m.verb}</em>
                </h2>
                <p className="prose-body mt-4">{region.movement.caption}</p>
                <Link href={`/anatomie?region=${region.id}`} transitionTypes={["to-anatomy"]} className="link-more mt-6 text-ink">
                  Observer la région en 3D <span className="btn-arrow" aria-hidden="true">→</span>
                </Link>
              </Reveal>
            </div>
          );
        })}

        <div data-chapter className="chapter on-dark items-end pb-[calc(2rem+var(--actionbar-h))] md:items-center md:pb-0">
          <Reveal className="glass-dark mx-[var(--gutter)] max-w-xl rounded-panel p-7 md:p-10">
            <p className="eyebrow eyebrow--xray">Radiographie numérique</p>
            <h2 className="display mt-5 text-[clamp(2.6rem,1.6rem+3.6vw,5.6rem)]">
              Le squelette, <em>en transparence.</em>
            </h2>
            <p className="lede mt-5 max-w-md">
              Un balayage lumineux révèle les structures qui participent à chaque geste. Il s&apos;agit d&apos;une visualisation pédagogique, jamais d&apos;un examen d&apos;imagerie.
            </p>
            <Link href="/anatomie" transitionTypes={["to-anatomy"]} className="btn btn-xray btn-lg mt-8">
              Explorer l&apos;anatomie <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </HomeHero>

      {/* 2. Pourquoi consulter ? — prolongement de la scène sombre, radiographies sous licence */}
      <section aria-labelledby="motifs-title" className="on-dark bg-night pb-24 pt-10 md:pb-32">
        <div className="wrap">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow eyebrow--xray">Pourquoi consulter ?</p>
              <h2 id="motifs-title" className="display mt-5 text-[clamp(2.4rem,1.5rem+3.4vw,5.2rem)]">
                Des gênes fréquentes, <em>des repères clairs.</em>
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="lede">L&apos;ostéopathe agit sur les troubles fonctionnels et vous oriente vers un médecin lorsque les symptômes le nécessitent.</p>
              <Link href="/motifs-de-consultation" className="link-more mt-5 text-bone">
                Tous les motifs de consultation <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-5">
            {motifCategories.map((cat, i) => {
              const visual = categoryVisuals[cat.id];
              return (
                <Reveal key={cat.id} delay={i * 80} className={`card-dark overflow-hidden rounded-panel ${CATEGORY_LAYOUT[i] ?? ""} ${i === 0 || i === 3 ? "md:col-span-2" : ""}`}>
                  {visual ? (
                    <div className={`xray-frame relative m-2 ${i === 0 || i === 3 ? "aspect-[16/10] sm:aspect-[4/5]" : "aspect-[16/9]"} ${i === 3 ? "sm:order-2" : ""}`}>
                      <Image src={visual.src} alt={visual.alt} fill sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw" quality={75} className="object-cover" />
                      <span className="scan-line" aria-hidden="true" />
                    </div>
                  ) : null}
                  <div className="flex flex-col p-6 md:p-8">
                    <h3 className="display text-[clamp(1.8rem,1.3rem+1.4vw,2.6rem)]">{cat.title}</h3>
                    <p className="prose-body mt-3">{cat.intro}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {cat.slugs.map((slug) => {
                        const motif = getMotif(slug);
                        return motif ? (
                          <li key={slug}>
                            <Link href={`/motifs-de-consultation/${slug}`} className="chip">
                              {motif.shortTitle}
                            </Link>
                          </li>
                        ) : null;
                      })}
                    </ul>
                    {visual ? <ImageCredit image={visual} className="mt-6" /> : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. L'ostéopathe — retour à la lumière */}
      <section aria-labelledby="approche-title" className="py-24 md:py-36">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6 lg:pr-8">
            <p className="eyebrow">L&apos;ostéopathe</p>
            <h2 id="approche-title" className="display mt-5 text-[clamp(2.4rem,1.5rem+3.4vw,5.2rem)]">
              Prendre le temps de comprendre <em>avant d&apos;agir.</em>
            </h2>
            <div className="prose-body mt-7 max-w-xl">
              {approach.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Link href="/osteopathe" className="btn btn-ghost mt-8">
              Découvrir l&apos;approche <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="relative lg:col-span-6">
            <Photo photo={photos.office} sizes="(min-width: 1024px) 46vw, 100vw" className="aspect-[4/5] md:aspect-[5/4] lg:aspect-[4/5]" parallax />
            <div className="glass absolute -bottom-6 left-4 right-4 rounded-card p-5 sm:left-auto sm:right-6 sm:max-w-xs md:-left-10 md:right-auto">
              <p className="text-sm text-ink-soft">{photos.office.caption}</p>
            </div>
          </div>
        </div>
        <ol className="wrap mt-24 grid gap-px overflow-hidden rounded-panel bg-clay sm:grid-cols-2 lg:grid-cols-4">
          {approach.principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90} className="bg-ivory p-7 md:p-9">
              <span className="block h-2.5 w-2.5 rounded-full bg-bronze" aria-hidden="true" />
              <h3 className="display mt-6 text-3xl">{p.title}</h3>
              <p className="prose-body mt-3 text-[0.98rem]">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* 4. Le cabinet — fenêtre photographique (elle s'agrandit en page « Cabinet ») */}
      <section aria-labelledby="cabinet-title" className="px-2 sm:px-3">
        <div className="relative">
          <ViewTransition name="cabinet-window" share="morph" default="none">
            <div className="tour-grow relative h-[88svh] min-h-[32rem] overflow-hidden">
              <Image src={photos.room.src} alt={photos.room.alt} fill sizes="100vw" quality={80} className="parallax-img object-cover" style={{ objectPosition: `${photos.room.focus[0]}% ${photos.room.focus[1]}%` }} />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(23_25_27/0.55),transparent_55%)]" aria-hidden="true" />
            </div>
          </ViewTransition>
          <div className="absolute inset-x-0 bottom-0 p-[var(--gutter)] pb-10 md:pb-14">
            <div className="wrap !px-0">
              <Reveal className="glass max-w-lg rounded-panel p-7 md:p-9">
                <p className="eyebrow">Le cabinet</p>
                <h2 id="cabinet-title" className="display mt-4 text-[clamp(2.2rem,1.5rem+2.6vw,4rem)]">
                  Un lieu calme, <em>baigné de lumière.</em>
                </h2>
                <p className="prose-body mt-4">Deux salles de consultation, des tables réglables et un bureau où chaque rendez-vous commence par un échange.</p>
                <Link href="/cabinet" transitionTypes={["to-cabinet"]} className="btn btn-primary mt-7">
                  Visiter le cabinet <span className="btn-arrow" aria-hidden="true">→</span>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Conseils et rendez-vous */}
      <section aria-labelledby="rdv-title" className="py-24 md:py-32">
        <div className="wrap grid gap-4 lg:grid-cols-[1fr_1.15fr] lg:gap-5">
          <ViewTransition name="reading-surface" share="morph" default="none">
            <Link href="/conseils" transitionTypes={["to-reading"]} className="group panel-sand relative flex min-h-[24rem] flex-col justify-between overflow-hidden p-8 md:p-11">
              <div>
                <p className="eyebrow">Conseils</p>
                <p className="display mt-5 text-[clamp(2rem,1.4rem+2.2vw,3.4rem)]">
                  Préparer votre <em>rendez-vous.</em>
                </p>
                <p className="prose-body mt-4 max-w-md">Documents utiles, tenue, déroulement d&apos;une séance, questions fréquentes : tout pour venir l&apos;esprit tranquille.</p>
              </div>
              <span className="link-more mt-8 self-start text-ink">
                Lire les conseils <ArrowIcon className="btn-arrow h-4 w-4" />
              </span>
            </Link>
          </ViewTransition>

          <div className="panel-graphite on-dark relative overflow-hidden p-8 md:p-11">
            <p className="eyebrow">Rendez-vous</p>
            <h2 id="rdv-title" className="display mt-5 text-[clamp(2.2rem,1.5rem+2.6vw,4rem)]">
              Prêt à prendre soin <em>de votre mobilité ?</em>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <BookingButton variant="light" size="lg" />
              {phone ? (
                <a href={telHref(phone.e164)} className="flex items-center gap-2 font-display text-2xl text-bone hover:text-bronze-light">
                  <PhoneIcon className="h-5 w-5" /> {phone.display}
                </a>
              ) : null}
            </div>
            <div className="mt-10 grid gap-6 border-t border-bone/12 pt-8 sm:grid-cols-2">
              {hours.length ? (
                <dl className="space-y-1 text-[0.95rem]">
                  {hours.map((h) => (
                    <div key={h.days}>
                      <dt className="text-mist">{h.days}</dt>
                      <dd>{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {address ? (
                <div className="text-[0.95rem]">
                  <p>{formatAddress(address)}</p>
                  <a href={directionLinks(address).google} target="_blank" rel="noopener noreferrer" className="link-more mt-3 text-bone">
                    Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
