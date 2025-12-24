import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const node = (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[120] safe-area-top"
      style={{
        top: 'calc(env(safe-area-inset-top) + 12px)',
        width: 'min(680px, calc(100vw - 24px))',
        pointerEvents: 'none', // allow page interactions except inside the toast
      }}
    >
      <div
        className="pointer-events-auto rounded-[22px] px-4 py-3 flex items-center gap-3"
        style={{
          background: isOnline ? 'rgba(16, 185, 129, 0.18)' : 'rgba(249, 115, 22, 0.18)',
          border: isOnline ? '1px solid rgba(16, 185, 129, 0.32)' : '1px solid rgba(249, 115, 22, 0.32)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow:
            '0 26px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)',
        }}
        role="status"
        aria-live="polite"
      >
        <div
          className="w-10 h-10 rounded-[16px] flex items-center justify-center flex-shrink-0"
          style={{
            background: isOnline ? 'rgba(16, 185, 129, 0.22)' : 'rgba(249, 115, 22, 0.22)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          {isOnline ? (
            <CheckCircle className="w-5 h-5 text-white/90" />
          ) : (
            <WifiOff className="w-5 h-5 text-white/90" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-white font-semibold text-sm">
            {isOnline ? 'Back online!' : "You're offline"}
          </div>
          <div className="text-white/80 text-xs truncate">
            {isOnline ? 'Your changes are being synced' : 'Changes will sync when reconnected'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            setShowReconnected(false);
          }}
          className="w-10 h-10 rounded-[16px] flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
          }}
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(node, document.body) : null;
}
