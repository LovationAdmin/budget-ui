// src/components/budget/ai/AIBudgetProposal.tsx
// ============================================================================
// « Budget proposé par IA » — intake → résultat → simulateur.
// Consomme le contexte budget pour pré-remplir HouseholdInput, appelle l'API,
// puis rend le BudgetProposal avec les actions Valider / Rejeter / Simulateur.
//
// Applying a proposal never rewrites the past: amounts change « à partir de »
// the first open month, new charges / savings start that month, and — when
// the plan uses separate accounts — each member's contribution to the
// household pot is set from the proposal (salary ≠ contribution).
// ============================================================================

import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
  CalendarDays,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBudget } from '@/contexts/BudgetContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { BudgetModel, Charge, Person, Project, YM } from '@/lib/budget/types';
import { GENERAL_SAVINGS_ID } from '@/lib/budget/types';
import {
  chargeBaseAmount,
  chargeFrequency,
  chargeStatus,
  isRecurringProject,
  personStatus,
  projectStatus,
  resolvePerson,
  windowOf,
} from '@/lib/budget/engine';
import {
  applyContributionRules,
  convertSavingToMonthly,
  newId,
  removePerson,
  setChargeAmountFrom,
  setSavingAmountFrom,
  upsertCharge,
  upsertPerson,
  upsertProject,
  type ContributionRule,
} from '@/lib/budget/mutations';
import { compareYM, formatMonthLong, monthsBetween, startDateOf, deMonth } from '@/lib/budget/months';
import { money, moneySigned, roundCents } from '@/lib/budget/format';
import { useFirstOpenMonth } from '@/components/budget/shared/hooks';
import {
  AdvisorStage,
  HouseholdInput,
  HouseholdType,
  Method,
  BudgetProposal,
  Feasibility,
} from '@/types/aiBudget';
import { clearAdvisorJob, retryAdvisorJob, startAdvisorJob, useAdvisorJob } from '@/lib/ai/advisorJob';
import { defineMessages, useT } from '@/i18n/runtime';

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

const FEASIBILITY_STYLES: Record<Feasibility, { ring: string; badge: string }> = {
  ok: { ring: 'border-emerald-200 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700' },
  tight: { ring: 'border-amber-200 bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' },
  infeasible: { ring: 'border-red-200 bg-red-50/50', badge: 'bg-red-100 text-red-700' },
};

const norm = (s: string) => s.trim().toLowerCase();

interface AILine {
  label: string;
  amount: number;
  category?: string;
}

/**
 * Merges the proposal into the budget from `start`: a charge / saving with the
 * same name gets its new amount from that month (earlier months keep theirs),
 * the others are added starting that month. Nothing else is touched.
 */
function mergeProposal(
  model: BudgetModel,
  charges: AILine[],
  savings: AILine[],
  start: YM,
  today: YM,
  isClosed: (ym: YM) => boolean,
): BudgetModel {
  let next = model;
  for (const line of charges) {
    const existing = next.charges.find((c) => norm(c.label) === norm(line.label) && chargeStatus(c, today) !== 'ended');
    if (existing && chargeFrequency(existing) === 'monthly') {
      next = setChargeAmountFrom(next, existing.id, start, line.amount, today);
    } else {
      const charge: Charge = { id: newId('c'), label: line.label, amount: line.amount, startDate: startDateOf(start) };
      if (line.category && line.category !== 'autre') charge.category = line.category;
      next = upsertCharge(next, charge);
    }
  }
  for (const line of savings) {
    const existing = next.projects.find((p) => p.id !== GENERAL_SAVINGS_ID && norm(p.label) === norm(line.label) && projectStatus(p, today) !== 'ended');
    if (existing && isRecurringProject(existing)) next = setSavingAmountFrom(next, existing.id, start, line.amount, today);
    else if (existing) next = convertSavingToMonthly(next, existing.id, start, line.amount, today, isClosed);
    else next = upsertProject(next, { id: newId('p'), label: line.label, monthlyAmount: line.amount, startDate: startDateOf(start) });
  }
  return next;
}

// Generation steps. The server reports the real one as the answer is written;
// `at` (seconds) is only used when it cannot (older API without streaming).
type LoadingStage = Exclude<AdvisorStage, 'retry'>;

const LOADING_STEPS: { key: LoadingStage; at: number }[] = [
  { key: 'analyzing', at: 0 },
  { key: 'method', at: 8 },
  { key: 'allocation', at: 16 },
  { key: 'members', at: 24 },
  { key: 'savings', at: 32 },
  { key: 'feasibility', at: 40 },
  { key: 'summary', at: 48 },
];

