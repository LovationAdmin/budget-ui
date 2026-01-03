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
  const { toast } = useToast();
  
  // Form States
  const [newChargeLabel, setNewChargeLabel] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [newChargeDescription, setNewChargeDescription] = useState(''); // ✅ STATE DESCRIPTION
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // UI States
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [detectedCategory, setDetectedCategory] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  // Check if we have charges that need categorization
  const uncategorizedCount = charges.filter(c => !c.category || c.category === 'OTHER').length;

  // --- HANDLERS ---

  const handleAutoCategorizeAll = async () => {
    if (uncategorizedCount === 0) return;
    setIsAutoCategorizing(true);
    let updatedCount = 0;
    const updatedCharges = [...charges];

    try {
        await Promise.all(updatedCharges.map(async (charge, index) => {
            if (!charge.category || charge.category === 'OTHER') {
                try {
                    const res = await budgetAPI.categorize(charge.label);
                    if (res.data.category && res.data.category !== 'OTHER') {
                        updatedCharges[index] = { ...charge, category: res.data.category };
                        updatedCount++;
                    }
                } catch (err) {
                    console.error(`Failed to categorize ${charge.label}`, err);
                }
            }
        }));

        if (updatedCount > 0) {
            onChargesChange(updatedCharges);
            toast({ 
                title: "Catégorisation terminée", 
                description: `${updatedCount} charge(s) mise(s) à jour avec succès.`,
                variant: "default"
            });
        } else {
            toast({ 
                title: "Analyse terminée", 
                description: "Aucune nouvelle catégorie n'a pu être détectée.", 
            });
        }
    } catch (error) {
        toast({ 
            title: "Erreur", 
            description: "Une erreur est survenue pendant l'analyse.", 
            variant: "destructive" 
        });
    } finally {
        setIsAutoCategorizing(false);
    }
  };

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
      description: newChargeDescription.trim() || undefined, // ✅ SAVE DESCRIPTION
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      category: detectedCategory || undefined, 
      ignoreSuggestions: false
    };
    
    onChargesChange([...charges, newCharge]);
    
    // Reset Form
    setNewChargeLabel('');
    setNewChargeAmount('');
    setNewChargeDescription('');
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
      INSURANCE: '🛡️ Assurance',
      INSURANCE_AUTO: '🚗 Assurance Auto',
      INSURANCE_HOME: '🏠 Assurance Habitation',
      INSURANCE_HEALTH: '⚕️ Mutuelle Santé',
      LOAN: '💸 Prêt',
      BANK: '🏛️ Banque',
      TRANSPORT: '🚌 Transport',
      LEISURE: '⚽ Loisirs',
      LEISURE_SPORT: '💪 Sport / Fitness',
      LEISURE_STREAMING: '🎬 Streaming',
      SUBSCRIPTION: '🔄 Abonnement',
      HOUSING: '🏠 Logement',
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
             {uncategorizedCount > 0 && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex h-8 bg-white/50 border-orange-200 text-orange-700 hover:bg-white hover:text-orange-800"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAutoCategorizeAll();
                    }}
                    disabled={isAutoCategorizing}
                >
                    {isAutoCategorizing ? (
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5 mr-2" />
                    )}
                    Catégoriser ({uncategorizedCount})
                </Button>
            )}

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
        {/* Mobile Button for categorization */}
        {uncategorizedCount > 0 && (
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:hidden mb-2 bg-white/50 border-orange-200 text-orange-700"
                onClick={(e) => {
                    e.stopPropagation();
                    handleAutoCategorizeAll();
                }}
                disabled={isAutoCategorizing}
            >
                {isAutoCategorizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Détecter les catégories ({uncategorizedCount})
            </Button>
        )}

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

            {/* ✅ NOUVEAU CHAMP : DÉTAILS OPTIONNELS */}
            <div>
                <Label htmlFor="charge-desc" className="flex items-center gap-1">
                    Détails / Critères <span className="text-xs font-normal text-muted-foreground">(Optionnel)</span>
                </Label>
                <Input
                    id="charge-desc"
                    value={newChargeDescription}
                    onChange={(e) => setNewChargeDescription(e.target.value)}
                    placeholder="Ex: 35m2 Paris, Tous risques, 9kVA..."
                    className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Aide l'IA à comparer ce qui est comparable.
                </p>
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
                  setNewChargeDescription('');
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
// Internal ChargeItem Component (With Edit Mode)
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
  const [editDescription, setEditDescription] = useState(charge.description || ''); // ✅ EDIT STATE
  const [editStartDate, setEditStartDate] = useState(charge.startDate);
  const [editEndDate, setEditEndDate] = useState(charge.endDate);

  const handleSave = () => {
    onUpdate(charge.id, {
      label: editLabel,
      amount: parseFloat(editAmount) || 0,
      description: editDescription, // ✅ SAVE DESCRIPTION
      startDate: editStartDate,
      endDate: editEndDate
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(charge.label);
    setEditAmount(charge.amount.toString());
    setEditDescription(charge.description || '');
    setEditStartDate(charge.startDate);
    setEditEndDate(charge.endDate);
    setIsEditing(false);
  };

  const hasDates = charge.startDate || charge.endDate;
  const dateText = hasDates ? `${charge.startDate || '...'} → ${charge.endDate || '...'}` : '';
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

          {/* ✅ NOUVEAU CHAMP ÉDITION : DETAILS */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Détails / Critères (IA)</Label>
            <Input 
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)} 
                className="w-full text-xs" 
                placeholder="Ex: 50m2, option base..." 
            />
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
             <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap" title="Suggestions d'économies désactivées">
                Suggestions OFF
             </span>
          )}
        </div>
        
        {/* ✅ AFFICHAGE DISCRET DE LA DESCRIPTION SI PRÉSENTE */}
        {charge.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 italic truncate flex items-center gap-1">
                <Info className="h-3 w-3 inline" /> {charge.description}
            </p>
        )}
        
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

      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-1">
        <span className="font-bold text-orange-900 text-sm sm:mr-2">
          {charge.amount.toFixed(2)}€
        </span>

        <div className={cn(
          "flex gap-0.5",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
        )}>
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

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsEditing(true)} 
            className="h-9 w-9 sm:h-7 sm:w-7" 
            title="Modifier"
          >
            ✏️
          </Button>

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