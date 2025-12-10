import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertCircle, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPendingInvite, setHasPendingInvite] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('pendingInvitation')) {
        setHasPendingInvite(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    const result = await signup(name, email, password);

    if (result.success) {
      // 1. Privacy Toast
      toast({
        title: "Compte créé avec succès ! 🛡️",
        description: "Vos données sont chiffrées et sécurisées.",
        duration: 8000,
        className: "bg-green-50 border-green-200"
      });

      // 2. Logic: If invited -> Go accept (skip verify UI). Else -> Verify Email UI.
      const pendingToken = localStorage.getItem('pendingInvitation');
      
      if (pendingToken) {
        // Automatically redirect invited users to the acceptance logic
        // The backend AcceptInvitation function handles auto-verifying the email
        navigate('/invitation/accept'); 
      } else {
        // Standard user: Must check email
        setSuccessMode(true);
      }
    } else {
      setError(result.error || 'Erreur inconnue lors de la création du compte');
    }
    
    setLoading(false);
  };

  if (successMode) {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center gradient-surface px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center animate-scale-in">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez vos emails</h2>
                    <p className="text-gray-600 mb-6">
                        Un lien de confirmation a été envoyé à <strong>{email}</strong>.<br/>
                        Veuillez cliquer dessus pour activer votre compte.
                    </p>
                    <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                        Retour à la connexion
                    </Button>
                </div>
            </div>
            <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center gradient-surface px-4 py-12">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(35_90%_65%)] mb-4 shadow-glow">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Budget Famille
            </h1>
            <p className="text-muted-foreground">
              Créez votre compte gratuit et sécurisé
            </p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-green-700 bg-green-50 py-2 px-4 rounded-full border border-green-100 w-fit mx-auto animate-fade-in">
            <ShieldCheck className="h-3 w-3" />
            <span>Données chiffrées & Privées (Zero-Knowledge)</span>
          </div>

          {hasPendingInvite && (
              <Alert className="mb-6 border-primary/50 bg-primary/10 animate-fade-in">
                  <Mail className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary font-medium">
                      Vous avez une invitation en attente !
                  </AlertDescription>
              </Alert>
          )}

          <div className="glass-card-elevated p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe" 
                  required 
                  className="h-11" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="votre@email.com" 
                  required 
                  className="h-11" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  minLength={8} 
                  required 
                  className="h-11" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="h-11" 
                />
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Se connecter
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