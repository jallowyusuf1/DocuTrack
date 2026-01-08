import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  {
    keys: ['K'],
    description: 'Open search',
    category: 'Navigation',
  },
  {
    keys: ['N'],
    description: 'Add new document',
    category: 'Actions',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
    category: 'Help',
  },
  {
    keys: ['ESC'],
    description: 'Close modal or panel',
    category: 'Navigation',
  },
  {
    keys: ['Tab'],
    description: 'Navigate between fields',
    category: 'Navigation',
  },
  {
    keys: ['Enter'],
    description: 'Submit form or confirm action',
    category: 'Actions',
  },
];

const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl m-4 rounded-2xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Keyboard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <h2 className="text-white text-lg sm:text-xl font-bold">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <section key={category}>
                <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wider text-white/60">
                  {category}
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors gap-2"
                    >
                      <span className="text-white/90 text-xs sm:text-sm pr-2">{shortcut.description}</span>
                      <div className="flex items-center gap-1.5">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            <kbd className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/10 border border-white/20 text-white/90 text-[10px] sm:text-xs font-mono flex items-center gap-0.5 sm:gap-1">
                              {isMac && (key === 'K' || key === 'N' || key === '?') ? (
                                <>
                                  <Command className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  {key}
                                </>
                              ) : !isMac && (key === 'K' || key === 'N' || key === '?') ? (
                                `Ctrl + ${key}`
                              ) : (
                                key
                              )}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-white/30 mx-0.5 sm:mx-1 text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-xs">
              Press <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white/90 text-xs font-mono">ESC</kbd> to close
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

