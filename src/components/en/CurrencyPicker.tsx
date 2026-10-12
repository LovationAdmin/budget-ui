// src/components/en/CurrencyPicker.tsx
// Currency of the English calculators: from the browser's region at first,
// then the visitor's choice, remembered on this device and shared by every
// English page (choose once).

import { useEffect, useMemo, useState } from 'react';
import { CURRENCIES, currencyFromBrowser, currencyOf, formatEn, type CurrencyCode } from '@/i18n/format';

const KEY = 'bf:en:currency';

function initial(): CurrencyCode {
  try {
    const saved = localStorage.getItem(KEY);
    if (CURRENCIES.some((c) => c.code === saved)) return saved as CurrencyCode;
  } catch {
    // Blocked storage: fall back on the browser's region.
  }
  return currencyFromBrowser();
}

export function useCurrency() {
  const [code, setCode] = useState<CurrencyCode>(initial);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, code);
    } catch {
      // Private mode: the choice lasts for the visit.
    }
  }, [code]);
  const format = useMemo(() => formatEn(code), [code]);
  return { code, setCode, currency: currencyOf(code), format };
}

export function CurrencyPicker({ value, onChange }: { value: CurrencyCode; onChange: (c: CurrencyCode) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <label htmlFor="currency" className="font-medium text-foreground">Currency</label>
      <select
        id="currency"
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="h-11 rounded-xl border border-input bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      >
        {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
      </select>
    </div>
  );
}
