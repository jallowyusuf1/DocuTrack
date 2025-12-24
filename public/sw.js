/* eslint-disable no-restricted-globals */
/* Service Worker - COMPLETELY DISABLED IN DEVELOPMENT */

// CRITICAL FIX: This Service Worker does ABSOLUTELY NOTHING in development
// It immediately unregisters itself and NEVER intercepts requests

(function() {
  'use strict';
  
  // Check if we're in development IMMEDIATELY
  const isDevelopment = 
    self.location.hostname === 'localhost' || 
    self.location.hostname === '127.0.0.1' ||
    self.location.port === '5174' ||
    self.location.port === '5173';

  if (isDevelopment) {
    // In development, immediately unregister and do NOTHING
    console.log('[SW] Development mode detected - disabling completely');
    
    // Unregister immediately
    self.addEventListener('install', function(event) {
      console.log('[SW] Install in dev - unregistering');
      event.waitUntil(
        self.skipWaiting().then(function() {
          return self.registration.unregister().then(function() {
            console.log('[SW] ✅ Unregistered in development');
          });
        })
      );
    });

    self.addEventListener('activate', function(event) {
      console.log('[SW] Activate in dev - unregistering');
      event.waitUntil(
        self.clients.claim().then(function() {
          return self.registration.unregister().then(function() {
            console.log('[SW] ✅ Unregistered in development');
          });
        })
      );
    });

    // CRITICAL: Do NOT intercept ANY requests in development
    self.addEventListener('fetch', function(event) {
      // Return immediately - don't intercept ANYTHING
      console.log('[SW] Dev request - NOT intercepting:', event.request.url);
      return; // Let browser handle it - DO NOT call event.respondWith()
    });

    return; // Exit early - don't register any production handlers
  }

  // PRODUCTION CODE (only runs if not development)
  // Bump this when shipping UI changes so clients don't get stuck on stale entry HTML.
  const CACHE_NAME = 'doctrack-v4';
  const RUNTIME_CACHE = 'doctrack-runtime-v4';

  self.addEventListener('install', function(event) {
    console.log('[SW] Installing version 4');
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(['/', '/index.html']);
      }).then(function() {
        return self.skipWaiting();
      })
    );
  });

  self.addEventListener('activate', function(event) {
    console.log('[SW] Activating version 4');
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }).then(function() {
        return self.clients.claim();
      })
    );
  });

  self.addEventListener('fetch', function(event) {
    // Production: network-first
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
  });
})();

// Error handlers
self.addEventListener('error', function(event) {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('[SW] Unhandled rejection:', event.reason);
  event.preventDefault();
});
