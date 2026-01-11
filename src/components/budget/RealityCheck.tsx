import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle, CheckCircle2, Link as LinkIcon, Info, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealityCheckProps {
  totalRealized: number;
  bankBalance?: number;
  isBankConnected?: boolean;
  onConnectBank?: () => void;
  isDemoMode?: boolean;
}

export function RealityCheck({ 
  totalRealized, 
  bankBalance = 0, 
  isBankConnected = false,
  onConnectBank,
  isDemoMode = false
}: RealityCheckProps) {
  
  const difference = bankBalance - totalRealized;
  // Tolerance of 1€
  const isBalanced = Math.abs(difference) < 1;
  const isDeficit = difference < 0; 

  return (
    <div className="space-y-4">
      <Card className={cn(
          "border-l-4 shadow-sm transition-all duration-500",
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
                  {totalRealized.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white shadow-lg animate-in zoom-in duration-300">
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
                  <div className="text-center sm:text-right">
                      <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                              Réalité (Banque)
                          </span>
                      </div>
                      <div className="text-2xl font-bold font-display text-muted-foreground">
                          -- €
                      </div>
                      <Button 
                          onClick={onConnectBank}
                          variant="outline"
                          size="sm"
                          className="mt-2 border-indigo-300 hover:bg-indigo-50 text-indigo-700"
                      >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connecter ma banque
                      </Button>
                  </div>
              ) : (
                  <div className="flex flex-col items-end">
                      <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                              Réalité (Banque)
                          </span>
                      </div>
                      <div className="text-2xl font-bold font-display text-foreground">
                          {bankBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </div>
                      <div className="flex items-center justify-center sm:justify-end gap-1 mt-1">
                          {isBalanced ? (
                              <span className="text-xs text-success font-medium">
                                  ✓ Équilibré
                              </span>
                          ) : (
                              <span className={cn(
                                  "text-xs font-medium",
                                  isDeficit ? "text-destructive" : "text-success"
                              )}>
                                  {isDeficit ? '⚠ Déficit' : '✓ Excédent'} : {Math.abs(difference).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                              </span>
                          )}
                      </div>
                      
                      {/* ✅ ADDED: Edit Button when connected */}
                      <Button 
                          onClick={onConnectBank}
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs text-muted-foreground hover:text-primary px-2"
                      >
                          <Settings className="h-3 w-3 mr-1" />
                          Gérer les comptes
                      </Button>
                  </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Info Message for Demo Mode */}
      {isDemoMode && isBankConnected && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Mode démo actif :</strong> Données fictives. 
              <button onClick={onConnectBank} className="underline font-semibold ml-1 hover:text-amber-900">
                Connecter une vraie banque
              </button>
            </span>
          </p>
        </div>
      )}
    </div>
  );
}