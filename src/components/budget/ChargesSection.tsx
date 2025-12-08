import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Charge } from '@/utils/importConverter.tsx';


interface ChargesSectionProps {
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
}

export default function ChargesSection({ charges, onChargesChange }: ChargesSectionProps) {
  const [newChargeLabel, setNewChargeLabel] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChargeLabel.trim()) return;
    
    const newCharge: Charge = {
      id: Date.now().toString(),
      label: newChargeLabel.trim(),
      amount: parseFloat(newChargeAmount) || 0,
    };

    onChargesChange([...charges, newCharge]);
    setNewChargeLabel('');
    setNewChargeAmount('');
    setShowAddForm(false);
  };

  const removeCharge = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) {
      onChargesChange(charges.filter(c => c.id !== id));
    }
  };

  const updateCharge = (id: string, updates: Partial<Charge>) => {
    onChargesChange(
      charges.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="glass-card animate-slide-up stagger-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Receipt className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="font-display">Charges Récurrentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {charges.length} charge{charges.length > 1 ? 's' : ''} • 
                {' '}{totalCharges.toLocaleString('fr-FR')} € / mois
              </p>
            </div>
          </div>
          
          {!showAddForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={addCharge} className="glass-card-elevated p-4 space-y-3 animate-scale-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="charge-label">Libellé</Label>
                <Input
                  id="charge-label"
                  value={newChargeLabel}
                  onChange={(e) => setNewChargeLabel(e.target.value)}
                  placeholder="Loyer, EDF, Internet..."
                  required
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="charge-amount">Montant mensuel (€)</Label>
                <Input
                  id="charge-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newChargeAmount}
                  onChange={(e) => setNewChargeAmount(e.target.value)}
                  placeholder="850"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" variant="gradient" size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewChargeLabel('');
                  setNewChargeAmount('');
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {/* Charges List */}
        {charges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune charge récurrente</p>
            <p className="text-xs mt-1">Ajoutez vos charges fixes mensuelles</p>
          </div>
        ) : (
          <div className="space-y-2">
            {charges.map((charge) => (
              <div
                key={charge.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-xl border border-border/50",
                  "bg-card/50 hover:bg-card transition-all duration-200",
                  "hover:shadow-soft"
                )}
              >
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={charge.label}
                    onChange={(e) => updateCharge(charge.id, { label: e.target.value })}
                    className="font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:bg-white/50 rounded px-2"
                  />
                  
                  <div className="flex items-center gap-1 bg-destructive/5 text-destructive px-3 py-1.5 rounded-lg w-fit">
                    <span className="text-sm">-</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={charge.amount}
                      onChange={(e) => updateCharge(charge.id, { amount: parseFloat(e.target.value) || 0 })}
                      className="w-24 bg-transparent border-0 p-0 h-auto text-right font-semibold focus-visible:ring-0 focus-visible:bg-white/50 rounded px-1"
                    />
                    <span className="text-xs">€</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeCharge(charge.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
