import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Institution {
    id: string;
    name: string;
    logo: string;
}

interface BankManagerProps {
    onUpdate: () => void;
}

export function GoCardlessBankManager({ onUpdate }: BankManagerProps) {
    const { toast } = useToast();
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Charger les banques françaises
    useEffect(() => {
        const loadInstitutions = async () => {
            setLoading(true);
            try {
                const res = await api.get('/banking/gocardless/institutions?country=FR');
                setInstitutions(res.data.institutions || []);
            } catch (error) {
                toast({ 
                    title: "Erreur", 
                    description: "Impossible de charger les banques.", 
                    variant: "destructive" 
                });
            } finally {
                setLoading(false);
            }
        };

        loadInstitutions();
    }, [toast]);

    const handleConnect = async (institutionId: string) => {
        try {
            const res = await api.post('/banking/gocardless/connect', {
                institution_id: institutionId
            });

            // Rediriger vers la page d'auth de la banque
            window.location.href = res.data.auth_link;
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de se connecter à la banque.", 
                variant: "destructive" 
            });
        }
    };

    const filteredBanks = institutions.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Chargement des banques...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="font-semibold">Connecter une banque</h3>
                    <p className="text-xs text-muted-foreground">
                        Connexion sécurisée via GoCardless (PSD2)
                    </p>
                </div>
            </div>

            {/* Barre de recherche */}
            <input
                type="text"
                placeholder="Rechercher une banque..."
                className="w-full px-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Liste des banques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredBanks.map((bank) => (
                    <button
                        key={bank.id}
                        onClick={() => handleConnect(bank.id)}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition text-left"
                    >
                        {bank.logo && (
                            <img 
                                src={bank.logo} 
                                alt={bank.name} 
                                className="w-10 h-10 object-contain"
                            />
                        )}
                        <span className="font-medium text-sm">{bank.name}</span>
                    </button>
                ))}
            </div>

            {filteredBanks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    Aucune banque trouvée
                </p>
            )}
        </div>
    );
}