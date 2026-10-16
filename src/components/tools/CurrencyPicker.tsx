// src/components/tools/CurrencyPicker.tsx
// Currency of the free calculators: from the time zone or the browser's
// region at first, then the visitor's choice, remembered on this device and
// shared by every calculator of the language (choose once). French pages offer
// the euro and the currencies of French-speaking Africa, Switzerland and
// Canada; English pages the dollar, the pound, the euro and the currencies of
// English-speaking Africa and Asia (src/i18n/format.ts).

import { useEffect, useMemo, useState } from 'react';
import { CURRENCIES_BY_LOCALE, currencyFromBrowser, currencyOf, formatOf, type CurrencyCode } from '@/i18n/format';
import type { Locale } from '@/i18n/locales';

const KEY: Record<Locale, string> = { en: 'bf:en:currency', fr: 'bf:fr:currency' };

function initial(locale: Locale): CurrencyCode {
  try {
    const saved = localStorage.getItem(KEY[locale]) as CurrencyCode | null;
    if (saved && CURRENCIES_BY_LOCALE[locale].includes(saved)) return saved;
  } catch {
    // Blocked storage: fall back on the browser.
  }
  return currencyFromBrowser(locale);
}

export function useCurrency(locale: Locale = 'en') {
  const [code, setCode] = useState<CurrencyCode>(() => initial(locale));
  useEffect(() => {
    try {
      localStorage.setItem(KEY[locale], code);
    } catch {
      // Private mode: the choice lasts for the visit.
    }
  }, [code, locale]);
  const format = useMemo(() => formatOf(code, locale), [code, locale]);
  return { code, setCode, currency: currencyOf(code), format };
}

export function CurrencyPicker({ value, onChange, locale = 'en' }: { value: CurrencyCode; onChange: (c: CurrencyCode) => void; locale?: Locale }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <label htmlFor="currency" className="font-medium text-foreground">{locale === 'en' ? 'Currency' : 'Devise'}</label>
      <select
        id="currency"
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="h-11 min-w-0 max-w-[65%] rounded-xl border border-input bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      >
        {CURRENCIES_BY_LOCALE[locale].map((code) => {
          const c = currencyOf(code);
          return <option key={code} value={code}>{locale === 'en' ? c.label : c.labelFr}</option>;
        })}
      </select>
    </div>
  );
}
