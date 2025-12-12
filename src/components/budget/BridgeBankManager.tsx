import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Bank {
    id: number;
    name: string;
    logo: string;
}

interface BankManagerProps {
    onUpdate: () => void;
}

export function BridgeBankManager({ onUpdate }: BankManagerProps) {
    const { toast } = useToast();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBanks();
    }, []);

    const loadBanks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/banking/bridge/banks');
            setBanks(res.data.banks || []);
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

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await api.post('/banking/bridge/connect');
            
            // Bridge renvoie une URL de redirection
            window.location.href = res.data.redirect_url;
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de se connecter.", 
                variant: "destructive" 
            });
            setConnecting(false);
        }
    };

    const filteredBanks = banks.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                        <h3 className="font-semibold">Connecter une banque</h3>
                        <p className="text-xs text-muted-foreground">
                            Connexion sécurisée via Bridge (270+ banques)
                        </p>
                    </div>
                </div>
                
                <Button 
                    onClick={handleConnect}
                    disabled={connecting}
                    className="shadow-md"
                >
                    {connecting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connexion...
                        </>
                    ) : (
                        '+ Ajouter une banque'
                    )}
                </Button>
            </div>

            {/* Aperçu des banques disponibles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {banks.slice(0, 8).map((bank) => (
                    <div 
                        key={bank.id}
                        className="flex items-center gap-2 p-2 border rounded-lg text-xs"
                    >
                        {bank.logo && (
                            <img 
                                src={bank.logo} 
                                alt={bank.name} 
                                className="w-6 h-6 object-contain"
                            />
                        )}
                        <span className="truncate">{bank.name}</span>
                    </div>
                ))}
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
                Et {banks.length - 8} autres banques disponibles
            </p>
        </div>
    );
}