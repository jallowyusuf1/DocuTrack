import React, { useEffect } from 'react';

interface DesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  preventBackdropClose?: boolean;
}

export const DesktopModal: React.FC<DesktopModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  preventBackdropClose = false,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventBackdropClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventBackdropClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center desktop-modal-backdrop"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(30px)',
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventBackdropClose) {
          onClose();
        }
      }}
    >
      <div
        className={`desktop-modal-content ${className}`}
        style={{
          borderRadius: '28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'modalScaleIn 0.3s ease-out',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .desktop-modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .desktop-modal-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .desktop-modal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .desktop-modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};
