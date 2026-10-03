// src/pages/BlogArticle.tsx
// Page dynamique pour afficher un article de blog

import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { applyHead } from '@/seo/head';
import { blogArticles } from '@/data/blog-articles';
import { relatedArticles } from '@/data/blog-related';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, ArrowRight, Calendar, Clock, FileSpreadsheet, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Trouver l'article correspondant au slug
  const article = blogArticles.find(a => a.slug === slug);

  useEffect(() => {
    if (article) {
      applyHead({ title: article.title, description: article.excerpt, canonical: `/blog/${article.slug}`, type: 'article' });
    } else {
      applyHead({ title: 'Article introuvable', description: 'Cet article n’existe pas.', canonical: `/blog/${slug ?? ''}`, noindex: true });
    }
  }, [article, slug]);

  // Si l'article n'existe pas, afficher une erreur
  if (!article) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
          {/* ✅ CHANGÉ : Utilisation du composant Navbar avec items de navigation */}
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <p className="text-gray-600 mb-8">Désolé, cet article n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/blog')} variant="gradient">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      {/* ✅ CHANGÉ : Utilisation du composant Navbar avec items de navigation */}
    <Navbar />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </button>

        {/* En-tête article */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{article.author}</div>
                <div className="text-sm text-gray-500">{article.authorBio}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {article.updatedAt ? 'Mis à jour le ' : ''}
              {new Date(article.updatedAt ?? article.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* Contenu article */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          {article.content}
        </div>

        {/* Tags */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span 
                key={tag}
                className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related reading: internal links for readers and crawlers */}
        <section className="mb-12" aria-labelledby="related-title">
          <h2 id="related-title" className="text-2xl font-display font-bold text-gray-900 mb-6">À lire aussi</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles(article).map((a) => (
              <Link
                key={a.slug}
                to={`/blog/${a.slug}`}
                className="group block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{a.category}</span>
                <h3 className="mt-1 font-bold text-gray-900 group-hover:text-primary">{a.title}</h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{a.excerpt}</p>
              </Link>
            ))}
            <Link
              to="/tableau-budget-familial-gratuit"
              className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FileSpreadsheet className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
              <span>
                <span className="block font-bold text-gray-900 group-hover:text-primary">Tableau de budget familial gratuit</span>
                <span className="mt-1 block text-sm text-gray-600">Excel avec calculs automatiques, ou PDF à imprimer. Sans inscription.</span>
              </span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Votre budget familial, calculé chaque mois
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Gratuit, sans carte bancaire, à plusieurs en temps réel.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
            <Link to="/signup">
              Créer mon budget gratuit <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </article>

      <Footer />
    </div>
  );
}