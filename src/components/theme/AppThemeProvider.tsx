// src/components/theme/AppThemeProvider.tsx
// ============================================================================
// Light / dark / system theme for every page: the choice made in the app
// (dashboard, budgets…) follows the user to the public pages (features, blog,
// help…) and back. Stored in localStorage (`theme`); index.html applies it
// before the first paint to avoid a flash.
// ============================================================================

import { useEffect, type ReactNode } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';

const THEME_COLOR = { light: '#FCFAF8', dark: '#121317' } as const;

function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);
  return null;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {children}
    </ThemeProvider>
  );
}
