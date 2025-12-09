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
import { Lock, Unlock, MessageCircle, Plus, MessageSquarePlus } from "lucide-react";
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
  oneTimeIncomes: OneTimeIncomes;
  monthComments: MonthComments;
  projectComments: ProjectComments;
  lockedMonths: LockedMonths;
  onYearlyDataChange: (data: YearlyData) => void;
  onOneTimeIncomesChange: (data: OneTimeIncomes) => void;
  onMonthCommentsChange: (data: MonthComments) => void;
  onProjectCommentsChange: (data: ProjectComments) => void;
  onLockedMonthsChange: (data: LockedMonths) => void;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function MonthlyTable({
  currentYear,
  people,
  charges,
  projects,
  yearlyData,
  oneTimeIncomes,
  monthComments,
  projectComments,
  lockedMonths,
  onYearlyDataChange,
  onOneTimeIncomesChange,
  onMonthCommentsChange,
  onProjectCommentsChange,
  onLockedMonthsChange,
}: MonthlyTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [tempComment, setTempComment] = useState('');

  // Helpers for Project Comments
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

  const getMonthlySalaryTotal = () => {
    return people.reduce((sum, person) => sum + person.salary, 0);
  };

  const getMonthlyChargesTotal = () => {
    return charges.reduce((sum, charge) => sum + charge.amount, 0);
  };

  const getMonthProjectTotal = (month: string) => {
    const monthData = yearlyData[month] || {};
    return projects.reduce((sum, project) => {
      return sum + (monthData[project.id] || 0);
    }, 0);
  };

  const getMonthBalance = (month: string) => {
    const salaries = getMonthlySalaryTotal();
    const oneTime = oneTimeIncomes[month] || 0;
    const chargesTotal = getMonthlyChargesTotal();
    const projectsTotal = getMonthProjectTotal(month);
    
    return salaries + oneTime - chargesTotal - projectsTotal;
  };

  const updateProjectAmount = (month: string, projectId: string, amount: number) => {
    const newYearlyData = {
      ...yearlyData,
      [month]: {
        ...(yearlyData[month] || {}),
        [projectId]: amount,
      },
    };
    onYearlyDataChange(newYearlyData);
  };

  const updateOneTimeIncome = (month: string, amount: number) => {
    onOneTimeIncomesChange({
      ...oneTimeIncomes,
      [month]: amount,
    });
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

  return (
    <>
      <Card className="glass-card overflow-hidden animate-fade-in shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  {/* Fixed Column Header: Added z-20 and solid background */}
                  <th className="sticky left-0 z-20 bg-background px-4 py-4 text-left font-semibold text-foreground border-b-2 border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] min-w-[200px]">
                    Mois / Année {currentYear}
                  </th>
                  {MONTHS.map((month) => (
                    <th
                      key={month}
                      className="px-3 py-3 text-center font-semibold text-foreground min-w-[120px] border-b border-border"
                    >
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {/* Salaries Row */}
                <tr className="bg-success/5 hover:bg-success/10 transition-colors group">
                  <td className="sticky left-0 z-20 bg-background group-hover:bg-success/5 px-4 py-3 font-medium border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                    💰 Salaires
                  </td>
                  {MONTHS.map((month) => (
                    <td key={month} className="px-3 py-3 text-center">
                      <div className="text-sm font-semibold text-success">
                        +{getMonthlySalaryTotal().toLocaleString('fr-FR')} €
                      </div>
                    </td>
                  ))}
                </tr>

                {/* One-time Incomes Row */}
                <tr className="bg-success/5 hover:bg-success/10 transition-colors group">
                  <td className="sticky left-0 z-20 bg-background group-hover:bg-success/5 px-4 py-3 font-medium border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                    💸 Revenus ponctuels
                  </td>
                  {MONTHS.map((month) => {
                    const isLocked = lockedMonths[month];
                    return (
                      <td key={month} className="px-3 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={oneTimeIncomes[month] || ''}
                          onChange={(e) => updateOneTimeIncome(month, parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className={cn(
                            "text-center h-8 text-sm font-medium border-success/30 focus-visible:ring-success/30",
                            oneTimeIncomes[month] ? "text-success bg-success/10" : "bg-transparent",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                </tr>

                {/* Charges Row */}
                <tr className="bg-destructive/5 hover:bg-destructive/10 transition-colors group">
                  <td className="sticky left-0 z-20 bg-background group-hover:bg-destructive/5 px-4 py-3 font-medium border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                    📉 Charges fixes
                  </td>
                  {MONTHS.map((month) => (
                    <td key={month} className="px-3 py-3 text-center">
                      <div className="text-sm font-semibold text-destructive">
                        -{getMonthlyChargesTotal().toLocaleString('fr-FR')} €
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Separator */}
                <tr className="bg-muted/30">
                  <td colSpan={13} className="px-0 py-2">
                    <div className="sticky left-0 px-4 py-1 text-xs font-bold text-muted-foreground tracking-wider bg-muted/30">
                      PROJETS D'ÉPARGNE
                    </div>
                  </td>
                </tr>

                {/* Projects Rows */}
                {projects.map((project, index) => (
                  <tr
                    key={project.id}
                    className={cn(
                      "transition-colors group",
                      index % 2 === 0 ? "bg-card/30" : "bg-card/50",
                      "hover:bg-secondary/5"
                    )}
                  >
                    <td className={cn(
                      "sticky left-0 z-20 px-4 py-3 font-medium border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]",
                      index % 2 === 0 ? "bg-background group-hover:bg-secondary/5" : "bg-muted/10 group-hover:bg-secondary/5"
                    )}>
                      🎯 {project.label}
                    </td>
                    {MONTHS.map((month) => {
                      const isLocked = lockedMonths[month];
                      const amount = yearlyData[month]?.[project.id] || 0;
                      const comment = projectComments[month]?.[project.id];
                      
                      return (
                        <td key={month} className="px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={amount || ''}
                              onChange={(e) => updateProjectAmount(month, project.id, parseFloat(e.target.value) || 0)}
                              disabled={isLocked}
                              className={cn(
                                "text-center h-8 text-sm font-medium w-full min-w-[70px]",
                                amount > 0 ? "text-secondary font-bold bg-secondary/5 border-secondary/30" : "bg-transparent border-transparent hover:border-input",
                                isLocked && "opacity-50 cursor-not-allowed"
                              )}
                              placeholder="-"
                            />
                            
                            {/* Project Comment Popover */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={cn(
                                    "h-8 w-8 shrink-0 rounded-full",
                                    comment ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground/30 hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  {comment ? <MessageCircle className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}
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
                                    placeholder="Ajouter un détail..."
                                    className="h-20 text-sm resize-none"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Separator */}
                <tr className="bg-muted/30">
                  <td colSpan={13} className="px-0 py-1"></td>
                </tr>

                {/* Balance Row */}
                <tr className="bg-gradient-to-r from-primary/5 to-secondary/5 font-bold group">
                  <td className="sticky left-0 z-20 bg-background group-hover:bg-primary/5 px-4 py-4 text-primary border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                    💵 SOLDE FINAL
                  </td>
                  {MONTHS.map((month) => {
                    const balance = getMonthBalance(month);
                    const isPositive = balance >= 0;
                    
                    return (
                      <td key={month} className="px-3 py-3 text-center">
                        <div
                          className={cn(
                            "text-sm font-bold rounded-lg py-1.5 px-2 transition-all",
                            isPositive ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                          )}
                        >
                          {isPositive ? '+' : ''}{balance.toLocaleString('fr-FR')} €
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Actions Row */}
                <tr className="bg-muted/10">
                  <td className="sticky left-0 z-20 bg-background px-4 py-2 font-medium text-sm text-muted-foreground border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                    Actions
                  </td>
                  {MONTHS.map((month) => {
                    const isLocked = lockedMonths[month];
                    const hasComment = !!monthComments[month];
                    
                    return (
                      <td key={month} className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleMonthLock(month)}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              isLocked ? "text-warning bg-warning/10 hover:bg-warning/20" : "text-muted-foreground hover:bg-muted"
                            )}
                            title={isLocked ? "Déverrouiller le mois" : "Verrouiller le mois"}
                          >
                            {isLocked ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openCommentDialog(month)}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              hasComment ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground hover:bg-muted"
                            )}
                            title="Note générale du mois"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Empty state if no projects */}
          {projects.length === 0 && (
            <div className="text-center py-8 border-t bg-muted/10">
              <Plus className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                Ajoutez des projets d'épargne pour commencer à remplir le tableau
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Month Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commentaire - {selectedMonth}</DialogTitle>
            <DialogDescription>
              Ajoutez une note générale pour ce mois (ex: Prime reçue, Dépense imprévue...)
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
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="gradient" onClick={saveComment}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}