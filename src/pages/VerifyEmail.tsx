// src/pages/VerifyEmail.tsx
// ✅ VERSION CORRIGÉE avec gestion token expiré + option renvoi

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { authAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('Vérification en cours...');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Lien invalide. Aucun token de vérification fourni.');
      return;
    }

    // ✅ FIX: Route correcte avec /verify-email
    api.get(`/auth/verify-email?token=${token}`)
      .then((response) => {
        setStatus('success');
        setMessage(response.data.message || 'Email vérifié avec succès !');
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.error || 'Erreur lors de la vérification.';
        
        // ✅ Détection token expiré
        if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('expiré')) {
          setStatus('expired');
          setMessage('Ce lien de vérification a expiré.');
        } else if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('invalide')) {
          setStatus('error');
          setMessage('Lien de vérification invalide ou déjà utilisé.');
        } else {
          setStatus('error');
          setMessage(errorMsg);
        }
      });
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!userEmail || resending) return;
    
    setResending(true);
    try {
      await authAPI.resendVerification(userEmail);
      toast({
        title: "Email renvoyé !",
        description: "Vérifiez votre boîte de réception (et vos spams).",
        variant: "success"
      });
      setStatus('loading');
      setMessage('Un nouvel email de vérification a été envoyé. Vérification en cours...');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de renvoyer l'email.",
        variant: "destructive"
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        
        {/* LOADING STATE */}
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Vérification en cours...</h2>
            <p className="text-gray-600">Veuillez patienter quelques instants.</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Vérifié !</h2>
            <p className="text-gray-600 mb-6">
              {message}
              <br />
              Votre compte est maintenant activé. Vous pouvez vous connecter.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Se connecter
            </Button>
          </>
        )}

        {/* ERROR STATE (Generic) */}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Échec de la vérification</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="w-full"
              >
                Retour à la connexion
              </Button>
              <p className="text-sm text-gray-500">
                Besoin d'aide ? <a href="/help" className="text-primary hover:underline">Contactez le support</a>
              </p>
            </div>
          </>
        )}

        {/* EXPIRED STATE (avec option renvoi) */}
        {status === 'expired' && (
          <>
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lien Expiré</h2>
            <p className="text-gray-600 mb-6">
              Ce lien de vérification a expiré. Les liens de vérification sont valables 48 heures.
            </p>

            <Alert className="mb-6 text-left">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Vous pouvez demander un nouveau lien</p>
                <div className="space-y-3 mt-3">
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={userEmail || ''}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleResendEmail}
                    disabled={!userEmail || resending}
                    className="w-full"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Renvoyer le lien de vérification
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => navigate('/login')} 
              variant="outline" 
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </>
        )}
      </div>
    </div>
  );
}