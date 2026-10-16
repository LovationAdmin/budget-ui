import { Link } from 'react-router-dom';
import { LOCALES } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: { title: 'Page non trouvée', text: "La page que vous recherchez n'existe pas.", home: "Retour à l'accueil" },
  en: { title: 'Page not found', text: 'The page you’re looking for doesn’t exist.', home: 'Back to home' },
});

export default function NotFound() {
  const t = useT(M);
  const locale = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-9xl mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
        <p className="text-gray-600 mb-8">{t.text}</p>
        <Link to={LOCALES[locale].home} className="btn-primary">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
