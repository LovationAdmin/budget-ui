// src/components/budget/EnhancedSuggestions.tsx
// ============================================================================
// Suggestions d'économies sur les charges (analyse de marché par l'IA).
// L'analyse tourne côté serveur ; chaque charge analysée arrive par WebSocket
// (suggestions_progress) puis le bilan (suggestions_ready). Les résultats
// s'affichent au fil de l'eau et restent en mémoire pour la session.
// ============================================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Users,
  Info,
  AlertTriangle,
} from "lucide-react";
import { budgetAPI, ChargeSuggestion, Competitor, SuggestionsProgress, SuggestionsReady } from '@/services/api';
import { Charge } from '@/utils/importConverter';
import { useNotifications } from '@/contexts/NotificationContext';
import { Globe, Phone, Mail } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedSuggestionsProps {
  budgetId: string;
  charges: Charge[];
  householdSize: number;
  location?: string;
  currency?: string;
}

type Phase = 'idle' | 'analyzing' | 'slow' | 'done' | 'failed';

interface AnalysisResult {
  signature: string;
  suggestions: ChargeSuggestion[];
  failed: number;
  total: number;
  phase: Phase;
}

// ============================================================================
// HELPERS
// ============================================================================

const RELEVANT_CATEGORIES = [
  'ENERGY', 'INTERNET', 'MOBILE', 'INSURANCE',
  'INSURANCE_AUTO', 'INSURANCE_HOME', 'INSURANCE_HEALTH',
  'LOAN', 'BANK',
  'TRANSPORT', 'LEISURE', 'LEISURE_SPORT', 'LEISURE_STREAMING', 'SUBSCRIPTION', 'HOUSING'
];

const INDIVIDUAL_CATEGORIES = ['MOBILE', 'INSURANCE_AUTO', 'INSURANCE_HEALTH', 'TRANSPORT', 'LEISURE_SPORT'];

// ✅ High denomination currencies (no decimals)
const HIGH_DENOMINATION = ['XOF', 'XAF', 'JPY', 'KRW', 'CLP', 'VND', 'HUF'];

// ✅ CONFIG: Minimum Savings Percentage (5%)
const MIN_SAVINGS_PERCENTAGE = 0.05;

/** Without any news from the server for this long, the analysis is "slow". */
const IDLE_WARNING_MS = 45_000;

/** Last result per budget, so coming back to the tab is instant. */
const resultsCache = new Map<string, AnalysisResult>();

function isRelevantCategory(cat: string): boolean {
  return RELEVANT_CATEGORIES.includes(cat.toUpperCase());
}

function isIndividualCategory(cat: string): boolean {
  return INDIVIDUAL_CATEGORIES.includes(cat.toUpperCase());
}

// ✅ HELPER: Get correct symbol for any currency code
function getCurrencySymbol(code?: string): string {
  switch (code) {
    case 'USD': return '$';
    case 'CAD': return '$';
    case 'GBP': return '£';
    case 'CHF': return 'CHF';
    case 'EUR': return '€';
    case 'XOF': return 'CFA';
    case 'MAD': return 'DH';
    default: return '€';
  }
}

