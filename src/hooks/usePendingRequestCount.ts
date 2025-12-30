/**
 * Hook for pending request count
 * Child accounts feature has been removed - this is a stub
 */
import { useState, useEffect } from 'react';

export function usePendingRequestCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // No-op - child accounts feature removed
    setCount(0);
  }, []);

  return count;
}
