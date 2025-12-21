import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { requestNotificationPermission, checkAndSendNotifications } from '../services/notifications';

/**
 * Hook to initialize notification system
 */
export function useNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Request permission on first load
    const initNotifications = async () => {
      try {
        await requestNotificationPermission();
        // Check for due notifications
        await checkAndSendNotifications(user.id);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initNotifications();

    // Check for notifications every 5 minutes
    const interval = setInterval(() => {
      if (user?.id) {
        checkAndSendNotifications(user.id).catch(console.error);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);
}

