# Éléments à valider avec Mohamed Merhi

Liste générée et tenue à jour par `npm run check:content:report` (source : `src/content/`). Recherches effectuées le 6 novembre 2026.

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
