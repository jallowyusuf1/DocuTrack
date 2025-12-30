import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Archive,
  Trash2,
  AlertCircle,
  Clock,
  Users,
  Info,
  X,
  Filter,
  Search,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationMessage,
  type Notification,
} from '../../services/notifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isToday, isThisWeek } from 'date-fns';
import { usePageLock } from '../../hooks/usePageLock';
import EnhancedPageLockModal from '../../components/lock/EnhancedPageLockModal';

type NotificationGroup = 'all' | 'unread' | 'expiry' | 'renewal' | 'family' | 'system' | 'archived';
type DateFilter = 'today' | 'this_week' | 'all';
type TypeFilter = 'all' | 'urgent' | 'info' | 'success';
type ViewVariant = 'page' | 'modal' | 'legacy';

interface NotificationWithDocument extends Notification {
  documents?: {
    id: string;
    document_name: string;
    expiration_date: string;
    document_type: string;
    image_url?: string;
  };
}

const GROUP_CONFIG: Record<NotificationGroup, { label: string; icon: typeof Bell }> = {
  all: { label: 'All Notifications', icon: Bell },
  unread: { label: 'Unread', icon: Bell },
  expiry: { label: 'Expiry Warnings', icon: AlertCircle },
  renewal: { label: 'Renewal Reminders', icon: Clock },
  family: { label: 'Family Shares', icon: Users },
  system: { label: 'System Updates', icon: Info },
  archived: { label: 'Archived', icon: Archive },
};

interface DesktopNotificationsProps {
  onNotificationClick?: () => void;
  variant?: ViewVariant;
}

