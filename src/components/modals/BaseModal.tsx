import type { ReactNode } from 'react';
import FrostedModal from '../ui/FrostedModal';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: BaseModalProps) {
  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    full: 'max-w-[95vw]',
  }[size];

  return (
    <FrostedModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      maxWidthClass={sizeClass}
      contentClassName={size === 'full' ? 'max-h-[95vh]' : 'max-h-[90vh]'}
      zIndexClassName="z-[100]"
    >
      <div className="flex flex-col max-h-[90vh]">
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-white/10"
            style={{
              background: 'rgba(26, 22, 37, 0.35)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {title ? <h2 className="text-xl font-bold text-white">{title}</h2> : <div />}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                }}
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </FrostedModal>
  );
}
