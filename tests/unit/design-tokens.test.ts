import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { colors } from "@/styles/tokens";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("contrastes WCAG 2.2 AA des couples utilisés", () => {
  const pairs: Array<[keyof typeof colors, keyof typeof colors, number]> = [
    ["ink", "ivory", 7],
    ["ink", "mineral", 7],
    ["inkSoft", "ivory", 4.5],
    ["inkSoft", "paper", 4.5],
    ["inkSoft", "mineral", 4.5],
    ["bronzeInk", "ivory", 4.5],
    ["bronzeInk", "paper", 4.5],
    ["anthracite", "ivory", 7],
    ["paper", "anthracite", 7],
    ["bone", "anthracite", 7],
    ["bronzeLight", "anthracite", 4.5],
    ["xray", "anthracite", 7],
    ["review", "reviewBg", 4.5],
  ];
  for (const [fg, bg, min] of pairs) {
    it(`${fg} sur ${bg} ≥ ${min}:1`, () => {
      expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(min);
    });
  }
  it("globals.css reprend exactement les tokens (source unique)", () => {
    const css = readFileSync(join(__dirname, "../../src/app/globals.css"), "utf8").toLowerCase();
    const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    for (const [key, value] of Object.entries(colors)) expect(css).toContain(`--color-${kebab(key)}: ${value.toLowerCase()};`);
  });
  it("aucune police mono ni quadrillage de fond dans la feuille de style", () => {
    const css = readFileSync(join(__dirname, "../../src/app/globals.css"), "utf8");
    expect(css).not.toMatch(/font-mono|plex|monospace/i);
    expect(css).not.toMatch(/hero-grid|registration|\.ruler/);
  });
});
