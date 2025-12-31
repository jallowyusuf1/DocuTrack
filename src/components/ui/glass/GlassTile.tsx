import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../../utils/animations';

interface GlassTileProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  style?: React.CSSProperties;
}

export default function GlassTile({
  children,
  className = '',
  onClick,
  interactive = false,
  style,
}: GlassTileProps) {
  const reduced = prefersReducedMotion();
  const isDark = true;

  const baseStyle: React.CSSProperties = {
    background: isDark
      ? 'rgba(40, 40, 40, 0.5)'
      : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    ...style,
  };

  const Component = interactive || onClick ? motion.div : 'div';

  const props = interactive || onClick
    ? {
        whileHover: reduced ? undefined : { y: -2, scale: 1.01 },
        whileTap: reduced ? undefined : { scale: 0.99 },
        transition: { duration: 0.2 },
        onClick,
        style: { cursor: onClick ? 'pointer' : 'default', ...baseStyle },
      }
    : { style: baseStyle };

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}




