import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { pageLockService, PageType, LockType } from '../services/pageLock';

export function usePageLock(page: PageType) {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(true);
  const [lockType, setLockType] = useState<LockType>('pin');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLockStatus();
  }, [user?.id, page]);

  const checkLockStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      setIsLocked(false);
      return;
    }

    setIsLoading(true);

    try {
      const locked = await pageLockService.isPageLocked(user.id, page);
      setIsLocked(locked);

      if (locked) {
        const lockSettings = await pageLockService.getPageLock(user.id, page);
        if (lockSettings) {
          setLockType(lockSettings.lock_type);
        }
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
      setIsLocked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (password: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await pageLockService.verifyUnlock(user.id, page, password);
      if (success) {
        setIsLocked(false);
      }
      return success;
    } catch (error) {
      console.error('Error unlocking page:', error);
      return false;
    }
  };

  return {
    isLocked,
    lockType,
    isLoading,
    handleUnlock,
    refreshLockStatus: checkLockStatus,
  };
}
