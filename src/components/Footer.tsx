// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, HelpCircle, FileText, Sparkles, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/50 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-xl text-foreground">Budget Famille</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Gérez votre budget familial en toute simplicité et sécurité.
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Lovation</span> &copy; {new Date().getFullYear()}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produit</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/features" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link 
                  to="/premium" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Premium
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/help" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  Centre d'aide
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@budgetfamille.com" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Info className="h-4 w-4" />
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  CGU
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Données chiffrées AES-256</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">RGPD Compliant</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Made in Europe 🇪🇺</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a 
                href="mailto:lovation.pro@gmail.com" 
                className="hover:text-primary transition-colors"
              >
                lovation.pro@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}