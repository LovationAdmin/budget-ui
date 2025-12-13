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
// Ajout des icônes pour les suggestions
import { Plus, Trash2, Receipt, Calendar, Clock, Lightbulb, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Charge } from '@/utils/importConverter';
import { budgetAPI } from '@/services/api';

interface ChargesSectionProps {
  charges: Charge[];
  onChargesChange: (charges: Charge[]) => void;
}

// Configuration des Offres d'Affiliation (Exemples Réalistes)
// Vous pourrez remplacer les liens par vos vrais liens Awin/Effinity plus tard
const OFFERS: Record<string, { title: string; text: string; link: string; color: string }> = {
    'ENERGY': {
        title: "Électricité / Gaz",
        text: "Les prix ont baissé. Comparez pour économiser jusqu'à 200€/an.",
        link: "https://www.papernest.com/energie/", 
        color: "text-yellow-600 bg-yellow-50 border-yellow-200"
    },
    'MOBILE': {
        title: "Forfait Mobile",
        text: "Des forfaits 50Go existent dès 10€/mois sans engagement.",
        link: "https://www.ariase.com/mobile",
        color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    'INTERNET': {
        title: "Box Internet",
        text: "Vous payez cher votre box. Vérifiez les offres fibre actuelles.",
        link: "https://www.ariase.com/box",
        color: "text-indigo-600 bg-indigo-50 border-indigo-200"
    },
    'INSURANCE': {
        title: "Assurance",
        text: "N'hésitez pas à remettre en concurrence votre assureur.",
        link: "https://reassurez-moi.fr/",
        color: "text-green-600 bg-green-50 border-green-200"
    },
    'LOAN': {
        title: "Crédit",
        text: "Avez-vous pensé à renégocier votre taux ou votre assurance emprunteur ?",
        link: "https://www.meilleurtaux.com/",
        color: "text-purple-600 bg-purple-50 border-purple-200"
    }
};

export default function ChargesSection({ charges, onChargesChange }: ChargesSectionProps) {
  const [newChargeLabel, setNewChargeLabel] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // IA State
  const [detectedCategory, setDetectedCategory] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Déclenché quand l'utilisateur quitte le champ "Libellé"
  const handleLabelBlur = async () => {
      // Ne pas appeler l'IA pour des textes trop courts
      if (!newChargeLabel.trim() || newChargeLabel.length < 3) return;
      
      setIsAnalyzing(true);
      try {
          const res = await budgetAPI.categorize(newChargeLabel);
          if (res.data.category && res.data.category !== 'OTHER') {
              setDetectedCategory(res.data.category);
          } else {
              setDetectedCategory(''); // Reset si OTHER
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
      // On sauvegarde la catégorie trouvée par l'IA
      category: detectedCategory || undefined, 
    };

    onChargesChange([...charges, newCharge]);
    
    // Reset complet
    setNewChargeLabel('');
    setNewChargeAmount('');
    setStartDate('');
    setEndDate('');
    setDetectedCategory('');
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
        {/* FORMULAIRE D'AJOUT */}
        {showAddForm && (
          <form onSubmit={addCharge} className="mb-4 p-3 rounded-xl border border-destructive/20 bg-destructive/5 animate-scale-in">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="w-full sm:flex-1 space-y-1.5 relative">
                  <Label htmlFor="charge-label" className="text-xs">Libellé</Label>
                  <div className="relative">
                      <Input
                        id="charge-label"
                        value={newChargeLabel}
                        onChange={(e) => setNewChargeLabel(e.target.value)}
                        onBlur={handleLabelBlur} // Trigger AI
                        placeholder="Ex: Forfait Sosh, EDF..."
                        className="h-9 bg-white pr-10"
                        required
                        autoFocus
                      />
                      {/* Indicateur visuel d'analyse */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isAnalyzing ? (
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                          ) : detectedCategory ? (
                              <span className="text-[9px] font-bold text-green-700 bg-green-100 border border-green-200 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-fade-in">
                                  <Sparkles className="h-2 w-2" />
                                  {OFFERS[detectedCategory]?.title || detectedCategory}
                              </span>
                          ) : null}
                      </div>
                  </div>
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
                        id="start-date" type="date" className="h-8 text-xs bg-white"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    />
                 </div>
                 <div className="w-full space-y-1.5">
                    <Label htmlFor="end-date" className="text-xs text-muted-foreground">Fin (Optionnel)</Label>
                    <Input 
                        id="end-date" type="date" className="h-8 text-xs bg-white"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-8 text-xs">Annuler</Button>
                <Button type="submit" size="sm" variant="destructive" className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* LISTE DES CHARGES */}
        {charges.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucune charge récurrente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {charges.map((charge) => {
              const hasDates = charge.startDate || charge.endDate;
              const dateText = hasDates ? 'Dates définies' : null;
              
              // Est-ce qu'on a une offre pour cette catégorie ?
              const offer = charge.category ? OFFERS[charge.category] : null;

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
                    
                    {/* Badge Dates */}
                    {hasDates && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded w-fit">
                           <Clock className="h-3 w-3" />
                           <span className="truncate max-w-[120px]">{dateText}</span>
                        </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-1 items-end">
                      
                      {/* BOUTON SUGGESTION (Affiché si offre dispo) */}
                      {offer && (
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button 
                                      variant="ghost" 
                                      size="icon-sm" 
                                      className={cn("h-7 w-7 transition-colors", offer.color, "bg-opacity-20 hover:bg-opacity-30")}
                                      title="Optimiser cette dépense"
                                  >
                                      <Lightbulb className="h-3.5 w-3.5" />
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-72 border-none shadow-xl" align="end">
                                  <div className="space-y-3">
                                      <div className="flex items-center gap-2 border-b pb-2 border-border/50">
                                          <div className={cn("p-1.5 rounded-full bg-opacity-20", offer.color)}>
                                            <Sparkles className="h-4 w-4" />
                                          </div>
                                          <h4 className="font-semibold text-sm">Opportunité : {offer.title}</h4>
                                      </div>
                                      
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                          {offer.text}
                                      </p>
                                      
                                      <a 
                                          href={offer.link} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className={cn(
                                              "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow", 
                                              offer.color, 
                                              "text-white bg-opacity-100 hover:opacity-90" // Bouton plein
                                          )}
                                          // Note: Pour que la classe dynamique bg fonctionne bien, s'assurer que offer.color contient des classes valides
                                          // Dans l'objet OFFERS ci-dessus, j'ai mis des classes de texte/bordure.
                                          // Pour le bouton plein, on force un style inline si besoin ou on adapte les classes.
                                          style={{ backgroundColor: 'currentColor' }} 
                                      >
                                          <span className="text-white">Voir les offres</span>
                                          <ExternalLink className="h-3 w-3 text-white" />
                                      </a>
                                  </div>
                              </PopoverContent>
                          </Popover>
                      )}

                      {/* Date Button */}
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className={cn("h-7 w-7 text-muted-foreground hover:text-primary", hasDates && "text-primary")}>
                                <Calendar className="h-3.5 w-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3">
                            <div className="space-y-3">
                                <h4 className="font-medium text-xs text-muted-foreground">Période de validité</h4>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-2">
                                        <Label className="text-xs">Début</Label>
                                        <Input type="date" value={charge.startDate || ''} onChange={(e) => updateCharge(charge.id, { startDate: e.target.value })} className="col-span-2 h-8 text-xs" />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-2">
                                        <Label className="text-xs">Fin</Label>
                                        <Input type="date" value={charge.endDate || ''} onChange={(e) => updateCharge(charge.id, { endDate: e.target.value })} className="col-span-2 h-8 text-xs" />
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                      </Popover>

                      <Button variant="ghost" size="icon-sm" onClick={() => removeCharge(charge.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
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