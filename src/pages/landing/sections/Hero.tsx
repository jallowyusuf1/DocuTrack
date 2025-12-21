import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, ScanLine, CalendarDays, Users } from 'lucide-react';
import { GlassButton, GlassCard, GlassPill, GlassTile } from '../../../components/ui/glass/Glass';
import { MotionInView } from '../../../components/ui/motion/MotionInView';
import { prefersReducedMotion } from '../../../utils/animations';

const navLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
];

function TopNav() {
  const reduced = prefersReducedMotion();
  const [active, setActive] = useState<'overview' | 'how-it-works' | 'features'>(() => {
    const h = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    if (h === 'how-it-works' || h === 'features') return h;
    return 'overview';
  });

  // Track active section while scrolling so the highlight follows.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ids: Array<'overview' | 'how-it-works' | 'features'> = ['overview', 'how-it-works', 'features'];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        const id = visible?.target?.id as any;
        if (id && (id === 'overview' || id === 'how-it-works' || id === 'features')) setActive(id);
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: '-30% 0px -55% 0px',
      }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollToId = (id: 'overview' | 'how-it-works' | 'features') => {
    const el = document.getElementById(id);
    if (!el) return;
    const nav = document.querySelector<HTMLElement>('[data-landing-nav]');
    const offset = (nav?.offsetHeight ?? 96) + 18;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
    window.history.pushState(null, '', `#${id}`);
  };

  return (
    <div className="sticky top-0 z-40 pt-4 md:pt-6">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div
          data-landing-nav
          className="flex items-center justify-between gap-3 px-4 md:px-5 py-4 md:py-4.5 rounded-[999px]"
          style={{
            background:
              // App Store–style frosted “tile” bar
              'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.05) 100%), linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(139,92,246,0.10) 55%, rgba(59,130,246,0.10) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(34px) saturate(180%)',
            WebkitBackdropFilter: 'blur(34px) saturate(180%)',
            boxShadow:
              '0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}
        >
          {/* Left: brand */}
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
              <span className="text-white/60 text-xs md:text-sm">Deadline-proof documents</span>
            </div>
          </div>

          {/* Center: frosted segmented tabs */}
          <div className="hidden md:flex flex-1 justify-center">
            <div
              className="relative inline-flex items-center gap-1 rounded-[999px] p-1.5"
              style={{
                background: 'rgba(0,0,0,0.18)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
              }}
            >
              {/* active highlight */}
              <motion.div
                layout
                layoutId="nav-active-pill"
                className="absolute top-1.5 bottom-1.5 rounded-[999px]"
                style={{
                  left:
                    active === 'overview' ? 6 : active === 'how-it-works' ? '33.5%' : '66.8%',
                  width: active === 'overview' ? '33%' : active === 'how-it-works' ? '33%' : '33%',
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

              {navLinks.map((l) => {
                const id = l.href.replace('#', '') as 'overview' | 'how-it-works' | 'features';
                const isActive = active === id;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(id);
                      scrollToId(id);
                    }}
                    className="relative z-10 px-5 py-2.5 rounded-[999px] text-base transition-colors"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
                    }}
                  >
                    {l.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-2">
            <Link to="/login">
              <GlassButton variant="ghost" className="h-12 px-6 rounded-full text-base">
                Sign in
              </GlassButton>
            </Link>
            <Link to="/signup">
              <GlassButton className="h-12 px-6 rounded-full text-base">
                Get started <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>
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
        subtitle: 'See what’s expiring across every category — at a glance.',
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
        key: 'family',
        title: 'Family sharing',
        subtitle: 'Share documents with permissions — no forwarding PDFs.',
        icon: <Users className="w-5 h-5 text-white/80" />,
        content: <FamilyPreview />,
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setIdx((v) => (v + 1) % slides.length), 4200);
    return () => window.clearInterval(t);
  }, [reduced, slides.length]);

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

        <p className="text-white/70 text-sm mb-4 leading-relaxed">{slide.subtitle}</p>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.content}
            </motion.div>
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

export default function Hero() {
  return (
    <section id="overview" className="relative">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-10 md:pt-14 pb-14 md:pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <MotionInView preset="fadeUp">
              <GlassPill className="text-white/85">
                <Sparkles className="w-4 h-4 text-white/80" />
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
                The glass‑smooth way to track documents, renewals, and life.
              </h1>
            </MotionInView>

            <MotionInView preset="fadeUp" delay={0.14}>
              <p className="mt-5 text-white/70 text-base md:text-lg leading-relaxed max-w-xl">
                DocuTrackr keeps passports, IDs, insurance, visas, permits, and important dates organized — with
                automatic reminders, OCR capture, and secure family sharing.
              </p>
            </MotionInView>

            <MotionInView preset="fadeUp" delay={0.20}>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/signup">
                  <GlassButton className="w-full sm:w-auto">
                    Start free <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <GlassButton variant="secondary" className="w-full sm:w-auto">
                    See how it works
                  </GlassButton>
                </a>
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
    </section>
  );
}

function ExpiryRadar() {
  // A tiny “area chart” look without external libs.
  const points = '0,42 14,34 28,36 42,22 56,30 70,12 84,18 100,6 100,60 0,60';
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <GlassTile className="p-4" style={{ borderRadius: 22 }}>
        <div className="flex items-center justify-between">
          <div className="text-white font-medium">Next 30 days</div>
          <div className="text-white/60 text-sm">6 items</div>
        </div>
        <div className="mt-3 h-24 rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.25)' }}>
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

      <GlassTile className="p-4" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium">Today</div>
        <div className="mt-3 space-y-2">
          {[
            { label: 'Visa renewal reminder', tag: '1 day', c: 'rgba(239,68,68,0.35)' },
            { label: 'Insurance check-in', tag: '7 days', c: 'rgba(249,115,22,0.30)' },
            { label: 'Passport renewal', tag: '30 days', c: 'rgba(234,179,8,0.28)' },
          ].map((x) => (
            <div
              key={x.label}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div className="text-white/80 text-sm">{x.label}</div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <GlassTile className="p-4" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium">Camera capture</div>
        <div
          className="mt-3 rounded-xl overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.25)', height: 120 }}
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

      <GlassTile className="p-4" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium">Extracted fields</div>
        <div className="mt-3 space-y-2">
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
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <div className="text-white/60 text-xs">{r.k}</div>
              <div className="text-white/85 text-sm font-medium">{r.v}</div>
            </div>
          ))}
          <div className="pt-2">
            <GlassPill className="text-white/85">
              <Sparkles className="w-4 h-4 text-white/70" />
              Auto‑categorized + reminders scheduled
            </GlassPill>
          </div>
        </div>
      </GlassTile>
    </div>
  );
}

function FamilyPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <GlassTile className="p-4" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium">Household</div>
        <div className="mt-3 flex items-center gap-2">
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
              }}
            >
              {x}
            </div>
          ))}
          <div className="ml-2 text-white/65 text-sm">4 members</div>
        </div>
        <div className="mt-3 text-white/60 text-xs">Share passports, insurance, school IDs, and more.</div>
      </GlassTile>

      <GlassTile className="p-4" style={{ borderRadius: 22 }}>
        <div className="text-white font-medium">Permissions</div>
        <div className="mt-3 space-y-2">
          {[
            { label: 'View', ok: true },
            { label: 'Edit', ok: false },
            { label: 'Share', ok: true },
          ].map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <div className="text-white/80 text-sm">{p.label}</div>
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

