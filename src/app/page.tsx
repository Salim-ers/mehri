import Image from "next/image";
import Link from "next/link";
import { IntroOverlay } from "@/components/layout/IntroOverlay";
import { AtlasPhoto } from "@/components/shared/AtlasPhoto";
import { BookingButton } from "@/components/shared/BookingButton";
import { Lines } from "@/components/shared/PlateHeader";
import { PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { anatomyRegions } from "@/content/anatomy";
import { photos } from "@/content/media";
import { motifs } from "@/content/motifs";
import { practice } from "@/content/practice";
import { HeroStage } from "@/features/anatomy/components/HeroStage";
import { hasValue } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mohamed Merhi — Ostéopathe D.O. à Creil (60100)",
  description:
    "Ostéopathe à Creil : Mohamed Merhi vous reçoit pour un accompagnement personnalisé, attentif à votre mobilité et à votre confort. Motifs de consultation, cabinet, rendez-vous.",
  path: "/",
});

export default function HomePage() {
  const hours = practice.openingHours;
  return (
    <>
      <IntroOverlay />
      <HeroStage
        intro={
          <div className="w-full max-w-[110rem] lg:mx-auto">
            <div className="max-w-[40rem] lg:max-w-[54%]">
              <p className="caption-mono flex items-center gap-3 text-bronze-ink">
                <span className="inline-block h-px w-10 bg-current" />
                Planche 0 · <span lang="la" className="italic normal-case tracking-normal">Columna vertebralis</span>
              </p>
              <h1 className="display line-rise mt-6 text-[clamp(2.6rem,1.2rem+4.6vw,7rem)] text-umber">
                <Lines lines={["Le mouvement", <>est au cœur de</>, <>votre <em>équilibre.</em></>]} />
              </h1>
              <p className="mt-7 font-display text-[clamp(1.15rem,1rem+0.5vw,1.5rem)] text-ink">Mohamed Merhi — Ostéopathe D.O. à Creil</p>
              <p className="prose-atlas mt-3 max-w-md">Un accompagnement personnalisé, attentif à votre mobilité et à votre confort.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <BookingButton />
                <Link href="/cabinet" className="btn btn-ghost text-umber">
                  Découvrir le cabinet
                </Link>
              </div>
              <p className="caption-mono mt-12 hidden items-center gap-3 text-ink-soft lg:flex" aria-hidden="true">
                <span className="scroll-cue" /> Faites défiler — l&apos;anatomie se dévoile
              </p>
            </div>
          </div>
        }
        beats={[
          <div key="c" className="w-full max-w-[110rem] lg:mx-auto">
            <div className="max-w-md lg:max-w-[34%]">
              <p className="caption-mono text-bronze-ink">Fig. 0.1 — C1 → C7</p>
              <h2 className="display mt-4 text-[clamp(2rem,1.2rem+3vw,4.2rem)] text-umber">Sept vertèbres pour porter la tête.</h2>
              <p className="prose-atlas mt-5">
                Le rachis cervical est la portion la plus mobile de la colonne : il oriente le regard, absorbe les gestes du quotidien et
                traduit souvent nos postures.
              </p>
            </div>
          </div>,
          <div key="l" className="w-full max-w-[110rem] lg:mx-auto">
            <div className="max-w-md lg:max-w-[34%]">
              <p className="caption-mono text-bronze-ink">Fig. 0.2 — L4 → S1</p>
              <h2 className="display mt-4 text-[clamp(2rem,1.2rem+3vw,4.2rem)] text-umber">Là où la colonne rencontre le bassin.</h2>
              <p className="prose-atlas mt-5">
                La charnière lombo-sacrée transmet le poids du tronc vers les hanches. Chaque segment n&apos;y bouge que de quelques degrés :
                c&apos;est leur coordination qui fait le mouvement.
              </p>
              <Link href="/le-corps-en-mouvement" className="link-atlas mt-6 inline-block font-medium text-umber">
                Explorer l&apos;atlas en 3D →
              </Link>
            </div>
          </div>,
        ]}
      />

      {/* Le praticien, en bref */}
      <section aria-labelledby="praticien-titre" className="relative px-[var(--gutter)] py-24 md:py-36">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 items-end gap-x-6 gap-y-12">
          <AtlasPhoto
            photo={photos.portrait}
            sizes="(min-width: 1024px) 30vw, 80vw"
            className="col-span-10 col-start-1 sm:col-span-6 lg:col-span-4 lg:col-start-2"
            aspect="464 / 760"
            caption
            figureNumber="1"
          />
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pb-16">
            <Reveal>
              <p className="caption-mono text-bronze-ink">Planche I · Votre ostéopathe</p>
              <h2 id="praticien-titre" className="display mt-5 text-[clamp(2.2rem,1.3rem+3.4vw,5rem)] text-umber">
                Une écoute attentive, <em>une approche précise.</em>
              </h2>
              <p className="prose-atlas mt-7 max-w-xl">
                Chaque consultation commence par un échange. Mohamed Merhi prend le temps de comprendre votre contexte avant de proposer une
                approche manuelle adaptée — et vous oriente vers un médecin lorsque la situation le nécessite.
              </p>
              <Link href="/osteopathe" className="link-atlas mt-8 inline-block font-medium text-umber">
                Découvrir son approche →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Le cabinet : photographie forte */}
      <section aria-labelledby="cabinet-titre" className="relative overflow-hidden bg-paper px-[var(--gutter)] py-24 md:py-36">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 flex flex-col justify-between lg:col-span-4">
            <Reveal>
              <p className="caption-mono text-bronze-ink">Planche IV · Le cabinet</p>
              <h2 id="cabinet-titre" className="display mt-5 text-[clamp(2.2rem,1.3rem+3.4vw,4.8rem)] text-umber">
                Lumière naturelle, <em>pierre et bois.</em>
              </h2>
              <p className="prose-atlas mt-6 max-w-md">
                Un lieu calme et lumineux à Creil, pensé pour que chaque patient s&apos;y sente à l&apos;aise : tables de soins réglables, bureau
                d&apos;échange, modèles anatomiques pour expliquer.
              </p>
            </Reveal>
            <Reveal className="mt-10" delay={150}>
              <Link href="/cabinet" className="btn btn-primary">
                Visiter le cabinet <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
          <AtlasPhoto
            photo={photos.room}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="col-span-12 h-[78svh] lg:col-span-7 lg:col-start-6 lg:h-[88vh]"
            caption
            figureNumber="4.1"
          />
        </div>
      </section>

      {/* Introduction à l'exploration anatomique */}
      <section aria-labelledby="atlas-titre" className="on-dark grain relative overflow-hidden bg-umber px-[var(--gutter)] py-24 text-bone md:py-36">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 items-center gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <p className="caption-mono text-bronze-light">Planche II · Le corps en mouvement</p>
              <h2 id="atlas-titre" className="display mt-5 text-[clamp(2.4rem,1.3rem+4vw,5.8rem)]">
                Sept régions à explorer <em>en trois dimensions.</em>
              </h2>
              <p className="prose-atlas mt-7 max-w-xl">
                Un atlas interactif pour comprendre comment la colonne, les épaules, le bassin ou les genoux se mettent en mouvement. Une
                ressource pédagogique — ni diagnostic, ni promesse de traitement.
              </p>
            </Reveal>
            <ol className="mt-12 grid grid-cols-1 border-t border-bone/12 sm:grid-cols-2">
              {anatomyRegions.map((r, i) => (
                <li key={r.id} className="border-b border-bone/12 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6">
                  <Reveal delay={i * 60}>
                    <Link href={`/le-corps-en-mouvement?region=${r.id}#atlas`} className="group flex items-baseline gap-4 py-4">
                      <span className="caption-mono w-8 text-bronze-light">{r.plate}</span>
                      <span className="text-lg transition-colors group-hover:text-bronze-light">{r.label}</span>
                      <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative col-span-12 flex justify-center lg:col-span-5 lg:col-start-8">
            <Reveal className="relative flex w-full justify-center">
              <SpineDrawing className="h-[62vh] max-h-[640px] w-auto text-bronze-light" />
              <div className="registration pointer-events-none absolute inset-6 text-bone/30" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Invitation aux consultations */}
      <section aria-labelledby="motifs-titre" className="px-[var(--gutter)] py-24 md:py-36">
        <div className="mx-auto max-w-[110rem]">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <Reveal className="col-span-12 lg:col-span-5">
              <p className="caption-mono text-bronze-ink">Planche III · Motifs de consultation</p>
              <h2 id="motifs-titre" className="display mt-5 text-[clamp(2.2rem,1.3rem+3.4vw,4.8rem)] text-umber">
                Pourquoi consulter <em>un ostéopathe ?</em>
              </h2>
            </Reveal>
            <Reveal className="col-span-12 lg:col-span-5 lg:col-start-8 lg:self-end" delay={120}>
              <p className="prose-atlas">
                Huit fiches pédagogiques pour comprendre les motifs fréquents de consultation, le déroulement possible d&apos;une séance et les
                situations qui relèvent d&apos;abord d&apos;un avis médical.
              </p>
            </Reveal>
          </div>
          <ol className="mt-14 border-t border-umber/15">
            {motifs.map((m, i) => (
              <li key={m.slug}>
                <Reveal delay={i * 40}>
                  <Link
                    href={`/motifs-de-consultation/${m.slug}`}
                    className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-umber/15 py-5 transition-colors hover:bg-paper md:grid-cols-[5rem_1fr_14rem_auto] md:py-7"
                  >
                    <span className="caption-mono text-bronze-ink">{m.number}</span>
                    <span className="display text-[clamp(1.4rem,1rem+1.6vw,2.6rem)] text-umber transition-transform duration-500 group-hover:translate-x-2">
                      {m.title}
                    </span>
                    <span className="caption-mono hidden text-ink-soft md:block">
                      {anatomyRegions.find((r) => r.id === m.region)?.label}
                    </span>
                    <span aria-hidden="true" className="text-xl text-bronze-ink transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Réservation */}
      <section aria-labelledby="rdv-titre" className="relative overflow-hidden bg-stone/45 px-[var(--gutter)] py-24 md:py-32">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 items-center gap-x-6 gap-y-10">
          <Reveal className="col-span-12 lg:col-span-7">
            <p className="caption-mono text-bronze-ink">Planche VII · Rendez-vous</p>
            <h2 id="rdv-titre" className="display mt-5 text-[clamp(2.6rem,1.4rem+4.6vw,6.6rem)] text-umber">
              Prendre <em>rendez-vous.</em>
            </h2>
          </Reveal>
          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9" delay={120}>
            <BookingButton mode="direct" className="w-full sm:w-auto" />
            {hasValue(hours) ? (
              <p className="mt-6 text-ink-soft">
                {hours.value.map((h) => `${h.days} · ${h.hours}`).join(" — ")} <PendingBadge fact={hours} />
              </p>
            ) : null}
            <p className="mt-3 text-sm text-ink-soft">
              <Link href="/rendez-vous" className="link-atlas">
                Comment se passe la prise de rendez-vous ?
              </Link>
            </p>
          </Reveal>
        </div>
        <Image src="/images/monogramme.png" alt="" width={345} height={335} className="pointer-events-none absolute -bottom-16 -right-10 w-72 opacity-[0.07]" />
      </section>
    </>
  );
}
