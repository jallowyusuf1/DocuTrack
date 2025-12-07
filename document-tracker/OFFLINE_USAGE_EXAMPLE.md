# Offline Functionality - Usage Examples

## Quick Start: Making Your Components Offline-Ready

### Example 1: Documents List Page

**Before (Online Only):**
```typescript
const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await documentService.getDocuments(user.id);
      setDocuments(docs);
      setLoading(false);
    };
    fetchDocuments();
  }, [user]);

  // ...render
};
```

**After (Offline-Ready):**
```typescript
import { useOfflineData } from '../hooks/useOfflineData';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { documentService } from '../services/documents';

const Documents = () => {
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();

  const {
    data: documents,
    loading,
    fromCache,
    refetch,
  } = useOfflineData(
    'documents',
    () => documentService.getDocuments(user.id),
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
      fetchOnMount: true,
      refetchOnOnline: true,
    }
  );

  return (
    <div>
      {/* Show cache indicator */}
      {fromCache && !isOnline && (
        <div className="bg-blue-50 text-blue-700 px-4 py-2 text-sm">
          Showing cached data (offline)
        </div>
      )}

      {/* Show documents */}
      {loading ? <Skeleton /> : <DocumentList documents={documents} />}

      {/* Pull to refresh */}
      <PullToRefresh onRefresh={refetch} />
    </div>
  );
};
```

### Example 2: Creating a Document Offline

**Before:**
```typescript
const handleCreateDocument = async (data: DocumentFormData) => {
  setLoading(true);
  try {
    await documentService.createDocument(data, user.id);
    showToast('Document created!', 'success');
    navigate('/documents');
  } catch (error) {
    showToast('Failed to create document', 'error');
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
import { offlineDocumentService } from '../services/offlineDocumentService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const handleCreateDocument = async (data: DocumentFormData) => {
  const { isOnline } = useOnlineStatus();
  setLoading(true);

  try {
    const document = await offlineDocumentService.createDocument(
      data,
      user.id,
      isOnline
    );

    if (isOnline) {
      showToast('Document created!', 'success');
    } else {
      showToast('Document saved offline. Will sync when online.', 'info');
    }

    navigate('/documents');
  } catch (error) {
    showToast('Failed to create document', 'error');
  } finally {
    setLoading(false);
  }
};
```

### Example 3: Deleting a Document with Optimistic Update

```typescript
import { offlineDocumentService } from '../services/offlineDocumentService';
import { syncService } from '../services/syncService';

const handleDeleteDocument = async (documentId: string) => {
  const { isOnline } = useOnlineStatus();

  // Optimistic update: Remove from UI immediately
  setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

  try {
    await offlineDocumentService.deleteDocument(documentId, user.id, isOnline);

    if (isOnline) {
      showToast('Document deleted!', 'success');
    } else {
      showToast('Delete queued. Will sync when online.', 'info');
    }
  } catch (error) {
    // Revert optimistic update
    const cachedDoc = await syncService.getCachedDocuments(user.id);
    setDocuments(cachedDoc);

    showToast('Failed to delete document', 'error');
  }
};
```

### Example 4: Manual Sync Button

```typescript
import SyncButton from '../components/shared/SyncButton';

const MyComponent = () => {
  const handleSyncComplete = () => {
    // Refresh data after sync
    refetchDocuments();
    showToast('Sync complete!', 'success');
  };

  return (
    <div>
      <SyncButton
        onSyncComplete={handleSyncComplete}
        showText={true}
        className="my-custom-class"
      />
    </div>
  );
};
```

### Example 5: Showing Document Sync Status

```typescript
import DocumentStatusBadge from '../components/documents/DocumentStatusBadge';

const DocumentCard = ({ document }) => {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'failed'>('synced');

  // Check if document is pending sync
  useEffect(() => {
    const checkStatus = async () => {
      const pending = await db.pendingActions
        .where('documentId')
        .equals(document.id)
        .toArray();

      if (pending.length > 0) {
        setSyncStatus(pending[0].error ? 'failed' : 'pending');
      } else {
        setSyncStatus('synced');
      }
    };
    checkStatus();
  }, [document.id]);

  const handleRetry = async () => {
    // Retry failed sync
    await syncService.syncAll(user.id);
  };

  return (
    <div className="document-card">
      <h3>{document.document_name}</h3>

      <DocumentStatusBadge
        status={syncStatus}
        onRetry={syncStatus === 'failed' ? handleRetry : undefined}
      />
    </div>
  );
};
```

### Example 6: Pull-to-Refresh Implementation

```typescript
import { useState } from 'react';
import { syncService } from '../services/syncService';

const PullToRefresh = ({ onRefresh }) => {
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();
  const [pulling, setPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startY === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      setPullDistance(distance);
      setPulling(true);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80 && isOnline) {
      // Trigger sync
      await syncService.syncAll(user.id);
      onRefresh?.();
    }

    setPullDistance(0);
    setPulling(false);
    setStartY(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pulling && (
        <div
          className="pull-indicator"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
        >
          {pullDistance > 80 ? 'Release to sync' : 'Pull to sync'}
        </div>
      )}

      {/* Your content */}
    </div>
  );
};
```

