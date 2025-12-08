import { motion } from 'framer-motion';
import { float } from '../../utils/animations';
import Button from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        animate="animate"
        variants={float}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-30 h-30 rounded-full flex items-center justify-center mb-6"
        style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
        }}
      >
        <div className="text-white">
          {icon}
        </div>
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-center mb-6" style={{ color: '#A78BFA' }}>
        {description}
      </p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
