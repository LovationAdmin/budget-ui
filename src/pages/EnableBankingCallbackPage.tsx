import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Robust Callback Page
 * Handles both Popup mode (closes window) and Redirect mode (navigates back)
 */
export default function EnableBankingCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        const handleCallback = () => {
            // SCENARIO 1: POPUP MODE
            // We have a parent window (opener) to talk to
            if (window.opener) {
                try {
                    window.opener.postMessage({
                        type: 'ENABLE_BANKING_CALLBACK',
                        code,
                        state,
                        error,
                        error_description: errorDescription
                    }, window.location.origin);

                    // Attempt to close the popup
                    window.close();
                    return;
                } catch (err) {
                    console.warn("Could not post message to opener:", err);
                    // If this fails, fall through to Scenario 2
                }
            }

            // SCENARIO 2: REDIRECT / FALLBACK MODE
            // We are the main window, or opener was lost. We must navigate manually.
            
            // Try to find where we came from (you should set this in localStorage before starting auth)
            const lastBudgetID = localStorage.getItem('last_active_budget_id');

            if (error) {
                console.error("Auth Error:", error, errorDescription);
                // Redirect to dashboard or the budget with error flag
                const target = lastBudgetID ? `/beta2/${lastBudgetID}` : '/';
                navigate(`${target}?error=${error}`);
            } else if (code) {
                // Success! Redirect back to the budget
                const target = lastBudgetID ? `/beta2/${lastBudgetID}` : '/';
                navigate(`${target}?success=true`);
            }
        };

        // Run logic immediately
        handleCallback();

    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                    <h2 className="text-xl font-semibold">
                        {searchParams.get('error') ? 'Connexion échouée' : 'Connexion réussie'}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Redirection en cours...
                    </p>
                </div>
            </div>
        </div>
    );
}