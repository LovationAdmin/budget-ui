import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "./MemberAvatar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Plus, 
  Trash2, 
  Users, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from '@/utils/importConverter';

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface PeopleSectionProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
}

export default function PeopleSection({ people, onPeopleChange }: PeopleSectionProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonSalary, setNewPersonSalary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Collapsible State
  const [isExpanded, setIsExpanded] = useState(true);

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
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/30 transition-all duration-300">
      <CardHeader 
        className="pb-4 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* LEFT SIDE: Icon + Title + Count */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg flex items-center gap-2 text-emerald-900">
                Revenus (Salaires)
                <span className="text-sm font-normal text-emerald-700/70">
                  ({people.length} personne{people.length > 1 ? 's' : ''})
                </span>
              </CardTitle>
            </div>
          </div>
          
          {/* RIGHT SIDE: Total + Chevron */}
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-2xl font-bold text-emerald-900">
                  {totalSalary.toLocaleString('fr-FR')} €
                </p>
                <p className="text-xs text-emerald-700">Total mensuel</p>
            </div>

            <div className="text-emerald-700">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Collapsible Content */}
      {isExpanded && (
      <CardContent className="animate-accordion-down space-y-3">
        
        {/* List */}
        {people.length === 0 ? (
          <div className="text-center py-6 text-emerald-800/60 text-sm">
            Aucune personne ajoutée.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {people.map((person) => (
              <PersonItem
                key={person.id}
                person={person}
                onUpdate={updatePerson}
                onDelete={removePerson}
              />
            ))}
          </div>
        )}

        {/* Formulaire d'ajout / Bouton Ajouter (Style Charges) */}
        {!showAddForm ? (
          <Button 
            onClick={(e) => {
                e.stopPropagation();
                setShowAddForm(true);
            }} 
            variant="outline" 
            className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une personne
          </Button>
        ) : (
          <form 
            onSubmit={addPerson} 
            onClick={(e) => e.stopPropagation()}
            className="space-y-3 p-4 border border-emerald-200 rounded-lg bg-white"
          >
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full sm:flex-1 space-y-1.5">
                    <Label htmlFor="person-name" className="text-xs">Nom</Label>
                    <Input
                    id="person-name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="Ex: Jean"
                    required
                    autoFocus
                    />
                </div>
                <div className="w-full sm:w-32 space-y-1.5">
                    <Label htmlFor="person-salary" className="text-xs">Salaire (€)</Label>
                    <Input
                    id="person-salary"
                    type="number"
                    value={newPersonSalary}
                    onChange={(e) => setNewPersonSalary(e.target.value)}
                    placeholder="2000"
                    />
                </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="w-full space-y-1.5">
                        <Label htmlFor="start-date" className="text-xs text-muted-foreground">Début (Optionnel)</Label>
                        <Input 
                            id="start-date" 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="w-full space-y-1.5">
                        <Label htmlFor="end-date" className="text-xs text-muted-foreground">Fin (Optionnel)</Label>
                        <Input 
                            id="end-date" 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setShowAddForm(false)} 
                    >
                        Annuler
                    </Button>
                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                </div>
            </div>
          </form>
        )}

      </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// COMPOSANT ITEM DE PERSONNE (Refactored to match ChargeItem)
// ============================================================================

interface PersonItemProps {
  person: Person;
  onUpdate: (id: string, updates: Partial<Person>) => void;
  onDelete: (id: string) => void;
}

function PersonItem({ person, onUpdate, onDelete }: PersonItemProps) {
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
  const dateText = hasDates
    ? `${person.startDate ? new Date(person.startDate).toLocaleDateString(undefined, {month:'short', year:'2-digit'}) : '...'} → ${person.endDate ? new Date(person.endDate).toLocaleDateString(undefined, {month:'short', year:'2-digit'}) : '...'}`
    : null;

  if (isEditing) {
    const hasEditDates = editStartDate || editEndDate;

    return (
      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-emerald-200">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 h-8"
          placeholder="Nom"
        />
        <Input
          type="number"
          value={editSalary}
          onChange={(e) => setEditSalary(e.target.value)}
          className="w-24 h-8"
          placeholder="0"
        />

        {/* Date Editor Button (Popover) - Same pattern as Charges */}
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "h-8 w-8 hover:bg-emerald-50",
                        hasEditDates ? "text-emerald-600 bg-emerald-50" : "text-muted-foreground"
                    )}
                    title="Modifier la période"
                >
                    <Calendar className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3">
                <div className="space-y-3">
                    <h4 className="font-medium text-xs text-muted-foreground">Période d'activité</h4>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-2">
                            <Label className="text-xs">Début</Label>
                            <Input
                                type="date"
                                value={editStartDate || ''}
                                onChange={(e) => setEditStartDate(e.target.value)}
                                className="col-span-2 h-8 text-xs"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-2">
                            <Label className="text-xs">Fin</Label>
                            <Input
                                type="date"
                                value={editEndDate || ''}
                                onChange={(e) => setEditEndDate(e.target.value)}
                                className="col-span-2 h-8 text-xs"
                            />
                        </div>
                    </div>
                    {(editStartDate || editEndDate) && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full h-7 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => {
                                setEditStartDate(undefined);
                                setEditEndDate(undefined);
                            }}
                        >
                            Effacer les dates
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>

        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white">
          ✓
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-emerald-50/50 transition-colors group border border-transparent hover:border-emerald-200">
      
      {/* Left Info: Avatar + Name + Date */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <MemberAvatar name={person.name} size="sm" />
        
        <div className="flex flex-col">
            <span className="font-medium text-sm truncate text-emerald-950">{person.name}</span>
            {hasDates && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{dateText}</span>
                </div>
            )}
        </div>
      </div>

      {/* Right Info: Amount + Actions */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-emerald-700 text-sm whitespace-nowrap">
          {person.salary.toLocaleString()} €
        </span>

        {/* ✅ MOBILE FIX: Actions toujours visibles sur mobile, hover sur desktop */}
        {/* Bouton Éditer */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 p-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-emerald-700 hover:bg-emerald-50"
          title="Modifier"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        {/* Bouton Supprimer */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(person.id)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}