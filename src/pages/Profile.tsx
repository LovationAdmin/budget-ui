import { useState, FormEvent, ChangeEvent } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BudgetNavbar } from '../components/budget/BudgetNavbar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AvatarPicker } from '../components/ui/avatar-picker';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await userAPI.updateProfile({ name, avatar });
      
      if (user) {
        // Update local storage so the navbar and other components update immediately
        const updatedUser = { ...user, name, avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Simple reload to propagate changes to context (or you could expose a setUser in AuthContext)
        window.location.reload();
      }
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées.", variant: "success" });
    } catch (err: any) {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.error || 'Erreur lors de la mise à jour', 
        variant: "destructive" 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);

    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: 'Les mots de passe ne correspondent pas', variant: "destructive" });
      setChangingPassword(false);
      return;
    }

    try {
      await userAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      toast({ title: "Succès", description: 'Mot de passe changé avec succès', variant: "success" });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.error || 'Erreur lors du changement de mot de passe', 
        variant: "destructive" 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BudgetNavbar items={[]} userName={user?.name} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
            variant="ghost" 
            className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-primary"
            onClick={() => navigate('/')}
        >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations</h2>
          
          <form onSubmit={handleUpdateProfile}>
            {/* AVATAR PICKER */}
            <div className="flex flex-col items-center mb-8">
                <AvatarPicker 
                    name={name} 
                    currentAvatar={avatar} 
                    onSelect={(newAvatar) => setAvatar(newAvatar)} 
                />
                <p className="text-sm text-muted-foreground mt-3">Cliquez sur l'avatar pour le modifier</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="flex h-10 w-full rounded-xl border border-input bg-gray-100 px-3 py-2 text-sm text-gray-500"
                disabled
              />
            </div>

            <Button type="submit" variant="gradient" disabled={updating}>
              {updating ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                minLength={8}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <Button type="submit" variant="default" disabled={changingPassword}>
              {changingPassword ? 'Changement...' : 'Changer le mot de passe'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}