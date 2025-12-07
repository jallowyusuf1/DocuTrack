interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
  className?: string;
}

import { motion } from 'framer-motion';
import { fadeIn } from '../../utils/animations';

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = true,
  className = '',
}: SkeletonProps) {
  const baseStyles = 'bg-white/10';
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const animationStyle = animation ? 'glass-shimmer' : '';

  const style: React.CSSProperties = {};
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={{ duration: 0.2 }}
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyle} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
