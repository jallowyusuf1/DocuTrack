import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  id,
}: CheckboxProps) {
  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic('light');
    onChange(!checked);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          background: checked
            ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
            : 'rgba(35, 29, 51, 0.6)',
          border: checked
            ? 'none'
            : '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: checked
            ? '0 0 16px rgba(139, 92, 246, 0.6)'
            : 'none',
        }}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
        aria-checked={checked}
        role="checkbox"
        id={id}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm cursor-pointer select-none ${
            disabled ? 'opacity-50' : ''
          }`}
          style={{ color: '#FFFFFF' }}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {label}
        </label>
      )}
    </div>
  );
}
