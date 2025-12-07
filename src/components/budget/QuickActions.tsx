import { Plus, Users, Receipt, Target, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAddMember?: () => void;
  onAddCharge?: () => void;
  onAddProject?: () => void;
  onAddEvent?: () => void;
}

export function QuickActions({
  onAddMember,
  onAddCharge,
  onAddProject,
  onAddEvent,
}: QuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="gradient" size="lg" className="gap-2 shadow-floating">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Actions rapides</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onAddMember && (
          <DropdownMenuItem onClick={onAddMember} className="gap-2 cursor-pointer">
            <Users className="h-4 w-4" />
            <span>Ajouter un membre</span>
          </DropdownMenuItem>
        )}
        {onAddCharge && (
          <DropdownMenuItem onClick={onAddCharge} className="gap-2 cursor-pointer">
            <Receipt className="h-4 w-4" />
            <span>Ajouter une charge</span>
          </DropdownMenuItem>
        )}
        {onAddProject && (
          <DropdownMenuItem onClick={onAddProject} className="gap-2 cursor-pointer">
            <Target className="h-4 w-4" />
            <span>Ajouter un projet</span>
          </DropdownMenuItem>
        )}
        {onAddEvent && (
          <DropdownMenuItem onClick={onAddEvent} className="gap-2 cursor-pointer">
            <Calendar className="h-4 w-4" />
            <span>Ajouter un événement</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}