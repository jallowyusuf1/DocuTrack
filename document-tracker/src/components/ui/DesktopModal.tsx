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
              className={`rounded-[28px] flex flex-col overflow-hidden ${className}`}
              style={{
                width: widthStyle,
                height: heightStyle === 'auto' ? 'auto' : heightStyle,
                maxHeight: '90vh',
                background: 'rgba(26, 22, 37, 0.95)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  {showCloseButton && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        triggerHaptic('light');
                        onClose();
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 text-white" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