export default function DesktopNotifications({ onNotificationClick, variant = 'page' }: DesktopNotificationsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Page lock
  const { isLocked: isPageLocked, lockType: pageLockType, handleUnlock: handlePageUnlock } = usePageLock('notifications');

  const [notifications, setNotifications] = useState<NotificationWithDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<NotificationGroup>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

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

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    // Group filter
    if (selectedGroup === 'unread' && notif.is_read) return false;
    if (selectedGroup === 'expiry' && !['30_days', '7_days', '1_day', 'expired'].includes(notif.notification_type)) return false;
    if (selectedGroup === 'renewal' && notif.notification_type !== '30_days') return false;
    if (selectedGroup === 'family') return false; // TODO: Implement family shares
    if (selectedGroup === 'system') return false; // TODO: Implement system updates
    if (selectedGroup === 'archived') return false; // TODO: Implement archived

    // Date filter
    if (dateFilter === 'today' && !isToday(new Date(notif.created_at))) return false;
    if (dateFilter === 'this_week' && !isThisWeek(new Date(notif.created_at))) return false;

    // Type filter
    if (typeFilter === 'urgent' && !['1_day', 'expired', '7_days'].includes(notif.notification_type)) return false;
    if (typeFilter === 'info' && !['30_days'].includes(notif.notification_type)) return false;
    if (typeFilter === 'success') return false; // TODO: Implement success notifications

    return true;
  });

  const searchedNotifications = filteredNotifications.filter((notif) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const message = notif.documents
      ? getNotificationMessage(
          notif.notification_type,
          notif.documents.document_name,
          notif.documents.expiration_date
        )
      : { title: 'Notification', body: 'Document notification', urgent: false };

    const haystack = [
      message.title,
      message.body,
      notif.documents?.document_name ?? '',
      notif.documents?.document_type ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  // Keyboard UX for search (⌘/Ctrl+K focuses, Esc clears)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && isK) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          if (searchQuery.trim()) {
            setSearchQuery('');
          } else {
            searchInputRef.current?.blur();
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchQuery]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const groupCounts = {
    all: notifications.length,
    unread: unreadCount,
    expiry: notifications.filter(n => ['30_days', '7_days', '1_day', 'expired'].includes(n.notification_type)).length,
    renewal: notifications.filter(n => n.notification_type === '30_days').length,
    family: 0,
    system: 0,
    archived: 0,
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleBulkMarkRead = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => markNotificationAsRead(id)));
      setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, is_read: true } : n));
      setSelectedIds(new Set());
      setIsSelecting(false);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} notification${selectedIds.size === 1 ? '' : 's'}?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteNotification(id)));
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      setIsSelecting(false);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const Minimal = () => (
    <>
      {/* Page Lock Modal */}
      <EnhancedPageLockModal
        isOpen={isPageLocked}
        pageName="Notifications"
        lockType={pageLockType}
        onUnlock={handlePageUnlock}
      />

      <div className="h-full flex flex-col">
      {/* Search */}
      <div className="px-5 pt-4 pb-3">
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          animate={{
            boxShadow: isSearchFocused
              ? '0 18px 55px rgba(37, 99, 235, 0.22), 0 0 0 1px rgba(37, 99, 235, 0.35)'
              : '0 12px 40px rgba(0, 0, 0, 0.35)',
          }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Neon sweep */}
          <div
            className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(37, 99, 235, 0.0), rgba(37, 99, 235, 0.55), rgba(34, 211, 238, 0.30), rgba(37, 99, 235, 0.0))',
              opacity: isSearchFocused ? 1 : 0.55,
            }}
          />

          {/* Tiled glass overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
              opacity: 0.13,
              mixBlendMode: 'overlay',
            }}
          />

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#60A5FA' }} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search notifications…"
            className="w-full h-[48px] pl-12 pr-28 rounded-2xl text-white placeholder:text-white/45 focus:outline-none"
            style={{
              background: 'transparent',
            }}
          />

          {/* Right controls (results + clear) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div
              className="h-8 px-2.5 rounded-full flex items-center"
              style={{
                background: 'rgba(0,0,0,0.18)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
              aria-label="Results count"
              title="Results"
            >
              <span className="text-xs font-semibold text-white/80">
                {loading ? '…' : searchedNotifications.length}
              </span>
            </div>

            {searchQuery.trim() ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.85)',
                }}
                aria-label="Clear search"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div
                className="hidden sm:flex h-9 px-3 rounded-full items-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
                aria-label="Keyboard shortcut"
                title="Shortcut"
              >
                <span className="text-[11px] font-semibold text-white/60">⌘K</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[76px] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : searchedNotifications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center px-2">
            <div
              className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 18px 50px rgba(0,0,0,0.45), 0 0 60px rgba(139,92,246,0.22)',
              }}
            >
              <Bell className="w-8 h-8 text-blue-300" />
            </div>
            <div
              className="text-white text-xl font-bold mb-1"
              style={{ textShadow: '0 0 24px rgba(139,92,246,0.28)' }}
            >
              {searchQuery.trim() ? 'No matches found' : 'You’re all caught up'}
            </div>
            <div className="text-white/65 text-sm max-w-sm mx-auto">
              {searchQuery.trim()
                ? 'Try searching by document name, type, or “expires”.'
                : 'When you add documents, we’ll surface renewal reminders and urgency alerts here—right on time.'}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              {!searchQuery.trim() ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/add-document')}
                    className="px-6"
                  >
                    Add a document
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/documents')}
                    className="px-6"
                  >
                    View documents
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setSearchQuery('')} className="px-6">
                  Clear search
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {searchedNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={() => handleMarkRead(notification.id)}
                onDelete={() => handleDelete(notification.id)}
                onClick={() => {
                  if (notification.documents?.id) {
                    handleMarkRead(notification.id);
                    navigate(`/documents/${notification.documents.id}`);
                    onNotificationClick?.();
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );

  if (variant === 'modal') {
    return <Minimal />;
  }

  if (variant === 'page') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }} />
        <main className="px-4 md:px-6 py-6">
          <div
            className="mx-auto w-full max-w-2xl rounded-[28px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.045)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(34px)',
              WebkitBackdropFilter: 'blur(34px)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.65), 0 0 100px rgba(139,92,246,0.22)',
            }}
          >
            <div className="px-5 py-4 border-b border-white/10">
              <div className="text-white text-2xl font-bold">Notifications</div>
              <div className="text-xs mt-1" style={{ color: '#60A5FA' }}>
                Everything important, nothing extra.
              </div>
            </div>
            <div style={{ height: '70vh' }}>
              <Minimal />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // legacy full dashboard layout (sidebar + filters + grid)
  if (variant === 'legacy') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background - only show if not in modal */}
        {!onNotificationClick && (
          <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
            <motion.div
              className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-[120px]"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1E40AF)' }}
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-[120px]"
              style={{ background: 'linear-gradient(135deg, #EC4899, #2563EB)' }}
              animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        )}
        <main className={`px-8 pb-8 max-w-[1920px] mx-auto ${onNotificationClick ? 'pt-4' : 'pt-4'}`}>
          <div className="grid grid-cols-[320px_1fr] gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-2xl p-5" style={{
                background: 'rgba(42, 38, 64, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Mark All Read
                    </button>
                  )}
                </div>
              </div>
              {/* Groups */}
              <div className="rounded-2xl p-4 space-y-1" style={{
                background: 'rgba(42, 38, 64, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                {(['all', 'unread'] as NotificationGroup[]).map((group) => {
                  const config = GROUP_CONFIG[group];
                  const Icon = config.icon;
                  const count = groupCounts[group];
                  const isActive = selectedGroup === group;
                  return (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                        isActive ? 'bg-blue-600/20 text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      {count > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-blue-600/30 text-blue-200' : 'bg-white/10 text-white/60'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="h-px bg-white/10 my-2" />
                {(['expiry', 'renewal', 'family', 'system'] as NotificationGroup[]).map((group) => {
                  const config = GROUP_CONFIG[group];
                  const Icon = config.icon;
                  const count = groupCounts[group];
                  const isActive = selectedGroup === group;
                  return (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                        isActive ? 'bg-blue-600/20 text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      {count > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-blue-600/30 text-blue-200' : 'bg-white/10 text-white/60'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="h-px bg-white/10 my-2" />
                {(['archived'] as NotificationGroup[]).map((group) => {
                  const config = GROUP_CONFIG[group];
                  const Icon = config.icon;
                  const isActive = selectedGroup === group;
                  return (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                        isActive ? 'bg-blue-600/20 text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="rounded-2xl p-4 space-y-4" style={{
                background: 'rgba(42, 38, 64, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  Filters
                </h3>

                {/* Date Filter */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">Date</label>
                  <div className="space-y-1.5">
                    {(['today', 'this_week', 'all'] as DateFilter[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          dateFilter === filter
                            ? 'bg-blue-600/20 text-white'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                      >
                        {filter === 'today' ? 'Today' : filter === 'this_week' ? 'This Week' : 'All'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">Type</label>
                  <div className="space-y-1.5">
                    {(['all', 'urgent', 'info', 'success'] as TypeFilter[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTypeFilter(filter)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          typeFilter === filter
                            ? 'bg-blue-600/20 text-white'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter === 'urgent' ? 'Urgent' : filter === 'info' ? 'Info' : 'Success'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Panel */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-[32px] font-bold text-white">{GROUP_CONFIG[selectedGroup].label}</h1>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm text-white/70">Select All</span>
                  </label>
                  {selectedIds.size > 0 && (
                    <>
                      <button
                        onClick={handleBulkMarkRead}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                        style={{
                          background: 'rgba(37, 99, 235, 0.2)',
                          border: '1px solid rgba(37, 99, 235, 0.4)',
                        }}
                      >
                        Mark Read
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 transition-colors"
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Notification Grid */}
              {loading ? (
                <div className="grid grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No notifications</h3>
                  <p className="text-white/60">You're all caught up!</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      isSelected={selectedIds.has(notification.id)}
                      onSelect={() => toggleSelect(notification.id)}
                      onMarkRead={() => handleMarkRead(notification.id)}
                      onDelete={() => handleDelete(notification.id)}
                      onClick={() => {
                        if (notification.documents?.id) {
                          handleMarkRead(notification.id);
                          navigate(`/documents/${notification.documents.id}`);
                          onNotificationClick?.();
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-4"
                style={{
                  background: 'rgba(42, 38, 64, 0.95)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <span className="text-white font-medium">{selectedIds.size} selected</span>
                <div className="h-6 w-px bg-white/20" />
                <button
                  onClick={handleBulkMarkRead}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{
                    background: 'rgba(37, 99, 235, 0.3)',
                    border: '1px solid rgba(37, 99, 235, 0.5)',
                  }}
                >
                  Mark Read
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 transition-colors"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSelectedIds(new Set());
                    setIsSelecting(false);
                  }}
                  className="ml-2 p-2 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return <Minimal />;
}

function NotificationCard({
  notification,
  isSelected,
  onSelect,
  onMarkRead,
  onDelete,
  onClick,
}: {
  notification: NotificationWithDocument;
  isSelected: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const message = notification.documents
    ? getNotificationMessage(
        notification.notification_type,
        notification.documents.document_name,
        notification.documents.expiration_date
      )
    : { title: 'Notification', body: 'Document notification', urgent: false };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative rounded-2xl p-5 cursor-pointer transition-all w-full"
      style={{
        height: '160px',
        background: notification.is_read
          ? 'rgba(42, 38, 64, 0.3)'
          : 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: isSelected
          ? '2px solid rgba(37, 99, 235, 0.6)'
          : notification.is_read
          ? '1px solid rgba(255, 255, 255, 0.05)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: notification.is_read
          ? '0 2px 8px rgba(0, 0, 0, 0.2)'
          : '0 4px 16px rgba(0, 0, 0, 0.3)',
        opacity: notification.is_read ? 0.7 : 1,
      }}
    >
      {/* Unread Indicator */}
      {!notification.is_read && (
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-blue-500" />
      )}

      {/* Selection Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: isSelected ? 'rgba(37, 99, 235, 0.8)' : 'rgba(255, 255, 255, 0.2)',
          background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
        }}
      >
        {isSelected && <Check className="w-3 h-3 text-blue-400" />}
      </button>

      <div className="flex items-start gap-4 h-full">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${getNotificationIconColor(notification.notification_type)}`}
        >
          {getNotificationIcon(notification.notification_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className={`text-[19px] font-bold text-white mb-1 ${notification.is_read ? '' : 'font-bold'}`}>
              {message.title}
            </h3>
            <p className="text-[17px] text-white/70 line-clamp-2 mb-2">
              {message.body}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[15px] text-white/50">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
            {notification.documents?.image_url && (
              <img
                src={notification.documents.image_url}
                alt={notification.documents.document_name}
                className="w-8 h-8 rounded object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions (on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-3 right-3 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead();
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title={notification.is_read ? 'Mark unread' : 'Mark read'}
            >
              <Check className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
  onClick,
}: {
  notification: NotificationWithDocument;
  onMarkRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const message = notification.documents
    ? getNotificationMessage(
        notification.notification_type,
        notification.documents.document_name,
        notification.documents.expiration_date
      )
    : { title: 'Notification', body: 'Document notification', urgent: false };

  const tone = message.urgent
    ? { ring: 'rgba(239, 68, 68, 0.45)', bg: 'rgba(239, 68, 68, 0.10)' }
    : { ring: 'rgba(37, 99, 235, 0.35)', bg: 'rgba(37, 99, 235, 0.08)' };

  return (
    <motion.button
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: notification.is_read ? '0 8px 28px rgba(0, 0, 0, 0.25)' : '0 10px 34px rgba(0, 0, 0, 0.32)',
        opacity: notification.is_read ? 0.78 : 1,
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: tone.bg,
          border: `1px solid ${tone.ring}`,
        }}
      >
        <AlertCircle className="w-6 h-6 text-white/80" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!notification.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
          <div className="text-white font-semibold truncate">{message.title}</div>
        </div>
        <div className="text-sm text-white/65 truncate mt-0.5">{message.body}</div>
        <div className="text-xs text-white/45 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {!notification.is_read && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(37, 99, 235, 0.18)',
              border: '1px solid rgba(37, 99, 235, 0.28)',
            }}
            aria-label="Mark read"
          >
            <Check className="w-4 h-4 text-blue-200" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.22)',
          }}
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-200" />
        </button>
      </div>
    </motion.button>
  );
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'expired':
    case '1_day':
    case '7_days':
      return <AlertCircle className="w-7 h-7" />;
    case '30_days':
      return <Clock className="w-7 h-7" />;
    case 'family_share':
    case 'invitation_received':
    case 'invitation_accepted':
      return <Users className="w-7 h-7" />;
    default:
      return <Info className="w-7 h-7" />;
  }
}

function getNotificationIconColor(type: string): string {
  switch (type) {
    case 'expired':
      return 'bg-gray-500/20 border-gray-500 text-gray-300';
    case '1_day':
      return 'bg-red-500/20 border-red-500 text-red-300';
    case '7_days':
      return 'bg-orange-500/20 border-orange-500 text-orange-300';
    case '30_days':
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
    case 'family_share':
    case 'invitation_received':
    case 'invitation_accepted':
      return 'bg-blue-500/20 border-blue-500 text-blue-300';
    default:
      return 'bg-blue-600/20 border-blue-600 text-blue-300';
  }
}
