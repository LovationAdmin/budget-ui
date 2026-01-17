// src/components/budget/ProjectsSection.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Target, CheckCircle2, CalendarClock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, YearlyData } from '@/utils/importConverter';

interface ProjectsSectionProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  yearlyData?: YearlyData; 
  currentYear?: number;
  projectCarryOvers?: Record<string, number>;
  currency?: string; 
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// ✅ HELPER: Get correct symbol for any currency code
function getCurrencySymbol(code?: string): string {
  switch (code) {
    case 'USD': return '$';
    case 'CAD': return '$';
    case 'GBP': return '£';
    case 'CHF': return 'CHF';
    case 'EUR': return '€';
    default: return '€';
  }
}

export default function ProjectsSection({ 
    projects, 
    onProjectsChange, 
    yearlyData = {}, 
    currentYear = new Date().getFullYear(),
    projectCarryOvers = {},
    currency = 'EUR' 
}: ProjectsSectionProps) {
  
  const [newProjectLabel, setNewProjectLabel] = useState('');
  const [newProjectTarget, setNewProjectTarget] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ Symbole de devise dynamique
  const currencySymbol = getCurrencySymbol(currency);

  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentRealYear = today.getFullYear();

  const getProjectStats = (projectId: string) => {
    // 1. Initialisation avec le report des années précédentes (Net : Alloué - Dépensé)
    const carryOver = projectCarryOvers[projectId] || 0;
    
    let totalPlanned = carryOver;   // Le planifié inclut ce qu'on a déjà mis de côté avant
    let totalRealized = carryOver;  // Ce qui a été mis de côté avant est forcément "réalisé" (passé)

    // 2. Ajout des données de l'année en cours
    MONTHS.forEach((month, index) => {
        const amount = yearlyData[month]?.[projectId] || 0;
        totalPlanned += amount;

        // Logique "Réalisé" pour l'année affichée
        if (currentYear < currentRealYear) {
            // Si on regarde une année passée (ex: 2023), tout est réalisé
            totalRealized += amount;
        } else if (currentYear === currentRealYear && index <= currentMonthIndex) {
            // Si on regarde l'année en cours, seuls les mois passés + mois actuel comptent
            totalRealized += amount;
        }
        // Si année future, on n'ajoute rien au réalisé
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
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50/50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg text-indigo-900">Projets d'Épargne</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                 <p className="text-sm text-indigo-600/80 font-medium">
                    {projects.length} projet{projects.length > 1 ? 's' : ''} en cours
                 </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
              {/* Légende Compacte Desktop */}
              {projects.length > 0 && (
                 <div className="hidden sm:flex items-center gap-3 text-[10px] bg-white/60 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                    <span className="flex items-center gap-1.5" title="Argent déjà provisionné">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></div>
                        <span className="text-gray-600 font-medium">En caisse</span>
                    </span>
                    <span className="h-3 w-px bg-indigo-200"></span>
                    <span className="flex items-center gap-1.5" title="Argent prévu dans le futur">
                        <div className="h-2 w-2 rounded-full bg-indigo-300"></div>
                        <span className="text-gray-600 font-medium">Planifié</span>
                    </span>
                 </div>
              )}

              {!showAddForm && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9 px-4"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nouveau Projet
                </Button>
              )}
          </div>
        </div>
        
        {/* Légende Mobile */}
        {projects.length > 0 && (
             <div className="flex sm:hidden items-center justify-center gap-4 text-[10px] mt-2 bg-white/40 px-3 py-2 rounded-lg border border-indigo-50">
                <span className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="font-medium text-gray-700">En caisse</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-300"></div>
                    <span className="font-medium text-gray-700">Planifié</span>
                </span>
             </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Form with Animation */}
        {showAddForm && (
          <form 
            onSubmit={addProject} 
            className="mb-4 p-4 rounded-xl border border-indigo-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ring-4 ring-indigo-50"
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-50">
                 <h4 className="text-sm font-semibold text-indigo-900">Nouveau projet d'épargne</h4>
                 <Button type="button" size="icon" variant="ghost" onClick={() => setShowAddForm(false)} className="h-6 w-6">
                    <X className="h-4 w-4 text-gray-400" />
                 </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:flex-1 space-y-1.5">
                    <Label htmlFor="project-label" className="text-xs font-medium text-gray-500">Nom du projet</Label>
                    <Input
                        id="project-label"
                        value={newProjectLabel}
                        onChange={(e) => setNewProjectLabel(e.target.value)}
                        placeholder="Ex: Vacances Japon, Apport Maison..."
                        className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        required
                        autoFocus
                    />
                </div>
                <div className="w-full sm:w-40 space-y-1.5">
                    <Label htmlFor="project-target" className="text-xs font-medium text-gray-500">Objectif ({currencySymbol})</Label>
                    <Input
                        id="project-target"
                        type="number"
                        value={newProjectTarget}
                        onChange={(e) => setNewProjectTarget(e.target.value)}
                        placeholder="Ex: 5000"
                        className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors font-mono"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                    <Button type="submit" className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                        <Plus className="h-4 w-4 mr-1" /> Créer
                    </Button>
                </div>
            </div>
          </form>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-indigo-300 text-sm border-2 border-dashed border-indigo-100 rounded-xl bg-white/30">
            <Target className="h-12 w-12 mb-3 opacity-20" />
            <p>Aucun projet défini pour le moment.</p>
            <p className="text-xs opacity-70 mt-1">Commencez à épargner pour vos rêves !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const { totalPlanned, totalRealized } = getProjectStats(project.id);
              const target = project.targetAmount || 0;
              const hasTarget = target > 0;
              
              const progress = hasTarget ? Math.min((totalRealized / target) * 100, 100) : (totalRealized > 0 ? 100 : 0);
              const isGoalReached = hasTarget && totalRealized >= target;
              const isFullyScheduled = hasTarget && totalPlanned >= target && !isGoalReached;

              return (
                <div
                  key={project.id}
                  className={cn(
                    "group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-300",
                    isGoalReached 
                        ? "bg-emerald-50/50 border-emerald-200 shadow-sm" 
                        : "bg-white border-white shadow-sm hover:shadow-md hover:border-indigo-100"
                  )}
                >
                    {/* Top Row: Icon + Name + Delete */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm transition-colors",
                                isGoalReached ? "bg-emerald-100 text-emerald-600" : 
                                isFullyScheduled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                            )}>
                                {isGoalReached ? <CheckCircle2 className="h-5 w-5" /> : 
                                 isFullyScheduled ? <CalendarClock className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <Input
                                    value={project.label}
                                    onChange={(e) => updateProject(project.id, { label: e.target.value })}
                                    className="h-auto p-0 border-0 bg-transparent text-base font-bold text-gray-900 focus-visible:ring-0 focus-visible:bg-gray-50 rounded px-1 -ml-1 truncate w-full hover:bg-gray-50/50 transition-colors"
                                />
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                    <span>Objectif:</span>
                                    <div className="flex items-center">
                                        <Input
                                            type="number"
                                            value={project.targetAmount || ''}
                                            onChange={(e) => updateProject(project.id, { targetAmount: parseFloat(e.target.value) || 0 })}
                                            placeholder="--"
                                            className="h-5 w-16 bg-transparent border-b border-dashed border-gray-300 p-0 text-xs focus-visible:ring-0 rounded-none text-center mx-1"
                                        />
                                        <span>{currencySymbol}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProject(project.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Bottom Row: Progress & Stats */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                             <div className="flex flex-col">
                                 <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">En Caisse</span>
                                 <span className={cn(
                                     "text-xl font-bold tabular-nums tracking-tight",
                                     isGoalReached ? "text-emerald-600" : "text-gray-900"
                                 )}>
                                     {totalRealized.toLocaleString()} <span className="text-sm font-medium text-gray-400">{currencySymbol}</span>
                                 </span>
                             </div>
                             
                             {hasTarget && (
                                <div className="text-right">
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded-full border",
                                        isGoalReached ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"
                                    )}>
                                        {progress.toFixed(0)}%
                                    </span>
                                </div>
                             )}
                        </div>

                        {/* Progress Bar Component */}
                        {hasTarget && (
                            <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                {/* Planned Bar (Future) */}
                                <div 
                                    className="absolute top-0 left-0 h-full bg-indigo-200 transition-all duration-500 ease-out"
                                    style={{ width: `${Math.min((totalPlanned / target) * 100, 100)}%` }}
                                    title={`Planifié total: ${totalPlanned.toLocaleString()} ${currencySymbol}`}
                                />
                                {/* Realized Bar (Current) */}
                                <div 
                                    className={cn(
                                        "absolute top-0 left-0 h-full transition-all duration-700 ease-out shadow-[2px_0_5px_rgba(0,0,0,0.1)]",
                                        isGoalReached ? "bg-emerald-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${progress}%` }}
                                    title={`En caisse: ${totalRealized.toLocaleString()} ${currencySymbol}`}
                                />
                            </div>
                        )}
                        
                        {/* Info Text */}
                        {hasTarget && !isGoalReached && (
                             <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                 <span>
                                     {isFullyScheduled ? (
                                        <span className="text-blue-600 flex items-center gap-1">
                                            <CalendarClock className="h-3 w-3" /> Entièrement planifié
                                        </span>
                                    ) : (
                                        <span>Planifié: {totalPlanned.toLocaleString()} {currencySymbol}</span>
                                    )}
                                 </span>
                                 <span>Reste: {(target - totalRealized).toLocaleString()} {currencySymbol}</span>
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