import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { colors } from "@/styles/tokens";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("contrastes WCAG 2.2 AA des couples utilisés", () => {
  const pairs: Array<[keyof typeof colors, keyof typeof colors, number]> = [
    ["ink", "ivory", 7],
    ["ink", "sand", 7],
    ["ink", "paper", 7],
    ["inkSoft", "ivory", 4.5],
    ["inkSoft", "paper", 4.5],
    ["inkSoft", "sand", 4.5],
    ["bronzeInk", "ivory", 4.5],
    ["bronzeInk", "paper", 4.5],
    ["bronzeInk", "sand", 4.5],
    ["walnut", "ivory", 7],
    ["paper", "graphite", 7],
    ["bone", "graphite", 7],
    ["bone", "night", 7],
    ["bone", "nightSoft", 7],
    ["mist", "night", 7],
    ["mist", "nightSoft", 4.5],
    ["mist", "graphite", 7],
    ["xray", "night", 7],
    ["night", "xray", 7],
    ["bronzeLight", "night", 7],
    ["bronzeLight", "graphite", 7],
    ["review", "reviewBg", 4.5],
    // bordures de contrôles (WCAG 1.4.11 : 3:1)
    ["stone", "ivory", 3],
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
  it("système arrondi : rayons de panneaux (32 px), cartes (24 px) et éléments secondaires (16 px)", () => {
    const css = readFileSync(join(__dirname, "../../src/app/globals.css"), "utf8");
    expect(css).toContain("--radius-panel: 2rem;");
    expect(css).toContain("--radius-card: 1.5rem;");
    expect(css).toContain("--radius-soft: 1rem;");
  });
  it("aucune mention « Planche / Fig. » ni numérotation décorative dans la feuille de style", () => {
    const css = readFileSync(join(__dirname, "../../src/app/globals.css"), "utf8");
    expect(css).not.toMatch(/planche|fig.|counter-increment|section-number/i);
  });
  it("aucune police mono ni quadrillage de fond dans la feuille de style", () => {
    const css = readFileSync(join(__dirname, "../../src/app/globals.css"), "utf8");
    expect(css).not.toMatch(/font-mono|plex|monospace/i);
    expect(css).not.toMatch(/hero-grid|registration|\.ruler/);
  });
});
