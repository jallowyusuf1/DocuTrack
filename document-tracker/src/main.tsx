import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'

// Initialize Sentry (automatically enabled when VITE_SENTRY_DSN is set)
// Wait for React and app to fully load before initializing Sentry
// This prevents React hook conflicts
// IMPORTANT: Sentry is completely optional and should never break the app
if (import.meta.env.VITE_SENTRY_DSN && typeof window !== 'undefined') {
  // Wait for DOM and React to be fully ready
  // Use a longer delay to ensure React is completely initialized
  window.addEventListener('load', () => {
    // Additional delay to ensure React is fully initialized
    setTimeout(() => {
      import('./utils/sentry').then(({ initSentry }) => {
        initSentry().catch((err) => {
          // Silently fail if Sentry initialization fails - don't break the app
          if (import.meta.env.MODE === 'development') {
            console.warn('Sentry initialization failed (non-critical):', err);
          }
        });
      }).catch(() => {
        // Silently fail if Sentry module can't be loaded
      });
    }, 2000); // 2 second delay to ensure React is ready
  });
}

// Register Service Worker
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
