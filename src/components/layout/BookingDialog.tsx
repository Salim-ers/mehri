"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ClockIcon, CloseIcon, PhoneIcon, RouteIcon } from "@/components/shared/Icons";

export interface BookingInfo {
  readonly phoneDisplay: string | null;
  readonly phoneHref: string | null;
  readonly online: { readonly href: string; readonly label: string } | null;
  readonly hours: readonly { readonly days: string; readonly hours: string }[];
  readonly addressLine: string | null;
  readonly addressHint: string | null;
  readonly directionsHref: string | null;
  /** phrase sur les tarifs (jamais de montant non validé) */
  readonly feesNote: string | null;
}

/**
 * Panneau « Prendre rendez-vous », disponible depuis toutes les pages.
 * Amélioration progressive : chaque bouton de réservation est un lien vers
 * /rendez-vous (fonctionne sans JavaScript) ; avec JavaScript, un clic sur un
 * lien `[data-booking]` ouvre ce panneau. Seules des données réelles y figurent :
 * aucun créneau n'est simulé.
 */
export function BookingDialog({ info }: { info: BookingInfo }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>("a[data-booking]") : null;
      const d = dialog.current;
      if (!target || !d) return;
      e.preventDefault();
      opener.current = target;
      if (!d.open) d.showModal();
    };
    const d = dialog.current;
    const onClose = () => opener.current?.focus();
    document.addEventListener("click", onClick, true);
    d?.addEventListener("close", onClose);
    return () => {
      document.removeEventListener("click", onClick, true);
      d?.removeEventListener("close", onClose);
    };
  }, []);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      aria-labelledby="booking-title"
      onClick={(e) => {
        // clic sur le voile : fermeture
        if (e.target === e.currentTarget) close();
      }}
      className="booking-sheet text-ink"
    >
      <div className="booking-sheet__card h-full max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain rounded-panel bg-paper px-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-6 shadow-lift md:p-9">
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow pt-3">Rendez-vous</p>
          <button type="button" onClick={close} aria-label="Fermer" className="icon-btn bg-sand hover:bg-clay">
            <CloseIcon />
          </button>
        </div>
        <h2 id="booking-title" className="display mt-4 text-[2.4rem] md:text-[2.8rem]">
          Prendre <em>rendez-vous</em>
        </h2>

        {info.online ? (
          <>
            <p className="prose-body mt-4">La réservation s&apos;effectue sur la plateforme en ligne du cabinet.</p>
            <a href={info.online.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg mt-7 w-full">
              {info.online.label}
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </>
        ) : null}

        {info.phoneHref && info.phoneDisplay ? (
          <div className={info.online ? "mt-8 border-t border-clay pt-6" : "mt-5"}>
            <p className="prose-body">
              {info.online ? "Vous pouvez aussi appeler le cabinet :" : "Les rendez-vous se prennent par téléphone, directement auprès du cabinet."}
            </p>
            <a href={info.phoneHref} className="display mt-6 block text-[2.6rem] leading-none tracking-[-0.01em] text-ink hover:text-bronze-ink md:text-[3rem]">
              {info.phoneDisplay}
            </a>
            {!info.online ? (
              <a href={info.phoneHref} className="btn btn-primary btn-lg mt-7 w-full">
                <PhoneIcon /> Appeler le {info.phoneDisplay}
              </a>
            ) : null}
          </div>
        ) : null}

        {info.hours.length ? (
          <div className="mt-8 border-t border-clay pt-6">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <ClockIcon className="h-4 w-4 text-bronze-ink" /> Horaires
            </p>
            <dl className="mt-3 space-y-1.5 text-[0.95rem]">
              {info.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt className="text-ink-soft">{h.days}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {info.addressLine ? (
          <div className="mt-6 border-t border-clay pt-6">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <RouteIcon className="h-4 w-4 text-bronze-ink" /> Cabinet
            </p>
            <p className="mt-2 text-[0.95rem]">{info.addressLine}</p>
            {info.addressHint ? <p className="mt-1 text-sm text-ink-soft">{info.addressHint}</p> : null}
            {info.directionsHref ? (
              <a href={info.directionsHref} target="_blank" rel="noopener noreferrer" className="link-more mt-3 inline-block text-sm font-medium">
                Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
              </a>
            ) : null}
          </div>
        ) : null}

        {info.feesNote ? <p className="mt-6 text-sm text-ink-soft">{info.feesNote}</p> : null}

        <p className="mt-6 text-sm">
          <Link href="/rendez-vous" onClick={close} className="link-more text-ink-soft hover:text-ink">
            Toutes les informations pratiques
          </Link>
        </p>
      </div>
    </dialog>
  );
}
