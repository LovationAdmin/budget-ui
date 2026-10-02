// src/components/theme/AppThemeProvider.tsx
// ============================================================================
// Light / dark / system theme for the signed-in app (dashboard, budgets,
// profile, admin). Public pages (landing, blog, legal, auth) are designed for
// light only and stay light. The choice is stored in localStorage (`theme`);
// index.html applies it before the first paint to avoid a flash.
// ============================================================================

import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from 'next-themes';

/** Routes that follow the user's theme. Keep in sync with the script in index.html. */
export const THEMED_ROUTES = /^\/(dashboard|budget|profile|admin|beta2)(\/|$)/;

const THEME_COLOR = { light: '#FCFAF8', dark: '#121317' } as const;

function ThemeColorSync() {
  const { resolvedTheme, forcedTheme } = useTheme();
  const theme = (forcedTheme ?? resolvedTheme) === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);
  return null;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      forcedTheme={THEMED_ROUTES.test(pathname) ? undefined : 'light'}
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {children}
    </ThemeProvider>
  );
}
