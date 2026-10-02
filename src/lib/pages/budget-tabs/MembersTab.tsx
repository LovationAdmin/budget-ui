// src/lib/pages/budget-tabs/MembersTab.tsx
// ============================================================================
// « Foyer » — who is in the household, their salary and what they put into
// the household pot (salary ≠ contribution), plus the assistant that computes
// a fair contribution for each (prorata, equal shares, same amount left) and
// applies it from a chosen month without touching the past. Access to the
// budget (invitations, roles) stays at the bottom.
// ============================================================================

import { useMemo, useState } from 'react';
import { Pencil, Plus, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useBudget } from '@/contexts/BudgetContext';
import MemberManagementSection from '@/components/budget/MemberManagementSection';
import type { Person, YM } from '@/lib/budget/types';
import {
  amountHistoryHint,
  chargesEndingBetween,
  contributionHistoryHint,
  contributionRuleText,
  personStatus,
  resolvePerson,
  splitContributions,
  windowOf,
  type SplitMethod,
} from '@/lib/budget/engine';
import { applyContributionRules, type ContributionRule } from '@/lib/budget/mutations';
import { addMonths, formatMonthLong, formatMonthShort, formatMonthTitle, joinFr, maxYM, deMonth } from '@/lib/budget/months';
import { moneySigned, percent, roundCents } from '@/lib/budget/format';
import { ChipToggle, Pill, Segmented } from '@/components/budget/shared/primitives';
import { MonthPicker } from '@/components/budget/shared/MonthPicker';
import { useFirstOpenMonth, useHashScroll } from '@/components/budget/shared/hooks';

const AVATAR_TONES = ['bg-teal-50 text-teal-800', 'bg-violet-50 text-violet-800', 'bg-amber-50 text-amber-800', 'bg-sky-50 text-sky-800', 'bg-rose-50 text-rose-800'];

const METHODS: Array<{ value: SplitMethod; label: string; help: string }> = [
  { value: 'prorata', label: 'Au prorata', help: 'Chacun verse la même part de son salaire : qui gagne plus verse plus.' },
  { value: 'equal', label: 'À parts égales', help: 'Chacun verse le même montant, quel que soit son salaire.' },
  { value: 'reste', label: 'Même reste', help: 'Chacun garde le même montant pour lui après sa contribution.' },
  { value: 'all', label: 'Tout le salaire', help: 'Chacun verse tout son salaire ; l’excédent part en épargne générale.' },
];

