# Offline Functionality Documentation

This document describes the offline capabilities and data synchronization features of DocuTrack.

## Overview

DocuTrack provides seamless offline functionality, allowing users to:
- View cached documents when offline
- Create, edit, and delete documents offline
- Automatically sync changes when connection is restored
- See real-time sync status
- Never lose data due to network issues

## Architecture

### 1. IndexedDB Storage (Dexie.js)

The app uses IndexedDB for client-side storage with the following tables:

#### `documents`
- Stores cached document records
- Fields: `id`, `user_id`, `expiration_date`, `created_at`, `cachedAt`, `synced`
- Auto-purged after 30 days if synced

#### `pendingActions`
- Queues offline operations for later sync
- Fields: `id`, `type`, `documentId`, `data`, `timestamp`, `retryCount`, `error`
- Actions: `create`, `update`, `delete`, `renew`

#### `cachedImages`
- Stores document image blobs locally
- Fields: `id`, `documentId`, `blob`, `timestamp`, `size`
- Auto-purged after 30 days

#### `syncMetadata`
- Tracks last sync timestamp
- Used for sync status display

### 2. Services

#### SyncService (`/src/services/syncService.ts`)
Main synchronization engine that:
- Queues offline actions
- Processes pending actions when online
- Manages cache storage
- Monitors storage usage
- Provides sync status

#### OfflineDocumentService (`/src/services/offlineDocumentService.ts`)
Wraps document operations with offline support:
- Tries online operation first
- Falls back to queue if offline/failed
- Creates optimistic updates for instant UI
- Caches results locally

### 3. Hooks

#### `useOnlineStatus()`
- Monitors network connectivity
- Returns `{ isOnline, wasOffline }`
- Triggers on `online`/`offline` events

#### `useSyncStatus()`
- Provides sync state: `syncing`, `lastSynced`, `pendingCount`, `hasPendingChanges`, `error`
- Global state shared across components
- Auto-refreshes when sync completes

#### `useOfflineData()`
- Smart data fetching with cache-first strategy
- Returns cached data instantly
- Fetches fresh data in background if online
- Configurable cache time (default: 5 minutes)

#### `useAutoSync()`
- Auto-syncs on app start
- Auto-syncs when connection restored
- Periodic sync every 5 minutes while online

## User Interface

### 1. Offline Indicator
**Location:** Top of screen (above header)

**States:**
- **Offline (Orange):** "You're offline. Changes will sync when reconnected."
- **Back Online (Green):** "Back online! Your changes are being synced."

**Behavior:**
- Appears when going offline
- Dismissible (but reappears if still offline)
- Auto-hides after 5 seconds when back online

### 2. Sync Status Indicator
**Location:** Header (next to notification bell)

**States:**
- **Synced (Green checkmark):** All changes synced
- **Syncing (Blue spinner):** Actively syncing
- **Pending (Orange dot + count):** X changes waiting to sync
- **Failed (Red exclamation):** Sync error occurred
- **Offline (Gray cloud):** No connection

### 3. Document Status Badges
Each document can show:
- **Synced:** Successfully saved to server
- **Pending:** Waiting to upload
- **Failed:** Upload failed (with retry button)
- **Syncing:** Currently uploading

### 4. Sync Button
Manual sync trigger:
- Disabled when offline
- Shows spinner when syncing
- Available in headers/toolbars

## Data Flow

### Creating a Document Offline

1. User creates document
2. `offlineDocumentService.createDocument()` called
3. If offline:
   - Create optimistic document with temporary ID
   - Queue `create` action in `pendingActions`
   - Cache document locally
   - Show "Pending" badge
4. When online:
   - Auto-sync processes queued action
   - Creates document on server
   - Updates local cache with real ID
   - Removes pending action
   - Shows "Synced" badge

### Editing a Document Offline

1. User edits document
2. `offlineDocumentService.updateDocument()` called
3. If offline:
   - Update local cache immediately (optimistic)
   - Queue `update` action
   - Mark document as unsynced
4. When online:
   - Process pending update
   - Fetch fresh data from server
   - Resolve any conflicts (server wins)

### Conflict Resolution

**Strategy:** Server always wins for expiration dates and critical data.

**Process:**
1. Process pending action
2. If server has newer version:
   - Keep server data
   - Discard local changes
   - Log conflict
3. Update local cache with server version

## Storage Management

### Cache Limits
- **Total Storage:** Uses browser quota (typically 50-100MB+)
- **Auto-cleanup:** Triggered at 80% capacity
- **Old Data Purge:** Removes items > 30 days old

### Cleanup Process
```javascript
await db.clearOldCache(30 * 24 * 60 * 60 * 1000); // 30 days
```

Removes:
- Synced documents older than 30 days
- Cached images not accessed in 30 days
- Failed pending actions (after 3 retries)

### Storage Monitoring
```javascript
const { usage, quota } = await db.getStorageEstimate();
const isLow = await db.isStorageLow(); // true if > 80% used
```

## Synchronization

### Auto-Sync Triggers

1. **App Start** (after 1 second delay)
   ```javascript
   useAutoSync(); // in MainLayout
   ```

2. **Connection Restored**
   - Listens to `online` event
   - Processes all pending actions
   - Fetches latest data

3. **Periodic Sync** (every 5 minutes while online)
   - Background sync of all data
   - Silent operation (no loading indicators)

4. **Manual Sync**
   - User clicks sync button
   - Pull-to-refresh (optional)

