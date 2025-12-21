import { motion } from 'framer-motion';
import { useState } from 'react';

interface AnimatedClockIconProps {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function AnimatedClockIcon({ 
  className = '', 
  isActive = false,
  onClick 
}: AnimatedClockIconProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [secondRotation, setSecondRotation] = useState(0);
  const [minuteRotation, setMinuteRotation] = useState(60);
  const [hourRotation, setHourRotation] = useState(-60);

  const handleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Second hand moves first (to 12 o'clock = 0 degrees)
    setSecondRotation(0);
    
    // Minute hand moves second (to 2 o'clock = 60 degrees) - after 350ms
    setTimeout(() => {
      setMinuteRotation(60);
    }, 350);
    
    // Hour hand moves last (to 10 o'clock = -60 degrees) - after 700ms
    setTimeout(() => {
      setHourRotation(-60);
    }, 700);
    
    // Reset animation state after completion
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    
    if (onClick) {
      onClick();
    }
  };

  const color = isActive ? '#A78BFA' : '#C7C3D9';

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Clock face circle */}
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Hour markers - 12 positions */}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => {
        const angle = (hour * 30 - 90) * (Math.PI / 180);
        const isCardinal = hour % 3 === 0;
        const length = isCardinal ? 2.5 : 1.5;
        const x1 = 12 + (10 - length) * Math.cos(angle);
        const y1 = 12 + (10 - length) * Math.sin(angle);
        const x2 = 12 + 10 * Math.cos(angle);
        const y2 = 12 + 10 * Math.sin(angle);
        
        return (
          <line
            key={hour}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={isCardinal ? 2 : 1.5}
            strokeLinecap="round"
          />
        );
      })}
      
      {/* Hour hand (shortest, thickest) - pointing to 10 o'clock = -60 degrees */}
      <motion.g
        animate={{ rotate: hourRotation }}
        style={{ transformOrigin: '12px 12px' }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.7 }}
      >
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="7"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.g>
      
      {/* Minute hand (medium length) - pointing to 2 o'clock = 60 degrees */}
      <motion.g
        animate={{ rotate: minuteRotation }}
        style={{ transformOrigin: '12px 12px' }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.35 }}
      >
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="5"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </motion.g>
      
      {/* Second hand (longest, thinnest) - pointing to 12 o'clock = 0 degrees */}
      <motion.g
        animate={{ rotate: secondRotation }}
        style={{ transformOrigin: '12px 12px' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.g>
      
      {/* Center pivot point */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill={color}
      />
      <circle
        cx="12"
        cy="12"
        r="0.8"
        fill="white"
      />
    </svg>
  );
}
