# Architecture

## Type de projet

**TYPE F (expérience digitale sur mesure) sur une base TYPE A (vitrine).** Aucune donnée utilisateur n'est collectée : pas de formulaire, pas de compte, pas de base de données. Architecture volontairement proportionnée : 100 % statique (prérendu), un seul *proxy* (404 réelles).

## Arborescence

```text
src/
├── app/
│   ├── layout.tsx             # Polices, JSON-LD cabinet, en-tête flottant, panneau de rendez-vous, barre mobile
│   ├── template.tsx           # Transitions de page (<ViewTransition>, types « to-anatomy », « to-cabinet », « to-reading »)
│   ├── page.tsx               # Accueil (ouverture cinématographique + chapitres 3D au défilement)
│   ├── anatomie/              # Explorateur 3D / radiographie (remplace /le-corps-en-mouvement, redirigée)
│   ├── conseils/              # Préparer son rendez-vous, séance, après, FAQ (remplace /deroulement-consultation, redirigée)
│   ├── motifs-de-consultation/[slug]/page.tsx   # 8 fiches prérendues (generateStaticParams)
│   ├── sitemap.ts · robots.ts · manifest.ts · not-found.tsx · error.tsx
│   └── globals.css            # Tokens (@theme), couches base / components, transitions de page
├── proxy.ts                   # 404 réelle pour une fiche inconnue (au lieu d'une « soft 404 »)
├── content/                   # SOURCE UNIQUE DE VÉRITÉ (typée)
│   ├── practice.ts            # Coordonnées, horaires, tarifs, durée… sous forme de « Fact »
│   ├── anatomy.ts             # 7 régions : cervicales, thorax, lombaires, bassin, épaules, hanches, genoux
│   ├── motifs.ts (+ 4 familles reliées à une région) · equipment.ts · practitioner.ts
│   ├── site.ts                # Navigation (6 entrées + RDV), redirections des anciennes adresses, étapes de séance
│   ├── advice.ts              # Page Conseils : préparation, après la séance, FAQ (réponses générales + faits validés)
│   ├── media.ts               # Photos du cabinet SANS personne (showsPerson: false, testé)
│   └── imagery.ts             # Radiographies, pièce osseuse, gravure : licences libres, crédits, cliché par région
├── lib/                       # facts.ts · contact-links.ts · seo.ts · contrast.ts
├── components/
│   ├── layout/                # SiteHeader (capsule + menu plein écran), Intro, BookingDialog, Footer, MobileActionBar
│   └── shared/                # PageIntro, Photo, Reveal, BookingButton, Pending, RedFlags, SpineDrawing, OpenOnHash
├── features/
│   ├── anatomy/
│   │   ├── model/             # Logique 3D pure, testée en Node : squelette, matériaux, rendus (looks), caméra (orbit), mise en scène (director)
│   │   ├── engine/            # Moteur unique : runtime (three.js), world.worker (OffscreenCanvas), host (fil principal), protocol
│   │   └── components/        # AnatomyStage (emplacement), AnatomyExplorer, MotifStage, RegionStage, RegionGlyph
│   ├── home/                  # HomeHero : scène collante + chapitres au défilement
│   ├── imagery/               # ImageCredit (légende obligatoire des images sous licence)
│   ├── cabinet/               # Visite photographique + plein écran, matériel (liste, vitrine)
│   ├── consultation/          # Illustrations au trait de la page Conseils
│   └── contact/               # Plan Google Maps sur consentement
├── hooks/use-environment.ts   # mouvement réduit (useSyncExternalStore), visibilité
└── styles/tokens.ts           # Palette (testée contre globals.css)
```

## Données client : le modèle « Fact »

Chaque information du cabinet est un `Fact<T>` (`src/lib/facts.ts`) :

- `confirmed` : affichée normalement ;
- `to-confirm` : valeur candidate relevée sur une source publique (la source est tracée), affichée avec un badge en mode relecture ;
- `missing` : jamais inventée ; un encart « À fournir » n'apparaît qu'en mode relecture.

`npm run check:content` parcourt tout le contenu et **échoue** tant qu'une donnée obligatoire n'est pas confirmée. Il est exécuté en **`prebuild`** : tout build de production (`VERCEL_ENV=production` ou `RELEASE_GATE=1`) échoue si une donnée n'est pas confirmée, si `NEXT_PUBLIC_SITE_URL` est absent ou si le mode relecture est actif. Les previews ne sont pas bloquées.

