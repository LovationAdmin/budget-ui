import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { EmptyState } from '@/components/budget/EmptyState';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, Plus, ArrowRight, Trash2, Loader2, FlaskConical } from "lucide-react";
import { budgetAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MemberAvatarGroup } from '../components/budget/MemberAvatar';
import { Button } from '../components/ui/button';
import { Footer } from '@/components/Footer';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Budget {
  id: string;
  name: string;
  created_at: string;
  is_owner: boolean;
  members: Array<{
    user: {
      name: string;
      avatar?: string;
    } | null;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBudgets = async () => {
    try {
      const response = await budgetAPI.list();
      // FIX: Ensure we always set an array, even if API returns null
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
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName.trim()) return;

    setCreating(true);
    try {
      const response = await budgetAPI.create({ name: newBudgetName.trim() });
      toast({
        title: "Succès",
        description: "Budget créé avec succès !",
        variant: "success"
      });
      setShowCreateModal(false);
      setNewBudgetName('');
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
  };

  const confirmDelete = (budget: Budget) => {
    setBudgetToDelete(budget);
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;

    setDeleting(true);
    try {
      await budgetAPI.delete(budgetToDelete.id);
      toast({
        title: "Succès",
        description: "Budget supprimé",
        variant: "success"
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <BudgetNavbar 
        budgetTitle="Budget Famille"
        userName={user?.name || 'Utilisateur'}
        userAvatar={user?.avatar}
        items={[]}
        onSectionChange={(section) => {
          if (section === 'profile') {
            navigate('/profile');
          }
        }}
      />
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
                variant="gradient"
                onClick={() => setShowCreateModal(true)}
                className="gap-2 shadow-lg"
            >
                <Plus className="h-4 w-4" />
                Nouveau Budget
            </Button>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-12">
            <EmptyState
              icon={PiggyBank}
              title="Aucun budget créé"
              description="Commencez à gérer vos finances en créant votre premier budget familial"
              actionLabel="Créer mon premier budget"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        ) : (
          <section className="animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated relative group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {budget.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Créé le {new Date(budget.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {budget.is_owner ? (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                        👑 Propriétaire
                      </span>
                    ) : (
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                        👥 Membre
                      </span>
                    )}
                  </div>

                  {budget.members && budget.members.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {budget.members.length} membre(s)
                      </p>
                      <MemberAvatarGroup
                        members={budget.members
                          .filter(m => m.user)
                          .map((m) => ({
                            name: m.user!.name,
                            image: m.user!.avatar,
                          }))}
                        max={4}
                        size="sm"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* Bouton Ouvrir (Budget Normal) */}
                    <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          navigate(`/budget/${budget.id}/complete`);
                        }}
                    >
                        Ouvrir
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    {/* 🧪 NOUVEAU: Bouton Beta 2 (Reality Check) */}
                    <Button
                        variant="outline"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 gap-2"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          navigate(`/beta2/${budget.id}`);
                        }}
                        title="Tester Reality Check (Beta 2)"
                    >
                        <FlaskConical className="h-4 w-4" />
                        Beta
                    </Button>
                    
                    {/* Bouton Supprimer */}
                    {budget.is_owner && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                confirmDelete(budget);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />

      {/* Modal Create Budget */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau budget</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre budget familial
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBudget}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du budget</Label>
                <Input
                  id="name"
                  placeholder="Budget Famille Dupont"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
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

      {/* Alert Dialog Delete */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le budget "{budgetToDelete?.name}" et toutes ses données seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
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