// ✅ HELPER: Smart Currency Formatting
function formatCurrency(amount: number, currencyCode: string, symbol: string): string {
  const isHighDenom = HIGH_DENOMINATION.includes(currencyCode);
  const digits = isHighDenom ? 0 : 2;
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}${symbol}`;
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    'ENERGY': '⚡ Énergie',
    'INTERNET': '🌐 Internet',
    'MOBILE': '📱 Mobile',
    'INSURANCE': '🛡️ Assurance',
    'INSURANCE_AUTO': '🚗 Assurance Auto',
    'INSURANCE_HOME': '🏠 Assurance Habitation',
    'INSURANCE_HEALTH': '⚕️ Mutuelle Santé',
    'LOAN': '💸 Prêt / Crédit',
    'BANK': '🏛️ Banque',
    'TRANSPORT': '🚌 Transport',
    'LEISURE': '⚽ Loisirs',
    'LEISURE_SPORT': '💪 Sport / Fitness',
    'LEISURE_STREAMING': '🎬 Streaming',
    'SUBSCRIPTION': '🔄 Abonnement',
    'HOUSING': '🏠 Logement'
  };
  return labels[cat.toUpperCase()] || cat;
}

/**
 * Keeps the offers saving at least 5% of the charge's yearly cost (savings
 * are yearly, for the whole household), best first; null if none is left.
 */
function keepWorthwhile(item: ChargeSuggestion, charges: Charge[]): ChargeSuggestion | null {
  const originalAmount = charges.find(c => c.id === item.charge_id)?.amount ?? 0;
  if (originalAmount <= 0) return null;
  const competitors = item.suggestion.competitors
    .filter(c => c.potential_savings / (originalAmount * 12) >= MIN_SAVINGS_PERCENTAGE)
    .sort((a, b) => b.potential_savings - a.potential_savings);
  return competitors.length > 0 ? { ...item, suggestion: { ...item.suggestion, competitors } } : null;
}

const bestSavings = (s: ChargeSuggestion) => s.suggestion.competitors[0]?.potential_savings || 0;

function sortByBestSavings(list: ChargeSuggestion[]): ChargeSuggestion[] {
  return [...list].sort((a, b) => bestSavings(b) - bestSavings(a));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnhancedSuggestions({
  budgetId,
  charges,
  householdSize,
  location = 'FR',
  currency = 'EUR'
}: EnhancedSuggestionsProps) {
  const relevantCharges = charges.filter(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions);
  const chargesSignature = JSON.stringify(relevantCharges.map(c => ({
    id: c.id,
    label: c.label,
    amount: c.amount,
    category: c.category,
  })));
  const signature = `${budgetId}|${chargesSignature}|${householdSize}|${location}|${currency}`;

  const cached = resultsCache.get(budgetId);
  const fresh = cached?.signature === signature ? cached : undefined;

  const [suggestions, setSuggestions] = useState<ChargeSuggestion[]>(fresh?.suggestions ?? []);
  const [phase, setPhase] = useState<Phase>(fresh?.phase ?? 'idle');
  const [progress, setProgress] = useState({ done: 0, total: fresh?.total ?? 0, failed: fresh?.failed ?? 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const currencySymbol = getCurrencySymbol(currency);
  const lastAnalyzedSignature = useRef<string>(fresh ? signature : '');
  const watchdog = useRef<number>();
  const chargesRef = useRef(charges);
  chargesRef.current = charges;
  const { onSuggestionsReady, onSuggestionsProgress, isConnected } = useNotifications();

  const armWatchdog = useCallback(() => {
    window.clearTimeout(watchdog.current);
    watchdog.current = window.setTimeout(() => {
      setPhase(p => (p === 'analyzing' ? 'slow' : p));
    }, IDLE_WARNING_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(watchdog.current), []);

  // Partial results, one charge at a time.
  useEffect(() => {
    return onSuggestionsProgress((data: SuggestionsProgress) => {
      setProgress({ done: data.done, total: data.total, failed: data.failed });
      setPhase(p => (p === 'slow' ? 'analyzing' : p));
      armWatchdog();
      const item = data.item ? keepWorthwhile(data.item, chargesRef.current) : null;
      if (item) {
        setSuggestions(prev => sortByBestSavings([...prev.filter(s => s.charge_id !== item.charge_id), item]));
      }
    });
  }, [onSuggestionsProgress, armWatchdog]);

  // Final report.
  useEffect(() => {
    return onSuggestionsReady((data: SuggestionsReady) => {
      window.clearTimeout(watchdog.current);
      const final = sortByBestSavings(
        (data.suggestions || [])
          .map(s => keepWorthwhile(s, chargesRef.current))
          .filter((s): s is ChargeSuggestion => s !== null),
      );
      const total = data.total ?? (data.suggestions || []).length;
      const failed = data.failed_count ?? 0;
      const nextPhase: Phase = data.status === 'failed' ? 'failed' : 'done';
      setSuggestions(final);
      setProgress({ done: total, total, failed });
      setPhase(nextPhase);
      resultsCache.set(budgetId, {
        signature: lastAnalyzedSignature.current,
        suggestions: final,
        failed,
        total,
        phase: nextPhase,
      });
    });
  }, [onSuggestionsReady, budgetId]);

  const loadSuggestions = useCallback(async (force = false) => {
    const toAnalyze = chargesRef.current
      .filter(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions)
      .map(c => ({
        id: c.id,
        category: c.category!,
        label: c.label,
        amount: c.amount,
        merchant_name: c.label
      }));
    if (toAnalyze.length === 0) return;

    setPhase('analyzing');
    setProgress({ done: 0, total: toAnalyze.length, failed: 0 });
    armWatchdog();

    try {
      const res = await budgetAPI.bulkAnalyzeSuggestions(budgetId, {
        charges: toAnalyze,
        household_size: householdSize,
        ...(force ? { force: true } : {}),
      });
      const total = res.data?.total;
      if (typeof total === 'number') {
        setProgress(p => ({ ...p, total }));
        if (total === 0) {
          window.clearTimeout(watchdog.current);
          setSuggestions([]);
          setPhase('done');
        }
      }
    } catch (err: any) {
      console.error('❌ [EnhancedSuggestions] Error:', err);
      if (err.code !== 'ERR_CANCELED') {
        window.clearTimeout(watchdog.current);
        setPhase('failed');
      }
    }
  }, [budgetId, householdSize, armWatchdog]);

  // (Re)analyze when the charges, household or location change.
  useEffect(() => {
    if (!isConnected || signature === lastAnalyzedSignature.current) return;
    const timer = window.setTimeout(() => {
      lastAnalyzedSignature.current = signature;
      if (relevantCharges.length > 0) {
        setSuggestions([]);
        loadSuggestions();
      }
    }, 1500);
    return () => window.clearTimeout(timer);
    // relevantCharges is derived from `signature`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isConnected, loadSuggestions]);

  const reanalyze = () => {
    lastAnalyzedSignature.current = signature;
    resultsCache.delete(budgetId);
    setSuggestions([]);
    loadSuggestions(true);
  };

  if (relevantCharges.length === 0) return null;

  const busy = phase === 'analyzing' || phase === 'slow';
  const totalSavings = suggestions.reduce((sum, s) => sum + bestSavings(s), 0);
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  // ---- Nothing found yet: progress, failure or "already optimised" ----
  if (suggestions.length === 0) {
    if (phase === 'idle') return null; // waiting for the live connection
    if (busy) {
      return (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 shrink-0 animate-spin text-blue-600" aria-hidden="true" />
              <div className="min-w-0" aria-live="polite">
                <p className="font-medium text-sm">
                  Recherche d'économies pour {householdSize} personne{householdSize > 1 ? 's' : ''} en {location}…
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {progress.total > 0 ? `${progress.done} / ${progress.total} charge${progress.total > 1 ? 's' : ''} analysée${progress.done > 1 ? 's' : ''}` : 'Préparation de l’analyse'}
                  {phase === 'slow' && ' · l’analyse prend plus de temps que prévu'}
                </p>
              </div>
            </div>
            <ProgressBar pct={pct} />
            {phase === 'slow' && (
              <Button variant="outline" size="sm" onClick={reanalyze}>
                <RefreshCw className="h-4 w-4 mr-1" aria-hidden="true" /> Relancer l'analyse
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    if (phase === 'failed' || progress.failed > 0) {
      const all = phase === 'failed';
      return (
        <Card className={all ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/30'}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1" role={all ? 'alert' : undefined}>
                {all
                  ? <XCircle className="h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
                  : <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" aria-hidden="true" />}
                <div>
                  <p className="font-medium">{all ? "L'analyse des économies n'a pas abouti" : 'Aucune économie trouvée pour le moment'}</p>
                  <p className="text-sm text-muted-foreground">
                    {all
                      ? 'Le service IA est momentanément indisponible. Vos charges ne sont pas en cause.'
                      : `${progress.failed} charge${progress.failed > 1 ? 's n’ont' : ' n’a'} pas pu être analysée${progress.failed > 1 ? 's' : ''}.`}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={reanalyze} className="self-start sm:self-auto">
                <RefreshCw className="h-4 w-4 mr-1" aria-hidden="true" /> Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">🎉 Vous avez déjà d'excellentes offres !</p>
              <p className="text-sm text-green-600">
                Aucune offre équivalente n'est au moins 5 % moins chère que les vôtres.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---- Savings found (possibly still arriving) ----
  const toggle = () => setIsExpanded(e => !e);
  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50/50 transition-colors hover:bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls="savings-list"
              onClick={toggle}
              className="flex flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Sparkles className="h-6 w-6 shrink-0 text-green-600" aria-hidden="true" />
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-2xl font-semibold leading-none tracking-tight font-display text-green-900">💡 Opportunités d'économies</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {suggestions.length}
                  </Badge>
                </span>
                <span className="block text-sm text-green-700 mt-1 tabular-nums" aria-live="polite">
                  {`Économie totale possible : ${formatCurrency(totalSavings, currency, currencySymbol)}/an`}
                  {busy && progress.total > 0 && ` · analyse ${progress.done}/${progress.total}…`}
                </span>
              </span>
              {isExpanded ? <ChevronUp className="h-5 w-5 shrink-0" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />}
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={reanalyze}
              disabled={busy}
              aria-label="Relancer l'analyse"
              title="Relancer l'analyse"
            >
              <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
            </Button>
          </div>
          {busy && <ProgressBar pct={pct} />}
        </CardHeader>
      </Card>

      {isExpanded && (
        <div id="savings-list" className="space-y-2">
          <p className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" aria-hidden="true" />
            Économies calculées pour votre foyer de {householdSize} personne{householdSize > 1 ? 's' : ''}, sur un an.
          </p>
          {progress.failed > 0 && !busy && (
            <p className="px-1 text-xs text-amber-700">
              {progress.failed} charge{progress.failed > 1 ? 's n’ont' : ' n’a'} pas pu être analysée{progress.failed > 1 ? 's' : ''} — relancez l'analyse pour réessayer.
            </p>
          )}
          {suggestions.map((item) => {
            const originalAmount = charges.find(c => c.id === item.charge_id)?.amount ?? 0;
            return (
              <SuggestionCard
                key={item.charge_id}
                chargeSuggestion={item}
                householdSize={householdSize}
                currency={currency}
                currencySymbol={currencySymbol}
                originalAmount={originalAmount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div
      className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-100"
      role="progressbar"
      aria-label="Progression de l'analyse"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div
        className="h-full w-full origin-left rounded-full bg-blue-600 transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${Math.max(pct, 4) / 100})` }}
      />
    </div>
  );
}

