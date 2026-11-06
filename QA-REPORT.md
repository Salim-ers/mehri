# Rapport qualité — Production Quality Gate QuadCore

Date : 6 novembre 2026 · Build : Next.js 16.4.5 · Environnement : conteneur Linux, Node 22.23, Chrome 1xx headless (rendu WebGL **logiciel** SwiftShader, sans GPU).

## 1. Vérifications exécutées

| Contrôle | Commande | Résultat |
|---|---|---|
| TypeScript strict | `npm run typecheck` | ✅ 0 erreur |
| ESLint (Next + règles React Compiler) | `npm run lint` | ✅ 0 erreur, 0 avertissement |
| Tests unitaires | `npm run test` | ✅ 44/44 |
| Build de production | `npm run build` | ✅ 28 routes prérendues (statique / PPR) |
| Tests end-to-end | `npm run test:e2e` | ✅ 91/91 (desktop 1440 px + mobile Pixel 7) |
| Accessibilité axe-core WCAG 2.2 A/AA | inclus e2e | ✅ 0 violation *serious/critical* sur les 12 pages |
| Garde-fou contenu | `npm run check:content` | ⛔ **échoue volontairement** : 40 données obligatoires à confirmer (voir CLIENT-VALIDATION.md) |

### Couverture des tests unitaires
Règles de réservation (URL en ligne confirmée/HTTPS seulement, repli téléphone, puis contact) · liens `tel:` et itinéraires · collecte des données non confirmées · intégrité du contenu (pages, slugs, régions ↔ motifs, photos existantes, dimensions réelles) · **conformité éditoriale santé** (aucune promesse de guérison/résultat, pas de « docteur », pas de nourrissons/grossesse, pas de témoignages) · JSON-LD (échappement, horaires non confirmés non publiés) · contrastes WCAG des couples de couleurs + cohérence tokens/CSS · modèle 3D (7 C/12 T/5 L, longueur, courbures, géométries finies, squelette dans une enveloppe humaine, retour exact au repos après animation, découpage narratif).

### Couverture end-to-end
Chargement 200 + H1 unique + titre/canonical uniques + 0 erreur console sur 12 pages · menu `<dialog>` (Échap, retour du focus, navigation) · 404 réelles (page et fiche inconnue) · écran d'ouverture (affichage, disparition automatique, fermeture à l'interaction, non rejoué dans la session, mouvement réduit) · CTA → page RDV → `tel:+33679025027`, aucune fausse disponibilité · itinéraires Google/Waze, plan chargé **seulement après clic** · atlas : sélection clavier, URL `?region=` partageable, lien vers le motif, canvas 3D monté, pause, version sans WebGL utilisable, texte complet indexable · accueil : colonne 3D montée, défilement jamais bloqué, **repli automatique sur rendu logiciel** · en-têtes de sécurité (CSP sans `unsafe-eval`, nosniff, referrer, pas de `x-powered-by`) · sitemap (19 URL) / robots · **aucun débordement horizontal à 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560 et 3840 px** sur toutes les pages · barre d'action mobile (visible < 1024 px, cibles ≥ 44 px, ne masque pas le pied de page) · paysage mobile.

## 2. Performance — mesures de laboratoire (Lighthouse 12)

Profil « mobile » = Moto G simulé, Slow 4G, CPU ×4. Serveur `next start` local. **Ce ne sont pas des données terrain (CrUX) : les objectifs LCP ≤ 2,5 s / INP ≤ 200 ms / CLS ≤ 0,1 au 75ᵉ centile restent à mesurer en production.**

| Page | Profil | Perf. | A11y | Bonnes pratiques | SEO* | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|---|
| / | mobile | 93 | 100 | 100 | 69 | 1,1 s | 2,9 s | 40 ms | 0 |
| / | desktop | 97 | 100 | 100 | 69 | 0,3 s | 0,7 s | 0 ms | 0 |
| /osteopathe | mobile | 91 | — | — | — | — | 3,3 s | 130 ms | 0 |
| /osteopathe | desktop | 100 | 100 | 100 | 69 | 0,3 s | 0,8 s | 0 ms | 0 |
| /le-corps-en-mouvement | mobile | 93 | 100 | 100 | 69 | 1,1 s | 3,2 s | 90 ms | 0 |
| /le-corps-en-mouvement | desktop | 100 | 100 | 100 | 69 | 0,3 s | 0,6 s | 0 ms | 0 |
| /rendez-vous | mobile | 93 | 100 | 100 | 69 | 1,1 s | 3,2 s | 60 ms | 0 |
| /rendez-vous | desktop | 100 | 100 | 100 | 69 | 0,3 s | 0,7 s | 0 ms | 0 |

