import Link from "next/link";
import { practice } from "@/content/practice";
import { resolveBookingAction } from "@/lib/contact-links";
import { PhoneIcon } from "./Icons";

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
