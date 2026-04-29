// src/lib/pages/Signup.tsx
// ============================================================================
// 🎯 Signup — Updated, removes confirmPassword, uses PasswordInput
// ============================================================================
// Fixes P1 #9. The "type your password twice" pattern is dated. The show/hide
// toggle is the modern equivalent and reduces drop-off.
// ============================================================================

import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, AlertCircle, Loader2, ShieldCheck, Check } from 'lucide-react';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/Navbar';

// ============================================================================
// Password strength helper (kept inline; lightweight)
// ============================================================================
function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(4, score);

  const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
  const colors = [
    'bg-destructive',
    'bg-destructive/70',
    'bg-warning',
    'bg-success/80',
    'bg-success',
  ];
  return { score, label: labels[score], color: colors[score] };
}

// ============================================================================
// Component
// ============================================================================

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);
  const passwordTooShort = password.length > 0 && password.length < 8;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordTooShort) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error || 'Erreur lors de la création du compte.');
    }
  };

  // ============================================================================
  // Success state
  // ============================================================================
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center space-y-6 animate-scale-in">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-display font-bold">Compte créé !</h1>
            <p className="text-muted-foreground">
              Un email de validation t'a été envoyé. Vérifie ta boîte de
              réception (et tes spams).
            </p>
            <p className="text-xs text-muted-foreground">
              Redirection vers la connexion…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
              Crée ton compte
            </h1>
            <p className="text-muted-foreground mt-2">
              Gratuit. Pas de carte bancaire requise.
            </p>
          </div>

          <div className="glass-card-elevated p-6 sm:p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Prénom</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="Marie"
                  required
                  autoComplete="given-name"
                  className="h-11"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  placeholder="marie@email.com"
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Au moins 8 caractères"
                  required
                  autoComplete="new-password"
                  className="h-11"
                  minLength={8}
                />

                {/* Password strength meter */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < strength.score ? strength.color : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{strength.label}</span>
                      {passwordTooShort && (
                        <span className="text-destructive">
                          Min. 8 caractères
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11"
                disabled={loading || passwordTooShort}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                Tes données sont chiffrées de bout en bout
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground px-4">
            En créant un compte, tu acceptes nos{' '}
            <Link to="/terms" className="underline">
              conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link to="/privacy" className="underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
