import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { colors } from "@/styles/tokens";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("contrastes WCAG 2.2 AA des couples utilisés", () => {
  const pairs: Array<[keyof typeof colors, keyof typeof colors, number]> = [
    ["ink", "ivory", 7],
    ["inkSoft", "ivory", 4.5],
    ["inkSoft", "paper", 4.5],
    ["bronzeInk", "ivory", 4.5],
    ["bronzeInk", "paper", 4.5],
    ["umber", "ivory", 7],
    ["paper", "umber", 7],
    ["bone", "umber", 4.5],
    ["bronzeLight", "umber", 4.5],
    ["review", "reviewBg", 4.5],
  ];
  for (const [fg, bg, min] of pairs) {
    it(`${fg} sur ${bg} ≥ ${min}:1`, () => {
      expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(min);
    });
  }
  it("globals.css reprend exactement les tokens (source unique)", () => {
    const css = readFileSync(join(__dirname, "../../src/app/globals.css"), "utf8").toLowerCase();
    const map: Record<string, keyof typeof colors> = {
      "--color-paper": "paper", "--color-ivory": "ivory", "--color-umber": "umber", "--color-bronze-ink": "bronzeInk",
      "--color-ink-soft": "inkSoft", "--color-bronze-light": "bronzeLight", "--color-bone": "bone",
    };
    for (const [v, key] of Object.entries(map)) expect(css).toContain(`${v}: ${colors[key].toLowerCase()};`);
  });
});
