# 🏗️ Implementation Notes

This document captures the **architectural decisions** behind the fix pack — why we did things this way, what we considered, what trade-offs were made.

---

## 1. State hoisting via Context vs prop drilling

### Decision
All budget state (`people`, `charges`, `projects`, `yearlyData`, etc.) lives in `BudgetCompleteLayout` and is exposed to tabs via `BudgetContext`.

### Alternatives considered

**A. Prop drilling through `Outlet context`**
React Router supports `<Outlet context={{...}} />` and `useOutletContext()`. We rejected this because:
- The state has 30+ fields and 12+ handlers — passing them as a single object is fragile
- TypeScript inference is worse with `useOutletContext` than with a dedicated context
- We sometimes want to access budget state from sub-components of tabs (e.g., a `BudgetHeader` inside `OverviewTab`)

**B. Zustand / Jotai / Redux**
Overkill for a single-page subtree. The context is mounted once per budget visit and disposed on unmount. There's no need for global state.

**C. URL state**
Some properties (current year, current section) are URL state. The rest is too large/structured for query params.

### Trade-offs
- ✅ **Pro:** type-safe, readable, no prop drilling
- ✅ **Pro:** tabs can be developed/tested in isolation with a mock provider
- ⚠️ **Con:** the Layout component is large (~600 lines). This is acceptable because it's the only "smart" component — tabs are presentational.
- ⚠️ **Con:** changing one piece of state re-renders the entire tab (because the context value changes). Mitigated by `useMemo` on `contextValue` and per-tab subcomponent memoization.

---

## 2. Why scroll-spy as a fallback (not the primary nav)

The audit recommended routed tabs as the primary fix. We delivered that.

But `useScrollSpy` is also shipped because:
1. **It's useful elsewhere** — e.g., the public Help page might benefit from sticky-nav scroll-spy.
2. **Migration safety** — if the routed tabs break for some reason, you can revert by rendering all sections again and use `useScrollSpy` to keep nav indicator accurate.

The hook uses `IntersectionObserver` (no scroll listeners — GPU-friendly) and chooses the most-visible section by intersection ratio.

---

## 3. Mobile cards vs responsive table

### Decision
We don't try to make the existing `<table>` work on mobile. We render an entirely different component (`MobileMonthlyView`) that mirrors the data model but with a card UI.

### Why this is correct
A 7-column table with sticky-col is **cognitively impossible** to use on a 375px screen. Workarounds (horizontal scroll, virtualization, column hiding) all degrade UX.

The card pattern:
- One conceptual unit per card = one month of data
- Inline editing is touch-friendly (taps, not horizontal swipes)
- The "available to save" amount is the most important metric → it's the card's headline
- Comments use a bottom-sheet pattern (iOS-native feel)

