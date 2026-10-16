// src/hooks/useSavingsSimulator.ts
// ============================================================================
// Simulateur d'économies IA (page Outils IA + widget de la page d'accueil).
// Fonctionne sans compte : l'API passe alors par l'endpoint public limité.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { Home, Smartphone, Wifi, Zap } from 'lucide-react';
import { budgetAPI, type MarketSuggestion } from '@/services/api';
import { money } from '@/lib/budget/format';
import type { Locale } from '@/i18n/locales';
import { defineMessages, useLocale, wordsIn } from '@/i18n/runtime';

export const LOCATION_CONFIGS = [
  { code: 'FR', name: { fr: 'France', en: 'France' }, currency: 'EUR', symbol: '€' },
  { code: 'DE', name: { fr: 'Allemagne', en: 'Germany' }, currency: 'EUR', symbol: '€' },
  { code: 'ES', name: { fr: 'Espagne', en: 'Spain' }, currency: 'EUR', symbol: '€' },
  { code: 'IT', name: { fr: 'Italie', en: 'Italy' }, currency: 'EUR', symbol: '€' },
  { code: 'BE', name: { fr: 'Belgique', en: 'Belgium' }, currency: 'EUR', symbol: '€' },
  { code: 'CH', name: { fr: 'Suisse', en: 'Switzerland' }, currency: 'CHF', symbol: 'CHF' },
  { code: 'GB', name: { fr: 'Royaume-Uni', en: 'United Kingdom' }, currency: 'GBP', symbol: '£' },
  { code: 'US', name: { fr: 'États-Unis', en: 'United States' }, currency: 'USD', symbol: '$' },
  { code: 'CA', name: { fr: 'Canada', en: 'Canada' }, currency: 'CAD', symbol: '$' },
  { code: 'SN', name: { fr: 'Sénégal', en: 'Senegal' }, currency: 'XOF', symbol: 'CFA' },
  { code: 'CI', name: { fr: "Côte d'Ivoire", en: 'Côte d’Ivoire' }, currency: 'XOF', symbol: 'CFA' },
  { code: 'MA', name: { fr: 'Maroc', en: 'Morocco' }, currency: 'MAD', symbol: 'DH' },
];

export const MARKET_CATEGORIES = [
  { id: 'ENERGY', title: { fr: 'Électricité & Gaz', en: 'Electricity & gas' }, icon: Zap, color: 'bg-yellow-500' },
  { id: 'INTERNET', title: { fr: 'Internet & Box', en: 'Home internet' }, icon: Wifi, color: 'bg-blue-500' },
  { id: 'MOBILE', title: { fr: 'Forfait Mobile', en: 'Mobile plan' }, icon: Smartphone, color: 'bg-purple-500' },
  { id: 'INSURANCE_HOME', title: { fr: 'Assurance Habitation', en: 'Home insurance' }, icon: Home, color: 'bg-green-500' },
];

export const MAX_DESCRIPTION_LENGTH = 50;

const M = defineMessages({
  fr: {
    loading: (elapsed: number, country: string, code: string) => {
      if (elapsed < 6) return `L'IA analyse le marché ${code === 'FR' ? 'français' : `(${country})`}…`;
      if (elapsed < 15) return 'Comparaison des offres équivalentes à la vôtre…';
      return 'Encore quelques secondes…';
    },
    limit: (minutes: number, signedIn: boolean) => `Vous avez atteint la limite d'analyses gratuites. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}${
      signedIn ? ', ou analysez vos charges depuis votre budget (onglet Charges).' : ', ou créez un compte gratuit pour analyser toutes vos charges.'
    }`,
    offline: 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
    unavailable: "Le service d'analyse est momentanément indisponible. Réessayez dans un instant.",
    amountMissing: 'Indiquez ce que vous payez chaque mois, par exemple 140.',
    householdInvalid: 'Indiquez un nombre de personnes entre 1 et 20.',
  },
  en: {
    loading: (elapsed: number, country: string) => {
      if (elapsed < 6) return `The AI is analyzing the market (${country})…`;
      if (elapsed < 15) return 'Comparing offers equivalent to yours…';
      return 'Just a few more seconds…';
    },
    limit: (minutes: number, signedIn: boolean) => `You’ve reached the limit of free analyses. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}${
      signedIn ? ', or analyze your bills from your budget (Bills tab).' : ', or create a free account to analyze all your bills.'
    }`,
    offline: 'Can’t reach the server. Check your connection and try again.',
    unavailable: 'The analysis service is temporarily unavailable. Try again in a moment.',
    amountMissing: 'Enter what you pay each month, for example 140.',
    householdInvalid: 'Enter a number of people between 1 and 20.',
  },
});

/** Message shown while the analysis runs, by elapsed seconds. */
export function loadingMessage(elapsed: number, config: (typeof LOCATION_CONFIGS)[number], locale: Locale): string {
  return wordsIn(M, locale).loading(elapsed, wordsIn(config.name, locale), config.code);
}

function errorMessage(err: unknown, locale: Locale): string {
  const t = wordsIn(M, locale);
  const e = err as AxiosError<{ error?: string; retry_after?: number }>;
  if (e?.response?.status === 429) {
    const minutes = Math.max(1, Math.ceil((e.response.data?.retry_after ?? 600) / 60));
    return t.limit(minutes, !!localStorage.getItem('user'));
  }
  if (e?.response?.data?.error && e.response.status !== 404) return e.response.data.error;
  if (!e?.response) return t.offline;
  return t.unavailable;
}

/** The visitor's country when we cover it, else France (French) or the United States (English). */
function defaultLocation(locale: Locale): string {
  const region = typeof navigator !== 'undefined' ? navigator.language.split('-')[1]?.toUpperCase() : undefined;
  if (region && LOCATION_CONFIGS.some((c) => c.code === region)) return region;
  return locale === 'en' ? 'US' : 'FR';
}

export function useSavingsSimulator() {
  const locale = useLocale();
  const t = wordsIn(M, locale);
  const [category, setCategoryState] = useState('ENERGY');
  const [currentAmount, setCurrentAmount] = useState('');
  const [householdSize, setHouseholdSize] = useState('4');
  const [description, setDescription] = useState('');
  const [locationCode, setLocationCode] = useState(() => defaultLocation(locale));

  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  /** Inline validation message for the amount / household fields. */
  const [fieldError, setFieldError] = useState<{ field: 'amount' | 'household'; message: string } | null>(null);
  const [result, setResult] = useState<MarketSuggestion | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const request = useRef(0);

  const config = LOCATION_CONFIGS.find((c) => c.code === locationCode) || LOCATION_CONFIGS[0];
  const amount = parseFloat(currentAmount.replace(',', '.'));
  const people = parseInt(householdSize, 10);
  const canAnalyze = status !== 'loading';

  useEffect(() => {
    if (status !== 'loading') return;
    const started = Date.now();
    setElapsed(0);
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [status]);

  /** Category or country changes drop results (and any answer in flight) that no longer match. */
  const resetResults = () => {
    request.current++;
    setStatus('idle');
    setResult(null);
    setError(null);
  };
  const setCategory = (id: string) => {
    setCategoryState(id);
    resetResults();
  };
  const changeLocation = (code: string) => {
    setLocationCode(code);
    resetResults();
  };

  /** Validates the form; on error, shows it inline and returns the field's id suffix. */
  const validate = (): 'amount' | 'household' | null => {
    if (!(amount > 0)) {
      setFieldError({ field: 'amount', message: t.amountMissing });
      return 'amount';
    }
    if (!(people >= 1 && people <= 20)) {
      setFieldError({ field: 'household', message: t.householdInvalid });
      return 'household';
    }
    setFieldError(null);
    return null;
  };

  /** Runs the analysis; returns the invalid field, if any, so the view can focus it. */
  const analyze = async (): Promise<'amount' | 'household' | null> => {
    if (!canAnalyze) return null;
    const invalid = validate();
    if (invalid) return invalid;
    const id = ++request.current;
    setStatus('loading');
    setError(null);
    setResult(null);
    try {
      const res = await budgetAPI.analyzeSingleCharge({
        category,
        current_amount: amount,
        household_size: people,
        description: description.trim(),
        country: config.code,
        currency: config.currency,
        language: locale,
      });
      if (id !== request.current) return null;
      setResult(res.data);
      setStatus('done');
    } catch (err) {
      if (id !== request.current) return null;
      setError(errorMessage(err, locale));
      setStatus('error');
    }
    return null;
  };

  return {
    category, setCategory,
    currentAmount,
    setCurrentAmount: (v: string) => {
      setCurrentAmount(v);
      if (fieldError?.field === 'amount') setFieldError(null);
    },
    householdSize,
    setHouseholdSize: (v: string) => {
      setHouseholdSize(v);
      if (fieldError?.field === 'household') setFieldError(null);
    },
    description, setDescription,
    locationCode, setLocationCode: changeLocation,
    config, amount, locale,
    status, error, result, elapsed, fieldError,
    canAnalyze, analyze,
  };
}

/** Monthly saving for the whole household (server savings are yearly). */
export function monthlySaving(potentialSavingsYearly: number): number {
  return potentialSavingsYearly / 12;
}

export function formatMoney(value: number, symbol: string, currency: string): string {
  return money(currency === 'XOF' ? Math.round(value) : value, symbol);
}
