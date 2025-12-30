import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Calendar, Users, User, Plus, Lock as LockIcon, Clock, MessageSquare, LogOut, Folder, FolderOpen, LayoutDashboard, CalendarDays, DoorOpen, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { triggerHaptic } from '../../utils/animations';
import BrandLogo from '../ui/BrandLogo';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../utils/animations';
import { useOptionalIdleTimeout } from '../../contexts/IdleTimeoutContext';
import { usePendingRequestCount } from '../../hooks/usePendingRequestCount';
import { childAccountsService } from '../../services/childAccounts';

// Animated icon components
function AnimatedDashboardIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative w-5 h-5">
      <motion.div
        animate={{
          scale: isActive ? 1 : 0.9,
          opacity: isActive ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      >
        <BarChart3 className="w-5 h-5" />
      </motion.div>
    </div>
  );
}

function AnimatedDocumentsIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative w-5 h-5">
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="open"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <FolderOpen className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="closed"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Folder className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnimatedDatesIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative w-5 h-5">
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="open"
            initial={{ rotateY: -90, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: 90, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <CalendarDays className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="closed"
            initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Calendar className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnimatedProfileIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative w-5 h-5">
      <motion.div
        animate={{
          rotateY: isActive ? 0 : -15,
          scale: isActive ? 1.1 : 1,
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <User className="w-5 h-5" />
      </motion.div>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1.5 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
          style={{
            border: '2px solid currentColor',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
}

const baseNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3, animatedIcon: AnimatedDashboardIcon },
  { path: '/documents', label: 'Documents', icon: Folder, animatedIcon: AnimatedDocumentsIcon },
  { path: '/dates', label: 'Dates', icon: Calendar, animatedIcon: AnimatedDatesIcon },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/profile', label: 'Profile', icon: User, animatedIcon: AnimatedProfileIcon },
];

export default function DesktopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const reduced = prefersReducedMotion();
  const idle = useOptionalIdleTimeout();
  const headerRef = useRef<HTMLElement | null>(null);
  const [isParent, setIsParent] = useState(false);
  const { count: pendingRequestCount } = usePendingRequestCount(isParent ? user?.id : undefined);

  // Check if user is a parent
  useEffect(() => {
    if (!user?.id) {
      setIsParent(false);
      return;
    }

    childAccountsService.listMyChildren()
      .then(children => setIsParent(children.length > 0))
      .catch(() => setIsParent(false));
  }, [user?.id]);

  // Build nav items dynamically
  const navItems = isParent
    ? [
        ...baseNavItems.slice(0, 3),
        { path: '/requests', label: 'Requests', icon: MessageSquare, badge: pendingRequestCount } as const,
        ...baseNavItems.slice(3),
      ]
    : baseNavItems;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // (Removed notification + logout actions from nav)

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
    <header ref={headerRef} className="fixed top-4 left-0 right-0 z-50 pointer-events-auto">
      {/* Solid-ish glass scrim so nothing reads "behind" the nav (ex: Settings danger zone) */}
      <div
        className="fixed inset-x-0 top-0 h-[120px] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.00) 100%)',
          backdropFilter: 'blur(40px) saturate(120%)',
          WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        }}
      />
      <div className="pt-0 relative">
        <div className="mx-auto max-w-7xl px-4 xl:px-8">
          <div
            className="flex items-center justify-between gap-4 px-6 md:px-8 py-5 rounded-[999px]"
            style={{
              background: 'rgba(26, 26, 26, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(40px) saturate(120%)',
              WebkitBackdropFilter: 'blur(40px) saturate(120%)',
              boxShadow:
                '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 pr-2 flex-shrink-0" style={{ minWidth: 'fit-content' }}>
          <div className="w-12 h-12 flex items-center justify-center">
            <BrandLogo
              className="w-12 h-12"
              alt="DocuTrackr Logo"
            />
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
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const AnimatedIcon = 'animatedIcon' in item ? item.animatedIcon : null;
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => {
                    triggerHaptic('light');
                    navigate(item.path);
                  }}
                  className="relative px-6 py-3 rounded-[999px] text-base transition-colors flex items-center gap-2"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                >
                  {active && (
                    <motion.div
                      layoutId="app-nav-pill"
                      className="absolute inset-0 rounded-[999px]"
                      style={{
                        background: '#60A5FA',
                        boxShadow:
                          '0 8px 24px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
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
                    {AnimatedIcon ? (
                      <AnimatedIcon isActive={active} />
                    ) : (
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                    {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                          boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
                        }}
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center flex-shrink-0" style={{ gap: '10px' }}>
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
                background: 'rgba(26, 26, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(40px) saturate(120%)',
                WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
              title="Lock now (Ctrl/Cmd+L)"
            >
              <LockIcon className="w-4 h-4" />
              <span className="tabular-nums">Auto-lock {remainingLabel}</span>
            </motion.button>
          ) : null}

          <motion.button
            whileHover={reduced ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            onClick={async () => {
              triggerHaptic('medium');
              try {
                await logout();
              } catch (error) {
                console.error('Logout error:', error);
              } finally {
                // Always navigate to login, even if logout fails
                navigate('/login', { replace: true });
              }
            }}
            className="flex items-center gap-2 px-4 h-12 rounded-full text-white/90 font-medium text-sm"
            style={{
              background: 'rgba(26, 26, 26, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(40px) saturate(120%)',
              WebkitBackdropFilter: 'blur(40px) saturate(120%)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('medium');
              // Keep nav behavior unchanged
              navigate('/add-document?scope=dashboard');
            }}
            className="flex items-center gap-2 px-6 h-12 rounded-full text-white font-medium text-base cursor-pointer whitespace-nowrap"
            style={{
              background: '#60A5FA',
              boxShadow: '0 8px 24px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              pointerEvents: 'auto',
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Add</span>
          </motion.button>
        </div>
          </div>
        </div>
      </div>
    </header>
  );
}
