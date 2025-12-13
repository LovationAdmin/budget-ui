// src/pages/BankCallback.tsx
import { useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function BankCallback() {
    useEffect(() => {
        // 1. Récupérer l'ID de l'item créé par Bridge depuis l'URL
        const params = new URLSearchParams(window.location.search);
        const itemId = params.get('item_id');
        const success = params.get('success') === 'true' || !!itemId; // Bridge renvoie item_id en cas de succès

        // 2. Envoyer un message à la fenêtre parente (Budget Famille)
        if (window.opener) {
            window.opener.postMessage(
                { 
                    type: 'BRIDGE_CONNECT_SUCCESS', 
                    itemId: itemId,
                    success: success
                }, 
                window.location.origin // Sécurité : on ne parle qu'à notre propre domaine
            );
        }

        // 3. Fermer la popup après une courte pause visuelle
        const timer = setTimeout(() => {
            window.close();
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm w-full animate-scale-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion Réussie !</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Votre banque a été connectée. Cette fenêtre va se fermer automatiquement.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Finalisation...
                </div>
            </div>
        </div>
    );
}