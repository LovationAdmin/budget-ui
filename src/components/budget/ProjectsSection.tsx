import { useState, ChangeEvent, KeyboardEvent } from 'react';

interface Project {
    id: string;
    label: string;
}

interface ProjectsSectionProps {
    projects: Project[];
    onProjectsChange: (projects: Project[]) => void;
}

export default function ProjectsSection({ projects, onProjectsChange }: ProjectsSectionProps): JSX.Element {
  const [newProject, setNewProject] = useState('');

  const addProject = () => {
    if (newProject.trim()) {
      onProjectsChange([
        ...projects,
        {
          id: `pr${Date.now()}`,
          label: newProject
        }
      ]);
      setNewProject('');
    }
  };

  const removeProject = (id: string) => {
    onProjectsChange(projects.filter(p => p.id !== id));
  };
  
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addProject();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Projets & Épargne
      </h2>

      {/* List of projects */}
      <div className="space-y-2 mb-4">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <span className="flex-1 text-gray-700 font-medium">{project.label}</span>
            <button
              onClick={() => removeProject(project.id)}
              className="text-red-600 hover:text-red-700 font-bold text-xl px-3"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add new project */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={newProject}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewProject(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          placeholder="Ex: Vacances, Voiture, Épargne..."
        />
        <button
          onClick={addProject}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Ajouter
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        Les montants seront gérés mensuellement dans le tableau ci-dessous
      </p>
    </div>
  );
}
