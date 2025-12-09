import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Lock, Unlock, MessageCircle, MessageSquarePlus } from "lucide-react";
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
  yearlyData: YearlyData;     // Allocations
  yearlyExpenses: YearlyData; // Expenses
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

// Matches your JSON ID exactly
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

  // --- Calculations ---

  const getMonthlyBaseIncome = () => {
    return people.reduce((sum, person) => sum + person.salary, 0);
  };

  const getMonthlyChargesTotal = () => {
    return charges.reduce((sum, charge) => sum + charge.amount, 0);
  };

  const getMonthlyOneTimeIncome = (month: string) => {
    return oneTimeIncomes[month] || 0;
  };

  // Money available to be saved (Income + OneTime - Charges)
  const getMonthlyAvailableSavings = (month: string) => {
    const baseIncome = getMonthlyBaseIncome();
    const oneTime = getMonthlyOneTimeIncome(month);
    const chargesTotal = getMonthlyChargesTotal();
    return baseIncome + oneTime - chargesTotal;
  };

  // Epargne Générale = Available - Total Allocated to OTHER Projects
  const getGeneralSavingsAllocation = (month: string) => {
    const available = getMonthlyAvailableSavings(month);
    
    // Filter out the 'epargne' project so we don't double count if it has a value in DB
    const totalAllocatedToProjects = projects
      .filter(p => p.id !== GENERAL_SAVINGS_ID)
      .reduce((sum, project) => {
        const monthData = yearlyData[month] || {};
        return sum + (monthData[project.id] || 0);
      }, 0);
    
    return available - totalAllocatedToProjects;
  };

  // Cumulative Total Logic (Generic for Projects)
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

  // Cumulative Total Logic (Specific for General Savings)
  const getCumulativeGeneralSavings = (upToMonthIndex: number) => {
    let total = 0;
    for (let i = 0; i <= upToMonthIndex; i++) {
      const monthName = MONTHS[i];
      // Allocation is calculated automatically
      const allocation = getGeneralSavingsAllocation(monthName);
      // Expense is manual (read from yearlyExpenses using the correct ID)
      const expense = yearlyExpenses[monthName]?.[GENERAL_SAVINGS_ID] || 0;
      total += (allocation - expense);
    }
    return total;
  };

  // --- Updates ---

  const updateAllocation = (month: string, projectId: string, amount: number) => {
    const newYearlyData = {
      ...yearlyData,
      [month]: {
        ...(yearlyData[month] || {}),
        [projectId]: amount,
      },
    };
    onYearlyDataChange(newYearlyData);
  };

  const updateExpense = (month: string, projectId: string, amount: number) => {
    const newExpensesData = {
      ...yearlyExpenses,
      [month]: {
        ...(yearlyExpenses[month] || {}),
        [projectId]: amount,
      },
    };
    onYearlyExpensesChange(newExpensesData);
  };

  const updateOneTimeIncome = (month: string, amount: number) => {
    onOneTimeIncomesChange({
      ...oneTimeIncomes,
      [month]: amount,
    });
  };

  const updateProjectComment = (month: string, projectId: string, comment: string) => {
    const newComments = {
      ...projectComments,
      [month]: {
        ...(projectComments[month] || {}),
        [projectId]: comment
      }
    };
    onProjectCommentsChange(newComments);
  };

  const toggleMonthLock = (month: string) => {
    onLockedMonthsChange({
      ...lockedMonths,
      [month]: !lockedMonths[month],
    });
  };

  const openCommentDialog = (month: string) => {
    setSelectedMonth(month);
    setTempComment(monthComments[month] || '');
    setCommentDialogOpen(true);
  };

  const saveComment = () => {
    if (!selectedMonth) return;
    onMonthCommentsChange({
      ...monthComments,
      [selectedMonth]: tempComment,
    });
    setCommentDialogOpen(false);
    setSelectedMonth(null);
    setTempComment('');
  };

  // Filter projects to exclude "epargne" from the dynamic columns
  const standardProjects = projects.filter(p => p.id !== GENERAL_SAVINGS_ID);

  return (
    <>
      <Card className="glass-card overflow-hidden animate-fade-in shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  {/* Fixed Month Column */}
                  <th className="sticky left-0 z-30 bg-background px-4 py-4 text-left font-semibold text-foreground border-b-2 border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] min-w-[180px]">
                    <div className="flex flex-col">
                      <span>Mois {currentYear}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Revenus & Charges Fixes</span>
                    </div>
                  </th>
                  
                  {/* Standard Categories */}
                  <th className="px-3 py-3 text-center font-semibold text-success bg-success/5 border-b border-border min-w-[100px]">
                    Revenus<br/><span className="text-[10px] font-normal opacity-70">Salaires</span>
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-success bg-success/5 border-b border-border min-w-[120px]">
                    Ponctuels<br/><span className="text-[10px] font-normal opacity-70">Primes, etc.</span>
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-destructive bg-destructive/5 border-b border-border min-w-[100px]">
                    Charges<br/><span className="text-[10px] font-normal opacity-70">Fixes</span>
                  </th>

                  {/* NEW COLUMN: Disponible à dispatcher */}
                  <th className="px-3 py-3 text-center font-bold text-primary bg-primary/10 border-b border-border min-w-[120px]">
                    Disponible<br/><span className="text-[10px] font-normal opacity-70">À allouer</span>
                  </th>

                  {/* Dynamic Project Columns (Filtered to exclude Epargne) */}
                  {standardProjects.map((project) => (
                    <th 
                      key={project.id}
                      className="px-3 py-3 text-center font-semibold text-foreground border-b border-border bg-background min-w-[190px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>🎯 {project.label}</span>
                        <div className="grid grid-cols-2 gap-2 w-full text-[10px] font-normal text-muted-foreground bg-muted/30 rounded px-2 py-0.5">
                          <span title="Montant alloué">Alloué</span>
                          <span title="Montant dépensé">Dépensé</span>
                        </div>
                      </div>
                    </th>
                  ))}

                  {/* Epargne Générale */}
                  <th className="px-3 py-3 text-center font-bold text-primary bg-primary/5 border-b border-border min-w-[190px]">
                    <div className="flex flex-col items-center gap-1">
                        <span>💰 Épargne Générale</span>
                        <div className="grid grid-cols-2 gap-2 w-full text-[10px] font-normal text-primary/70 bg-primary/10 rounded px-2 py-0.5">
                          <span title="Reste du budget (Auto)">Auto</span>
                          <span title="Dépenses imprévues">Dépensé</span>
                        </div>
                    </div>
                  </th>
                  
                  {/* Actions */}
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground border-b border-border min-w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {MONTHS.map((month, monthIndex) => {
                  const isLocked = lockedMonths[month];
                  const hasComment = !!monthComments[month];
                  
                  // Calculations
                  const availableToSave = getMonthlyAvailableSavings(month);
                  const genSavingsAllocation = getGeneralSavingsAllocation(month);
                  const genSavingsExpense = yearlyExpenses[month]?.[GENERAL_SAVINGS_ID] || 0;
                  const genSavingsCumulative = getCumulativeGeneralSavings(monthIndex);
                  const genSavingsComment = projectComments[month]?.[GENERAL_SAVINGS_ID];

                  return (
                    <tr key={month} className="hover:bg-muted/20 transition-colors group">
                      
                      {/* 1. Sticky Month */}
                      <td className="sticky left-0 z-20 bg-background group-hover:bg-muted/20 px-4 py-3 border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                        <span className="font-medium text-foreground">{month}</span>
                      </td>

                      {/* 2. Base Income */}
                      <td className="px-3 py-3 text-center bg-success/5 group-hover:bg-success/10 transition-colors text-sm font-medium text-success">
                        +{getMonthlyBaseIncome().toLocaleString()}
                      </td>

                      {/* 3. One Time Income */}
                      <td className="px-3 py-3 bg-success/5 group-hover:bg-success/10 transition-colors">
                        <Input
                          type="number"
                          min="0"
                          value={oneTimeIncomes[month] || ''}
                          onChange={(e) => updateOneTimeIncome(month, parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className={cn(
                            "text-center h-8 text-sm font-medium border-success/30 focus-visible:ring-success/30 bg-background",
                            oneTimeIncomes[month] ? "text-success font-bold" : "text-muted-foreground",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                          placeholder="-"
                        />
                      </td>

                      {/* 4. Charges */}
                      <td className="px-3 py-3 text-center bg-destructive/5 group-hover:bg-destructive/10 transition-colors text-sm font-medium text-destructive">
                        -{getMonthlyChargesTotal().toLocaleString()}
                      </td>

                      {/* 5. NEW COLUMN: Disponible */}
                      <td className="px-3 py-3 text-center font-bold text-primary bg-primary/10 border-r border-primary/20">
                        {availableToSave.toLocaleString()} €
                      </td>

                      {/* 6. Projects (Filtered: NO Epargne here) */}
                      {standardProjects.map((project) => {
                        const allocation = yearlyData[month]?.[project.id] || 0;
                        const expense = yearlyExpenses[month]?.[project.id] || 0;
                        const comment = projectComments[month]?.[project.id];
                        const cumulative = getCumulativeProjectTotal(project.id, monthIndex);

                        return (
                          <td key={project.id} className="px-2 py-2">
                            <div className="flex flex-col gap-1.5">
                              {/* Input Pair */}
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  value={allocation || ''}
                                  onChange={(e) => updateAllocation(month, project.id, parseFloat(e.target.value) || 0)}
                                  disabled={isLocked}
                                  className={cn(
                                    "text-center h-8 text-sm px-1 font-medium bg-background border-primary/20 focus-visible:ring-primary/30",
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
                                    "text-center h-8 text-sm px-1 font-medium bg-background border-destructive/20 focus-visible:ring-destructive/30",
                                    expense > 0 && "text-destructive font-bold bg-destructive/5",
                                    isLocked && "opacity-50"
                                  )}
                                  placeholder="0"
                                />
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between px-1">
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/20 px-1.5 py-0.5 rounded" title="Total Cumulé">
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
                                        "h-5 w-5 rounded-full p-0",
                                        comment ? "text-primary bg-primary/10" : "text-muted-foreground/30 hover:text-foreground"
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

                      {/* 7. Epargne Générale (Auto Calculated + Manual Expense) */}
                      <td className="px-2 py-2 border-l border-border bg-primary/5">
                        <div className="flex flex-col gap-1.5">
                            {/* Input Pair */}
                            <div className="flex items-center gap-1">
                                {/* Auto Allocation (Read Only) */}
                                <Input
                                    type="text"
                                    value={genSavingsAllocation.toLocaleString()}
                                    disabled
                                    className={cn(
                                        "text-center h-8 text-sm px-1 font-bold bg-primary/10 border-primary/20 text-primary cursor-default",
                                    )}
                                    title="Calculé automatiquement (Revenus - Charges - Projets)"
                                />
                                {/* Manual Expense */}
                                <Input
                                    type="number"
                                    min="0"
                                    value={genSavingsExpense || ''}
                                    onChange={(e) => updateExpense(month, GENERAL_SAVINGS_ID, parseFloat(e.target.value) || 0)}
                                    disabled={isLocked}
                                    className={cn(
                                        "text-center h-8 text-sm px-1 font-medium bg-background border-destructive/20 focus-visible:ring-destructive/30",
                                        genSavingsExpense > 0 && "text-destructive font-bold bg-destructive/5",
                                        isLocked && "opacity-50"
                                    )}
                                    placeholder="0"
                                    title="Dépense imprévue"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-1">
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/20 px-1.5 py-0.5 rounded" title="Total Cumulé Epargne Générale">
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
                                        "h-5 w-5 rounded-full p-0",
                                        genSavingsComment ? "text-primary bg-primary/10" : "text-muted-foreground/30 hover:text-foreground"
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

                      {/* 8. Actions */}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleMonthLock(month)}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              isLocked ? "text-warning bg-warning/10" : "text-muted-foreground hover:bg-muted"
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
                              hasComment ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
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

      {/* Global Month Comment Dialog */}
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