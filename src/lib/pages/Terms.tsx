// src/lib/pages/Terms.tsx
// Terms of use, in French (/terms) and English (/en/terms). The English
// version is a translation: the French one prevails, and the page says so.
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, FileText, Shield, Users, Database, Mail } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { defineMessages, useT } from '@/i18n/runtime';

function Article({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section id={`article-${n}`} className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const H3 = ({ children }: { children: ReactNode }) => <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h3>;
const P = ({ children, className = '' }: { children: ReactNode; className?: string }) => <p className={`text-gray-700 leading-relaxed ${className}`}>{children}</p>;
const List = ({ items, className = '' }: { items: ReactNode[]; className?: string }) => (
  <ul className={`list-disc pl-6 space-y-2 text-gray-700 ${className}`}>
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);
const Note = ({ className, children }: { className: string; children: ReactNode }) => (
  <div className={`border-l-4 p-4 mt-4 ${className}`}>
    <p className="text-sm">{children}</p>
  </div>
);

function Right({ icon: Icon, title, text }: { icon: typeof Database; title: string; text: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <Icon className="h-6 w-6 text-primary mb-2" />
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}

const M = defineMessages<{
  back: string; title: string; updated: string; prevails?: ReactNode; toc: string; tocItems: string[];
  body: ReactNode; questions: string; questionsText: string;
}>({
  fr: {
    back: 'Retour',
    title: 'Conditions Générales d\'Utilisation',
    updated: 'Dernière mise à jour : 2 janvier 2025',
    toc: 'Sommaire',
    tocItems: ['Objet', 'Acceptation des Conditions', 'Services Proposés', 'Compte Utilisateur', 'Protection des Données (RGPD)', 'Propriété Intellectuelle', 'Responsabilités', 'Droit Applicable'],
    body: (
      <>
        <Article n={1} title="Objet">
          <P>
            Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'utilisation du service
            Budget Famille accessible à l'adresse <strong>budgetfamille.com</strong> (ci-après « le Service »).
          </P>
          <P className="mt-3">
            Budget Famille est une application web de gestion de budget (personnel, de couple, familial, de
            colocation ou de projet) permettant aux utilisateurs de planifier, suivre et partager leurs finances
            en temps réel.
          </P>
        </Article>

        <Article n={2} title="Acceptation des Conditions">
          <P>
            L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU. En créant un compte
            ou en utilisant le Service, vous reconnaissez avoir lu, compris et accepté ces conditions.
          </P>
          <Note className="bg-blue-50 border-blue-500 text-blue-900">
            <strong>Important :</strong> Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Service.
          </Note>
        </Article>

        <Article n={3} title="Services Proposés">
          <P className="mb-4">Budget Famille propose les services suivants :</P>
          <List items={[
            'Création et gestion de budgets, seul ou à plusieurs',
            'Suivi des revenus et dépenses',
            'Planification de projets financiers',
            'Partage collaboratif avec les membres invités (conjoint, famille, colocataires…)',
            'Synchronisation en temps réel',
            'Connexion bancaire sécurisée (fonctionnalité Beta)',
            'Suggestions d\'économies par IA',
          ]} />
          <Note className="bg-amber-50 border-amber-500 text-amber-900">
            <strong>Disponibilité :</strong> Nous nous efforçons d'assurer une disponibilité maximale du Service,
            mais des interruptions temporaires peuvent survenir pour maintenance ou mises à jour.
          </Note>
        </Article>

        <Article n={4} title="Compte Utilisateur">
          <H3>4.1 Création de Compte</H3>
          <P>Pour utiliser le Service, vous devez créer un compte en fournissant :</P>
          <List className="mt-3" items={['Une adresse email valide', 'Un mot de passe sécurisé (minimum 8 caractères)', 'Un nom d\'utilisateur']} />
          <H3>4.2 Sécurité du Compte</H3>
          <P>Vous êtes responsable de :</P>
          <List className="mt-3" items={['La confidentialité de vos identifiants', 'Toute activité effectuée depuis votre compte', 'Nous informer immédiatement en cas d\'utilisation non autorisée']} />
          <H3>4.3 Résiliation</H3>
          <P>
            Vous pouvez supprimer votre compte à tout moment depuis votre profil. La suppression est définitive
            et entraîne la suppression de toutes vos données conformément au RGPD.
          </P>
        </Article>

        <Article n={5} title="Protection des Données (RGPD)">
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
          <H3>5.1 Données Collectées</H3>
          <P className="mb-3">Nous collectons uniquement :</P>
          <List items={[
            <><strong>Données d'identification :</strong> Email, nom, avatar (optionnel)</>,
            <><strong>Données de budget :</strong> Revenus, dépenses, projets (chiffrées)</>,
            <><strong>Données techniques :</strong> Logs de connexion, adresse IP</>,
          ]} />
          <H3>5.2 Utilisation des Données</H3>
          <P>Vos données sont utilisées pour :</P>
          <List className="mt-3" items={['Fournir et améliorer le Service', 'Assurer la sécurité de votre compte', 'Vous envoyer des notifications importantes']} />
          <P className="mt-4"><strong>Nous ne vendons jamais vos données à des tiers.</strong></P>
          <H3>5.3 Vos Droits RGPD</H3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Right icon={Database} title="Droit d'accès" text="Consulter toutes vos données à tout moment" />
            <Right icon={FileText} title="Droit de rectification" text="Modifier vos informations personnelles" />
            <Right icon={Shield} title="Droit à l'effacement" text="Supprimer définitivement votre compte" />
            <Right icon={Users} title="Droit à la portabilité" text="Exporter toutes vos données en JSON" />
          </div>
          <H3>5.4 Sécurité</H3>
          <P>Nous mettons en œuvre des mesures de sécurité robustes :</P>
          <List className="mt-3" items={[
            <><strong>Chiffrement AES-256</strong> de vos données budget</>,
            <><strong>Authentification 2FA</strong> (TOTP) disponible</>,
            <><strong>Connexions HTTPS</strong> uniquement</>,
            <><strong>Hébergement sécurisé</strong> avec backups quotidiens</>,
          ]} />
          <H3>5.5 Contact DPO</H3>
          <Dpo text="Pour toute question sur vos données :" />
        </Article>

        <Article n={6} title="Propriété Intellectuelle">
          <P>
            Le Service, son design, son code source, sa marque et tous les éléments qui le composent sont la
            propriété exclusive de Budget Famille et sont protégés par les lois sur la propriété intellectuelle.
          </P>
          <P className="mt-4">
            <strong>Vos données vous appartiennent.</strong> Vous conservez tous les droits sur les données que
            vous créez dans le Service.
          </P>
        </Article>

        <Article n={7} title="Responsabilités">
          <H3>7.1 Notre Responsabilité</H3>
          <P>
            Nous nous efforçons de fournir un Service fiable et sécurisé. Cependant, Budget Famille ne peut être
            tenu responsable :
          </P>
          <List className="mt-3" items={['Des décisions financières prises sur la base des données du Service', 'Des pertes de données dues à des erreurs utilisateur', 'Des interruptions de service indépendantes de notre volonté']} />
          <H3>7.2 Votre Responsabilité</H3>
          <P>Vous vous engagez à :</P>
          <List className="mt-3" items={['Utiliser le Service de manière légale et éthique', 'Ne pas tenter de compromettre la sécurité du Service', 'Vérifier l\'exactitude de vos données saisies', 'Respecter les droits des autres utilisateurs']} />
        </Article>

        <Article n={8} title="Droit Applicable et Juridiction">
          <P>
            Les présentes CGU sont régies par le droit français. En cas de litige, et après tentative de
            résolution amiable, les tribunaux français seront seuls compétents.
          </P>
          <Mediation>
            <strong>Médiation :</strong> Conformément à l'article L.612-1 du Code de la consommation, vous
            pouvez recourir gratuitement à un médiateur de la consommation en cas de litige.
          </Mediation>
        </Article>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications des CGU</h2>
          <P>
            Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront
            informés par email des modifications importantes. La poursuite de l'utilisation du Service après
            modification vaut acceptation des nouvelles conditions.
          </P>
        </section>
      </>
    ),
    questions: 'Questions ?',
    questionsText: 'Pour toute question concernant ces conditions générales :',
  },
  en: {
    back: 'Back',
    title: 'Terms of use',
    updated: 'Last updated: January 2, 2025',
    prevails: <>This is a translation for your convenience: the <Link to="/terms" hrefLang="fr" className="font-medium text-primary hover:underline">French version</Link> prevails.</>,
    toc: 'Contents',
    tocItems: ['Purpose', 'Acceptance of the terms', 'Services', 'User account', 'Data protection (GDPR)', 'Intellectual property', 'Liability', 'Governing law'],
    body: (
      <>
        <Article n={1} title="Purpose">
          <P>
            These Terms of Use (the “Terms”) govern the use of the Budget Famille service available at
            {' '}<strong>budgetfamille.com</strong> (the “Service”).
          </P>
          <P className="mt-3">
            Budget Famille is a web app for managing a budget (personal, couple, family, roommates or a project) that lets
            users plan, track and share their finances in real time.
          </P>
        </Article>

        <Article n={2} title="Acceptance of the terms">
          <P>
            Using the Service means fully accepting these Terms. By creating an account or using the Service, you confirm
            that you have read, understood and accepted them.
          </P>
          <Note className="bg-blue-50 border-blue-500 text-blue-900">
            <strong>Important:</strong> if you don’t accept these Terms, please don’t use the Service.
          </Note>
        </Article>

        <Article n={3} title="Services">
          <P className="mb-4">Budget Famille offers the following services:</P>
          <List items={[
            'Creating and managing budgets, on your own or together',
            'Tracking income and spending',
            'Planning financial projects',
            'Sharing with invited members (partner, family, roommates…)',
            'Real-time sync',
            'Secure bank connection (beta feature)',
            'AI savings suggestions',
          ]} />
          <Note className="bg-amber-50 border-amber-500 text-amber-900">
            <strong>Availability:</strong> we do our best to keep the Service available at all times, but temporary
            interruptions may happen for maintenance or updates.
          </Note>
        </Article>

        <Article n={4} title="User account">
          <H3>4.1 Creating an account</H3>
          <P>To use the Service, you need to create an account by providing:</P>
          <List className="mt-3" items={['A valid email address', 'A secure password (at least 8 characters)', 'A user name']} />
          <H3>4.2 Account security</H3>
          <P>You are responsible for:</P>
          <List className="mt-3" items={['Keeping your sign-in details confidential', 'Any activity carried out from your account', 'Telling us immediately about any unauthorized use']} />
          <H3>4.3 Closing your account</H3>
          <P>
            You can delete your account at any time from your profile. Deletion is permanent and erases all your data, in
            line with the GDPR.
          </P>
        </Article>

        <Article n={5} title="Data protection (GDPR)">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-green-900 mb-2">Our GDPR commitment</p>
                <p className="text-sm text-green-800">
                  Budget Famille complies with the General Data Protection Regulation (GDPR). Your data is encrypted and
                  you stay in full control of it.
                </p>
              </div>
            </div>
          </div>
          <H3>5.1 Data we collect</H3>
          <P className="mb-3">We only collect:</P>
          <List items={[
            <><strong>Identification data:</strong> email, name, avatar (optional)</>,
            <><strong>Budget data:</strong> income, spending, projects (encrypted)</>,
            <><strong>Technical data:</strong> sign-in logs, IP address</>,
          ]} />
          <H3>5.2 How we use data</H3>
          <P>Your data is used to:</P>
          <List className="mt-3" items={['Provide and improve the Service', 'Keep your account secure', 'Send you important notifications']} />
          <P className="mt-4"><strong>We never sell your data to third parties.</strong></P>
          <H3>5.3 Your GDPR rights</H3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Right icon={Database} title="Right of access" text="See all your data at any time" />
            <Right icon={FileText} title="Right to rectification" text="Change your personal information" />
            <Right icon={Shield} title="Right to erasure" text="Delete your account for good" />
            <Right icon={Users} title="Right to data portability" text="Export all your data as JSON" />
          </div>
          <H3>5.4 Security</H3>
          <P>We put strong security measures in place:</P>
          <List className="mt-3" items={[
            <><strong>AES-256 encryption</strong> of your budget data</>,
            <><strong>Two-factor authentication</strong> (TOTP) available</>,
            <><strong>HTTPS connections</strong> only</>,
            <><strong>Secure hosting</strong> with daily backups</>,
          ]} />
          <H3>5.5 Data protection contact</H3>
          <Dpo text="For any question about your data:" />
        </Article>

        <Article n={6} title="Intellectual property">
          <P>
            The Service, its design, source code, brand and everything it is made of are the exclusive property of Budget
            Famille and are protected by intellectual property law.
          </P>
          <P className="mt-4">
            <strong>Your data belongs to you.</strong> You keep all rights to the data you create in the Service.
          </P>
        </Article>

        <Article n={7} title="Liability">
          <H3>7.1 Our liability</H3>
          <P>We do our best to provide a reliable and secure Service. However, Budget Famille cannot be held liable for:</P>
          <List className="mt-3" items={['Financial decisions made on the basis of data in the Service', 'Data loss caused by user error', 'Service interruptions beyond our control']} />
          <H3>7.2 Your responsibilities</H3>
          <P>You agree to:</P>
          <List className="mt-3" items={['Use the Service lawfully and ethically', 'Not attempt to compromise the security of the Service', 'Check that the data you enter is accurate', 'Respect the rights of other users']} />
        </Article>

        <Article n={8} title="Governing law and jurisdiction">
          <P>
            These Terms are governed by French law. In the event of a dispute, and after an attempt to settle it amicably,
            the French courts alone have jurisdiction.
          </P>
          <Mediation>
            <strong>Mediation:</strong> under Article L.612-1 of the French Consumer Code, you can use a consumer mediator
            free of charge in the event of a dispute.
          </Mediation>
        </Article>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to these Terms</h2>
          <P>
            We may change these Terms at any time. Users will be told about significant changes by email. Continuing to use
            the Service after a change means accepting the new Terms.
          </P>
        </section>
      </>
    ),
    questions: 'Questions?',
    questionsText: 'For any question about these Terms:',
  },
});

function Dpo({ text }: { text: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-gray-600">{text}</p>
          <a href="mailto:privacy@budgetfamille.com" className="text-primary-600 font-medium hover:underline">
            privacy@budgetfamille.com
          </a>
        </div>
      </div>
    </div>
  );
}

function Mediation({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  );
}

export default function Terms() {
  const navigate = useNavigate();
  const t = useT(M);

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
        <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">{t.title}</h1>
            <p className="text-gray-600">{t.updated}</p>
            {t.prevails && <p className="mt-3 text-sm text-gray-600">{t.prevails}</p>}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">{t.toc}</h2>
            <ul className="space-y-2 text-sm">
              {t.tocItems.map((item, i) => (
                <li key={item}><a href={`#article-${i + 1}`} className="text-primary-600 hover:underline">{i + 1}. {item}</a></li>
              ))}
            </ul>
          </div>

          <div className="prose prose-lg max-w-none">
            {t.body}

            <section className="bg-primary-50 rounded-xl p-6 mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.questions}</h2>
              <p className="text-gray-700 mb-4">{t.questionsText}</p>
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
