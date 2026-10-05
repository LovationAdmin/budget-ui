# Réseaux sociaux : réglages

Lus par le skill `social-content` (`.claude/skills/social-content/SKILL.md`) à
chaque routine. Pour changer son comportement, modifier ce fichier (PR).

- **mode** : `validation`
  - `validation` : la routine ouvre chaque lundi la PR de la semaine (article,
    visuels, posts) ; rien n'est publié tant que l'équipe ne l'a pas fusionnée.
  - `autonome` : la routine fusionne elle-même la PR après ses vérifications,
    puis programme les posts.
- **réseaux** : linkedin, instagram, facebook, twitter (X)
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
