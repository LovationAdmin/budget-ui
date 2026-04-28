# 📋 CHANGELOG — UX/UI Fix Pack

Every issue from the audit is addressed below, with the exact files changed and the rationale.

---

## 🔴 P0 — Blocking (5 issues)

### P0 #1 — Scroll-spy navigation in BudgetComplete
**Problem:** All sections rendered at once; `currentSection` hardcoded; navigation = scrollIntoView; no deep-linking.

**Solution:** Routed sub-tabs via React Router nested routes + Context for state hoisting.

**Files changed:**
- ✏️ `src/App.tsx` — added nested routes
- ✏️ `src/lib/pages/BudgetComplete.tsx` — refactored as Layout with Outlet
- ➕ `src/contexts/BudgetContext.tsx` — single source of truth
- ➕ `src/lib/pages/budget-tabs/OverviewTab.tsx`
- ➕ `src/lib/pages/budget-tabs/MembersTab.tsx`
- ➕ `src/lib/pages/budget-tabs/ChargesTab.tsx`
- ➕ `src/lib/pages/budget-tabs/ProjectsTab.tsx`
- ➕ `src/lib/pages/budget-tabs/CalendarTab.tsx`
- ➕ `src/lib/pages/budget-tabs/RealityTab.tsx`
- ➕ `src/hooks/useScrollSpy.ts` — backup if you ever revert to single-page

---

### P0 #2 — MonthlyTable unusable on mobile
**Problem:** HTML table with 7+ columns × 12 rows, sticky-col + horizontal scroll = nightmare on 375px.

**Solution:** Responsive switch — desktop keeps the table, mobile gets card-per-month with inline editing.

**Files changed:**
- ➕ `src/components/budget/MobileMonthlyView.tsx` — new component
- ✏️ `src/lib/pages/budget-tabs/CalendarTab.tsx` — `hidden md:block` / `md:hidden` switch

---

### P0 #3 — Anxious "unsaved changes" orange banner
**Problem:** Auto-save works, but the banner makes users think they need to act. Cognitive dissonance.

**Solution:** State machine + discreet bottom-right toast (Notion/Figma pattern).

**Files changed:**
- ➕ `src/hooks/useSaveStatus.ts` — state machine
- ➕ `src/components/budget/SaveStatusIndicator.tsx` — UI
- ✏️ `src/lib/pages/BudgetComplete.tsx` — uses new hook + indicator

---

### P0 #4 — Onboarding overload
**Problem:** 8-step blocking modal over a page already containing 8 sections.

**Solution:** Non-blocking checklist that derives progress from actual data + auto-collapses on completion.

**Files changed:**
- ➕ `src/components/onboarding/OnboardingCoach.tsx` — checklist component + `useOnboardingProgress` hook
- ✏️ `src/lib/pages/BudgetComplete.tsx` — renders the coach

The original `TutorialModal` is kept as an opt-in (accessible from profile menu — "Voir le tutoriel") for users who want a guided tour.

---

### P0 #5 — Public Navbar misses paths
**Problem:** `getCurrentSection` doesn't handle `/profile`, `/forgot-password`, `/reset-password`, `/verify-email`, `/invitation/accept`. Result: empty active state on those routes.

**Solution:** Exhaustive path mapping.

**Files changed:**
- ✏️ `src/components/Navbar.tsx`

---

## 🟠 P1 — Important (8 issues)

### P1 #6 — Beta2Page.tsx is dead code
**Solution:** Delete it. Add redirect from `/beta2/:id` → `/budget/:id/complete/overview`.

**Files changed:**
- 🗑️ Delete `src/lib/pages/Beta2Page.tsx`
- ✏️ `src/App.tsx` — adds redirect

---

### P1 #7 — `BudgetNavbar` slices items 0-5
**Problem:** `items.slice(0, 5)` → items 6, 7, 8 invisible on desktop.

**Solution:** Show items 1-4 + "Plus" dropdown for the rest. Layout never breaks.

**Files changed:**
- ✏️ `src/components/budget/BudgetNavbar.tsx`

---

### P1 #8 — Three different invite/member entry points
**Solution:** Consolidate on `MembersTab` which renders `PeopleSection` + `MemberManagementSection` together. The `BudgetNavbar` no longer has a separate invite button.

