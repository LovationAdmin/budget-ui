// src/lib/pages/budget-tabs/ChargesTab.tsx
// ============================================================================
// « Charges » — the catalog of rules. Each month fills itself from these rules;
// month-only exceptions are made from the month itself. Charges are sorted by
// status (en cours / à venir / terminées) so a charge that ended in March no
// longer clutters the list in August, while staying in the history.
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Info, Loader2, Plus, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { budgetAPI } from '@/services/api';
import { useBudget } from '@/contexts/BudgetContext';
import EnhancedSuggestions from '@/components/budget/EnhancedSuggestions';
import type { Charge, Frequency, YM } from '@/lib/budget/types';
import {
  amountHistoryHint,
  chargeBaseAmount,
  chargeFrequency,
  chargeStatus,
  describeChargeSchedule,
  windowOf,
  type ItemStatus,
} from '@/lib/budget/engine';
import { updateCharge } from '@/lib/budget/mutations';
import { addMonths } from '@/lib/budget/months';
import { roundCents } from '@/lib/budget/format';
import { CategoryIcon, ChipToggle } from '@/components/budget/shared/primitives';
import { useFirstOpenMonth, useHashScroll } from '@/components/budget/shared/hooks';

const FILTERS: Array<{ id: ItemStatus; label: string }> = [
  { id: 'active', label: 'En cours' },
  { id: 'upcoming', label: 'À venir' },
  { id: 'ended', label: 'Terminées' },
];

const GROUPS: Array<{ id: Frequency; title: string }> = [
  { id: 'monthly', title: 'Tous les mois' },
  { id: 'custom', title: 'Certains mois' },
  { id: 'yearly', title: 'Une fois par an' },
  { id: 'once', title: 'Ponctuelles' },
];

function isFilter(v: string | null): v is ItemStatus {
  return v === 'active' || v === 'upcoming' || v === 'ended';
}

