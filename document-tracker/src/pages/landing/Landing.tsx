import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion';
import DeviceShowcase from '../../components/landing/DeviceShowcase';
import {
  Menu,
  X,
  Bell,
  FolderTree,
  Users,
  Lock,
  Camera,
  Sparkles,
  Check,
  Star,
  Apple,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.4, 0, 0.2, 1] 
    } 
  },
};

const springConfig = {
  type: "spring" as const,
  mass: 1,
  stiffness: 200,
  damping: 22,
};

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Close menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      const timer = setTimeout(() => setIsMenuOpen(false), 300);
      return () => clearTimeout(timer);
    }
  }, [navigate, isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <div
      className="landing-page"
      style={{
        background: '#FFFFFF',
        minHeight: '100vh',
        overflowX: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        * {
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .mobile-nav {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
        }
        .desktop-nav {
          display: none;
        }
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
      {/* Navigation */}
      <ResponsiveNav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} navigate={navigate} />

      {/* Hero Section */}
      <HeroSection navigate={navigate} />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Final CTA Section */}
      <FinalCTASection navigate={navigate} />

      {/* Footer */}
      <FooterSection navigate={navigate} />
    </div>
  );
}

// Responsive Navigation Component
function ResponsiveNav({ 
  isMenuOpen, 
  setIsMenuOpen, 
  navigate 
}: { 
  isMenuOpen: boolean; 
  setIsMenuOpen: (open: boolean) => void;
  navigate: (path: string) => void;
}) {
  return (
    <>
      {/* Mobile Navigation */}
      <motion.nav 
        className="mobile-nav"
        initial={{ y: -48 }}
        animate={{ y: 0 }}
        transition={springConfig}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '48px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="url(#logoGradient)"/>
            <rect x="6" y="4" width="12" height="16" rx="1" fill="white" opacity="0.9"/>
            <line x1="8" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            <line x1="8" y1="16" x2="13" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6"/>
                <stop offset="100%" stopColor="#6D28D9"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: '#1D1D1F',
            letterSpacing: '-0.3px',
          }}>
            DocuTrackr
          </span>
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          aria-label="Menu"
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Menu className="w-6 h-6" style={{ color: '#1D1D1F' }} />
        </button>
      </motion.nav>

      {/* Desktop Navigation - Floating Curved Hill with Transparent Frosted Glass Effect */}
      <motion.nav
        className="desktop-nav"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springConfig}
        style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          position: 'relative',
          background: 'rgba(40, 40, 45, 0.65)',
          backdropFilter: 'blur(60px) saturate(200%)',
          WebkitBackdropFilter: 'blur(60px) saturate(200%)',
          borderRadius: '50px',
          padding: '14px 36px',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 0.5px rgba(255, 255, 255, 0.1)',
          border: '0.5px solid rgba(255, 255, 255, 0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
          // Enhanced glass effect
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginRight: '32px',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="url(#desktopLogoGradient)"/>
              <rect x="6" y="4" width="12" height="16" rx="1" fill="white" opacity="0.9"/>
              <line x1="8" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              <line x1="8" y1="16" x2="13" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              <defs>
                <linearGradient id="desktopLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#6D28D9"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              color: '#FFFFFF',
              letterSpacing: '-0.2px',
              whiteSpace: 'nowrap',
            }}>
              DocuTrackr
            </span>
          </div>

          {/* Navigation Links - All on one line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            flexShrink: 0,
          }}>
            <a 
              href="#features"
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                letterSpacing: '-0.2px',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
            >
              Features
            </a>
            <a 
              href="#how-it-works"
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                letterSpacing: '-0.2px',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
            >
              How It Works
            </a>
            <a 
              href="#pricing"
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                letterSpacing: '-0.2px',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
            >
              Pricing
            </a>
          </div>

          {/* CTA Buttons - All on one line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginLeft: '32px',
            flexShrink: 0,
          }}>
            <Link
              to="/login"
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                letterSpacing: '-0.2px',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#8B5CF6',
                padding: '8px 20px',
                borderRadius: '20px',
                textDecoration: 'none',
                letterSpacing: '-0.2px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                zIndex: 2000,
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: "spring",
                mass: 1,
                stiffness: 300,
                damping: 30,
              }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '400px',
                background: '#FFFFFF',
                zIndex: 2001,
                paddingTop: 'env(safe-area-inset-top)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Menu Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: '0.33px solid rgba(0, 0, 0, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="6" fill="url(#menuLogoGradient)"/>
                    <rect x="6" y="4" width="12" height="16" rx="1" fill="white" opacity="0.9"/>
                    <line x1="8" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                    <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                    <line x1="8" y1="16" x2="13" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                    <defs>
                      <linearGradient id="menuLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6"/>
                        <stop offset="100%" stopColor="#6D28D9"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    color: '#1D1D1F',
                    letterSpacing: '-0.3px',
                  }}>
                    DocuTrackr
                  </span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close"
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <X className="w-6 h-6" style={{ color: '#1D1D1F' }} />
                </button>
              </div>

              {/* Menu Links */}
              <nav style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                padding: '48px 16px',
              }}>
                <a 
                  href="#features" 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#1D1D1F',
                    textDecoration: 'none',
                    letterSpacing: '-0.5px',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#1D1D1F',
                    textDecoration: 'none',
                    letterSpacing: '-0.5px',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  How It Works
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#1D1D1F',
                    textDecoration: 'none',
                    letterSpacing: '-0.5px',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Pricing
                </a>
                <a 
                  href="#download" 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#1D1D1F',
                    textDecoration: 'none',
                    letterSpacing: '-0.5px',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Download
                </a>
                <div style={{
                  width: '100%',
                  height: '0.33px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  margin: '24px 0',
                }} />
                <Link 
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#1D1D1F',
                    textDecoration: 'none',
                    letterSpacing: '-0.5px',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: '#8B5CF6',
                    padding: '14px 32px',
                    borderRadius: '28px',
                    textDecoration: 'none',
                    letterSpacing: '-0.4px',
                    WebkitTapHighlightColor: 'transparent',
                    display: 'inline-block',
                    marginTop: '8px',
                  }}
                >
                  Get Started
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Hero Section
function HeroSection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section 
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: `calc(48px + env(safe-area-inset-top)) 16px 80px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      {/* Background Gradient Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, rgba(245, 245, 247, 0) 0%, rgba(245, 245, 247, 0.05) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Eyebrow */}
        <motion.p
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#8B5CF6',
            marginBottom: '16px',
          }}
        >
          Document Management
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            fontSize: '40px',
            lineHeight: '48px',
            letterSpacing: '-0.5px',
            fontWeight: 700,
            color: '#1D1D1F',
            marginBottom: '16px',
          }}
        >
          Never miss<br />
          <span style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #0071E3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            another deadline
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            fontSize: '21px',
            lineHeight: '29px',
            letterSpacing: '-0.3px',
            fontWeight: 400,
            color: '#86868B',
            marginBottom: '32px',
          }}
        >
          Track every document. Get reminded automatically.<br />
          Simple, secure, and beautifully designed.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <Link
            to="/signup"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '56px',
              padding: '0 24px',
              borderRadius: '28px',
              background: '#0071E3',
              color: '#FFFFFF',
              fontSize: '17px',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '-0.4px',
              boxShadow: '0 4px 16px rgba(0, 113, 227, 0.3)',
              WebkitTapHighlightColor: 'transparent',
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Apple className="w-5 h-5" />
            Download for iPhone
          </Link>

          <button
            onClick={() => navigate('/signup')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '56px',
              padding: '0 24px',
              borderRadius: '28px',
              background: 'transparent',
              border: '1px solid #D2D2D7',
              color: '#1D1D1F',
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.4px',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Try Web Version
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12px',
            lineHeight: '16px',
            letterSpacing: '-0.1px',
            color: '#86868B',
            marginBottom: '48px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check className="w-3 h-3" style={{ color: '#34C759' }} />
            Free forever
          </span>
          <span style={{ color: 'rgba(0, 0, 0, 0.2)' }}>•</span>
          <span>No credit card</span>
          <span style={{ color: 'rgba(0, 0, 0, 0.2)' }}>•</span>
          <span>10,000+ users</span>
        </motion.div>

        {/* Hero Image - Device Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'relative',
            marginTop: '32px',
          }}
        >
          <DeviceShowcase />
        </motion.div>

        {/* Floating Elements */}
        <FloatingCards />
      </div>
    </section>
  );
}

// Floating Cards Component
function FloatingCards() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 0.9, 
          y: [0, -10, 0],
        }}
        transition={{ 
          opacity: { duration: 1, delay: 1.2 },
          y: { 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          } 
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '18px',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '0.33px solid rgba(0, 0, 0, 0.08)',
          fontSize: '12px',
          color: '#1D1D1F',
          fontWeight: 500,
          zIndex: 10,
          maxWidth: '140px',
        }}
      >
        Passport expires in 12 days
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 0.9, 
          y: [0, -10, 0],
        }}
        transition={{ 
          opacity: { duration: 1, delay: 1.4 },
          y: { 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: 0.5,
          } 
        }}
        style={{
          position: 'absolute',
          top: '25%',
          right: '5%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '18px',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '0.33px solid rgba(0, 0, 0, 0.08)',
          fontSize: '12px',
          color: '#1D1D1F',
          fontWeight: 500,
          zIndex: 10,
          maxWidth: '160px',
        }}
      >
        3 documents expiring soon
      </motion.div>
    </>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Get notified 30, 7, and 1 day before any document expires. Never forget again.',
      visual: 'timeline',
    },
    {
      icon: FolderTree,
      title: 'Auto Organize',
      description: 'We automatically categorize your documents. Passports, IDs, insurance – all sorted.',
      visual: 'cards',
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Share documents securely with family. Everyone stays updated together.',
      visual: 'avatars',
    },
    {
      icon: Lock,
      title: 'Fort Knox Security',
      description: '256-bit encryption, Face ID, and zero-knowledge architecture. Your data stays yours.',
      visual: 'shield',
    },
  ];

  return (
    <section
      ref={ref}
      id="features"
      style={{
        padding: '60px 16px',
        background: '#F5F5F7',
      }}
    >
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#8B5CF6',
            marginBottom: '12px',
          }}>
            DESIGNED FOR YOU
          </p>
          <h2 style={{
            fontSize: '32px',
            lineHeight: '40px',
            letterSpacing: '-0.5px',
            fontWeight: 700,
            color: '#1D1D1F',
            marginBottom: '8px',
          }}>
            Everything you need
          </h2>
          <p style={{
            fontSize: '17px',
            lineHeight: '25px',
            letterSpacing: '-0.4px',
            fontWeight: 400,
            color: '#86868B',
          }}>
            Powerful features that make life easier
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={{
                  ...fadeInUp,
                  visible: { 
                    ...fadeInUp.visible, 
                    transition: { 
                      ...fadeInUp.visible.transition, 
                      delay: index * 0.1 
                    } 
                  },
                }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '32px 20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'transform 0.3s ease',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '48px',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}>
                  {feature.visual === 'timeline' && <TimelineVisual />}
                  {feature.visual === 'cards' && <CardsVisual />}
                  {feature.visual === 'avatars' && <AvatarsVisual />}
                  {feature.visual === 'shield' && <ShieldVisual />}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  lineHeight: '32px',
                  fontWeight: 600,
                  color: '#1D1D1F',
                  marginBottom: '8px',
                  textAlign: 'center',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '17px',
                  lineHeight: '25px',
                  letterSpacing: '-0.4px',
                  fontWeight: 400,
                  color: '#86868B',
                  textAlign: 'center',
                }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Timeline Visual
function TimelineVisual() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      {['30d', '7d', '1d', 'Expiry'].map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: i === 3 
              ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
              : 'rgba(139, 92, 246, 0.2)',
            border: i === 3 ? 'none' : '2px solid #8B5CF6',
          }} />
          {i < 3 && (
            <div style={{
              width: '16px',
              height: '2px',
              background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// Cards Visual
function CardsVisual() {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
          style={{
            width: '40px',
            height: '48px',
            borderRadius: '8px',
            background: ['#8B5CF6', '#0071E3', '#34C759'][i],
            opacity: 0.8,
            transform: `rotate(${i * 5}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Avatars Visual
function AvatarsVisual() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: 'relative' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: ['#8B5CF6', '#0071E3', '#34C759', '#FF9500'][i],
            border: '2px solid #FFFFFF',
          }} />
          {i < 3 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '-4px',
              width: '8px',
              height: '2px',
              background: '#8B5CF6',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// Shield Visual
function ShieldVisual() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <Lock className="w-12 h-12" style={{ color: '#8B5CF6' }} />
      <Check className="w-6 h-6" style={{ color: '#34C759' }} />
    </div>
  );
}