`content/practice.ts` (qui contient les sources et questions internes) n'est **jamais** importé par un composant client : un test parcourt le graphe d'imports de chaque fichier `"use client"` et vérifie que ces notes ne partent pas dans le JavaScript public (vérifié aussi dans `.next/static`). L'identité affichée (`identity`) est dérivée des faits, jamais écrite en dur.

## Réservation

Constat (06/11/2026) : la fiche Crenolibre porte le même numéro (06 79 02 50 27) mais **aucun agenda actif, aucun créneau publié**, et son bouton renvoie vers l'accueil générique de la plateforme. Elle n'est donc pas utilisée comme parcours de réservation.

Règle métier (`resolveBookingAction`, testée) :

1. plateforme en ligne **confirmée** et en HTTPS → lien externe direct ;
2. sinon téléphone → `tel:+33679025027` ;
3. sinon page contact.

Aucun créneau n'est simulé. Tous les boutons « Prendre rendez-vous » sont des liens vers `/rendez-vous` (fonctionnent sans JavaScript) ; avec JavaScript, `data-booking` ouvre le panneau `BookingDialog` (téléphone, horaires, adresse, itinéraire), disponible sur toutes les pages. Pour activer une plateforme : renseigner `practice.onlineBookingUrl = confirmed("https://…")` — tous les boutons basculent.

### Option 2 — agenda interne (non implémentée, non déclarée opérationnelle)

Module supplémentaire à construire si le client le choisit : PostgreSQL (Neon), Drizzle, Auth.js (admin unique + MFA), Resend.
Modèle proposé : `services(id, label, duration_min, active)`, `opening_rules(weekday, start, end)`, `closures(starts_at, ends_at, reason)`, `appointments(id, service_id, starts_at, ends_at, status, patient_name, phone, email, cancel_token_hash, created_at)` avec contrainte d'exclusion `EXCLUDE USING gist (tstzrange(starts_at, ends_at) WITH &&) WHERE (status = 'confirmed')` contre les doubles réservations, création en transaction `SERIALIZABLE`, idempotence par clé de requête, limitation de débit, aucune donnée de santé (pas de champ « motif » libre). Tests requis avant mise en service : conflits concurrents, double clic, annulation, droits d'accès, échec d'envoi d'e-mail.

## 3D

### Un moteur unique, hors du fil principal

- **Un seul squelette pour tout le site** (`engine/`) : construit une fois par visite, puis rattaché tour à tour aux emplacements de page (`<AnatomyStage>`). Le canvas est déplacé d'une page à l'autre (aucun contexte WebGL recréé, aucune reconstruction) ; il porte le nom de transition `anatomy-world`, si bien que le squelette « voyage » d'une page à l'autre pendant les transitions.
- **Web Worker + OffscreenCanvas** (`world.worker.ts`) : three.js, la construction du squelette, la compilation des shaders et le rendu ne touchent jamais le fil principal (aucune tâche longue liée à la 3D, défilement et interactions fluides). **Repli automatique** sur le fil principal (même `runtime.ts`, chargé à la demande) si le navigateur ne le permet pas.
- **Rendu à la demande** : boucle `requestAnimationFrame` du moteur arrêtée hors écran (IntersectionObserver), onglet masqué, ou quand rien ne bouge ; cadence divisée par deux sur appareil modeste lorsque seule la « présence » (va-et-vient lent) est active. Budget de pixels (3,6 Mpx / 1,3 Mpx) : un écran 4K ne fait pas exploser le coût GPU.
- **Plus de React Three Fiber ni de drei** : les scènes sont pilotées par messages (`protocol.ts`) ; ombre de contact = texture calculée (aucun rendu supplémentaire), environnement = PMREM unique sur appareils puissants.
- **Repli** : pas de WebGL, `?no-webgl`, ou **rendu logiciel** (SwiftShader, llvmpipe… détecté dans le moteur) → illustrations vectorielles, même contenu.

### Rendus et mise en scène

