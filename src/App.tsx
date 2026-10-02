// src/App.tsx
// ============================================================================
// App routing — nested budget tabs
// ============================================================================
// Each tab is a real URL (deep-linkable, browser-history aware).
//
// /budget/:id/complete           → redirects to /month
// /budget/:id/complete/month     → MonthTab (?m=YYYY-MM) — the heart of the app
// /budget/:id/complete/charges   → ChargesTab (catalog of rules + suggestions)
// /budget/:id/complete/projects  → ProjectsTab (« Épargne »)
// /budget/:id/complete/members   → MembersTab (« Foyer » + contribution assistant)
// /budget/:id/complete/year      → YearTab (?y=YYYY)
// /budget/:id/complete/ai        → AIBudgetTab
// /budget/:id/complete/reality   → RealityTab
// Legacy URLs: /overview → /month, /calendar → /year.
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
import MonthTab from './lib/pages/budget-tabs/MonthTab';
import MembersTab from './lib/pages/budget-tabs/MembersTab';
import ChargesTab from './lib/pages/budget-tabs/ChargesTab';
import ProjectsTab from './lib/pages/budget-tabs/ProjectsTab';
import YearTab from './lib/pages/budget-tabs/YearTab';
import AIBudgetTab from './lib/pages/budget-tabs/AIBudgetTab';
import RealityTab from './lib/pages/budget-tabs/RealityTab';
import AdminStats from './lib/pages/AdminStats';
import AdminRoute from './components/AdminRoute';

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

        <Route path="/admin/stats" element={
          <AdminRoute>
            <AdminStats />
          </AdminRoute>
        } />

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

        {/* BUDGET — legacy redirect /budget/:id → /complete/month */}
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
          {/* /budget/:id/complete → /month */}
          <Route index element={<Navigate to="month" replace />} />
          <Route path="month" element={<MonthTab />} />
          <Route path="charges" element={<ChargesTab />} />
          <Route path="projects" element={<ProjectsTab />} />
          <Route path="members" element={<MembersTab />} />
          <Route path="year" element={<YearTab />} />
          <Route path="ai" element={<AIBudgetTab />} />
          <Route path="reality" element={<RealityTab />} />
          {/* Legacy tab URLs */}
          <Route path="overview" element={<Navigate to="../month" replace />} />
          <Route path="calendar" element={<Navigate to="../year" replace />} />
          <Route path="*" element={<Navigate to="month" replace />} />
        </Route>

        {/* BANKING CALLBACK */}
        <Route path="/beta2/callback" element={<EnableBankingCallbackPage />} />

        {/* LEGACY — redirect /beta2/:id to /complete/month */}
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

// Helper component to redirect /budget/:id → /budget/:id/complete/month
function RedirectToBudgetComplete() {
  const { id } = useParams();
  return <Navigate to={`/budget/${id}/complete/month`} replace />;
}
