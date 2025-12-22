import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Calendar, Users, User, LogOut, Home, Plus, Bell, Lock as LockIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { triggerHaptic } from '../../utils/animations';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getUnreadCount } from '../../services/notifications';
import NotificationsModal from '../modals/NotificationsModal';
import { prefersReducedMotion } from '../../utils/animations';
import { useOptionalIdleTimeout } from '../../contexts/IdleTimeoutContext';

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
  const reduced = prefersReducedMotion();
  const idle = useOptionalIdleTimeout();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousPathRef = useRef(location.pathname);
  const headerRef = useRef<HTMLElement | null>(null);

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

  // Expose nav height as a CSS variable so every page can offset correctly.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--app-desktop-nav-h', `${Math.ceil(h)}px`);
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const showIdleIndicator =
    !!idle?.settings?.idleTimeoutEnabled &&
    !idle.locked &&
    typeof idle.remainingSeconds === 'number' &&
    idle.remainingSeconds > 0 &&
    idle.remainingSeconds <= 5 * 60;

  const remainingLabel = (() => {
    if (!showIdleIndicator || typeof idle?.remainingSeconds !== 'number') return '';
    const s = idle.remainingSeconds;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m <= 0) return `${sec}s`;
    return `${m}m`;
  })();

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
      <div className="pt-0">
        <div className="mx-auto max-w-7xl px-4 xl:px-8">
          <div
            className="flex items-center justify-between gap-3 px-4 md:px-5 py-4 rounded-[999px]"
            style={{
              background:
                'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.05) 100%), linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(139,92,246,0.10) 55%, rgba(59,130,246,0.10) 100%)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(34px) saturate(180%)',
              WebkitBackdropFilter: 'blur(34px) saturate(180%)',
              boxShadow:
                '0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
          >
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 pr-2 flex-shrink-0" style={{ minWidth: 'fit-content' }}>
          <div
            className="w-12 h-12 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.95), rgba(59,130,246,0.85))',
              boxShadow: '0 18px 55px rgba(139,92,246,0.35)',
              border: '1px solid rgba(255,255,255,0.20)',
            }}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-white font-semibold tracking-tight text-base md:text-lg whitespace-nowrap">DocuTrackr</span>
            <span className="text-white/60 text-xs md:text-sm whitespace-nowrap">Your documents, calm & secure</span>
          </div>
        </div>

        {/* Navigation Items - Centered (segmented glass) */}
        <nav className="hidden md:flex items-center flex-1 justify-center">
          <div
            className="relative inline-flex items-center gap-1 rounded-[999px] p-1.5"
            style={{
              background: 'rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => {
                    triggerHaptic('light');
                    navigate(item.path);
                  }}
                  className="relative px-5 py-2.5 rounded-[999px] text-base transition-colors flex items-center gap-2"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
                  }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                >
                  {active && (
                    <motion.div
                      layoutId="app-nav-pill"
                      className="absolute inset-0 rounded-[999px]"
                      style={{
                        background:
                          'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0.06) 100%), linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 100%)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(22px)',
                        WebkitBackdropFilter: 'blur(22px)',
                        boxShadow:
                          '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
                        pointerEvents: 'none',
                      }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }
                      }
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
          {showIdleIndicator ? (
            <motion.button
              whileHover={reduced ? undefined : { scale: 1.02, y: -1 }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
              onClick={() => {
                triggerHaptic('medium');
                idle?.lockNow?.();
              }}
              className="hidden md:flex items-center gap-2 px-4 h-12 rounded-full text-white/90 font-medium text-sm"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(26px)',
                WebkitBackdropFilter: 'blur(26px)',
                boxShadow: '0 20px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
              title="Lock now (Ctrl/Cmd+L)"
            >
              <LockIcon className="w-4 h-4" />
              <span className="tabular-nums">Auto-lock {remainingLabel}</span>
            </motion.button>
          ) : null}

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('light');
              setShowNotifications(true);
            }}
            className="relative flex items-center justify-center w-12 h-12 rounded-full text-white/85 hover:text-white transition-colors cursor-pointer"
            style={{
              pointerEvents: 'auto',
              background:
                'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(26px)',
              WebkitBackdropFilter: 'blur(26px)',
              boxShadow: '0 20px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Bell className="w-5 h-5" />
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
            className="flex items-center gap-2 px-6 h-12 rounded-full text-white font-medium text-base cursor-pointer whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 18px 55px rgba(139,92,246,0.35)',
              pointerEvents: 'auto',
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Add</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 h-12 rounded-full text-red-200 hover:text-red-100 transition-colors text-base font-medium cursor-pointer whitespace-nowrap"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
        </div>
          </div>
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
