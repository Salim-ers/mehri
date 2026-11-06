# Architecture

## Type de projet

**TYPE F (expérience digitale sur mesure) sur une base TYPE A (vitrine).** Aucune donnée utilisateur n'est collectée : pas de formulaire, pas de compte, pas de base de données. Architecture volontairement proportionnée : 100 % statique (prérendu), un seul *proxy* (404 réelles).

## Arborescence

```text
src/
├── app/                       # Routes (une page = une planche)
│   ├── layout.tsx             # Polices, JSON-LD cabinet, en-tête, transitions, barre mobile
│   ├── page.tsx               # Accueil
│   ├── motifs-de-consultation/[slug]/page.tsx   # 8 fiches prérendues (generateStaticParams)
│   ├── sitemap.ts · robots.ts · manifest.ts · not-found.tsx · error.tsx
│   └── globals.css            # Tokens (@theme), couches base / components
├── proxy.ts                   # 404 réelle pour une fiche inconnue (au lieu d'une « soft 404 »)
├── content/                   # SOURCE UNIQUE DE VÉRITÉ (typée)
│   ├── practice.ts            # Coordonnées, horaires, tarifs… sous forme de « Fact »
│   ├── anatomy.ts · motifs.ts · equipment.ts · media.ts · site.ts · practitioner.ts
├── lib/
│   ├── facts.ts               # Fact<T> : confirmed | to-confirm | missing + collectPending()
│   ├── contact-links.ts       # tel:, itinéraires, règle métier de réservation
│   ├── seo.ts                 # Métadonnées, Schema.org, sérialisation JSON-LD sûre
│   └── contrast.ts            # Calcul WCAG (testé)
├── components/
│   ├── layout/                # SiteHeader (menu <dialog>), Footer, MobileActionBar, SpineProgress, RouteTransition, IntroOverlay
│   └── shared/                # PlateHeader, AtlasPhoto, Reveal, BookingButton, Pending, RedFlags, SpineDrawing
├── features/
│   ├── anatomy/
│   │   ├── model/             # Logique 3D pure (sans React) : profil rachidien, géométries, squelette, animations, scheduler
│   │   └── components/        # HeroStage/HeroSpineScene, AtlasExplorer/AtlasScene, RegionViewer, BodyMap, RegionGlyph
│   ├── cabinet/               # Galerie + plein écran, illustration des tables
│   ├── consultation/          # Chronologie
│   └── contact/               # Plan Google Maps sur consentement
├── hooks/use-environment.ts   # mouvement réduit, WebGL (dont rendu logiciel), niveau d'appareil, visibilité
└── styles/tokens.ts           # Palette (testée contre globals.css)
```

## Données client : le modèle « Fact »

Chaque information du cabinet est un `Fact<T>` (`src/lib/facts.ts`) :

- `confirmed` : affichée normalement ;
- `to-confirm` : valeur candidate relevée sur une source publique (la source est tracée), affichée avec un badge en mode relecture ;
- `missing` : jamais inventée ; un encart « À fournir » n'apparaît qu'en mode relecture.

`npm run check:content` parcourt tout le contenu et **échoue** tant qu'une donnée obligatoire n'est pas confirmée → la CI bloque la production (job `release-gate`).

## Réservation

Constat (06/11/2026) : la fiche Crenolibre porte le même numéro (06 79 02 50 27) mais **aucun agenda actif, aucun créneau publié**, et son bouton renvoie vers l'accueil générique de la plateforme. Elle n'est donc pas utilisée comme parcours de réservation.

Règle métier (`resolveBookingAction`, testée) :

1. plateforme en ligne **confirmée** et en HTTPS → lien externe direct ;
2. sinon téléphone → `tel:+33679025027` ;
3. sinon page contact.

Aucun créneau n'est simulé. Pour activer une plateforme : renseigner `practice.onlineBookingUrl = confirmed("https://…")` — tous les boutons basculent.

### Option 2 — agenda interne (non implémentée, non déclarée opérationnelle)

