// src/pages/Profile.tsx
// ✅ VERSION CORRIGÉE - Utilise le composant Navbar avec menu fonctionnel

import { useState, FormEvent, ChangeEvent } from 'react';
import { userAPI, budgetAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar'; // ✅ CHANGÉ : Import du composant Navbar
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, HelpCircle, Download, MapPin } from 'lucide-react';
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
      updateUser({ name, avatar });
      
      toast({ 
        title: "Profil mis à jour", 
        description: "Vos informations ont été enregistrées.", 
        variant: "default" 
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
      
      updateUser({ country, postal_code: postalCode });
      
      toast({ 
        title: "Localisation mise à jour", 
        description: "Vos suggestions de marché seront adaptées à votre pays.", 
        variant: "default" 
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
        variant: "default" 
      });
    } catch (err: any) {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.error || 'Mot de passe actuel incorrect', 
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
    if (!deletePassword.trim()) {
      toast({ 
        title: "Erreur", 
        description: "Veuillez entrer votre mot de passe.", 
        variant: "destructive" 
      });
      return;
    }

    setDeleting(true);

    try {
      await userAPI.deleteAccount({ password: deletePassword });
      toast({ 
        title: "Compte supprimé", 
        description: "Votre compte sera supprimé définitivement sous 30 jours.", 
        variant: "default" 
      });
      logout();
      navigate('/login');
    } catch (err: any) {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.error || 'Mot de passe incorrect', 
        variant: "destructive" 
      });
      setDeleting(false);
    }
  };

  // ============================================================================
  // 5. GDPR EXPORT
  // ============================================================================

  const handleGDPRExport = async () => {
    setExporting(true);
    try {
      const response = await budgetAPI.exportUserData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mes-donnees-budgetfamille-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({ 
        title: "Export réussi", 
        description: "Vos données ont été téléchargées.", 
        variant: "default" 
      });
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de générer l'export.", 
        variant: "destructive" 
      });
    } finally {
      setExporting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      {/* ✅ CHANGÉ : Utilisation du composant Navbar avec items de navigation */}
      <Navbar />
            
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

        {/* ============================================================================ */}
        {/* SECTION 1: PROFILE INFO */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="flex flex-col items-center mb-8">
              <AvatarPicker 
                name={name}
                currentAvatar={avatar}
                onSelect={(newAvatar) => setAvatar(newAvatar)}
              />
              <p className="text-sm text-muted-foreground mt-3">
                Cliquez sur l'avatar pour le modifier
              </p>
            </div>

            <div className="mb-4">
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                className="bg-gray-100 text-gray-500"
                disabled
              />
            </div>

            <Button type="submit" variant="gradient" disabled={updating}>
              {updating ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </Button>
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
        {/* SECTION 3: CHANGE PASSWORD */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Changer de mot de passe
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
                  minLength={6}
                />
              </div>

              <Button type="submit" variant="gradient" disabled={changingPassword}>
                {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
            </div>
          </form>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 4: GDPR EXPORT */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mes données (RGPD)
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Téléchargez une copie complète de toutes vos données personnelles au format JSON.
            <br/>
            <span className="text-xs font-medium text-blue-600 mt-2 block">
              Note : Ce fichier contient uniquement VOS informations personnelles. Les données des autres membres sont exclues de cet export.
            </span>
          </p>
          <Button 
            variant="outline" 
            onClick={handleGDPRExport} 
            disabled={exporting} 
            className="w-full sm:w-auto gap-2"
          >
            {exporting ? <Download className="h-4 w-4 animate-bounce" /> : <Download className="h-4 w-4" />}
            {exporting ? "Génération de l'archive..." : "Télécharger mes données (JSON)"}
          </Button>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 5: TUTORIAL */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Aide & Tutoriel
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Besoin d'un rappel sur le fonctionnement de l'application ?
          </p>
          <Button 
            variant="outline" 
            onClick={startTutorial} 
            className="w-full sm:w-auto gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Revoir le tutoriel
          </Button>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 6: DANGER ZONE */}
        {/* ============================================================================ */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Zone de danger</h2>
          </div>
          <p className="text-red-700 mb-6 text-sm">
            La suppression de votre compte est irréversible.
            Toutes vos données seront définitivement effacées de nos serveurs.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full sm:w-auto gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* DELETE ACCOUNT DIALOG */}
      {/* ============================================================================ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes vos données seront définitivement supprimées 
              de nos serveurs sous 30 jours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmez votre mot de passe
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDeletePassword(e.target.value)}
              placeholder="Votre mot de passe"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword('')}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
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