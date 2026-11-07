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
    for (const label of ["Accueil", "Ostéopathe", "Motifs", "Anatomie", "Cabinet", "Conseils"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.locator("header").getByRole("link", { name: "Prendre RDV" })).toBeVisible();
  });

  test("navigation par le menu vers une autre page", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: /menu/i }).click();
    await page.getByRole("dialog", { name: "Menu du site" }).getByRole("link", { name: /^Cabinet/ }).click();
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
  test("accroche, nom, titre, rendez-vous et adresse sont présents dès l'arrivée", async ({ page, isMobile }) => {
    await skipIntro(page);
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Votre corps mérite toute notre attention.");
    await expect(page.locator(".hero")).toContainText("Mohamed Merhi — Ostéopathe D.O. à Creil");
    await expect(page.locator(".hero").getByRole("link", { name: /Prendre rendez-vous/ })).toBeVisible();
    await expect(page.locator(".hero").getByRole("link", { name: /Explorer le corps humain/ }).filter({ visible: true })).toHaveCount(1);
    if (isMobile) await expect(page.getByRole("navigation", { name: "Actions rapides" }).getByRole("link", { name: /Itinéraire/ })).toBeVisible();
    else await expect(page.locator(".hero").getByText(/241 rue du Bois des Cerisiers/)).toBeVisible();
  });
  test("ouverture cinématographique : jouée à l'arrivée, jamais bloquante, sautée au premier geste", async ({ page }) => {
    await page.goto("/");
    const intro = page.locator(".intro");
    await expect(intro).toBeVisible();
    await page.mouse.wheel(0, 10);
    await expect(intro).toBeHidden({ timeout: 4000 });
    // sans geste, elle disparaît seule
    await page.goto("/rendez-vous");
    await page.goto("/");
    await expect(page.locator(".intro")).toBeHidden({ timeout: 5000 });
  });
  test("ouverture : jamais rejouée en revenant à l'accueil par la navigation", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/cabinet");
    await page.locator("header").getByRole("link", { name: /Mohamed Merhi/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".intro")).toHaveAttribute("data-skip", "true");
  });
  test("aucune photographie de personne n'est servie", async ({ page }) => {
    for (const path of ["/", "/osteopathe", "/cabinet", "/equipements", "/conseils"]) {
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
    await page.locator(".hero").getByRole("link", { name: /Prendre rendez-vous/ }).click();
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

test.describe("anatomie (explorateur 3D)", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("sélection d'une région au clavier : panneau, URL partageable", async ({ page }) => {
    await page.goto("/anatomie");
    const nav = page.getByRole("navigation", { name: "Régions anatomiques" });
    const knee = nav.getByRole("button", { name: /Genoux/ });
    await knee.focus();
    await page.keyboard.press("Enter");
    await expect(knee).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("aside").getByRole("heading", { level: 3 })).toHaveText("Genoux");
    await expect(page).toHaveURL(/region=genoux/);
    await expect(page.getByRole("link", { name: /Motif associé/ })).toHaveAttribute("href", "/motifs-de-consultation/consultation-de-sportifs");
  });

  test("le lien ?region= ouvre directement la bonne région", async ({ page }) => {
    await page.goto("/anatomie?region=thorax");
    await expect(page.locator("aside").getByRole("heading", { level: 3 })).toHaveText("Thorax et côtes");
  });

  test("l'ancienne adresse redirige en conservant la région", async ({ page }) => {
    const res = await page.goto("/le-corps-en-mouvement?region=genoux");
    expect(res?.url()).toMatch(/\/anatomie\?region=genoux$/);
    await expect(page.locator("aside").getByRole("heading", { level: 3 })).toHaveText("Genoux");
  });

  test("deux rendus : 3D et radiographie, avec mention pédagogique", async ({ page }) => {
    await page.goto("/anatomie?region=genoux");
    await page.getByRole("button", { name: "Radiographie" }).click();
    await expect(page.getByRole("button", { name: "Radiographie" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/ce n'est pas un examen d'imagerie/)).toBeVisible();
    await expect(page.locator("aside").getByText(/sans lien avec un patient du cabinet/)).toBeVisible();
  });

  test("la scène 3D se charge (canvas WebGL) et l'animation peut être suspendue", async ({ page }) => {
    await page.goto("/anatomie?region=epaules&force-webgl");
    await expect(page.locator("#explorateur canvas")).toHaveCount(1, { timeout: 30_000 });
    const toggle = page.locator("#explorateur").getByRole("button", { name: /^(Pause|Lire le mouvement)$/ });
    await expect(toggle).toBeVisible();
    const before = await toggle.textContent();
    await toggle.click();
    await expect(toggle).not.toHaveText(before ?? "");
  });

  test("alternative sans WebGL : silhouette vectorielle utilisable", async ({ page }) => {
    await page.goto("/anatomie?no-webgl");
    await expect(page.locator("#explorateur canvas")).toHaveCount(0);
    await expect(page.locator("#explorateur svg").first()).toBeVisible();
    await page.getByRole("navigation", { name: "Régions anatomiques" }).getByRole("button", { name: "Bassin" }).click();
    await expect(page.locator("aside").getByRole("heading", { level: 3 })).toHaveText("Bassin");
  });

  test("contenu textuel complet présent pour l'indexation", async ({ page }) => {
    await page.goto("/anatomie");
    for (const label of ["Cervicales et nuque", "Thorax et côtes", "Colonne lombaire", "Bassin", "Épaules", "Hanches", "Genoux"]) {
      await expect(page.locator(`section[aria-labelledby="regions-texte"] h3`, { hasText: label })).toHaveCount(1);
    }
  });
});

test.describe("accueil 3D", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));
  test("le squelette 3D se monte et le défilement n'est jamais bloqué", async ({ page }) => {
    await page.goto("/?force-webgl");
    await expect(page.locator(".hero canvas")).toHaveCount(1, { timeout: 30_000 });
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 2400);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 1000);
  });
  test("l'animation peut être suspendue (WCAG 2.2.2)", async ({ page }) => {
    await page.goto("/?force-webgl");
    const pause = page.locator(".hero").getByRole("button", { name: /l'animation/ });
    await expect(pause).toHaveAccessibleName(/Mettre en pause/, { timeout: 30_000 });
    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await expect(pause).toHaveAccessibleName(/Reprendre/);
  });
  test("rendu logiciel (sans GPU) : repli automatique sur l'illustration vectorielle", async ({ page }) => {
    // le navigateur de test utilise SwiftShader : la 3D ne doit pas être imposée
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator(".hero canvas")).toHaveCount(0);
    await expect(page.locator(".hero .anatomy-stage__fallback svg").first()).toBeVisible();
  });
  test("sans WebGL, une illustration vectorielle remplace la 3D", async ({ page }) => {
    await page.goto("/?no-webgl");
    await expect(page.locator(".hero canvas")).toHaveCount(0);
    await expect(page.locator(".hero .anatomy-stage__fallback svg").first()).toBeVisible();
  });
});

