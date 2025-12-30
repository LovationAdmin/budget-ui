// src/pages/Profile.tsx - VERSION OPTIMISÉE
import { useState, FormEvent, ChangeEvent, useCallback, useEffect, memo } from 'react';
import { userAPI, budgetAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BudgetNavbar } from '../components/budget/BudgetNavbar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, HelpCircle, FileJson, Download, MapPin, Loader2 } from 'lucide-react';
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
// 🚀 OPTIMISATION 1 : Skeleton Loading Component
// ============================================================================
const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <BudgetNavbar budgetTitle="Profil" />
      <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Profile Section Skeleton */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Location Section Skeleton */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Password Section Skeleton */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <Skeleton className="h-8 w-56 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial } = useTutorial();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Location State
  const [country, setCountry] = useState(user?.country || '');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '');
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Export State
  const [exporting, setExporting] = useState(false);

  // Initial Loading State
  const [initialLoading, setInitialLoading] = useState(true);

  // ============================================================================
  // Initial Data Loading
  // ============================================================================
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const locationResponse = await userAPI.getLocation();
        if (locationResponse.data) {
          setCountry(locationResponse.data.country || '');
          setPostalCode(locationResponse.data.postal_code || '');
        }
      } catch (error) {
        console.error('Error loading location:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      loadUserData();
    } else {
      setInitialLoading(false);
    }
  }, [user]);

  // ============================================================================
  // 🚀 OPTIMISATION 2 : useCallback pour tous les handlers
  // ============================================================================

  const handleUpdateProfile = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    setLoadingProfile(true);
    try {
      await userAPI.updateProfile({ name: name.trim(), avatar });
      updateUser({ name: name.trim(), avatar });
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos informations ont été enregistrées",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [name, avatar, updateUser, toast]);

  const handleUpdateLocation = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!country) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un pays",
        variant: "destructive"
      });
      return;
    }

    setLoadingLocation(true);
    try {
      await userAPI.updateLocation({ country, postal_code: postalCode });
      updateUser({ country, postal_code: postalCode });
      toast({
        title: "✅ Localisation mise à jour",
        description: "Votre pays a été enregistré",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.error || "Impossible de mettre à jour la localisation",
        variant: "destructive"
      });
    } finally {
      setLoadingLocation(false);
    }
  }, [country, postalCode, updateUser, toast]);

  const handleChangePassword = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      });
      return;
    }

    setLoadingPassword(true);
    try {
      await userAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "✅ Mot de passe changé",
        description: "Votre mot de passe a été mis à jour",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.error || "Impossible de changer le mot de passe",
        variant: "destructive"
      });
    } finally {
      setLoadingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, toast]);

  const handleDeleteAccount = useCallback(async () => {
    if (!deletePassword) {
      toast({
        title: "Erreur",
        description: "Mot de passe requis",
        variant: "destructive"
      });
      return;
    }

    setLoadingDelete(true);
    try {
      await userAPI.deleteAccount({ password: deletePassword });
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé définitivement",
      });
      logout();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.error || "Impossible de supprimer le compte",
        variant: "destructive"
      });
    } finally {
      setLoadingDelete(false);
      setShowDeleteDialog(false);
    }
  }, [deletePassword, logout, navigate, toast]);

  const handleExportData = useCallback(async () => {
    setExporting(true);
    try {
      const response = await budgetAPI.exportUserData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Export réussi",
        description: "Vos données ont été téléchargées",
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  }, [toast]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleShowDeleteDialog = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
    setDeletePassword('');
  }, []);

  // ============================================================================
  // 🚀 OPTIMISATION 3 : Skeleton Loading au lieu de spinner
  // ============================================================================
  if (initialLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <BudgetNavbar 
        budgetTitle="Profil"
        userName={user.name}
        userAvatar={user.avatar}
      />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <div className="space-y-6">
          {/* Profile Section */}
          <form onSubmit={handleUpdateProfile} className="rounded-2xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Informations du profil</h2>
            
            <div className="space-y-4">
              <AvatarPicker value={avatar} onChange={setAvatar} userName={name} />
              
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <Input
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input value={user.email} disabled className="bg-muted" />
              </div>

              <Button type="submit" disabled={loadingProfile} className="w-full">
                {loadingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </div>
          </form>

          {/* Location Section */}
          <form onSubmit={handleUpdateLocation} className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Localisation</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pays</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Code postal (optionnel)</label>
                <Input
                  value={postalCode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                  placeholder="Ex: 75001"
                />
              </div>

              <Button type="submit" disabled={loadingLocation} className="w-full">
                {loadingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer la localisation'
                )}
              </Button>
            </div>
          </form>

          {/* Password Section */}
          <form onSubmit={handleChangePassword} className="rounded-2xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Changer le mot de passe</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loadingPassword} className="w-full">
                {loadingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  'Changer le mot de passe'
                )}
              </Button>
            </div>
          </form>

          {/* Actions Section */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>

            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={exporting}
              className="w-full justify-start gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exporter mes données (GDPR)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={startTutorial}
              className="w-full justify-start gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Revoir le tutoriel
            </Button>

            <Button
              variant="destructive"
              onClick={handleShowDeleteDialog}
              className="w-full justify-start gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </Button>
          </div>
        </div>
      </main>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Supprimer définitivement le compte ?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Cette action est <strong>irréversible</strong>.</p>
              <p>Toutes vos données seront supprimées :</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Tous vos budgets</li>
                <li>Toutes vos données financières</li>
                <li>Vos connexions bancaires</li>
              </ul>
              <p className="mt-4">Entrez votre mot de passe pour confirmer :</p>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDeletePassword(e.target.value)}
                placeholder="Mot de passe"
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingDelete}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={loadingDelete || !deletePassword}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loadingDelete ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}