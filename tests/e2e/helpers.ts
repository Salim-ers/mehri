import type { Page } from "@playwright/test";

/** Masque l'ouverture cinématographique (sauf tests dédiés) : elle se ferme seule, mais ralentirait chaque test. */
export async function skipIntro(page: Page) {
  await page.addInitScript(() => {
    const add = () => {
      const style = document.createElement("style");
      style.textContent = ".intro{display:none!important}";
      (document.head ?? document.documentElement)?.appendChild(style);
    };
    // le script peut s'exécuter avant la création de <html>
    if (document.documentElement) add();
    else document.addEventListener("readystatechange", add, { once: true });
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
  "/anatomie",
  "/motifs-de-consultation",
  "/motifs-de-consultation/dos-et-lombalgies",
  "/cabinet",
  "/equipements",
  "/conseils",
  "/rendez-vous",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
] as const;
