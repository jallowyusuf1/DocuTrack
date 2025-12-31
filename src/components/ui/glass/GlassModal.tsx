import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { prefersReducedMotion } from '../../../utils/animations';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export default function GlassModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
}: GlassModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  const sizeClasses = {
    small: 'max-w-[400px]',
    medium: 'max-w-[600px]',
    large: 'max-w-[900px]',
    fullscreen: 'max-w-[95vw] w-full h-[95vh]',
  };

  const paddingClasses = {
    small: 'p-6',
    medium: 'p-8 md:p-10',
    large: 'p-10 md:p-12',
    fullscreen: 'p-6 md:p-8',
  };

  const isDark = true; // Always dark mode for now

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            className="fixed inset-0 z-[100]"
            onClick={() => {
              if (closeOnBackdrop) onClose();
            }}
            style={{
              background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6">
            <motion.div
              ref={modalRef}
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={reduced ? undefined : { opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{
                duration: reduced ? 0 : 0.4,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={`relative w-full ${sizeClasses[size]} rounded-[28px] overflow-hidden ${className}`}
              style={{
                background: isDark
                  ? 'rgba(26, 26, 26, 0.75)'
                  : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(60px) saturate(150%)',
                WebkitBackdropFilter: 'blur(60px) saturate(150%)',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: isDark
                  ? '0 20px 60px rgba(0, 0, 0, 0.9)'
                  : '0 20px 60px rgba(0, 0, 0, 0.15)',
                maxHeight: size === 'fullscreen' ? '95vh' : '90vh',
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'glass-modal-title' : undefined}
            >
              {/* Header Glass Tile */}
              {(title || subtitle || showCloseButton) && (
                <div
                  className="relative px-6 md:px-8 pt-6 md:pt-8 pb-4"
                  style={{
                    background: isDark
                      ? 'rgba(40, 40, 40, 0.5)'
                      : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: '20px 20px 0 0',
                    marginBottom: '16px',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {title && (
                        <h2
                          id="glass-modal-title"
                          className="text-2xl md:text-[32px] font-bold mb-2"
                          style={{
                            color: isDark ? '#FFFFFF' : '#000000',
                            fontWeight: 700,
                          }}
                        >
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p
                          className="text-base"
                          style={{
                            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          {subtitle}
                        </p>
                      )}
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                        style={{
                          background: isDark
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.05)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: isDark
                            ? '1px solid rgba(255, 255, 255, 0.15)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isDark
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.borderColor = isDark
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.1)';
                        }}
                        aria-label="Close modal"
                      >
                        <X
                          className="w-6 h-6"
                          style={{
                            color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
                          }}
                        />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div
                className={`overflow-y-auto ${paddingClasses[size]}`}
                style={{
                  maxHeight: size === 'fullscreen' ? 'calc(95vh - 120px)' : 'calc(90vh - 120px)',
                }}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}




