import { confirmed, missing, toConfirm, type Fact } from "@/lib/facts";

/**
 * SOURCE UNIQUE DE VÉRITÉ des informations du cabinet.
 * Toute donnée non validée par le praticien reste « to-confirm » ou « missing ».
 * Vérifications effectuées le 6 novembre 2026 — voir CLIENT-VALIDATION.md.
 */

export interface OpeningSlot {
  readonly days: string;
  readonly hours: string;
}

export interface Practice {
  readonly practitionerName: Fact<string>;
  readonly title: Fact<string>;
  readonly city: Fact<string>;
  readonly address: Fact<{
    readonly street: string;
    readonly postalCode: string;
    readonly locality: string;
    readonly hint: string;
  }>;
  readonly phone: Fact<{ readonly display: string; readonly e164: string }>;
  readonly email: Fact<string>;
  readonly openingHours: Fact<readonly OpeningSlot[]>;
  readonly fees: Fact<readonly { readonly label: string; readonly price: string }[]>;
  readonly onlineBookingUrl: Fact<string>;
  readonly directoryListingUrl: Fact<string>;
  readonly accessibility: Fact<string>;
  readonly diplomas: Fact<readonly string[]>;
  readonly background: Fact<string>;
  readonly publics: Fact<readonly string[]>;
  readonly legal: {
    readonly siret: Fact<string>;
    readonly adeli: Fact<string>;
    readonly insurer: Fact<string>;
    readonly publisher: Fact<string>;
    readonly host: Fact<string>;
  };
  readonly photosAuthorization: Fact<boolean>;
  readonly patientImageConsent: Fact<boolean>;
}

export const practice: Practice = {
  practitionerName: toConfirm(
    "Mohamed Merhi",
    "Brief client + logo fourni + annuaires (« M. Merhi »)",
    "Confirmer l'orthographe officielle MERHI (et non MERI) et le prénom d'usage.",
  ),
  title: toConfirm(
    "Ostéopathe D.O.",
    "Logo fourni + fiche Crenolibre « Ostéopathe »",
    "Confirmer le titre exact et le numéro d'enregistrement d'usage du titre d'ostéopathe.",
  ),
  city: confirmed("Creil"),
  address: toConfirm(
    {
      street: "241 rue du Bois des Cerisiers",
      postalCode: "60100",
      locality: "Creil",
      hint: "À proximité du centre hospitalier de Creil",
    },
    "Annuaire ks-osteopathie.fr (« Osteopathe Do M Merhi ») + siège d'une SELARL MERHI à la même adresse (registre SIRENE). L'ancienne adresse 59 rue du Plessis Pommeraye n'est volontairement pas utilisée.",
    "Confirmer l'adresse, l'étage / le bâtiment et les indications d'accès (parking, entrée).",
  ),
  phone: toConfirm(
    { display: "06 79 02 50 27", e164: "+33679025027" },
    "Fiche Crenolibre + annuaire ks-osteopathie.fr (numéro identique sur les deux sources)",
    "Confirmer que ce numéro est bien la ligne de prise de rendez-vous.",
  ),
  email: missing("Fournir une adresse e-mail professionnelle (facultatif).", { optional: true }),
  openingHours: toConfirm(
    [
      { days: "Du lundi au samedi", hours: "9 h 00 – 20 h 00" },
      { days: "Dimanche", hours: "Fermé" },
    ],
    "Annuaire tiers ks-osteopathie.fr uniquement — fiabilité faible",
    "Communiquer les horaires réels de consultation.",
  ),
  fees: missing("Communiquer les tarifs des consultations et les modes de règlement acceptés."),
  onlineBookingUrl: missing(
    "Indiquer la plateforme de réservation en ligne utilisée (Doctolib, Crenolibre, autre) ou confirmer la prise de rendez-vous par téléphone uniquement.",
  ),
  directoryListingUrl: toConfirm(
    "https://www.crenolibre.fr/therapeute/osteopathe/creil/cp/44430-do-m-merhi_osteopathe",
    "Fiche Crenolibre : même téléphone, mais aucun agenda actif ni créneau publié au 06/11/2026",
    "Confirmer que cette fiche appartient au praticien et indiquer s'il souhaite y activer la réservation.",
  ),
  accessibility: toConfirm(
    "Accès, stationnement et sanitaires adaptés aux personnes à mobilité réduite",
    "Annuaire ks-osteopathie.fr",
    "Confirmer l'accessibilité PMR du cabinet.",
  ),
  diplomas: missing("Fournir l'intitulé du diplôme d'ostéopathe, l'établissement de formation et l'année."),
  background: missing("Rédiger ou valider un court texte de parcours professionnel."),
  publics: missing(
    "Préciser les publics réellement pris en charge (adultes, sportifs, seniors, femmes enceintes, enfants, nourrissons).",
  ),
  legal: {
    siret: missing("Fournir le numéro SIRET du cabinet (la SELARL MERHI relevée au registre a un gérant différent et un code d'activité 86.23Z : à clarifier)."),
    adeli: missing("Fournir le numéro d'enregistrement ADELI / RPPS d'ostéopathe."),
    insurer: missing("Fournir l'assureur responsabilité civile professionnelle (mention recommandée)."),
    publisher: missing("Préciser l'éditeur du site (nom, statut, adresse) et le directeur de publication."),
    host: toConfirm(
      "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      "Hébergeur suggéré par le brief",
      "Confirmer l'hébergeur retenu.",
    ),
  },
  photosAuthorization: toConfirm(
    true,
    "Photos transmises par QuadCore (fichiers nommés « Image ChatGPT » : retouches IA)",
    "Confirmer par écrit l'autorisation d'utiliser les photos ET que les retouches n'ont pas modifié la réalité du cabinet, du praticien ou des équipements.",
  ),
  patientImageConsent: missing(
    "Obtenir le consentement écrit de la personne visible sur les photos de consultation (ou confirmer qu'il s'agit d'un figurant).",
  ),
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.osteopathe-merhi-creil.fr").replace(/\/$/, "");

/** Mode relecture : affiche les badges « À confirmer » pour la présentation au client. */
export const reviewMode = process.env.NEXT_PUBLIC_REVIEW_MODE !== "false";
