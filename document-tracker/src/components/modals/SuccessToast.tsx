import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface SuccessToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const variantStyles = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-300',
    iconColor: 'text-green-500',
    progressColor: 'bg-green-500',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-500',
    progressColor: 'bg-red-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-300',
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-800 dark:text-orange-300',
    iconColor: 'text-orange-500',
    progressColor: 'bg-orange-500',
  },
};

const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
  index: number;
}> = ({ toast, onDismiss, index }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 4000;
  const style = variantStyles[toast.variant];
  const Icon = style.icon;

  useEffect(() => {
    if (isPaused) return;

    const interval = 16; // Update every 16ms (~60fps)
    const decrement = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          onDismiss(toast.id);
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.id, onDismiss, duration, isPaused]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 ${style.bgColor} ${style.borderColor} transition-all duration-300 ease-out`}
      style={{
        width: '480px',
        height: '80px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center h-full px-5">
        {/* Icon */}
        <Icon size={32} className={`${style.iconColor} flex-shrink-0`} />

        {/* Message */}
        <p className={`flex-1 mx-4 font-medium ${style.textColor}`} style={{ fontSize: '19px' }}>
          {toast.message}
        </p>

        {/* Action Button */}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${style.textColor} hover:opacity-80`}
          >
            {toast.action.label}
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className={`ml-2 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${style.iconColor}`}
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${style.progressColor} transition-all ease-linear`}
        style={{
          width: `${progress}%`,
          transitionDuration: isPaused ? '0s' : '16ms',
        }}
      />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export const SuccessToast: React.FC<SuccessToastProps> = ({ toasts, onDismiss }) => {
  const visibleToasts = toasts.slice(0, 3); // Max 3 visible

  return (
    <div
      className="fixed z-50 flex flex-col items-center gap-3"
      style={{
        top: '80px', // Below navigation
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {visibleToasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} index={index} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    variant: ToastVariant = 'success',
    options?: {
      action?: { label: string; onClick: () => void };
      duration?: number;
    }
  ) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = {
      id,
      message,
      variant,
      action: options?.action,
      duration: options?.duration,
    };

    setToasts((prev) => [...prev, toast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    dismissToast,
  };
};