- **Modèles procéduraux originaux** (`model/`) : vertèbres construites à partir d'un profil anatomique moyen (`spine-profile.ts` : 7 C, 12 T, 5 L, dimensions en mm, courbures sagittales), squelette complet. Pas de ressource tierce. Représentation pédagogique stylisée, jamais présentée comme un examen.
- **Deux familles de matériaux** (`materials.ts`) : matière osseuse (patch de shader : matérialisation de haut en bas avec liseré bronze, découpe par la ligne radiographique ; la colonne est légèrement plus lumineuse) et radiographie (densité additive selon l'angle de vue).
- **Bascule os ↔ radiographie** (`looks.ts`) : chaque os a un jumeau radiographique qui partage sa géométrie ; une ligne horizontale balaie le squelette (os en dessous, radiographie au-dessus). Masquage par calques de rendu (jamais `visible = false`, qui masquerait les os rattachés).
- **Mise en évidence / isolement** : la région choisie passe en bronze, les autres s'atténuent ou deviennent une silhouette radiographique fantôme.
- **Caméra** (`orbit.ts`, `director.ts`) : poses (cible, angles, distance, décentrage d'objectif) amorties indépendamment de la cadence ; cadrages propres à chaque format (portrait, tablette, ordinateur, ultralarge) et à chaque mode (accueil, explorateur, motifs, fiche), testés.
- **Accueil** : ouverture (colonne d'abord, puis squelette, lumière qui tourne, caméra qui recule), puis chapitres au défilement : nuque (rotation), épaule (élévation), bassin (bascule), puis balayage radiographique.
- **Explorateur** : rotation au glisser (doigt horizontal, souris), zoom borné (boutons, pincement, Ctrl + molette — la molette seule fait toujours défiler la page), clic sur un os = sélection de sa région, isolement, mouvement propre à chaque région.
- **Animations articulaires** (`motion.ts`) : rotations autour de pivots anatomiques, amplitudes physiologiques, fondu entre démonstrations ; bouton pause partout (WCAG 2.2.2) ; en mouvement réduit, aucune animation automatique (lecture à la demande).

## Motion design

- **Ouverture** (`Intro.tsx`, accueil uniquement, à l'arrivée sur le site) : fond graphite, monogramme au reflet bronze, ligne lumineuse qui dessine la colonne, vertèbres qui apparaissent, puis la scène se resserre et révèle l'accueil. Rendu serveur, disparition 100 % CSS (≈ 2,7 s, même sans JavaScript), sautée au premier geste, jamais rejouée par la navigation interne, absente en mouvement réduit. Le titre de l'accueil est peint dès le premier affichage (LCP) ; seule sa position s'anime.
- **Transitions de page** (`template.tsx` + `transitionTypes` des liens) : vers l'anatomie, la lumière baisse et un masque arrondi dévoile la scène sombre ; vers le cabinet, la fenêtre photographique de l'accueil s'agrandit et devient la page ; des Motifs vers les Conseils, le panneau de lecture s'ouvre et devient la page ; sinon, fondu et légère montée. L'en-tête reste fixe ; le bouton « Précédent », les liens directs et le chargement n'en dépendent jamais (amélioration progressive).
- **En-tête** : capsule flottante qui se resserre au défilement (animation CSS pilotée par le défilement, sans JavaScript) ; menu plein écran avec vignette (photo ou cliché) et accès direct au rendez-vous.
- **Défilement** : fenêtres photographiques qui s'ouvrent (clip-path arrondi), parallaxe, ligne de temps de la séance qui se remplit (`animation-timeline: view()`, amélioration progressive).
- **Micro-interactions** : reflet lumineux des boutons capsule, flèches qui avancent, accordéons animés (`::details-content`, `interpolate-size`).
- Animations sur `transform`, `opacity`, `clip-path` ; aucun `backdrop-filter` ; `prefers-reduced-motion` respecté partout (CSS, transitions de page, 3D).

## SEO

Métadonnées uniques par page, canonical, Open Graph (image 1200×630), sitemap (19 URL ; anciennes adresses redirigées en 308), robots (indexation uniquement sur `VERCEL_ENV=production` ou `ALLOW_INDEXING=true`), JSON-LD `MedicalBusiness` + `Person` + `BreadcrumbList` + `MedicalWebPage` + `FAQPage` (Conseils). Les horaires ne sont publiés dans Schema.org qu'une fois confirmés ; adresse et téléphone (candidats concordants sur deux sources) le sont, la production restant bloquée tant qu'ils ne sont pas confirmés. Aucune note ni aucun avis n'est publié. Image Open Graph par défaut sur toutes les pages ; `noindex` sur les préproductions. Tout le contenu de l'anatomie existe en HTML (section « Les régions en détail »).

## Sécurité

Surface d'attaque minimale (aucune entrée utilisateur, aucun secret). En-têtes : CSP stricte (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `frame-src` limité à Google Maps), HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `poweredByHeader: false`.
**Compromis documenté** : `script-src 'unsafe-inline'` est nécessaire aux scripts d'amorçage de Next.js sur des pages statiques (un *nonce* imposerait un rendu dynamique de chaque page). Le risque est limité par l'absence de contenu utilisateur ; JSON-LD sérialisé en échappant `<`.

## Confidentialité (RGPD)

Pas de cookie au chargement, pas d'analytics, plan Google Maps chargé uniquement après clic, liens d'itinéraire externes en `noopener`. Aucun stockage navigateur.
