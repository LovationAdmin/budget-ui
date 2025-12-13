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
    id: number;
    account_id: number;
    amount: number;
    clean_description: string;
    date: string;
}

export interface MappedTransaction {
    chargeId: string;
    transactionId: number;
    amount: number;
    date: string;
    description: string;
}

// Grouped Transaction for Display
interface GroupedTransaction {
    description: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
    transactions: BridgeTransaction[]; // Keep track of all raw IDs
}

interface TransactionMapperProps {
    isOpen: boolean;
    onClose: () => void;
    charge: { id: string; label: string; amount: number };
    currentMappings: MappedTransaction[];
    onSave: (newMappings: MappedTransaction[]) => void;
}

export function TransactionMapper({ isOpen, onClose, charge, currentMappings, onSave }: TransactionMapperProps) {
    const [rawTransactions, setRawTransactions] = useState<BridgeTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    
    // Store selected DESCRIPTIONS instead of IDs to enable "Pattern Mapping"
    const [selectedDescriptions, setSelectedDescriptions] = useState<Set<string>>(new Set());

    // 1. Fetch Data on Open
    useEffect(() => {
        if (isOpen) {
            fetchTransactions();
        }
    }, [isOpen]);

    // 2. Pre-select based on existing mappings
    useEffect(() => {
        if (isOpen && rawTransactions.length > 0) {
            const mappedTxIds = new Set(currentMappings.filter(m => m.chargeId === charge.id).map(m => m.transactionId));
            const descriptionsToSelect = new Set<string>();

            rawTransactions.forEach(tx => {
                if (mappedTxIds.has(tx.id)) {
                    descriptionsToSelect.add(tx.clean_description);
                }
            });
            setSelectedDescriptions(descriptionsToSelect);
        }
    }, [isOpen, rawTransactions, currentMappings, charge.id]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/banking/bridge/transactions');
            setRawTransactions(res.data.transactions || []);
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
            
            // Filter by Search Term
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

        // Calculate averages
        Object.values(groups).forEach(g => {
            g.averageAmount = g.totalAmount / g.count;
        });

        return Object.values(groups).sort((a, b) => b.count - a.count); // Most frequent first
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
        // Expand selected descriptions back into individual transaction mappings
        const newMappings: MappedTransaction[] = [];

        rawTransactions.forEach(tx => {
            if (selectedDescriptions.has(tx.clean_description)) {
                newMappings.push({
                    chargeId: charge.id,
                    transactionId: tx.id,
                    amount: tx.amount, // Keep negative if it's a debit
                    date: tx.date,
                    description: tx.clean_description
                });
            }
        });
        
        onSave(newMappings);
        onClose();
    };

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
                        <br/>
                        <span className="text-xs text-muted-foreground">Les transactions sont regroupées par nom pour simplifier la sélection.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (ex: Gym, Netflix...)"
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-hidden border rounded-md bg-gray-50/50">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="divide-y bg-white">
                                {groupedTransactions.map(group => {
                                    const isSelected = selectedDescriptions.has(group.description);
                                    return (
                                        <div 
                                            key={group.description} 
                                            className={cn(
                                                "flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                                                isSelected && "bg-indigo-50 hover:bg-indigo-100"
                                            )}
                                            onClick={() => handleToggleGroup(group)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Checkbox checked={isSelected} className="border-indigo-600 data-[state=checked]:bg-indigo-600" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{group.description}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal">
                                                            <Layers className="h-3 w-3 mr-1" />
                                                            {group.count}x trouvés
                                                        </Badge>
                                                        <span>Moyenne: {Math.abs(group.averageAmount).toFixed(2)}€</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right whitespace-nowrap pl-2">
                                                <span className={cn(
                                                    "font-bold text-sm",
                                                    group.totalAmount < 0 ? "text-destructive" : "text-success"
                                                )}>
                                                    {group.totalAmount.toFixed(2)} €
                                                </span>
                                                <p className="text-[10px] text-muted-foreground">Total (40j)</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {groupedTransactions.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        Aucune transaction trouvée ces 40 derniers jours.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center border-t pt-4">
                    <div className="text-xs text-muted-foreground">
                        {selectedDescriptions.size} groupe(s) sélectionné(s)
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Annuler</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                            Enregistrer
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}