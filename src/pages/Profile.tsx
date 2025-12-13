import { useState, FormEvent, ChangeEvent } from 'react';
import { userAPI, budgetAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BudgetNavbar } from '../components/budget/BudgetNavbar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, HelpCircle, FileJson, Download } from 'lucide-react';
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

export default function Profile() {
  const { user, logout } = useAuth();
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

  // 1. Update Profile Logic
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await userAPI.updateProfile({ name, avatar });
      if (user) {
        const updatedUser = { ...user, name, avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
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

  // 2. Change Password Logic
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

  // 3. Delete Account Logic
  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    try {
      await userAPI.deleteAccount({ password: deletePassword });
      toast({ 
        title: "Compte supprimé", 
        description: "Vos données ont été effacées. Au revoir !", 
        variant: "default" 
      });
      logout();
      navigate('/login');
    } catch (err: any) {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.error || "Mot de passe incorrect ou erreur serveur", 
        variant: "destructive" 
      });
      setDeleting(false); 
    }
  };

// 4. GDPR Export Logic (OPTIMISÉ : Suppression des champs tiers)
  const handleGDPRExport = async () => {
      setExporting(true);
      try {
          const listRes = await budgetAPI.list();
          // S'assurer qu'on a bien un tableau
          const budgets = Array.isArray(listRes.data) ? listRes.data : [];
          
          const fullExport = {
              user: { name: user?.name, email: user?.email, id: user?.id },
              exportDate: new Date().toISOString(),
              budgets: [] as any[]
          };

          for (const b of budgets) {
              try {
                  const dataRes = await budgetAPI.getData(b.id);
                  
                  // --- SANITIZATION LOGIC ---
                  const sanitizedMembers = b.members.map((m: any) => {
                      // CAS 1 : C'est moi (le demandeur)
                      // -> Je garde toutes mes données
                      if (m.user && m.user.id === user?.id) {
                          return m;
                      }

                      // CAS 2 : C'est un autre membre
                      // -> Je garde le membre pour la cohérence du budget (savoir qui est là)
                      // -> MAIS je retire physiquement le champ 'email' et l'id interne
                      if (m.user) {
                          // On extrait email et id pour les jeter, on garde le reste (name, avatar) dans safeUser
                          const { email, id, ...safeUser } = m.user;
                          return {
                              ...m,
                              user: safeUser // Ne contient plus que { name, avatar }
                          };
                      }
                      
                      // Cas membre fantôme (invitation en attente ou supprimé)
                      return m;
                  });

                  // On reconstruit l'objet budget avec la liste nettoyée
                  const sanitizedMeta = {
                      ...b,
                      members: sanitizedMembers
                  };
                  // --------------------------

                  fullExport.budgets.push({
                      meta: sanitizedMeta,
                      data: dataRes.data.data
                  });
              } catch (e) {
                  console.error("Failed to fetch budget data for export", b.id);
              }
          }

          // Génération du fichier
          const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `budget_famille_export_${user?.id}_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast({ title: "Données exportées", description: "L'archive nettoyée a été téléchargée.", variant: "default" });

      } catch (error) {
          console.error(error);
          toast({ title: "Erreur", description: "Impossible de générer l'export.", variant: "destructive" });
      } finally {
          setExporting(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <BudgetNavbar items={[]} userName={user?.name} userAvatar={user?.avatar} />
      
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

        {/* PROFILE INFO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations</h2>
          <form onSubmit={handleUpdateProfile}>
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
              <Input
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={user?.email || ''}
                className="bg-gray-100 text-gray-500"
                disabled
              />
            </div>

            <Button type="submit" variant="gradient" disabled={updating}>
              {updating ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </form>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="default" disabled={changingPassword}>
              {changingPassword ? 'Changement...' : 'Changer le mot de passe'}
            </Button>
          </form>
        </div>

        {/* GDPR / DATA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileJson className="h-5 w-5 text-blue-600" />
                Données & Confidentialité
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
                Conformément au RGPD, vous avez le droit à la portabilité de vos données. 
                Vous pouvez télécharger une archive complète de tous vos budgets et informations personnelles au format JSON.
            </p>
            <Button variant="outline" onClick={handleGDPRExport} disabled={exporting} className="w-full sm:w-auto gap-2">
                {exporting ? <Download className="h-4 w-4 animate-bounce" /> : <Download className="h-4 w-4" />}
                {exporting ? "Génération de l'archive..." : "Télécharger mes données (JSON)"}
            </Button>
        </div>

        {/* TUTORIAL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aide & Tutoriel</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Besoin d'un rappel sur le fonctionnement de l'application ?
            </p>
            <Button variant="outline" onClick={startTutorial} className="w-full sm:w-auto gap-2">
                <HelpCircle className="h-4 w-4" />
                Revoir le tutoriel
            </Button>
        </div>

        {/* DANGER ZONE */}
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
                onClick={() => {
                    setDeletePassword('');
                    setDeleteDialogOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700"
            >
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer mon compte
            </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">Supprimer définitivement le compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée.<br/><br/>
              <strong>Veuillez saisir votre mot de passe pour confirmer :</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
             <Input 
                type="password"
                placeholder="Votre mot de passe"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="border-red-200 focus-visible:ring-red-500"
             />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault();
                    handleDeleteAccount();
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleting || !deletePassword}
            >
                {deleting ? 'Suppression...' : 'Confirmer la suppression'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}