import { supabase } from '../config/supabase';
import type { Document } from '../types';

export type NotificationType = '30_days' | '7_days' | '1_day' | 'expired';

export interface Notification {
  id: string;
  user_id: string;
  document_id: string;
  notification_type: NotificationType;
  scheduled_for: string;
  sent_at: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  notify_30_days: boolean;
  notify_14_days: boolean;
  notify_7_days: boolean;
  notify_1_day: boolean;
  notify_expired: boolean;
  quiet_hours_start?: string; // e.g., "22:00"
  quiet_hours_end?: string; // e.g., "08:00"
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send push notification
 */
export function sendPushNotification(
  title: string,
  body: string,
  data?: { documentId?: string; urgent?: boolean }
): void {
  if (Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/app-icon.png',
    badge: '/badge-icon.png',
    data,
    tag: data?.documentId, // Replace existing notification for same document
    requireInteraction: data?.urgent || false, // Stay visible if urgent
  });

  notification.onclick = () => {
    window.focus();
    if (data?.documentId) {
      // Navigate to document detail
      window.location.href = `/documents/${data.documentId}`;
    }
    notification.close();
  };

  // Auto-close after 5 seconds if not urgent
  if (!data?.urgent) {
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}

/**
 * Get notification message for type
 */
export function getNotificationMessage(
  type: NotificationType,
  documentName: string,
  expirationDate: string
): { title: string; body: string; urgent: boolean } {
  const date = new Date(expirationDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  switch (type) {
    case '30_days':
      return {
        title: 'Document Expiring Soon',
        body: `${documentName} expires in 30 days on ${date}`,
        urgent: false,
      };
    case '7_days':
      return {
        title: '⚠️ Urgent: Document Expires Soon',
        body: `${documentName} expires in 7 days! Renew now.`,
        urgent: true,
      };
    case '1_day':
      return {
        title: '🚨 URGENT: Expires Tomorrow!',
        body: `${documentName} expires tomorrow! Take action now.`,
        urgent: true,
      };
    case 'expired':
      return {
        title: '❌ Document Expired',
        body: `${documentName} expired on ${date}. Renew immediately.`,
        urgent: true,
      };
    default:
      return {
        title: 'Document Notification',
        body: `${documentName} notification`,
        urgent: false,
      };
  }
}

/**
 * Create notifications for a document
 */
export async function createNotifications(
  documentId: string,
  userId: string,
  expirationDate: string
): Promise<void> {
  const expiration = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get user preferences
  const preferences = await getNotificationPreferences(userId);

  const notifications: Omit<Notification, 'id' | 'created_at' | 'sent_at'>[] = [];

  // 30 days before
  if (preferences.notify_30_days) {
    const thirtyDays = new Date(expiration);
    thirtyDays.setDate(thirtyDays.getDate() - 30);
    thirtyDays.setHours(9, 0, 0, 0); // 9 AM
    if (thirtyDays > today) {
      notifications.push({
        user_id: userId,
        document_id: documentId,
        notification_type: '30_days',
        scheduled_for: thirtyDays.toISOString(),
        is_read: false,
      });
    }
  }

  // 14 days before (if enabled)
  if (preferences.notify_14_days) {
    const fourteenDays = new Date(expiration);
    fourteenDays.setDate(fourteenDays.getDate() - 14);
    fourteenDays.setHours(9, 0, 0, 0);
    if (fourteenDays > today) {
      notifications.push({
        user_id: userId,
        document_id: documentId,
        notification_type: '7_days', // Reuse type, adjust message
        scheduled_for: fourteenDays.toISOString(),
        is_read: false,
      });
    }
  }

  // 7 days before
  if (preferences.notify_7_days) {
    const sevenDays = new Date(expiration);
    sevenDays.setDate(sevenDays.getDate() - 7);
    sevenDays.setHours(9, 0, 0, 0);
    if (sevenDays > today) {
      notifications.push({
        user_id: userId,
        document_id: documentId,
        notification_type: '7_days',
        scheduled_for: sevenDays.toISOString(),
        is_read: false,
      });
    }
  }

  // 1 day before
  if (preferences.notify_1_day) {
    const oneDay = new Date(expiration);
    oneDay.setDate(oneDay.getDate() - 1);
    oneDay.setHours(9, 0, 0, 0);
    if (oneDay > today) {
      notifications.push({
        user_id: userId,
        document_id: documentId,
        notification_type: '1_day',
        scheduled_for: oneDay.toISOString(),
        is_read: false,
      });
    }
  }

  // On expiration day
  if (preferences.notify_expired) {
    const expiredDate = new Date(expiration);
    expiredDate.setHours(9, 0, 0, 0);
    notifications.push({
      user_id: userId,
      document_id: documentId,
      notification_type: 'expired',
      scheduled_for: expiredDate.toISOString(),
      is_read: false,
    });
  }

  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) {
      console.error('Failed to create notifications:', error);
      throw new Error(`Failed to create notifications: ${error.message}`);
    }
  }
}

