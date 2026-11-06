import Link from "next/link";
import { practice } from "@/content/practice";
import { resolveBookingAction } from "@/lib/contact-links";
import { PhoneIcon } from "./Icons";

interface BookingButtonProps {
  readonly variant?: "primary" | "light" | "ghost";
  readonly size?: "md" | "lg";
  readonly className?: string;
  /**
   * « sheet » : lien vers /rendez-vous qui ouvre le panneau de réservation (avec JavaScript) ;
   * « direct » : déclenche directement l'action réelle (lien en ligne ou appel).
   */
  readonly mode?: "sheet" | "direct";
  readonly label?: string;
}

export const bookingAction = resolveBookingAction(practice.onlineBookingUrl, practice.phone);

/** Appel à l'action de réservation — toujours une action réelle, jamais un faux créneau. */
export function BookingButton({ variant = "primary", size = "md", className = "", mode = "sheet", label }: BookingButtonProps) {
  const cls = `btn btn-${variant} ${size === "lg" ? "btn-lg" : ""} ${className}`;
  const action = bookingAction;
  if (mode === "sheet" && action.kind !== "online") {
    return (
      <Link href="/rendez-vous" data-booking className={cls}>
        {label ?? "Prendre rendez-vous"}
        <span className="btn-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    );
  }
  if (action.kind === "online") {
    return (
      <a href={action.href} className={cls} target="_blank" rel="noopener noreferrer">
        {label ?? action.label}
        <span className="sr-only"> (nouvel onglet)</span>
        <span className="btn-arrow" aria-hidden="true">
          ↗
        </span>
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
