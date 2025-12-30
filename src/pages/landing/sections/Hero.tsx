import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Shield, ScanLine, CalendarDays, Users, Check, Play, Pause, Bell } from 'lucide-react';
import { GlassButton, GlassCard, GlassPill, GlassTile } from '../../../components/ui/glass/Glass';
import { MotionInView } from '../../../components/ui/motion/MotionInView';
import { prefersReducedMotion } from '../../../utils/animations';
import HeroVideoModal from '../../../components/landing/HeroVideoModal';
import BrandLogo from '../../../components/ui/BrandLogo';

export function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });

  // Detect scroll for shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update theme in localStorage and body
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="hidden md:block lg:block fixed top-0 left-0 right-0 z-50">
      {/* Solid scrim so content goes behind the nav */}
      <motion.div
        animate={{
          height: isScrolled ? '110px' : '140px',
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(26,22,37,0.95) 0%, rgba(26,22,37,0.75) 60%, rgba(26,22,37,0.00) 100%)',
          backdropFilter: 'blur(34px) saturate(180%)',
          WebkitBackdropFilter: 'blur(34px) saturate(180%)',
        }}
      />
      <motion.div
        animate={{
          paddingTop: isScrolled ? '12px' : '24px',
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-12">
        <motion.div
          data-landing-nav
          animate={{
            paddingTop: isScrolled ? '16px' : '20px',
            paddingBottom: isScrolled ? '16px' : '20px',
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-between gap-3"
        >
          {/* Left: brand logo */}
          <motion.button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 px-5 py-3 rounded-full cursor-pointer"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <BrandLogo className="w-7 h-7" alt="DocuTrackr Logo" />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold tracking-tight text-sm">DocuTrackr</span>
              <span className="text-white/50 text-[10px] font-medium">Deadline-proof</span>
            </div>
          </motion.button>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center gap-2">
            <motion.a
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.12)',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              Overview
            </motion.a>
            <motion.a
              href="#features"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.12)',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              Features
            </motion.a>
            <motion.a
              href="#security"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer"
              style={{
                background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.12)',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              Security
            </motion.a>
          </div>

          {/* Right: CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-full text-sm font-medium"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  boxShadow:
                    '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
                  color: 'rgba(255, 255, 255, 0.92)',
                }}
                aria-label="Sign in to your account"
              >
                Sign in
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-7 py-3 rounded-full text-sm font-bold flex items-center gap-2"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  boxShadow:
                    '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
                  color: 'rgba(255, 255, 255, 0.92)',
                }}
                aria-label="Get started with a free account"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function HeroShowcase() {
  const reduced = prefersReducedMotion();
  const slides = useMemo(
    () => [
      {
        key: 'expiry',
        title: 'Expiry radar',
        subtitle: 'See what\'s expiring across every category - at a glance.',
        icon: <CalendarDays className="w-5 h-5 text-white/80" />,
        content: <ExpiryRadar />,
      },
      {
        key: 'ocr',
        title: 'Instant capture',
        subtitle: 'Scan once. OCR extracts the key fields automatically.',
        icon: <ScanLine className="w-5 h-5 text-white/80" />,
        content: <OCRPreview />,
      },
      {
        key: 'reminders',
        title: 'Smart reminders',
        subtitle: 'Get notified at 30, 7, and 1 day before expiration - never miss a deadline.',
        icon: <Bell className="w-5 h-5 text-white/80" />,
        content: <RemindersPreview />,
      },
      {
        key: 'family',
        title: 'Family sharing',
        subtitle: 'Share documents with permissions - no forwarding PDFs.',
        icon: <Users className="w-5 h-5 text-white/80" />,
        content: <FamilyPreview />,
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (reduced || isPaused) return;
    const t = window.setInterval(() => setIdx((v) => (v + 1) % slides.length), 4200);
    return () => window.clearInterval(t);
  }, [reduced, slides.length, isPaused]);

  const slide = slides[idx];

  return (
    <GlassCard
      elevated
      className="relative overflow-hidden"
      style={{
        borderRadius: 28,
        padding: 18,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <GlassPill className="text-white/90">
            {slide.icon}
            <span className="font-medium">{slide.title}</span>
          </GlassPill>
          {/* Slide Indicators */}
          <div className="hidden sm:flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setIdx(i)}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  background: i === idx ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                  boxShadow: i === idx ? '0 0 0 6px rgba(139,92,246,0.12)' : 'none',
                }}
                aria-label={`Show ${s.title}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-white/70 text-sm leading-relaxed flex-1">{slide.subtitle}</p>
          {/* Pause/Play Button - Moved to bottom right of subtitle */}
          <motion.button
            onClick={() => setIsPaused(!isPaused)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center flex-shrink-0 ml-3"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: 'rgba(255, 255, 255, 0.85)',
              transition: 'all 0.2s ease',
            }}
            aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 ml-0.5" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        <div className="relative overflow-hidden" style={{ minHeight: '380px', height: '380px' }}>
          <AnimatePresence initial={false}>
            {slides.map((s, i) => {
              if (i !== idx) return null;
              return (
                <motion.div
                  key={s.key}
                  initial={{ x: 100 }}
                  animate={{ x: 0 }}
                  exit={{ x: -100 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: '100%', height: '100%' }}
                >
                  <div className="h-full overflow-y-auto" style={{ paddingRight: '4px' }}>
                    {s.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
}

function MetricTiles() {
  const tiles = [
    { k: '7k+', label: 'Teams & families organized', accent: 'rgba(139,92,246,0.35)' },
    { k: '2m+', label: 'Deadlines tracked reliably', accent: 'rgba(59,130,246,0.28)' },
    { k: '99.9%', label: 'Uptime for reminders', accent: 'rgba(236,72,153,0.20)' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {tiles.map((t, i) => (
        <MotionInView key={t.k} delay={0.12 + i * 0.06} preset="scaleIn">
          <GlassTile
            className="p-4"
            style={{
              borderRadius: 22,
              background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 100%)`,
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: `0 14px 50px rgba(0,0,0,0.35), 0 0 40px ${t.accent}`,
            }}
          >
            <div className="text-white text-2xl font-semibold tracking-tight">{t.k}</div>
            <div className="text-white/65 text-sm mt-1 leading-snug">{t.label}</div>
          </GlassTile>
        </MotionInView>
      ))}
    </div>
  );
}

