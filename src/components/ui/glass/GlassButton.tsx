import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../../utils/animations';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const reduced = prefersReducedMotion();
  const isDark = true;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: isDark
            ? 'rgba(59, 130, 246, 0.8)'
            : 'rgba(59, 130, 246, 0.9)',
          color: '#FFFFFF',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          hoverGlow: '0 0 20px rgba(59, 130, 246, 0.4)',
        };
      case 'secondary':
        return {
          background: isDark
            ? 'rgba(40, 40, 40, 0.7)'
            : 'rgba(255, 255, 255, 0.7)',
          color: isDark ? '#FFFFFF' : '#000000',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          hoverGlow: '0 0 15px rgba(0, 0, 0, 0.1)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          border: '1px solid transparent',
          hoverGlow: 'none',
        };
      case 'danger':
        return {
          background: 'rgba(239, 68, 68, 0.8)',
          color: '#FFFFFF',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          hoverGlow: '0 0 20px rgba(239, 68, 68, 0.4)',
        };
      default:
        return {
          background: isDark
            ? 'rgba(40, 40, 40, 0.7)'
            : 'rgba(255, 255, 255, 0.7)',
          color: isDark ? '#FFFFFF' : '#000000',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          hoverGlow: 'none',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <motion.button
      whileHover={reduced || disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduced || disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
        fullWidth ? 'w-full' : ''
      } ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      style={{
        background: disabled
          ? isDark
            ? 'rgba(40, 40, 40, 0.3)'
            : 'rgba(255, 255, 255, 0.3)'
          : variantStyles.background,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: variantStyles.border,
        color: disabled
          ? isDark
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(0, 0, 0, 0.3)'
          : variantStyles.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !reduced) {
          e.currentTarget.style.boxShadow = variantStyles.hoverGlow;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </motion.button>
  );
}

