import { useEffect, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useAuth } from './useAuth';
import { syncService } from '../services/syncService';
import { useSyncStatus } from './useSyncStatus';

/**
 * Auto-sync hook that:
 * 1. Syncs on app start (if online)
 * 2. Syncs when coming back online
 * 3. Syncs periodically while online (every 5 minutes)
 */
export const useAutoSync = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { user } = useAuth();
  const { refresh } = useSyncStatus();
  const hasInitialSynced = useRef(false);
  const syncTimerRef = useRef<number>();

  // Sync on app start
  useEffect(() => {
    if (user?.id && isOnline && !hasInitialSynced.current) {
      hasInitialSynced.current = true;

      // Small delay to let the app initialize
      const timer = setTimeout(() => {
        syncService
          .syncAll(user.id)
          .then(() => {
            refresh();
            console.log('Initial sync completed');
          })
          .catch((error) => {
            console.error('Initial sync failed:', error);
          });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, isOnline, refresh]);

  // Sync when coming back online
  useEffect(() => {
    if (user?.id && wasOffline && isOnline) {
      console.log('Connection restored, syncing...');

      syncService
        .syncAll(user.id)
        .then(() => {
          refresh();
          console.log('Reconnection sync completed');
        })
        .catch((error) => {
          console.error('Reconnection sync failed:', error);
        });
    }
  }, [user, wasOffline, isOnline, refresh]);

  // Periodic sync while online (every 5 minutes)
  useEffect(() => {
    if (user?.id && isOnline) {
      // Clear any existing timer
      if (syncTimerRef.current) {
        window.clearInterval(syncTimerRef.current);
      }

      // Set up periodic sync
      syncTimerRef.current = window.setInterval(
        () => {
          console.log('Periodic sync...');
          syncService
            .syncAll(user.id)
            .then(() => {
              refresh();
            })
            .catch((error) => {
              console.error('Periodic sync failed:', error);
            });
        },
        5 * 60 * 1000
      ); // 5 minutes

      return () => {
        if (syncTimerRef.current) {
          window.clearInterval(syncTimerRef.current);
        }
      };
    }
  }, [user, isOnline, refresh]);
};
