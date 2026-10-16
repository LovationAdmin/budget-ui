import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Link as LinkIcon, Layers, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '@/services/api';
import { cn } from "@/lib/utils";
import { money } from "@/lib/budget/format";
import { defineMessages, useT } from "@/i18n/runtime";

const M = defineMessages<{
    title: string;
    intro: (label: string, amount: string) => ReactNode;
    amount: (n: number) => string;
    linkedCount: (n: number) => string;
    linkedRest: string;
    futureImports: string;
    searchPlaceholder: string;
    allSources: string;
    bridgeOnly: string;
    enableBankingOnly: string;
    noTransactions: string;
    count: (n: number) => string;
    total: (amount: string) => string;
    average: (amount: string) => string;
    selected: (n: number) => string;
    cancel: string;
    save: (n: number) => string;
}>({
    fr: {
        title: 'Lier des transactions',
        intro: (label, amount) => <>Associez des dépenses réelles à la charge : <strong>{label}</strong> ({amount}).</>,
        amount: (n) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€`,
        linkedCount: (n) => `${n} transaction(s)`,
        linkedRest: 'actuellement liée(s). Les descriptions cochées ci-dessous seront automatiquement incluses lors des prochaines synchronisations.',
        futureImports: 'Les transactions identiques seront automatiquement incluses dans les prochains imports.',
        searchPlaceholder: 'Rechercher une description...',
        allSources: 'Toutes sources',
        bridgeOnly: 'Bridge uniquement',
        enableBankingOnly: 'Enable Banking uniquement',
        noTransactions: 'Aucune transaction trouvée',
        count: (n) => `${n} transaction${n > 1 ? 's' : ''}`,
        total: (amount) => `Total: ${amount}`,
        average: (amount) => `Moyenne: ${amount}`,
        selected: (n) => `${n} transaction${n !== 1 ? 's' : ''} sélectionnée${n !== 1 ? 's' : ''}`,
        cancel: 'Annuler',
        save: (n) => `Enregistrer (${n})`,
    },
    en: {
        title: 'Link transactions',
        intro: (label, amount) => <>Match real spending to the bill: <strong>{label}</strong> ({amount}).</>,
        amount: (n) => money(n),
        linkedCount: (n) => `${n} transaction${n !== 1 ? 's' : ''}`,
        linkedRest: 'linked right now. The descriptions checked below will be included automatically in future syncs.',
        futureImports: 'Matching transactions will be included automatically in future imports.',
        searchPlaceholder: 'Search descriptions...',
        allSources: 'All sources',
        bridgeOnly: 'Bridge only',
        enableBankingOnly: 'Enable Banking only',
        noTransactions: 'No transactions found',
        count: (n) => `${n} transaction${n !== 1 ? 's' : ''}`,
        total: (amount) => `Total: ${amount}`,
        average: (amount) => `Average: ${amount}`,
        selected: (n) => `${n} transaction${n !== 1 ? 's' : ''} selected`,
        cancel: 'Cancel',
        save: (n) => `Save (${n})`,
    },
});

// ============================================================================
// TYPES
// ============================================================================

export interface BridgeTransaction {
    id: string;
    account_id: string;
    amount: number;
    clean_description: string;
    date: string;
}

export interface MappedTransaction {
    chargeId: string;
    transactionId: string;
    amount: number;
    date: string;
    description: string;
}

interface GroupedTransaction {
    description: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
    transactions: BridgeTransaction[];
}

interface TransactionMapperProps {
    isOpen: boolean;
    onClose: () => void;
    charge: { id: string; label: string; amount: number };
    currentMappings: MappedTransaction[];
    onSave: (newMappings: MappedTransaction[]) => void;
    budgetId: string;
    demoTransactions?: BridgeTransaction[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TransactionMapper({ 
    isOpen, 
    onClose, 
    charge, 
    currentMappings, 
    onSave, 
    budgetId,
    demoTransactions
}: TransactionMapperProps) {
    const t = useT(M);
    const [rawTransactions, setRawTransactions] = useState<BridgeTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [source, setSource] = useState<'all' | 'bridge' | 'enablebanking'>('all');
    const [selectedDescriptions, setSelectedDescriptions] = useState<Set<string>>(new Set());

    // ============================================================================
    // DATA FETCHING
    // ============================================================================

    useEffect(() => {
        if (isOpen) {
            fetchTransactions();
        }
    }, [isOpen, source]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            if (demoTransactions) {
                // Simuler un délai réseau pour plus de réalisme en mode démo
                await new Promise(resolve => setTimeout(resolve, 800));
                setRawTransactions(demoTransactions);
            } else {
                const params = source !== 'all' ? { source } : {};
                const response = await api.get(`/banking/budgets/${budgetId}/transactions`, { params });
                setRawTransactions(response.data.transactions || []);
            }
        } catch (error) {
            console.error('[TransactionMapper] Error fetching transactions:', error);
            setRawTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // INITIAL SELECTION
    // ============================================================================

    useEffect(() => {
        if (!isOpen || rawTransactions.length === 0) return;

        const alreadyLinked = currentMappings
            .filter(m => m.chargeId === charge.id)
            .map(m => m.description);

        setSelectedDescriptions(new Set(alreadyLinked));
    }, [isOpen, rawTransactions, currentMappings, charge.id]);

    // ============================================================================
    // GROUPING & FILTERING
    // ============================================================================

    const groupedTransactions = useMemo(() => {
        const negativeTransactions = rawTransactions.filter(t => t.amount < 0);
        
        const grouped = negativeTransactions.reduce((acc, transaction) => {
            const desc = transaction.clean_description;
            if (!acc[desc]) {
                acc[desc] = {
                    description: desc,
                    count: 0,
                    totalAmount: 0,
                    averageAmount: 0,
                    transactions: []
                };
            }
            acc[desc].count += 1;
            acc[desc].totalAmount += Math.abs(transaction.amount);
            acc[desc].transactions.push(transaction);
            return acc;
        }, {} as Record<string, GroupedTransaction>);

        const groupedArray: GroupedTransaction[] = Object.values(grouped).map(g => ({
            ...g,
            averageAmount: g.totalAmount / g.count
        }));

        const searchLower = search.toLowerCase();
        const filtered = searchLower 
            ? groupedArray.filter(g => g.description.toLowerCase().includes(searchLower))
            : groupedArray;

        return filtered.sort((a, b) => b.totalAmount - a.totalAmount);
    }, [rawTransactions, search]);

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const toggleDescription = (description: string) => {
        setSelectedDescriptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(description)) {
                newSet.delete(description);
            } else {
                newSet.add(description);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        const newMappings: MappedTransaction[] = [];

        groupedTransactions.forEach(group => {
            if (selectedDescriptions.has(group.description)) {
                group.transactions.forEach(transaction => {
                    newMappings.push({
                        chargeId: charge.id,
                        transactionId: transaction.id,
                        amount: Math.abs(transaction.amount),
                        date: transaction.date,
                        description: transaction.clean_description
                    });
                });
            }
        });

        onSave(newMappings);
        onClose();
    };

    const handleCancel = () => {
        setSelectedDescriptions(new Set());
        setSearch("");
        onClose();
    };

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================

    const alreadyMappedCount = currentMappings.filter(m => m.chargeId === charge.id).length;
    
    const selectedCount = Array.from(selectedDescriptions).reduce((sum, desc) => {
        const group = groupedTransactions.find(g => g.description === desc);
        return sum + (group?.count || 0);
    }, 0);

    const selectedTotal = Array.from(selectedDescriptions).reduce((sum, desc) => {
        const group = groupedTransactions.find(g => g.description === desc);
        return sum + (group?.totalAmount || 0);
    }, 0);

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-indigo-600" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                        <div>
                            {t.intro(charge.label, t.amount(charge.amount))}
                        </div>
                        {alreadyMappedCount > 0 && (
                            <Alert className="bg-indigo-50 border-indigo-200">
                                <AlertCircle className="h-4 w-4 text-indigo-600" />
                                <AlertDescription className="text-xs text-indigo-700">
                                    <strong>{t.linkedCount(alreadyMappedCount)}</strong> {t.linkedRest}
                                </AlertDescription>
                            </Alert>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {t.futureImports}
                        </p>
                    </DialogDescription>
                </DialogHeader>

                {/* Filtres */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder={t.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    {!demoTransactions && (
                        <select 
                            value={source} 
                            onChange={(e) => setSource(e.target.value as 'all' | 'bridge' | 'enablebanking')}
                            className="border rounded-md px-3 py-2 text-sm"
                        >
                            <option value="all">{t.allSources}</option>
                            <option value="bridge">{t.bridgeOnly}</option>
                            <option value="enablebanking">{t.enableBankingOnly}</option>
                        </select>
                    )}
                </div>

                {/* Liste des transactions groupées */}
                <ScrollArea className="flex-1 border rounded-md">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : groupedTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <Layers className="h-12 w-12 mb-2 opacity-30" />
                            <p className="text-sm">{t.noTransactions}</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {groupedTransactions.map((group) => (
                                <label
                                    key={group.description}
                                    className={cn(
                                        "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                                        selectedDescriptions.has(group.description) && "bg-indigo-50 border-indigo-300"
                                    )}
                                >
                                    <Checkbox
                                        checked={selectedDescriptions.has(group.description)}
                                        onCheckedChange={() => toggleDescription(group.description)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 truncate">
                                            {group.description}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {t.count(group.count)}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                                                {t.total(t.amount(group.totalAmount))}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {t.average(t.amount(group.averageAmount))}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer avec statistiques */}
                <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="text-gray-600">
                            {t.selected(selectedCount)}
                        </span>
                        <span className="font-semibold text-indigo-600">
                            {t.total(t.amount(selectedTotal))}
                        </span>
                    </div>
                    
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            {t.cancel}
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={selectedCount === 0}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            {t.save(selectedCount)}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}