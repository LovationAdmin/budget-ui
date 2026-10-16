// src/pages/Blog.tsx
// Blog index (/blog in French, /en/blog in English): every article of the
// language (src/data/blog-articles*.tsx, one source of truth with the article
// pages and the prerender), each card a real link so readers and search
// engines reach all articles.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Calendar,
  Clock,
  Tag,
  TrendingUp,
  Users,
  PiggyBank,
  Target,
  Lightbulb,
  Globe2,
  GraduationCap,
  FileSpreadsheet,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { articlePath, articlesByDate } from '@/data/blog-related';
import { localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';
import { intlLocale } from '@/lib/budget/format';

const CATEGORY_ICONS: Record<string, typeof TrendingUp> = {
  Méthodes: Target,
  Économies: PiggyBank,
  Couple: Users,
  Épargne: TrendingUp,
  Technologie: Lightbulb,
  International: Globe2,
  Étudiants: GraduationCap,
  Method: Target,
  Couples: Users,
  Savings: TrendingUp,
};

const M = defineMessages({
  fr: {
    all: 'Tous',
    back: 'Retour',
    badge: 'Conseils & Astuces',
    title: 'Blog Budget Famille',
    intro: 'Guides pratiques pour gérer son budget, seul ou à plusieurs : famille, couple, budget perso, épargne pour un projet, économies.',
    search: 'Rechercher un article...',
    featured: 'Articles en vedette',
    read: 'Lire →',
    allArticles: 'Tous les articles',
    none: 'Aucun article trouvé',
    by: (author: string) => `Par ${author}`,
    nextTitle: 'Passez de la lecture à votre budget',
    nextText: 'Un tableau gratuit à télécharger, ou l’application qui calcule chaque mois pour vous.',
    template: 'Tableau budget familial gratuit',
    signup: 'Créer mon budget gratuit',
  },
  en: {
    all: 'All',
    back: 'Back',
    badge: 'Tips & guides',
    title: 'The Budget Famille blog',
    intro: 'Practical guides to manage your budget, on your own or together: family, couple, personal budget, saving for a goal, cutting costs.',
    search: 'Search an article...',
    featured: 'Featured articles',
    read: 'Read →',
    allArticles: 'All articles',
    none: 'No article found',
    by: (author: string) => `By ${author}`,
    nextTitle: 'From reading to your own budget',
    nextText: 'A free template to download, or the app that does the math for you every month.',
    template: 'Free family budget template',
    signup: 'Create my free budget',
  },
});

const formatDate = (iso: string, month: 'long' | 'short') =>
  new Date(iso).toLocaleDateString(intlLocale(), { day: 'numeric', month, year: 'numeric' });

export default function Blog() {
  const navigate = useNavigate();
  const t = useT(M);
  const locale = useLocale();
  const blogPosts = articlesByDate(locale);
  const categories = [
    { name: t.all, icon: TrendingUp },
    ...[...new Set(blogPosts.map((p) => p.category))].map((name) => ({ name, icon: CATEGORY_ICONS[name] ?? Tag })),
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.all);

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === t.all || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      {/* ✅ CHANGÉ : Utilisation du composant Navbar avec items de navigation */}
    <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Lightbulb className="h-4 w-4" />
            {t.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.intro}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Posts */}
        {selectedCategory === t.all && searchQuery === '' && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              {t.featured}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={articlePath(post)}
                  className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="h-48 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold opacity-20" aria-hidden="true">
                      {post.category.charAt(0)}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-3">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.updatedAt ?? post.publishedAt, 'long')}
                      </div>
                      <span className="text-sm font-semibold text-primary">{t.read}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
            {filteredPosts.length > 0 ? t.allArticles : t.none}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={articlePath(post)}
                className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    {t.by(post.author)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.updatedAt ?? post.publishedAt, 'short')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Next steps */}
        <section className="mt-20 bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            {t.nextTitle}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t.nextText}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
              <Link to={localizedPath('/tableau-budget-familial-gratuit', locale)}>
                <FileSpreadsheet className="mr-2 h-5 w-5" aria-hidden="true" /> {t.template}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/10 font-semibold">
              <Link to="/signup">
                {t.signup} <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}