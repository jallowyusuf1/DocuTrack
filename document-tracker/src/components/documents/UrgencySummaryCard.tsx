import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { animateCount } from '../../utils/animations';

interface UrgencySummaryCardProps {
  count: number;
  label: string;
  icon: ComponentType<LucideProps>;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

export default function UrgencySummaryCard({
  count,
  label,
  icon: Icon,
  bgColor: _bgColor,
  textColor,
  iconColor,
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
      className="rounded-2xl p-4 md:p-6 min-h-[100px] md:min-h-[140px] flex flex-col justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})`,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${gradientColors.border}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px ${gradientColors.glow}`,
      }}
    >
      {/* Tiled Glass Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 pr-14 md:pr-16">
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

      {/* Icon */}
      <Icon 
        className={`w-[44px] h-[44px] md:w-[52px] md:h-[52px] ${iconColor} absolute top-4 right-4 opacity-80`}
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
        }}
      />
    </motion.div>
  );
}

