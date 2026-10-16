// src/pages/Profile.tsx
// ✅ VERSION CORRIGÉE - Section localisation SUPPRIMÉE (maintenant au niveau budget)

import { useState, FormEvent, ChangeEvent } from 'react';
import { userAPI, budgetAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, HelpCircle, Download } from 'lucide-react';
import { AvatarPicker } from '../../components/ui/avatar-picker';
import { useTutorial } from '../../contexts/TutorialContext';
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
import { defineMessages, useLocale, usePreference, useT, wordsIn } from '@/i18n/runtime';
import type { Locale } from '@/i18n/locales';

const M = defineMessages({
  fr: {
    updatedTitle: 'Profil mis à jour',
    updatedText: 'Vos informations ont été enregistrées.',
    error: 'Erreur',
    updateFailed: 'Erreur lors de la mise à jour',
    mismatch: 'Les mots de passe ne correspondent pas.',
    tooShort: 'Le mot de passe doit contenir au moins 6 caractères.',
    changedTitle: 'Mot de passe modifié',
    changedText: 'Votre mot de passe a été mis à jour avec succès.',
    wrongCurrent: 'Mot de passe actuel incorrect',
    enterPassword: 'Veuillez entrer votre mot de passe.',
    deletedTitle: 'Compte supprimé',
    deletedText: 'Votre compte sera supprimé définitivement sous 30 jours.',
    wrongPassword: 'Mot de passe incorrect',
    exportFile: 'mes-donnees-budgetfamille',
    exportedTitle: 'Export réussi',
    exportedText: 'Vos données ont été téléchargées.',
    exportFailed: "Impossible de générer l'export.",
    back: 'Retour au tableau de bord',
    title: 'Mon Profil',
    info: 'Informations',
    avatarHint: "Cliquez sur l'avatar pour le modifier",
    name: 'Nom',
    email: 'Email',
    updating: 'Mise à jour...',
    update: 'Mettre à jour le profil',
    languageTitle: 'Langue',
    languageText: 'La langue de l’application et des e-mails que nous vous envoyons.',
    languageSaved: 'Langue enregistrée',
    passwordTitle: 'Changer de mot de passe',
    current: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirm: 'Confirmer le nouveau mot de passe',
    changing: 'Modification...',
    change: 'Changer le mot de passe',
    dataTitle: 'Mes données (RGPD)',
    dataText: 'Téléchargez une copie complète de toutes vos données personnelles au format JSON.',
    dataNote: 'Note : Ce fichier contient uniquement VOS informations personnelles. Les données des autres membres sont exclues de cet export.',
    exporting: "Génération de l'archive...",
    download: 'Télécharger mes données (JSON)',
    helpTitle: 'Aide & Tutoriel',
    helpText: "Besoin d'un rappel sur le fonctionnement de l'application ?",
    tutorial: 'Revoir le tutoriel',
    danger: 'Zone de danger',
    dangerText: 'La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées de nos serveurs.',
    deleteAccount: 'Supprimer mon compte',
    sure: 'Êtes-vous absolument sûr ?',
    sureText: 'Cette action est irréversible. Toutes vos données seront définitivement supprimées de nos serveurs sous 30 jours.',
    confirmPassword: 'Confirmez votre mot de passe',
    yourPassword: 'Votre mot de passe',
    cancel: 'Annuler',
    deleting: 'Suppression...',
    deleteForever: 'Supprimer définitivement',
  },
  en: {
    updatedTitle: 'Profile updated',
    updatedText: 'Your details have been saved.',
    error: 'Error',
    updateFailed: 'Couldn’t update your profile',
    mismatch: 'The passwords don’t match.',
    tooShort: 'The password must be at least 6 characters.',
    changedTitle: 'Password changed',
    changedText: 'Your password has been updated.',
    wrongCurrent: 'Current password is incorrect',
    enterPassword: 'Please enter your password.',
    deletedTitle: 'Account deleted',
    deletedText: 'Your account will be permanently deleted within 30 days.',
    wrongPassword: 'Incorrect password',
    exportFile: 'my-budgetfamille-data',
    exportedTitle: 'Export done',
    exportedText: 'Your data has been downloaded.',
    exportFailed: 'Couldn’t create the export.',
    back: 'Back to my budgets',
    title: 'My profile',
    info: 'Details',
    avatarHint: 'Click the avatar to change it',
    name: 'Name',
    email: 'Email',
    updating: 'Updating...',
    update: 'Update my profile',
    languageTitle: 'Language',
    languageText: 'The language of the app and of the emails we send you.',
    languageSaved: 'Language saved',
    passwordTitle: 'Change your password',
    current: 'Current password',
    newPassword: 'New password',
    confirm: 'Confirm the new password',
    changing: 'Changing...',
    change: 'Change the password',
    dataTitle: 'My data (GDPR)',
    dataText: 'Download a full copy of all your personal data as JSON.',
    dataNote: 'Note: this file only contains YOUR personal information. Other members’ data is not included in this export.',
    exporting: 'Creating the file...',
    download: 'Download my data (JSON)',
    helpTitle: 'Help & tutorial',
    helpText: 'Need a reminder of how the app works?',
    tutorial: 'Watch the tutorial again',
    danger: 'Danger zone',
    dangerText: 'Deleting your account cannot be undone. All your data will be permanently erased from our servers.',
    deleteAccount: 'Delete my account',
    sure: 'Are you absolutely sure?',
    sureText: 'This cannot be undone. All your data will be permanently deleted from our servers within 30 days.',
    confirmPassword: 'Confirm your password',
    yourPassword: 'Your password',
    cancel: 'Cancel',
    deleting: 'Deleting...',
    deleteForever: 'Delete for good',
  },
});

