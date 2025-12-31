import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassListItemProps {
  onClick?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  className?: string;
  children: ReactNode;
  animate?: boolean;
  delay?: number;
}

export const GlassListItem: React.FC<GlassListItemProps> = ({
  onClick,
  onLongPress,
  selected = false,
  className = '',
  children,
  animate = true,
  delay = 0,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    setIsPressed(true);
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchStart = () => {
    setIsPressed(true);
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const baseClasses = `
    relative
    bg-white/80 dark:bg-zinc-900/80
    backdrop-blur-[40px] backdrop-saturate-[130%]
    border border-black/8 dark:border-white/12
    rounded-2xl
    shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6)]
    p-4 md:p-5 lg:p-6
    mb-3
    transition-all duration-300 ease-in-out
    cursor-pointer
    hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.8)]
    active:scale-[0.98]
    ${selected ? 'bg-blue-500/10 border-blue-500/30' : ''}
    ${className}
  `;

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  if (animate) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className={baseClasses}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        whileHover={{ y: -2 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </div>
  );
};
