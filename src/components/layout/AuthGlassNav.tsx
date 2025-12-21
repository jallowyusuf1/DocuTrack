import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../utils/animations';

type AuthTab = 'home' | 'login' | 'signup';

const tabs: Array<{ key: AuthTab; label: string; to: string }> = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'login', label: 'Login', to: '/login' },
  { key: 'signup', label: 'Sign up', to: '/signup' },
];

export default function AuthGlassNav() {
  const reduced = prefersReducedMotion();
  const location = useLocation();

  const active: AuthTab = useMemo(() => {
    if (location.pathname.startsWith('/signup')) return 'signup';
    if (location.pathname.startsWith('/login')) return 'login';
    return 'home';
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-50 pt-4 md:pt-6">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div
          className="w-full rounded-[999px] px-4 md:px-5 py-4 md:py-4.5"
          style={{
            background:
              'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.05) 100%), linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(139,92,246,0.10) 55%, rgba(59,130,246,0.10) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(34px) saturate(180%)',
            WebkitBackdropFilter: 'blur(34px) saturate(180%)',
            boxShadow:
              '0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-3 pr-2">
              <div
                className="w-12 h-12 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.95), rgba(59,130,246,0.85))',
                  boxShadow: '0 18px 55px rgba(139,92,246,0.35)',
                  border: '1px solid rgba(255,255,255,0.20)',
                }}
              />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-white font-semibold tracking-tight text-base md:text-lg">DocuTrackr</span>
                <span className="text-white/60 text-xs md:text-sm">Secure sign in</span>
              </div>
            </div>

            {/* Segmented tabs */}
            <div
              className="relative inline-flex items-center gap-1 rounded-[999px] p-1.5"
              style={{
                background: 'rgba(0,0,0,0.18)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
              }}
            >
              <motion.div
                layout
                layoutId="auth-nav-pill"
                className="absolute top-1.5 bottom-1.5 rounded-[999px]"
                style={{
                  left: active === 'home' ? 6 : active === 'login' ? '33.5%' : '66.8%',
                  width: '33%',
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0.06) 100%), linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 100%)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(22px)',
                  WebkitBackdropFilter: 'blur(22px)',
                  boxShadow:
                    '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
                  pointerEvents: 'none',
                }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }
                }
              />

              {tabs.map((t) => {
                const isActive = active === t.key;
                return (
                  <Link
                    key={t.key}
                    to={t.to}
                    className="relative z-10 px-5 py-2.5 rounded-[999px] text-base transition-colors"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
                    }}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>

            {/* Spacer (keeps symmetry like homepage nav) */}
            <div className="w-12 h-12 hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}

