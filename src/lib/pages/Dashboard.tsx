// src/pages/Dashboard.tsx
// ✅ VERSION SIMPLIFIÉE - Beta2 supprimé (Reality Check intégré dans BudgetComplete)

import { EmptyState } from '@/components/budget/EmptyState';
import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PiggyBank, Plus, ArrowRight, Trash2, MapPin, DollarSign, Pencil, Sparkles, Check } from "lucide-react";
import { budgetAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MemberAvatarGroup } from '../../components/budget/MemberAvatar';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
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
import { intlLocale } from '@/lib/budget/format';
import { defineMessages, useT } from '@/i18n/runtime';

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
  { code: 'FR', currency: 'EUR', symbol: '€' },
  { code: 'DE', currency: 'EUR', symbol: '€' },
  { code: 'ES', currency: 'EUR', symbol: '€' },
  { code: 'IT', currency: 'EUR', symbol: '€' },
  { code: 'PT', currency: 'EUR', symbol: '€' },
  { code: 'BE', currency: 'EUR', symbol: '€' },
  { code: 'NL', currency: 'EUR', symbol: '€' },
  { code: 'AT', currency: 'EUR', symbol: '€' },
  { code: 'CH', currency: 'CHF', symbol: 'CHF' },
  { code: 'GB', currency: 'GBP', symbol: '£' },
  { code: 'US', currency: 'USD', symbol: '$' },
  { code: 'CA', currency: 'CAD', symbol: '$' },
  { code: 'SN', currency: 'XOF', symbol: 'CFA' },
  { code: 'CI', currency: 'XOF', symbol: 'CFA' },
{ code: 'MA', currency: 'MAD', symbol: 'DH' },
] as const;

