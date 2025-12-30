import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FolderOpen, FolderClosed, Calendar, Users, User, DoorOpen, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useState, useEffect } from 'react';
import { triggerHaptic, pulse } from '../../utils/animations';
import AnimatedClockIcon from '../ui/AnimatedClockIcon';
import { usePendingRequestCount } from '../../hooks/usePendingRequestCount';
import { childAccountsService } from '../../services/childAccounts';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expiringCount, setExpiringCount] = useState(0);
  const [clockClicked, setClockClicked] = useState(false);
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
  
  // Responsive desktop check - must be before early returns
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if we're on an auth page
  const isAuthPage = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/signup') || 
                     location.pathname.startsWith('/forgot-password');

  // Fetch expiring documents count
  useEffect(() => {
    if (user && !isAuthPage) {
      documentService.getExpiringDocuments(user.id, 30, 'expire_soon')
        .then(docs => setExpiringCount(docs.length))
        .catch(() => setExpiringCount(0));
    }
  }, [user, isAuthPage]);

  // Hide on auth pages
  if (isAuthPage) {
    return null;
  }

  // Hide on desktop (1024px and above)
  if (isDesktop) {
    return null;
  }

  // Track if documents page is active to animate folder icon
  const isDocumentsActive = location.pathname.startsWith('/documents') && 
                            location.pathname !== '/documents/:id/edit' &&
                            location.pathname !== '/add-document';
  
  // Track if dates page is active for continuous flip animation
  const isDatesActive = location.pathname === '/dates';

  // (Logout removed from bottom nav)

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: Clock,
      label: 'Dashboard',
      badge: expiringCount,
    },
    {
      path: '/documents',
      icon: FolderClosed, // Will be animated separately
      label: 'Documents',
    },
    ...(isParent
      ? [
          {
            path: '/requests',
            icon: MessageSquare,
            label: 'Requests',
            badge: pendingRequestCount,
          },
        ]
      : []),
    {
      path: '/family',
      icon: Users,
      label: 'Family',
    },
    {
      path: '/dates',
      icon: Calendar,
      label: 'Dates',
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom" style={{
      background: 'rgba(26, 26, 26, 0.8)',
      backdropFilter: 'blur(40px) saturate(120%)',
      WebkitBackdropFilter: 'blur(40px) saturate(120%)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      height: '80px',
    }}>
      <div className="flex justify-around items-start h-[72px] px-2 pb-safe pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const showBadge = item.badge !== undefined && item.badge > 0;

          return (
            <motion.div
              key={item.path}
              whileTap={{ scale: 0.9 }}
              className="flex-1 h-full"
            >
              <Link
                to={item.path}
                onClick={() => triggerHaptic('light')}
                className={`
                  flex flex-col items-center justify-center
                  min-h-[48px]
                  select-none touch-manipulation
                `}
                style={{ color: active ? '#60A5FA' : 'rgba(255, 255, 255, 0.4)' }}
              >
                <div className="relative flex items-center justify-center">
                  {item.path === '/dashboard' ? (
                    <AnimatedClockIcon
                      isActive={active}
                      className="w-6 h-6"
                    />
                  ) : item.path === '/documents' ? (
                    <motion.div
                      key={isDocumentsActive ? 'open' : 'closed'}
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {isDocumentsActive ? (
                        <FolderOpen
                          className="w-6 h-6 transition-colors duration-200"
                          style={{ color: active ? '#60A5FA' : 'rgba(255, 255, 255, 0.4)' }}
                        />
                      ) : (
                        <FolderClosed
                          className="w-6 h-6 transition-colors duration-200"
                          style={{ color: active ? '#60A5FA' : 'rgba(255, 255, 255, 0.4)' }}
                        />
                      )}
                    </motion.div>
                  ) : item.path === '/dates' ? (
                    <motion.div
                      animate={isDatesActive ? {
                        rotateY: [0, 360],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Icon
                        className="w-6 h-6 transition-colors duration-200"
                        style={{ color: active ? '#60A5FA' : 'rgba(255, 255, 255, 0.4)' }}
                      />
                    </motion.div>
                  ) : item.path === '/profile' ? (
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <AnimatePresence>
                        {active ? (
                          // Door opens first
                          <motion.div
                            key="door"
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: 90 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <DoorOpen
                              className="w-6 h-6 transition-colors duration-200"
                              style={{ color: '#60A5FA' }}
                            />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                      {/* Profile icon pops up after door */}
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            key="profile"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: 'easeOut',
                              delay: 0.4, // After door opens
                            }}
                            className="absolute"
                          >
                            <Icon
                              className="w-6 h-6 transition-colors duration-200"
                              style={{ color: '#60A5FA' }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Default icon when not active */}
                      {!active && (
                        <Icon
                          className="w-6 h-6 transition-colors duration-200"
                          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                        />
                      )}
                    </div>
                  ) : (
                    <Icon
                      className="w-6 h-6 transition-colors duration-200"
                      style={{ color: active ? '#60A5FA' : 'rgba(255, 255, 255, 0.4)' }}
                    />
                  )}
                  {showBadge && (
                    <motion.span
                      animate="animate"
                      variants={pulse}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="
                        absolute -top-1 -right-1
                        min-w-[18px] h-[18px]
                        flex items-center justify-center
                        bg-red-500 text-white
                        text-[10px] font-semibold
                        rounded-full
                        px-1
                        z-10
                      "
                    >
                      {item.badge! >= 10 ? '9+' : item.badge}
                    </motion.span>
                  )}
                  {/* Active indicator dot */}
                  {active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="
                        absolute -top-0.5 left-1/2 -translate-x-1/2
                        w-1.5 h-1.5
                        rounded-full
                      "
                      style={{
                        background: '#60A5FA',
                        boxShadow: '0 0 8px rgba(96, 165, 250, 0.6)',
                      }}
                    />
                  )}
                </div>
                <motion.span
                  animate={{ fontWeight: active ? 600 : 500 }}
                  className="text-[11px] mt-1 transition-colors duration-200 whitespace-nowrap"
                  style={{ color: active ? '#60A5FA' : 'rgba(255, 255, 255, 0.4)' }}
                >
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
        
        {/* Logout removed */}
      </div>
    </nav>
  );
}

