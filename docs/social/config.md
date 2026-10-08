# Réseaux sociaux : réglages

Lus par le skill `social-content` (`.claude/skills/social-content/SKILL.md`) à
chaque routine. Pour changer son comportement, modifier ce fichier (PR).

- **mode** : `validation`
  - `validation` : la routine ouvre chaque lundi la PR de la semaine (article,
    visuels, posts) ; rien n'est publié tant que l'équipe ne l'a pas fusionnée.
  - `autonome` : la routine fusionne elle-même la PR après ses vérifications,
    puis programme les posts.
- **réseaux** : linkedin, instagram, facebook, twitter (X)
- **metricool** : facebook, instagram
  - Réseaux programmés automatiquement dans Metricool. Les autres réseaux sont
    publiés à la main par l'équipe depuis le **kit à copier** de la semaine
    (`https://www.budgetfamille.com/social/<slug>/kit.html`).
  - Pourquoi : le forfait gratuit de Metricool ne permet pas de connecter
    LinkedIn ni X, et plafonne à 20 posts programmés par mois. Facebook +
    Instagram à 2 posts par semaine = 16 à 20 posts : ça tient. Avec un forfait
    payant, ajouter `linkedin, twitter` ici suffit : la routine les programmera.
- **page LinkedIn** : https://www.linkedin.com/feed/ (adresse ouverte par le
  bouton « Copier et ouvrir LinkedIn » du kit ; mettre celle de la page
  lovation.pro si les posts sont publiés au nom de la page)
- **fuseau** : Europe/Paris (si Metricool n'en donne pas)
- **horaires par défaut** (heure de Paris), si Metricool n'a pas encore assez
  d'historique pour proposer les meilleurs créneaux :

| Réseau | Post A « article » (mardi) | Post B « astuce » (jeudi) |
|---|---|---|
| LinkedIn | 08:30 | 12:15 |
| Facebook | 12:30 | 19:30 |
| Instagram | 18:30 | 12:30 |
| X | 08:00 | 12:30 |

- **Instagram** : les liens des légendes ne sont pas cliquables ; le lien de la
  bio du compte doit pointer vers https://www.budgetfamille.com/blog
