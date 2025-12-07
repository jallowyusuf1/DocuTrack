import type { Variants } from 'framer-motion';

// Transition type definition (not exported from framer-motion)
// Compatible with Framer Motion's internal Transition type
export type Transition = {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: 'tween' | 'spring' | 'inertia' | 'keyframes';
  stiffness?: number;
  damping?: number;
  mass?: number;
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  repeatDelay?: number;
} | {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  repeatDelay?: number;
};

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get transition with reduced motion support
export const getTransition = (defaultTransition: Transition): any => {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return defaultTransition;
};

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Slide animations
export const slideUp: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
};

export const slideDown: Variants = {
  initial: { y: '-100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '-100%', opacity: 0 },
};

export const slideLeft: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
};

export const slideRight: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

// Scale animations
export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export const scaleInCenter: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

// Bottom sheet animation
export const bottomSheet: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

// List stagger animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Pulse animation
export const pulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
  },
};

// Shake animation
export const shake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
  normal: {
    x: 0,
  },
};

// Float animation
export const float: Variants = {
  animate: {
    y: [0, -10, 0],
  },
};

// Rotate animation
export const rotate: Variants = {
  animate: {
    rotate: 360,
  },
};

// Default transitions
export const transitions = {
  fast: { duration: 0.15, ease: 'easeOut' },
  medium: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring' as const, damping: 30, stiffness: 300 },
  springBounce: { type: 'spring' as const, damping: 20, stiffness: 300 },
};

// Haptic feedback utility
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[type]);
  }
};

// Number counter animation helper
export const animateCount = async (
  from: number,
  to: number,
  onUpdate: (value: number) => void,
  duration: number = 1
) => {
  const { animate } = await import('framer-motion');
  const controls = animate(from, to, {
    duration,
    ease: 'easeOut',
    onUpdate: (value) => {
      onUpdate(Math.round(value));
    },
  });
  return controls;
};

