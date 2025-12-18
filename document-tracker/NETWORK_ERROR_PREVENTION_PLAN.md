# Network Error Prevention - Comprehensive Execution Plan

## Problem Analysis

Based on the console errors, you're experiencing multiple critical issues:

### 1. **Service Worker Errors**
- `[Service Worker] Network failed, trying cache: TypeError: Failed to fetch`
- Service Worker is intercepting requests but failing on network operations
- Cache-first strategy is breaking during development

### 2. **WebSocket/HMR Failures**
- `WebSocket connection to 'ws://localhost:5173/...' failed`
- `[vite] failed to connect to websocket`
- Port mismatch: Vite is on port 5174 but trying to connect to 5173
- Hot Module Replacement (HMR) is completely broken

### 3. **Network First Strategy Failures**
- `Uncaught (in promise) TypeError: Failed to fetch at networkFirstStrategy`
- Service Worker's `networkFirstStrategy` is causing unhandled promise rejections
- Component lazy loading is failing

### 4. **FetchEvent Promise Rejection**
- `The FetchEvent for "http://localhost:5173/src/components/LoadingSkeleton.tsx?t=..."` resulted in network error
- Development hot reload is being intercepted by Service Worker
- `.tsx` files are being cached incorrectly

---

## Root Causes

1. **Service Worker Running in Development** - Should only run in production
2. **Port Mismatch** - Config shows 5174 but errors show 5173
3. **Service Worker Intercepting Dev Resources** - Blocking Vite HMR
4. **Missing Error Handling** - Service Worker fetch errors aren't caught properly
5. **Stale Service Worker** - Old SW might still be registered

---

## Complete Solution Plan

### Phase 1: Immediate Fixes (Stop the Bleeding)

#### Step 1.1: Disable Service Worker in Development
**File**: `document-tracker/src/main.tsx`

**Current (Line 32-42)**:
```typescript
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
```

**Problem**: Even though it checks for production, there might be a stale SW running.

**Fix**: Add explicit unregistration in development:
```typescript
// Service Worker Management
if ('serviceWorker' in navigator) {
  if (import.meta.env.MODE === 'production') {
    // Register SW in production
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
    // CRITICAL: Unregister ALL service workers in development
    window.addEventListener('load', () => {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister()
              .then(() => console.log('[SW] Unregistered for development'));
          });
        });
    });
  }
}
```

#### Step 1.2: Fix Port Configuration
**File**: `document-tracker/vite.config.ts`

**Current (Line 34)**: Port is 5174
**Error Shows**: Port 5173

**Action**: Either stick with 5174 everywhere or change to 5173. Recommend 5173 (Vite default).

**Fix**:
```typescript
server: {
  port: 5173, // Use Vite's default port
  strictPort: false, // Allow fallback if port is busy
  host: 'localhost',
  open: false,
  hmr: {
    overlay: true,
    clientPort: 5173, // Match server port
    protocol: 'ws',
    host: 'localhost',
  },
},
```

#### Step 1.3: Improve Service Worker Error Handling
**File**: `document-tracker/public/sw.js`

**Problems**:
- Missing error handling in networkFirstStrategy
- No development bypass
- Fetch errors cause unhandled rejections

**Complete Rewrite**:
```javascript
/* eslint-disable no-restricted-globals */
/* Service Worker for DocuTrack PWA */

const CACHE_NAME = 'doctrack-v2'; // Increment version
const RUNTIME_CACHE = 'doctrack-runtime-v2';
const CACHE_VERSION = 2;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.error('[SW] Cache failed:', err);
          // Don't fail install if caching fails
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
      .then(() => self.clients.claim())
  );
});

// Network-first strategy with proper error handling
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Ignore cache errors
      });
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Both failed - return proper error response instead of throwing
    console.error('[SW] Cache miss for:', request.url);
    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

// Fetch event - serve from network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip development resources (HMR, etc.)
  if (url.search.includes('@vite') ||
      url.search.includes('?t=') ||
      url.pathname.includes('node_modules') ||
      url.pathname.includes('@fs') ||
      url.pathname.endsWith('.tsx') ||
      url.pathname.endsWith('.ts') ||
      url.pathname.endsWith('.jsx') ||
      url.pathname.endsWith('.js.map')) {
    return; // Let browser handle these
  }

  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Skip Supabase API calls (always use network)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
    return;
  }

  // Skip external resources
  if (url.origin !== self.location.origin) {
    return;
  }

  // Use network-first strategy with error handling
  event.respondWith(networkFirst(request));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  if (event.tag === 'sync-documents') {
    event.waitUntil(syncDocuments());
  }
});

async function syncDocuments() {
  console.log('[SW] Syncing documents...');
  // Implement document sync logic here
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'doctrack-notification',
  };

  event.waitUntil(
    self.registration.showNotification('DocuTrack', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Handle errors globally
self.addEventListener('error', (event) => {
  console.error('[SW] Global error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
  event.preventDefault(); // Prevent error from bubbling
});
```

