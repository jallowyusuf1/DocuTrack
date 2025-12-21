import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface DeviceShowcaseProps {
  onComplete?: () => void;
}

type Scene = 1 | 2 | 3 | 4 | 5;

export default function DeviceShowcase({ onComplete }: DeviceShowcaseProps) {
  const [scene, setScene] = useState<Scene>(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(true);
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [documentCount, setDocumentCount] = useState(47);
  const [cycleCount, setCycleCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Preload
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Master Timeline - 20 seconds exactly
  useEffect(() => {
    if (!isLoaded || isPaused || prefersReducedMotion) return;

    const timeline = async () => {
      // SCENE 1: iPhone Introduction (0-4s)
      setScene(1);
      setShowLockScreen(true);
      setShowCTA(false);
      setDocumentCount(47);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Lock screen shows briefly
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Swipe up to dashboard
      setShowLockScreen(false);
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // SCENE 2: iPad Transition (4-8s)
      setScene(2);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowSyncIndicator(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowSyncIndicator(false);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // SCENE 3: MacBook Transition (8-12s)
      setScene(3);
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // SCENE 4: All Three Together (12-17s)
      setScene(4);
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Interactive demo - add document
      setShowRipple(true);
      setDocumentCount(48);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowRipple(false);

      // SCENE 5: Exit & CTA (17-20s)
      setScene(5);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowCTA(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Loop back
      setScene(1);
      setShowLockScreen(true);
      setShowCTA(false);
      setDocumentCount(47);
      setCycleCount((prev) => prev + 1);
    };

    timeline();
  }, [isLoaded, cycleCount, isPaused, prefersReducedMotion]);

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div
        className="relative w-full min-h-[700px] overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 100%)' }}
      >
        <div className="text-center">
          <div className="mb-6">
            <MacBookFrame scene={3}>
              <DashboardScreen device="desktop" documentCount={47} showRipple={false} />
            </MacBookFrame>
          </div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2" style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>
            Available on all your devices
          </h2>
          <p className="text-base text-[#1F2937]/60" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
            iPhone, iPad, Mac, and Web
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[700px]">
        <motion.div
          className="w-16 h-16 rounded-full"
          style={{
            border: '4px solid rgba(139, 92, 246, 0.2)',
            borderTopColor: '#8B5CF6',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-[700px] overflow-hidden"
      style={{
        background: scene === 5
          ? 'linear-gradient(180deg, #FAFAFA 0%, #8B5CF6 100%)'
          : 'linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 100%)',
        transition: 'background 1s ease-out',
      }}
      role="region"
      aria-label="Device showcase animation"
    >
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${15 + i * 10}px`,
              height: `${15 + i * 10}px`,
              background: 'rgba(139, 92, 246, 0.3)',
              left: `${i * 12}%`,
              top: `${(i * 15) % 80}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Animation Stage */}
      <div className="relative z-10 flex items-center justify-center min-h-[700px]" style={{ perspective: '2000px' }}>
        {/* SCENE 1: iPhone Solo (0-4s) */}
        <AnimatePresence mode="wait">
          {scene === 1 && (
            <motion.div
              key={`iphone-solo-${cycleCount}`}
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0.7, scale: 0.6, x: -200, y: -50, rotate: -12 }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="absolute"
              style={{
                filter: 'drop-shadow(0 40px 80px rgba(0, 0, 0, 0.25))',
                zIndex: 30,
              }}
            >
              <iPhoneFrame scene={scene}>
                {showLockScreen ? (
                  <LockScreen />
                ) : (
                  <DashboardScreen device="mobile" documentCount={documentCount} showRipple={showRipple} />
                )}
              </iPhoneFrame>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENE 2: iPad Center (4-8s) */}
        <AnimatePresence mode="wait">
          {scene === 2 && (
            <>
              {/* iPhone moving to top-left */}
              <motion.div
                key={`iphone-tl-${cycleCount}`}
                initial={{ opacity: 0.7, scale: 0.6, x: -200, y: -50, rotate: -12 }}
                animate={{ opacity: 0, scale: 0.5, x: -220, y: -80, rotate: -15 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15)) blur(2px)',
                  zIndex: 10,
                }}
              >
                <iPhoneFrame scene={scene}>
                  <DashboardScreen device="mobile" documentCount={documentCount} showRipple={false} />
                </iPhoneFrame>
              </motion.div>

              {/* iPad center stage */}
              <motion.div
                key={`ipad-center-${cycleCount}`}
                initial={{ opacity: 0, scale: 0.7, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0.6, scale: 0.5, x: 200, y: -50, rotate: 8 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="absolute"
                style={{
                  filter: 'drop-shadow(0 50px 100px rgba(0, 0, 0, 0.2))',
                  zIndex: 30,
                }}
              >
                <iPadFrame scene={scene}>
                  <DashboardScreen device="tablet" documentCount={documentCount} showRipple={showRipple} />
                </iPadFrame>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* SCENE 3: MacBook Center (8-12s) */}
        <AnimatePresence mode="wait">
          {scene === 3 && (
            <>
              {/* iPad moving to top-right */}
              <motion.div
                key={`ipad-tr-${cycleCount}`}
                initial={{ opacity: 0.6, scale: 0.5, x: 200, y: -50, rotate: 8 }}
                animate={{ opacity: 0, scale: 0.4, x: 220, y: -80, rotate: 10 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15)) blur(3px)',
                  zIndex: 10,
                }}
              >
                <iPadFrame scene={scene}>
                  <DashboardScreen device="tablet" documentCount={documentCount} showRipple={false} />
                </iPadFrame>
              </motion.div>

              {/* MacBook slides up from bottom */}
              <motion.div
                key={`macbook-center-${cycleCount}`}
                initial={{ opacity: 0, y: 200, scale: 0.8 }}
                animate={{ opacity: 1, y: 80, scale: 1 }}
                exit={{ opacity: 1, y: 100, scale: 0.85 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute"
                style={{
                  filter: 'drop-shadow(0 60px 120px rgba(0, 0, 0, 0.3))',
                  zIndex: 40,
                }}
              >
                <MacBookFrame scene={scene}>
                  <DashboardScreen device="desktop" documentCount={documentCount} showRipple={showRipple} />
                </MacBookFrame>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* SCENE 4: Triangle Formation (12-17s) */}
        <AnimatePresence mode="wait">
          {scene === 4 && (
            <>
              {/* iPhone top-left */}
              <motion.div
                key={`iphone-triangle-${cycleCount}`}
                initial={{ opacity: 0, scale: 0.6, x: -220, y: -80 }}
                animate={{ opacity: 1, scale: 0.7, x: -200, y: -100, rotate: -8 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute"
                style={{
                  width: '240px',
                  filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2))',
                  zIndex: 20,
                }}
              >
                <iPhoneFrame scene={scene}>
                  <DashboardScreen device="mobile" documentCount={documentCount} showRipple={showRipple} />
                </iPhoneFrame>
              </motion.div>

              {/* iPad top-right */}
              <motion.div
                key={`ipad-triangle-${cycleCount}`}
                initial={{ opacity: 0, scale: 0.5, x: 220, y: -80 }}
                animate={{ opacity: 1, scale: 0.65, x: 200, y: -100, rotate: 6 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute"
                style={{
                  width: '280px',
                  filter: 'drop-shadow(0 35px 70px rgba(0, 0, 0, 0.2))',
                  zIndex: 20,
                }}
              >
                <iPadFrame scene={scene}>
                  <DashboardScreen device="tablet" documentCount={documentCount} showRipple={showRipple} />
                </iPadFrame>
              </motion.div>

              {/* MacBook bottom-center */}
              <motion.div
                key={`macbook-triangle-${cycleCount}`}
                initial={{ opacity: 1, y: 100, scale: 0.85 }}
                animate={{ opacity: 1, y: 120, scale: 0.85, rotate: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute"
                style={{
                  width: '520px',
                  filter: 'drop-shadow(0 60px 120px rgba(0, 0, 0, 0.25))',
                  zIndex: 30,
                }}
              >
                <MacBookFrame scene={scene}>
                  <DashboardScreen device="desktop" documentCount={documentCount} showRipple={showRipple} />
                </MacBookFrame>
              </motion.div>

              {/* Connecting Lines - Purple Dotted */}
              <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  x1="50%" y1="40%"
                  x2="30%" y2="30%"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeDasharray="4 8"
                />
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  x1="50%" y1="40%"
                  x2="70%" y2="30%"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeDasharray="4 8"
                />
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  x1="30%" y1="30%"
                  x2="70%" y2="30%"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeDasharray="4 8"
                />
              </svg>

              {/* Central Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="absolute top-[35%] left-1/2 -translate-x-1/2 text-center z-50"
              >
                <div
                  className="w-20 h-20 rounded-2xl mb-2 flex items-center justify-center mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  <svg width="40" height="48" viewBox="0 0 40 48" fill="white">
                    <rect x="8" y="4" width="24" height="40" rx="2" opacity="0.95" />
                    <line x1="12" y1="12" x2="28" y2="12" stroke="white" strokeWidth="2" opacity="0.7" />
                    <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="2" opacity="0.7" />
                    <line x1="12" y1="28" x2="22" y2="28" stroke="white" strokeWidth="2" opacity="0.7" />
                  </svg>
                </div>
                <p className="text-sm text-[#1F2937]/60" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
                  One account, everywhere
                </p>
              </motion.div>

              {/* Sync Pulse Glow */}
              <AnimatePresence>
                {showRipple && (
                  <>
                    <motion.div
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                      }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                      }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                      }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    />
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>

        {/* SCENE 5: CTA Section (17-20s) */}
        <AnimatePresence>
          {scene === 5 && showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-50"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-32 h-32 rounded-[32px] mb-6 flex items-center justify-center mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  boxShadow: '0 16px 48px rgba(139, 92, 246, 0.5)',
                }}
              >
                <svg width="64" height="76" viewBox="0 0 64 76" fill="white">
                  <rect x="12" y="8" width="40" height="60" rx="3" opacity="0.95" />
                  <line x1="20" y1="20" x2="44" y2="20" stroke="white" strokeWidth="3" opacity="0.7" />
                  <line x1="20" y1="32" x2="44" y2="32" stroke="white" strokeWidth="3" opacity="0.7" />
                  <line x1="20" y1="44" x2="36" y2="44" stroke="white" strokeWidth="3" opacity="0.7" />
                </svg>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl font-bold text-white mb-4"
                style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif', letterSpacing: '-0.03em' }}
              >
                Never miss another deadline
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl text-white mb-8"
                style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
              >
                Available on iPhone, iPad, Mac, and Web
              </motion.p>

              {/* Download Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex gap-4 justify-center mb-6"
              >
                <AppStoreBadge />
                <MacAppStoreBadge />
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-4 rounded-full text-lg font-semibold"
                style={{
                  background: 'white',
                  color: '#8B5CF6',
                  fontFamily: '-apple-system, SF Pro Display, sans-serif',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                }}
              >
                Get Started Free
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Indicator (Scene 2) */}
        <AnimatePresence>
          {showSyncIndicator && scene === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 60 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div
                className="flex items-center gap-3 px-6 py-3 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(40px)',
                  border: '0.5px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }}
              >
                <motion.svg
                  className="w-5 h-5 text-[#007AFF]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <path d="M5.5 17.5C4.11929 17.5 3 16.3807 3 15C3 13.6193 4.11929 12.5 5.5 12.5C6.88071 12.5 8 13.6193 8 15C8 16.3807 6.88071 17.5 5.5 17.5Z" />
                  <path d="M14.5 7.5C13.1193 7.5 12 6.38071 12 5C12 3.61929 13.1193 2.5 14.5 2.5C15.8807 2.5 17 3.61929 17 5C17 6.38071 15.8807 7.5 14.5 7.5Z" />
                  <path d="M10 12.5L14.5 7.5M5.5 12.5L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </motion.svg>
                <span className="text-sm font-semibold text-[#1F2937]" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
                  Synced in real-time
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text Overlays */}
      <AnimatePresence mode="wait">
        {scene === 1 && !showLockScreen && (
          <TextOverlay text="Track on the go" delay={0.5} />
        )}
        {scene === 2 && !showSyncIndicator && (
          <TextOverlay text="Seamless across devices" delay={0.3} />
        )}
        {scene === 3 && (
          <TextOverlay text="Full power on desktop" delay={0.5} />
        )}
        {scene === 4 && showRipple && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-[15%] left-1/2 -translate-x-1/2 z-50 text-center"
          >
            <h3
              className="text-3xl font-bold"
              style={{
                fontFamily: '-apple-system, SF Pro Display, sans-serif',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Add once, available everywhere
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause/Play Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setIsPaused(!isPaused)}
        className="absolute bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(40px)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
        aria-label={isPaused ? 'Play animation' : 'Pause animation'}
      >
        {isPaused ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#8B5CF6">
            <path d="M5 3l12 7-12 7V3z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#8B5CF6">
            <rect x="5" y="3" width="3" height="14" rx="1" />
            <rect x="12" y="3" width="3" height="14" rx="1" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}

// Text Overlay Component
function TextOverlay({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay }}
      className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-40"
    >
      <div
        className="px-6 py-3 rounded-full"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <p className="text-2xl font-medium text-white" style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}

// iPhone 15 Pro Max Frame Component
function iPhoneFrame({ children, scene }: { children: React.ReactNode; scene: Scene }) {
  return (
    <div
      className="relative"
      style={{
        width: '340px',
        height: '100%',
        maxHeight: '700px',
      }}
    >
      <div
        className="relative"
        style={{
          width: '100%',
          aspectRatio: '430 / 932',
          borderRadius: '55px',
          padding: '2px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          border: '2px solid #0a0a0a',
          boxShadow: `
            0 40px 80px rgba(0, 0, 0, 0.25),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: '126px',
            height: '37px',
            background: '#000000',
            borderRadius: '18px',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        />

        {/* Screen */}
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '53px',
          }}
        >
          {children}
        </div>
      </div>

      {/* Purple Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: '55px', filter: 'blur(16px)' }}
        animate={{
          boxShadow: scene === 1
            ? '0 0 60px rgba(139, 92, 246, 0.4)'
            : '0 0 40px rgba(139, 92, 246, 0.25)',
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Surface Reflection */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '100%',
          height: '100px',
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.08) 0%, transparent 60%)',
          transform: 'translateX(-50%) scaleY(0.3)',
        }}
      />
    </div>
  );
}

// iPad Pro 12.9" Frame Component
function iPadFrame({ children, scene }: { children: React.ReactNode; scene: Scene }) {
  return (
    <div
      className="relative"
      style={{
        width: '480px',
        height: '100%',
      }}
    >
      <div
        className="relative"
        style={{
          width: '100%',
          aspectRatio: '1024 / 1366',
          borderRadius: '18px',
          padding: '8px',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
          border: '2px solid #1a1a1a',
          boxShadow: `
            0 50px 100px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08)
          `,
        }}
      >
        {/* Front Camera */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-full"
          style={{
            width: '12px',
            height: '12px',
            background: 'radial-gradient(circle, #1a1a1a 30%, #0a0a0a 100%)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* Screen */}
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
          }}
        >
          {children}
        </div>
      </div>

      {/* Purple Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: '18px', filter: 'blur(18px)' }}
        animate={{
          boxShadow: scene === 2
            ? '0 0 70px rgba(139, 92, 246, 0.35)'
            : '0 0 50px rgba(139, 92, 246, 0.25)',
        }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
}

// MacBook Pro 16" Frame Component
function MacBookFrame({ children, scene }: { children: React.ReactNode; scene: Scene }) {
  return (
    <div className="relative" style={{ width: '600px' }}>
      {/* Screen Container */}
      <div
        className="relative"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderRadius: '12px 12px 0 0',
          padding: '4px 4px 0 4px',
          boxShadow: `
            0 60px 120px rgba(0, 0, 0, 0.3),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: '180px',
            height: '15px',
            background: '#000000',
            borderRadius: '0 0 14px 14px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* Screen */}
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: '100%',
            aspectRatio: '16 / 10',
            borderRadius: '8px 8px 0 0',
          }}
        >
          {children}
        </div>
      </div>

      {/* Keyboard Deck */}
      <div
        className="relative"
        style={{
          width: '120%',
          marginLeft: '-10%',
          height: '28px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderRadius: '0 0 10px 10px',
          boxShadow: `
            0 10px 28px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Trackpad */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2"
          style={{
            width: '90px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(60, 60, 60, 0.4) 0%, rgba(40, 40, 40, 0.4) 100%)',
            borderRadius: '6px',
            border: '0.5px solid rgba(255, 255, 255, 0.03)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Subtle purple backlight */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
            borderRadius: '0 0 10px 10px',
          }}
        />
      </div>

      {/* Surface Reflection */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '100%',
          height: '140px',
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.12) 0%, transparent 70%)',
          transform: 'translateX(-50%) scaleY(0.3)',
        }}
      />

      {/* Purple Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: '12px 12px 0 0', filter: 'blur(20px)' }}
        animate={{
          boxShadow: scene >= 3
            ? '0 0 90px rgba(139, 92, 246, 0.3)'
            : '0 0 60px rgba(139, 92, 246, 0.2)',
        }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
}

// Lock Screen Component
function LockScreen() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
      }}
    >
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${20 + i * 12}px`,
              height: `${20 + i * 12}px`,
              background: 'rgba(255, 255, 255, 0.06)',
              left: `${i * 18}%`,
              top: `${(i * 16) % 85}%`,
            }}
            animate={{
              y: [0, -35, 0],
              x: [0, 18, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 4.5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.25,
            }}
          />
        ))}
      </div>

      {/* Time */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-7xl font-light mb-2 relative z-10"
        style={{
          fontFamily: '-apple-system, SF Pro Display, sans-serif',
          fontWeight: 200,
          letterSpacing: '-0.02em',
        }}
      >
        9:41
      </motion.div>

      {/* Date */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-lg font-medium mb-14 opacity-80 relative z-10"
        style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
      >
        Monday, January 15
      </motion.div>

      {/* App Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-24 h-24 rounded-[26px] flex items-center justify-center relative z-10 mb-3"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <svg width="48" height="56" viewBox="0 0 48 56" fill="white">
          <rect x="10" y="6" width="28" height="44" rx="2.5" opacity="0.95" />
          <line x1="15" y1="14" x2="33" y2="14" stroke="white" strokeWidth="2.5" opacity="0.7" />
          <line x1="15" y1="23" x2="33" y2="23" stroke="white" strokeWidth="2.5" opacity="0.7" />
          <line x1="15" y1="32" x2="26" y2="32" stroke="white" strokeWidth="2.5" opacity="0.7" />
        </svg>
      </motion.div>

      {/* App Name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-base font-medium relative z-10"
        style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
      >
        DocuTrackr
      </motion.div>

      {/* Swipe Up Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 0.7, 0], y: [20, 0, -20] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 1.2, ease: 'easeInOut' }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-2 h-12 bg-white/70 rounded-full" />
      </motion.div>
    </div>
  );
}

// Dashboard Screen Component
function DashboardScreen({
  device,
  documentCount,
  showRipple,
}: {
  device: 'mobile' | 'tablet' | 'desktop';
  documentCount: number;
  showRipple: boolean;
}) {
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const isDesktop = device === 'desktop';

  return (
    <div className="w-full h-full bg-[#FAFAFA] relative overflow-hidden">
      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-between items-center px-4 py-2"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(30px)',
          borderBottom: '0.33px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="text-xs font-semibold text-black" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
          9:41
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <rect x="0.5" y="2" width="16" height="8" rx="2" stroke="black" strokeOpacity="0.35" strokeWidth="1" />
            <rect x="2" y="3.5" width="13" height="5" rx="1" fill="black" fillOpacity="0.7" />
            <rect x="17.5" y="4.5" width="2" height="3" rx="0.5" fill="black" fillOpacity="0.4" />
          </svg>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="px-4 py-4"
      >
        <h2
          className={`${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'} font-bold text-[#1F2937] mb-2`}
          style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif', letterSpacing: '-0.02em' }}
        >
          Good morning, Yusuf
        </h2>
        {isMobile && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
            <div className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <span className="text-xs font-semibold text-red-600" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
              3 documents expiring soon
            </span>
          </div>
        )}
      </motion.div>

      {/* Urgency Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className={`grid gap-3 px-4 mb-4 ${isMobile ? 'grid-cols-3' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}
      >
        <UrgencyCard count={3} label="Urgent" color="#FF3B30" />
        <UrgencyCard count={5} label="Soon" color="#FF9500" />
        {!isTablet && <UrgencyCard count={8} label="Upcoming" color="#34C759" />}
      </motion.div>

      {/* Document List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className={`px-4 ${isDesktop ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}
      >
        <DocumentCard
          name="Passport"
          daysLeft={12}
          urgency="urgent"
          showRipple={showRipple && documentCount === 48}
        />
        <DocumentCard name="Driver License" daysLeft={35} urgency="soon" />
        {!isMobile && <DocumentCard name="Insurance Card" daysLeft={80} urgency="upcoming" />}
        {isDesktop && <DocumentCard name="Visa" daysLeft={120} urgency="upcoming" />}
      </motion.div>

      {/* Document Count Badge */}
      <motion.div
        animate={{ scale: showRipple ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          boxShadow: showRipple
            ? '0 8px 32px rgba(139, 92, 246, 0.6), 0 0 0 4px rgba(139, 92, 246, 0.2)'
            : '0 4px 20px rgba(139, 92, 246, 0.35)',
        }}
      >
        <span className="text-xl font-bold text-white" style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>
          {documentCount}
        </span>
      </motion.div>

      {/* Bottom Tab Bar (Mobile) */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 flex justify-around items-center py-3"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(30px)',
            borderTop: '0.33px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          {['Home', 'Documents', 'Dates', 'Profile'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#8B5CF6]' : 'bg-transparent'}`} />
              <span
                className={`text-[10px] font-medium ${i === 0 ? 'text-[#8B5CF6]' : 'text-black/50'}`}
                style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
              >
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Urgency Card
function UrgencyCard({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="rounded-2xl p-4 text-center"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(60px)',
        border: `0.5px solid ${color}20`,
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      }}
    >
      <div
        className="text-3xl font-bold mb-1"
        style={{
          color,
          fontFamily: '-apple-system, SF Pro Display, sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.03em',
        }}
      >
        {count}
      </div>
      <div
        className="text-[10px] font-medium text-black/50 uppercase tracking-wide"
        style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// Document Card
function DocumentCard({
  name,
  daysLeft,
  urgency,
  showRipple,
}: {
  name: string;
  daysLeft: number;
  urgency: 'urgent' | 'soon' | 'upcoming';
  showRipple?: boolean;
}) {
  const colors = {
    urgent: '#FF3B30',
    soon: '#FF9500',
    upcoming: '#34C759',
  };
  const color = colors[urgency];

  return (
    <motion.div
      initial={showRipple ? { opacity: 0, scale: 0.9, y: 10 } : false}
      animate={showRipple ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl p-3 flex items-center gap-3"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(60px)',
        border: `0.5px solid ${color}15`,
        boxShadow: showRipple
          ? `0 8px 24px ${color}30, 0 0 0 2px ${color}20`
          : '0 2px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Purple Icon */}
      <div
        className="w-12 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
        }}
      >
        <svg width="24" height="28" viewBox="0 0 24 28" fill="white" opacity="0.9">
          <rect x="5" y="2" width="14" height="24" rx="1.5" />
          <line x1="7" y1="7" x2="17" y2="7" stroke="white" strokeWidth="1.5" opacity="0.6" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="1.5" opacity="0.6" />
          <line x1="7" y1="17" x2="13" y2="17" stroke="white" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold text-[#1F2937] truncate mb-1"
          style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif', letterSpacing: '-0.01em' }}
        >
          {name}
        </div>
        <div
          className="text-xs font-semibold"
          style={{ color, fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
        >
          {daysLeft} days left
        </div>
      </div>

      {/* Status Dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </motion.div>
  );
}

// App Store Badge
function AppStoreBadge() {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="cursor-pointer"
      style={{
        width: '140px',
        height: '46px',
        background: 'black',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 12px',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <div>
        <div className="text-[8px] text-white/80" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
          Download on the
        </div>
        <div className="text-sm font-semibold text-white" style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>
          App Store
        </div>
      </div>
    </motion.div>
  );
}

// Mac App Store Badge
function MacAppStoreBadge() {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="cursor-pointer"
      style={{
        width: '140px',
        height: '46px',
        background: 'black',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 12px',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <div>
        <div className="text-[8px] text-white/80" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
          Download on the
        </div>
        <div className="text-sm font-semibold text-white" style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>
          Mac App Store
        </div>
      </div>
    </motion.div>
  );
}
