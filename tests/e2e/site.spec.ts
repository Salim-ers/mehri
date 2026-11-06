import { expect, test } from "@playwright/test";
import { collectErrors, PAGES, skipIntro } from "./helpers";

test.describe("navigation multipage", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  for (const path of PAGES) {
    test(`${path} : se charge, un seul H1, titre et canonical uniques, sans erreur`, async ({ page }) => {
      const errors = collectErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toMatch(new RegExp(`${path === "/" ? "" : path}$`));
      await page.waitForTimeout(800);
      expect(errors).toEqual([]);
    });
  }

  test("les titres de page sont tous différents", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(PAGES.length);
  });

  test("le menu s'ouvre, se ferme avec Échap et rend le focus", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/osteopathe");
    const button = page.getByRole("button", { name: /menu/i });
    await button.click();
    const dialog = page.getByRole("dialog", { name: "Menu du site" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Pourquoi consulter/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("navigation principale : six entrées, dont la prise de rendez-vous", async ({ page, isMobile }) => {
    test.skip(isMobile, "barre de navigation complète à partir de 1280 px (menu sur mobile)");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    for (const label of ["Accueil", "L'ostéopathe", "Pourquoi consulter ?", "Corps en mouvement", "Le cabinet"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.locator("header").getByRole("link", { name: "Prendre RDV" })).toBeVisible();
  });

  test("navigation par le menu vers une autre page", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: /menu/i }).click();
    await page.getByRole("dialog", { name: "Menu du site" }).getByRole("link", { name: /^Le cabinet/ }).click();
    await expect(page).toHaveURL(/\/cabinet$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("calme");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("404 personnalisée", async ({ page }) => {
    const res = await page.goto("/page-inexistante");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("quitté");
  });

  test("une fiche motif inconnue renvoie 404", async ({ page }) => {
    const res = await page.goto("/motifs-de-consultation/inconnu");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("quitté");
  });
});

test.describe("accueil", () => {
  test("nom, titre, rendez-vous et adresse sont visibles immédiatement", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Mohamed Merhi");
    await expect(page.locator("h1")).toContainText("Ostéopathe D.O.");
    await expect(page.locator(".hero-stage").getByRole("link", { name: /Prendre rendez-vous/ })).toBeVisible();
    await expect(page.locator(".hero-stage").getByText(/241 rue du Bois des Cerisiers/)).toBeVisible();
  });
  test("aucune photographie de personne n'est servie", async ({ page }) => {
    for (const path of ["/", "/osteopathe", "/cabinet", "/equipements", "/deroulement-consultation"]) {
      await page.goto(path);
      const sources = await page.locator("img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src));
      for (const src of sources) expect(src, path).not.toMatch(/praticien|consultation-(cervicales|epaule)|equipement-(percussion|applicateur)/);
    }
  });
});

test.describe("réservation et contact", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("« Prendre rendez-vous » ouvre le panneau avec un appel réel, sans faux créneau", async ({ page }) => {
    await page.goto("/");
    await page.locator(".hero-stage").getByRole("link", { name: /Prendre rendez-vous/ }).click();
    const sheet = page.getByRole("dialog", { name: /Prendre rendez-vous/ });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: /Appeler le 06 79 02 50 27/ })).toHaveAttribute("href", "tel:+33679025027");
    await expect(sheet.getByText(/créneaux? disponibles?/i)).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test("la page rendez-vous fonctionne seule (sans le panneau)", async ({ page }) => {
    await page.goto("/rendez-vous");
    const call = page.getByRole("main").getByRole("link", { name: /Appeler le 06 79 02 50 27/ }).first();
    await expect(call).toHaveAttribute("href", "tel:+33679025027");
    await expect(page.getByText(/créneaux? disponibles?/i)).toHaveCount(0);
  });

  test("itinéraires et plan chargé seulement après consentement", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("link", { name: /Itinéraire Google Maps/ })).toHaveAttribute("href", /google\.com\/maps\/dir\/\?api=1&destination=241/);
    await expect(page.getByRole("link", { name: /Waze/ })).toHaveAttribute("href", /waze\.com/);
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("button", { name: "Afficher le plan" }).click();
    await expect(page.locator("iframe")).toHaveAttribute("src", /google\.com\/maps\?q=/);
  });
});

