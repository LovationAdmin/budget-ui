# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Site public et application web installable (PWA, `vite-plugin-pwa`), utilisée surtout sur téléphone et aussi sur ordinateur.

## Users

Toute personne qui veut budgétiser et planifier ce qui compte, **seule ou à plusieurs, sans priorité entre ces cas** (confirmé) :

- une personne seule (budget perso, étudiant) ;
- un couple, une famille avec enfants ;
- des colocataires ou des amis ;
- un projet avec un objectif et une date (voyage, mariage, travaux, voiture, apport).

« Famille » s'entend au sens large. Quand deux besoins s'opposent, aucun de ces cas ne l'emporte d'office : la solution doit marcher seul comme à plusieurs.

## Product Purpose

Savoir chaque mois ce qui entre, ce qui sort, ce qui est mis de côté et ce qu'il reste, et préparer le mois suivant. Réussir, c'est qu'un foyer ouvre son mois, le comprenne d'un coup d'œil et le tienne à jour sans effort.

## Positioning

Ce qui distingue Budget Famille (confirmé) :

- **Gratuit** : l'application complète, sans carte bancaire.
- **Données sécurisées** : chiffrées avant d'être enregistrées (AES-256-GCM), conformes au RGPD ; aucune connexion bancaire obligatoire.
- **Assistant IA** : outils intelligents (simulateur d'économies par pays, `/outils-ia`), catégorisation des opérations.
- **Gestion collaborative** : un même budget partagé entre plusieurs membres invités, avec le pot commun et la part de chacun.
- **Facile et lisible** : le vocabulaire du foyer, un mois à la fois, aucun jargon comptable.

Phrase de présentation : « L'application de budget gratuite pour la famille, le couple, la coloc et vos projets. » Dès qu'on présente l'application, dire au moins une fois « seul ou à plusieurs » (`docs/brand.md`).

## Operating Context

- Rituel mensuel : le récapitulatif part le 27, quand les salaires tombent, et prépare le mois qui arrive.
- Plusieurs membres modifient le même budget ; l'enregistrement est automatique et chaque changement peut être annulé.
- Marché principal : la France ; des pages en anglais, en chinois et pour le Québec existent (`docs/i18n.md`, `docs/referencement-international.md`).
- Acquisition par le référencement : blog, outils gratuits et modèle imprimable.

## Capabilities and Constraints

- Budget mensuel : entrées du pot commun, charges, épargne, reste ; mois clôturés figés, que l'on rouvre explicitement.
- Outils gratuits sans compte : calcul du reste à vivre, budget couple, colocation, mariage, budget perso ; modèle de budget à imprimer.
- **Premium est annoncé « bientôt »** : aucun prix, rien n'est achetable. Il apportera la synchronisation bancaire (Enable Banking) et le prévu face au réel. Ne jamais présenter Premium comme disponible.
- Thème sombre réservé aux écrans connectés ; les pages publiques restent claires.

## Brand Commitments

Nom « Budget Famille », logo « Sous le même toit » et ses règles d'usage : `docs/brand.md` (fichiers dans `public/brand/`). Ton simple et chaleureux, celui du foyer : « entrées du pot commun », « charges », « épargne », « reste ».

## Evidence on Hand

- **Aucune preuve sociale pour l'instant** (confirmé) : ni témoignage, ni nombre d'utilisateurs, ni presse. N'en inventer aucune, même en exemple.
- La preuve disponible, c'est le produit lui-même : mode démo de l'application, démonstration Premium (`src/components/premium/PremiumDemo.tsx`), outils gratuits utilisables sans compte, modèle imprimable (`public/`).

## Product Principles

1. **Seul ou à plusieurs, à égalité** : rien ne suppose qu'il y a un couple, ni qu'il n'y a qu'une personne.
2. **Un mois à la fois** : le mois est le cœur ; les autres écrans y renvoient.
3. **Le passé ne bouge pas** : un mois clôturé est figé, toute modification dit ce qui va changer.
4. **Dire ce qui va se passer** : chaque changement annonce sa portée et peut être annulé.
5. **Gratuit, sûr et lisible avant tout** : une fonction qui complique la lecture du mois doit le justifier.

## Accessibility & Inclusion

Repris du code existant (`docs/DESIGN.md`) : contraste WCAG AA, cibles tactiles de 44 px, focus visible, lien d'évitement, respect de `prefers-reduced-motion`, la couleur n'est jamais le seul porteur de sens. Le public est large (étudiants comme familles, plusieurs langues) : textes courts et sans jargon.
