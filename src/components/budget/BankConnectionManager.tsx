import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2, Trash2, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Types matching your backend models
interface BankAccount {
    id: string;
    name: string;
    mask: string;
    balance: number;
    currency: string;
    is_savings_pool: boolean;
}

interface BankConnection {
    id: string;
    institution_name: string;
    status: string;
    created_at: string;
    accounts?: BankAccount[];
}

interface BankManagerProps {
    onUpdate: () => void;
}

export function BankConnectionManager({ onUpdate }: BankManagerProps) {
    const { toast } = useToast();
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 1. Fetch existing connections on mount
    const fetchConnections = async () => {
        try {
            const res = await api.get('/banking/connections');
            setConnections(res.data.connections || []);
        } catch (error) {
            console.error("Failed to load connections", error);
            toast({ 
                title: "Erreur", 
                description: "Impossible de charger les connexions.", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    // 2. Connect to Bridge
    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await api.post('/banking/bridge/connect');
            
            // Bridge renvoie une URL de redirection vers leur interface
            window.location.href = res.data.redirect_url;
        } catch (error) {
            console.error("Failed to create connection", error);
            toast({ 
                title: "Erreur", 
                description: "Impossible de se connecter à Bridge.", 
                variant: "destructive" 
            });
            setConnecting(false);
        }
    };

    // 3. Refresh balances
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.post('/banking/bridge/refresh');
            await fetchConnections();
            onUpdate();
            toast({ 
                title: "Succès", 
                description: "Soldes mis à jour !", 
                variant: "default" 
            });
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de rafraîchir les soldes.", 
                variant: "destructive" 
            });
        } finally {
            setRefreshing(false);
        }
    };

    // 4. Toggle "Savings Pool" status
    const togglePoolStatus = async (accountId: string, currentStatus: boolean) => {
        // Optimistic UI update
        setConnections(prev => prev.map(c => ({
            ...c,
            accounts: c.accounts?.map(a => 
                a.id === accountId ? { ...a, is_savings_pool: !currentStatus } : a
            )
        })));

        try {
            await api.put(`/banking/accounts/${accountId}`, { is_savings_pool: !currentStatus });
            onUpdate();
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de mettre à jour le compte.", 
                variant: "destructive" 
            });
            fetchConnections(); // Revert on error
        }
    };

    // 5. Delete Connection
    const deleteConnection = async (id: string) => {
        if (!confirm("Supprimer cette connexion et tous les comptes associés ?")) return;
        
        try {
            await api.delete(`/banking/connections/${id}`);
            setConnections(prev => prev.filter(c => c.id !== id));
            onUpdate();
            toast({ 
                title: "Supprimé", 
                description: "Connexion supprimée avec succès.", 
                variant: "default" 
            });
        } catch (error) {
            toast({ 
                title: "Erreur", 
                description: "Impossible de supprimer la connexion.", 
                variant: "destructive" 
            });
        }
    };

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
            {/* Header / Add Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Mes Banques</h3>
                        <p className="text-xs text-muted-foreground">
                            Connectez vos comptes via Bridge (270+ banques)
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {connections.length > 0 && (
                        <Button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Rafraîchir
                        </Button>
                    )}
                    
                    <Button 
                        onClick={handleConnect}
                        disabled={connecting}
                        variant="default"
                        size="sm"
                        className="gap-2 shadow-md"
                    >
                        {connecting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Connexion...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Ajouter une banque
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Existing Connections */}
            <div className="space-y-4">
                {connections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground font-medium">Aucune connexion bancaire</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Cliquez sur "Ajouter une banque" pour commencer
                        </p>
                    </div>
                ) : (
                    connections.map((conn) => (
                        <div key={conn.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            {/* Connection Header */}
                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <div>
                                        <h4 className="font-semibold text-sm">{conn.institution_name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Connecté le {new Date(conn.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={conn.status === 'active' ? 'default' : 'secondary'}>
                                        {conn.status === 'active' ? 'Actif' : 'Inactif'}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteConnection(conn.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Accounts List */}
                            <div className="divide-y">
                                {conn.accounts && conn.accounts.length > 0 ? (
                                    conn.accounts.map((account) => (
                                        <div 
                                            key={account.id} 
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{account.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ••• {account.mask}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-lg font-semibold">
                                                            {account.balance.toLocaleString('fr-FR', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })} {account.currency}
                                                        </span>
                                                        <Badge 
                                                            variant={account.is_savings_pool ? "default" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {account.is_savings_pool ? "✓ Épargne" : "Courant"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right text-xs text-muted-foreground hidden sm:block">
                                                        <span className="block">
                                                            {account.is_savings_pool 
                                                                ? "Inclus dans Reality Check" 
                                                                : "Ignoré (Compte Courant)"}
                                                        </span>
                                                    </div>
                                                    <Switch
                                                        checked={account.is_savings_pool}
                                                        onCheckedChange={() => togglePoolStatus(account.id, account.is_savings_pool)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Aucun compte trouvé
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Footer */}
            {connections.length > 0 && (
                <div className="text-xs text-muted-foreground text-center p-4 bg-gray-50 rounded-lg">
                    <p>
                        💡 <strong>Astuce :</strong> Activez le switch "Épargne" uniquement pour vos comptes d'épargne 
                        (Livret A, LDD, PEL, etc.) pour un Reality Check précis.
                    </p>
                </div>
            )}
        </div>
    );
}