import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0 }}
          animate={{
            scale: 1,
            boxShadow: [
              '0 5px 15px rgba(139, 92, 246, 0.4)',
              '0 5px 25px rgba(139, 92, 246, 0.6)',
              '0 5px 15px rgba(139, 92, 246, 0.4)',
            ],
          }}
          transition={{
            scale: { type: 'spring', damping: 20, stiffness: 300 },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        triggerHaptic('medium');
        onClick();
      }}
      className="
        fixed bottom-[100px] right-5 md:right-6 z-40
        w-14 h-14 md:w-16 md:h-16 rounded-full
        bg-gradient-to-br from-purple-600 to-purple-700
        text-white
        flex items-center justify-center
        touch-manipulation
        select-none
      "
      style={{
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.6)',
      }}
      aria-label="Add Document"
    >
      <Plus className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
    </motion.button>
  );
}

