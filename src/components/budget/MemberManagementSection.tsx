import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, Mail, Trash2, Crown, Loader2 } from "lucide-react";
import { budgetAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast'; // Import Toast
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

interface BudgetMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  role: 'owner' | 'member';
}

interface Invitation {
  id: string;
  email: string;
  status: 'pending';
  created_at: string;
}

interface BudgetData {
  id: string;
  name: string;
  is_owner: boolean;
  members: BudgetMember[];
}

interface MemberManagementSectionProps {
  budget: BudgetData;
  currentUserId: string;
  onMemberChange: () => void;
}

export default function MemberManagementSection({
  budget,
  currentUserId,
  onMemberChange,
}: MemberManagementSectionProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<BudgetMember | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<Invitation | null>(null);
  
  const { toast } = useToast();

  const loadInvitations = async () => {
    if (!budget.is_owner) return;
    setLoading(true);
    try {
      const response = await budgetAPI.getInvitations(budget.id);
      setInvitations(response.data.filter((inv: Invitation) => inv.status === 'pending'));
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    if (budget.is_owner) {
      loadInvitations();
    }
  });

  const handleRemoveMember = async () => {
    if (!memberToRemove || !memberToRemove.user) return;
    try {
      await budgetAPI.removeMember(budget.id, memberToRemove.id);
      setMemberToRemove(null);
      onMemberChange();
      
      toast({
        title: "Membre retiré",
        description: `${memberToRemove.user.name} a été retiré du budget.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le membre.",
        variant: "destructive",
      });
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;
    try {
      await budgetAPI.cancelInvitation(budget.id, invitationToCancel.id);
      setInvitationToCancel(null);
      loadInvitations();
      
      toast({
        title: "Invitation annulée",
        description: "L'invitation a été annulée avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'invitation.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="glass-card mb-6 animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">Membres du Budget</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {budget.members.filter(m => m.user).length} membre{budget.members.filter(m => m.user).length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Members — ONLY valid users */}
          <div className="space-y-2">
            {budget.members
              .filter(member => member.user)
              .map((member) => {
                const user = member.user!;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all"
                  >
                    <MemberAvatar name={user.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.name}
                        {user.id === currentUserId && (
                          <span className="text-xs text-muted-foreground ml-2">(vous)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role === 'owner' ? (
                        <Badge variant="default" className="gap-1">
                          <Crown className="h-3 w-3" />
                          Propriétaire
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <UserPlus className="h-3 w-3" />
                          Membre
                        </Badge>
                      )}
                      {budget.is_owner && user.id !== currentUserId && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setMemberToRemove(member)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pending Invitations */}
          {budget.is_owner && invitations.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Invitations en attente ({invitations.length})
              </p>
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/50 bg-muted/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Envoyée le {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-warning">En attente</Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setInvitationToCancel(invitation)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer <strong>{memberToRemove?.user?.name}</strong> de ce budget ?
              Cette personne perdra l'accès à toutes les données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive hover:bg-destructive/90">
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Dialog */}
      <AlertDialog open={!!invitationToCancel} onOpenChange={() => setInvitationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette invitation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler l'invitation envoyée à <strong>{invitationToCancel?.email}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvitation}>
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}