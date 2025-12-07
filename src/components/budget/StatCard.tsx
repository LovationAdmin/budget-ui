import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
}

const variantStyles = {
  default: "from-primary/10 to-primary/5 border-primary/20",
  success: "from-success/10 to-success/5 border-success/20",
  warning: "from-warning/10 to-warning/5 border-warning/20",
  danger: "from-destructive/10 to-destructive/5 border-destructive/20",
  accent: "from-secondary/10 to-secondary/5 border-secondary/20",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  accent: "bg-secondary/10 text-secondary",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated",
        variantStyles[variant],
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-background/50 to-transparent opacity-50" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-display tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          )}
        </div>
        
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            iconStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
