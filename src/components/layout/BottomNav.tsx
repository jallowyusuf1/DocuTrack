import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FolderOpen, FolderClosed, Calendar, Users, User, DoorOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useState, useEffect } from 'react';
import { triggerHaptic, pulse } from '../../utils/animations';
import AnimatedClockIcon from '../ui/AnimatedClockIcon';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expiringCount, setExpiringCount] = useState(0);
  const [clockClicked, setClockClicked] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
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
      documentService.getExpiringDocuments(user.id, 30)
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

  const handleLogout = async () => {
    triggerHaptic('medium');
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: Clock,
      label: 'Expiring Soon',
      badge: expiringCount,
    },
    {
      path: '/documents',
      icon: FolderClosed, // Will be animated separately
      label: 'Documents',
    },
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
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom" style={{
      background: 'rgba(35, 29, 51, 0.8)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
                  ${active ? 'text-purple-400' : 'text-glass-disabled'}
                `}
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
                          className={`w-6 h-6 transition-colors duration-200 ${
                            active ? 'text-purple-400' : 'text-glass-disabled'
                          }`}
                        />
                      ) : (
                        <FolderClosed
                          className={`w-6 h-6 transition-colors duration-200 ${
                            active ? 'text-purple-400' : 'text-glass-disabled'
                          }`}
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
                        className={`w-6 h-6 transition-colors duration-200 ${
                          active ? 'text-purple-400' : 'text-glass-disabled'
                        }`}
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
                              className={`w-6 h-6 transition-colors duration-200 ${
                                active ? 'text-purple-400' : 'text-glass-disabled'
                              }`}
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
                              className={`w-6 h-6 transition-colors duration-200 text-purple-400`}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Default icon when not active */}
                      {!active && (
                        <Icon
                          className={`w-6 h-6 transition-colors duration-200 text-glass-disabled`}
                        />
                      )}
                    </div>
                  ) : (
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        active ? 'text-purple-400' : 'text-glass-disabled'
                      }`}
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
                        bg-purple-500
                        rounded-full
                        shadow-[0_0_8px_rgba(139,92,246,0.6)]
                      "
                    />
                  )}
                </div>
                <motion.span
                  animate={{ fontWeight: active ? 600 : 500 }}
                  className={`
                    text-[11px] mt-1
                    transition-colors duration-200
                    ${active ? 'text-purple-400' : 'text-glass-disabled'}
                    whitespace-nowrap
                  `}
                >
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
        
        {/* Logout Button */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex-1 h-full"
        >
          <motion.button
            onClick={() => {
              triggerHaptic('medium');
              if (window.confirm('Are you sure you want to logout?')) {
                handleLogout();
              }
            }}
            className="
              flex flex-col items-center justify-center
              min-h-[48px]
              select-none touch-manipulation
              text-red-400 hover:text-red-300
              transition-colors duration-200
            "
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[11px] mt-1 font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </div>
    </nav>
  );
}