function MemberCard({ person, index, refYm }: { person: Person; index: number; refYm: YM }) {
  const { fmt, openSheet, today } = useBudget();
  const status = personStatus(person, today);
  const w = windowOf(person);
  const ref = status === 'upcoming' ? w.start ?? refYm : status === 'ended' ? w.end ?? refYm : refYm;
  const r = resolvePerson(person, ref);
  if (!r) return null;
  const share = r.salary > 0 ? (r.contribution / r.salary) * 100 : 0;
  const salaryHint = amountHistoryHint(person.salaryHistory, ref, fmt);
  const contributionHint = contributionHistoryHint(person, ref, fmt);
  return (
    <article className={cn('flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft', status === 'ended' && 'bg-muted/30')}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn('inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-extrabold', AVATAR_TONES[index % AVATAR_TONES.length])}>
          {person.name.charAt(0).toUpperCase() || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-extrabold">{person.name}</h2>
          {status === 'upcoming' && w.start && <Pill tone="blue">Arrive en {formatMonthLong(w.start)}</Pill>}
          {status === 'ended' && w.end && <Pill tone="grey">Dernier mois : {formatMonthLong(w.end)}</Pill>}
          {status === 'active' && w.end && <Pill tone="amber">Jusqu’en {formatMonthLong(w.end)}</Pill>}
        </div>
        <Button variant="outline" className="min-h-[44px]" onClick={() => openSheet({ kind: 'member', id: person.id, ym: status === 'active' ? refYm : ref })}>
          <Pencil className="h-4 w-4" /> Modifier
        </Button>
      </div>
      <dl className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-bold text-muted-foreground">Salaire net</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums">{fmt(r.salary)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-bold text-emerald-700">Verse au pot</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums text-emerald-700">{fmt(r.contribution)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-bold text-muted-foreground">Garde pour soi</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums">{fmt(r.keep)}</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-1.5">
        <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, share)}%` }} />
        </span>
        <span className="text-xs text-muted-foreground">
          Verse {percent(share)} de son salaire · règle : {r.contributionAdjusted ? 'ajustée ce mois-ci' : contributionRuleText(r.mode, r.value)}
        </span>
      </div>
      {(salaryHint || contributionHint) && (
        <div className="flex flex-col gap-0.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          {salaryHint && <span>Salaire : {salaryHint}</span>}
          {contributionHint && <span>Contribution : {contributionHint}</span>}
        </div>
      )}
    </article>
  );
}

function SplitAssistant() {
  const { model, engine, today, fmt, commit, currencySymbol } = useBudget();
  const firstOpen = useFirstOpenMonth();
  const [method, setMethod] = useState<SplitMethod>('prorata');
  const [margin, setMargin] = useState(5);
  const [basis, setBasis] = useState<'average' | 'peak'>('average');
  const [from, setFrom] = useState<YM>(maxYM(addMonths(today, 1), firstOpen));

  const members = useMemo(
    () =>
      model.people
        .map((p) => ({ person: p, r: resolvePerson(p, from) }))
        .filter((x): x is { person: Person; r: NonNullable<ReturnType<typeof resolvePerson>> } => !!x.r),
    [model.people, from],
  );

  // Two ways to size the pot over the 12 months from `from`: the average
  // (heavier months draw on the general savings) or the heaviest month
  // (every month is covered; lighter months feed the general savings).
  const months12 = Array.from({ length: 12 }, (_, i) => engine.month(addMonths(from, i)));
  const avgC = Math.round(months12.reduce((a, m) => a + m.totals.charges, 0) / 12);
  const avgS = Math.round(months12.reduce((a, m) => a + m.totals.savings, 0) / 12);
  const peakMonth = months12.reduce((best, m) =>
    m.totals.charges + m.totals.savings > best.totals.charges + best.totals.savings ? m : best,
  );
  // The choice only matters when some months weigh more than others.
  const peakTotal = Math.round(peakMonth.totals.charges + peakMonth.totals.savings);
  const uneven = peakTotal > avgC + avgS;
  const usePeak = basis === 'peak' && uneven;
  const needC = usePeak ? Math.round(peakMonth.totals.charges) : avgC;
  const needS = usePeak ? Math.round(peakMonth.totals.savings) : avgS;
  const withMargin = (v: number) => Math.round(v * (1 + margin / 100));
  const need = withMargin(needC + needS);
  const ending = chargesEndingBetween(model, from, addMonths(from, 11));
  const salaries = members.map((m) => m.r.salary);
  const proposal = splitContributions(method, salaries, need);
  const totalSalaries = salaries.reduce((a, b) => a + b, 0);
  const totalProposal = proposal.reduce((a, b) => a + b, 0);
  const surplus = roundCents(totalProposal - need);
  const unchanged = members.every((m, i) => roundCents(m.r.contribution) === roundCents(proposal[i]));

  let explain = '';
  if (method === 'prorata') {
    explain = members.map((m) => `${m.person.name} gagne ${percent(totalSalaries ? (m.r.salary / totalSalaries) * 100 : 0)} des revenus du foyer`).join(', ') + ' : chacun verse cette part du besoin.';
  } else if (method === 'equal') explain = `Le besoin est coupé en ${members.length} parts égales.`;
  else if (method === 'reste') explain = `Après contribution, chacun garde environ ${fmt(members.length ? (totalSalaries - totalProposal) / members.length : 0)} pour lui.`;
  else explain = 'Chacun verse tout son salaire.';

  const apply = () => {
    const rules: Record<string, ContributionRule> = {};
    members.forEach((m, i) => {
      rules[m.person.id] = method === 'all' ? { mode: 'all' } : { mode: 'fixed', value: proposal[i] };
    });
    commit((m) => applyContributionRules(m, from, rules, today), {
      message: `Nouvelles contributions appliquées à partir ${deMonth(formatMonthLong(from))}. Les mois précédents ne changent pas.`,
    });
  };

  return (
    <section id="repartition" aria-labelledby="repartition-title" className="scroll-mt-24 rounded-2xl border border-border/70 bg-card p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 id="repartition-title" className="font-display text-lg font-extrabold">Répartir le pot commun</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Calcule une contribution juste pour chacun. Rien ne change tant que vous n’appliquez pas.</p>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Ajoutez au moins un membre du foyer pour utiliser l’assistant.</p>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div>
              <span className="mb-2 block text-sm font-semibold">1. Méthode</span>
              <Segmented label="Méthode de répartition" value={method} options={METHODS.map(({ value, label }) => ({ value, label }))} onChange={setMethod} />
              <p className="mt-2 text-sm text-muted-foreground">{METHODS.find((m) => m.value === method)!.help}</p>
            </div>
            <div>
              <span className="mb-1 block text-sm font-semibold">2. Besoin à couvrir chaque mois</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold tabular-nums">{fmt(need)}</span>
                <span className="text-sm text-muted-foreground">
                  charges {fmt(needC)} + épargne {fmt(needS)}
                  {margin ? ` + marge ${margin} %` : ''}
                </span>
              </div>
              {uneven && (
              <Segmented
                className="mt-3"
                label="Base de calcul du besoin"
                value={basis}
                onChange={setBasis}
                options={[
                  { value: 'average', label: `Lissé sur 12 mois · ${fmt(withMargin(avgC + avgS))}` },
                  { value: 'peak', label: `Mois le plus chargé · ${fmt(withMargin(peakTotal))}` },
                ]}
              />
              )}
              <p className="mb-3 mt-2 text-xs text-muted-foreground">
                {!uneven
                  ? `Le même besoin chaque mois sur les 12 mois à partir ${deMonth(formatMonthShort(from))}.`
                  : !usePeak
                  ? `Moyenne des 12 mois à partir ${deMonth(formatMonthShort(from))} : les mois plus chargés puisent dans l’épargne générale.`
                  : `${formatMonthTitle(peakMonth.ym)} est le mois le plus chargé : chaque mois est couvert, le surplus des autres va à l’épargne générale.`}
                {ending.length > 0 &&
                  ` ${joinFr(ending.map(({ charge }) => `« ${charge.label} »`))} ${ending.length > 1 ? 's’arrêtent' : 's’arrête'} en cours de route (${joinFr(ending.map(({ last }) => `fin ${formatMonthShort(last)}`))}) : ${ending.length > 1 ? 'elles ne pèsent' : 'elle ne pèse'} que sur les premiers mois.`}
              </p>
              <div role="group" aria-label="Marge de sécurité" className="flex flex-wrap gap-2">
                {[0, 5, 10].map((v) => (
                  <ChipToggle key={v} pressed={margin === v} onClick={() => setMargin(v)}>
                    {v === 0 ? 'Sans marge' : `+${v} %`}
                  </ChipToggle>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">3. Résultat</span>
            {members.map((m, i) => {
              const delta = roundCents(proposal[i] - m.r.contribution);
              return (
                <div key={m.person.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                  <span className="font-bold">
                    {m.person.name} <span className="text-sm font-normal text-muted-foreground">verserait</span>
                  </span>
                  <span className="text-right font-display text-lg font-extrabold tabular-nums">{fmt(proposal[i])}</span>
                  <span className="text-xs text-muted-foreground">
                    Salaire {fmt(m.r.salary)} · garde {fmt(m.r.salary - proposal[i])} · {m.r.salary > 0 ? `${percent((proposal[i] / m.r.salary) * 100)} du salaire` : '—'}
                  </span>
                  <span className="text-right text-xs font-bold tabular-nums text-muted-foreground">
                    {delta === 0 ? 'comme aujourd’hui' : `${moneySigned(delta, currencySymbol)} vs aujourd’hui`}
                  </span>
                </div>
              );
            })}
            <p className="text-sm">{explain}</p>
            {surplus > 0 && <p className="text-xs text-muted-foreground">Excédent de {fmt(surplus)} par mois → épargne générale.</p>}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Appliquer à partir de</span>
              <MonthPicker value={from} onChange={setFrom} min={firstOpen} ariaLabel="Appliquer à partir de" />
            </div>
            <Button className="min-h-[48px]" onClick={apply} disabled={unchanged}>
              {unchanged ? 'Déjà en place' : `Appliquer à partir ${deMonth(formatMonthLong(from))}`}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function MembersTab() {
  const { user } = useAuth();
  const { model, engine, fmt, openSheet, budget, refreshMembersOnly, today } = useBudget();
  const firstOpen = useFirstOpenMonth();
  useHashScroll('repartition');
  const month = engine.month(firstOpen);
  const indexed = model.people.map((p, i) => ({ p, i }));
  const current = indexed.filter(({ p }) => personStatus(p, today) !== 'ended');
  const former = indexed.filter(({ p }) => personStatus(p, today) === 'ended');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Foyer</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Chacun garde son salaire. Le pot commun ne reçoit que la contribution de chacun : en {formatMonthLong(firstOpen)},{' '}
            <strong className="tabular-nums text-foreground">{fmt(month.totals.contributions)}</strong> sur {fmt(month.totals.salaries)} de salaires.
          </p>
        </div>
        <Button className="min-h-[44px] self-start sm:self-auto" onClick={() => openSheet({ kind: 'member', ym: firstOpen })}>
          <UserPlus className="h-4 w-4" /> Ajouter un membre
        </Button>
      </div>

      {current.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {current.map(({ p, i }) => (
            <MemberCard key={p.id} person={p} index={i} refYm={firstOpen} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border px-5 py-8 text-center">
          <p className="max-w-md text-sm text-muted-foreground">Ajoutez les membres du foyer : leur salaire, et ce que chacun verse au pot commun.</p>
          <Button className="min-h-[44px]" onClick={() => openSheet({ kind: 'member', ym: firstOpen })}>
            <Plus className="h-4 w-4" /> Ajouter un membre
          </Button>
        </div>
      )}

      {former.length > 0 && (
        <section aria-labelledby="former-title" className="flex flex-col gap-3">
          <h2 id="former-title" className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ne font plus partie du foyer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {former.map(({ p, i }) => (
              <MemberCard key={p.id} person={p} index={i} refYm={firstOpen} />
            ))}
          </div>
        </section>
      )}

      <SplitAssistant />

      {budget && user && (
        <section aria-label="Accès au budget" className="flex flex-col gap-3">
          <MemberManagementSection budget={budget} currentUserId={user.id} onMemberChange={refreshMembersOnly} />
        </section>
      )}
    </div>
  );
}
