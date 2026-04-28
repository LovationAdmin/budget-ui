// src/hooks/useSaveStatus.ts
// ============================================================================
// 🎯 useSaveStatus — Unified state machine for auto-save UI
// ============================================================================
// Fixes P0 #3: replaces the anxious orange "unsaved changes" banner with a
// proper Notion/Figma-style state machine.
//
// States:
//   - idle:    nothing to save (default)
//   - pending: user just modified something, waiting for debounce
//   - saving:  network call in flight
//   - saved:   recent successful save (auto-resets to idle after 2s)
//   - error:   save failed (manual reset via retry)
//
// Usage:
//   const { status, markPending, markSaving, markSaved, markError, reset } = useSaveStatus();
//   <SaveStatusIndicator status={status} onRetry={...} />
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface UseSaveStatusReturn {
  status: SaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  markPending: () => void;
  markSaving: () => void;
  markSaved: () => void;
  markError: (message?: string) => void;
  reset: () => void;
}

const SAVED_FLASH_DURATION_MS = 2000;

export function useSaveStatus(): UseSaveStatusReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-reset "saved" → "idle" after a flash period
  useEffect(() => {
    if (status === 'saved') {
      flashTimerRef.current = setTimeout(() => {
        setStatus((s) => (s === 'saved' ? 'idle' : s));
      }, SAVED_FLASH_DURATION_MS);
    }
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [status]);

  const markPending = useCallback(() => {
    setStatus((current) => {
      // Don't go back from "saving" to "pending"
      if (current === 'saving') return current;
      return 'pending';
    });
  }, []);

  const markSaving = useCallback(() => {
    setErrorMessage(null);
    setStatus('saving');
  }, []);

  const markSaved = useCallback(() => {
    setLastSavedAt(new Date());
    setErrorMessage(null);
    setStatus('saved');
  }, []);

  const markError = useCallback((message?: string) => {
    setErrorMessage(message ?? 'Erreur de sauvegarde');
    setStatus('error');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    status,
    lastSavedAt,
    errorMessage,
    markPending,
    markSaving,
    markSaved,
    markError,
    reset,
  };
}
