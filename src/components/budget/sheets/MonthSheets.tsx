// src/components/budget/sheets/MonthSheets.tsx
// « Ajouter » menu, one-off income and re-opening a closed month.

import { useState } from 'react';
import { Coins, PiggyBank, Plus, Receipt, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBudget } from '@/contexts/BudgetContext';
import { resolveLiveMonth } from '@/lib/budget/engine';
import { addOneOff, reopenMonth } from '@/lib/budget/mutations';
import { formatMonthLong, deMonth } from '@/lib/budget/months';
import { parseAmount } from '@/lib/budget/format';
import { ResponsiveSheet } from '../shared/ResponsiveSheet';
import { ErrorText, failOn, FieldLabel, IconTile, MoneyInput } from '../shared/primitives';
import type { SheetProps } from './BudgetSheets';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    addTo: (month: string) => `Ajouter à ${month}`,
    charge: 'Une charge',
    chargeSub: 'Tous les mois, certains mois, chaque année ou une seule fois',
    oneOff: 'Un revenu ponctuel',
    oneOffSub: 'Prime, remboursement, allocation…',
    spend: 'Une dépense payée par une épargne',
    spendSub: 'Ex. : les vacances payées avec la cagnotte « Vacances »',
    saving: 'Une nouvelle épargne',
    savingSub: 'Un montant mis de côté chaque mois',
    member: 'Un membre du foyer',
    memberSub: 'Son salaire et ce qu’il verse au pot commun',
    nameRequired: 'Donnez un nom à ce revenu (prime, remboursement…).',
    amountRequired: 'Indiquez un montant supérieur à 0.',
    added: (label: string, month: string) => `« ${label} » ajouté à ${month}.`,
    oneOffTitle: 'Revenu ponctuel',
    oneOffDescription: (month: string) => `Il s’ajoute aux entrées ${deMonth(month)} uniquement.`,
    name: 'Nom',
    namePlaceholder: 'Ex. : prime, remboursement mutuelle…',
    amount: 'Montant',
    addIncome: 'Ajouter le revenu',
    chargeGone: (label: string, amount: string) => `« ${label} » (${amount}) n’existe plus : elle ne sera plus comptée.`,
    chargeChanged: (label: string, before: string, after: string) => `« ${label} » : ${before} → ${after}.`,
    chargeAdded: (label: string, amount: string) => `« ${label} » (${amount}) sera ajoutée.`,
    contributionChanged: (name: string, before: string, after: string) => `${name} : contribution ${before} → ${after}.`,
    memberGone: (name: string, amount: string) => `${name} ne fait plus partie du foyer : sa contribution (${amount}) ne sera plus comptée.`,
    memberAdded: (name: string, amount: string) => `${name} sera compté(e) : contribution ${amount}.`,
    savingChanged: (label: string, before: string, after: string) => `Épargne « ${label} » : ${before} → ${after}.`,
    savingGone: (label: string, amount: string) => `Épargne « ${label} » (${amount}) ne sera plus comptée.`,
    savingAdded: (label: string, amount: string) => `Épargne « ${label} » (${amount}) sera ajoutée.`,
    reopened: (month: string) => `${month} est rouvert. Clôturez-le après vos corrections.`,
    reopenTitle: (month: string) => `Rouvrir ${month} ?`,
    reopenDescription: 'Un mois rouvert est recalculé à partir de vos règles actuelles.',
    noDiff: 'Aucune différence : vos règles donnent les mêmes montants.',
    reste: 'Reste du mois : ',
    cancel: 'Annuler',
    reopen: 'Rouvrir le mois',
  },
  en: {
    addTo: (month: string) => `Add to ${month}`,
    charge: 'A bill',
    chargeSub: 'Every month, some months, every year or just once',
    oneOff: 'One-off income',
    oneOffSub: 'Bonus, refund, benefit…',
    spend: 'An expense paid from savings',
    spendSub: 'E.g. holidays paid from the “Holidays” savings pot',
    saving: 'A new savings pot',
    savingSub: 'An amount set aside every month',
    member: 'A household member',
    memberSub: 'Their pay and what they pay into the joint pot',
    nameRequired: 'Give this income a name (bonus, refund…).',
    amountRequired: 'Enter an amount above 0.',
    added: (label: string, month: string) => `“${label}” added to ${month}.`,
    oneOffTitle: 'One-off income',
    oneOffDescription: (month: string) => `It only adds to the money coming in for ${month}.`,
    name: 'Name',
    namePlaceholder: 'E.g. bonus, health insurance refund…',
    amount: 'Amount',
    addIncome: 'Add income',
    chargeGone: (label: string, amount: string) => `“${label}” (${amount}) no longer exists: it won’t be counted anymore.`,
    chargeChanged: (label: string, before: string, after: string) => `“${label}”: ${before} → ${after}.`,
    chargeAdded: (label: string, amount: string) => `“${label}” (${amount}) will be added.`,
    contributionChanged: (name: string, before: string, after: string) => `${name}: contribution ${before} → ${after}.`,
    memberGone: (name: string, amount: string) => `${name} is no longer in the household: their contribution (${amount}) won’t be counted anymore.`,
    memberAdded: (name: string, amount: string) => `${name} will be counted: contribution ${amount}.`,
    savingChanged: (label: string, before: string, after: string) => `Savings “${label}”: ${before} → ${after}.`,
    savingGone: (label: string, amount: string) => `Savings “${label}” (${amount}) won’t be counted anymore.`,
    savingAdded: (label: string, amount: string) => `Savings “${label}” (${amount}) will be added.`,
    reopened: (month: string) => `${month} is reopened. Close it again once you’ve made your changes.`,
    reopenTitle: (month: string) => `Reopen ${month}?`,
    reopenDescription: 'A reopened month is worked out again from your current rules.',
    noDiff: 'No differences: your rules give the same amounts.',
    reste: 'Left for the month: ',
    cancel: 'Cancel',
    reopen: 'Reopen the month',
  },
});

