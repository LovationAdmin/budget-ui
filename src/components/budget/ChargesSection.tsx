import { useState, ChangeEvent } from 'react';

interface Charge {
    id: string;
    label: string;
    amount: number;
}

interface ChargesSectionProps {
    charges: Charge[];
    onChargesChange: (charges: Charge[]) => void;
}

export default function ChargesSection({ charges, onChargesChange }: ChargesSectionProps): JSX.Element {
  const [newCharge, setNewCharge] = useState({ label: '', amount: '' });

  const addCharge = () => {
    if (newCharge.label && newCharge.amount) {
      onChargesChange([
        ...charges,
        {
          id: `c${Date.now()}`,
          label: newCharge.label,
          amount: parseFloat(newCharge.amount) || 0
        }
      ]);
      setNewCharge({ label: '', amount: '' });
    }
  };

  const removeCharge = (id: string) => {
    onChargesChange(charges.filter(c => c.id !== id));
  };

  const updateCharge = (id: string, field: keyof Charge, value: string) => {
    onChargesChange(
      charges.map(c =>
        c.id === id
          ? { ...c, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
          : c
      ) as Charge[]
    );
  };

  const totalCharges = charges.reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">💳</span>
        Charges Mensuelles
      </h2>

      {/* List of charges */}
      <div className="space-y-3 mb-4">
        {charges.map((charge) => (
          <div key={charge.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <input
              type="text"
              value={charge.label}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCharge(charge.id, 'label', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Type de charge"
            />
            <input
              type="number"
              value={charge.amount || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCharge(charge.id, 'amount', e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Montant"
            />
            <span className="text-gray-600 font-medium">€</span>
            <button
              onClick={() => removeCharge(charge.id)}
              className="text-red-600 hover:text-red-700 font-bold text-xl px-3"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add new charge */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={newCharge.label}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCharge({ ...newCharge, label: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          placeholder="Ex: Loyer, Électricité..."
        />
        <input
          type="number"
          value={newCharge.amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCharge({ ...newCharge, amount: e.target.value })}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          placeholder="Montant"
        />
        <button
          onClick={addCharge}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Ajouter
        </button>
      </div>

      {/* Total */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
        <span className="font-semibold text-gray-700">Total Charges Mensuelles:</span>
        <span className="text-2xl font-bold text-red-600">
          -{totalCharges.toLocaleString('fr-FR')} €
        </span>
      </div>
    </div>
  );
}
