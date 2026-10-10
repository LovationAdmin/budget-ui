// src/lib/premium.ts
// ============================================================================
// Premium (bank sync, « prévu / réel », transaction matching) is coming soon.
// Its code stays in the app, but every entry point (Reality Check tab, bank
// dialog, « Lier aux transactions bancaires », demo bank mode) is hidden and
// replaced by the demo until launch.
// To open it: set VITE_PREMIUM_ENABLED=true in the Vercel environment, then
// redeploy.
// ============================================================================

export const PREMIUM_ENABLED = import.meta.env.VITE_PREMIUM_ENABLED === 'true';
