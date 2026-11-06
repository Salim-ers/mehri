import Link from "next/link";
import { bookingAction, BookingButton } from "@/components/shared/BookingButton";
import { PhoneIcon } from "@/components/shared/Icons";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
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

      <section aria-labelledby="reserver" className="px-[var(--gutter)] pb-24 md:pb-32">
        <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          {/* Action principale : unique, immédiate */}
          <div className="on-dark xray-stage grain relative overflow-hidden rounded-3xl p-8 text-bone md:p-14 lg:col-span-7">
            <h2 id="reserver" className="eyebrow">
              {online ? "Réservation en ligne" : "Par téléphone"}
            </h2>
            {!online && phone ? (
              <a href={telHref(phone.e164)} className="display mt-8 flex items-center gap-4 text-[clamp(2.6rem,1.4rem+4.4vw,5.6rem)] leading-none transition-colors hover:text-bronze-light">
                <PhoneIcon className="h-9 w-9 shrink-0 text-bronze-light md:h-12 md:w-12" />
                <span>{phone.display}</span>
              </a>
            ) : null}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <BookingButton mode="direct" variant="light" size="lg" />
              <PendingBadge fact={practice.phone} />
            </div>
            <p className="mt-8 max-w-lg text-sm text-bone/70">
              {online
                ? "Vous serez redirigé vers la plateforme de réservation du cabinet."
                : "Aucun créneau n'est affiché sur ce site : le cabinet vous propose un rendez-vous directement au téléphone."}
            </p>
          </div>

          {/* Informations utiles */}
          <div className="space-y-10 lg:col-span-4 lg:col-start-9">
            <Reveal>
              <h2 className="eyebrow">
                Horaires <PendingBadge fact={practice.openingHours} />
              </h2>
              {hasValue(practice.openingHours) ? (
                <dl className="mt-4 border-t border-ink/10">
                  {practice.openingHours.value.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4 border-b border-ink/10 py-3">
                      <dt className="text-ink-soft">{h.days}</dt>
                      <dd>{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </Reveal>
            <Reveal>
              <h2 className="eyebrow">Tarifs</h2>
              {hasValue(practice.fees) ? (
                <dl className="mt-4 border-t border-ink/10">
                  {practice.fees.value.map((f) => (
                    <div key={f.label} className="flex justify-between gap-4 border-b border-ink/10 py-3">
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
            </Reveal>
            {address ? (
              <Reveal>
                <h2 className="eyebrow">Adresse</h2>
                <p className="mt-3 text-[1.05rem]">{formatAddress(address)}</p>
                <p className="mt-1 text-sm text-ink-soft">{address.hint}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  <a href={directionLinks(address).google} target="_blank" rel="noopener noreferrer" className="link-more text-ink">
                    Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
                  </a>
                  <Link href="/contact" className="link-line text-ink-soft hover:text-ink">
                    Plan et accès
                  </Link>
                </div>
              </Reveal>
            ) : null}
            <Reveal>
              <h2 className="eyebrow">Empêchement</h2>
              <p className="mt-3 text-ink-soft">En cas d&apos;empêchement, prévenez le cabinet le plus tôt possible afin de libérer le créneau.</p>
            </Reveal>
            {reviewMode ? (
              <div className="rounded-md border border-dashed border-review/50 bg-review-bg/70 p-4 text-sm text-review">
                <p className="mb-2 font-semibold">Note de relecture — réservation</p>
                <p>
                  Dès qu&apos;une plateforme de réservation est confirmée, son lien remplace automatiquement l&apos;appel dans tous les boutons
                  « Prendre rendez-vous ».
                </p>
                <p className="mt-2">{practice.onlineBookingUrl.ask}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
