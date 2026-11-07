/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** 'true' opens Premium (bank sync) in the app; anything else shows « bientôt ». */
  readonly VITE_PREMIUM_ENABLED?: string;
  /** Share of visits whose speed is measured by Sentry (0–1, default 0.1; 0 = off). Needs VITE_SENTRY_DSN. */
  readonly VITE_SENTRY_TRACES_RATE?: string;
  /** Deployed commit, set at build time on Vercel (vite.config.ts): names the Sentry release. */
  readonly VITE_APP_VERSION?: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
