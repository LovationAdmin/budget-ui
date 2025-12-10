import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Charge } from '@/utils/importConverter';

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
    if (confirm('Supprimer cette charge ?')) {
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Receipt className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Charges Fixes</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalCharges.toLocaleString('fr-FR')} € / mois
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
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:flex-1 space-y-1.5">
                <Label htmlFor="charge-label" className="text-xs">Libellé</Label>
                <Input
                  id="charge-label"
                  value={newChargeLabel}
                  onChange={(e) => setNewChargeLabel(e.target.value)}
                  placeholder="Loyer, Internet..."
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
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="destructive" className="h-9">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-9">
                    <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* COMPACT GRID LAYOUT - UP TO 4 COLUMNS */}
        {charges.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucune charge récurrente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {charges.map((charge) => (
              <div
                key={charge.id}
                className="group relative flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:shadow-sm transition-all"
              >
                {/* Icon Placeholder */}
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
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeCharge(charge.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-7 w-7 absolute top-1 right-1 sm:static sm:top-auto sm:right-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}