// src/lib/pages/PrivacyPolicy.tsx
// Privacy policy, in French (/privacy) and English (/en/privacy). The English
// version is a translation: the French one prevails, and the page says so.
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Lock, EyeOff, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defineMessages, useT } from '@/i18n/runtime';

const profile = (label: string) => <Link to="/profile" className="underline font-medium hover:text-red-950">{label}</Link>;

const M = defineMessages<{
  title: string; lead: string; prevails?: ReactNode;
  encryptionTitle: string; encryption: ReactNode; accessTitle: string; access: string;
  collectionTitle: string; collection: ReactNode; collected: string[]; noSale: string;
  hostingTitle: string; hosting: string; deletionTitle: string; deletion: string; unconfirmed: string;
  howTitle: string; how: ReactNode; contactTitle: string; contact: string; email: string;
}>({
  fr: {
    title: 'Politique de Confidentialité',
    lead: 'Chez Lovation, la sécurité de vos données financières est notre priorité absolue.',
    encryptionTitle: 'Chiffré avant d’être enregistré',
    encryption: <>Toutes vos données budgétaires (salaires, charges, projets) sont chiffrées avec le standard militaire <strong>AES-256</strong> avant même d'être enregistrées dans notre base de données.</>,
    accessTitle: 'Accès Restreint et Journalisé',
    access: 'Vos données budgétaires (salaires, charges, projets) sont stockées chiffrées en base avec AES-256-GCM. L\'accès aux données déchiffrées par notre équipe technique est strictement limité aux opérations de support, journalisé, et notifié à l\'utilisateur. Aucun accès commercial, marketing ou analytique n\'est autorisé sur les données de budget.',
    collectionTitle: 'Collecte et Utilisation',
    collection: <>L'application <strong>Budget Famille</strong>, développée par <strong>Lovation</strong>, collecte uniquement les données nécessaires au fonctionnement du service :</>,
    collected: ['Votre email (pour l\'authentification et les invitations).', 'Vos données budgétaires (qui sont stockées de manière chiffrée).'],
    noSale: 'Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers.',
    hostingTitle: 'Hébergement',
    hosting: 'Vos données sont hébergées sur des serveurs sécurisés en Europe, conformes aux normes RGPD.',
    deletionTitle: 'Suppression du compte et des données',
    deletion: 'Vous gardez le contrôle total de vos informations. Conformément à votre droit à l\'oubli, vous pouvez supprimer votre compte et l\'intégralité de vos données associées à tout moment.',
    unconfirmed: 'Un compte dont l’adresse e-mail n’a jamais été confirmée est supprimé automatiquement au bout de 30 jours. Un e-mail vous prévient une semaine avant, avec un lien pour le confirmer.',
    howTitle: 'Comment supprimer mes données ?',
    how: <>Rendez-vous sur votre page {profile('Profil')}. Tout en bas, dans la section "Zone de danger", cliquez sur "Supprimer mon compte". Cette action est <strong>immédiate et irréversible</strong> : toutes vos données seront effacées de nos serveurs.</>,
    contactTitle: 'Contact',
    contact: 'Pour toute question concernant vos données ou pour exercer vos droits d\'accès et de rectification, vous pouvez contacter notre équipe :',
    email: 'Email :',
  },
  en: {
    title: 'Privacy policy',
    lead: 'At Lovation, the security of your financial data is our top priority.',
    prevails: <>This is a translation for your convenience: the <Link to="/privacy" hrefLang="fr" className="font-medium text-primary hover:underline">French version</Link> prevails.</>,
    encryptionTitle: 'Encrypted before it’s stored',
    encryption: <>All your budget data (pay, bills, projects) is encrypted with the <strong>AES-256</strong> standard before it’s even saved in our database.</>,
    accessTitle: 'Restricted, logged access',
    access: 'Your budget data (pay, bills, projects) is stored encrypted in the database with AES-256-GCM. Access to decrypted data by our technical team is strictly limited to support operations, logged, and notified to the user. No commercial, marketing or analytics access to budget data is allowed.',
    collectionTitle: 'What we collect and why',
    collection: <>The <strong>Budget Famille</strong> app, developed by <strong>Lovation</strong>, collects only the data the service needs to work:</>,
    collected: ['Your email address (for sign-in and invitations).', 'Your budget data (which is stored encrypted).'],
    noSale: 'We never sell, rent or share your personal data with third parties.',
    hostingTitle: 'Hosting',
    hosting: 'Your data is hosted on secure servers in Europe, in line with the GDPR.',
    deletionTitle: 'Deleting your account and data',
    deletion: 'You stay in full control of your information. In line with your right to erasure, you can delete your account and all the data linked to it at any time.',
    unconfirmed: 'An account whose email address is never confirmed is deleted automatically after 30 days. An email warns you a week before, with a link to confirm it.',
    howTitle: 'How do I delete my data?',
    how: <>Go to your {profile('Profile')} page. At the very bottom, in the “Danger zone” section, click “Delete my account”. This is <strong>immediate and cannot be undone</strong>: all your data is erased from our servers.</>,
    contactTitle: 'Contact',
    contact: 'For any question about your data, or to exercise your rights of access and correction, contact our team:',
    email: 'Email:',
  },
});

export default function PrivacyPolicy() {
  const t = useT(M);

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600">{t.lead}</p>
          {t.prevails && <p className="mt-3 text-sm text-gray-600">{t.prevails}</p>}
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{t.encryptionTitle}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{t.encryption}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <EyeOff className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{t.accessTitle}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{t.access}</p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3>{t.collectionTitle}</h3>
          <p>{t.collection}</p>
          <ul>
            {t.collected.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p>{t.noSale}</p>

          <h3>{t.hostingTitle}</h3>
          <p>{t.hosting}</p>

          <h3>{t.deletionTitle}</h3>
          <p>{t.deletion}</p>
          <p>{t.unconfirmed}</p>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3 not-prose my-6">
            <Trash2 className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
                <h4 className="font-semibold text-red-900 text-sm">{t.howTitle}</h4>
                <p className="text-sm text-red-800 mt-1">{t.how}</p>
            </div>
          </div>

          <h3>{t.contactTitle}</h3>
          <p>{t.contact}</p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 not-prose">
            <strong>Lovation</strong><br/>
            {t.email} <a href="mailto:lovation.pro@gmail.com" className="text-primary hover:underline">lovation.pro@gmail.com</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
