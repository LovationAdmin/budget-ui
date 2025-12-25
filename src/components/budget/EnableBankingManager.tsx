import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Check, 
  Search,
  TrendingUp,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// ============================================================================
// TYPES
// ============================================================================

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
  session_id?: string;
  accounts?: Account[];
  account_count: number;
  created_at: string;
}

interface EnableBankingManagerProps {
  budgetId: string;
  onUpdate: () => void;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function EnableBankingManager({ budgetId, onUpdate }: EnableBankingManagerProps) {
  const { toast } = useToast();
  
  // États
  const [banks, setBanks] = useState<Bank[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [showBankList, setShowBankList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState<string | null>(null);

  // Charger les données au montage
  useEffect(() => {
    loadBanks();
    loadConnections();
  }, [budgetId]);

  // ============================================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================================

  const loadBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/banking/enablebanking/banks?country=FR');
      const allBanks = res.data.banks || [];
      
      // Mettre Mock ASPSP en premier pour les tests
      const mockAspsp = allBanks.find((b: Bank) => b.name === "Mock ASPSP");
      const otherBanks = allBanks.filter((b: Bank) => b.name !== "Mock ASPSP");
      
      if (mockAspsp) {
        setBanks([mockAspsp, ...otherBanks]);
      } else {
        setBanks(allBanks);
      }
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger les banques.", 
        variant: "destructive" 
      });
      console.error('Failed to load banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const res = await api.get(`/budgets/${budgetId}/banking/enablebanking/connections`);
      setConnections(res.data.connections || []);
    } catch (error: any) {
      console.error('Failed to load connections:', error);
    }
  };

  // ============================================================================
  // CONNEXION BANCAIRE
  // ============================================================================

