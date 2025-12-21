import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedClockProps {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function AnimatedClock({ className = '', isActive = false, onClick }: AnimatedClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Update time every second for real-time clock
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isActive]);

  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  // Calculate angles for real clock movement
  const secondAngle = seconds * 6; // 6 degrees per second
  const minuteAngle = (minutes * 6) + (seconds * 0.1); // 6 degrees per minute, 0.1 per second
  const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour, 0.5 per minute

  // For animation: long hand (minute) completes full rotation, then short hand (hour) moves
  const animatedMinuteAngle = isAnimating 
    ? minuteAngle + 360
    : minuteAngle;
  
  const animatedHourAngle = isAnimating
    ? hourAngle + 30 // Move 30 degrees (1 hour) when minute hand completes
    : hourAngle;

  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
    >
      {/* Clock circle - outer border */}
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      {/* Clock face circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Hour markers - all 12 hours */}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour, index) => {
        const angle = (hour * 30 - 90) * (Math.PI / 180); // Convert to radians, offset by -90 for 12 o'clock
        const isMajor = hour % 3 === 0; // 12, 3, 6, 9 are major markers
        const outerRadius = 10;
        const innerRadius = isMajor ? 9 : 9.5;
        const x1 = 12 + outerRadius * Math.cos(angle);
        const y1 = 12 + outerRadius * Math.sin(angle);
        const x2 = 12 + innerRadius * Math.cos(angle);
        const y2 = 12 + innerRadius * Math.sin(angle);
        
        return (
          <line
            key={hour}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={isMajor ? 1.5 : 1}
            strokeLinecap="round"
            opacity={isMajor ? 0.8 : 0.5}
          />
        );
      })}

      {/* Hour hand (short hand) - thicker, shorter */}
      <motion.g
        animate={{
          rotate: animatedHourAngle,
        }}
        transition={{
          duration: isAnimating ? 0.5 : 0,
          ease: 'easeInOut',
          delay: isAnimating ? 4 : 0, // Start after minute hand completes
          repeat: isAnimating ? Infinity : 0,
        }}
        style={{ 
          transformOrigin: '12px 12px',
        }}
      >
        {/* Real clock hour hand - straight line, thicker */}
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Minute hand (long hand) - thinner, longer */}
      <motion.g
        animate={{
          rotate: animatedMinuteAngle,
        }}
        transition={{
          duration: isAnimating ? 4 : 0,
          ease: 'linear',
          repeat: isAnimating ? Infinity : 0,
        }}
        style={{ 
          transformOrigin: '12px 12px',
        }}
      >
        {/* Real clock minute hand - straight line, thinner */}
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Second hand (optional, for real clock feel) - very thin, long */}
      {!isAnimating && (
        <motion.g
          animate={{
            rotate: secondAngle,
          }}
          transition={{
            duration: 1,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{ 
            transformOrigin: '12px 12px',
          }}
        >
          <line
            x1="12"
            y1="12"
            x2="12"
            y2="3.5"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.7"
          />
        </motion.g>
      )}

      {/* Center dot - larger for realism */}
      <circle
        cx="12"
        cy="12"
        r="2"
        fill="currentColor"
      />
      <circle
        cx="12"
        cy="12"
        r="1"
        fill="rgba(0, 0, 0, 0.3)"
      />
    </motion.svg>
  );
}
