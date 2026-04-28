// src/lib/constants/admin.ts
// ============================================================================
// 🔐 Admin configuration
// ============================================================================
// The list of email addresses authorized to access /admin/stats.
//
// SECURITY MODEL — defense in depth:
//   Layer 1 (frontend): only users whose email matches ADMIN_EMAILS can access
//                       the route. Others are redirected to /404 to not even
//                       reveal that the route exists.
//   Layer 2 (backend):  the actual API endpoint requires the X-Admin-Secret
//                       header (matched in constant time on the server).
//
// Both layers must succeed. Frontend alone is NEVER enough — anyone can read
// the bundled JS and forge requests. The real protection is the backend secret.
//
// To rotate the admin secret: regenerate ADMIN_SECRET on Render env vars.
// To add another admin: append the email to ADMIN_EMAILS below.
// ============================================================================

export const ADMIN_EMAILS: readonly string[] = ['lovation.pro@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  // Case-insensitive exact match on the normalized email
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
}

// Where to store the admin secret in the browser. sessionStorage means:
//   - Survives page refresh within the same tab
//   - Cleared when the tab/browser closes
//   - NOT shared between tabs (each tab needs its own login)
// This is intentional: localStorage would persist across sessions which is
// less safe for an admin credential.
export const ADMIN_SECRET_STORAGE_KEY = 'budget-admin-secret';