### Sync Process

1. **Process Pending Actions**
   - Execute in chronological order
   - Retry failed actions (up to 3 times)
   - Log errors for user review

2. **Fetch Latest Data**
   - Get all documents from server
   - Compare with local cache
   - Update cache with fresh data

3. **Update Metadata**
   - Set `lastSynced` timestamp
   - Update pending count
   - Broadcast sync status

4. **Cleanup**
   - Remove successful actions from queue
   - Check storage usage
   - Purge old cache if needed

### Error Handling

**Action Retry Logic:**
```javascript
try {
  await executeAction(action);
  await db.pendingActions.delete(action.id);
} catch (error) {
  action.retryCount++;
  if (action.retryCount >= 3) {
    // Remove after 3 failures
    await db.pendingActions.delete(action.id);
  } else {
    // Save error for user visibility
    action.error = error.message;
    await db.pendingActions.update(action.id, action);
  }
}
```

**User Notifications:**
- Toast: "You're offline. Changes saved locally."
- Toast: "Sync failed. Retrying..."
- Toast: "Some changes couldn't sync. Tap to view."

## Testing Offline Functionality

### Manual Testing

1. **Go Offline**
   - Chrome DevTools → Network → Offline
   - Or disable network adapter

2. **Create Document**
   - Fill form and submit
   - Should show "Pending" badge
   - Check IndexedDB: `pendingActions` has entry

3. **Edit Document**
   - Make changes
   - Should update UI immediately
   - Check IndexedDB: document marked as unsynced

4. **Delete Document**
   - Should remove from UI
   - Check IndexedDB: soft-deleted in cache

5. **Go Online**
   - Should auto-sync within seconds
   - Check console for sync logs
   - Verify changes on server
   - UI should show "Synced" badges

### Programmatic Testing

```javascript
// Check pending actions
const pending = await db.pendingActions.toArray();
console.log('Pending actions:', pending);

// Check cached documents
const cached = await db.documents.toArray();
console.log('Cached documents:', cached);

// Check sync status
const status = await db.getSyncStatus();
console.log('Sync status:', status);

// Manual sync
await syncService.syncAll(userId);

// Check storage
const { usage, quota } = await db.getStorageEstimate();
console.log(`Storage: ${usage}/${quota} (${(usage/quota*100).toFixed(1)}%)`);
```

## API Reference

### SyncService

```typescript
class SyncService {
  // Queue an offline action
  queueAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<number>

  // Process all pending actions
  processPendingActions(userId: string): Promise<SyncResults>

  // Sync everything (pending actions + fetch fresh data)
  syncAll(userId: string): Promise<void>

  // Cache management
  cacheDocument(document: Document): Promise<void>
  uncacheDocument(documentId: string): Promise<void>
  getCachedDocuments(userId: string): Promise<Document[]>

  // Image caching
  cacheImage(documentId: string, blob: Blob): Promise<void>
  getCachedImage(documentId: string): Promise<Blob | null>
}
```

### Database (Dexie)

```typescript
class OfflineDatabase extends Dexie {
  documents: Table<CachedDocument>
  pendingActions: Table<PendingAction>
  cachedImages: Table<CachedImage>
  syncMetadata: Table<SyncMetadata>

  // Utility methods
  clearOldCache(maxAge?: number): Promise<void>
  getStorageEstimate(): Promise<{ usage: number; quota: number }>
  isStorageLow(): Promise<boolean>
  getSyncStatus(): Promise<SyncStatusInfo>
  updateLastSynced(): Promise<void>
}
```

## Best Practices

### For Developers

1. **Always use OfflineDocumentService** for document operations
2. **Check online status** before showing loading states
3. **Show sync status** to users for transparency
4. **Handle errors gracefully** - queue actions, don't fail
5. **Test offline scenarios** during development
6. **Monitor storage usage** and implement cleanup

### For Users

1. **Trust the system** - changes are safe when offline
2. **Wait for sync** before closing app if possible
3. **Check sync status** in header before critical operations
4. **Report sync errors** if they persist
5. **Clear cache** periodically if storage is low

## Troubleshooting

### "Sync failed" persists
1. Check network connection
2. Clear browser cache
3. Check browser console for errors
4. Report issue with error logs

### Storage full warning
1. Clear old cached data
2. Delete unused documents
3. Clear browser storage if needed

### Changes not syncing
1. Check pending actions count
2. Manually trigger sync
3. Verify online status
4. Check for JavaScript errors

## Future Enhancements

- [ ] Service Worker for true background sync
- [ ] Offline image capture and upload
- [ ] Partial sync (only changed fields)
- [ ] Smarter conflict resolution with merge UI
- [ ] Push notifications for sync completion
- [ ] Export/import offline data for backup
- [ ] Progressive Web App (PWA) support

## Related Files

- `/src/db/offlineDB.ts` - Database schema
- `/src/services/syncService.ts` - Sync logic
- `/src/services/offlineDocumentService.ts` - Offline operations
- `/src/hooks/useOnlineStatus.ts` - Network detection
- `/src/hooks/useSyncStatus.ts` - Sync state management
- `/src/hooks/useOfflineData.ts` - Cache-first data fetching
- `/src/hooks/useAutoSync.ts` - Auto-sync orchestration
- `/src/components/shared/OfflineIndicator.tsx` - Offline banner
- `/src/components/shared/SyncStatusIndicator.tsx` - Sync status badge
