import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "./MemberAvatar";
import { Plus, Trash2, Users, DollarSign, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from '@/utils/importConverter';

interface PeopleSectionProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
}

export default function PeopleSection({ people, onPeopleChange }: PeopleSectionProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonSalary, setNewPersonSalary] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
      salary: parseFloat(newPersonSalary) || 0,
    };

    onPeopleChange([...people, newPerson]);
    setNewPersonName('');
    setNewPersonSalary('');
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
              <CardTitle className="font-display text-lg">Personnes</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalSalary.toLocaleString('fr-FR')} € / mois
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
        {/* Add Form (Inline) */}
        {showAddForm && (
          <form onSubmit={addPerson} className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5 animate-scale-in">
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
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="gradient" className="h-9">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-9">
                    <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* COMPACT GRID LAYOUT */}
        {people.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Ajoutez les membres du foyer ici.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="group relative flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:shadow-sm transition-all"
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
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removePerson(person.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-7 w-7"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}