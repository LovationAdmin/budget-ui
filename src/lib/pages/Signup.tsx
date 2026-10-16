// src/lib/pages/Signup.tsx
// ============================================================================
// Signup — two steps on one page:
//   1. the form, whose password rules mirror the server (10 characters and
//      3 kinds of characters), shown as a live checklist;
//   2. « Vérifiez votre boîte mail »: the address used, a shortcut to the
//      mailbox, resend, and a way to fix a typo. No automatic redirect: the
//      confirmation link signs the user in (see VerifyEmail).
// ============================================================================

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, ExternalLink, Loader2, Mail, MailCheck, RotateCw, ShieldCheck } from 'lucide-react';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';
import { localizedPath } from '@/i18n/locales';

const M = defineMessages<{
  ruleOk: string; ruleNotYet: string; resent: string; resendFailed: string; oneMoreStep: string;
  sentTo: (email: ReactNode) => ReactNode; open: (mailbox: string) => string; nothing: ReactNode;
  resendIn: (s: number) => string; resend: string; wrongAddress: string; confirmed: string; signIn: string;
  failed: string; title: string; subtitle: string; firstName: string; namePlaceholder: string; email: string;
  emailPlaceholder: string; password: string; ruleLength: string; ruleKinds: string; forgot: string;
  creating: string; create: string; safe: string; hasAccount: string; legal: (terms: ReactNode, privacy: ReactNode) => ReactNode;
  terms: string; privacy: string;
}>({
  fr: {
    ruleOk: ' : respecté',
    ruleNotYet: ' : pas encore',
    resent: 'Nouvel e-mail envoyé.',
    resendFailed: 'Impossible de renvoyer l’e-mail pour le moment.',
    oneMoreStep: 'Plus qu’une étape',
    sentTo: (email) => <>Nous avons envoyé un lien de confirmation à {email}.
          Cliquez dessus : vous serez connecté et pourrez créer votre budget.</>,
    open: (mailbox) => `Ouvrir ${mailbox}`,
    nothing: <>Rien reçu au bout de quelques minutes ? Regardez dans les <strong>spams</strong> ou l’onglet <strong>Promotions</strong>.</>,
    resendIn: (s) => `Renvoyer l’e-mail (dans ${s} s)`,
    resend: 'Renvoyer l’e-mail',
    wrongAddress: 'Ce n’est pas la bonne adresse ? La modifier',
    confirmed: 'Déjà confirmé ?',
    signIn: 'Se connecter',
    failed: 'La création du compte a échoué.',
    title: 'Créez votre budget gratuit',
    subtitle: '1 minute. Gratuit, sans carte bancaire, sans connexion à votre banque.',
    firstName: 'Prénom',
    namePlaceholder: 'Ex. : Marie…',
    email: 'Adresse e-mail',
    emailPlaceholder: 'marie@exemple.fr',
    password: 'Mot de passe',
    ruleLength: 'Au moins 10 caractères',
    ruleKinds: '3 types parmi : minuscules, majuscules, chiffres, symboles',
    forgot: 'Mot de passe oublié ?',
    creating: 'Création…',
    create: 'Créer mon compte',
    safe: 'Vos données sont chiffrées et ne sont jamais revendues.',
    hasAccount: 'Déjà un compte ?',
    legal: (terms, privacy) => <>En créant un compte, vous acceptez nos{' '}{terms} et notre{' '}{privacy}.</>,
    terms: 'conditions d’utilisation',
    privacy: 'politique de confidentialité',
  },
  en: {
    ruleOk: ': done',
    ruleNotYet: ': not yet',
    resent: 'New email sent.',
    resendFailed: 'Couldn’t resend the email right now.',
    oneMoreStep: 'Just one more step',
    sentTo: (email) => <>We sent a confirmation link to {email}. Click it: you’ll be signed in and can create your budget.</>,
    open: (mailbox) => `Open ${mailbox}`,
    nothing: <>Nothing after a few minutes? Check your <strong>spam</strong> folder or the <strong>Promotions</strong> tab.</>,
    resendIn: (s) => `Resend the email (in ${s}s)`,
    resend: 'Resend the email',
    wrongAddress: 'Wrong address? Change it',
    confirmed: 'Already confirmed?',
    signIn: 'Sign in',
    failed: 'Account creation failed.',
    title: 'Create your free budget',
    subtitle: '1 minute. Free, no credit card, no bank connection.',
    firstName: 'First name',
    namePlaceholder: 'E.g. Alex…',
    email: 'Email address',
    emailPlaceholder: 'alex@example.com',
    password: 'Password',
    ruleLength: 'At least 10 characters',
    ruleKinds: '3 kinds among: lowercase, uppercase, digits, symbols',
    forgot: 'Forgot your password?',
    creating: 'Creating…',
    create: 'Create my account',
    safe: 'Your data is encrypted and never sold.',
    hasAccount: 'Already have an account?',
    legal: (terms, privacy) => <>By creating an account, you accept our{' '}{terms} and our{' '}{privacy}.</>,
    terms: 'terms of use',
    privacy: 'privacy policy',
  },
});

/** The same rules as the server (utils.ValidatePassword). */
export function passwordChecks(password: string) {
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  return { length: password.length >= 10, kinds: kinds >= 3, ok: password.length >= 10 && password.length <= 72 && kinds >= 3 };
}

