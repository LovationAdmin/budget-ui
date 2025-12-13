import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function BankCallback() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        // 1. Analyse de l'URL
        const params = new URLSearchParams(window.location.search);
        
        // Bridge renvoie "item_id" en cas de succès, ou "error_code" en cas d'échec
        const itemId = params.get('item_id');
        const errorCode = params.get('error_code');

        if (itemId) {
            setStatus('success');
            // 2. Communication avec la fenêtre principale
            if (window.opener) {
                window.opener.postMessage(
                    { 
                        type: 'BRIDGE_CONNECT_SUCCESS', 
                        itemId: itemId,
                        success: true
                    }, 
                    window.location.origin
                );
            }
            
            // 3. Fermeture automatique
            setTimeout(() => {
                window.close();
            }, 2000);
        } else if (errorCode) {
            setStatus('error');
        } else {
            // Cas où l'utilisateur ferme ou annule, ou URL bizarre
            // On tente quand même de fermer
             setTimeout(() => {
                window.close();
            }, 3000);
        }
    }, []);

    return (
        // AJUSTEMENT VISUEL : "text-sm" force une petite police, "p-6" réduit le padding
        <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50 p-6 text-center font-sans antialiased">
            
            <div className="bg-white p-6 rounded-xl shadow-md max-w-xs w-full border border-gray-100">
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <h2 className="text-base font-semibold text-gray-900">Finalisation...</h2>
                        <p className="text-xs text-gray-500">Nous sécurisons la connexion.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 animate-scale-in">
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Connexion Réussie !</h2>
                            <p className="text-xs text-gray-500 mt-1">Cette fenêtre va se fermer.</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">Échec de connexion</h2>
                        <p className="text-xs text-gray-500">L'opération a été annulée ou a échoué.</p>
                    </div>
                )}

                {/* BOUTON DE SECOURS (Si le script auto fail) */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.close()} 
                        className="w-full text-xs h-8"
                    >
                        Fermer la fenêtre
                    </Button>
                </div>

            </div>
        </div>
    );
}