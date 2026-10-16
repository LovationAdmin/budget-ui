// src/components/InviteModal.tsx
// Invite someone to a budget by email (owner only, from the Household tab).
// The person gets a link by email; until they accept, the invitation shows in
// « Invitations en attente » (MemberManagementSection), where it can be cancelled.
import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { invitationAPI } from '../services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    failed: 'Impossible d’envoyer l’invitation. Réessayez dans un instant.',
    title: 'Inviter un membre',
    text: 'La personne reçoit un lien par e-mail pour rejoindre ce budget : conjoint(e), famille, colocataires…',
    email: 'Adresse e-mail',
    placeholder: 'prenom@exemple.com',
    sent: (email: string) => `Invitation envoyée à ${email}.`,
    cancel: 'Annuler',
    sending: 'Envoi…',
    send: 'Envoyer l’invitation',
  },
  en: {
    failed: 'Couldn’t send the invitation. Try again in a moment.',
    title: 'Invite a member',
    text: 'They get a link by email to join this budget: a partner, family, roommates…',
    email: 'Email address',
    placeholder: 'name@example.com',
    sent: (email: string) => `Invitation sent to ${email}.`,
    cancel: 'Cancel',
    sending: 'Sending…',
    send: 'Send the invitation',
  },
});

interface InviteModalProps {
  budgetId: string;
  onClose: () => void;
  onInvited?: () => void;
}

export default function InviteModal({ budgetId, onClose, onInvited }: InviteModalProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const t = useT(M);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const to = email.trim();
      await invitationAPI.invite(budgetId, to);
      setSentTo(to);
      setTimeout(() => {
        onInvited?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { error?: string } } }).response;
      setError(response?.data?.error || t.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !loading) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.text}</DialogDescription>
        </DialogHeader>

        {sentTo ? (
          <p role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            {t.sent(sentTo)}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">{t.email}</Label>
              <Input
                id="invite-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? 'invite-error' : undefined}
                className="h-11"
              />
              {error && <p id="invite-error" role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="min-h-[44px]">
                {t.cancel}
              </Button>
              <Button type="submit" disabled={loading} className="min-h-[44px]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {loading ? t.sending : t.send}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
