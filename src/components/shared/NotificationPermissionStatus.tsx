import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Bell, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { triggerHaptic } from '../../utils/animations';

const PERMISSION_CHANGE_KEY = 'notification_permission_changed';
const BANNER_SHOWN_KEY = 'notification_banner_shown';

export default function NotificationPermissionStatus() {
  const { t, i18n } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPermissionRef = useRef<NotificationPermission | null>(null);

  useEffect(() => {
    if (!('Notification' in window)) return;

    // Set initial permission state (but don't show banner on mount)
    const initialPermission = Notification.permission;
    setPermission(initialPermission);
    previousPermissionRef.current = initialPermission;

    const checkPermission = () => {
      const currentPermission = Notification.permission;
      const permissionChanged = localStorage.getItem(PERMISSION_CHANGE_KEY) === 'true';
      const bannerAlreadyShown = localStorage.getItem(BANNER_SHOWN_KEY) === 'true';

      // Only show if:
      // 1. Permission is denied
      // 2. Permission actually changed (not just on page load)
      // 3. Banner hasn't been shown for this permission state
      if (currentPermission === 'denied' && permissionChanged && !bannerAlreadyShown) {
        setPermission(currentPermission);
        setIsVisible(true);
        
        // Mark as shown
        localStorage.setItem(BANNER_SHOWN_KEY, 'true');
        
        // Auto-dismiss after 7 seconds
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          // Clear the permission change flag so it doesn't show again
          localStorage.removeItem(PERMISSION_CHANGE_KEY);
        }, 7000);
      } else {
        setPermission(currentPermission);
        setIsVisible(false);
      }

      previousPermissionRef.current = currentPermission;
    };

    // Listen for storage events (when permission changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PERMISSION_CHANGE_KEY) {
        checkPermission();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll for permission changes
    const intervalId = setInterval(() => {
      if ('Notification' in window) {
        const currentPermission = Notification.permission;
        if (previousPermissionRef.current !== null && 
            previousPermissionRef.current !== currentPermission &&
            currentPermission === 'denied') {
          localStorage.setItem(PERMISSION_CHANGE_KEY, 'true');
          localStorage.removeItem(BANNER_SHOWN_KEY);
          checkPermission();
        } else if (previousPermissionRef.current !== currentPermission) {
          // Permission changed but not to denied - clear flags
          previousPermissionRef.current = currentPermission;
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    triggerHaptic('light');
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Clear flags so it doesn't show again
    localStorage.removeItem(PERMISSION_CHANGE_KEY);
    localStorage.setItem(BANNER_SHOWN_KEY, 'true');
  };

  if (!isVisible || permission !== 'denied') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed left-0 right-0 z-[25] px-4 py-2"
          style={{
            top: '70px', // Position below the header border (header is 70px high with border)
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
            <span 
              className="text-white text-xs sm:text-sm font-medium"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: 'calc(100vw - 120px)',
              }}
            >
              {t('profile.pushNotificationsDisabled')}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
