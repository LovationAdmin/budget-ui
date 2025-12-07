import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-display font-semibold text-foreground">
        {title}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="gradient" onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
