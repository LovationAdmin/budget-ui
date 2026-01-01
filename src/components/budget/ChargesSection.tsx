// src/components/budget/ChargesSection.tsx
// VERSION MOBILE-OPTIMIZED - MODE ÉDITION AMÉLIORÉ

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  LightbulbOff,
  Save,
  X
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Charge } from '@/utils/importConverter';
import { budgetAPI } from '@/services/api';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [detectedCategory, setDetectedCategory] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      ignoreSuggestions: false
    };
    
    onChargesChange([...charges, newCharge]);
    
    setNewChargeLabel('');
    setNewChargeAmount('');
    setStartDate('');
    setEndDate('');
    setDetectedCategory('');
    setShowAddForm(false);
    setIsExpanded(true);
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
            🧾 Charges
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
            <div className="text-orange-800">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
      <CardContent className="space-y-3 animate-accordion-down">
        {charges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Aucune charge enregistrée</p>
            <p className="text-xs">Cliquez sur "Ajouter une charge" pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
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
                <p className="text-xs text-muted-foreground mt-1">🔄 Analyse de la catégorie...</p>
              )}
              {detectedCategory && (
                <p className="text-xs text-green-600 mt-1">✓ Catégorie détectée: {getCategoryLabel(detectedCategory)}</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date">Date début (optionnel)</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="end-date">Date fin (optionnel)</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">Ajouter</Button>
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

// ============================================================================
// ChargeItem - VERSION MOBILE-OPTIMIZED AVEC MODE ÉDITION VERTICAL
// ============================================================================

interface ChargeItemProps {
  charge: Charge;
  onUpdate: (id: string, updates: Partial<Charge>) => void;
  onDelete: (id: string) => void;
  onLinkTransaction?: (charge: Charge) => void;
  mappedTotal?: number;
  getCategoryLabel: (category?: string) => string;
}

function ChargeItem({ charge, onUpdate, onDelete, onLinkTransaction, mappedTotal, getCategoryLabel }: ChargeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(charge.label);
  const [editAmount, setEditAmount] = useState(charge.amount.toString());
  const [editStartDate, setEditStartDate] = useState(charge.startDate);
  const [editEndDate, setEditEndDate] = useState(charge.endDate);

  const handleSave = () => {
    onUpdate(charge.id, {
      label: editLabel,
      amount: parseFloat(editAmount) || 0,
      startDate: editStartDate,
      endDate: editEndDate
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(charge.label);
    setEditAmount(charge.amount.toString());
    setEditStartDate(charge.startDate);
    setEditEndDate(charge.endDate);
    setIsEditing(false);
  };

  const hasDates = charge.startDate || charge.endDate;
  const dateText = hasDates ? `${charge.startDate || '...'} → ${charge.endDate || '...'}` : '';
  const hasRealityCheck = mappedTotal !== undefined && mappedTotal > 0;
  const differsFromBudget = hasRealityCheck && Math.abs(mappedTotal - charge.amount) > 0.5;

  // ✅ MODE ÉDITION - LAYOUT VERTICAL MOBILE-FRIENDLY
  if (isEditing) {
    const hasEditDates = editStartDate || editEndDate;
    
    return (
      <div className="p-4 bg-white rounded-lg border-2 border-orange-300 shadow-lg space-y-3">
        {/* Header mode édition */}
        <div className="flex items-center justify-between pb-2 border-b border-orange-100">
          <h4 className="font-medium text-sm text-orange-900">✏️ Mode édition</h4>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              onClick={handleSave} 
              className="h-8 px-3 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Sauver
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCancel} 
              className="h-8 px-3"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Annuler
            </Button>
          </div>
        </div>

        {/* Champs d'édition - VERTICAL sur mobile */}
        <div className="space-y-3">
          {/* Libellé */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-label-${charge.id}`} className="text-xs font-medium">
              Libellé
            </Label>
            <Input 
              id={`edit-label-${charge.id}`}
              value={editLabel} 
              onChange={(e) => setEditLabel(e.target.value)} 
              className="w-full"
              placeholder="Nom de la charge"
            />
          </div>

          {/* Montant */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-amount-${charge.id}`} className="text-xs font-medium">
              Montant mensuel (€)
            </Label>
            <Input 
              id={`edit-amount-${charge.id}`}
              type="number" 
              step="0.01" 
              value={editAmount} 
              onChange={(e) => setEditAmount(e.target.value)} 
              className="w-full"
              placeholder="0.00"
            />
          </div>

          {/* Dates - 2 colonnes sur desktop, 1 sur mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-start-${charge.id}`} className="text-xs font-medium text-muted-foreground">
                Date début
              </Label>
              <Input 
                id={`edit-start-${charge.id}`}
                type="date" 
                value={editStartDate || ''} 
                onChange={(e) => setEditStartDate(e.target.value)} 
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-end-${charge.id}`} className="text-xs font-medium text-muted-foreground">
                Date fin
              </Label>
              <Input 
                id={`edit-end-${charge.id}`}
                type="date" 
                value={editEndDate || ''} 
                onChange={(e) => setEditEndDate(e.target.value)} 
                className="w-full"
              />
            </div>
          </div>

          {/* Bouton effacer dates si présentes */}
          {(editStartDate || editEndDate) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground hover:text-destructive"
              onClick={() => {
                setEditStartDate(undefined);
                setEditEndDate(undefined);
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Effacer les dates
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ✅ MODE AFFICHAGE - Layout adaptatif
  return (
    <div className={cn(
      "p-3 bg-white rounded-lg border border-transparent",
      "hover:bg-orange-50/50 hover:border-orange-200 transition-colors group",
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2"
    )}>
      {/* Bloc 1 : Informations */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{charge.label}</span>
          {charge.category && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">
              {getCategoryLabel(charge.category)}
            </span>
          )}
          {charge.ignoreSuggestions && (
             <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap" title="Suggestions d'économies désactivées">
                Suggestions OFF
             </span>
          )}
        </div>
        
        {hasDates && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{dateText}</span>
          </div>
        )}
        {hasRealityCheck && differsFromBudget && (
          <div className="mt-1 text-xs text-indigo-600 font-medium">
            Réel: {mappedTotal.toFixed(2)}€
          </div>
        )}
      </div>

      {/* Bloc 2 : Montant + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-1">
        <span className="font-bold text-orange-900 text-sm sm:mr-2">
          {charge.amount.toFixed(2)}€
        </span>

        {/* Actions - Toujours visibles sur mobile, hover sur desktop */}
        <div className={cn(
          "flex gap-0.5",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
        )}>
          {/* Toggle Suggestions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdate(charge.id, { ignoreSuggestions: !charge.ignoreSuggestions })}
            className={cn(
              "h-9 w-9 sm:h-7 sm:w-7 transition-colors",
              charge.ignoreSuggestions ? "text-gray-300 hover:text-gray-500" : "text-yellow-500 hover:bg-yellow-50"
            )}
            title={charge.ignoreSuggestions ? "Réactiver les suggestions" : "Désactiver les suggestions"}
          >
            {charge.ignoreSuggestions ? <LightbulbOff className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <Lightbulb className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
          </Button>

          {/* Link Transaction */}
          {onLinkTransaction && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLinkTransaction(charge)}
              className={cn(
                "h-9 w-9 sm:h-7 sm:w-7",
                hasRealityCheck && "text-indigo-600"
              )}
              title={hasRealityCheck ? "Gérer le mapping" : "Lier aux transactions"}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}

          {/* Edit Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsEditing(true)} 
            className="h-9 w-9 sm:h-7 sm:w-7" 
            title="Modifier"
          >
            ✏️
          </Button>

          {/* Delete Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(charge.id)} 
            className="h-9 w-9 sm:h-7 sm:w-7 text-red-600 hover:text-red-700 hover:bg-red-50" 
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}