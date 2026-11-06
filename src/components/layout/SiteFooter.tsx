import Image from "next/image";
import Link from "next/link";
import { BookingButton } from "@/components/shared/BookingButton";
import { identity, practice } from "@/content/practice";
import { navigation, secondaryPages } from "@/content/site";
import { telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";

export function SiteFooter() {
  const address = hasValue(practice.address) ? practice.address.value : null;
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const hours = hasValue(practice.openingHours) ? practice.openingHours.value : [];
  return (
    <footer className="on-dark grain relative overflow-hidden bg-anthracite text-bone">
      <div className="wrap px-[var(--gutter)] pb-10 pt-20 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="display max-w-2xl text-[clamp(2.4rem,1.5rem+3.4vw,5rem)]">
              Prendre le temps <em>de comprendre.</em>
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <BookingButton variant="light" size="lg" />
              {phone ? (
                <a href={telHref(phone.e164)} className="display text-3xl text-bone transition-colors hover:text-bronze-light">
                  {phone.display}
                </a>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 text-[0.95rem]">
            {address ? (
              <div>
                <p className="eyebrow">Cabinet</p>
                <address className="mt-3 not-italic leading-relaxed text-bone/85">
                  {address.street}
                  <br />
                  {address.postalCode} {address.locality}
                </address>
                <Link href="/contact" className="link-line mt-3 inline-block text-sm text-bone/80 hover:text-bone">
                  Plan et accès
                </Link>
              </div>
            ) : null}
            {hours.length ? (
              <div>
                <p className="eyebrow">Horaires</p>
                <dl className="mt-3 space-y-1 leading-relaxed text-bone/85">
                  {hours.map((h) => (
                    <div key={h.days}>
                      <dt>{h.days}</dt>
                      <dd className="text-bone/65">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-16 grid gap-10 border-t border-bone/10 pt-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr]">
          <nav aria-label="Plan du site">
            <ul className="space-y-2 text-bone/80">
              {navigation.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-bone">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Informations">
            <ul className="space-y-2 text-bone/80">
              {secondaryPages.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-bone">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-[0.9rem] leading-relaxed text-bone/70">
            <strong className="font-semibold text-bone">L&apos;ostéopathie ne se substitue pas à un avis médical.</strong> L&apos;ostéopathe
            intervient dans le cadre des troubles fonctionnels et oriente vers un médecin lorsque les symptômes le nécessitent. En cas
            d&apos;urgence, appelez le{" "}
            <a className="link-line text-bone" href="tel:15">
              15
            </a>{" "}
            ou le{" "}
            <a className="link-line text-bone" href="tel:112">
              112
            </a>
            .
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-bone/10 pt-6 text-[0.82rem] text-bone/60 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3">
            <Image src="/images/monogramme-clair.png" alt="" width={40} height={39} className="h-7 w-auto opacity-80" />
            © 2026 {identity.name} — {identity.title}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/mentions-legales" className="hover:text-bone">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-bone">
                Confidentialité
              </Link>
            </li>
            <li>Site conçu par QuadCore</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
