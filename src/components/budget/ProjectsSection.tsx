import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Target, CheckCircle2, CalendarClock, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Project, YearlyData } from '@/utils/importConverter';

interface ProjectsSectionProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  yearlyData?: YearlyData; 
  currentYear?: number; // ADDED: Need this to check if budget months are in past
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function ProjectsSection({ projects, onProjectsChange, yearlyData = {}, currentYear = new Date().getFullYear() }: ProjectsSectionProps) {
  const [newProjectLabel, setNewProjectLabel] = useState('');
  const [newProjectTarget, setNewProjectTarget] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Helper: Get today's month index (0-11)
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentRealYear = today.getFullYear();

  const getProjectStats = (projectId: string) => {
    let totalPlanned = 0;
    let totalRealized = 0;

    MONTHS.forEach((month, index) => {
        const amount = yearlyData[month]?.[projectId] || 0;
        totalPlanned += amount;

        // "Realized" logic:
        // 1. If budget year is in the past (< currentRealYear), ALL months are realized.
        // 2. If budget year is current year, months <= currentMonthIndex are realized.
        // 3. If budget year is future, nothing is realized.
        
        if (currentYear < currentRealYear) {
            totalRealized += amount;
        } else if (currentYear === currentRealYear && index <= currentMonthIndex) {
            totalRealized += amount;
        }
    });

    return { totalPlanned, totalRealized };
  };

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectLabel.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      label: newProjectLabel.trim(),
      targetAmount: parseFloat(newProjectTarget) || 0,
    };

    onProjectsChange([...projects, newProject]);
    setNewProjectLabel('');
    setNewProjectTarget('');
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
              <Target className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Projets d'Épargne</CardTitle>
              <p className="text-sm text-muted-foreground">
                {projects.length} projet{projects.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {!showAddForm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-1 h-8 bg-secondary/5 hover:bg-secondary/10 text-secondary"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={addProject} className="mb-4 p-3 rounded-xl border border-secondary/20 bg-secondary/5 animate-scale-in">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full sm:flex-1 space-y-1.5">
                    <Label htmlFor="project-label" className="text-xs">Nom</Label>
                    <Input
                        id="project-label"
                        value={newProjectLabel}
                        onChange={(e) => setNewProjectLabel(e.target.value)}
                        placeholder="Vacances..."
                        className="h-9 bg-white"
                        required
                        autoFocus
                    />
                </div>
                <div className="w-full sm:w-32 space-y-1.5">
                    <Label htmlFor="project-target" className="text-xs">Objectif (€)</Label>
                    <Input
                        id="project-target"
                        type="number"
                        value={newProjectTarget}
                        onChange={(e) => setNewProjectTarget(e.target.value)}
                        placeholder="Optionnel"
                        className="h-9 bg-white"
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" size="sm" variant="secondary" className="h-9">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-9">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </form>
        )}

        {/* Projects List - GRID VIEW */}
        {projects.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucun projet d'épargne.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => {
              const { totalPlanned, totalRealized } = getProjectStats(project.id);
              const target = project.targetAmount || 0;
              const hasTarget = target > 0;
              
              // Progress reflects Realized Amount vs Target
              // If no target, we just show 100% if there is money
              const progress = hasTarget ? Math.min((totalRealized / target) * 100, 100) : (totalRealized > 0 ? 100 : 0);
              
              const isGoalReached = hasTarget && totalRealized >= target;
              const isFullyScheduled = hasTarget && totalPlanned >= target && !isGoalReached;

              return (
                <div
                  key={project.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border transition-all duration-200 p-4",
                    isGoalReached 
                        ? "bg-success/10 border-success/30 shadow-sm" 
                        : "bg-card/50 border-border/50 hover:bg-card hover:shadow-md"
                  )}
                >
                  <div className="relative flex flex-col gap-3">
                    
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                isGoalReached ? "bg-success/20 text-success" : 
                                isFullyScheduled ? "bg-blue-100 text-blue-600" : "bg-secondary/20 text-secondary"
                            )}>
                                {isGoalReached ? <CheckCircle2 className="h-4 w-4" /> : 
                                 isFullyScheduled ? <CalendarClock className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                            </div>
                            <Input
                                value={project.label}
                                onChange={(e) => updateProject(project.id, { label: e.target.value })}
                                className="h-7 text-sm font-medium bg-transparent border-0 p-0 focus-visible:ring-0 px-1 -ml-1 truncate font-display"
                            />
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeProject(project.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Stats & Inputs */}
                    <div className="flex items-end justify-between gap-2">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Objectif</p>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    value={project.targetAmount || ''}
                                    onChange={(e) => updateProject(project.id, { targetAmount: parseFloat(e.target.value) || 0 })}
                                    placeholder="Definir..."
                                    className="h-6 w-24 text-sm font-semibold bg-transparent border-b border-dashed border-muted-foreground/30 p-0 focus-visible:ring-0 focus-visible:border-solid rounded-none"
                                />
                                <span className="text-xs text-muted-foreground">€</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                {isGoalReached ? "Atteint" : "En Caisse"}
                            </p>
                            <p className={cn(
                                "text-sm font-bold",
                                isGoalReached ? "text-success" : "text-foreground"
                            )}>
                                {totalRealized.toLocaleString()} €
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {hasTarget && (
                        <div className="space-y-1 mt-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{progress.toFixed(0)}% réalisé</span>
                                {isGoalReached ? (
                                    <span className="text-success font-medium flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Objectif atteint
                                    </span>
                                ) : isFullyScheduled ? (
                                    <span className="text-blue-600 font-medium flex items-center gap-1">
                                        <CalendarClock className="h-3 w-3" /> Planifié à 100%
                                    </span>
                                ) : (
                                    <span>Reste: {(target - totalRealized).toLocaleString()} €</span>
                                )}
                            </div>
                            <div className="relative h-1.5 w-full bg-secondary/10 rounded-full overflow-hidden">
                                {/* Plan Bar (Background) */}
                                <div 
                                    className="absolute top-0 left-0 h-full bg-blue-200 transition-all duration-300"
                                    style={{ width: `${Math.min((totalPlanned / target) * 100, 100)}%` }}
                                />
                                {/* Realized Bar (Foreground) */}
                                <div 
                                    className={cn(
                                        "absolute top-0 left-0 h-full transition-all duration-500",
                                        isGoalReached ? "bg-success" : "bg-secondary"
                                    )}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}