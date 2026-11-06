import Image from "next/image";
import Link from "next/link";
import { PendingBadge } from "@/components/shared/Pending";
import { practice } from "@/content/practice";
import { navigation } from "@/content/site";
import { formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";

export function SiteFooter() {
  const address = hasValue(practice.address) ? practice.address.value : null;
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  return (
    <footer className="on-dark grain relative overflow-hidden bg-umber text-bone">
      <div className="mx-auto max-w-[110rem] px-[var(--gutter)] pb-10 pt-20 md:pt-28">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <Image src="/images/monogramme-clair.png" alt="" width={86} height={84} className="w-16" />
            <p className="display mt-8 max-w-xl text-[clamp(2.2rem,1.4rem+3vw,4.4rem)]">
              Le corps est fait pour <em>bouger</em>.
            </p>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
            <div>
              <p className="caption-mono text-bronze-light">Cabinet</p>
              {address ? (
                <address className="mt-3 not-italic leading-relaxed text-bone/85">
                  {address.street}
                  <br />
                  {address.postalCode} {address.locality}
                  <br />
                  <PendingBadge fact={practice.address} className="mt-2" />
                </address>
              ) : null}
            </div>
            <div>
              <p className="caption-mono text-bronze-light">Contact</p>
              {phone ? (
                <a href={telHref(phone.e164)} className="link-atlas mt-3 inline-block text-bone">
                  {phone.display}
                </a>
              ) : null}
              <p className="mt-3">
                <Link href="/rendez-vous" className="link-atlas text-bone">
                  Prendre rendez-vous
                </Link>
              </p>
            </div>
            <nav aria-label="Plan du site" className="col-span-2 sm:col-span-1">
              <p className="caption-mono text-bronze-light">Planches</p>
              <ul className="mt-3 space-y-1.5 text-[0.92rem] text-bone/80">
                {navigation.slice(1).map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="hover:text-bronze-light">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 rounded-lg border border-bone/12 p-5 text-[0.88rem] leading-relaxed text-bone/75 md:mt-24">
          <p>
            <strong className="font-semibold text-bone">L&apos;ostéopathie ne se substitue pas à un avis médical.</strong> L&apos;ostéopathe
            intervient dans le cadre des troubles fonctionnels et oriente vers un médecin lorsque les symptômes nécessitent un
            diagnostic ou un traitement médical. En cas d&apos;urgence, appelez le <a className="link-atlas text-bone" href="tel:15">15</a> (SAMU) ou le{" "}
            <a className="link-atlas text-bone" href="tel:112">112</a>.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-bone/10 pt-6 text-[0.8rem] text-bone/60 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 {hasValue(practice.practitionerName) ? practice.practitionerName.value : "Cabinet"} — Ostéopathe D.O.
            {address ? ` · ${formatAddress(address)}` : ""}
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
            <li>
              <span>Site conçu par QuadCore</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
