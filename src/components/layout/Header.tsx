import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Lock as LockIcon, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
// NotificationBell removed from header (too busy / AI-feel)
import NotificationPermissionStatus from '../shared/NotificationPermissionStatus';
import { useAuth } from '../../hooks/useAuth';
import QuickAddModal from '../documents/QuickAddModal';
import AddImportantDateModal from '../dates/AddImportantDateModal';
import SearchOverlay from '../search/SearchOverlay';
import { triggerHaptic } from '../../utils/animations';
import BrandLogo from '../ui/BrandLogo';
import { useOptionalIdleTimeout } from '../../contexts/IdleTimeoutContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
  const { user } = useAuth();
  const idle = useOptionalIdleTimeout();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isImportantDateOpen, setIsImportantDateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide add button on auth pages, add-document page, profile page, dashboard page, and expire-soon page
  const isAuthPage = location.pathname.startsWith('/login') ||
                     location.pathname.startsWith('/signup') ||
                     location.pathname.startsWith('/forgot-password');
  const isAddDocumentPage = location.pathname === '/add-document';
  const isProfilePage = location.pathname === '/profile';
  const isDashboardPage = location.pathname === '/dashboard';
  const isExpireSoonPage = location.pathname === '/expire-soon';
  const showAddButton = !isAuthPage && !isAddDocumentPage && !isProfilePage && !isDashboardPage && !isExpireSoonPage;

  // Determine current page for modal logic
  const isDashboard = location.pathname === '/dashboard';
  const isDatesPage = location.pathname === '/dates';

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

  const handleAddClick = () => {
    if (isDashboard) {
      setIsQuickAddOpen(true);
    } else if (isDatesPage) {
      setIsImportantDateOpen(true);
    } else if (isExpireSoonPage) {
      navigate('/add-document?scope=expire_soon');
    } else {
      navigate('/add-document?scope=dashboard');
    }
  };

  return (
    <>
      <NotificationPermissionStatus />
      <motion.header
        initial={{ backdropFilter: 'blur(0px)' }}
        animate={{
          backdropFilter: isScrolled ? 'blur(50px)' : 'blur(0px)',
          backgroundColor: theme === 'light'
            ? (isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)')
            : (isScrolled ? 'rgba(10, 10, 10, 0.9)' : 'rgba(0, 0, 0, 0.5)'),
        }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 h-[92px] flex items-center"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="w-full px-4">
          <div
            className="mx-auto max-w-3xl rounded-[999px] px-4 py-4 flex items-center justify-between gap-3"
            style={{
              background: theme === 'light'
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(10, 10, 10, 0.9)',
              border: theme === 'light'
                ? '1px solid rgba(0, 0, 0, 0.08)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(50px) saturate(120%)',
              WebkitBackdropFilter: 'blur(50px) saturate(120%)',
              boxShadow: theme === 'light'
                ? '0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                : '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="w-12 h-12 flex items-center justify-center"
              whileTap={{ scale: 0.98 }}
              aria-label="Go to dashboard"
            >
              <img
                src="/assets/logo.svg"
                alt="DocuTrackr Logo"
                className="hidden"
                style={{
                  filter: 'drop-shadow(0 18px 55px rgba(139,92,246,0.35))',
                }}
              />
              <BrandLogo
                className="w-12 h-12"
                alt="DocuTrackr Logo"
                style={{
                  filter: theme === 'light' ? 'none' : 'none',
                }}
              />
            </motion.button>

            <div className="flex items-center gap-3">
            {/* Hamburger Menu - Mobile Only */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
              }}
              aria-label="Open menu"
            >
              <Menu
                className="w-5 h-5"
                style={{
                  color: theme === 'light' ? '#000000' : '#FFFFFF',
                }}
              />
            </motion.button>

            {showIdleIndicator ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('medium');
                  idle?.lockNow?.();
                }}
                className="h-12 px-3 rounded-full flex items-center gap-2 text-xs"
                style={{
                  color: theme === 'light' ? '#000000' : '#FFFFFF',
                  background: theme === 'light'
                    ? 'rgba(0, 0, 0, 0.05)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: theme === 'light'
                    ? '1px solid rgba(0, 0, 0, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                }}
                title="Lock now (Ctrl/Cmd+L)"
              >
                <LockIcon className="w-4 h-4" />
                <span className="tabular-nums">{remainingLabel}</span>
              </motion.button>
            ) : null}
            {showAddButton && (
              <motion.button
                data-fab-button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddClick}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation active:scale-95"
                style={{
                  background: theme === 'light' ? '#3B82F6' : '#60A5FA',
                  boxShadow: theme === 'light'
                    ? '0 8px 24px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 8px 24px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
                aria-label="Add document"
              >
                <Plus className="w-5 h-5 text-white" />
              </motion.button>
            )}
            {/* Notification bell removed */}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modals */}
      {isDashboard && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSuccess={() => {
            window.dispatchEvent(new CustomEvent('refreshDashboard'));
            setIsQuickAddOpen(false);
          }}
        />
      )}
      {isDatesPage && (
        <AddImportantDateModal
          isOpen={isImportantDateOpen}
          onClose={() => setIsImportantDateOpen(false)}
          onSuccess={() => {
            window.dispatchEvent(new CustomEvent('refreshDates'));
            setIsImportantDateOpen(false);
          }}
        />
      )}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Menu Modal */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] z-[70] md:hidden"
              style={{
                background: theme === 'light'
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(40px) saturate(120%)',
                WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                borderLeft: theme === 'light'
                  ? '1px solid rgba(0, 0, 0, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-2px 0 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex flex-col h-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold" style={{ color: theme === 'light' ? '#000' : '#FFF' }}>
                    Menu
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: theme === 'light'
                        ? 'rgba(0, 0, 0, 0.05)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: theme === 'light'
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <X className="w-5 h-5" style={{ color: theme === 'light' ? '#000' : '#FFF' }} />
                  </motion.button>
                </div>

                {/* Close button to complete menu */}
                <div className="mt-auto">
                  <p className="text-xs text-center opacity-50" style={{ color: theme === 'light' ? '#000' : '#FFF' }}>
                    DocuTrackr v1.0
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
