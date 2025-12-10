// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/50 py-6 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Lovation</span>
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Budget Famille</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <Link to="/privacy" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <ShieldCheck className="h-4 w-4" />
            Confidentialité & Sécurité
          </Link>
          <a 
            href="mailto:lovation.pro@gmail.com" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}