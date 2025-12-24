// src/pages/EnableBankingCallbackPage.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Add useNavigate
import { Loader2 } from 'lucide-react';

export default function EnableBankingCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate(); // Hook for redirection

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Helper to handle completion
        const finish = () => {
             // If we have an opener (Popup mode), message it and close
            if (window.opener) {
                window.opener.postMessage({
                    type: 'ENABLE_BANKING_CALLBACK',
                    code,
                    state,
                    error,
                    error_description: searchParams.get('error_description')
                }, window.location.origin);
                window.close();
            } else {
                // FALLBACK: If no opener (Redirect mode), go back to the app manually
                // You might need to store the 'budget_id' in localStorage before starting auth 
                // to know where to redirect back to.
                const lastBudget = localStorage.getItem('last_budget_id');
                if (lastBudget) {
                    navigate(`/beta2/${lastBudget}?success=true`);
                } else {
                    navigate('/');
                }
            }
        };

        // Add a small delay so the user sees the "Success" message briefly
        const timer = setTimeout(() => {
            finish();
        }, 1500);

        return () => clearTimeout(timer);
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                    <h2 className="text-xl font-semibold">
                        {searchParams.get('error') ? 'Erreur de connexion' : 'Authentification réussie'}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Redirection vers Budget Famille...
                    </p>
                </div>
            </div>
        </div>
    );
}