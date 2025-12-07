# Troubleshooting Guide - Offline Functionality

This guide provides solutions to common errors and issues you might encounter with the offline functionality.

## Common Errors and Solutions

### 1. SyntaxError: Module does not provide export 'PendingAction'

**Error Message:**
```
Uncaught SyntaxError: The requested module '/src/db/offlineDB.ts' does not provide an export named 'PendingAction'
```

**Root Cause:**
- Incorrect Dexie query syntax (using `.filter()` instead of `.where()`)
- TypeScript compilation issues
- Module bundler cache issues

**Solution:**
1. Ensure correct Dexie query syntax:
   ```typescript
   // ❌ WRONG
   const unsyncedDocs = await this.documents.filter((doc) => doc.synced === false).count();

   // ✅ CORRECT
   const unsyncedDocs = await this.documents.where('synced').equals(false).count();
   ```

2. Clear Vite cache and restart dev server:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

### 2. Database Not Opening

**Error Message:**
```
Failed to open offline database: ...
```

**Solutions:**

1. **Clear IndexedDB:**
   - Open DevTools → Application → IndexedDB
   - Delete `DocumentTrackerDB`
   - Refresh page

2. **Check browser support:**
   ```javascript
   if (!window.indexedDB) {
     console.error('IndexedDB not supported');
   }
   ```

3. **Check for quota exceeded errors:**
   ```javascript
   const { usage, quota } = await db.getStorageEstimate();
   if (usage > quota * 0.9) {
     await db.clearOldCache();
   }
   ```

### 3. Sync Not Working

**Symptoms:**
- Pending actions not processing
- Changes not appearing on server
- Sync status stuck on "Syncing..."

**Solutions:**

1. **Check network status:**
   ```javascript
   console.log('Online:', navigator.onLine);
   ```

2. **Check pending actions:**
   ```javascript
   const pending = await db.pendingActions.toArray();
   console.log('Pending actions:', pending);
   ```

3. **Manually trigger sync:**
   ```javascript
   await syncService.syncAll(userId);
   ```

4. **Check for errors in pending actions:**
   ```javascript
   const failedActions = await db.pendingActions
     .filter(action => action.error)
     .toArray();
   console.log('Failed actions:', failedActions);
   ```

5. **Clear stuck actions:**
   ```javascript
   // Clear all pending actions (USE WITH CAUTION)
   await db.pendingActions.clear();
   ```

### 4. Circular Dependency Warnings

**Error Message:**
```
Warning: Circular dependency detected
```

**Prevention:**
- Keep imports one-directional
- Use type-only imports when possible:
  ```typescript
  import type { PendingAction } from '../db/offlineDB';
  ```
- Avoid importing from barrel files (index.ts)

**Import Structure:**
```
db/offlineDB.ts (no dependencies on services/hooks)
    ↓
services/syncService.ts (depends on db, exports functions)
    ↓
hooks/useSyncStatus.ts (imports updateSyncStatus function)
    ↓
components (use hooks)
```

### 5. TypeScript Errors After Adding Offline Features

**Common Issues:**

1. **Missing type definitions:**
   ```bash
   npm install --save-dev @types/dexie
   ```

2. **Incorrect Table typing:**
   ```typescript
   // ❌ WRONG
   documents!: Table<Document>;

   // ✅ CORRECT
   documents!: Table<CachedDocument, string>;
   ```

3. **Import type vs import:**
   ```typescript
   // For types only
   import type { Document } from '../types';

   // For values
   import { db } from '../db/offlineDB';
   ```

### 6. Storage Quota Exceeded

**Error Message:**
```
QuotaExceededError: The quota has been exceeded
```

**Solutions:**

1. **Check current usage:**
   ```javascript
   const { usage, quota } = await db.getStorageEstimate();
   console.log(`Using ${(usage/1024/1024).toFixed(2)} MB of ${(quota/1024/1024).toFixed(2)} MB`);
   ```

2. **Clear old cache:**
   ```javascript
   await db.clearOldCache(7 * 24 * 60 * 60 * 1000); // 7 days
   ```

3. **Request persistent storage:**
   ```javascript
   if (navigator.storage && navigator.storage.persist) {
     const isPersisted = await navigator.storage.persist();
     console.log(`Persisted storage granted: ${isPersisted}`);
   }
   ```

### 7. Optimistic Updates Reverting Unexpectedly

**Cause:** Server response doesn't match optimistic update

**Solution:**

1. **Ensure consistent data structure:**
   ```typescript
   const optimisticDoc: Document = {
     id: `temp-${Date.now()}`,
     // ... all required fields
   };
   ```

2. **Handle server response properly:**
   ```typescript
   try {
     const serverDoc = await documentService.createDocument(data, userId);
     // Replace optimistic doc with server doc
     setDocuments(prev => prev.map(doc =>
       doc.id === optimisticDoc.id ? serverDoc : doc
     ));
   } catch (error) {
     // Revert optimistic update
     setDocuments(prev => prev.filter(doc => doc.id !== optimisticDoc.id));
   }
   ```

### 8. Auto-Sync Not Triggering

**Symptoms:**
- App doesn't sync on startup
- Doesn't sync when coming back online

**Solutions:**

1. **Check useAutoSync is called:**
   ```typescript
   // In MainLayout.tsx
   import { useAutoSync } from '../hooks/useAutoSync';

   export default function MainLayout() {
     useAutoSync(); // ← Must be here
     // ...
   }
   ```

