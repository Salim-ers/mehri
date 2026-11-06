import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES, skipIntro } from "./helpers";

test.describe("accessibilité (axe-core, WCAG 2.2 A/AA)", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      // révèle les contenus animés pour l'analyse des contrastes
      await page.evaluate(() => document.querySelectorAll(".reveal,.reveal-mask").forEach((e) => e.classList.add("is-visible")));
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .exclude("canvas")
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }

  test("mouvement réduit : pas d'intro animée, contenu immédiatement visible", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 2500 });
    await expect(page.locator("h1")).toBeVisible();
    await ctx.close();
  });
});
