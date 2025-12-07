import { ChangeEvent } from 'react';
import React from 'react';

interface BudgetHeaderProps {
    budgetTitle: string;
    onTitleChange: (title: string) => void;
    currentYear: number;
    onYearChange: (year: number) => void;
}

export default function BudgetHeader({ budgetTitle, onTitleChange, currentYear, onYearChange }: BudgetHeaderProps): JSX.Element {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-8 rounded-t-xl">
      <input
        type="text"
        value={budgetTitle}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
        className="text-3xl font-bold bg-transparent border-b-2 border-white/30 focus:border-white outline-none text-center w-full placeholder-white/70"
        placeholder="Nom du budget"
      />
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => onYearChange(currentYear - 1)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
        >
          ← {currentYear - 1}
        </button>
        <span className="text-2xl font-semibold">{currentYear}</span>
        <button
          onClick={() => onYearChange(currentYear + 1)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
        >
          {currentYear + 1} →
        </button>
      </div>
    </div>
  );
}