2. **Check online event listeners:**
   ```javascript
   window.addEventListener('online', () => {
     console.log('Online event fired');
   });
   ```

3. **Manually trigger initial sync:**
   ```javascript
   useEffect(() => {
     if (user?.id && navigator.onLine) {
       syncService.syncAll(user.id);
     }
   }, [user]);
   ```

## Execution Plan: Adding New Offline Features

When adding new offline-capable features, follow this plan to avoid errors:

### Step 1: Update Database Schema

```typescript
// 1. Add new interface in offlineDB.ts
export interface NewFeature {
  id: string;
  // ... fields
}

// 2. Add table to OfflineDatabase class
class OfflineDatabase extends Dexie {
  newFeatures!: Table<NewFeature, string>;

  constructor() {
    super('DocumentTrackerDB');

    // 3. Increment version and add store
    this.version(2).stores({
      // ... existing stores
      newFeatures: 'id, userId, timestamp',
    });
  }
}
```

### Step 2: Add Sync Logic

```typescript
// In syncService.ts

// 1. Add new action type
type ActionType = 'create' | 'update' | 'delete' | 'renew' | 'newFeatureAction';

// 2. Add handler in executeAction
private async executeAction(action: PendingAction) {
  switch (action.type) {
    case 'newFeatureAction':
      await newFeatureService.performAction(action.data);
      break;
    // ... existing cases
  }
}

// 3. Add cache methods
async cacheNewFeature(item: NewFeature): Promise<void> {
  await db.newFeatures.put(item);
}
```

### Step 3: Create Service Wrapper

```typescript
// Create offlineNewFeatureService.ts
export class OfflineNewFeatureService {
  async performAction(data: any, isOnline: boolean) {
    if (isOnline) {
      try {
        return await newFeatureService.performAction(data);
      } catch (error) {
        // Fall through to queue
      }
    }

    await syncService.queueAction({
      type: 'newFeatureAction',
      data,
    });
  }
}
```

### Step 4: Update UI Components

```typescript
// Use the offline service
import { offlineNewFeatureService } from '../services/offlineNewFeatureService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const MyComponent = () => {
  const { isOnline } = useOnlineStatus();

  const handleAction = async () => {
    await offlineNewFeatureService.performAction(data, isOnline);
  };
};
```

### Step 5: Test Thoroughly

1. Test online flow
2. Test offline queueing
3. Test sync when back online
4. Test error handling
5. Test storage cleanup

## Prevention Checklist

Before deploying offline features, verify:

- [ ] All Dexie queries use correct syntax (`.where()` not `.filter()`)
- [ ] All interfaces are exported from `offlineDB.ts`
- [ ] No circular dependencies between files
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Auto-sync is initialized in MainLayout
- [ ] Storage cleanup is implemented
- [ ] Error handling for all async operations
- [ ] Optimistic updates have revert logic
- [ ] UI shows sync status clearly
- [ ] Tested offline → online → sync flow

## Debugging Tools

### Check Database State

```javascript
// Open browser console and run:

// View all tables
await db.tables.forEach(table => {
  console.log(table.name);
});

// View documents
await db.documents.toArray().then(console.log);

// View pending actions
await db.pendingActions.toArray().then(console.log);

// View sync metadata
await db.syncMetadata.toArray().then(console.log);

// Check storage
const { usage, quota } = await db.getStorageEstimate();
console.log(`Storage: ${(usage/1024/1024).toFixed(2)}MB / ${(quota/1024/1024).toFixed(2)}MB`);
```

### Monitor Sync Events

```javascript
// Add logging to syncService
import { db } from '../db/offlineDB';

db.pendingActions.hook('creating', (primKey, obj) => {
  console.log('Queueing action:', obj);
});

db.pendingActions.hook('deleting', (primKey, obj) => {
  console.log('Completed action:', obj);
});
```

### Network Simulation

```javascript
// Simulate going offline
window.dispatchEvent(new Event('offline'));

// Simulate coming online
window.dispatchEvent(new Event('online'));

// Check status
console.log('Online status:', navigator.onLine);
```

## Quick Fixes

### Reset Everything
```javascript
// Nuclear option - clears all offline data
await db.delete();
await db.open();
localStorage.clear();
location.reload();
```

### Force Sync
```javascript
// Force sync ignoring errors
import { syncService } from './services/syncService';
import { useAuth } from './hooks/useAuth';

const { user } = useAuth();
await syncService.syncAll(user.id);
```

### Clear Failed Actions
```javascript
// Remove actions that have failed 3+ times
const failedActions = await db.pendingActions
  .filter(action => action.retryCount >= 3)
  .toArray();

for (const action of failedActions) {
  await db.pendingActions.delete(action.id);
}
```

## Getting Help

If you encounter an error not covered here:

1. Check browser console for detailed error message
2. Run TypeScript compilation: `npx tsc --noEmit`
3. Check network tab for failed requests
4. Inspect IndexedDB in DevTools
5. Review the error stack trace for file/line number
6. Check this guide for similar issues
7. Review OFFLINE_FUNCTIONALITY.md for architecture details

## Additional Resources

- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- Project Files:
  - `/src/db/offlineDB.ts` - Database schema
  - `/src/services/syncService.ts` - Sync logic
  - `/OFFLINE_FUNCTIONALITY.md` - Architecture docs
  - `/OFFLINE_USAGE_EXAMPLE.md` - Code examples
