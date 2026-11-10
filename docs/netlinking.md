# Obtenir des liens vers le site : la campagne

Pourquoi : Bing classe déjà bien le site (2e à 4e sur « tableau budget
familial gratuit », « budget famille »), Google beaucoup moins (9e à 24e sur
les mêmes recherches). La différence tient surtout aux liens : peu de sites
reconnus pointent vers budgetfamille.com, et Bing le signale lui-même
(« pas assez de liens depuis des domaines de qualité »). Chaque lien obtenu
aide toutes les langues du site d'un coup.

**Point de départ, 1er novembre 2026 : Bing ne connaît aucun lien entrant**
(API Bing Webmaster : 0 lien vers l'accueil, 0 vers le modèle gratuit).
Chaque lien obtenu compte donc.

Contacts et constats vérifiés le 1er novembre 2026.

## Ce qu'on a à offrir

- **Le tableau de budget familial gratuit** : Excel qui calcule tout seul
  (s'ouvre dans Google Sheets et LibreOffice) et grille PDF A4 de 3 pages à
  imprimer. Sans inscription ni adresse e-mail, libre de partage.
  https://www.budgetfamille.com/tableau-budget-familial-gratuit
- **Des calculateurs sans compte**, où rien n'est envoyé :
  reste à vivre (https://www.budgetfamille.com/calcul-reste-a-vivre),
  budget perso 50/30/20, colocation, mariage.
- **L'application pour un budget à plusieurs** : pot commun, part de chacun
  (50/50, au prorata, même argent de poche), argent de poche, charges perso
  privées, en temps réel. Gratuite, sans connexion bancaire obligatoire.
  Les comparatifs d'applis n'en citent **aucune** pour le budget à deux :
  c'est l'angle.
- **Des articles par pays** (Dakar, Abidjan, Maroc, Québec), avec des budgets
  chiffrés : de quoi intéresser des médias locaux.
- **En anglais**, le même modèle, sans devise (montants sans symbole) :
  https://www.budgetfamille.com/en/free-budget-template. Le modèle français,
  lui, affiche des **€**.

## Sécurité et confidentialité : ce qu'on peut écrire

C'est la première question d'un organisme qui reçoit des familles en
difficulté. Vérifié dans le code le 2 novembre 2026 :

- **Le modèle et la grille** se téléchargent sans compte ni adresse e-mail :
  aucune donnée n'est demandée, le fichier reste chez la personne. Le site
  compte les téléchargements, sans identifiant.
- **Les calculateurs** fonctionnent sans compte : le calcul se fait dans le
  navigateur.
- **L'application** : données de budget chiffrées (AES-256-GCM) avant d'être
  enregistrées (`budget-api/utils/crypto.go`), base hébergée en Europe, à
  Francfort (`budget-api/render.yaml`), jamais vendues, sans publicité,
  connexion bancaire facultative, compte et données supprimables à tout
  moment depuis le profil.
- **Page à citer** : https://www.budgetfamille.com/privacy (en anglais :
  https://www.budgetfamille.com/en/privacy).
- **Ne pas écrire** « jamais partagées » (la connexion bancaire facultative
  passe par Enable Banking, les outils IA par un fournisseur d'IA), « standard
  militaire », ni « accès journalisé et notifié » : la politique de
  confidentialité l'affirme, mais rien dans `budget-api` ne le fait encore.

## Les cibles

| Prio. | Site | Pourquoi eux | Contact | Modèle | Statut |
|---|---|---|---|---|---|
| 1 | Médiathèque Françoise Sagan (Paris 10e), atelier « Double clic : gérer le budget familial grâce à un tableur », **samedi 7 novembre 2026** | L'atelier n'a pas de modèle attitré ; paris.fr est un domaine très fort | mediatheque.francoise-sagan@paris.fr · 01 53 24 69 70 · [page de l'atelier](https://www.paris.fr/evenements/double-clic-gerer-le-budget-familial-grace-a-un-tableur-90291) | C | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 1 | Copeps.fr, « Gérer vos finances personnelles avec un tableau Excel » | Promet des modèles Excel, LibreOffice, Google Sheets et PDF, mais **tous ses boutons de téléchargement pointent vers « # »** | https://copeps.fr/contact/ | B | |
| 1 | Moneyvox, « Gestion de budget » (Sarah Bouget) | Comparatif Bankin', Linxo, Finary, Finzee : aucune appli de budget à deux | lien « Contact » en pied de page de https://www.moneyvox.fr | A | |
| 1 | Finactuel, « Meilleures applications pour gérer son budget et son épargne en 2026 » | Bankin', Linxo, Pilote Budget, Finary, YNAB : aucune appli de budget à deux | formulaire https://finactuel.fr/contact/ | A | |
| 1 | Empruntis, « Applications de suivi de budget » (Christophe Piroux, février 2023) | Article ancien, rangé sous le reste à vivre : notre calculateur et l'appli y ont leur place | https://www.empruntis.com/contact.php · presse : https://www.empruntis.com/espace-presse/ | A | |
| 2 | Points conseil budget (Udaf) | Reçoivent des familles chaque jour ; une grille papier à leur remettre est utile | pcb@udaf95.fr (Val-d'Oise), pcb@udaf73.fr (Savoie) ; les autres Udaf départementales publient le leur | D | 95 et 73 envoyés le 2 novembre, relancés le 6 ; sans réponse au 10 |
| 2 | INC (inc-conso.fr), « Organiser son budget » | Recommande déjà une brochure de Finances & Pédagogie : domaine public, très fort | https://www.inc-conso.fr/content/contact | D | |
| 2 | MeilleureSCPI, « Tableau de budget familial : modèles à télécharger » (Jonathan Dhiver) | Propose ses propres modèles ; il manque une option « à deux, sans recopier chaque mois » | https://www.meilleurescpi.com/contact/ · 01 84 25 52 15 | E | |
| 2 | Espace-famille.net, « Tableau Excel gratuit : gérer votre budget familial » | Blog familial, son propre modèle ; article invité sur le budget du couple | https://www.espace-famille.net/contact/ | E | |
| 3 | Les Pépites Tech (annuaire des startups françaises) | Fiche gratuite à créer soi-même, lien vers le site | https://lespepitestech.com/node/add/pepite-tech (compte requis ; gratuité à vérifier) | — | |
| 3 | AlternativeTo | Ajouter Budget Famille comme alternative à Bankin', Tricount, YNAB (compte gratuit) | https://alternativeto.net | — | |
| 3 | Québec : Option consommateurs, ACEF de l'Est, ACEF de Lanaudière | Ont leurs propres grilles ; proposer l'article « Budget familial au Québec » comme lecture complémentaire | [grille Option consommateurs](https://option-consommateurs.org/ressources/grille-budgetaire/) · [ACEF de l'Est](https://acefest.ca/ressources/travaillez-votre-budget/) · [ACEF Lanaudière](https://aceflanaudiere.ca/documentation-outils/grilles-budgets-et-chiffriers/) | D | |

Ordre conseillé : la médiathèque lundi (l'atelier est samedi), puis Copeps
(le plus facile : on répare leur page), puis les comparatifs.

## Élargir : les réseaux, en France et à l'étranger

Les médiathèques et les Points conseil budget sont les meilleures cibles :
ils remettent des outils à des familles tous les jours, et leurs sites
(paris.fr, sites publics, associations reconnues) pèsent lourd. On vise
d'abord les **têtes de réseau**, qui relaient à des dizaines de services.
Contacts vérifiés le 2 novembre 2026 sur le site de chaque organisme, sauf
mention contraire.

### France

| Prio. | Organisme | Pourquoi eux | Contact | Modèle | Statut |
|---|---|---|---|---|---|
| 1 | Les 500 Points conseil budget | Les Udaf 95 et 73, en grand. Liste officielle (PDF, mai 2024) sur [solidarites.gouv.fr](https://solidarites.gouv.fr/point-conseil-budget-pcb) ; l'adresse de chaque PCB est sur le site de sa structure | 10 à 20 par semaine, un e-mail chacun | D | |
| 1 | UNAF, tête de réseau des Udaf | Peut relayer auprès de toutes les Udaf, qui portent une bonne partie des PCB | formulaire https://www.unaf.fr/contact-unaf/ (sujet « Accompagnement budgétaire ») | D | Formulaire à envoyer par Libasse (case de consentement à cocher soi-même) |
| 1 | Les Bons Clics (WeTechCare) | La plateforme des aidants numériques ; publie déjà « Gérer son budget au quotidien, et si le numérique nous aidait ? » | contact@lesbonsclics.fr | C | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 2 | Finances & Pédagogie | Ateliers budget dans toute la France, page « Ressources pédagogiques » ; l'INC cite déjà leur brochure | formulaire https://www.finances-pedagogie.fr/contact/ (reCAPTCHA) | D | Formulaire à envoyer par Libasse |
| 2 | Crésus | Réseau d'associations d'accompagnement budgétaire | https://www.cresus.org (site indisponible le 2 novembre : contact à relever) | D | |
| 2 | Médiathèques, espaces numériques | Comme Françoise Sagan : chercher « atelier budget » ou « tableur budget » dans les agendas des villes | au cas par cas | C | |

### Francophonie

Belgique et Luxembourg comptent en euros. Pour la Suisse et le Québec, le
modèle français affiche des € : les e-mails proposent une version en francs
suisses ou en dollars canadiens sur demande (changer le format des montants
du fichier Excel).

| Prio. | Pays | Organisme | Pourquoi eux | Contact | Modèle | Statut |
|---|---|---|---|---|---|---|
| 1 | Belgique | Observatoire du Crédit et de l'Endettement (Wallonie) | Prévention du surendettement, formations et publications pour les travailleurs sociaux | info@observatoire-credit.be | D | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 1 | Belgique | Centre d'Appui aux Services de Médiation de Dettes (Bruxelles) | Appui aux professionnels, « outils de prévention », boîte à outils du médiateur | info@mediationdedettes.be | D | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 1 | Luxembourg | Ligue médico-sociale, service d'information et de conseil en surendettement | Service conventionné par l'État | endettement@ligue.lu (dépliant 2025 du ministère de la Famille) | D | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 1 | Luxembourg | Inter-Actions (Esch-sur-Alzette) | Même mission, dans le sud du pays | endettement@inter-actions.lu (même dépliant) | D | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 2 | Suisse | FRC Vaud, conseil en budget | Entretiens budget gratuits ; a son propre modèle PDF : proposer l'Excel qui calcule et la répartition du couple | budget.vaud@frc.ch (relevé sur vaudfamille.ch) | D | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 2 | Suisse | Dettes Conseils Suisse | Faîtière des services de désendettement | administration@schulden.ch | D | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 2 | Québec | Union des consommateurs (réseau d'ACEF) | Complète la ligne Québec ci-dessus | info@uniondesconsommateurs.ca | D | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |

Afrique francophone : pas encore de contact vérifié (la Fondation marocaine
pour l'éducation financière ne publie pas ses coordonnées en ligne).

### Pays anglophones (modèle F)

| Prio. | Pays | Organisme | Pourquoi eux | Contact | Modèle | Statut |
|---|---|---|---|---|---|---|
| 1 | Irlande | MABS (Money Advice and Budgeting Service) | Service public de conseil budgétaire, bureaux dans tout le pays ; remet déjà des « budget sheets » | helpline@mabs.ie (relevé sur un annuaire : mabs.ie refusait la vérification) | F | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 1 | Nouvelle-Zélande | FinCap | Fédère plus de 200 services gratuits de budget et d'accompagnement financier | kiaora@fincap.org.nz | F | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 2 | Australie | Financial Counselling Australia | Fédère les conseillers financiers des États ; a une boîte à outils pour eux | info@financialcounsellingaustralia.org.au | F | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 2 | Canada | Prosper Canada | « Learning Hub » pour les intervenants en autonomie financière | info@prospercanada.org | F | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| 3 | États-Unis, Royaume-Uni | Jump$tart Clearinghouse (base de ressources gratuites), Citizens Advice, Good Things Foundation | Procédures et contacts pas encore vérifiés | — | F | |

### Associations étudiantes (modèle G)

Les étudiants comptent chaque euro et vivent souvent en colocation : on leur
propose d'abord les calculateurs (budget 50/30/20, colocation), qui comptent
en euros, francs suisses, dollars canadiens, francs CFA, dirhams… et en
anglais en livres, dollars, etc. Puis le modèle Excel et l'application pour
la colocation.

| Pays | Association | Contact | Langue | Statut |
|---|---|---|---|---|
| France | FAGE, fédération des associations étudiantes | contact@fage.org | FR | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| France | Animafac, réseau d'associations étudiantes | hello@animafac.net | FR | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| France | UNEF | formulaire https://unef.fr/nous-contacter/ | FR | À envoyer |
| Belgique | FEF, Fédération des étudiants francophones | contact@fef.be | FR | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| Luxembourg | ACEL, cercles d'étudiants luxembourgeois | contact@acel.lu | FR | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| Suisse | UNES (VSS), Union des étudiant·e·s de Suisse | info@vss-unes.ch | FR | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| Québec | UEQ, Union étudiante du Québec | info@unionetudiante.ca | FR | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| Canada | CFS-FCÉÉ, Canadian Federation of Students | info@cfs-fcee.ca | EN | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| Europe | ESU, European Students' Union | secretariat@esu-online.org | EN | Envoyé le 2 novembre, relancé le 6 ; sans réponse au 10 |
| Europe | ESN, Erasmus Student Network | esn.org bloque la lecture automatique : contact à relever à la main | EN | |
| Royaume-Uni, Irlande | NUS UK, AMLÉ (ex-USI) | sites sans adresse lisible (NUS bloque, AMLÉ n'a qu'un formulaire) | EN | |
| Nouvelle-Zélande, Australie | NZUSA, NUS Australia | students.org.nz et nus.org.au hors du réseau autorisé de la session cloud | EN | |

Le 2 novembre, tout ce qui avait une adresse e-mail est parti (12 e-mails aux organismes, 8 aux associations étudiantes).
Reste : les formulaires de l'UNAF et de Finances & Pédagogie, Crésus (site
indisponible), puis les PCB, par 10 à 20, en ajustant le modèle D avec les
premiers retours.

**Point au 10 novembre** : aucune réponse sur les 23 (ni réponse
automatique), les 46 e-mails (envoi et relance) remis sans rebond ni
signalement, et Bing ne voit toujours aucun lien entrant. Plus de relance
(une seule par site) ; un lien met 2 à 6 semaines à apparaître.

## Les e-mails

Remplacer les crochets. Un e-mail par site, jamais en copie groupée. Une
seule relance, 7 à 10 jours après, en deux lignes.

Chaque e-mail commence par se présenter en une phrase : le destinataire ne
connaît pas Budget Famille, il doit savoir qui écrit avant de lire pourquoi.
Aux organismes (modèles C, D, F et G), dire aussi ce que deviennent les données
des familles, avec les seuls mots de « Sécurité et confidentialité ».

Envoyer depuis **libasse@budgetfamille.com** (Resend, réponses vers
lovation.pro@gmail.com), en texte brut. Pas par le connecteur Gmail de Claude :
il remplace chaque lien par un lien google.com/url, et l'expéditeur affiché
n'est pas Budget Famille.
Le courrier reçu à libasse@budgetfamille.com est transféré vers
lovation.pro@gmail.com par l'Email Routing de Cloudflare (depuis le
6 novembre 2026 ; avant, il revenait en erreur) : une réponse envoyée à
l'adresse d'expédition plutôt qu'à l'adresse de réponse arrive donc aussi.

### A. Comparatif d'applis sans budget à deux

> **Objet :** Une appli de budget à deux pour votre comparatif ?
>
> Bonjour [Prénom de l'auteur],
>
> Je m'appelle [Prénom Nom] et je développe Budget Famille, une application
> française et gratuite pour gérer le budget du foyer (budgetfamille.com).
>
> J'ai lu votre article « [titre de l'article] ». Il compare clairement les
> applis qui suivent les comptes d'une personne ; il manque pourtant un cas
> que beaucoup de vos lecteurs vivent : le budget à plusieurs. Aucune des
> applis citées ne répartit les charges d'un couple ou d'une famille.
>
> C'est ce que fait Budget Famille, sans connexion bancaire obligatoire :
> - un pot commun et la part de chacun (50/50, au prorata des salaires ou
>   même argent de poche) ;
> - l'argent de poche de chacun, et des charges perso qui restent privées ;
> - partagée en temps réel entre conjoints, colocataires ou toute la famille.
>
> Si cela vous semble utile, elle aurait sa place dans une rubrique « couple
> ou famille » : https://www.budgetfamille.com
>
> Je peux vous la montrer en dix minutes ou répondre à vos questions.
>
> Bonne journée,
> [Prénom Nom], Budget Famille

### B. Liens de téléchargement cassés (Copeps)

> **Objet :** Les boutons de téléchargement de votre article sur le budget
>
> Bonjour,
>
> Je m'appelle [Prénom Nom] et je développe Budget Famille, une application
> française et gratuite pour gérer le budget du foyer (budgetfamille.com).
> Je vous écris au sujet de votre article « Gérer vos finances personnelles
> avec un tableau Excel » : il propose des modèles en Excel, LibreOffice,
> Google Sheets et PDF, mais les boutons de téléchargement ne mènent nulle
> part (ils pointent vers « # »).
>
> Si vous cherchez un modèle à mettre à la place, le nôtre est gratuit, sans
> inscription ni adresse e-mail à donner :
> https://www.budgetfamille.com/tableau-budget-familial-gratuit
> - un fichier Excel qui calcule tout seul, qui s'ouvre aussi dans Google
>   Sheets et LibreOffice ;
> - la même grille en PDF A4 à imprimer.
>
> Vos boutons peuvent pointer vers cette page, ou directement vers les fichiers.
>
> Bonne journée,
> [Prénom Nom], Budget Famille

### C. Médiathèque, atelier tableur

> **Objet :** Un modèle de budget gratuit pour votre atelier du 7 novembre
>
> Bonjour,
>
> Je m'appelle [Prénom Nom] et je développe Budget Famille, une application
> française et gratuite pour gérer le budget du foyer (budgetfamille.com).
>
> J'ai vu que la médiathèque organise samedi 7 novembre l'atelier « Double
> clic : gérer le budget familial grâce à un tableur ». Si cela peut servir
> aux participants, nous mettons à disposition un tableau de budget familial
> gratuit, pensé pour débuter :
> - un fichier Excel avec des cases jaunes à remplir et des totaux qui se
>   calculent seuls (il s'ouvre aussi dans LibreOffice et Google Sheets) ;
> - un onglet pour répartir les charges d'un couple, un autre pour suivre
>   l'année ;
> - la même grille en PDF à imprimer, pour ceux qui préfèrent le papier.
>
> Sans inscription ni adresse e-mail, et aucune donnée n'est collectée : le
> fichier reste chez chacun.
> https://www.budgetfamille.com/tableau-budget-familial-gratuit
>
> Vous pouvez l'utiliser, l'imprimer et le distribuer librement. Si l'atelier
> a une page de ressources, un lien nous aiderait à le faire connaître.
>
> Bonne journée,
> [Prénom Nom], Budget Famille

### D. Points conseil budget, associations, organismes publics

> **Objet :** Une grille de budget gratuite à remettre aux familles
>
> Bonjour,
>
> Je m'appelle [Prénom Nom] et je développe Budget Famille, une application
> française et gratuite pour gérer le budget du foyer (budgetfamille.com).
> Je vous écris car [la raison, par exemple : votre Point conseil budget
> reçoit des familles au quotidien, et nous avons un outil qui peut vous
> servir dans vos rendez-vous].
>
> Il s'agit d'une grille de budget familial à imprimer : PDF A4 de 3 pages
> (budget du mois prévu et réel, dépenses annuelles et répartition dans le
> couple, suivi de l'année), et sa version Excel qui calcule toute seule.
> Gratuite, sans inscription, à imprimer et distribuer librement :
> https://www.budgetfamille.com/tableau-budget-familial-gratuit
>
> Pour les personnes à l'aise avec un téléphone, notre calculateur de reste
> à vivre fonctionne sans compte, et rien n'est envoyé :
> https://www.budgetfamille.com/calcul-reste-a-vivre
>
> Côté confidentialité, un point qui compte pour les familles que vous
> recevez : la grille et le fichier Excel se téléchargent sans compte ni
> adresse e-mail, et aucune donnée n'est collectée. Si une famille utilise
> ensuite l'application, ses données de budget sont chiffrées avant d'être
> enregistrées, hébergées en Europe, jamais vendues, sans publicité ni
> connexion bancaire obligatoire, et elle peut tout supprimer à tout moment :
> https://www.budgetfamille.com/privacy
>
> Si vous avez une page de ressources pour les familles, un lien nous
> aiderait beaucoup. Vos retours de terrain sur la grille sont aussi les
> bienvenus.
>
> Bonne journée,
> [Prénom Nom], Budget Famille

### E. Blogs qui ont déjà un modèle : un article invité

> **Objet :** Une idée d'article pour vos lecteurs : le budget du couple
>
> Bonjour,
>
> Je m'appelle [Prénom Nom] et je développe Budget Famille, une application
> française et gratuite pour gérer le budget du foyer (budgetfamille.com).
>
> Votre article « [titre] » aide beaucoup de familles à démarrer. Une
> question revient souvent ensuite : comment répartir les charges quand les
> deux salaires sont différents ?
>
> Je vous propose un article inédit, écrit pour vos lecteurs : les trois
> méthodes (50/50, au prorata, même argent de poche), un exemple chiffré, et
> l'organisation avec un compte commun. Sans publicité, avec un seul lien
> vers notre calculateur gratuit, que vous pouvez retirer si vous préférez.
>
> Bonne journée,
> [Prénom Nom], Budget Famille

### F. Budget and debt advice services (English)

Le modèle D en anglais, pour les pays anglophones. Il pointe vers le modèle
anglais, sans devise. Avant les États-Unis et le Canada, vérifier que la
grille A4 s'imprime bien sur du papier Letter.

> **Subject:** A free printable budget sheet for the households you support
>
> Hello,
>
> My name is [First Last] and I build Budget Famille, a free budgeting app
> made in France (budgetfamille.com). I'm writing because [the reason, for
> example: your service helps households with their budget every day, and we
> have a tool that may be useful in your appointments].
>
> It's a printable budget sheet (3 A4 pages: planned and actual monthly
> budget, yearly expenses and how a couple splits them, a year tracker),
> with an Excel version that does the maths. It works in any currency, needs
> no sign-up, and you're free to print and share it:
> https://www.budgetfamille.com/en/free-budget-template
>
> On privacy, which matters for the people you support: the files download
> without an account or email address, and no data is collected. If someone
> later uses the app, their budget data is encrypted before it's stored,
> hosted in Europe, never sold, with no ads and no bank connection required,
> and they can delete everything at any time:
> https://www.budgetfamille.com/en/privacy
>
> If you have a resources page for clients or practitioners, a link would
> help us a lot. Feedback from the field is just as welcome.
>
> Best regards,
> [First Last], Budget Famille

### G. Associations étudiantes

> **Objet :** Des outils de budget gratuits pour les étudiants
>
> Bonjour,
>
> Je m'appelle [Prénom Nom] et je développe Budget Famille, une application
> française et gratuite pour gérer son budget, seul ou à plusieurs
> (budgetfamille.com). Je vous écris car [la raison, par exemple : la FEF
> représente les étudiants francophones de Belgique, pour qui le budget est
> souvent serré], et nous avons des outils gratuits qui peuvent leur servir au
> quotidien :
> - un calculateur de budget mensuel (règle 50/30/20) : ce qui reste une fois
>   le loyer et l'essentiel payés, et ce qu'on peut mettre de côté :
>   https://www.budgetfamille.com/budget-personnel
> - un calculateur de colocation, pour partager le loyer et les factures à
>   parts égales, selon la chambre ou selon les revenus :
>   https://www.budgetfamille.com/budget-colocation
> - un tableau de budget Excel à télécharger, qui calcule tout seul :
>   https://www.budgetfamille.com/tableau-budget-familial-gratuit
>
> [Hors zone euro : « Les calculateurs comptent aussi en francs suisses (et
> existent en anglais). »]
>
> Côté confidentialité : tout est gratuit et sans inscription, et dans les
> calculateurs rien n'est envoyé, les chiffres restent dans le navigateur.
> Pour gérer une colocation à plusieurs, l'application chiffre les données de
> budget avant de les enregistrer, les héberge en Europe, ne les vend jamais,
> sans publicité ni connexion bancaire obligatoire, et chacun peut tout
> supprimer à tout moment : https://www.budgetfamille.com/privacy
>
> Si vous avez une page de ressources (vie étudiante, logement, aides) ou une
> lettre d'information, un lien nous aiderait beaucoup à faire connaître ces
> outils.
>
> Bonne journée,
> [Prénom Nom], Budget Famille

En anglais (« Free budgeting tools for students »), le même texte avec
https://www.budgetfamille.com/en/50-30-20-budget-calculator,
https://www.budgetfamille.com/en/rent-split-calculator,
https://www.budgetfamille.com/en/free-budget-template et
https://www.budgetfamille.com/en/privacy.

## Les règles

- **Ne jamais acheter de lien**, ni échanger des liens en série, ni écrire
  des articles invités à la chaîne avec des mots-clés en lien : Google le
  sanctionne (« pratiques de liens » de ses règles anti-spam).
- **Laisser le site choisir** les mots du lien et son type (nofollow
  compris) : un lien naturel vaut mieux qu'un lien optimisé.
- Un lien depuis un site qui parle de budget ou de famille vaut plus que
  dix liens d'annuaires génériques.

## Mesurer

- **Bing Webmaster Tools › Backlinks** et **Search Console › Liens › Liens
  externes** : les nouveaux sites qui pointent vers le site (comptez 2 à 6
  semaines).
- **Page admin › Croissance › D'où viennent les visiteurs** : la ligne
  « Autres sites » monte quand un lien amène des visiteurs.
- Mettre à jour la colonne « Statut » ci-dessus à chaque envoi et réponse.