### Trade-offs
- ⚠️ Two codebases to maintain (table + cards)
- ✅ Each can be optimized independently
- ✅ The desktop table can stay as-is (don't touch what works)

---

## 4. Save state machine vs orange banner

### Decision
A 5-state machine (`idle | pending | saving | saved | error`) replaces the boolean `hasUnsavedChanges` flag.

### Why
- `hasUnsavedChanges = true` + working auto-save = anxious banner with no clear action. Users freeze.
- The state machine maps each state to a specific UI (and a specific user mental model).
- "Saved il y a 3s" is far more reassuring than the absence of a banner.

### UX inspiration
Notion (top-right "Saved"), Figma (bottom-left "Saved"), Google Docs (file menu "All changes saved in Drive"). All use a similar pattern.

---

## 5. Onboarding: derived progress vs imperative steps

### Decision
The `OnboardingCoach` doesn't track "user clicked Next on step 3". It computes progress from **the current state of the budget**:

```ts
{
  peopleCount: people.length,
  chargesCount: charges.length,
  projectsCount: projects.length,
  hasFilledMonthlyData: someMonthHasData,
  hasRunSuggestions: aiAnalysisCompleted,
}
```

### Why
- **Resilient:** if the user reloads the page, they don't restart from step 1 — their actual progress is reflected immediately.
- **Cross-device:** sync is automatic because state is server-side.
- **Natural:** users finish steps "by doing the thing", not "by clicking through a tutorial".

This is the same pattern Linear uses for their workspace setup.

---

## 6. PWA caching strategies

| URL pattern | Strategy | Rationale |
|---|---|---|
| `/api/v1/auth/**` | NetworkOnly | Auth tokens must never be cached |
| `/api/v1/banking/**` | NetworkOnly | Bank data is sensitive + changes too often |
| `/api/v1/budgets/:id/data` | NetworkFirst (5s timeout) | Need fresh data when online; offline fallback when not |
| `/api/v1/budgets` (list) | StaleWhileRevalidate | Show cached list instantly, refresh in BG |
| `*.png\|.jpg\|.svg` | CacheFirst (30 days) | Images change rarely |
| Google Fonts | StaleWhileRevalidate / CacheFirst | Standard PWA pattern |

### What this gives the user
- Offline read access to their last viewed budget
- Instant load on reopen (cached shell + assets)
- Automatic update prompt when new version deploys (via `onNeedRefresh`)

---

## 7. PasswordInput accessibility

The toggle is a `<button type="button">` with:
- `aria-pressed` reflecting visibility state
- `aria-label` that announces the action
- 44px touch target on mobile, 32px on desktop
- `tabIndex={-1}` so keyboard users can tab through inputs naturally without hitting the toggle

We considered `aria-checked` but `aria-pressed` is more semantically correct for a stateful button that's not a checkbox.

---

## 8. Why we kept the existing `useAutoSave` shape

The new `BudgetComplete` calls:
```ts
useAutoSave(saveCallback, isPending, isDemoMode);
```

Three positional arguments. We kept this because:
- It matches the existing pattern in your codebase
- Adding an options object would be a breaking change
- The hook is small and easy to reason about

If you prefer named options:
```ts
// Alternative shape (not used, just for reference):
useAutoSave({
  callback: saveCallback,
  enabled: isPending && !isDemoMode,
  delay: 2000,
});
```

---

## 9. What we deliberately did NOT do

### Replace the whole tutorial system
The original `TutorialModal` is preserved (accessible via the profile menu's "Voir le tutoriel"). It has its place for users who explicitly want a guided tour. We just made it opt-in instead of force-on-first-load.

### Refactor `MonthlyTable` itself
The desktop `<table>` works fine on desktop. Refactoring it for sub-component memoization (P2 #20) is a perf improvement but not a UX issue at desktop sizes. We left a note in CHANGELOG with the one-line patch users can apply.

### Replace recharts with a custom chart library
The audit didn't flag chart performance as critical. Recharts is heavy (~150 KB) but Vite chunk-splits it (see `vite.config.ts`'s `manualChunks`). If chart perf becomes an issue, consider `lightweight-charts` or pure SVG.

### Add E2E tests
Outside the scope of a UX fix pack. We did add `aria-current` and `aria-pressed` attributes throughout — this enables Cypress/Playwright assertions like:
```ts
cy.contains('Charges').should('have.attr', 'aria-current', 'page');
```

### Touch the backend
Two backend touchpoints are flagged in MIGRATION.md (Phase 5.3 — tutorial persistence on user profile, Phase 5.4 — `hasRunSuggestions` tracking). Both are optional and documented for follow-up.

---

## 10. Future improvements (not in this pack)

These were identified but deemed out-of-scope:

- **Virtual scroll** for budgets with 50+ projects (current: works fine for <20)
- **Optimistic UI** for member invites (currently waits for server confirmation)
- **Drag-and-drop** to reorder charges by priority
- **Bulk actions** (select multiple charges → categorize/delete in one go)
- **Smart notifications digest** ("Marie made 5 changes today" vs 5 separate toasts)
- **Keyboard shortcuts** (`Cmd+S` to force save, `Cmd+K` to navigate tabs, etc.)
- **Sentry breadcrumbs** for save failures with full state snapshots

Most of these are 1-2 day projects each. Prioritize based on user feedback.

---

## 11. Performance budget targets

After applying this pack, aim for:

| Metric | Mobile target | Desktop target |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | < 1.5s |
| INP (Interaction to Next Paint) | < 200ms | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.1 |
| Lighthouse Performance | > 85 | > 95 |
| Lighthouse Accessibility | > 95 | > 95 |
| Lighthouse Best Practices | > 95 | > 95 |
| Lighthouse SEO | > 90 | > 95 |

Run Lighthouse before and after to verify gains. The biggest wins come from:
1. Routed tabs → less DOM at any moment
2. PWA caching → instant reload
3. Self-hosted fonts (if you opt in) → −120 KB

---

## 12. Testing recommendations

### Manual testing matrix
- [ ] iPhone SE 2020 (375×667 — smallest modern screen)
- [ ] iPhone 14 Pro (Dynamic Island — safe-area-inset)
- [ ] Samsung Galaxy A13 (mid-range Android, 4G)
- [ ] iPad (tablet breakpoint)
- [ ] MacBook Air 13" (1280×800)
- [ ] Desktop 1920×1080

### Browsers
- [ ] Safari iOS 16+
- [ ] Safari macOS 16+
- [ ] Chrome Android (latest)
- [ ] Chrome desktop (latest)
- [ ] Firefox desktop (latest)
- [ ] Opera (mentioned in your spec)
- [ ] Edge (Windows users)

### A11y checks
- [ ] Tab through the entire BudgetNavbar — focus visible at every step
- [ ] Screen reader announces tabs as buttons with `aria-current="page"`
- [ ] AlertDialog steals focus correctly when opened
- [ ] PasswordInput toggle announces state change
- [ ] Color contrast: BudgetNavbar active state should pass WCAG AA (filled bg-primary does)

---

## Final note

This pack is **self-contained**. None of the new files depend on anything outside what we explicitly listed. If you find a missing import or a type mismatch, it's because your codebase has evolved differently — please raise an issue and I (Claude) will adapt.

Each file has a comment header explaining its purpose and which audit issue(s) it addresses. Use that as your reference when reviewing PRs.

Good luck with the migration. The biggest user-facing wins (P0 #1 + P0 #2) should be visible within minutes of deploying. Take screenshots — your future self will appreciate the before/after.

— *This pack was crafted with care for Budget Famille's mobile users on Safari iOS / Chrome Android / Opera.*
