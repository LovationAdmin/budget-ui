// src/App.tsx
// ============================================================================
// 🎯 App.tsx — Updated routing with nested budget tabs
// ============================================================================
// Fixes P0 #1: replaces the single "scroll to section" page with proper
// nested routes. Each tab is a real URL (deep-linkable, browser-history aware).
//
// /budget/:id/complete           → redirects to /overview
// /budget/:id/complete/overview  → OverviewTab
// /budget/:id/complete/members   → MembersTab
// /budget/:id/complete/charges   → ChargesTab + Suggestions
// /budget/:id/complete/projects  → ProjectsTab
// /budget/:id/complete/calendar  → CalendarTab (table desktop / cards mobile)
// /budget/:id/complete/reality   → RealityTab
// ============================================================================

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from '@/components/ui/toaster';

// ===== Public pages =====
import Login from './lib/pages/Login';
import Signup from './lib/pages/Signup';
import ForgotPassword from './lib/pages/ForgotPassword';
import ResetPassword from './lib/pages/ResetPassword';
import VerifyEmail from './lib/pages/VerifyEmail';
import LandingPage from './lib/pages/LandingPage';
import PrivacyPolicy from './lib/pages/PrivacyPolicy';
import Terms from './lib/pages/Terms';
import About from './lib/pages/About';
import Help from './lib/pages/Help';
import Features from './lib/pages/Features';
import PremiumPage from './lib/pages/PremiumPage';
import SmartTools from './lib/pages/SmartTools';
import Blog from './lib/pages/Blog';
import BlogArticle from './lib/pages/BlogArticle';

// ===== Authenticated pages =====
import Dashboard from './lib/pages/Dashboard';
import Profile from './lib/pages/Profile';
import AcceptInvitation from './lib/pages/AcceptInvitation';
import EnableBankingCallbackPage from './lib/pages/EnableBankingCallbackPage';
import NotFound from './lib/pages/NotFound';

// ===== Budget tabs (NEW) =====
import BudgetCompleteLayout from './lib/pages/BudgetComplete';
import OverviewTab from './lib/pages/budget-tabs/OverviewTab';
import MembersTab from './lib/pages/budget-tabs/MembersTab';
import ChargesTab from './lib/pages/budget-tabs/ChargesTab';
import ProjectsTab from './lib/pages/budget-tabs/ProjectsTab';
import CalendarTab from './lib/pages/budget-tabs/CalendarTab';
import RealityTab from './lib/pages/budget-tabs/RealityTab';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />

        {/* PUBLIC */}
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

        {/* AUTHENTICATED — top level */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* BUDGET — legacy redirect /budget/:id → /complete/overview */}
        <Route
          path="/budget/:id"
          element={
            <PrivateRoute>
              <RedirectToBudgetComplete />
            </PrivateRoute>
          }
        />

        {/* BUDGET — nested tab routes */}
        <Route
          path="/budget/:id/complete"
          element={
            <PrivateRoute>
              <BudgetCompleteLayout />
            </PrivateRoute>
          }
        >
          {/* /budget/:id/complete → /overview */}
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewTab />} />
          <Route path="members" element={<MembersTab />} />
          <Route path="charges" element={<ChargesTab />} />
          <Route path="projects" element={<ProjectsTab />} />
          <Route path="calendar" element={<CalendarTab />} />
          <Route path="reality" element={<RealityTab />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>

        {/* BANKING CALLBACK */}
        <Route path="/beta2/callback" element={<EnableBankingCallbackPage />} />

        {/* LEGACY — redirect /beta2/:id to /complete/overview */}
        <Route
          path="/beta2/:id"
          element={
            <PrivateRoute>
              <RedirectToBudgetComplete />
            </PrivateRoute>
          }
        />

        {/* ERRORS */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

// Helper component to redirect /budget/:id → /budget/:id/complete/overview
function RedirectToBudgetComplete() {
  const { id } = useParams();
  return <Navigate to={`/budget/${id}/complete/overview`} replace />;
}
