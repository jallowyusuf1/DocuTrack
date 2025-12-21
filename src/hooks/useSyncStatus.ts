import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/offlineDB';

export interface SyncStatus {
  syncing: boolean;
  lastSynced: number | null;
  pendingCount: number;
  hasPendingChanges: boolean;
  error: string | null;
}

let globalSyncStatus: SyncStatus = {
  syncing: false,
  lastSynced: null,
  pendingCount: 0,
  hasPendingChanges: false,
  error: null,
};

const listeners = new Set<(status: SyncStatus) => void>();

export const updateSyncStatus = (updates: Partial<SyncStatus>) => {
  globalSyncStatus = { ...globalSyncStatus, ...updates };
  listeners.forEach((listener) => listener(globalSyncStatus));
};

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(globalSyncStatus);

  useEffect(() => {
    // Add listener
    listeners.add(setSyncStatus);

    // Load initial status from database
    loadSyncStatus();

    return () => {
      // Remove listener
      listeners.delete(setSyncStatus);
    };
  }, []);

  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await db.getSyncStatus();
      updateSyncStatus({
        pendingCount: status.pendingCount,
        lastSynced: status.lastSynced,
        hasPendingChanges: status.hasPendingChanges,
      });
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }, []);

  const refresh = useCallback(() => {
    loadSyncStatus();
  }, [loadSyncStatus]);

  return { ...syncStatus, refresh };
};