\* SEO 69 = uniquement l'audit « page bloquée à l'indexation » : comportement voulu hors production (`robots.txt` → `Disallow: /`).

**Important** : le navigateur de test n'ayant pas de GPU, le site bascule (volontairement) sur les illustrations vectorielles ; ces chiffres ne mesurent donc pas le coût de la 3D. Avec la 3D forcée sur rendu logiciel, le TBT explose (rendu WebGL sur CPU) — c'est précisément pourquoi le repli automatique existe. Mesures complémentaires : construction des modèles en Node — colonne 138 ms (low) / 183 ms (high), squelette 169 / 274 ms — désormais **découpée en tranches de 8 ms** (aucune tâche longue). JavaScript initial ≈ 145 Ko compressés, three.js chargé uniquement après `load` + inactivité. Polices : 280 Ko → 78 Ko (Newsreader instanciée et sous-ensemble latin).

**À mesurer sur appareils réels** : fluidité 3D (fps) sur iPhone récent, Android milieu de gamme, tablette ; INP réel lors des interactions de l'atlas ; Vercel Speed Insights après mise en ligne.

## 3. Sécurité

Vérifié : en-têtes (test e2e), absence de secret (aucun n'est nécessaire), aucun formulaire ni entrée utilisateur, JSON-LD échappé, liens externes `noopener noreferrer`, Google Maps uniquement après action, 404 réelles via `proxy.ts`. Limite connue : `script-src 'unsafe-inline'` (scripts d'amorçage Next.js sur pages statiques, voir ARCHITECTURE.md). `npm audit --omit=dev` : **0 vulnérabilité** dans les dépendances de production ; `npm audit` complet : 8 vulnérabilités *modérées* dans l'outillage de développement (à suivre, non embarquées dans le site).

## 4. Revue critique (seconde lecture)

Une seconde analyse du code a été réalisée par un agent distinct n'ayant pas écrit le code (voir section 6). **Ce n'est pas un audit indépendant** au sens du Quality Gate : même famille d'IA. Un audit humain est recommandé avant mise en production.

## 5. Tableau d'acceptation

| Domaine | Statut | Observations |
|---|---|---|
| Architecture | ✅ Validé | Contenu typé (source unique), logique 3D isolée et testée, aucune dépendance superflue |
| Frontend | ✅ Validé | 11 largeurs testées sans débordement, desktop + mobile e2e |
| Backend | ⚪ Non applicable | Vitrine statique ; agenda interne non commandé (conception fournie) |
| Database | ⚪ Non applicable | Aucune donnée persistée |
| Sécurité | 🟡 Partiellement validé | En-têtes vérifiés ; `unsafe-inline` documenté ; audit humain recommandé |
| UX/UI | ✅ Validé (à présenter) | Direction « Atlas du mouvement » ; validation esthétique par le client à obtenir |
| Motion | ✅ Validé | Non bloquant, mouvement réduit, pause des animations, repli sans GPU |
| SEO | 🟡 Partiellement validé | Fondations complètes ; domaine, Search Console et fiche Google à finaliser |
| Performance | 🟡 Partiellement validé | Mesures labo correctes ; données terrain et fps sur appareils réels à obtenir |
| Tests | ✅ Validé | 44 unitaires + 91 e2e exécutés et réussis |
| Documentation | ✅ Validé | README, ARCHITECTURE, DEPLOYMENT, CLAUDE.md, CLIENT-VALIDATION |
| Déploiement | 🔴 À finaliser | Bloqué tant que les données client ne sont pas confirmées (`check:content`) |

**Statut global : non « Production Ready »** — contrôle bloquant non résolu : validation des données et autorisations du client.