Module supplémentaire à construire si le client le choisit : PostgreSQL (Neon), Drizzle, Auth.js (admin unique + MFA), Resend.
Modèle proposé : `services(id, label, duration_min, active)`, `opening_rules(weekday, start, end)`, `closures(starts_at, ends_at, reason)`, `appointments(id, service_id, starts_at, ends_at, status, patient_name, phone, email, cancel_token_hash, created_at)` avec contrainte d'exclusion `EXCLUDE USING gist (tstzrange(starts_at, ends_at) WITH &&) WHERE (status = 'confirmed')` contre les doubles réservations, création en transaction `SERIALIZABLE`, idempotence par clé de requête, limitation de débit, aucune donnée de santé (pas de champ « motif » libre). Tests requis avant mise en service : conflits concurrents, double clic, annulation, droits d'accès, échec d'envoi d'e-mail.

## 3D

- **Modèles procéduraux originaux** (`features/anatomy/model/`) : vertèbres construites à partir d'un profil anatomique moyen (`spine-profile.ts` : 7 C, 12 T, 5 L, dimensions en mm, courbures sagittales) — corps réniforme à taille concave, arc postérieur et foramen, processus épineux/transverses/articulaires, atlas et axis spécifiques (dent), disques, sacrum percé de 4 paires de foramens, coccyx. Squelette complet : côtes et cartilages, sternum, ceinture scapulaire, membres, bassin (aile iliaque galbée), crâne.
- **Pas de ressource tierce** → aucune contrainte de licence. Limite assumée : représentation pédagogique stylisée, pas un scan médical. Évolution possible : modèles scannés sous licence (ex. BodyParts3D, CC BY-SA) convertis en GLB Draco.
- **Une seule source de vérité** : le même profil génère la 3D et les dessins SVG (intro, transitions, version sans WebGL).
- **Performance** : construction découpée en tranches de 8 ms (`scheduler.ts`, générateurs + `scheduler.yield`) → aucune tâche longue ; matériaux partagés ; niveau de détail `low` sur mobile/appareils modestes ; DPR plafonné ; `frameloop="never"` hors écran ; chargement après l'évènement `load` + inactivité ; libération des géométries et matériaux au démontage.
- **Repli** : pas de WebGL, ou **rendu logiciel** (SwiftShader, llvmpipe…) → illustrations vectorielles, même contenu.
- **Animations articulaires** (`motion.ts`) : rotations autour de pivots anatomiques (axe local ou axe monde de repos), amplitudes physiologiques, fondu entre démonstrations, bouton pause (WCAG 2.2.2), désactivées par défaut en mouvement réduit.

## Motion design

- Intro : rendu serveur, disparition **100 % CSS** (jamais bloquante, même sans JS), sautée si déjà vue / économie de données / mouvement réduit, fermée à la première interaction.
- Transition de page : `<ViewTransition>` (React 19.3) + fil vertébral qui traverse l'écran (`RouteTransition`), sans `pointer-events`.
- Révélations : `IntersectionObserver` ; contenu présent dans le HTML et visible sans JS.
- `prefers-reduced-motion` respecté partout (CSS + 3D).

## SEO

Métadonnées uniques par page, canonical, Open Graph (image 1200×630), sitemap (19 URL), robots (indexation uniquement sur `VERCEL_ENV=production` ou `ALLOW_INDEXING=true`), JSON-LD `MedicalBusiness` + `Person` + `BreadcrumbList` + `MedicalWebPage`. Les champs non confirmés (horaires) ne sont pas publiés dans Schema.org ; aucune note ou avis n'est publié. Tout le contenu de l'atlas existe en HTML (section « Les sept régions, en texte »).

## Sécurité

Surface d'attaque minimale (aucune entrée utilisateur, aucun secret). En-têtes : CSP stricte (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `frame-src` limité à Google Maps), HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `poweredByHeader: false`.
**Compromis documenté** : `script-src 'unsafe-inline'` est nécessaire aux scripts d'amorçage de Next.js sur des pages statiques (un *nonce* imposerait un rendu dynamique de chaque page). Le risque est limité par l'absence de contenu utilisateur ; JSON-LD sérialisé en échappant `<`.

## Confidentialité (RGPD)

Pas de cookie au chargement, pas d'analytics, plan Google Maps chargé uniquement après clic, liens d'itinéraire externes en `noopener`. `sessionStorage` sert uniquement à ne pas rejouer l'intro.
