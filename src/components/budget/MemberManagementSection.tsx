import { useState, useEffect, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, Mail, Trash2, Loader2, RefreshCw } from "lucide-react";
import { budgetAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
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
import { intlLocale } from '@/lib/budget/format';
import { identify } from '@/lib/budget/overview';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    removedTitle: "Membre retiré",
    removed: (name: string) => `${name} a été retiré.`,
    error: "Erreur",
    removeFailed: "Impossible de retirer le membre.",
    cancelledTitle: "Invitation annulée",
    cancelled: "L'invitation a été supprimée.",
    cancelFailed: "Impossible d'annuler l'invitation.",
    title: "Membres du Budget",
    count: (n: number) => `${n} membre${n !== 1 ? 's' : ''}`,
    refresh: "Actualiser la liste",
    invite: "Inviter un membre",
    you: "(vous)",
    member: "Membre",
    pending: (n: number) => `Invitations en attente (${n})`,
    unknownDate: "Date inconnue",
    sentOn: (date: string) => `Envoyée le ${date}`,
    waiting: "En attente",
    removeTitle: "Retirer ce membre ?",
    removeConfirm: (name: ReactNode): ReactNode => <>Êtes-vous sûr de vouloir retirer {name} ?</>,
    cancel: "Annuler",
    remove: "Retirer",
    cancelTitle: "Annuler cette invitation ?",
    cancelConfirm: (email: ReactNode): ReactNode => <>Cela révoquera le lien envoyé à {email}.</>,
    no: "Non",
    yesCancel: "Oui, annuler",
    personFound: (name: string) => `Dans le foyer : ${name}`,
    personNotFound: "Personne dans le foyer ne porte son prénom",
    personAmbiguous: "Plusieurs personnes du foyer portent ce prénom",
  },
  en: {
    removedTitle: "Member removed",
    removed: (name: string) => `${name} has been removed.`,
    error: "Error",
    removeFailed: "Couldn’t remove the member.",
    cancelledTitle: "Invitation cancelled",
    cancelled: "The invitation has been deleted.",
    cancelFailed: "Couldn’t cancel the invitation.",
    title: "Budget members",
    count: (n: number) => (n === 1 ? '1 member' : `${n} members`),
    refresh: "Refresh the list",
    invite: "Invite a member",
    you: "(you)",
    member: "Member",
    pending: (n: number) => `Pending invitations (${n})`,
    unknownDate: "Unknown date",
    sentOn: (date: string) => `Sent on ${date}`,
    waiting: "Pending",
    removeTitle: "Remove this member?",
    removeConfirm: (name: ReactNode): ReactNode => <>Are you sure you want to remove {name}?</>,
    cancel: "Cancel",
    remove: "Remove",
    cancelTitle: "Cancel this invitation?",
    cancelConfirm: (email: ReactNode): ReactNode => <>This will revoke the link sent to {email}.</>,
    no: "No",
    yesCancel: "Yes, cancel",
    personFound: (name: string) => `In the household: ${name}`,
    personNotFound: "No one in the household has this first name",
    personAmbiguous: "Several people in the household have this first name",
  },
});

interface BudgetMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
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
  /** Opens the invitation dialog (shown to the budget's owner only). */
  onInvite?: () => void;
  /** The household, to say which person each account is (by name, see identify()). */
  people?: Array<{ id: string; name: string }>;
}

