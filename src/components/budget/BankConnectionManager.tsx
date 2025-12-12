import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess } from 'react-plaid-link';
import api from '@/services/api'; // Ensure this points to your configured axios instance
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Building2, AlertCircle, RefreshCw } from "lucide-react";
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
    onUpdate: () => void; // Callback to refresh the parent page (Reality Check)
}

export function BankConnectionManager({ onUpdate }: BankManagerProps) {
    const { toast } = useToast();
    const [token, setToken] = useState<string | null>(null);
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // 1. Fetch existing connections on mount
    const fetchConnections = async () => {
        try {
            const res = await api.get('/banking/connections');
            setConnections(res.data.connections || []);
        } catch (error) {
            console.error("Failed to load connections", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    // 2. Generate Link Token (Required to initialize Plaid)
    const generateToken = useCallback(async () => {
        try {
            const res = await api.post('/banking/plaid/link-token');
            setToken(res.data.link_token);
        } catch (error) {
            console.error("Failed to create link token", error);
            toast({ title: "Erreur", description: "Impossible d'initialiser la connexion bancaire.", variant: "destructive" });
        }
    }, [toast]);

    useEffect(() => {
        // Generate token immediately so the button is ready
        generateToken();
    }, [generateToken]);

    // 3. Handle Plaid Success
    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
        setProcessing(true);
        try {
            await api.post('/banking/plaid/exchange', {
                public_token: publicToken,
                institution_id: metadata.institution?.institution_id,
                institution_name: metadata.institution?.name
            });
            
            toast({ title: "Succès", description: "Banque connectée avec succès !", variant: "success" });
            await fetchConnections(); // Refresh list
            onUpdate(); // Tell parent to refresh "Reality Check" total
        } catch (error) {
            console.error("Exchange failed", error);
            toast({ title: "Erreur", description: "Échec de la liaison avec la banque.", variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    }, [onUpdate, toast]);

    // 4. Plaid Hook Configuration
    const config = {
        token,
        onSuccess,
    };
    const { open, ready } = usePlaidLink(config);

    // 5. Toggle "Savings Pool" status
    const togglePoolStatus = async (accountId: string, currentStatus: boolean) => {
        // Optimistic UI update
        setConnections(prev => prev.map(c => ({
            ...c,
            accounts: c.accounts?.map(a => a.id === accountId ? { ...a, is_savings_pool: !currentStatus } : a)
        })));

        try {
            await api.put(`/banking/accounts/${accountId}`, { is_savings_pool: !currentStatus });
            onUpdate(); // Refresh the global total calculation
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de mettre à jour le compte.", variant: "destructive" });
            fetchConnections(); // Revert on error
        }
    };

    // 6. Delete Connection
    const deleteConnection = async (id: string) => {
        if(!confirm("Supprimer cette connexion et tous les comptes associés ?")) return;
        try {
            await api.delete(`/banking/connections/${id}`);
            setConnections(prev => prev.filter(c => c.id !== id));
            onUpdate();
            toast({ title: "Supprimé", variant: "default" });
        } catch (error) {
            toast({ title: "Erreur", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;

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
                        <p className="text-xs text-muted-foreground">Connectez vos comptes pour le Reality Check</p>
                    </div>
                </div>
                <Button 
                    onClick={() => open()} 
                    disabled={!ready || processing}
                    variant="default"
                    className="w-full sm:w-auto shadow-md"
                >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Ajouter une banque
                </Button>
            </div>

            {/* Connections List */}
            <div className="space-y-4">
                {connections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-xl">
                        Aucune banque connectée.
                    </div>
                ) : (
                    connections.map((conn) => (
                        <div key={conn.id} className="border rounded-xl overflow-hidden bg-card shadow-sm">
                            {/* Bank Header */}
                            <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                                <span className="font-semibold text-sm flex items-center gap-2">
                                    {conn.institution_name}
                                    <Badge variant="outline" className="text-[10px] h-5 bg-green-50 text-green-700 border-green-200">Connecté</Badge>
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => deleteConnection(conn.id)}
                                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                >
                                    Déconnecter
                                </Button>
                            </div>

                            {/* Accounts List */}
                            <div className="divide-y">
                                {conn.accounts?.map((account) => (
                                    <div key={account.id} className="p-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{account.name} <span className="text-muted-foreground text-xs">••••{account.mask}</span></span>
                                            <span className="text-xs font-mono text-muted-foreground mt-0.5">
                                                {account.balance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency })}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-2 hidden sm:block">
                                                <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Compte Épargne ?</span>
                                                <span className="text-[10px] text-muted-foreground/70">
                                                    {account.is_savings_pool ? "Inclus dans Reality Check" : "Ignoré (Compte Courant)"}
                                                </span>
                                            </div>
                                            <Switch 
                                                checked={account.is_savings_pool}
                                                onCheckedChange={() => togglePoolStatus(account.id, account.is_savings_pool)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}