import { db, PendingAction } from '../db/offlineDB';
import { documentService } from './documents';
import { updateSyncStatus } from '../hooks/useSyncStatus';
import type { Document, DocumentFormData } from '../types';

class SyncService {
  private isSyncing = false;
  private syncQueue: Promise<void> = Promise.resolve();

  /**
   * Queue a pending action for offline execution
   */
  async queueAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<number> {
    const id = await db.pendingActions.add({
      ...action,
      timestamp: Date.now(),
      retryCount: 0,
    });

    // Update sync status
    const status = await db.getSyncStatus();
    updateSyncStatus({
      pendingCount: status.pendingCount,
      hasPendingChanges: status.hasPendingChanges,
    });

    return id;
  }

  /**
   * Process all pending actions
   */
  async processPendingActions(userId: string): Promise<{
    success: number;
    failed: number;
    errors: Array<{ action: PendingAction; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ action: PendingAction; error: string }>,
    };

    try {
      const pendingActions = await db.pendingActions.orderBy('timestamp').toArray();

      if (pendingActions.length === 0) {
        return results;
      }

      updateSyncStatus({ syncing: true, error: null });

      for (const action of pendingActions) {
        try {
          await this.executeAction(action, userId);
          await db.pendingActions.delete(action.id!);
          results.success++;
        } catch (error: any) {
          console.error('Failed to execute action:', action, error);
          results.failed++;
          results.errors.push({
            action,
            error: error.message || 'Unknown error',
          });

          // Update retry count
          await db.pendingActions.update(action.id!, {
            retryCount: (action.retryCount || 0) + 1,
            error: error.message,
          });

          // Remove action if retry count exceeds limit
          if ((action.retryCount || 0) >= 3) {
            await db.pendingActions.delete(action.id!);
          }
        }
      }

      return results;
    } finally {
      updateSyncStatus({ syncing: false });
    }
  }

  /**
   * Execute a single pending action
   */
  private async executeAction(action: PendingAction, userId: string): Promise<void> {
    switch (action.type) {
      case 'create':
        await documentService.createDocument(action.data as DocumentFormData, userId);
        break;

      case 'update':
        if (!action.documentId) {
          throw new Error('Document ID required for update action');
        }
        await documentService.updateDocument(
          action.documentId,
          userId,
          action.data as Partial<DocumentFormData>
        );
        break;

      case 'delete':
        if (!action.documentId) {
          throw new Error('Document ID required for delete action');
        }
        await documentService.deleteDocument(action.documentId, userId);
        break;

      case 'renew':
        if (!action.documentId) {
          throw new Error('Document ID required for renew action');
        }
        // Renew is essentially an update with new expiration date
        await documentService.updateDocument(action.documentId, userId, {
          expiration_date: action.data.expiration_date,
        });
        break;

      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }

  /**
   * Sync all data (fetch from server and process pending actions)
   */
  async syncAll(userId: string): Promise<void> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return this.syncQueue;
    }

    this.isSyncing = true;

    this.syncQueue = (async () => {
      try {
        updateSyncStatus({ syncing: true, error: null });

        // 1. Process pending actions first
        const results = await this.processPendingActions(userId);

        if (results.failed > 0) {
          console.warn('Some actions failed to sync:', results.errors);
          updateSyncStatus({
            error: `${results.failed} action(s) failed to sync`,
          });
        }

        // 2. Fetch latest data from server
        const documents = await documentService.getDocuments(userId);

        // 3. Update local cache
        const cachedDocs = documents.map((doc) => ({
          ...doc,
          cachedAt: Date.now(),
          synced: true,
        }));

        await db.documents.clear();
        await db.documents.bulkAdd(cachedDocs);

        // 4. Update sync metadata
        await db.updateLastSynced();

        // 5. Update sync status
        const status = await db.getSyncStatus();
        updateSyncStatus({
          syncing: false,
          lastSynced: status.lastSynced,
          pendingCount: status.pendingCount,
          hasPendingChanges: status.hasPendingChanges,
          error: results.failed > 0 ? `${results.failed} action(s) failed` : null,
        });

        // 6. Check storage usage
        const isLow = await db.isStorageLow();
        if (isLow) {
          console.warn('Storage running low, clearing old cache');
          await db.clearOldCache();
        }
      } catch (error: any) {
        console.error('Sync failed:', error);
        updateSyncStatus({
          syncing: false,
          error: error.message || 'Sync failed',
        });
        throw error;
      } finally {
        this.isSyncing = false;
      }
    })();

    return this.syncQueue;
  }

  /**
   * Save document to local cache
   */
  async cacheDocument(document: Document): Promise<void> {
    await db.documents.put({
      ...document,
      cachedAt: Date.now(),
      synced: false,
    });
  }

  /**
   * Remove document from local cache
   */
  async uncacheDocument(documentId: string): Promise<void> {
    await db.documents.delete(documentId);
  }

  /**
   * Get cached documents
   */
  async getCachedDocuments(userId: string): Promise<Document[]> {
    const docs = await db.documents.where('user_id').equals(userId).toArray();
    return docs;
  }

  /**
   * Cache image blob
   */
  async cacheImage(documentId: string, blob: Blob): Promise<void> {
    await db.cachedImages.put({
      id: `${documentId}-${Date.now()}`,
      documentId,
      blob,
      timestamp: Date.now(),
      size: blob.size,
    });
  }

  /**
   * Get cached image
   */
  async getCachedImage(documentId: string): Promise<Blob | null> {
    const cached = await db.cachedImages.where('documentId').equals(documentId).first();
    return cached?.blob || null;
  }
}

export const syncService = new SyncService();
