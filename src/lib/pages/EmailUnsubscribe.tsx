// src/lib/pages/EmailUnsubscribe.tsx
// ============================================================================
// /emails/desabonnement?token=… — where the « Ne plus recevoir » link of an
// email lands. Clicking it was the request: the page unsubscribes on arrival,
// says it is done, and offers to change one's mind in one tap. No account
// session needed, the token of the email is signed.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Loader2, MailX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { emailAPI, type EmailList, type EmailListState } from '@/services/api';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    working: 'Un instant…',
    lists: { monthly_recap: 'le récap mensuel', news: 'les nouveautés de Budget Famille' } as Record<EmailList, string>,
    doneTitle: 'C’est noté.',
    done: (what: string, email: string) => `Vous ne recevrez plus ${what}${email ? ` sur ${email}` : ''}.`,
    recapWhat: 'Il vous préparait chaque mois, le 27, ce que chacun verse au pot commun et ce qui change le mois suivant. Rien n’est perdu : vos budgets restent tels quels.',
    keep: 'Finalement, je le garde',
    keeping: 'Réactivation…',
    backTitle: 'C’est reparti !',
    back: (what: string) => `Vous recevrez de nouveau ${what}.`,
    backRecap: 'Le prochain arrivera le 27, quand les salaires tombent.',
    open: 'Ouvrir Budget Famille',
    manage: 'Gérer tous mes e-mails',
    invalidTitle: 'Ce lien ne fonctionne pas',
    invalid: 'Il est peut-être incomplet (copié en partie depuis l’e-mail). Vous pouvez choisir vos e-mails depuis votre profil.',
    failedTitle: 'Le serveur ne répond pas',
    failed: 'Votre choix n’a pas encore été enregistré. Vérifiez votre connexion et réessayez.',
    retry: 'Réessayer',
  },
  en: {
    working: 'One moment…',
    lists: { monthly_recap: 'the monthly recap', news: 'Budget Famille’s news' },
    doneTitle: 'Done.',
    done: (what: string, email: string) => `You won’t receive ${what}${email ? ` at ${email}` : ''} any more.`,
    recapWhat: 'Every month on the 27th, it set out what each of you pays into the shared pot and what changes next month. Nothing is lost: your budgets stay as they are.',
    keep: 'Actually, I’ll keep it',
    keeping: 'Turning it back on…',
    backTitle: 'You’re back!',
    back: (what: string) => `You’ll receive ${what} again.`,
    backRecap: 'The next one arrives on the 27th, as pay lands.',
    open: 'Open Budget Famille',
    manage: 'Manage all my emails',
    invalidTitle: 'This link doesn’t work',
    invalid: 'It may be incomplete (partly copied from the email). You can choose your emails from your profile.',
    failedTitle: 'The server isn’t answering',
    failed: 'Your choice hasn’t been saved yet. Check your connection and try again.',
    retry: 'Try again',
  },
});

type Status = 'working' | 'unsubscribed' | 'resubscribing' | 'resubscribed' | 'invalid' | 'failed';

export default function EmailUnsubscribe() {
  const t = useT(M);
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>(token ? 'working' : 'invalid');
  const [state, setState] = useState<EmailListState | null>(null);
  // What failed, to retry the right call.
  const lastRef = useRef<'unsubscribe' | 'resubscribe'>('unsubscribe');
  const startedRef = useRef(false);

  const run = useCallback(
    async (action: 'unsubscribe' | 'resubscribe') => {
      lastRef.current = action;
      setStatus(action === 'unsubscribe' ? 'working' : 'resubscribing');
      try {
        const res = await emailAPI[action](token);
        setState(res.data);
        setStatus(action === 'unsubscribe' ? 'unsubscribed' : 'resubscribed');
      } catch (err: unknown) {
        const code = (err as { response?: { status?: number } })?.response?.status;
        setStatus(code === 400 ? 'invalid' : 'failed');
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;
    run('unsubscribe');
  }, [token, run]);

  const what = t.lists[state?.list ?? 'monthly_recap'];
  const isRecap = (state?.list ?? 'monthly_recap') === 'monthly_recap';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-background px-4 py-10 dark:from-background">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display text-lg font-extrabold text-foreground">
          <BudgetLogo size={32} />
          <span translate="no">Budget Famille</span>
        </Link>
        <div role="status" aria-live="polite" className="rounded-3xl border border-border/70 bg-card p-7 text-center shadow-soft sm:p-8">
          {(status === 'working' || status === 'resubscribing') && (
            <>
              <Loader2 aria-hidden="true" className="mx-auto h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 font-semibold text-foreground">{status === 'working' ? t.working : t.keeping}</p>
            </>
          )}

          {status === 'unsubscribed' && (
            <>
              <span aria-hidden="true" className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                <MailX className="h-7 w-7" />
              </span>
              <h1 className="mt-4 font-display text-2xl font-extrabold text-foreground">{t.doneTitle}</h1>
              <p className="mt-2 text-foreground">{t.done(what, state?.email ?? '')}</p>
              {isRecap && <p className="mt-3 text-sm text-muted-foreground">{t.recapWhat}</p>}
              <Button className="mt-6 min-h-[48px] w-full gap-2" onClick={() => run('resubscribe')}>
                <RotateCcw aria-hidden="true" className="h-4 w-4" /> {t.keep}
              </Button>
              <Button asChild variant="ghost" className="mt-2 min-h-[44px] w-full">
                <Link to="/profile#emails">{t.manage}</Link>
              </Button>
            </>
          )}

          {status === 'resubscribed' && (
            <>
              <span aria-hidden="true" className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                {isRecap ? <CalendarClock className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
              </span>
              <h1 className="mt-4 font-display text-2xl font-extrabold text-foreground">{t.backTitle}</h1>
              <p className="mt-2 text-foreground">{t.back(what)}</p>
              {isRecap && <p className="mt-3 text-sm text-muted-foreground">{t.backRecap}</p>}
              <Button asChild className="mt-6 min-h-[48px] w-full">
                <Link to="/dashboard">{t.open}</Link>
              </Button>
            </>
          )}

          {(status === 'invalid' || status === 'failed') && (
            <>
              <span aria-hidden="true" className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <MailX className="h-7 w-7" />
              </span>
              <h1 className="mt-4 font-display text-2xl font-extrabold text-foreground">{status === 'invalid' ? t.invalidTitle : t.failedTitle}</h1>
              <p className="mt-2 text-muted-foreground">{status === 'invalid' ? t.invalid : t.failed}</p>
              {status === 'failed' ? (
                <Button className="mt-6 min-h-[48px] w-full" onClick={() => run(lastRef.current)}>
                  {t.retry}
                </Button>
              ) : (
                <Button asChild className="mt-6 min-h-[48px] w-full">
                  <Link to="/profile#emails">{t.manage}</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
