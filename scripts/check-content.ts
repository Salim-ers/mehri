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