const LANGUAGES: Array<{ value: Locale; label: string }> = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

export default function Profile() {
  const { user, logout, updateUser, saveLocale } = useAuth();
  const t = useT(M);
  const locale = useLocale();
  const { setPreference } = usePreference();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial } = useTutorial();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Delete Account State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // Loading States
  const [updating, setUpdating] = useState(false);
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
        title: t.updatedTitle, 
        description: t.updatedText, 
        variant: "default" 
      });
    } catch (err: any) {
      toast({ 
        title: t.error, 
        description: err.response?.data?.error || t.updateFailed, 
        variant: "destructive" 
      });
    } finally {
      setUpdating(false);
    }
  };

  // ============================================================================
  // 2. CHANGE PASSWORD
  // ============================================================================

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ 
        title: t.error, 
        description: t.mismatch, 
        variant: "destructive" 
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({ 
        title: t.error, 
        description: t.tooShort, 
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
        title: t.changedTitle, 
        description: t.changedText, 
        variant: "default" 
      });
    } catch (err: any) {
      toast({ 
        title: t.error, 
        description: err.response?.data?.error || t.wrongCurrent, 
        variant: "destructive" 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // ============================================================================
  // 3. DELETE ACCOUNT
  // ============================================================================

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast({ 
        title: t.error, 
        description: t.enterPassword, 
        variant: "destructive" 
      });
      return;
    }

    setDeleting(true);

    try {
      await userAPI.deleteAccount({ password: deletePassword });
      toast({ 
        title: t.deletedTitle, 
        description: t.deletedText, 
        variant: "default" 
      });
      logout();
      navigate('/login');
    } catch (err: any) {
      toast({ 
        title: t.error, 
        description: err.response?.data?.error || t.wrongPassword, 
        variant: "destructive" 
      });
      setDeleting(false);
    }
  };

  // ============================================================================
  // 4. GDPR EXPORT
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
      link.download = `${t.exportFile}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({ 
        title: t.exportedTitle, 
        description: t.exportedText, 
        variant: "default" 
      });
    } catch (error) {
      console.error(error);
      toast({ 
        title: t.error, 
        description: t.exportFailed, 
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
      <Navbar />
            
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        {/* ============================================================================ */}
        {/* SECTION 1: PROFILE INFO */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.info}</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="flex flex-col items-center mb-8">
              <AvatarPicker 
                name={name}
                currentAvatar={avatar}
                onSelect={(newAvatar) => setAvatar(newAvatar)}
              />
              <p className="text-sm text-muted-foreground mt-3">
                {t.avatarHint}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.name}
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
                {t.email}
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                className="bg-gray-100 text-gray-500"
                disabled
              />
            </div>

            <Button type="submit" variant="gradient" disabled={updating}>
              {updating ? t.updating : t.update}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.languageTitle}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t.languageText}</p>
          <div role="radiogroup" aria-label={t.languageTitle} className="inline-flex rounded-xl border border-gray-200 p-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                type="button"
                role="radio"
                aria-checked={locale === l.value}
                lang={l.value}
                onClick={() => {
                  if (l.value === locale) return;
                  setPreference(l.value);
                  saveLocale(l.value);
                  toast({ title: wordsIn(M, l.value).languageSaved });
                }}
                className={`min-h-[44px] rounded-lg px-4 text-sm font-medium transition-colors ${locale === l.value ? 'bg-primary text-primary-foreground' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 2: CHANGE PASSWORD */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t.passwordTitle}
          </h2>
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.current}
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
                  {t.newPassword}
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
                  {t.confirm}
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
                {changingPassword ? t.changing : t.change}
              </Button>
            </div>
          </form>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 3: GDPR EXPORT */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t.dataTitle}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {t.dataText}
            <br/>
            <span className="text-xs font-medium text-blue-600 mt-2 block">
              {t.dataNote}
            </span>
          </p>
          <Button 
            variant="outline" 
            onClick={handleGDPRExport} 
            disabled={exporting} 
            className="w-full sm:w-auto gap-2"
          >
            {exporting ? <Download className="h-4 w-4 animate-bounce" /> : <Download className="h-4 w-4" />}
            {exporting ? t.exporting : t.download}
          </Button>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 4: TUTORIAL */}
        {/* ============================================================================ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t.helpTitle}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {t.helpText}
          </p>
          <Button 
            variant="outline" 
            onClick={startTutorial} 
            className="w-full sm:w-auto gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            {t.tutorial}
          </Button>
        </div>

        {/* ============================================================================ */}
        {/* SECTION 5: DANGER ZONE */}
        {/* ============================================================================ */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">{t.danger}</h2>
          </div>
          <p className="text-red-700 mb-6 text-sm">
            {t.dangerText}
          </p>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full sm:w-auto gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t.deleteAccount}
          </Button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* DELETE ACCOUNT DIALOG */}
      {/* ============================================================================ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.sure}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.sureText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.confirmPassword}
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDeletePassword(e.target.value)}
              placeholder={t.yourPassword}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword('')}>
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? t.deleting : t.deleteForever}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}