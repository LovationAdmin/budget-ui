import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { Footer } from '@/components/Footer';
import { extractRateLimitError } from '@/lib/rateLimitError';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    genericError: 'Une erreur est survenue',
    title: 'Mot de passe oublié',
    subtitle: 'Entrez votre email pour réinitialiser votre mot de passe',
    sent: 'Email envoyé !',
    sentText: 'Si un compte existe avec cette adresse, vous recevrez un email contenant un lien de réinitialisation valable pendant 1 heure.',
    spam: 'Pensez à vérifier vos spams si vous ne le trouvez pas.',
    again: 'Renvoyer un email',
    back: 'Retour à la connexion',
    email: 'Adresse email',
    placeholder: 'votre@email.com',
    hint: 'Nous vous enverrons un lien de réinitialisation',
    sending: 'Envoi en cours...',
    send: 'Envoyer le lien de réinitialisation',
    noAccount: 'Pas encore de compte ?',
    create: 'Créer un compte',
  },
  en: {
    genericError: 'Something went wrong',
    title: 'Forgot your password?',
    subtitle: 'Enter your email to reset your password',
    sent: 'Email sent!',
    sentText: 'If an account exists with this address, you’ll get an email with a reset link valid for 1 hour.',
    spam: 'Check your spam folder if you can’t find it.',
    again: 'Send another email',
    back: 'Back to sign in',
    email: 'Email address',
    placeholder: 'you@example.com',
    hint: 'We’ll send you a reset link',
    sending: 'Sending...',
    send: 'Send the reset link',
    noAccount: 'No account yet?',
    create: 'Create an account',
  },
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const t = useT(M);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
      setEmail(''); // Clear email field on success
    } catch (err: any) {
      // Si rate-limited (429), message FR clair avec compte à rebours
      const rateLimitMsg = extractRateLimitError(err);
      const errorMessage =
        rateLimitMsg ??
        err.response?.data?.error ??
        t.genericError;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center gradient-surface px-4 py-12">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8 animate-slide-up">
            <BudgetLogo size={64} className="mx-auto mb-4 block" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="glass-card-elevated p-8 animate-scale-in">
            {success ? (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 ml-2">
                    <p className="font-medium mb-2">{t.sent}</p>
                    <p className="text-sm">
                      {t.sentText}
                    </p>
                    <p className="text-sm mt-2 text-muted-foreground">
                      {t.spam}
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() => setSuccess(false)}
                  >
                    {t.again}
                  </Button>
                  
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t.back}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder={t.placeholder}
                    required
                    autoComplete="email"
                    className="h-11"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t.hint}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
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
                      {t.sending}
                    </>
                  ) : (
                    t.send
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    {t.back}
                  </Link>
                </div>
              </form>
            )}
          </div>

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t.noAccount}{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  {t.create}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
