import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Lock as LockIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import NotificationPermissionStatus from '../shared/NotificationPermissionStatus';
import { useAuth } from '../../hooks/useAuth';
import QuickAddModal from '../documents/QuickAddModal';
import AddImportantDateModal from '../dates/AddImportantDateModal';
import SearchOverlay from '../search/SearchOverlay';
import { triggerHaptic } from '../../utils/animations';
import { useOptionalIdleTimeout } from '../../contexts/IdleTimeoutContext';

export default function Header() {
  const { user } = useAuth();
  const idle = useOptionalIdleTimeout();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isImportantDateOpen, setIsImportantDateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide add button on auth pages, add-document page, and profile page
  const isAuthPage = location.pathname.startsWith('/login') ||
                     location.pathname.startsWith('/signup') ||
                     location.pathname.startsWith('/forgot-password');
  const isAddDocumentPage = location.pathname === '/add-document';
  const isProfilePage = location.pathname === '/profile';
  const showAddButton = !isAuthPage && !isAddDocumentPage && !isProfilePage;

  // Determine current page
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
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
    } else {
      navigate('/add-document');
    }
  };

  return (
    <>
      <NotificationPermissionStatus />
      <motion.header
        initial={{ backdropFilter: 'blur(0px)' }}
        animate={{
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
          backgroundColor: isScrolled ? 'rgba(35, 29, 51, 0.6)' : 'rgba(35, 29, 51, 0.3)',
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
              background:
                'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.05) 100%), linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(139,92,246,0.10) 55%, rgba(59,130,246,0.10) 100%)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(34px) saturate(180%)',
              WebkitBackdropFilter: 'blur(34px) saturate(180%)',
              boxShadow:
                '0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="w-12 h-12 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.95), rgba(59,130,246,0.85))',
                boxShadow: '0 18px 55px rgba(139,92,246,0.35)',
                border: '1px solid rgba(255,255,255,0.20)',
              }}
              whileTap={{ scale: 0.98 }}
              aria-label="Go to dashboard"
            >
              <FileText className="w-6 h-6 text-white" />
            </motion.button>

            <div className="flex items-center gap-3">
            {showIdleIndicator ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('medium');
                  idle?.lockNow?.();
                }}
                className="h-12 px-3 rounded-full flex items-center gap-2 text-white/90 text-xs"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
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
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  boxShadow: '0 18px 55px rgba(139,92,246,0.35)',
                }}
                aria-label="Add document"
              >
                <Plus className="w-5 h-5 text-white" />
              </motion.button>
            )}
            <NotificationBell />
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
    </>
  );
}