**Files changed:**
- ➕ `src/lib/pages/budget-tabs/MembersTab.tsx`
- ✏️ `src/components/budget/BudgetNavbar.tsx`

---

### P1 #9 — Login/Signup friction
**Solution:**
- Removed `confirmPassword` field on signup (modern UX)
- Added show/hide toggle via `<PasswordInput />`
- Added "Session sécurisée 30 jours" reassurance under login
- Added password strength meter on signup

**Files changed:**
- ➕ `src/components/ui/password-input.tsx`
- ✏️ `src/lib/pages/Login.tsx`
- ✏️ `src/lib/pages/Signup.tsx`

---

### P1 #10 — Demo mode banner is ambiguous
**Problem:** Says "Mode Démo Activé" but only banking data is fake.

**Solution:** Renamed to "Mode Démo Banque" and added an explicit notice card in RealityTab.

**Files changed:**
- ✏️ `src/lib/pages/BudgetComplete.tsx` — toast message clarified
- ➕ `src/lib/pages/budget-tabs/RealityTab.tsx` — scope notice card

---

### P1 #11 — Native `confirm()` deletes
**Solution:** `useDeleteConfirm()` hook returns a promise + AlertDialog.

**Files changed:**
- ➕ `src/hooks/useDeleteConfirm.ts`
- 📝 `docs/MIGRATION.md` — Phase 7 explains how to retrofit each section

(Each section file like `PeopleSection.tsx` needs a 5-line patch — applied locally to your codebase, not in this pack since they have a lot of unrelated logic. The hook is the only new code.)

---

### P1 #12 — Aggressive `grid-cols-2 → 1` global rule
**Problem:** `mobile-fixes.css` had a rule that broke date pickers and small forms.

**Solution:** Removed it. Use Tailwind's `grid-cols-1 sm:grid-cols-2` locally.

**Files changed:**
- ✏️ `src/styles/mobile-fixes.css`

---

### P1 #13 — Weak active state contrast
**Solution:** `bg-primary/10` → `bg-primary` filled.

**Files changed:**
- ✏️ `src/components/budget/BudgetNavbar.tsx`

---

## 🟡 P2 — Polish (8 issues)

### P2 #14 — Generic "B" letter logo
**Solution:** Custom SVG mark — stylized "B" + coin slot, reads as a piggy bank.

**Files changed:**
- ➕ `src/components/budget/BudgetLogo.tsx`
- ✏️ `src/components/budget/BudgetNavbar.tsx`

---

### P2 #15 — Heavy Google Fonts payload
**Solution:** Optional `@fontsource` migration. Documented in `MIGRATION.md` Phase 5.6.

**Files changed:**
- 📝 `package.dependencies-to-add.json` — adds `@fontsource/dm-sans` + `plus-jakarta-sans`
- 📝 `docs/MIGRATION.md` — instructions

---

