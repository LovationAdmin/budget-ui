---
name: social-content
description: Programme hebdomadaire de contenu de Budget Famille (budgetfamille.com) — un article de blog SEO, ses visuels et les posts LinkedIn, Instagram, Facebook et X de lovation.pro, programmés dans Metricool après validation. À utiliser pour la routine du lundi, ou dès qu'on demande de créer, valider ou programmer des posts réseaux sociaux pour Budget Famille.
---

# Contenu réseaux sociaux de Budget Famille

Objectif : ramener chaque semaine des visiteurs qualifiés sur www.budgetfamille.com
depuis les comptes LinkedIn, Instagram, Facebook et X de lovation.pro, avec un
article utile (qui reste sur le blog et travaille aussi le référencement) et des
posts adaptés à chaque réseau.

Une semaine type = **1 article + 2 posts par réseau** :

- **Post A « article »** (mardi) : fait découvrir l'article de la semaine.
- **Post B « astuce »** (jeudi) : un conseil chiffré concret qui renvoie vers un
  outil gratuit (`/outils-ia`, `/tableau-budget-familial-gratuit`) ou vers un
  article plus ancien du blog (rotation, voir `docs/social/log.md`).

Tout le travail de la semaine passe par **une pull request** sur
`LovationAdmin/budget-ui` : la fusionner vaut validation (mode `validation`), ou la
session la fusionne elle-même (mode `autonome`). Rien n'est publié sur un réseau
avant que l'article et les visuels soient en ligne.

## Fichiers

| Fichier | Rôle |
|---|---|
| `docs/social/config.md` | Mode (`validation` / `autonome`), réseaux actifs, horaires par défaut. Le lire en premier. |
| `docs/social/log.md` | Historique : un article par ligne (sujet, mot-clé, lien du post B, PR). Évite les doublons et fait tourner les anciens articles. |
| `docs/social/posts/<AAAA-MM-JJ>-<slug>.md` | Les posts de la semaine (format ci-dessous). C'est la source lue au moment de programmer. |
| `public/social/<slug>/article.png`, `astuce.png` | Visuels 1080×1350, servis par le site (Metricool exige une URL publique). |
| `src/data/blog-articles.tsx` | Les articles du blog (le sitemap, le prérendu et IndexNow suivent automatiquement). |
| `assets/card.html`, `scripts/render-card.mjs` | Gabarit et rendu des visuels. |
| `scripts/wait-live.mjs` | Attend que l'article et les visuels soient en ligne après la fusion. |

## Garde-fous (non négociables)

- **Aucun chiffre inventé.** Chaque montant, pourcentage ou statistique d'un post
  ou d'un visuel figure dans l'article, et dans l'article il est soit sourcé
  (INSEE, Banque de France, service-public.fr, caf.fr, ADEME… avec le nom de la
  source dans le texte), soit présenté explicitement comme un exemple
  (« dans notre exemple », « par exemple »). Pas de « 87 % des familles… » sans source.
- **Pas de conseil financier personnalisé ni de promesse de gain** (« vous allez
  économiser 1 000 € »). Formuler en possibilités : « jusqu'à », « dans l'exemple ».
  Pas de recommandation de produit financier, de placement ou de crédit nommé.
- **Pas de faux témoignage, de faux avis, de faux client.** Les foyers des
  exemples sont présentés comme des exemples.
