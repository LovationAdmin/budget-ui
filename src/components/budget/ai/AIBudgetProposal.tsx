// src/components/budget/ai/AIBudgetProposal.tsx
// ============================================================================
// « Budget proposé par IA » — intake → résultat → simulateur.
// Consomme le contexte budget pour pré-remplir HouseholdInput, appelle l'API,
// puis rend le BudgetProposal avec les actions Valider / Rejeter / Simulateur.
// ============================================================================

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wallet,
  PiggyBank,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { budgetAPI } from '@/services/api';
import { useBudget } from '@/contexts/BudgetContext';
import type { Project } from '@/utils/importConverter';
import {
  HouseholdInput,
  HouseholdType,
  Method,
  BudgetProposal,
  Feasibility,
  SAVINGS_ALLOCATION_TYPES,
} from '@/types/aiBudget';

function currencySymbol(code?: string): string {
  switch (code) {
    case 'USD':
    case 'CAD': return '$';
    case 'GBP': return '£';
    case 'CHF': return 'CHF';
    case 'XOF': return 'CFA';
    case 'MAD': return 'DH';
    default: return '€';
  }
}

const FEASIBILITY_STYLES: Record<Feasibility, { ring: string; badge: string; label: string }> = {
  ok: { ring: 'border-emerald-200 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700', label: 'Soutenable' },
  tight: { ring: 'border-amber-200 bg-amber-50/50', badge: 'bg-amber-100 text-amber-700', label: 'Serré' },
  infeasible: { ring: 'border-red-200 bg-red-50/50', badge: 'bg-red-100 text-red-700', label: 'Intenable' },
};

type View = 'intake' | 'loading' | 'result';

