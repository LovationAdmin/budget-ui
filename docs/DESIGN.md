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

### Mode sombre

- **Portée** : les écrans connectés (`/dashboard`, `/overview`, `/budget`, `/profile`, `/admin`). Les pages publiques restent claires.
- **Choix** : menu du compte › Apparence (Automatique, Clair ou Sombre). Il est stocké dans `localStorage.theme` et appliqué avant le premier rendu par le script d'`index.html`. `theme-color` suit le thème.
- **Tokens** : bloc `.dark` de `src/index.css`, avec les mêmes teintes que le thème clair (primaire bleue) sur un fond bleu-gris profond.
- **Classes de palette** (`bg-indigo-50`, `text-gray-600`…) : elles s'adaptent seules, selon leur rôle (`tailwind.palette.ts`).
  - Les fonds pâles deviennent des surfaces teintées sombres.
  - Les encres foncées deviennent claires.
  - Les aplats pleins (≥ 400) gardent leur texte blanc.
  - `bg-white` devient `--card`.
- **Code nouveau** : préférer les tokens (`bg-card`, `text-muted-foreground`…) ; n'ajouter un `dark:` que pour un cas que ce mapping ne couvre pas, par exemple l'état actif d'un contrôle segmenté (`dark:bg-white/10`).

## Typographie

- **Titres** : Plus Jakarta Sans (`font-display`), extra-gras, `tracking-tight`, `word-spacing: 0.08em`.
- **Texte** : DM Sans, 400 à 700.
- **Chargement** : une police variable par famille (`@fontsource-variable`, toutes les graisses dans un fichier), préchargée par chaque page (`scripts/prerender.mjs`) et affichée en `font-display: optional` (`postcss.config.js`). Une police en retard n'est pas substituée en cours de lecture : la page ne bouge pas (CLS).
- **Montants** : toujours en `tabular-nums`. Les grands montants passent en `font-display text-3xl font-extrabold`.
- **Séparateur de milliers** : espace insécable ordinaire (`format.ts`), car l'espace fine disparaît presque entre les chiffres tabulaires de Plus Jakarta Sans (« 20151 »).
- **Textes longs** : un nom (membre, charge, épargne) passe à la ligne, jamais coupé ; un libellé sans espace (import bancaire) se coupe où il faut (`[overflow-wrap:anywhere]`) ; une initiale se prend avec `initialOf()` (un emoji reste entier). Les noms sont limités à 80 caractères.
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
- **Mouvement** : respect de `prefers-reduced-motion` (règle globale, scroll doux désactivé, `motion-reduce:animate-none`). Animer `transform` et `opacity`, jamais `transition-all` : `transition` (couleurs, ombre, transform) ou une liste précise (`transition-[width]`).
  - **Courbes** : `ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)` pour ce qui entre ou répond à un appui, `ease-in-out` pour ce qui se déplace, `ease-drawer` pour les panneaux. Jamais `ease-in`.
  - **Durées** : 150 ms pour un appui, 200 à 300 ms pour une entrée. Les entrées (`animate-slide-up`, `fade-in`, `scale-in`) partent de 8 px ou de `scale(0.95)`, jamais de rien.
- **Survol et appui** : `hover:` ne s'applique qu'à une vraie souris (`future.hoverOnlyWhenSupported`) ; sur téléphone, un tap ne laisse plus une carte soulevée. Le retour au toucher passe par `active:` : les boutons (`Button`, `.btn-primary`) se tassent à `scale(0.97)`. Une carte-lien se soulève de 2 px au plus (`hover:-translate-y-0.5`) ; une carte qui n'est pas cliquable ne bouge pas.
- **Contrôles** : le libellé d'un bouton, d'un onglet ou d'un interrupteur n'est pas sélectionnable (pas de sélection ni de menu iOS à l'appui long). Le contenu (montants, liens) le reste.
- **Champs** : 16 px sur écran tactile (`touch:text-base`), sinon iOS zoome la page au focus. Le zoom reste autorisé.
- **Zones sûres** : `viewport-fit=cover` ; le `body` s'écarte des bords latéraux (encoche en paysage) et chaque barre fixe du bas se décale de `env(safe-area-inset-bottom)` (barre d'onglets, barres de résultat des calculateurs, `Drawer`, `ResponsiveSheet`).
- **Éléments flottants** : l'indicateur de sauvegarde est centré au-dessus de la barre d'onglets, le coach se place au-dessus de lui. Les toasts apparaissent en bas à droite.
- **Sauvegarde** : autosave à 1,5 s, indicateur discret ; chaque `commit` porte un message et peut être annulé.
- **Chargement** : les onglets autres que Mois sont chargés à la demande et affichent un indicateur `role="status"` à l'intérieur du layout.

## Graphiques

Barres verticales avec un `max-w-[24px]` et des espaces de 2 px ; seul le segment du haut est arrondi. Chaque barre est un lien vers son mois, avec une infobulle au survol et au focus. Le tableau de valeurs reste disponible sous le graphique.

## Skills de design (Claude Code)

Installées dans `.claude/skills/` pour que chaque session les trouve (copies figées : les mettre à jour depuis leur dépôt).

| Skill | Source | Quand s'en servir |
|---|---|---|
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0) | `/impeccable critique …`, `audit`, `polish`, `harden`, `typeset`, `layout`… sur un écran précis. `/impeccable init` écrit `PRODUCT.md` (il pose quelques questions). Son détecteur télécharge un binaire vérifié dans `~/.impeccable/bin/` au premier lancement. |
| `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `animation-performance` | [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT) | Décider s'il faut animer, avec quelle courbe et quelle durée ; revoir ou alléger le mouvement. |
| `mobile-native` | idem | Corrections « ça fait site web sur mon téléphone » : survol collant, zoom des champs, zones sûres. |
| `break-ui` | idem | Tester un écran avec des données extrêmes (noms longs, montants énormes, listes vides). Banc d'essai de l'onglet Mois : `npm run dev`, puis `/dev/break-ui?data=demo`, `worst`, `empty` ou `one` (`src/dev/break-ui/`, absent de la production). |
| `ask-sonner`, `pick-ui-library` | idem | Toasts Sonner ; choisir une bibliothèque plutôt que tout recoder. |
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT) | Déjà activé comme plugin (`.claude/settings.json`). Fait pour construire une page vitrine de zéro ; ici, n'en garder que les règles (texte simple, une seule mise en page, micro-animations discrètes). |

Ordre conseillé sur un écran : `impeccable critique` → corrections → `review-animations` → `break-ui` → `impeccable polish`.