export default function ChargesTab() {
  const { id } = useParams<{ id: string }>();
  const { model, engine, today, fmt, openSheet, commit, mappedTotalsByChargeId, householdSize, budgetLocation, budgetCurrency, markSuggestionsRun } = useBudget();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const filter: ItemStatus = isFilter(params.get('filtre')) ? (params.get('filtre') as ItemStatus) : 'active';
  const firstOpen = useFirstOpenMonth();
  const [categorizing, setCategorizing] = useState(false);

  const setFilter = (f: ItemStatus) =>
    setParams((p) => {
      const copy = new URLSearchParams(p);
      if (f === 'active') copy.delete('filtre');
      else copy.set('filtre', f);
      return copy;
    });

  const statuses = useMemo(() => new Map(model.charges.map((c) => [c.id, chargeStatus(c, today)])), [model.charges, today]);
  const counts = { active: 0, upcoming: 0, ended: 0 } as Record<ItemStatus, number>;
  statuses.forEach((s) => (counts[s] += 1));

  const list = model.charges.filter((c) => statuses.get(c.id) === filter);
  const refMonth = (c: Charge): YM => {
    const w = windowOf(c);
    if (filter === 'ended') return w.end ?? w.start ?? today;
    if (filter === 'upcoming') return w.start ?? today;
    return today;
  };
  const groups = GROUPS.map((g) => ({
    ...g,
    items: list
      .filter((c) => chargeFrequency(c) === g.id)
      .map((c) => ({ c, amount: chargeBaseAmount(c, refMonth(c)) }))
      .sort((a, b) => b.amount - a.amount || a.c.label.localeCompare(b.c.label, 'fr')),
  })).filter((g) => g.items.length > 0);

  let avg = 0;
  for (let i = 0; i < 12; i++) avg += engine.month(addMonths(today, i)).totals.charges;
  avg = roundCents(avg / 12);

  // Charges the savings analysis looks at: running ones, at their monthly cost.
  const suggestionCharges = useMemo(
    () =>
      model.charges
        .filter((c) => chargeStatus(c, today) === 'active' && chargeFrequency(c) !== 'once')
        .map((c) => {
          const base = chargeBaseAmount(c, today);
          const monthly = chargeFrequency(c) === 'yearly' ? roundCents(base / 12) : base;
          return { id: c.id, label: c.label, amount: monthly, category: c.category, ignoreSuggestions: c.ignoreSuggestions, description: c.description };
        }),
    [model.charges, today],
  );

  useEffect(() => {
    if (suggestionCharges.length > 0) markSuggestionsRun();
  }, [suggestionCharges.length, markSuggestionsRun]);

  useHashScroll('suggestions');

  const uncategorized = model.charges.filter((c) => chargeStatus(c, today) !== 'ended' && (!c.category || c.category === 'OTHER'));
  const categorizeAll = async () => {
    setCategorizing(true);
    const found: Record<string, string> = {};
    await Promise.all(
      uncategorized.map(async (c) => {
        try {
          const res = await budgetAPI.categorize(c.label);
          const cat = res.data?.category;
          if (cat && cat !== 'OTHER') found[c.id] = cat;
        } catch {
          /* best effort */
        }
      }),
    );
    setCategorizing(false);
    const n = Object.keys(found).length;
    if (n === 0) {
      toast({ description: 'Aucune nouvelle catégorie n’a pu être détectée.' });
      return;
    }
    commit((m) => Object.entries(found).reduce((acc, [cid, cat]) => updateCharge(acc, cid, { category: cat }), m), {
      message: `${n} charge${n > 1 ? 's' : ''} catégorisée${n > 1 ? 's' : ''}.`,
    });
  };

  const perText = (c: Charge) => {
    const f = chargeFrequency(c);
    if (f === 'yearly') return '/ an';
    if (f === 'once') return 'une fois';
    return '/ mois';
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Charges</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Vos règles. Chaque mois se remplit tout seul à partir d’elles ; les exceptions se font depuis le mois concerné.
          </p>
        </div>
        <Button className="min-h-[44px] self-start sm:self-auto" onClick={() => openSheet({ kind: 'chargeEditor', ym: firstOpen })}>
          <Plus className="h-4 w-4" /> Nouvelle charge
        </Button>
      </div>

      <div role="group" aria-label="Filtrer les charges" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <ChipToggle key={f.id} pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            <span className={cn('inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs tabular-nums', filter === f.id ? 'bg-white/20' : 'bg-muted')}>
              {counts[f.id]}
            </span>
          </ChipToggle>
        ))}
      </div>

      {filter === 'ended' && counts.ended > 0 && (
        <p className="flex items-start gap-2.5 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Une charge terminée n’apparaît plus dans les mois suivants. Les mois clôturés gardent leur photo : vous pouvez la supprimer sans perdre l’historique.
        </p>
      )}
      {filter === 'active' && counts.active > 0 && (
        <p className="text-sm text-muted-foreground">
          En moyenne sur les 12 prochains mois : <strong className="tabular-nums text-foreground">{fmt(avg)}</strong> de charges par mois.
        </p>
      )}
      {filter !== 'ended' && uncategorized.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-sky-950">
            {uncategorized.length} charge{uncategorized.length > 1 ? 's' : ''} sans catégorie : les suggestions d’économies ne peuvent pas les comparer.
          </p>
          <Button variant="outline" className="min-h-[40px] bg-card" onClick={categorizeAll} disabled={categorizing}>
            {categorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Détecter les catégories
          </Button>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`grp-${g.id}`} className="flex flex-col gap-2">
          <h2 id={`grp-${g.id}`} className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{g.title}</h2>
          <div className="flex flex-col gap-0.5 rounded-2xl border border-border/70 bg-card p-1.5 shadow-soft">
            {g.items.map(({ c, amount }) => {
              const exceptions = Object.keys(c.overrides ?? {}).length;
              const hint = [
                amountHistoryHint(c.amountHistory, refMonth(c), fmt),
                exceptions ? `${exceptions} exception${exceptions > 1 ? 's' : ''}` : '',
                mappedTotalsByChargeId[c.id] ? `réel lié : ${fmt(mappedTotalsByChargeId[c.id])}` : '',
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openSheet({ kind: 'chargeDetail', id: c.id })}
                  className="flex min-h-[64px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CategoryIcon category={c.category} tone={filter === 'ended' ? 'muted' : 'charge'} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-semibold">{c.label}</span>
                    <span className="text-[13px] text-muted-foreground">{describeChargeSchedule(c, today)}</span>
                    {hint && <span className="text-xs text-sky-800">{hint}</span>}
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="whitespace-nowrap text-[15px] font-bold tabular-nums">{fmt(amount)}</span>
                    <span className="text-xs text-muted-foreground">{perText(c)}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {groups.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {model.charges.length === 0
              ? 'Aucune charge pour l’instant. Commencez par le loyer, l’énergie, les assurances…'
              : filter === 'ended'
                ? 'Aucune charge terminée.'
                : filter === 'upcoming'
                  ? 'Aucune charge programmée pour plus tard.'
                  : 'Aucune charge en cours.'}
          </p>
          {model.charges.length === 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button className="min-h-[44px]" onClick={() => openSheet({ kind: 'chargeEditor', ym: firstOpen })}>
                <Plus className="h-4 w-4" /> Ajouter une charge
              </Button>
              <Button asChild variant="outline" className="min-h-[44px]">
                <Link to={`/budget/${id}/complete/ai`}>
                  <Sparkles className="h-4 w-4" /> Laisser l’IA proposer un budget
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {suggestionCharges.length > 0 && id && (
        <section id="suggestions" aria-label="Suggestions d’économies" className="scroll-mt-24">
          <EnhancedSuggestions budgetId={id} charges={suggestionCharges} householdSize={householdSize} location={budgetLocation} currency={budgetCurrency} />
        </section>
      )}
    </div>
  );
}
