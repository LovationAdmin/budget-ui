import { useState, FormEvent, ChangeEvent } from 'react';
import { userAPI, budgetAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BudgetNavbar } from '../components/budget/BudgetNavbar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, HelpCircle, FileJson, Download, MapPin } from 'lucide-react';
import { AvatarPicker } from '../components/ui/avatar-picker';
import { useTutorial } from '../contexts/TutorialContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================================================
// SUPPORTED COUNTRIES
// ============================================================================

const SUPPORTED_COUNTRIES = [
  { code: 'FR', name: '🇫🇷 France' },
  { code: 'BE', name: '🇧🇪 Belgique' },
  { code: 'DE', name: '🇩🇪 Allemagne' },
  { code: 'ES', name: '🇪🇸 Espagne' },
  { code: 'IT', name: '🇮🇹 Italie' },
  { code: 'PT', name: '🇵🇹 Portugal' },
  { code: 'NL', name: '🇳🇱 Pays-Bas' },
  { code: 'LU', name: '🇱🇺 Luxembourg' },
  { code: 'AT', name: '🇦🇹 Autriche' },
  { code: 'IE', name: '🇮🇪 Irlande' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Profile() {
  // ✅ FIXED: Now includes updateUser from AuthContext
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial } = useTutorial();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  // Location State
  const [country, setCountry] = useState(user?.country || 'FR');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Delete Account State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // Loading States
  const [updating, setUpdating] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ============================================================================
  // 1. UPDATE PROFILE
  // ============================================================================

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await userAPI.updateProfile({ name, avatar });
      
      // ✅ FIXED: Use updateUser instead of direct localStorage + reload
      updateUser({ name, avatar });
      
      toast({ 
        title: "Profil mis à jour", 
        description: "Vos informations ont été enregistrées.", 
        variant: "success" 
      });
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

  // ============================================================================
  // 2. UPDATE LOCATION
  // ============================================================================

  const handleUpdateLocation = async (e: FormEvent) => {
    e.preventDefault();
    setUpdatingLocation(true);

    try {
      await userAPI.updateLocation({ 
        country, 
        postal_code: postalCode 
      });
      
      // ✅ FIXED: Use updateUser to sync both localStorage AND React state
      updateUser({ country, postal_code: postalCode });
      
      toast({ 
        title: "Localisation mise à jour", 
        description: "Vos suggestions de marché seront adaptées à votre pays.", 
        variant: "success" 
      });
    } catch (err: any) {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.error || 'Erreur lors de la mise à jour', 
        variant: "destructive" 
      });
    } finally {
      setUpdatingLocation(false);
    }
  };

  // ============================================================================
  // 3. CHANGE PASSWORD
  // ============================================================================

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ 
        title: "Erreur", 
        description: "Les mots de passe ne correspondent pas.", 
        variant: "destructive" 
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({ 
        title: "Erreur", 
        description: "Le mot de passe doit contenir au moins 6 caractères.", 
        variant: "destructive" 
      });
      return;
    }

    setChangingPassword(true);

    try {
      await userAPI.changePassword({ 
        current_password: currentPassword, 
        new_password: newPassword 
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ 
        title: "Mot de passe modifié", 
        description: "Votre mot de passe a été mis à jour avec succès.", 
        variant: "success" 
      });
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

  // ============================================================================
  // 4. DELETE ACCOUNT
  // ============================================================================

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ 
        title: "Erreur", 
        description: "Veuillez entrer votre mot de passe pour confirmer.", 
        variant: "destructive" 
      });
      return;
    }

    setDeleting(true);

    try {
      await userAPI.deleteAccount({ password: deletePassword });
      logout();
      navigate('/login');
      toast({ 
        title: "Compte supprimé", 
        description: "Votre compte a été supprimé définitivement.", 
        variant: "success" 
      });
    } catch (err: any) {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.error || 'Erreur lors de la suppression', 
        variant: "destructive" 
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletePassword('');
    }
  };

  // ============================================================================
  // 5. EXPORT DATA
  // ============================================================================

  const handleExportData = async () => {
    setExporting(true);

    try {
      const response = await budgetAPI.list();
      const budgets = response.data;

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          name: user?.name,
          email: user?.email,
          country: user?.country,
          postal_code: user?.postal_code,
        },
        budgets: budgets,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `budget-famille-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data?.error || "Erreur lors de l'export",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <BudgetNavbar />
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={startTutorial}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Tutoriel
            </Button>
          </div>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 1: PROFILE */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Informations personnelles
          </h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar
                </label>
                <AvatarPicker 
                  value={avatar} 
                  onChange={setAvatar}
                  name={name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <Button type="submit" variant="gradient" disabled={updating}>
                {updating ? 'Mise à jour...' : 'Mettre à jour le profil'}
              </Button>
            </div>
          </form>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 2: LOCATION */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localisation
          </h2>
          <form onSubmit={handleUpdateLocation}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Vos suggestions de marché seront adaptées à votre localisation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal (optionnel)
                </label>
                <Input
                  type="text"
                  value={postalCode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                  placeholder="75001"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Pour des suggestions encore plus précises (future fonctionnalité)
                </p>
              </div>

              <Button type="submit" variant="gradient" disabled={updatingLocation}>
                {updatingLocation ? 'Mise à jour...' : 'Mettre à jour la localisation'}
              </Button>
            </div>
          </form>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 3: PASSWORD */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Changer le mot de passe
          </h2>
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="gradient" disabled={changingPassword}>
                {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
            </div>
          </form>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 4: EXPORT DATA */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Exporter mes données
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Téléchargez une copie de toutes vos données (budgets, paramètres) au format JSON.
          </p>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Export en cours...' : 'Exporter mes données'}
          </Button>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 5: DANGER ZONE */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zone de danger
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous vos budgets et données seront définitivement supprimés.
              Entrez votre mot de passe pour confirmer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="Votre mot de passe"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="mt-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword('')}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting || !deletePassword}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}