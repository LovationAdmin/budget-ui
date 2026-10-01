# Handoff — Refonte « Mois » (à reprendre dans Claude Code)

> Fichier de passation : à supprimer dans la PR finale une fois tout terminé.
> Doc fonctionnelle et technique : `docs/wiki/refonte-mois.md` (à garder).

## Consignes de Libasse

- Aller **jusqu'au bout** : implémenter, merger sur `main` les dépôts concernés, déployer, et **appliquer toutes les recommandations** sans redemander.
- Zéro régression : les tests de parité legacy (`npm test`) doivent rester verts.
- Échanges en français ; commentaires de code en anglais ; fichiers complets ; prose minimale.
- Go : préférer `github.com/pkg/errors` (`errors.Wrap`) à `fmt.Errorf` pour le code nouveau (pas encore dans `go.mod` de budget-api : l'ajouter).
- Une page wiki Markdown par nouvelle fonctionnalité (fait : `docs/wiki/refonte-mois.md`).
- Le `CLAUDE.md` du dépôt demande `graphify update .` après modification du code.

## État au 2 octobre 2026

**budget-ui** — branche `claude/refonte-mois`, un commit au-dessus de `main` (`e0f1eeb`) :
modèle v3 + moteur + tests (19 verts, dont parité sur 250 budgets aléatoires), écrans Mois / Charges / Épargne / Foyer / Année, panneaux d'édition, assistant de répartition, Budget IA adapté, textes d'aide, contrastes AA. `npm test` et `npm run build` passent. **Jamais poussée** (le proxy de la session Cowork refusait le push).

**budget-api** — rien de modifié.

**budget-mobile** — rien de modifié (voir tâche 4).

## Tâche 0 — Récupérer la branche

Depuis le patch (`budget-ui-refonte-mois.patch`) :

    cd budget-ui && git fetch origin && git checkout -B claude/refonte-mois origin/main
    git am /chemin/budget-ui-refonte-mois.patch
    npm install && npm test && npm run build
    git push -u origin claude/refonte-mois

Ou depuis le bundle : `git fetch /chemin/budget-ui-refonte-mois.bundle claude/refonte-mois:claude/refonte-mois`.

## Tâche 1 — Vérification bout en bout du front (avant merge)

Playwright sur `vite preview`, API mockée (`page.route` sur `http://localhost:8080/api/v1/**`), horloge figée (`page.clock.setFixedTime('2026-09-15T10:00:00')`), auth via `localStorage` (`token` + `user` JSON). Mocks : `GET /budgets/b1` (`{id,name,is_owner,members,location:'FR',currency:'EUR'}`), `GET /budgets/b1/data` (budget **legacy** réaliste : 2 membres, loyer, une charge janvier→mars 2026, une épargne mensuelle depuis janvier, une épargne libre, `yearlyData["2026"]` avec `months/expenses/monthComments/expenseComments/lockedMonths`, `oneTimeIncomes`), `PUT /budgets/b1/data` (capturer le corps), `/banking/budgets/b1/reality-check` → `{total_real_cash:0}`, `/categorize` → `{category:'HOUSING'}`, le reste → `200 {}`.

Scénarios à valider (desktop 1280 px et mobile 390 px, captures à l'appui, aucune erreur console React) :

1. `/budget/b1/complete` redirige vers `/month` ; titre « Septembre 2026 » ; la charge janvier→mars n'apparaît pas en septembre, mais apparaît dans Charges → « Terminées ».
2. Au chargement d'un budget legacy, un seul `PUT` de migration : `schemaVersion: 3`, mois passés `lockedMonths` + `snapshots`, champs legacy conservés, clés inconnues préservées.
3. Membre : passer Camille en « Montant fixe 1 600 € » « À partir de sept. » → entrées du mois et « Ce qui change » mis à jour ; août (clôturé) inchangé ; `contributions` présent dans le `PUT`.
4. Charge « Certains mois » sauf juillet-août depuis le mois → « En clair » correct ; absente en juillet 2027.
5. Montant « à partir de » novembre → octobre inchangé ; « ce mois seulement » → badge « Ajustée » ; « Retirer de ce mois » puis « Rétablir ».
6. Arrêter une charge → « Terminées » ; Relancer → mois de pause vides, historique intact.
7. Épargne : créer (mensuelle + objectif), payer une dépense avec, passer une épargne libre en mensuelle ; soldes « En caisse » cohérents.
8. Mois clôturé : toucher une ligne → toast « Rouvrir » ; Rouvrir affiche le diff ; Clôturer refige.
9. Foyer → assistant : prorata / parts égales / même reste avec marges 0/5/10 % ; « Appliquer à partir de » ne touche pas les mois d'avant.
10. Année : barres et tableau, clic → ouvre le bon mois ; `?y=` fonctionne.
11. Annuler (toast) restaure l'état précédent et sauvegarde.
12. Budget IA : proposition mockée appliquée à partir du premier mois ouvert ; contributions appliquées si structure `three_accounts`.

Corriger ce qui casse, puis ouvrir la PR budget-ui (ne pas merger avant la tâche 2).

## Tâche 2 — Recap mensuel v3 côté backend (budget-api)

Fichier : `services/monthly_recap.go` (+ `services/monthly_recap_test.go`). Aujourd'hui il compte `person.Salary` comme revenu et `charge.Amount` tous les mois de la fenêtre. Il doit suivre exactement les règles du front (voir `docs/wiki/refonte-mois.md`, section « Règles de calcul », et `src/lib/budget/engine.ts`) :

- **Décodage** : étendre `budgetPerson` (`salaryHistory`, `salaryOverrides`, `contributions`, `contributionOverrides`), `budgetCharge` (`frequency`, `months`, `smooth`, `amountHistory`, `overrides`), `budgetProject` (`amountHistory`, `overrides`), `budgetYear` (`snapshots` : tableau de 12 `null | {v, closedAt, people[{id,name,salary,contribution}], charges[{id,label,amount,planned,category?,frequency?,skipped?}], projects[{id,label,allocation}], oneOffs[{id,label,amount}]}`), `budgetOneTime` (`items`). Tout reste optionnel : un payload legacy doit donner les mêmes chiffres qu'aujourd'hui.
- **`aggregateMonth`** : si le mois est clôturé (lock de l'année = true, ou absent et mois passé) **et** a une photo → chiffres de la photo. Sinon : `BaseIncome` = Σ contributions (règle datée en vigueur, `all` = salaire, `fixed` = valeur, `percent` = salaire × % ; exceptions du mois prioritaires ; salaire = exception ?? étape `salaryHistory` ?? `salary`) ; `RecurringCharges` = Σ charges du mois selon fréquence (`custom` : mois listés ; `yearly` : mois d'ancrage = mois de `startDate`, ou chaque mois à montant/12 si `smooth` ; `once` : mois de `startDate`), montant = exception ?? étape `amountHistory` ?? `amount`, règle à 0 sans exception = absente. `ProjectsAllocated` peut rester `sumMap(months[idx])` (le front y recopie les allocations résolues, photo comprise).
- **`aggregateYearTotals`** : même logique sur les 12 mois.
- Libellés d'e-mail : « Revenus » devient « Entrées du pot commun » quand au moins un membre a des `contributions` (sinon inchangé).
- **Tests** : tables de cas v3 (contribution fixe et %, étape d'`amountHistory`, exception à 0, `custom`, `yearly` lissée et non lissée, `once`, mois clôturé avec photo, revenus ponctuels `items`) + parité legacy (payloads actuels → résultats identiques). `go test ./...` vert.
- PR budget-api, merge **en premier** (le front v3 écrit déjà des champs que l'ancien recap ignore sans planter, mais les chiffres du recap seraient faux pour les budgets qui utilisent les contributions).

## Tâche 3 — Merge et déploiement

1. budget-api : merge `main` → Render auto-déploie (service `srv-d4n1c1fgi27c738makc0`, https://budget-api-778i.onrender.com). Vérifier le déploiement et les logs.
2. budget-ui : merge `main` → Vercel auto-déploie. PWA en `autoUpdate` (skipWaiting/clientsClaim) : les clients se mettent à jour au rechargement.
3. Recette en prod sur un vrai budget : la migration écrit `schemaVersion: 3` une seule fois, les mois passés sont figés, les totaux des mois passés sont identiques à avant la mise en prod.
4. Rollback : revert du merge front ; les données v3 restent lisibles par l'ancien front (format additif), qui ignorera simplement contributions et règles datées.

## Tâche 4 — Compatibilité budget-mobile

L'app React Native lit le même blob. À vérifier : (a) si elle **écrit** le blob, elle doit préserver les clés inconnues (spread de l'objet d'origine) sinon elle effacerait `contributions`, `amountHistory`, `overrides`, `snapshots`, `items` ; si ce n'est pas garanti, la passer en lecture seule pour `schemaVersion >= 3` ou porter `src/lib/budget` (TS pur, sans dépendance React) ; (b) ses totaux utilisent le salaire comme revenu → réutiliser le moteur pour afficher les mêmes chiffres que le web.

## Tâche 5 — Recommandations restantes (à appliquer)

- **Code splitting** : le bundle principal fait ~820 kB ; charger les onglets avec `React.lazy` (au minimum Budget IA, Reality Check, Année) et les pages publiques.
- **Mode sombre** : les nouveaux composants utilisent des teintes claires codées en dur (`bg-emerald-50`, `bg-orange-50`, `text-*-950`…) ; ajouter les variantes `dark:` si le thème sombre est actif dans l'app.
- Supprimer ce fichier de passation dans la PR finale ; garder `docs/wiki/refonte-mois.md` à jour.

## Repères

- Maquette cliquable validée par Libasse : https://claude.ai/artifact/QsDEvbpzbjyEQafyMKN3Sq
- Décisions prises avec Libasse : réglage de contribution **par membre** (tout / fixe / %) + assistant (prorata, 50/50, même reste) ; la vue **Mois** est le cœur de l'app ; modifications « ce mois-ci seulement » / « à partir de ce mois » ; mois passés figés automatiquement.
- API d'édition côté front : toute modification passe par `commit(updater, { message, saveNow, undoable })` avec les fonctions pures de `src/lib/budget/mutations.ts` ; tout panneau s'ouvre par `openSheet({ kind, … })` (`src/components/budget/sheets/types.ts`).
