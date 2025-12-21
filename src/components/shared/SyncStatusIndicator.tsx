import { CheckCircle, Loader2, AlertCircle, CloudOff } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusIndicatorProps {
  showText?: boolean;
  compact?: boolean;
}

export default function SyncStatusIndicator({
  showText = false,
  compact = false,
}: SyncStatusIndicatorProps) {
  const { syncing, lastSynced, pendingCount, error } = useSyncStatus();
  const { isOnline } = useOnlineStatus();

  const getStatus = () => {
    if (!isOnline) {
      return {
        icon: <CloudOff className="w-4 h-4" />,
        text: 'Offline',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
      };
    }

    if (syncing) {
      return {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: 'Syncing...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    }

    if (error) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Sync failed',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    }

    if (pendingCount > 0) {
      return {
        icon: (
          <div className="relative">
            <CheckCircle className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </div>
        ),
        text: `${pendingCount} pending`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      };
    }

    return {
      icon: <CheckCircle className="w-4 h-4" />,
      text: lastSynced ? `Synced ${formatDistanceToNow(lastSynced, { addSuffix: true })}` : 'Synced',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    };
  };

  const status = getStatus();

  if (compact) {
    return (
      <div
        className={`
          ${status.color}
          flex items-center gap-1
        `}
        title={status.text}
      >
        {status.icon}
        {pendingCount > 0 && (
          <span className="text-xs font-medium">{pendingCount}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full
        ${status.bgColor}
        ${status.color}
        text-sm font-medium
        transition-all duration-200
      `}
    >
      {status.icon}
      {showText && <span className="whitespace-nowrap">{status.text}</span>}
    </div>
  );
}
