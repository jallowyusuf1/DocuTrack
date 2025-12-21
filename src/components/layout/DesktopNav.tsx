import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Calendar, Users, User, LogOut, Home, Plus, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { triggerHaptic } from '../../utils/animations';
import { useState, useEffect, useRef } from 'react';
import { getUnreadCount } from '../../services/notifications';
import NotificationsModal from '../modals/NotificationsModal';

const navItems = [
  { path: '/dashboard', label: 'Expiring Soon', icon: Home },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/dates', label: 'Dates', icon: Calendar },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function DesktopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousPathRef = useRef(location.pathname);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Track previous path for context-aware back button
  useEffect(() => {
    if (location.pathname !== '/notifications' && !showNotifications) {
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname, showNotifications]);

  // Fetch unread count and poll every 30 seconds
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?.id) {
        try {
          const count = await getUnreadCount(user.id);
          setUnreadCount(count);
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout = async () => {
    triggerHaptic('medium');
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 z-50 pointer-events-auto"
      style={{
        background: 'rgba(26, 22, 37, 0.7)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
      }}
    >
      <div className="h-full px-4 xl:px-8 flex items-center justify-between" style={{ gap: '16px' }}>
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0" style={{ minWidth: 'fit-content' }}>
          <div
            className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            }}
          >
            <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
          </div>
          <h1 className="text-sm sm:text-base xl:text-xl font-bold text-white whitespace-nowrap">DocuTrack</h1>
        </div>

        {/* Navigation Items - Centered */}
        <nav className="flex items-center flex-1 justify-center max-w-3xl mx-auto" style={{ gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate(item.path);
                }}
                className={`flex items-center gap-1.5 xl:gap-2 px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg xl:rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  active ? 'text-white' : 'text-white/60 hover:text-white/80'
                }`}
                style={{
                  background: active ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  pointerEvents: 'auto',
                }}
              >
                <Icon className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" />
                <span className="font-medium text-xs xl:text-sm">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('light');
              setShowNotifications(true);
            }}
            className="relative flex items-center justify-center w-9 h-9 xl:w-10 xl:h-10 rounded-lg xl:rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            style={{
              pointerEvents: 'auto',
            }}
          >
            <Bell className="w-5 h-5 xl:w-6 xl:h-6" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
                  padding: '0 4px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('medium');
              navigate('/add-document');
            }}
            className="flex items-center gap-1.5 xl:gap-2 px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg xl:rounded-xl text-white font-medium text-xs xl:text-sm cursor-pointer whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
              pointerEvents: 'auto',
            }}
          >
            <Plus className="w-4 h-4 xl:w-5 xl:h-5" />
            <span>Add</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 xl:py-2.5 rounded-lg xl:rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-xs xl:text-sm font-medium cursor-pointer whitespace-nowrap"
            style={{
              pointerEvents: 'auto',
            }}
          >
            <LogOut className="w-4 h-4 xl:w-5 xl:h-5" />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        previousPath={previousPathRef.current}
      />
    </header>
  );
}
