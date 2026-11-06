import Link from "next/link";
import { PhoneIcon, RouteIcon } from "@/components/shared/Icons";
import { Lines, PlateHeader } from "@/components/shared/PlateHeader";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import { identity, practice } from "@/content/practice";
import { MapEmbed } from "@/features/contact/MapEmbed";
import { directionLinks, formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact et accès — cabinet d'ostéopathie à Creil",
  description:
    `Adresse, téléphone, itinéraire et informations pratiques du cabinet d'ostéopathie de ${identity.name} à ${identity.city} (60100).`,
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
      <PlateHeader plate="VIII" latin="Via et aditus" title={<Lines lines={["Contact", <>& <em>accès.</em></>]} />} />

      <section className="px-[var(--gutter)] pb-24 md:pb-32">
        <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 space-y-12 lg:col-span-5">
            {address ? (
              <Reveal>
                <p className="caption-mono text-bronze-ink">
                  Adresse <PendingBadge fact={practice.address} />
                </p>
                <address className="display mt-4 text-[clamp(1.8rem,1.2rem+2vw,3rem)] not-italic leading-tight text-umber">
                  {address.street}
                  <br />
                  {address.postalCode} {address.locality}
                </address>
                <p className="mt-3 text-ink-soft">{address.hint}</p>
                {links ? (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    <li>
                      <a href={links.google} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        <RouteIcon /> Itinéraire Google Maps<span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </li>
                    <li>
                      <a href={links.apple} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-umber">
                        Plans (Apple)<span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </li>
                    <li>
                      <a href={links.waze} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-umber">
                        Waze<span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </li>
                  </ul>
                ) : null}
              </Reveal>
            ) : null}

            {phone ? (
              <Reveal>
                <p className="caption-mono text-bronze-ink">
                  Téléphone <PendingBadge fact={practice.phone} />
                </p>
                <a href={telHref(phone.e164)} className="display mt-4 inline-flex items-center gap-4 text-[clamp(2rem,1.3rem+2.4vw,3.4rem)] text-umber hover:text-bronze-ink">
                  <PhoneIcon className="h-7 w-7" /> {phone.display}
                </a>
              </Reveal>
            ) : null}

            <Reveal>
              <p className="caption-mono text-bronze-ink">E-mail</p>
              {hasValue(practice.email) ? (
                <a href={`mailto:${practice.email.value}`} className="link-atlas mt-3 inline-block text-lg text-umber">
                  {practice.email.value}
                </a>
              ) : (
                <div className="mt-3">
                  <MissingSlot fact={practice.email}>
                    <p className="text-ink-soft">Pour toute demande, le plus simple est d&apos;appeler le cabinet.</p>
                  </MissingSlot>
                </div>
              )}
            </Reveal>

            <Reveal>
              <p className="caption-mono text-bronze-ink">
                Horaires <PendingBadge fact={practice.openingHours} />
              </p>
              {hasValue(practice.openingHours) ? (
                <dl className="mt-4 divide-y divide-umber/12 border-y border-umber/12">
                  {practice.openingHours.value.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4 py-3">
                      <dt>{h.days}</dt>
                      <dd className="text-ink-soft">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </Reveal>

            {hasValue(practice.accessibility) ? (
              <Reveal>
                <p className="caption-mono text-bronze-ink">
                  Accessibilité <PendingBadge fact={practice.accessibility} />
                </p>
                <p className="mt-3 text-ink">{practice.accessibility.value}.</p>
              </Reveal>
            ) : null}
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            {address && links ? (
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                <MapEmbed src={links.embed} title={`Plan d'accès : ${formatAddress(address)}`} address={formatAddress(address)} />
                <p className="mt-4 text-sm text-ink-soft">
                  Besoin d&apos;un rendez-vous ?{" "}
                  <Link href="/rendez-vous" className="link-atlas text-umber">
                    Voir les modalités
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
