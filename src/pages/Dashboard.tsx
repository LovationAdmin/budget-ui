import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { EmptyState } from '@/components/budget/EmptyState';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, Plus, ArrowRight } from "lucide-react";
import { budgetAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast'; // Import Toast
import { QuickActions } from '../components/budget/QuickActions';
import { MemberAvatarGroup } from '../components/budget/MemberAvatar';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const loadBudgets = async () => {
    try {
      const response = await budgetAPI.list();
      setBudgets(response.data);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les budgets.",
        variant: "destructive",
      });
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
      const response = await budgetAPI.create({ name: newBudgetName });
      setShowCreateModal(false);
      setNewBudgetName('');
      
      toast({
        title: "Budget créé",
        description: `Le budget "${newBudgetName}" a été créé avec succès.`,
        variant: "success",
      });

      navigate(`/budget/${response.data.id}/complete`);
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du budget.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-surface">
        <BudgetNavbar currentSection="dashboard" budgetTitle="Chargement..." />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-surface">
      <BudgetNavbar
        budgetTitle="Mes Budgets"
        currentSection="dashboard"
      />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome section */}
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
            <QuickActions 
              onAddMember={() => setShowCreateModal(true)}
            />
          </div>
        </div>

        {budgets.length === 0 ? (
          /* Empty state */
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Vos budgets
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Nouveau
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  onClick={() => navigate(`/budget/${budget.id}/complete`)}
                  className="glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">
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

                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate(`/budget/${budget.id}/complete`);
                    }}
                  >
                    Ouvrir le budget
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating action button - Mobile */}
      <Button
        variant="gradient"
        size="icon-lg"
        className="fixed bottom-6 right-6 rounded-full shadow-floating lg:hidden"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Budget Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau budget</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre budget pour commencer à gérer vos finances.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBudget}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du budget</Label>
                <Input
                  id="name"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  placeholder="Budget Famille 2025"
                  autoFocus
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="gradient" disabled={creating || !newBudgetName.trim()}>
                {creating ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}