// ============================================================================
// SUGGESTION CARD
// ============================================================================

function SuggestionCard({
  chargeSuggestion,
  householdSize,
  currency,
  currencySymbol,
  originalAmount
}: {
  chargeSuggestion: ChargeSuggestion;
  householdSize: number;
  currency: string;
  currencySymbol: string;
  originalAmount: number;
}) {
  const { charge_label, suggestion } = chargeSuggestion;
  const competitors = suggestion.competitors.slice(0, 3);

  const [isOpen, setIsOpen] = useState(false);

  if (competitors.length === 0) return null;

  const bestSavings = competitors[0]?.potential_savings || 0;
  const savingsPercentage = originalAmount > 0 ? (bestSavings / (originalAmount * 12)) * 100 : 0;

  const isIndividual = isIndividualCategory(suggestion.category);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Card className="border-orange-200 hover:border-orange-300 transition-colors">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={toggle}
        className="block w-full p-6 pb-3 text-left hover:bg-orange-50/30 transition-colors rounded-t-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-5 w-5 shrink-0 text-orange-600" aria-hidden="true" />
              <span className="text-lg font-semibold leading-tight tracking-tight font-display truncate">{charge_label}</span>
            </span>
            <span className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
              <span>{getCategoryLabel(suggestion.category)}</span>
              {isIndividual && householdSize > 1 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Users className="h-3 w-3 mr-1" aria-hidden="true" />Prix/personne
                </Badge>
              )}
            </span>
          </span>

          <span className="flex flex-col items-end gap-1">
            <Badge className="bg-green-100 text-green-800 border-green-300 whitespace-nowrap tabular-nums">
                Jusqu'à -{formatCurrency(bestSavings, currency, currencySymbol)}/an
            </Badge>
            {savingsPercentage > 0 && (
                <span className="text-xs font-bold text-green-600 tabular-nums">
                    -{savingsPercentage.toFixed(0)}% d'économie
                </span>
            )}
          </span>
        </span>
      </button>

      {isOpen && (
        <CardContent className="space-y-4 pt-0">
            {isIndividual && householdSize > 1 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Prix analysé par personne. L'économie affichée est pour l'ensemble du foyer ({householdSize} personnes).</span>
            </div>
            )}

            {competitors.map((competitor, index) => (
            <CompetitorCard
                key={index}
                competitor={competitor}
                rank={index + 1}
                currency={currency}
                currencySymbol={currencySymbol}
            />
            ))}
        </CardContent>
      )}
    </Card>
  );
}

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function CompetitorCard({ competitor, rank, currency, currencySymbol }: { competitor: Competitor; rank: number; currency: string; currencySymbol: string }) {
  const getRankBadge = () => {
    if (rank === 1) return <Badge className="bg-green-600 text-white border-0">🏆 Meilleure offre</Badge>;
    if (rank === 2) return <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50">🥈 Alternative #2</Badge>;
    return <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50">🥉 Alternative #3</Badge>;
  };

  const getCardStyle = () => {
    if (rank === 1) return "border-2 border-green-300 bg-green-50/50";
    if (rank === 2) return "border-2 border-orange-200 bg-orange-50/30";
    return "border border-gray-300 bg-gray-50/50";
  };

  const websiteUrl = competitor.affiliate_link || competitor.website_url;

  return (
    <div className={`p-4 rounded-lg ${getCardStyle()}`}>
      <div className="flex items-center justify-between mb-3">
        {getRankBadge()}
        <span className="text-lg font-bold text-green-700">
            -{formatCurrency(competitor.potential_savings, currency, currencySymbol)}/an
        </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{competitor.name}</h4>
      <p className="text-sm text-gray-600 mb-3">{competitor.best_offer}</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Prix :</span>
        <span className="font-semibold text-primary">
            {formatCurrency(competitor.typical_price, currency, currencySymbol)}/mois
        </span>
      </div>

      {(competitor.pros?.length > 0 || competitor.cons?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {competitor.pros?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />Avantages
              </p>
              <ul className="space-y-0.5">
                {competitor.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-gray-600">• {pro}</li>
                ))}
              </ul>
            </div>
          )}
          {competitor.cons?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1">
                <XCircle className="h-3 w-3" aria-hidden="true" />Inconvénients
              </p>
              <ul className="space-y-0.5">
                {competitor.cons.map((con, i) => (
                  <li key={i} className="text-xs text-gray-600">• {con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
        {websiteUrl && (
          <Button
            size="sm"
            className="w-full sm:flex-1 h-10 sm:h-8 text-sm sm:text-xs"
            onClick={() => openExternal(websiteUrl)}
          >
            <Globe className="h-4 w-4 sm:h-3 sm:w-3 mr-2" aria-hidden="true" />
            Voir le site
          </Button>
        )}

        {(competitor.phone_number || competitor.contact_email) && (
          <div className="flex gap-2">
            {competitor.phone_number && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial h-10 sm:h-8 text-sm sm:text-xs"
                asChild
              >
                <a href={`tel:${competitor.phone_number.replace(/\s+/g, '')}`}>
                  <Phone className="h-4 w-4 sm:h-3 sm:w-3 mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">{competitor.phone_number}</span>
                  <span className="sm:hidden">Appeler</span>
                </a>
              </Button>
            )}

            {competitor.contact_email && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial h-10 sm:h-8 text-sm sm:text-xs"
                asChild
              >
                <a href={`mailto:${competitor.contact_email}`}>
                  <Mail className="h-4 w-4 sm:h-3 sm:w-3 mr-1" aria-hidden="true" />
                  Email
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
