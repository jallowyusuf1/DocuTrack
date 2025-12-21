import { useState, useEffect } from 'react';
import { getNetworkStatus, setupNetworkListeners, type NetworkStatus } from '../utils/networkUtils';

/**
 * Hook to monitor network status in real-time
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => getNetworkStatus());
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    // Update status on mount
    setNetworkStatus(getNetworkStatus());
    setIsOnline(navigator.onLine);

    // Setup listeners
    const cleanup = setupNetworkListeners(
      () => {
        setIsOnline(true);
        setNetworkStatus(getNetworkStatus());
      },
      () => {
        setIsOnline(false);
        setNetworkStatus(getNetworkStatus());
      }
    );

    // Periodically check network status
    const interval = setInterval(() => {
      setNetworkStatus(getNetworkStatus());
      setIsOnline(navigator.onLine);
    }, 30000); // Check every 30 seconds

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  return {
    ...networkStatus,
    isOnline,
  };
}
