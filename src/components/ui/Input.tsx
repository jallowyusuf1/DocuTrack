import { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { shake, fadeInDown } from '../../utils/animations';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, required, type, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    // Combine refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);

    useEffect(() => {
      if (inputRef.current) {
        setHasValue(!!inputRef.current.value);
      }
    }, [props.value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    return (
      <motion.div
        className="w-full"
        animate={error ? 'shake' : 'normal'}
        variants={shake}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <motion.label
            initial={false}
            animate={{
              y: isFocused || hasValue ? -4 : 0,
              scale: isFocused || hasValue ? 0.9 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="block text-sm font-semibold text-white mb-3 mt-1"
            style={{ color: '#FFFFFF' }}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}
        <div className="relative">
          {icon && (
            <motion.div
              animate={{
                color: isFocused ? '#2563EB' : '#9ca3af',
              }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            >
              {icon}
            </motion.div>
          )}
          <motion.input
            ref={inputRef}
            type={inputType}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              w-full h-[52px] px-4 rounded-xl
              text-[15px]
              ${icon ? 'pl-11' : ''}
              ${isPassword ? 'pr-11' : ''}
              ${error
                ? 'border-2 border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
              }
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            style={{
              background: '#FFFFFF',
              color: '#000000',
              boxShadow: isFocused && !error
                ? '0 0 0 3px rgba(37, 99, 235, 0.3)'
                : '0 0 0 0px rgba(37, 99, 235, 0)',
            }}
            placeholder={props.placeholder}
            transition={{ duration: 0.2 }}
            {...props}
          />
          {isPassword && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-glass-secondary hover:text-white active:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </motion.button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeInDown}
              transition={{ duration: 0.2 }}
              className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-400"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
