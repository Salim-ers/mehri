import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { anatomyRegions, REGION_IDS } from "@/content/anatomy";
import { equipment } from "@/content/equipment";
import { photos } from "@/content/media";
import { imageryCredits, xrays } from "@/content/imagery";
import { galleryScenes } from "@/content/media";
import { getMotif, motifCategories, motifs } from "@/content/motifs";
import { practice } from "@/content/practice";
import { approach } from "@/content/practitioner";
import { afterItems, beforePanels, faqItems } from "@/content/advice";
import { consultationSteps, legacyRedirects, navigation, redFlags, secondaryPages } from "@/content/site";
import { practiceJsonLd, serializeJsonLd } from "@/lib/seo";

const root = join(__dirname, "../..");

describe("intégrité du contenu", () => {
  it("la navigation principale compte six entrées, dans l'ordre demandé", () => {
    expect(navigation.map((n) => n.label)).toEqual(["Accueil", "Ostéopathe", "Motifs", "Anatomie", "Cabinet", "Conseils"]);
  });
  it("la prise de rendez-vous reste accessible hors de la navigation principale (page dédiée)", () => {
    expect(secondaryPages.map((p) => p.href)).toContain("/rendez-vous");
  });
  it("les anciennes adresses redirigent vers des pages existantes", () => {
    for (const r of legacyRedirects) {
      expect(existsSync(join(root, `src/app${r.source}/page.tsx`)), r.source).toBe(false);
      expect(existsSync(join(root, `src/app${r.destination}/page.tsx`)), r.destination).toBe(true);
    }
  });
  it("aucune numérotation décorative dans les contenus (motifs, principes)", () => {
    for (const m of motifs) expect(Object.keys(m)).not.toContain("number");
    for (const p of approach.principles) expect(Object.keys(p)).not.toContain("number");
    for (const r of anatomyRegions) expect(Object.keys(r)).not.toContain("plate");
  });
  it("chaque famille de motifs désigne une région du modèle 3D", () => {
    for (const c of motifCategories) expect(REGION_IDS, c.id).toContain(c.region);
  });
  it("chaque entrée de navigation correspond à une vraie page", () => {
    for (const item of [...navigation, ...secondaryPages]) {
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
  it("chaque fiche motif appartient à exactement une catégorie", () => {
    const all = motifCategories.flatMap((cat) => cat.slugs);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual(motifs.map((m) => m.slug).sort());
  });
  it("aucune photographie ne représente une personne", () => {
    for (const p of Object.values(photos)) expect(p.showsPerson, p.id).toBe(false);
    for (const s of galleryScenes) expect(s.photo.showsPerson, s.id).toBe(false);
    for (const e of equipment) if (e.photo) expect(e.photo.showsPerson, e.id).toBe(false);
  });
  it("les photographies de personnes ne sont plus servies par le site", () => {
    for (const f of ["praticien-portrait.jpg", "praticien-bureau.jpg", "consultation-cervicales.jpg", "consultation-epaule.jpg", "equipement-percussion.jpg", "equipement-applicateur.jpg"]) {
      expect(existsSync(join(root, "public/images", f)), f).toBe(false);
    }
  });
  it("imagerie : fichier présent, licence commerciale, auteur et source renseignés", () => {
    const allowed = /^(Domaine public|CC0|CC BY(-SA)? \d\.\d)/;
    for (const i of [...Object.values(xrays), ...imageryCredits]) {
      expect(existsSync(join(root, "public", i.src)), i.src).toBe(true);
      expect(i.credit.license, i.id).toMatch(allowed);
      expect(i.credit.author.length, i.id).toBeGreaterThan(1);
      expect(i.credit.sourceUrl, i.id).toMatch(/^https:\/\//);
      expect(i.credit.licenseUrl, i.id).toMatch(/^https:\/\//);
    }
    for (const x of Object.values(xrays)) expect(imageryCredits, x.id).toContain(x);
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
  const corpus = JSON.stringify({ motifs, motifCategories, anatomyRegions, equipment, approach, consultationSteps, redFlags, photos, galleryScenes, xrays, beforePanels, afterItems, faq: faqItems() });
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

describe("page Conseils", () => {
  it("la FAQ couvre les huit questions demandées", () => {
    expect(faqItems().map((f) => f.id)).toEqual(["ordonnance", "duree", "tarif", "documents", "annulation", "enfant", "kine", "remboursement"]);
  });
  it("rappelle le cadre des manipulations cervicales (décret n° 2007-435)", () => {
    const docs = faqItems().find((f) => f.id === "documents");
    expect(docs?.answer.join(" ")).toMatch(/rachis cervical[^.]*diagnostic médical[^.]*2007-435/);
  });
  it("n'annonce jamais de réaction « normale » après la séance ni d'examen obligatoire", () => {
    const text = JSON.stringify({ beforePanels, afterItems, faq: faqItems() });
    expect(text).not.toMatch(/fatigue[^.]*normal|douleur[^.]*normal|normal[^.]*(fatigue|douleur)/i);
    expect(text).not.toMatch(/radiographie (est )?(obligatoire|nécessaire|indispensable)/i);
  });
  it("sans donnée validée, durée et tarifs renvoient vers la prise de rendez-vous (rien d'inventé)", () => {
    const byId = Object.fromEntries(faqItems().map((f) => [f.id, f.answer.join(" ")]));
    if (practice.consultationDuration.value === null) expect(byId.duree).toMatch(/prise de rendez-vous/);
    if (practice.fees.value === null) expect(byId.tarif).toMatch(/communiqués lors de la prise de rendez-vous/);
  });
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
