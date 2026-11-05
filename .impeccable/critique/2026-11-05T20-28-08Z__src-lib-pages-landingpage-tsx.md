---
target: page d accueil
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:/home/user/budget-ui/src/lib/pages/LandingPage.tsx"
target_fingerprint: "sha256:246f57a0021c72eca624f51d193517fe680811a30f996f59d268a16f817a86d3"
target_path: /home/user/budget-ui/src/lib/pages/LandingPage.tsx
timestamp: 2026-11-05T20-28-08Z
slug: src-lib-pages-landingpage-tsx
---
⚠️ DEGRADED: single-context (les deux évaluations ont tourné ici l'une après l'autre : cette session ne lance pas de sous-agents sans demande explicite)

## Critique : page d'accueil (src/lib/pages/LandingPage.tsx), mode Persuade

| # | Heuristique | Score | Point clé |
|---|---|---|---|
| 1 | Visibilité de l'état | 3 | Ancre, FAQ ouvrante, chargement du simulateur |
| 2 | Monde réel | 3 | Vocabulaire du foyer ; fuites anglaises (RGPD Compliant, majuscules du simulateur) |
| 3 | Contrôle | 3 | Pas de piège |
| 4 | Cohérence | 2 | Dégradés violets hors marque ; 4 libellés pour l'inscription |
| 5 | Prévention | 3 | Simulateur borné |
| 6 | Reconnaissance | 3 | Tout visible |
| 7 | Flexibilité | n/a | Page vitrine |
| 8 | Sobriété | 2 | 9 sections, 12 900 px mobile, deux mondes visuels |
| 9 | Récupération | 3 | Messages clairs, non testés en réel |
| 10 | Aide | n/a | Page vitrine |
| Total | | 22/32 | Acceptable (69 %) |

Spécificité : vraies captures et vocabulaire propres au produit ; composition de gabarit SaaS standard ; simulateur dans un second monde visuel (dégradé bleu-violet, tuiles multicolores).
Détecteur : code 1 (gradient-text LandingPage.tsx:229) ; page rendue 10 : gradient-text 1, ai-color-palette 2 (en-tête et bouton du simulateur), low-contrast 3 (bande finale 4,2:1, sous-titre simulateur 4,48:1, « Gestion financière » navbar 4,3:1), unbalanced-heading 2 (h3 fonctionnalités 1 et 3), straggler 2 (« seul. » étape 2, « projets. » pied de page). Aucun faux positif. Pas de calque visible (navigateur de la session cloud).

Ce qui marche : vraies captures chiffrées ; cartes « pour qui » vers les calculateurs ; fin avec une seule action.

Problèmes prioritaires :
1. [P1] Deux mondes visuels : violet hors marque (accent du h1, fond from-primary-50 to-purple-50, simulateur), orange de marque absent. Correction : accent bleu plein, simulateur aux couleurs de l'app, tuiles d'une seule teinte. /impeccable quieter
2. [P1] Trois contrastes sous AA. Correction : retirer opacity-90 de la bande finale, fond plein sous le sous-titre du simulateur, foncer « Gestion financière ». /impeccable polish
3. [P2] Sécurité et IA à peine dites (hero : « hébergées en Europe » seulement ; carte IA sans capture ; « Simulateur d'Économies » contre « Outils IA »). /impeccable clarify (accord requis sur le texte)
4. [P2] Trop long, trop de choix : 6 cartes, 11 questions, 4 libellés d'inscription. Charge mentale moyenne (3/8 échoués). /impeccable distill
5. [P3] Typographie et français : orphelines, titres déséquilibrés, casse anglaise, « RGPD Compliant ». /impeccable typeset

Personas : Jordan (pastille « Nouveau » qui parle de nouveautés d'un produit inconnu ; 4 libellés) ; Casey (capture de l'app à 890 px, sous la ligne de flottaison de l'iPhone 13 ; 15 écrans) ; Riley (« En couple » → calculateur en FR mais /features en EN ; pays du simulateur selon le navigateur).
Mineur : capture sombre qui masque le chiffre clé sur grand écran ; double marqueur pastille + icône dans les étapes.
Questions : capture avant le texte sur mobile ? fusionner « 3 étapes » et « Excel » ? raconter les 5 points forts dans l'ordre ?
