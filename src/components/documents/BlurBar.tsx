import { motion } from 'framer-motion';

interface BlurBarProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function BlurBar({ 
  width = '70%', 
  height = '16px',
  className = '' 
}: BlurBarProps) {
  return (
    <div
      className={`rounded-lg relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, rgba(107, 102, 126, 0.3) 0%, rgba(107, 102, 126, 0.5) 50%, rgba(107, 102, 126, 0.3) 100%)',
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(167, 139, 250, 0.3) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
