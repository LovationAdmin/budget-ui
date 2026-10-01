// src/components/budget/sheets/MonthSheets.tsx
// « Ajouter » menu, one-off income and re-opening a closed month.

import { useState } from 'react';
import { Coins, PiggyBank, Plus, Receipt, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBudget } from '@/contexts/BudgetContext';
import { resolveLiveMonth } from '@/lib/budget/engine';
import { addOneOff, reopenMonth } from '@/lib/budget/mutations';
import { formatMonthLong } from '@/lib/budget/months';
import { parseAmount } from '@/lib/budget/format';
import { ResponsiveSheet } from '../shared/ResponsiveSheet';
import { ErrorText, FieldLabel, IconTile, MoneyInput } from '../shared/primitives';
import type { SheetProps } from './BudgetSheets';

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
  const { openSheet } = useBudget();
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Ajouter à ${formatMonthLong(sheet.ym)}`}>
      <div className="flex flex-col gap-2">
        <MenuItem tileClass="bg-orange-50 text-orange-700" icon={<Receipt />} title="Une charge" sub="Tous les mois, certains mois, chaque année ou une seule fois" onClick={() => openSheet({ kind: 'chargeEditor', ym: sheet.ym })} />
        <MenuItem tileClass="bg-emerald-50 text-emerald-700" icon={<Coins />} title="Un revenu ponctuel" sub="Prime, remboursement, allocation…" onClick={() => openSheet({ kind: 'oneOff', ym: sheet.ym })} />
        <MenuItem tileClass="bg-indigo-50 text-indigo-700" icon={<PiggyBank />} title="Une dépense payée par une épargne" sub="Ex. : les vacances payées avec la cagnotte « Vacances »" onClick={() => openSheet({ kind: 'spend', ym: sheet.ym })} />
        <MenuItem tileClass="bg-muted text-foreground" icon={<Plus />} title="Une nouvelle épargne" sub="Un montant mis de côté chaque mois" onClick={() => openSheet({ kind: 'savingEditor', ym: sheet.ym })} />
        <MenuItem tileClass="bg-teal-50 text-teal-800" icon={<UserPlus />} title="Un membre du foyer" sub="Son salaire et ce qu’il verse au pot commun" onClick={() => openSheet({ kind: 'member', ym: sheet.ym })} />
      </div>
    </ResponsiveSheet>
  );
}

export function OneOffSheet({ sheet, onClose }: SheetProps<'oneOff'>) {
  const { commit } = useBudget();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseAmount(amount);
    if (!label.trim()) return setError('Donnez un nom à ce revenu (prime, remboursement…).');
    if (!Number.isFinite(v) || v <= 0) return setError('Indiquez un montant supérieur à 0.');
    commit((m) => addOneOff(m, sheet.ym, { label: label.trim(), amount: v }), {
      message: `« ${label.trim()} » ajouté à ${formatMonthLong(sheet.ym)}.`,
    });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title="Revenu ponctuel" description={`Il s’ajoute aux entrées de ${formatMonthLong(sheet.ym)} uniquement.`}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="oo-label">Nom</FieldLabel>
          <Input id="oo-label" value={label} onChange={(e) => { setLabel(e.target.value); setError(''); }} placeholder="Ex. : prime, remboursement mutuelle…" className="h-12 rounded-xl text-base" />
        </div>
        <div>
          <FieldLabel htmlFor="oo-amount">Montant</FieldLabel>
          <MoneyInput id="oo-amount" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">Ajouter le revenu</Button>
      </form>
    </ResponsiveSheet>
  );
}

export function ReopenSheet({ sheet, onClose }: SheetProps<'reopen'>) {
  const { engine, model, commit, fmt } = useBudget();
  const frozen = engine.month(sheet.ym);
  const live = resolveLiveMonth(model, sheet.ym);
  const diffs: string[] = [];
  if (frozen.frozen) {
    for (const c of frozen.charges) {
      const l = live.charges.find((x) => x.id === c.id);
      if (!l) diffs.push(`« ${c.label} » (${fmt(c.amount)}) n’existe plus : elle ne sera plus comptée.`);
      else if (Math.abs(l.amount - c.amount) >= 0.005) diffs.push(`« ${c.label} » : ${fmt(c.amount)} → ${fmt(l.amount)}.`);
    }
    for (const c of live.charges) {
      if (!frozen.charges.find((x) => x.id === c.id) && c.amount > 0) diffs.push(`« ${c.label} » (${fmt(c.amount)}) sera ajoutée.`);
    }
    for (const p of frozen.people) {
      const l = live.people.find((x) => x.id === p.id);
      if (l && Math.abs(l.contribution - p.contribution) >= 0.005) diffs.push(`${p.name} : contribution ${fmt(p.contribution)} → ${fmt(l.contribution)}.`);
      if (!l) diffs.push(`${p.name} ne fait plus partie du foyer : sa contribution (${fmt(p.contribution)}) ne sera plus comptée.`);
    }
    for (const s of frozen.savings) {
      const l = live.savings.find((x) => x.id === s.id);
      if (l && Math.abs(l.allocation - s.allocation) >= 0.005) diffs.push(`Épargne « ${s.label} » : ${fmt(s.allocation)} → ${fmt(l.allocation)}.`);
    }
  }
  const confirm = () => {
    commit((m) => reopenMonth(m, sheet.ym), { message: `${formatMonthLong(sheet.ym)} est rouvert. Clôturez-le après vos corrections.` });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Rouvrir ${formatMonthLong(sheet.ym)} ?`} description="Un mois rouvert est recalculé à partir de vos règles actuelles.">
      {diffs.length > 0 ? (
        <ul className="flex list-disc flex-col gap-1.5 rounded-xl bg-orange-50 py-3 pl-8 pr-4 text-sm text-orange-950">
          {diffs.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950">Aucune différence : vos règles donnent les mêmes montants.</p>
      )}
      <p className="text-sm tabular-nums">
        Reste du mois : <strong>{fmt(frozen.totals.reste)}</strong> → <strong>{fmt(live.totals.reste)}</strong>
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>Annuler</Button>
        <Button className="min-h-[44px]" onClick={confirm}>Rouvrir le mois</Button>
      </div>
    </ResponsiveSheet>
  );
}
