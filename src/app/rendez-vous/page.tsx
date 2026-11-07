import Link from "next/link";
import { bookingAction, BookingButton } from "@/components/shared/BookingButton";
import { PhoneIcon } from "@/components/shared/Icons";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { identity, practice, reviewMode } from "@/content/practice";
import { directionLinks, formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Prendre rendez-vous — ostéopathe à Creil",
  description: `Prendre rendez-vous avec ${identity.name}, ${identity.title} à ${identity.city} : par téléphone, horaires, adresse et informations pratiques.`,
  path: "/rendez-vous",
});

export default function RendezVousPage() {
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const address = hasValue(practice.address) ? practice.address.value : null;
  const online = bookingAction.kind === "online";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Prendre rendez-vous", path: "/rendez-vous" }])) }}
      />
      <PageIntro
        eyebrow="Rendez-vous"
        title={<Lines lines={["Prendre", <><em>rendez-vous.</em></>]} />}
        lede={<p>{online ? "Choisissez votre créneau sur la plateforme du cabinet." : "Un appel suffit : les rendez-vous se prennent directement auprès du cabinet."}</p>}
      />

      <section aria-labelledby="reserver" className="wrap pb-24 md:pb-32">
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          {/* Informations principales */}
          <div className="panel order-2 min-w-0 space-y-9 p-6 sm:p-8 md:p-10 lg:order-1 lg:col-span-5">
            {phone ? (
              <div>
                <h2 className="eyebrow">Coordonnées</h2>
                <a href={telHref(phone.e164)} className="mt-3 flex items-center gap-3 font-display text-2xl hover:text-bronze-ink sm:text-3xl">
                  <PhoneIcon className="h-5 w-5 text-bronze-ink" /> {phone.display}
                </a>
              </div>
            ) : null}
            {address ? (
              <div>
                <h2 className="eyebrow">Adresse et accès</h2>
                <p className="mt-3 text-[1.05rem]">{formatAddress(address)}</p>
                <p className="mt-1 text-sm text-ink-soft">{address.hint}</p>
                {hasValue(practice.accessibility) ? <p className="mt-2 text-sm text-ink-soft">{practice.accessibility.value}.</p> : null}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  <a href={directionLinks(address).google} target="_blank" rel="noopener noreferrer" className="link-more text-ink">
                    Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
                  </a>
                  <Link href="/contact" className="link-more text-ink-soft hover:text-ink">
                    Plan et accès
                  </Link>
                </div>
              </div>
            ) : null}
            <div>
              <h2 className="eyebrow">
                Horaires <PendingBadge fact={practice.openingHours} />
              </h2>
              {hasValue(practice.openingHours) ? (
                <dl className="mt-3 divide-y divide-clay border-y border-clay">
                  {practice.openingHours.value.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4 py-3">
                      <dt className="text-ink-soft">{h.days}</dt>
                      <dd>{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            <div>
              <h2 className="eyebrow">Tarifs</h2>
              {hasValue(practice.fees) ? (
                <dl className="mt-3 divide-y divide-clay border-y border-clay">
                  {practice.fees.value.map((f) => (
                    <div key={f.label} className="flex justify-between gap-4 py-3">
                      <dt>{f.label}</dt>
                      <dd>{f.price}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="mt-3">
                  <MissingSlot fact={practice.fees}>
                    <p className="text-ink-soft">Les tarifs vous sont communiqués lors de la prise de rendez-vous.</p>
                  </MissingSlot>
                </div>
              )}
            </div>
            <div>
              <h2 className="eyebrow">Consignes pratiques</h2>
              <ul className="mt-3 space-y-2 text-[0.97rem] text-ink-soft">
                <li>En cas d&apos;empêchement, prévenez le cabinet le plus tôt possible afin de libérer le créneau.</li>
                <li>
                  Documents utiles, tenue, déroulement :{" "}
                  <Link href="/conseils" transitionTypes={["to-reading"]} className="link-more text-ink">
                    les conseils avant votre venue
                  </Link>
                  .
                </li>
              </ul>
            </div>
            {reviewMode ? (
              <div className="rounded-soft border border-dashed border-review/50 bg-review-bg/70 p-4 text-sm text-review">
                <p className="mb-2 font-semibold">Note de relecture — réservation</p>
                <p>
                  Dès qu&apos;une plateforme de réservation est confirmée, son lien remplace automatiquement l&apos;appel dans tous les boutons
                  « Prendre rendez-vous ».
                </p>
                <p className="mt-2">{practice.onlineBookingUrl.ask}</p>
              </div>
            ) : null}
          </div>

          {/* Parcours de réservation réel : aucun créneau simulé, aucun bouton de confirmation factice */}
          <div className="panel-graphite on-dark order-1 min-w-0 p-6 sm:p-8 md:p-12 lg:order-2 lg:col-span-7">
            <h2 id="reserver" className="eyebrow">
              {online ? "Réservation en ligne" : "Réserver par téléphone"}
            </h2>
            {!online && phone ? (
              <a href={telHref(phone.e164)} className="display mt-7 flex items-center gap-3 text-[clamp(1.75rem,0.9rem+4.2vw,5.2rem)] leading-none transition-colors hover:text-bronze-light sm:gap-4">
                <PhoneIcon className="h-6 w-6 shrink-0 text-bronze-light sm:h-9 sm:w-9 md:h-11 md:w-11" />
                <span>{phone.display}</span>
              </a>
            ) : null}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <BookingButton mode="direct" variant="light" size="lg" />
              <PendingBadge fact={practice.phone} />
            </div>
            <ol className="mt-12 space-y-3">
              {(online
                ? ["Ouvrez la plateforme de réservation du cabinet.", "Choisissez un créneau disponible.", "Vous recevez la confirmation de la plateforme."]
                : [
                    "Appelez le cabinet aux horaires d'ouverture.",
                    "Indiquez le motif de votre venue, votre âge, vos antécédents et vos traitements en cours.",
                    "Le cabinet vous propose un rendez-vous et vous en confirme la date et l'heure.",
                  ]
              ).map((step, i) => (
                <li key={step} className="card-dark flex items-start gap-4 rounded-card p-5">
                  <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bronze-light/20">
                    <span className="block h-2 w-2 rounded-full bg-bronze-light" style={{ opacity: 0.45 + i * 0.27 }} />
                  </span>
                  <span className="text-[1.02rem]">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-lg text-sm text-mist">
              {online
                ? "Vous serez redirigé vers la plateforme de réservation du cabinet."
                : "Aucun créneau n'est affiché sur ce site : le cabinet vous propose un rendez-vous directement au téléphone."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
