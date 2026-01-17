// src/components/budget/MonthlyTable.tsx
// VERSION SIMPLE - DROPDOWN COMPACT ET INTUITIF
// ✅ CORRIGÉ : Ajout prop currency et utilisation cohérente

import { useState, useEffect, useCallback } from 'react';
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
import { Lock, Unlock, MessageCircle, MessageSquarePlus, Settings2, Eye, CheckSquare, Square, ChevronLeft, ChevronRight, Info } from "lucide-react";
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

// Debounced Input Component
const DebouncedInput = ({ value, onChange, type = "text", className, placeholder, disabled }: { 
    value: string | number; 
    onChange: (val: number) => void; 
    type?: string; 
    className?: string; 
    placeholder?: string;
    disabled?: boolean;
}) => {
    const [localValue, setLocalValue] = useState<string | number>(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        const num = parseFloat(localValue.toString());
        if (num !== value) {
            onChange(isNaN(num) ? 0 : num);
        }
    };

    return (
        <Input 
            type={type}
            value={localValue} 
            onChange={(e) => setLocalValue(e.target.value)} 
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className={className} 
            placeholder={placeholder}
            disabled={disabled}
        />
    );
};

// Debounced Textarea Component
const DebouncedTextarea = ({ value, onChange, className, placeholder, ...props }: { 
    value: string; 
    onChange: (val: string) => void; 
    className?: string; 
    placeholder?: string;
    [key: string]: any;
}) => {
    const [localValue, setLocalValue] = useState<string>(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onChange(localValue);
        }
    };

    return (
        <Textarea 
            value={localValue} 
            onChange={(e) => setLocalValue(e.target.value)} 
            onBlur={handleBlur}
            className={className} 
            placeholder={placeholder}
            {...props}
        />
    );
};

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
  onYearChange: (year: number) => void;
  projectCarryOvers?: Record<string, number>;
  customChargeTotalCalculator?: (monthIndex: number) => number;
  currency?: string; // ✅ AJOUTÉ
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
const GENERAL_SAVINGS_ID = 'epargne';

const isChargeActive = (charge: Charge, year: number, monthIndex: number): boolean => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    if (charge.startDate) {
        const start = new Date(charge.startDate);
        if (start > monthEnd) return false;
    }
    if (charge.endDate) {
        const end = new Date(charge.endDate);
        if (end < monthStart) return false;
    }
    return true;
};

const isPersonActive = (person: Person, year: number, monthIndex: number): boolean => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    if (person.startDate) {
        const start = new Date(person.startDate);
        if (start > monthEnd) return false;
    }
    if (person.endDate) {
        const end = new Date(person.endDate);
        if (end < monthStart) return false;
    }
    return true;
};

