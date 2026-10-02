// src/components/budget/sheets/types.ts
// Every editing panel the budget screens can open.
import type { YM } from '@/lib/budget/types';

export type SheetState =
  | { kind: 'addMenu'; ym: YM }
  | { kind: 'charge'; id: string; ym: YM }
  | { kind: 'chargeAmount'; id: string; ym: YM; fromCatalog?: boolean }
  | { kind: 'chargeStop'; id: string; ym: YM }
  | { kind: 'chargeDetail'; id: string }
  | { kind: 'chargeEditor'; id?: string; ym: YM; ownerId?: string }
  | { kind: 'chargeDelete'; id: string }
  | { kind: 'saving'; id: string; ym: YM }
  | { kind: 'savingAmount'; id: string; ym: YM; fromCatalog?: boolean }
  | { kind: 'savingEditor'; id?: string; ym: YM }
  | { kind: 'savingDelete'; id: string }
  | { kind: 'spend'; ym: YM; potId?: string }
  | { kind: 'oneOff'; ym: YM }
  | { kind: 'member'; id?: string; ym: YM }
  | { kind: 'memberDetail'; id: string }
  | { kind: 'memberDelete'; id: string }
  | { kind: 'reopen'; ym: YM };