  const handleConnect = async (bankId: string) => {
    setConnecting(true);
    setSelectedBank(bankId);
    
    try {
      // 1. Créer la demande d'autorisation
      console.log('🔐 Creating auth request for:', bankId);
      const authRes = await api.post('/banking/enablebanking/connect', {
        aspsp_id: bankId,
        budget_id: budgetId
      });

      const { redirect_url, state } = authRes.data;
      console.log('✅ Auth URL received:', redirect_url);

      // 2. Ouvrir une popup centrée
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const authWindow = window.open(
        redirect_url,
        'EnableBankingAuth',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!authWindow) {
        throw new Error("Impossible d'ouvrir la fenêtre d'autorisation. Vérifiez que les popups ne sont pas bloquées.");
      }

      // 3. Écouter le message de callback
      const handleMessage = async (event: MessageEvent) => {
        // Vérifier l'origine pour la sécurité
        const allowedOrigins = [
          window.location.origin,
          'https://www.budgetfamille.com',
          'http://localhost:3000'
        ];

        if (!allowedOrigins.includes(event.origin)) {
          console.warn('⚠️  Message from unauthorized origin:', event.origin);
          return;
        }

        if (event.data.type === 'ENABLE_BANKING_CALLBACK') {
          console.log('📞 Callback received:', event.data);
          
          window.removeEventListener('message', handleMessage);
          authWindow?.close();

          try {
            // 4. Récupérer la session et les comptes
            console.log('🔄 Creating session...');
            const sessionRes = await api.get('/banking/enablebanking/callback', {
              params: {
                code: event.data.code,
                state: event.data.state || state
              }
            });

            const { session_id, accounts, bank_name } = sessionRes.data;
            console.log('✅ Session created:', session_id);
            console.log('📊 Accounts:', accounts);

            // 5. Synchroniser les comptes dans le budget
            console.log('🔄 Syncing accounts...');
            const syncRes = await api.post(`/budgets/${budgetId}/banking/enablebanking/sync`, {
              session_id,
              bank_name,
              accounts
            });

            console.log('✅ Sync response:', syncRes.data);

            toast({
              title: "✅ Connexion réussie !",
              description: `${syncRes.data.accounts_synced || 0} compte(s) synchronisé(s)`,
              variant: "default"
            });

            await loadConnections();
            onUpdate();
            setShowBankList(false);
            
          } catch (error: any) {
            console.error('❌ Sync error:', error);
            toast({
              title: "Erreur de synchronisation",
              description: error.response?.data?.error || error.message || "Échec de la synchronisation",
              variant: "destructive"
            });
          } finally {
            setConnecting(false);
            setSelectedBank("");
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // 4. Vérifier si la fenêtre est fermée manuellement
      const checkWindow = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkWindow);
          window.removeEventListener('message', handleMessage);
          
          if (connecting) {
            toast({
              title: "Connexion annulée",
              description: "La fenêtre d'autorisation a été fermée.",
              variant: "default"
            });
          }
          
          setConnecting(false);
          setSelectedBank("");
        }
      }, 500);

    } catch (error: any) {
      console.error('❌ Connection error:', error);
      toast({ 
        title: "Erreur de connexion", 
        description: error.response?.data?.error || error.message || "Impossible de se connecter.",
        variant: "destructive" 
      });
      setConnecting(false);
      setSelectedBank("");
    }
  };

  // ============================================================================
  // RAFRAÎCHISSEMENT DES SOLDES
  // ============================================================================

  const handleRefresh = async (connectionId: string) => {
    setRefreshing(connectionId);
    try {
      const res = await api.post('/banking/enablebanking/refresh', {
        connection_id: connectionId
      });

      toast({
        title: "✅ Soldes mis à jour",
        description: `${res.data.accounts_updated || 0} compte(s) mis à jour`,
        variant: "default"
      });

      await loadConnections();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Échec de la mise à jour",
        variant: "destructive"
      });
    } finally {
      setRefreshing(null);
    }
  };

  // ============================================================================
  // SUPPRESSION DE CONNEXION
  // ============================================================================

  const handleDelete = async (connectionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette connexion bancaire ?")) {
      return;
    }

    try {
      await api.delete(`/banking/enablebanking/connections/${connectionId}`);
      
      toast({
        title: "✅ Connexion supprimée",
        description: "La connexion bancaire a été supprimée avec succès",
        variant: "default"
      });

      await loadConnections();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Échec de la suppression",
        variant: "destructive"
      });
    }
  };

  // ============================================================================
  // FILTRAGE DES BANQUES
  // ============================================================================

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* En-tête avec action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Connexions Bancaires
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connectez vos comptes bancaires pour synchroniser automatiquement vos transactions
          </p>
        </div>
        
        <Button
          onClick={() => setShowBankList(true)}
          size="lg"
          className="gap-2"
          disabled={connecting}
        >
          <Sparkles className="h-4 w-4" />
          Ajouter une banque
        </Button>
      </div>

      {/* Alert informatif */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Mode Beta 2 - Enable Banking</AlertTitle>
        <AlertDescription>
          Connectez-vous à plus de 2500 banques européennes. Pour les tests, utilisez <strong>Mock ASPSP</strong> qui fournit des données réalistes sans credentials.
        </AlertDescription>
      </Alert>

      {/* Liste des connexions existantes */}
      {connections.length > 0 ? (
        <div className="grid gap-4">
          {connections.map((conn) => (
            <Card key={conn.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{conn.institution_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        Connecté le {new Date(conn.created_at).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {conn.account_count} compte{conn.account_count > 1 ? 's' : ''}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefresh(conn.id)}
                      disabled={refreshing === conn.id}
                      className="gap-2"
                    >
                      {refreshing === conn.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Actualiser
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(conn.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Aucune connexion bancaire</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Connectez votre première banque pour commencer à synchroniser vos transactions automatiquement
            </p>
            <Button onClick={() => setShowBankList(true)} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Connecter une banque
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de sélection de banque */}
      <Dialog open={showBankList} onOpenChange={setShowBankList}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Sélectionnez votre banque
            </DialogTitle>
            <DialogDescription>
              Plus de 2500 banques européennes disponibles
            </DialogDescription>
          </DialogHeader>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une banque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Liste des banques */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredBanks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune banque trouvée</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleConnect(bank.id)}
                    disabled={connecting && selectedBank === bank.id}
                    className="w-full text-left p-4 rounded-lg border hover:bg-accent hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {bank.logo ? (
                          <img 
                            src={bank.logo} 
                            alt={bank.name}
                            className="h-10 w-10 rounded object-contain"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {bank.name}
                            {bank.sandbox && (
                              <Badge variant="outline" className="text-xs">
                                Sandbox
                              </Badge>
                            )}
                            {bank.beta && (
                              <Badge variant="secondary" className="text-xs">
                                Beta
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bank.country === 'FR' ? '🇫🇷 France' : `${bank.country}`}
                          </p>
                        </div>
                      </div>

                      {connecting && selectedBank === bank.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnableBankingManager;