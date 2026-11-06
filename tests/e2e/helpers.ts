import type { Page } from "@playwright/test";

/** Considère l'écran d'ouverture comme déjà vu (sauf tests dédiés). */
export async function skipIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("mm-intro-seen", "1");
    } catch {
      /* stockage indisponible */
    }
  });
}

export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/GPU stall|WebGL|GL Driver/i.test(m.text())) errors.push(m.text());
  });
  return errors;
}

export const PAGES = [
  "/",
  "/osteopathe",
  "/le-corps-en-mouvement",
  "/motifs-de-consultation",
  "/motifs-de-consultation/dos-et-lombalgies",
  "/cabinet",
  "/equipements",
  "/deroulement-consultation",
  "/rendez-vous",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
] as const;
