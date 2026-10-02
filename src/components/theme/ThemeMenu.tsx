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

export const THEME_OPTIONS = [
  { value: 'system', label: 'Automatique', Icon: Monitor },
  { value: 'light', label: 'Clair', Icon: Sun },
  { value: 'dark', label: 'Sombre', Icon: Moon },
] as const;

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
  return (
    <>
      <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Apparence</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={mounted ? theme ?? 'system' : 'system'} onValueChange={setTheme}>
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuRadioItem key={value} value={value} className="min-h-[40px] gap-2">
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );
}
