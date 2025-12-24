import React, { StrictMode } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import './utils/clearCache'
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

// Service Worker Management - COMPLETELY DISABLED IN DEVELOPMENT
// DO NOT register Service Workers in development - they cause HMR issues
if ('serviceWorker' in navigator) {
  if (import.meta.env.MODE === 'production') {
    // Only register in production
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Registered successfully:', registration.scope);

          // If a new SW is found, reload once it's installed so the user gets the latest bundles.
          registration.addEventListener('updatefound', () => {
            const installing = registration.installing;
            if (!installing) return;

            installing.addEventListener('statechange', () => {
              // When installed and we already have a controller, this is an update.
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] Update installed. Reloading to pick up latest version...');
                window.location.reload();
              }
            });
          });
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });
    });
  } else {
    // DEVELOPMENT: Aggressively unregister ALL service workers
    // Run immediately, don't wait for load - run multiple times to ensure cleanup
    const unregisterSWs = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          // Only log if service workers are actually found
          console.debug('[SW] Cleaning up', registrations.length, 'service worker(s) in development');

          for (const registration of registrations) {
            await registration.unregister().catch(() => {});
          }
        }

        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          if (cacheNames.length > 0) {
            for (const cacheName of cacheNames) {
              await caches.delete(cacheName).catch(() => {});
            }
          }
        }
      } catch (error) {
        // Silently handle cleanup errors - not critical for app functionality
      }
    };
    
    // Run immediately
    unregisterSWs();
    
    // Run again on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', unregisterSWs);
    }
    
    // Run again on load
    window.addEventListener('load', unregisterSWs);
    
    // Run again after a short delay (in case SW registers after page load)
    setTimeout(unregisterSWs, 1000);
    setTimeout(unregisterSWs, 3000);
  }
}

// React initialization safety check
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Verify React is loaded before rendering
if (typeof React === 'undefined' || typeof React.useState === 'undefined') {
  console.error('❌ React is not properly loaded!');
  console.error('React:', React);
  console.error('ReactDOM:', ReactDOM);
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; color: white; font-family: system-ui; background: #1A1625;">
      <h1>React Initialization Error</h1>
      <p>React is not properly loaded. Please:</p>
      <ol style="text-align: left; display: inline-block; margin: 20px;">
        <li>Stop the dev server (Ctrl+C)</li>
        <li>Run: <code style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 4px;">rm -rf node_modules/.vite</code></li>
        <li>Run: <code style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 4px;">npm install</code></li>
        <li>Restart the dev server</li>
      </ol>
    </div>
  `;
} else {
  // Log React versions in development
  if (import.meta.env.MODE === 'development') {
    console.log('🔍 React Debug Info:', {
      reactVersion: React.version,
      reactDOMVersion: ReactDOM.version,
      strictMode: true,
      reactType: typeof React,
      reactUseStateType: typeof React.useState,
    });
  }

  try {
  createRoot(rootElement).render(
  <StrictMode>
    <App />
      </StrictMode>
  );
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; color: white; font-family: system-ui; background: #1A1625;">
        <h1>Rendering Error</h1>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p style="margin-top: 20px; opacity: 0.7;">Please check the console for details.</p>
      </div>
    `;
  }
}
