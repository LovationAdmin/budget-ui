import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api'; // Import API directly for resend
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertCircle, Loader2, Mail } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States for Resend Verification
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      const errorMessage = result.error || 'Erreur de connexion';
      setError(errorMessage);

      // Check if the error is about email verification
      // (Backend returns "Email non vérifié..." on 403)
      if (errorMessage.toLowerCase().includes("vérifié") || errorMessage.toLowerCase().includes("verified")) {
        setShowResend(true);
      }
    }
    
    setLoading(false);
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
        await authAPI.resendVerification(email);
        toast({ 
            title: "Email envoyé !", 
            description: "Vérifiez votre boîte de réception (et vos spams).", 
            variant: "success" 
        });
        setShowResend(false);
        setError(""); // Clear error to clean up UI
    } catch (err: any) {
        const msg = err.response?.data?.error || "Impossible de renvoyer l'email.";
        toast({ 
            title: "Erreur", 
            description: msg, 
            variant: "destructive" 
        });
    } finally {
        setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center gradient-surface px-4 py-12">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(35_90%_65%)] mb-4 shadow-glow">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Budget Famille
            </h1>
            <p className="text-muted-foreground">
              Connectez-vous à votre compte
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-card-elevated p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              
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
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>

              {/* Error Alert with Resend Button */}
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <AlertDescription className="flex flex-col gap-3">
                      <span>{error}</span>
                      
                      {showResend && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            className="bg-white/50 hover:bg-white text-destructive-foreground border-destructive/20 w-full sm:w-auto self-start gap-2"
                            onClick={handleResendEmail}
                            disabled={resendLoading}
                          >
                              {resendLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                  <Mail className="h-3 w-3" />
                              )}
                              {resendLoading ? "Envoi..." : "Renvoyer l'email de validation"}
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
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
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