// How It Works Section
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      number: 1,
      icon: '📸',
      title: 'Snap a photo',
      description: 'Take a picture or upload any document from your phone.',
    },
    {
      number: 2,
      icon: '✨',
      title: 'We do the rest',
      description: 'Automatically organized and categorized. Set it and forget it.',
    },
    {
      number: 3,
      icon: '🔔',
      title: 'Never miss a date',
      description: 'Smart notifications keep you ahead of every deadline.',
    },
  ];

  return (
    <section
      ref={ref}
      id="how-it-works"
      style={{
        padding: '60px 16px',
        background: '#FFFFFF',
      }}
    >
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#86868B',
            marginBottom: '12px',
          }}>
            GETTING STARTED
          </p>
          <h2 style={{
            fontSize: '32px',
            lineHeight: '40px',
            letterSpacing: '-0.5px',
            fontWeight: 700,
            color: '#1D1D1F',
          }}>
            Simple as 1-2-3
          </h2>
        </motion.div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={{
                ...fadeInUp,
                visible: { 
                  ...fadeInUp.visible, 
                  transition: { 
                    ...fadeInUp.visible.transition, 
                    delay: index * 0.1 
                  } 
                },
              }}
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
              }}
            >
              {/* Number Badge */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                color: '#FFFFFF',
                fontSize: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {step.number}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '21px',
                  lineHeight: '29px',
                  letterSpacing: '-0.3px',
                  fontWeight: 600,
                  color: '#1D1D1F',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '24px' }}>{step.icon}</span>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '17px',
                  lineHeight: '25px',
                  letterSpacing: '-0.4px',
                  fontWeight: 400,
                  color: '#86868B',
                }}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Social Proof Section
