import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { animateCount } from '../../utils/animations';

interface UrgencySummaryCardProps {
  count: number;
  label: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

export default function UrgencySummaryCard({
  count,
  label,
  bgColor: _bgColor,
  textColor,
  iconColor: _iconColor,
}: UrgencySummaryCardProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    animateCount(0, count, setDisplayCount, 0.8);
  }, [count]);

  // Map urgency to distinct card styles with proper contrast
  const getCardStyle = () => {
    if (label === 'URGENT') {
      return {
        bg: 'bg-gradient-to-br from-red-500/30 to-red-600/20',
        border: 'border border-red-500/40',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
      };
    } else if (label === 'SOON') {
      return {
        bg: 'bg-gradient-to-br from-orange-500/30 to-orange-600/20',
        border: 'border border-orange-500/40',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/20',
        border: 'border border-yellow-500/40',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]'
      };
    }
  };

  const cardStyle = getCardStyle();

  // Get urgency-specific gradient colors
  const getGradientColors = () => {
    if (label === 'URGENT') {
      return {
        from: 'rgba(239, 68, 68, 0.3)',
        to: 'rgba(220, 38, 38, 0.2)',
        border: 'rgba(239, 68, 68, 0.4)',
        glow: 'rgba(239, 68, 68, 0.3)',
      };
    } else if (label === 'SOON') {
      return {
        from: 'rgba(249, 115, 22, 0.3)',
        to: 'rgba(234, 88, 12, 0.2)',
        border: 'rgba(249, 115, 22, 0.4)',
        glow: 'rgba(249, 115, 22, 0.3)',
      };
    } else {
      return {
        from: 'rgba(234, 179, 8, 0.3)',
        to: 'rgba(202, 138, 4, 0.2)',
        border: 'rgba(234, 179, 8, 0.4)',
        glow: 'rgba(234, 179, 8, 0.3)',
      };
    }
  };

  const gradientColors = getGradientColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="rounded-2xl p-3 md:p-4 min-h-[85px] md:min-h-[110px] flex flex-col justify-center relative overflow-hidden cursor-pointer"
      style={{
        background: `rgba(42, 38, 64, 0.45)`,
        backdropFilter: 'blur(40px) saturate(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        border: `1px solid ${gradientColors.border}`,
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
      }}
    >
      {/* Frosted overlay - matte, not shiny */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          background: `radial-gradient(circle at top left, ${gradientColors.from}, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <p
          className={`text-[32px] md:text-[40px] font-bold ${textColor} leading-none mb-1 md:mb-1.5`}
          style={{
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          {displayCount}
        </p>
        <p
          className={`text-[9px] md:text-[10px] font-bold ${textColor} uppercase tracking-wider leading-tight`}
          style={{
            fontFamily: 'SF Pro Text, -apple-system, sans-serif',
            letterSpacing: '0.06px',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          {label}
        </p>
      </div>
    </motion.div>
  );
}

