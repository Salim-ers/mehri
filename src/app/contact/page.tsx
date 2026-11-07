import { BookingButton } from "@/components/shared/BookingButton";
import { PhoneIcon, RouteIcon } from "@/components/shared/Icons";
import { Lines, PageIntro } from "@/components/shared/PageIntro";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { identity, practice } from "@/content/practice";
import { MapEmbed } from "@/features/contact/MapEmbed";
import { directionLinks, formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact et accès — cabinet d'ostéopathie à Creil",
  description: `Adresse, téléphone, itinéraire et informations pratiques du cabinet d'ostéopathie de ${identity.name} à ${identity.city} (60100).`,
  path: "/contact",
});

export default function ContactPage() {
  const address = hasValue(practice.address) ? practice.address.value : null;
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const links = address ? directionLinks(address) : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Contact et accès", path: "/contact" }])) }}
      />
      <PageIntro eyebrow="Contact et accès" title={<Lines lines={["Venir", <>au <em>cabinet.</em></>]} />} />

      <section className="px-[var(--gutter)] pb-24 md:pb-32">
        <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="space-y-12 lg:col-span-5">
            {address ? (
              <Reveal>
                <h2 className="eyebrow">
                  Adresse <PendingBadge fact={practice.address} />
                </h2>
                <address className="display mt-4 text-[clamp(2rem,1.3rem+2.2vw,3.2rem)] not-italic leading-tight">
                  {address.street}
                  <br />
                  {address.postalCode} {address.locality}
                </address>
                <p className="mt-3 text-ink-soft">{address.hint}</p>
                {links ? (
                  <ul className="mt-7 flex flex-wrap gap-2">
                    <li>
                      <a href={links.google} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        <RouteIcon /> Itinéraire Google Maps<span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </li>
                    <li>
                      <a href={links.apple} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                        Plans (Apple)<span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </li>
                    <li>
                      <a href={links.waze} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                        Waze<span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </li>
                  </ul>
                ) : null}
              </Reveal>
            ) : null}

            {phone ? (
              <Reveal>
                <h2 className="eyebrow">
                  Téléphone <PendingBadge fact={practice.phone} />
                </h2>
                <a href={telHref(phone.e164)} className="display mt-4 inline-flex items-center gap-4 text-[clamp(2rem,1.3rem+2.4vw,3.4rem)] hover:text-bronze-ink">
                  <PhoneIcon className="h-7 w-7 text-bronze-ink" /> {phone.display}
                </a>
                <div className="mt-6">
                  <BookingButton />
                </div>
              </Reveal>
            ) : null}

            {hasValue(practice.email) ? (
              <Reveal>
                <h2 className="eyebrow">E-mail</h2>
                <a href={`mailto:${practice.email.value}`} className="link-more mt-3 text-lg">
                  {practice.email.value}
                </a>
              </Reveal>
            ) : (
              <MissingSlot fact={practice.email} />
            )}

            <Reveal>
              <h2 className="eyebrow">
                Horaires <PendingBadge fact={practice.openingHours} />
              </h2>
              {hasValue(practice.openingHours) ? (
                <dl className="mt-4 border-t border-ink/10">
                  {practice.openingHours.value.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4 border-b border-ink/10 py-3">
                      <dt>{h.days}</dt>
                      <dd className="text-ink-soft">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </Reveal>

            {hasValue(practice.accessibility) ? (
              <Reveal>
                <h2 className="eyebrow">
                  Accessibilité <PendingBadge fact={practice.accessibility} />
                </h2>
                <p className="mt-3">{practice.accessibility.value}.</p>
              </Reveal>
            ) : null}
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {address && links ? (
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                <MapEmbed src={links.embed} title={`Plan d'accès : ${formatAddress(address)}`} address={formatAddress(address)} />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
