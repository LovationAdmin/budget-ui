// src/pages/Dashboard.tsx
// ✅ VERSION CORRIGÉE - Ajout localisation + devise par budget

import { EmptyState } from '@/components/budget/EmptyState';
import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, Plus, ArrowRight, Trash2, Loader2, FlaskConical, MapPin, DollarSign } from "lucide-react";
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

// ✅ NOUVEAU : Configurations de localisation avec devises
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
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
});

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  
  // ✅ NOUVEAU : États pour localisation et devise
  const [newBudgetLocation, setNewBudgetLocation] = useState('FR');
  const [newBudgetCurrency, setNewBudgetCurrency] = useState('EUR');
  
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
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

  // ✅ CORRIGÉ : Création de budget avec localisation et devise
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
      });
      
      setNewBudgetName('');
      setNewBudgetLocation('FR');
      setNewBudgetCurrency('EUR');
      setShowCreateModal(false);
      
      loadBudgets();
    } catch (error: any) {
      console.error('Error creating budget:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de créer le budget",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  }, [newBudgetName, newBudgetLocation, newBudgetCurrency, loadBudgets, toast]);

  const handleDeleteBudget = useCallback(async () => {
    if (!budgetToDelete) return;

    setDeleting(true);
    try {
      await budgetAPI.delete(budgetToDelete);
      toast({
        title: "Succès",
        description: "Budget supprimé avec succès",
      });
      setBudgetToDelete(null);
      loadBudgets();
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de supprimer le budget",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  }, [budgetToDelete, loadBudgets, toast]);

  // ✅ NOUVEAU : Gestion du changement de localisation
  const handleLocationChange = useCallback((locationCode: string) => {
    setNewBudgetLocation(locationCode);
    const config = LOCATION_CONFIGS.find(c => c.code === locationCode);
    if (config) {
      setNewBudgetCurrency(config.currency);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-secondary-50/30 flex flex-col">
      <Navbar />
      
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                Mes Budgets
              </h1>
              <p className="text-muted-foreground text-lg">
                Gérez tous vos budgets en un seul endroit
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="gap-2 shadow-elevated hover:shadow-floating transition-all"
            >
              <Plus className="h-5 w-5" />
              Nouveau Budget
            </Button>
          </div>
        </div>

        {/* Budgets List */}
        {loading ? (
          <BudgetListSkeleton />
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="Aucun budget pour le moment"
            description="Créez votre premier budget pour commencer à gérer vos finances en famille"
            actionLabel="Créer mon premier budget"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const locationConfig = LOCATION_CONFIGS.find(c => c.code === budget.location);
              
              return (
                <div 
                  key={budget.id}
                  className="group relative rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Delete Button (Owner only) */}
                  {budget.is_owner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBudgetToDelete(budget.id);
                      }}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Supprimer le budget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* Budget Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2 pr-8">
                      {budget.name}
                    </h3>
                    
                    {/* ✅ NOUVEAU : Affichage localisation et devise */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                      {locationConfig && (
                        <>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{locationConfig.name}</span>
                          </div>
                          <span className="text-border">•</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{locationConfig.currency}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Créé le {new Date(budget.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Members & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <MemberAvatarGroup
                      members={budget.members.map(m => ({
                        name: m.user?.name || 'Utilisateur',
                        avatar: m.user?.avatar
                      }))}
                      max={3}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenBudget(budget.id)}
                        variant="default"
                        size="sm"
                        className="gap-1"
                      >
                        Ouvrir
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Beta Badge (si applicable) */}
                  {budget.is_owner && (
                    <div className="absolute -top-2 -right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBeta(budget.id);
                        }}
                        className="flex items-center gap-1 bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-md hover:bg-purple-600 transition"
                        title="Version Beta 2 avec Reality Check"
                      >
                        <FlaskConical className="h-3 w-3" />
                        Beta 2
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      {/* ✅ CORRIGÉ : Modal de création avec localisation et devise */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Créer un nouveau budget</DialogTitle>
            <DialogDescription>
              Définissez le nom, la localisation et la devise de votre budget
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateBudget} className="space-y-6">
            {/* Nom du budget */}
            <div className="space-y-2">
              <Label htmlFor="budget-name">
                Nom du budget <span className="text-destructive">*</span>
              </Label>
              <Input
                id="budget-name"
                value={newBudgetName}
                onChange={(e) => setNewBudgetName(e.target.value)}
                placeholder="Ex: Budget Famille 2026"
                autoFocus
                required
                className="h-12"
              />
            </div>

            {/* ✅ NOUVEAU : Sélection de la localisation */}
            <div className="space-y-2">
              <Label htmlFor="budget-location">
                Localisation <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={newBudgetLocation} 
                onValueChange={handleLocationChange}
              >
                <SelectTrigger id="budget-location" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_CONFIGS.map((config) => (
                    <SelectItem key={config.code} value={config.code}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Utilisée pour les suggestions IA et les analyses de marché
              </p>
            </div>

            {/* ✅ NOUVEAU : Affichage de la devise (automatique selon localisation) */}
            <div className="space-y-2">
              <Label htmlFor="budget-currency">
                Devise
              </Label>
              <div className="flex items-center gap-2 h-12 px-4 rounded-xl border border-input bg-muted">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {LOCATION_CONFIGS.find(c => c.code === newBudgetLocation)?.currency || 'EUR'}
                </span>
                <span className="text-muted-foreground ml-auto">
                  {LOCATION_CONFIGS.find(c => c.code === newBudgetLocation)?.symbol || '€'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Devise automatiquement définie selon la localisation
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={creating || !newBudgetName.trim()}
                className="gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Créer le budget
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!budgetToDelete} 
        onOpenChange={() => setBudgetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce budget ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données de ce budget seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBudget}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
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