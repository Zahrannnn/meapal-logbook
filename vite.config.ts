import { readFileSync } from 'node:fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

// Sentry source-map upload only runs in CI/release builds when these are set,
// so local dev and forks build cleanly without a Sentry account.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const sentryEnabled = Boolean(
  sentryAuthToken && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(sentryEnabled
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: sentryAuthToken,
            release: { name: `logbook@${pkg.version}` },
          }),
        ]
      : []),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    // 'hidden': maps are generated and uploaded to Sentry but not referenced
    // from the bundle, so production visitors never download them.
    sourcemap: sentryEnabled ? 'hidden' : false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
