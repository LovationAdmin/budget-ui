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
  Pencil,
  Save,
  X
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

      {isExpanded && (
      <CardContent className="animate-accordion-down space-y-3">
        {people.length === 0 ? (
          <div className="text-center py-6 text-emerald-800/60 text-sm">
            Aucune personne ajoutée.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
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
// COMPOSANT ITEM DE PERSONNE - MODE ÉDITION MOBILE-FRIENDLY
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

  // ✅ MODE ÉDITION - LAYOUT VERTICAL MOBILE-FRIENDLY
  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg border-2 border-emerald-300 shadow-lg space-y-3">
        {/* Header mode édition */}
        <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
          <h4 className="font-medium text-sm text-emerald-900">✏️ Mode édition</h4>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              onClick={handleSave} 
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
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
          {/* Nom */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-name-${person.id}`} className="text-xs font-medium">
              Nom
            </Label>
            <Input 
              id={`edit-name-${person.id}`}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full"
              placeholder="Nom de la personne"
            />
          </div>

          {/* Salaire */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-salary-${person.id}`} className="text-xs font-medium">
              Salaire mensuel (€)
            </Label>
            <Input 
              id={`edit-salary-${person.id}`}
              type="number"
              value={editSalary}
              onChange={(e) => setEditSalary(e.target.value)}
              className="w-full"
              placeholder="0"
            />
          </div>

          {/* Dates - 2 colonnes sur desktop, 1 sur mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-start-${person.id}`} className="text-xs font-medium text-muted-foreground">
                Date début
              </Label>
              <Input 
                id={`edit-start-${person.id}`}
                type="date"
                value={editStartDate || ''}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-end-${person.id}`} className="text-xs font-medium text-muted-foreground">
                Date fin
              </Label>
              <Input 
                id={`edit-end-${person.id}`}
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

  // ✅ MODE AFFICHAGE
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

        {/* Actions - Toujours visibles sur mobile, hover sur desktop */}
        <div className={cn(
          "flex gap-0.5",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
        )}>
          {/* Bouton Éditer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-9 w-9 sm:h-8 sm:w-8 hover:text-emerald-700 hover:bg-emerald-50"
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Bouton Supprimer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(person.id)}
            className="h-9 w-9 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}