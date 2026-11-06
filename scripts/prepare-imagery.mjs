/**
 * Prépare l'imagerie anatomique sous licence libre (radiographies, pièce osseuse, gravure).
 * Entrée : assets/imagery-source/ (originaux Wikimedia Commons + credits.json, voir CLIENT-VALIDATION.md)
 * Sortie : public/images/anatomie/*.jpg — recadrés (suppression des marqueurs « R », échelles,
 * initiales), convertis en niveaux de gris pour les radiographies, métadonnées supprimées
 * (un original contient des coordonnées GPS), côté long limité à 2400 px.
 *
 *   node scripts/prepare-imagery.mjs [--preview <dossier>]
 */
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = join(ROOT, "assets/imagery-source");
const previewIndex = process.argv.indexOf("--preview");
const OUT = previewIndex > 0 ? resolve(process.argv[previewIndex + 1]) : join(ROOT, "public/images/anatomie");
const MAX = previewIndex > 0 ? 640 : 2400;

/** Recadrages en fraction de l'image (haut, droite, bas, gauche) et traitement. */
const JOBS = [
  { file: "xray-lumbar-lateral.jpg", out: "radiographie-rachis-lombaire.jpg", crop: [0.05, 0.04, 0.02, 0.02], xray: true, gamma: 1.15 },
  { file: "xray-cervical-lateral.jpg", out: "radiographie-rachis-cervical.jpg", crop: [0.01, 0.13, 0.01, 0.01], xray: true },
  { file: "xray-pelvis-ap.jpg", out: "radiographie-bassin.jpg", crop: [0.01, 0.01, 0.01, 0.02], xray: true },
  { file: "xray-knee-lateral.jpg", out: "radiographie-genou.jpg", crop: [0.01, 0.01, 0.01, 0.14], xray: true },
  { file: "xray-shoulder-ap.jpg", out: "radiographie-epaule.jpg", crop: [0.02, 0.05, 0.02, 0.21], xray: true },
  { file: "specimen-vertebra-thoracic.jpg", out: "vertebre-thoracique.jpg", crop: [0, 0, 0, 0], xray: false },
  { file: "engraving-vertebral-column.jpg", out: "gravure-colonne-vertebrale.jpg", crop: [0.06, 0.02, 0.03, 0.02], xray: false, engraving: true },
];

mkdirSync(OUT, { recursive: true });

for (const job of JOBS) {
  const input = sharp(join(SRC, job.file));
  const { width = 0, height = 0 } = await input.metadata();
  const [t, r, b, l] = job.crop;
  const region = {
    left: Math.round(width * l),
    top: Math.round(height * t),
    width: Math.round(width * (1 - l - r)),
    height: Math.round(height * (1 - t - b)),
  };
  let img = sharp(join(SRC, job.file)).extract(region).flatten({ background: "#000000" });
  if (job.xray) img = img.grayscale().normalise({ lower: 1, upper: 99.5 }).gamma(job.gamma ?? 1.0);
  if (job.engraving) img = img.modulate({ saturation: 0.35, brightness: 1.03 }).linear(1.08, -10);
  const info = await img
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(join(OUT, job.out)); // sans .withMetadata() : EXIF/GPS supprimés
  console.log(`${job.out}  ${info.width}×${info.height}`);
}
