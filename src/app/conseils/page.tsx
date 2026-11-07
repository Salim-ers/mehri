import Image from "next/image";
import { ViewTransition } from "react";
import { BookingButton } from "@/components/shared/BookingButton";
import { PhoneIcon, PlusIcon, RouteIcon } from "@/components/shared/Icons";
import { Lines } from "@/components/shared/PageIntro";
import { MissingSlot } from "@/components/shared/Pending";
import { Photo } from "@/components/shared/Photo";
import { RedFlags } from "@/components/shared/RedFlags";
import { Reveal } from "@/components/shared/Reveal";
import { afterItems, beforePanels, faqItems } from "@/content/advice";
import { xrays } from "@/content/imagery";
import { photos } from "@/content/media";
import { practice } from "@/content/practice";
import { consultationSteps } from "@/content/site";
import { AdviceIllustration } from "@/features/consultation/AdviceIllustration";
import { ImageCredit } from "@/features/imagery/ImageCredit";
import { directionLinks, formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Conseils et votre rendez-vous",
  description:
    "Préparer une consultation d'ostéopathie à Creil : documents utiles, tenue, déroulement d'une séance, après la séance et réponses aux questions fréquentes (ordonnance, durée, remboursement).",
  path: "/conseils",
});

/** Une photographie réelle du cabinet par étape (lieux vides). */
const STEP_PHOTOS = [
  { photo: photos.office, focus: [40, 58] as const, zoom: 1 },
  { photo: photos.tables, focus: [45, 66] as const, zoom: 1 },
  { photo: photos.room, focus: [45, 60] as const, zoom: 1 },
  { photo: photos.office, focus: [64, 48] as const, zoom: 1.7 },
];

/** Composition des quatre conseils : largeurs alternées. */
const PANEL_SPAN = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];

