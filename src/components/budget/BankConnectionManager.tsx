import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

    // 2. Toggle "Savings Pool" status
    const togglePoolStatus = async (accountId: string, currentStatus: boolean) => {
        // Optimistic UI update
        setConnections(prev => prev.map(c => ({
            ...c,
            accounts: c.accounts?.map(a => a.id === accountId ? { ...a, is_savings_pool: !currentStatus } : a)
        })));

        try {
            await api.put(`/banking/accounts/${accountId}`, { is_savings_pool: !currentStatus });
            onUpdate();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de mettre à jour le compte.", variant: "destructive" });
            fetchConnections(); // Revert on error
        }
    };

    // 3. Delete Connection
    const deleteConnection = async (id: string) => {
        if (!confirm("Supprimer cette connexion et tous les comptes associés ?")) return;
        try {
            await api.delete(`/banking/connections/${id}`);
            setConnections(prev => prev.filter(c => c.id !== id));
            onUpdate();
            toast({ title: "Supprimé", variant: "default" });
        } catch (error) {
            toast({ title: "Erreur", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Mes Banques</h3>
                        <p className="text-xs text-muted-foreground">Gérez vos connexions bancaires</p>
                    </div>
                </div>
            </div>

            {/* Feature Coming Soon Notice */}
            <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                    <strong>Connexion bancaire en développement</strong>
                    <p className="text-sm mt-1">
                        L'intégration avec Bridge API est en cours. Vous pourrez bientôt connecter vos comptes automatiquement.
                    </p>
                </AlertDescription>
            </Alert>

            {/* Existing Connections */}
            <div className="space-y-4">
                {connections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground font-medium">Aucune connexion bancaire</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            La fonctionnalité sera bientôt disponible
                        </p>
                    </div>
                ) : (
                    connections.map((conn) => (
                        <div key={conn.id} className="border rounded-xl overflow-hidden">
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
                                {conn.accounts?.map((account) => (
                                    <div key={account.id} className="p-4 hover:bg-gray-50 transition-colors">
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
                                                        {account.balance.toLocaleString()} {account.currency}
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
                                                        {account.is_savings_pool ? "Inclus dans Reality Check" : "Ignoré (Compte Courant)"}
                                                    </span>
                                                </div>
                                                <Switch
                                                    checked={account.is_savings_pool}
                                                    onCheckedChange={() => togglePoolStatus(account.id, account.is_savings_pool)}
                                                />
                                            </div>
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