function MenuItem({ icon, title, sub, onClick, tileClass }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void; tileClass: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[64px] w-full items-center gap-3.5 rounded-xl border border-border/70 bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <IconTile className={tileClass}>{icon}</IconTile>
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}

export function AddMenuSheet({ sheet, onClose }: SheetProps<'addMenu'>) {
  const t = useT(M);
  const { openSheet } = useBudget();
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.addTo(formatMonthLong(sheet.ym))}>
      <div className="flex flex-col gap-2">
        <MenuItem tileClass="bg-orange-50 text-orange-700" icon={<Receipt />} title={t.charge} sub={t.chargeSub} onClick={() => openSheet({ kind: 'chargeEditor', ym: sheet.ym })} />
        <MenuItem tileClass="bg-emerald-50 text-emerald-700" icon={<Coins />} title={t.oneOff} sub={t.oneOffSub} onClick={() => openSheet({ kind: 'oneOff', ym: sheet.ym })} />
        <MenuItem tileClass="bg-indigo-50 text-indigo-700" icon={<PiggyBank />} title={t.spend} sub={t.spendSub} onClick={() => openSheet({ kind: 'spend', ym: sheet.ym })} />
        <MenuItem tileClass="bg-muted text-foreground" icon={<Plus />} title={t.saving} sub={t.savingSub} onClick={() => openSheet({ kind: 'savingEditor', ym: sheet.ym })} />
        <MenuItem tileClass="bg-teal-50 text-teal-800" icon={<UserPlus />} title={t.member} sub={t.memberSub} onClick={() => openSheet({ kind: 'member', ym: sheet.ym })} />
      </div>
    </ResponsiveSheet>
  );
}

