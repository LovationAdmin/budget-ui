import { cn } from "@/lib/utils";
import { 
  Settings, 
  Bell, 
  Menu,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  userName?: string;
  userAvatar?: string; // NEW PROP
  className?: string;
}

export function BudgetNavbar({
  budgetTitle = "Budget Famille",
  items = [],
  currentSection,
  onSectionChange,
  onMenuClick,
  userName = "Utilisateur",
  userAvatar, // NEW PROP
  className,
}: BudgetNavbarProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  return (
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
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div 
            className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => navigate('/')}
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

        {/* Center: Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h4 className="font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto px-2 text-xs"
                    onClick={markAllAsRead}
                  >
                    Tout marquer lu
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    Pas de nouvelles notifications
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={cn(
                          "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                          !notif.isRead && "bg-primary/5"
                        )}
                        onClick={() => {
                          markAsRead(notif.id);
                          navigate(`/budget/${notif.budgetId}/complete`);
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {notif.budgetName}
                          </p>
                          {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mis à jour par <span className="font-medium text-foreground">{notif.updatedBy}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onSectionChange?.('settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <div 
            className="hidden sm:block pl-2 border-l border-border cursor-pointer"
            onClick={() => navigate('/profile')}
            title="Mon Profil"
          >
            {/* UPDATED: Passing image prop here */}
            <MemberAvatar name={userName} image={userAvatar} size="sm" />
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {items.length > 0 && (
        <nav className="flex lg:hidden items-center gap-1 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}