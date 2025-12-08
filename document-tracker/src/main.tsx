import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'

// Initialize Sentry (automatically enabled when VITE_SENTRY_DSN is set)
// Use setTimeout to ensure React is fully loaded before initializing Sentry
if (import.meta.env.VITE_SENTRY_DSN) {
  setTimeout(() => {
    import('./utils/sentry').then(({ initSentry }) => {
      initSentry().catch(() => {
        // Silently fail if Sentry initialization fails
      });
    });
  }, 0);
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
