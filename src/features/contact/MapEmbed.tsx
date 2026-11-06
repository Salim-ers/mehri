"use client";

import { useState } from "react";

/**
 * Plan Google Maps chargé uniquement à la demande (aucun cookie tiers avant
 * l'action explicite du visiteur — RGPD / ePrivacy).
 */
export function MapEmbed({ src, title, address }: { src: string; title: string; address: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-umber/12 bg-stone/40 sm:aspect-[16/11]">
      {loaded ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full border-0 grayscale-[0.35] sepia-[0.15]"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allowFullScreen
        />
      ) : (
        <div className="hero-grid-static absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <svg viewBox="0 0 48 48" className="h-12 w-12 text-bronze-ink" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <circle cx="24" cy="24" r="20" />
            <path d="M24 6v6M24 36v6M6 24h6M36 24h6" />
            <path d="M24 14l4 10-4 10-4-10z" fill="currentColor" fillOpacity="0.25" />
          </svg>
          <p className="display text-2xl text-umber">{address}</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Le plan interactif est fourni par Google Maps. Son affichage peut déposer des cookies de Google.
          </p>
          <button type="button" onClick={() => setLoaded(true)} className="btn btn-primary">
            Afficher le plan
          </button>
        </div>
      )}
    </div>
  );
}
