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
              className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
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
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {showCloseButton && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              )}
            </div>
          )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto">{children}</div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
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
              className={`bg-white rounded-2xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                  {showCloseButton && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        triggerHaptic('light');
                        onClose();
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

