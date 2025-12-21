import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = true 
}: SkeletonProps) {
  const baseStyles: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(42, 38, 64, 0.6) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(42, 38, 64, 0.6) 100%)',
    backgroundSize: '200% 100%',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '12px',
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'text' ? '16px' : '20px'),
    position: 'relative',
    overflow: 'hidden',
    animation: animation ? 'skeleton-shimmer 1.5s infinite' : 'none',
  };

  return (
    <>
      <div style={baseStyles} className={className} aria-label="Loading..." role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <style>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
}
