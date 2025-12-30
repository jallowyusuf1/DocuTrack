import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { prefersReducedMotion } from '../../utils/animations';
import { TopNav } from './sections/Hero';
import MobileNav from '../../components/landing/MobileNav';
import TabletNav from '../../components/landing/TabletNav';

const Hero = lazy(() => import('./sections/Hero'));
const HowItWorks = lazy(() => import('./sections/HowItWorks'));
const Features = lazy(() => import('./sections/Features'));
const Security = lazy(() => import('./sections/Security'));
const Footer = lazy(() => import('./sections/Footer'));

function SectionFallback({ tall = false }: { tall?: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
      <div className={`glass-card ${tall ? 'min-h-[420px]' : 'min-h-[220px]'} rounded-[28px] p-6`}>
        <div className="glass-shimmer rounded-2xl h-6 w-40" />
        <div className="mt-4 space-y-3">
          <div className="glass-shimmer rounded-2xl h-4 w-11/12" />
          <div className="glass-shimmer rounded-2xl h-4 w-10/12" />
          <div className="glass-shimmer rounded-2xl h-4 w-9/12" />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass-shimmer rounded-3xl h-20" />
          <div className="glass-shimmer rounded-3xl h-20" />
          <div className="glass-shimmer rounded-3xl h-20" />
        </div>
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <div className="flex items-center gap-4 py-8 md:py-10">
        <div
          className="h-px flex-1"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 30%, rgba(139,92,246,0.35) 55%, rgba(255,255,255,0.18) 80%, transparent 100%)',
          }}
        />
        <div
          className="text-white/70 text-xs md:text-sm px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          {label}
        </div>
        <div
          className="h-px flex-1"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 20%, rgba(59,130,246,0.28) 45%, rgba(255,255,255,0.18) 70%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}

function ScrollToTopButton() {
  const reduced = prefersReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 650);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-5 md:bottom-8 md:right-8 z-50"
        >
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
            aria-label="Scroll to top"
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.04) 100%), linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(255,255,255,0.06) 60%)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              boxShadow:
                '0 18px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Landing() {
  const reduced = prefersReducedMotion();
  const anchorSelector = useMemo(() => 'a[href^="#"]', []);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Smooth scrolling for in-page anchors (and offset for fixed nav)
  useEffect(() => {
    const getHeaderOffset = () => {
      // Check for mobile nav first, then tablet nav, then desktop nav
      const mobileNav = document.querySelector<HTMLElement>('[data-mobile-nav]');
      const tabletNav = document.querySelector<HTMLElement>('[data-tablet-nav]');
      const desktopNav = document.querySelector<HTMLElement>('[data-landing-nav]');
      const nav = mobileNav || tabletNav || desktopNav;
      const h = nav?.offsetHeight ?? 96;
      // add extra breathing room for glass shadow and proper spacing
      return h + 32;
    };

    const scrollToId = (id: string) => {
      // Try immediate scroll first
      const performScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            const top = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
          });
          return true;
        }
        return false;
      };

      // Small delay to ensure DOM is ready
      setTimeout(() => {
      if (performScroll()) {
        return;
      }

      // If not found, wait for lazy-loaded sections
      let attempts = 0;
        const maxAttempts = 80; // 8 seconds - more time for lazy loading
      const checkInterval = setInterval(() => {
        attempts++;
        if (performScroll() || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          if (attempts >= maxAttempts) {
            console.warn(`Section with id "${id}" not found after ${maxAttempts} attempts`);
              // Fallback: try to scroll to top if overview
              if (id === 'overview') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
          }
        }
      }, 100);
      }, 50);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.(anchorSelector) as HTMLAnchorElement | null;
      if (!link) return;
      
      // Skip if link is inside the TopNav (it has its own handler)
      const isInTopNav = link.closest('[data-landing-nav]');
      if (isInTopNav) return;
      
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      e.preventDefault();
      scrollToId(id);
      // keep URL in sync without jump
      window.history.pushState(null, '', `#${id}`);
    };

    const onHashChange = () => {
      const id = window.location.hash?.replace('#', '');
      if (id) scrollToId(id);
    };

    // Capture phase ensures we always prevent default hash jump.
    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener('hashchange', onHashChange);

    // If user loads directly with a hash, smooth scroll after sections are loaded
    const initialHash = window.location.hash?.replace('#', '');
    if (initialHash) {
      // Wait a bit longer for lazy-loaded sections to render
      window.setTimeout(() => scrollToId(initialHash), 300);
    }

    return () => {
      document.removeEventListener('click', onClick, { capture: true } as any);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [anchorSelector]);

  return (
    <motion.div
      className="min-h-screen relative overflow-x-hidden"
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <GlassBackground />
      <TopNav />
      <MobileNav />
      <TabletNav />
      <main className="relative z-10 pt-20 md:pt-[88px] lg:pt-24">
        <Suspense fallback={<SectionFallback tall />}>
          <Hero
            isVideoModalOpen={isVideoModalOpen}
            onVideoModalOpenChange={setIsVideoModalOpen}
          />
        </Suspense>
        <SectionDivider label="How it works" />
        <Suspense fallback={<SectionFallback />}>
          <HowItWorks />
        </Suspense>
        <SectionDivider label="Features" />
        <Suspense fallback={<SectionFallback />}>
          <Features />
        </Suspense>
        <SectionDivider label="Security" />
        <Suspense fallback={<SectionFallback />}>
          <Security />
        </Suspense>
        <SectionDivider label="Footer" />
        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
      </main>
      <ScrollToTopButton />
    </motion.div>
  );
}

