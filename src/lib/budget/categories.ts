// src/lib/budget/categories.ts
// Charge categories. The codes are the ones the backend categorizer and the
// market-suggestion engine already use (HOUSING, ENERGY, …); CHILDREN and
// TAXES are new, display-only codes (the suggestion engine ignores them).

import type { LucideIcon } from 'lucide-react';
import { defineMessages, pick } from '@/i18n/current';
import {
  Home,
  Zap,
  Wifi,
  Smartphone,
  ShieldCheck,
  Car,
  HeartPulse,
  Shield,
  Landmark,
  Bus,
  ShoppingCart,
  Baby,
  Repeat,
  Tv,
  Dumbbell,
  Ticket,
  Receipt,
  Building2,
  Tag,
} from 'lucide-react';

export interface CategoryMeta {
  code: string;
  label: string;
  icon: LucideIcon;
}

const LABELS = defineMessages({
  fr: {
    HOUSING: 'Logement',
    ENERGY: 'Énergie',
    INTERNET: 'Internet',
    MOBILE: 'Mobile',
    FOOD: 'Alimentation',
    CHILDREN: 'Enfants',
    TRANSPORT: 'Transport',
    INSURANCE_HOME: 'Assurance habitation',
    INSURANCE_AUTO: 'Assurance auto',
    INSURANCE_HEALTH: 'Mutuelle',
    INSURANCE: 'Assurance',
    LOAN: 'Crédit',
    TAXES: 'Impôts et taxes',
    SUBSCRIPTION: 'Abonnement',
    LEISURE_STREAMING: 'Streaming',
    LEISURE_SPORT: 'Sport',
    LEISURE: 'Loisirs',
    BANK: 'Banque',
    OTHER: 'Autre',
  },
  en: {
    HOUSING: 'Housing',
    ENERGY: 'Energy',
    INTERNET: 'Internet',
    MOBILE: 'Phone',
    FOOD: 'Food',
    CHILDREN: 'Children',
    TRANSPORT: 'Transport',
    INSURANCE_HOME: 'Home insurance',
    INSURANCE_AUTO: 'Car insurance',
    INSURANCE_HEALTH: 'Health insurance',
    INSURANCE: 'Insurance',
    LOAN: 'Loan',
    TAXES: 'Taxes',
    SUBSCRIPTION: 'Subscription',
    LEISURE_STREAMING: 'Streaming',
    LEISURE_SPORT: 'Sport',
    LEISURE: 'Leisure',
    BANK: 'Bank',
    OTHER: 'Other',
  },
});

/** A category whose label is read in the screen's language each time it is shown. */
const category = (code: keyof typeof LABELS.fr, icon: LucideIcon): CategoryMeta => ({
  code,
  icon,
  get label() {
    return pick(LABELS)[code];
  },
});

export const CATEGORIES: CategoryMeta[] = [
  category('HOUSING', Home),
  category('ENERGY', Zap),
  category('INTERNET', Wifi),
  category('MOBILE', Smartphone),
  category('FOOD', ShoppingCart),
  category('CHILDREN', Baby),
  category('TRANSPORT', Bus),
  category('INSURANCE_HOME', ShieldCheck),
  category('INSURANCE_AUTO', Car),
  category('INSURANCE_HEALTH', HeartPulse),
  category('INSURANCE', Shield),
  category('LOAN', Landmark),
  category('TAXES', Receipt),
  category('SUBSCRIPTION', Repeat),
  category('LEISURE_STREAMING', Tv),
  category('LEISURE_SPORT', Dumbbell),
  category('LEISURE', Ticket),
  category('BANK', Building2),
  category('OTHER', Tag),
];

const BY_CODE = new Map(CATEGORIES.map((c) => [c.code, c]));

// Free-text categories (e.g. from the AI proposal) mapped by keyword.
const KEYWORDS: Array<[RegExp, string]> = [
  [/(car|auto|motor) insurance/i, 'INSURANCE_AUTO'],
  [/(home|homeowners?|renters?|contents) insurance/i, 'INSURANCE_HOME'],
  [/loyer|logement|habitat|immobili|copro|hous|\brent(al)?\b|mortgage/i, 'HOUSING'],
  [/[ée]nergie|[ée]lectri|gaz|eau|energy|electric|\bgas\b|water|utilit|heating/i, 'ENERGY'],
  [/internet|box|fibre|broadband|wi-?fi/i, 'INTERNET'],
  [/mobile|t[ée]l[ée]phone|phone|\bcell/i, 'MOBILE'],
  [/courses|alimenta|nourriture|food|cantine|grocer|supermarket|meal/i, 'FOOD'],
  [/enfant|cr[èe]che|garde|scola|[ée]cole|child|\bkids?\b|daycare|nursery|school|babysit/i, 'CHILDREN'],
  [/transport|carburant|essence|navigo|voiture|fuel|petrol|gasoline|\bcar\b|\btrains?\b|\bbus\b|subway|commut|parking/i, 'TRANSPORT'],
  [/mutuelle|sant[ée]|health|medical|dental/i, 'INSURANCE_HEALTH'],
  [/assurance|insurance/i, 'INSURANCE'],
  [/cr[ée]dit|pr[êe]t|emprunt|loan|debt/i, 'LOAN'],
  [/imp[ôo]t|taxe|tax/i, 'TAXES'],
  [/streaming|netflix|spotify/i, 'LEISURE_STREAMING'],
  [/abonnement|subscription/i, 'SUBSCRIPTION'],
  [/sport|salle|\bgym\b|fitness/i, 'LEISURE_SPORT'],
  [/loisir|sortie|vacance|leisure|hobb|holiday|vacation|entertainment/i, 'LEISURE'],
  [/banque|bank|frais bancaires/i, 'BANK'],
];

export function categoryMeta(code?: string): CategoryMeta {
  if (!code) return BY_CODE.get('OTHER')!;
  const exact = BY_CODE.get(code.toUpperCase());
  if (exact) return exact;
  for (const [re, target] of KEYWORDS) if (re.test(code)) return BY_CODE.get(target)!;
  const other = BY_CODE.get('OTHER')!;
  return { ...other, label: code.charAt(0).toUpperCase() + code.slice(1).toLowerCase() };
}

/** Categories offered in the editor (the most common first). */
export const PICKER_CATEGORIES = CATEGORIES;
