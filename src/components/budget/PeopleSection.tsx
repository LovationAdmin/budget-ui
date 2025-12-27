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
import { Plus, Trash2, Users, DollarSign, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from '@/utils/importConverter';

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
    // Ensure section is open when adding
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
    // UPDATED STYLE: Emerald Gradient (Green for Income)
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/30 animate-slide-up transition-all duration-300">
      <CardHeader 
        className="pb-3 cursor-pointer hover:opacity-80 transition-opacity" 
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
            <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-emerald-900">
                  {totalSalary.toLocaleString('fr-FR')} €
                </p>
                <p className="text-xs text-emerald-700">Total mensuel</p>
            </div>

            {/* Chevron Toggle */}
            <div className="text-emerald-700">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
        
        {/* Mobile Total (visible only on small screens) */}
        {!isExpanded && (
            <div className="sm:hidden flex justify-end mt-2 animate-fade-in">
                 <p className="text-lg font-bold text-emerald-900">
                      {totalSalary.toLocaleString('fr-FR')} € 
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ mois</span>
                 </p>
            </div>
        )}
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
            {people.map((person) => {
              const hasDates = person.startDate || person.endDate;
              const dateText = hasDates
                ? `${person.startDate ? new Date(person.startDate).toLocaleDateString(undefined, {month:'short', year:'2-digit'}) : '...'} → ${person.endDate ? new Date(person.endDate).toLocaleDateString(undefined, {month:'short', year:'2-digit'}) : '...'}`
                : null;

              return (
                <div
                    key={person.id}
                    className="group relative flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                    <MemberAvatar name={person.name} size="sm" />
                    
                    <div className="flex-1 min-w-0">
                    <Input
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                        className="h-7 text-sm font-medium bg-transparent border-0 p-0 focus-visible:ring-0 px-1 -ml-1 text-emerald-950"
                    />
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3 text-emerald-600" />
                        <Input
                            type="number"
                            value={person.salary}
                            onChange={(e) => updatePerson(person.id, { salary: parseFloat(e.target.value) || 0 })}
                            className="h-6 w-20 text-xs bg-transparent border-0 p-0 focus-visible:ring-0 font-semibold text-emerald-700"
                        />
                    </div>

                    {/* Date Badge */}
                    {hasDates && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                            <Clock className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{dateText}</span>
                        </div>
                    )}
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                        {/* Date Editor */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon-sm" 
                                    className={cn(
                                        "h-7 w-7 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50",
                                        hasDates && "text-emerald-700 bg-emerald-50"
                                    )}
                                    title="Définir une période"
                                >
                                    <Calendar className="h-3.5 w-3.5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-xs text-muted-foreground">Période d'activité</h4>
                                    <div className="grid gap-2">
                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <Label htmlFor={`start-${person.id}`} className="text-xs">Début</Label>
                                            <Input
                                                id={`start-${person.id}`}
                                                type="date"
                                                value={person.startDate || ''}
                                                onChange={(e) => updatePerson(person.id, { startDate: e.target.value })}
                                                className="col-span-2 h-8 text-xs"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <Label htmlFor={`end-${person.id}`} className="text-xs">Fin</Label>
                                            <Input
                                                id={`end-${person.id}`}
                                                type="date"
                                                value={person.endDate || ''}
                                                onChange={(e) => updatePerson(person.id, { endDate: e.target.value })}
                                                className="col-span-2 h-8 text-xs"
                                            />
                                        </div>
                                    </div>
                                    {(person.startDate || person.endDate) && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full h-7 text-xs text-muted-foreground hover:text-destructive"
                                            onClick={() => updatePerson(person.id, { startDate: undefined, endDate: undefined })}
                                        >
                                            Effacer les dates
                                        </Button>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removePerson(person.id)}
                            className="h-7 w-7 text-emerald-300 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
              );
            })}
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
            className="mb-4 p-3 rounded-xl border border-emerald-200 bg-white/50 animate-scale-in"
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
                    className="h-9 bg-white"
                    required
                    autoFocus
                    />
                </div>
                <div className="w-full sm:w-32 space-y-1.5">
                    <Label htmlFor="person-salary" className="text-xs">Salaire</Label>
                    <Input
                    id="person-salary"
                    type="number"
                    value={newPersonSalary}
                    onChange={(e) => setNewPersonSalary(e.target.value)}
                    placeholder="2000"
                    className="h-9 bg-white"
                    />
                </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="w-full space-y-1.5">
                        <Label htmlFor="start-date" className="text-xs text-muted-foreground">Début (Optionnel)</Label>
                        <Input 
                            id="start-date" 
                            type="date" 
                            className="h-8 text-xs bg-white"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="w-full space-y-1.5">
                        <Label htmlFor="end-date" className="text-xs text-muted-foreground">Fin (Optionnel)</Label>
                        <Input 
                            id="end-date" 
                            type="date" 
                            className="h-8 text-xs bg-white"
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
                        className="h-8 text-xs"
                    >
                        Annuler
                    </Button>
                    <Button type="submit" size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
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