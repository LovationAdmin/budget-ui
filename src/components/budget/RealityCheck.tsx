import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle, CheckCircle2, Link as LinkIcon, RefreshCw, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealityCheckProps {
  totalRealized: number;
  bankBalance?: number;
  isBankConnected?: boolean;
  onConnectBank?: () => void;
}

export function RealityCheck({ 
  totalRealized, 
  bankBalance = 0, 
  isBankConnected = false,
  onConnectBank 
}: RealityCheckProps) {
  
  const difference = bankBalance - totalRealized;
  // Tolerance of 1€
  const isBalanced = Math.abs(difference) < 1;
  const isDeficit = difference < 0; 

  return (
    <Card className={cn(
        "mb-6 border-l-4 shadow-sm transition-all duration-500",
        !isBankConnected ? "border-l-primary" : 
        isBalanced ? "border-l-success bg-success/5" : "border-l-destructive bg-destructive/5"
    )}>
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* LEFT: THEORETICAL (PLAN) */}
        <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Théorique (En Caisse)
                </span>
            </div>
            <div className="text-2xl font-bold font-display text-foreground">
                {totalRealized.toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                Calculé d'après vos mois passés
            </p>
        </div>

        {/* MIDDLE: STATUS INDICATOR */}
        <div className="hidden sm:flex flex-col items-center justify-center px-4">
            {!isBankConnected ? (
                <div className="h-8 w-px bg-border"></div>
            ) : isBalanced ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white shadow-lg scale-in-center">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-white shadow-lg animate-pulse">
                    <AlertTriangle className="h-6 w-6" />
                </div>
            )}
        </div>

        {/* RIGHT: REALITY (BANK) */}
        <div className="flex-1 w-full text-right">
            {!isBankConnected ? (
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 mb-1 opacity-50">
                        <span className="text-sm font-medium uppercase tracking-wider">Réalité (Banque)</span>
                        <LinkIcon className="h-4 w-4" />
                    </div>
                    <Button onClick={onConnectBank} variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/50 text-primary">
                        <LinkIcon className="h-4 w-4" />
                        Connecter mes Comptes
                    </Button>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Réalité (Banque)</span>
                        
                        {/* NEW: Manage Button (Visible when connected) */}
                        <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="h-6 w-6 text-muted-foreground hover:text-primary" 
                            onClick={onConnectBank}
                            title="Gérer les connexions"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className={cn(
                        "text-2xl font-bold font-display flex items-center justify-end gap-2",
                        isBalanced ? "text-success" : "text-destructive"
                    )}>
                        {bankBalance.toLocaleString()} €
                        <RefreshCw className="h-4 w-4 opacity-30 hover:opacity-100 cursor-pointer" />
                    </div>
                    
                    <p className={cn("text-xs font-medium mt-1", isDeficit ? "text-destructive" : "text-success")}>
                        {isBalanced 
                            ? "Tout est à jour."
                            : isDeficit 
                                ? `Manque ${Math.abs(difference).toLocaleString()} € sur vos comptes`
                                : `Excédent de ${difference.toLocaleString()} € (Non alloué)`
                        }
                    </p>
                </div>
            )}
        </div>

      </CardContent>
      
      {/* Progress Bar Visualizer */}
      {isBankConnected && (
          <div className="h-1 w-full bg-muted mt-0 relative overflow-hidden">
             <div 
                className={cn("h-full absolute top-0 left-0 transition-all duration-1000", isBalanced ? "bg-success" : "bg-destructive")} 
                style={{ width: isDeficit ? `${Math.max(0, (bankBalance / (totalRealized || 1)) * 100)}%` : '100%' }} 
             />
          </div>
      )}
    </Card>
  );
}