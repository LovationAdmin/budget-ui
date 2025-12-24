import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Building2, Loader2, RefreshCw, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Bank {
    id: string;
    name: string;
    country: string;
    logo: string;
    sandbox: boolean;
    bic?: string;
    beta: boolean;
}

interface Account {
    id: string;
    name: string;
    mask: string;
    balance: number;
    currency: string;
    is_savings_pool: boolean;
}

interface Connection {
    id: string;
    institution_name: string;
    provider: string;
    accounts?: Account[];
    last_synced?: string;
}

interface EnableBankingManagerProps {
    budgetId: string;
    onUpdate: () => void;
}

export function EnableBankingManager({ budgetId, onUpdate }: EnableBankingManagerProps) {
    const { toast } = useToast();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [selectedBank, setSelectedBank] = useState<string>("");
    const [showBankList, setShowBankList] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBanks();
        loadConnections();
    }, [budgetId]);

    const loadBanks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/banking/enablebanking/banks?country=FR');
            // Toutes les banques retournées par Enable Banking supportent AIS
            // Pas besoin de filtrer
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

    const loadConnections = async () => {
        try {
            const res = await api.get(`/budgets/${budgetId}/banking/connections`);
            // Filtrer uniquement les connexions Enable Banking
            const enableConnections = res.data.filter((c: Connection) => 
                c.provider === 'enablebanking-managed' || c.provider === 'Enable Banking'
            );
            setConnections(enableConnections);
        } catch (error) {
            console.error('Failed to load connections:', error);
        }
    };

    const handleConnect = async (bankId: string) => {
        setConnecting(true);
        setSelectedBank(bankId);
        try {
            // 1. Créer la demande d'autorisation
            const res = await api.post('/banking/enablebanking/connect', {
                aspsp_id: bankId
            });

            // 2. Ouvrir une popup avec l'URL d'autorisation
            const authWindow = window.open(
                res.data.redirect_url,
                'EnableBankingAuth',
                'width=600,height=700'
            );

            // 3. Écouter le message de callback
            const handleMessage = async (event: MessageEvent) => {
                if (event.data.type === 'ENABLE_BANKING_CALLBACK') {
                    window.removeEventListener('message', handleMessage);
                    authWindow?.close();

                    // 4. Créer la session et synchroniser
                    try {
                        const sessionResp = await api.get('/banking/enablebanking/callback', {
                            params: {
                                code: event.data.code,
                                state: event.data.state
                            }
                        });

                        // 5. Synchroniser les comptes dans le budget
                        await api.post(`/budgets/${budgetId}/banking/enablebanking/sync`, {
                            session_id: sessionResp.data.session_id
                        });

                        toast({
                            title: "Succès",
                            description: "Banque connectée avec succès !",
                            variant: "default"
                        });

                        await loadConnections();
                        onUpdate();
                        setShowBankList(false);
                    } catch (error: any) {
                        toast({
                            title: "Erreur",
                            description: error.response?.data?.error || "Échec de la synchronisation",
                            variant: "destructive"
                        });
                    } finally {
                        setConnecting(false);
                        setSelectedBank("");
                    }
                }
            };

            window.addEventListener('message', handleMessage);

            // Vérifier si la fenêtre est fermée
            const checkWindow = setInterval(() => {
                if (authWindow?.closed) {
                    clearInterval(checkWindow);
                    window.removeEventListener('message', handleMessage);
                    setConnecting(false);
                    setSelectedBank("");
                }
            }, 1000);

        } catch (error: any) {
            toast({ 
                title: "Erreur", 
                description: error.response?.data?.error || "Impossible de se connecter.", 
                variant: "destructive" 
            });
            setConnecting(false);
            setSelectedBank("");
        }
    };

    const handleRefresh = async (connectionId: string) => {
        try {
            await api.post('/banking/enablebanking/refresh', { connection_id: connectionId });
            toast({ 
                title: "Succès", 
                description: "Soldes mis à jour.", 
                variant: "default" 
            });
            await loadConnections();
            onUpdate();
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de rafraîchir les soldes.", 
                variant: "destructive" 
            });
        }
    };

    const handleDelete = async (connectionId: string) => {
        if (!confirm("Supprimer cette connexion ?")) return;
        
        try {
            await api.delete(`/banking/enablebanking/connections/${connectionId}`);
            toast({ 
                title: "Succès", 
                description: "Connexion supprimée.", 
                variant: "default" 
            });
            await loadConnections();
            onUpdate();
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de supprimer la connexion.", 
                variant: "destructive" 
            });
        }
    };

    const togglePoolStatus = async (accountId: string, currentStatus: boolean) => {
        try {
            await api.put(`/banking/accounts/${accountId}`, { 
                is_savings_pool: !currentStatus 
            });
            await loadConnections();
            onUpdate();
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de mettre à jour le compte.", 
                variant: "destructive" 
            });
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
        <div className="space-y-6">
            {/* Header avec bouton d'ajout */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-6 w-6 text-primary" />
                            <div>
                                <CardTitle>Enable Banking</CardTitle>
                                <CardDescription>
                                    2500+ banques européennes • Open Banking PSD2
                                </CardDescription>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setShowBankList(!showBankList)}
                            disabled={connecting}
                        >
                            {showBankList ? "Annuler" : "Ajouter une banque"}
                        </Button>
                    </div>
                </CardHeader>

                {/* Liste de sélection des banques */}
                {showBankList && (
                    <CardContent>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Rechercher une banque..."
                                className="w-full px-4 py-2 border rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {filteredBanks.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">
                                        Aucune banque trouvée
                                    </p>
                                )}
                                {filteredBanks.map(bank => (
                                    <div
                                        key={bank.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => !connecting && handleConnect(bank.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {bank.logo && (
                                                <img 
                                                    src={bank.logo} 
                                                    alt={bank.name}
                                                    className="w-10 h-10 object-contain"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{bank.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {bank.country}
                                                    </Badge>
                                                    {bank.sandbox && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Sandbox
                                                        </Badge>
                                                    )}
                                                    {bank.beta && (
                                                        <Badge variant="secondary" className="text-xs text-orange-600">
                                                            Beta
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {connecting && selectedBank === bank.id && (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Liste des connexions existantes */}
            {connections.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Connexions actives</h3>
                    {connections.map(connection => (
                        <Card key={connection.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">{connection.institution_name}</CardTitle>
                                        {connection.last_synced && (
                                            <CardDescription className="text-xs">
                                                Dernière sync: {new Date(connection.last_synced).toLocaleDateString()}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRefresh(connection.id)}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(connection.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            {connection.accounts && connection.accounts.length > 0 && (
                                <CardContent>
                                    <div className="space-y-2">
                                        {connection.accounts.map(account => (
                                            <div
                                                key={account.id}
                                                className="flex items-center justify-between p-3 bg-accent rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">{account.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        •••• {account.mask}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-semibold">
                                                            {account.balance.toFixed(2)} {account.currency}
                                                        </p>
                                                        <button
                                                            onClick={() => togglePoolStatus(account.id, account.is_savings_pool)}
                                                            className={`text-xs ${
                                                                account.is_savings_pool
                                                                    ? 'text-green-600'
                                                                    : 'text-muted-foreground hover:text-primary'
                                                            }`}
                                                        >
                                                            {account.is_savings_pool ? (
                                                                <span className="flex items-center gap-1">
                                                                    <Check className="h-3 w-3" /> Épargne
                                                                </span>
                                                            ) : (
                                                                "Marquer comme épargne"
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}