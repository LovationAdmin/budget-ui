// src/components/Navbar.tsx
// ✅ VERSION CORRIGÉE - Menu burger fonctionnel avec navigation complète

import { useState } from 'react';
import { BudgetNavbar, NavItem } from "./budget/BudgetNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home,
  Newspaper,
  Sparkles,
  HelpCircle,
  Shield,
  FileText,
  Crown,
  Info
} from "lucide-react";

// ============================================================================
// 🎯 NAVIGATION ITEMS - Toutes les pages principales de Budget Famille
// ============================================================================
const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
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

  // ============================================================================
  // 🎯 Déterminer la section courante depuis l'URL
  // ============================================================================
  const getCurrentSection = () => {
    const path = location.pathname;
    
    // Mapping des routes vers les sections
    if (path === '/' || path.startsWith('/budget/')) return 'dashboard';
    if (path === '/features') return 'features';
    if (path === '/smart-tools' || path === '/outils-ia') return 'smart-tools';
    if (path === '/blog') return 'blog';
    if (path === '/help') return 'help';
    if (path === '/about') return 'about';
    if (path === '/premium') return 'premium';
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    
    return undefined; // Pas de section active
  };

  // ============================================================================
  // 🎯 Gestion de la navigation
  // ============================================================================
  const handleSectionChange = (section: string) => {
    // Mapping des sections vers les routes
    const routeMap: Record<string, string> = {
      'dashboard': '/',
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
      setMenuOpen(false); // Fermer le menu après navigation
    }
  };

  return (
    <BudgetNavbar 
      budgetTitle="Budget Famille"
      userName={user?.name || 'Utilisateur'}
      userAvatar={user?.avatar}
      items={NAVIGATION_ITEMS}
      currentSection={getCurrentSection()}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(!menuOpen)}
      onSectionChange={handleSectionChange}
    />
  );
}