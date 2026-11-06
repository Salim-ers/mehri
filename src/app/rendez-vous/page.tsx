import Link from "next/link";
import { bookingAction, BookingButton } from "@/components/shared/BookingButton";
import { PhoneIcon } from "@/components/shared/Icons";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { identity, practice, reviewMode } from "@/content/practice";
import { formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Prendre rendez-vous — ostéopathe à Creil",
  description: `Prendre rendez-vous avec ${identity.name}, ${identity.title} à ${identity.city} : modalités, horaires et informations pratiques.`,
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
      <PlateHeader plate="VII" latin="Tempus constitutum" title={<Lines lines={["Prendre", <><em>rendez-vous.</em></>]} />} />

      <section aria-labelledby="reserver" className="px-[var(--gutter)] pb-24 md:pb-32">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-12">
          {/* Action principale : unique, immédiate */}
          <div className="on-dark grain relative col-span-12 overflow-hidden rounded-2xl bg-umber p-8 text-bone md:p-14 lg:col-span-7">
            <p className="caption-mono text-bronze-light">{online ? "Réservation en ligne" : "Par téléphone"}</p>
            <h2 id="reserver" className="display mt-5 max-w-xl text-[clamp(2rem,1.3rem+2.6vw,3.8rem)]">
              {online ? "Choisissez votre créneau en ligne." : "Un appel suffit pour réserver votre consultation."}
            </h2>
            {!online && phone ? (
              <a
                href={telHref(phone.e164)}
                className="display mt-10 flex items-center gap-4 text-[clamp(2.4rem,1.4rem+4vw,5rem)] leading-none text-bronze-light transition-colors hover:text-bone"
              >
                <PhoneIcon className="h-9 w-9 shrink-0 md:h-12 md:w-12" />
                <span>{phone.display}</span>
              </a>
            ) : null}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <BookingButton mode="direct" variant="light" />
              <PendingBadge fact={practice.phone} />
            </div>
            <p className="mt-8 max-w-lg text-sm text-bone/70">
              {online
                ? "Vous serez redirigé vers la plateforme de réservation du cabinet."
                : "Aucun créneau n'est affiché ici tant qu'un agenda en ligne n'a pas été mis en place par le cabinet."}
            </p>
            <SpineDrawing className="pointer-events-none absolute -bottom-10 right-4 hidden h-[115%] w-auto text-bone/[0.07] md:block" />
          </div>

          {/* Informations utiles */}
          <div className="col-span-12 space-y-10 lg:col-span-4 lg:col-start-9">
            <Reveal>
              <p className="caption-mono text-bronze-ink">
                Horaires <PendingBadge fact={practice.openingHours} />
              </p>
              {hasValue(practice.openingHours) ? (
                <ul className="mt-3 space-y-1">
                  {practice.openingHours.value.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4 border-b border-umber/12 py-2">
                      <span>{h.days}</span>
                      <span className="text-ink-soft">{h.hours}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
            <Reveal>
              <p className="caption-mono text-bronze-ink">Tarifs</p>
              {hasValue(practice.fees) ? (
                <ul className="mt-3">
                  {practice.fees.value.map((f) => (
                    <li key={f.label} className="flex justify-between gap-4 border-b border-umber/12 py-2">
                      <span>{f.label}</span>
                      <span>{f.price}</span>
                    </li>
                  ))}
                </ul>
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
                <p className="caption-mono text-bronze-ink">Adresse</p>
                <p className="mt-3">{formatAddress(address)}</p>
                <Link href="/contact" className="link-atlas mt-2 inline-block text-umber">
                  Plan et itinéraire
                </Link>
              </Reveal>
            ) : null}
            <Reveal>
              <p className="caption-mono text-bronze-ink">Empêchement</p>
              <p className="mt-3 text-ink-soft">En cas d&apos;empêchement, prévenez le cabinet le plus tôt possible afin de libérer le créneau.</p>
            </Reveal>
            {reviewMode ? (
              <div className="rounded-md border border-dashed border-review/50 bg-review-bg/70 p-4 text-sm text-review">
                <p className="caption-mono mb-2">Note de relecture — réservation</p>
                <p>
                  Fiche Crenolibre identifiée (même numéro de téléphone) mais sans agenda actif ni créneau publié au 06/11/2026 : elle n&apos;est pas
                  utilisée comme parcours de réservation. Dès qu&apos;une plateforme est confirmée, son lien remplacera automatiquement l&apos;appel
                  dans tous les boutons « Prendre rendez-vous ».
                </p>
                {hasValue(practice.directoryListingUrl) ? (
                  <a href={practice.directoryListingUrl.value} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline">
                    Voir la fiche Crenolibre
                  </a>
                ) : null}
                <p className="mt-2">{practice.onlineBookingUrl.ask}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