### Example 7: Monitoring Sync Status Globally

```typescript
import { useSyncStatus } from '../hooks/useSyncStatus';

const SyncMonitor = () => {
  const { syncing, lastSynced, pendingCount, hasPendingChanges, error } = useSyncStatus();

  return (
    <div className="sync-monitor">
      {syncing && <div>Syncing...</div>}

      {hasPendingChanges && (
        <div className="warning">
          {pendingCount} change(s) waiting to sync
        </div>
      )}

      {error && (
        <div className="error">
          Sync failed: {error}
          <button onClick={() => syncService.syncAll(user.id)}>
            Retry
          </button>
        </div>
      )}

      {lastSynced && (
        <div className="info">
          Last synced: {formatDistanceToNow(lastSynced, { addSuffix: true })}
        </div>
      )}
    </div>
  );
};
```

### Example 8: Storage Management

```typescript
import { db } from '../db/offlineDB';
import { useEffect, useState } from 'react';

const StorageInfo = () => {
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0, percentage: 0 });

  useEffect(() => {
    const checkStorage = async () => {
      const { usage, quota } = await db.getStorageEstimate();
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      setStorageInfo({ usage, quota, percentage });

      // Warn if low
      if (percentage > 80) {
        showToast('Storage running low. Clearing old cache...', 'warning');
        await db.clearOldCache();
      }
    };

    checkStorage();
  }, []);

  return (
    <div className="storage-info">
      <h4>Storage Usage</h4>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${storageInfo.percentage}%`,
            backgroundColor:
              storageInfo.percentage > 80
                ? 'red'
                : storageInfo.percentage > 60
                ? 'orange'
                : 'green',
          }}
        />
      </div>
      <p>
        {(storageInfo.usage / 1024 / 1024).toFixed(2)} MB /{' '}
        {(storageInfo.quota / 1024 / 1024).toFixed(2)} MB
      </p>
    </div>
  );
};
```

## Testing Your Offline Implementation

### 1. Test Offline Creation
```javascript
// 1. Open DevTools → Network → Set to "Offline"
// 2. Create a document
// 3. Check IndexedDB:
await db.pendingActions.toArray(); // Should have 1 entry
await db.documents.toArray(); // Should have optimistic document

// 4. Go back online
// 5. Wait for auto-sync (or trigger manually)
// 6. Check server: document should exist
// 7. Check IndexedDB: pending action should be cleared
```

### 2. Test Cache Expiration
```javascript
// 1. Fetch documents (goes to cache)
// 2. Wait 5+ minutes
// 3. Fetch again (should fetch fresh from server)
// 4. Go offline
// 5. Fetch again (should use cache even if expired)
```

### 3. Test Sync Status
```javascript
// Monitor sync status changes
const { syncing, pendingCount } = useSyncStatus();
console.log({ syncing, pendingCount });

// Should change when:
// - Going offline and creating document (pendingCount++)
// - Coming back online (syncing = true)
// - After sync completes (syncing = false, pendingCount = 0)
```

## Common Patterns

### Pattern 1: Loading States with Cache
```typescript
{loading && !fromCache && <LoadingSpinner />}
{loading && fromCache && <div>Updating...</div>}
{!loading && data && <DataDisplay data={data} />}
```

### Pattern 2: Offline Banners
```typescript
{!isOnline && (
  <div className="offline-banner">
    You're offline. Changes will sync when reconnected.
  </div>
)}
```

### Pattern 3: Conditional Features
```typescript
<button
  disabled={!isOnline}
  onClick={handleUpload}
  title={!isOnline ? 'Available when online' : 'Upload file'}
>
  Upload
</button>
```

## Troubleshooting

### Issue: "Changes not syncing"
**Solution:**
```javascript
// Check pending actions
const pending = await db.pendingActions.toArray();
console.log('Pending:', pending);

// Manual sync
await syncService.syncAll(user.id);

// Check for errors
const { error } = useSyncStatus();
console.log('Sync error:', error);
```

### Issue: "Out of storage"
**Solution:**
```javascript
// Clear old cache
await db.clearOldCache(7 * 24 * 60 * 60 * 1000); // 7 days

// Or clear everything
await db.delete();
await db.open();
```

### Issue: "Duplicate documents after sync"
**Solution:** This shouldn't happen, but if it does:
```javascript
// Clear cache and re-fetch
await db.documents.clear();
await syncService.syncAll(user.id);
```

## Best Practices

1. **Always check `isOnline` before showing loading states**
2. **Use `fromCache` to inform users about data freshness**
3. **Show sync status prominently for transparency**
4. **Queue actions liberally - better to queue than to fail**
5. **Test offline scenarios during development**
6. **Monitor storage usage in production**
7. **Provide manual sync buttons as escape hatch**

## Next Steps

1. Integrate offline functionality into your documents pages
2. Add sync status to your UI
3. Test offline scenarios thoroughly
4. Monitor sync errors in production
5. Consider adding Service Worker for true background sync
