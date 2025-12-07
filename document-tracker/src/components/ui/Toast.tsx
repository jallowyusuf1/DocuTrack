import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        ${bgColor} text-white
        rounded-lg shadow-2xl
        px-4 py-3 min-w-[280px] max-w-[90vw]
        flex items-center gap-3
        animate-slide-down
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-white/20 active:bg-white/30 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

