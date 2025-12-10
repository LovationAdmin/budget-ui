import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Trash2, Receipt, X, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Charge } from '@/utils/importConverter';

interface ChargesSectionProps {
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
}

export default function ChargesSection({ charges, onChargesChange }: ChargesSectionProps) {
  const [newChargeLabel, setNewChargeLabel] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChargeLabel.trim()) return;

    const newCharge: Charge = {
      id: Date.now().toString(),
      label: newChargeLabel.trim(),
      amount: parseFloat(newChargeAmount) || 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    onChargesChange([...charges, newCharge]);
    setNewChargeLabel('');
    setNewChargeAmount('');
    setStartDate('');
    setEndDate('');
    setShowAddForm(false);
  };

  const removeCharge = (id: string) => {
    if (confirm('Supprimer cette charge ?')) {
      onChargesChange(charges.filter(c => c.id !== id));
    }
  };

  const updateCharge = (id: string, updates: Partial<Charge>) => {
    onChargesChange(
      charges.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  // Base total (raw sum)
  const totalChargesBase = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="glass-card animate-slide-up stagger-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Receipt className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Charges Fixes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total théorique : {totalChargesBase.toLocaleString('fr-FR')} € / mois
              </p>
            </div>
          </div>
          
          {!showAddForm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-1 h-8 bg-destructive/5 hover:bg-destructive/10 text-destructive"
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
          <form onSubmit={addCharge} className="mb-4 p-3 rounded-xl border border-destructive/20 bg-destructive/5 animate-scale-in">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full sm:flex-1 space-y-1.5">
                  <Label htmlFor="charge-label" className="text-xs">Libellé</Label>
                  <Input
                    id="charge-label"
                    value={newChargeLabel}
                    onChange={(e) => setNewChargeLabel(e.target.value)}
                    placeholder="Loyer, Crédit..."
                    className="h-9 bg-white"
                    required
                    autoFocus
                  />
                </div>
                <div className="w-full sm:w-32 space-y-1.5">
                  <Label htmlFor="charge-amount" className="text-xs">Montant</Label>
                  <Input
                    id="charge-amount"
                    type="number"
                    value={newChargeAmount}
                    onChange={(e) => setNewChargeAmount(e.target.value)}
                    placeholder="0"
                    className="h-9 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-end">
                 <div className="w-full space-y-1.5">
                    <Label htmlFor="start-date" className="text-xs text-muted-foreground">Début (Optionnel)</Label>
                    <Input 
                        id="start-date" 
                        type="date" 
                        className="h-8 text-xs bg-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                 </div>
                 <div className="w-full space-y-1.5">
                    <Label htmlFor="end-date" className="text-xs text-muted-foreground">Fin (Optionnel)</Label>
                    <Input 
                        id="end-date" 
                        type="date" 
                        className="h-8 text-xs bg-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-8 text-xs">
                    Annuler
                </Button>
                <Button type="submit" size="sm" variant="destructive" className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Charges List */}
        {charges.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucune charge récurrente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {charges.map((charge) => {
              // Format date display
              const hasDates = charge.startDate || charge.endDate;
              const dateText = hasDates
                ? `${charge.startDate ? new Date(charge.startDate).toLocaleDateString(undefined, {month:'short', year:'2-digit'}) : '...'} → ${charge.endDate ? new Date(charge.endDate).toLocaleDateString(undefined, {month:'short', year:'2-digit'}) : '...'}`
                : null;

              return (
                <div
                  key={charge.id}
                  className="group relative flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:shadow-sm transition-all"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Input
                      value={charge.label}
                      onChange={(e) => updateCharge(charge.id, { label: e.target.value })}
                      className="h-6 text-sm font-medium bg-transparent border-0 p-0 focus-visible:ring-0 px-1 -ml-1 truncate"
                    />
                    <div className="flex items-center gap-1 text-destructive font-medium">
                      <span className="text-xs">-</span>
                      <Input
                          type="number"
                          value={charge.amount}
                          onChange={(e) => updateCharge(charge.id, { amount: parseFloat(e.target.value) || 0 })}
                          className="h-5 w-20 text-xs bg-transparent border-0 p-0 focus-visible:ring-0"
                      />
                      <span className="text-xs">€</span>
                    </div>
                    
                    {/* Date Badge */}
                    {hasDates && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded w-fit">
                            <Clock className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{dateText}</span>
                        </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-1 items-end">
                      {/* 1. Date Editor Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon-sm" 
                                className={cn(
                                    "h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10", 
                                    hasDates && "text-primary bg-primary/5"
                                )}
                                title="Définir une durée"
                            >
                                <Calendar className="h-3.5 w-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3">
                            <div className="space-y-3">
                                <h4 className="font-medium text-xs text-muted-foreground">Durée de validité</h4>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-2">
                                        <Label htmlFor="start" className="text-xs">Début</Label>
                                        <Input
                                            id="start"
                                            type="date"
                                            value={charge.startDate || ''}
                                            onChange={(e) => updateCharge(charge.id, { startDate: e.target.value })}
                                            className="col-span-2 h-8 text-xs"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-2">
                                        <Label htmlFor="end" className="text-xs">Fin</Label>
                                        <Input
                                            id="end"
                                            type="date"
                                            value={charge.endDate || ''}
                                            onChange={(e) => updateCharge(charge.id, { endDate: e.target.value })}
                                            className="col-span-2 h-8 text-xs"
                                        />
                                    </div>
                                </div>
                                {(charge.startDate || charge.endDate) && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full h-7 text-xs text-muted-foreground hover:text-destructive"
                                        onClick={() => updateCharge(charge.id, { startDate: undefined, endDate: undefined })}
                                    >
                                        Effacer les dates
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                      </Popover>

                      {/* 2. Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeCharge(charge.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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