// src/components/help/HelpCenter.tsx
// Help center dialog (app and public pages), in the language of the screen.
// The articles are in articles.fr.tsx and articles.en.tsx.

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, ChevronRight, HelpCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/locales';
import { defineMessages, useLocale, useT, wordsIn, type Messages } from '@/i18n/runtime';
import { HELP_ARTICLES_EN } from './articles.en';
import { HELP_ARTICLES_FR } from './articles.fr';
import type { HelpArticle } from './parts';

// ============================================================================
// MAIN COMPONENT: HELP CENTER
// ============================================================================

const ARTICLES: Messages<HelpArticle[]> = { fr: HELP_ARTICLES_FR, en: HELP_ARTICLES_EN };

const M = defineMessages({
  fr: {
    title: "Centre d'Aide",
    search: 'Rechercher (ex: banque, projet...)',
    noResult: (q: string) => `Aucun résultat pour "${q}"`,
    clear: 'Effacer la recherche',
    more: "Besoin d'aide supplémentaire ?",
    contact: 'Contacter le support',
    back: '← Retour',
    welcome: "Centre d'aide Budget Famille",
    pick: "Sélectionnez un article à gauche pour obtenir de l'aide sur une fonctionnalité spécifique.",
    articles: (n: number) => `${n} articles`,
    instant: 'Recherche instantanée',
  },
  en: {
    title: 'Help center',
    search: 'Search (e.g. bank, goal...)',
    noResult: (q: string) => `No results for "${q}"`,
    clear: 'Clear the search',
    more: 'Need more help?',
    contact: 'Contact support',
    back: '← Back',
    welcome: 'Budget Famille help center',
    pick: 'Pick an article on the left to get help with a specific feature.',
    articles: (n: number) => `${n} articles`,
    instant: 'Instant search',
  },
});

export function HelpCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT(M);
  const HELP_ARTICLES = wordsIn(ARTICLES, useLocale());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = useMemo(() => {
    const terms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 2);
    if (terms.length === 0) return HELP_ARTICLES;

    return HELP_ARTICLES.filter(article => {
      const searchableText = `${article.title} ${article.description} ${article.tags.join(' ')} ${article.category}`.toLowerCase();
      return terms.every(term => searchableText.includes(term));
    });
  }, [searchQuery, HELP_ARTICLES]);

  // Group articles by category
  const groupedArticles = useMemo(() => {
    const groups: Record<string, HelpArticle[]> = {};
    filteredArticles.forEach(article => {
      if (!groups[article.category]) {
        groups[article.category] = [];
      }
      groups[article.category].push(article);
    });
    return groups;
  }, [filteredArticles]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row bg-gray-50 sm:rounded-xl">
        
        {/* Sidebar / Liste */}
        <div className={cn(
          "w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full",
          selectedArticle ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-gray-100 bg-white">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-display">
                <BookOpen className="h-6 w-6 text-primary" /> {t.title}
              </DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t.search}
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-4">
              {Object.entries(groupedArticles).map(([category, articles]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {articles.map(article => (
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
                          "mt-0.5 p-1.5 rounded-md transition-colors flex-shrink-0",
                          selectedArticle?.id === article.id ? "bg-white/50" : "bg-gray-100 group-hover:bg-white"
                        )}>
                          {React.createElement(article.icon, { className: "h-4 w-4" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{article.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{article.description}</p>
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4 mt-1 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0",
                          selectedArticle?.id === article.id && "opacity-100 text-primary"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {filteredArticles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>{t.noResult(searchQuery)}</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    {t.clear}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Contact Footer */}
          <div className="p-4 border-t bg-gray-50">
            <p className="text-xs text-muted-foreground mb-2">{t.more}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open('mailto:lovation.pro@gmail.com')}
            >
              <Mail className="h-3 w-3 mr-2" />
              {t.contact}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 bg-gray-50 flex flex-col h-full",
          !selectedArticle ? "hidden md:flex" : "flex"
        )}>
          {selectedArticle ? (
            <>
              <div className="md:hidden p-4 bg-white border-b flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
                  {t.back}
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 md:p-8 max-w-3xl mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-white">{selectedArticle.category}</Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-display">
                      {selectedArticle.title}
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      {selectedArticle.description}
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                    {selectedArticle.content}
                  </div>

                  {/* Tags */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs cursor-pointer hover:bg-primary/10"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="h-20 w-20 bg-gray-200/50 rounded-full flex items-center justify-center mb-6">
                <HelpCircle className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">{t.welcome}</p>
              <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                {t.pick}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{t.articles(HELP_ARTICLES.length)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Search className="h-4 w-4" />
                  <span>{t.instant}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}