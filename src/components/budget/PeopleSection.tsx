import { useState, ChangeEvent } from 'react';
import React from 'react';

interface Person {
    id: string;
    name: string;
    salary: number;
}

interface PeopleSectionProps {
    people: Person[];
    onPeopleChange: (people: Person[]) => void;
}

export default function PeopleSection({ people, onPeopleChange }: PeopleSectionProps): JSX.Element {
  const [newPerson, setNewPerson] = useState({ name: '', salary: '' });

  const addPerson = () => {
    if (newPerson.name && newPerson.salary) {
      onPeopleChange([
        ...people,
        {
          id: `p${Date.now()}`,
          name: newPerson.name,
          salary: parseFloat(newPerson.salary) || 0
        }
      ]);
      setNewPerson({ name: '', salary: '' });
    }
  };

  const removePerson = (id: string) => {
    onPeopleChange(people.filter(p => p.id !== id));
  };

  const updatePerson = (id: string, field: keyof Person, value: string) => {
    onPeopleChange(
      people.map(p =>
        p.id === id
          ? { ...p, [field]: field === 'salary' ? parseFloat(value) || 0 : value }
          : p
      ) as Person[]
    );
  };

  const totalSalaries = people.reduce((sum, p) => sum + (p.salary || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">👥</span>
        Personnes & Salaires
      </h2>

      {/* List of people */}
      <div className="space-y-3 mb-4">
        {people.map((person) => (
          <div key={person.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <input
              type="text"
              value={person.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updatePerson(person.id, 'name', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Nom"
            />
            <input
              type="number"
              value={person.salary || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updatePerson(person.id, 'salary', e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Salaire"
            />
            <span className="text-gray-600 font-medium">€</span>
            <button
              onClick={() => removePerson(person.id)}
              className="text-red-600 hover:text-red-700 font-bold text-xl px-3"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add new person */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={newPerson.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPerson({ ...newPerson, name: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          placeholder="Nom de la personne"
        />
        <input
          type="number"
          value={newPerson.salary}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPerson({ ...newPerson, salary: e.target.value })}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          placeholder="Salaire"
        />
        <button
          onClick={addPerson}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Ajouter
        </button>
      </div>

      {/* Total */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex justify-between items-center">
        <span className="font-semibold text-gray-700">Total Salaires Mensuels:</span>
        <span className="text-2xl font-bold text-primary-600">
          {totalSalaries.toLocaleString('fr-FR')} €
        </span>
      </div>
    </div>
  );
}