export default function MemberManagementSection({
  budget,
  currentUserId,
  onMemberChange,
  onInvite,
  people = [],
}: MemberManagementSectionProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<BudgetMember | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<Invitation | null>(null);
  
  const { toast } = useToast();
  const t = useT(M);

  const memberEmails = new Set(
    budget.members
      .filter(m => m.user?.email)
      .map(m => m.user!.email)
  );

  const validInvitations = invitations.filter(inv => !memberEmails.has(inv.email));

  const loadInvitations = async () => {
    if (!budget.is_owner) return;
    try {
      const response = await budgetAPI.getInvitations(budget.id);
      const pending = response.data.filter((inv: Invitation) => inv.status === 'pending');
      setInvitations(pending);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  useEffect(() => {
    loadInvitations();
    const interval = setInterval(() => {
          loadInvitations();
          onMemberChange(); 
      }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setLoading(true);
    loadInvitations();
    onMemberChange();
    setTimeout(() => setLoading(false), 500);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !memberToRemove.user) return;
    try {
      await budgetAPI.removeMember(budget.id, memberToRemove.id);
      setMemberToRemove(null);
      onMemberChange();
      toast({ title: t.removedTitle, description: t.removed(memberToRemove.user.name), variant: "default" });
    } catch (error) {
      toast({ title: t.error, description: t.removeFailed, variant: "destructive" });
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;
    try {
      await budgetAPI.cancelInvitation(budget.id, invitationToCancel.id);
      setInvitationToCancel(null);
      loadInvitations();
      toast({ title: t.cancelledTitle, description: t.cancelled, variant: "default" });
    } catch (error) {
      toast({ title: t.error, description: t.cancelFailed, variant: "destructive" });
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
                <CardTitle className="font-display">{t.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.count(budget.members.filter(m => m.user).length)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleManualRefresh} title={t.refresh} aria-label={t.refresh} className="h-11 w-11">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {budget.is_owner && onInvite && (
                <Button onClick={onInvite} className="min-h-[44px] gap-2">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.invite}</span>
                  <span className="sr-only sm:hidden">{t.invite}</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {budget.members.filter(member => member.user).map((member) => {
                const user = member.user!;
                // The person whose name this account bears: the one their « Ma vue perso » shows.
                const identity = people.length > 0 ? identify(people, budget.members, user.id, user.name) : undefined;
                const person = identity?.personId ? people.find((p) => p.id === identity.personId) : undefined;
                return (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all">
                    <MemberAvatar name={user.name} image={user.avatar} size="md" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.name} {user.id === currentUserId && <span className="text-xs text-muted-foreground ml-2">{t.you}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      {identity && (
                        <p className="text-xs text-muted-foreground truncate">
                          {person ? t.personFound(person.name) : identity.personId === null && identity.reason === 'ambiguous' ? t.personAmbiguous : t.personNotFound}
                        </p>
                      )}
                    </div>
                    
                    {/* ✅ MODIFICATION : Badge "Membre" seulement pour les non-propriétaires */}
                    <div className="flex items-center gap-2">
                      {member.role !== 'owner' && (
                        <Badge variant="secondary" className="gap-1"><UserPlus className="h-3 w-3" />{t.member}</Badge>
                      )}
                      {budget.is_owner && user.id !== currentUserId && member.role !== 'owner' && (
                        <Button variant="ghost" size="icon-sm" onClick={() => setMemberToRemove(member)} className="text-destructive hover:bg-destructive/10">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {budget.is_owner && validInvitations.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> {t.pending(validInvitations.length)}
              </p>
              {validInvitations.map((invitation) => {
                  let dateDisplay = t.unknownDate;
                  try {
                    const date = new Date(invitation.created_at);
                    if (!isNaN(date.getTime()) && date.getFullYear() > 2000) {
                      dateDisplay = date.toLocaleDateString(intlLocale());
                    }
                  } catch (e) {}

                  return (
                    <div key={invitation.id} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/50 bg-muted/30">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{invitation.email}</p>
                            <p className="text-xs text-muted-foreground">{t.sentOn(dateDisplay)}</p>
                        </div>
                        <Badge variant="outline" className="text-warning">{t.waiting}</Badge>
                        <Button variant="ghost" size="icon-sm" onClick={() => setInvitationToCancel(invitation)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.removeTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.removeConfirm(<strong>{memberToRemove?.user?.name}</strong>)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive hover:bg-destructive/90">{t.remove}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!invitationToCancel} onOpenChange={() => setInvitationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.cancelTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.cancelConfirm(<strong>{invitationToCancel?.email}</strong>)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.no}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvitation}>{t.yesCancel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}