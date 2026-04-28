import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { TutorialModal } from './components/tutorial/TutorialModal';
import App from './App';
import './index.css';
import './styles/mobile-fixes.css';
import { initSentry, SentryErrorBoundary } from '@/lib/sentry';
import { ErrorFallback } from '@/components/ErrorFallback';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={({ error, resetError, eventId }) => (
        <ErrorFallback error={error} resetError={resetError} eventId={eventId} />
      )}
    >
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <TutorialProvider>
              <App />
              <TutorialModal />
            </TutorialProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>
);