/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** 'true' opens Premium (bank sync) in the app; anything else shows « bientôt ». */
  readonly VITE_PREMIUM_ENABLED?: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
