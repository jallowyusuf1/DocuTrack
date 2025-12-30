import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { bottomSheet, scaleInCenter, getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  type?: 'center' | 'bottom';
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = 'center',
  size = 'medium',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  const sizeStyles = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
  };

  if (type === 'bottom') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={getTransition(transitions.fast)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
            />
            {/* Bottom Sheet */}
            <motion.div
              ref={modalRef}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={bottomSheet}
              transition={getTransition(transitions.spring)}
              className="fixed inset-x-0 bottom-0 z-50 relative rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              style={{
                background: 'rgba(42, 38, 64, 0.84)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderBottom: 'none',
                boxShadow:
                  '0 -18px 54px rgba(0, 0, 0, 0.70), 0 0 90px rgba(37, 99, 235, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                maxWidth: '100%',
              }}
              data-tablet-bottom-sheet="true"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Neon edge highlight */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(37, 99, 235, 0.0), rgba(37, 99, 235, 0.55), rgba(34, 211, 238, 0.30), rgba(37, 99, 235, 0.0))',
                }}
              />

              {/* Ambient gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(900px 420px at 15% 10%, rgba(37, 99, 235, 0.22) 0%, rgba(37, 99, 235, 0) 55%), radial-gradient(720px 420px at 85% 0%, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0) 60%), radial-gradient(700px 420px at 80% 95%, rgba(34, 211, 238, 0.10) 0%, rgba(34, 211, 238, 0) 55%)',
                }}
              />

              <style>{`
                @media (min-width: 768px) {
                  [data-tablet-bottom-sheet="true"] {
                    max-width: 600px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    right: auto !important;
                  }
                }
              `}</style>
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div 
              className="h-1 bg-white/30 rounded-full"
              style={{ width: '36px' }}
              data-tablet-handle="true"
            />
            <style>{`
              @media (min-width: 768px) {
                [data-tablet-handle="true"] {
                  width: 48px !important;
                }
              }
            `}</style>
          </div>

          {/* Header */}
          {title && (
            <div
              className="relative flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/10"
              style={{
                paddingLeft: '20px',
                paddingRight: '20px',
                background: 'rgba(26, 22, 37, 0.32)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
              data-tablet-padding="true"
            >
              <style>{`
                @media (min-width: 768px) {
                  [data-tablet-padding="true"] {
                    padding-left: 24px !important;
                    padding-right: 24px !important;
                  }
                }
              `}</style>
              <h2 className="text-[17px] md:text-[20px] font-bold text-white">{title}</h2>
              {showCloseButton && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: '#60A5FA',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 99, 235, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" style={{ color: '#60A5FA' }} />
                </motion.button>
              )}
            </div>
          )}

              {/* Content */}
              <div className="relative flex-1 overflow-y-auto px-5 md:px-6" style={{ paddingLeft: '20px', paddingRight: '20px' }} data-tablet-content="true">
                <style>{`
                  @media (min-width: 768px) {
                    [data-tablet-content="true"] {
                      padding-left: 24px !important;
                      padding-right: 24px !important;
                    }
                  }
                `}</style>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={getTransition(transitions.fast)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
          >
            {/* Center Modal */}
            <motion.div
              ref={modalRef}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={scaleInCenter}
              transition={getTransition(transitions.spring)}
                className={`relative rounded-2xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-hidden flex flex-col`}
              style={{
                background: 'rgba(42, 38, 64, 0.84)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow:
                  '0 22px 70px rgba(0, 0, 0, 0.72), 0 0 90px rgba(37, 99, 235, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Neon edge highlight */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(37, 99, 235, 0.0), rgba(37, 99, 235, 0.55), rgba(34, 211, 238, 0.30), rgba(37, 99, 235, 0.0))',
                }}
              />

              {/* Ambient gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(900px 420px at 15% 10%, rgba(37, 99, 235, 0.22) 0%, rgba(37, 99, 235, 0) 55%), radial-gradient(720px 420px at 85% 0%, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0) 60%), radial-gradient(700px 420px at 80% 95%, rgba(34, 211, 238, 0.10) 0%, rgba(34, 211, 238, 0) 55%)',
                }}
              />

              {/* Header */}
              {title && (
                <div
                  className="relative flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/10"
                  style={{
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    background: 'rgba(26, 22, 37, 0.32)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                  }}
                  data-tablet-center-padding="true"
                >
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-center-padding="true"] {
                        padding-left: 24px !important;
                        padding-right: 24px !important;
                      }
                    }
                  `}</style>
                  <h2 className="text-[17px] md:text-[20px] font-bold text-white">{title}</h2>
                  {showCloseButton && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        triggerHaptic('light');
                        onClose();
                      }}
                      className="p-2 rounded-lg hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 text-glass-primary" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="relative flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

