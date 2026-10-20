// src/components/Navbar.tsx
// ============================================================================
// 🎯 Public Navbar — fixes P0 #5 (currentSection covers all paths)
// ============================================================================

import { useState, useMemo } from 'react';
import { BudgetNavbar, NavItem } from './budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_LOCALES, LOCALES, alternatesOf, localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';
import {
  LayoutDashboard,
  LayoutGrid,
  Newspaper,
  Sparkles,
  HelpCircle,
  Crown,
  Home,
  User,
  PieChart,
  Users,
  Heart,
  Wallet,
} from 'lucide-react';

const NAV_MESSAGES = defineMessages({
  fr: { home: 'Accueil', features: 'Fonctionnalités', smartTools: 'Outils IA', premium: 'Premium', blog: 'Blog', help: 'Aide', dashboard: 'Mes Budgets' },
  en: { home: 'Home', features: 'Features', smartTools: 'AI tools', premium: 'Premium', blog: 'Blog', help: 'Help', dashboard: 'My budgets' },
  zh: { home: '首页', features: '功能', smartTools: 'AI 工具', premium: '高级版', blog: '博客', help: '帮助', dashboard: '我的预算' },
});

/**
 * Languages with public pages only (Chinese): the bar lists the pages written
 * in it, the free calculators, rather than sections that would open in English.
 */
const PAGES_ONLY_ITEMS: NavItem[] = [
  { id: '/zh/50-30-20-budget-calculator', label: '50/30/20预算', icon: PieChart },
  { id: '/zh/rent-split-calculator', label: '合租分摊', icon: Users },
  { id: '/zh/wedding-budget-calculator', label: '婚礼预算', icon: Heart },
  { id: '/zh/leftover-income-calculator', label: '每月结余', icon: Wallet },
];

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
  // « Ma vue perso » (/overview) is a view of the user's budgets.
  if (fr === '/dashboard' || fr === '/overview' || fr.startsWith('/budget/')) return 'dashboard';
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
  const pagesOnly = !APP_LOCALES.includes(locale);
  const activeItems = useMemo<NavItem[]>(
    () => pagesOnly
      ? [{ id: 'home', label: t.home, icon: Home }, ...PAGES_ONLY_ITEMS]
      : [
        user
          ? { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard }
          : { id: 'home', label: t.home, icon: Home },
        { id: 'features', label: t.features, icon: LayoutGrid },
        { id: 'smart-tools', label: t.smartTools, icon: Sparkles },
        { id: 'premium', label: t.premium, icon: Crown },
        { id: 'blog', label: t.blog, icon: Newspaper },
        { id: 'help', label: t.help, icon: HelpCircle },
      ],
    [user, t, pagesOnly]
  );

  const handleSectionChange = (section: string) => {
    const route = pagesOnly && section === 'home' ? LOCALES[locale].home : section.startsWith('/') ? section : ROUTE_MAP[section];
    if (route) {
      navigate(pagesOnly ? route : localizedPath(route, locale));
      setMenuOpen(false);
    }
  };

  const current = pagesOnly
    ? (location.pathname.replace(/\/+$/, '') === LOCALES[locale].home ? 'home' : location.pathname.replace(/\/+$/, ''))
    : sectionOf(location.pathname, !!user);

  return (
    <BudgetNavbar
      budgetTitle="Budget Famille"
      userName={user?.name}
      userAvatar={user?.avatar}
      items={activeItems}
      currentSection={current}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(!menuOpen)}
      onSectionChange={handleSectionChange}
    />
  );
}
