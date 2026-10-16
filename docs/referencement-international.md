# Référencement international : les étapes hors du code

Ce que le site fait déjà, et ce qui reste à faire dans les outils des moteurs
de recherche pour apparaître en Asie et en Afrique.

## Ce que le site fait déjà

- **Trois langues, une URL chacune** : français à la racine, anglais sous
  `/en`, chinois simplifié sous `/zh` (accueil et quatre calculateurs).
  Chaque page traduite déclare ses versions (hreflang) dans son HTML et dans
  le sitemap ; le lecteur d'une autre langue est dirigé vers l'anglais
  (`x-default`).
- **Devises locales** dans les calculateurs, choisies d'après le fuseau
  horaire du visiteur : franc CFA, dirham, dinars en français ; roupie,
  naira, shilling, cedi, rand, dollar de Singapour, ringgit, peso en
  anglais ; yuan, dollar de Singapour, ringgit, dollar de Hong Kong, de
  Taïwan en chinois.
- **IndexNow** annonce les pages nouvelles ou modifiées à Bing (et Yandex,
  Seznam, Naver) après chaque déploiement : `npm run seo:indexnow`.
- **Google Analytics** reçoit la langue de chaque écran (`ui_language` :
  `fr`, `en` ou `zh`) avec les événements `calculator_used` et `sign_up`.

## 1. Google Search Console (priorité)

Google domine la recherche en Afrique, en Inde, à Singapour, en Malaisie, à
Taïwan et à Hong Kong.

1. Vérifier que la propriété couvre tout le domaine (propriété « Domaine »
   `budgetfamille.com`) : `/en` et `/zh` en font partie, rien à créer.
2. **Sitemaps** : soumettre `https://www.budgetfamille.com/sitemap.xml` si ce
   n'est pas déjà fait. Il se met à jour seul à chaque déploiement.
3. **Inspection de l'URL** → « Demander une indexation » pour les nouvelles
   pages, en commençant par :
   - `https://www.budgetfamille.com/zh`
   - `https://www.budgetfamille.com/zh/50-30-20-budget-calculator`
   - `https://www.budgetfamille.com/zh/rent-split-calculator`
   - `https://www.budgetfamille.com/zh/wedding-budget-calculator`
   - `https://www.budgetfamille.com/zh/leftover-income-calculator`
   - `https://www.budgetfamille.com/en` et les calculateurs anglais, s'ils ne
     sont pas encore indexés.

   Google limite ces demandes à une dizaine par jour : étaler sur deux ou
   trois jours.
4. **Pas de ciblage par pays** : Google a supprimé le rapport « Ciblage
   international » en 2022. Il se fie aux hreflang, déjà en place.
5. **Suivi** (après 2 à 4 semaines) :
   - Indexation → Pages : les pages `/zh/…` doivent passer en « Indexée ».
   - Performances → filtre « Page » contenant `/zh/` ou `/en/`, puis onglet
     « Pays » : Singapour, Malaisie, Taïwan, Hong Kong, Inde, Nigeria,
     Kenya, Sénégal, Côte d'Ivoire, Cameroun…

## 2. Bing Webmaster Tools (import déjà fait)

1. Vérifier dans « Sitemaps » que `sitemap.xml` est bien listé.
2. Bing est le moteur le plus utilisé sur ordinateur en **Chine
   continentale**, où Google est bloqué : environ 37 % des recherches sur
   ordinateur et 22 % tous appareils confondus (cn.bing.com, StatCounter).
   Les pages `/zh` peuvent donc y être trouvées sans hébergement en Chine.
3. Son index alimente aussi Yahoo et, en partie, DuckDuckGo, Ecosia,
   Copilot et la recherche de ChatGPT.

## 3. Chine continentale : Baidu (à ne pas engager tout de suite)

Baidu fait environ la moitié des recherches en Chine, surtout sur mobile.
Mais :

- un compte Baidu demande un numéro de téléphone (chinois en pratique) et
  des documents traduits en chinois ;
