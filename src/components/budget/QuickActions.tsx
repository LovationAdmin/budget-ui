import { cn } from "@/lib/utils";
import { 
  Plus, 
  Download, 
  Upload, 
  Share2, 
  Save,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAddMember?: () => void;
  onAddCharge?: () => void;
  onAddProject?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onInvite?: () => void;
  isSaving?: boolean;
  className?: string;
}

export function QuickActions({
  onAddMember,
  onAddCharge,
  onAddProject,
  onSave,
  onExport,
  onImport,
  onInvite,
  isSaving = false,
  className,
}: QuickActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className
      )}
    >
      {/* Primary action */}
      <Button variant="gradient" onClick={onAddCharge} className="gap-2">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nouvelle charge</span>
        <span className="sm:hidden">Charge</span>
      </Button>

      {/* Secondary actions */}
      <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddMember}
          className="gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden md:inline">Membre</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddProject}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Projet</span>
        </Button>
      </div>

      {/* Utility actions */}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onInvite}
          title="Inviter"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onImport}
          title="Importer"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onExport}
          title="Exporter"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="gap-1.5"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </span>
        </Button>
      </div>
    </div>
  );
}
