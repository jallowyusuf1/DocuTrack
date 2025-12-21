import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useState, useEffect } from 'react';

export default function NetworkStatusBanner() {
  const { isOnline } = useNetworkStatus();
  const [showOffline, setShowOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setShowReconnected(false);
    } else if (showOffline && isOnline) {
      // Was offline, now back online
      setShowOffline(false);
      setShowReconnected(true);

      // Hide reconnected message after 3 seconds
      const timeout = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, showOffline]);

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#FF3B30',
            color: '#FFFFFF',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <WifiOff className="w-5 h-5" />
          <span>No internet connection</span>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#34C759',
            color: '#FFFFFF',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Wifi className="w-5 h-5" />
          <span>Back online</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
