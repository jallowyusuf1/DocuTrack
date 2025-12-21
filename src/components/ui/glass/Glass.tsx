import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../../utils/animations';

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export const GlassBackgroundGrid = ({ opacity = 0.12 }: { opacity?: number }) => (
  <div
    aria-hidden="true"
    className="absolute inset-0 pointer-events-none"
    style={{
      opacity,
      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      maskImage: 'radial-gradient(circle at 50% 20%, black 0%, transparent 70%)',
      WebkitMaskImage: 'radial-gradient(circle at 50% 20%, black 0%, transparent 70%)',
    }}
  />
);

export const GlassCard = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    elevated?: boolean;
  }
>(function GlassCard({ children, className, style, elevated }, ref) {
  return (
    <div
      ref={ref}
      className={cn(elevated ? 'glass-card-elevated' : 'glass-card', className)}
      style={style}
    >
      {children}
    </div>
  );
});

export const GlassTile = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    interactive?: boolean;
  }
>(function GlassTile({ children, className, style, interactive }, ref) {
  const reduced = prefersReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={cn('glass-card-subtle', interactive && 'cursor-pointer', className)}
      style={style}
      whileHover={interactive && !reduced ? { y: -4, scale: 1.01 } : undefined}
      whileTap={interactive && !reduced ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
});

export function GlassPill({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs md:text-sm',
        className
      )}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function GlassButton({
  children,
  className,
  style,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}) {
  const reduced = prefersReducedMotion();
  const base =
    variant === 'primary'
      ? 'glass-btn-primary'
      : variant === 'secondary'
        ? 'glass-btn-secondary'
        : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'btn',
        'h-12 md:h-12 rounded-xl px-5 md:px-6',
        'inline-flex items-center justify-center gap-2',
        'text-sm md:text-base',
        base,
        variant === 'ghost' && 'text-white/80 hover:text-white',
        className
      )}
      style={{
        ...(variant === 'ghost'
          ? {
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)',
            }
          : null),
        ...style,
      }}
      whileHover={!reduced && !disabled ? { y: -2 } : undefined}
      whileTap={!reduced && !disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.button>
  );
}

