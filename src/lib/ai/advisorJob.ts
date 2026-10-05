// src/lib/ai/advisorJob.ts
// ============================================================================
// Génération « Budget IA » en arrière-plan, une par budget.
// ----------------------------------------------------------------------------
// La génération prend de 20 s à 1 min : elle vit hors du composant pour
// survivre à un changement d'onglet, et le résultat est gardé (sessionStorage)
// jusqu'à ce que l'utilisateur le valide ou le rejette.
// ============================================================================

import { useSyncExternalStore } from 'react';
import { AIProposalError, clearAIAdvisorStorage, streamAIProposal } from '@/services/api';
import type {
  AdvisorErrorCode,
  AdvisorStage,
  BudgetProposal,
  HouseholdInput,
  Method,
} from '@/types/aiBudget';

export type AdvisorJobState =
  | {
      status: 'running';
      stage: AdvisorStage;
      method?: Method;
      /** 2 pendant la seconde tentative. */
      attempt: number;
      /** false tant qu'aucune étape réelle n'est remontée (repli JSON). */
      live: boolean;
      startedAt: number;
    }
  | { status: 'done'; proposal: BudgetProposal; input: HouseholdInput }
  | { status: 'error'; message: string; code: AdvisorErrorCode; retryable: boolean };

interface Job {
  state: AdvisorJobState;
  input: HouseholdInput;
  controller?: AbortController;
}

const jobs = new Map<string, Job>();
const listeners = new Set<() => void>();
const storageKey = (budgetId: string) => `ai-advisor-result:${budgetId}`;

function notify() {
  listeners.forEach((l) => l());
}

function setState(budgetId: string, job: Job, state: AdvisorJobState) {
  // Ignore updates from a job that was cancelled or replaced.
  if (jobs.get(budgetId) !== job) return;
  job.state = state;
  if (state.status === 'done') {
    try {
      sessionStorage.setItem(storageKey(budgetId), JSON.stringify({ input: job.input, proposal: state.proposal }));
    } catch {
      /* stockage indisponible : le résultat reste en mémoire */
    }
  }
  notify();
}

function restore(budgetId: string): Job | undefined {
  try {
    const raw = sessionStorage.getItem(storageKey(budgetId));
    if (!raw) return undefined;
    const { input, proposal } = JSON.parse(raw) as { input: HouseholdInput; proposal: BudgetProposal };
    const job: Job = { input, state: { status: 'done', proposal, input } };
    jobs.set(budgetId, job);
    return job;
  } catch {
    return undefined;
  }
}

/** Lance (ou relance) la génération pour ce budget. */
export function startAdvisorJob(budgetId: string, input: HouseholdInput): void {
  jobs.get(budgetId)?.controller?.abort();
  const controller = new AbortController();
  const job: Job = {
    input,
    controller,
    state: { status: 'running', stage: 'analyzing', attempt: 1, live: false, startedAt: Date.now() },
  };
  jobs.set(budgetId, job);
  notify();

  streamAIProposal(input, {
    signal: controller.signal,
    onProgress: (p) => {
      const prev = job.state.status === 'running' ? job.state : null;
      if (!prev) return;
      setState(budgetId, job, {
        ...prev,
        live: true,
        stage: p.stage === 'retry' ? 'analyzing' : p.stage,
        method: p.stage === 'retry' ? undefined : p.method ?? prev.method,
        attempt: p.attempt ?? prev.attempt,
      });
    },
  })
    .then((proposal) => setState(budgetId, job, { status: 'done', proposal, input }))
    .catch((err: unknown) => {
      if (controller.signal.aborted) return; // annulé par l'utilisateur
      const e =
        err instanceof AIProposalError
          ? err
          : new AIProposalError("L'IA n'a pas pu proposer de budget. Réessayez dans un instant.", 'http_error', true);
      setState(budgetId, job, { status: 'error', message: e.message, code: e.code, retryable: e.retryable });
    });
}

/** Relance la dernière demande (bouton « Réessayer »). */
export function retryAdvisorJob(budgetId: string): void {
  const job = jobs.get(budgetId);
  if (job) startAdvisorJob(budgetId, job.input);
}

/** Annule la génération en cours, ou oublie le résultat (validé / rejeté). */
export function clearAdvisorJob(budgetId: string): void {
  jobs.get(budgetId)?.controller?.abort();
  jobs.delete(budgetId);
  try {
    sessionStorage.removeItem(storageKey(budgetId));
  } catch {
    /* rien à nettoyer */
  }
  notify();
}

/** À la déconnexion : rien de la session précédente ne doit rester. */
export function clearAllAdvisorJobs(): void {
  jobs.forEach((job) => job.controller?.abort());
  jobs.clear();
  clearAIAdvisorStorage();
  notify();
}

export function getAdvisorJob(budgetId: string): AdvisorJobState | null {
  return (jobs.get(budgetId) ?? restore(budgetId))?.state ?? null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** État de la génération du budget (null : aucune). */
export function useAdvisorJob(budgetId: string | undefined): AdvisorJobState | null {
  return useSyncExternalStore(subscribe, () => (budgetId ? getAdvisorJob(budgetId) : null));
}