const M = defineMessages({
  fr: {
    countries: {
      FR: 'France', DE: 'Allemagne', ES: 'Espagne', IT: 'Italie', PT: 'Portugal', BE: 'Belgique', NL: 'Pays-Bas', AT: 'Autriche',
      CH: 'Suisse', GB: 'Royaume-Uni', US: 'États-Unis', CA: 'Canada', SN: 'Sénégal', CI: "Côte d'Ivoire", MA: 'Maroc',
    },
    createdOn: (date: string) => `Créé le ${date}`,
    noMembers: 'Aucun membre',
    open: 'Ouvrir',
    edit: 'Modifier',
    delete: 'Supprimer',
    success: 'Succès',
    created: 'Budget créé avec succès !',
    error: 'Erreur',
    createFailed: 'Impossible de créer le budget',
    updated: 'Budget mis à jour',
    saved: 'Les modifications ont été enregistrées.',
    updateFailed: 'Impossible de mettre à jour le budget',
    deleted: 'Budget supprimé',
    deleteFailed: 'Impossible de supprimer le budget',
    defaultName: 'Mon budget',
    hello: (name?: string) => `Bonjour, ${name || 'Utilisateur'} 👋`,
    count: (n: number) => `Vous gérez ${n} budget${n > 1 ? 's' : ''}`,
    createFirst: 'Créez votre premier budget pour commencer',
    newBudget: 'Nouveau Budget',
    emptyTitle: 'Bienvenue ! Créons votre premier budget',
    emptyText: 'Un nom, votre pays, et c’est parti : vous ajouterez ensuite votre foyer et vos charges en quelques minutes.',
    emptyCta: 'Créer mon budget',
    createTitle: 'Nouveau budget',
    createText: 'Un budget pour le foyer, la coloc ou un projet : vous pourrez en créer d’autres.',
    name: 'Nom du budget',
    namePlaceholder: 'Ex. : Foyer, Coloc, Mariage 2027…',
    location: 'Localisation',
    currency: (code: string) => <>Devise : <strong>{code}</strong></>,
    aiTitle: "Laisser l'IA proposer une répartition",
    aiText: "Après création, décrivez votre situation et l'IA propose un budget mensuel juste et soutenable.",
    cancel: 'Annuler',
    creating: 'Création...',
    createWithAI: 'Créer + IA',
    create: 'Créer le budget',
    editTitle: 'Modifier le budget',
    editText: 'Mettez à jour les informations de votre budget.',
    updating: 'Mise à jour...',
    save: 'Enregistrer',
    deleteTitle: 'Supprimer ce budget ?',
    deleteText: (name = '') => `Cette action est irréversible. Toutes les données du budget "${name}" seront définitivement supprimées.`,
    deleting: 'Suppression...',
  },
  en: {
    countries: {
      FR: 'France', DE: 'Germany', ES: 'Spain', IT: 'Italy', PT: 'Portugal', BE: 'Belgium', NL: 'Netherlands', AT: 'Austria',
      CH: 'Switzerland', GB: 'United Kingdom', US: 'United States', CA: 'Canada', SN: 'Senegal', CI: 'Côte d’Ivoire', MA: 'Morocco',
    },
    createdOn: (date: string) => `Created on ${date}`,
    noMembers: 'No members',
    open: 'Open',
    edit: 'Edit',
    delete: 'Delete',
    success: 'Done',
    created: 'Budget created!',
    error: 'Error',
    createFailed: 'Couldn’t create the budget',
    updated: 'Budget updated',
    saved: 'Your changes have been saved.',
    updateFailed: 'Couldn’t update the budget',
    deleted: 'Budget deleted',
    deleteFailed: 'Couldn’t delete the budget',
    defaultName: 'My budget',
    hello: (name?: string) => (name ? `Hi, ${name} 👋` : 'Hi there 👋'),
    count: (n: number) => (n === 1 ? 'You manage 1 budget' : `You manage ${n} budgets`),
    createFirst: 'Create your first budget to get started',
    newBudget: 'New budget',
    emptyTitle: 'Welcome! Let’s create your first budget',
    emptyText: 'A name, your country, and you’re off: then add your household and your bills in a few minutes.',
    emptyCta: 'Create my budget',
    createTitle: 'New budget',
    createText: 'A budget for your household, your roommates or a project: you can create more later.',
    name: 'Budget name',
    namePlaceholder: 'E.g. Household, Roommates, Wedding 2027…',
    location: 'Location',
    currency: (code: string) => <>Currency: <strong>{code}</strong></>,
    aiTitle: 'Let the AI suggest a breakdown',
    aiText: 'Once it’s created, describe your situation and the AI suggests a fair, sustainable monthly budget.',
    cancel: 'Cancel',
    creating: 'Creating...',
    createWithAI: 'Create + AI',
    create: 'Create budget',
    editTitle: 'Edit budget',
    editText: 'Update your budget’s details.',
    updating: 'Updating...',
    save: 'Save',
    deleteTitle: 'Delete this budget?',
    deleteText: (name = '') => `This can’t be undone. All the data in the budget “${name}” will be permanently deleted.`,
    deleting: 'Deleting...',
  },
});

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
  onDelete: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
}

