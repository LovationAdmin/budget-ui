import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Target, 
  CalendarDays, 
  Settings, 
  Bell, 
  Search, 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";

interface BudgetNavbarProps {
  budgetTitle?: string;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  onMenuClick?: () => void;
  userName?: string;
  className?: string;
}

const navItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "projects", label: "Projets", icon: Target },
  { id: "calendar", label: "Tableau Mensuel", icon: CalendarDays },
];

export function BudgetNavbar({
  budgetTitle = "Budget familial",
  currentSection,
  onSectionChange,
  onMenuClick,
  userName = "Utilisateur",
  className,
}: BudgetNavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(35_90%_65%)]">
              <span className="text-lg font-bold text-primary-foreground">B</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-semibold text-foreground">
                {budgetTitle}
              </h1>
              <p className="text-xs text-muted-foreground">{new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Center navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
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

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex"
            onClick={() => onSectionChange?.('search')}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => onSectionChange?.('notifications')}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onSectionChange?.('settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div 
            className="hidden sm:block pl-2 border-l border-border cursor-pointer"
            onClick={() => onSectionChange?.('profile')}
          >
            <MemberAvatar name={userName} size="sm" />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav className="flex lg:hidden items-center gap-1 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {navItems.map((item) => {
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
    </header>
  );
}