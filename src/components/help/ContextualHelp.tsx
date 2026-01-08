import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Play, ExternalLink } from 'lucide-react';
import { useHelp } from './HelpProvider';
import { triggerHaptic } from '../../utils/animations';

interface ContextualHelpProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  videoId?: string;
  dismissible?: boolean;
  type?: 'info' | 'tip' | 'tutorial';
  location?: 'top' | 'bottom';
}

export default function ContextualHelp({
  message,
  actionLabel,
  onAction,
  videoId,
  dismissible = true,
  type = 'tip',
  location = 'bottom',
}: ContextualHelpProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { openHelp, openKeyboardShortcuts } = useHelp();
  const storageKey = `help_dismissed_${message.slice(0, 20).replace(/\s/g, '_')}`;

  useEffect(() => {
    // Check if this help message was previously dismissed
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    triggerHaptic('light');
    setIsDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  const handleAction = () => {
    triggerHaptic('medium');
    if (onAction) {
      onAction();
    } else if (videoId) {
      // Open help panel and navigate to video
      openHelp();
      // Note: Video selection would need to be handled in HelpProvider
      // For now, just open help panel
    } else {
      openHelp();
    }
  };

  if (isDismissed) return null;

  const bgColors = {
    info: 'rgba(59, 130, 246, 0.15)',
    tip: 'rgba(139, 92, 246, 0.15)',
    tutorial: 'rgba(16, 185, 129, 0.15)',
  };

  const borderColors = {
    info: 'rgba(59, 130, 246, 0.3)',
    tip: 'rgba(139, 92, 246, 0.3)',
    tutorial: 'rgba(16, 185, 129, 0.3)',
  };

  const iconColors = {
    info: '#3B82F6',
    tip: '#8B5CF6',
    tutorial: '#10B981',
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed ${location === 'top' ? 'top-4' : 'bottom-20 sm:bottom-24'} left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[998]`}
        initial={{ opacity: 0, y: location === 'top' ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: location === 'top' ? -20 : 20 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="rounded-xl p-3 sm:p-4 border backdrop-blur-xl relative"
          style={{
            background: bgColors[type],
            borderColor: borderColors[type],
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-start gap-3 pr-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColors[type]}22` }}
            >
              {videoId ? (
                <Play className="w-4 h-4" style={{ color: iconColors[type] }} />
              ) : (
                <HelpCircle className="w-4 h-4" style={{ color: iconColors[type] }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-sm leading-relaxed mb-2">{message}</p>
              {actionLabel && (
                <button
                  onClick={handleAction}
                  className="text-xs sm:text-sm font-medium flex items-center gap-1.5 hover:gap-2 transition-all"
                  style={{ color: iconColors[type] }}
                >
                  {actionLabel}
                  {videoId && <ExternalLink className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

