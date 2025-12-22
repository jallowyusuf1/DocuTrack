import { motion } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';
import DesktopNotifications from '../../pages/notifications/DesktopNotifications';
import FrostedModal from '../ui/FrostedModal';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousPath?: string;
}

export default function NotificationsModal({ isOpen, onClose, previousPath }: NotificationsModalProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  const handleBackClick = () => {
    triggerHaptic('medium');
    handleClose();
    if (previousPath && previousPath !== '/notifications') {
      navigate(previousPath);
    }
  };

  return (
    <FrostedModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidthClass="max-w-2xl"
      contentClassName="h-[60vh]"
      zIndexClassName="z-[101]"
      showTiledGlass
      backdropStyle={{
        // Strong blur + darker veil so underlying text is never readable.
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(34px)',
        WebkitBackdropFilter: 'blur(34px)',
      }}
      surfaceStyle={{
        // Transparent glass surface so the blurred background shows through.
        background: 'rgba(255, 255, 255, 0.045)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
      }}
    >
      <div className="flex flex-col h-[60vh]">
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-5 py-3.5 flex items-center justify-between"
          style={{
            background: 'rgba(26, 22, 37, 0.40)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {previousPath && previousPath !== '/notifications' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackClick}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.90)',
                }}
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
            <div className="min-w-0">
              <div className="text-white font-bold text-xl truncate">Notifications</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              color: 'rgba(255, 255, 255, 0.75)',
            }}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <DesktopNotifications onNotificationClick={handleClose} variant="modal" />
        </div>
      </div>
    </FrostedModal>
  );
}
