/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sentry browser SDK DSN; Sentry stays disabled when unset. */
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_API_URL?: string;
}

/** Injected by vite.config.ts `define` from package.json version. */
declare const __APP_VERSION__: string;
