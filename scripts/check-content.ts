/**
 * Production Quality Gate — contenu client.
 * Liste toutes les données non confirmées par le praticien.
 *   npm run check:content            → échoue (code 1) s'il en reste : bloque la mise en production
 *   npm run check:content -- --report → rapport sans échec (relecture)
 */
import { equipment, equipmentPageValidation } from "../src/content/equipment";
import { motifsValidation } from "../src/content/motifs";
import { practice } from "../src/content/practice";
import { approachValidation } from "../src/content/practitioner";
import { collectPending } from "../src/lib/facts";

const pending = collectPending({
  practice,
  motifs: motifsValidation,
  practitionerTexts: approachValidation,
  equipmentPage: equipmentPageValidation,
  equipment: equipment.map((e) => ({ name: e.name, usage: e.usage, role: e.role })),
});

const reportOnly = process.argv.includes("--report");

// « prebuild » : ne bloque que les builds de PRODUCTION (Vercel ou RELEASE_GATE=1)
if (process.argv.includes("--if-production")) {
  const production = process.env.VERCEL_ENV === "production" || process.env.RELEASE_GATE === "1";
  if (!production) process.exit(0);
  const problems: string[] = [];
  if (!process.env.NEXT_PUBLIC_SITE_URL) problems.push("NEXT_PUBLIC_SITE_URL n'est pas défini (domaine définitif requis).");
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== "false") problems.push("NEXT_PUBLIC_REVIEW_MODE doit valoir \"false\" en production.");
  if (problems.length) {
    for (const p of problems) console.error(`✗ ${p}`);
    process.exit(1);
  }
}
const blocking = pending.filter((p) => !p.optional);
if (pending.length === 0) {
  console.log("✓ Toutes les données client sont confirmées.");
  process.exit(0);
}
console.log(`${pending.length} donnée(s) à valider avec le praticien :\n`);
for (const p of pending) {
  console.log(`• [${p.status === "missing" ? "À FOURNIR" : "À CONFIRMER"}${p.optional ? " · facultatif" : ""}] ${p.path}`);
  console.log(`    ${p.ask}`);
  if (p.source) console.log(`    source actuelle : ${p.source}`);
}
if (!reportOnly && blocking.length > 0) {
  console.error(`\n✗ Mise en production bloquée : ${blocking.length} donnée(s) obligatoire(s) non confirmée(s).`);
  process.exit(1);
}
