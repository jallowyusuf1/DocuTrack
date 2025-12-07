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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={`${cardStyle.bg} ${cardStyle.border} ${cardStyle.glow} backdrop-blur-md rounded-2xl p-4 min-h-[100px] flex flex-col justify-center relative`}
    >
      <Icon className={`w-4 h-4 ${iconColor} absolute top-2.5 right-2.5 opacity-80`} />
      <div className="pr-5">
        <p className={`text-3xl font-bold ${textColor} leading-none mb-1`}>{displayCount}</p>
        <p className={`text-[9px] font-bold ${textColor} uppercase tracking-wider leading-tight`}>{label}</p>
      </div>
    </motion.div>
  );
}

