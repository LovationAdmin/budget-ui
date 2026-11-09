// src/components/DownloadNextStep.tsx
// ============================================================================
// After a free template download, the next step. The file downloads as usual,
// nothing stands in its way; a moment later a small panel confirms it and
// offers the same budget online. It never blocks the page: no backdrop, no
// focus taken. Not shown to signed-in people; « Non merci » (or Escape) keeps
// it away for 30 days in this browser.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { defineMessages, useT } from '@/i18n/runtime';
import { track } from '@/lib/analytics';

export type TemplateKind = 'xlsx' | 'pdf';

const DISMISSED_KEY = 'bf_download_next_step_dismissed';
const QUIET_MS = 30 * 24 * 3600 * 1000;
// Lets the browser's own download prompt show first: the panel follows the
// download, it doesn't answer the click in its place.
const DELAY_MS = 500;

const M = defineMessages<{
  started: Record<TemplateKind, string>;
  title: string;
  text: string;
  cta: string;
  dismiss: string;
}>({
  fr: {
    started: { xlsx: 'Votre tableau Excel se télécharge.', pdf: 'Votre grille PDF se télécharge.' },
    title: 'Le même budget, sans le recopier chaque mois',
    text: 'En ligne, chaque mois se remplit tout seul, sur téléphone comme sur ordinateur, seul ou à plusieurs. Gratuit, sans carte bancaire.',
    cta: 'Créer mon budget en ligne',
    dismiss: 'Non merci',
  },
  en: {
    started: { xlsx: 'Your Excel template is downloading.', pdf: 'Your printable PDF is downloading.' },
    title: 'The same budget, without copying it every month',
    text: 'Online, every month fills itself in, on your phone or computer, on your own or together. Free, no credit card.',
    cta: 'Create my budget online',
    dismiss: 'No thanks',
  },
});

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return at > 0 && Date.now() - at < QUIET_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // Storage blocked (private mode): the panel may come back next time.
  }
}

/**
 * `offer(kind)` after a download click shows the panel (unless the visitor is
 * signed in or said no lately); render `panel` once in the page.
 */
export function useDownloadNextStep() {
  const { user } = useAuth();
  const [kind, setKind] = useState<TemplateKind | null>(null);
  const timer = useRef<number>();
  const viewed = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const offer = useCallback((next: TemplateKind) => {
    if (user || dismissedRecently()) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      // Counted once per page view, even after both files.
      if (!viewed.current) track('download_next_step', { action: 'view', file_type: next });
      viewed.current = true;
      setKind(next);
    }, DELAY_MS);
  }, [user]);

  const close = useCallback(() => setKind(null), []);

  return { offer, panel: <DownloadNextStep kind={kind} onClose={close} /> };
}

function DownloadNextStep({ kind, onClose }: { kind: TemplateKind | null; onClose: () => void }) {
  const t = useT(M);

  const dismiss = useCallback(() => {
    if (!kind) return;
    track('download_next_step', { action: 'dismiss', file_type: kind });
    rememberDismissal();
    onClose();
  }, [kind, onClose]);

  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [kind, dismiss]);

  return (
    // Always in the page so screen readers announce the panel when it appears.
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:justify-end sm:px-6 sm:pb-6"
    >
      {kind && (
        <aside
          aria-labelledby="download-next-step-title"
          className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-floating animate-slide-up motion-reduce:animate-none"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            {t.started[kind]}
          </p>
          <h2 id="download-next-step-title" className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-foreground [text-wrap:balance]">
            {t.title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.text}</p>
          <div className="mt-4 flex flex-col gap-2 min-[380px]:flex-row">
            <Button asChild className="h-11 flex-1">
              <Link to="/signup" onClick={() => track('download_next_step', { action: 'signup', file_type: kind })}>
                {t.cta} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button type="button" variant="ghost" className="h-11 text-muted-foreground" onClick={dismiss}>
              {t.dismiss}
            </Button>
          </div>
        </aside>
      )}
    </div>
  );
}
