import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

interface AnimatedStatsProps {
  stats: Stat[];
}

export default function AnimatedStats({ stats }: AnimatedStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
      {stats.map((stat, index) => (
        <StatCounter key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
}

function StatCounter({ stat, index }: { stat: Stat; index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = stat.value / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(stepValue * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="mb-2">
        <motion.span
          className="text-4xl lg:text-5xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {stat.prefix}
          {count.toLocaleString()}
          {stat.suffix}
        </motion.span>
      </div>
      <p className="text-sm lg:text-base" style={{ color: '#C7C3D9' }}>
        {stat.label}
      </p>
    </motion.div>
  );
}
