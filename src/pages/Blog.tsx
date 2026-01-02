// src/pages/Blog.tsx
// 📝 Blog Budget Famille - 5 Articles SEO Optimisés

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { Footer } from '@/components/Footer';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Clock, 
  Tag,
  TrendingUp,
  Users,
  PiggyBank,
  Target,
  Lightbulb
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: "Les 5 Étapes Essentielles pour Gérer son Budget Familial en 2025",
    slug: "5-etapes-gerer-budget-familial-2025",
    excerpt: "Découvrez notre méthode éprouvée pour reprendre le contrôle de vos finances familiales. De la définition des objectifs à la mise en place d'un rituel mensuel, tout ce qu'il faut savoir pour réussir.",
    category: "Méthodes",
    author: "Équipe Budget Famille",
    publishedAt: "2025-01-02",
    readTime: "7 min",
    tags: ["Budget", "Famille", "Méthode", "Débutant"],
    featured: true
  },
  {
    id: '2',
    title: "Comment Économiser 500€ par an sur vos Abonnements (Énergie, Internet, Assurances)",
    slug: "economiser-500-euros-abonnements",
    excerpt: "Notre IA a analysé des milliers de budgets et identifié les postes de dépenses où les familles peuvent économiser le plus. Voici comment réduire vos charges fixes sans sacrifier votre confort.",
    category: "Économies",
    author: "Sophie Martin",
    publishedAt: "2025-12-28",
    readTime: "6 min",
    tags: ["Économies", "Abonnements", "IA", "Optimisation"],
    featured: true
  },
  {
    id: '3',
    title: "Budget Couple : 7 Règles d'Or pour Gérer l'Argent à Deux sans Conflits",
    slug: "budget-couple-regles-gerer-argent",
    excerpt: "L'argent est la première cause de disputes dans les couples. Découvrez nos 7 règles d'or pour une gestion financière harmonieuse à deux, avec transparence et respect.",
    category: "Couple",
    author: "Thomas Dubois",
    publishedAt: "2025-12-20",
    readTime: "8 min",
    tags: ["Couple", "Communication", "Collaboration", "Budget"],
    featured: true
  },
  {
    id: '4',
    title: "Épargne Enfants : Comment Construire un Capital pour vos Enfants dès Aujourd'hui",
    slug: "epargne-enfants-construire-capital",
    excerpt: "Livret A, assurance-vie, PEA... Quel placement choisir pour préparer l'avenir de vos enfants ? Comparatif complet des solutions d'épargne adaptées aux familles en 2025.",
    category: "Épargne",
    author: "Laurent Bernard",
    publishedAt: "2025-12-15",
    readTime: "10 min",
    tags: ["Épargne", "Enfants", "Placements", "Avenir"],
    featured: false
  },
  {
    id: '5',
    title: "Connexion Bancaire PSD2 : Tout Comprendre en 5 Minutes (Sécurité & Avantages)",
    slug: "connexion-bancaire-psd2-securite",
    excerpt: "PSD2, Open Banking, agrégation de comptes... Ces termes vous semblent flous ? Découvrez comment connecter votre banque en toute sécurité et les avantages concrets pour votre budget.",
    category: "Technologie",
    author: "Marie Leroy",
    publishedAt: "2025-12-10",
    readTime: "5 min",
    tags: ["PSD2", "Sécurité", "Banking", "Technologie"],
    featured: false
  }
];

const categories = [
  { name: "Tous", icon: TrendingUp },
  { name: "Méthodes", icon: Target },
  { name: "Économies", icon: PiggyBank },
  { name: "Couple", icon: Users },
  { name: "Épargne", icon: TrendingUp },
  { name: "Technologie", icon: Lightbulb }
];

export default function Blog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'Tous' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <BudgetNavbar 
        budgetTitle="Blog & Conseils"
        userName={user?.name}
        userAvatar={user?.avatar}
        items={[]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Lightbulb className="h-4 w-4" />
            Conseils & Astuces
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Blog Budget Famille
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Guides pratiques, astuces et conseils pour gérer votre budget familial 
            comme un pro. Mis à jour régulièrement par notre équipe d'experts.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un article..."
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
                      ? 'bg-primary text-white shadow-md' 
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
        {selectedCategory === 'Tous' && searchQuery === '' && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Articles en vedette
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article 
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold opacity-20">
                      {post.id}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary">
                        Lire →
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
            {filteredPosts.length > 0 ? 'Tous les articles' : 'Aucun article trouvé'}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
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
                    Par {post.author}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-20 bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ne manquez aucun conseil
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Recevez nos meilleurs articles et astuces directement dans votre boîte mail
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <Input
              type="email"
              placeholder="Votre email"
              className="bg-white text-gray-900 h-12"
            />
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
              S'abonner
            </Button>
          </div>
          <p className="text-sm mt-4 opacity-75">
            Pas de spam, désinscription possible à tout moment
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}