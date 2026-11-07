# Éléments à valider avec Mohamed Merhi

Liste générée et tenue à jour par `npm run check:content:report` (source : `src/content/`). Recherches effectuées le 6 novembre 2026.

## Validation du 6 novembre 2026

Questionnaire rempli le 6 novembre 2026 ([document de validation](https://claude.ai/artifact/9xT397w4NcfU4ZgJn43BTF)). Les 41 données sont tranchées : `npm run check:content` passe.

- **Validées et publiées :** nom, titre, adresse, téléphone, horaires, accessibilité, éditeur (QuadCore), hébergeur, photos et consentement, motifs, textes « Votre ostéopathe », page Équipements, fiches E·01 et E·06.
- **« Ne pas afficher » (`notPublished`) :** e-mail, tarifs (le site indique qu'ils sont communiqués à la prise de rendez-vous), plateforme de réservation (rendez-vous par téléphone), fiche Crenolibre, diplômes, ADELI/RPPS, assureur.
- **« Validé » sans valeur fournie, donc rien n'est affiché :** SIRET, publics pris en charge (ni nourrissons ni femmes enceintes), texte de parcours (le praticien demande qu'on en propose un), dénomination et usage des fiches E·02 à E·05 (seule l'observation est affichée).
- **À compléter dès que possible :** SIRET, adresse et directeur de la publication de l'éditeur, éléments de parcours pour rédiger le texte proposé.

Les sections suivantes gardent l'état initial pour mémoire.

## 1. Points d'attention prioritaires

1. **Photographies retouchées par IA.** Les fichiers fournis s'appellent « Image ChatGPT… ». Avant publication, confirmer par écrit qu'il s'agit de retouches de *vraies* photos du cabinet, que le praticien, les équipements et les lieux n'ont pas été modifiés, et que le texte des affiches anatomiques (illisible) n'est pas un artefact gênant. Si une image a été générée, elle ne doit pas être présentée comme une photo réelle.
2. **Personne visible en consultation** (pages Accueil, Votre ostéopathe, Déroulement, Équipements) : consentement écrit à la diffusion, ou confirmation qu'il s'agit d'un figurant.
3. **Équipements instrumentaux** (appareil de percussion, appareil à embout circulaire, table « de décompression ») : le décret n° 2007-435 encadre l'ostéopathie comme des manipulations et mobilisations *non instrumentales*. Valider avec le praticien (voire son assurance / organisation professionnelle) l'opportunité de présenter ces appareils et la manière d'en parler. La page reste factuelle et n'attribue aucun effet.
4. **Identité légale.** Le registre SIRENE mentionne une SELARL « MERHI » au 241 rue du Bois des Cerisiers (code d'activité 86.23Z, gérant « Habib Allah Merhi »). À clarifier : structure d'exercice réelle, SIRET, numéro ADELI/RPPS du praticien.
5. **Titre.** Un annuaire affiche « دكتور محمد مرعي » (« docteur ») : le site n'utilise jamais ce titre ; vérifier les autres supports.
6. **Avis Google** (note 4,9/5 indiquée par un annuaire) : non repris. Publiables uniquement via un widget officiel ou avec autorisation, sans sélection trompeuse.

## 2. Données à confirmer (valeur candidate affichée en mode relecture)

| Donnée | Valeur candidate | Source |
|---|---|---|
| Nom | Mohamed **Merhi** | Brief, logo, annuaires (« M. Merhi ») |
| Titre | Ostéopathe D.O. | Logo, Crenolibre |
| Adresse | 241 rue du Bois des Cerisiers, 60100 Creil — près du centre hospitalier | Annuaire ks-osteopathie.fr + SIRENE (l'ancienne adresse 59 rue du Plessis Pommeraye est volontairement écartée) |
| Téléphone | 06 79 02 50 27 | Crenolibre + ks-osteopathie.fr (identique) |
| Horaires | Lundi–samedi 9 h–20 h, dimanche fermé | Annuaire tiers uniquement (fiabilité faible) |
| Accessibilité | Accès, stationnement et sanitaires PMR | Annuaire tiers |
| Fiche Crenolibre | URL du brief | Même téléphone ; **aucun agenda actif ni créneau** au 06/11/2026 |
| Motifs de consultation | 8 fiches rédigées | Liste d'exemples du brief — à relire une par une |
| Textes « Votre ostéopathe » | Approche, 4 principes, philosophie | Rédaction QuadCore |
| Équipements | Tables Manuthera (marque lisible), modèles anatomiques | Observation des photos |
| Hébergeur | Vercel Inc. | Suggestion du brief |

## 3. Données à fournir (rien n'est affiché en production tant qu'elles manquent)

- Plateforme de réservation en ligne (ou confirmation : téléphone uniquement)
- Tarifs et moyens de paiement
- Diplôme, établissement de formation, année ; court texte de parcours
- Publics réellement pris en charge (adultes, sportifs, seniors, femmes enceintes, enfants, nourrissons)
- SIRET, n° ADELI/RPPS, assureur RC professionnelle, éditeur du site et directeur de publication
- Nom, usage et marquage CE des appareils (percussion, embout circulaire, table inclinable, table segmentée)
- Adresse e-mail professionnelle (facultatif)
- Nom de domaine définitif

## 4. Après validation

Passer chaque entrée en `confirmed(...)` dans `src/content/`, relancer `npm run release:gate`, puis déployer avec `NEXT_PUBLIC_REVIEW_MODE=false`.

## Refonte graphique du 6 novembre 2026

- **Aucune photographie de personne** n'est plus publiée : portrait, praticien au bureau, consultations et appareils tenus en main sont retirés du site (fichiers sources conservés dans `assets/source/`). Restent les trois vues des lieux vides : salle, tables, bureau.
- Les appareils de percussion et à embout circulaire sont décrits sans image : leurs seules photos montrent une personne.
- **Visuels anatomiques sous licence libre** (Wikimedia Commons, licences vérifiées le 06/11/2026) : radiographies du rachis lombaire et cervical, du bassin, du genou et de l'épaule, une vertèbre de collection et une gravure de 1798. Chaque image est légendée « sans lien avec un patient du cabinet » ; auteur, licence et source figurent dans les mentions légales. Détail : `assets/imagery-source/credits.json`.

## Refonte « Human Motion Studio » du 7 novembre 2026

Nouvelle page **Conseils** (préparer sa consultation, séance, après la séance, FAQ). Deux questions facultatives ont été ajoutées ; tant qu'elles restent sans réponse, la FAQ renvoie vers la prise de rendez-vous par téléphone (rien n'est inventé, la mise en production n'est pas bloquée) :

- **Durée habituelle d'une consultation** (`practice.consultationDuration`).
- **Consigne d'annulation** (délai de prévenance éventuel, `practice.cancellationPolicy`).

À relire par le praticien : les réponses générales de la FAQ (ordonnance, documents, différence avec la kinésithérapie, remboursement, consultation pour un enfant) et les quatre conseils de préparation (`src/content/advice.ts`). Aucune photographie de personne n'a été réintroduite (règle 4 de CLAUDE.md).