export default function AdvicePage() {
  const faq = faqItems();
  const address = hasValue(practice.address) ? practice.address.value : null;
  const hours = hasValue(practice.openingHours) ? practice.openingHours.value : [];
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const access = hasValue(practice.accessibility) ? practice.accessibility.value : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            breadcrumbJsonLd([
              { name: "Accueil", path: "/" },
              { name: "Conseils", path: "/conseils" },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer.join(" ") } })),
            },
          ]),
        }}
      />

      {/* La surface de lecture : le panneau « Conseils » de la page précédente s'ouvre et devient cette page */}
      <div className="wrap pt-[calc(var(--header-h)+1.5rem)]">
        <ViewTransition name="reading-surface" share="morph" default="none">
          <header className="panel-sand px-7 pb-14 pt-14 md:px-14 md:pb-20 md:pt-20">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="eyebrow fade-up">Conseils &amp; votre rendez-vous</p>
                <h1 className="display line-rise mt-5 text-[clamp(2.7rem,1.5rem+5vw,7rem)]">
                  <Lines lines={["Bien préparer", <em key="c">votre consultation.</em>]} />
                </h1>
              </div>
              <p className="lede fade-up lg:col-span-4" style={{ ["--d" as string]: "300ms" }}>
                Ce qu&apos;il est utile de savoir avant, pendant et après une séance d&apos;ostéopathie, et les réponses aux questions les plus fréquentes.
              </p>
            </div>
          </header>
        </ViewTransition>
      </div>

      {/* 1. Avant la consultation */}
      <section aria-labelledby="avant" className="wrap py-20 md:py-28">
        <p className="eyebrow">Avant votre consultation</p>
        <h2 id="avant" className="display mt-5 max-w-3xl text-[clamp(2.2rem,1.4rem+3vw,4.4rem)]">
          Quatre repères <em>pour venir serein.</em>
        </h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          {beforePanels.map((panel, i) => (
            <Reveal key={panel.id} delay={(i % 2) * 90} className={`panel p-7 md:p-10 ${PANEL_SPAN[i] ?? ""}`}>
              <article aria-labelledby={`conseil-${panel.id}`} className={`flex gap-6 ${i === 3 ? "flex-col md:flex-row" : "flex-col sm:flex-row"}`}>
                <AdviceIllustration id={panel.id} className="h-20 w-20 shrink-0 text-walnut md:h-24 md:w-24" />
                <div className="min-w-0 flex-1">
                  <h3 id={`conseil-${panel.id}`} className="display text-[clamp(1.7rem,1.3rem+1.2vw,2.4rem)]">
                    {panel.title}
                  </h3>
                  <div className="prose-body mt-3">
                    {panel.text.map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                  </div>
                  {panel.id === "venue" ? (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div className="text-[0.97rem]">
                        {address ? (
                          <p className="flex gap-2">
                            <RouteIcon className="mt-1 h-4 w-4 shrink-0 text-bronze-ink" />
                            <span>
                              {formatAddress(address)}
                              {address.hint ? <span className="block text-sm text-ink-soft">{address.hint}</span> : null}
                            </span>
                          </p>
                        ) : null}
                        {access ? <p className="mt-3 text-sm text-ink-soft">{access}.</p> : null}
                        {address ? (
                          <a href={directionLinks(address).google} target="_blank" rel="noopener noreferrer" className="link-more mt-4 text-ink">
                            Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
                          </a>
                        ) : null}
                      </div>
                      {hours.length ? (
                        <dl className="space-y-1 text-[0.97rem]">
                          {hours.map((h) => (
                            <div key={h.days}>
                              <dt className="text-ink-soft">{h.days}</dt>
                              <dd>{h.hours}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 2. Déroulement d'une séance : ligne de temps animée au défilement */}
      <section id="seance" aria-labelledby="seance-titre" className="bg-sand py-20 md:py-28">
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow">Pendant la séance</p>
              <h2 id="seance-titre" className="display mt-5 text-[clamp(2.2rem,1.4rem+3vw,4.4rem)]">
                Comment se déroule <em>une séance&nbsp;?</em>
              </h2>
            </div>
            <p className="lede lg:col-span-4 lg:col-start-9">Chaque étape vous est expliquée. Vous pouvez poser vos questions ou demander une pause à tout moment.</p>
          </div>
          <ol data-timeline className="relative mt-16 space-y-16 md:space-y-24">
            <span aria-hidden="true" className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-clay md:left-1/2" />
            <span aria-hidden="true" className="timeline-progress absolute bottom-0 left-[1.1rem] top-0 w-[2px] -translate-x-[0.5px] bg-bronze md:left-1/2" />
            {consultationSteps.map((step, i) => {
              const media = STEP_PHOTOS[i];
              const flip = i % 2 === 1;
              return (
                <li key={step.title} className="relative grid gap-8 pl-12 md:grid-cols-2 md:gap-20 md:pl-0">
                  <span aria-hidden="true" className="absolute left-[0.6rem] top-2 h-4 w-4 rounded-full border-2 border-bronze bg-sand md:left-1/2 md:-translate-x-1/2" />
                  <Reveal className={flip ? "md:order-2" : "md:text-right"}>
                    <h3 className="display text-[clamp(1.9rem,1.4rem+1.6vw,3rem)]">{step.title}</h3>
                    <p className="lede mt-3">{step.summary}</p>
                    <div className="prose-body mt-4 text-[0.98rem]">
                      {step.detail.map((d) => (
                        <p key={d}>{d}</p>
                      ))}
                    </div>
                  </Reveal>
                  {media ? (
                    <Photo
                      photo={media.photo}
                      focus={media.focus}
                      zoom={media.zoom}
                      sizes="(min-width: 768px) 40vw, 90vw"
                      radius="card"
                      className={`aspect-[4/3] ${flip ? "md:order-1" : ""}`}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 3. Après la séance */}
      <section aria-labelledby="apres" className="on-dark bg-night py-20 md:py-28">
        <div className="wrap">
          <p className="eyebrow eyebrow--xray">Après la séance</p>
          <h2 id="apres" className="display mt-5 max-w-3xl text-[clamp(2.2rem,1.4rem+3vw,4.4rem)]">
            Des repères <em>pour la suite.</em>
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {afterItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 90} className="card-dark rounded-panel p-7 md:p-9">
                <span aria-hidden="true" className="block h-2.5 w-2.5 rounded-full bg-xray" />
                <h3 className="display mt-6 text-[1.9rem]">{item.title}</h3>
                <p className="prose-body mt-3">{item.text}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-4">
            <RedFlags tone="dark" />
          </div>
        </div>
      </section>

      {/* 4. Questions fréquentes */}
      <section aria-labelledby="faq" className="wrap py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 id="faq" className="display mt-5 text-[clamp(2.2rem,1.4rem+3vw,4rem)]">
              Vos questions, <em>nos réponses.</em>
            </h2>
            <p className="prose-body mt-5">Une question qui n&apos;apparaît pas ici&nbsp;? Le cabinet vous répond par téléphone.</p>
          </div>
          <div className="space-y-2 lg:col-span-8">
            {faq.map((item) => (
              <details key={item.id} id={`faq-${item.id}`} className="disclosure group rounded-card border border-clay">
                <summary className="flex min-h-16 items-center gap-5 px-6 py-5 md:px-8">
                  <span className="flex-1 font-display text-[1.35rem] leading-snug md:text-[1.55rem]">{item.question}</span>
                  <span className="disclosure-icon icon-btn shrink-0 bg-sand group-open:bg-graphite group-open:text-paper" aria-hidden="true">
                    <PlusIcon />
                  </span>
                </summary>
                <div className="prose-body px-6 pb-7 md:px-8">
                  {item.answer.map((a) => (
                    <p key={a}>{a}</p>
                  ))}
                  {item.fact ? <MissingSlot fact={item.fact} /> : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Réservation */}
      <section aria-labelledby="pret" className="wrap pb-24 md:pb-32">
        <div className="panel-graphite on-dark grid overflow-hidden lg:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10 p-8 md:p-14">
            <p className="eyebrow">Rendez-vous</p>
            <h2 id="pret" className="display mt-5 text-[clamp(2.2rem,1.4rem+3vw,4.2rem)]">
              Prêt à prendre soin <em>de votre mobilité&nbsp;?</em>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <BookingButton variant="light" size="lg" />
              {phone ? (
                <a href={telHref(phone.e164)} className="flex items-center gap-2 font-display text-2xl text-bone hover:text-bronze-light">
                  <PhoneIcon className="h-5 w-5" /> {phone.display}
                </a>
              ) : null}
            </div>
            {address ? <p className="mt-8 text-mist">{formatAddress(address)}</p> : null}
            <ImageCredit image={xrays.cervical} className="mt-6" />
          </div>
          <div className="relative min-h-[22rem]">
            <Image src={photos.room.src} alt={photos.room.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" quality={75} className="object-cover" style={{ objectPosition: "45% 60%" }} />
            <div className="xray-frame absolute bottom-5 left-5 h-36 w-28 shadow-lift md:h-44 md:w-32">
              <Image src={xrays.cervical.src} alt="" fill sizes="8rem" quality={65} className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
