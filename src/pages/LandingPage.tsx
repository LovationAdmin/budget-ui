// src/pages/LandingPage.tsx
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Users } from 'lucide-react';

// Import distinct sections (you might need to extract these from your existing pages)
import HeroSection from '@/components/landing/HeroSection';
import FeaturesTeaser from '@/components/landing/FeaturesTeaser';
import SmartToolsTeaser from '@/components/landing/SmartToolsTeaser'; // Simplified version of SmartTools
import BlogTeaser from '@/components/landing/BlogTeaser';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar /> {/* Ensure Navbar handles public state correctly */}
      
      <main className="flex-1">
        {/* 1. HERO: Strong Value Prop + Signup CTA */}
        <HeroSection />

        {/* 2. SMART TOOL TEASER: Interactive Hook */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-display">Testez notre IA gratuitement</h2>
              <p className="text-muted-foreground">Estimez vos Ã©conomies potentielles en 30 secondes</p>
            </div>
            {/* Embed a simplified version of your SmartTools form here */}
            <SmartToolsTeaser /> 
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => navigate('/smart-tools')}>
                Voir l'outil complet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* 3. FEATURES TEASER: Top 3 Selling Points */}
        <FeaturesTeaser />

        {/* 4. BLOG TEASER: Content Marketing */}
        <BlogTeaser />
        
        {/* 5. FINAL CTA */}
        <section className="py-20 bg-primary text-white text-center">
          <h2 className="text-3xl font-bold mb-6">PrÃªt Ã  maÃ®triser votre budget ?</h2>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-primary bg-white hover:bg-gray-100"
            onClick={() => navigate('/signup')}
          >
            Commencer gratuitement
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}