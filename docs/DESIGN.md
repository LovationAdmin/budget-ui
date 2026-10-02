# Design — Budget Famille

Référence courte du système visuel et des règles d'interaction des écrans budget. La source de vérité reste le code : les tokens sont dans `src/index.css` et `tailwind.config.ts`, les briques dans `src/components/budget/shared/primitives.tsx`.

## Principes

1. **Un mois à la fois.** L'onglet Mois est le cœur de l'app ; les autres écrans y renvoient (liens réels `?m=YYYY-MM`).
2. **Le passé ne bouge pas.** Un mois clôturé affiche sa photo figée. Toute modification passe par « Rouvrir », qui montre ce qui va changer.
3. **Dire ce qui va se passer.** Chaque modification précise sa portée (« à partir de … » ou « ce mois-ci seulement ») et peut être annulée depuis le toast.
4. **Le vocabulaire du foyer** : on parle d'« entrées du pot commun », de « charges », d'« épargne » et de « reste », jamais de jargon comptable.

## Couleurs (HSL, `:root`)

| Token | Valeur | Usage |
|---|---|---|
| `--background` | `30 30% 98%` (#FCFAF8) | Fond d'app, `theme-color` PWA |
| `--foreground` | `240 10% 10%` | Texte principal |
| `--card` | blanc | Cartes, panneaux |
| `--primary` | `200 75% 38%` | Actions principales, focus (`--ring`) |
| `--muted` / `--muted-foreground` | `30 20% 94%` / `240 5% 45%` | Fonds secondaires, texte d'appui |
| `--success` | `152 60% 45%` | Reste positif, objectif atteint |
| `--destructive` | `0 72% 51%` | Suppression, reste négatif (texte en `text-red-700`) |
| `--warning` | `38 92% 55%` | Alertes douces |

Familles d'éléments (pastilles et barres) :
- **entrées** : emerald ;
- **charges** : selon la catégorie (`categories.ts`) ;
- **épargne** : indigo ;
- **épargne générale** : emerald clair.

Le texte des KPI reste en encre neutre : la couleur sert d'indice (pastille), jamais de seul porteur de sens.

> Mode sombre : non actif. La palette `.dark` existante est un héritage de l'ancien thème et n'est branchée sur aucune bascule.

## Typographie

- **Titres** : Plus Jakarta Sans (`font-display`), extra-gras, `tracking-tight`, `word-spacing: 0.08em`.
- **Texte** : DM Sans, 400 à 700.
- **Montants** : toujours en `tabular-nums`. Les grands montants passent en `font-display text-3xl font-extrabold`.
- **Hiérarchie** : un seul `h1` par page (le titre de l'onglet) ; le nom du budget dans la navbar est un `<p>`.
- **Élision** : utiliser `deMonth()` (« d'octobre », « de mars »).

## Espacements, rayons, ombres

- **Rayon** : `--radius: 1rem` pour les cartes (`rounded-2xl`), `rounded-xl` pour les champs et boutons de liste.
- **Ombres** : `shadow-soft` (`--shadow-sm`) par défaut ; pas d'ombre forte sur les cartes de contenu.
- **Mise en page** : `max-w-6xl` ; marges `px-4 sm:px-6 lg:px-8`. Prévoir `pb-32` sur mobile pour la barre d'onglets.

## Briques (`shared/primitives.tsx`)

| Composant | Rôle |
|---|---|
| `SectionCard` | Carte de section avec titre et action |
| `Pill` / `Badge` | Statut (En cours, À venir, Terminée, Ajusté…) |
| `Segmented` | Choix exclusif court ; grille de 2 ou 3 colonnes, retour à la ligne autorisé |
| `ChipToggle` | Sélection multiple (mois d'une charge) |
| `ChoiceCard` | Choix avec explication (portée d'un changement) |
| `MoneyInput` | Montant : `inputMode="decimal"`, `autoComplete="off"`, suffixe devise |
| `FieldLabel` / `ErrorText` | Libellé et erreur (`role="alert"`) |
| `failOn(id, setError, msg)` | Affiche l'erreur et place le focus sur le champ fautif |
| `RowButton` / `AddRowButton` | Lignes cliquables des listes |

Les panneaux d'édition passent tous par `openSheet({ kind, … })` et `ResponsiveSheet` : bottom sheet sur mobile, panneau latéral sur desktop, `overscroll-contain`.

## Interaction et accessibilité

- **Cibles tactiles** : au moins 44 × 44 px (`min-h-[44px]`). Une règle globale impose `min-width: 44px` aux boutons sur écran tactile : ajouter `min-w-0` dans les grilles serrées.
- **Focus** : anneau `focus-visible:ring-2 ring-ring` ; skip link « Aller au contenu » vers `<main id="contenu">`.
- **Mouvement** : respect de `prefers-reduced-motion` (règle globale, scroll doux désactivé, `motion-reduce:animate-none`). Animer `transform` et `opacity`, jamais `transition-all`.
- **Éléments flottants** : l'indicateur de sauvegarde est centré au-dessus de la barre d'onglets, le coach se place au-dessus de lui. Les toasts apparaissent en bas à droite.
- **Sauvegarde** : autosave à 1,5 s, indicateur discret ; chaque `commit` porte un message et peut être annulé.
- **Chargement** : les onglets autres que Mois sont chargés à la demande et affichent un indicateur `role="status"` à l'intérieur du layout.

## Graphiques

Barres verticales avec un `max-w-[24px]` et des espaces de 2 px ; seul le segment du haut est arrondi. Chaque barre est un lien vers son mois, avec une infobulle au survol et au focus. Le tableau de valeurs reste disponible sous le graphique.
