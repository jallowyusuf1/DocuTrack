import React from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from '../glass/GlassButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📄',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] p-8 ${className}`}>
      <div className="max-w-md w-full">
        <div className="
          bg-white/80 dark:bg-zinc-900/80
          backdrop-blur-[40px] backdrop-saturate-[130%]
          border border-black/8 dark:border-white/12
          rounded-3xl
          shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6)]
          p-8 md:p-12
          text-center
        ">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl mb-6 opacity-30"
          >
            {icon}
          </motion.div>

          <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            {title}
          </h3>

          <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>

          {actionLabel && onAction && (
            <GlassButton
              onClick={onAction}
              variant="primary"
              className="w-full md:w-auto px-8"
            >
              {actionLabel}
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
};
