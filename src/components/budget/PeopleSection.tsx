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
import { Plus, Trash2, Users, DollarSign, Calendar, Clock } from "lucide-react";
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
    <Card className="glass-card animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Revenus (Salaires)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total théorique : {totalSalary.toLocaleString('fr-FR')} € / mois
              </p>
            </div>
          </div>
          
          {!showAddForm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-1 h-8 bg-primary/5 hover:bg-primary/10 text-primary"
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
          <form onSubmit={addPerson} className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5 animate-scale-in">
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
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-8 text-xs">
                        Annuler
                    </Button>
                    <Button type="submit" size="sm" variant="gradient" className="h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                </div>
            </div>
          </form>
        )}

        {/* List - UPDATED TO GRID LAYOUT */}
        {people.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
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
                    className="group relative flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
                >
                    <MemberAvatar name={person.name} size="sm" />
                    
                    <div className="flex-1 min-w-0">
                    <Input
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                        className="h-7 text-sm font-medium bg-transparent border-0 p-0 focus-visible:ring-0 px-1 -ml-1"
                    />
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <Input
                            type="number"
                            value={person.salary}
                            onChange={(e) => updatePerson(person.id, { salary: parseFloat(e.target.value) || 0 })}
                            className="h-6 w-20 text-xs bg-transparent border-0 p-0 focus-visible:ring-0"
                        />
                    </div>

                    {/* Date Badge */}
                    {hasDates && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded w-fit">
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
                                        "h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10",
                                        hasDates && "text-primary bg-primary/5"
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
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
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