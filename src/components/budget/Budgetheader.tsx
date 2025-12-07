import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            type="text"
            value={budgetTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-2xl font-bold bg-white/50 backdrop-blur-sm border-0 focus-visible:ring-2 h-auto py-2"
            placeholder="Nom du budget"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onYearChange(currentYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 py-2 bg-white rounded-lg font-semibold min-w-[100px] text-center">
            {currentYear}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onYearChange(currentYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}