import React from 'react';
import { motion } from 'framer-motion';

export type StatusType = 'valid' | 'expiring' | 'urgent' | 'expired';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

const statusStyles: Record<StatusType, { bg: string; border: string; text: string; animation?: string }> = {
  valid: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
  },
  expiring: {
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    text: 'text-orange-500',
    animation: 'pulse',
  },
  urgent: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    text: 'text-red-500',
    animation: 'pulse-strong',
  },
  expired: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-500 font-bold',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  const styles = statusStyles[status];

  const shouldAnimate = status === 'expiring' || status === 'urgent';

  const pulseAnimation = status === 'urgent'
    ? {
        scale: [1, 1.05, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    : {
        scale: [1, 1.02, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };

  const badgeClasses = `
    inline-flex items-center justify-center
    px-3 py-1.5
    rounded-full
    text-xs md:text-sm font-bold
    border
    ${styles.bg}
    ${styles.border}
    ${styles.text}
    ${className}
  `;

  if (shouldAnimate) {
    return (
      <motion.span
        className={badgeClasses}
        animate={pulseAnimation}
      >
        {label}
      </motion.span>
    );
  }

  return (
    <span className={badgeClasses}>
      {label}
    </span>
  );
};
