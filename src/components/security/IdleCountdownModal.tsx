import { AnimatePresence, motion } from 'framer-motion';
import { AlarmClock, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { prefersReducedMotion, triggerHaptic } from '../../utils/animations';
import { GlassButton, GlassCard } from '../ui/glass/Glass';
import { useTheme } from '../../contexts/ThemeContext';

function countdownColor(seconds: number) {
  if (seconds <= 10) return 'rgba(248,113,113,1)'; // red-400
  if (seconds <= 25) return 'rgba(251,191,36,1)'; // amber-400
  return 'rgba(52,211,153,1)'; // emerald-400
}

function safeBeep() {
  try {
    // Lightweight beep without external assets
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    o.stop(ctx.currentTime + 0.14);
    o.onended = () => ctx.close().catch(() => {});
  } catch {
    // ignore
  }
}

export default function IdleCountdownModal({
  open,
  seconds,
  onImHere,
  onLogout,
  soundEnabled = false,
}: {
  open: boolean;
  seconds: number;
  onImHere: () => void;
  onLogout: () => void;
  soundEnabled?: boolean;
}) {
  const reduced = prefersReducedMotion();
  const lastBuzzRef = useRef<number>(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const color = useMemo(() => countdownColor(seconds), [seconds]);
  const pulse = seconds <= 10 && !reduced;
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const glassBg = isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  useEffect(() => {
    if (!open) return;
    if (seconds <= 0) return;
    const now = Date.now();

    // every 10s (and last 10s) feedback
    const shouldBuzz = seconds <= 10 || seconds % 10 === 0;
    if (!shouldBuzz) return;
    if (now - lastBuzzRef.current < 800) return;
    lastBuzzRef.current = now;

    triggerHaptic(seconds <= 10 ? 'heavy' : 'medium');
    if (soundEnabled && !reduced) safeBeep();
  }, [open, seconds, reduced, soundEnabled]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center px-4"
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
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
              className="p-6 md:p-7 overflow-hidden"
              style={{
                borderRadius: 24,
                border: `1px solid ${glassBorder}`,
                background: glassBg,
                backdropFilter: 'blur(60px) saturate(150%)',
                WebkitBackdropFilter: 'blur(60px) saturate(150%)',
                boxShadow: isDark
                  ? '0 20px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  : '0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              }}
            >
              {/* Glass highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full blur-2xl"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 60%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.30), transparent 60%)',
                }}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: isDark
                        ? 'rgba(40, 40, 40, 0.6)'
                        : 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(30px)',
                      border: glassBorder,
                    }}
                    animate={
                      reduced
                        ? undefined
                        : pulse
                          ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] }
                          : { rotate: [0, -1, 1, 0] }
                    }
                    transition={{
                      duration: pulse ? 0.8 : 2.4,
                      repeat: reduced ? 0 : Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <AlarmClock className="h-5 w-5" style={{ color: textColor }} />
                  </motion.div>

                  <div>
                    <div className="font-semibold tracking-tight" style={{ color: textColor }}>
                      Still there?
                    </div>
                    <div className="text-sm" style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                      You'll be logged out automatically for security.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs" style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                  <ShieldAlert className="h-4 w-4" />
                  <span>Auto logout</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <motion.div
                  className="relative"
                  animate={reduced ? undefined : pulse ? { scale: [1, 1.04, 1] } : undefined}
                  transition={pulse ? { duration: 0.75, repeat: Infinity, ease: 'easeInOut' } : undefined}
                >
                  <div
                    className="text-[56px] md:text-[64px] font-semibold tabular-nums tracking-tight leading-none"
                    style={{ color }}
                  >
                    {Math.max(0, seconds)}
                  </div>
                  <div className="mt-1 text-center text-sm" style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}>
                    seconds
                  </div>

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 blur-2xl"
                    style={{
                      background: `radial-gradient(circle, ${color}22, transparent 60%)`,
                    }}
                  />
                </motion.div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <GlassButton
                  variant="secondary"
                  onClick={onImHere}
                  className="w-full"
                  style={{
                    background: 'rgba(16, 185, 129, 0.8)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#FFFFFF',
                  }}
                >
                  Still Here
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={onLogout}
                  className="w-full"
                  style={{
                    background: 'rgba(239, 68, 68, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FFFFFF',
                  }}
                >
                  Log Me Out
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

