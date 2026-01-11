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

  const handleNotificationClick = useCallback((notificationId: string, budgetId: string) => {
    markAsRead(notificationId);
    navigate(`/budget/${budgetId}/complete`);
  }, [markAsRead, navigate]);

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl",
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div 
              className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80"
              onClick={handleLogoClick}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(35_90%_65%)]">
                <span className="text-lg font-bold text-primary-foreground">B</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-semibold text-foreground">
                  {budgetTitle}
                </h1>
                <p className="text-xs text-muted-foreground">Gestion financière</p>
              </div>
            </div>
          </div>

          {/* Center: Navigation - Desktop only */}
          <nav className="hidden lg:flex items-center gap-1">
            {items.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 min-h-[44px]",
                    isActive
                      ? "bg-primary/10 text-primary shadow-soft"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: User Actions */}
          <div className="flex items-center gap-2">
            {/* Help Button - Toujours visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHelpOpen}
              className="text-muted-foreground hover:text-foreground h-10 w-10"
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-muted-foreground hover:text-foreground h-10 w-10"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-elevated">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllRead}
                          className="h-auto px-2 py-1 text-xs"
                        >
                          Tout marquer lu
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="max-h-[400px]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          Aucune notification
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif.id, notif.budgetId)}
                              className={cn(
                                "w-full px-4 py-3 text-left transition-colors hover:bg-accent",
                                !notif.isRead && "bg-primary/5"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {notif.budgetName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Modifié par {notif.updatedBy}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {new Date(notif.timestamp).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                                {!notif.isRead && (
                                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                            </button>
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
          </div>
        </div>
      </header>

      {/* ============================================================================ */}
      {/* 🎯 MOBILE SIDEBAR MENU */}
      {/* ============================================================================ */}
      {menuOpen && items.length > 0 && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMenuClick}
          />
          
          {/* Sidebar avec ScrollArea */}
          <div className="relative bg-background h-full w-72 sm:w-80 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
            {/* Header fixe */}
            <div className="flex items-center justify-between p-6 border-b bg-background">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-accent transition-colors h-10 w-10 flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Menu avec scroll */}
            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-1 p-4">
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
                        "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 min-h-[48px]",
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

            {/* Footer fixe */}
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