"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, PhoneIcon, RouteIcon } from "@/components/shared/Icons";

interface MobileActionBarProps {
  readonly phoneHref: string | null;
  readonly directionsHref: string | null;
}

/**
 * Barre d'action mobile (< 1024 px) : Prendre RDV · Appeler · Itinéraire.
 * Le corps de page réserve sa hauteur (padding-bottom) : elle ne masque aucun
 * contenu ; elle respecte la zone de sécurité des smartphones.
 */
export function MobileActionBar({ phoneHref, directionsHref }: MobileActionBarProps) {
  const pathname = usePathname();
  const onBooking = pathname.startsWith("/rendez-vous");
  const item =
    "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[0.72rem] font-medium tracking-wide transition-colors active:bg-bone/10";
  return (
    <nav
      aria-label="Actions rapides"
      className="mobile-actionbar fixed inset-x-0 bottom-0 z-40 border-t border-bone/10 bg-umber/96 px-2 pt-1.5 text-bone backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-1">
        {!onBooking ? (
          <li className="flex flex-1">
            <Link href="/rendez-vous" className={`${item} bg-bone/8 text-bronze-light`}>
              <CalendarIcon className="h-5 w-5" />
              Prendre RDV
            </Link>
          </li>
        ) : null}
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
