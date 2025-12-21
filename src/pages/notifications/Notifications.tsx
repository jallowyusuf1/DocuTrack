import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationMessage,
  type Notification,
} from '../../services/notifications';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { triggerHaptic } from '../../utils/animations';

type TabType = 'all' | 'unread';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notifications, setNotifications] = useState<(Notification & { documents?: { id: string; document_name: string; expiration_date: string; document_type: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id, activeTab]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getNotifications(user.id, 100);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current === 0) return;
    const currentY = e.touches[0].clientY;
    pullDistance.current = currentY - pullStartY.current;
    if (pullDistance.current > 0 && scrollContainerRef.current?.scrollTop === 0) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance.current > 80) {
      loadNotifications();
    }
    pullStartY.current = 0;
    pullDistance.current = 0;
  };

  const handleNotificationClick = async (notification: Notification & { documents?: { id: string; document_name: string; expiration_date: string; document_type: string } }) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    navigate(`/documents/${notification.document_id}`);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      triggerHaptic('medium');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      triggerHaptic('light');
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expired':
      case '1_day':
        return '🔴';
      case '7_days':
        return '🟠';
      case '30_days':
        return '🟡';
      default:
        return '🔵';
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case '30_days':
        return 'Expiring in 30 days';
      case '7_days':
        return 'Expiring in 7 days';
      case '1_day':
        return 'Expires tomorrow';
      case 'expired':
        return 'Document expired';
      default:
        return 'Notification';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMM d, yyyy');
  };

  // Filter notifications by tab
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at);
    let dateKey: string;
    
    if (isToday(date)) {
      dateKey = 'Today';
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM d, yyyy');
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
      <main className="flex-1 pb-20 pt-4 md:pt-6 px-4 md:px-6 safe-area-bottom">
        <div className="max-w-4xl mx-auto md:max-w-[700px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-glass-secondary">
              Stay updated on your document expirations
            </p>
          </motion.div>

          {/* Actions */}
          {unreadCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleMarkAllAsRead}
              className="w-full mb-6 py-3 md:py-[14px] rounded-xl font-medium text-white transition-all"
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                height: '40px',
              }}
              data-tablet-action="true"
            >
              <style>{`
                @media (min-width: 768px) {
                  [data-tablet-action="true"] {
                    height: 44px !important;
                  }
                }
              `}</style>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                <span>Mark all as read ({unreadCount})</span>
              </div>
            </motion.button>
          )}

          {/* Tabs */}
          <div className="glass-card p-1 mb-6 flex gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 h-[44px] md:h-[48px] px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-[17px] md:text-[19px] ${
                activeTab === 'all'
                  ? 'glass-btn-primary'
                  : 'text-glass-secondary hover:text-glass-primary'
              }`}
            >
              <span>All</span>
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 h-[44px] md:h-[48px] px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-[17px] md:text-[19px] ${
                activeTab === 'unread'
                  ? 'glass-btn-primary'
                  : 'text-glass-secondary hover:text-glass-primary'
              }`}
            >
              <span>Unread {unreadCount > 0 && `(${unreadCount})`}</span>
            </button>
          </div>

          {/* Notifications List */}
          <div
            ref={scrollContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="space-y-6"
          >
            {loading ? (
              <LoadingState />
            ) : Object.keys(groupedNotifications).length === 0 ? (
              <EmptyState />
            ) : (
              Object.entries(groupedNotifications).map(([dateKey, dateNotifications]) => (
                <div key={dateKey}>
                  <h2 className="text-sm md:text-base font-semibold text-white/60 mb-3 px-1">
                    {dateKey}
                  </h2>
                  <div className="space-y-3">
                    {dateNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDelete={(e) => handleDelete(notification.id, e)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Notification Card Component with Swipe Actions
function NotificationCard({
  notification,
  onClick,
  onDelete,
}: {
  notification: Notification & { documents?: { id: string; document_name: string; expiration_date: string; document_type: string } };
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expired':
      case '1_day':
        return '🔴';
      case '7_days':
        return '🟠';
      case '30_days':
        return '🟡';
      default:
        return '🔵';
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case '30_days':
        return 'Expiring in 30 days';
      case '7_days':
        return 'Expiring in 7 days';
      case '1_day':
        return 'Expires tomorrow';
      case 'expired':
        return 'Document expired';
      default:
        return 'Notification';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, 'MMM d, yyyy');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - startX.current;
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -128));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeOffset < -64) {
      setSwipeOffset(-128);
    } else {
      setSwipeOffset(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mx-auto" style={{ maxWidth: '100%' }} data-tablet-card="true">
      <style>{`
        @media (min-width: 768px) {
          [data-tablet-card="true"] {
            max-width: 700px !important;
          }
        }
      `}</style>
      {/* Swipe Actions */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center">
        <motion.button
          onClick={onDelete}
          className="h-full flex items-center justify-center px-4 md:px-8"
          style={{
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            width: '56px',
          }}
          data-tablet-swipe="true"
        >
          <Trash2 className="w-5 h-5 text-white" style={{ width: '20px', height: '20px' }} data-tablet-swipe-icon="true" />
          <style>{`
            @media (min-width: 768px) {
              [data-tablet-swipe="true"] {
                width: 64px !important;
              }
              [data-tablet-swipe-icon="true"] {
                width: 24px !important;
                height: 24px !important;
              }
            }
          `}</style>
        </motion.button>
      </div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={onClick}
        className="relative p-4 md:p-5 rounded-2xl cursor-pointer mx-auto"
        style={{
          background: notification.is_read
            ? 'rgba(55, 48, 70, 0.6)'
            : 'rgba(139, 92, 246, 0.15)',
          backdropFilter: 'blur(10px)',
          border: notification.is_read
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(139, 92, 246, 0.3)',
          height: '80px',
        }}
        data-tablet-notification="true"
      >
        <style>{`
          @media (min-width: 768px) {
            [data-tablet-notification="true"] {
              height: 100px !important;
              padding: 20px !important;
            }
          }
        `}</style>
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 md:w-[52px] md:h-[52px] rounded-full flex items-center justify-center text-2xl md:text-3xl"
            style={{
              background: notification.is_read
                ? 'rgba(139, 92, 246, 0.2)'
                : 'rgba(139, 92, 246, 0.3)',
            }}
          >
            {getNotificationIcon(notification.notification_type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={`text-base md:text-[19px] font-semibold text-white ${
                  !notification.is_read ? 'font-bold' : ''
                }`}
              >
                {getNotificationTitle(notification.notification_type)}
              </h3>
              {!notification.is_read && (
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"
                  style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)' }}
                />
              )}
            </div>
            <p className="text-sm md:text-[19px] text-white/70 mb-1 line-clamp-2">
              {notification.documents
                ? getNotificationMessage(
                    notification.notification_type,
                    notification.documents.document_name,
                    notification.documents.expiration_date
                  ).body
                : 'Document notification'}
            </p>
            <p className="text-xs md:text-sm text-purple-400">
              {formatTimeAgo(notification.created_at)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 md:p-5 rounded-2xl glass-shimmer mx-auto"
          style={{
            background: 'rgba(55, 48, 70, 0.6)',
            height: '80px',
            maxWidth: '100%',
          }}
          data-tablet-loading="true"
        >
          <style>{`
            @media (min-width: 768px) {
              [data-tablet-loading="true"] {
                height: 100px !important;
                max-width: 700px !important;
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 md:p-12 text-center rounded-2xl mx-auto"
      style={{
        background: 'rgba(55, 48, 70, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '100%',
      }}
      data-tablet-empty="true"
    >
      <style>{`
        @media (min-width: 768px) {
          [data-tablet-empty="true"] {
            max-width: 700px !important;
          }
        }
      `}</style>
      <div
        className="w-20 h-20 md:w-[100px] md:h-[100px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 md:mb-6"
        style={{
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
        }}
      >
        <Bell className="w-10 h-10 md:w-12 md:h-12 text-white" />
      </div>
      <h3 className="text-xl md:text-[24px] font-bold text-white mb-2">All Caught Up!</h3>
      <p className="text-sm md:text-base text-white/60">
        You have no notifications at this time
      </p>
    </motion.div>
  );
}

