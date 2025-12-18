import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { celebrateSuccess } from '../../utils/animations';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({ 
  message, 
  onClose, 
  duration = 3000 
}: SuccessToastProps) {
  React.useEffect(() => {
    celebrateSuccess();
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(16, 185, 129, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
          width: '340px',
          height: '60px',
        }}
        data-tablet-toast="true"
        role="status"
        aria-live="polite"
      >
        <style>{`
          @media (min-width: 768px) {
            [data-tablet-toast="true"] {
              width: 420px !important;
              height: 72px !important;
            }
          }
        `}</style>
        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0" data-tablet-toast-icon="true" />
        <style>{`
          @media (min-width: 768px) {
            [data-tablet-toast-icon="true"] {
              width: 24px !important;
              height: 24px !important;
            }
          }
        `}</style>
        <span className="text-white font-medium text-[15px] md:text-[17px]">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}

