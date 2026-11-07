"use client";

import Link from "next/link";
import { CalendarIcon, PhoneIcon, RouteIcon } from "@/components/shared/Icons";

interface MobileActionBarProps {
  readonly phoneHref: string | null;
  readonly directionsHref: string | null;
}

/**
 * Barre d'action mobile (< 1024 px) : Rendez-vous · Appeler · Itinéraire.
 * Le corps de page réserve sa hauteur (padding-bottom) : elle ne masque aucun
 * contenu ; elle respecte la zone de sécurité des smartphones.
 */
export function MobileActionBar({ phoneHref, directionsHref }: MobileActionBarProps) {
  const item =
    "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[0.72rem] font-semibold tracking-wide transition-colors active:bg-bone/10";
  return (
    <nav
      aria-label="Actions rapides"
      className="mobile-actionbar mobile-bar lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-1 rounded-full bg-graphite p-1.5 text-bone shadow-lift">
        <li className="flex flex-[1.3]">
          <Link href="/rendez-vous" data-booking className={`${item} bg-paper text-ink active:bg-bone`}>
            <CalendarIcon className="h-5 w-5" />
            Prendre RDV
          </Link>
        </li>
        {phoneHref ? (
          <li className="flex flex-1">
            <a href={phoneHref} className={item}>
              <PhoneIcon className="h-5 w-5" />
              Appeler
            </a>
          </li>
        ) : null}
        {directionsHref ? (
          <li className="flex flex-1">
            <a href={directionsHref} className={item} target="_blank" rel="noopener noreferrer">
              <RouteIcon className="h-5 w-5" />
              Itinéraire
              <span className="sr-only"> (Google Maps, nouvel onglet)</span>
            </a>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
