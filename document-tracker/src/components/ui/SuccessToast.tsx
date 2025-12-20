import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SuccessToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
  index: number;
}

const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof CheckCircle; color: string; bgColor: string }> = {
  success: {
    icon: CheckCircle,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  error: {
    icon: XCircle,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  info: {
    icon: Info,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  warning: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
};

export default function SuccessToast({ toast, onRemove, index }: SuccessToastProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          onRemove(toast.id);
          return 0;
        }
        return prev - (100 / 400); // 4 seconds = 400 intervals of 10ms
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isHovered, toast.id, onRemove]);

  const config = VARIANT_CONFIG[toast.variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
      style={{
        transform: `translateX(-50%) translateY(${index * 92}px)`,
      }}
    >
      <div
        className="w-[480px] h-20 rounded-2xl flex items-center gap-4 px-6 relative overflow-hidden"
        style={{
          background: 'rgba(26, 22, 37, 0.95)',
          backdropFilter: 'blur(40px)',
          border: `1px solid ${config.color}40`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Icon */}
        <Icon className="w-8 h-8 flex-shrink-0" style={{ color: config.color }} />

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-[19px] font-medium text-white truncate">{toast.message}</p>
        </div>

        {/* Action Button */}
        {toast.action && (
          <button
            onClick={() => {
              triggerHaptic('light');
              toast.action?.onClick();
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: config.color,
              background: config.bgColor,
            }}
          >
            {toast.action.label}
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onRemove(toast.id);
          }}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        {/* Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-1 transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: config.color,
          }}
        />
      </div>
    </motion.div>
  );
}

// Toast Manager Component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const visibleToasts = toasts.slice(0, 3); // Max 3 visible

  return (
    <AnimatePresence>
      {visibleToasts.map((toast, index) => (
        <SuccessToast key={toast.id} toast={toast} onRemove={onRemove} index={index} />
      ))}
    </AnimatePresence>
  );
}