export default function AIBudgetProposal() {
  const {
    people,
    charges,
    projects,
    budget,
    budgetCurrency,
    budgetLocation,
    handleProjectsChange,
  } = useBudget();
  const { toast } = useToast();
  const sym = currencySymbol(budgetCurrency);

  const [view, setView] = useState<View>('intake');
  const [proposal, setProposal] = useState<BudgetProposal | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<Project[] | null>(null);

  // ---- Intake state (prefilled from the budget) ----
  const [householdType, setHouseholdType] = useState<HouseholdType>('couple');
  const [wantsPersonalSavings, setWantsPersonalSavings] = useState(false);
  const [allowInterMemberTopUp, setAllowInterMemberTopUp] = useState(true);
  const [preferredMethod, setPreferredMethod] = useState<Method | 'auto'>('auto');
  const [freeText, setFreeText] = useState('');

  const [members, setMembers] = useState(() =>
    people.map((p) => ({
      id: p.id,
      label: p.name || 'Membre',
      netIncome: p.salary || 0,
      variableIncomeYearly: '' as number | '',
      personalSpendingMonthly: '' as number | '',
    })),
  );

  const updateMember = (id: string, patch: Partial<(typeof members)[number]>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };
  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, label: '', netIncome: 0, variableIncomeYearly: '' as number | '', personalSpendingMonthly: '' as number | '' },
    ]);
  };
  const removeMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  // Charges are editable here too (prefilled from the budget).
  const [chargeRows, setChargeRows] = useState(() =>
    charges.map((c) => ({
      id: c.id,
      label: c.label,
      amount: (c.amount ?? '') as number | '',
      category: c.category || 'autre',
    })),
  );
  const updateCharge = (id: string, patch: Partial<(typeof chargeRows)[number]>) => {
    setChargeRows((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const addCharge = () => {
    setChargeRows((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, label: '', amount: '' as number | '', category: 'autre' },
    ]);
  };
  const removeCharge = (id: string) => setChargeRows((prev) => prev.filter((c) => c.id !== id));

  // Simulator: per-envelope monthly contribution overrides (by name).
  const [envOverrides, setEnvOverrides] = useState<Record<string, number>>({});

  const buildInput = (): HouseholdInput => ({
    householdType,
    country: budgetLocation || 'FR',
    members: members.map((m) => ({
      id: m.id,
      label: m.label,
      netIncome: Number(m.netIncome) || 0,
      ...(m.variableIncomeYearly !== '' ? { variableIncomeYearly: Number(m.variableIncomeYearly) } : {}),
      ...(m.personalSpendingMonthly !== '' ? { personalSpendingMonthly: Number(m.personalSpendingMonthly) } : {}),
    })),
    charges: chargeRows
      .filter((c) => c.label.trim() !== '' || c.amount !== '')
      .map((c) => ({
        label: c.label.trim() || 'Charge',
        amount: Number(c.amount) || 0,
        category: c.category || 'autre',
        scope: 'common' as const,
      })),
    objectives: projects.map((p) => ({
      label: p.label,
      ...(p.targetAmount ? { targetAmount: p.targetAmount } : {}),
      priority: 'medium' as const,
    })),
    wantsPersonalSavings,
    allowInterMemberTopUp,
    ...(preferredMethod !== 'auto' ? { preferredMethod } : {}),
    freeText: freeText.trim(),
  });

  const generate = async () => {
    if (members.length === 0) {
      toast({ title: 'Aucun membre', description: 'Ajoutez au moins un membre au budget.', variant: 'destructive' });
      return;
    }
    setView('loading');
    try {
      const res = await budgetAPI.generateAIProposal(buildInput());
      setProposal(res.data);
      setEnvOverrides({});
      setSimulating(false);
      setView('result');
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      toast({
        title: 'Échec de la génération',
        description: anyErr?.response?.data?.error || "L'IA n'a pas pu proposer de budget. Réessayez.",
        variant: 'destructive',
      });
      setView('intake');
    }
  };

  // ---- Simulator helpers ----
  const envContribution = (name: string, fallback: number) =>
    envOverrides[name] !== undefined ? envOverrides[name] : fallback;

  const totalSavings = useMemo(() => {
    if (!proposal) return 0;
    return proposal.savingsEnvelopes.reduce(
      (sum, e) => sum + envContribution(e.name, e.monthlyContribution),
      0,
    );
  }, [proposal, envOverrides]);

  const baselineSavings = useMemo(
    () => (proposal ? proposal.savingsEnvelopes.reduce((s, e) => s + e.monthlyContribution, 0) : 0),
    [proposal],
  );

  // Delta vs baseline is redistributed to pocket money (savings ↔ poche).
  const savingsDelta = totalSavings - baselineSavings;

  // ---- Actions ----
  const applyToSavings = () => {
    if (!proposal) return;
    // Map savings-type allocation lines / envelopes into recurring
    // "épargne particulière" projects and overwrite the current ones.
    const savingsLines = proposal.monthlyAllocation.filter((l) =>
      SAVINGS_ALLOCATION_TYPES.includes(l.type),
    );

    const source =
      savingsLines.length > 0
        ? savingsLines.map((l) => ({ name: l.label, amount: l.amount }))
        : proposal.savingsEnvelopes.map((e) => ({ name: e.name, amount: e.monthlyContribution }));

    const newProjects: Project[] = source.map((s, idx) => {
      // Honor simulator overrides when the label matches an envelope.
      const overridden = envOverrides[s.name];
      return {
        id: `${Date.now()}-${idx}`,
        label: s.name,
        monthlyAmount: Math.round(overridden !== undefined ? overridden : s.amount),
      };
    });

    setUndoSnapshot(projects);
    handleProjectsChange(newProjects);
    toast({
      title: 'Budget appliqué',
      description: `${newProjects.length} enveloppe(s) d'épargne renseignée(s) dans le calendrier.`,
    });
    setView('intake');
    setProposal(null);
  };

  const undoApply = () => {
    if (undoSnapshot === null) return;
    handleProjectsChange(undoSnapshot);
    setUndoSnapshot(null);
    toast({ title: 'Annulé', description: "Vos enveloppes d'épargne précédentes ont été restaurées." });
  };

  const reject = () => {
    setProposal(null);
    setView('intake');
    toast({ title: 'Proposition rejetée', description: 'Aucune modification apportée à votre budget.' });
  };

  const memberLabel = (id: string): string => members.find((m) => m.id === id)?.label || id;

  // =====================================================================
  // RENDER
  // =====================================================================
  if (view === 'loading') {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">L'IA construit une répartition juste et soutenable…</p>
        </CardContent>
      </Card>
    );
  }

  if (view === 'result' && proposal) {
    const feas = proposal.feasibility;
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Undo bar */}
        {undoSnapshot !== null && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <span>Un budget IA a été appliqué.</span>
            <Button size="sm" variant="ghost" onClick={undoApply}>
              <RotateCcw className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
        )}

        {/* FEASIBILITY FIRST (garde-fou) */}
        {feas.status !== 'ok' && (
          <div
            className={`rounded-xl border p-4 ${
              feas.status === 'infeasible' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm mb-2">
              <AlertTriangle className={`h-5 w-5 ${feas.status === 'infeasible' ? 'text-red-600' : 'text-amber-600'}`} />
              {feas.status === 'infeasible' ? 'Budget intenable en l’état' : 'Budget soutenable mais serré'}
              {feas.bindingMemberId && (
                <span className="font-normal text-muted-foreground">
                  · membre contraignant : {memberLabel(feas.bindingMemberId)}
                </span>
              )}
            </div>
            {feas.issues.length > 0 && (
              <ul className="list-disc pl-5 text-sm space-y-0.5 mb-2">
                {feas.issues.map((i, k) => <li key={k}>{i}</li>)}
              </ul>
            )}
            {feas.suggestedLevers.length > 0 && (
              <div className="text-sm">
                <span className="font-medium flex items-center gap-1"><Lightbulb className="h-4 w-4" /> Leviers proposés :</span>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  {feas.suggestedLevers.map((l, k) => <li key={k}>{l}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* SUMMARY */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" /> Proposition de l'IA
              <Badge variant="secondary" className="ml-auto text-[10px] uppercase">{proposal.methodChosen}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm leading-relaxed">{proposal.summary}</p>
            <p className="text-xs text-muted-foreground italic">{proposal.methodRationale}</p>
          </CardContent>
        </Card>

        {/* PER-MEMBER CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {proposal.perMember.map((m) => {
            const st = FEASIBILITY_STYLES[m.feasibility];
            return (
              <div key={m.memberId} className={`rounded-xl border p-4 ${st.ring}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{memberLabel(m.memberId)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Stat label="Contribution" value={`${m.monthlyContribution.toLocaleString()} ${sym}`} />
                  <Stat label="Argent de poche" value={`${m.pocketMoney.toLocaleString()} ${sym}`} />
                  <Stat label="Reste à vivre" value={`${m.resteAVivre.toLocaleString()} ${sym}`} />
                  <Stat label="Épargne perso" value={`${m.personalSavingsCapacity.toLocaleString()} ${sym}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ALLOCATION TABLE */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wallet className="h-4 w-4" /> Répartition mensuelle</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Poste</th>
                    <th className="text-right px-3 py-2">Montant</th>
                    <th className="text-left px-3 py-2 hidden sm:table-cell">Financé par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {proposal.monthlyAllocation.map((l, k) => (
                    <tr key={k}>
                      <td className="px-3 py-2">
                        <div className="font-medium">{l.label}</div>
                        {l.notes && <div className="text-[11px] text-muted-foreground">{l.notes}</div>}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold whitespace-nowrap">{l.amount.toLocaleString()} {sym}</td>
                      <td className="px-3 py-2 hidden sm:table-cell text-xs text-muted-foreground">
                        {l.fundedBy.map((f) => `${memberLabel(f.memberId)}: ${f.amount.toLocaleString()}${sym}`).join(' · ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* SAVINGS ENVELOPES + SIMULATOR */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><PiggyBank className="h-4 w-4" /> Enveloppes d'épargne</CardTitle>
            <Button size="sm" variant={simulating ? 'default' : 'outline'} onClick={() => setSimulating((s) => !s)}>
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Simulateur
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposal.savingsEnvelopes.map((e) => {
              const val = envContribution(e.name, e.monthlyContribution);
              const max = Math.max(Math.round(e.monthlyContribution * 2), 100);
              return (
                <div key={e.name} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{e.name}</div>
                      {e.vehicleSuggestion && (
                        <div className="text-[11px] text-muted-foreground">💡 {e.vehicleSuggestion}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold">{val.toLocaleString()} {sym}</span>
                      <span className="text-[10px] text-muted-foreground block">/ mois</span>
                    </div>
                  </div>
                  {simulating && (
                    <Slider
                      className="mt-3"
                      value={[val]}
                      min={0}
                      max={max}
                      step={10}
                      onValueChange={([v]) => setEnvOverrides((prev) => ({ ...prev, [e.name]: v }))}
                    />
                  )}
                </div>
              );
            })}
            {simulating && (
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Total épargne / mois</span>
                <span className="font-mono font-semibold">
                  {totalSavings.toLocaleString()} {sym}
                  {savingsDelta !== 0 && (
                    <span className={savingsDelta > 0 ? 'text-emerald-600 ml-2' : 'text-amber-600 ml-2'}>
                      ({savingsDelta > 0 ? '+' : ''}{savingsDelta.toLocaleString()} {sym} vs poche)
                    </span>
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ASSUMPTIONS & OPEN QUESTIONS */}
        {(proposal.assumptionsMade.length > 0 || proposal.openQuestions.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proposal.assumptionsMade.length > 0 && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Hypothèses</CardTitle></CardHeader>
                <CardContent><ul className="list-disc pl-4 text-sm space-y-1">{proposal.assumptionsMade.map((a, k) => <li key={k}>{a}</li>)}</ul></CardContent>
              </Card>
            )}
            {proposal.openQuestions.length > 0 && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground flex items-center gap-1"><HelpCircle className="h-3 w-3" /> Questions ouvertes</CardTitle></CardHeader>
                <CardContent><ul className="list-disc pl-4 text-sm space-y-1">{proposal.openQuestions.map((q, k) => <li key={k}>{q}</li>)}</ul></CardContent>
              </Card>
            )}
          </div>
        )}

        {/* LIFE EVENTS & VEHICLES */}
        {(proposal.lifeEventNotes.length > 0 || proposal.vehicleSuggestions.length > 0) && (
          <Card>
            <CardContent className="pt-4 space-y-3 text-sm">
              {proposal.lifeEventNotes.length > 0 && (
                <div>
                  <div className="font-medium mb-1">Événements de vie</div>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">{proposal.lifeEventNotes.map((n, k) => <li key={k}>{n}</li>)}</ul>
                </div>
              )}
              {proposal.variableIncomePolicy && (
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Revenus variables :</span> {proposal.variableIncomePolicy}</p>
              )}
              {proposal.separationHandling?.note && (
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Séparation :</span> {proposal.separationHandling.note}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* DISCLAIMER */}
        <p className="text-[11px] text-muted-foreground italic border-l-2 border-border pl-3">{proposal.disclaimer}</p>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2 sticky bottom-2 bg-background/80 backdrop-blur rounded-xl p-2 border border-border">
          <Button className="flex-1" onClick={applyToSavings} disabled={feas.status === 'infeasible'}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Valider
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => setSimulating(true)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Ouvrir le simulateur
          </Button>
          <Button className="flex-1" variant="ghost" onClick={reject}>
            <XCircle className="h-4 w-4 mr-1" /> Rejeter
          </Button>
        </div>
        {feas.status === 'infeasible' && (
          <p className="text-xs text-red-600 text-center -mt-2">Ajustez la situation ou passez par le simulateur avant de valider un budget intenable.</p>
        )}
      </div>
    );
  }

  // ---- INTAKE ----
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-primary" /> Budget proposé par l'IA</CardTitle>
          <p className="text-sm text-muted-foreground">
            Décrivez votre situation : l'IA propose une répartition mensuelle claire, juste et soutenable, que vous pourrez
            valider, ajuster dans le simulateur, ou rejeter.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Household type + options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Type de foyer</Label>
              <Select value={householdType} onValueChange={(v) => setHouseholdType(v as HouseholdType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="couple">Couple</SelectItem>
                  <SelectItem value="family">Famille</SelectItem>
                  <SelectItem value="friends">Amis</SelectItem>
                  <SelectItem value="roommates">Colocataires</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Méthode préférée (optionnel)</Label>
              <Select value={preferredMethod} onValueChange={(v) => setPreferredMethod(v as Method | 'auto')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Laisser l'IA choisir</SelectItem>
                  <SelectItem value="prorata">Au prorata des revenus</SelectItem>
                  <SelectItem value="equal">Parts égales (50/50)</SelectItem>
                  <SelectItem value="equalized_reste">Reste-à-vivre égal</SelectItem>
                  <SelectItem value="all_common">Tout commun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between rounded-lg border border-border/60 p-3 cursor-pointer">
              <span className="text-sm">Épargne perso par membre ?</span>
              <Switch checked={wantsPersonalSavings} onCheckedChange={setWantsPersonalSavings} />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border/60 p-3 cursor-pointer">
              <span className="text-sm">Un membre peut compléter l'autre ?</span>
              <Switch checked={allowInterMemberTopUp} onCheckedChange={setAllowInterMemberTopUp} />
            </label>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Membres & revenus</Label>
              <Button type="button" size="sm" variant="outline" onClick={addMember} className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" /> Ajouter un membre
              </Button>
            </div>
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun membre. Cliquez sur « Ajouter un membre » pour commencer.</p>
            )}
            {members.map((m) => (
              <div key={m.id} className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 items-end rounded-lg border border-border/60 p-3 pr-9">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Nom</Label>
                  <Input value={m.label} onChange={(e) => updateMember(m.id, { label: e.target.value })} className="h-8" placeholder="Alex" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Salaire net ({sym})</Label>
                  <Input type="number" value={m.netIncome} onChange={(e) => updateMember(m.id, { netIncome: Number(e.target.value) })} className="h-8 font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Variable/an ({sym})</Label>
                  <Input type="number" value={m.variableIncomeYearly} onChange={(e) => updateMember(m.id, { variableIncomeYearly: e.target.value === '' ? '' : Number(e.target.value) })} className="h-8 font-mono" placeholder="prime…" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Perso/mois ({sym})</Label>
                  <Input type="number" value={m.personalSpendingMonthly} onChange={(e) => updateMember(m.id, { personalSpendingMonthly: e.target.value === '' ? '' : Number(e.target.value) })} className="h-8 font-mono" placeholder="lifestyle" />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMember(m.id)}
                  className="absolute top-1.5 right-1.5 h-7 w-7 text-muted-foreground hover:text-red-500"
                  title="Retirer ce membre"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Charges (editable, prefilled from the budget) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Charges communes</Label>
              <Button type="button" size="sm" variant="outline" onClick={addCharge} className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" /> Ajouter une charge
              </Button>
            </div>
            {chargeRows.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune charge. Ajoutez vos dépenses fixes (loyer, courses…).</p>
            )}
            {chargeRows.map((c) => (
              <div key={c.id} className="relative grid grid-cols-2 gap-2 items-end rounded-lg border border-border/60 p-3 pr-9">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Libellé</Label>
                  <Input value={c.label} onChange={(e) => updateCharge(c.id, { label: e.target.value })} className="h-8" placeholder="Loyer" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Montant/mois ({sym})</Label>
                  <Input type="number" value={c.amount} onChange={(e) => updateCharge(c.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })} className="h-8 font-mono" />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeCharge(c.id)}
                  className="absolute top-1.5 right-1.5 h-7 w-7 text-muted-foreground hover:text-red-500"
                  title="Retirer cette charge"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Context summary */}
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">{projects.length} objectif(s) d'épargne repris du budget</Badge>
            {budget?.members && <Badge variant="secondary">{budget.members.length} membre(s) partagé(s)</Badge>}
          </div>

          {/* Free text */}
          <div className="space-y-1.5">
            <Label className="text-xs">Votre situation, en toutes lettres</Label>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={6}
              placeholder="Racontez : objectifs (mariage, apport, voyage), contraintes, événements de vie à venir, ce que vous voulez pour votre argent de poche…"
            />
            <p className="text-[11px] text-muted-foreground">Plus vous détaillez, plus la proposition sera juste. Vos données restent traitées côté serveur.</p>
          </div>

          <Button onClick={generate} className="w-full" size="lg">
            <Sparkles className="h-4 w-4 mr-2" /> Générer la proposition
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  );
}