test.describe("transitions de page", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));
  test("navigation animée : le bouton Précédent et les liens directs fonctionnent", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await page.getByRole("button", { name: /menu/i }).click();
      await page.getByRole("dialog", { name: "Menu du site" }).getByRole("link", { name: /^Anatomie/ }).click();
    } else {
      await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Anatomie", exact: true }).click();
    }
    await expect(page).toHaveURL(/\/anatomie$/);
    // Next 16 conserve la page précédente masquée (Activity) : on interroge l'arbre d'accessibilité
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sous la surface");
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Votre corps mérite");
  });
  test("Motifs → Conseils : la surface de lecture s'ouvre sur la page Conseils", async ({ page }) => {
    await page.goto("/motifs-de-consultation");
    await page.getByRole("link", { name: /Préparer votre consultation/ }).click();
    await expect(page).toHaveURL(/\/conseils$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Bien préparer");
  });
});

test.describe("page Conseils", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));
  test("FAQ en accordéon : huit questions, réponse affichée au clic", async ({ page }) => {
    await page.goto("/conseils");
    const items = page.locator("details.disclosure");
    await expect(items).toHaveCount(8);
    await page.getByText("Faut-il une ordonnance ?").click();
    await expect(page.getByText(/sans prescription médicale/).first()).toBeVisible();
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
