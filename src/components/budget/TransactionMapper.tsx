import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Link as LinkIcon, Layers } from "lucide-react";
import api from '@/services/api';
import { cn } from "@/lib/utils";

// Types
export interface BridgeTransaction {
    id: string;  // Changé de number à string pour supporter "eb-1" et "123"
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
    budgetId: string; // ✅ FIX 1: Add budgetId to props
}

export function TransactionMapper({ isOpen, onClose, charge, currentMappings, onSave, budgetId }: TransactionMapperProps) { // ✅ FIX 2: Destructure budgetId
    const [rawTransactions, setRawTransactions] = useState<BridgeTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [source, setSource] = useState<'all' | 'bridge' | 'enablebanking'>('all');
    const [selectedDescriptions, setSelectedDescriptions] = useState<Set<string>>(new Set());

    // 1. Fetch Data on Open
    useEffect(() => {
        if (isOpen) {
            fetchTransactions();
        }
    }, [isOpen, source]);

    // 2. Pre-select based on existing mappings
    useEffect(() => {
        if (isOpen && rawTransactions.length > 0) {
            const mappedTxIds = new Set(
                currentMappings
                    .filter(m => m.chargeId === charge.id)
                    .map(m => String(m.transactionId))
            );
            
            const descriptionsToSelect = new Set<string>();

            rawTransactions.forEach(tx => {
                if (mappedTxIds.has(String(tx.id))) {
                    descriptionsToSelect.add(tx.clean_description);
                }
            });
            setSelectedDescriptions(descriptionsToSelect);
        }
    }, [isOpen, rawTransactions, currentMappings, charge.id]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let allTransactions: BridgeTransaction[] = [];

            if (source === 'all' || source === 'bridge') {
                // Récupérer les transactions Bridge
                try {
                    const bridgeRes = await api.get('/banking/bridge/transactions');
                    const bridgeTxs = (bridgeRes.data.transactions || []).map((tx: any) => ({
                        ...tx,
                        id: String(tx.id),
                        account_id: String(tx.account_id)
                    }));
                    allTransactions = [...allTransactions, ...bridgeTxs];
                } catch (error) {
                    console.warn("Bridge transactions unavailable:", error);
                }
            }

            if (source === 'all' || source === 'enablebanking') {
                // Récupérer les transactions Enable Banking
                try {
                    // ✅ FIX 3: Pass budget_id in the API call
                    const ebRes = await api.get(`/banking/enablebanking/transactions?budget_id=${budgetId}`);
                    const ebTxs = (ebRes.data.transactions || []).map((tx: any) => ({
                        ...tx,
                        id: String(tx.id),
                        account_id: String(tx.account_id)
                    }));
                    allTransactions = [...allTransactions, ...ebTxs];
                } catch (error) {
                    console.warn("Enable Banking transactions unavailable:", error);
                }
            }

            // Dédupliquer par ID (au cas où)
            const uniqueTransactions = Array.from(
                new Map(allTransactions.map(tx => [tx.id, tx])).values()
            );

            setRawTransactions(uniqueTransactions);
        } catch (error) {
            console.error("Failed to load transactions", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. AGGREGATION LOGIC (Distinct)
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, GroupedTransaction> = {};

        rawTransactions.forEach(tx => {
            const desc = tx.clean_description || "Transaction Inconnue";
            
            if (search && !desc.toLowerCase().includes(search.toLowerCase())) return;

            if (!groups[desc]) {
                groups[desc] = {
                    description: desc,
                    count: 0,
                    totalAmount: 0,
                    averageAmount: 0,
                    transactions: []
                };
            }

            groups[desc].count += 1;
            groups[desc].totalAmount += tx.amount;
            groups[desc].transactions.push(tx);
        });

        Object.values(groups).forEach(g => {
            g.averageAmount = g.totalAmount / g.count;
        });

        return Object.values(groups).sort((a, b) => b.count - a.count);
    }, [rawTransactions, search]);

    const handleToggleGroup = (group: GroupedTransaction) => {
        const newSet = new Set(selectedDescriptions);
        if (newSet.has(group.description)) {
            newSet.delete(group.description);
        } else {
            newSet.add(group.description);
        }
        setSelectedDescriptions(newSet);
    };

    const handleSave = () => {
        const newMappings: MappedTransaction[] = [];

        rawTransactions.forEach(tx => {
            if (selectedDescriptions.has(tx.clean_description)) {
                newMappings.push({
                    chargeId: charge.id,
                    transactionId: String(tx.id),
                    amount: tx.amount,
                    date: tx.date,
                    description: tx.clean_description
                });
            }
        });
        
        onSave(newMappings);
        onClose();
    };

    // Statistiques
    const selectedCount = Array.from(selectedDescriptions).reduce((sum, desc) => {
        const group = groupedTransactions.find(g => g.description === desc);
        return sum + (group?.count || 0);
    }, 0);

    const selectedTotal = Array.from(selectedDescriptions).reduce((sum, desc) => {
        const group = groupedTransactions.find(g => g.description === desc);
        return sum + (group?.totalAmount || 0);
    }, 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-indigo-600" />
                        Lier des transactions
                    </DialogTitle>
                    <DialogDescription>
                        Associez des dépenses réelles à la charge : <strong>{charge.label}</strong> ({charge.amount}€).
                        Les transactions identiques seront automatiquement incluses dans les prochains imports.
                    </DialogDescription>
                </DialogHeader>

                {/* Filtres */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Rechercher une description..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <select 
                        value={source} 
                        onChange={(e) => setSource(e.target.value as 'all' | 'bridge' | 'enablebanking')}
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">Toutes sources</option>
                        <option value="bridge">Bridge uniquement</option>
                        <option value="enablebanking">Enable Banking uniquement</option>
                    </select>
                </div>

                {/* Liste des transactions groupées */}
                <ScrollArea className="flex-1 border rounded-md">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : groupedTransactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Layers className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>Aucune transaction trouvée</p>
                            <p className="text-sm mt-1">Connectez une banque ou modifiez votre recherche</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {groupedTransactions.map((group) => {
                                const isSelected = selectedDescriptions.has(group.description);
                                const isExpense = group.averageAmount < 0;

                                return (
                                    <div 
                                        key={group.description}
                                        onClick={() => handleToggleGroup(group)}
                                        className={cn(
                                            "p-3 border rounded-lg cursor-pointer transition-all",
                                            isSelected 
                                                ? "bg-indigo-50 border-indigo-300 shadow-sm" 
                                                : "hover:bg-gray-50 border-gray-200"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox checked={isSelected} className="mt-1" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm truncate">
                                                        {group.description}
                                                    </span>
                                                    <Badge variant={isExpense ? "destructive" : "default"} className="shrink-0">
                                                        {group.count}x
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                                    <span>
                                                        Moyen: <strong className={isExpense ? "text-red-600" : "text-green-600"}>
                                                            {group.averageAmount.toFixed(2)}€
                                                        </strong>
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        Total: <strong className={isExpense ? "text-red-600" : "text-green-600"}>
                                                            {group.totalAmount.toFixed(2)}€
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer avec statistiques */}
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <div className="flex-1 text-sm text-gray-600">
                        <strong>{selectedCount}</strong> transaction{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
                        {selectedCount > 0 && (
                            <span className="ml-2">
                                • Total: <strong className={selectedTotal < 0 ? "text-red-600" : "text-green-600"}>
                                    {Math.abs(selectedTotal).toFixed(2)}€
                                </strong>
                            </span>
                        )}
                    </div>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={selectedCount === 0}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Enregistrer {selectedCount > 0 && `(${selectedCount})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}