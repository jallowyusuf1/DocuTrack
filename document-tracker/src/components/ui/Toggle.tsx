import { motion } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Toggle({ checked, onChange, disabled = false, className = '' }: ToggleProps) {
  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic('light');
    onChange(!checked);
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`relative w-[52px] h-[32px] rounded-full transition-all duration-300 flex items-center ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      style={{
        background: checked
          ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
          : 'rgba(107, 102, 126, 0.3)',
        boxShadow: checked
          ? '0 0 16px rgba(139, 92, 246, 0.6)'
          : 'none',
      }}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      aria-label={checked ? 'Enabled' : 'Disabled'}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        className="w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center"
        animate={{
          x: checked ? 20 : 2,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      />
    </motion.button>
  );
}
