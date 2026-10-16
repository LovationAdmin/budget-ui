// src/components/theme/ThemeMenu.tsx
// Appearance picker (system / light / dark) shown in the user menus.

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { defineMessages, useT } from '@/i18n/runtime';

export const THEME_OPTIONS = [
  { value: 'system', Icon: Monitor },
  { value: 'light', Icon: Sun },
  { value: 'dark', Icon: Moon },
] as const;

export const THEME_MESSAGES = defineMessages({
  fr: { title: 'Apparence', system: 'Automatique', light: 'Clair', dark: 'Sombre' },
  en: { title: 'Appearance', system: 'Automatic', light: 'Light', dark: 'Dark' },
});

/** next-themes only knows the stored choice after mount. */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Radio items to drop inside an existing DropdownMenuContent. */
export function ThemeMenuItems() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = useT(THEME_MESSAGES);
  return (
    <>
      <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.title}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={mounted ? theme ?? 'system' : 'system'} onValueChange={setTheme}>
        {THEME_OPTIONS.map(({ value, Icon }) => (
          <DropdownMenuRadioItem key={value} value={value} className="min-h-[40px] gap-2">
            <Icon className="h-4 w-4" aria-hidden="true" /> {t[value]}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );
}
