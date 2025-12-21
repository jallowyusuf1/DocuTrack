import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  getUnreadCount,
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getNotificationMessage,
  type Notification,
} from '../../services/notifications';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { triggerHaptic } from '../../utils/animations';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<(Notification & { documents?: { id: string; document_name: string; expiration_date: string; document_type: string } })[]>([]);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch unread count
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getNotifications(user.id, 20);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen, user?.id]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification & { documents?: { id: string; document_name: string; expiration_date: string; document_type: string } }) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    setIsOpen(false);
    navigate(`/documents/${notification.document_id}`);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              triggerHaptic('light');
              setIsOpen(false);
            }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            style={{ position: 'fixed' }}
          />
          
          {/* Centered Modal - Using flex container for perfect centering */}
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl flex flex-col overflow-hidden w-full"
              style={{
                pointerEvents: 'auto',
                maxWidth: '28rem',
                maxHeight: '80vh',
                background: 'rgba(42, 38, 64, 0.95)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.4)',
              }}
            >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 relative">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-purple-400 font-medium hover:text-purple-300 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
                <motion.button
                  onClick={() => {
                    triggerHaptic('light');
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    color: '#A78BFA',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">No notifications</p>
                  <p className="text-xs text-center" style={{ color: '#A78BFA' }}>You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors ${
                        !notification.is_read ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.notification_type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold text-white mb-0.5 ${
                              !notification.is_read ? 'font-bold' : ''
                            }`}
                          >
                            {getNotificationTitle(notification.notification_type)}
                          </p>
                          <p className="text-xs mb-1 line-clamp-2" style={{ color: '#C7C3D9' }}>
                            {notification.documents
                              ? getNotificationMessage(
                                  notification.notification_type,
                                  notification.documents.document_name,
                                  notification.documents.expiration_date
                                ).body
                              : 'Document notification'}
                          </p>
                          <p className="text-xs" style={{ color: '#A78BFA' }}>
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div 
                            className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" 
                            style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)' }} 
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => {
            triggerHaptic('light');
            navigate('/notifications');
          }}
          className="relative w-10 h-10 md:w-11 md:h-11 rounded-full glass-card-subtle flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 md:w-5.5 md:h-5.5 text-white" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500"
              style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>
      </div>

      {/* Modal - Rendered via Portal to ensure proper centering */}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
