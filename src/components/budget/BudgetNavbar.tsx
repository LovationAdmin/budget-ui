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

const MAX_VISIBLE_DESKTOP = 5;

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
    navigate('/');
  };

  const handleLogoClick = () => {
    if (isAuthenticated) navigate('/dashboard');
    else navigate('/');
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
      navigate(`/budget/${budgetId}/complete/overview`);
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
                aria-label="Ouvrir le menu"
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
                <h1 className="font-display font-semibold text-foreground truncate max-w-[200px]">
                  {budgetTitle}
                </h1>
                <p className="text-xs text-muted-foreground">Gestion financière</p>
              </div>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 min-h-[44px]',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            {overflowItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 min-h-[44px]',
                      overflowItems.some((it) => it.id === currentSection)
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span>Plus</span>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHelpOpen}
              className="text-muted-foreground hover:text-foreground h-10 w-10"
              aria-label="Aide"
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
                          ? `Notifications (${unreadCount} non lues)`
                          : 'Notifications'
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
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 py-1 text-xs">
                          Tout marquer lu
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="max-h-[400px]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          Aucune notification
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
                                  <strong>{n.updatedBy}</strong> a modifié <em>{n.budgetName}</em>
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
                    <Button variant="ghost" className="gap-2 pl-2 min-h-[44px]" aria-label="Mon compte">
                      <MemberAvatar
                        name={userName || user?.name || 'User'}
                        image={userAvatar || user?.avatar}
                        size="sm"
                      />
                      <span className="hidden font-medium sm:inline-block max-w-[120px] truncate">
                        {userName || user?.name || 'Utilisateur'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="min-h-[44px]">
                      <User className="mr-2 h-4 w-4" /> Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="min-h-[44px]">
                      <Settings className="mr-2 h-4 w-4" /> Mes budgets
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={startTutorial} className="min-h-[44px]">
                      <HelpCircle className="mr-2 h-4 w-4" /> Voir le tutoriel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive min-h-[44px]">
                      <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogin} className="min-h-[44px]">
                  <LogIn className="h-4 w-4 mr-2" /> Se connecter
                </Button>
                <Button onClick={handleSignup} className="min-h-[44px]">
                  <UserPlus className="h-4 w-4 mr-2" /> Créer un compte
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
              <h2 className="text-lg font-semibold">Navigation</h2>
              <button
                onClick={handleMenuToggle}
                className="p-2 rounded-lg hover:bg-accent transition-colors h-10 w-10 flex items-center justify-center"
                aria-label="Fermer le menu"
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
                        <User className="h-5 w-5" /><span className="font-medium">Profil</span>
                      </button>
                      <button
                        onClick={() => { handleLogout(); handleMenuToggle(); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-5 w-5" /><span className="font-medium">Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { handleLogin(); handleMenuToggle(); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] hover:bg-accent"
                      >
                        <LogIn className="h-5 w-5" /><span className="font-medium">Se connecter</span>
                      </button>
                      <button
                        onClick={() => { handleSignup(); handleMenuToggle(); }}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full min-h-[48px] bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <UserPlus className="h-5 w-5" /><span className="font-medium">Créer un compte</span>
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
