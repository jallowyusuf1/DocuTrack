import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeInUp, float, getTransition, transitions } from '../../utils/animations';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={getTransition(transitions.medium)}
      className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}
    >
      <motion.div
        animate="animate"
        variants={float}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-12 h-12 text-gray-400 mb-4 flex items-center justify-center"
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}

