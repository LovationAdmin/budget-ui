// src/lib/pages/Login.tsx
// ============================================================================
// 🎯 Login — Updated with show/hide password and "Remember me" indicator
// ============================================================================
// Fixes P1 #9.
// ============================================================================

import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { authAPI } from '../../services/api';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    failed: 'La connexion a échoué.',
    sentTitle: 'E-mail envoyé',
    sentText: 'Cliquez sur le lien reçu pour confirmer votre adresse (pensez aux spams).',
    error: 'Erreur',
    resendFailed: 'Impossible de renvoyer.',
    title: 'Content de vous revoir',
    subtitle: 'Connectez-vous pour retrouver vos budgets',
    email: 'Adresse e-mail',
    emailPlaceholder: 'marie@exemple.fr',
    password: 'Mot de passe',
    forgot: 'Mot de passe oublié ?',
    sending: 'Envoi…',
    resend: "Renvoyer l'email de validation",
    signingIn: 'Connexion…',
    signIn: 'Se connecter',
    session: 'Session sécurisée pendant 30 jours sur cet appareil',
    noAccount: 'Pas encore de compte ?',
    createAccount: 'Créer un compte',
  },
  en: {
    failed: 'Sign-in failed.',
    sentTitle: 'Email sent',
    sentText: 'Click the link we sent you to confirm your address (check your spam folder).',
    error: 'Error',
    resendFailed: 'Couldn’t resend the email.',
    title: 'Welcome back',
    subtitle: 'Sign in to get back to your budgets',
    email: 'Email address',
    emailPlaceholder: 'alex@example.com',
    password: 'Password',
    forgot: 'Forgot your password?',
    sending: 'Sending…',
    resend: 'Resend the confirmation email',
    signingIn: 'Signing in…',
    signIn: 'Sign in',
    session: 'Stay signed in for 30 days on this device',
    noAccount: 'No account yet?',
    createAccount: 'Create an account',
  },
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const t = useT(M);

  const fromLoc = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  const from = fromLoc?.pathname ? `${fromLoc.pathname}${fromLoc.search ?? ''}${fromLoc.hash ?? ''}` : '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      const errMsg = result.error || t.failed;
      setError(errMsg);
      if (result.code === 'email_not_verified') setShowResend(true);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await authAPI.resendVerification?.(email);
      toast({
        title: t.sentTitle,
        description: t.sentText,
      });
    } catch (err: any) {
      toast({
        title: t.error,
        description: err?.response?.data?.error || t.resendFailed,
        variant: 'destructive',
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <BudgetLogo size={64} className="mx-auto mb-4 block" />
            <h1 className="text-3xl font-display font-bold text-gray-900">
              {t.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t.subtitle}
            </p>
          </div>

          <div className="glass-card-elevated p-6 sm:p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  inputMode="email"
                  spellCheck={false}
                  required
                  autoComplete="email"
                  className="h-11"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.password}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    {t.forgot}
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="animate-fade-in border-destructive/50 bg-destructive/10 text-destructive"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 text-destructive" />
                  <AlertDescription className="flex flex-col gap-3">
                    <span>{error}</span>
                    {showResend && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="bg-background border-destructive/30 text-destructive hover:bg-destructive/10 w-full sm:w-auto self-start gap-2 shadow-sm"
                        onClick={handleResendEmail}
                        disabled={resendLoading}
                      >
                        {resendLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Mail className="h-3 w-3" />
                        )}
                        {resendLoading ? t.sending : t.resend}
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.signingIn}
                  </>
                ) : (
                  t.signIn
                )}
              </Button>

              {/* P1 #9: small reassurance about session length */}
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                {t.session}
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t.noAccount}{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  {t.createAccount}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
