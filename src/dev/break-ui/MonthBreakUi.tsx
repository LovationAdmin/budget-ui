// src/dev/break-ui/MonthBreakUi.tsx
// ============================================================================
// Dev-only harness (route /dev/break-ui, never in a production build): the
// real Month tab, fed through BudgetProvider with a fixture instead of the
// API. `?data=demo|worst|empty|one` picks the dataset, so a reload keeps it.
// Editing panels are not mounted here; changes made in the page apply to the
// fixture in memory only.
// ============================================================================

import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BudgetProvider, type BudgetContextValue } from '@/contexts/BudgetContext';
import { BudgetEngine } from '@/lib/budget/engine';
import { currencySymbol as symbolFor, money } from '@/lib/budget/format';
import type { BudgetModel } from '@/lib/budget/types';
import MonthTab from '@/lib/pages/budget-tabs/MonthTab';
import { FIXTURE_TODAY, MONTH_FIXTURES, type FixtureName } from './monthFixtures';

const STATES: Array<{ value: FixtureName; label: string }> = [
  { value: 'demo', label: 'Demo data' },
  { value: 'worst', label: 'Worst case' },
  { value: 'empty', label: 'Empty' },
  { value: 'one', label: 'One' },
];

const noop = () => {};
const resolved = async () => {};

function Harness({ name }: { name: FixtureName }) {
  const fixture = MONTH_FIXTURES[name];
  const [model, setModel] = useState<BudgetModel>(fixture.model);
  const symbol = symbolFor(fixture.currency);

  const value = useMemo<BudgetContextValue>(() => {
    const fmt = (n: number) => money(n, symbol);
    return {
      budgetId: `fixture-${name}`,
      budget: {
        id: `fixture-${name}`,
        name: model.budgetTitle,
        is_owner: true,
        members: model.people.map((p) => ({ id: p.id, role: 'member', user: { id: p.id, name: p.name, email: `${p.id}@example.com` } })),
        location: fixture.location,
        currency: fixture.currency,
      },
      model,
      engine: new BudgetEngine(model, FIXTURE_TODAY),
      today: FIXTURE_TODAY,
      budgetLocation: fixture.location,
      budgetCurrency: fixture.currency,
      currencySymbol: symbol,
      fmt,
      commit: (updater) => setModel((m) => updater(m)),
      privateCharges: {},
      savePrivateCharge: resolved,
      deletePrivateCharge: resolved,
      openSheet: noop,
      closeSheet: noop,
      goToMonth: noop,
      saveStatus: 'idle',
      saveError: null,
      lastSavedAt: null,
      performSave: resolved,
      totalGlobalRealized: 0,
      realBankBalance: 0,
      demoBankBalance: 0,
      hasActiveConnection: false,
      isDemoMode: false,
      enableDemoMode: noop,
      disableDemoMode: noop,
      refreshBankData: noop,
      handleOpenBankManager: noop,
      chargeMappings: [],
      mappedTotalsByChargeId: {},
      handleOpenMapper: noop,
      householdSize: Math.max(1, model.people.length),
      refreshMembersOnly: resolved,
      handleShowInviteModal: noop,
      markSuggestionsRun: noop,
    };
  }, [model, name, fixture, symbol]);

  return (
    <BudgetProvider value={value}>
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <MonthTab />
      </main>
    </BudgetProvider>
  );
}

/** Plain chrome, not part of the design under test: gray track, white pill, system font, no animation. */
function DataToggle({ value, onChange }: { value: FixtureName; onChange: (v: FixtureName) => void }): ReactNode {
  return (
    <div
      role="group"
      aria-label="Fixture"
      style={{ fontFamily: 'system-ui, sans-serif' }}
      className="fixed bottom-4 left-1/2 z-[200] flex -translate-x-1/2 gap-1 rounded-full bg-neutral-200 p-1 text-xs shadow-md"
    >
      {STATES.map((s) => (
        <button
          key={s.value}
          type="button"
          aria-pressed={value === s.value}
          onClick={() => onChange(s.value)}
          className={`min-h-0 min-w-0 rounded-full px-3 py-1.5 ${value === s.value ? 'bg-white font-semibold text-neutral-900' : 'text-neutral-600'}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export default function MonthBreakUi() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('data');
  const name: FixtureName = raw && raw in MONTH_FIXTURES ? (raw as FixtureName) : 'demo';
  const pick = (next: FixtureName) =>
    setParams((p) => {
      const copy = new URLSearchParams(p);
      copy.set('data', next);
      return copy;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* key: a new dataset starts from its fixture, not from edits made to the previous one */}
      <Harness key={name} name={name} />
      <DataToggle value={name} onChange={pick} />
    </div>
  );
}
