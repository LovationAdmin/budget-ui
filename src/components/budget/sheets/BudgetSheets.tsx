// src/components/budget/sheets/BudgetSheets.tsx
// Renders the editing panel requested through `openSheet()`.

import type { SheetState } from './types';
import { AddMenuSheet, OneOffSheet, ReopenSheet } from './MonthSheets';
import {
  ChargeActionsSheet,
  ChargeAmountSheet,
  ChargeDeleteSheet,
  ChargeDetailSheet,
  ChargeEditorSheet,
  ChargeStopSheet,
} from './ChargeSheets';
import { SavingActionsSheet, SavingAmountSheet, SavingDeleteSheet, SavingEditorSheet, SpendSheet } from './SavingSheets';
import { MemberDeleteSheet, MemberDetailSheet, MemberSheet } from './MemberSheets';

export function BudgetSheets({ sheet, onClose }: { sheet: SheetState | null; onClose: () => void }) {
  if (!sheet) return null;
  switch (sheet.kind) {
    case 'addMenu':
      return <AddMenuSheet sheet={sheet} onClose={onClose} />;
    case 'oneOff':
      return <OneOffSheet sheet={sheet} onClose={onClose} />;
    case 'reopen':
      return <ReopenSheet sheet={sheet} onClose={onClose} />;
    case 'charge':
      return <ChargeActionsSheet sheet={sheet} onClose={onClose} />;
    case 'chargeAmount':
      return <ChargeAmountSheet sheet={sheet} onClose={onClose} />;
    case 'chargeStop':
      return <ChargeStopSheet sheet={sheet} onClose={onClose} />;
    case 'chargeDetail':
      return <ChargeDetailSheet sheet={sheet} onClose={onClose} />;
    case 'chargeEditor':
      return <ChargeEditorSheet sheet={sheet} onClose={onClose} />;
    case 'chargeDelete':
      return <ChargeDeleteSheet sheet={sheet} onClose={onClose} />;
    case 'saving':
      return <SavingActionsSheet sheet={sheet} onClose={onClose} />;
    case 'savingAmount':
      return <SavingAmountSheet sheet={sheet} onClose={onClose} />;
    case 'savingEditor':
      return <SavingEditorSheet sheet={sheet} onClose={onClose} />;
    case 'savingDelete':
      return <SavingDeleteSheet sheet={sheet} onClose={onClose} />;
    case 'spend':
      return <SpendSheet sheet={sheet} onClose={onClose} />;
    case 'member':
      return <MemberSheet sheet={sheet} onClose={onClose} />;
    case 'memberDetail':
      return <MemberDetailSheet sheet={sheet} onClose={onClose} />;
    case 'memberDelete':
      return <MemberDeleteSheet sheet={sheet} onClose={onClose} />;
    default:
      return null;
  }
}

export type SheetProps<K extends SheetState['kind']> = {
  sheet: Extract<SheetState, { kind: K }>;
  onClose: () => void;
};
