import type { Metadata } from "next";
import { practice, siteUrl } from "@/content/practice";
import { formatAddress } from "@/lib/contact-links";
import { hasValue } from "@/lib/facts";

export const SITE_NAME = "Mohamed Merhi — Ostéopathe D.O. à Creil";

interface PageMetaInput {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly image?: string;
}

/** Métadonnées uniques par page : title, description, canonical, Open Graph. */
export function pageMetadata({ title, description, path, image }: PageMetaInput): Metadata {
  const url = `${siteUrl}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: SITE_NAME,
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

type JsonLd = Record<string, unknown>;

/**
 * Données structurées du cabinet. Seules les informations disponibles sont
 * publiées ; les champs inconnus (géolocalisation, tarifs…) sont omis plutôt
 * qu'inventés.
 */
export function practiceJsonLd(): JsonLd {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    "@id": `${siteUrl}/#cabinet`,
    name: SITE_NAME,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image.jpg`,
    logo: `${siteUrl}/images/logo-mohamed-merhi-transparent.png`,
    medicalSpecialty: "Osteopathic",
    areaServed: { "@type": "City", name: "Creil" },
    founder: { "@id": `${siteUrl}/#praticien` },
  };
  if (hasValue(practice.address)) {
    const a = practice.address.value;
    data.address = {
      "@type": "PostalAddress",
      streetAddress: a.street,
      postalCode: a.postalCode,
      addressLocality: a.locality,
      addressRegion: "Hauts-de-France",
      addressCountry: "FR",
    };
    data.hasMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(a))}`;
  }
  if (hasValue(practice.phone)) data.telephone = practice.phone.value.e164;
  if (hasValue(practice.openingHours) && practice.openingHours.status === "confirmed") {
    data.openingHours = practice.openingHours.value.map((s) => `${s.days} ${s.hours}`);
  }
  return data;
}

export function practitionerJsonLd(): JsonLd {
  const name = hasValue(practice.practitionerName) ? practice.practitionerName.value : "Mohamed Merhi";
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#praticien`,
    name,
    jobTitle: hasValue(practice.title) ? practice.title.value : "Ostéopathe",
    worksFor: { "@id": `${siteUrl}/#cabinet` },
    image: `${siteUrl}/images/praticien-portrait.jpg`,
    url: `${siteUrl}/osteopathe`,
    ...(hasValue(practice.phone) ? { telephone: practice.phone.value.e164 } : {}),
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function faqJsonLd(entries: readonly { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}

/** Sérialisation sûre pour <script type="application/ld+json"> (échappe « < »). */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

