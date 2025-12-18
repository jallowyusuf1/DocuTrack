import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleView?: () => void;
  onFocusSearch?: () => void;
}

// Only 8 essential shortcuts
const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open search', action: 'search' },
  { keys: ['N'], description: 'New document', action: 'new' },
  { keys: ['G'], description: 'Toggle grid view', action: 'grid' },
  { keys: ['L'], description: 'Toggle list view', action: 'list' },
  { keys: ['F'], description: 'Focus search', action: 'focus' },
  { keys: ['E'], description: 'Edit document', action: 'edit' },
  { keys: ['D'], description: 'Delete document', action: 'delete' },
  { keys: ['Esc'], description: 'Close', action: 'close' },
];

export default function KeyboardShortcutsDropdown({ 
  isOpen, 
  onClose,
  onToggleView,
  onFocusSearch 
}: KeyboardShortcutsDropdownProps) {
  const navigate = useNavigate();

  // Handle keyboard shortcuts globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Esc to close shortcuts even when typing
        if (e.key === 'Escape' && isOpen) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onFocusSearch?.();
      }
      // N - New document
      else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        navigate('/add-document');
      }
      // G - Toggle grid view
      else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        onToggleView?.();
      }
      // L - Toggle list view
      else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        onToggleView?.();
      }
      // F - Focus search
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onFocusSearch?.();
      }
      // Esc - Close shortcuts
      else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, navigate, onToggleView, onFocusSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(35, 29, 51, 0.4)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
          }}
        >
          <div className="p-3 md:p-4 space-y-1.5 md:space-y-2">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between py-2 md:py-2.5 px-3 md:px-4 rounded-xl hover:bg-white/5 transition-colors"
                style={{
                  background: 'rgba(42, 38, 64, 0.3)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span className="text-xs md:text-sm text-white/90 flex-1 pr-3">{shortcut.description}</span>
                <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
                  {shortcut.keys.map((key, keyIndex) => (
                    <div key={keyIndex} className="flex items-center gap-0.5 md:gap-1">
                      {keyIndex > 0 && (
                        <span className="text-white/40 text-[10px] md:text-xs">+</span>
                      )}
                      <kbd
                        className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-medium text-white"
                        style={{
                          background: 'rgba(139, 92, 246, 0.25)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          minWidth: '24px',
                          textAlign: 'center',
                        }}
                      >
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

