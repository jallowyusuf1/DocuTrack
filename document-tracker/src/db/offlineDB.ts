import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Document } from '../types';

export interface PendingAction {
  id?: number;
  type: 'create' | 'update' | 'delete' | 'renew';
  documentId?: string;
  data: any;
  timestamp: number;
  retryCount?: number;
  error?: string;
}

export interface CachedImage {
  id: string;
  documentId: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

export interface CachedDocument extends Document {
  cachedAt: number;
  synced: boolean;
}

export interface SyncMetadata {
  key: string;
  lastSyncedAt: number;
  version: number;
}

class OfflineDatabase extends Dexie {
  documents!: Table<CachedDocument, string>;
  pendingActions!: Table<PendingAction, number>;
  cachedImages!: Table<CachedImage, string>;
  syncMetadata!: Table<SyncMetadata, string>;

  constructor() {
    super('DocumentTrackerDB');

    this.version(1).stores({
      documents: 'id, user_id, expiration_date, created_at, cachedAt, synced',
      pendingActions: '++id, type, timestamp, documentId',
      cachedImages: 'id, documentId, timestamp',
      syncMetadata: 'key, lastSyncedAt',
    });
  }

  /**
   * Clear old cached data to free up storage
   */
  async clearOldCache(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffTime = Date.now() - maxAge;

    // Clear old cached images
    await this.cachedImages.where('timestamp').below(cutoffTime).delete();

    // Clear old unsynced documents
    await this.documents
      .where('cachedAt')
      .below(cutoffTime)
      .and((doc) => doc.synced === true)
      .delete();
  }

  /**
   * Get storage usage estimate
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }

  /**
   * Check if storage is running low (> 80% used)
   */
  async isStorageLow(): Promise<boolean> {
    const { usage, quota } = await this.getStorageEstimate();
    if (quota === 0) return false;
    return usage / quota > 0.8;
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    pendingCount: number;
    lastSynced: number | null;
    hasPendingChanges: boolean;
  }> {
    const pendingCount = await this.pendingActions.count();
    const metadata = await this.syncMetadata.get('documents');
    const unsyncedDocs = await this.documents.filter((doc) => doc.synced === false).count();

    return {
      pendingCount,
      lastSynced: metadata?.lastSyncedAt || null,
      hasPendingChanges: pendingCount > 0 || unsyncedDocs > 0,
    };
  }

  /**
   * Update last synced timestamp
   */
  async updateLastSynced(): Promise<void> {
    await this.syncMetadata.put({
      key: 'documents',
      lastSyncedAt: Date.now(),
      version: 1,
    });
  }
}

export const db = new OfflineDatabase();

// Initialize database
db.open().catch((err) => {
  console.error('Failed to open offline database:', err);
});
