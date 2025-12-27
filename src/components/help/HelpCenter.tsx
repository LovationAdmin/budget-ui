import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  Link, 
  Users, 
  Shield, 
  TrendingUp,
  Calendar,
  CreditCard
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HelpArticle {
  id: string;
  category: string;
  icon: any;
  title: string;
  description: string;
  content: React.ReactNode;
  tags: string[];
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started',
    category: 'Démarrage',
    icon: BookOpen,
    title: 'Comment créer mon premier budget ?',
    description: 'Guide pas à pas pour débuter',
    tags: ['démarrage', 'budget', 'création'],
    content: (
      <div className="space-y-4">
        <p>Créer votre premier budget est simple :</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Cliquez sur "+ Nouveau Budget" dans le tableau de bord</li>
          <li>Donnez un nom à votre budget (ex: "Budget Famille 2025")</li>
          <li>Sélectionnez l'année de référence</li>
          <li>Cliquez sur "Créer" - c'est fait !</li>
        </ol>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 Vous pouvez créer plusieurs budgets (ex: un par projet, par année...)
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'revenue-charges',
    category: 'Budget',
    icon: Calendar,
    title: 'Comment gérer mes revenus et charges ?',
    description: 'Revenus fixes, charges mensuelles, dépenses ponctuelles',
    tags: ['revenus', 'charges', 'dépenses'],
    content: (
      <div className="space-y-4">
        <h4 className="font-semibold">Revenus mensuels</h4>
        <p className="text-sm">Entrez vos revenus fixes (salaire, allocations...) qui se répètent chaque mois.</p>
        
        <h4 className="font-semibold mt-4">Charges récurrentes</h4>
        <p className="text-sm">Listez vos dépenses fixes : loyer, abonnements, assurances...</p>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>L'IA catégorise automatiquement vos charges</li>
          <li>Vous pouvez définir des dates de début/fin</li>
          <li>Le système calcule le "disponible" automatiquement</li>
        </ul>

        <h4 className="font-semibold mt-4">Dépenses ponctuelles</h4>
        <p className="text-sm">Utilisez la section "Dépenses annuelles" pour les achats exceptionnels (vacances, travaux...)</p>
      </div>
    )
  },
  {
    id: 'ai-suggestions',
    category: 'Économies',
    icon: Sparkles,
    title: 'Comment fonctionnent les suggestions IA ?',
    description: 'Économisez grâce à notre analyse intelligente',
    tags: ['ia', 'économies', 'suggestions', 'concurrents'],
    content: (
      <div className="space-y-4">
        <p>Notre IA analyse automatiquement vos charges et trouve les meilleures alternatives :</p>
        
        <h4 className="font-semibold">Catégories analysées</h4>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>Électricité & Gaz</li>
          <li>Internet & Téléphonie</li>
          <li>Assurances (auto, habitation, santé)</li>
          <li>Prêts & Crédits</li>
        </ul>

        <h4 className="font-semibold mt-4">Ce que vous obtenez</h4>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li><strong>Top 3 des meilleures offres</strong> pour chaque charge</li>
            <li><strong>Économies potentielles précises</strong> calculées</li>
            <li><strong>Avantages et inconvénients</strong> de chaque option</li>
            <li><strong>Liens directs</strong> vers les offres</li>
          </ul>
        </div>

        <h4 className="font-semibold mt-4">Comment ça marche ?</h4>
        <ol className="list-decimal pl-6 text-sm space-y-2">
          <li>Ajoutez vos charges dans la section "Charges"</li>
          <li>L'IA les catégorise automatiquement</li>
          <li>Consultez l'onglet "💡 Suggestions" pour voir les économies possibles</li>
          <li>Comparez les 3 meilleures options</li>
          <li>Cliquez pour accéder aux offres</li>
        </ol>
      </div>
    )
  },
  {
    id: 'reality-check',
    category: 'Connexion Bancaire',
    icon: Link,
    title: 'Qu\'est-ce que Reality Check ?',
    description: 'Comparez budget théorique vs dépenses réelles',
    tags: ['banque', 'reality check', 'connexion', 'transactions'],
    content: (
      <div className="space-y-4">
        <p>Reality Check vous permet de voir l'écart entre votre budget planifié et vos dépenses réelles.</p>

        <h4 className="font-semibold">Comment ça marche ?</h4>
        <ol className="list-decimal pl-6 text-sm space-y-2">
          <li>Connectez votre compte bancaire (2500+ banques supportées)</li>
          <li>Vos transactions sont importées de manière sécurisée</li>
          <li>Mappez chaque transaction à une catégorie de budget</li>
          <li>Voyez instantanément où vous dépassez</li>
        </ol>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
          <h5 className="font-semibold text-sm text-blue-900 mb-2">🔒 Sécurité Maximale</h5>
          <ul className="list-disc pl-6 text-xs space-y-1 text-blue-800">
            <li>Connexion via Enable Banking (certifié PSD2)</li>
            <li>Vos identifiants ne transitent JAMAIS par nos serveurs</li>
            <li>Données chiffrées de bout en bout</li>
            <li>Accès lecture seule - impossible de faire des virements</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mt-4">
          <h5 className="font-semibold text-sm text-purple-900 mb-2">⭐ Mode Premium</h5>
          <p className="text-xs text-purple-800">
            Avec l'abonnement Premium (2€/mois), la synchronisation est <strong>automatique chaque mois</strong>. 
            Plus besoin de reconnecter manuellement !
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'collaboration',
    category: 'Partage',
    icon: Users,
    title: 'Comment inviter ma famille ?',
    description: 'Gestion collaborative du budget',
    tags: ['partage', 'invitation', 'famille', 'collaboration'],
    content: (
      <div className="space-y-4">
        <p>Budget Famille est conçu pour la gestion à plusieurs :</p>

        <h4 className="font-semibold">Inviter un membre</h4>
        <ol className="list-decimal pl-6 text-sm space-y-2">
          <li>Cliquez sur le bouton "Inviter" en haut du budget</li>
          <li>Entrez l'adresse email du membre</li>
          <li>Il recevra un email d'invitation</li>
          <li>Il devra créer un compte (ou se connecter)</li>
          <li>Il aura accès au budget partagé !</li>
        </ol>

        <h4 className="font-semibold mt-4">Travail en temps réel</h4>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>Tous les membres voient les modifications en direct</li>
          <li>Notifications quand quelqu'un modifie le budget</li>
          <li>Système de commentaires pour communiquer</li>
        </ul>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>Attention:</strong> Tous les membres ont les mêmes droits. 
            Assurez-vous de faire confiance aux personnes que vous invitez !
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'location-settings',
    category: 'Paramètres',
    icon: TrendingUp,
    title: 'Comment changer ma localisation ?',
    description: 'Adapter les suggestions à votre pays',
    tags: ['localisation', 'pays', 'région', 'paramètres'],
    content: (
      <div className="space-y-4">
        <p>Vos suggestions de marché sont adaptées à votre pays :</p>

        <h4 className="font-semibold">Changer de pays</h4>
        <ol className="list-decimal pl-6 text-sm space-y-2">
          <li>Allez dans "Mon Profil" (icône utilisateur en haut à droite)</li>
          <li>Section "Localisation"</li>
          <li>Sélectionnez votre pays dans le menu déroulant</li>
          <li>Optionnel: ajoutez votre code postal</li>
          <li>Cliquez sur "Mettre à jour"</li>
        </ol>

        <h4 className="font-semibold mt-4">Pays supportés</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>🇫🇷 France</div>
          <div>🇧🇪 Belgique</div>
          <div>🇩🇪 Allemagne</div>
          <div>🇪🇸 Espagne</div>
          <div>🇮🇹 Italie</div>
          <div>🇵🇹 Portugal</div>
          <div>🇳🇱 Pays-Bas</div>
          <div>🇱🇺 Luxembourg</div>
          <div>🇦🇹 Autriche</div>
          <div>🇮🇪 Irlande</div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-4">
          <p className="text-sm text-green-800">
            ✅ Les suggestions d'économies s'adaptent automatiquement à votre pays !
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'data-security',
    category: 'Sécurité',
    icon: Shield,
    title: 'Comment mes données sont-elles protégées ?',
    description: 'Chiffrement, confidentialité, RGPD',
    tags: ['sécurité', 'chiffrement', 'rgpd', 'confidentialité'],
    content: (
      <div className="space-y-4">
        <h4 className="font-semibold">Chiffrement de bout en bout</h4>
        <p className="text-sm">
          Toutes vos données budgétaires sont chiffrées avant d'être envoyées à nos serveurs. 
          Même nous ne pouvons pas les lire.
        </p>

        <h4 className="font-semibold mt-4">Conformité RGPD</h4>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>Vous pouvez exporter toutes vos données (JSON)</li>
          <li>Vous pouvez supprimer votre compte à tout moment</li>
          <li>Suppression définitive sous 30 jours</li>
          <li>Aucune revente de données personnelles</li>
        </ul>

        <h4 className="font-semibold mt-4">Connexions bancaires</h4>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <ul className="list-disc pl-6 text-sm space-y-1 text-green-800">
            <li>Certification PSD2 via Enable Banking</li>
            <li>Vos identifiants bancaires ne transitent JAMAIS par nos serveurs</li>
            <li>Connexion directe banque ↔ vous</li>
            <li>Accès lecture seule uniquement</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'premium',
    category: 'Premium',
    icon: CreditCard,
    title: 'Qu\'est-ce que l\'offre Premium ?',
    description: 'Fonctionnalités avancées pour 2€/mois',
    tags: ['premium', 'abonnement', 'avantages'],
    content: (
      <div className="space-y-4">
        <p>L'offre Premium débloque des fonctionnalités avancées pour 2€/mois :</p>

        <h4 className="font-semibold">Avantages Premium</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Link className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Synchronisation bancaire automatique</p>
              <p className="text-xs text-muted-foreground">
                Vos comptes se synchronisent chaque mois sans intervention
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Reality Check avancé</p>
              <p className="text-xs text-muted-foreground">
                Analyse automatique des écarts budget vs réalité
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Suggestions IA illimitées</p>
              <p className="text-xs text-muted-foreground">
                Analyses mensuelles automatiques de toutes vos charges
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 mt-4">
          <p className="text-sm font-semibold mb-2">💎 Sans engagement</p>
          <ul className="text-xs space-y-1">
            <li>• Résiliable à tout moment</li>
            <li>• Paiement sécurisé par Stripe</li>
            <li>• Remboursement 7 jours si non satisfait</li>
          </ul>
        </div>
      </div>
    )
  }
];

export function HelpCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = HELP_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
  );

  const categories = [...new Set(HELP_ARTICLES.map(a => a.category))];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Centre d'Aide
          </DialogTitle>
        </DialogHeader>

        {!selectedArticle ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Articles Grid */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                {categories.map(category => {
                  const categoryArticles = filteredArticles.filter(a => a.category === category);
                  if (categoryArticles.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                        {category}
                      </h3>
                      <div className="grid gap-3">
                        {categoryArticles.map(article => {
                          const Icon = article.icon;
                          return (
                            <button
                              key={article.id}
                              onClick={() => setSelectedArticle(article)}
                              className="text-left p-4 rounded-lg border hover:border-primary hover:bg-accent transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">
                                    {article.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {article.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedArticle(null)}
              className="gap-2"
            >
              ← Retour aux articles
            </Button>

            {/* Article Header */}
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                {React.createElement(selectedArticle.icon, {
                  className: "h-8 w-8 text-primary"
                })}
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">
                  {selectedArticle.category}
                </Badge>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedArticle.title}
                </h2>
                <p className="text-muted-foreground">
                  {selectedArticle.description}
                </p>
              </div>
            </div>

            {/* Article Content */}
            <ScrollArea className="h-[400px] border-t pt-4">
              <div className="prose prose-sm max-w-none pr-4">
                {selectedArticle.content}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}