---

### Phase 2: Configuration Hardening

#### Step 2.1: Update Vite Config for Better HMR
**File**: `document-tracker/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
      'date-fns',
      'i18next',
      'react-i18next',
    ],
    force: true,
    esbuildOptions: {
      target: 'es2020',
    },
  },
  server: {
    port: 5173,
    strictPort: false, // Allow fallback
    host: 'localhost',
    open: false,
    cors: true, // Enable CORS for development
    hmr: {
      overlay: true,
      clientPort: 5173,
      protocol: 'ws',
      host: 'localhost',
      timeout: 30000, // Increase timeout
    },
    watch: {
      // Better file watching
      usePolling: false,
      interval: 100,
    },
  },
  build: {
    commonjsOptions: {
      include: [/react/, /react-dom/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    sourcemap: false, // Disable in production to reduce size
    minify: 'esbuild', // Faster builds
  },
})
```

#### Step 2.2: Add Service Worker Cleanup Script
**File**: `document-tracker/scripts/clear-sw.sh`

```bash
#!/bin/bash

echo "🧹 Clearing Service Worker cache..."

# Kill any running dev servers
echo "Stopping any running dev servers..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# Clear node_modules cache
echo "Clearing node_modules cache..."
rm -rf node_modules/.vite

# Clear browser cache instruction
echo ""
echo "✅ Cache cleared!"
echo ""
echo "📋 Next steps:"
echo "1. Open DevTools (F12)"
echo "2. Go to Application > Service Workers"
echo "3. Click 'Unregister' on all workers"
echo "4. Go to Application > Storage"
echo "5. Click 'Clear site data'"
echo "6. Close all browser tabs for localhost"
echo "7. Run: npm run dev"
echo ""
```

Make it executable:
```bash
chmod +x scripts/clear-sw.sh
```

#### Step 2.3: Add NPM Script
**File**: `document-tracker/package.json`

Add to scripts section:
```json
"clear-sw": "bash scripts/clear-sw.sh",
"dev:clean": "npm run clear-sw && npm run dev",
```

---

### Phase 3: Development Workflow Improvements

#### Step 3.1: Add Browser Cache Clear Utility
**File**: `document-tracker/src/utils/clearCache.ts`

```typescript
/**
 * Utility to clear all caches in development
 * Call this from browser console: clearAllCaches()
 */
export async function clearAllCaches(): Promise<void> {
  if ('serviceWorker' in navigator) {
    // Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('✅ Unregistered service worker');
    }
  }

  // Clear all caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log(`✅ Deleted cache: ${cacheName}`);
    }
  }

  // Clear localStorage
  localStorage.clear();
  console.log('✅ Cleared localStorage');

  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✅ Cleared sessionStorage');

  console.log('🎉 All caches cleared! Reload the page.');
}

// Make it available globally in development
if (import.meta.env.MODE === 'development') {
  (window as any).clearAllCaches = clearAllCaches;
  console.log('💡 Tip: Run clearAllCaches() in console to clear all caches');
}
```

Then import in `main.tsx`:
```typescript
import './utils/clearCache';
```

---

### Phase 4: Testing & Validation

#### Step 4.1: Create Validation Script
**File**: `document-tracker/scripts/validate-network.js`

```javascript
#!/usr/bin/env node

/**
 * Validates network configuration
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Validating network configuration...\n');

let hasErrors = false;

// Check vite.config.ts
try {
  const viteConfig = readFileSync(
    join(__dirname, '../vite.config.ts'),
    'utf-8'
  );

  // Check for consistent port
  const portMatches = viteConfig.match(/port:\s*(\d+)/g);
  if (portMatches) {
    const ports = portMatches.map((m) => m.match(/\d+/)[0]);
    const uniquePorts = [...new Set(ports)];

    if (uniquePorts.length > 1) {
      console.error('❌ ERROR: Multiple ports found in vite.config.ts');
      console.error('   Ports:', uniquePorts.join(', '));
      hasErrors = true;
    } else {
      console.log('✅ Port configuration consistent:', uniquePorts[0]);
    }
  }
} catch (error) {
  console.error('❌ ERROR: Could not read vite.config.ts');
  hasErrors = true;
}

// Check main.tsx for SW unregistration
try {
  const mainFile = readFileSync(
    join(__dirname, '../src/main.tsx'),
    'utf-8'
  );

  if (mainFile.includes('getRegistrations')) {
    console.log('✅ Service Worker unregistration present');
  } else {
    console.error('❌ ERROR: Missing SW unregistration in development');
    hasErrors = true;
  }
} catch (error) {
  console.error('❌ ERROR: Could not read main.tsx');
  hasErrors = true;
}

// Check sw.js for error handling
try {
  const swFile = readFileSync(
    join(__dirname, '../public/sw.js'),
    'utf-8'
  );

  if (swFile.includes('unhandledrejection')) {
    console.log('✅ Service Worker has error handling');
  } else {
    console.warn('⚠️  WARNING: SW missing unhandledrejection handler');
  }

  if (swFile.includes('.tsx') || swFile.includes('@vite')) {
    console.log('✅ Service Worker skips dev resources');
  } else {
    console.warn('⚠️  WARNING: SW might cache dev resources');
  }
} catch (error) {
  console.error('❌ ERROR: Could not read sw.js');
  hasErrors = true;
}

console.log('');
if (hasErrors) {
  console.error('❌ Validation failed! Please fix errors above.');
  process.exit(1);
} else {
  console.log('✅ All validations passed!');
  process.exit(0);
}
```

