import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/practice";
import { isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Les environnements de préproduction ne doivent pas être indexés.
  const isProduction = isIndexable();
  return {
    rules: isProduction ? [{ userAgent: "*", allow: "/" }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  };
}
