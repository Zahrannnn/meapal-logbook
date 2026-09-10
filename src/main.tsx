import './instrument'; // ← MUST be first
import { StrictMode } from 'react';
import { reactErrorHandler } from '@sentry/react';

const addBrokenImageHandler = () => {
  document.addEventListener('error', function (e) {
    if (e.target instanceof HTMLImageElement) {
      const img = e.target;
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = 'true';

        // Create a simple fallback SVG icon as data URL
        const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E`;
        img.src = fallbackSvg;
        img.classList.add('broken-image-fallback');
        if (!img.alt || img.alt.trim() === '') {
          img.alt = 'Image not available';
        }
      }
    }
  }, true);
};

// Run immediately
addBrokenImageHandler();

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerServiceWorker } from './pwa';

registerServiceWorker();

createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(<StrictMode>
    <App />
  </StrictMode>);