function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { number: '10K+', label: 'Happy Users' },
    { number: '98%', label: 'On-Time Rate' },
    { number: '50K+', label: 'Documents Tracked' },
  ];

  return (
    <section
      ref={ref}
      style={{
        padding: '60px 16px',
        background: '#F5F5F7',
      }}
    >
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <h2 style={{
            fontSize: '28px',
            lineHeight: '36px',
            letterSpacing: '-0.5px',
            fontWeight: 700,
            color: '#1D1D1F',
            marginBottom: '8px',
          }}>
            Loved by thousands
          </h2>
          <p style={{
            fontSize: '17px',
            lineHeight: '25px',
            letterSpacing: '-0.4px',
            fontWeight: 400,
            color: '#86868B',
          }}>
            Join families staying organized
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{
                textAlign: 'center',
                padding: '24px 12px',
              }}
            >
              <div style={{
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: 700,
                color: '#8B5CF6',
                marginBottom: '4px',
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '15px',
                lineHeight: '20px',
                fontWeight: 400,
                color: '#86868B',
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '4px',
            marginBottom: '12px',
          }}>
            {[1, 2, 3, 4, 5].map(() => (
              <Star key={Math.random()} className="w-4 h-4" style={{ fill: '#FFD60A', color: '#FFD60A' }} />
            ))}
          </div>
          <p style={{
            fontSize: '17px',
            lineHeight: '25px',
            letterSpacing: '-0.4px',
            fontWeight: 400,
            color: '#1D1D1F',
            fontStyle: 'italic',
            marginBottom: '12px',
          }}>
            "Finally, no more panicking about expired passports!"
          </p>
          <p style={{
            fontSize: '15px',
            lineHeight: '20px',
            fontWeight: 400,
            color: '#86868B',
          }}>
            Sarah M.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{
        padding: '60px 16px',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
        >
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
          }}>
            <Sparkles className="w-16 h-16" style={{ color: '#FFFFFF', margin: '0 auto' }} />
          </div>
          <h2 style={{
            fontSize: '32px',
            lineHeight: '40px',
            letterSpacing: '-0.5px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '12px',
          }}>
            Start tracking today
          </h2>
          <p style={{
            fontSize: '17px',
            lineHeight: '25px',
            letterSpacing: '-0.4px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '32px',
          }}>
            Free forever. No credit card required.
          </p>
          <Link
            to="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '56px',
              padding: '0 32px',
              borderRadius: '28px',
              background: '#FFFFFF',
              color: '#8B5CF6',
              fontSize: '17px',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '-0.4px',
              marginBottom: '24px',
              WebkitTapHighlightColor: 'transparent',
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Download Free
          </Link>
          <p style={{
            fontSize: '12px',
            lineHeight: '16px',
            letterSpacing: '-0.1px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            Available on iPhone, iPad, Mac, and Web
          </p>
        </motion.div>
      </div>

      {/* App Icon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '26px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <svg width="64" height="76" viewBox="0 0 64 76" fill="white">
          <rect x="12" y="8" width="40" height="60" rx="3" opacity="0.95" />
          <line x1="20" y1="20" x2="44" y2="20" stroke="white" strokeWidth="3" opacity="0.7" />
          <line x1="20" y1="32" x2="44" y2="32" stroke="white" strokeWidth="3" opacity="0.7" />
          <line x1="20" y1="44" x2="36" y2="44" stroke="white" strokeWidth="3" opacity="0.7" />
        </svg>
      </motion.div>
    </section>
  );
}

// Footer Section
function FooterSection({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer style={{
      background: '#FFFFFF',
      padding: '48px 16px',
      paddingBottom: `calc(48px + env(safe-area-inset-bottom))`,
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Links */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {['Features', 'Pricing', 'Download', 'Help', 'Contact'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{
                fontSize: '17px',
                lineHeight: '25px',
                letterSpacing: '-0.4px',
                fontWeight: 400,
                color: '#86868B',
                textDecoration: 'none',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: '0.33px',
          background: 'rgba(0, 0, 0, 0.1)',
          margin: '32px 0',
        }} />

        {/* Legal */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '32px',
        }}>
          <Link
            to="/privacy"
            style={{
              fontSize: '12px',
              lineHeight: '16px',
              letterSpacing: '-0.1px',
              fontWeight: 400,
              color: '#86868B',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            style={{
              fontSize: '12px',
              lineHeight: '16px',
              letterSpacing: '-0.1px',
              fontWeight: 400,
              color: '#86868B',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Terms of Service
          </Link>
        </div>

        {/* Social */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <a
            href="https://twitter.com/docutrackr"
            aria-label="Twitter"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F5F5F7',
              color: '#86868B',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
          </a>
          <a
            href="https://instagram.com/docutrackr"
            aria-label="Instagram"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F5F5F7',
              color: '#86868B',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <p style={{
          fontSize: '12px',
          lineHeight: '16px',
          letterSpacing: '-0.1px',
          fontWeight: 400,
          color: '#86868B',
          textAlign: 'center',
        }}>
          © 2024 DocuTrackr. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
