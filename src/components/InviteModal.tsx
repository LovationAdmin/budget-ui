import { useState, FormEvent, ChangeEvent } from 'react';
import { invitationAPI } from '../services/api';

interface InviteModalProps {
    budgetId: string;
    onClose: () => void;
    onInvited?: () => void;
}

export default function InviteModal({ budgetId, onClose, onInvited }: InviteModalProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await invitationAPI.invite(budgetId, email);
      setSuccess(true);
      setTimeout(() => {
        onInvited?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erreur lors de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Inviter un utilisateur</h2>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            ✅ Invitation envoyée avec succès !
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="input-field"
                placeholder="user@example.com"
                required
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
