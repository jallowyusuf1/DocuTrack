import { motion } from 'framer-motion';
import { getTransition, transitions } from '../../utils/animations';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function ProgressBar({
  progress,
  className = '',
  showLabel = false,
  color = 'primary',
}: ProgressBarProps) {
  const colorStyles = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-orange-600',
    danger: 'bg-red-600',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={getTransition(transitions.medium)}
          className={`h-full ${colorStyles[color]} rounded-full`}
        />
      </div>
    </div>
  );
}

