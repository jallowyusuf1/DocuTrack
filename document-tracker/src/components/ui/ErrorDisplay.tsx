import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';
import { getUserFriendlyError } from '../../utils/errorHandler';
import type { ErrorType } from '../../utils/errorHandler';

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  const errorInfo = getUserFriendlyError(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: 'rgba(239, 68, 68, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle 
            className="w-6 h-6" 
            style={{ color: '#F87171' }}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-2">
            {errorInfo.title}
          </h3>
          <p className="text-sm mb-4" style={{ color: '#FCA5A5' }}>
            {errorInfo.message}
          </p>
          {onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              icon={<RefreshCw className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              {errorInfo.action}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
