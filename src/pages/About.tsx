// src/pages/About.tsx
import { useNavigate } from 'react-router-dom';
import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Heart, Target, Users, Lightbulb, Shield, Globe, Mail } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function About() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const values = [
    {
      icon: Shield,
      title: "Confidentialité",
      description: "Vos données vous appartiennent. Point final."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "La gestion de budget est une aventure familiale"
    },
    {
      icon: Lightbulb,
      title: "Simplicité",
      description: "Des outils puissants, une interface intuitive"
    },
    {
      icon: Heart,
      title: "Empathie",
      description: "Nous comprenons vos défis financiers quotidiens"
    }
  ];

  const milestones = [
    { year: "2024", title: "Lancement", description: "Budget Famille voit le jour" },
    { year: "2024 Q3", title: "1000+ Utilisateurs", description: "Une communauté grandissante" },
    { year: "2024 Q4", title: "Beta 2", description: "Connexion bancaire et IA" },
    { year: "2025", title: "Expansion", description: "10 pays européens supportés" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <BudgetNavbar 
        budgetTitle="À Propos"
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
        <div className="text-center mb-20">
          <div className="inline-flex h-20 w-20 items-center justify-center bg-primary rounded-2xl mb-6">
            <span className="text-4xl font-bold text-white">B</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Notre Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Rendre la gestion de budget accessible, collaborative et sécurisée pour toutes les familles, 
            en respectant leur vie privée et en leur donnant les outils pour reprendre le contrôle de 
            leurs finances.
          </p>
        </div>

        {/* Story */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-lg p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 text-center">
                Notre Histoire
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="leading-relaxed mb-4">
                  Budget Famille est né d'un constat simple : <strong>gérer un budget familial ne devrait pas 
                  être compliqué</strong>. Trop souvent, les familles se retrouvent perdues entre des tableurs 
                  Excel complexes ou des applications mobiles qui ne répondent pas à leurs besoins.
                </p>
                <p className="leading-relaxed mb-4">
                  Nous avons créé Budget Famille avec une vision claire : offrir une plateforme où la collaboration 
                  est au cœur de l'expérience, où la sécurité n'est pas une option mais une garantie, et où chaque 
                  membre de la famille peut contribuer à la santé financière du foyer.
                </p>
                <p className="leading-relaxed">
                  Aujourd'hui, des milliers de familles à travers l'Europe nous font confiance pour gérer leurs 
                  finances. Et ce n'est que le début.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
            Nos Valeurs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Milestones */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
            Notre Parcours
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20" />
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="text-primary font-bold text-sm mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative flex-shrink-0">
                      <div className="h-4 w-4 bg-primary rounded-full border-4 border-white shadow-lg" />
                    </div>
                    
                    <div className="flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-display font-bold mb-12 text-center">
              Budget Famille en Chiffres
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">1K+</div>
                <div className="text-primary-100">Familles utilisatrices</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">10</div>
                <div className="text-primary-100">Pays européens</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-primary-100">Gratuit pour toujours</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">24/7</div>
                <div className="text-primary-100">Synchronisation</div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-lg p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
                Technologie de Pointe
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                Budget Famille est construit avec les technologies les plus modernes pour garantir performance, 
                sécurité et expérience utilisateur optimale. React 18, WebSocket temps réel, chiffrement AES-256, 
                API PSD2 pour les connexions bancaires, et IA Claude pour les suggestions personnalisées.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">React 18</span>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">Go Backend</span>
                <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">PostgreSQL</span>
                <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-lg font-medium">Claude AI</span>
                <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium">WebSocket</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-3xl p-12 text-center">
          <Mail className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Restons en Contact
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Vous avez des questions, des suggestions ou simplement envie d'échanger ? 
            Notre équipe est à votre écoute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:lovation.pro@gmail.com"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-medium transition"
            >
              <Mail className="h-5 w-5" />
              lovation.pro@gmail.com
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}