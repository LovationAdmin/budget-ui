// src/pages/Terms.tsx
import { useNavigate } from 'react-router-dom';
import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, FileText, Shield, Users, Database, Mail } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function Terms() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <BudgetNavbar 
        budgetTitle="Conditions Générales"
        userName={user?.name}
        userAvatar={user?.avatar}
        items={[]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : 30 décembre 2024
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">Sommaire</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#article-1" className="text-primary-600 hover:underline">1. Objet</a></li>
              <li><a href="#article-2" className="text-primary-600 hover:underline">2. Acceptation des Conditions</a></li>
              <li><a href="#article-3" className="text-primary-600 hover:underline">3. Services Proposés</a></li>
              <li><a href="#article-4" className="text-primary-600 hover:underline">4. Compte Utilisateur</a></li>
              <li><a href="#article-5" className="text-primary-600 hover:underline">5. Protection des Données (RGPD)</a></li>
              <li><a href="#article-6" className="text-primary-600 hover:underline">6. Propriété Intellectuelle</a></li>
              <li><a href="#article-7" className="text-primary-600 hover:underline">7. Responsabilités</a></li>
              <li><a href="#article-8" className="text-primary-600 hover:underline">8. Droit Applicable</a></li>
            </ul>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Article 1 */}
            <section id="article-1" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                Objet
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'utilisation du service 
                Budget Famille accessible à l'adresse <strong>budgetfamille.com</strong> (ci-après « le Service »).
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                Budget Famille est une application web de gestion de budget familial permettant aux utilisateurs de 
                planifier, suivre et partager leurs finances en temps réel.
              </p>
            </section>

            {/* Article 2 */}
            <section id="article-2" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                Acceptation des Conditions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU. En créant un compte 
                ou en utilisant le Service, vous reconnaissez avoir lu, compris et accepté ces conditions.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>Important :</strong> Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Service.
                </p>
              </div>
            </section>

            {/* Article 3 */}
            <section id="article-3" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
                Services Proposés
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Budget Famille propose les services suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Création et gestion de budgets familiaux</li>
                <li>Suivi des revenus et dépenses</li>
                <li>Planification de projets financiers</li>
                <li>Partage collaboratif avec membres de la famille</li>
                <li>Synchronisation en temps réel</li>
                <li>Connexion bancaire sécurisée (fonctionnalité Beta)</li>
                <li>Suggestions d'économies par IA</li>
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <p className="text-sm text-amber-900">
                  <strong>Disponibilité :</strong> Nous nous efforçons d'assurer une disponibilité maximale du Service, 
                  mais des interruptions temporaires peuvent survenir pour maintenance ou mises à jour.
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section id="article-4" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
                Compte Utilisateur
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Création de Compte</h3>
              <p className="text-gray-700 leading-relaxed">
                Pour utiliser le Service, vous devez créer un compte en fournissant :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Une adresse email valide</li>
                <li>Un mot de passe sécurisé (minimum 8 caractères)</li>
                <li>Un nom d'utilisateur</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Sécurité du Compte</h3>
              <p className="text-gray-700 leading-relaxed">
                Vous êtes responsable de :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>La confidentialité de vos identifiants</li>
                <li>Toute activité effectuée depuis votre compte</li>
                <li>Nous informer immédiatement en cas d'utilisation non autorisée</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Résiliation</h3>
              <p className="text-gray-700 leading-relaxed">
                Vous pouvez supprimer votre compte à tout moment depuis votre profil. La suppression est définitive 
                et entraîne la suppression de toutes vos données conformément au RGPD.
              </p>
            </section>

            {/* Article 5 - RGPD */}
            <section id="article-5" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
                Protection des Données (RGPD)
              </h2>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-green-900 mb-2">Engagement RGPD</p>
                    <p className="text-sm text-green-800">
                      Budget Famille est conforme au Règlement Général sur la Protection des Données (RGPD). 
                      Vos données sont chiffrées et vous en gardez le contrôle total.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Données Collectées</h3>
              <p className="text-gray-700 leading-relaxed mb-3">Nous collectons uniquement :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Données d'identification :</strong> Email, nom, avatar (optionnel)</li>
                <li><strong>Données de budget :</strong> Revenus, dépenses, projets (chiffrées)</li>
                <li><strong>Données techniques :</strong> Logs de connexion, adresse IP</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Utilisation des Données</h3>
              <p className="text-gray-700 leading-relaxed">Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Fournir et améliorer le Service</li>
                <li>Assurer la sécurité de votre compte</li>
                <li>Vous envoyer des notifications importantes</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Nous ne vendons jamais vos données à des tiers.</strong>
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Vos Droits RGPD</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Database className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Droit d'accès</h4>
                  <p className="text-sm text-gray-600">Consulter toutes vos données à tout moment</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Droit de rectification</h4>
                  <p className="text-sm text-gray-600">Modifier vos informations personnelles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Droit à l'effacement</h4>
                  <p className="text-sm text-gray-600">Supprimer définitivement votre compte</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h4>
                  <p className="text-sm text-gray-600">Exporter toutes vos données en JSON</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.4 Sécurité</h3>
              <p className="text-gray-700 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité robustes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li><strong>Chiffrement AES-256</strong> de vos données budget</li>
                <li><strong>Authentification 2FA</strong> (TOTP) disponible</li>
                <li><strong>Connexions HTTPS</strong> uniquement</li>
                <li><strong>Hébergement sécurisé</strong> avec backups quotidiens</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.5 Contact DPO</h3>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Pour toute question sur vos données :</p>
                    <a href="mailto:privacy@budgetfamille.com" className="text-primary-600 font-medium hover:underline">
                      privacy@budgetfamille.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Article 6 */}
            <section id="article-6" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
                Propriété Intellectuelle
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Le Service, son design, son code source, sa marque et tous les éléments qui le composent sont la 
                propriété exclusive de Budget Famille et sont protégés par les lois sur la propriété intellectuelle.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Vos données vous appartiennent.</strong> Vous conservez tous les droits sur les données que 
                vous créez dans le Service.
              </p>
            </section>

            {/* Article 7 */}
            <section id="article-7" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
                Responsabilités
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.1 Notre Responsabilité</h3>
              <p className="text-gray-700 leading-relaxed">
                Nous nous efforçons de fournir un Service fiable et sécurisé. Cependant, Budget Famille ne peut être 
                tenu responsable :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Des décisions financières prises sur la base des données du Service</li>
                <li>Des pertes de données dues à des erreurs utilisateur</li>
                <li>Des interruptions de service indépendantes de notre volonté</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Votre Responsabilité</h3>
              <p className="text-gray-700 leading-relaxed">
                Vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Utiliser le Service de manière légale et éthique</li>
                <li>Ne pas tenter de compromettre la sécurité du Service</li>
                <li>Vérifier l'exactitude de vos données saisies</li>
                <li>Respecter les droits des autres utilisateurs</li>
              </ul>
            </section>

            {/* Article 8 */}
            <section id="article-8" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
                Droit Applicable et Juridiction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes CGU sont régies par le droit français. En cas de litige, et après tentative de 
                résolution amiable, les tribunaux français seront seuls compétents.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Médiation :</strong> Conformément à l'article L.612-1 du Code de la consommation, vous 
                  pouvez recourir gratuitement à un médiateur de la consommation en cas de litige.
                </p>
              </div>
            </section>

            {/* Modifications */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications des CGU</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront 
                informés par email des modifications importantes. La poursuite de l'utilisation du Service après 
                modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-primary-50 rounded-xl p-6 mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions ?</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant ces conditions générales :
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:lovation.pro@gmail.com" className="text-primary-600 hover:underline">
                    lovation.pro@gmail.com
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}