const BudgetCard = memo(function BudgetCard({ budget, onOpen, onDelete, onEdit }: BudgetCardProps) {
  const t = useT(M);
  const handleOpen = useCallback(() => onOpen(budget.id), [budget.id, onOpen]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(budget);
  }, [budget, onDelete]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(budget);
  }, [budget, onEdit]);

  const members = budget.members.filter(m => m.user).map(m => ({
      name: m.user!.name,
      image: m.user!.avatar,
  }));

  const locationInfo = LOCATION_CONFIGS.find(c => c.code === budget.location) || LOCATION_CONFIGS[0];

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
          
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-0.5 rounded-full border border-secondary/50">
               <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {t.countries[locationInfo.code]}
               </span>
               <span className="opacity-30">|</span>
               <span className="font-medium">{locationInfo.currency}</span>
          </div>

          <p className="text-sm text-muted-foreground">
            {t.createdOn(new Date(budget.created_at).toLocaleDateString(intlLocale()))}
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
          <div className="text-xs text-muted-foreground">{t.noMembers}</div>
        )}
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1 px-2 min-h-[44px]">
            <span className="hidden sm:inline">{t.open}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          {budget.is_owner && (
            <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleEdit} 
                  className="text-muted-foreground hover:text-primary h-10 w-10" 
                  title={t.edit}
                >
                   <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDelete} 
                  className="text-muted-foreground hover:text-destructive h-10 w-10" 
                  title={t.delete}
                >
                   <Trash2 className="h-4 w-4" />
                </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useT(M);
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [params, setParams] = useSearchParams();
  const welcome = params.get('bienvenue') === '1';
  const [newBudgetLocation, setNewBudgetLocation] = useState('FR');
  const [newBudgetCurrency, setNewBudgetCurrency] = useState('EUR');
  const [startWithAI, setStartWithAI] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Edit Modal States
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete States
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================================================
  // LOAD BUDGETS
  // ============================================================================
  const loadBudgets = useCallback(async () => {
    try {
      const response = await budgetAPI.list();
      setBudgets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  // ============================================================================
  // NAVIGATION - Plus de handleOpenBeta, Reality Check est dans BudgetComplete
  // ============================================================================
  const handleOpenBudget = (id: string) => navigate(`/budget/${id}/complete`);

  // ============================================================================
  // HANDLERS CREATION
  // ============================================================================
  const handleCreateLocationChange = (locationCode: string) => {
    setNewBudgetLocation(locationCode);
    const config = LOCATION_CONFIGS.find(c => c.code === locationCode);
    if (config) setNewBudgetCurrency(config.currency);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName.trim()) return;
    setCreating(true);
    try {
      const res = await budgetAPI.create({
        name: newBudgetName.trim(),
        year: new Date().getFullYear(),
        location: newBudgetLocation,
        currency: newBudgetCurrency
      });
      toast({ title: t.success, description: t.created, variant: "default" });
      setShowCreateModal(false);
      setNewBudgetName('');
      setNewBudgetLocation('FR');
      setNewBudgetCurrency('EUR');
      const goAI = startWithAI;
      setStartWithAI(false);
      const newId = (res as any)?.data?.id;
      if (goAI && newId) {
        // Land directly on the AI advisor for the freshly created budget.
        navigate(`/budget/${newId}/complete/ai`);
        return;
      }
      loadBudgets();
    } catch (error: any) {
      toast({ title: t.error, description: error.response?.data?.error || t.createFailed, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // ============================================================================
  // HANDLERS EDITION
  // ============================================================================
  const openEditModal = useCallback((budget: Budget) => {
      setBudgetToEdit(budget);
      setEditName(budget.name);
      setEditLocation(budget.location || 'FR');
      setEditCurrency(budget.currency || 'EUR');
  }, []);

  const closeEditModal = () => {
      setBudgetToEdit(null);
      setEditName('');
  };

  const handleEditLocationChange = (locationCode: string) => {
    setEditLocation(locationCode);
    const config = LOCATION_CONFIGS.find(c => c.code === locationCode);
    if (config) setEditCurrency(config.currency);
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!budgetToEdit || !editName.trim()) return;
      setUpdating(true);
      try {
          await budgetAPI.update(budgetToEdit.id, {
              name: editName.trim(),
              location: editLocation,
              currency: editCurrency
          });
          toast({ title: t.updated, description: t.saved });
          closeEditModal();
          loadBudgets();
      } catch (error: any) {
          toast({ title: t.error, description: t.updateFailed, variant: "destructive" });
      } finally {
          setUpdating(false);
      }
  };

  // ============================================================================
  // HANDLERS SUPPRESSION
  // ============================================================================
  const handleDelete = async () => {
    if (!budgetToDelete) return;
    setDeleting(true);
    try {
      await budgetAPI.delete(budgetToDelete.id);
      toast({ title: t.success, description: t.deleted, variant: "default" });
      setBudgetToDelete(null);
      loadBudgets();
    } catch (error) {
      toast({ title: t.error, description: t.deleteFailed, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  // A newcomer (just confirmed their email) lands on the creation form,
  // pre-filled so one tap creates the first budget.
  useEffect(() => {
    if (!welcome || loading) return;
    if (budgets.length === 0) {
      setNewBudgetName((n) => n || t.defaultName);
      setShowCreateModal(true);
    }
    setParams((p) => {
      const copy = new URLSearchParams(p);
      copy.delete('bienvenue');
      return copy;
    }, { replace: true });
  }, [welcome, loading, budgets.length, setParams, t.defaultName]);

  const openCreate = () => {
    if (budgets.length === 0) setNewBudgetName((n) => n || t.defaultName);
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                {t.hello(user?.name)}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {budgets.length > 0 
                  ? t.count(budgets.length)
                  : t.createFirst}
              </p>
            </div>
            <Button 
              variant="default" 
              onClick={openCreate} 
              className="gap-2 shadow-lg bg-primary hover:bg-primary/90 min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              {t.newBudget}
            </Button>
          </div>
        </div>

        {/* Budget List */}
        {loading ? (
          <BudgetListSkeleton />
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title={t.emptyTitle}
            description={t.emptyText}
            actionLabel={t.emptyCta}
            onAction={openCreate}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onOpen={handleOpenBudget}
                onDelete={() => setBudgetToDelete(budget)}
                onEdit={openEditModal}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* ================================================================== */}
      {/* CREATE MODAL */}
      {/* ================================================================== */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.createTitle}</DialogTitle>
            <DialogDescription>{t.createText}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBudget}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="budget-name">{t.name}</Label>
                <Input 
                  id="budget-name"
                  value={newBudgetName} 
                  onChange={(e) => setNewBudgetName(e.target.value)} 
                  placeholder={t.namePlaceholder}
                  autoFocus 
                  className="min-h-[44px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Localisation</Label>
                <Select value={newBudgetLocation} onValueChange={handleCreateLocationChange}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_CONFIGS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {t.countries[c.code]} ({c.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm border">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{t.currency(newBudgetCurrency)}</span>
              </div>

              <button
                type="button"
                onClick={() => setStartWithAI((v) => !v)}
                aria-pressed={startWithAI}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  startWithAI
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <Sparkles className={`h-5 w-5 mt-0.5 shrink-0 ${startWithAI ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm">
                  <span className="font-medium block">{t.aiTitle}</span>
                  <span className="text-muted-foreground text-xs">
                    {t.aiText}
                  </span>
                </span>
                <span
                  className={`ml-auto mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                    startWithAI ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'
                  }`}
                >
                  {startWithAI && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
                className="min-h-[44px]"
              >
                {t.cancel}
              </Button>
              <Button 
                type="submit" 
                disabled={creating || !newBudgetName.trim()}
                className="min-h-[44px]"
              >
                {creating ? t.creating : startWithAI ? t.createWithAI : t.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* EDIT MODAL */}
      {/* ================================================================== */}
      <Dialog open={!!budgetToEdit} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editTitle}</DialogTitle>
            <DialogDescription>{t.editText}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBudget}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t.name}</Label>
                <Input 
                  id="edit-name"
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="min-h-[44px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Localisation</Label>
                <Select value={editLocation} onValueChange={handleEditLocationChange}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_CONFIGS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {t.countries[c.code]} ({c.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                <DollarSign className="h-4 w-4" />
                <span>{t.currency(editCurrency)}</span>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeEditModal}
                className="min-h-[44px]"
              >
                {t.cancel}
              </Button>
              <Button 
                type="submit" 
                disabled={updating || !editName.trim()}
                className="min-h-[44px]"
              >
                {updating ? t.updating : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* DELETE CONFIRMATION */}
      {/* ================================================================== */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteText(budgetToDelete?.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 min-h-[44px]"
              disabled={deleting}
            >
              {deleting ? t.deleting : t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}