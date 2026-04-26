import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Page de callback Enable Banking
 * 
 * Cette page est appelée après que l'utilisateur a autorisé l'accès à sa banque
 * dans l'interface Enable Banking. Elle récupère le code d'autorisation et le
 * state, puis les envoie à la fenêtre parent (popup) via postMessage.
 * 
 * URL: /beta2/callback?code=xxx&state=yyy
 */
export function EnableBankingCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Traitement de votre autorisation...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('🎯 Callback page loaded');
    console.log('   Code:', code ? `${code.substring(0, 10)}...` : 'missing');
    console.log('   State:', state ? `${state.substring(0, 10)}...` : 'missing');
    console.log('   Error:', errorParam || 'none');

    // Vérifier si on est dans une popup ou une fenêtre normale
    const isPopup = window.opener && !window.opener.closed;

    if (errorParam) {
      // Erreur d'autorisation
      const errorMsg = errorDescription || errorParam || 'Autorisation refusée';
      console.error('❌ Authorization error:', errorMsg);
      
      setStatus('error');
      setError(errorMsg);
      setMessage('Erreur d\'autorisation');

      if (isPopup) {
        // Envoyer l'erreur au parent
        window.opener.postMessage({
          type: 'ENABLE_BANKING_ERROR',
          error: errorMsg
        }, window.location.origin);

        // Fermer après 2 secondes
        setTimeout(() => {
          window.close();
        }, 2000);
      }
      return;
    }

    if (!code || !state) {
      console.error('❌ Missing code or state parameter');
      setStatus('error');
      setError('Paramètres manquants dans l\'URL de callback');
      setMessage('Erreur de configuration');
      return;
    }

    // Succès - Envoyer les données au parent
    console.log('✅ Authorization successful, sending to parent window');

    if (isPopup) {
      try {
        // Envoyer le code et le state à la fenêtre parent
        window.opener.postMessage({
          type: 'ENABLE_BANKING_CALLBACK',
          code,
          state
        }, window.location.origin);

        console.log('✅ Message sent to parent window');
        
        setStatus('success');
        setMessage('Autorisation réussie ! Fermeture en cours...');

        // Fermer la popup après 1.5 secondes
        setTimeout(() => {
          console.log('🔒 Closing popup window');
          window.close();
        }, 1500);

      } catch (err) {
        console.error('❌ Failed to send message to parent:', err);
        setStatus('error');
        setError('Impossible de communiquer avec la fenêtre parent');
        setMessage('Erreur de communication');
      }
    } else {
      // Pas dans une popup - peut-être un accès direct
      console.warn('⚠️  Not in a popup window');
      setStatus('error');
      setError('Cette page doit être ouverte depuis l\'application');
      setMessage('Accès incorrect');
      
      // Rediriger vers le dashboard après 3 secondes
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }

  }, [searchParams, navigate]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icône de statut */}
            {status === 'processing' && (
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in duration-300">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}

            {/* Message principal */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {message}
              </h1>
              
              {status === 'processing' && (
                <p className="text-sm text-gray-600">
                  Veuillez patienter pendant que nous finalisons la connexion...
                </p>
              )}
              
              {status === 'success' && (
                <p className="text-sm text-green-700">
                  Votre banque a été connectée avec succès !
                </p>
              )}
              
              {status === 'error' && error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-900">
                        Erreur
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton d'action (seulement en cas d'erreur hors popup) */}
            {status === 'error' && !window.opener && (
              <Button
                onClick={() => navigate('/')}
                className="mt-4"
              >
                Retour au tableau de bord
              </Button>
            )}

            {/* Indicateur de fermeture automatique */}
            {status === 'success' && (
              <p className="text-xs text-gray-500 mt-4">
                Cette fenêtre se fermera automatiquement...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnableBankingCallbackPage;