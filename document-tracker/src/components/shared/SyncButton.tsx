import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { syncService } from '../../services/syncService';
import { useAuth } from '../../hooks/useAuth';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface SyncButtonProps {
  onSyncComplete?: () => void;
  showText?: boolean;
  className?: string;
}

export default function SyncButton({
  onSyncComplete,
  showText = false,
  className = '',
}: SyncButtonProps) {
  const { user } = useAuth();
  const { syncing, refresh } = useSyncStatus();
  const { isOnline } = useOnlineStatus();
  const [localSyncing, setLocalSyncing] = useState(false);

  const handleSync = async () => {
    if (!user?.id || !isOnline || syncing || localSyncing) {
      return;
    }

    setLocalSyncing(true);

    try {
      await syncService.syncAll(user.id);
      refresh();
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setLocalSyncing(false);
    }
  };

  const isSyncing = syncing || localSyncing;

  return (
    <button
      onClick={handleSync}
      disabled={!isOnline || isSyncing}
      className={`
        flex items-center gap-2
        px-3 py-2 rounded-lg
        text-sm font-medium
        transition-all duration-200
        ${
          isOnline
            ? isSyncing
              ? 'bg-blue-100 text-blue-700 cursor-wait'
              : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }
        ${className}
      `}
      aria-label="Sync data"
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {showText && (
        <span>
          {isSyncing ? 'Syncing...' : isOnline ? 'Sync' : 'Offline'}
        </span>
      )}
    </button>
  );
}
