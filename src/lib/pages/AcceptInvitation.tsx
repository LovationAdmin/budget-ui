import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invitationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button'; // Optional, for the error view
import { LOCALES } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    missing: 'Token d\'invitation manquant',
    failed: 'Erreur lors de l\'acceptation de l\'invitation',
    processing: 'Traitement de l\'invitation...',
    invalid: 'Invitation invalide',
    home: 'Aller à l\'accueil',
    switchAccount: 'Changer de compte',
    accepted: 'Invitation acceptée !',
    redirecting: 'Vous allez être redirigé vers le budget...',
  },
  en: {
    missing: 'The invitation link is missing its code',
    failed: 'The invitation couldn’t be accepted',
    processing: 'Opening the invitation...',
    invalid: 'Invalid invitation',
    home: 'Go to the home page',
    switchAccount: 'Use another account',
    accepted: 'Invitation accepted!',
    redirecting: 'Taking you to the budget...',
  },
});

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useT(M);
  const locale = useLocale();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Get token from URL
    const token = searchParams.get('token');
    
    // 2. If no token in URL, check if we saved one in localStorage previously
    // This handles the case where we just came back from Signup
    const savedToken = localStorage.getItem('pendingInvitation');
    const effectiveToken = token || savedToken;

    if (!effectiveToken) {
      setError(t.missing);
      setLoading(false);
      return;
    }

    // 3. If user is NOT logged in, save token and send to SIGNUP
    if (!user) {
      localStorage.setItem('pendingInvitation', effectiveToken);
      // Redirect to Signup (instead of Login)
      navigate('/signup');
      return;
    }

    // 4. User is logged in, proceed to accept
    acceptInvitation(effectiveToken);
  }, [user, searchParams, navigate]);

  const acceptInvitation = async (token: string) => {
    try {
      const response = await invitationAPI.accept(token);
      
      // Clean up local storage
      localStorage.removeItem('pendingInvitation');
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/budget/${response.data.budget_id}/complete`);
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t.failed;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.processing}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.invalid}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate(LOCALES[locale].home)} variant="default">
                {t.home}
            </Button>
            {/* Useful if the user logged into the WRONG account */}
            <Button onClick={() => navigate('/login')} variant="outline">
                {t.switchAccount}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.accepted}</h1>
          <p className="text-gray-600 mb-6">{t.redirecting}</p>
        </div>
      </div>
    );
  }

  return null;
}