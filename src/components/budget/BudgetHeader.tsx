import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetHeaderProps {
  budgetTitle: string;
  onTitleChange: (title: string) => void;
  currentYear: number;
  onYearChange: (year: number) => void;
}

export default function BudgetHeader({
  budgetTitle,
  onTitleChange,
  currentYear,
  onYearChange,
}: BudgetHeaderProps) {
  return (
    <div className="relative overflow-hidden p-6 bg-gradient-to-r from-primary/5 via-white to-secondary/5 border-b border-border/40">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* SECTION TITRE ÉDITABLE */}
        <div className="flex-1 w-full md:w-auto group">
          <div className="relative">
            <Input
              type="text"
              value={budgetTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className={cn(
                "text-3xl md:text-4xl font-extrabold tracking-tight h-auto py-2 pl-0 pr-10",
                "bg-transparent border-transparent shadow-none rounded-lg",
                "hover:bg-gray-100/50 hover:pl-3 transition-all duration-200",
                "focus-visible:bg-white focus-visible:pl-3 focus-visible:ring-2 focus-visible:ring-primary/20",
                "placeholder:text-muted-foreground/50 text-foreground"
              )}
              placeholder="Nom du budget"
            />
            {/* Icône crayon qui apparaît au survol pour indiquer l'édition */}
            <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none" />
          </div>
          <p className="text-sm text-muted-foreground pl-1 mt-1">
            Gérez vos finances et prévoyez l'avenir
          </p>
        </div>

        {/* SECTION SÉLECTEUR ANNÉE (Style Capsule) */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md shadow-sm border border-border/50 rounded-full p-1.5 pl-4 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mr-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold font-mono text-foreground tracking-tight">
              {currentYear}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white hover:text-primary hover:shadow-sm transition-all"
              onClick={() => onYearChange(currentYear - 1)}
              title="Année précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white hover:text-primary hover:shadow-sm transition-all"
              onClick={() => onYearChange(currentYear + 1)}
              title="Année suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}