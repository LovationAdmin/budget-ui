import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface ActionsBarProps {
  onSave: () => void;
  saving?: boolean;
}

export default function ActionsBar({
  onSave,
  saving = false,
}: ActionsBarProps) {
  return (
    <div className="glass-card p-4 mb-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Info text */}
        <div className="hidden sm:block text-sm text-muted-foreground">
          💾 Sauvegarde automatique toutes les 30 secondes
        </div>

        {/* Save Button */}
        <Button
          variant="gradient"
          onClick={onSave}
          disabled={saving}
          className="gap-2 ml-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>
    </div>
  );
}