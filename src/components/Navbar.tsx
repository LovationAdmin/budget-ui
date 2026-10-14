// src/components/Navbar.tsx
// ============================================================================
// 🎯 Public Navbar — fixes P0 #5 (currentSection covers all paths)
// ============================================================================

import { useState, useMemo } from 'react';
import { BudgetNavbar, NavItem } from './budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { alternatesOf, localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';
import {
  LayoutDashboard,
  Newspaper,
  Sparkles,
  HelpCircle,
  Crown,
  Home,
  User,
} from 'lucide-react';

const NAV_MESSAGES = defineMessages({
  fr: { home: 'Accueil', features: 'Fonctionnalités', smartTools: 'Outils IA', premium: 'Premium', blog: 'Blog', help: 'Aide', dashboard: 'Mes Budgets' },
  en: { home: 'Home', features: 'Features', smartTools: 'AI tools', premium: 'Premium', blog: 'Blog', help: 'Help', dashboard: 'My budgets' },
});

/** French path of each section; localizedPath gives the page in the screen's language when it exists. */
const ROUTE_MAP: Record<string, string> = {
  home: '/',
  dashboard: '/dashboard',
  features: '/features',
  'smart-tools': '/outils-ia',
  blog: '/blog',
  help: '/help',
  about: '/about',
  premium: '/premium',
  privacy: '/privacy',
  terms: '/terms',
  profile: '/profile',
};

/** The section a path belongs to, whatever its language. */
function sectionOf(path: string, signedIn: boolean): string | undefined {
  const fr = alternatesOf(path)?.fr ?? path;
  if (fr === '/') return signedIn ? 'dashboard' : 'home';
  if (fr === '/dashboard' || fr.startsWith('/budget/')) return 'dashboard';
  if (fr === '/smart-tools' || fr === '/outils-ia') return 'smart-tools';
  if (fr === '/blog' || fr.startsWith('/blog/') || fr.startsWith('/en/blog')) return 'blog';
  const section = Object.entries(ROUTE_MAP).find(([, route]) => route === fr)?.[0];
  return section && section !== 'home' ? section : undefined;
}

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const t = useT(NAV_MESSAGES);
  const locale = useLocale();
  const activeItems = useMemo<NavItem[]>(
    () => [
      user
        ? { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard }
        : { id: 'home', label: t.home, icon: Home },
      { id: 'features', label: t.features, icon: Sparkles },
      { id: 'smart-tools', label: t.smartTools, icon: Sparkles },
      { id: 'premium', label: t.premium, icon: Crown },
      { id: 'blog', label: t.blog, icon: Newspaper },
      { id: 'help', label: t.help, icon: HelpCircle },
    ],
    [user, t]
  );

  const handleSectionChange = (section: string) => {
    const route = ROUTE_MAP[section];
    if (route) {
      navigate(localizedPath(route, locale));
      setMenuOpen(false);
    }
  };

  return (
    <BudgetNavbar
      budgetTitle="Budget Famille"
      userName={user?.name}
      userAvatar={user?.avatar}
      items={activeItems}
      currentSection={sectionOf(location.pathname, !!user)}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(!menuOpen)}
      onSectionChange={handleSectionChange}
    />
  );
}