export function OneOffSheet({ sheet, onClose }: SheetProps<'oneOff'>) {
  const t = useT(M);
  const { commit } = useBudget();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseAmount(amount);
    if (!label.trim()) return failOn('oo-label', setError, t.nameRequired);
    if (!Number.isFinite(v) || v <= 0) return failOn('oo-amount', setError, t.amountRequired);
    commit((m) => addOneOff(m, sheet.ym, { label: label.trim(), amount: v }), {
      message: t.added(label.trim(), formatMonthLong(sheet.ym)),
    });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.oneOffTitle} description={t.oneOffDescription(formatMonthLong(sheet.ym))}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="oo-label">{t.name}</FieldLabel>
          <Input id="oo-label" autoComplete="off" value={label} onChange={(e) => { setLabel(e.target.value); setError(''); }} placeholder={t.namePlaceholder} className="h-12 rounded-xl text-base" />
        </div>
        <div>
          <FieldLabel htmlFor="oo-amount">{t.amount}</FieldLabel>
          <MoneyInput id="oo-amount" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">{t.addIncome}</Button>
      </form>
    </ResponsiveSheet>
  );
}

export function ReopenSheet({ sheet, onClose }: SheetProps<'reopen'>) {
  const t = useT(M);
  const { engine, model, commit, fmt } = useBudget();
  const frozen = engine.month(sheet.ym);
  const live = resolveLiveMonth(model, sheet.ym);
  const diffs: string[] = [];
  if (frozen.frozen) {
    for (const c of frozen.charges) {
      const l = live.charges.find((x) => x.id === c.id);
      if (!l) diffs.push(t.chargeGone(c.label, fmt(c.amount)));
      else if (Math.abs(l.amount - c.amount) >= 0.005) diffs.push(t.chargeChanged(c.label, fmt(c.amount), fmt(l.amount)));
    }
    for (const c of live.charges) {
      if (!frozen.charges.find((x) => x.id === c.id) && c.amount > 0) diffs.push(t.chargeAdded(c.label, fmt(c.amount)));
    }
    for (const p of frozen.people) {
      const l = live.people.find((x) => x.id === p.id);
      if (l && Math.abs(l.contribution - p.contribution) >= 0.005) diffs.push(t.contributionChanged(p.name, fmt(p.contribution), fmt(l.contribution)));
      if (!l) diffs.push(t.memberGone(p.name, fmt(p.contribution)));
    }
    for (const p of live.people) {
      if (!frozen.people.find((x) => x.id === p.id) && p.contribution > 0) diffs.push(t.memberAdded(p.name, fmt(p.contribution)));
    }
    for (const s of frozen.savings) {
      const l = live.savings.find((x) => x.id === s.id);
      if (l && Math.abs(l.allocation - s.allocation) >= 0.005) diffs.push(t.savingChanged(s.label, fmt(s.allocation), fmt(l.allocation)));
      if (!l && s.allocation !== 0) diffs.push(t.savingGone(s.label, fmt(s.allocation)));
    }
    for (const s of live.savings) {
      if (!frozen.savings.find((x) => x.id === s.id) && s.allocation > 0) diffs.push(t.savingAdded(s.label, fmt(s.allocation)));
    }
  }
  const confirm = () => {
    commit((m) => reopenMonth(m, sheet.ym), { message: t.reopened(formatMonthLong(sheet.ym)) });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.reopenTitle(formatMonthLong(sheet.ym))} description={t.reopenDescription}>
      {diffs.length > 0 ? (
        <ul className="flex list-disc flex-col gap-1.5 rounded-xl bg-orange-50 py-3 pl-8 pr-4 text-sm text-orange-950">
          {diffs.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{t.noDiff}</p>
      )}
      <p className="text-sm tabular-nums">
        {t.reste}<strong>{fmt(frozen.totals.reste)}</strong> → <strong>{fmt(live.totals.reste)}</strong>
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>{t.cancel}</Button>
        <Button className="min-h-[44px]" onClick={confirm}>{t.reopen}</Button>
      </div>
    </ResponsiveSheet>
  );
}
