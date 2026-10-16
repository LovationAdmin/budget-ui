// src/pages/VerifyEmail.tsx
// ✅ VERSION CORRIGÉE avec gestion token expiré + option renvoi

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { authAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';
import { localizedPath } from '@/i18n/locales';

const M = defineMessages({
  fr: {
    checking: 'Vérification en cours...',
    noToken: 'Lien invalide. Aucun token de vérification fourni.',
    confirmed: 'Adresse e-mail confirmée.',
    failedCheck: 'Erreur lors de la vérification.',
    expired: 'Ce lien de vérification a expiré.',
    invalid: 'Lien de vérification invalide ou déjà utilisé.',
    resentTitle: 'Email renvoyé !',
    resentText: 'Vérifiez votre boîte de réception (et vos spams).',
    resentChecking: 'Un nouvel email de vérification a été envoyé. Vérification en cours...',
    error: 'Erreur',
    resendFailed: "Impossible de renvoyer l'email.",
    wait: 'Veuillez patienter quelques instants.',
    doneTitle: 'Adresse confirmée !',
    welcome: 'Bienvenue sur Budget Famille. On vous emmène créer votre premier budget…',
    activated: 'Votre compte est activé. Connectez-vous pour commencer.',
    continue: 'Continuer',
    signIn: 'Se connecter',
    failedTitle: 'Échec de la vérification',
    back: 'Retour à la connexion',
    help: "Besoin d'aide ?",
    support: 'Contactez le support',
    expiredTitle: 'Lien Expiré',
    expiredText: 'Ce lien de vérification a expiré. Les liens de vérification sont valables 48 heures.',
    askNew: 'Vous pouvez demander un nouveau lien',
    yourEmail: 'Votre email',
    sending: 'Envoi en cours...',
    resend: 'Renvoyer le lien de vérification',
  },
  en: {
    checking: 'Checking...',
    noToken: 'Invalid link. No confirmation code was provided.',
    confirmed: 'Email address confirmed.',
    failedCheck: 'Something went wrong while checking.',
    expired: 'This confirmation link has expired.',
    invalid: 'This confirmation link is invalid or was already used.',
    resentTitle: 'Email sent again!',
    resentText: 'Check your inbox (and your spam folder).',
    resentChecking: 'A new confirmation email has been sent. Checking...',
    error: 'Error',
    resendFailed: 'Couldn’t resend the email.',
    wait: 'Please wait a moment.',
    doneTitle: 'Address confirmed!',
    welcome: 'Welcome to Budget Famille. Let’s create your first budget…',
    activated: 'Your account is active. Sign in to get started.',
    continue: 'Continue',
    signIn: 'Sign in',
    failedTitle: 'Confirmation failed',
    back: 'Back to sign in',
    help: 'Need help?',
    support: 'Contact support',
    expiredTitle: 'Link expired',
    expiredText: 'This confirmation link has expired. Confirmation links are valid for 48 hours.',
    askNew: 'You can ask for a new link',
    yourEmail: 'Your email',
    sending: 'Sending...',
    resend: 'Resend the confirmation link',
  },
});

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = useT(M);
  const locale = useLocale();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState(t.checking);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const { startSession } = useAuth();
  // The token is single-use: never send it twice (StrictMode, re-renders).
  const verifiedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage(t.noToken);
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((response) => {
        setStatus('success');
        setMessage(response.data.message || t.confirmed);
        // The API opens the session on first verification: go straight to
        // creating the first budget.
        const { token: accessToken, user, refresh_token } = response.data ?? {};
        if (accessToken && user) {
          startSession(accessToken, user, refresh_token);
          setSignedIn(true);
          setTimeout(() => navigate('/dashboard?bienvenue=1', { replace: true }), 1500);
        }
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.error || t.failedCheck;
        
        // ✅ Détection token expiré
        if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('expiré')) {
          setStatus('expired');
          setMessage(t.expired);
        } else if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('invalide')) {
          setStatus('error');
          setMessage(t.invalid);
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
        title: t.resentTitle,
        description: t.resentText,
        variant: "success"
      });
      setStatus('loading');
      setMessage(t.resentChecking);
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.response?.data?.error || t.resendFailed,
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.checking}</h2>
            <p className="text-gray-600">{t.wait}</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t.doneTitle}</h1>
            <p className="text-muted-foreground mb-6">
              {signedIn
                ? t.welcome
                : t.activated}
            </p>
            {signedIn ? (
              <Button onClick={() => navigate('/dashboard?bienvenue=1', { replace: true })} className="w-full">
                {t.continue}
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')} className="w-full">
                {t.signIn}
              </Button>
            )}
          </>
        )}

        {/* ERROR STATE (Generic) */}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.failedTitle}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="w-full"
              >
                {t.back}
              </Button>
              <p className="text-sm text-gray-500">
                {t.help} <a href={localizedPath('/help', locale)} className="text-primary hover:underline">{t.support}</a>
              </p>
            </div>
          </>
        )}

        {/* EXPIRED STATE (avec option renvoi) */}
        {status === 'expired' && (
          <>
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.expiredTitle}</h2>
            <p className="text-gray-600 mb-6">
              {t.expiredText}
            </p>

            <Alert className="mb-6 text-left">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">{t.askNew}</p>
                <div className="space-y-3 mt-3">
                  <input
                    type="email"
                    placeholder={t.yourEmail}
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
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {t.resend}
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
              {t.back}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}