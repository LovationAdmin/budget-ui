// src/components/budget/PeopleSection.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "./MemberAvatar";
import { 
  Plus, 
  Trash2, 
  Users, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Pencil,
  Save,
  X,
  Wallet,
  CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from '@/utils/importConverter';

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface PeopleSectionProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
  currency?: string; 
}

// ✅ HELPER: Get correct symbol for any currency code
function getCurrencySymbol(code?: string): string {
  switch (code) {
    case 'USD': return '$';
    case 'CAD': return '$';
    case 'GBP': return '£';
    case 'CHF': return 'CHF';
    case 'EUR': return '€';
    case 'XOF': return 'CFA';
    case 'MAD': return 'DH'; 
    default: return '€';
  }
}

export default function PeopleSection({ people, onPeopleChange, currency = 'EUR' }: PeopleSectionProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonSalary, setNewPersonSalary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // ✅ Symbole de devise intelligent
  const currencySymbol = getCurrencySymbol(currency);

  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
      salary: parseFloat(newPersonSalary) || 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    onPeopleChange([...people, newPerson]);
    setNewPersonName('');
    setNewPersonSalary('');
    setStartDate('');
    setEndDate('');
    setShowAddForm(false);
    setIsExpanded(true);
  };

  const removePerson = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) {
      onPeopleChange(people.filter(p => p.id !== id));
    }
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    onPeopleChange(
      people.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const totalSalary = people.reduce((sum, p) => sum + p.salary, 0);

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/30 transition-all duration-300 shadow-sm hover:shadow-md">
      <CardHeader 
        className="pb-4 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg flex items-center gap-2 text-emerald-900">
                Revenus du Foyer
                <span className="text-xs font-normal px-2 py-0.5 bg-emerald-100/50 text-emerald-700 rounded-full">
                  {people.length}
                </span>
              </CardTitle>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-emerald-900 tabular-nums tracking-tight">
                  {totalSalary.toLocaleString('fr-FR')} <span className="text-lg text-emerald-700/80">{currencySymbol}</span>
                </p>
                <p className="text-xs text-emerald-700 font-medium">Total mensuel</p>
            </div>
            <div className="text-emerald-800 bg-white/50 p-1 rounded-full">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
      <CardContent className="animate-accordion-down space-y-4">
        {/* Mobile Total (visible only on small screens) */}
        <div className="sm:hidden flex justify-between items-center p-3 bg-white/60 rounded-lg border border-emerald-100 mb-2">
            <span className="text-sm text-emerald-700 font-medium">Total mensuel</span>
            <span className="text-lg font-bold text-emerald-900">{totalSalary.toLocaleString('fr-FR')} {currencySymbol}</span>
        </div>

        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-emerald-800/60 text-sm bg-white/40 rounded-xl border-2 border-dashed border-emerald-100">
            <Users className="h-10 w-10 mb-2 opacity-20" />
            <p>Aucun revenu ajouté pour le moment.</p>
            <p className="text-xs mt-1 opacity-70">Ajoutez les membres du foyer qui contribuent au budget.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {people.map((person) => (
              <PersonItem
                key={person.id}
                person={person}
                onUpdate={updatePerson}
                onDelete={removePerson}
                currencySymbol={currencySymbol}
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
            className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 transition-all h-12"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un revenu
          </Button>
        ) : (
          <form 
            onSubmit={addPerson} 
            onClick={(e) => e.stopPropagation()}
            className="space-y-4 p-5 border border-emerald-200 rounded-xl bg-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between border-b border-emerald-50 pb-2 mb-2">
                <h4 className="font-semibold text-emerald-900 text-sm">Nouveau revenu</h4>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowAddForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="person-name" className="text-xs font-medium text-gray-600">Nom</Label>
                    <div className="relative">
                        <Input
                            id="person-name"
                            value={newPersonName}
                            onChange={(e) => setNewPersonName(e.target.value)}
                            placeholder="Ex: Jean"
                            required
                            autoFocus
                            className="pl-9"
                        />
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="person-salary" className="text-xs font-medium text-gray-600">Salaire Mensuel ({currencySymbol})</Label>
                    <div className="relative">
                        <Input
                            id="person-salary"
                            type="number"
                            value={newPersonSalary}
                            onChange={(e) => setNewPersonSalary(e.target.value)}
                            placeholder="2000"
                            className="pl-9 font-mono"
                        />
                         <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <div className="space-y-1.5">
                    <Label htmlFor="start-date" className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> Début (Optionnel)
                    </Label>
                    <Input 
                        id="start-date" 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-8 text-xs bg-white"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="end-date" className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> Fin (Optionnel)
                    </Label>
                    <Input 
                        id="end-date" 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-8 text-xs bg-white"
                    />
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowAddForm(false)} 
                    className="text-gray-500 hover:text-gray-700"
                >
                    Annuler
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-6">
                    Ajouter
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
// COMPOSANT ITEM DE PERSONNE - STYLE CARTE RAFFINÉE
// ============================================================================

interface PersonItemProps {
  person: Person;
  onUpdate: (id: string, updates: Partial<Person>) => void;
  onDelete: (id: string) => void;
  currencySymbol: string; 
}

function PersonItem({ person, onUpdate, onDelete, currencySymbol }: PersonItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(person.name);
  const [editSalary, setEditSalary] = useState(person.salary.toString());
  const [editStartDate, setEditStartDate] = useState(person.startDate);
  const [editEndDate, setEditEndDate] = useState(person.endDate);

  const handleSave = () => {
    onUpdate(person.id, {
      name: editName,
      salary: parseFloat(editSalary) || 0,
      startDate: editStartDate,
      endDate: editEndDate
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(person.name);
    setEditSalary(person.salary.toString());
    setEditStartDate(person.startDate);
    setEditEndDate(person.endDate);
    setIsEditing(false);
  };

  const hasDates = person.startDate || person.endDate;
  
  const formatDate = (dateStr?: string) => {
      if (!dateStr) return '...';
      return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  };

  // ✅ MODE ÉDITION
  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-xl border-2 border-emerald-400 shadow-xl space-y-4 ring-4 ring-emerald-50 relative z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-50">
          <h4 className="font-semibold text-sm text-emerald-900 flex items-center gap-2">
             <Pencil className="h-4 w-4" /> Édition de {person.name}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-500">Nom</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-500">Salaire ({currencySymbol})</Label>
                <Input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Début</Label>
                <Input type="date" value={editStartDate || ''} onChange={(e) => setEditStartDate(e.target.value)} className="h-8 text-xs bg-white" />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fin</Label>
                <Input type="date" value={editEndDate || ''} onChange={(e) => setEditEndDate(e.target.value)} className="h-8 text-xs bg-white" />
            </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={handleCancel}>Annuler</Button>
            <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">Enregistrer</Button>
        </div>
      </div>
    );
  }

  // ✅ MODE AFFICHAGE - Design "Carte Contact"
  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-xl border border-transparent shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
      
      {/* Partie Gauche : Avatar et Infos */}
      <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
        <div className="relative">
            <MemberAvatar name={person.name} size="md" className="h-12 w-12 text-lg shadow-sm border-2 border-white ring-1 ring-emerald-100" />
            {hasDates && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-100 text-emerald-800 rounded-full p-1 border border-white" title="Période définie">
                    <Clock className="h-3 w-3" />
                </div>
            )}
        </div>
        
        <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-base">{person.name}</span>
            
            {hasDates ? (
               <div className="flex items-center gap-1.5 mt-1">
                   <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                       {formatDate(person.startDate)} → {formatDate(person.endDate)}
                   </span>
               </div>
            ) : (
                <span className="text-xs text-muted-foreground mt-0.5">Membre permanent</span>
            )}
        </div>
      </div>

      {/* Partie Droite : Montant et Actions */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-16 sm:pl-0">
        <div className="flex flex-col items-end">
             <span className="font-bold text-lg text-emerald-900 tabular-nums tracking-tight">
                {person.salary.toLocaleString()} {currencySymbol}
             </span>
             <span className="text-[10px] text-emerald-600/70 font-medium uppercase tracking-wider">Mensuel</span>
        </div>

        {/* Actions (Visibles au hover sur desktop, toujours un peu visibles sur mobile) */}
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 border-l border-gray-100 pl-3 ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(person.id)}
            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}