Add to package.json:
```json
"validate-network": "node scripts/validate-network.js",
```

---

## Execution Checklist

### Immediate Actions (Do This Now):

- [ ] 1. **Stop Dev Server** - Kill all running instances
- [ ] 2. **Clear Browser Caches**
  - Open DevTools (F12)
  - Application > Service Workers > Unregister All
  - Application > Storage > Clear site data
  - Close ALL localhost tabs
- [ ] 3. **Update main.tsx** - Add SW unregistration for dev
- [ ] 4. **Fix vite.config.ts** - Use port 5173 consistently
- [ ] 5. **Update sw.js** - Add error handling & dev resource skipping
- [ ] 6. **Create clear-sw.sh** - Add cleanup script
- [ ] 7. **Update package.json** - Add new scripts
- [ ] 8. **Create clearCache.ts** - Add browser utility
- [ ] 9. **Create validate-network.js** - Add validation
- [ ] 10. **Run Validation** - `npm run validate-network`
- [ ] 11. **Clean Start** - `npm run dev:clean`
- [ ] 12. **Test** - Open browser, check console for errors

### Post-Fix Validation:

- [ ] No Service Worker errors in console
- [ ] No WebSocket connection failures
- [ ] HMR working (edit a file, see instant update)
- [ ] No "Failed to fetch" errors
- [ ] No "Promise rejection" errors
- [ ] Port 5173 used consistently

---

## Prevention Going Forward

### Development Best Practices:

1. **Never test SW in development** - Always use production build
2. **Check console before starting work** - Clear errors immediately
3. **Use `npm run dev:clean`** if you see any cache errors
4. **Run validation before commits** - Add to pre-commit hook

### Add to Pre-Commit Hook:

In `package.json`, update:
```json
"precommit": "npm run lint && npm run type-check && npm run validate-refs && npm run validate-network",
```

### Monthly Maintenance:

1. Clear all browser caches
2. Update Service Worker cache version
3. Test production build: `npm run build && npm run preview`
4. Verify SW works in production but not dev

---

## Emergency Recovery

If errors persist after all fixes:

```bash
# Nuclear option - complete reset
rm -rf node_modules
rm -rf .vite
rm package-lock.json
npm install
npm run dev:clean
```

Then in browser:
1. F12 > Application > Service Workers > Unregister
2. Application > Storage > Clear site data
3. Close browser completely
4. Reopen and test

---

## Success Criteria

You'll know it's fixed when:

✅ **Zero** Service Worker errors in console
✅ **Zero** WebSocket failures
✅ **Zero** "Failed to fetch" errors
✅ **Zero** Promise rejections
✅ HMR updates work instantly
✅ Console shows: `[SW] Unregistered for development`
✅ Only production builds register Service Worker

---

## Files Modified

1. ✏️ `document-tracker/src/main.tsx` - SW unregistration
2. ✏️ `document-tracker/vite.config.ts` - Port fix & HMR config
3. ✏️ `document-tracker/public/sw.js` - Error handling & dev bypass
4. ✏️ `document-tracker/package.json` - New scripts
5. ➕ `document-tracker/scripts/clear-sw.sh` - Cleanup script
6. ➕ `document-tracker/src/utils/clearCache.ts` - Browser utility
7. ➕ `document-tracker/scripts/validate-network.js` - Validation

---

## Estimated Time

- Immediate fixes: **15 minutes**
- Testing & validation: **10 minutes**
- **Total: 25 minutes**

---

## Support

If errors persist:
1. Check browser console for new errors
2. Run `npm run validate-network`
3. Check Network tab in DevTools
4. Verify no service workers registered (DevTools > Application)

---

**Last Updated**: 2025-12-10
**Status**: Ready for execution
**Priority**: 🔴 CRITICAL - Execute immediately