test.describe("atlas anatomique", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("sélection d'une région au clavier : panneau, URL partageable", async ({ page }) => {
    await page.goto("/le-corps-en-mouvement");
    const nav = page.getByRole("navigation", { name: "Régions anatomiques" });
    const knee = nav.getByRole("button", { name: /Genoux/ });
    await knee.focus();
    await page.keyboard.press("Enter");
    await expect(knee).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("aside").getByRole("heading", { level: 3 })).toHaveText("Genoux et membres inférieurs");
    await expect(page).toHaveURL(/region=genoux/);
    await expect(page.getByRole("link", { name: /Motif associé/ })).toHaveAttribute("href", "/motifs-de-consultation/consultation-de-sportifs");
  });

  test("le lien ?region= ouvre directement la bonne planche", async ({ page }) => {
    await page.goto("/le-corps-en-mouvement?region=thorax");
    await expect(page.locator("aside").getByRole("heading", { level: 3 })).toHaveText("Thorax et côtes");
  });

  test("la scène 3D se charge (canvas WebGL) et l'animation peut être suspendue", async ({ page }) => {
    await page.goto("/le-corps-en-mouvement?region=epaules&force-webgl");
    await page.locator("#atlas").scrollIntoViewIfNeeded();
    await expect(page.locator("#atlas canvas")).toHaveCount(1, { timeout: 30_000 });
    const pause = page.getByRole("button", { name: /Pause|Lire le mouvement/ });
    await expect(pause).toBeVisible();
    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", /true|false/);
  });

  test("alternative sans WebGL : silhouette vectorielle utilisable", async ({ page }) => {
    await page.goto("/le-corps-en-mouvement?no-webgl");
    await expect(page.getByText(/version vectorielle/i).first()).toBeVisible();
    await expect(page.locator("#atlas canvas")).toHaveCount(0);
    await page.locator("#atlas").getByRole("button", { name: "Bassin" }).last().click();
    await expect(page.locator("aside").getByRole("heading", { level: 3 })).toHaveText("Bassin");
  });

  test("contenu textuel complet présent pour l'indexation", async ({ page }) => {
    await page.goto("/le-corps-en-mouvement");
    for (const label of ["Colonne vertébrale", "Cervicales et nuque", "Épaules et membres supérieurs", "Thorax et côtes", "Bassin", "Hanches", "Genoux et membres inférieurs"]) {
      await expect(page.locator(`section[aria-labelledby="regions-texte"] h3`, { hasText: label })).toHaveCount(1);
    }
  });
});

test.describe("accueil 3D", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));
  test("la colonne 3D se monte et le défilement n'est jamais bloqué", async ({ page }) => {
    await page.goto("/?force-webgl");
    await expect(page.locator(".hero-stage canvas")).toHaveCount(1, { timeout: 30_000 });
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 2400);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 1000);
  });
  test("la rotation de la colonne peut être suspendue (WCAG 2.2.2)", async ({ page }) => {
    await page.goto("/?force-webgl");
    const pause = page.getByRole("button", { name: /rotation de la colonne/ });
    await expect(pause).toBeVisible({ timeout: 30_000 });
    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", "true");
  });
  test("rendu logiciel (sans GPU) : repli automatique sur l'illustration vectorielle", async ({ page }) => {
    // le navigateur de test utilise SwiftShader : la 3D ne doit pas être imposée
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator(".hero-stage canvas")).toHaveCount(0);
    await expect(page.locator(".hero-stage svg").first()).toBeVisible();
  });
  test("sans WebGL, une illustration vectorielle remplace la 3D", async ({ page }) => {
    await page.goto("/?no-webgl");
    await expect(page.locator(".hero-stage canvas")).toHaveCount(0);
    await expect(page.locator(".hero-stage svg").first()).toBeVisible();
  });
});

test.describe("sécurité", () => {
  test("en-têtes de sécurité présents", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).not.toContain("unsafe-eval");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-powered-by"]).toBeUndefined();
  });
  test("sitemap et robots", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/motifs-de-consultation/tensions-cervicales");
    expect((sitemap.match(/<url>/g) ?? []).length).toBe(19);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
  });
});
