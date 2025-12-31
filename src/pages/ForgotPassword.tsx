import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      const errorMessage = err.response?.data?.error || 'Une erreur est survenue';
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
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(35_90%_65%)] mb-4 shadow-glow">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-muted-foreground">
              Entrez votre email pour réinitialiser votre mot de passe
            </p>
          </div>

          <div className="glass-card-elevated p-8 animate-scale-in">
            {success ? (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 ml-2">
                    <p className="font-medium mb-2">Email envoyé !</p>
                    <p className="text-sm">
                      Si un compte existe avec cette adresse, vous recevrez un email contenant 
                      un lien de réinitialisation valable pendant 1 heure.
                    </p>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Pensez à vérifier vos spams si vous ne le trouvez pas.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() => setSuccess(false)}
                  >
                    Renvoyer un email
                  </Button>
                  
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    className="h-11"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Nous vous enverrons un lien de réinitialisation
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
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </div>

          {!success && (
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
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}