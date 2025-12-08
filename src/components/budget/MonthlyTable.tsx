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
} from "@/components/ui/dialog";
import { Lock, Unlock, MessageCircle, Plus } from "lucide-react";
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
  lockedMonths,
  onYearlyDataChange,
  onOneTimeIncomesChange,
  onMonthCommentsChange,
  onLockedMonthsChange,
}: MonthlyTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [tempComment, setTempComment] = useState('');

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
      <Card className="glass-card overflow-hidden animate-fade-in">
        <CardContent className="p-0">
          {/* Horizontal scroll container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b-2 border-border">
                <tr>
                  <th className="sticky left-0 z-10 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3 text-left font-semibold text-foreground">
                    Mois
                  </th>
                  {MONTHS.map((month) => (
                    <th
                      key={month}
                      className="px-3 py-3 text-center font-semibold text-foreground min-w-[120px]"
                    >
                      <div className="flex flex-col gap-1">
                        <span>{month}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {currentYear}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {/* Salaries Row */}
                <tr className="bg-success/5 hover:bg-success/10 transition-colors">
                  <td className="sticky left-0 z-10 bg-success/10 px-4 py-3 font-medium">
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
                <tr className="bg-success/5 hover:bg-success/10 transition-colors">
                  <td className="sticky left-0 z-10 bg-success/10 px-4 py-3 font-medium">
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
                            "text-center h-8 text-sm font-medium",
                            oneTimeIncomes[month] ? "text-success" : "",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                </tr>

                {/* Charges Row */}
                <tr className="bg-destructive/5 hover:bg-destructive/10 transition-colors">
                  <td className="sticky left-0 z-10 bg-destructive/10 px-4 py-3 font-medium">
                    📉 Charges
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
                  <td colSpan={13} className="px-4 py-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <div className="flex-1 border-t border-border" />
                      <span>PROJETS D'ÉPARGNE</span>
                      <div className="flex-1 border-t border-border" />
                    </div>
                  </td>
                </tr>

                {/* Projects Rows */}
                {projects.map((project, index) => (
                  <tr
                    key={project.id}
                    className={cn(
                      "hover:bg-secondary/5 transition-colors",
                      index % 2 === 0 ? "bg-card/30" : "bg-card/50"
                    )}
                  >
                    <td className="sticky left-0 z-10 bg-card px-4 py-3 font-medium border-r border-border/30">
                      🎯 {project.label}
                    </td>
                    {MONTHS.map((month) => {
                      const isLocked = lockedMonths[month];
                      const amount = yearlyData[month]?.[project.id] || 0;
                      
                      return (
                        <td key={month} className="px-3 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount || ''}
                            onChange={(e) => updateProjectAmount(month, project.id, parseFloat(e.target.value) || 0)}
                            disabled={isLocked}
                            className={cn(
                              "text-center h-8 text-sm font-medium",
                              amount > 0 ? "text-secondary" : "",
                              isLocked && "opacity-50 cursor-not-allowed"
                            )}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Separator */}
                <tr className="bg-muted/30">
                  <td colSpan={13} className="px-4 py-1">
                    <div className="border-t-2 border-border" />
                  </td>
                </tr>

                {/* Balance Row */}
                <tr className="bg-gradient-to-r from-primary/10 to-secondary/10 font-bold">
                  <td className="sticky left-0 z-10 bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-3">
                    💵 SOLDE
                  </td>
                  {MONTHS.map((month) => {
                    const balance = getMonthBalance(month);
                    const isPositive = balance >= 0;
                    
                    return (
                      <td key={month} className="px-3 py-3 text-center">
                        <div
                          className={cn(
                            "text-sm font-bold rounded-lg py-1 px-2",
                            isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                          )}
                        >
                          {isPositive ? '+' : ''}{balance.toLocaleString('fr-FR')} €
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Actions Row */}
                <tr className="bg-muted/20">
                  <td className="sticky left-0 z-10 bg-muted/30 px-4 py-2 font-medium text-sm">
                    Actions
                  </td>
                  {MONTHS.map((month) => {
                    const isLocked = lockedMonths[month];
                    const hasComment = !!monthComments[month];
                    
                    return (
                      <td key={month} className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleMonthLock(month)}
                            className={cn(
                              "h-7 w-7",
                              isLocked && "text-warning bg-warning/10"
                            )}
                            title={isLocked ? "Déverrouiller" : "Verrouiller"}
                          >
                            {isLocked ? (
                              <Lock className="h-3 w-3" />
                            ) : (
                              <Unlock className="h-3 w-3" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openCommentDialog(month)}
                            className={cn(
                              "h-7 w-7",
                              hasComment && "text-primary bg-primary/10"
                            )}
                            title="Commentaire"
                          >
                            <MessageCircle className="h-3 w-3" />
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
            <div className="text-center py-8 border-t">
              <Plus className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                Ajoutez des projets d'épargne pour les suivre mensuellement
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commentaire - {selectedMonth}</DialogTitle>
            <DialogDescription>
              Ajoutez une note ou un commentaire pour ce mois
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
            placeholder="Écrivez votre commentaire ici..."
            rows={4}
            className="resize-none"
          />
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="gradient" onClick={saveComment}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
