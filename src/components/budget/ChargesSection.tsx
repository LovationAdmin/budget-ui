import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calendar, Clock, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Charge } from '@/utils/importConverter';
import { budgetAPI } from '@/services/api';

// ... (Exported Interfaces for Suggestion remain same)
export interface Suggestion {
  id: string;
  chargeId?: string;
  type: string;
  title: string;
  message: string;
  potentialSavings: number;
  actionLink: string;
  canBeContacted: boolean;
}

interface ChargesSectionProps {
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
  onLinkTransaction?: (charge: Charge) => void; 
  mappedTotals?: Record<string, number>; 
}

export default function ChargesSection({ 
    charges, 
    onChargesChange, 
    onLinkTransaction,
    mappedTotals = {} 
}: ChargesSectionProps) {
  const [newChargeLabel, setNewChargeLabel] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Collapsible State
  const [isExpanded, setIsExpanded] = useState(true);
  
  const [detectedCategory, setDetectedCategory] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ... (AI Categorization Logic remains same)
  const handleLabelBlur = async () => {
      if (!newChargeLabel.trim() || newChargeLabel.length < 3) return;
      setIsAnalyzing(true);
      try {
          const res = await budgetAPI.categorize(newChargeLabel);
          if (res.data.category && res.data.category !== 'OTHER') {
              setDetectedCategory(res.data.category);
          } else {
              setDetectedCategory('');
          }
      } catch (err) {
          console.error("AI Categorization failed", err);
      } finally {
          setIsAnalyzing(false);
      }
  };

  const addCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChargeLabel.trim()) return;
    
    const newCharge: Charge = {
      id: Date.now().toString(),
      label: newChargeLabel.trim(),
      amount: parseFloat(newChargeAmount) || 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      category: detectedCategory || undefined, 
    };
    
    onChargesChange([...charges, newCharge]);
    
    setNewChargeLabel('');
    setNewChargeAmount('');
    setStartDate('');
    setEndDate('');
    setDetectedCategory('');
    setShowAddForm(false);
    setIsExpanded(true); // Open when adding
  };

  const removeCharge = (id: string) => {
    if (confirm('Supprimer cette charge ?')) {
      onChargesChange(charges.filter(c => c.id !== id));
    }
  };

  const updateCharge = (id: string, updates: Partial<Charge>) => {
    onChargesChange(charges.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return '';
    const labels: Record<string, string> = {
      ENERGY: '⚡ Énergie',
      INTERNET: '🌐 Internet',
      MOBILE: '📱 Mobile',
      INSURANCE_AUTO: '🚗 Assurance Auto',
      INSURANCE_HOME: '🏠 Assurance Habitation',
      INSURANCE_HEALTH: '🏥 Assurance Santé',
      LOAN: '💳 Prêt',
      OTHER: '📦 Autre'
    };
    return labels[category] || category;
  };

  const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/30 transition-all duration-300">
      <CardHeader 
        className="pb-4 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-orange-900 flex items-center gap-2">
            📤 Charges Mensuelles
            <span className="text-sm font-normal text-muted-foreground">
              ({charges.length} charge{charges.length > 1 ? 's' : ''})
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-2xl font-bold text-orange-900">
                {totalCharges.toFixed(0)}€
                </p>
                <p className="text-xs text-muted-foreground">Total mensuel</p>
            </div>
            {/* Chevron Toggle */}
            <div className="text-orange-800">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
      <CardContent className="space-y-3 animate-accordion-down">
        {/* Liste des charges */}
        {charges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Aucune charge enregistrée</p>
            <p className="text-xs">Cliquez sur "Ajouter une charge" pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {charges.map((charge) => (
              <ChargeItem
                key={charge.id}
                charge={charge}
                onUpdate={updateCharge}
                onDelete={removeCharge}
                onLinkTransaction={onLinkTransaction}
                mappedTotal={mappedTotals[charge.id]}
                getCategoryLabel={getCategoryLabel}
              />
            ))}
          </div>
        )}

        {/* Formulaire d'ajout */}
        {!showAddForm ? (
          <Button 
            onClick={(e) => {
                e.stopPropagation();
                setShowAddForm(true);
            }} 
            variant="outline" 
            className="w-full border-dashed border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une charge
          </Button>
        ) : (
          <form 
            onSubmit={addCharge} 
            onClick={(e) => e.stopPropagation()}
            className="space-y-3 p-4 border border-orange-200 rounded-lg bg-white"
          >
            <div>
              <Label htmlFor="charge-label">Libellé *</Label>
              <Input
                id="charge-label"
                value={newChargeLabel}
                onChange={(e) => setNewChargeLabel(e.target.value)}
                onBlur={handleLabelBlur}
                placeholder="Ex: EDF, Loyer, Assurance..."
                required
              />
              {isAnalyzing && (
                <p className="text-xs text-muted-foreground mt-1">
                  🔄 Analyse de la catégorie...
                </p>
              )}
              {detectedCategory && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Catégorie détectée: {getCategoryLabel(detectedCategory)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="charge-amount">Montant mensuel (€) *</Label>
              <Input
                id="charge-amount"
                type="number"
                step="0.01"
                value={newChargeAmount}
                onChange={(e) => setNewChargeAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date">Date début (optionnel)</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Date fin (optionnel)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Ajouter
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewChargeLabel('');
                  setNewChargeAmount('');
                  setStartDate('');
                  setEndDate('');
                  setDetectedCategory('');
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      )}
    </Card>
  );
}

// ... (ChargeItem Component remains exactly the same as in your prompt)
interface ChargeItemProps {
  charge: Charge;
  onUpdate: (id: string, updates: Partial<Charge>) => void;
  onDelete: (id: string) => void;
  onLinkTransaction?: (charge: Charge) => void;
  mappedTotal?: number;
  getCategoryLabel: (category?: string) => string;
}

function ChargeItem({ 
  charge, 
  onUpdate, 
  onDelete, 
  onLinkTransaction,
  mappedTotal,
  getCategoryLabel 
}: ChargeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(charge.label);
  const [editAmount, setEditAmount] = useState(charge.amount.toString());

  const handleSave = () => {
    onUpdate(charge.id, {
      label: editLabel,
      amount: parseFloat(editAmount) || 0
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(charge.label);
    setEditAmount(charge.amount.toString());
    setIsEditing(false);
  };

  // Format dates
  const hasDates = charge.startDate || charge.endDate;
  const dateText = hasDates 
    ? `${charge.startDate || '...'} → ${charge.endDate || '...'}`
    : '';

  // Comparaison budget vs réel
  const hasRealityCheck = mappedTotal !== undefined && mappedTotal > 0;
  const differsFromBudget = hasRealityCheck && Math.abs(mappedTotal - charge.amount) > 0.5;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-orange-200">
        <Input
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          className="flex-1 h-8"
          placeholder="Libellé"
        />
        <Input
          type="number"
          step="0.01"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          className="w-24 h-8"
          placeholder="0.00"
        />
        <Button size="sm" onClick={handleSave} className="h-8">
          ✓
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8">
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-orange-50/50 transition-colors group border border-transparent hover:border-orange-200">
      {/* Infos charge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{charge.label}</span>
          {charge.category && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {getCategoryLabel(charge.category)}
            </span>
          )}
        </div>
        
        {/* Dates */}
        {hasDates && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="truncate">{dateText}</span>
          </div>
        )}

        {/* Reality Check Info */}
        {hasRealityCheck && differsFromBudget && (
          <div className="mt-1 text-xs text-indigo-600 font-medium">
            Réel: {mappedTotal.toFixed(2)}€
          </div>
        )}
      </div>

      {/* Montant et actions */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-orange-900 text-sm whitespace-nowrap">
          {charge.amount.toFixed(2)}€
        </span>

        {/* Bouton Link Transaction (Reality Check) */}
        {onLinkTransaction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLinkTransaction(charge)}
            className={cn(
              "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
              hasRealityCheck && "text-indigo-600 opacity-100"
            )}
            title={hasRealityCheck ? "Gérer le mapping" : "Lier aux transactions"}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        )}

        {/* Bouton Éditer */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Modifier"
        >
          ✏️
        </Button>

        {/* Bouton Supprimer */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(charge.id)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}