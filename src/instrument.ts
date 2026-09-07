import * as Sentry from '@sentry/react';

// Sentry must initialize before any other code runs — this sidecar is the
// first import in main.tsx.
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // SDK disabled when unset
  environment: import.meta.env.MODE,
  release: `logbook@${__APP_VERSION__}`, // must match the release in vite.config.ts

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Tracing
  tracesSampleRate: 1.0, // lower to 0.1–0.2 in production
  tracePropagationTargets: ['localhost', /^\//, import.meta.env.VITE_API_URL].filter(
    (t): t is string | RegExp => Boolean(t)
  ),

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,
});
