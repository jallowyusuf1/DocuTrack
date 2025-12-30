import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { getGlassButtonStyle } from '../../utils/glassStyles';
import { prefersReducedMotion } from '../../utils/animations';

interface GlassButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { padding: '8px 16px', fontSize: '14px', height: '36px' },
  md: { padding: '12px 24px', fontSize: '16px', height: '44px' },
  lg: { padding: '16px 32px', fontSize: '18px', height: '52px' },
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      variant = 'primary',
      className = '',
      fullWidth = false,
      size = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    const reduced = prefersReducedMotion();
    const baseStyle = getGlassButtonStyle(variant);
    const sizeStyle = sizeMap[size];

    return (
      <motion.button
        ref={ref}
        className={className}
        disabled={disabled}
        style={{
          ...baseStyle,
          ...sizeStyle,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        whileHover={!reduced && !disabled ? { y: -2 } : undefined}
        whileTap={!reduced && !disabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