interface Words {
  feasibility: Record<Feasibility, string>;
  steps: Record<LoadingStage, string>;
  methods: Record<Method, string>;
  errorTitles: Partial<Record<string, string>>;
  errorTitle: string;
  /** Amounts as the proposal shows them; `tight`: no space before the symbol. */
  amount: (n: number, sym: string, tight?: boolean) => string;
  memberFallback: string;
  noMembersTitle: string;
  noMembersDesc: string;
  describeTitle: string;
  describeDesc: string;
  unusableTitle: string;
  unusableDesc: string;
  undoneTitle: string;
  undoneDesc: string;
  rejectedTitle: string;
  rejectedDesc: string;
  building: string;
  elapsed: (seconds: number) => string;
  retrying: string;
  progressLabel: string;
  switchTabs: string;
  cancel: string;
  editRequest: string;
  retry: string;
  created: string;
  updated: string;
  appliedSummary: (charges: number, savings: number, fresh: boolean, month: string, contributions: boolean) => string;
  seeMonth: string;
  seeSavings: string;
  undo: string;
  stale: string;
  regenerate: string;
  appliedBar: string;
  infeasible: string;
  tight: string;
  bindingMember: (name: string) => string;
  levers: string;
  proposalTitle: string;
  contribution: string;
  pocketMoney: string;
  resteAVivre: string;
  personalSavings: string;
  monthlyAllocation: string;
  item: string;
  amountHeader: string;
  fundedBy: string;
  envelopes: string;
  simulator: string;
  perMonth: string;
  totalSavings: string;
  savingsDelta: (delta: number, sym: string) => string;
  assumptions: string;
  openQuestions: string;
  lifeEvents: string;
  variableIncome: string;
  separation: string;
  applyMerge: (month: string) => ReactNode;
  applyFill: (month: string) => ReactNode;
  apply: string;
  openSimulator: string;
  reject: string;
  infeasibleHint: string;
  intakeTitle: string;
  intakeIntro: string;
  householdType: string;
  householdTypes: Record<HouseholdType, string>;
  preferredMethod: string;
  letAIChoose: string;
  personalSavingsQuestion: string;
  topUpQuestion: string;
  membersTitle: string;
  emptyBudget: string;
  name: string;
  salary: (sym: string) => string;
  add: string;
  freeTextLabel: string;
  freeTextPlaceholder: string;
  freeTextHint: string;
  dataUsed: (members: number, charges: number, goals: number, strong: (text: string) => ReactNode) => ReactNode;
  refineLater: string;
  noRetype: ReactNode;
  generate: string;
  addMemberFirst: ReactNode;
}

