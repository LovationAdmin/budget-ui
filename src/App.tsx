// src/App.tsx
// ✅ VERSION SIMPLIFIÉE - Beta2Page supprimé (Reality Check intégré dans BudgetComplete)

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from "@/components/ui/toaster";

// Pages
import Login from './pages/Login'; 
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import BudgetComplete from './pages/BudgetComplete';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AcceptInvitation from './pages/AcceptInvitation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import VerifyEmail from './pages/VerifyEmail';
import EnableBankingCallbackPage from './pages/EnableBankingCallbackPage';
import PremiumPage from './pages/PremiumPage';
import Terms from './pages/Terms';
import Features from './pages/Features';
import About from './pages/About';
import Help from './pages/Help';

// Pages Marketing
import SmartTools from './pages/SmartTools';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import LandingPage from './pages/LandingPage';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* ============================================ */}
        {/* ROOT ROUTE: LANDING vs DASHBOARD */}
        {/* ============================================ */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <LandingPage />
        } />

        {/* ============================================ */}
        {/* PUBLIC ROUTES */}
        {/* ============================================ */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Password Reset Routes */}
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

        {/* Marketing Routes */}
        <Route path="/smart-tools" element={<SmartTools />} />
        <Route path="/outils-ia" element={<SmartTools />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />

        {/* ============================================ */}
        {/* PROTECTED ROUTES */}
        {/* ============================================ */}
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Budget Route - Reality Check intégré */}
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
        
        {/* ============================================ */}
        {/* BANKING CALLBACK (public - pour Enable Banking OAuth) */}
        {/* ============================================ */}
        <Route path="/beta2/callback" element={<EnableBankingCallbackPage />} />
        
        {/* ============================================ */}
        {/* LEGACY REDIRECTS - Redirige les anciennes URLs Beta2 vers BudgetComplete */}
        {/* ============================================ */}
        <Route path="/beta2/:id" element={
          <PrivateRoute>
            {/* Redirect to the new unified route */}
            <RedirectToBudgetComplete />
          </PrivateRoute>
        } />

        {/* ============================================ */}
        {/* ERROR ROUTES */}
        {/* ============================================ */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

// Component to handle legacy /beta2/:id redirects
function RedirectToBudgetComplete() {
  const { id } = require('react-router-dom').useParams();
  return <Navigate to={`/budget/${id}/complete`} replace />;
}