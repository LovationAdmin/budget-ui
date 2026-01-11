// src/components/Navbar.tsx
// ✅ VERSION AMÉLIORÉE - Navigation différente selon authentification

import { useState, useMemo } from 'react';
import { BudgetNavbar, NavItem } from "./budget/BudgetNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  Newspaper,
  Sparkles,
  HelpCircle,
  Shield,
  FileText,
  Crown,
  Info,
  Home
} from "lucide-react";

// ============================================================================
// 🎯 NAVIGATION ITEMS - PUBLICS (visibles par tous)
// ============================================================================
const PUBLIC_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: Home,
  },
  {
    id: 'features',
    label: 'Fonctionnalités',
    icon: Sparkles,
  },
  {
    id: 'smart-tools',
    label: 'Outils IA',
    icon: Sparkles,
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: Crown,
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: Newspaper,
  },
  {
    id: 'help',
    label: 'Aide',
    icon: HelpCircle,
  },
];

// ============================================================================
// 🎯 NAVIGATION ITEMS - AUTHENTIFIÉS (visibles si connecté)
// ============================================================================
const AUTHENTICATED_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Mes Budgets',
    icon: LayoutDashboard,
  },
  {
    id: 'features',
    label: 'Fonctionnalités',
    icon: Sparkles,
  },
  {
    id: 'smart-tools',
    label: 'Outils IA',
    icon: Sparkles,
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: Crown,
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: Newspaper,
  },
  {
    id: 'help',
    label: 'Aide',
    icon: HelpCircle,
  },
];

// ============================================================================
// 🎯 ITEMS FOOTER (pour pages légales - moins prioritaires)
// ============================================================================
const FOOTER_NAV_ITEMS: NavItem[] = [
  {
    id: 'about',
    label: 'À propos',
    icon: Info,
  },
  {
    id: 'privacy',
    label: 'Confidentialité',
    icon: Shield,
  },
  {
    id: 'terms',
    label: 'Conditions',
    icon: FileText,
  },
];

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ SÉLECTION DYNAMIQUE des items selon l'authentification
  const activeItems = useMemo(() => {
    // Utilisateur connecté : montrer "Mes Budgets" en premier
    if (user) {
      return AUTHENTICATED_NAV_ITEMS;
    }
    // Utilisateur non connecté : montrer "Accueil" en premier
    return PUBLIC_NAV_ITEMS;
  }, [user]);

  // ============================================================================
  // 🎯 Déterminer la section courante depuis l'URL
  // ============================================================================
  const getCurrentSection = () => {
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
    
    return undefined;
  };

  // ============================================================================
  // 🎯 Gestion de la navigation
  // ============================================================================
  const handleSectionChange = (section: string) => {
    const routeMap: Record<string, string> = {
      'home': '/',
      'dashboard': '/dashboard',
      'features': '/features',
      'smart-tools': '/smart-tools',
      'blog': '/blog',
      'help': '/help',
      'about': '/about',
      'premium': '/premium',
      'privacy': '/privacy',
      'terms': '/terms',
    };

    const route = routeMap[section];
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