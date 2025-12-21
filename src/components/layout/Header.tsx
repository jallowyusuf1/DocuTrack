import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import NotificationPermissionStatus from '../shared/NotificationPermissionStatus';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import QuickAddModal from '../documents/QuickAddModal';
import AddImportantDateModal from '../dates/AddImportantDateModal';
import SearchOverlay from '../search/SearchOverlay';

export default function Header() {
  const { user } = useAuth();
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

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

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
        className="sticky top-0 z-50 border-b border-white/10 h-[70px] flex items-center"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="flex items-center justify-between w-full md:max-w-[1024px] md:mx-auto md:px-6">
          <motion.h1
            onClick={() => navigate('/dashboard')}
            className="text-lg font-bold text-white pl-4 md:pl-0 pr-2 cursor-pointer"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            DocuTrack
          </motion.h1>
          <div className="flex items-center gap-3 md:gap-4 pr-5 md:pr-0">
            {showAddButton && (
              <motion.button
                data-fab-button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddClick}
                className="w-9 h-9 md:w-[40px] md:h-[40px] rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  boxShadow: '0 2px 12px rgba(139, 92, 246, 0.4)',
                }}
                aria-label="Add document"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.button>
            )}
            <NotificationBell />
            <div className="w-10 h-10 md:w-[40px] md:h-[40px] rounded-full glass-card border border-white/20 flex items-center justify-center overflow-hidden">
              <Avatar
                src={user?.user_metadata?.avatar_url}
                fallback={getInitials()}
                size="small"
                className="w-full h-full"
              />
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