export default function Hero({
  isVideoModalOpen,
  onVideoModalOpenChange,
}: {
  isVideoModalOpen?: boolean;
  onVideoModalOpenChange?: (open: boolean) => void;
} = {}) {
  // Local state as fallback if props not provided
  const [localVideoOpen, setLocalVideoOpen] = useState(false);
  const isVideoOpen = isVideoModalOpen ?? localVideoOpen;
  const setIsVideoOpen = onVideoModalOpenChange ?? setLocalVideoOpen;

  // No video URL = shows animated demo instead
  const heroVideoUrl: string | undefined = undefined;

  return (
    <section id="overview" className="relative">

      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-10 md:pt-14 pb-14 md:pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <MotionInView preset="fadeUp">
              <GlassPill className="text-white/85">
                <Check className="w-4 h-4 text-white/80" />
                Built for people who never miss deadlines.
              </GlassPill>
            </MotionInView>

            <MotionInView preset="fadeUp" delay={0.08}>
              <h1
                className="mt-5 text-white font-semibold tracking-tight"
                style={{
                  fontSize: 'clamp(38px, 4.4vw, 64px)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                }}
              >
                Track every document. Renew on time. Stay calm.
              </h1>
            </MotionInView>

            <MotionInView preset="fadeUp" delay={0.14}>
              <p className="mt-5 text-white/70 text-base md:text-lg leading-relaxed max-w-xl">
                DocuTrackr keeps passports, IDs, insurance, visas, permits, and important dates organized - with
                automatic reminders, OCR capture, and secure family sharing.
              </p>
            </MotionInView>

            <MotionInView preset="fadeUp" delay={0.20}>
              <div className="mt-7">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsVideoOpen(true);
                  }}
                  className="group relative overflow-hidden rounded-full px-10 py-4 text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-3"
                  style={{
                    background: 'radial-gradient(ellipse at 25% 35%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.08) 100%), linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.12) 100%)',
                    border: '1.5px solid rgba(255,255,255,0.28)',
                    backdropFilter: 'blur(40px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15)',
                    color: 'rgba(255,255,255,0.98)',
                    minWidth: '240px',
                  }}
                >
                  {/* Glass highlight */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    }}
                  />

                  {/* Animated gradient border glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(59,130,246,0.35) 100%)',
                      filter: 'blur(24px)',
                      zIndex: -1,
                    }}
                  />

                  <div className="relative flex items-center justify-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.25) 100%)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 6px 16px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                      }}
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" style={{ color: '#FFFFFF' }} />
                    </div>
                    <span className="tracking-wide">Watch demo</span>
                  </div>
                </button>
              </div>
            </MotionInView>

            <MotionInView preset="fadeUp" delay={0.26}>
              <div className="mt-7 flex flex-wrap gap-2">
                <GlassPill className="text-white/80">
                  <Shield className="w-4 h-4 text-white/70" />
                  End‑to‑end protection
                </GlassPill>
                <GlassPill className="text-white/80">
                  <ScanLine className="w-4 h-4 text-white/70" />
                  OCR capture
                </GlassPill>
                <GlassPill className="text-white/80">
                  <CalendarDays className="w-4 h-4 text-white/70" />
                  Smart reminders
                </GlassPill>
              </div>
            </MotionInView>
          </div>

          <MotionInView preset="scaleIn" delay={0.10}>
            <div className="space-y-4">
              <HeroShowcase />
              <MetricTiles />
            </div>
          </MotionInView>
        </div>
      </div>

      <HeroVideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={heroVideoUrl}
        title="DocuTrackr - Product Demo"
      />
    </section>
  );
}

function ExpiryRadar() {
  // A tiny "area chart" look without external libs.
  const points = '0,42 14,34 28,36 42,22 56,30 70,12 84,18 100,6 100,60 0,60';
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-medium">Next 30 days</div>
          <div className="text-white/60 text-sm">6 items</div>
        </div>
        <div className="flex-1 rounded-xl overflow-hidden" style={{ 
          background: 'rgba(0,0,0,0.25)', 
          minHeight: '140px',
          maxHeight: '140px'
        }}>
          <svg viewBox="0 0 100 60" className="w-full h-full">
            <defs>
              <linearGradient id="gradA" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(139,92,246,0.55)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.20)" />
              </linearGradient>
            </defs>
            <polyline
              points={points}
              fill="url(#gradA)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
            />
          </svg>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/65">
          <div>Passport</div>
          <div>Insurance</div>
          <div>Permit</div>
        </div>
      </GlassTile>

      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium mb-3">Today</div>
        <div className="flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: '240px' }}>
          {[
            { label: 'Visa renewal reminder', tag: '1 day', c: 'rgba(239,68,68,0.35)' },
            { label: 'Insurance check-in', tag: '7 days', c: 'rgba(249,115,22,0.30)' },
            { label: 'Passport renewal', tag: '30 days', c: 'rgba(234,179,8,0.28)' },
          ].map((x) => (
            <div
              key={x.label}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="text-white/80 text-xs">{x.label}</div>
              <div
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: x.c, border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.9)' }}
              >
                {x.tag}
              </div>
            </div>
          ))}
        </div>
      </GlassTile>
    </div>
  );
}

function OCRPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium mb-3">Camera capture</div>
        <div
          className="flex-1 rounded-xl overflow-hidden"
          style={{ 
            background: 'rgba(0,0,0,0.25)', 
            minHeight: '140px',
            maxHeight: '140px'
          }}
        >
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute left-0 right-0 h-[2px]"
              style={{ top: '35%', background: 'rgba(139,92,246,0.9)', boxShadow: '0 0 20px rgba(139,92,246,0.65)' }}
              animate={{ y: [0, 55, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {[
              { top: 16, left: 14, w: 120 },
              { top: 44, left: 14, w: 160 },
              { top: 74, left: 14, w: 95 },
            ].map((r, i) => (
              <div
                key={i}
                className="absolute rounded-lg"
                style={{
                  top: r.top,
                  left: r.left,
                  width: r.w,
                  height: 16,
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              />
            ))}
          </div>
        </div>
      </GlassTile>

      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium mb-3">Extracted fields</div>
        <div className="flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: '240px' }}>
          {[
            { k: 'Document', v: 'Passport' },
            { k: 'Full name', v: 'Amina Diallo' },
            { k: 'Country', v: 'United States' },
            { k: 'Passport no.', v: '•••• •••• 4821' },
            { k: 'Issued', v: 'Aug 15, 2017' },
            { k: 'Expires', v: 'Aug 14, 2027' },
          ].map((r) => (
            <div
              key={r.k}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="text-white/60 text-xs">{r.k}</div>
              <div className="text-white/85 text-xs font-medium">{r.v}</div>
            </div>
          ))}
          <div className="pt-1.5 mt-2">
            <GlassPill className="text-white/85 text-xs py-1.5 px-3">
              <Check className="w-3 h-3 text-white/70" />
              Auto‑categorized + reminders scheduled
            </GlassPill>
          </div>
        </div>
      </GlassTile>
    </div>
  );
}

function RemindersPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium mb-3">Upcoming reminders</div>
        <div className="flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: '240px' }}>
          {[
            { label: 'Passport expires', days: '30 days', type: 'warning' },
            { label: 'Insurance renewal', days: '7 days', type: 'urgent' },
            { label: 'Visa expires', days: '1 day', type: 'critical' },
          ].map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5" style={{ 
                  color: r.type === 'critical' ? 'rgba(239,68,68,0.9)' : 
                         r.type === 'urgent' ? 'rgba(249,115,22,0.9)' : 
                         'rgba(234,179,8,0.9)' 
                }} />
                <div className="text-white/80 text-xs">{r.label}</div>
              </div>
              <div
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ 
                  background: r.type === 'critical' ? 'rgba(239,68,68,0.35)' : 
                             r.type === 'urgent' ? 'rgba(249,115,22,0.30)' : 
                             'rgba(234,179,8,0.28)', 
                  border: '1px solid rgba(255,255,255,0.14)', 
                  color: 'rgba(255,255,255,0.9)' 
                }}
              >
                {r.days}
              </div>
            </div>
          ))}
        </div>
      </GlassTile>

      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium mb-3">Notification settings</div>
        <div className="flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: '240px' }}>
          {[
            { label: '30 days before', enabled: true },
            { label: '7 days before', enabled: true },
            { label: '1 day before', enabled: true },
            { label: 'On expiration day', enabled: true },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="text-white/80 text-xs">{s.label}</div>
              <div className="text-xs px-2 py-1 rounded-full" style={{ 
                background: s.enabled ? 'rgba(16,185,129,0.26)' : 'rgba(255,255,255,0.08)', 
                border: '1px solid rgba(255,255,255,0.14)', 
                color: 'rgba(255,255,255,0.85)' 
              }}>
                {s.enabled ? 'On' : 'Off'}
              </div>
            </div>
          ))}
        </div>
      </GlassTile>
    </div>
  );
}

function FamilyPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium mb-3">Household</div>
        <div className="flex items-center gap-2 mb-3">
          {['A', 'M', 'S', 'J'].map((x, i) => (
            <div
              key={x}
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.9)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                marginLeft: i === 0 ? 0 : -8,
                backdropFilter: 'blur(20px)',
              }}
            >
              {x}
            </div>
          ))}
          <div className="ml-2 text-white/65 text-sm">4 members</div>
        </div>
        <div className="text-white/60 text-xs">Share passports, insurance, school IDs, and more.</div>
      </GlassTile>

      <GlassTile className="p-4 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium mb-3">Permissions</div>
        <div className="flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: '240px' }}>
          {[
            { label: 'View', ok: true },
            { label: 'Edit', ok: false },
            { label: 'Share', ok: true },
          ].map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="text-white/80 text-xs">{p.label}</div>
              <div className="text-xs px-2 py-1 rounded-full" style={{ background: p.ok ? 'rgba(16,185,129,0.26)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)' }}>
                {p.ok ? 'Allowed' : 'Off'}
              </div>
            </div>
          ))}
        </div>
      </GlassTile>
    </div>
  );
}

