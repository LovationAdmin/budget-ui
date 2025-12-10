import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { Footer } from '@/components/Footer';
import { Shield, Lock, EyeOff, Server, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivacyPolicy() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <BudgetNavbar items={[]} userName={user?.name} />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h1>
          <p className="text-xl text-gray-600">
            Chez Lovation, la sécurité de vos données financières est notre priorité absolue.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Chiffrement de Bout en Bout</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Toutes vos données budgétaires (salaires, charges, projets) sont chiffrées avec le standard militaire <strong>AES-256</strong> avant même d'être enregistrées dans notre base de données.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <EyeOff className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Accès "Zero-Knowledge"</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Même nos administrateurs ne peuvent pas lire vos données brutes. Pour accéder à votre budget en cas de support technique, nous sommes obligés de réinitialiser votre mot de passe, une action qui vous est immédiatement notifiée.
            </p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3>Collecte et Utilisation</h3>
          <p>
            L'application <strong>Budget Famille</strong>, développée par <strong>Lovation</strong>, collecte uniquement les données nécessaires au fonctionnement du service :
          </p>
          <ul>
            <li>Votre email (pour l'authentification et les invitations).</li>
            <li>Vos données budgétaires (qui sont stockées de manière chiffrée).</li>
          </ul>
          <p>Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers.</p>

          <h3>Hébergement</h3>
          <p>
            Vos données sont hébergées sur des serveurs sécurisés en Europe, conformes aux normes RGPD.
          </p>

          <h3>Contact</h3>
          <p>
            Pour toute question concernant vos données ou pour exercer vos droits d'accès et de suppression, vous pouvez contacter notre équipe :
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 not-prose">
            <strong>Lovation</strong><br/>
            Email : <a href="mailto:lovation.pro@gmail.com" className="text-primary hover:underline">lovation.pro@gmail.com</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}