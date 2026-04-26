// src/App.tsx
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from "@/components/ui/toaster";

// Pages
import Login from './lib/pages/Login'; 
import Signup from './lib/pages/Signup';
import ForgotPassword from './lib/pages/ForgotPassword';
import ResetPassword from './lib/pages/ResetPassword';
import Dashboard from './lib/pages/Dashboard';
import BudgetComplete from './lib/pages/BudgetComplete';
import Profile from './lib/pages/Profile';
import NotFound from './lib/pages/NotFound';
import AcceptInvitation from './lib/pages/AcceptInvitation';
import PrivacyPolicy from './lib/pages/PrivacyPolicy';
import VerifyEmail from './lib/pages/VerifyEmail';
import EnableBankingCallbackPage from './lib/pages/EnableBankingCallbackPage';
import PremiumPage from './lib/pages/PremiumPage';
import Terms from './lib/pages/Terms';
import Features from './lib/pages/Features';
import About from './lib/pages/About';
import Help from './lib/pages/Help';

// Pages Marketing
import SmartTools from './lib/pages/SmartTools';
import Blog from './lib/pages/Blog';
import BlogArticle from './lib/pages/BlogArticle';
import LandingPage from './lib/pages/LandingPage';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* ROOT ROUTE */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <LandingPage />
        } />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/invitation/accept" element={<AcceptInvitation />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/smart-tools" element={<SmartTools />} />
        <Route path="/outils-ia" element={<SmartTools />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />

        {/* PROTECTED ROUTES */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* ✅ FIXED: Added specific route for /budget/:id to handle client-side redirects */}
        <Route path="/budget/:id" element={
          <PrivateRoute>
            <RedirectToBudgetComplete />
          </PrivateRoute>
        } />

        <Route path="/budget/:id/complete" element={
          <PrivateRoute>
            <BudgetComplete />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        
        {/* BANKING CALLBACK */}
        <Route path="/beta2/callback" element={<EnableBankingCallbackPage />} />
        
        {/* LEGACY REDIRECTS */}
        <Route path="/beta2/:id" element={
          <PrivateRoute>
            <RedirectToBudgetComplete />
          </PrivateRoute>
        } />

        {/* ERROR ROUTES */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

// Helper component to handle redirects
function RedirectToBudgetComplete() {
  const { id } = useParams();
  return <Navigate to={`/budget/${id}/complete`} replace />;
}