import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: 'blue' | 'gray' | 'red';
  onClick: () => void;
}

interface SwipeableListItemProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

const actionColors = {
  blue: {
    bg: 'bg-blue-500',
    text: 'text-white',
    hover: 'hover:bg-blue-600',
  },
  gray: {
    bg: 'bg-gray-500',
    text: 'text-white',
    hover: 'hover:bg-gray-600',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-white',
    hover: 'hover:bg-red-600',
  },
};

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}) => {
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;
  const ACTION_WIDTH = 80;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeActions();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const closeActions = () => {
    controls.start({ x: 0 });
    setIsOpen(null);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;

    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Swipe left (show right actions)
    if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      if (rightActions.length > 0) {
        const targetX = -rightActions.length * ACTION_WIDTH;
        controls.start({ x: targetX });
        setIsOpen('right');
        onSwipeLeft?.();
      } else {
        closeActions();
      }
    }
    // Swipe right (show left actions or quick action)
    else if (offset > SWIPE_THRESHOLD || velocity > 500) {
      if (leftActions.length > 0) {
        const targetX = leftActions.length * ACTION_WIDTH;
        controls.start({ x: targetX });
        setIsOpen('left');
        onSwipeRight?.();
      } else {
        // Quick action on swipe right
        onSwipeRight?.();
        closeActions();
      }
    }
    // Return to center
    else {
      closeActions();
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    closeActions();
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Left actions (revealed on swipe right) */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex">
          {leftActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleActionClick(action)}
              className={`
                w-20
                flex flex-col items-center justify-center gap-1
                ${actionColors[action.color].bg}
                ${actionColors[action.color].text}
                ${actionColors[action.color].hover}
                transition-colors
                border-r border-white/10
              `}
            >
              <div className="text-xl">{action.icon}</div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions (revealed on swipe left) */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex">
          {rightActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleActionClick(action)}
              className={`
                w-20
                flex flex-col items-center justify-center gap-1
                ${actionColors[action.color].bg}
                ${actionColors[action.color].text}
                ${actionColors[action.color].hover}
                transition-colors
                border-l border-white/10
              `}
            >
              <div className="text-xl">{action.icon}</div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: -240, right: 240 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="relative bg-white dark:bg-zinc-900"
      >
        {children}
      </motion.div>
    </div>
  );
};