- Baidu favorise nettement les sites hébergés en Chine, ce qui suppose une
  **licence ICP** : une entité ou un partenaire en Chine, un hébergement en
  Chine continentale, un dossier en chinois ;
- un hébergement à Hong Kong ou à Singapour est le compromis habituel des
  marques sans entité locale.

**Recommandation** : mesurer d'abord le trafic chinois venu de Google et de
Bing pendant deux ou trois mois. Si la Chine continentale devient une
priorité, passer par une agence spécialisée. En attendant, vérifier que le
site s'ouvre bien depuis la Chine (un contact sur place ou un service de test
de disponibilité depuis la Chine) : l'accès aux hébergeurs étrangers y est
parfois lent ou bloqué.

## 4. Afrique et Asie : se faire connaître

Les moteurs classent mieux une page citée ailleurs. Quelques pistes, sans
budget :

- Partager les calculateurs dans les communautés des pays visés : groupes
  Facebook et LinkedIn sur la finance personnelle, le logement étudiant, la
  colocation, le mariage (Nigeria, Kenya, Ghana, Afrique du Sud, Sénégal,
  Côte d'Ivoire, Cameroun, Maroc, Inde, Singapour, Malaisie).
- Programmer ces publications aux heures locales (Lagos, Nairobi, Dakar,
  Abidjan, Bombay, Singapour) avec Metricool.
- Proposer les calculateurs à des blogs de finance personnelle locaux, des
  associations étudiantes ou des universités : un lien depuis leur site
  compte beaucoup.
- Articles de blog adaptés à un pays : la recette des articles Sénégal,
  Côte d'Ivoire et Maroc peut s'étendre au Nigeria, au Kenya ou à l'Inde
  (en anglais), avec les devises locales.

## 5. Moteurs inutiles pour l'instant

- **Naver** (Corée), **Yandex** (Russie), **Seznam** (Tchéquie) : pas de
  contenu dans ces langues. Ils reçoivent déjà les annonces IndexNow.
- **Yahoo Japan** utilise les résultats de Google.

## 6. Google Analytics

1. Administration → Événements : marquer `calculator_used` et `sign_up` comme
   **événements clés**.
2. Administration → Définitions personnalisées : créer deux dimensions
   personnalisées de portée « Événement » : `ui_language` et `calculator`.
3. Rapports à suivre : Utilisateurs → Données démographiques → Pays ; puis
   `calculator_used` par `ui_language` et par pays, pour voir quelles langues
   et quels calculateurs prennent.

## 7. Relecture du chinois

Les pages chinoises ont été écrites avec soin mais sans relecture par un
locuteur natif. Faire relire `/zh` et les quatre calculateurs (une heure de
travail pour un relecteur) avant de les promouvoir, et signaler les
corrections : elles sont dans `src/i18n/zh/`, `src/lib/pages/zh/` et
`src/seo/zh/`.

## Calendrier

| Quand | Quoi |
|---|---|
| Jour du déploiement | Sitemap vérifié dans Google et Bing ; demandes d'indexation des pages `/zh` |
| Semaines 2 à 4 | Rapport « Pages » de Search Console : pages `/zh` et `/en` indexées |
| Mois 2 à 3 | Impressions et clics par pays ; décider de l'espagnol, d'autres articles par pays, de Baidu |

## Sources

- [Google : le rapport Ciblage international est obsolète](https://support.google.com/webmasters/answer/12474899)
- [StatCounter : moteurs de recherche en Chine, tous appareils](https://gs.statcounter.com/search-engine-host-market-share/all/china)
- [StatCounter : moteurs de recherche en Chine, ordinateur](https://gs.statcounter.com/search-engine-host-market-share/desktop/china)
- [Alibaba Cloud : dépôt ICP pour une entreprise hors de Chine continentale](https://www.alibabacloud.com/help/en/icp-filing/basic-icp-service/product-overview/icp-filing-application-for-enterprises-outside-the-chinese-mainland)
