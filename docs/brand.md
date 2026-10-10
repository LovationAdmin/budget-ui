# Logo Budget Famille

Logo officiel « Sous le même toit » : un toit au-dessus du budget du foyer,
partagé en trois parts. Fichiers sources (vectoriels) dans `public/brand/`,
publiés sur https://www.budgetfamille.com/brand/.

## Fichiers

| Usage | Fichier |
|---|---|
| Photo de profil Facebook, Instagram, LinkedIn, X (rognée en rond par les réseaux) | `brand/photo-profil-1080.png` |
| Logo avec le nom, fond clair (site, documents, annuaires) | `brand/logo-horizontal.png` |
| Logo avec le nom, fond sombre | `brand/logo-horizontal-blanc.png` |
| Icône arrondie (source des favicons et icônes d'application) | `brand/budget-famille-icone.svg` |
| Tuile carrée pleine (photo de profil, icône « maskable ») | `brand/budget-famille-logo.svg` |
| Symbole seul, fond clair / fond sombre | `brand/budget-famille-symbole.svg`, `brand/budget-famille-symbole-blanc.svg` |

Dans l'application, le composant `BudgetLogo` (`src/components/budget/BudgetLogo.tsx`)
dessine le même logo en SVG.

## Couleurs

| Rôle | Couleur |
|---|---|
| Dégradé du fond (haut gauche → bas droite) | `#1B8BC2` → `#1A5FA6` |
| Bleu principal (symbole sur fond clair) | `#1879A9` (= `--primary`) |
| Part orange | `#F97316` |
| Part ciel | `#8FD0EE` |
| Texte | `#13202B` |

Typographies du logo avec le nom : Plus Jakarta Sans ExtraBold (nom), DM Sans
Medium (adresse).

## Règles

- Ne pas déformer, recolorer ni ajouter d'ombre au logo.
- Garder autour du logo une marge au moins égale à la hauteur du toit.
- Taille minimale : 16 px pour l'icône, 120 px de large pour le logo avec le nom.
- Les favicons (`favicon.svg`, `favicon.ico`, `favicon-16x16.png`,
  `favicon-32x32.png`) agrandissent le symbole de 20 % pour rester lisibles
  dans l'onglet du navigateur.
