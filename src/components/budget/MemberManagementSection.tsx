import { useState } from 'react';
// @ts-ignore
import { budgetAPI } from '../../services/api';
import React from 'react';

interface MemberUser {
    id: string;
    name: string;
    email: string;
}

interface Member {
    id: string;
    user: MemberUser;
    role: 'owner' | 'member';
}

interface Budget {
    id: string;
    name: string;
    is_owner: boolean;
    members: Member[];
}

interface MemberManagementSectionProps {
    budget: Budget;
    currentUserId: string;
    onMemberChange: () => void;
}

export default function MemberManagementSection({ budget, currentUserId, onMemberChange }: MemberManagementSectionProps): JSX.Element | null {
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!budget || !budget.members) {
    return null;
  }
  
  const isOwner = budget.is_owner;
  const members = budget.members;
  const budgetId = budget.id;

  const handleRemoveMember = async (member: Member) => {
    const memberUserId = member.user.id;
    const isSelf = memberUserId === currentUserId;

    if (member.role === 'owner' && !isSelf) {
        alert('Impossible de retirer le propriétaire du budget.');
        return;
    }
    
    // Checks de confirmation
    if (isSelf) {
        if (!confirm(`Voulez-vous vraiment quitter le budget "${budget.name}"?`)) {
            return;
        }
    } else {
        if (!isOwner) return; 
        if (!confirm(`Voulez-vous vraiment retirer ${member.user.name} de ce budget?`)) {
            return;
        }
    }

    setRemovingId(memberUserId);
    try {
        await budgetAPI.removeMember(budgetId, memberUserId);
        
        if (isSelf) {
            // Redirection après le retrait
            alert('Vous avez quitté le budget. Redirection...');
            window.location.href = '/'; 
        } else {
            alert(`${member.user.name} a été retiré.`);
            onMemberChange(); // Recharger les données pour mettre à jour la liste
        }

    } catch (err: any) {
        console.error("Error removing member:", err);
        alert(err.response?.data?.error || 'Erreur lors de la suppression du membre');
    } finally {
        setRemovingId(null);
    }
  };

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">👥</span>
        Membres du Budget ({members.length})
      </h2>
      
      <div className="space-y-2">
        {members.map((member) => {
            if (!member.user || !member.id) return null; 
            
            const isSelf = member.user.id === currentUserId;
            const isOwnerRole = member.role === 'owner';
            const canRemove = (isOwner && !isOwnerRole) || isSelf; 

            return (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className='flex items-center gap-3'>
                        <div>
                            <p className="font-medium text-gray-900">{member.user.name} {isSelf && '(Moi)'}</p>
                            <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isOwnerRole 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                            {isOwnerRole ? 'Propriétaire' : 'Membre'}
                        </span>
                    </div>
                    
                    {canRemove && (
                        <button
                            onClick={() => handleRemoveMember(member)}
                            disabled={removingId === member.user.id || (isOwnerRole && isOwner && !isSelf)}
                            className={`p-2 rounded-lg text-sm font-medium transition ${
                                isOwnerRole && isOwner && !isSelf
                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                            }`}
                            title={isOwnerRole && !isSelf ? 'Le propriétaire ne peut pas être retiré' : (isSelf ? 'Quitter le budget' : 'Retirer le membre')}
                        >
                            {isOwnerRole && !isSelf ? '👑' : (removingId === member.user.id ? '⏳' : (isSelf ? '🚪 Quitter' : '❌ Retirer'))}
                        </button>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
}