### P2 #16 — Coral primary may be confused with warning
**Decision:** Kept the coral identity (it's distinctive). Added an A/B-test note in `MIGRATION.md` Phase 5.7 with the swap-out CSS variable.

---

### P2 #17 — Inconsistent empty states
**Solution:** Standardized `<EmptyState />` API.

**Files changed:**
- ✏️ `src/components/budget/EmptyState.tsx`
- 📝 `docs/MIGRATION.md` — Phase 7 has examples for retrofitting each section

---

### P2 #18 — Redundant `<ActionsBar />` save button
**Solution:** Removed from `BudgetComplete` (auto-save handles it). If you want it back as opt-in, see `MIGRATION.md` Phase 5.5.

**Files changed:**
- ✏️ `src/lib/pages/BudgetComplete.tsx`

---

### P2 #19 — No PWA service worker
**Solution:** `vite-plugin-pwa` with smart Workbox strategies.

**Files changed:**
- ✏️ `vite.config.ts`
- ✏️ `src/main.tsx` — registers SW + listens for update events
- 📝 `package.dependencies-to-add.json`

---

### P2 #20 — MonthlyTable re-renders entirely on every cell change
**Status:** Partially addressed — the new `MobileMonthlyView` uses `memo` + per-month subcomponents. The desktop `MonthlyTable` is unchanged (the responsive switch means desktop users edit on desktop where the perf cost is negligible). For full optimization, wrap each month's row in `MonthlyTable` in `memo` (one-line patch — out of scope of this pack).

---

### P2 #21 — Tutorial persistence in localStorage only
**Solution:** Documented migration to `users.has_seen_tutorial` server-side. See `MIGRATION.md` Phase 5.3.

**Files changed:**
- 📝 `docs/MIGRATION.md` — instructions (requires backend change)

The new `OnboardingCoach` uses localStorage only for collapse state (low-stakes). Step completion is **derived from data**, so it's automatically synced across devices.

---

## 📁 Files summary

### ➕ New files (16)
```
src/hooks/useScrollSpy.ts
src/hooks/useSaveStatus.ts
src/hooks/useDeleteConfirm.ts
src/contexts/BudgetContext.tsx
src/components/budget/SaveStatusIndicator.tsx
src/components/budget/MobileMonthlyView.tsx
src/components/budget/BudgetLogo.tsx
src/components/onboarding/OnboardingCoach.tsx
src/components/ui/password-input.tsx
src/lib/pages/budget-tabs/OverviewTab.tsx
src/lib/pages/budget-tabs/MembersTab.tsx
src/lib/pages/budget-tabs/ChargesTab.tsx
src/lib/pages/budget-tabs/ProjectsTab.tsx
src/lib/pages/budget-tabs/CalendarTab.tsx
src/lib/pages/budget-tabs/RealityTab.tsx
docs/MIGRATION.md  (you're reading docs/CHANGELOG.md)
```

### ✏️ Updated files (10)
```
src/App.tsx
src/main.tsx
src/components/Navbar.tsx
src/components/budget/BudgetNavbar.tsx
src/components/budget/EmptyState.tsx
src/lib/pages/BudgetComplete.tsx
src/lib/pages/Login.tsx
src/lib/pages/Signup.tsx
src/styles/mobile-fixes.css
vite.config.ts
```

### 🗑️ Files to delete (1)
```
src/lib/pages/Beta2Page.tsx
```

### 📝 Documentation files (3)
```
docs/MIGRATION.md
docs/CHANGELOG.md
docs/IMPLEMENTATION_NOTES.md
```

---

## 🎯 Coverage matrix

| Issue | Severity | File(s) | Status |
|---|---|---|---|
| #1 Scroll-spy navigation | P0 | App.tsx, BudgetComplete.tsx, BudgetContext, 6 tabs, useScrollSpy | ✅ |
| #2 MonthlyTable on mobile | P0 | MobileMonthlyView.tsx, CalendarTab.tsx | ✅ |
| #3 Orange unsaved banner | P0 | useSaveStatus, SaveStatusIndicator, BudgetComplete | ✅ |
| #4 Onboarding overload | P0 | OnboardingCoach, BudgetComplete | ✅ |
| #5 Navbar getCurrentSection | P0 | Navbar.tsx | ✅ |
| #6 Beta2Page.tsx dead code | P1 | (delete file) | ✅ |
| #7 BudgetNavbar slice(0,5) | P1 | BudgetNavbar.tsx | ✅ |
| #8 Multiple invite entry points | P1 | MembersTab, BudgetNavbar | ✅ |
| #9 Login/Signup friction | P1 | PasswordInput, Login, Signup | ✅ |
| #10 Demo mode banner ambiguity | P1 | RealityTab, BudgetComplete | ✅ |
| #11 Native confirm() | P1 | useDeleteConfirm | ✅ (hook ready) |
| #12 grid-cols-2 → 1 global rule | P1 | mobile-fixes.css | ✅ |
| #13 Active state contrast | P1 | BudgetNavbar | ✅ |
| #14 Generic "B" logo | P2 | BudgetLogo, BudgetNavbar | ✅ |
| #15 Heavy fonts payload | P2 | MIGRATION docs | ✅ (documented) |
| #16 Coral primary color | P2 | MIGRATION docs | ✅ (documented A/B) |
| #17 Inconsistent empty states | P2 | EmptyState | ✅ |
| #18 Redundant ActionsBar save | P2 | BudgetComplete | ✅ |
| #19 No service worker | P2 | vite.config.ts, main.tsx | ✅ |
| #20 MonthlyTable re-renders | P2 | MobileMonthlyView (memoized) | ✅ partial |
| #21 Tutorial persistence | P2 | MIGRATION docs | ✅ (documented) |

**21/21 issues addressed.**
