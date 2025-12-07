import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/offlineDB';
import type { CachedDocument } from '../db/offlineDB';
import { useOnlineStatus } from './useOnlineStatus';
import type { Document } from '../types';

interface UseOfflineDataOptions {
  cacheTime?: number; // Cache validity in milliseconds (default: 5 minutes)
  fetchOnMount?: boolean;
  refetchOnOnline?: boolean;
}

export const useOfflineData = <T = Document[]>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseOfflineDataOptions = {}
) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    fetchOnMount = true,
    refetchOnOnline = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const { isOnline } = useOnlineStatus();

  const isCacheValid = useCallback(
    (cachedAt: number) => {
      return Date.now() - cachedAt < cacheTime;
    },
    [cacheTime]
  );

  const loadFromCache = useCallback(async () => {
    try {
      if (key === 'documents') {
        const cachedDocs = await db.documents.toArray();
        if (cachedDocs.length > 0) {
          // Check if cache is still valid
          const latestDoc = cachedDocs.reduce((latest, doc) =>
            doc.cachedAt > latest.cachedAt ? doc : latest
          );

          if (isCacheValid(latestDoc.cachedAt)) {
            setData(cachedDocs as unknown as T);
            setFromCache(true);
            setLoading(false);
            return true;
          }
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to load from cache:', err);
      return false;
    }
  }, [key, isCacheValid]);

  const saveToCache = useCallback(
    async (freshData: T) => {
      try {
        if (key === 'documents' && Array.isArray(freshData)) {
          const cachedDocs: CachedDocument[] = (freshData as unknown as Document[]).map(
            (doc) => ({
              ...doc,
              cachedAt: Date.now(),
              synced: true,
            })
          );

          // Clear old documents first
          await db.documents.clear();

          // Add new cached documents
          await db.documents.bulkAdd(cachedDocs);
        }
      } catch (err) {
        console.error('Failed to save to cache:', err);
      }
    },
    [key]
  );

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        // If offline, try to load from cache
        if (!isOnline) {
          const cached = await loadFromCache();
          if (!cached) {
            throw new Error('No cached data available offline');
          }
          return;
        }

        // Fetch fresh data from server
        const freshData = await fetchFn();
        setData(freshData);
        setFromCache(false);

        // Save to cache
        await saveToCache(freshData);
      } catch (err) {
        setError(err as Error);

        // Try loading from cache on error
        const cached = await loadFromCache();
        if (!cached) {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [isOnline, fetchFn, loadFromCache, saveToCache]
  );

  // Load data on mount
  useEffect(() => {
    if (fetchOnMount) {
      // Load from cache first for instant UI
      loadFromCache().then((hasCache) => {
        // Then fetch fresh data if online
        if (isOnline) {
          fetchData(!hasCache); // Don't show loading if we have cache
        } else if (!hasCache) {
          setLoading(false);
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when coming back online
  useEffect(() => {
    if (isOnline && refetchOnOnline && !loading && data !== null) {
      fetchData(false); // Silent refetch
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fromCache,
    refetch,
    isOnline,
  };
};
