import { useState, useEffect } from 'react';
import { WifiOff, X, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  // Reset dismissed state when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // Show reconnected message briefly
  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      setDismissed(false);

      // Hide after 5 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  // Don't show anything if online and not recently reconnected
  if (isOnline && !showReconnected) {
    return null;
  }

  // Don't show if dismissed
  if (dismissed && !isOnline) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        ${isOnline ? 'bg-green-600' : 'bg-orange-600'}
        text-white px-4 py-3
        flex items-center justify-between
        shadow-lg
        animate-slide-down
        safe-area-top
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        {isOnline ? (
          <>
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Back online!</p>
              <p className="text-xs text-white/90">Your changes are being synced</p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">You're offline</p>
              <p className="text-xs text-white/90">Changes will sync when reconnected</p>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => {
          setDismissed(true);
          setShowReconnected(false);
        }}
        className="p-1 rounded hover:bg-white/20 active:bg-white/30 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
