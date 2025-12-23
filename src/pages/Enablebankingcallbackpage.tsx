import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Page de callback après l'authentification bancaire via Enable Banking
 * Cette page est ouverte dans une popup et envoie les paramètres au parent
 */
export default function EnableBankingCallbackPage() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            // Envoyer l'erreur au parent
            window.opener?.postMessage({
                type: 'ENABLE_BANKING_CALLBACK',
                error: error,
                error_description: searchParams.get('error_description')
            }, window.location.origin);
            
            // Fermer la popup après un court délai
            setTimeout(() => window.close(), 2000);
            return;
        }

        if (code && state) {
            // Envoyer les données au parent
            window.opener?.postMessage({
                type: 'ENABLE_BANKING_CALLBACK',
                code: code,
                state: state
            }, window.location.origin);

            // Fermer la popup
            window.close();
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                    <h2 className="text-xl font-semibold">Authentification réussie</h2>
                    <p className="text-muted-foreground mt-2">
                        Vous allez être redirigé...
                    </p>
                </div>
            </div>
        </div>
    );
}