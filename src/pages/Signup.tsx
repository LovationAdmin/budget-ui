import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertCircle, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer'; // Import Footer

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPendingInvite, setHasPendingInvite] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast(); // Use toast hook

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
      // 1. PRIVACY GUARANTEE TOAST
      toast({
        title: "Compte créé avec succès ! 🛡️",
        description: "Vos données financières sont chiffrées. Personne, pas même les administrateurs Lovation, ne peut les consulter sans votre accord.",
        duration: 8000,
        className: "bg-green-50 border-green-200"
      });

      const pendingToken = localStorage.getItem('pendingInvitation');
      if (pendingToken) {
        navigate('/invitation/accept'); 
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Erreur inconnue lors de la création du compte');
    }
    
    setLoading(false);
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
              Budget Famille
            </h1>
            <p className="text-muted-foreground">
              Créez votre compte gratuit et sécurisé
            </p>
          </div>

          {/* Privacy Badge */}
          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-green-700 bg-green-50 py-2 px-4 rounded-full border border-green-100 w-fit mx-auto">
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
              {/* Form inputs same as before... */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="h-11" />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</> : 'Créer mon compte'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Integration */}
      <Footer />
    </div>
  );
}