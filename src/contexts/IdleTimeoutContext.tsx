import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { prefersReducedMotion } from '../utils/animations';
import { useAuthStore } from '../store/authStore';
import { idleSecurityService, type IdleSecuritySettings } from '../services/idleSecurityService';

type IdleTimeoutContextValue = {
  settings: IdleSecuritySettings | null;
  loading: boolean;
  locked: boolean;
  warningOpen: boolean;
  countdownSeconds: number;
  remainingSeconds: number | null;
  refreshSettings: () => Promise<void>;
  markActive: () => void;
  acknowledgeWarning: () => void;
  lockNow: () => void;
  setLocked: (locked: boolean) => void;
};

const IdleTimeoutContext = createContext<IdleTimeoutContextValue | null>(null);

export function IdleTimeoutProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [settings, setSettings] = useState<IdleSecuritySettings | null>(null);
  const [loading, setLoading] = useState(false);

  const [locked, setLocked] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const lastEventRef = useRef<number>(0);
  const warnedRef = useRef(false);
  const lockedRef = useRef(false);
  const titleRef = useRef<string>(typeof document !== 'undefined' ? document.title : '');

  const userId = user?.id ?? null;

  const refreshSettings = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setSettings(null);
      return;
    }
    setLoading(true);
    try {
      const s = await idleSecurityService.getSettings(userId);
      setSettings(s);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  const markActive = useCallback(() => {
    lastActivityRef.current = Date.now();
    warnedRef.current = false;
    lockedRef.current = false;
    if (settings?.idleTimeoutEnabled) {
      const timeoutMs = settings.idleTimeoutMinutes * 60 * 1000;
      setRemainingSeconds(Math.ceil(timeoutMs / 1000));
    } else {
      setRemainingSeconds(null);
    }
    if (warningOpen) setWarningOpen(false);
    if (locked) setLocked(false);
  }, [locked, settings?.idleTimeoutEnabled, settings?.idleTimeoutMinutes, warningOpen]);

  const acknowledgeWarning = useCallback(() => {
    markActive();
  }, [markActive]);

  const lockNow = useCallback(() => {
    if (!isAuthenticated || !userId) return;
    if (!lockedRef.current) {
      lockedRef.current = true;
      setLocked(true);
      setWarningOpen(false);
      warnedRef.current = false;
      idleSecurityService.logEvent(userId, 'locked', { reason: 'manual' }).catch(() => {});
    } else {
      setLocked(true);
      setWarningOpen(false);
    }
  }, [isAuthenticated, userId]);

  // Load settings when auth changes
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setSettings(null);
      setLocked(false);
      setWarningOpen(false);
      setCountdownSeconds(60);
      setRemainingSeconds(null);
      warnedRef.current = false;
      lockedRef.current = false;
      lastActivityRef.current = Date.now();
      return;
    }
    refreshSettings().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userId]);

  // Activity listeners (debounced to 1s)
  useEffect(() => {
    if (!isAuthenticated || !settings?.idleTimeoutEnabled) return;

    const onActivity = () => {
      const now = Date.now();
      if (now - lastEventRef.current < 1000) return;
      lastEventRef.current = now;
      lastActivityRef.current = now;
      if (warningOpen) setWarningOpen(false);
      warnedRef.current = false;
    };

    const events: Array<keyof DocumentEventMap | keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    events.forEach((evt) => window.addEventListener(evt as any, onActivity, { passive: true } as any));
    return () => events.forEach((evt) => window.removeEventListener(evt as any, onActivity as any));
  }, [isAuthenticated, settings?.idleTimeoutEnabled, warningOpen]);

  // Cmd/Ctrl+L to lock
  useEffect(() => {
    if (!isAuthenticated) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const isMod = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey;
      if (!isMod) return;
      if (e.key.toLowerCase() !== 'l') return;
      e.preventDefault();
      lockNow();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAuthenticated, lockNow]);

  // Poll engine (every 10s) to open warning / lock
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    if (!settings?.idleTimeoutEnabled) return;

    const timeoutMs = settings.idleTimeoutMinutes * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const inactive = now - lastActivityRef.current;
      setRemainingSeconds(Math.max(0, Math.ceil((timeoutMs - inactive) / 1000)));

      // Lock
      if (inactive >= timeoutMs) {
        if (!lockedRef.current) {
          lockedRef.current = true;
          setLocked(true);
          setWarningOpen(false);
          warnedRef.current = false;
          idleSecurityService.logEvent(userId, 'locked', { reason: 'timeout' }).catch(() => {});
        } else {
          setLocked(true);
          setWarningOpen(false);
        }
        return;
      }

      // Warning at (timeout - 60s)
      const warnAt = Math.max(0, timeoutMs - 60_000);
      if (inactive >= warnAt) {
        const remaining = Math.max(0, Math.ceil((timeoutMs - inactive) / 1000));
        setCountdownSeconds(remaining);
        if (!warnedRef.current) {
          warnedRef.current = true;
          setWarningOpen(true);
          idleSecurityService.logEvent(userId, 'idle_warning', { remainingSeconds: remaining }).catch(() => {});
        }
      } else {
        warnedRef.current = false;
        setCountdownSeconds(60);
        if (warningOpen) setWarningOpen(false);
      }
    };

    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, settings?.idleTimeoutEnabled, settings?.idleTimeoutMinutes, userId, warningOpen]);

  // Countdown per-second updates when warningOpen
  useEffect(() => {
    if (!warningOpen) return;
    const reduced = prefersReducedMotion();

    const updateTitle = (s: number) => {
      if (typeof document === 'undefined') return;
      if (!titleRef.current) titleRef.current = document.title;
      if (reduced) return;
      document.title = `(${s}s) ${titleRef.current}`;
    };

    updateTitle(countdownSeconds);

    const id = window.setInterval(() => {
      setCountdownSeconds((prev) => {
        const next = Math.max(0, prev - 1);
        updateTitle(next);
        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(id);
      if (typeof document !== 'undefined' && titleRef.current) {
        document.title = titleRef.current;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warningOpen]);

  // Lock when countdown hits 0
  useEffect(() => {
    if (!warningOpen) return;
    if (countdownSeconds > 0) return;
    lockNow();
  }, [countdownSeconds, lockNow, warningOpen]);

  // Visibility handling: lock immediately on return if exceeded
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    if (!settings?.idleTimeoutEnabled) return;
    const timeoutMs = settings.idleTimeoutMinutes * 60 * 1000;

    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      const inactive = now - lastActivityRef.current;
      if (inactive >= timeoutMs) lockNow();
    };

    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [isAuthenticated, lockNow, settings?.idleTimeoutEnabled, settings?.idleTimeoutMinutes, userId]);

  const value = useMemo<IdleTimeoutContextValue>(
    () => ({
      settings,
      loading,
      locked,
      warningOpen,
      countdownSeconds,
      remainingSeconds,
      refreshSettings,
      markActive,
      acknowledgeWarning,
      lockNow,
      setLocked,
    }),
    [
      settings,
      loading,
      locked,
      warningOpen,
      countdownSeconds,
      remainingSeconds,
      refreshSettings,
      markActive,
      acknowledgeWarning,
      lockNow,
    ]
  );

  return <IdleTimeoutContext.Provider value={value}>{children}</IdleTimeoutContext.Provider>;
}

export function useIdleTimeout() {
  const ctx = useContext(IdleTimeoutContext);
  if (!ctx) throw new Error('useIdleTimeout must be used within IdleTimeoutProvider');
  return ctx;
}

export function useOptionalIdleTimeout() {
  return useContext(IdleTimeoutContext);
}

