// src/lib/budget/categories.ts
// Charge categories. The codes are the ones the backend categorizer and the
// market-suggestion engine already use (HOUSING, ENERGY, …); CHILDREN and
// TAXES are new, display-only codes (the suggestion engine ignores them).

import type { LucideIcon } from 'lucide-react';
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

export const CATEGORIES: CategoryMeta[] = [
  { code: 'HOUSING', label: 'Logement', icon: Home },
  { code: 'ENERGY', label: 'Énergie', icon: Zap },
  { code: 'INTERNET', label: 'Internet', icon: Wifi },
  { code: 'MOBILE', label: 'Mobile', icon: Smartphone },
  { code: 'FOOD', label: 'Alimentation', icon: ShoppingCart },
  { code: 'CHILDREN', label: 'Enfants', icon: Baby },
  { code: 'TRANSPORT', label: 'Transport', icon: Bus },
  { code: 'INSURANCE_HOME', label: 'Assurance habitation', icon: ShieldCheck },
  { code: 'INSURANCE_AUTO', label: 'Assurance auto', icon: Car },
  { code: 'INSURANCE_HEALTH', label: 'Mutuelle', icon: HeartPulse },
  { code: 'INSURANCE', label: 'Assurance', icon: Shield },
  { code: 'LOAN', label: 'Crédit', icon: Landmark },
  { code: 'TAXES', label: 'Impôts et taxes', icon: Receipt },
  { code: 'SUBSCRIPTION', label: 'Abonnement', icon: Repeat },
  { code: 'LEISURE_STREAMING', label: 'Streaming', icon: Tv },
  { code: 'LEISURE_SPORT', label: 'Sport', icon: Dumbbell },
  { code: 'LEISURE', label: 'Loisirs', icon: Ticket },
  { code: 'BANK', label: 'Banque', icon: Building2 },
  { code: 'OTHER', label: 'Autre', icon: Tag },
];

const BY_CODE = new Map(CATEGORIES.map((c) => [c.code, c]));

// Free-text categories (e.g. from the AI proposal) mapped by keyword.
const KEYWORDS: Array<[RegExp, string]> = [
  [/loyer|logement|habitat|immobili|copro|hous/i, 'HOUSING'],
  [/[ée]nergie|[ée]lectri|gaz|eau|energy/i, 'ENERGY'],
  [/internet|box|fibre/i, 'INTERNET'],
  [/mobile|t[ée]l[ée]phone/i, 'MOBILE'],
  [/courses|alimenta|nourriture|food|cantine/i, 'FOOD'],
  [/enfant|cr[èe]che|garde|scola|[ée]cole|child/i, 'CHILDREN'],
  [/transport|carburant|essence|navigo|voiture/i, 'TRANSPORT'],
  [/mutuelle|sant[ée]|health/i, 'INSURANCE_HEALTH'],
  [/assurance|insurance/i, 'INSURANCE'],
  [/cr[ée]dit|pr[êe]t|emprunt|loan/i, 'LOAN'],
  [/imp[ôo]t|taxe|tax/i, 'TAXES'],
  [/streaming|netflix|spotify/i, 'LEISURE_STREAMING'],
  [/abonnement|subscription/i, 'SUBSCRIPTION'],
  [/sport|salle/i, 'LEISURE_SPORT'],
  [/loisir|sortie|vacance|leisure/i, 'LEISURE'],
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
