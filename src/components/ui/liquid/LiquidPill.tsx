import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../../utils/animations';

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export type LiquidPillTone = 'clear' | 'milky';

export type LiquidPillProps = Omit<ComponentPropsWithoutRef<typeof motion.div>, 'children'> & {
  children: ReactNode;
  tone?: LiquidPillTone;
  interactive?: boolean;
  glowColor?: string; // sets --glow-color
};

export const LiquidPill = forwardRef<
  HTMLDivElement,
  LiquidPillProps
>(function LiquidPill(
  { children, className, style, tone = 'clear', interactive = false, glowColor, ...rest },
  ref
) {
  const reduced = prefersReducedMotion();

  return (
    <motion.div
      ref={ref}
      {...rest}
      className={cn(
        'liquid-pill',
        tone === 'milky' && 'liquid-pill--milky',
        glowColor && 'liquid-glow',
        interactive && 'cursor-pointer',
        className
      )}
      style={{
        ...(glowColor ? ({ ['--glow-color' as any]: glowColor } as any) : null),
        ...(style as CSSProperties | undefined),
      }}
      whileHover={interactive && !reduced ? { y: -2, scale: 1.008 } : undefined}
      whileTap={interactive && !reduced ? { scale: 0.992 } : undefined}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative">{children}</div>
    </motion.div>
  );
});

LiquidPill.displayName = 'LiquidPill';

export function LiquidPillMedia({
  className,
  style,
  children,
  glowColor,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  glowColor?: string;
}) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-[22px]', className)}
      style={{
        // Clear glass (avoid milky white panels)
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        boxShadow: glowColor
          ? `0 18px 50px rgba(0,0,0,0.45), 0 0 48px ${glowColor}33, inset 0 1px 0 rgba(255,255,255,0.16)`
          : '0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16)',
        ...style,
      }}
    >
      {/* Specular highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(320px 220px at 18% 10%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 60%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function LiquidGlowDot({
  color,
  className,
  size = 10,
  pulse = true,
}: {
  color: string;
  className?: string;
  size?: number;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn('inline-block rounded-full', pulse && 'liquid-glow-dot', className)}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${Math.round(size * 1.4)}px ${color}CC, 0 0 ${Math.round(size * 3.0)}px ${color}66`,
      }}
    />
  );
}