- **Promesses produit exactes** : Budget Famille est gratuit (budgets illimités,
  partagés en temps réel entre les membres du foyer, outils d'IA : proposition de
  budget, suggestions d'économies), sans connexion bancaire obligatoire ; la
  connexion bancaire et le suivi des dépenses réelles sont l'offre Premium à
  2 €/mois. Ne rien promettre d'autre sans l'avoir vérifié dans le code
  (`src/lib/pages/Features.tsx`, `src/lib/pages/PremiumPage.tsx`).
- **Pas de dénigrement** de concurrents, banques ou fournisseurs nommés.
- **Ton** : chaleureux, concret, déculpabilisant, en français, vouvoiement. Pas de
  jargon, pas de dramatisation de la précarité, pas d'humour sur les difficultés
  financières.
- **Comptes sociaux** : ne jamais demander, manipuler ni saisir d'identifiants
  des réseaux sociaux ; ne jamais automatiser un navigateur sur LinkedIn,
  Instagram, Facebook ou X. Tout passe par Metricool.
- **Une seule PR de contenu par semaine.** Si une PR « Social : » est encore
  ouverte (non fusionnée) au moment de la routine, ne pas en ouvrir une seconde :
  le signaler dans le compte rendu et s'arrêter après l'étape 1.

## Déroulé de la routine du lundi

### 0. Préparer

1. Dépôt `LovationAdmin/budget-ui` à jour sur `main`, puis la branche de travail
   (celle imposée par la session, sinon `social/<AAAA-MM-JJ>-<slug>`).
   `npm ci` (nécessaire au build).
2. Lire `docs/social/config.md` et `docs/social/log.md`.
3. Metricool : `getBrandSettings` → `blogId`, fuseau horaire, réseaux connectés.
   - Si l'outil répond qu'aucun réseau n'est connecté (ou si un réseau actif dans
     la config manque), **continuer quand même** l'article et les posts : ils seront
     programmés plus tard (étape 1 de la semaine suivante). Noter le lien de
     connexion renvoyé par Metricool pour le compte rendu.
   - Fuseau par défaut si Metricool ne le donne pas : `Europe/Paris`.

### 1. Rattraper les semaines précédentes

Chercher les PR fusionnées de `LovationAdmin/budget-ui` dont le titre commence par
`Social :` (`search_pull_requests`, 6 dernières semaines). Pour chacune, si aucun
commentaire de la PR ne contient le marqueur `<!-- social-scheduled -->` et que des
réseaux sont maintenant connectés : programmer ses posts (section « Programmer
dans Metricool ») sur des créneaux libres de la semaine en cours. Un contenu
saisonnier dont la saison est passée (Noël après le 25 décembre…) est abandonné :
le dire dans un commentaire de la PR, avec le marqueur.

### 2. Choisir le sujet

1. Sujets déjà traités : les slugs de `src/data/blog-articles.tsx` et le log. Ne
   jamais refaire un sujet ; un angle nouveau sur un thème proche est possible s'il
   vise une autre recherche.
