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
          console.log('[SW] Found', registrations.length, 'service worker(s) in development');
          
          for (const registration of registrations) {
            try {
              const unregistered = await registration.unregister();
              if (unregistered) {
                console.log('[SW] ✅ Unregistered:', registration.scope);
              } else {
                console.warn('[SW] ⚠️ Could not unregister:', registration.scope);
              }
            } catch (err) {
              console.error('[SW] ❌ Error unregistering:', err);
            }
          }
        }
        
        // Clear all caches
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            if (cacheNames.length > 0) {
              console.log('[SW] Found', cacheNames.length, 'cache(s)');
              
              for (const cacheName of cacheNames) {
                try {
                  await caches.delete(cacheName);
                  console.log('[SW] ✅ Cache deleted:', cacheName);
                } catch (err) {
                  console.error('[SW] ❌ Error deleting cache:', cacheName, err);
                }
              }
            }
          } catch (err) {
            console.error('[SW] ❌ Error accessing caches:', err);
          }
        }
        
        console.log('[SW] ✅ Development cleanup complete');
      } catch (error) {
        console.error('[SW] ❌ Cleanup error:', error);
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
if (typeof React === 'undefined' || !React.useState) {
  console.error('❌ React is not properly loaded!');
  console.error('Run: npm run emergency-fix');
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; color: white; font-family: system-ui;">
      <h1>React Initialization Error</h1>
      <p>React is not properly loaded. Please run:</p>
      <code style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; display: inline-block; margin: 20px;">
        npm run emergency-fix
      </code>
      <p style="margin-top: 20px; opacity: 0.7;">Then refresh this page.</p>
    </div>
  `;
} else {
  // Log React versions in development
  if (import.meta.env.MODE === 'development') {
    console.log('🔍 React Debug Info:', {
      reactVersion: React.version,
      reactDOMVersion: ReactDOM.version,
      strictMode: true,
    });
  }

  createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
  );
}
