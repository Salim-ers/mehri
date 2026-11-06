# Déploiement

## Environnements (Vercel recommandé)

| Environnement | Branche | `NEXT_PUBLIC_REVIEW_MODE` | Indexation |
|---|---|---|---|
| Preview (relecture client) | toute branche / PR | `true` | non (robots `Disallow: /`) |
| Production | `main` | `false` | oui (`VERCEL_ENV=production`) |

## Variables

| Variable | Obligatoire | Exemple | Rôle |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | oui | `https://www.osteopathe-merhi-creil.fr` | Canonical, sitemap, Open Graph, JSON-LD — **nom de domaine à confirmer** |
| `NEXT_PUBLIC_REVIEW_MODE` | non (défaut `true`) | `false` | Badges de relecture |
| `ALLOW_INDEXING` | hors Vercel | `true` | Autorise l'indexation (robots.txt) |

Aucun secret n'est nécessaire. Les variables `NEXT_PUBLIC_*` et `robots.txt` sont figées **au build** : redéployer après modification.

## Procédure de publication

1. Obtenir les validations listées dans `CLIENT-VALIDATION.md` et mettre à jour `src/content/*.ts` (`toConfirm(...)` → `confirmed(...)`).
2. `npm run release:gate` doit réussir (typecheck, lint, tests, build, **contenu entièrement confirmé**).
3. `npm run test:e2e` (après build) — 91 tests.
4. Fusion sur `main` → la CI rejoue `verify` puis `release-gate` ; Vercel déploie.
5. Contrôles post-déploiement : pages en 200, `/robots.txt` autorise l'indexation, `/sitemap.xml`, en-têtes de sécurité (`curl -I`), appel `tel:` sur mobile, itinéraire, Search Console (soumettre le sitemap), Google Business Profile cohérent (adresse, téléphone, horaires).

## Retour arrière

Site 100 % statique sans données persistées : *Instant Rollback* Vercel vers le déploiement précédent. Aucune migration, aucune sauvegarde de base nécessaire.

## Hors Vercel

`npm ci && npm run build && npm start` (Node ≥ 20.9) derrière un proxy HTTPS. Le *proxy* Next.js (`src/proxy.ts`) nécessite le runtime Node/Edge (pas d'export statique pur).

## Maintenance

- Contenus : `src/content/` (typés, testés). Photos : `public/images/` (sources originales dans `assets/source/`).
- Polices : `scripts/prepare-assets.sh` (sous-ensemble + instanciation, fonttools).
- Dépendances : `npm audit`, mises à jour mensuelles (Next.js, three, R3F), puis `npm run verify && npm run test:e2e`.
- Mesures terrain : activer Vercel Speed Insights (ou CrUX) pour suivre LCP / INP / CLS au 75ᵉ centile — les mesures de laboratoire de QA-REPORT.md ne les remplacent pas.
