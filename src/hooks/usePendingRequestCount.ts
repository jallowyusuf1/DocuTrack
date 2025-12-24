import { useState, useEffect } from 'react';
import { getPendingRequestCount } from '../services/parentRequestService';

export function usePendingRequestCount(parentId: string | undefined) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) {
      setCount(0);
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      try {
        const requestCount = await getPendingRequestCount(parentId);
        setCount(requestCount);
      } catch (error) {
        console.error('Failed to fetch pending request count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [parentId]);

  return { count, loading };
}

