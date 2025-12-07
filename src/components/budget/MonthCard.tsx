import { cn } from "@/lib/utils";
import { Lock, Unlock, MessageCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthCardProps {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  isLocked?: boolean;
  hasComment?: boolean;
  isCurrent?: boolean;
  onToggleLock?: () => void;
  onClick?: () => void;
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const monthNames: Record<string, string> = {
  "01": "Janvier",
  "02": "Février",
  "03": "Mars",
  "04": "Avril",
  "05": "Mai",
  "06": "Juin",
  "07": "Juillet",
  "08": "Août",
  "09": "Septembre",
  "10": "Octobre",
  "11": "Novembre",
  "12": "Décembre",
};

export function MonthCard({
  month,
  income,
  expenses,
  savings,
  isLocked = false,
  hasComment = false,
  isCurrent = false,
  onToggleLock,
  onClick,
  className,
}: MonthCardProps) {
  const balance = income - expenses;
  const isPositive = balance >= 0;
  const monthName = monthNames[month] || month;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300 hover:shadow-elevated",
        isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isLocked && "opacity-75",
        className
      )}
    >
      {/* Current month indicator */}
      {isCurrent && (
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10" />
      )}

      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{monthName}</h4>
            {isCurrent && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                En cours
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasComment && (
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock?.();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isLocked ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Unlock className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Revenus</span>
            <span className="font-medium text-success">
              +{formatCurrency(income)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dépenses</span>
            <span className="font-medium text-destructive">
              -{formatCurrency(expenses)}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div
          className={cn(
            "flex items-center justify-between rounded-xl p-3",
            isPositive ? "bg-success/10" : "bg-destructive/10"
          )}
        >
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium text-muted-foreground">
              Solde
            </span>
          </div>
          <span
            className={cn(
              "font-bold",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>

        {/* Savings indicator */}
        {savings > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span>{formatCurrency(savings)} vers projets</span>
          </div>
        )}
      </div>
    </div>
  );
}
