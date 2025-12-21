import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, Users, Settings, Bell, Shield, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AppleMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
}

/**
 * Apple-style Mobile Menu
 * Three-line hamburger menu with actual DocuTrackr features
 * Follows iOS menu sheet design
 */
export const AppleMobileMenu: React.FC<AppleMobileMenuProps> = ({
  isOpen,
  onClose,
  isAuthenticated = false,
}) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  // Actual DocuTrackr menu items based on authentication
  const menuItems = isAuthenticated
    ? [
        { icon: Home, label: 'Dashboard', path: '/dashboard', color: '#8B5CF6' },
        { icon: FileText, label: 'My Documents', path: '/documents', color: '#8B5CF6' },
        { icon: Calendar, label: 'Expiration Dates', path: '/dates', color: '#FF9500' },
        { icon: Users, label: 'Family Sharing', path: '/family', color: '#34C759' },
        { icon: Bell, label: 'Notifications', path: '/dashboard', color: '#FF3B30' },
        { icon: Shield, label: 'Privacy & Security', path: '/settings', color: '#5856D6' },
        { icon: Settings, label: 'Settings', path: '/settings', color: '#8E8E93' },
      ]
    : [
        { icon: Home, label: 'Home', path: '/', color: '#8B5CF6' },
        { icon: FileText, label: 'Features', path: '/#features', color: '#8B5CF6' },
        { icon: Shield, label: 'Security', path: '/#security', color: '#5856D6' },
        { icon: Users, label: 'Family Sharing', path: '/#family', color: '#34C759' },
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Menu Sheet */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] z-[70]
                       bg-white/95 dark:bg-[#1C1C1E]/95
                       backdrop-blur-[40px] backdrop-saturate-[180%]
                       border-r border-black/[0.06] dark:border-white/[0.06]
                       shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[--separator-opaque]">
              <h2 className="text-[22px] font-bold text-[--text-primary]">
                DocuTrackr
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center
                           bg-[--fill-tertiary] hover:bg-[--fill-secondary]
                           rounded-full transition-all duration-200
                           text-[--text-primary]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="py-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-4 px-6 py-3.5
                               text-left transition-all duration-200
                               hover:bg-[--fill-quaternary]
                               active:bg-[--fill-tertiary]"
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon size={20} style={{ color: item.color }} />
                    </div>
                    <span className="text-[17px] font-medium text-[--text-primary]">
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[--separator-opaque]">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigate('/login')}
                    className="w-full px-4 py-3 text-[17px] font-semibold
                               bg-[--system-blue] text-white
                               rounded-xl transition-all duration-200
                               hover:brightness-110 active:brightness-90"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigate('/signup')}
                    className="w-full px-4 py-3 text-[17px] font-medium
                               bg-[--fill-tertiary] text-[--text-primary]
                               rounded-xl transition-all duration-200
                               hover:bg-[--fill-secondary] active:bg-[--fill-primary]"
                  >
                    Create Account
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full px-4 py-3 text-[17px] font-medium
                             bg-[--fill-tertiary] text-[--text-primary]
                             rounded-xl transition-all duration-200
                             hover:bg-[--fill-secondary] active:bg-[--fill-primary]"
                >
                  View Profile
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
