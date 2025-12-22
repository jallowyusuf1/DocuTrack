import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface DesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number | string;
  height?: number | string;
  showCloseButton?: boolean;
  allowBackdropClose?: boolean;
  className?: string;
}

export default function DesktopModal({
  isOpen,
  onClose,
  title,
  children,
  width = 'auto',
  height = 'auto',
  showCloseButton = true,
  allowBackdropClose = true,
  className = '',
}: DesktopModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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

  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={allowBackdropClose ? onClose : undefined}
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}
          />

          {/* Center Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative rounded-[28px] flex flex-col overflow-hidden ${className}`}
              style={{
                width: widthStyle,
                height: heightStyle === 'auto' ? 'auto' : heightStyle,
                maxHeight: '90vh',
                background: 'rgba(42, 38, 64, 0.84)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow:
                  '0 22px 70px rgba(0, 0, 0, 0.72), 0 0 90px rgba(139, 92, 246, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Neon edge highlight */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(139, 92, 246, 0.0), rgba(139, 92, 246, 0.55), rgba(34, 211, 238, 0.30), rgba(139, 92, 246, 0.0))',
                }}
              />

              {/* Ambient gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(900px 420px at 15% 10%, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0) 55%), radial-gradient(720px 420px at 85% 0%, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0) 60%), radial-gradient(700px 420px at 80% 95%, rgba(34, 211, 238, 0.10) 0%, rgba(34, 211, 238, 0) 55%)',
                }}
              />

              {/* Header */}
              {title && (
                <div
                  className="relative flex items-center justify-between px-8 py-6 border-b border-white/10"
                  style={{
                    background: 'rgba(26, 22, 37, 0.32)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                  }}
                >
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  {showCloseButton && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        triggerHaptic('light');
                        onClose();
                      }}
                      className="p-2 rounded-xl transition-colors"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                      }}
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 text-white" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="relative flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

