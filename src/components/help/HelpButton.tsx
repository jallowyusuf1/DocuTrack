import { HelpCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';

interface HelpButtonProps {
  onClick: () => void;
  variant?: 'question' | 'chat';
}

export default function HelpButton({ onClick, variant = 'question' }: HelpButtonProps) {
  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open help and support"
    >
      {variant === 'question' ? (
        <HelpCircle className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </motion.button>
  );
}