const MAILBOXES: Array<{ match: RegExp; label: string; url: string }> = [
  { match: /^(gmail|googlemail)\./, label: 'Gmail', url: 'https://mail.google.com/mail/u/0/#search/budgetfamille' },
  { match: /^(outlook|hotmail|live|msn)\./, label: 'Outlook', url: 'https://outlook.live.com/mail/0/' },
  { match: /^(yahoo|ymail)\./, label: 'Yahoo Mail', url: 'https://mail.yahoo.com/' },
  { match: /^(icloud|me|mac)\.com$/, label: 'iCloud Mail', url: 'https://www.icloud.com/mail' },
  { match: /^orange\.fr$|^wanadoo\.fr$/, label: 'Orange Mail', url: 'https://messagerie.orange.fr/' },
  { match: /^free\.fr$/, label: 'Free Mail', url: 'https://webmail.free.fr/' },
  { match: /^(sfr|neuf)\.fr$/, label: 'SFR Mail', url: 'https://webmail.sfr.fr/' },
  { match: /^laposte\.net$/, label: 'La Poste Mail', url: 'https://www.laposte.net/accueil' },
];

function mailboxFor(email: string) {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return MAILBOXES.find((m) => m.match.test(domain));
}

const RESEND_COOLDOWN = 120; // seconds, like the server

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  const t = useT(M);
  return (
    <li className={cn('flex items-center gap-2 text-xs', ok ? 'text-success' : 'text-muted-foreground')}>
      <span aria-hidden="true" className={cn('inline-flex h-4 w-4 items-center justify-center rounded-full border', ok ? 'border-success bg-success text-white' : 'border-muted-foreground/40')}>
        {ok && <Check className="h-3 w-3" />}
      </span>
      {children}
      <span className="sr-only">{ok ? t.ruleOk : t.ruleNotYet}</span>
    </li>
  );
}

function CheckYourEmail({ email, onEdit }: { email: string; onEdit: () => void }) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const mailbox = mailboxFor(email);
  const t = useT(M);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    setStatus('sending');
    try {
      await authAPI.resendVerification(email);
      setStatus('sent');
      setMessage(t.resent);
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.error || t.resendFailed);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-display font-bold">{t.oneMoreStep}</h1>
        <p className="mt-3 text-muted-foreground">
          {t.sentTo(<strong className="text-foreground [overflow-wrap:anywhere]">{email}</strong>)}
        </p>
      </div>

      <div className="glass-card-elevated space-y-3 p-6 text-left">
        {mailbox && (
          <Button asChild variant="gradient" className="h-11 w-full">
            <a href={mailbox.url} target="_blank" rel="noopener noreferrer">
              <Mail className="mr-2 h-4 w-4" /> {t.open(mailbox.label)}
              <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
          </Button>
        )}
        <p className="text-sm text-muted-foreground">
          {t.nothing}
        </p>
        <Button type="button" variant="outline" className="h-11 w-full" onClick={resend} disabled={cooldown > 0 || status === 'sending'}>
          {status === 'sending' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
          {cooldown > 0 ? t.resendIn(cooldown) : t.resend}
        </Button>
        <p role="status" aria-live="polite" className={cn('min-h-[1.25rem] text-sm', status === 'error' ? 'text-destructive' : 'text-success')}>
          {message}
        </p>
        <button type="button" onClick={onEdit} className="text-sm font-medium text-primary hover:underline">
          {t.wrongAddress}
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        {t.confirmed}{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">{t.signIn}</Link>
      </p>
    </div>
  );
}

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const { signup } = useAuth();
  const t = useT(M);
  const locale = useLocale();

  const checks = passwordChecks(password);
  const canSubmit = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && checks.ok && !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const result = await signup(name.trim(), email.trim(), password);
    setLoading(false);
    if (result.success) {
      track('sign_up', { method: 'email' });
      setSentTo(email.trim());
    }
    else setError({ message: result.error || t.failed, code: result.code });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {sentTo ? (
          <CheckYourEmail email={sentTo} onEdit={() => { setSentTo(''); setPassword(''); }} />
        ) : (
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <BudgetLogo size={64} className="mx-auto mb-4 block" />
              <h1 className="text-3xl font-display font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground mt-2">{t.subtitle}</p>
            </div>

            <div className="glass-card-elevated p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">{t.firstName}</Label>
                  <Input id="name" name="given-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} required autoComplete="given-name" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input id="email" name="email" type="email" inputMode="email" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} required autoComplete="email" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <PasswordInput id="password" name="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className="h-11" aria-describedby="password-rules" />
                  <ul id="password-rules" className="space-y-1 pt-1">
                    <Rule ok={checks.length}>{t.ruleLength}</Rule>
                    <Rule ok={checks.kinds}>{t.ruleKinds}</Rule>
                  </ul>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error.message}
                      {error.code === 'email_taken' && (
                        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <Link to="/login" className="font-semibold underline">{t.signIn}</Link>
                          <Link to="/forgot-password" className="font-semibold underline">{t.forgot}</Link>
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" variant="gradient" className="w-full h-11" disabled={!canSubmit}>
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.creating}</>) : t.create}
                </Button>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  {t.safe}
                </p>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {t.hasAccount}{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">{t.signIn}</Link>
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground px-4">
              {t.legal(
                <Link to={localizedPath('/terms', locale)} className="underline">{t.terms}</Link>,
                <Link to={localizedPath('/privacy', locale)} className="underline">{t.privacy}</Link>,
              )}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
