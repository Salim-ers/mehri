import { AtlasPhoto } from "@/components/shared/AtlasPhoto";
import { BookingButton } from "@/components/shared/BookingButton";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { photos } from "@/content/media";
import { identity, practice } from "@/content/practice";
import { approach, approachValidation } from "@/content/practitioner";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Votre ostéopathe",
  description:
    `${identity.name}, ${identity.title} à ${identity.city} : son approche du patient, sa manière de conduire les consultations et sa philosophie professionnelle.`,
  path: "/osteopathe",
  image: "/images/praticien-portrait.jpg",
});

export default function OsteopathePage() {
  const diplomas = practice.diplomas;
  const background = practice.background;
  const publics = practice.publics;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Votre ostéopathe", path: "/osteopathe" }])) }}
      />
      <PlateHeader
        plate="I"
        latin="Ars manualis"
        title={<Lines lines={[`${identity.name},`, <><em>{identity.title.toLowerCase()}</em></>]} />}
        lede={
          <p>
            Au cabinet de {identity.city}, {identity.name} accompagne ses patients avec une approche manuelle, attentive et expliquée.{" "}
            <PendingBadge fact={practice.practitionerName} />
          </p>
        }
      />

      {/* Portrait + approche */}
      <section aria-labelledby="approche" className="px-[var(--gutter)] pb-24 md:pb-36">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-14">
          <AtlasPhoto
            photo={photos.portrait}
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority
            className="col-span-12 sm:col-span-8 lg:col-span-5"
            aspect="464 / 700"
            caption
            figureNumber="1.1"
          />
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-24">
            <Reveal>
              <p className="caption-mono text-bronze-ink">
                Approche du patient <PendingBadge fact={approachValidation} />
              </p>
              <h2 id="approche" className="display mt-5 text-[clamp(2.2rem,1.3rem+3.2vw,4.6rem)] text-umber">
                {approach.statement}
              </h2>
              <div className="prose-atlas mt-8 max-w-xl">
                {approach.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Manière de conduire les consultations */}
      <section aria-labelledby="principes" className="on-dark grain bg-umber px-[var(--gutter)] py-24 text-bone md:py-32">
        <div className="mx-auto max-w-[110rem]">
          <Reveal>
            <p className="caption-mono text-bronze-light">Conduite de la consultation</p>
            <h2 id="principes" className="display mt-5 max-w-3xl text-[clamp(2.2rem,1.3rem+3vw,4.4rem)]">
              Quatre principes, <em>à chaque séance.</em>
            </h2>
          </Reveal>
          <ol className="mt-16 grid gap-px overflow-hidden rounded-lg border border-bone/12 bg-bone/12 sm:grid-cols-2 xl:grid-cols-4">
            {approach.principles.map((p, i) => (
              <li key={p.number} className="bg-umber p-7 md:p-9">
                <Reveal delay={i * 90}>
                  <p className="caption-mono text-bronze-light">{p.number}</p>
                  <h3 className="display mt-6 text-4xl">{p.title}</h3>
                  <p className="mt-4 leading-relaxed text-bone/75">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Parcours & formation : uniquement des données confirmées */}
      <section aria-labelledby="parcours" className="px-[var(--gutter)] py-24 md:py-32">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <p className="caption-mono text-bronze-ink">Parcours et formation</p>
              <h2 id="parcours" className="display mt-5 text-[clamp(2rem,1.2rem+2.6vw,3.8rem)] text-umber">
                Parcours <em>et formation</em>
              </h2>
              <p className="prose-atlas mt-6 max-w-md">Seules les informations validées par le praticien sont présentées ici.</p>
            </Reveal>
            <div className="mt-8 space-y-4">
              {hasValue(background) ? <p className="prose-atlas">{background.value}</p> : <MissingSlot fact={background} />}
              {hasValue(diplomas) ? (
                <ul className="space-y-2">
                  {diplomas.value.map((d) => (
                    <li key={d} className="border-l-2 border-bronze pl-4">
                      {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <MissingSlot fact={diplomas} />
              )}
              {hasValue(publics) ? (
                <p className="prose-atlas">Publics accueillis : {publics.value.join(", ")}.</p>
              ) : (
                <MissingSlot fact={publics} />
              )}
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-6 lg:col-start-7 md:gap-6">
            <AtlasPhoto photo={photos.desk} sizes="(min-width: 1024px) 25vw, 50vw" aspect="466 / 760" caption figureNumber="1.2" />
            <AtlasPhoto photo={photos.shoulder} sizes="(min-width: 1024px) 25vw, 50vw" aspect="466 / 760" className="mt-16 md:mt-28" caption figureNumber="1.3" delay={150} />
          </div>
        </div>
      </section>

      {/* Philosophie */}
      <section aria-labelledby="philosophie" className="bg-paper px-[var(--gutter)] py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <p id="philosophie" className="caption-mono text-bronze-ink">
              Philosophie professionnelle
            </p>
            <p className="display mt-8 text-[clamp(1.8rem,1.1rem+2.4vw,3.4rem)] leading-[1.15] text-umber">{approach.philosophy}</p>
            <div className="mt-12 flex justify-center">
              <BookingButton />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
