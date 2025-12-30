// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from "@/components/ui/toaster"; // IMPORTANT

// Pages
import Login from './pages/Login'; 
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BudgetComplete from './pages/BudgetComplete';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AcceptInvitation from './pages/AcceptInvitation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import VerifyEmail from './pages/VerifyEmail';
import Beta2Page from './pages/Beta2Page'; // Enable Banking
import EnableBankingCallbackPage from './pages/EnableBankingCallbackPage';
import PremiumPage from './pages/PremiumPage';
import Terms from './pages/Terms';
import Features from './pages/Features';
import About from './pages/About';
import Help from './pages/Help';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/invitation/accept" element={<AcceptInvitation />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/budget/:id/complete" element={
          <PrivateRoute>
            <BudgetComplete />
          </PrivateRoute>
        } />
        
        {/* BETA ROUTES */}
        {/* Enable Banking Callback (public route) */}
        <Route path="/beta2/callback" element={<EnableBankingCallbackPage />} />
        {/* Beta 2 - Enable Banking */}
        <Route path="/beta2/:id" element={
          <PrivateRoute>
            <Beta2Page />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
      </Routes>

      {/* Ce composant est indispensable pour les notifications */}
      
      <Toaster />
    </>
  );
}