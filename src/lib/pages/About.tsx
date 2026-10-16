// src/pages/About.tsx
// About page, in French (/about) and English (/en/about).
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Heart, Target, Users, Lightbulb, Shield, Globe, Mail } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { defineMessages, useT } from '@/i18n/runtime';
import type { ReactNode } from 'react';

const VALUE_ICONS = [Shield, Users, Lightbulb, Heart];

const M = defineMessages({
  fr: {
    back: 'Retour',
    h1: 'Notre Mission',
    mission: 'Rendre la gestion de budget accessible, collaborative et sécurisée pour chacun, seul ou à plusieurs, en respectant la vie privée et en donnant les outils pour reprendre le contrôle de ses finances et de ses projets.',
    storyTitle: 'Notre Histoire',
    story: [
      <>Budget Famille est né d'un constat simple : <strong>gérer un budget ne devrait pas être compliqué</strong>, surtout à plusieurs. Trop souvent, on se retrouve perdu entre des tableurs Excel complexes ou des applications mobiles qui ne connaissent ni le pot commun ni vos projets.</>,
      <>Nous avons créé Budget Famille avec une vision claire : offrir une plateforme où la collaboration est au cœur de l'expérience, où la sécurité n'est pas une option mais une garantie, et où chacun (conjoint, enfant devenu grand, colocataire) peut contribuer au budget commun.</>,
      <>« Famille » au sens large : Budget Famille sert aussi bien à tenir un budget perso qu'à gérer une colocation ou à préparer un projet (voyage, mariage, travaux) avec un objectif et une date.</>,
    ] as ReactNode[],
    valuesTitle: 'Nos Valeurs',
    values: [
      { title: 'Confidentialité', description: 'Vos données vous appartiennent. Point final.' },
      { title: 'Collaboration', description: 'Un budget se construit souvent à plusieurs : en couple, en famille, en coloc' },
      { title: 'Simplicité', description: 'Des outils puissants, une interface intuitive' },
      { title: 'Empathie', description: 'Nous comprenons vos défis financiers quotidiens' },
    ],
    journeyTitle: 'Notre Parcours',
    milestones: [
      { year: '2025', title: 'Lancement', description: 'Budget Famille voit le jour' },
      { year: '2025 Q1', title: 'Beta Privée', description: 'Tests avec amis et famille' },
      { year: '2025 Q2', title: 'Beta 2', description: 'Connexion bancaire et IA' },
      { year: '2025 Q3', title: 'Expansion', description: '15 pays et 7 devises, dont le franc CFA et le dirham' },
    ],
    numbersTitle: 'Budget Famille en Chiffres',
    free: '0 €',
    eu: 'UE',
    numbers: ["Pour l'essentiel, sans carte bancaire", 'Pays, 7 devises', 'Budgets : foyer, coloc, projets', 'Données hébergées en Europe, jamais revendues'],
    techTitle: 'Technologie de Pointe',
    techText: 'Budget Famille est construit avec les technologies les plus modernes pour garantir performance, sécurité et expérience utilisateur optimale. React 18, WebSocket temps réel, chiffrement AES-256, API PSD2 pour les connexions bancaires, et IA Claude pour les suggestions personnalisées.',
    contactTitle: 'Restons en Contact',
    contactText: "Vous avez des questions, des suggestions ou simplement envie d'échanger ? Notre équipe est à votre écoute.",
  },
  en: {
    back: 'Back',
    h1: 'Our mission',
    mission: 'To make budgeting accessible, collaborative and secure for everyone, on your own or together, respecting privacy and giving you the tools to take back control of your finances and your goals.',
    storyTitle: 'Our story',
    story: [
      <>Budget Famille started from a simple observation: <strong>managing a budget shouldn’t be complicated</strong>, especially together. Too often, people get lost between complex spreadsheets and mobile apps that know nothing about a joint pot or your goals.</>,
      <>We built Budget Famille with a clear vision: a platform where collaboration is at the heart of the experience, where security isn’t an option but a guarantee, and where everyone (a partner, a grown-up child, a roommate) can contribute to the shared budget.</>,
      <>“Famille” means family, in the broad sense: Budget Famille works just as well for a personal budget as for a shared flat or for preparing a goal (a trip, a wedding, renovations) with a target and a date.</>,
    ] as ReactNode[],
    valuesTitle: 'Our values',
    values: [
      { title: 'Privacy', description: 'Your data belongs to you. Full stop.' },
      { title: 'Collaboration', description: 'A budget is often built together: as a couple, as a family, with roommates' },
      { title: 'Simplicity', description: 'Powerful tools, an intuitive interface' },
      { title: 'Empathy', description: 'We understand your everyday money challenges' },
    ],
    journeyTitle: 'Our journey',
    milestones: [
      { year: '2025', title: 'Launch', description: 'Budget Famille is born' },
      { year: '2025 Q1', title: 'Private beta', description: 'Testing with friends and family' },
      { year: '2025 Q2', title: 'Beta 2', description: 'Bank connection and AI' },
      { year: '2025 Q3', title: 'Expansion', description: '15 countries and 7 currencies, including the CFA franc and the dirham' },
    ],
    numbersTitle: 'Budget Famille in numbers',
    free: '0',
    eu: 'EU',
    numbers: ['For the essentials, no credit card', 'Countries, 7 currencies', 'Budgets: household, shared flat, goals', 'Data hosted in Europe, never sold'],
    techTitle: 'Modern technology',
    techText: 'Budget Famille is built with modern technology for performance, security and a great user experience: React 18, real-time WebSocket, AES-256 encryption, PSD2 APIs for bank connections, and Claude AI for personalized suggestions.',
    contactTitle: 'Get in touch',
    contactText: 'Questions, suggestions, or just want to chat? Our team is listening.',
  },
});

export default function About() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const t = useT(M);
  const values = t.values.map((v, i) => ({ ...v, icon: VALUE_ICONS[i] }));
  const milestones = t.milestones;

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
        <div className="text-center mb-20">
          <div className="inline-flex h-20 w-20 items-center justify-center bg-primary rounded-2xl mb-6">
            <span className="text-4xl font-bold text-primary-foreground">B</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            {t.h1}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.mission}
          </p>
        </div>

        {/* Story */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-lg p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 text-center">
                {t.storyTitle}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="leading-relaxed mb-4">{t.story[0]}</p>
                <p className="leading-relaxed mb-4">{t.story[1]}</p>
                <p className="leading-relaxed">{t.story[2]}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
            {t.valuesTitle}
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
            {t.journeyTitle}
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
              {t.numbersTitle}
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{t.free}</div>
                <div className="text-primary-100">{t.numbers[0]}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">15</div>
                <div className="text-primary-100">{t.numbers[1]}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">∞</div>
                <div className="text-primary-100">{t.numbers[2]}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{t.eu}</div>
                <div className="text-primary-100">{t.numbers[3]}</div>
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
                {t.techTitle}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                {t.techText}
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
            {t.contactTitle}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.contactText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:lovation.pro@gmail.com"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 font-medium transition"
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