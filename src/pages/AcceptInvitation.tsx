import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invitationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token d\'invitation manquant');
      setLoading(false);
      return;
    }

    if (!user) {
      // Save token and redirect to login
      localStorage.setItem('pendingInvitation', token);
      navigate('/login');
      return;
    }

    acceptInvitation(token);
  }, [user, searchParams, navigate]);

  const acceptInvitation = async (token: string) => {
    try {
      const response = await invitationAPI.accept(token);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/budget/${response.data.budget_id}`);
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erreur lors de l\'acceptation de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation invalide</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation acceptée !</h1>
          <p className="text-gray-600 mb-6">Vous allez être redirigé vers le budget...</p>
        </div>
      </div>
    );
  }

  return null;
}