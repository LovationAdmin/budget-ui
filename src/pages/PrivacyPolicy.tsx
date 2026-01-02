import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Lock, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const { user } = useAuth();

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
        {/* ✅ CHANGÉ : Utilisation du composant Navbar avec items de navigation */}
      <Navbar />

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

          {/* NEW SECTION: Data Deletion */}
          <h3>Suppression du compte et des données</h3>
          <p>
            Vous gardez le contrôle total de vos informations. Conformément à votre droit à l'oubli, vous pouvez supprimer votre compte et l'intégralité de vos données associées à tout moment.
          </p>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3 not-prose my-6">
            <Trash2 className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
                <h4 className="font-semibold text-red-900 text-sm">Comment supprimer mes données ?</h4>
                <p className="text-sm text-red-800 mt-1">
                    Rendez-vous sur votre page <Link to="/profile" className="underline font-medium hover:text-red-950">Profil</Link>. 
                    Tout en bas, dans la section "Zone de danger", cliquez sur "Supprimer mon compte". 
                    Cette action est <strong>immédiate et irréversible</strong> : toutes vos données seront effacées de nos serveurs.
                </p>
            </div>
          </div>

          <h3>Contact</h3>
          <p>
            Pour toute question concernant vos données ou pour exercer vos droits d'accès et de rectification, vous pouvez contacter notre équipe :
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