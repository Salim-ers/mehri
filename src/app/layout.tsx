import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import { BookingDialog, type BookingInfo } from "@/components/layout/BookingDialog";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { bookingAction } from "@/components/shared/BookingButton";
import { identity, practice, siteUrl } from "@/content/practice";
import { directionLinks, formatAddress, telHref } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";
import { isIndexable, practiceJsonLd, practitionerJsonLd, serializeJsonLd, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const newsreader = localFont({
  src: [
    // sous-ensemble latin, axe optique figé à 40, graisses 340–440 (romain) / 320–400 (italique)
    { path: "../fonts/newsreader-normal.woff2", style: "normal", weight: "340 440" },
    { path: "../fonts/newsreader-italic.woff2", style: "italic", weight: "320 400" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
const instrument = localFont({
  src: [{ path: "../fonts/instrument-sans-latin-wght-normal.woff2", style: "normal", weight: "400 700" }],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: SITE_NAME, template: `%s · ${identity.name}, ostéopathe à ${identity.city}` },
  description: `Cabinet d'ostéopathie de ${identity.name}, ${identity.title} à ${identity.city} (60100) : consultations, motifs de consultation, déroulement d'une séance et prise de rendez-vous.`,
  applicationName: `${identity.name} — ${identity.title}`,
  formatDetection: { telephone: false },
  // préproductions : noindex (cohérent avec robots.txt)
  robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#F3F0EA",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Exécuté avant le premier rendu : active les animations progressives (le contenu reste visible sans JavaScript). */
const bootScript = `document.documentElement.classList.add('js');`;

function bookingInfo(): BookingInfo {
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const address = hasValue(practice.address) ? practice.address.value : null;
  return {
    phoneDisplay: phone?.display ?? null,
    phoneHref: phone ? telHref(phone.e164) : null,
    online: bookingAction.kind === "online" ? { href: bookingAction.href, label: bookingAction.label } : null,
    hours: hasValue(practice.openingHours) ? practice.openingHours.value : [],
    addressLine: address ? formatAddress(address) : null,
    addressHint: address?.hint ?? null,
    directionsHref: address ? directionLinks(address).google : null,
    feesNote: hasValue(practice.fees) ? null : "Les tarifs vous sont communiqués lors de la prise de rendez-vous.",
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const phone = hasValue(practice.phone) ? practice.phone.value : null;
  const address = hasValue(practice.address) ? practice.address.value : null;
  return (
    <html lang="fr" className={`${newsreader.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([practiceJsonLd(), practitionerJsonLd()]) }} />
      </head>
      <body>
        <SiteHeader
          name={identity.name}
          title={identity.title}
          city={identity.city}
          phoneDisplay={phone?.display ?? null}
          phoneHref={phone ? telHref(phone.e164) : null}
          addressLine={address ? formatAddress(address) : null}
        />
        <ViewTransition default="site-page">
          <main id="contenu" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </ViewTransition>
        <SiteFooter />
        <MobileActionBar phoneHref={phone ? telHref(phone.e164) : null} directionsHref={address ? directionLinks(address).google : null} />
        <BookingDialog info={bookingInfo()} />
      </body>
    </html>
  );
}
