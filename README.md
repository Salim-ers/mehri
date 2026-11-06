# Mohamed Merhi — Ostéopathe D.O. à Creil

Site vitrine premium, multipage et immersif réalisé par **QuadCore**.
Concept : **« Atlas du mouvement »** — chaque page est une *planche* d'atlas anatomique (numéro, intitulé latin, légendes techniques), avec une colonne vertébrale 3D en ouverture, un squelette interactif et les photographies réelles du cabinet.

> ⚠️ Le site est livré en **mode relecture** : les informations non confirmées par le praticien sont signalées par des badges « À confirmer / À fournir ». La mise en production est bloquée tant que `npm run check:content` échoue. Voir [CLIENT-VALIDATION.md](./CLIENT-VALIDATION.md).

## Stack

| Domaine | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 16.4 (App Router, Cache Components, Turbopack) | Pages statiques prérendues, SEO, `next/image` (AVIF/WebP) |
| UI | React 19.3, TypeScript strict, Tailwind CSS 4 | `<ViewTransition>` natif pour les transitions de page |
| 3D | three 0.187, @react-three/fiber 9, @react-three/drei 10 | Modèles anatomiques **procéduraux originaux** (aucune licence tierce) |
| Animations | CSS + IntersectionObserver + R3F | Pas de GSAP / Motion : inutile ici, moins de JavaScript |
| Backend | Aucun | Pas de saisie utilisateur : pas de formulaire, pas de base de données |
| Tests | Vitest 5, Playwright 1.65, axe-core | Unitaires, end-to-end, accessibilité |
| Polices | Newsreader (titres), Instrument Sans (texte), IBM Plex Mono (légendes) | Auto-hébergées, sous-ensemble latin (~140 Ko au total) |

Aucune base de données : le contenu est typé dans `src/content/` (source unique de vérité). La réservation passe par le **téléphone vérifié** ; une plateforme en ligne remplacera automatiquement l'appel dans tous les boutons dès qu'elle sera confirmée (voir ARCHITECTURE.md › Réservation).

## Prérequis

- Node.js ≥ 20.9 (testé avec Node 22.23)
- npm 10

## Installation et démarrage

```bash
npm ci
cp .env.example .env.local   # ajuster NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build de production / serveur |
| `npm run typecheck` | TypeScript strict (`noUncheckedIndexedAccess`) |
| `npm run lint` | ESLint (config Next.js + React Compiler rules) |
| `npm run test` | Tests unitaires (contenu, réservation, contrastes, modèles 3D) |
| `npm run test:e2e` | Playwright (desktop + mobile, responsive 320 → 3840 px, axe) — nécessite un build |
| `prebuild` (automatique) | Refuse un build de **production** si des données client ne sont pas confirmées |
| `npm run check:content` | **Garde-fou de publication** : échoue s'il reste des données client non confirmées |
| `npm run check:content:report` | Même rapport, sans échec |
| `npm run verify` | typecheck + lint + tests + build |
| `npm run release:gate` | `verify` + `check:content` (à exécuter avant toute mise en production) |

Tests end-to-end sans navigateurs Playwright téléchargés : `PLAYWRIGHT_CHROME_PATH=/usr/bin/google-chrome npm run test:e2e`.

## Pages

| URL | Contenu |
|---|---|
| `/` | Accueil — colonne 3D dans la lumière, nom, rendez-vous, adresse ; squelette radiographique ; motifs en radiographies ; cabinet |
| `/osteopathe` | L'ostéopathe — approche, principes, qualification confirmée (aucun portrait) |
| `/motifs-de-consultation` + 8 fiches | Pourquoi consulter ? — sélection des zones (3D radiographique), 4 familles dépliables |
| `/le-corps-en-mouvement` | Corps en mouvement — explorateur 3D (7 régions, `?region=genoux`), mouvements articulaires |
| `/cabinet` | Le cabinet — galerie empilée (lieux vides), matériel, accès |
| `/rendez-vous` | Prendre rendez-vous — téléphone, horaires, adresse (aussi en panneau sur toutes les pages) |
| `/equipements`, `/deroulement-consultation`, `/contact` | Pages complémentaires (pied de page, menu) |
| `/mentions-legales`, `/confidentialite` | Pages légales (dont crédits des images sous licence) |

## Paramètres utiles

- `?no-webgl` : force la version sans 3D (illustrations vectorielles).
- `?force-webgl` : force la 3D même sur un rendu logiciel (tests automatisés sans GPU).
- `NEXT_PUBLIC_REVIEW_MODE=false` : masque les badges de relecture.

## Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md). Résultats des tests : [QA-REPORT.md](./QA-REPORT.md). Architecture : [ARCHITECTURE.md](./ARCHITECTURE.md).
