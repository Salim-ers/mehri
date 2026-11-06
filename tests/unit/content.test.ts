import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { anatomyRegions, REGION_IDS } from "@/content/anatomy";
import { equipment } from "@/content/equipment";
import { photos } from "@/content/media";
import { getMotif, motifs } from "@/content/motifs";
import { practice } from "@/content/practice";
import { approach } from "@/content/practitioner";
import { consultationSteps, navigation, redFlags } from "@/content/site";
import { practiceJsonLd, serializeJsonLd } from "@/lib/seo";

const root = join(__dirname, "../..");

describe("intégrité du contenu", () => {
  it("chaque entrée de navigation correspond à une vraie page", () => {
    for (const item of navigation) {
      const file = item.href === "/" ? "src/app/page.tsx" : `src/app${item.href}/page.tsx`;
      expect(existsSync(join(root, file)), file).toBe(true);
    }
  });
  it("motifs : slugs uniques, région existante, contenus complets", () => {
    const slugs = motifs.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const m of motifs) {
      expect(REGION_IDS).toContain(m.region);
      expect(m.context.length).toBeGreaterThan(0);
      expect(m.situations.length).toBeGreaterThan(0);
      expect(m.session.length).toBeGreaterThan(0);
      expect(m.caution.length).toBeGreaterThan(0);
      expect(m.metaDescription.length).toBeLessThanOrEqual(170);
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
  it("chaque région de l'atlas renvoie vers un motif existant", () => {
    expect(anatomyRegions.map((r) => r.id)).toEqual([...REGION_IDS]);
    for (const r of anatomyRegions) expect(getMotif(r.motifSlug), r.id).toBeDefined();
  });
  it("toutes les photos référencées existent dans /public", () => {
    for (const p of Object.values(photos)) expect(existsSync(join(root, "public", p.src)), p.src).toBe(true);
  });
  it("aucune image source n'est présentée comme plus grande qu'elle ne l'est", () => {
    for (const p of Object.values(photos)) expect(p.width).toBeLessThanOrEqual(941);
  });
});

/**
 * Garde-fou éditorial (santé) : aucune promesse thérapeutique, aucun titre
 * médical usurpé, aucun public non confirmé (nourrissons, grossesse).
 */
describe("conformité éditoriale", () => {
  const corpus = JSON.stringify({ motifs, anatomyRegions, equipment, approach, consultationSteps, redFlags, photos });
  const forbidden = [
    /guéri(r|son|t)/i,
    /garanti/i,
    /miracl/i,
    /100\s?%/,
    /dès la première séance/i,
    /soulagement (immédiat|assuré)/i,
    /\bdocteur\b|\bdr\.?\s/i,
    /nourrisson/i,
    /femmes? enceintes?|grossesse/i,
    /avis (patients|clients)|témoignage/i,
  ];
  for (const re of forbidden) {
    it(`ne contient pas ${re}`, () => {
      expect(corpus).not.toMatch(re);
    });
  }
});

describe("données structurées", () => {
  it("échappe « < » pour empêcher la sortie du bloc <script>", () => {
    expect(serializeJsonLd({ a: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
  it("n'expose pas d'horaires non confirmés dans Schema.org", () => {
    const data = practiceJsonLd();
    if (practice.openingHours.status !== "confirmed") expect(data.openingHours).toBeUndefined();
    expect(data.address).toBeDefined();
  });
});
