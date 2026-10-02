# Refonte « Mois » — salaire ≠ contribution, règles datées, mois clôturés

> Statut : en production — budget-ui (LovationAdmin/budget-ui#25) et recap backend v3 (LovationAdmin/budget-api#16, parité vérifiée contre ce moteur via `services/testdata/v3_parity.json`). Les onglets autres que Mois sont chargés à la demande (`React.lazy`).

## Pourquoi

Trois irritants remontés à l'usage :

1. **Salaire ≠ ce qu'on met dans le pot commun.** L'app comptait tout le salaire de chaque membre comme entrée du foyer.
2. **Les charges datées polluent la liste.** Une charge de janvier à mars restait visible en août, et on ne pouvait pas la supprimer sans casser l'historique.
3. **L'affectation des dates n'est pas intuitive.** Ce qu'on veut dire, c'est « pour chaque mois, quelles charges s'appliquent et quelles entrées ».

## Ce qui change pour l'utilisateur

| Avant | Maintenant |
|---|---|
| Un tableau de 12 colonnes à remplir | La vue **Mois** : un mois à la fois, rempli automatiquement à partir des règles |
| Le salaire = entrée du foyer | Chaque membre a un **salaire** et une **contribution au pot commun** (tout le salaire, montant fixe ou %) |
| Dates de début/fin au jour près | Des **mois** (« à partir d'octobre », « pendant 12 mois », « jusqu'en juin 2027 ») |
| Modifier un montant réécrit le passé | Chaque modification propose **« ce mois-ci seulement »** ou **« à partir de ce mois »** |
| Charges toujours listées | Catalogue **En cours / À venir / Terminées** ; une charge terminée disparaît des mois suivants mais reste dans l'historique |
| Fréquence unique (mensuelle) | **Chaque mois**, **certains mois** (ex. cantine sauf juillet-août), **chaque année** (avec lissage /12 optionnel), **une fois** |
| Verrou manuel par mois | Les mois passés se **clôturent tout seuls** avec une photo figée ; « Rouvrir » montre d'abord ce qui va changer |
| — | **Ce qui change** ce mois-ci par rapport au précédent |
| — | Assistant **« Répartir le pot commun »** : au prorata, à parts égales, ou même reste pour chacun, avec marge de sécurité |
| — | **Épargne générale** : reçoit le reste de chaque mois ; on peut payer une dépense avec n'importe quelle cagnotte |

Navigation : **Mois · Charges · Épargne · Foyer · Année** (+ Budget IA, Reality Check). Barre d'onglets en bas sur mobile, panneau latéral (desktop) ou feuille du bas (mobile) pour toutes les éditions, toast « Annuler » après chaque modification.

## Modèle de données v3

Le budget reste **un seul blob JSON** (`PUT /budgets/:id/data` avec `{ data }`). La v3 est **purement additive** : un budget sans champ v3 donne exactement les mêmes chiffres qu'avant (prouvé par des tests de parité sur 250 budgets aléatoires). Les champs historiques (`salary`, `amount`, `monthlyAmount`, `startDate`, `endDate`, `yearlyData`, `oneTimeIncomes`, `lockedMonths`) restent écrits et synchronisés pour le recap backend et les anciens clients PWA ; les clés inconnues sont préservées.

```jsonc
{
  "schemaVersion": 3,
  "people": [{
    "id": "p1", "name": "Camille", "salary": 3600,          // salaire en vigueur aujourd'hui
    "startDate": "2026-01-01", "endDate": "2026-12-31",      // optionnels, précision mois
    "salaryHistory": [{ "from": "2026-01", "amount": 3400 }, { "from": "2026-09", "amount": 3600 }],
    "salaryOverrides": { "2026-12": 4200 },                   // ce mois-ci seulement
    "contributions": [{ "from": "2026-10", "mode": "fixed", "value": 1600 }],  // absent = tout le salaire
    "contributionOverrides": { "2026-11": 1200 }
  }],
  "charges": [{
    "id": "c1", "label": "Cantine", "amount": 120,           // montant en vigueur aujourd'hui
    "frequency": "custom", "months": [1,2,3,4,5,6,9,10,11,12],// monthly | custom | yearly | once (absent = monthly)
    "smooth": true,                                           // yearly seulement : amount/12 chaque mois
    "amountHistory": [{ "from": "2026-09", "amount": 120 }],
    "overrides": { "2026-12": 0 }                             // 0 = retirée ce mois-là
  }],
  "projects": [{
    "id": "s1", "label": "Vacances", "monthlyAmount": 200,   // nombre = épargne mensuelle ; absent = montant libre
    "targetAmount": 3000, "amountHistory": [...], "overrides": {...}
  }],
  "yearlyData": { "2026": {
    "months": [ { "s1": 200, "s2": 50 }, ... ],               // 12 entrées ; épargnes mensuelles recopiées (valeur résolue)
    "expenses": [ { "s1": 1400, "epargne": 300 }, ... ],      // argent sorti d'une cagnotte ; "epargne" = épargne générale
    "monthComments": ["", ...], "expenseComments": [{...}, ...],
    "lockedMonths": { "Janvier": true, ... },                 // par année ; false = rouvert explicitement
    "snapshots": [ { "v": 1, "closedAt": "...", "people": [...], "charges": [...], "projects": [...], "oneOffs": [...] } | null, ... ]
  }},
  "oneTimeIncomes": { "2026": [ { "amount": 345.5, "description": "Prime, Remboursement",
                                  "items": [{ "id": "oo-1", "label": "Prime", "amount": 300 }, ...] }, ... ] }
}
```

## Règles de calcul (moteur `src/lib/budget/engine.ts`)

- **Précédence** pour un mois : mois clôturé avec photo → la photo ; sinon les règles, où une étape datée (« à partir de ») bat le montant de base et une exception (« ce mois-ci seulement ») bat les deux.
- **Étape en vigueur** : la dernière avec `from ≤ mois` ; un mois antérieur à toutes les étapes prend la première.
- **Mois clôturé** : `lock === true`, ou `lock` absent et mois passé. Au chargement, les mois passés sans photo sont figés automatiquement (pour les mois déjà verrouillés par l'ancienne version, les allocations stockées font foi). Rouvrir = `lock: false` + suppression de la photo.
- **Membre** : actif dans sa fenêtre ; contribution = exception du mois ?? règle (`all` = salaire, `fixed` = valeur, `percent` = salaire × %).
- **Charge** : présente si dans la fenêtre et selon sa fréquence (annuelle : mois d'ancrage = mois de `startDate`, sauf si lissée) ; une règle à 0 sans exception = absente (pause entre un arrêt et une relance).
- **Pot commun** : entrées = Σ contributions + revenus ponctuels ; reste = entrées − charges − épargnes → épargne générale.
- **Soldes** : cagnotte = Σ (allocation − dépenses) depuis janvier de la plus ancienne année ; épargne générale = Σ (reste − dépenses « epargne »).

## Code (budget-ui)

| Zone | Fichiers |
|---|---|
| Modèle & moteur | `src/lib/budget/{types,months,format,engine,codec,mutations,categories}.ts` |
| Tests | `src/lib/budget/__tests__/budget.test.ts` — `npm test` |
| État | `src/contexts/BudgetContext.tsx`, `src/lib/pages/BudgetComplete.tsx` (modèle unique, `commit()`, autosave 1,5 s, annulation) |
| Écrans | `src/lib/pages/budget-tabs/{MonthTab,ChargesTab,ProjectsTab,MembersTab,YearTab}.tsx` |
| Mois | `src/components/budget/month/{MonthHeader,MonthSections,MonthSidebar}.tsx` |
| Panneaux d'édition | `src/components/budget/sheets/*` (une entrée `openSheet({ kind, … })`) |
| Primitives | `src/components/budget/shared/*` (ResponsiveSheet, MonthPicker, primitives, hooks) |

Routes : `/budget/:id/complete/{month,charges,projects,members,year,ai,reality}` ; `?m=YYYY-MM` sur Mois, `?y=YYYY` sur Année ; `/overview` → `/month`, `/calendar` → `/year`.

## Charges perso (argent de poche)

Une charge perso est une charge payée par un membre sur son argent de poche (impôt, envoi d'argent, crédit perso…).

- **Stockage** : elle est rangée à part dans le blob, sous `personalCharges`, avec `ownerId` (id du membre), `private` éventuel et `createdBy` (id de l'utilisateur). Les lecteurs du pot commun (recap backend, app mobile, anciennes versions) ne la voient donc jamais dans `charges`.
- **En mémoire** : elle vit dans `model.charges`, avec `ownerId`. Toutes les mutations des charges (montant daté, exception, arrêt, suppression) s'appliquent à l'identique.
- **Moteur** : `month.personal` donne les charges perso du mois. Pour chaque membre, `people[].personalCharges` en donne la somme et `available` vaut `keep − personalCharges`. `totals.personal` donne le total du foyer. Les charges perso n'entrent jamais dans `reste`. Elles sont figées avec le mois clôturé (`snapshot.personal`).
- **Répartition** : elle les ignore. Les montants sont simplement indiqués dans l'argent de poche de chacun (« dont X € de charges perso »).
- **Privée** : le blob partagé ne contient que `label: "Charge privée"`, sans catégorie ni note. Le vrai nom, la catégorie et la note sont stockés côté serveur (`/budgets/:id/private-items`, table `private_items`, chiffrés en AES) et lisibles par leur seul créateur ; les montants restent dans le blob, visibles de tous.
  - Clé : `charge:<id>` ; le contexte expose `privateCharges`, `savePrivateCharge` et `deletePrivateCharge`.
  - Migration : une charge privée créée avant ce stockage, qui porte encore son vrai nom dans le blob, est déplacée côté serveur puis effacée du blob la première fois que son créateur ouvre le budget.
