import { expect, test } from "@playwright/test";
import { PAGES, skipIntro } from "./helpers";

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560, 3840] as const;

test.describe("responsive — aucun débordement horizontal", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 800 : width >= 2560 ? 1440 : 900 });
      for (const path of PAGES) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} @ ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("barre d'action mobile visible < 1024 px, absente au-delà, sans masquer le pied de page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/osteopathe");
    const bar = page.getByRole("navigation", { name: "Actions rapides" });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Appeler" })).toHaveAttribute("href", "tel:+33679025027");
    await expect(bar.getByRole("link", { name: /Itinéraire/ })).toHaveAttribute("href", /google\.com\/maps/);
    // le bas de page reste atteignable au-dessus de la barre
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const footerLink = page.getByRole("link", { name: "Confidentialité" });
    const linkBox = await footerLink.boundingBox();
    const barBox = await bar.boundingBox();
    expect(linkBox && barBox && linkBox.y + linkBox.height <= barBox.y).toBeTruthy();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(bar).toBeHidden();
  });

  test("cibles tactiles de la barre mobile ≥ 44 px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto("/");
    const links = page.getByRole("navigation", { name: "Actions rapides" }).getByRole("link");
    for (const box of await Promise.all((await links.all()).map((l) => l.boundingBox()))) {
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("paysage mobile : le titre d'accueil reste lisible", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });
});
