import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, Download, Upload, ChevronDown, Loader2 } from "lucide-react";
import type { RawBudgetData } from '@/utils/importConverter';

interface ActionsBarProps {
  onSave: () => void;
  onExport: (format: 'new' | 'old') => void;
  onImport: (data: RawBudgetData) => void;
  saving?: boolean;
}

export default function ActionsBar({
  onSave,
  onExport,
  onImport,
  saving = false,
}: ActionsBarProps) {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onImport(data);
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Erreur lors de l\'importation du fichier');
    } finally {
      setImporting(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="glass-card p-4 mb-6 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        {/* Save Button */}
        <Button
          variant="gradient"
          onClick={onSave}
          disabled={saving}
          className="gap-2"
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

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onExport('new')}>
              <Download className="mr-2 h-4 w-4" />
              Format moderne (.json)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('old')}>
              <Download className="mr-2 h-4 w-4" />
              Format legacy (.json)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import Button */}
        <Button
          variant="outline"
          onClick={handleImportClick}
          disabled={importing}
          className="gap-2"
        >
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importation...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Importer
            </>
          )}
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Info text */}
        <div className="ml-auto hidden sm:block text-sm text-muted-foreground">
          💾 Sauvegarde automatique toutes les 30 secondes
        </div>
      </div>
    </div>
  );
}