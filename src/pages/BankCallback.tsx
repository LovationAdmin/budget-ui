// src/pages/BankCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function BankCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const handleCallback = async () => {
            const itemId = searchParams.get('item_id');
            
            if (!itemId) {
                toast({ 
                    title: "Erreur", 
                    description: "Connexion incomplète", 
                    variant: "destructive" 
                });
                navigate('/budgets');
                return;
            }

            try {
                await api.get(`/banking/bridge/callback?item_id=${itemId}`);
                
                toast({ 
                    title: "Succès !", 
                    description: "Banque connectée avec succès", 
                    variant: "success" 
                });
                
                navigate('/budgets');
            } catch (error) {
                toast({ 
                    title: "Erreur", 
                    description: "Échec de la connexion", 
                    variant: "destructive" 
                });
                navigate('/budgets');
            }
        };

        handleCallback();
    }, [searchParams, navigate, toast]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-lg font-medium">Finalisation de la connexion...</p>
            </div>
        </div>
    );
}