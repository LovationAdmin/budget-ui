import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from '@/utils/importConverter';

interface ProjectsSectionProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export default function ProjectsSection({ projects, onProjectsChange }: ProjectsSectionProps) {
  const [newProjectLabel, setNewProjectLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectLabel.trim()) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      label: newProjectLabel.trim(),
    };

    onProjectsChange([...projects, newProject]);
    setNewProjectLabel('');
    setShowAddForm(false);
  };

  const removeProject = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Toutes les données associées seront perdues.')) {
      onProjectsChange(projects.filter(p => p.id !== id));
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    onProjectsChange(
      projects.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  return (
    <Card className="glass-card animate-slide-up stagger-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
              <Target className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="font-display">Projets d'Épargne</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {projects.length} projet{projects.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {!showAddForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={addProject} className="glass-card-elevated p-4 space-y-3 animate-scale-in">
            <div className="space-y-2">
              <Label htmlFor="project-label">Nom du projet</Label>
              <Input
                id="project-label"
                value={newProjectLabel}
                onChange={(e) => setNewProjectLabel(e.target.value)}
                placeholder="Vacances, Voiture, Mariage..."
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                💡 Vous pourrez définir des montants mensuels pour chaque projet dans le tableau
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" variant="gradient" size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Créer le projet
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewProjectLabel('');
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun projet d'épargne</p>
            <p className="text-xs mt-1">Créez des projets pour suivre vos objectifs financiers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border/50",
                  "bg-gradient-to-br from-secondary/5 to-primary/5",
                  "hover:shadow-soft transition-all duration-200",
                  "p-4"
                )}
              >
                {/* Index badge */}
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-secondary/30 mt-6 ml-6">
                    {index + 1}
                  </span>
                </div>

                <div className="relative flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20 flex-shrink-0 mt-0.5">
                    <Target className="h-4 w-4 text-secondary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Input
                      value={project.label}
                      onChange={(e) => updateProject(project.id, { label: e.target.value })}
                      className="font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:bg-white/50 rounded px-2 -ml-2"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}