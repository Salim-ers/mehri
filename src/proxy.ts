import { NextResponse, type NextRequest } from "next/server";
import { motifs } from "@/content/motifs";

const KNOWN = new Set(motifs.map((m) => m.slug));

/**
 * Les fiches motifs sont prérendues : une URL inconnue doit répondre 404
 * (et non une « soft 404 » en 200 due au rendu en flux), pour le SEO.
 */
export function proxy(request: NextRequest) {
  const raw = request.nextUrl.pathname.split("/")[2] ?? "";
  let slug = "";
  try {
    slug = decodeURIComponent(raw);
  } catch {
    // encodage invalide : traité comme une fiche inconnue (404, pas 500)
  }
  if (!KNOWN.has(slug)) {
    return NextResponse.rewrite(new URL("/__fiche-introuvable", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/motifs-de-consultation/:slug",
};
