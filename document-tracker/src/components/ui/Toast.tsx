import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { fadeInDown, getTransition, transitions } from '../../utils/animations';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
  position = 'top',
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-orange-500 text-white',
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = icons[type];
  const positionStyles = position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInDown}
      transition={getTransition(transitions.spring)}
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        ${positionStyles}
        ${typeStyles[type]}
        rounded-lg shadow-2xl
        px-4 py-3 min-w-[280px] max-w-[90vw]
        flex items-center gap-3
      `}
      role="alert"
      aria-live="assertive"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(_e, info) => {
        if (Math.abs(info.offset.y) > 50) {
          onClose();
        }
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="p-1 rounded hover:bg-white/20 active:bg-white/30 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
