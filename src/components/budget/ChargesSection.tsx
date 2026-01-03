// src/components/budget/ChargesSection.tsx
// ✅ VERSION CORRIGÉE - Limitation Details à 50 caractères (au lieu de 200)

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  Clock, 
  Link as LinkIcon, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  LightbulbOff,
  Save,
  X,
  Sparkles,
  Loader2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Charge } from '@/utils/importConverter';
import { budgetAPI } from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// ✅ CORRIGÉ : Constante pour la limite de caractères (50 au lieu de 200)
const MAX_DESCRIPTION_LENGTH = 50;

interface ChargesSectionProps {
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
  onLinkTransaction?: (charge: Charge) => void; 
  mappedTotals?: Record<string, number>;
  budgetId?: string;
  budgetLocation?: string;
  budgetCurrency?: string;
}

interface ChargeItemProps {
  charge: Charge;
  onUpdate: (id: string, updated: Partial<Charge>) => void;
  onDelete: (id: string) => void;
  onLinkTransaction?: (charge: Charge) => void;
  mappedTotal?: number;
  onToggleSuggestions?: (id: string) => void;
  budgetId?: string;
  budgetLocation?: string;
  budgetCurrency?: string;
}

function ChargeItem({ 
  charge, 
  onUpdate, 
  onDelete, 
  onLinkTransaction,
  mappedTotal,
  onToggleSuggestions,
  budgetId,
  budgetLocation = 'FR',
  budgetCurrency = 'EUR'
}: ChargeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(charge.label);
  const [editAmount, setEditAmount] = useState(String(charge.amount));
  const [editDescription, setEditDescription] = useState(charge.description || '');
  const [editStartDate, setEditStartDate] = useState(charge.startDate || '');
  const [editEndDate, setEditEndDate] = useState(charge.endDate || '');

  const handleSave = () => {
    onUpdate(charge.id, {
      label: editLabel,
      amount: parseFloat(editAmount) || 0,
      description: editDescription,
      startDate: editStartDate || undefined,
      endDate: editEndDate || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(charge.label);
    setEditAmount(String(charge.amount));
    setEditDescription(charge.description || '');
    setEditStartDate(charge.startDate || '');
    setEditEndDate(charge.endDate || '');
    setIsEditing(false);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      energy: "Énergie",
      internet: "Internet",
      mobile: "Mobile",
      insurance: "Assurance",
      housing: "Logement",
      transport: "Transport",
      subscription: "Abonnement",
      other: "Autre"
    };
    return labels[cat] || cat;
  };

  const periodText = (charge.startDate && charge.endDate) 
    ? `${charge.startDate || '...'} → ${charge.endDate || '...'}` : '';
  const hasRealityCheck = mappedTotal !== undefined && mappedTotal > 0;
  const differsFromBudget = hasRealityCheck && Math.abs(mappedTotal - charge.amount) > 0.5;

  // ✅ MODE ÉDITION
  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg border-2 border-orange-300 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-orange-100">
          <h4 className="font-medium text-sm text-orange-900">✏️ Mode édition</h4>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleSave} className="h-8 px-3 bg-orange-600 hover:bg-orange-700 text-white">
              <Save className="h-3.5 w-3.5 mr-1" /> Sauver
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 px-3">
              <X className="h-3.5 w-3.5 mr-1" /> Annuler
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Libellé</Label>
            <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Montant mensuel (€)</Label>
            <Input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full" />
          </div>

          {/* ✅ CORRIGÉ : Champ Details avec limite 50 caractères + compteur */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Détails / Critères (IA)
              </Label>
              <span className={cn(
                "text-xs",
                editDescription.length > MAX_DESCRIPTION_LENGTH ? "text-red-500 font-semibold" : "text-muted-foreground"
              )}>
                {editDescription.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Input 
              value={editDescription} 
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= MAX_DESCRIPTION_LENGTH) {
                  setEditDescription(value);
                }
              }} 
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="w-full text-xs" 
              placeholder="Ex: 50m2, option base..." 
            />
            <p className="text-[10px] text-muted-foreground flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Limité à 50 caractères pour optimiser l'analyse IA</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Date début</Label>
              <Input type="date" value={editStartDate || ''} onChange={(e) => setEditStartDate(e.target.value)} className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Date fin</Label>
              <Input type="date" value={editEndDate || ''} onChange={(e) => setEditEndDate(e.target.value)} className="w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MODE AFFICHAGE
  return (
    <div className={cn(
      "p-3 bg-white rounded-lg border border-transparent",
      "hover:bg-orange-50/50 hover:border-orange-200 transition-colors group",
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{charge.label}</span>
          {charge.category && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">
              {getCategoryLabel(charge.category)}
            </span>
          )}
          {charge.ignoreSuggestions && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
              <LightbulbOff className="h-3 w-3" />
              Suggestions désactivées
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="font-mono font-semibold text-orange-600">{charge.amount.toFixed(2)} €/mois</span>
          {charge.description && (
            <span className="text-muted-foreground italic truncate max-w-xs">
              {charge.description}
            </span>
          )}
          {periodText && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3 w-3" />
              {periodText}
            </span>
          )}
        </div>

        {hasRealityCheck && (
          <div className={cn(
            "mt-2 text-xs flex items-center gap-1.5 px-2 py-1 rounded-md w-fit",
            differsFromBudget ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
          )}>
            <LinkIcon className="h-3 w-3" />
            <span className="font-medium">Dépense réelle : {mappedTotal!.toFixed(2)} €</span>
            {differsFromBudget && (
              <span className="font-semibold">
                ({mappedTotal! > charge.amount ? '+' : ''}{(mappedTotal! - charge.amount).toFixed(2)} €)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        {onToggleSuggestions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleSuggestions(charge.id)}
            className="h-8 px-2"
            title={charge.ignoreSuggestions ? "Activer les suggestions IA" : "Désactiver les suggestions IA"}
          >
            {charge.ignoreSuggestions ? (
              <LightbulbOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Lightbulb className="h-4 w-4 text-orange-500" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-8 px-3"
        >
          Éditer
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(charge.id)}
          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ChargesSection({ 
  charges, 
  onChargesChange, 
  onLinkTransaction,
  mappedTotals,
  budgetId,
  budgetLocation = 'FR',
  budgetCurrency = 'EUR'
}: ChargesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChargeLabel, setNewChargeLabel] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [newChargeDescription, setNewChargeDescription] = useState('');
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { toast } = useToast();

  const detectCategory = (label: string): string | null => {
    const lowerLabel = label.toLowerCase();
    if (/edf|engie|électricité|gaz|energ/i.test(lowerLabel)) return 'energy';
    if (/free|orange|bouygues|sfr|internet|box|fibre/i.test(lowerLabel)) return 'internet';
    if (/mobile|forfait|téléphone/i.test(lowerLabel)) return 'mobile';
    if (/assurance|mutuelle|maaf|axa|maif/i.test(lowerLabel)) return 'insurance';
    if (/loyer|logement|habitation|hlm/i.test(lowerLabel)) return 'housing';
    if (/transport|essence|véhicule|metro|navigo/i.test(lowerLabel)) return 'transport';
    if (/netflix|spotify|abonnement|disney|amazon/i.test(lowerLabel)) return 'subscription';
    return null;
  };

  const handleLabelBlur = () => {
    const category = detectCategory(newChargeLabel);
    setDetectedCategory(category);
  };

  const addCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChargeLabel.trim() || !newChargeAmount) return;

    const newCharge: Charge = {
      id: `charge-${Date.now()}`,
      label: newChargeLabel.trim(),
      amount: parseFloat(newChargeAmount),
      description: newChargeDescription.trim() || undefined,
      category: detectedCategory || undefined,
      ignoreSuggestions: false,
    };

    onChargesChange([...charges, newCharge]);
    setNewChargeLabel('');
    setNewChargeAmount('');
    setNewChargeDescription('');
    setDetectedCategory(null);
    setShowAddForm(false);

    toast({
      title: "Charge ajoutée",
      description: `${newCharge.label} a été ajoutée avec succès`,
    });
  };

  const updateCharge = (id: string, updates: Partial<Charge>) => {
    const updatedCharges = charges.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    onChargesChange(updatedCharges);

    toast({
      title: "Charge mise à jour",
      description: "Les modifications ont été enregistrées",
    });
  };

  const deleteCharge = (id: string) => {
    const charge = charges.find(c => c.id === id);
    onChargesChange(charges.filter(c => c.id !== id));

    toast({
      title: "Charge supprimée",
      description: `${charge?.label || 'La charge'} a été supprimée`,
      variant: "destructive"
    });
  };

  const toggleSuggestions = (id: string) => {
    const charge = charges.find(c => c.id === id);
    if (!charge) return;

    updateCharge(id, { 
      ignoreSuggestions: !charge.ignoreSuggestions 
    });

    toast({
      title: charge.ignoreSuggestions ? "Suggestions activées" : "Suggestions désactivées",
      description: charge.ignoreSuggestions 
        ? `L'IA pourra suggérer des alternatives pour ${charge.label}`
        : `L'IA ne suggérera plus d'alternatives pour ${charge.label}`,
    });
  };

  const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow">
      <CardHeader 
        className="bg-gradient-to-r from-orange-500 to-amber-600 text-white cursor-pointer hover:from-orange-600 hover:to-amber-700 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl mb-1">Charges Mensuelles</CardTitle>
              <p className="text-sm text-white/90">
                {charges.length} charge{charges.length > 1 ? 's' : ''} · Total : {totalCharges.toFixed(2)} €/mois
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6 space-y-3">
          {charges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune charge ajoutée</p>
              <p className="text-xs">Commencez par ajouter vos dépenses régulières</p>
            </div>
          ) : (
            charges.map(charge => (
              <ChargeItem
                key={charge.id}
                charge={charge}
                onUpdate={updateCharge}
                onDelete={deleteCharge}
                onLinkTransaction={onLinkTransaction}
                mappedTotal={mappedTotals?.[charge.id]}
                onToggleSuggestions={toggleSuggestions}
                budgetId={budgetId}
                budgetLocation={budgetLocation}
                budgetCurrency={budgetCurrency}
              />
            ))
          )}

          {/* Add Form */}
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
                {detectedCategory && (
                  <p className="text-xs text-green-600 mt-1">✓ Catégorie détectée: {detectedCategory}</p>
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

              {/* ✅ CORRIGÉ : Champ Details avec limite 50 caractères */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="charge-desc" className="flex items-center gap-1">
                    Détails / Critères <span className="text-xs font-normal text-muted-foreground">(Optionnel)</span>
                  </Label>
                  <span className={cn(
                    "text-xs",
                    newChargeDescription.length > MAX_DESCRIPTION_LENGTH ? "text-red-500 font-semibold" : "text-muted-foreground"
                  )}>
                    {newChargeDescription.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <Input
                  id="charge-desc"
                  value={newChargeDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_DESCRIPTION_LENGTH) {
                      setNewChargeDescription(value);
                    }
                  }}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  placeholder="Ex: 35m2 Paris, Tous risques, 9kVA..."
                  className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground mt-1 flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" /> 
                  <span>Limité à 50 caractères pour optimiser l'analyse IA</span>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">Ajouter</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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