const M = defineMessages<Words>({
  fr: {
    feasibility: { ok: 'Soutenable', tight: 'Serré', infeasible: 'Intenable' },
    steps: {
      analyzing: 'Analyse de votre situation et de vos revenus',
      method: 'Choix de la méthode de répartition la plus juste',
      allocation: 'Répartition des charges, poste par poste',
      members: 'Contribution et reste à vivre de chaque membre',
      savings: "Calcul des enveloppes d'épargne (sécurité, projets, vacances)",
      feasibility: 'Vérification de la faisabilité pour chaque membre',
      summary: 'Rédaction du résumé et finalisation',
    },
    methods: {
      prorata: 'Au prorata des revenus',
      equal: 'Parts égales (50/50)',
      equalized_reste: 'Reste-à-vivre égal',
      all_common: 'Tout commun',
    },
    errorTitles: {
      ai_timeout: "L'IA a mis trop de temps",
      ai_busy: 'Service IA très sollicité',
      ai_refused: 'Demande non traitée',
      unauthorized: 'Session expirée',
      connection_lost: 'Connexion interrompue',
    },
    errorTitle: 'La génération a échoué',
    amount: (n, sym, tight) => `${n.toLocaleString()}${tight ? '' : ' '}${sym}`,
    memberFallback: 'Membre',
    noMembersTitle: 'Aucun membre',
    noMembersDesc: "Ajoutez d'abord les membres du foyer (onglet Foyer).",
    describeTitle: 'Décrivez votre situation',
    describeDesc: 'Écrivez quelques phrases sur vos objectifs et contraintes pour guider l’IA.',
    unusableTitle: 'Proposition inexploitable',
    unusableDesc: "La proposition ne contient ni charge ni épargne à appliquer (répartition vide). Réessayez une génération.",
    undoneTitle: 'Annulé',
    undoneDesc: 'Votre budget précédent a été restauré.',
    rejectedTitle: 'Proposition rejetée',
    rejectedDesc: 'Aucune modification apportée à votre budget.',
    building: "L'IA construit votre budget…",
    elapsed: (seconds) => `${seconds} s · généralement 20 à 60 secondes`,
    retrying: 'La première réponse était incomplète : nouvelle tentative en cours.',
    progressLabel: 'Progression de la génération',
    switchTabs: "Vous pouvez changer d'onglet : la proposition vous attendra ici.",
    cancel: 'Annuler',
    editRequest: 'Modifier ma demande',
    retry: 'Réessayer',
    created: 'Budget créé',
    updated: 'Budget mis à jour',
    appliedSummary: (charges, savings, fresh, month, contributions) =>
      `${charges} charge(s) et ${savings} épargne(s)${fresh ? ' créées' : ' mises à jour'} à partir ${deMonth(month)}${contributions ? ', avec la contribution de chacun au pot commun' : ''}. Les mois d’avant ne changent pas.`,
    seeMonth: 'Voir le mois',
    seeSavings: "Voir l'épargne",
    undo: 'Annuler',
    stale: 'Votre budget a changé depuis cette proposition (foyer, revenus, charges ou objectifs). Régénérez-la pour en tenir compte.',
    regenerate: 'Régénérer',
    appliedBar: 'Un budget IA a été appliqué.',
    infeasible: 'Budget intenable en l’état',
    tight: 'Budget soutenable mais serré',
    bindingMember: (name) => `· membre contraignant : ${name}`,
    levers: 'Leviers proposés :',
    proposalTitle: "Proposition de l'IA",
    contribution: 'Contribution',
    pocketMoney: 'Argent de poche',
    resteAVivre: 'Reste à vivre',
    personalSavings: 'Épargne perso',
    monthlyAllocation: 'Répartition mensuelle',
    item: 'Poste',
    amountHeader: 'Montant',
    fundedBy: 'Financé par',
    envelopes: "Enveloppes d'épargne",
    simulator: 'Simulateur',
    perMonth: '/ mois',
    totalSavings: 'Total épargne / mois',
    savingsDelta: (delta, sym) => `(${delta > 0 ? '+' : ''}${delta.toLocaleString()} ${sym} vs poche)`,
    assumptions: 'Hypothèses',
    openQuestions: 'Questions ouvertes',
    lifeEvents: 'Événements de vie',
    variableIncome: 'Revenus variables :',
    separation: 'Séparation :',
    applyMerge: (month) => <>Valider <strong>fusionne</strong> la proposition dans ce budget à partir {deMonth(month)} : charges et épargnes mises à jour, les mois d’avant et l’historique conservés.</>,
    applyFill: (month) => <>Valider <strong>remplit</strong> ce budget à partir {deMonth(month)} : charges, épargnes et contributions générées à partir de la proposition.</>,
    apply: 'Valider',
    openSimulator: 'Ouvrir le simulateur',
    reject: 'Rejeter',
    infeasibleHint: 'Ajustez la situation ou passez par le simulateur avant de valider un budget intenable.',
    intakeTitle: "Budget proposé par l'IA",
    intakeIntro: "Décrivez votre situation : l'IA propose une répartition mensuelle claire, juste et soutenable, que vous pourrez valider, ajuster dans le simulateur, ou rejeter.",
    householdType: 'Type de foyer',
    householdTypes: { couple: 'Couple', family: 'Famille', friends: 'Amis', roommates: 'Colocataires' },
    preferredMethod: 'Méthode préférée (optionnel)',
    letAIChoose: "Laisser l'IA choisir",
    personalSavingsQuestion: 'Épargne perso par membre ?',
    topUpQuestion: "Un membre peut compléter l'autre ?",
    membersTitle: 'Membres du foyer & revenus',
    emptyBudget: "Ce budget est vide : ajoutez au moins un membre pour que l'IA puisse répartir.",
    name: 'Nom',
    salary: (sym) => `Salaire net (${sym})`,
    add: 'Ajouter',
    freeTextLabel: 'Décrivez votre situation, en toutes lettres',
    freeTextPlaceholder: "Ex : On est en couple, on veut fusionner nos comptes. On vise un apport pour un appart d'ici 3-4 ans, un mariage l'an prochain, et un gros voyage l'été. Léa a une prime annuelle. On aimerait garder chacun un peu d'argent de poche…",
    freeTextHint: 'Objectifs, contraintes, événements de vie à venir, argent de poche souhaité, primes… Plus vous détaillez, plus la proposition sera juste. Traitement côté serveur.',
    dataUsed: (members, charges, goals, strong) => (
      <>
        L'IA s'appuie aussi sur les données de votre budget —{' '}
        {strong(`${members} membre(s)`)} et leurs revenus,{' '}
        {strong(`${charges} charge(s)`)},{' '}
        {strong(`${goals} objectif(s)`)}.{' '}
      </>
    ),
    refineLater: 'Vous pourrez affiner charges et objectifs dans leurs onglets après la proposition.',
    noRetype: <>Pas besoin de les ressaisir ici : ajustez-les dans les onglets <em>Foyer</em>, <em>Charges</em> et <em>Épargne</em> si nécessaire.</>,
    generate: 'Générer la proposition',
    addMemberFirst: <>Ajoutez d'abord au moins un membre dans l'onglet <em>Foyer</em>.</>,
  },
  en: {
    feasibility: { ok: 'Sustainable', tight: 'Tight', infeasible: 'Not sustainable' },
    steps: {
      analyzing: 'Analyzing your situation and income',
      method: 'Choosing the fairest way to split',
      allocation: 'Splitting the bills, line by line',
      members: 'Each member’s contribution and leftover income',
      savings: 'Working out the savings envelopes (safety net, goals, holidays)',
      feasibility: 'Checking it works for each member',
      summary: 'Writing the summary and wrapping up',
    },
    methods: {
      prorata: 'In proportion to income',
      equal: 'Equal shares (50/50)',
      equalized_reste: 'Equal leftover income',
      all_common: 'Everything shared',
    },
    errorTitles: {
      ai_timeout: 'The AI took too long',
      ai_busy: 'The AI service is very busy',
      ai_refused: 'Request not processed',
      unauthorized: 'Session expired',
      connection_lost: 'Connection lost',
    },
    errorTitle: 'Generation failed',
    amount: (n, sym) => money(n, sym),
    memberFallback: 'Member',
    noMembersTitle: 'No members',
    noMembersDesc: 'Add the members of your household first (Household tab).',
    describeTitle: 'Describe your situation',
    describeDesc: 'Write a few sentences about your goals and constraints to guide the AI.',
    unusableTitle: 'Unusable proposal',
    unusableDesc: 'The proposal has no bills or savings to apply (empty breakdown). Try generating it again.',
    undoneTitle: 'Undone',
    undoneDesc: 'Your previous budget has been restored.',
    rejectedTitle: 'Proposal rejected',
    rejectedDesc: 'No changes were made to your budget.',
    building: 'The AI is building your budget…',
    elapsed: (seconds) => `${seconds} s · usually 20 to 60 seconds`,
    retrying: 'The first answer was incomplete: trying again.',
    progressLabel: 'Generation progress',
    switchTabs: 'You can switch tabs: the proposal will be waiting for you here.',
    cancel: 'Cancel',
    editRequest: 'Edit my request',
    retry: 'Try again',
    created: 'Budget created',
    updated: 'Budget updated',
    appliedSummary: (charges, savings, fresh, month, contributions) =>
      `${charges} bill${charges !== 1 ? 's' : ''} and ${savings} savings pot${savings !== 1 ? 's' : ''} ${fresh ? 'created' : 'updated'} from ${month}${contributions ? ', with each person’s contribution to the joint pot' : ''}. Earlier months don’t change.`,
    seeMonth: 'See the month',
    seeSavings: 'See savings',
    undo: 'Undo',
    stale: 'Your budget has changed since this proposal (household, income, bills or goals). Regenerate it to take the changes into account.',
    regenerate: 'Regenerate',
    appliedBar: 'An AI budget was applied.',
    infeasible: 'Budget not sustainable as it stands',
    tight: 'Budget sustainable but tight',
    bindingMember: (name) => `· limiting member: ${name}`,
    levers: 'Ways to make it work:',
    proposalTitle: 'AI proposal',
    contribution: 'Contribution',
    pocketMoney: 'Spending money',
    resteAVivre: 'Leftover income',
    personalSavings: 'Personal savings',
    monthlyAllocation: 'Monthly breakdown',
    item: 'Item',
    amountHeader: 'Amount',
    fundedBy: 'Paid by',
    envelopes: 'Savings envelopes',
    simulator: 'Simulator',
    perMonth: '/ month',
    totalSavings: 'Total savings / month',
    savingsDelta: (delta, sym) => `(${moneySigned(delta, sym)} vs spending money)`,
    assumptions: 'Assumptions',
    openQuestions: 'Open questions',
    lifeEvents: 'Life events',
    variableIncome: 'Variable income:',
    separation: 'If you separate:',
    applyMerge: (month) => <>Applying <strong>merges</strong> the proposal into this budget from {month}: bills and savings pots are updated, earlier months and history are kept.</>,
    applyFill: (month) => <>Applying <strong>fills</strong> this budget from {month}: bills, savings pots and contributions are generated from the proposal.</>,
    apply: 'Apply',
    openSimulator: 'Open the simulator',
    reject: 'Reject',
    infeasibleHint: 'Adjust your situation or use the simulator before applying a budget that isn’t sustainable.',
    intakeTitle: 'AI-suggested budget',
    intakeIntro: 'Describe your situation: the AI suggests a clear, fair and sustainable monthly breakdown that you can apply, adjust in the simulator or reject.',
    householdType: 'Household type',
    householdTypes: { couple: 'Couple', family: 'Family', friends: 'Friends', roommates: 'Roommates' },
    preferredMethod: 'Preferred method (optional)',
    letAIChoose: 'Let the AI choose',
    personalSavingsQuestion: 'Personal savings for each member?',
    topUpQuestion: 'Can one member top up the other?',
    membersTitle: 'Household members & income',
    emptyBudget: 'This budget is empty: add at least one member so the AI can split it.',
    name: 'Name',
    salary: (sym) => `Take-home pay (${sym})`,
    add: 'Add',
    freeTextLabel: 'Describe your situation in your own words',
    freeTextPlaceholder: 'E.g. We’re a couple and want to merge our accounts. We’re saving for a home in 3–4 years, a wedding next year and a big summer trip. Sam gets a yearly bonus. We’d each like to keep a bit of spending money…',
    freeTextHint: 'Goals, constraints, upcoming life events, the spending money you’d like, bonuses… The more detail you give, the better the proposal. Processed on the server.',
    dataUsed: (members, charges, goals, strong) => (
      <>
        The AI also uses your budget’s data —{' '}
        {strong(`${members} member${members !== 1 ? 's' : ''}`)} and their income,{' '}
        {strong(`${charges} bill${charges !== 1 ? 's' : ''}`)},{' '}
        {strong(`${goals} goal${goals !== 1 ? 's' : ''}`)}.{' '}
      </>
    ),
    refineLater: 'You can fine-tune bills and goals in their tabs after the proposal.',
    noRetype: <>No need to enter them again here: adjust them in the <em>Household</em>, <em>Bills</em> and <em>Savings</em> tabs if needed.</>,
    generate: 'Generate the proposal',
    addMemberFirst: <>Add at least one member in the <em>Household</em> tab first.</>,
  },
});

