import Link from "next/link";
import { practice } from "@/content/practice";
import { resolveBookingAction } from "@/lib/contact-links";

interface BookingButtonProps {
  readonly variant?: "primary" | "light" | "ghost";
  readonly className?: string;
  /** libellé court (« Prendre rendez-vous ») ou action explicite (« Appeler le… ») */
  readonly mode?: "page" | "direct";
  readonly label?: string;
}

export const bookingAction = resolveBookingAction(practice.onlineBookingUrl, practice.phone);

/**
 * Appel à l'action de réservation.
 * mode « page » : mène à la page Rendez-vous (explications + action).
 * mode « direct » : déclenche directement l'action réelle (lien en ligne ou appel).
 */
export function BookingButton({ variant = "primary", className = "", mode = "page", label }: BookingButtonProps) {
  const cls = `btn btn-${variant} ${className}`;
  if (mode === "page") {
    return (
      <Link href="/rendez-vous" className={cls}>
        {label ?? "Prendre rendez-vous"}
        <span className="btn-arrow" aria-hidden="true">→</span>
      </Link>
    );
  }
  const action = bookingAction;
  if (action.kind === "online") {
    return (
      <a href={action.href} className={cls} target="_blank" rel="noopener noreferrer">
        {label ?? action.label}
        <span className="sr-only"> (nouvel onglet)</span>
        <span className="btn-arrow" aria-hidden="true">↗</span>
      </a>
    );
  }
  if (action.kind === "phone") {
    return (
      <a href={action.href} className={cls}>
        <PhoneIcon />
        {label ?? action.label}
      </a>
    );
  }
  return (
    <Link href={action.href} className={cls}>
      {label ?? action.label}
    </Link>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 3.5h3.2l1.6 4.3-2.1 1.4a12 12 0 0 0 7.1 7.1l1.4-2.1 4.3 1.6V19a1.5 1.5 0 0 1-1.6 1.5C10.2 20 4 13.8 3.5 5.1A1.5 1.5 0 0 1 5 3.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function RouteIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 1 1 13 0c0 4.9-6.5 11-6.5 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
