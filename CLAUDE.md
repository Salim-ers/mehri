# CLAUDE.md — règles du projet « Mohamed Merhi, ostéopathe »

Lire aussi `AGENTS.md` (Next.js 16 : consulter `node_modules/next/dist/docs/` avant d'utiliser une API) et `ARCHITECTURE.md`.

## Règles absolues

1. **Aucune donnée client inventée.** Toute information du cabinet passe par `Fact<T>` (`src/lib/facts.ts`) : `confirmed` uniquement après validation écrite du praticien ; sinon `toConfirm(valeur, source, question)` ou `missing(question)`. Ne jamais écrire en dur une adresse, un horaire, un tarif, un diplôme ou un public pris en charge dans un composant.
2. **Santé — conformité éditoriale.** Pas de promesse (guérison, résultat garanti, « dès la première séance »), pas de titre « Docteur », pas de nourrissons / femmes enceintes tant que non confirmés, pas d'avis ou témoignages sans autorisation. Le test `tests/unit/content.test.ts` vérifie ces interdits : l'étendre plutôt que l'affaiblir. Rappel : l'ostéopathe agit sur les troubles fonctionnels et oriente vers un médecin (décret n° 2007-435) ; manipulations cervicales = diagnostic médical préalable.
3. **Équipements** : description factuelle uniquement, aucun effet thérapeutique attribué.
4. **Aucune photographie de personne** (praticien, patients, mains, silhouettes) : seuls les lieux vides et le matériel (`content/media.ts`, `showsPerson: false`, vérifié par test). Les visuels anatomiques (radiographies, pièce osseuse, gravure) viennent de `content/imagery.ts` : licence autorisant l'usage commercial (domaine public, CC0, CC BY, CC BY-SA), auteur/licence/source affichés, légende « sans lien avec un patient du cabinet ». Préparation : `node scripts/prepare-imagery.mjs` (recadrage, niveaux de gris, métadonnées supprimées).
5. **Réservation** : jamais de faux créneaux. Passer par `resolveBookingAction` (`src/lib/contact-links.ts`).
6. **Production** : `npm run release:gate` doit réussir. Ne jamais contourner `check:content`.

## Conventions

- TypeScript strict + `noUncheckedIndexedAccess`. Pas de `any`, pas de désactivation ESLint.
- Logique 3D impérative dans `features/anatomy/model/` (classes / fonctions pures, testables en Node) ; les composants R3F se contentent d'appeler `update()` dans `useFrame` (règles React Compiler).
- Construction de géométrie : générateurs + `runAsync` (jamais de tâche > 50 ms). Libérer géométries et matériaux au démontage.
- Styles : tokens dans `src/styles/tokens.ts` **et** `@theme` de `globals.css` (un test vérifie la cohérence). Classes maison dans `@layer components` pour que les utilitaires Tailwind gardent la priorité.
- Toute animation : non bloquante, contenu présent dans le HTML, variante `prefers-reduced-motion`.
- Textes en français, typographie française (espaces insécables avant « : ; ? ! » quand pertinent, guillemets « »).
- Nouvelles pages : `pageMetadata()` + JSON-LD Breadcrumb, entrée dans `navigation` (6 entrées principales, ordre figé par un test) ou `secondaryPages` (le sitemap et les tests e2e s'appuient dessus).
- Direction artistique : ivoire, tons minéraux, anthracite ; pas de police mono, de quadrillage, de numéros de section ni de mentions « Planche / Fig. » (un test vérifie la feuille de style).
- Boutons de rendez-vous : `<BookingButton />` (lien `/rendez-vous` + `data-booking` qui ouvre le panneau `BookingDialog`).

## Commandes

```bash
npm run dev | build | start
npm run typecheck && npm run lint && npm run test
PLAYWRIGHT_CHROME_PATH=/usr/bin/google-chrome npm run test:e2e   # après build
npm run check:content:report                                      # données à valider
```

## Sécurité

Pas de secret dans le dépôt (`.env.example` seulement). CSP dans `next.config.ts` : toute nouvelle origine (analytics, plateforme de réservation intégrée en iframe…) doit y être ajoutée explicitement et justifiée. Aucune donnée de santé ne doit être collectée par le site.

## Évolutions prévues

- Plateforme de réservation confirmée → `practice.onlineBookingUrl = confirmed(url)` (+ `frame-src` si intégration officielle en iframe).
- Agenda interne : voir ARCHITECTURE.md › Option 2 (module distinct, PostgreSQL, tests de concurrence obligatoires avant mise en service).
- Administration des contenus : uniquement si le client le demande (aujourd'hui, contenus versionnés dans le dépôt).
