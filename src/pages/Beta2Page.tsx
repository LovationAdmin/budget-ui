import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnableBankingManager } from '@/components/budget/EnableBankingManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import api from '@/services/api';

export default function Beta2Page() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [budget, setBudget] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [realityCheck, setRealityCheck] = useState<any>(null);

    useEffect(() => {
        loadBudget();
        loadRealityCheck();
    }, [id]);

    const loadBudget = async () => {
        try {
            const res = await api.get(`/budgets/${id}`);
            setBudget(res.data);
        } catch (error) {
            console.error('Failed to load budget:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRealityCheck = async () => {
        try {
            const res = await api.get(`/budgets/${id}/banking/connections`);
            
            // Calculer le Reality Check
            let totalBudgeted = 0;
            let totalActual = 0;

            if (budget?.data?.budgetData?.months) {
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth();
                const monthData = budget.data.budgetData.months[currentYear]?.[currentMonth];
                
                if (monthData?.charges) {
                    Object.values(monthData.charges).forEach((charge: any) => {
                        totalBudgeted += charge.amount || 0;
                    });
                }
            }

            // Calculer le total des comptes bancaires (hors épargne)
            res.data.forEach((connection: any) => {
                connection.accounts?.forEach((account: any) => {
                    if (!account.is_savings_pool) {
                        totalActual += account.balance || 0;
                    }
                });
            });

            setRealityCheck({
                budgeted: totalBudgeted,
                actual: totalActual,
                difference: totalActual - totalBudgeted,
                percentage: totalBudgeted > 0 
                    ? ((totalActual / totalBudgeted) * 100).toFixed(1)
                    : 0
            });
        } catch (error) {
            console.error('Failed to calculate reality check:', error);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/${id}`)}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Reality Check Beta 2
                        </h1>
                        <p className="text-muted-foreground">
                            {budget?.name} • Enable Banking Integration
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Nouvelle technologie bancaire</AlertTitle>
                <AlertDescription>
                    Cette version utilise Enable Banking, une solution Open Banking 
                    offrant l'accès à 2500+ banques européennes. 
                    Vos données sont sécurisées et conformes PSD2.
                </AlertDescription>
            </Alert>

            {/* Reality Check Summary */}
            {realityCheck && (
                <Card>
                    <CardHeader>
                        <CardTitle>Comparaison Budget vs Réalité</CardTitle>
                        <CardDescription>
                            Comparez votre budget prévisionnel avec vos comptes bancaires réels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Budget Prévisionnel</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {realityCheck.budgeted.toFixed(2)} €
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Solde Réel</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {realityCheck.actual.toFixed(2)} €
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg ${
                                realityCheck.difference >= 0 
                                    ? 'bg-green-50' 
                                    : 'bg-red-50'
                            }`}>
                                <p className="text-sm text-muted-foreground">Différence</p>
                                <p className={`text-2xl font-bold ${
                                    realityCheck.difference >= 0 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                }`}>
                                    {realityCheck.difference >= 0 ? '+' : ''}
                                    {realityCheck.difference.toFixed(2)} €
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {realityCheck.percentage}% du budget
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bank Connection Manager */}
            <EnableBankingManager 
                budgetId={id!} 
                onUpdate={() => {
                    loadBudget();
                    loadRealityCheck();
                }}
            />

            {/* Comparison with Beta 1 */}
            <Card>
                <CardHeader>
                    <CardTitle>Différences avec Beta 1 (Bridge API)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                            <div>
                                <p className="font-medium">✅ 2500+ banques européennes</p>
                                <p className="text-muted-foreground">
                                    vs ~270 banques avec Bridge API
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                            <div>
                                <p className="font-medium">✅ Sandbox personnalisable</p>
                                <p className="text-muted-foreground">
                                    Mock ASPSP avec vos propres données de test
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                            <div>
                                <p className="font-medium">✅ Conformité PSD2 native</p>
                                <p className="text-muted-foreground">
                                    Architecture Open Banking standard
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                            <div>
                                <p className="font-medium">⚠️ En phase de test</p>
                                <p className="text-muted-foreground">
                                    Utiliser Beta 1 pour la production
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground py-4">
                <p>
                    Powered by Enable Banking • 
                    <a 
                        href="https://enablebanking.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:underline"
                    >
                        Documentation
                    </a>
                </p>
            </div>
        </div>
    );
}
