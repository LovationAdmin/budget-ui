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
//
// Code splitting: the landing, auth and month screens ship in the main bundle;
// every other page and tab is loaded on demand (React.lazy). Budget tabs
// suspend inside the budget layout, so the navbar and tab bar stay put.
// ============================================================================

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from '@/components/ui/toaster';

// ===== Public pages =====
import Login from './lib/pages/Login';
import Signup from './lib/pages/Signup';
import LandingPage from './lib/pages/LandingPage';

// ===== Authenticated pages =====
import Dashboard from './lib/pages/Dashboard';

// ===== Budget layout + month (the default tab) =====
import BudgetCompleteLayout from './lib/pages/BudgetComplete';
import MonthTab from './lib/pages/budget-tabs/MonthTab';
import AdminRoute from './components/AdminRoute';

// ===== Loaded on demand =====
const ForgotPassword = lazy(() => import('./lib/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./lib/pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./lib/pages/VerifyEmail'));
const PrivacyPolicy = lazy(() => import('./lib/pages/PrivacyPolicy'));
const Terms = lazy(() => import('./lib/pages/Terms'));
const About = lazy(() => import('./lib/pages/About'));
const Help = lazy(() => import('./lib/pages/Help'));
const Features = lazy(() => import('./lib/pages/Features'));
const PremiumPage = lazy(() => import('./lib/pages/PremiumPage'));
const SmartTools = lazy(() => import('./lib/pages/SmartTools'));
const Blog = lazy(() => import('./lib/pages/Blog'));
const BlogArticle = lazy(() => import('./lib/pages/BlogArticle'));
const Profile = lazy(() => import('./lib/pages/Profile'));
const AcceptInvitation = lazy(() => import('./lib/pages/AcceptInvitation'));
const EnableBankingCallbackPage = lazy(() => import('./lib/pages/EnableBankingCallbackPage'));
const NotFound = lazy(() => import('./lib/pages/NotFound'));
const MembersTab = lazy(() => import('./lib/pages/budget-tabs/MembersTab'));
const ChargesTab = lazy(() => import('./lib/pages/budget-tabs/ChargesTab'));
const ProjectsTab = lazy(() => import('./lib/pages/budget-tabs/ProjectsTab'));
const YearTab = lazy(() => import('./lib/pages/budget-tabs/YearTab'));
const AIBudgetTab = lazy(() => import('./lib/pages/budget-tabs/AIBudgetTab'));
const RealityTab = lazy(() => import('./lib/pages/budget-tabs/RealityTab'));
const AdminStats = lazy(() => import('./lib/pages/AdminStats'));

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>

      <Toaster />
    </>
  );
}

// Helper component to redirect /budget/:id → /budget/:id/complete/month
function RedirectToBudgetComplete() {
  const { id } = useParams();
  return <Navigate to={`/budget/${id}/complete/month`} replace />;
}

// Shown while a lazily-loaded page downloads (usually a few hundred ms).
function PageFallback({ className = 'min-h-[60vh]' }: { className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex items-center justify-center ${className}`}>
      <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary motion-reduce:animate-none" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
