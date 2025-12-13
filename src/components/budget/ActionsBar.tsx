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
    <div className="glass-card p-4 mb-6 animate-fade-in flex items-center justify-between">
      
      {/* Information discrète à gauche */}
      <div className="hidden sm:block text-sm text-muted-foreground flex-1">
        💾 Sauvegarde automatique active (toutes les 30s)
      </div>

      {/* Bouton Sauvegarder à droite */}
      <Button
        variant="gradient"
        onClick={onSave}
        disabled={saving}
        className="gap-2 ml-auto shadow-lg hover:shadow-xl transition-all"
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
  );
}