import { forwardRef, type CSSProperties, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../../utils/animations';

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

/* ========================================
   MODERN APPLE GLASSMORPHISM COMPONENTS
   iOS 18 / macOS 15 Style
   ======================================== */

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
              background: 'var(--glass-bg-medium)',
              border: '1px solid var(--glass-border-subtle)',
              backdropFilter: `blur(var(--glass-blur-light)) saturate(var(--glass-saturation))`,
              WebkitBackdropFilter: `blur(var(--glass-blur-light)) saturate(var(--glass-saturation))`,
              boxShadow: 'var(--shadow-glass-sm), inset 0 1px 0 var(--glass-highlight-subtle)',
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

/* ========================================
   ENHANCED GLASS COMPONENTS
   ======================================== */

// Glass Input Field
export const GlassInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    className?: string;
    error?: boolean;
  }
>(function GlassInput({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn('glass-input', error && 'glass-input-error', className)}
      {...props}
    />
  );
});

// Glass Textarea
export const GlassTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    className?: string;
    error?: boolean;
  }
>(function GlassTextarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn('glass-input', error && 'glass-input-error', className)}
      style={{
        minHeight: '100px',
        resize: 'vertical',
      }}
      {...props}
    />
  );
});

// Glass Select/Dropdown
export const GlassSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    className?: string;
    error?: boolean;
  }
>(function GlassSelect({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn('glass-input', error && 'glass-input-error', className)}
      {...props}
    >
      {children}
    </select>
  );
});

// Glass Modal/Dialog Container
export const GlassModal = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(function GlassModal({ children, className, style, size = 'md' }, ref) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      ref={ref}
      className={cn('glass-modal', sizeClasses[size], className)}
      style={style}
    >
      {children}
    </div>
  );
});

// Glass Badge/Tag
export function GlassBadge({
  children,
  className,
  style,
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}) {
  const variantStyles: Record<typeof variant, CSSProperties> = {
    default: {
      background: 'var(--glass-bg-strong)',
      border: '1px solid var(--glass-border-light)',
    },
    success: {
      background: 'rgba(34, 197, 94, 0.15)',
      border: '1px solid rgba(34, 197, 94, 0.30)',
      color: 'rgba(134, 239, 172, 0.95)',
    },
    warning: {
      background: 'rgba(251, 191, 36, 0.15)',
      border: '1px solid rgba(251, 191, 36, 0.30)',
      color: 'rgba(253, 224, 71, 0.95)',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.30)',
      color: 'rgba(252, 165, 165, 0.95)',
    },
    info: {
      background: 'rgba(59, 130, 246, 0.15)',
      border: '1px solid rgba(59, 130, 246, 0.30)',
      color: 'rgba(147, 197, 253, 0.95)',
    },
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        className
      )}
      style={{
        backdropFilter: `blur(var(--glass-blur-light))`,
        WebkitBackdropFilter: `blur(var(--glass-blur-light))`,
        boxShadow: 'inset 0 1px 0 var(--glass-highlight-subtle)',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Glass Divider
export function GlassDivider({
  className,
  style,
  label,
}: {
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4 my-4', className)} style={style}>
        <div
          className="h-px flex-1"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--glass-border-light) 30%, var(--glass-border-medium) 55%, var(--glass-border-light) 80%, transparent 100%)',
          }}
        />
        <span
          className="text-white/70 text-xs md:text-sm px-3 py-1.5 rounded-full"
          style={{
            background: 'var(--glass-bg-medium)',
            border: '1px solid var(--glass-border-light)',
            backdropFilter: `blur(var(--glass-blur-light))`,
            WebkitBackdropFilter: `blur(var(--glass-blur-light))`,
          }}
        >
          {label}
        </span>
        <div
          className="h-px flex-1"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--glass-border-light) 20%, var(--glass-border-medium) 45%, var(--glass-border-light) 70%, transparent 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn('h-px my-4', className)}
      style={{
        background: 'var(--glass-border-light)',
        ...style,
      }}
    />
  );
}

// Glass Tooltip Container
export const GlassTooltip = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
  }
>(function GlassTooltip({ children, className, style }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'px-3 py-2 rounded-xl text-xs font-medium text-white/90',
        className
      )}
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: `blur(var(--glass-blur-medium)) saturate(var(--glass-saturation))`,
        WebkitBackdropFilter: `blur(var(--glass-blur-medium)) saturate(var(--glass-saturation))`,
        border: '1px solid var(--glass-border-strong)',
        boxShadow: 'var(--shadow-glass-md), inset 0 1px 0 var(--glass-highlight-light)',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

// Glass Progress Bar
export function GlassProgressBar({
  progress,
  className,
  style,
  showLabel = false,
}: {
  progress: number; // 0-100
  className?: string;
  style?: CSSProperties;
  showLabel?: boolean;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('relative', className)} style={style}>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{
          background: 'var(--glass-bg-strong)',
          border: '1px solid var(--glass-border-subtle)',
          backdropFilter: `blur(var(--glass-blur-light))`,
          WebkitBackdropFilter: `blur(var(--glass-blur-light))`,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${clampedProgress}%`,
            background: 'linear-gradient(90deg, var(--accent-blue-start) 0%, var(--accent-blue-end) 100%)',
            boxShadow: '0 0 12px rgba(37, 99, 235, 0.6)',
          }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 top-0 -translate-y-5 text-xs text-white/70 font-medium tabular-nums">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}

