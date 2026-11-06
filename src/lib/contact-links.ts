import { hasValue, type Fact } from "@/lib/facts";

export interface Address {
  readonly street: string;
  readonly postalCode: string;
  readonly locality: string;
}

export function formatAddress(address: Address): string {
  return `${address.street}, ${address.postalCode} ${address.locality}`;
}

/** tel: URI conforme RFC 3966 à partir d'un numéro E.164. */
export function telHref(e164: string): string {
  const normalized = e164.replace(/[^\d+]/g, "");
  if (!/^\+\d{8,15}$/.test(normalized)) {
    throw new Error(`Numéro E.164 invalide : ${e164}`);
  }
  return `tel:${normalized}`;
}

export interface DirectionLinks {
  readonly google: string;
  readonly apple: string;
  readonly waze: string;
  readonly embed: string;
}

export function directionLinks(address: Address): DirectionLinks {
  const query = encodeURIComponent(formatAddress(address));
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
    apple: `https://maps.apple.com/?daddr=${query}`,
    waze: `https://waze.com/ul?q=${query}&navigate=yes`,
    embed: `https://www.google.com/maps?q=${query}&output=embed`,
  };
}

export type BookingAction =
  | { readonly kind: "online"; readonly href: string; readonly label: string; readonly external: true }
  | { readonly kind: "phone"; readonly href: string; readonly label: string; readonly external: false }
  | { readonly kind: "none"; readonly href: "/contact"; readonly label: string; readonly external: false };

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Règle métier de réservation :
 * 1. Plateforme en ligne validée par le praticien → lien externe direct.
 * 2. Sinon, téléphone connu → appel direct (aucun faux calendrier).
 * 3. Sinon, page contact.
 * Une URL en ligne seulement « to-confirm » ou non HTTPS n'est jamais utilisée.
 */
export function resolveBookingAction(
  onlineBookingUrl: Fact<string>,
  phone: Fact<{ readonly display: string; readonly e164: string }>,
): BookingAction {
  if (onlineBookingUrl.status === "confirmed" && hasValue(onlineBookingUrl) && isSafeHttpsUrl(onlineBookingUrl.value)) {
    return { kind: "online", href: onlineBookingUrl.value, label: "Réserver en ligne", external: true };
  }
  if (hasValue(phone)) {
    return { kind: "phone", href: telHref(phone.value.e164), label: `Appeler le ${phone.value.display}`, external: false };
  }
  return { kind: "none", href: "/contact", label: "Nous contacter", external: false };
}
