import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface FrostedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
  contentClassName?: string;
  surfaceStyle?: React.CSSProperties;
  showTiledGlass?: boolean;
  backdropStyle?: React.CSSProperties;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  zIndexClassName?: string;
}

export default function FrostedModal({
  isOpen,
  onClose,
  children,
  maxWidthClass = 'max-w-md',
  contentClassName = '',
  surfaceStyle,
  showTiledGlass = false,
  backdropStyle,
  closeOnBackdrop = true,
  closeOnEscape = true,
  zIndexClassName = 'z-[100]',
}: FrostedModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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
        triggerHaptic('light');
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

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
            className={`fixed inset-0 ${zIndexClassName}`}
            onClick={() => {
              if (!closeOnBackdrop) return;
              triggerHaptic('light');
              onClose();
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.62)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              ...(backdropStyle ?? {}),
            }}
          />

          {/* Center container */}
          <div className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center p-4`}>
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={getTransition(transitions.spring)}
              className={`relative w-full ${maxWidthClass} rounded-[28px] overflow-hidden ${contentClassName}`}
              style={{
                background: 'rgba(42, 38, 64, 0.84)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow:
                  '0 22px 70px rgba(0, 0, 0, 0.72), 0 0 90px rgba(139, 92, 246, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                ...(surfaceStyle ?? {}),
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Neon edge highlight */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(139, 92, 246, 0.0), rgba(139, 92, 246, 0.55), rgba(34, 211, 238, 0.35), rgba(139, 92, 246, 0.0))',
                }}
              />

              {/* Ambient gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(900px 420px at 15% 10%, rgba(139, 92, 246, 0.24) 0%, rgba(139, 92, 246, 0) 55%), radial-gradient(720px 420px at 85% 0%, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0) 60%), radial-gradient(700px 420px at 80% 95%, rgba(34, 211, 238, 0.12) 0%, rgba(34, 211, 238, 0) 55%)',
                  opacity: 1,
                }}
              />

              {/* Tiled frosted glass grid */}
              {showTiledGlass && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '42px 42px',
                    opacity: 0.14,
                    mixBlendMode: 'overlay',
                  }}
                />
              )}

              <div className="relative">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}


