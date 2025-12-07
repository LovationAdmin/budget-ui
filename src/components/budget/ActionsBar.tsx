import { useState, ChangeEvent } from 'react';
import { type RawBudgetData } from '../../utils/importConverter';

interface ActionsBarProps {
    onSave: () => void;
    onExport: (formatType: 'new' | 'old') => void;
    onImport: (data: RawBudgetData) => void;
    saving: boolean;
}

export default function ActionsBar({ onSave, onExport, onImport, saving }: ActionsBarProps): JSX.Element {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as RawBudgetData;
          onImport(data);
        } catch (error) {
          alert('Erreur lors de l\'importation du fichier');
        }
      };
      reader.readAsText(file);
    }
    // Réinitialiser le champ de fichier après l'importation (nécessaire pour pouvoir importer à nouveau le même fichier)
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <span>💾</span>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        {/* Export with format selection */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>📥</span>
            Exporter JSON
          </button>
          
          {showExportMenu && (
            <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
              <button
                onClick={() => {
                  onExport('new');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
              >
                Format React (V2)
              </button>
              <button
                onClick={() => {
                  onExport('old');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
              >
                Format HTML (V1)
              </button>
            </div>
          )}
        </div>

        <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition cursor-pointer flex items-center gap-2">
          <span>📤</span>
          Importer JSON
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <div className="flex-1"></div>

        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Auto-sauvegarde 30s
        </div>
      </div>
    </div>
  );
}
