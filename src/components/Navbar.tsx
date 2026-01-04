// src/components/Navbar.tsx
// ✅ VERSION CORRIGÉE - Compatible avec la nouvelle structure de routing

import { useState, useMemo } from 'react';
import { BudgetNavbar, NavItem } from "./budget/BudgetNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, // Changé Home -> LayoutDashboard pour mieux différencier
  Newspaper,
  Sparkles,
  HelpCircle,
  Shield,
  FileText,
  Crown,
  Info
} from "lucide-react";

// ============================================================================
// 🎯 NAVIGATION ITEMS
// ============================================================================
const ALL_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
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
    id: 'blog',
    label: 'Blog',
    icon: Newspaper,
  },
  {
    id: 'help',
    label: 'Aide',
    icon: HelpCircle,
  },
  {
    id: 'about',
    label: 'À propos',
    icon: Info,
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: Crown,
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

  // ✅ FILTRAGE DYNAMIQUE : On ne montre "Tableau de bord" que si connecté
  const activeItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter(item => {
      if (item.id === 'dashboard' && !user) return false;
      return true;
    });
  }, [user]);

  // ============================================================================
  // 🎯 Déterminer la section courante depuis l'URL
  // ============================================================================
  const getCurrentSection = () => {
    const path = location.pathname;
    
    // ✅ MAPPING MIS À JOUR
    if (path === '/dashboard' || path.startsWith('/budget/')) return 'dashboard';
    if (path === '/features') return 'features';
    if (path === '/smart-tools' || path === '/outils-ia') return 'smart-tools';
    if (path === '/blog') return 'blog';
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
    // Mapping des sections vers les routes
    const routeMap: Record<string, string> = {
      'dashboard': '/dashboard', // ✅ CORRIGÉ : Pointe vers /dashboard, pas /
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
      // ✅ Si pas connecté, on affiche "Invité" au lieu de "Utilisateur"
      userName={user?.name || 'Invité'} 
      userAvatar={user?.avatar}
      items={activeItems} // ✅ Utilisation de la liste filtrée
      currentSection={getCurrentSection()}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(!menuOpen)}
      onSectionChange={handleSectionChange}
    />
  );
}