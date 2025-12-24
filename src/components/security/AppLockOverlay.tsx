import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Fingerprint, Lock, LogOut, ShieldCheck, ShieldX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';
import { prefersReducedMotion, triggerHaptic } from '../../utils/animations';
import { wipeLocalDeviceData } from '../../utils/wipeLocalDeviceData';
import { idleSecurityService } from '../../services/idleSecurityService';
import { webauthnService } from '../../services/webauthnService';
import { GlassButton, GlassCard } from '../ui/glass/Glass';

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function AppLockOverlay({
  open,
  onUnlocked,
}: {
  open: boolean;
  onUnlocked: () => void;
}) {
  const reduced = prefersReducedMotion();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  const [settings, setSettings] = useState<Awaited<ReturnType<typeof idleSecurityService.getSettings>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeysCount, setPasskeysCount] = useState(0);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wiping, setWiping] = useState(false);
  const [wipeCountdown, setWipeCountdown] = useState(8);

  const inputTouchedRef = useRef(false);

  const lockoutSeconds = idleSecurityService.getRemainingLockoutSeconds();
  const isLockedOut = idleSecurityService.isLockedOut();

  const biometricAvailable = useMemo(() => {
    return !!settings?.biometricUnlockEnabled && webauthnService.isSupported() && passkeysCount > 0;
  }, [passkeysCount, settings?.biometricUnlockEnabled]);

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setWiping(false);
    setWipeCountdown(8);
    inputTouchedRef.current = false;

    if (!userId) return;
    setLoading(true);
    Promise.all([
      idleSecurityService.getSettings(userId).then(setSettings),
      webauthnService
        .listPasskeys(userId)
        .then((rows) => setPasskeysCount(rows.length))
        .catch(() => setPasskeysCount(0)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, userId]);

  // Auto-prompt passkey on mount (mobile/tablet) unless locked out or user typing
  useEffect(() => {
    if (!open) return;
    if (!userId) return;
    if (!biometricAvailable) return;
    if (isLockedOut) return;
    if (inputTouchedRef.current) return;

    const id = window.setTimeout(() => {
      if (inputTouchedRef.current) return;
      handlePasskey().catch(() => {});
    }, 450);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, biometricAvailable, isLockedOut, userId]);

  // Wipe countdown
  useEffect(() => {
    if (!wiping) return;
    if (wipeCountdown <= 0) return;
    const id = window.setInterval(() => setWipeCountdown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [wipeCountdown, wiping]);

  useEffect(() => {
    if (!wiping) return;
    if (wipeCountdown > 0) return;
    // Execute wipe
    wipeLocalDeviceData().catch(() => {
      window.location.href = '/login?reason=data_wiped';
    });
  }, [wipeCountdown, wiping]);

  const handlePasskey = async () => {
    if (!userId) return;
    setError(null);
    setLoading(true);
    try {
      await webauthnService.authenticate();
      await idleSecurityService.logEvent(userId, 'unlock_success', { method: 'passkey' });
      idleSecurityService.clearAttemptState();
      triggerHaptic('medium');
      onUnlocked();
    } catch (e) {
      triggerHaptic('heavy');
      await idleSecurityService.logEvent(userId, 'unlock_failed', { method: 'passkey', error: String(e) });
      setError('Face ID / Passkey failed. Try your idle lock password.');
    } finally {
      setLoading(false);
    }
  };

  const startWipeFlow = async () => {
    if (!userId) return;
    setWiping(true);
    triggerHaptic('heavy');
    await idleSecurityService.logEvent(userId, 'device_wipe', { reason: 'max_attempts' });
  };

  const handlePasswordUnlock = async () => {
    if (!userId) return;
    if (isLockedOut) {
      setError(`Too many attempts. Try again in ${formatTime(lockoutSeconds)}.`);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const s = settings ?? (await idleSecurityService.getSettings(userId));
      setSettings(s);

      if (!s.idleLockPasswordHash) {
        setError('No idle lock password set. Create one below to unlock.');
        return;
      }

      const ok = await idleSecurityService.verifyIdlePassword(password, s.idleLockPasswordHash);
      if (!ok) {
        triggerHaptic('heavy');
        idleSecurityService.recordFailedAttempt(s.maxUnlockAttempts, 15);
        await idleSecurityService.logEvent(userId, 'unlock_failed', { method: 'password' });

        const after = idleSecurityService.getAttemptState();
        const hitMax = after.failedAttempts >= s.maxUnlockAttempts;

        if (hitMax) {
          if (s.wipeDataOnMaxAttempts) {
            await startWipeFlow();
          } else {
            await idleSecurityService.logEvent(userId, 'lockout', { minutes: 15 });
            setError('Too many attempts. Locked for 15 minutes.');
          }
        } else {
          const remaining = Math.max(0, s.maxUnlockAttempts - after.failedAttempts);
          setError(`Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`);
        }

        return;
      }

      idleSecurityService.clearAttemptState();
      await idleSecurityService.logEvent(userId, 'unlock_success', { method: 'password' });
      triggerHaptic('medium');
      onUnlocked();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasswordAndUnlock = async () => {
    if (!userId) return;
    setError(null);

    const p = newPassword.trim();
    if (p.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (p !== confirmNewPassword.trim()) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await idleSecurityService.setIdleLockPassword(userId, p);
      await idleSecurityService.logEvent(userId, 'unlock_success', { method: 'password_set' });
      idleSecurityService.clearAttemptState();
      triggerHaptic('medium');
      onUnlocked();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      idleSecurityService.clearAttemptState();
    } catch {}
    await supabase.auth.signOut();
    window.location.href = '/login?reason=locked';
  };

  const attemptState = idleSecurityService.getAttemptState();
  const maxUnlockAttempts = settings?.maxUnlockAttempts ?? 3;
  const attemptsUsed = Math.min(attemptState.failedAttempts, maxUnlockAttempts);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.20), transparent 58%), radial-gradient(circle at 70% 70%, rgba(59,130,246,0.18), transparent 58%), linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.55))',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          />

          <motion.div
            className="relative w-full max-w-md"
            initial={reduced ? false : { y: 18, opacity: 0, scale: 0.98 }}
            animate={reduced ? undefined : { y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard
              elevated
              className="p-6 md:p-7"
              style={{
                borderRadius: 26,
                border: '1px solid rgba(255,255,255,0.16)',
                background:
                  'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.16), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.04) 100%)',
                boxShadow:
                  '0 40px 120px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%)',
                      border: '1px solid rgba(255,255,255,0.14)',
                    }}
                  >
                    <Lock className="h-5 w-5 text-white/90" />
                  </div>
                  <div>
                    <div className="text-white font-semibold tracking-tight">App Locked</div>
                    <div className="text-white/65 text-sm">Enter your idle lock password to continue.</div>
                  </div>
                </div>

                <div className="text-white/70 text-xs flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Protected</span>
                </div>
              </div>

              {wiping ? (
                <div className="mt-6">
                  <div className="text-white font-medium">Wiping local device data…</div>
                  <div className="text-white/65 text-sm mt-1">
                    Too many attempts. Your device will sign out and clear local storage in{' '}
                    <span className="text-white font-semibold tabular-nums">{wipeCountdown}s</span>.
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${((8 - wipeCountdown) / 8) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(248,113,113,0.85), rgba(139,92,246,0.85))',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6">
                    {settings?.idleLockPasswordHash ? (
                      <div className="space-y-3">
                        <label className="block text-sm text-white/70" htmlFor="idle-lock-password">
                          Idle lock password
                        </label>
                        <div className="relative">
                          <input
                            id="idle-lock-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              inputTouchedRef.current = true;
                              setPassword(e.target.value);
                            }}
                            onFocus={() => {
                              inputTouchedRef.current = true;
                            }}
                            autoFocus
                            className="glass-input w-full h-12 pl-4 pr-11 text-white placeholder:text-white/45"
                            placeholder="••••••••"
                            disabled={loading || isLockedOut}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setShowPassword(!showPassword);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.10)',
                            }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-white/70 text-sm">
                          No idle lock password is set yet. Create one now to unlock.
                        </div>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => {
                              inputTouchedRef.current = true;
                              setNewPassword(e.target.value);
                            }}
                            onFocus={() => {
                              inputTouchedRef.current = true;
                            }}
                            className="glass-input w-full h-12 pl-4 pr-11 text-white placeholder:text-white/45"
                            placeholder="Create a password"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setShowNewPassword(!showNewPassword);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.10)',
                            }}
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => {
                              inputTouchedRef.current = true;
                              setConfirmNewPassword(e.target.value);
                            }}
                            className="glass-input w-full h-12 pl-4 pr-11 text-white placeholder:text-white/45"
                            placeholder="Confirm password"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setShowConfirmPassword(!showConfirmPassword);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.10)',
                            }}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-white/60 text-xs flex items-center gap-2">
                      <ShieldX className="h-4 w-4" />
                      <span className="tabular-nums">
                        Attempts: {attemptsUsed}/{maxUnlockAttempts}
                      </span>
                    </div>
                    {isLockedOut ? (
                      <div className="text-amber-200/90 text-xs tabular-nums">
                        Locked: {formatTime(lockoutSeconds)}
                      </div>
                    ) : null}
                  </div>

                  {error ? <div className="mt-4 text-red-200/90 text-sm">{error}</div> : null}

                  <div className="mt-6 space-y-3">
                    {biometricAvailable ? (
                      <GlassButton
                        variant="secondary"
                        onClick={handlePasskey}
                        className="w-full"
                        disabled={loading || isLockedOut}
                      >
                        <Fingerprint className="h-4 w-4" />
                        Use Face ID / Passkey
                      </GlassButton>
                    ) : null}

                    <div className="grid grid-cols-2 gap-3">
                      <GlassButton
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full"
                        disabled={loading}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </GlassButton>

                      {settings?.idleLockPasswordHash ? (
                        <GlassButton
                          variant="primary"
                          onClick={handlePasswordUnlock}
                          className="w-full"
                          disabled={loading || isLockedOut || password.length === 0}
                        >
                          Unlock
                        </GlassButton>
                      ) : (
                        <GlassButton
                          variant="primary"
                          onClick={handleSetPasswordAndUnlock}
                          className="w-full"
                          disabled={loading || newPassword.trim().length < 6 || confirmNewPassword.trim().length < 6}
                        >
                          Set & Unlock
                        </GlassButton>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="mt-4 text-white/55 text-xs">Working…</div>
                  ) : null}
                </>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

