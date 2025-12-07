import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "./MemberAvatar";
import { Plus, Trash2, Users, DollarSign } from "lucide-react";
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette personne ? Toutes ses données seront perdues.')) {
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Personnes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {people.length} personne{people.length > 1 ? 's' : ''} • 
                {' '}{totalSalary.toLocaleString('fr-FR')} € / mois
              </p>
            </div>
          </div>
          
          {!showAddForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={addPerson} className="glass-card-elevated p-4 space-y-3 animate-scale-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="person-name">Nom</Label>
                <Input
                  id="person-name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Jean Dupont"
                  required
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="person-salary">Salaire mensuel (€)</Label>
                <Input
                  id="person-salary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPersonSalary}
                  onChange={(e) => setNewPersonSalary(e.target.value)}
                  placeholder="2500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" variant="gradient" size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPersonName('');
                  setNewPersonSalary('');
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {/* People List */}
        {people.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune personne ajoutée</p>
            <p className="text-xs mt-1">Commencez par ajouter les membres du foyer</p>
          </div>
        ) : (
          <div className="space-y-2">
            {people.map((person) => (
              <div
                key={person.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-xl border border-border/50",
                  "bg-card/50 hover:bg-card transition-all duration-200",
                  "hover:shadow-soft"
                )}
              >
                <MemberAvatar name={person.name} size="md" />
                
                <div className="flex-1 min-w-0">
                  <Input
                    value={person.name}
                    onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                    className="font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:bg-white/50 rounded px-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-success/10 text-success px-3 py-1.5 rounded-lg">
                    <DollarSign className="h-4 w-4" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={person.salary}
                      onChange={(e) => updatePerson(person.id, { salary: parseFloat(e.target.value) || 0 })}
                      className="w-24 bg-transparent border-0 p-0 h-auto text-right font-semibold focus-visible:ring-0 focus-visible:bg-white/50 rounded px-1"
                    />
                    <span className="text-xs">€</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removePerson(person.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}