2. Partir de la saison (voir le calendrier) et des piliers :
   méthodes de budget · couple et famille · enfants et argent · baisser ses charges
   (énergie, assurances, box, mobile → simulateur `/outils-ia`) · épargne et
   objectifs · dépenses de saison · budget en Afrique francophone et au Maghreb
   (Sénégal, Côte d'Ivoire, Maroc déjà traités : élargir, ex. Cameroun, Tunisie, Belgique, Suisse).
3. Valider la demande avec OpenRush : `research_keywords` avec
   `location: "France"`, `language: "French"`, `mode: "suggestions"` (le mode
   `ideas` dérive vite hors sujet), une graine par appel (« budget … »,
   « combien … par mois », « comment économiser … »). Viser une requête
   informationnelle de 100 à 5 000 recherches/mois, en hausse ou de saison
   (`trend_12m`). Regarder la page de résultats avec `inspect_serp` (mêmes
   `location`/`language`) pour viser un angle que les premiers résultats couvrent mal.
4. Si OpenRush est indisponible, choisir sur le calendrier et le dire dans la PR.

Calendrier (France) : janvier bilan + soldes + résolutions · février vacances
d'hiver · mars-avril déclaration de revenus · mai ponts et fête des mères · juin
vacances d'été · juillet-août budget vacances, fournitures · septembre rentrée et
allocation de rentrée scolaire · octobre taxe foncière, chauffage, vacances de la
Toussaint · novembre Black Friday, préparer Noël · décembre budget de Noël,
étrennes, bilan de l'année. Publier ~3 semaines avant le pic de recherche.

### 3. Écrire l'article

Ajouter l'article **à la fin** du tableau `blogArticles` de `src/data/blog-articles.tsx`,
en suivant exactement la forme des derniers articles (id suivant, `author:
"Équipe Budget Famille"`, `authorBio: "Experts en gestion budgetaire et
développeurs de Budget Famille"`, `publishedAt` = date du jour, `featured: true`,
3 `related` existants, 4 à 6 `tags`).

- Titre ≤ 65 caractères avec le mot-clé en tête ; slug court, sans accents ni année
  (sauf si l'année fait partie de la requête) ; `excerpt` de 140 à 160 caractères
  qui donne envie de cliquer.
- 1 200 à 1 800 mots, `readTime` = mots ÷ 200 arrondi (« 8 min »).
- Structure : `<p className="lead">` qui répond tout de suite à la question ;
  des `<h2>` avec un emoji ; au moins un exemple chiffré (tableau
  `<div className="overflow-x-auto"><table>…` si c'est un budget) ; des listes
  courtes et actionnables ; 2 à 3 liens internes vers d'autres articles ou vers
  `/tableau-budget-familial-gratuit`, `/outils-ia`, `/features`.
- Le bloc d'appel à l'action standard (dégradé `from-primary to-purple-600`, lien
  `/signup`), puis `<h2>❓ Questions fréquentes</h2>` avec 3 paires `<h3>` / `<p>`
  qui reprennent les questions réellement recherchées (OpenRush, « autres questions »).
- Échapper les apostrophes dans le JSX comme les articles existants (texte entre
  balises, chaînes entre guillemets doubles).

### 4. Créer les visuels

Deux cartes 1080×1350 (format 4:5, accepté partout) dans `public/social/<slug>/` :

```bash
R=.claude/skills/social-content/scripts/render-card.mjs
node $R public/social/<slug>/article.png kicker="Budget de couple" title="Compte commun : combien chacun doit-il verser ?" stat="60 / 40" statLabel="Au prorata des revenus : 3 000 € et 2 000 € nets"
node $R public/social/<slug>/astuce.png kicker="Astuce" title="…" stat="…" statLabel="…"
```

- `title` : la promesse en ≤ 70 caractères (la carte réduit la police si besoin).
- `kicker` (catégorie courte) et `stat`/`statLabel` (un chiffre clé ≤ 12
  caractères tiré de l'article, et son explication) sont facultatifs ; sans `stat`
  le titre est centré en grand.
- Espaces normales : la carte pose elle-même les espaces insécables françaises.
- **Toujours ouvrir les PNG (outil Read) pour les vérifier** : rien de coupé, pas
  de mot orphelin gênant, chiffre lisible. Recommencer sinon.

### 5. Rédiger les posts

Fichier `docs/social/posts/<AAAA-MM-JJ du lundi>-<slug>.md` :

```markdown
---
slug: <slug-de-l-article>
week: <AAAA-MM-JJ du lundi>
---

## A · article · mardi
media: https://www.budgetfamille.com/social/<slug>/article.png
alt: <description du visuel pour l'accessibilité>
link: https://www.budgetfamille.com/blog/<slug>

### linkedin
<texte>

### facebook
<texte>

### instagram
<texte>

### twitter
<texte>

## B · astuce · jeudi
media: https://www.budgetfamille.com/social/<slug>/astuce.png
alt: <…>
link: <URL de l'outil ou de l'ancien article>

### linkedin
…
```

Dans les textes, chaque lien porte ses UTM, avec la source du réseau :
`?utm_source=<linkedin|facebook|instagram|x>&utm_medium=social&utm_campaign=<slug>`.

| Réseau | Format |
|---|---|
| LinkedIn | 700 à 1 300 caractères. Deux premières lignes = accroche (avant « voir plus »). Paragraphes de 1 à 2 lignes, une liste à puces (•, ✅) ; ton « parents actifs ». Lien en fin de texte, 3 hashtags max (#budget #famille #finances). |
| Facebook | 300 à 600 caractères, conversationnel, une question pour faire réagir. Lien dans le texte. 0 à 2 hashtags. |
| Instagram | Accroche sur la première ligne, 500 à 1 000 caractères aérés, puis « 👉 L'article complet : lien en bio (budgetfamille.com/blog) ». Pas d'URL (non cliquable). 5 à 8 hashtags pertinents en fin de texte (#budgetfamilial #gestionbudget #economies #famille…). |
| X | Un seul post (pas de fil), ≤ 260 caractères lien compris (un lien compte 23). 1 hashtag max. |

Chaque réseau a son propre texte : pas de copier-coller d'un réseau à l'autre.

### 6. Vérifier, puis ouvrir la PR

1. `npm run build` doit passer (TypeScript, Vite, prérendu, sitemap).
2. Relire l'article et les posts contre les garde-fous ; vérifier les longueurs.
3. Ajouter une ligne en haut du tableau de `docs/social/log.md`.
4. Commit, push, PR vers `main` intitulée
   `Social : <titre de l'article> (semaine du <JJ/MM>)`. Corps de la PR, en français :
   le sujet et pourquoi (requête visée, volume, saison) ; les deux visuels affichés
   (`![article](https://github.com/LovationAdmin/budget-ui/blob/<sha>/public/social/<slug>/article.png?raw=true)`) ;
   les textes des posts ; le calendrier prévu ; la prévisualisation Vercel de
   l'article (lien du commentaire du bot Vercel) ; et, s'il y a lieu, le lien de
   connexion des réseaux Metricool.
5. `subscribe_pr_activity` sur la PR.

### 7. Publier

- **Mode `validation`** (défaut) : s'arrêter là. La fusion de la PR par l'équipe
  vaut validation. Commentaires de relecture sur la PR → les appliquer (texte,
  visuels, article), pousser, re-vérifier. PR fermée sans fusion → ne rien publier.
- **Mode `autonome`** : une fois le build local passé et le déploiement de
  prévisualisation Vercel au vert, fusionner soi-même la PR (squash).

Quand la PR est fusionnée (événement GitHub, ou rattrapage de l'étape 1) :

1. `node .claude/skills/social-content/scripts/wait-live.mjs <slug> <url visuel A> <url visuel B>`
   (Bash avec un timeout de 600 000 ms ; le relancer une fois s'il échoue sur le
   délai). Ne rien programmer tant qu'il ne répond pas « live ».
2. Programmer (section suivante), puis commenter la PR : liste des posts
   programmés (réseau, date, lien `plannerUrl`) et la ligne
   `<!-- social-scheduled -->`. Si aucun réseau n'est connecté : commenter que
   les posts seront programmés dès la connexion, **sans** le marqueur.
3. `unsubscribe_pr_activity`.

## Programmer dans Metricool

- Un appel `createScheduledPost` **par réseau et par post** (les textes diffèrent).
  `blogId` et fuseau de `getBrandSettings`.
- Éviter les doublons : avant de programmer, `getScheduledPosts` sur les 14
  prochains jours ; un post existant contenant déjà `utm_campaign=<slug>` (ou
  le même visuel) sur ce réseau n'est pas reprogrammé.
- Horaires : `getBestTimeToPostByNetwork` sur le jour prévu (mardi pour A, jeudi
  pour B) ; s'il ne renvoie rien d'exploitable, prendre les horaires de
  `docs/social/config.md`. Jamais deux posts le même jour sur le même réseau.
  Si le jour prévu est passé, décaler au prochain jour ouvré libre (en gardant
  A avant B).
- `info` (chaîne JSON) — exemple LinkedIn :

```json
{
  "text": "…",
  "providers": [{"network": "linkedin"}],
  "publicationDate": {"dateTime": "2026-10-13T08:30:00", "timezone": "Europe/Paris"},
  "media": ["https://www.budgetfamille.com/social/<slug>/article.png"],
  "mediaAltText": ["…"],
  "autoPublish": true,
  "draft": false,
  "firstCommentText": "",
  "shortener": false,
  "smartLinkData": {"ids": []},
  "descendants": [],
  "hasNotReadNotes": false,
  "linkedinData": {"type": "post", "previewIncluded": true, "publishImagesAsPDF": false}
}
```

  Par réseau : `"providers": [{"network": "facebook"}]` + `"facebookData": {"type": "POST"}` ;
  `"instagram"` + `"instagramData": {"type": "POST", "showReelOnFeed": true}`
  (Instagram exige le visuel) ; `"twitter"` + `"twitterData": {"tags": []}`.
  Le paramètre `date` reprend la même date au format ISO avec décalage
  (`2026-10-13T08:30:00+02:00`).
- En cas d'erreur Metricool (texte trop long pour X, réseau déconnecté…) :
  corriger si c'est le texte (raccourcir en gardant le sens), sinon passer au
  réseau suivant et le signaler dans le commentaire de la PR et le compte rendu.

## Compte rendu de fin de session

Court, en français : sujet et requête visée, lien de la PR, ce qui est programmé
(ou en attente de validation / de connexion Metricool, avec le lien de
connexion), et tout blocage. Ne jamais dire qu'un post est programmé sans
`plannerUrl` renvoyé par Metricool.
