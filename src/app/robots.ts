import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/practice";

export default function robots(): MetadataRoute.Robots {
  // Les environnements de préproduction ne doivent pas être indexés.
  const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.ALLOW_INDEXING === "true";
  return {
    rules: isProduction ? [{ userAgent: "*", allow: "/" }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
