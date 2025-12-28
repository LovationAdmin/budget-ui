import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, ChevronRight, HelpCircle, ShieldCheck, FlaskConical, Sparkles, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

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
    id: 'privacy',
    category: 'Sécurité',
    icon: ShieldCheck,
    title: 'Confidentialité & Données',
    description: 'Comment nous protégeons vos informations bancaires et personnelles.',
    tags: ['sécurité', 'chiffrement', 'données'],
    content: (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chiffrement de bout en bout</h3>
            <p className="text-sm text-gray-600">
                Vos données sont cryptées avant même d'arriver sur nos serveurs. Nous utilisons une architecture "Zero-Knowledge", ce qui signifie que nous n'avons techniquement pas accès à vos données brutes.
            </p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open('/privacy', '_blank')}>Voir la politique complète</Button>
            </div>
        </div>
    )
  },
  {
    id: 'suggestions',
    category: 'Économies',
    icon: Sparkles,
    title: 'Suggestions Intelligentes',
    description: 'Comprendre comment l\'IA analyse vos charges pour trouver des économies.',
    tags: ['ia', 'économies', 'charges', 'concurrents'],
    content: (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
                Notre intelligence artificielle analyse vos charges récurrentes (électricité, mobile, internet) pour trouver des offres moins chères sur le marché.
            </p>
            <h4 className="font-semibold text-sm">Comment ça marche ?</h4>
            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2">
                <li>Ajoutez une charge dans la section "Charges".</li>
                <li>L'IA détecte la catégorie (ex: Mobile).</li>
                <li>Elle compare votre montant avec les offres actuelles du marché.</li>
                <li>Si une économie est possible, une suggestion apparaît.</li>
            </ol>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800">
                <strong>Astuce :</strong> Vous pouvez désactiver les suggestions pour une charge spécifique en cliquant sur l'icône ampoule barrée 🚫💡.
            </div>
        </div>
    )
  },
  {
      id: 'reality-check',
      category: 'Outils',
      icon: FlaskConical,
      title: 'Reality Check (Beta)',
      description: 'Connectez votre banque pour comparer budget vs réalité.',
      tags: ['banque', 'connexion', 'transactions'],
      content: (
          <div className="space-y-4">
              <p className="text-sm text-gray-600">
                  Le Reality Check permet de connecter votre compte bancaire via Enable Banking (protocole sécurisé PSD2) pour comparer vos prévisions avec vos dépenses réelles.
              </p>
              <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs text-blue-800 mb-4">
                  <strong>Mode Beta :</strong> Utilisez le bouton de connexion dans la section "Reality Check" pour tester avec des données de démo ou vos vrais comptes.
              </div>
          </div>
      )
  },
  {
    id: 'collaboration',
    category: 'Général',
    icon: UserPlus,
    title: 'Inviter un membre',
    description: 'Partager votre budget avec votre famille.',
    tags: ['invitation', 'membre', 'partage'],
    content: (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
                Vous pouvez inviter votre conjoint(e) ou d'autres membres de la famille à rejoindre votre budget. Ils auront accès en temps réel à toutes les données.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>Allez dans le menu "Membres".</li>
                <li>Cliquez sur "Inviter".</li>
                <li>Entrez l'adresse email.</li>
            </ul>
        </div>
    )
  }
];

export function HelpCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = useMemo(() => {
      const terms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 2);
      if (terms.length === 0) return HELP_ARTICLES;

      return HELP_ARTICLES.filter(article => {
        const searchableText = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();
        return terms.every(term => searchableText.includes(term));
      });
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col md:flex-row bg-gray-50 sm:rounded-xl">
        
        {/* Sidebar / Liste */}
        <div className={cn(
            "w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col h-full",
            selectedArticle ? "hidden md:flex" : "flex"
        )}>
            <div className="p-4 border-b border-gray-100 bg-white">
                <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-display">
                        <BookOpen className="h-6 w-6 text-primary" /> Centre d'Aide
                    </DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Rechercher (ex: banque, projet...)" 
                        className="pl-9 bg-gray-50 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            
            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                    {filteredArticles.map(article => (
                        <button
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg text-sm transition-all flex items-start gap-3 group",
                                selectedArticle?.id === article.id 
                                    ? "bg-primary/10 text-primary ring-1 ring-primary/20" 
                                    : "hover:bg-gray-100 text-gray-700"
                            )}
                        >
                            <div className={cn(
                                "mt-0.5 p-1.5 rounded-md transition-colors",
                                selectedArticle?.id === article.id ? "bg-white/50" : "bg-gray-100 group-hover:bg-white"
                            )}>
                                {React.createElement(article.icon, { className: "h-4 w-4" })}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{article.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{article.description}</p>
                            </div>
                            <ChevronRight className={cn(
                                "h-4 w-4 mt-1 opacity-0 group-hover:opacity-50 transition-opacity",
                                selectedArticle?.id === article.id && "opacity-100 text-primary"
                            )} />
                        </button>
                    ))}
                    {filteredArticles.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                            <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Aucun résultat pour "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        {/* Content Area */}
        <div className={cn(
            "flex-1 bg-gray-50 flex flex-col h-full",
            !selectedArticle ? "hidden md:flex" : "flex"
        )}>
            {selectedArticle ? (
                <>
                    <div className="md:hidden p-4 bg-white border-b flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>← Retour</Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-8 max-w-3xl mx-auto">
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="outline" className="bg-white">{selectedArticle.category}</Badge>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                                    {selectedArticle.title}
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed">{selectedArticle.description}</p>
                            </div>
                            
                            <div className="prose prose-blue prose-sm md:prose-base max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                {selectedArticle.content}
                            </div>
                        </div>
                    </ScrollArea>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                    <div className="h-20 w-20 bg-gray-200/50 rounded-full flex items-center justify-center mb-6">
                        <HelpCircle className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Centre d'aide Budget Famille</p>
                    <p className="text-sm text-gray-500 mt-2">Sélectionnez un article à gauche pour commencer.</p>
                </div>
            )}
        </div>

      </DialogContent>
    </Dialog>
  );
}