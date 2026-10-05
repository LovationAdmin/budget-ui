// src/hooks/useSavingsSimulator.ts
// ============================================================================
// Simulateur d'économies IA (page Outils IA + widget de la page d'accueil).
// Fonctionne sans compte : l'API passe alors par l'endpoint public limité.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { Home, Smartphone, Wifi, Zap } from 'lucide-react';
import { budgetAPI, type MarketSuggestion } from '@/services/api';

export const LOCATION_CONFIGS = [
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR', symbol: '€' },
  { code: 'ES', name: 'Espagne', currency: 'EUR', symbol: '€' },
  { code: 'IT', name: 'Italie', currency: 'EUR', symbol: '€' },
  { code: 'BE', name: 'Belgique', currency: 'EUR', symbol: '€' },
  { code: 'CH', name: 'Suisse', currency: 'CHF', symbol: 'CHF' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP', symbol: '£' },
  { code: 'US', name: 'États-Unis', currency: 'USD', symbol: '$' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF', symbol: 'CFA' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', symbol: 'CFA' },
  { code: 'MA', name: 'Maroc', currency: 'MAD', symbol: 'DH' },
];

export const MARKET_CATEGORIES = [
  { id: 'ENERGY', title: 'Électricité & Gaz', icon: Zap, color: 'bg-yellow-500' },
  { id: 'INTERNET', title: 'Internet & Box', icon: Wifi, color: 'bg-blue-500' },
  { id: 'MOBILE', title: 'Forfait Mobile', icon: Smartphone, color: 'bg-purple-500' },
  { id: 'INSURANCE_HOME', title: 'Assurance Habitation', icon: Home, color: 'bg-green-500' },
];

export const MAX_DESCRIPTION_LENGTH = 50;

/** Message shown while the analysis runs, by elapsed seconds. */
export function loadingMessage(elapsed: number, countryName: string): string {
  if (elapsed < 6) return `L'IA analyse le marché ${countryName === 'France' ? 'français' : `(${countryName})`}…`;
  if (elapsed < 15) return 'Comparaison des offres équivalentes à la vôtre…';
  return 'Encore quelques secondes…';
}

function errorMessage(err: unknown): string {
  const e = err as AxiosError<{ error?: string; retry_after?: number }>;
  if (e?.response?.status === 429) {
    const minutes = Math.max(1, Math.ceil((e.response.data?.retry_after ?? 600) / 60));
    const signedIn = !!localStorage.getItem('user');
    return `Vous avez atteint la limite d'analyses gratuites. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}${
      signedIn ? ', ou analysez vos charges depuis votre budget (onglet Charges).' : ', ou créez un compte gratuit pour analyser toutes vos charges.'
    }`;
  }
  if (e?.response?.data?.error && e.response.status !== 404) return e.response.data.error;
  if (!e?.response) return 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
  return "Le service d'analyse est momentanément indisponible. Réessayez dans un instant.";
}

export function useSavingsSimulator() {
  const [category, setCategoryState] = useState('ENERGY');
  const [currentAmount, setCurrentAmount] = useState('');
  const [householdSize, setHouseholdSize] = useState('4');
  const [description, setDescription] = useState('');
  const [locationCode, setLocationCode] = useState('FR');

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
      setFieldError({ field: 'amount', message: 'Indiquez ce que vous payez chaque mois, par exemple 140.' });
      return 'amount';
    }
    if (!(people >= 1 && people <= 20)) {
      setFieldError({ field: 'household', message: 'Indiquez un nombre de personnes entre 1 et 20.' });
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
      });
      if (id !== request.current) return null;
      setResult(res.data);
      setStatus('done');
    } catch (err) {
      if (id !== request.current) return null;
      setError(errorMessage(err));
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
    config, amount,
    status, error, result, elapsed, fieldError,
    canAnalyze, analyze,
  };
}

/** Monthly saving for the whole household (server savings are yearly). */
export function monthlySaving(potentialSavingsYearly: number): number {
  return potentialSavingsYearly / 12;
}

export function formatMoney(value: number, symbol: string, currency: string): string {
  const cents = Math.round(value * 100) % 100 !== 0;
  const digits = currency === 'XOF' || !cents ? 0 : 2;
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}\u00a0${symbol}`;
}
