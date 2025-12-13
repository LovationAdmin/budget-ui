import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2, Trash2, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
    budgetId: string;
    onUpdate: () => void;
}

export function BankConnectionManager({ budgetId, onUpdate }: BankManagerProps) {
    const { toast } = useToast();
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const fetchConnections = useCallback(async () => {
        try {
            const res = await api.get(`/budgets/${budgetId}/banking/connections`);
            setConnections(res.data.connections || []);
        } catch (error) {
            console.error("Failed to load connections", error);
        } finally {
            setLoading(false);
        }
    }, [budgetId]);

    useEffect(() => {
        if (budgetId) fetchConnections();
    }, [budgetId, fetchConnections]);

    // --- LOGIC SYNC ---
    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await api.post(`/budgets/${budgetId}/banking/sync`);
            if (res.data.accounts_synced > 0) {
                toast({ title: "Succès", description: `${res.data.accounts_synced} compte(s) synchronisé(s) !`, variant: "success" });
                await fetchConnections();
                onUpdate();
            } else {
                // Si on force manuellement et qu'il n'y a rien
                toast({ title: "Info", description: "Comptes à jour.", variant: "default" });
            }
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de synchroniser les comptes.", variant: "destructive" });
        } finally {
            setSyncing(false);
        }
    };

    // --- LOGIC CONNECT (Listener) ---
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Vérifier l'origine pour la sécurité (optionnel en dev, recommandé en prod)
            if (event.data && event.data.type === 'BRIDGE_CONNECT_SUCCESS') {
                console.log("Bridge Success Signal Received!", event.data);
                
                // Fermer l'état de chargement du bouton
                setConnecting(false);

                toast({ 
                    title: "Connexion établie", 
                    description: "Récupération de vos comptes en cours...", 
                    variant: "default" 
                });

                // Attendre 2 secondes que Bridge indexe les données côté serveur, puis lancer la sync
                setTimeout(() => {
                    handleSync();
                }, 2000);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await api.post('/banking/bridge/connect');
            
            // Calculer la position pour centrer le popup
            const width = 500;
            const height = 800;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            window.open(
                res.data.redirect_url,
                'Bridge Connect',
                `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
            );
            
            // Note: On ne met plus de setInterval ici, c'est le "message" listener qui gère la suite.
        } catch (error: any) {
            toast({ title: "Erreur", description: "Impossible de lancer la connexion.", variant: "destructive" });
            setConnecting(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.post('/banking/bridge/refresh');
            await fetchConnections();
            onUpdate();
            toast({ title: "Succès", description: "Soldes mis à jour !", variant: "default" });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de rafraîchir les soldes.", variant: "destructive" });
        } finally {
            setRefreshing(false);
        }
    };

    const togglePoolStatus = async (accountId: string, currentStatus: boolean) => {
        // Optimistic UI
        setConnections(prev => prev.map(c => ({
            ...c,
            accounts: c.accounts?.map(a => a.id === accountId ? { ...a, is_savings_pool: !currentStatus } : a)
        })));
        
        try {
            await api.put(`/banking/accounts/${accountId}`, { is_savings_pool: !currentStatus });
            onUpdate(); // Refresh global balance
        } catch (error) {
            toast({ title: "Erreur", description: "Mise à jour échouée.", variant: "destructive" });
            fetchConnections(); // Revert
        }
    };

    const deleteConnection = async (id: string) => {
        if (!confirm("Supprimer cette connexion ?")) return;
        try {
            await api.delete(`/banking/connections/${id}`);
            setConnections(prev => prev.filter(c => c.id !== id));
            onUpdate();
            toast({ title: "Supprimé", description: "Connexion retirée.", variant: "default" });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2 text-sm text-muted-foreground">Chargement...</p></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><Building2 className="h-5 w-5 text-primary" /></div>
                    <div><h3 className="font-semibold text-foreground">Mes Banques</h3><p className="text-xs text-muted-foreground">Connectez vos comptes via Bridge</p></div>
                </div>
                <div className="flex gap-2">
                    {connections.length > 0 && (
                        <>
                            <Button onClick={() => handleSync()} disabled={syncing} variant="outline" size="sm" className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} /> Sync
                            </Button>
                            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Rafraîchir
                            </Button>
                        </>
                    )}
                    <Button onClick={handleConnect} disabled={connecting} variant="default" size="sm" className="gap-2 shadow-md">
                        {connecting ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion...</> : <><Plus className="h-4 w-4" /> Ajouter une banque</>}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {connections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground font-medium">Aucune connexion</p>
                        <p className="text-sm text-muted-foreground mt-1">Ajoutez une banque pour commencer le Reality Check</p>
                    </div>
                ) : (
                    connections.map((conn) => (
                        <div key={conn.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <div><h4 className="font-semibold text-sm">{conn.institution_name}</h4><p className="text-xs text-muted-foreground">Connecté le {new Date(conn.created_at).toLocaleDateString()}</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={conn.status === 'active' ? 'default' : 'secondary'}>{conn.status === 'active' ? 'Actif' : 'Inactif'}</Badge>
                                    <Button variant="ghost" size="sm" onClick={() => deleteConnection(conn.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="divide-y">
                                {conn.accounts && conn.accounts.length > 0 ? (
                                    conn.accounts.map((account) => (
                                        <div key={account.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2"><span className="font-medium text-sm">{account.name}</span><span className="text-xs text-muted-foreground">••• {account.mask}</span></div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-lg font-semibold">{account.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {account.currency}</span>
                                                        <Badge variant={account.is_savings_pool ? "default" : "secondary"} className="text-xs">{account.is_savings_pool ? "✓ Épargne" : "Courant"}</Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right text-xs text-muted-foreground hidden sm:block"><span className="block">{account.is_savings_pool ? "Compte Épargne" : "Compte Courant"}</span></div>
                                                    <Switch checked={account.is_savings_pool} onCheckedChange={() => togglePoolStatus(account.id, account.is_savings_pool)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Aucun compte visible - Cliquez sur "Sync"</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}