/**
 * Cancel notifications for a document
 */
export async function cancelNotifications(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('document_id', documentId)
    .is('sent_at', null); // Only delete unsent notifications

  if (error) {
    console.error('Failed to cancel notifications:', error);
    throw new Error(`Failed to cancel notifications: ${error.message}`);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to mark notification as read:', error);
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to mark all as read:', error);
    throw new Error(`Failed to mark all as read: ${error.message}`);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get notifications for user with document info
 */
export async function getNotifications(
  userId: string,
  limit: number = 20
): Promise<(Notification & { documents?: { id: string; document_name: string; expiration_date: string; document_type: string } })[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      documents:document_id (
        id,
        document_name,
        expiration_date,
        document_type
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get notifications:', error);
    throw new Error(`Failed to get notifications: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    ...item,
    documents: Array.isArray(item.documents) ? item.documents[0] : item.documents,
  }));
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('notification_preferences')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Return defaults
    return {
      push_enabled: true,
      email_enabled: false,
      notify_30_days: true,
      notify_14_days: false,
      notify_7_days: true,
      notify_1_day: true,
      notify_expired: true,
    };
  }

  return (data.notification_preferences as NotificationPreferences) || {
    push_enabled: true,
    email_enabled: false,
    notify_30_days: true,
    notify_14_days: false,
    notify_7_days: true,
    notify_1_day: true,
    notify_expired: true,
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const current = await getNotificationPreferences(userId);
  const updated = { ...current, ...preferences };

  const { error } = await supabase
    .from('user_profiles')
    .update({ notification_preferences: updated })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update notification preferences:', error);
    throw new Error(`Failed to update preferences: ${error.message}`);
  }
}

/**
 * Check and send due notifications
 */
export async function checkAndSendNotifications(userId: string): Promise<void> {
  const now = new Date();
  const preferences = await getNotificationPreferences(userId);

  if (!preferences.push_enabled) {
    return;
  }

  // Check if in quiet hours
  if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
    const currentHour = now.getHours();
    const startHour = parseInt(preferences.quiet_hours_start.split(':')[0]);
    const endHour = parseInt(preferences.quiet_hours_end.split(':')[0]);

    if (
      (currentHour >= startHour && currentHour < 24) ||
      (currentHour >= 0 && currentHour < endHour)
    ) {
      return; // In quiet hours
    }
  }

  // Get due notifications
  const { data, error } = await supabase
    .from('notifications')
    .select('*, documents(document_name, expiration_date)')
    .eq('user_id', userId)
    .eq('is_read', false)
    .is('sent_at', null)
    .lte('scheduled_for', now.toISOString())
    .limit(10);

  if (error || !data) {
    return;
  }

  // Send notifications
  for (const notification of data) {
    const document = notification.documents as Document;
    if (!document) continue;

    const message = getNotificationMessage(
      notification.notification_type,
      document.document_name,
      document.expiration_date
    );

    // Send push notification
    sendPushNotification(message.title, message.body, {
      documentId: notification.document_id,
      urgent: message.urgent,
    });

    // Mark as sent
    await supabase
      .from('notifications')
      .update({ sent_at: now.toISOString() })
      .eq('id', notification.id);
  }
}

