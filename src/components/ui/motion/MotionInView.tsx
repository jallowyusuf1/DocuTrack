import { useMemo, useRef, type ReactNode } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { prefersReducedMotion } from '../../../utils/animations';

type RevealPreset = 'fadeUp' | 'fadeIn' | 'scaleIn';

const presetVariants: Record<RevealPreset, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  },
  fadeIn: {
    hidden: { opacity: 0, filter: 'blur(6px)' },
    show: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6 } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

export function MotionInView({
  children,
  className,
  style,
  delay = 0,
  once = true,
  amount = 0.25,
  preset = 'fadeUp',
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  once?: boolean;
  amount?: number;
  preset?: RevealPreset;
  as?: 'div' | 'section' | 'header' | 'footer' | 'main';
}) {
  const reduced = prefersReducedMotion();
  const Comp = (motion as any)[as] ?? motion.div;
  const variants = useMemo(() => {
    if (reduced) return presetVariants.fadeIn;
    const base = presetVariants[preset];
    // Inject delay without mutating base variants
    return {
      hidden: base.hidden,
      show: { ...(base.show as any), transition: { ...(base.show as any).transition, delay } },
    } satisfies Variants;
  }, [delay, preset, reduced]);

  const ref = useRef<HTMLElement | null>(null);
  const visible = useInView(ref, { once, amount });

  return (
    <Comp
      // @ts-expect-error - framer-motion ref typing differs across versions
      ref={ref}
      initial="hidden"
      animate={visible ? 'show' : 'hidden'}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </Comp>
  );
}

