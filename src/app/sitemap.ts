import type { MetadataRoute } from "next";
import { motifs } from "@/content/motifs";
import { siteUrl } from "@/content/practice";
import { navigation, secondaryPages } from "@/content/site";

const LAST_MODIFIED = new Date("2026-11-07");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...navigation, ...secondaryPages].map((n) => ({
    url: `${siteUrl}${n.href === "/" ? "" : n.href}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: n.href === "/" ? 1 : n.href === "/rendez-vous" || n.href === "/contact" ? 0.9 : 0.7,
  }));
  const fiches = motifs.map((m) => ({
    url: `${siteUrl}/motifs-de-consultation/${m.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const legal = ["/mentions-legales", "/confidentialite"].map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));
  return [...pages, ...fiches, ...legal];
}
