# Faire connaître le site là où les gens sont déjà

Constat du 13 novembre 2026 (Metricool, Search Console, Bing) :

- Les posts Facebook et Instagram touchent 0 à 6 personnes chacun, sans clic :
  les comptes n'ont presque pas d'abonnés.
- Ce qui amène des visites, c'est la recherche, et d'abord le modèle gratuit :
  183 clics sur Bing et 72 sur Google en trois mois pour
  `/tableau-budget-familial-gratuit`.
- Bing ne connaît aucun lien entrant : c'est ce qui retient Google
  (`docs/netlinking.md`).

D'où trois actions, réunies dans un kit à copier :
**https://www.budgetfamille.com/social/croissance-2026-11/kit.html**

## 1. Pinterest

Pinterest est un moteur de recherche d'images : on y cherche des grilles de
budget à imprimer, et une épingle continue d'amener des visites pendant des
mois. Le kit contient 5 épingles (image 1000 × 1500, titre, description, lien
avec `utm_source=pinterest`) : le modèle en français, en anglais et en
espagnol, et la règle 50/30/20 en anglais et en espagnol.

1. Créer un compte professionnel « Budget Famille » (gratuit) et revendiquer
   le site budgetfamille.com dans ses réglages.
2. Créer trois tableaux : « Budget familial », « Budgeting printables »,
   « Finanzas personales ».
3. Publier une épingle par jour plutôt que cinq d'un coup.
4. Ajouter le compte à `SOCIAL_PROFILES` (`src/seo/site.ts`) et, s'il est
   connecté à Metricool, à `docs/social/config.md`.

Les images viennent de `public/images/modele/` (aperçus des PDF). Pour une
nouvelle épingle, reprendre le même format : fond bleu de la marque, titre,
aperçu, adresse du site.

## 2. Groupes et forums

Six messages prêts (trois en français, deux en espagnol, un en anglais) pour
les groupes de budget, de colocation, de mariage et de finances personnelles.

- Depuis un profil personnel, un groupe à la fois, après avoir lu ses règles
  sur les liens. Un message par groupe, jamais le même jour partout.
- Répondre aux commentaires : c'est ce qui fait remonter la publication.
- Ne pas publier là où les liens sont interdits : proposer le lien en
  commentaire si quelqu'un le demande.

## 3. Prises de contact

Cinq messages pour les sites à formulaire de `docs/netlinking.md` (Copeps,
Finactuel, Empruntis, Moneyvox, INC). Les deux Points conseil budget ont reçu
leur e-mail le 13 novembre 2026. Mettre à jour la colonne « Statut » de
`docs/netlinking.md` à chaque envoi et réponse.

## 4. Les personnes déjà inscrites

Un e-mail unique (`invite_2026_11`, budget-api) invite chaque compte confirmé
à partager son budget avec son conjoint, un colocataire ou un proche, et à
faire suivre le modèle gratuit. Envoyé le 13 novembre 2026. Suivi : page admin
› Croissance (campagnes, comptes « à plusieurs ») et, dans Google Analytics,
`utm_campaign=invite_2026_11`.

## Mesurer

- Page admin › Croissance › « D'où viennent les visiteurs » : lignes
  « Réseaux sociaux » et « Autres sites ».
- Google Analytics : `utm_source=pinterest`, `utm_campaign=groupe-…`.
- Refaire le point dans un mois : garder ce qui amène des inscriptions,
  arrêter le reste.
