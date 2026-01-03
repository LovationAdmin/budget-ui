import { EmptyState } from '@/components/budget/EmptyState';
import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, Plus, ArrowRight, Trash2, Loader2, FlaskConical, MapPin, DollarSign, Pencil } from "lucide-react";
import { budgetAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MemberAvatarGroup } from '../components/budget/MemberAvatar';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/Navbar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Budget {
  id: string;
  name: string;
  created_at: string;
  is_owner: boolean;
  location?: string;
  currency?: string;
  members: Array<{
    user: {
      name: string;
      avatar?: string;
    } | null;
  }>;
}

// ✅ CONFIGURATION LOCALISATION
const LOCATION_CONFIGS = [
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR', symbol: '€' },
  { code: 'ES', name: 'Espagne', currency: 'EUR', symbol: '€' },
  { code: 'IT', name: 'Italie', currency: 'EUR', symbol: '€' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', symbol: '€' },
  { code: 'BE', name: 'Belgique', currency: 'EUR', symbol: '€' },
  { code: 'NL', name: 'Pays-Bas', currency: 'EUR', symbol: '€' },
  { code: 'AT', name: 'Autriche', currency: 'EUR', symbol: '€' },
  { code: 'CH', name: 'Suisse', currency: 'CHF', symbol: 'CHF' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP', symbol: '£' },
];

// ============================================================================
// SKELETON LOADING COMPONENT
// ============================================================================
const BudgetListSkeleton = memo(function BudgetListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex -space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
});

// ============================================================================
// BUDGET CARD COMPONENT
// ============================================================================
interface BudgetCardProps {
  budget: Budget;
  onOpen: (id: string) => void;
  onOpenBeta: (id: string) => void;
  onDelete: (budget: Budget) => void;
  onEdit: (budget: Budget) => void; // ✅ AJOUT : Callback d'édition
}

const BudgetCard = memo(function BudgetCard({ budget, onOpen, onOpenBeta, onDelete, onEdit }: BudgetCardProps) {
  const handleOpen = useCallback(() => {
    onOpen(budget.id);
  }, [budget.id, onOpen]);

  const handleOpenBeta = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenBeta(budget.id);
  }, [budget.id, onOpenBeta]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(budget);
  }, [budget, onDelete]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(budget);
  }, [budget, onEdit]);

  const members = budget.members
    .filter(m => m.user)
    .map(m => ({
      name: m.user!.name,
      image: m.user!.avatar,
    }));

  const locationInfo = LOCATION_CONFIGS.find(c => c.code === budget.location);

  return (
    <div 
      className="group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1"
      onClick={handleOpen}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {budget.name}
          </h3>
          
          {/* Badge Localisation & Devise */}
          {locationInfo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-0.5 rounded-full border border-secondary/50">
               <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {locationInfo.name}
               </span>
               <span className="opacity-30">|</span>
               <span className="font-medium">{locationInfo.currency}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Créé le {new Date(budget.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
        
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft">
          <PiggyBank className="h-5 w-5" />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        {members.length > 0 ? (
          <MemberAvatarGroup members={members} max={3} size="sm" />
        ) : (
          <div className="text-xs text-muted-foreground">Aucun membre</div>
        )}
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-1 px-2"
          >
            <span className="hidden sm:inline">Ouvrir</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          {/* Bouton Beta */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenBeta}
            className="gap-1 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            title="Tester Reality Check (Beta 2)"
          >
            <FlaskConical className="h-4 w-4" />
          </Button>
          
          {budget.is_owner && (
            <>
                {/* ✅ AJOUT : Bouton Éditer */}
                <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="text-muted-foreground hover:text-primary h-8 w-8"
                title="Modifier le budget"
                >
                <Pencil className="h-4 w-4" />
                </Button>

                <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
                title="Supprimer"
                >
                <Trash2 className="h-4 w-4" />
                </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.budget.id === nextProps.budget.id &&
    prevProps.budget.name === nextProps.budget.name &&
    prevProps.budget.members.length === nextProps.budget.members.length &&
    prevProps.budget.location === nextProps.budget.location &&
    prevProps.budget.currency === nextProps.budget.currency
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetLocation, setNewBudgetLocation] = useState('FR');
  const [newBudgetCurrency, setNewBudgetCurrency] = useState('EUR');
  const [creating, setCreating] = useState(false);
  
  // ✅ Edit Modal States
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete States
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBudgets = useCallback(async () => {
    try {
      const response = await budgetAPI.list();
      setBudgets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les budgets",
        variant: "destructive"
      });
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleOpenBudget = useCallback((id: string) => {
    navigate(`/budget/${id}/complete`);
  }, [navigate]);

  const handleOpenBeta = useCallback((id: string) => {
    navigate(`/beta2/${id}`);
  }, [navigate]);

  // --- Handlers CREATION ---

  const handleCreateLocationChange = (locationCode: string) => {
    setNewBudgetLocation(locationCode);
    const config = LOCATION_CONFIGS.find(c => c.code === locationCode);
    if (config) {
        setNewBudgetCurrency(config.currency);
    }
  };

  const handleCreateBudget = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName.trim()) return;

    setCreating(true);
    try {
      await budgetAPI.create({ 
        name: newBudgetName.trim(), 
        year: new Date().getFullYear(),
        location: newBudgetLocation,
        currency: newBudgetCurrency
      });
      toast({
        title: "Succès",
        description: "Budget créé avec succès !",
        variant: "default"
      });
      setShowCreateModal(false);
      setNewBudgetName('');
      setNewBudgetLocation('FR');
      setNewBudgetCurrency('EUR');
      loadBudgets();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de créer le budget",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  }, [newBudgetName, newBudgetLocation, newBudgetCurrency, loadBudgets, toast]);

  // --- Handlers EDITION (✅ NOUVEAU) ---

  const openEditModal = useCallback((budget: Budget) => {
      setBudgetToEdit(budget);
      setEditName(budget.name);
      setEditLocation(budget.location || 'FR');
      setEditCurrency(budget.currency || 'EUR');
  }, []);

  const closeEditModal = useCallback(() => {
      setBudgetToEdit(null);
      setEditName('');
      setEditLocation('');
      setEditCurrency('');
  }, []);

  const handleEditLocationChange = (locationCode: string) => {
    setEditLocation(locationCode);
    const config = LOCATION_CONFIGS.find(c => c.code === locationCode);
    if (config) {
        setEditCurrency(config.currency);
    }
  };

  const handleUpdateBudget = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();
      if (!budgetToEdit || !editName.trim()) return;

      setUpdating(true);
      try {
          // On suppose que l'API a une méthode update (sinon utiliser updateData ou adapter l'appel)
          // Si tu utilises updateData pour le contenu JSON, assure-toi d'avoir une route pour les métadonnées (nom, location)
          // Ici j'assume une route PATCH /budgets/:id
          await budgetAPI.update(budgetToEdit.id, {
              name: editName.trim(),
              location: editLocation,
              currency: editCurrency
          });

          toast({
              title: "Budget mis à jour",
              description: "Les modifications ont été enregistrées.",
          });
          
          closeEditModal();
          loadBudgets();
      } catch (error: any) {
          toast({
              title: "Erreur",
              description: "Impossible de mettre à jour le budget",
              variant: "destructive"
          });
      } finally {
          setUpdating(false);
      }
  }, [budgetToEdit, editName, editLocation, editCurrency, loadBudgets, toast, closeEditModal]);


  // --- Handlers SUPPRESSION ---

  const confirmDelete = useCallback((budget: Budget) => {
    setBudgetToDelete(budget);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!budgetToDelete) return;

    setDeleting(true);
    try {
      await budgetAPI.delete(budgetToDelete.id);
      toast({
        title: "Succès",
        description: "Budget supprimé",
        variant: "default"
      });
      setBudgetToDelete(null);
      loadBudgets();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le budget",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  }, [budgetToDelete, loadBudgets, toast]);

  const handleShowCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setNewBudgetName('');
  }, []);

  const handleCancelDelete = useCallback(() => {
    setBudgetToDelete(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Bonjour, {user?.name || 'Utilisateur'} 👋
              </h1>
              <p className="mt-1 text-muted-foreground">
                {budgets.length > 0 
                  ? `Vous gérez ${budgets.length} budget${budgets.length > 1 ? 's' : ''}`
                  : 'Créez votre premier budget pour commencer'}
              </p>
            </div>
            <Button 
              variant="default"
              onClick={handleShowCreateModal}
              className="gap-2 shadow-lg bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Nouveau Budget
            </Button>
          </div>
        </div>

        {loading ? (
          <BudgetListSkeleton />
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="Aucun budget pour le moment"
            description="Créez votre premier budget pour commencer à gérer vos finances."
            actionLabel="Créer un budget"
            onAction={handleShowCreateModal}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onOpen={handleOpenBudget}
                onOpenBeta={handleOpenBeta}
                onDelete={confirmDelete}
                onEdit={openEditModal} // ✅ Pass edit handler
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* ========================================================= */}
      {/* MODAL CRÉATION */}
      {/* ========================================================= */}
      <Dialog open={showCreateModal} onOpenChange={handleCloseCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau budget</DialogTitle>
            <DialogDescription>
              Configurez les détails de votre budget familial.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBudget}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="budget-name">Nom du budget</Label>
                <Input
                  id="budget-name"
                  placeholder="Ex: Budget Famille 2025"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-location">Localisation (pour les estimations IA)</Label>
                <Select value={newBudgetLocation} onValueChange={handleCreateLocationChange}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LOCATION_CONFIGS.map((config) => (
                            <SelectItem key={config.code} value={config.code}>
                                {config.name} ({config.currency})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-border/50">
                  <DollarSign className="h-4 w-4" />
                  <span>Devise détectée :</span>
                  <span className="font-semibold text-foreground">{newBudgetCurrency}</span>
              </div>

            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateModal}
                disabled={creating}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={creating || !newBudgetName.trim()}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* ✅ MODAL ÉDITION (NOUVEAU) */}
      {/* ========================================================= */}
      <Dialog open={!!budgetToEdit} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le budget</DialogTitle>
            <DialogDescription>
              Modifiez le nom ou la localisation de ce budget.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBudget}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-budget-name">Nom du budget</Label>
                <Input
                  id="edit-budget-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-budget-location">Localisation</Label>
                <Select value={editLocation} onValueChange={handleEditLocationChange}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LOCATION_CONFIGS.map((config) => (
                            <SelectItem key={config.code} value={config.code}>
                                {config.name} ({config.currency})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                  <DollarSign className="h-4 w-4" />
                  <span>Nouvelle devise :</span>
                  <span className="font-bold">{editCurrency}</span>
              </div>
              <p className="text-xs text-muted-foreground">Note: Changer la devise ne convertit pas les montants existants.</p>

            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                disabled={updating}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updating || !editName.trim()}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce budget ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données du budget "{budgetToDelete?.name}" seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}