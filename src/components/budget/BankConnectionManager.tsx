import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2, Trash2, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { intlLocale } from "@/lib/budget/format";
import { defineMessages, useT } from "@/i18n/runtime";

const M = defineMessages({
    fr: {
        success: "Succès",
        synced: (n: number) => `${n} compte(s) synchronisé(s) !`,
        info: "Info",
        upToDate: "Comptes à jour.",
        error: "Erreur",
        syncFailed: "Impossible de synchroniser.",
        connected: "Connexion établie",
        fetchingAccounts: "Récupération des comptes...",
        connectFailed: "Impossible de lancer la connexion.",
        refreshed: "Soldes mis à jour !",
        refreshFailed: "Impossible de rafraîchir les soldes.",
        accountFailed: "Impossible de mettre à jour le compte.",
        confirmDelete: "Supprimer cette connexion et tous les comptes associés ?",
        deleted: "Supprimé",
        deletedDesc: "Connexion supprimée avec succès.",
        deleteFailed: "Impossible de supprimer la connexion.",
        loading: "Chargement...",
        myBanks: "Mes Banques",
        viaBridge: "Connectez vos comptes via Bridge (270+ banques)",
        sync: "Sync",
        refresh: "Rafraîchir",
        connecting: "Connexion...",
        addBank: "Ajouter une banque",
        noConnection: "Aucune connexion bancaire",
        clickAdd: 'Cliquez sur "Ajouter une banque" pour commencer',
        connectedOn: (date: string) => `Connecté le ${date}`,
        active: "Actif",
        inactive: "Inactif",
        balance: (n: number, currency: string) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        savings: "✓ Épargne",
        current: "Courant",
        included: "Inclus dans Reality Check",
        ignored: "Ignoré (Compte Courant)",
        noAccounts: 'Aucun compte trouvé - Cliquez sur "Sync" pour synchroniser',
    },
    en: {
        success: "Done",
        synced: (n: number) => `${n} account${n !== 1 ? 's' : ''} synced!`,
        info: "Info",
        upToDate: "Accounts up to date.",
        error: "Error",
        syncFailed: "Couldn’t sync.",
        connected: "Connected",
        fetchingAccounts: "Fetching your accounts...",
        connectFailed: "Couldn’t start the connection.",
        refreshed: "Balances updated!",
        refreshFailed: "Couldn’t refresh the balances.",
        accountFailed: "Couldn’t update the account.",
        confirmDelete: "Delete this connection and all its accounts?",
        deleted: "Deleted",
        deletedDesc: "Connection deleted.",
        deleteFailed: "Couldn’t delete the connection.",
        loading: "Loading...",
        myBanks: "My banks",
        viaBridge: "Connect your accounts with Bridge (270+ banks)",
        sync: "Sync",
        refresh: "Refresh",
        connecting: "Connecting...",
        addBank: "Add a bank",
        noConnection: "No bank connections",
        clickAdd: 'Click "Add a bank" to get started',
        connectedOn: (date: string) => `Connected on ${date}`,
        active: "Active",
        inactive: "Inactive",
        balance: (n: number, currency: string) => `${n.toLocaleString(intlLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
        savings: "✓ Savings",
        current: "Current",
        included: "Included in Reality Check",
        ignored: "Ignored (current account)",
        noAccounts: 'No accounts found - click "Sync" to sync them',
    },
});

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
    const t = useT(M);
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    
    // Ref pour éviter les doubles appels de sync
    const syncInProgress = useRef(false);

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

    const handleSync = async (silent = false) => {
        if (syncInProgress.current) return;
        syncInProgress.current = true;
        setSyncing(true);
        
        try {
            const res = await api.post(`/budgets/${budgetId}/banking/sync`);
            if (res.data.accounts_synced > 0) {
                if (!silent) toast({ title: t.success, description: t.synced(res.data.accounts_synced), variant: "success" });
                
                // FORCE REFRESH CHAIN
                await fetchConnections(); // 1. Met à jour la liste dans la popup
                onUpdate();               // 2. Met à jour le "Reality Check" (solde global) dans le parent
                
            } else if (!silent) {
                toast({ title: t.info, description: t.upToDate, variant: "default" });
            }
        } catch (error) {
            if (!silent) toast({ title: t.error, description: t.syncFailed, variant: "destructive" });
        } finally {
            setSyncing(false);
            syncInProgress.current = false;
        }
    };

    // --- LISTENER POST MESSAGE ---
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'BRIDGE_CONNECT_SUCCESS') {
                console.log("Bridge Success Signal Received!", event.data);
                setConnecting(false);
                toast({ title: t.connected, description: t.fetchingAccounts, variant: "default" });
                
                // Petit délai pour laisser le backend de Bridge indexer
                setTimeout(() => handleSync(), 1500);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []); // eslint-disable-line

    // --- CONNECT LOGIC (Hybrid: PostMessage + Interval) ---
    const handleConnect = async () => {
        setConnecting(true);
        try {
            // URL de retour dynamique
            const callbackUrl = `${window.location.origin}/bank-callback`;
            
            const res = await api.post('/banking/bridge/connect', { 
                redirect_url: callbackUrl 
            });
            
            const width = 500;
            const height = 800;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const bridgeWindow = window.open(
                res.data.redirect_url,
                'Bridge Connect',
                `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
            );

            // FALLBACK: Surveiller la fermeture de la fenêtre
            // Si l'utilisateur ferme la fenêtre manuellement (ou si la redirection échoue mais qu'il ferme)
            // on lance quand même une synchro pour voir.
            const checkWindow = setInterval(() => {
                if (bridgeWindow?.closed) {
                    clearInterval(checkWindow);
                    // Si on est toujours en "connecting", c'est qu'on n'a pas reçu le PostMessage
                    // Donc on tente une synchro "au cas où"
                    setConnecting(prev => {
                        if (prev) {
                            handleSync(true); // Silent sync
                            return false;
                        }
                        return prev;
                    });
                }
            }, 1000);

        } catch (error: any) {
            toast({ title: t.error, description: t.connectFailed, variant: "destructive" });
            setConnecting(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.post('/banking/bridge/refresh');
            await fetchConnections();
            onUpdate();
            toast({ title: t.success, description: t.refreshed, variant: "default" });
        } catch (error) {
            toast({ title: t.error, description: t.refreshFailed, variant: "destructive" });
        } finally {
            setRefreshing(false);
        }
    };

    const togglePoolStatus = async (accountId: string, currentStatus: boolean) => {
        setConnections(prev => prev.map(c => ({
            ...c,
            accounts: c.accounts?.map(a => a.id === accountId ? { ...a, is_savings_pool: !currentStatus } : a)
        })));
        try {
            await api.put(`/banking/accounts/${accountId}`, { is_savings_pool: !currentStatus });
            onUpdate();
        } catch (error) {
            toast({ title: t.error, description: t.accountFailed, variant: "destructive" });
            fetchConnections();
        }
    };

    const deleteConnection = async (id: string) => {
        if (!confirm(t.confirmDelete)) return;
        try {
            await api.delete(`/banking/connections/${id}`);
            setConnections(prev => prev.filter(c => c.id !== id));
            onUpdate();
            toast({ title: t.deleted, description: t.deletedDesc, variant: "default" });
        } catch (error) {
            toast({ title: t.error, description: t.deleteFailed, variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2 text-sm text-muted-foreground">{t.loading}</p></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><Building2 className="h-5 w-5 text-primary" /></div>
                    <div><h3 className="font-semibold text-foreground">{t.myBanks}</h3><p className="text-xs text-muted-foreground">{t.viaBridge}</p></div>
                </div>
                <div className="flex gap-2">
                    {connections.length > 0 && (
                        <>
                            <Button onClick={() => handleSync()} disabled={syncing} variant="outline" size="sm" className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} /> {t.sync}
                            </Button>
                            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> {t.refresh}
                            </Button>
                        </>
                    )}
                    <Button onClick={handleConnect} disabled={connecting} variant="default" size="sm" className="gap-2 shadow-md">
                        {connecting ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.connecting}</> : <><Plus className="h-4 w-4" /> {t.addBank}</>}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {connections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground font-medium">{t.noConnection}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t.clickAdd}</p>
                    </div>
                ) : (
                    connections.map((conn) => (
                        <div key={conn.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <div><h4 className="font-semibold text-sm">{conn.institution_name}</h4><p className="text-xs text-muted-foreground">{t.connectedOn(new Date(conn.created_at).toLocaleDateString(intlLocale()))}</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={conn.status === 'active' ? 'default' : 'secondary'}>{conn.status === 'active' ? t.active : t.inactive}</Badge>
                                    <Button variant="ghost" size="sm" onClick={() => deleteConnection(conn.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
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
                                                        <span className="text-lg font-semibold">{t.balance(account.balance, account.currency)}</span>
                                                        <Badge variant={account.is_savings_pool ? "default" : "secondary"} className="text-xs">{account.is_savings_pool ? t.savings : t.current}</Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right text-xs text-muted-foreground hidden sm:block"><span className="block">{account.is_savings_pool ? t.included : t.ignored}</span></div>
                                                    <Switch checked={account.is_savings_pool} onCheckedChange={() => togglePoolStatus(account.id, account.is_savings_pool)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">{t.noAccounts}</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}