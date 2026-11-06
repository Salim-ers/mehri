import { describe, expect, it } from "vitest";
import { collectPending, confirmed, hasValue, isNotPublished, missing, notPublished, toConfirm } from "@/lib/facts";
import { directionLinks, formatAddress, resolveBookingAction, telHref } from "@/lib/contact-links";

const phone = toConfirm({ display: "06 79 02 50 27", e164: "+33679025027" }, "annuaire", "confirmer");

describe("faits client", () => {
  it("liste récursivement les données non confirmées avec leur chemin", () => {
    const content = { a: confirmed("ok"), b: { c: toConfirm(1, "src", "q1"), d: [missing("q2"), confirmed(true)] }, e: "texte libre" };
    const pending = collectPending(content);
    expect(pending.map((p) => p.path)).toEqual(["b.c", "b.d[0]"]);
    expect(pending[0]).toMatchObject({ status: "to-confirm", ask: "q1", source: "src" });
    expect(pending[1]).toMatchObject({ status: "missing", ask: "q2" });
  });
  it("une donnée que le praticien choisit de ne pas publier n'a pas de valeur et ne bloque plus", () => {
    const fact = notPublished<string>("questionnaire : ne pas afficher");
    expect(hasValue(fact)).toBe(false);
    expect(isNotPublished(fact)).toBe(true);
    expect(isNotPublished(confirmed("ok"))).toBe(false);
    expect(isNotPublished(missing("q"))).toBe(false);
    expect(collectPending({ fact })).toEqual([]);
  });
});

describe("réservation", () => {
  it("utilise la plateforme en ligne uniquement si elle est confirmée et en HTTPS", () => {
    const action = resolveBookingAction(confirmed("https://www.doctolib.fr/osteopathe/creil/x"), phone);
    expect(action).toMatchObject({ kind: "online", external: true, href: "https://www.doctolib.fr/osteopathe/creil/x" });
  });
  it("ignore une URL en ligne non confirmée (jamais de faux parcours)", () => {
    expect(resolveBookingAction(toConfirm("https://exemple.fr", "src", "q"), phone).kind).toBe("phone");
  });
  it("refuse une URL non sécurisée ou invalide", () => {
    expect(resolveBookingAction(confirmed("http://exemple.fr"), phone).kind).toBe("phone");
    expect(resolveBookingAction(confirmed("javascript:alert(1)"), phone).kind).toBe("phone");
    expect(resolveBookingAction(confirmed("pas une url"), phone).kind).toBe("phone");
  });
  it("se replie sur l'appel téléphonique, puis sur la page contact", () => {
    expect(resolveBookingAction(missing("q"), phone)).toMatchObject({ kind: "phone", href: "tel:+33679025027" });
    expect(resolveBookingAction(missing("q"), missing("q"))).toMatchObject({ kind: "none", href: "/contact" });
    expect(resolveBookingAction(notPublished("pas de plateforme"), phone)).toMatchObject({ kind: "phone" });
  });
});

describe("liens de contact", () => {
  it("produit un lien tel: RFC 3966 et rejette les numéros invalides", () => {
    expect(telHref("+33 6 79 02 50 27")).toBe("tel:+33679025027");
    expect(() => telHref("06 79")).toThrow();
  });
  it("encode l'adresse dans les liens d'itinéraire", () => {
    const address = { street: "241 rue du Bois des Cerisiers", postalCode: "60100", locality: "Creil" };
    expect(formatAddress(address)).toBe("241 rue du Bois des Cerisiers, 60100 Creil");
    const links = directionLinks(address);
    expect(links.google).toBe("https://www.google.com/maps/dir/?api=1&destination=241%20rue%20du%20Bois%20des%20Cerisiers%2C%2060100%20Creil");
    expect(links.waze).toContain("navigate=yes");
    expect(links.apple.startsWith("https://maps.apple.com/?daddr=")).toBe(true);
    expect(links.embed).toContain("output=embed");
  });
});