// ✅ HELPER: Get correct symbol for any currency code
function getCurrencySymbol(code?: string): string {
  switch (code) {
    case 'USD': return '$';
    case 'CAD': return '$';
    case 'GBP': return '£';
    case 'CHF': return 'CHF';
    case 'EUR': return '€';
    default: return '€'; // Default fallback
  }
}

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
  onYearChange,
  projectCarryOvers = {},
  customChargeTotalCalculator,
  currency = 'EUR' // ✅ AJOUTÉ avec valeur par défaut
}: MonthlyTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [tempComment, setTempComment] = useState('');
  
  // ✅ Symbole de devise dynamique
  const currencySymbol = getCurrencySymbol(currency);
  
  // ✅ DEFAULT: Tout désélectionné par défaut
  const [visibleProjectIds, setVisibleProjectIds] = useState<string[]>([]);
  const [showIncome, setShowIncome] = useState(false); 
  const [showOneTime, setShowOneTime] = useState(false);
  const [showCharges, setShowCharges] = useState(false);

  // Calculations
  const getMonthlyBaseIncome = (monthIndex: number) => {
    return people.reduce((sum, person) => {
      if (!isPersonActive(person, currentYear, monthIndex)) {
        return sum;
      }
      return sum + person.salary;
    }, 0);
  };
  
  const getMonthlyChargesTotal = (monthIndex: number) => {
    if (customChargeTotalCalculator) {
        return customChargeTotalCalculator(monthIndex);
    }
    return charges.reduce((sum, charge) => {
        return isChargeActive(charge, currentYear, monthIndex) ? sum + charge.amount : sum;
    }, 0);
  };

  const getMonthlyOneTimeIncome = (month: string) => oneTimeIncomes[month] || 0;
  
  const getMonthlyAvailableSavings = (month: string, monthIndex: number) => {
    const baseIncome = getMonthlyBaseIncome(monthIndex);
    const oneTime = getMonthlyOneTimeIncome(month);
    const chargesTotal = getMonthlyChargesTotal(monthIndex);
    return baseIncome + oneTime - chargesTotal;
  };

  const getGeneralSavingsAllocation = (month: string, monthIndex: number) => {
    const available = getMonthlyAvailableSavings(month, monthIndex);
    const totalAllocatedToProjects = projects
      .filter(p => p.id !== GENERAL_SAVINGS_ID)
      .reduce((sum, project) => {
        const monthData = yearlyData[month] || {};
        return sum + (monthData[project.id] || 0);
      }, 0);
    return available - totalAllocatedToProjects;
  };

  const getCumulativeProjectTotal = (projectId: string, upToMonthIndex: number) => {
    let total = projectCarryOvers[projectId] || 0;
    for (let i = 0; i <= upToMonthIndex; i++) {
      const monthName = MONTHS[i];
      const allocation = yearlyData[monthName]?.[projectId] || 0;
      const expense = yearlyExpenses[monthName]?.[projectId] || 0;
      total += (allocation - expense);
    }
    return total;
  };

  const getCumulativeGeneralSavings = (upToMonthIndex: number) => {
    let total = projectCarryOvers[GENERAL_SAVINGS_ID] || 0;
    for (let i = 0; i <= upToMonthIndex; i++) {
      const monthName = MONTHS[i];
      const allocation = getGeneralSavingsAllocation(monthName, i);
      const expense = yearlyExpenses[monthName]?.[GENERAL_SAVINGS_ID] || 0;
      total += (allocation - expense);
    }
    return total;
  };

  // Updates
  const updateAllocation = useCallback((month: string, projectId: string, amount: number) => {
    onYearlyDataChange({
      ...yearlyData,
      [month]: { ...(yearlyData[month] || {}), [projectId]: amount },
    });
  }, [yearlyData, onYearlyDataChange]);

  const updateExpense = useCallback((month: string, projectId: string, amount: number) => {
    onYearlyExpensesChange({
      ...yearlyExpenses,
      [month]: { ...(yearlyExpenses[month] || {}), [projectId]: amount },
    });
  }, [yearlyExpenses, onYearlyExpensesChange]);

  const updateOneTimeIncome = useCallback((month: string, amount: number) => {
    onOneTimeIncomesChange({ ...oneTimeIncomes, [month]: amount });
  }, [oneTimeIncomes, onOneTimeIncomesChange]);

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

  const showAllProjects = () => setVisibleProjectIds(standardProjects.map(p => p.id));
  const hideAllProjects = () => setVisibleProjectIds([]);

  // Count visible columns
  const visibleColumnsCount = 
    (showIncome ? 1 : 0) + 
    (showOneTime ? 1 : 0) + 
    (showCharges ? 1 : 0) + 
    visibleProjects.length;

  return (
    <>
      <Card className="glass-card overflow-hidden animate-fade-in shadow-lg border-t-4 border-t-primary/20">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <span className="hidden sm:inline">Tableau de Gestion</span>
                </CardTitle>
                
                {/* Year Selector */}
                <div className="flex items-center gap-1 bg-background rounded-lg border p-0.5">
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onYearChange(currentYear - 1)} title="Année précédente">
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Badge variant="secondary" className="h-6 px-2 font-mono text-xs">
                        {currentYear}
                    </Badge>
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onYearChange(currentYear + 1)} title="Année suivante">
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* ✅ DROPDOWN SIMPLE ET COMPACT */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Affichage</span>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            {visibleColumnsCount}
                        </Badge>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {/* Colonnes Standards */}
                    <DropdownMenuLabel className="text-xs">Colonnes Standards</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem 
                        checked={showIncome} 
                        onCheckedChange={setShowIncome}
                        onSelect={(e) => e.preventDefault()}
                    >
                        Revenus
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                        checked={showOneTime} 
                        onCheckedChange={setShowOneTime}
                        onSelect={(e) => e.preventDefault()}
                    >
                        Revenus (Ponctuels)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                        checked={showCharges} 
                        onCheckedChange={setShowCharges}
                        onSelect={(e) => e.preventDefault()}
                    >
                        Charges
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Projets */}
                    <DropdownMenuLabel className="text-xs flex items-center justify-between">
                        <span>Projets</span>
                        <div className="flex gap-1">
                            <button 
                                onClick={(e) => { e.preventDefault(); showAllProjects(); }}
                                className="text-[10px] text-muted-foreground hover:text-foreground px-1"
                            >
                                Tout
                            </button>
                            <span className="text-muted-foreground">|</span>
                            <button 
                                onClick={(e) => { e.preventDefault(); hideAllProjects(); }}
                                className="text-[10px] text-muted-foreground hover:text-foreground px-1"
                            >
                                Aucun
                            </button>
                        </div>
                    </DropdownMenuLabel>
                    
                    {standardProjects.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-center text-muted-foreground">
                            Aucun projet
                        </div>
                    ) : (
                        <div className="max-h-[200px] overflow-y-auto">
                            {standardProjects.map((project) => (
                                <DropdownMenuCheckboxItem 
                                    key={project.id}
                                    checked={visibleProjectIds.includes(project.id)} 
                                    onCheckedChange={() => toggleProjectVisibility(project.id)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {project.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          {/* Info message when no columns visible */}
          {visibleColumnsCount === 0 && (
            <div className="m-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                💡 Cliquez sur <strong>"Affichage"</strong> pour sélectionner les colonnes à afficher
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/30 text-xs">
                <tr>
                  <th className="sticky left-0 z-20 bg-background px-2 py-3 text-left font-semibold text-foreground border-b border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] w-[140px] sm:w-[100px] min-w-[140px] sm:min-w-[100px]">
                    <div className="flex flex-col gap-0.5">
                      <span>Mois</span>
                      <span className="text-[9px] font-normal text-muted-foreground">Actions</span>
                    </div>
                  </th>
                  {showIncome && <th className="px-2 py-3 text-center font-medium text-success bg-success/5 border-b border-border border-r border-dashed border-border/50 min-w-[90px]">Revenus</th>}
                  {showOneTime && <th className="px-2 py-3 text-center font-medium text-success bg-success/5 border-b border-border border-r border-dashed border-border/50 min-w-[100px]">Ponctuels</th>}
                  {showCharges && <th className="px-2 py-3 text-center font-medium text-destructive bg-destructive/5 border-b border-border border-r border-dashed border-border/50 min-w-[90px]">Charges</th>}
                  <th className="px-2 py-3 text-center font-bold text-primary bg-primary/10 border-b border-border border-r-2 border-primary/20 min-w-[110px]">Disponible</th>
                  {visibleProjects.map((project) => (
                    <th key={project.id} className="px-2 py-3 text-center font-semibold text-foreground border-b border-r border-border border-dashed min-w-[160px] bg-background">
                      <div className="flex flex-col items-center gap-1">
                        <span className="truncate max-w-[140px]" title={project.label}>{project.label}</span>
                        <div className="grid grid-cols-2 gap-1 w-full text-[9px] font-normal text-muted-foreground bg-muted/50 rounded px-1 py-0.5">
                          <span>Alloué</span><span>Dépensé</span>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center font-bold text-primary bg-primary/5 border-b border-border min-w-[160px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>Épargne Générale</span>
                        <div className="grid grid-cols-2 gap-1 w-full text-[9px] font-normal text-primary/70 bg-primary/10 rounded px-1 py-0.5">
                            <span>Auto</span><span>Dépensé</span>
                        </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {MONTHS.map((month, monthIndex) => {
                  const isLocked = lockedMonths[month];
                  const hasComment = !!monthComments[month];
                  const baseIncome = getMonthlyBaseIncome(monthIndex);
                  const chargesTotal = getMonthlyChargesTotal(monthIndex);
                  const availableToSave = getMonthlyAvailableSavings(month, monthIndex);
                  const genSavingsAllocation = getGeneralSavingsAllocation(month, monthIndex);
                  const genSavingsExpense = yearlyExpenses[month]?.[GENERAL_SAVINGS_ID] || 0;
                  const genSavingsCumulative = getCumulativeGeneralSavings(monthIndex);
                  const genSavingsComment = projectComments[month]?.[GENERAL_SAVINGS_ID];

                  return (
                    <tr key={month} className="hover:bg-muted/30 transition-colors group">
                      <td className="sticky left-0 z-20 bg-background group-hover:bg-muted/30 px-2 py-2 border-r border-border shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col gap-1">
                            <div className="truncate text-sm font-semibold text-foreground" title={month}>{month}</div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => toggleMonthLock(month)} className={cn("h-9 w-9 sm:h-5 sm:w-5 rounded-md transition-all", isLocked ? "text-warning bg-warning/10" : "text-muted-foreground/50 hover:text-foreground")}>
                                    {isLocked ? <Lock className="h-4 w-4 sm:h-3 sm:w-3" /> : <Unlock className="h-4 w-4 sm:h-3 sm:w-3" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openCommentDialog(month)} className={cn("h-9 w-9 sm:h-5 sm:w-5 rounded-md transition-all", hasComment ? "text-primary bg-primary/10" : "text-muted-foreground/50 hover:text-foreground")}>
                                    <MessageCircle className="h-4 w-4 sm:h-3 sm:w-3" />
                                </Button>
                            </div>
                        </div>
                      </td>
                      {showIncome && <td className="px-2 py-2 text-center bg-success/5 font-medium text-success border-r border-dashed border-border/50">+{baseIncome.toLocaleString()} {currencySymbol}</td>}
                      {showOneTime && (
                        <td className="px-2 py-2 bg-success/5 border-r border-dashed border-border/50">
                            <DebouncedInput 
                                type="number" 
                                value={oneTimeIncomes[month] || ''} 
                                onChange={(val) => updateOneTimeIncome(month, val)} 
                                disabled={isLocked} 
                                className={cn("text-center h-10 sm:h-7 text-sm sm:text-xs font-medium border-success/20 focus-visible:ring-success/30 bg-background hover:bg-white shadow-sm px-3 sm:px-1", oneTimeIncomes[month] ? "text-success font-bold" : "text-muted-foreground", isLocked && "opacity-50 cursor-not-allowed")} 
                                placeholder="-" 
                            />
                        </td>
                      )}
                      {showCharges && <td className="px-2 py-2 text-center bg-destructive/5 font-medium text-destructive border-r border-dashed border-border/50">-{chargesTotal.toLocaleString()} {currencySymbol}</td>}
                      <td className="px-2 py-2 text-center font-bold text-primary bg-primary/10 border-r-2 border-primary/20 text-sm">{availableToSave.toLocaleString()} {currencySymbol}</td>
                      {visibleProjects.map((project) => {
                        const allocation = yearlyData[month]?.[project.id] || 0;
                        const expense = yearlyExpenses[month]?.[project.id] || 0;
                        const comment = projectComments[month]?.[project.id];
                        const cumulative = getCumulativeProjectTotal(project.id, monthIndex);
                        return (
                          <td key={project.id} className="px-1 py-2 border-r border-dashed border-border/50">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <DebouncedInput 
                                    type="number" 
                                    value={allocation || ''} 
                                    onChange={(val) => updateAllocation(month, project.id, val)} 
                                    disabled={isLocked} 
                                    className={cn("text-center h-10 sm:h-7 text-sm sm:text-xs px-3 sm:px-1 font-medium bg-background border-primary/20 focus-visible:ring-primary/30 shadow-sm", allocation > 0 && "text-primary font-bold bg-primary/5", isLocked && "opacity-50")} 
                                    placeholder="0" 
                                />
                                <DebouncedInput 
                                    type="number" 
                                    value={expense || ''} 
                                    onChange={(val) => updateExpense(month, project.id, val)} 
                                    disabled={isLocked} 
                                    className={cn("text-center h-10 sm:h-7 text-sm sm:text-xs px-3 sm:px-1 font-medium bg-background border-destructive/20 focus-visible:ring-destructive/30 shadow-sm", expense > 0 && "text-destructive font-bold bg-destructive/5", isLocked && "opacity-50")} 
                                    placeholder="0" 
                                />
                              </div>
                              <div className="flex items-center justify-between px-0.5">
                                <div className="text-[10px] text-muted-foreground flex items-center gap-0.5 bg-muted/30 px-1 py-0 rounded" title="Total Cumulé">
                                  <span>∑</span><span className={cumulative >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>{cumulative.toLocaleString()} {currencySymbol}</span>
                                </div>
                                <Popover>
                                  <PopoverTrigger asChild><Button variant="ghost" size="icon" className={cn("h-4 w-4 rounded-full p-0", comment ? "text-primary" : "text-muted-foreground/30")}>{comment ? <MessageCircle className="h-3 w-3" /> : <MessageSquarePlus className="h-3 w-3" />}</Button></PopoverTrigger>
                                  <PopoverContent className="w-64 p-3">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-xs text-muted-foreground mb-1">Note pour {project.label} ({month})</h4>
                                        <DebouncedTextarea 
                                            value={comment || ''} 
                                            onChange={(val) => updateProjectComment(month, project.id, val)} 
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
                      <td className="px-1 py-2 bg-primary/5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                <Input type="text" value={`${genSavingsAllocation.toLocaleString()} ${currencySymbol}`} disabled className="text-center h-10 sm:h-7 text-sm sm:text-xs px-3 sm:px-1 font-bold bg-primary/10 border-primary/20 text-primary cursor-default shadow-none" />
                                <DebouncedInput 
                                    type="number" 
                                    value={genSavingsExpense || ''} 
                                    onChange={(val) => updateExpense(month, GENERAL_SAVINGS_ID, val)} 
                                    disabled={isLocked} 
                                    className={cn("text-center h-10 sm:h-7 text-sm sm:text-xs px-3 sm:px-1 font-medium bg-background border-destructive/20 focus-visible:ring-destructive/30 shadow-sm", genSavingsExpense > 0 && "text-destructive font-bold bg-destructive/5", isLocked && "opacity-50")} 
                                    placeholder="0" 
                                />
                            </div>
                            <div className="flex items-center justify-between px-0.5">
                                <div className="text-[10px] text-muted-foreground flex items-center gap-0.5 bg-muted/30 px-1 py-0 rounded"><span>∑</span><span className={genSavingsCumulative >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>{genSavingsCumulative.toLocaleString()} {currencySymbol}</span></div>
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="ghost" size="icon" className={cn("h-4 w-4 rounded-full p-0", genSavingsComment ? "text-primary" : "text-muted-foreground/30")}>{genSavingsComment ? <MessageCircle className="h-3 w-3" /> : <MessageSquarePlus className="h-3 w-3" />}</Button></PopoverTrigger>
                                    <PopoverContent className="w-64 p-3">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-xs text-muted-foreground mb-1">Note pour Épargne Générale</h4>
                                            <DebouncedTextarea 
                                                value={genSavingsComment || ''} 
                                                onChange={(val) => updateProjectComment(month, GENERAL_SAVINGS_ID, val)} 
                                                placeholder="Détail..." 
                                                className="h-20 text-sm resize-none" 
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
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
          <DialogHeader><DialogTitle>Commentaire - {selectedMonth}</DialogTitle><DialogDescription>Ajoutez une note générale pour ce mois.</DialogDescription></DialogHeader>
          <Textarea value={tempComment} onChange={(e) => setTempComment(e.target.value)} placeholder="Écrivez votre commentaire ici..." rows={4} className="resize-none" />
          <DialogFooter><Button variant="outline" onClick={() => setCommentDialogOpen(false)}>Annuler</Button><Button variant="gradient" onClick={saveComment}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}