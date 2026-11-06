import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = resolve(__dirname, "../../src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mts)$/.test(f) ? [p] : [];
  });
}

function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) if (existsSync(base + ext) && statSync(base + ext).isFile()) return base + ext;
  return null;
}

function importsOf(file: string): string[] {
  const code = readFileSync(file, "utf8");
  const specs = [...code.matchAll(/^\s*import\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/gm)].map((m) => m[1]!);
  return specs.map((s) => resolveImport(file, s)).filter((x): x is string => x !== null);
}

const files = walk(SRC);
const clientEntries = files.filter((f) => /^["']use client["']/.test(readFileSync(f, "utf8").trimStart()));

describe("frontière serveur / client", () => {
  it("aucun composant client n'embarque les notes internes de practice.ts (sources, questions au praticien)", () => {
    const practice = join(SRC, "content/practice.ts");
    for (const entry of clientEntries) {
      const seen = new Set<string>();
      const stack = [entry];
      while (stack.length) {
        const f = stack.pop()!;
        if (seen.has(f)) continue;
        seen.add(f);
        stack.push(...importsOf(f));
      }
      expect(seen.has(practice), `${entry.replace(SRC, "src")} importe (indirectement) content/practice.ts`).toBe(false);
    }
  });
});

describe("conformité éditoriale des pages et composants", () => {
  const corpus = files
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const forbidden = [/guéri(r|son|t)/i, /(résultat|soulagement|efficacité)s?\s+garanti/i, /\bgarantit\b/i, /miracl/i, /dès la première séance/i, /\bdocteur\b/i, /témoignage/i, /il vous rappellera/i, /\bD\.O\.\s*\(dipl/i];
  for (const re of forbidden) {
    it(`ne contient pas ${re}`, () => expect(corpus).not.toMatch(re));
  }
  it("aucune identité du praticien écrite en dur dans les composants", () => {
    expect(corpus).not.toMatch(/Mohamed Merhi|MERHI|Ostéopathe D\.O\./);
  });
});
