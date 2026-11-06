import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 * - 'unsafe-inline' for scripts is required by Next.js inline bootstrap scripts on
 *   statically generated pages (a nonce would force dynamic rendering of every page).
 *   Documented trade-off: see ARCHITECTURE.md › Sécurité.
 * - Google Maps is only loaded after an explicit click (privacy), hence frame-src.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' uniquement en développement (outils de débogage React)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos du cabinet : 941 px de large ; imagerie anatomique : 2400 px maximum.
    // L'optimiseur n'agrandit jamais une source (aucune variante plus large que l'original).
    deviceSizes: [360, 480, 640, 750, 828, 941, 1200, 1600, 2048, 2400],
    imageSizes: [96, 160, 240, 320],
    qualities: [70, 75, 80, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
