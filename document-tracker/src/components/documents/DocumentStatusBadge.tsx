import { CheckCircle, Clock, XCircle, RotateCw } from 'lucide-react';

interface DocumentStatusBadgeProps {
  status: 'synced' | 'pending' | 'failed' | 'syncing';
  onRetry?: () => void;
  compact?: boolean;
}

export default function DocumentStatusBadge({
  status,
  onRetry,
  compact = false,
}: DocumentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          text: 'Synced',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'pending':
        return {
          icon: <Clock className="w-3.5 h-3.5" />,
          text: 'Pending',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
        };
      case 'failed':
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          text: 'Failed',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
        };
      case 'syncing':
        return {
          icon: <RotateCw className="w-3.5 h-3.5 animate-spin" />,
          text: 'Syncing',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <div className={`${config.textColor} flex items-center`} title={config.text}>
        {config.icon}
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        rounded-md border
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        text-xs font-medium
      `}
    >
      {config.icon}
      <span>{config.text}</span>
      {status === 'failed' && onRetry && (
        <button
          onClick={onRetry}
          className="ml-1 p-0.5 rounded hover:bg-black/10 active:bg-black/20 transition-colors"
          aria-label="Retry sync"
        >
          <RotateCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
