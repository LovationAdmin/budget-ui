// src/components/budget/BudgetNavbar.tsx
// ============================================================================
// 🎯 BudgetNavbar — patch v2: named HelpCenter import
// ============================================================================
// Same as the previous version, only line 36 changed:
//   - import HelpCenter from '@/components/help/HelpCenter';   ❌ default
//   + import { HelpCenter } from '@/components/help/HelpCenter'; ✅ named
// ============================================================================

import { useState, useCallback, memo, useMemo, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeMenuItems } from '@/components/theme/ThemeMenu';
import { Bell, Menu, X, HelpCircle, LogIn, UserPlus, User, LogOut, Settings, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTutorial } from '@/contexts/TutorialContext';
import { MemberAvatar } from './MemberAvatar';
import { BudgetLogo } from './BudgetLogo';
import { HelpCenter } from '@/components/help/HelpCenter';
import { LanguageToggle } from '@/components/LanguageToggle';
import { LOCALES } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    subtitle: 'Gestion financière',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    mainNav: 'Navigation principale',
    navigation: 'Navigation',
    more: 'Plus',
    help: 'Aide',
    notifications: 'Notifications',
    unread: (n: number) => `Notifications (${n} non lues)`,
    markAllRead: 'Tout marquer lu',
    noNotifications: 'Aucune notification',
    updated: (who: string, budget: string) => <><strong>{who}</strong> a modifié <em>{budget}</em></>,
    account: 'Mon compte',
    user: 'Utilisateur',
    profile: 'Profil',
    myBudgets: 'Mes budgets',
    tutorial: 'Voir le tutoriel',
    logout: 'Déconnexion',
    login: 'Se connecter',
    signup: 'Créer un compte',
  },
  en: {
    subtitle: 'Money management',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
    mainNav: 'Main navigation',
    navigation: 'Navigation',
    more: 'More',
    help: 'Help',
    notifications: 'Notifications',
    unread: (n: number) => `Notifications (${n} unread)`,
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    updated: (who: string, budget: string) => <><strong>{who}</strong> updated <em>{budget}</em></>,
    account: 'My account',
    user: 'User',
    profile: 'Profile',
    myBudgets: 'My budgets',
    tutorial: 'Watch the tutorial',
    logout: 'Sign out',
    login: 'Sign in',
    signup: 'Create an account',
  },
});

export interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface BudgetNavbarProps {
  budgetTitle?: string;
  userName?: string;
  userAvatar?: string;
  items: NavItem[];
  currentSection?: string;
  onSectionChange?: (id: string) => void;
  menuOpen?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

const MAX_VISIBLE_DESKTOP = 7;

export const BudgetNavbar = memo(function BudgetNavbar({
  budgetTitle = 'Budget Famille',
  userName,
  userAvatar,
  items,
  currentSection,
  onSectionChange,
  menuOpen: externalMenuOpen,
  onMenuClick: externalOnMenuClick,
  className,
}: BudgetNavbarProps) {
  const navigate = useNavigate();
  const t = useT(M);
  const home = LOCALES[useLocale()].home;
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const { startTutorial } = useTutorial();

  const isAuthenticated = !!user;
  const [helpOpen, setHelpOpen] = useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const menuOpen = externalMenuOpen ?? internalMenuOpen;
  const handleMenuToggle = externalOnMenuClick ?? (() => setInternalMenuOpen((v) => !v));

  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate(home);
  };

  const handleLogoClick = () => {
    if (isAuthenticated) navigate('/dashboard');
    else navigate(home);
  };

  const handleSectionClick = useCallback(
    (sectionId: string) => onSectionChange?.(sectionId),
    [onSectionChange]
  );

  const handleSignup = () => navigate('/signup');
  const handleLogin = () => navigate('/login');

  const handleNotificationClick = useCallback(
    (notificationId: string, budgetId: string) => {
      markAsRead(notificationId);
      navigate(`/budget/${budgetId}/complete/month`);
    },
    [markAsRead, navigate]
  );

  const handleMarkAllRead = useCallback(() => markAllAsRead(), [markAllAsRead]);

  const { visibleItems, overflowItems } = useMemo(() => {
    if (items.length <= MAX_VISIBLE_DESKTOP) {
      return { visibleItems: items, overflowItems: [] as NavItem[] };
    }
    return {
      visibleItems: items.slice(0, MAX_VISIBLE_DESKTOP - 1),
      overflowItems: items.slice(MAX_VISIBLE_DESKTOP - 1),
    };
  }, [items]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl',
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 min-w-0">
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMenuToggle}
                className="lg:hidden h-10 w-10 navbar-menu-button"
                aria-label={t.openMenu}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <button
              onClick={handleLogoClick}
              className="flex items-center gap-3 transition-opacity hover:opacity-80 min-w-0"
            >
              <BudgetLogo size={36} />
              <div className="hidden sm:block min-w-0">
                <p className="font-display font-semibold text-foreground truncate max-w-[200px]">
                  {budgetTitle}
                </p>
                <p className="whitespace-nowrap text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-1" aria-label={t.mainNav}>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              // A full bar (the budget's tabs) keeps one line on narrow
              // desktops: the other tabs show their icon only below xl.
              const dense = visibleItems.length >= MAX_VISIBLE_DESKTOP;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={dense && !isActive ? item.label : undefined}
                  title={dense && !isActive ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-xl py-2 text-sm font-medium transition-all duration-200 min-h-[44px]',
                    dense ? 'px-3 2xl:px-4' : 'px-4',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className={dense && !isActive ? 'hidden xl:inline' : undefined}>{item.label}</span>
                </button>
              );
            })}

            {overflowItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 min-h-[44px] xl:px-4',
                      overflowItems.some((it) => it.id === currentSection)
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span>{t.more}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {overflowItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.id;
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handleSectionClick(item.id)}
                        className={cn(
                          'gap-2 min-h-[44px]',
                          isActive && 'bg-primary/10 text-primary font-medium'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHelpOpen}
              className="text-muted-foreground hover:text-foreground h-10 w-10"
              aria-label={t.help}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-muted-foreground hover:text-foreground h-10 w-10"
                      aria-label={
                        unreadCount > 0
                          ? t.unread(unreadCount)
                          : t.notifications
                      }
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
                      <h3 className="font-semibold">{t.notifications}</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 py-1 text-xs">
                          {t.markAllRead}
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="max-h-[400px]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          {t.noNotifications}
                        </div>
                      ) : (
                        <ul className="divide-y">
                          {notifications.map((n) => (
                            <li key={n.id}>
                              <button
                                onClick={() => handleNotificationClick(n.id, n.budgetId)}
                                className={cn(
                                  'flex w-full items-start gap-3 p-4 text-left hover:bg-accent transition-colors min-h-[64px]',
                                  !n.isRead && 'bg-primary/5'
                                )}
                              >
                                <span className="text-sm flex-1">
                                  {t.updated(n.updatedBy, n.budgetName)}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-2 min-h-[44px]" aria-label={t.account}>
                      <MemberAvatar
                        name={userName || user?.name || 'User'}
                        image={userAvatar || user?.avatar}
                        size="sm"
                      />
                      <span className="hidden font-medium sm:inline-block max-w-[120px] truncate">
                        {userName || user?.name || t.user}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{t.account}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="min-h-[44px]">
                      <User className="mr-2 h-4 w-4" /> {t.profile}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="min-h-[44px]">
                      <Settings className="mr-2 h-4 w-4" /> {t.myBudgets}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <ThemeMenuItems />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={startTutorial} className="min-h-[44px]">
                      <HelpCircle className="mr-2 h-4 w-4" /> {t.tutorial}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive min-h-[44px]">
                      <LogOut className="mr-2 h-4 w-4" /> {t.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogin} className="min-h-[44px]">
                  <LogIn className="h-4 w-4 mr-2" /> {t.login}
                </Button>
                <Button onClick={handleSignup} className="min-h-[44px]">
                  <UserPlus className="h-4 w-4 mr-2" /> {t.signup}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {menuOpen && items.length > 0 && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleMenuToggle} />
          <div className="relative bg-background h-full w-72 sm:w-80 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b bg-background">
              <h2 className="text-lg font-semibold">{t.navigation}</h2>
              <button
                onClick={handleMenuToggle}
                className="p-2 rounded-lg hover:bg-accent transition-colors h-10 w-10 flex items-center justify-center"
                aria-label={t.closeMenu}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-1 p-4">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { handleSectionClick(item.id); handleMenuToggle(); }}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 min-h-[48px]',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-soft'
                          : 'hover:bg-accent text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
                <div className="pt-4 mt-4 border-t space-y-2">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => { navigate('/profile'); handleMenuToggle(); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] hover:bg-accent"
                      >
                        <User className="h-5 w-5" /><span className="font-medium">{t.profile}</span>
                      </button>
                      <button
                        onClick={() => { handleLogout(); handleMenuToggle(); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-5 w-5" /><span className="font-medium">{t.logout}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { handleLogin(); handleMenuToggle(); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] hover:bg-accent"
                      >
                        <LogIn className="h-5 w-5" /><span className="font-medium">{t.login}</span>
                      </button>
                      <button
                        onClick={() => { handleSignup(); handleMenuToggle(); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <UserPlus className="h-5 w-5" /><span className="font-medium">{t.signup}</span>
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </ScrollArea>
            <div className="p-4 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">Budget Famille © 2025</p>
            </div>
          </div>
        </div>
      )}

      <HelpCenter open={helpOpen} onClose={handleHelpClose} />
    </>
  );
});

BudgetNavbar.displayName = 'BudgetNavbar';
