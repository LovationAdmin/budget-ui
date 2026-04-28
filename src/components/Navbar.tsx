// src/components/Navbar.tsx
// ============================================================================
// 🎯 Public Navbar — fixes P0 #5 (currentSection covers all paths)
// ============================================================================

import { useState, useMemo } from 'react';
import { BudgetNavbar, NavItem } from './budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Sparkles,
  HelpCircle,
  Crown,
  Home,
  User,
} from 'lucide-react';

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'features', label: 'Fonctionnalités', icon: Sparkles },
  { id: 'smart-tools', label: 'Outils IA', icon: Sparkles },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'blog', label: 'Blog', icon: Newspaper },
  { id: 'help', label: 'Aide', icon: HelpCircle },
];

const AUTHENTICATED_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Mes Budgets', icon: LayoutDashboard },
  { id: 'features', label: 'Fonctionnalités', icon: Sparkles },
  { id: 'smart-tools', label: 'Outils IA', icon: Sparkles },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'blog', label: 'Blog', icon: Newspaper },
  { id: 'help', label: 'Aide', icon: HelpCircle },
];

const ROUTE_MAP: Record<string, string> = {
  home: '/',
  dashboard: '/dashboard',
  features: '/features',
  'smart-tools': '/smart-tools',
  blog: '/blog',
  help: '/help',
  about: '/about',
  premium: '/premium',
  privacy: '/privacy',
  terms: '/terms',
  profile: '/profile',
};

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeItems = useMemo(
    () => (user ? AUTHENTICATED_NAV_ITEMS : PUBLIC_NAV_ITEMS),
    [user]
  );

  // 🎯 Fix P0 #5: cover ALL public paths so the navbar never has a stale active state
  const getCurrentSection = (): string | undefined => {
    const path = location.pathname;

    if (path === '/') return user ? 'dashboard' : 'home';
    if (path === '/dashboard' || path.startsWith('/budget/')) return 'dashboard';
    if (path === '/features') return 'features';
    if (path === '/smart-tools' || path === '/outils-ia') return 'smart-tools';
    if (path === '/blog' || path.startsWith('/blog/')) return 'blog';
    if (path === '/help') return 'help';
    if (path === '/about') return 'about';
    if (path === '/premium') return 'premium';
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    if (path === '/profile') return 'profile';
    if (path === '/login' || path === '/signup') return undefined;
    if (path.startsWith('/forgot-password') || path.startsWith('/reset-password')) {
      return undefined;
    }
    if (path.startsWith('/verify-email') || path.startsWith('/invitation')) {
      return undefined;
    }

    return undefined;
  };

  const handleSectionChange = (section: string) => {
    const route = ROUTE_MAP[section];
    if (route) {
      navigate(route);
      setMenuOpen(false);
    }
  };

  return (
    <BudgetNavbar
      budgetTitle="Budget Famille"
      userName={user?.name}
      userAvatar={user?.avatar}
      items={activeItems}
      currentSection={getCurrentSection()}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(!menuOpen)}
      onSectionChange={handleSectionChange}
    />
  );
}
