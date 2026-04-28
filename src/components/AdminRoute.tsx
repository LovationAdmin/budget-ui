// src/components/AdminRoute.tsx
// ============================================================================
// 🔐 AdminRoute — Route guard for admin-only pages
// ============================================================================
// Wraps a route to enforce TWO conditions:
//   1. User is authenticated
//   2. User's email is in the ADMIN_EMAILS allowlist
//
// If not authenticated  → redirect to /login (preserving the intended path)
// If wrong email        → redirect to /404 (so the route's existence stays
//                          private; non-admins won't even know it exists)
// ============================================================================

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/constants/admin';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to resolve
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Not logged in → standard login redirect (preserve intended path)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong email → pretend the page doesn't exist
  if (!isAdminEmail(user.email)) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
}
