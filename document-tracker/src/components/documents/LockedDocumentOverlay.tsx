import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface LockedDocumentOverlayProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function LockedDocumentOverlay({ 
  showLabel = true, 
  size = 'medium' 
}: LockedDocumentOverlayProps) {
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const labelSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <>
      {/* Lock Indicator (Top-Right) */}
      <motion.div
        initial={{ scale: 0 }}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(239, 68, 68, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.6)',
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Lock className={`${iconSizes.medium} text-white`} />
      </motion.div>

      {/* Locked Label (Center) */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div
            className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Lock className="w-12 h-12 text-white" style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))' }} />
            <span className={`${labelSizes.medium} font-bold text-white uppercase`}>LOCKED</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
