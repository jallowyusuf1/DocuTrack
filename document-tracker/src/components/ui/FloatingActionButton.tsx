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
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: [
          '0 5px 15px rgba(37, 99, 235, 0.3)',
          '0 5px 25px rgba(37, 99, 235, 0.5)',
          '0 5px 15px rgba(37, 99, 235, 0.3)',
        ],
      }}
      transition={{
        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        scale: { type: 'spring', damping: 20, stiffness: 300 },
      }}
      onClick={() => {
        triggerHaptic('medium');
        onClick();
      }}
      className="
        fixed bottom-[88px] right-5 z-40
        w-16 h-16 rounded-full
        bg-gradient-to-br from-blue-600 to-blue-700
        text-white shadow-2xl
        flex items-center justify-center
        touch-manipulation
        select-none
      "
      aria-label="Add Document"
    >
      <Plus className="w-8 h-8" strokeWidth={2.5} />
    </motion.button>
  );
}

