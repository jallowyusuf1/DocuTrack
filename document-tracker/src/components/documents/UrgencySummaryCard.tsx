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
  bgColor,
  textColor,
  iconColor,
}: UrgencySummaryCardProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    animateCount(0, count, setDisplayCount, 0.8);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      className={`${bgColor} rounded-xl p-4 h-20 flex flex-col justify-between relative`}
    >
      <Icon className={`w-4 h-4 ${iconColor} absolute top-3 right-3`} />
      <div>
        <p className={`text-3xl font-bold ${textColor} mb-1`}>{displayCount}</p>
        <p className={`text-xs font-medium ${textColor}`}>{label}</p>
      </div>
    </motion.div>
  );
}

