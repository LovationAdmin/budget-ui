import { useState } from 'react';
import { budgetAPI } from '../../services/api';

export default function MemberManagementSection({ budget, currentUserId, onMemberChange }) {
  const [removingId, setRemovingId] = useState(null);

  if (!budget || !budget.members) {
    return null;
  }
  
  const isOwner = budget.is_owner;
  const members = budget.members;
  const budgetId = budget.id;

  const handleRemoveMember = async (member) => {
    const memberUserId = member.user.id;
    const isSelf = memberUserId === currentUserId;

    if (member.role === 'owner' && !isSelf) {
        alert('Impossible de retirer le propriétaire du budget.');
        return;
    }
    
    // Safety checks
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
            // Si l'utilisateur se retire lui-même, rediriger vers le tableau de bord
            alert('Vous avez quitté le budget. Redirection...');
            window.location.href = '/'; 
        } else {
            alert(`${member.user.name} a été retiré.`);
            onMemberChange(); // Recharger les données du budget pour mettre à jour la liste
        }

    } catch (err) {
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
            // Safety check for user data
            if (!member.user || !member.id) return null; 
            
            const isSelf = member.user.id === currentUserId;
            const isOwnerRole = member.role === 'owner';
            // Only the owner can remove others. Anyone can remove themselves unless they are the owner.
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
                            disabled={removingId === member.user.id || (isOwnerRole && isOwner)}
                            className={`p-2 rounded-lg text-sm font-medium transition ${
                                isOwnerRole && isOwner
                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                            }`}
                            title={isOwnerRole ? 'Le propriétaire ne peut pas être retiré' : (isSelf ? 'Quitter le budget' : 'Retirer le membre')}
                        >
                            {isOwnerRole ? '👑' : (removingId === member.user.id ? '⏳' : (isSelf ? '🚪 Quitter' : '❌ Retirer'))}
                        </button>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
}