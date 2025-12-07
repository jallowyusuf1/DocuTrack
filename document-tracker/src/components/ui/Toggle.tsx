import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}: ToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      triggerHaptic('light');
      onChange(!checked);
    }
  };

  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {label && (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
          className="sr-only"
          aria-label={label || 'Toggle'}
        />
        <motion.div
          whileTap={disabled ? {} : { scale: 0.95 }}
          className={`
            w-[52px] h-8 rounded-full transition-colors duration-300 ease-in-out
            ${checked ? 'bg-blue-600' : 'bg-gray-300'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={handleToggle}
          role="switch"
          aria-checked={checked}
          aria-label={label || 'Toggle'}
        >
          <motion.div
            initial={false}
            animate={{
              x: checked ? 24 : 0,
              scale: checked ? [1, 1.1, 1] : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            className="
              absolute top-[2px] left-[2px] w-7 h-7 bg-white rounded-full
              shadow-sm flex items-center justify-center
            "
          >
            {checked && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                }}
              >
                <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </label>
  );
}
