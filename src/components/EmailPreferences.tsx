// src/components/EmailPreferences.tsx
// ============================================================================
// The emails an account receives (Profile, #emails): the monthly recap, sent
// on the 27th as pay lands, and the product news. Each one is switched on or
// off in a tap; the recap's own unsubscribe link lands on /emails/desabonnement.
// ============================================================================

import { useEffect, useState } from 'react';
import { CalendarClock, Megaphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useHashScroll } from '@/components/budget/shared/hooks';
import { userAPI } from '@/services/api';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    title: 'E-mails',
    intro: 'Choisissez ce que Budget Famille vous envoie. Les e-mails liés à votre compte (mot de passe, invitations) partent toujours.',
    recap: 'Le récap du mois',
    recapHelp: 'Le 27, quand les salaires tombent : ce que chacun verse au pot commun, ce qui change le mois suivant, votre épargne.',
    news: 'Les nouveautés',
    newsHelp: 'Quelques e-mails par an quand l’app change vraiment.',
    on: (what: string) => `${what} : activé.`,
    off: (what: string) => `${what} : désactivé.`,
    failed: 'Le réglage n’a pas pu être enregistré. Réessayez.',
  },
  en: {
    title: 'Emails',
    intro: 'Choose what Budget Famille sends you. Emails about your account (password, invitations) always go out.',
    recap: 'The monthly recap',
    recapHelp: 'On the 27th, as pay lands: what each of you pays into the shared pot, what changes next month, your savings.',
    news: 'What’s new',
    newsHelp: 'A few emails a year, when the app really changes.',
    on: (what: string) => `${what}: on.`,
    off: (what: string) => `${what}: off.`,
    failed: 'The setting couldn’t be saved. Please try again.',
  },
});

type Prefs = { monthly_recap: boolean; news: boolean };

export function EmailPreferences() {
  const t = useT(M);
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  useHashScroll('emails');

  useEffect(() => {
    let current = true;
    userAPI
      .getProfile()
      .then((res) => {
        if (!current) return;
        const d = res.data ?? {};
        // Accounts read before the setting existed: everything is on.
        setPrefs({ monthly_recap: d.email_monthly_recap !== false, news: d.email_news !== false });
      })
      .catch(() => current && setPrefs({ monthly_recap: true, news: true }));
    return () => {
      current = false;
    };
  }, []);

  const change = async (key: keyof Prefs, value: boolean, label: string) => {
    if (!prefs) return;
    const before = prefs;
    setPrefs({ ...prefs, [key]: value });
    try {
      const res = await userAPI.updateEmailPreferences({ [key]: value });
      setPrefs({ monthly_recap: res.data.email_monthly_recap, news: res.data.email_news });
      toast({ description: value ? t.on(label) : t.off(label) });
    } catch {
      setPrefs(before);
      toast({ description: t.failed, variant: 'destructive' });
    }
  };

  const rows: Array<{ key: keyof Prefs; label: string; help: string; Icon: typeof Megaphone }> = [
    { key: 'monthly_recap', label: t.recap, help: t.recapHelp, Icon: CalendarClock },
    { key: 'news', label: t.news, help: t.newsHelp, Icon: Megaphone },
  ];

  return (
    <section id="emails" aria-labelledby="emails-title" className="mb-6 scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 id="emails-title" className="mb-2 text-xl font-semibold text-gray-900">{t.title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t.intro}</p>
      <ul className="divide-y divide-border/70">
        {rows.map(({ key, label, help, Icon }) => (
          <li key={key} className="flex items-start gap-3 py-4 first:pt-1 last:pb-0">
            <span aria-hidden="true" className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800">
              <Icon className="h-5 w-5" />
            </span>
            <label htmlFor={`email-${key}`} className="min-w-0 flex-1 cursor-pointer">
              <span className="block font-semibold text-foreground">{label}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{help}</span>
            </label>
            <Switch
              id={`email-${key}`}
              className="mt-2"
              checked={prefs?.[key] ?? true}
              disabled={!prefs}
              onCheckedChange={(v) => change(key, v, label)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
