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
import { Wallet, AlertCircle, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { authAPI } from '../../services/api';

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

  const from = (location.state as any)?.from?.pathname || '/dashboard';

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
      const errMsg = result.error || 'Erreur de connexion';
      setError(errMsg);
      // Heuristic: show resend button if message hints at unverified email
      if (
        errMsg.toLowerCase().includes('vérifi') ||
        errMsg.toLowerCase().includes('verif') ||
        errMsg.toLowerCase().includes('email')
      ) {
        setShowResend(true);
      }
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await authAPI.resendVerification?.(email);
      toast({
        title: 'Email envoyé',
        description: 'Vérifie ta boîte de réception.',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err?.response?.data?.error || 'Impossible de renvoyer.',
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
            <div className="inline-flex h-16 w-16 items-center justify-center bg-primary/10 rounded-2xl mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Bon retour !
            </h1>
            <p className="text-muted-foreground mt-2">
              Connecte-toi pour accéder à tes budgets
            </p>
          </div>

          <div className="glass-card-elevated p-6 sm:p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                  className="h-11"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Oublié ?
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
                        {resendLoading ? 'Envoi…' : "Renvoyer l'email de validation"}
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
                    Connexion…
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* P1 #9: small reassurance about session length */}
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                Session sécurisée pendant 30 jours sur cet appareil
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Créer un compte
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
