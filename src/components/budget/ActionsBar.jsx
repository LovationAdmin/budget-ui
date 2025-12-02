export default function ActionsBar({ onSave, onExport, onImport, saving }) {
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          onImport(data);
        } catch (error) {
          alert('Erreur lors de l\'importation du fichier');
        }
      };
      reader.readAsText(file);
    }
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

        <button
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <span>📥</span>
          Exporter JSON
        </button>

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

        <div className="text-sm text-gray-500">
          Auto-sauvegarde toutes les 30 secondes
        </div>
      </div>
    </div>
  );
}