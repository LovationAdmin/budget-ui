import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { Footer } from '@/components/Footer';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { validatePassword } from '@/utils/passwordStrength';
import { extractRateLimitError } from '@/lib/rateLimitError';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    missingToken: 'Token manquant ou invalide',
    invalid: 'Mot de passe invalide',
    mismatch: 'Les mots de passe ne correspondent pas',
    genericError: 'Une erreur est survenue',
    title: 'Nouveau mot de passe',
    subtitle: 'Choisissez un nouveau mot de passe sécurisé',
    done: 'Mot de passe réinitialisé !',
    doneText: 'Votre mot de passe a été changé avec succès. Vous allez être redirigé vers la page de connexion...',
    signInNow: 'Se connecter maintenant',
    newPassword: 'Nouveau mot de passe',
    confirm: 'Confirmer le mot de passe',
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    resetting: 'Réinitialisation...',
    reset: 'Réinitialiser le mot de passe',
    back: 'Retour à la connexion',
  },
  en: {
    missingToken: 'Missing or invalid link',
    invalid: 'Invalid password',
    mismatch: 'The passwords don’t match',
    genericError: 'Something went wrong',
    title: 'New password',
    subtitle: 'Choose a new, secure password',
    done: 'Password reset!',
    doneText: 'Your password has been changed. Taking you to the sign-in page...',
    signInNow: 'Sign in now',
    newPassword: 'New password',
    confirm: 'Confirm the password',
    show: 'Show the password',
    hide: 'Hide the password',
    resetting: 'Resetting...',
    reset: 'Reset the password',
    back: 'Back to sign in',
  },
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useT(M);
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError(t.missingToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation unifiée (même logique que le backend)
    // On ne dispose pas de l'email/nom ici (route publique avec token), donc
    // on appelle sans contexte — le backend re-vérifiera avec email+nom.
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.errors[0] ?? t.invalid);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.mismatch);
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <div className="space-y-6 text-center">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                  <AlertDescription className="text-green-800 mt-3">
                    <p className="font-medium mb-2">{t.done}</p>
                    <p className="text-sm">
                      {t.doneText}
                    </p>
                  </AlertDescription>
                </Alert>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  {t.signInNow}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={10}
                      className="h-11 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t.hide : t.show}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={newPassword} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirm}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={10}
                      className="h-11 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? t.hide : t.show}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                  disabled={loading || !token}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.resetting}
                    </>
                  ) : (
                    t.reset
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t.back}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
