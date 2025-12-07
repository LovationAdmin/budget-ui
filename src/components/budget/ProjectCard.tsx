import { cn } from "@/lib/utils";
import { Target, Calendar, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
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

export function ProjectCard({
  name,
  targetAmount,
  currentAmount,
  deadline,
  className,
}: ProjectCardProps) {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const remaining = targetAmount - currentAmount;
  
  const isComplete = progress >= 100;
  const isNearComplete = progress >= 75;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-elevated",
        isComplete ? "border-success/30 bg-success/5" : "border-border/50",
        className
      )}
    >
      {/* Progress indicator bar at top */}
      <div className="absolute left-0 top-0 h-1 w-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-500",
            isComplete
              ? "bg-success"
              : isNearComplete
              ? "bg-gradient-to-r from-primary to-success"
              : "bg-gradient-to-r from-primary to-[hsl(35_90%_65%)]"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isComplete ? "bg-success/10" : "bg-primary/10"
              )}
            >
              <Target
                className={cn(
                  "h-5 w-5",
                  isComplete ? "text-success" : "text-primary"
                )}
              />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{name}</h4>
              {deadline && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{deadline}</span>
                </div>
              )}
            </div>
          </div>
          
          {isComplete && (
            <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
              Complété ✓
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium text-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Économisé</p>
            <p className="font-semibold text-foreground">
              {formatCurrency(currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Objectif</p>
            <p className="font-semibold text-foreground">
              {formatCurrency(targetAmount)}
            </p>
          </div>
        </div>

        {!isComplete && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Encore {formatCurrency(remaining)} à épargner
            </span>
          </div>
        )}
      </div>
    </div>
  );
}