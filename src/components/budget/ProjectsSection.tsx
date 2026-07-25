// src/components/budget/ProjectsSection.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, PiggyBank, CalendarRange, X } from "lucide-react";
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
    case 'XOF': return 'CFA';
    case 'MAD': return 'DH';
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

  const [newLabel, setNewLabel] = useState('');
  const [newMonthly, setNewMonthly] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ Symbole de devise dynamique
  const currencySymbol = getCurrencySymbol(currency);

  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentRealYear = today.getFullYear();

  const getProjectStats = (projectId: string) => {
    // Report des années précédentes (Net : Alloué - Dépensé)
    const carryOver = projectCarryOvers[projectId] || 0;

    let totalPlanned = carryOver;
    let totalRealized = carryOver;

    MONTHS.forEach((month, index) => {
        const amount = yearlyData[month]?.[projectId] || 0;
        totalPlanned += amount;

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
    if (!newLabel.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      monthlyAmount: parseFloat(newMonthly) || 0,
      startDate: newStartDate || undefined,
      endDate: newEndDate || undefined,
    };

    onProjectsChange([...projects, newProject]);
    setNewLabel('');
    setNewMonthly('');
    setNewStartDate('');
    setNewEndDate('');
    setShowAddForm(false);
  };

  const removeProject = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette épargne ? Les montants déjà provisionnés dans le calendrier seront perdus.')) {
      onProjectsChange(projects.filter(p => p.id !== id));
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    onProjectsChange(
      projects.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const formatDateRange = (project: Project): string => {
    if (!project.startDate && !project.endDate) return 'Sans échéance — chaque mois';
    const fmt = (iso?: string) => iso ? new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '…';
    return `${fmt(project.startDate)} → ${fmt(project.endDate)}`;
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50/50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg text-indigo-900">Épargne particulière</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                 <p className="text-sm text-indigo-600/80 font-medium">
                    {projects.length} épargne{projects.length > 1 ? 's' : ''} récurrente{projects.length > 1 ? 's' : ''}
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
              {!showAddForm && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9 px-4"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nouvelle épargne
                </Button>
              )}
          </div>
        </div>

        <p className="text-xs text-indigo-600/70 mt-2">
          Un montant fixe mis de côté chaque mois (ex&nbsp;: 150&nbsp;{currencySymbol}/mois). Il est renseigné
          automatiquement dans le calendrier pour la période choisie — comme une charge, mais côté épargne.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={addProject}
            className="mb-4 p-4 rounded-xl border border-indigo-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ring-4 ring-indigo-50"
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-50">
                 <h4 className="text-sm font-semibold text-indigo-900">Nouvelle épargne particulière</h4>
                 <Button type="button" size="icon" variant="ghost" onClick={() => setShowAddForm(false)} className="h-6 w-6">
                    <X className="h-4 w-4 text-gray-400" />
                 </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="epargne-label" className="text-xs font-medium text-gray-500">Nom</Label>
                    <Input
                        id="epargne-label"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Ex: Apport maison, Voyage Japon..."
                        className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        required
                        autoFocus
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="epargne-monthly" className="text-xs font-medium text-gray-500">Montant mensuel ({currencySymbol})</Label>
                    <Input
                        id="epargne-monthly"
                        type="number"
                        value={newMonthly}
                        onChange={(e) => setNewMonthly(e.target.value)}
                        placeholder="Ex: 150"
                        className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors font-mono"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="epargne-start" className="text-xs font-medium text-gray-500">Date début (optionnel)</Label>
                    <Input
                        id="epargne-start"
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="epargne-end" className="text-xs font-medium text-gray-500">Date fin (optionnel)</Label>
                    <Input
                        id="epargne-end"
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-1" /> Créer
                </Button>
            </div>
          </form>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-indigo-300 text-sm border-2 border-dashed border-indigo-100 rounded-xl bg-white/30">
            <PiggyBank className="h-12 w-12 mb-3 opacity-20" />
            <p>Aucune épargne particulière pour le moment.</p>
            <p className="text-xs opacity-70 mt-1">Définissez un montant fixe à mettre de côté chaque mois.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const { totalRealized } = getProjectStats(project.id);
              const monthly = project.monthlyAmount ?? 0;
              const target = project.targetAmount || 0;
              const hasTarget = target > 0;
              const progress = hasTarget ? Math.min((totalRealized / target) * 100, 100) : 0;

              return (
                <div
                  key={project.id}
                  className="group relative flex flex-col justify-between p-5 rounded-xl border border-white bg-white shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
                >
                    {/* Top Row: Icon + Name + Delete */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 shadow-sm">
                                <PiggyBank className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <Input
                                    value={project.label}
                                    onChange={(e) => updateProject(project.id, { label: e.target.value })}
                                    className="h-auto p-0 border-0 bg-transparent text-base font-bold text-gray-900 focus-visible:ring-0 focus-visible:bg-gray-50 rounded px-1 -ml-1 truncate w-full hover:bg-gray-50/50 transition-colors"
                                />
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                                    <CalendarRange className="h-3 w-3" />
                                    <span className="truncate">{formatDateRange(project)}</span>
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

                    {/* Editable: monthly amount + dates */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Mensuel</Label>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        value={project.monthlyAmount ?? ''}
                                        onChange={(e) => updateProject(project.id, { monthlyAmount: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                        className="h-8 font-mono text-sm bg-gray-50/50 border-gray-200 focus:bg-white"
                                    />
                                    <span className="text-xs text-gray-400">{currencySymbol}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Début</Label>
                                <Input
                                    type="date"
                                    value={project.startDate || ''}
                                    onChange={(e) => updateProject(project.id, { startDate: e.target.value || undefined })}
                                    className="h-8 text-xs bg-gray-50/50 border-gray-200 focus:bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Fin</Label>
                                <Input
                                    type="date"
                                    value={project.endDate || ''}
                                    onChange={(e) => updateProject(project.id, { endDate: e.target.value || undefined })}
                                    className="h-8 text-xs bg-gray-50/50 border-gray-200 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* En caisse */}
                        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">En caisse</span>
                                <span className="text-xl font-bold tabular-nums tracking-tight text-gray-900">
                                    {totalRealized.toLocaleString()} <span className="text-sm font-medium text-gray-400">{currencySymbol}</span>
                                </span>
                            </div>
                            <div className="text-right text-[11px] text-gray-400">
                                <span className="font-medium text-indigo-600">{monthly.toLocaleString()} {currencySymbol}</span> / mois
                            </div>
                        </div>

                        {/* Optional legacy objectif progress */}
                        {hasTarget && (
                            <div className="space-y-1.5">
                                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-700 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                    <span>Objectif : {target.toLocaleString()} {currencySymbol}</span>
                                    <span>{progress.toFixed(0)}%</span>
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
