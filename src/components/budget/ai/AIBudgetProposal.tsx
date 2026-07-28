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
  CalendarRange,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { budgetAPI } from '@/services/api';
import { useBudget } from '@/contexts/BudgetContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { Project, Charge } from '@/utils/importConverter';
import {
  HouseholdInput,
  HouseholdType,
  Method,
  BudgetProposal,
  Feasibility,
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

// First day of the current month, YYYY-MM-DD — used so a brand-new budget's
// incomes/charges/savings start at creation rather than retroactively.
function firstOfCurrentMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

const norm = (s: string) => s.trim().toLowerCase();

// Merge incoming charges into existing ones by label: update the amount of a
// matching charge, add the ones that don't exist, keep everything else.
function mergeCharges(existing: Charge[], incoming: Charge[]): Charge[] {
  const result = existing.map((c) => ({ ...c }));
  for (const inc of incoming) {
    const i = result.findIndex((c) => norm(c.label) === norm(inc.label));
    if (i >= 0) result[i] = { ...result[i], amount: inc.amount };
    else result.push(inc);
  }
  return result;
}

// Same idea for savings: update the monthly amount of a matching épargne, add
// new ones, keep the rest.
function mergeProjects(existing: Project[], incoming: Project[]): Project[] {
  const result = existing.map((p) => ({ ...p }));
  for (const inc of incoming) {
    const i = result.findIndex((p) => norm(p.label) === norm(inc.label));
    if (i >= 0) result[i] = { ...result[i], monthlyAmount: inc.monthlyAmount };
    else result.push(inc);
  }
  return result;
}

// Cosmetic step labels shown while the LLM works, to make the wait less dull.
const LOADING_STEPS = [
  { at: 0, label: 'Analyse de votre situation et de vos revenus' },
  { at: 8, label: 'Choix de la méthode de répartition la plus juste' },
  { at: 18, label: 'Répartition des charges, poste par poste' },
  { at: 30, label: "Calcul des enveloppes d'épargne (sécurité, projets, vacances)" },
  { at: 42, label: 'Vérification de la faisabilité pour chaque membre' },
  { at: 54, label: 'Rédaction du résumé et finalisation' },
];

type View = 'intake' | 'loading' | 'result' | 'error' | 'applied';

export default function AIBudgetProposal() {
  const {
    people,
    charges,
    projects,
    budget,
    budgetCurrency,
    budgetLocation,
    handleProjectsChange,
    handlePeopleChange,
    handleChargesChange,
  } = useBudget();
  const navigate = useNavigate();
  const { id: budgetId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const sym = currencySymbol(budgetCurrency);

  const [view, setView] = useState<View>('intake');
  const [proposal, setProposal] = useState<BudgetProposal | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<Project[] | null>(null);
  const [undoCharges, setUndoCharges] = useState<Charge[] | null>(null);
  const [appliedSummary, setAppliedSummary] = useState<
    { projects: number; charges: number; isFresh: boolean } | null
  >(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [elapsed, setElapsed] = useState(0);

  // ---- Intake state (prefilled from the budget) ----
  const [householdType, setHouseholdType] = useState<HouseholdType>('couple');
  const [wantsPersonalSavings, setWantsPersonalSavings] = useState(false);
  const [allowInterMemberTopUp, setAllowInterMemberTopUp] = useState(true);
  const [preferredMethod, setPreferredMethod] = useState<Method | 'auto'>('auto');
  const [freeText, setFreeText] = useState('');

  // When the budget has no members yet (typical for the "create + IA" flow),
  // let the user add them right here instead of bouncing to the Members tab.
  const [memberSetup] = useState(() => people.length === 0);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberSalary, setNewMemberSalary] = useState('');

  const addBudgetMember = () => {
    if (!newMemberName.trim()) return;
    handlePeopleChange([
      ...people,
      {
        id: `p-${Date.now()}`,
        name: newMemberName.trim(),
        salary: parseFloat(newMemberSalary) || 0,
        // New household on a fresh budget → income starts this month.
        startDate: firstOfCurrentMonthISO(),
      },
    ]);
    setNewMemberName('');
    setNewMemberSalary('');
  };
  const removeBudgetMember = (id: string) => {
    handlePeopleChange(people.filter((p) => p.id !== id));
  };

  // Simulator: per-envelope monthly contribution overrides (by name).
  const [envOverrides, setEnvOverrides] = useState<Record<string, number>>({});

  // Members / charges / objectives are taken from the budget itself — the user
  // never re-types them here; the free text carries everything else.
  const buildInput = (): HouseholdInput => ({
    householdType,
    country: budgetLocation || 'FR',
    members: people.map((p) => ({
      id: p.id,
      label: p.name || 'Membre',
      netIncome: p.salary || 0,
    })),
    charges: charges.map((c) => ({
      label: c.label,
      amount: c.amount,
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
    if (people.length === 0) {
      toast({
        title: 'Aucun membre',
        description: "Ajoutez d'abord les membres du foyer (onglet Membres).",
        variant: 'destructive',
      });
      return;
    }
    if (freeText.trim().length < 20) {
      toast({
        title: 'Décrivez votre situation',
        description: 'Écrivez quelques phrases sur vos objectifs et contraintes pour guider l’IA.',
        variant: 'destructive',
      });
      return;
    }

    setErrorMsg('');
    setElapsed(0);
    setView('loading');
    const started = Date.now();
    const ticker = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    try {
      // Generous client timeout: a full Sonnet-5 proposal (~5-6k tokens) can
      // take ~60s; leave headroom above that so we don't cut off a valid call.
      const res = await budgetAPI.generateAIProposal(buildInput(), { timeout: 150000 });
      setProposal(res.data);
      setEnvOverrides({});
      setSimulating(false);
      setView('result');
    } catch (err: unknown) {
      const anyErr = err as { code?: string; response?: { data?: { error?: string } } };
      const timedOut = anyErr?.code === 'ECONNABORTED';
      setErrorMsg(
        timedOut
          ? "L'IA met trop de temps à répondre. Réessayez dans un instant."
          : anyErr?.response?.data?.error || "L'IA n'a pas pu proposer de budget. Réessayez dans un instant.",
      );
      setView('error');
    } finally {
      window.clearInterval(ticker);
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
  // Every non-charge allocation line (safety/projects/vacances/pocket money/
  // personal) becomes a recurring "épargne particulière" so the whole plan is
  // represented — pocket money included, per the product decision.
  const buildSavingsProjects = (startDate?: string): Project[] => {
    if (!proposal) return [];
    const allocation = proposal.monthlyAllocation ?? [];
    const envelopes = proposal.savingsEnvelopes ?? [];
    const lines = allocation.filter((l) => l.type !== 'common_charge');
    const source =
      lines.length > 0
        ? lines.map((l) => ({ name: l.label, amount: l.amount }))
        : envelopes.map((e) => ({ name: e.name, amount: e.monthlyContribution }));
    return source
      .filter((s) => (Number(s.amount) || 0) > 0)
      .map((s, idx) => ({
        id: `${Date.now()}-${idx}`,
        label: s.name,
        monthlyAmount: Math.round(envOverrides[s.name] ?? s.amount),
        ...(startDate ? { startDate } : {}),
      }));
  };

  const buildItemizedCharges = (startDate?: string): Charge[] => {
    if (!proposal) return [];
    return (proposal.monthlyAllocation ?? [])
      .filter((l) => l.type === 'common_charge')
      .map((l, idx) => ({
        id: `c-${Date.now()}-${idx}`,
        label: l.label,
        amount: Math.round(l.amount),
        category: l.category || 'autre',
        ...(startDate ? { startDate } : {}),
      }));
  };

  // Applies the proposal to the CURRENT budget, in place.
  //  - Fresh budget (no charges/savings): generate charges + savings from the
  //    proposal, stamped to start this month → the calendar fills from creation.
  //  - Existing budget: merge the proposal into it (update matching charges /
  //    savings by label, add new ones, keep the rest and all history/comments).
  const applyProposal = () => {
    if (!proposal) return;
    const isFresh = charges.length === 0 && projects.length === 0;
    const start = isFresh ? firstOfCurrentMonthISO() : undefined;

    const aiCharges = buildItemizedCharges(start);
    const aiSavings = buildSavingsProjects(start);

    if (aiCharges.length === 0 && aiSavings.length === 0) {
      toast({
        title: 'Proposition inexploitable',
        description:
          "La proposition ne contient ni charge ni épargne à appliquer (répartition vide). Réessayez une génération.",
        variant: 'destructive',
      });
      return;
    }

    const nextCharges = isFresh ? aiCharges : mergeCharges(charges, aiCharges);
    const nextProjects = isFresh ? aiSavings : mergeProjects(projects, aiSavings);

    setUndoCharges(charges);
    setUndoSnapshot(projects);
    handleChargesChange(nextCharges);
    handleProjectsChange(nextProjects);
    // Persistence is handled by the autosave that these handlers trigger (it
    // runs after re-render with the new state; calling performSave here would
    // capture stale state and could overwrite the change).

    setAppliedSummary({ charges: nextCharges.length, projects: nextProjects.length, isFresh });
    setView('applied');
  };

  const undoApply = () => {
    if (undoSnapshot !== null) handleProjectsChange(undoSnapshot);
    if (undoCharges !== null) handleChargesChange(undoCharges);
    setUndoSnapshot(null);
    setUndoCharges(null);
    toast({ title: 'Annulé', description: 'Votre budget précédent a été restauré.' });
  };

  const reject = () => {
    setProposal(null);
    setView('intake');
    toast({ title: 'Proposition rejetée', description: 'Aucune modification apportée à votre budget.' });
  };

  // Members come straight from the budget (People tab); labels resolve from there.
  const memberLabel = (id: string): string => people.find((p) => p.id === id)?.name || id;

  // =====================================================================
  // RENDER
  // =====================================================================
  if (view === 'loading') {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center py-14 gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-primary" />
            <p className="text-sm font-medium">L'IA construit votre budget…</p>
            <p className="text-xs text-muted-foreground/70">{elapsed}s · généralement 30 à 60 secondes</p>
          </div>
          <div className="w-full max-w-sm space-y-2.5">
            {LOADING_STEPS.map((step, i) => {
              const next = LOADING_STEPS[i + 1];
              const done = next ? elapsed >= next.at : false;
              const current = elapsed >= step.at && !done;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 text-sm transition-colors ${
                    done || current ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : current ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                  ) : (
                    <div className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/30" />
                  )}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === 'error') {
    return (
      <Card className="border-red-200">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">La génération a échoué</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">{errorMsg}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('intake')}>Modifier ma demande</Button>
            <Button onClick={generate}>
              <RotateCcw className="h-4 w-4 mr-1" /> Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === 'applied') {
    const fresh = appliedSummary?.isFresh;
    return (
      <Card className="border-emerald-200">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">{fresh ? 'Budget créé' : 'Budget mis à jour'}</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {appliedSummary?.charges || 0} charge(s) et {appliedSummary?.projects || 0} épargne(s)
              {fresh ? ' générées' : ' fusionnées'} — le calendrier est renseigné en conséquence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => budgetId && navigate(`/budget/${budgetId}/complete/calendar`)}>
              <CalendarRange className="h-4 w-4 mr-1" /> Voir le calendrier
            </Button>
            <Button variant="outline" onClick={() => budgetId && navigate(`/budget/${budgetId}/complete/projects`)}>
              <PiggyBank className="h-4 w-4 mr-1" /> Voir l'épargne
            </Button>
            <Button variant="ghost" onClick={() => { undoApply(); setAppliedSummary(null); setView('intake'); }}>
              <RotateCcw className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
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
        <p className="text-[11px] text-muted-foreground text-center">
          {charges.length > 0 || projects.length > 0 ? (
            <>Valider <strong>fusionne</strong> la proposition dans ce budget : charges et épargnes mises à jour, le reste (historique, commentaires) conservé.</>
          ) : (
            <>Valider <strong>remplit</strong> ce budget : charges, épargne et calendrier générés à partir de la proposition.</>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sticky bottom-2 bg-background/80 backdrop-blur rounded-xl p-2 border border-border">
          <Button className="flex-1" onClick={applyProposal} disabled={feas.status === 'infeasible'}>
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

          {/* Member setup — only when the budget has no members yet */}
          {memberSetup && (
            <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Label className="text-sm font-medium">Membres du foyer & revenus</Label>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Ce budget est vide : ajoutez au moins un membre pour que l'IA puisse répartir.
              </p>
              {people.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-md bg-background border border-border/50 px-3 py-2">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono">{(p.salary || 0).toLocaleString()} {sym}</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeBudgetMember(p.id)} className="h-7 w-7 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Nom</Label>
                  <Input
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBudgetMember())}
                    placeholder="Alex"
                    className="h-9"
                  />
                </div>
                <div className="w-full sm:w-36 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Salaire net ({sym})</Label>
                  <Input
                    type="number"
                    value={newMemberSalary}
                    onChange={(e) => setNewMemberSalary(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBudgetMember())}
                    placeholder="2500"
                    className="h-9 font-mono"
                  />
                </div>
                <Button type="button" onClick={addBudgetMember} disabled={!newMemberName.trim()} className="h-9 gap-1">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>
            </div>
          )}

          {/* Free text — the primary input */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Décrivez votre situation, en toutes lettres</Label>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={8}
              placeholder="Ex : On est en couple, on veut fusionner nos comptes. On vise un apport pour un appart d'ici 3-4 ans, un mariage l'an prochain, et un gros voyage l'été. Léa a une prime annuelle. On aimerait garder chacun un peu d'argent de poche…"
            />
            <p className="text-[11px] text-muted-foreground">
              Objectifs, contraintes, événements de vie à venir, argent de poche souhaité, primes… Plus vous détaillez,
              plus la proposition sera juste. Traitement côté serveur.
            </p>
          </div>

          {/* Transparency: the AI also uses the budget's own data */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            L'IA s'appuie aussi sur les données de votre budget —{' '}
            <span className="font-medium text-foreground">{people.length} membre(s)</span> et leurs revenus,{' '}
            <span className="font-medium text-foreground">{charges.length} charge(s)</span>,{' '}
            <span className="font-medium text-foreground">{projects.length} objectif(s)</span>.{' '}
            {memberSetup
              ? 'Vous pourrez affiner charges et objectifs dans leurs onglets après la proposition.'
              : <>Pas besoin de les ressaisir ici : ajustez-les dans les onglets <em>Membres</em>, <em>Charges</em> et <em>Épargne</em> si nécessaire.</>}
          </div>

          <Button onClick={generate} className="w-full" size="lg" disabled={people.length === 0}>
            <Sparkles className="h-4 w-4 mr-2" /> Générer la proposition
          </Button>
          {people.length === 0 && (
            <p className="text-xs text-muted-foreground text-center -mt-2">
              Ajoutez d'abord au moins un membre dans l'onglet <em>Membres</em>.
            </p>
          )}
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
