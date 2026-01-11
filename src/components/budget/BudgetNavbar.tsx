// src/components/budget/BudgetNavbar.tsx
// ✅ VERSION AMÉLIORÉE - Menu différent pour utilisateurs connectés vs non connectés

import { useState, memo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Bell, 
  Menu,
  LogOut,
  User,
  LucideIcon,
  HelpCircle,
  X,
  LogIn,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorial } from "@/contexts/TutorialContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCenter } from '@/components/help/HelpCenter';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BudgetNavbarProps {
  budgetTitle?: string;
  items?: NavItem[];
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  onMenuClick?: () => void;
  menuOpen?: boolean;
  userName?: string;
  userAvatar?: string;
  className?: string;
}

export const BudgetNavbar = memo(function BudgetNavbar({
  budgetTitle = "Budget Famille",
  items = [],
  currentSection,
  onSectionChange,
  onMenuClick,
  menuOpen = false,
  userName,
  userAvatar,
  className,
}: BudgetNavbarProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const { user, logout } = useAuth();
  const { startTutorial } = useTutorial();
  const [helpOpen, setHelpOpen] = useState(false);

  // ✅ Déterminer si l'utilisateur est connecté
  const isAuthenticated = !!user;

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSignup = useCallback(() => {
    navigate('/signup');
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleHelpOpen = useCallback(() => {
    setHelpOpen(true);
  }, []);

  const handleHelpClose = useCallback(() => {
    setHelpOpen(false);
  }, []);

  const handleSectionClick = useCallback((sectionId: string) => {
    onSectionChange?.(sectionId);
  }, [onSectionChange]);

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="flex h-16 items-center px-4 md:px-6">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer mr-4 md:mr-8"
            onClick={handleLogoClick}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-soft">
              <span className="text-lg font-bold">B</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-semibold text-foreground leading-tight">
                {budgetTitle}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-2">
            
            {/* Help Button - Toujours visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHelpOpen}
              className="h-10 w-10"
              title="Centre d'aide"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* ================================================================ */}
            {/* CONTENU DIFFÉRENT SELON AUTHENTIFICATION */}
            {/* ================================================================ */}
            
            {isAuthenticated ? (
              <>
                {/* Notifications - Seulement si connecté */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-10 w-10">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-0">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <h4 className="font-semibold">Notifications</h4>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Tout marquer comme lu
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[300px]">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">Aucune notification</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={cn(
                                "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-accent",
                                !notif.read && "bg-primary/5"
                              )}
                            >
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {notif.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(notif.timestamp).toLocaleString('fr-FR')}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                {/* User Menu - Utilisateur CONNECTÉ */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-2 min-h-[44px]">
                      <MemberAvatar name={userName || user?.name || 'User'} image={userAvatar || user?.avatar} size="sm" />
                      <span className="hidden font-medium sm:inline-block max-w-[120px] truncate">
                        {userName || user?.name || 'Utilisateur'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="min-h-[44px]">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="min-h-[44px]">
                      <Settings className="mr-2 h-4 w-4" />
                      Mes budgets
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={startTutorial} className="min-h-[44px]">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Voir le tutoriel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive min-h-[44px]">
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Boutons Auth - Utilisateur NON CONNECTÉ */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={handleLogin}
                    className="gap-2 min-h-[44px]"
                  >
                    <LogIn className="h-4 w-4" />
                    Se connecter
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={handleSignup}
                    className="gap-2 min-h-[44px]"
                  >
                    <UserPlus className="h-4 w-4" />
                    S'inscrire
                  </Button>
                </div>

                {/* Menu déroulant pour mobile - NON CONNECTÉ */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="sm:hidden">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Bienvenue !</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogin} className="min-h-[44px]">
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignup} className="min-h-[44px]">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Créer un compte
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10"
              onClick={onMenuClick}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* Mobile Menu Overlay */}
      {/* ================================================================ */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMenuClick}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-[280px] bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-lg">Menu</span>
              <Button variant="ghost" size="icon" onClick={onMenuClick} className="h-10 w-10">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation avec scroll */}
            <ScrollArea className="flex-1">
              <nav className="p-4 space-y-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSectionClick(item.id);
                        onMenuClick?.();
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px]",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-soft" 
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}

                {/* ============================================ */}
                {/* Actions Auth dans le menu mobile */}
                {/* ============================================ */}
                <div className="pt-4 mt-4 border-t space-y-2">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          onMenuClick?.();
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] hover:bg-accent"
                      >
                        <User className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">Mon Profil</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          onMenuClick?.();
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] hover:bg-accent"
                      >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">Mes Budgets</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          onMenuClick?.();
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] hover:bg-destructive/10 text-destructive"
                      >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          handleLogin();
                          onMenuClick?.();
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] hover:bg-accent"
                      >
                        <LogIn className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">Se connecter</span>
                      </button>
                      <button
                        onClick={() => {
                          handleSignup();
                          onMenuClick?.();
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <UserPlus className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">Créer un compte</span>
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Budget Famille © 2025
              </p>
            </div>
          </div>
        </div>
      )}

      <HelpCenter open={helpOpen} onClose={handleHelpClose} />
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.budgetTitle === nextProps.budgetTitle &&
    prevProps.currentSection === nextProps.currentSection &&
    prevProps.userName === nextProps.userName &&
    prevProps.userAvatar === nextProps.userAvatar &&
    prevProps.items === nextProps.items &&
    prevProps.className === nextProps.className &&
    prevProps.menuOpen === nextProps.menuOpen 
  );
});

BudgetNavbar.displayName = 'BudgetNavbar';