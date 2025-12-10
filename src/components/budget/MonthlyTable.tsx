import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, Unlock, MessageCircle, MessageSquarePlus, Settings2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Person,
  Charge,
  Project,
  YearlyData,
  OneTimeIncomes,
  MonthComments,
  ProjectComments,
  LockedMonths
} from '@/utils/importConverter';

interface MonthlyTableProps {
  currentYear: number;
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;
  yearlyExpenses: YearlyData;
  oneTimeIncomes: OneTimeIncomes;
  monthComments: MonthComments;
  projectComments: ProjectComments;
  lockedMonths: LockedMonths;
  onYearlyDataChange: (data: YearlyData) => void;
  onYearlyExpensesChange: (data: YearlyData) => void;
  onOneTimeIncomesChange: (data: OneTimeIncomes) => void;
  onMonthCommentsChange: (data: MonthComments) => void;
  onProjectCommentsChange: (data: ProjectComments) => void;
  onLockedMonthsChange: (data: LockedMonths) => void;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const GENERAL_SAVINGS_ID = 'epargne';

export default function MonthlyTable({
  currentYear,
  people,
  charges,
  projects,
  yearlyData,
  yearlyExpenses,
  oneTimeIncomes,
  monthComments,
  projectComments,
  lockedMonths,
  onYearlyDataChange,
  onYearlyExpensesChange,
  onOneTimeIncomesChange,
  onMonthCommentsChange,
  onProjectCommentsChange,
  onLockedMonthsChange,
}: MonthlyTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [tempComment, setTempComment] = useState('');
  
  // State to track which project columns are visible
  const [visibleProjectIds, setVisibleProjectIds] = useState<string[]>([]);

  // Initialize visibility when projects load
  useEffect(() => {
    const ids = projects.filter(p => p.id !== GENERAL_SAVINGS_ID).map(p => p.id);
    setVisibleProjectIds(prev => {
        if (prev.length === 0 && ids.length > 0) return ids;
        return prev;
    });
  }, [projects.length]);

  // --- Calculations ---
  const getMonthlyBaseIncome = () => people.reduce((sum, person) => sum + person.salary, 0);
  const getMonthlyChargesTotal = () => charges.reduce((sum, charge) => sum + charge.amount, 0);
  const getMonthlyOneTimeIncome = (month: string) => oneTimeIncomes[month] || 0;
  
  const getMonthlyAvailableSavings = (month: string) => {
    const baseIncome = getMonthlyBaseIncome();
    const oneTime = getMonthlyOneTimeIncome(month);
    const chargesTotal = getMonthlyChargesTotal();
    return baseIncome + oneTime - chargesTotal;
  };

  const getGeneralSavingsAllocation = (month: string) => {
    const available = getMonthlyAvailableSavings(month);
    const totalAllocatedToProjects = projects
      .filter(p => p.id !== GENERAL_SAVINGS_ID)
      .reduce((sum, project) => {
        const monthData = yearlyData[month] || {};
        return sum + (monthData[project.id] || 0);
      }, 0);
    return available - totalAllocatedToProjects;
  };

  const getCumulativeProjectTotal = (projectId: string, upToMonthIndex: number) => {
    let total = 0;
    for (let i = 0; i <= upToMonthIndex; i++) {
      const monthName = MONTHS[i];
      const allocation = yearlyData[monthName]?.[projectId] || 0;
      const expense = yearlyExpenses[monthName]?.[projectId] || 0;
      total += (allocation - expense);
    }
    return total;
  };

  const getCumulativeGeneralSavings = (upToMonthIndex: number) => {
    let total = 0;
    for (let i = 0; i <= upToMonthIndex; i++) {
      const monthName = MONTHS[i];
      const allocation = getGeneralSavingsAllocation(monthName);
      const expense = yearlyExpenses[monthName]?.[GENERAL_SAVINGS_ID] || 0;
      total += (allocation - expense);
    }
    return total;
  };

  // --- Updates ---
  const updateAllocation = (month: string, projectId: string, amount: number) => {
    const newYearlyData = {
      ...yearlyData,
      [month]: { ...(yearlyData[month] || {}), [projectId]: amount },
    };
    onYearlyDataChange(newYearlyData);
  };

  const updateExpense = (month: string, projectId: string, amount: number) => {
    const newExpensesData = {
      ...yearlyExpenses,
      [month]: { ...(yearlyExpenses[month] || {}), [projectId]: amount },
    };
    onYearlyExpensesChange(newExpensesData);
  };

  const updateOneTimeIncome = (month: string, amount: number) => {
    onOneTimeIncomesChange({ ...oneTimeIncomes, [month]: amount });
  };

  const updateProjectComment = (month: string, projectId: string, comment: string) => {
    const newComments = {
      ...projectComments,
      [month]: { ...(projectComments[month] || {}), [projectId]: comment }
    };
    onProjectCommentsChange(newComments);
  };

  const toggleMonthLock = (month: string) => {
    onLockedMonthsChange({ ...lockedMonths, [month]: !lockedMonths[month] });
  };

  const openCommentDialog = (month: string) => {
    setSelectedMonth(month);
    setTempComment(monthComments[month] || '');
    setCommentDialogOpen(true);
  };

  const saveComment = () => {
    if (!selectedMonth) return;
    onMonthCommentsChange({ ...monthComments, [selectedMonth]: tempComment });
    setCommentDialogOpen(false);
    setSelectedMonth(null);
    setTempComment('');
  };

  const standardProjects = projects.filter(p => p.id !== GENERAL_SAVINGS_ID);
  const visibleProjects = standardProjects.filter(p => visibleProjectIds.includes(p.id));

  const toggleProjectVisibility = (projectId: string) => {
    setVisibleProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <>
      <Card className="glass-card overflow-hidden animate-fade-in shadow-lg border-t-4 border-t-primary/20">
        
        {/* TABLE CONTROLS HEADER */}
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Tableau de Gestion
                </CardTitle>
                <Badge variant="outline" className="ml-2 font-normal text-muted-foreground">
                    {currentYear}
                </Badge>
            </div>

            {/* COLUMN VISIBILITY FILTER */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9 bg-background">
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Afficher/Masquer Projets</span>
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                            {visibleProjects.length}
                        </Badge>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Projets à afficher</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {standardProjects.length === 0 && (
                        <div className="p-2 text-xs text-muted-foreground text-center">
                            Aucun projet créé
                        </div>
                    )}
                    {standardProjects.map((project) => (
                        <DropdownMenuCheckboxItem
                            key={project.id}
                            checked={visibleProjectIds.includes(project.id)}
                            onCheckedChange={() => toggleProjectVisibility(project.id)}
                            // FIX: Prevent menu from closing on click
                            onSelect={(e) => e.preventDefault()}
                        >
                            {project.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  <th className="sticky left-0 z-20 bg-background px-4 py-4 text-left font-semibold text-foreground border-b border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] min-w-[160px]">
                    <div className="flex flex-col">
                      <span>Mois</span>
                    </div>
                  </th>
                  
                  {/* Fixed Columns */}
                  <th className="px-3 py-3 text-center font-medium text-success bg-success/5 border-b border-border border-r border-dashed border-border/50 min-w-[110px]">
                    Revenus
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-success bg-success/5 border-b border-border border-r border-dashed border-border/50 min-w-[120px]">
                    Ponctuels
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-destructive bg-destructive/5 border-b border-border border-r border-dashed border-border/50 min-w-[110px]">
                    Charges
                  </th>
                  <th className="px-3 py-3 text-center font-bold text-primary bg-primary/10 border-b border-border border-r-2 border-primary/20 min-w-[130px]">
                    Disponible
                  </th>

                  {/* Dynamic Project Columns (Only Visible Ones) */}
                  {visibleProjects.map((project) => (
                    <th 
                      key={project.id}
                      className="px-3 py-3 text-center font-semibold text-foreground border-b border-r border-border border-dashed min-w-[180px] bg-background"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="truncate max-w-[150px]" title={project.label}>{project.label}</span>
                        <div className="grid grid-cols-2 gap-2 w-full text-[10px] font-normal text-muted-foreground bg-muted/50 rounded px-2 py-0.5">
                          <span>Alloué</span>
                          <span>Dépensé</span>
                        </div>
                      </div>
                    </th>
                  ))}

                  <th className="px-3 py-3 text-center font-bold text-primary bg-primary/5 border-b border-border min-w-[180px]">
                     <div className="flex flex-col items-center gap-1">
                        <span>Épargne Générale</span>
                        <div className="grid grid-cols-2 gap-2 w-full text-[10px] font-normal text-primary/70 bg-primary/10 rounded px-2 py-0.5">
                           <span>Auto</span>
                           <span>Dépensé</span>
                        </div>
                    </div>
                  </th>
                  
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground border-b border-border min-w-[100px] sticky right-0 bg-background z-20 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                    
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {MONTHS.map((month, monthIndex) => {
                  const isLocked = lockedMonths[month];
                  const hasComment = !!monthComments[month];
                  const availableToSave = getMonthlyAvailableSavings(month);
                  const genSavingsAllocation = getGeneralSavingsAllocation(month);
                  const genSavingsExpense = yearlyExpenses[month]?.[GENERAL_SAVINGS_ID] || 0;
                  const genSavingsCumulative = getCumulativeGeneralSavings(monthIndex);
                  const genSavingsComment = projectComments[month]?.[GENERAL_SAVINGS_ID];

                  return (
                    <tr key={month} className="hover:bg-muted/30 transition-colors group">
                      
                      {/* 1. Sticky Month */}
                      <td className="sticky left-0 z-20 bg-background group-hover:bg-background px-4 py-3 border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] font-medium text-foreground">
                        {month}
                        <div className="text-[10px] text-muted-foreground font-normal">
                            {isLocked ? 'Verrouillé' : 'Ouvert'}
                        </div>
                      </td>

                      {/* 2. Base Income */}
                      <td className="px-3 py-3 text-center bg-success/5 text-sm font-medium text-success border-r border-dashed border-border/50">
                        +{getMonthlyBaseIncome().toLocaleString()}
                      </td>

                      {/* 3. One Time Income */}
                      <td className="px-3 py-3 bg-success/5 border-r border-dashed border-border/50">
                        <Input
                          type="number"
                          min="0"
                          value={oneTimeIncomes[month] || ''}
                          onChange={(e) => updateOneTimeIncome(month, parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className={cn(
                            "text-center h-8 text-sm font-medium border-success/20 focus-visible:ring-success/30 bg-background hover:bg-white shadow-sm",
                            oneTimeIncomes[month] ? "text-success font-bold" : "text-muted-foreground",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                          placeholder="-"
                        />
                      </td>

                      {/* 4. Charges */}
                      <td className="px-3 py-3 text-center bg-destructive/5 text-sm font-medium text-destructive border-r border-dashed border-border/50">
                        -{getMonthlyChargesTotal().toLocaleString()}
                      </td>

                      {/* 5. Disponible */}
                      <td className="px-3 py-3 text-center font-bold text-primary bg-primary/10 border-r-2 border-primary/20">
                        {availableToSave.toLocaleString()} €
                      </td>

                      {/* 6. Visible Projects */}
                      {visibleProjects.map((project) => {
                        const allocation = yearlyData[month]?.[project.id] || 0;
                        const expense = yearlyExpenses[month]?.[project.id] || 0;
                        const comment = projectComments[month]?.[project.id];
                        const cumulative = getCumulativeProjectTotal(project.id, monthIndex);

                        return (
                          <td key={project.id} className="px-2 py-2 border-r border-dashed border-border/50">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  value={allocation || ''}
                                  onChange={(e) => updateAllocation(month, project.id, parseFloat(e.target.value) || 0)}
                                  disabled={isLocked}
                                  className={cn(
                                    "text-center h-8 text-sm px-1 font-medium bg-background border-primary/20 focus-visible:ring-primary/30 shadow-sm",
                                    allocation > 0 && "text-primary font-bold bg-primary/5",
                                    isLocked && "opacity-50"
                                  )}
                                  placeholder="0"
                                />
                                <Input
                                  type="number"
                                  min="0"
                                  value={expense || ''}
                                  onChange={(e) => updateExpense(month, project.id, parseFloat(e.target.value) || 0)}
                                  disabled={isLocked}
                                  className={cn(
                                    "text-center h-8 text-sm px-1 font-medium bg-background border-destructive/20 focus-visible:ring-destructive/30 shadow-sm",
                                    expense > 0 && "text-destructive font-bold bg-destructive/5",
                                    isLocked && "opacity-50"
                                  )}
                                  placeholder="0"
                                />
                              </div>

                              <div className="flex items-center justify-between px-1">
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded" title="Total Cumulé">
                                  <span>∑</span>
                                  <span className={cumulative >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                                    {cumulative.toLocaleString()}
                                  </span>
                                </div>

                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className={cn(
                                        "h-5 w-5 rounded-full p-0 transition-colors",
                                        comment ? "text-primary bg-primary/10" : "text-muted-foreground/30 hover:text-foreground hover:bg-muted"
                                      )}
                                    >
                                       {comment ? <MessageCircle className="h-3 w-3" /> : <MessageSquarePlus className="h-3 w-3" />}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-3">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-xs text-muted-foreground mb-1">
                                         Note pour {project.label} ({month})
                                      </h4>
                                      <Textarea 
                                        value={comment || ''}
                                        onChange={(e) => updateProjectComment(month, project.id, e.target.value)}
                                        placeholder="Détail..."
                                        className="h-20 text-sm resize-none"
                                      />
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      {/* 7. Epargne Générale */}
                      <td className="px-2 py-2 bg-primary/5">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1">
                                <Input
                                    type="text"
                                    value={genSavingsAllocation.toLocaleString()}
                                    disabled
                                    className="text-center h-8 text-sm px-1 font-bold bg-primary/10 border-primary/20 text-primary cursor-default shadow-none"
                                    title="Calculé automatiquement (Revenus - Charges - Projets)"
                                  />
                                <Input
                                    type="number"
                                    min="0"
                                    value={genSavingsExpense || ''}
                                    onChange={(e) => updateExpense(month, GENERAL_SAVINGS_ID, parseFloat(e.target.value) || 0)}
                                    disabled={isLocked}
                                    className={cn(
                                        "text-center h-8 text-sm px-1 font-medium bg-background border-destructive/20 focus-visible:ring-destructive/30 shadow-sm",
                                        genSavingsExpense > 0 && "text-destructive font-bold bg-destructive/5",
                                        isLocked && "opacity-50"
                                    )}
                                    placeholder="0"
                                    title="Dépense imprévue"
                                />
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded" title="Total Cumulé Epargne Générale">
                                    <span>∑</span>
                                    <span className={genSavingsCumulative >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                                    {genSavingsCumulative.toLocaleString()}
                                    </span>
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={cn(
                                        "h-5 w-5 rounded-full p-0 transition-colors",
                                        genSavingsComment ? "text-primary bg-primary/10" : "text-muted-foreground/30 hover:text-foreground hover:bg-muted"
                                        )}
                                   >
                                        {genSavingsComment ? <MessageCircle className="h-3 w-3" /> : <MessageSquarePlus className="h-3 w-3" />}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-3">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-xs text-muted-foreground mb-1">
                                           Note pour Épargne Générale ({month})
                                        </h4>
                                        <Textarea 
                                        value={genSavingsComment || ''}
                                        onChange={(e) => updateProjectComment(month, GENERAL_SAVINGS_ID, e.target.value)}
                                        placeholder="Détail..."
                                        className="h-20 text-sm resize-none"
                                        />
                                    </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                      </td>

                      {/* 8. Actions Sticky Right */}
                      <td className="px-3 py-2 sticky right-0 z-20 bg-background group-hover:bg-background shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] border-l border-border">
                         <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleMonthLock(month)}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              isLocked ? "text-warning bg-warning/10 hover:bg-warning/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            title={isLocked ? "Déverrouiller" : "Verrouiller"}
                          >
                            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          </Button>
                          
                          <Button
                              variant="ghost"
                            size="icon-sm"
                            onClick={() => openCommentDialog(month)}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              hasComment ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            title="Commentaire global"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commentaire - {selectedMonth}</DialogTitle>
            <DialogDescription>
              Ajoutez une note générale pour ce mois.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
            placeholder="Écrivez votre commentaire ici..."
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>Annuler</Button>
            <Button variant="gradient" onClick={saveComment}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}