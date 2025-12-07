import { cn } from "@/lib/utils";
import { 
  Home, 
  Car, 
  Utensils, 
  Wifi, 
  Heart, 
  ShoppingBag, 
  Zap,
  Droplets,
  Shield,
  GraduationCap,
  Plane,
  MoreHorizontal,
  LucideIcon
} from "lucide-react";

interface ChargeItemProps {
  name: string;
  amount: number;
  category?: string;
  isRecurring?: boolean;
  frequency?: string;
  className?: string;
}

const categoryConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  housing: { icon: Home, color: "text-primary", bg: "bg-primary/10" },
  transport: { icon: Car, color: "text-secondary", bg: "bg-secondary/10" },
  food: { icon: Utensils, color: "text-warning", bg: "bg-warning/10" },
  utilities: { icon: Wifi, color: "text-[hsl(200_60%_50%)]", bg: "bg-[hsl(200_60%_50%)]/10" },
  health: { icon: Heart, color: "text-destructive", bg: "bg-destructive/10" },
  shopping: { icon: ShoppingBag, color: "text-[hsl(300_50%_50%)]", bg: "bg-[hsl(300_50%_50%)]/10" },
  electricity: { icon: Zap, color: "text-warning", bg: "bg-warning/10" },
  water: { icon: Droplets, color: "text-secondary", bg: "bg-secondary/10" },
  insurance: { icon: Shield, color: "text-success", bg: "bg-success/10" },
  education: { icon: GraduationCap, color: "text-[hsl(260_60%_55%)]", bg: "bg-[hsl(260_60%_55%)]/10" },
  travel: { icon: Plane, color: "text-secondary", bg: "bg-secondary/10" },
  other: { icon: MoreHorizontal, color: "text-muted-foreground", bg: "bg-muted" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ChargeItem({
  name,
  amount,
  category = "other",
  isRecurring = true,
  frequency = "monthly",
  className,
}: ChargeItemProps) {
  const config = categoryConfig[category.toLowerCase()] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:bg-card hover:shadow-soft",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
          config.bg
        )}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {isRecurring ? `Récurrent • ${frequency}` : "Ponctuel"}
        </p>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-foreground">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}