type View = 'intake' | 'loading' | 'result' | 'error' | 'applied';

interface IntakeDraft {
  householdType: HouseholdType;
  wantsPersonalSavings: boolean;
  allowInterMemberTopUp: boolean;
  preferredMethod: Method | 'auto';
  freeText: string;
}

const draftKey = (budgetId?: string) => `ai-advisor-draft:${budgetId ?? ''}`;

/** The intake typed by the user, kept for the session (tab switches, retries). */
function loadDraft(budgetId?: string): Partial<IntakeDraft> {
  try {
    return JSON.parse(sessionStorage.getItem(draftKey(budgetId)) || '{}') as Partial<IntakeDraft>;
  } catch {
    return {};
  }
}

export default function AIBudgetProposal() {
  const { model, engine, today, commit, budgetCurrency, budgetLocation, goToMonth } = useBudget();
  const navigate = useNavigate();
  const { id: budgetId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const t = useT(M);
  const sym = currencySymbol(budgetCurrency);
  const start = useFirstOpenMonth();

  // What the proposal works from: the household and rules in force today.
  const people: Person[] = model.people.filter((p) => personStatus(p, today) !== 'ended');
  // Household charges only: personal ones come out of each member's pocket money.
  const charges: Charge[] = model.charges.filter((c) => !c.ownerId && chargeStatus(c, today) === 'active' && chargeFrequency(c) !== 'once');
  const projects: Project[] = model.projects.filter((p) => p.id !== GENERAL_SAVINGS_ID && projectStatus(p, today) !== 'ended');

  // Generation runs in the background (survives tab switches); `applied` is
  // the only view owned by this component.
  const job = useAdvisorJob(budgetId);
  const [applied, setApplied] = useState(false);
  const view: View = applied
    ? 'applied'
    : job?.status === 'running'
      ? 'loading'
      : job?.status === 'error'
        ? 'error'
        : job?.status === 'done'
          ? 'result'
          : 'intake';
  const proposal: BudgetProposal | null = job?.status === 'done' ? job.proposal : null;
  const [simulating, setSimulating] = useState(false);
  const [undoModel, setUndoModel] = useState<BudgetModel | null>(null);
  const [appliedSummary, setAppliedSummary] = useState<
    { projects: number; charges: number; isFresh: boolean; contributions: boolean } | null
  >(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = job?.status === 'running' ? job.startedAt : null;
  useEffect(() => {
    if (startedAt === null) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const ticker = window.setInterval(tick, 1000);
    return () => window.clearInterval(ticker);
  }, [startedAt]);

  // ---- Intake state (prefilled from the budget, then from the session draft) ----
  const [draft] = useState(() => loadDraft(budgetId));
  const [householdType, setHouseholdType] = useState<HouseholdType>(draft.householdType ?? 'couple');
  const [wantsPersonalSavings, setWantsPersonalSavings] = useState(draft.wantsPersonalSavings ?? false);
  const [allowInterMemberTopUp, setAllowInterMemberTopUp] = useState(draft.allowInterMemberTopUp ?? true);
  const [preferredMethod, setPreferredMethod] = useState<Method | 'auto'>(draft.preferredMethod ?? 'auto');
  // Prefilled when coming from a saving goal (« Demander un plan à Budget IA »).
  const [searchParams] = useSearchParams();
  const [freeText, setFreeText] = useState(() => searchParams.get('objectif') ?? draft.freeText ?? '');
  useEffect(() => {
    try {
      const next: IntakeDraft = { householdType, wantsPersonalSavings, allowInterMemberTopUp, preferredMethod, freeText };
      sessionStorage.setItem(draftKey(budgetId), JSON.stringify(next));
    } catch {
      /* stockage indisponible : le brouillon reste à l'écran */
    }
  }, [budgetId, householdType, wantsPersonalSavings, allowInterMemberTopUp, preferredMethod, freeText]);

  // When the budget has no members yet (typical for the "create + IA" flow),
  // let the user add them right here instead of bouncing to the Members tab.
  const [memberSetup] = useState(() => people.length === 0);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberSalary, setNewMemberSalary] = useState('');

  const addBudgetMember = () => {
    if (!newMemberName.trim()) return;
    const person: Person = {
      id: newId('m'),
      name: newMemberName.trim(),
      salary: roundCents(parseFloat(newMemberSalary.replace(',', '.')) || 0),
    };
    commit((m) => upsertPerson(m, person), { saveNow: true });
    setNewMemberName('');
    setNewMemberSalary('');
  };
  const removeBudgetMember = (id: string) => {
    commit((m) => removePerson(m, id), { saveNow: true });
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
      label: p.name || t.memberFallback,
      netIncome: resolvePerson(p, start)?.salary ?? p.salary ?? 0,
      // Personal charges (tax, money sent abroad…) the member pays from their pocket money.
      ...((engine.month(start).people.find((x) => x.id === p.id)?.personalCharges ?? 0) > 0
        ? { personalSpendingMonthly: engine.month(start).people.find((x) => x.id === p.id)!.personalCharges }
        : {}),
    })),
    charges: charges.map((c) => {
      const base = chargeBaseAmount(c, today);
      return {
        label: c.label,
        amount: chargeFrequency(c) === 'yearly' ? roundCents(base / 12) : base,
        category: c.category || 'autre',
        scope: 'common' as const,
      };
    }),
    objectives: projects.map((p) => {
      // A saving with an end month is a deadline: the AI paces it to finish on time.
      const end = windowOf(p).end;
      const horizon = end && compareYM(end, start) >= 0 ? monthsBetween(start, end) : undefined;
      const saved = engine.savingBalance(p.id, today);
      return {
        label: p.label,
        ...(p.targetAmount ? { targetAmount: p.targetAmount } : {}),
        ...(horizon ? { horizonMonths: horizon } : {}),
        ...(saved > 0 ? { alreadySaved: saved } : {}),
        priority: horizon && p.targetAmount ? ('high' as const) : ('medium' as const),
      };
    }),
    wantsPersonalSavings,
    allowInterMemberTopUp,
    ...(preferredMethod !== 'auto' ? { preferredMethod } : {}),
    freeText: freeText.trim(),
  });

  const generate = () => {
    if (!budgetId) return;
    if (people.length === 0) {
      toast({
        title: t.noMembersTitle,
        description: t.noMembersDesc,
        variant: 'destructive',
      });
      return;
    }
    if (freeText.trim().length < 20) {
      toast({
        title: t.describeTitle,
        description: t.describeDesc,
        variant: 'destructive',
      });
      return;
    }

    setElapsed(0);
    startAdvisorJob(budgetId, buildInput());
  };

  // A new proposal starts with the simulator closed and untouched.
  useEffect(() => {
    setEnvOverrides({});
    setSimulating(false);
  }, [proposal]);

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
  // With separate accounts, each member keeps what they do not put in the pot:
  // pocket money and personal savings stay with them, and the proposal's
  // contribution becomes their contribution to the household pot. Otherwise
  // (everything in common), every non-charge line becomes a monthly saving so
  // the whole plan is represented — pocket money included.
  const PERSONAL_TYPES = ['pocket_money', 'personal'];

  const buildSavingsLines = (keepPersonal: boolean): AILine[] => {
    if (!proposal) return [];
    const allocation = proposal.monthlyAllocation ?? [];
    const envelopes = proposal.savingsEnvelopes ?? [];
    const lines = allocation.filter((l) => l.type !== 'common_charge' && (keepPersonal || !PERSONAL_TYPES.includes(l.type)));
    const source =
      allocation.some((l) => l.type !== 'common_charge')
        ? lines.map((l) => ({ name: l.label, amount: l.amount }))
        : envelopes.map((e) => ({ name: e.name, amount: e.monthlyContribution }));
    return source
      .map((s) => ({ label: s.name, amount: Math.round(envOverrides[s.name] ?? s.amount) }))
      .filter((s) => s.amount > 0);
  };

  const buildChargeLines = (): AILine[] => {
    if (!proposal) return [];
    return (proposal.monthlyAllocation ?? [])
      .filter((l) => l.type === 'common_charge')
      .map((l) => ({ label: l.label, amount: Math.round(l.amount), category: l.category || 'autre' }))
      .filter((l) => l.amount > 0);
  };

  /** Contributions from the proposal, when they are usable and cover the pot. */
  const proposalContributions = (potTotal: number): Record<string, ContributionRule> | null => {
    if (!proposal || proposal.accountStructure !== 'three_accounts') return null;
    const rules: Record<string, ContributionRule> = {};
    let total = 0;
    for (const p of people) {
      const m = proposal.perMember.find((x) => x.memberId === p.id);
      const v = Number(m?.monthlyContribution);
      if (!m || !Number.isFinite(v) || v < 0) return null;
      rules[p.id] = { mode: 'fixed', value: Math.round(v) };
      total += Math.round(v);
    }
    return total > 0 && total >= potTotal * 0.99 ? rules : null;
  };

  // Applies the proposal to the CURRENT budget, from the first open month on.
  // Earlier months (and every closed month) keep their amounts.
  const applyProposal = () => {
    if (!proposal) return;
    const isFresh = charges.length === 0 && projects.length === 0;
    const chargeLines = buildChargeLines();
    const commonSavings = buildSavingsLines(false);
    const potTotal = [...chargeLines, ...commonSavings].reduce((s, l) => s + l.amount, 0);
    const rules = proposalContributions(potTotal);
    const savingLines = rules ? commonSavings : buildSavingsLines(true);

    if (chargeLines.length === 0 && savingLines.length === 0) {
      toast({
        title: t.unusableTitle,
        description: t.unusableDesc,
        variant: 'destructive',
      });
      return;
    }

    setUndoModel(model);
    commit(
      (m) => {
        let next = mergeProposal(m, chargeLines, savingLines, start, today, (ym) => engine.isClosed(ym));
        if (rules) next = applyContributionRules(next, start, rules, today);
        return next;
      },
      { saveNow: true, undoable: false },
    );
    setAppliedSummary({ charges: chargeLines.length, projects: savingLines.length, isFresh, contributions: !!rules });
    setApplied(true);
    if (budgetId) clearAdvisorJob(budgetId);
  };

  const undoApply = () => {
    if (!undoModel) return;
    const previous = undoModel;
    commit(() => previous, { saveNow: true, undoable: false });
    setUndoModel(null);
    toast({ title: t.undoneTitle, description: t.undoneDesc });
  };

  const reject = () => {
    if (budgetId) clearAdvisorJob(budgetId);
    toast({ title: t.rejectedTitle, description: t.rejectedDesc });
  };

  // Members come straight from the budget (People tab); labels resolve from there.
  const memberLabel = (id: string): string => people.find((p) => p.id === id)?.name || id;

  // =====================================================================
  // RENDER
  // =====================================================================
  if (view === 'loading' && job?.status === 'running') {
    const timeIndex = LOADING_STEPS.reduce((acc, step, i) => (elapsed >= step.at ? i : acc), 0);
    const currentIndex = job.live ? Math.max(0, LOADING_STEPS.findIndex((st) => st.key === job.stage)) : timeIndex;
    const progress = Math.round(((currentIndex + 0.5) / LOADING_STEPS.length) * 100);
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center py-12 gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">{t.building}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{t.elapsed(elapsed)}</p>
            {job.attempt > 1 && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t.retrying}
              </p>
            )}
          </div>
          <div
            className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={t.progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-700 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <ol className="w-full max-w-sm space-y-2.5" aria-live="polite">
            {LOADING_STEPS.map((step, i) => {
              const done = i < currentIndex;
              const current = i === currentIndex;
              return (
                <li
                  key={step.key}
                  className={`flex items-start gap-2.5 text-sm transition-colors ${
                    done || current ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}
                  aria-current={current ? 'step' : undefined}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  ) : current ? (
                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
                  ) : (
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-muted-foreground/30" aria-hidden="true" />
                  )}
                  <span>
                    {t.steps[step.key]}
                    {step.key === 'method' && job.method && (
                      <span className="block text-xs font-medium text-primary">→ {t.methods[job.method]}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="max-w-sm text-center text-xs text-muted-foreground">
            {t.switchTabs}
          </p>
          <Button variant="ghost" size="sm" onClick={() => budgetId && clearAdvisorJob(budgetId)}>
            <X className="h-4 w-4 mr-1" aria-hidden="true" /> {t.cancel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (view === 'error' && job?.status === 'error') {
    const retry = () => budgetId && retryAdvisorJob(budgetId);
    const edit = () => budgetId && clearAdvisorJob(budgetId);
    return (
      <Card className="border-red-200">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div role="alert">
            <p className="font-medium">{t.errorTitles[job.code] ?? t.errorTitle}</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">{job.message}</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant={job.retryable ? 'outline' : 'default'} onClick={edit}>{t.editRequest}</Button>
            <Button variant={job.retryable ? 'default' : 'outline'} onClick={retry}>
              <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" /> {t.retry}
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
            <p className="font-medium">{fresh ? t.created : t.updated}</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {t.appliedSummary(appliedSummary?.charges || 0, appliedSummary?.projects || 0, !!fresh, formatMonthLong(start), !!appliedSummary?.contributions)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => goToMonth(start)}>
              <CalendarDays className="h-4 w-4 mr-1" /> {t.seeMonth}
            </Button>
            <Button variant="outline" onClick={() => budgetId && navigate(`/budget/${budgetId}/complete/projects`)}>
              <PiggyBank className="h-4 w-4 mr-1" /> {t.seeSavings}
            </Button>
            <Button variant="ghost" onClick={() => { undoApply(); setAppliedSummary(null); setApplied(false); }}>
              <RotateCcw className="h-4 w-4 mr-1" /> {t.undo}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === 'result' && proposal) {
    const feas = proposal.feasibility;
    // The proposal was built from the budget as it was then: say so if the
    // household, incomes, charges or goals changed since.
    const budgetPart = (i: HouseholdInput) => JSON.stringify([i.members, i.charges, i.objectives]);
    const stale = job?.status === 'done' && budgetPart(job.input) !== budgetPart(buildInput());
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {stale && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="status">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{t.stale}</span>
            <Button size="sm" variant="outline" onClick={generate}>
              <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" /> {t.regenerate}
            </Button>
          </div>
        )}
        {/* Undo bar */}
        {undoModel !== null && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <span>{t.appliedBar}</span>
            <Button size="sm" variant="ghost" onClick={undoApply}>
              <RotateCcw className="h-4 w-4 mr-1" /> {t.undo}
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
              {feas.status === 'infeasible' ? t.infeasible : t.tight}
              {feas.bindingMemberId && (
                <span className="font-normal text-muted-foreground">
                  {t.bindingMember(memberLabel(feas.bindingMemberId))}
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
                <span className="font-medium flex items-center gap-1"><Lightbulb className="h-4 w-4" /> {t.levers}</span>
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
              <Sparkles className="h-5 w-5 text-primary" /> {t.proposalTitle}
              <Badge variant="secondary" className="ml-auto text-[11px]">{t.methods[proposal.methodChosen] ?? proposal.methodChosen}</Badge>
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.badge}`}>{t.feasibility[m.feasibility]}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Stat label={t.contribution} value={t.amount(m.monthlyContribution, sym)} />
                  <Stat label={t.pocketMoney} value={t.amount(m.pocketMoney, sym)} />
                  <Stat label={t.resteAVivre} value={t.amount(m.resteAVivre, sym)} />
                  <Stat label={t.personalSavings} value={t.amount(m.personalSavingsCapacity, sym)} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ALLOCATION TABLE */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wallet className="h-4 w-4" /> {t.monthlyAllocation}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">{t.item}</th>
                    <th className="text-right px-3 py-2">{t.amountHeader}</th>
                    <th className="text-left px-3 py-2 hidden sm:table-cell">{t.fundedBy}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {proposal.monthlyAllocation.map((l, k) => (
                    <tr key={k}>
                      <td className="px-3 py-2">
                        <div className="font-medium">{l.label}</div>
                        {l.notes && <div className="text-[11px] text-muted-foreground">{l.notes}</div>}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold whitespace-nowrap">{t.amount(l.amount, sym)}</td>
                      <td className="px-3 py-2 hidden sm:table-cell text-xs text-muted-foreground">
                        {l.fundedBy.map((f) => `${memberLabel(f.memberId)}: ${t.amount(f.amount, sym, true)}`).join(' · ')}
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
            <CardTitle className="text-sm flex items-center gap-2"><PiggyBank className="h-4 w-4" /> {t.envelopes}</CardTitle>
            <Button size="sm" variant={simulating ? 'default' : 'outline'} onClick={() => setSimulating((s) => !s)}>
              <SlidersHorizontal className="h-4 w-4 mr-1" /> {t.simulator}
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
                      <span className="font-mono font-semibold">{t.amount(val, sym)}</span>
                      <span className="text-[10px] text-muted-foreground block">{t.perMonth}</span>
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
                <span className="text-muted-foreground">{t.totalSavings}</span>
                <span className="font-mono font-semibold">
                  {t.amount(totalSavings, sym)}
                  {savingsDelta !== 0 && (
                    <span className={savingsDelta > 0 ? 'text-emerald-600 ml-2' : 'text-amber-600 ml-2'}>
                      {t.savingsDelta(savingsDelta, sym)}
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
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">{t.assumptions}</CardTitle></CardHeader>
                <CardContent><ul className="list-disc pl-4 text-sm space-y-1">{proposal.assumptionsMade.map((a, k) => <li key={k}>{a}</li>)}</ul></CardContent>
              </Card>
            )}
            {proposal.openQuestions.length > 0 && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {t.openQuestions}</CardTitle></CardHeader>
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
                  <div className="font-medium mb-1">{t.lifeEvents}</div>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">{proposal.lifeEventNotes.map((n, k) => <li key={k}>{n}</li>)}</ul>
                </div>
              )}
              {proposal.variableIncomePolicy && (
                <p className="text-muted-foreground"><span className="font-medium text-foreground">{t.variableIncome}</span> {proposal.variableIncomePolicy}</p>
              )}
              {proposal.separationHandling?.note && (
                <p className="text-muted-foreground"><span className="font-medium text-foreground">{t.separation}</span> {proposal.separationHandling.note}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* DISCLAIMER */}
        <p className="text-[11px] text-muted-foreground italic border-l-2 border-border pl-3">{proposal.disclaimer}</p>

        {/* ACTIONS */}
        <p className="text-[11px] text-muted-foreground text-center">
          {charges.length > 0 || projects.length > 0 ? (
            t.applyMerge(formatMonthLong(start))
          ) : (
            t.applyFill(formatMonthLong(start))
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sticky bottom-2 bg-background/80 backdrop-blur rounded-xl p-2 border border-border">
          <Button className="flex-1" onClick={applyProposal} disabled={feas.status === 'infeasible'}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> {t.apply}
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => setSimulating(true)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> {t.openSimulator}
          </Button>
          <Button className="flex-1" variant="ghost" onClick={reject}>
            <XCircle className="h-4 w-4 mr-1" /> {t.reject}
          </Button>
        </div>
        {feas.status === 'infeasible' && (
          <p className="text-xs text-red-600 text-center -mt-2">{t.infeasibleHint}</p>
        )}
      </div>
    );
  }

  // ---- INTAKE ----
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-primary" /> {t.intakeTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t.intakeIntro}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Household type + options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ai-household-type" className="text-xs">{t.householdType}</Label>
              <Select value={householdType} onValueChange={(v) => setHouseholdType(v as HouseholdType)}>
                <SelectTrigger id="ai-household-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="couple">{t.householdTypes.couple}</SelectItem>
                  <SelectItem value="family">{t.householdTypes.family}</SelectItem>
                  <SelectItem value="friends">{t.householdTypes.friends}</SelectItem>
                  <SelectItem value="roommates">{t.householdTypes.roommates}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-method" className="text-xs">{t.preferredMethod}</Label>
              <Select value={preferredMethod} onValueChange={(v) => setPreferredMethod(v as Method | 'auto')}>
                <SelectTrigger id="ai-method"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{t.letAIChoose}</SelectItem>
                  <SelectItem value="prorata">{t.methods.prorata}</SelectItem>
                  <SelectItem value="equal">{t.methods.equal}</SelectItem>
                  <SelectItem value="equalized_reste">{t.methods.equalized_reste}</SelectItem>
                  <SelectItem value="all_common">{t.methods.all_common}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between rounded-lg border border-border/60 p-3 cursor-pointer">
              <span className="text-sm">{t.personalSavingsQuestion}</span>
              <Switch checked={wantsPersonalSavings} onCheckedChange={setWantsPersonalSavings} />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border/60 p-3 cursor-pointer">
              <span className="text-sm">{t.topUpQuestion}</span>
              <Switch checked={allowInterMemberTopUp} onCheckedChange={setAllowInterMemberTopUp} />
            </label>
          </div>

          {/* Member setup — only when the budget has no members yet */}
          {memberSetup && (
            <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Label className="text-sm font-medium">{t.membersTitle}</Label>
              <p className="text-[11px] text-muted-foreground -mt-1">
                {t.emptyBudget}
              </p>
              {people.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-md bg-background border border-border/50 px-3 py-2">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono">{t.amount(resolvePerson(p, start)?.salary ?? p.salary ?? 0, sym)}</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeBudgetMember(p.id)} className="h-7 w-7 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{t.name}</Label>
                  <Input
                    name="member-name"
                    autoComplete="off"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBudgetMember())}
                    placeholder="Alex"
                    className="h-9"
                  />
                </div>
                <div className="w-full sm:w-36 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{t.salary(sym)}</Label>
                  <Input
                    name="member-salary"
                    autoComplete="off"
                    type="number"
                    inputMode="decimal"
                    value={newMemberSalary}
                    onChange={(e) => setNewMemberSalary(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBudgetMember())}
                    placeholder="2500"
                    className="h-9 font-mono"
                  />
                </div>
                <Button type="button" onClick={addBudgetMember} disabled={!newMemberName.trim()} className="h-9 gap-1">
                  <Plus className="h-4 w-4" /> {t.add}
                </Button>
              </div>
            </div>
          )}

          {/* Free text — the primary input */}
          <div className="space-y-1.5">
            <Label htmlFor="ai-free-text" className="text-sm font-medium">{t.freeTextLabel}</Label>
            <Textarea
              id="ai-free-text"
              name="situation"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={8}
              placeholder={t.freeTextPlaceholder}
            />
            <p className="text-[11px] text-muted-foreground">
              {t.freeTextHint}
            </p>
          </div>

          {/* Transparency: the AI also uses the budget's own data */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            {t.dataUsed(people.length, charges.length, projects.length, (text) => <span className="font-medium text-foreground">{text}</span>)}
            {memberSetup
              ? t.refineLater
              : t.noRetype}
          </div>

          <Button onClick={generate} className="w-full" size="lg" disabled={people.length === 0}>
            <Sparkles className="h-4 w-4 mr-2" /> {t.generate}
          </Button>
          {people.length === 0 && (
            <p className="text-xs text-muted-foreground text-center -mt-2">
              {t.addMemberFirst}
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
