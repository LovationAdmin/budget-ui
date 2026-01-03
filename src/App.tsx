// src/App.tsx
// ✅ VERSION CORRIGÉE - Ajout route /blog/:slug pour BlogArticle
// ✅ AUCUNE RÉGRESSION - Toutes les routes existantes conservées

import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from "@/components/ui/toaster";

// Pages existantes (CONSERVÉES)
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
import Beta2Page from './pages/Beta2Page';
import EnableBankingCallbackPage from './pages/EnableBankingCallbackPage';
import PremiumPage from './pages/PremiumPage';
import Terms from './pages/Terms';
import Features from './pages/Features';
import About from './pages/About';
import Help from './pages/Help';

// Pages Marketing
import SmartTools from './pages/SmartTools';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle'; // ✅ AJOUTÉ

export default function App() {
  return (
    <>
      <Routes>
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
        
        {/* ✅ CORRIGÉ : Route pour les articles de blog individuels */}
        <Route path="/blog/:slug" element={<BlogArticle />} />

        {/* ============================================ */}
        {/* PROTECTED ROUTES */}
        {/* ============================================ */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Budget Routes */}
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
        {/* BETA ROUTES (Enable Banking) */}
        {/* ============================================ */}
        {/* Enable Banking Callback (public route) */}
        <Route path="/beta2/callback" element={<EnableBankingCallbackPage />} />
        
        {/* Beta 2 - Enable Banking (protected route) */}
        <Route path="/beta2/:id" element={
          <PrivateRoute>
            <Beta2Page />
          </PrivateRoute>
        } />
        
        {/* ============================================ */}
        {/* ERROR ROUTES */}
        {/* ============================================ */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* Toast notifications (Required for all notifications) */}
      <Toaster />
    </>
  );
}