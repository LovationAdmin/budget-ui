import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { TutorialProvider } from './contexts/TutorialContext'; // <--- Import
import { TutorialModal } from './components/tutorial/TutorialModal'; // <--- Import
import App from './App';
import './index.css';
import './styles/mobile-fixes.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <TutorialProvider> {/* <--- Wrap here */}
            <App />
            <TutorialModal /> {/* <--- Place component here */}
          </TutorialProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);