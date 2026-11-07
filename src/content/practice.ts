import { confirmed, missing, notPublished, type Fact } from "@/lib/facts";

/**
 * SOURCE UNIQUE DE VÉRITÉ des informations du cabinet.
 * Toute donnée non validée par le praticien reste « to-confirm » ou « missing ».
 * Validation par le praticien : questionnaire du 6 novembre 2026 — voir CLIENT-VALIDATION.md.
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
  /** durée habituelle d'une consultation (FAQ de la page Conseils) */
  readonly consultationDuration: Fact<string>;
  /** consigne d'annulation (délai de prévenance) */
  readonly cancellationPolicy: Fact<string>;
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

/** Trace des décisions « Ne pas afficher » / « Validé » sans valeur prises dans le questionnaire. */
export const VALIDATION_SOURCE = "Questionnaire de validation du praticien, 06/11/2026";

export const practice: Practice = {
  // Valeurs ci-dessous : « Validé » dans le questionnaire du 06/11/2026.
  practitionerName: confirmed("Mohamed Merhi"),
  title: confirmed("Ostéopathe D.O."),
  city: confirmed("Creil"),
  address: confirmed({
    street: "241 rue du Bois des Cerisiers",
    postalCode: "60100",
    locality: "Creil",
    hint: "À proximité du centre hospitalier de Creil",
  }),
  phone: confirmed({ display: "06 79 02 50 27", e164: "+33679025027" }),
  email: notPublished(`${VALIDATION_SOURCE} : « Ne pas afficher ».`),
  openingHours: confirmed([
    { days: "Du lundi au samedi", hours: "9 h 00 – 20 h 00" },
    { days: "Dimanche", hours: "Fermé" },
  ]),
  // Tarifs non publiés : le site indique qu'ils sont communiqués lors de la prise de rendez-vous.
  fees: notPublished(`${VALIDATION_SOURCE} : « Ne pas afficher ».`),
  // Pas de plateforme : la prise de rendez-vous se fait par téléphone (resolveBookingAction).
  // Questions ajoutées avec la page « Conseils » (07/11/2026) : facultatives, rien n'est inventé
  // en attendant — la FAQ renvoie alors vers la prise de rendez-vous par téléphone.
  consultationDuration: missing("Durée habituelle d'une consultation (par exemple « environ 45 minutes ») ?", { optional: true }),
  cancellationPolicy: missing("Consigne pour annuler ou déplacer un rendez-vous (délai de prévenance éventuel) ?", { optional: true }),
  onlineBookingUrl: notPublished(`${VALIDATION_SOURCE} : « Ne pas afficher » (rendez-vous par téléphone).`),
  directoryListingUrl: notPublished(`${VALIDATION_SOURCE} : « Ne pas afficher ».`),
  accessibility: confirmed("Accès, stationnement et sanitaires adaptés aux personnes à mobilité réduite"),
  diplomas: notPublished(`${VALIDATION_SOURCE} : « Ne pas afficher ».`),
  // « Validé » sans texte, avec la demande d'en proposer un : aucun parcours n'est inventé.
  // Proposer un texte au praticien dès qu'il fournit ses éléments (formation, année, expérience).
  background: notPublished(`${VALIDATION_SOURCE} : texte à proposer, rien de publié en attendant.`),
  // « Validé » sans liste : aucun public n'est affiché (ni nourrissons ni femmes enceintes).
  publics: notPublished(`${VALIDATION_SOURCE} : « Validé » sans liste, aucun public affiché.`),
  legal: {
    siret: notPublished(`${VALIDATION_SOURCE} : « Validé » sans numéro, rien d'affiché.`),
    adeli: notPublished(`${VALIDATION_SOURCE} : « Ne pas afficher ».`),
    insurer: notPublished(`${VALIDATION_SOURCE} : « Ne pas afficher ».`),
    publisher: confirmed("QuadCore"),
    host: confirmed("Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis"),
  },
  photosAuthorization: confirmed(true),
  patientImageConsent: confirmed(true),
};

/** Identité affichée partout : dérivée des faits (jamais de littéral ailleurs). */
export const identity = {
  name: practice.practitionerName.value ?? "Cabinet d'ostéopathie",
  title: practice.title.value ?? "Ostéopathe",
  city: practice.city.value ?? "Creil",
} as const;

/** Domaine : défaut provisoire, refusé en production par le garde-fou de build. */
export const SITE_URL_FALLBACK = "https://www.osteopathe-merhi-creil.fr";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_FALLBACK).replace(/\/$/, "");

/** Mode relecture : affiche les badges « À confirmer » pour la présentation au client. */
export const reviewMode = process.env.NEXT_PUBLIC_REVIEW_MODE !== "false";
