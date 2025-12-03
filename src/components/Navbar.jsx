import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition"
            >
              💰 Budget Famille
            </button>
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Bonjour, <strong>{user.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
