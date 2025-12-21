/**
 * Clear Cache Utility
 * Aggressively clears all caches and service workers in development
 */

if (import.meta.env.MODE === 'development' && typeof window !== 'undefined') {
  // Unregister all service workers immediately
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('[ClearCache] Service Worker unregistered:', registration.scope);
          }
        });
      });
    });
  }

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then((success) => {
          if (success) {
            console.log('[ClearCache] Cache deleted:', cacheName);
          }
        });
      });
    });
  }

  // Clear localStorage and sessionStorage (optional - be careful)
  // Uncomment if needed:
  // localStorage.clear();
  // sessionStorage.clear();
}
