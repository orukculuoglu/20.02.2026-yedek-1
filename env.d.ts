/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_API: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TENANT_ID: string;
  readonly VITE_AUTH_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
