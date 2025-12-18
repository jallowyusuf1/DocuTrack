import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import VideoModal from '../../components/shared/VideoModal';
import DeviceShowcase from '../../components/landing/DeviceShowcase';
import {
  Menu,
  X,
  ArrowRight,
  Play,
  Check,
  Bell,
  Lock,
  Camera,
  FolderSearch,
  Search,
  Calendar,
  Users,
  FileText,
  ChevronDown,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const springAnimation = {
  type: "spring",
  mass: 1,
  stiffness: 200,
  damping: 22,
};

export default function Landing() {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      const timer = setTimeout(() => setIsMenuOpen(false), 300);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="landing-page" style={{ background: '#F2F2F7', minHeight: '100vh' }}>
      {/* Mobile Navigation */}
      <MobileNav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} navigate={navigate} />

      {/* Hero Section with Device Showcase */}
      <HeroSection navigate={navigate} onWatchDemo={() => setIsVideoModalOpen(true)} />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Final CTA Section */}
      <FinalCTASection navigate={navigate} />

      {/* Footer */}
      <FooterSection navigate={navigate} />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="/docutrackr-demo.mp4"
      />
    </div>
  );
}

// Footer Section
function FooterSection({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer
      className="mobile-footer"
      style={{
        background: '#F2F2F7',
        padding: '48px 16px 0',
        borderTop: '0.33px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <div
        className="footer-container"
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* Brand Section */}
        <div
          className="footer-brand"
          style={{
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          <div
            className="footer-logo"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <svg className="logo-icon" width="40" height="40" viewBox="0 0 40 40" style={{ borderRadius: '10px', boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)' }}>
              <rect width="40" height="40" rx="10" fill="url(#footerGradient)"/>
              <path d="M12 10h16v20H12z" fill="white" opacity="0.9"/>
              <path d="M14 14h12M14 19h12M14 24h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#6D28D9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3
            className="footer-brand-name"
            style={{
              font: 'var(--font-title-2)',
              color: '#000000',
              marginBottom: '8px',
            }}
          >
            DocuTrackr
          </h3>
          <p
            className="footer-tagline"
            style={{
              font: 'var(--font-callout)',
              color: 'rgba(0, 0, 0, 0.6)',
              marginBottom: '24px',
            }}
          >
            Never miss another deadline
          </p>
          
          {/* Social Links */}
          <div
            className="footer-social"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <a
              href="https://twitter.com/docutrackr"
              className="social-link liquid-glass"
              aria-label="Twitter"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(0, 0, 0, 0.8)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Navigation Sections */}
        <div
          className="footer-nav"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px 16px',
            marginBottom: '48px',
          }}
        >
          {/* Product */}
          <div className="footer-section">
            <h4
              className="footer-section-title"
              style={{
                font: 'var(--font-subheadline)',
                fontWeight: 600,
                color: '#000000',
                marginBottom: '12px',
              }}
            >
              Product
            </h4>
            <ul
              className="footer-links"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li><Link to="/features" style={{ font: 'var(--font-callout)', color: 'rgba(0, 0, 0, 0.6)', textDecoration: 'none' }}>Features</Link></li>
              <li><Link to="/faq" style={{ font: 'var(--font-callout)', color: 'rgba(0, 0, 0, 0.6)', textDecoration: 'none' }}>FAQ</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="footer-section">
            <h4
              className="footer-section-title"
              style={{
                font: 'var(--font-subheadline)',
                fontWeight: 600,
                color: '#000000',
                marginBottom: '12px',
              }}
            >
              Legal
            </h4>
            <ul
              className="footer-links"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li><Link to="/privacy" style={{ font: 'var(--font-callout)', color: 'rgba(0, 0, 0, 0.6)', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ font: 'var(--font-callout)', color: 'rgba(0, 0, 0, 0.6)', textDecoration: 'none' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div
          className="footer-divider"
          style={{
            height: '0.33px',
            background: 'rgba(0, 0, 0, 0.08)',
            margin: '0 0 24px',
          }}
        />
        
        {/* Bottom */}
        <div
          className="footer-bottom"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center',
            paddingBottom: '24px',
          }}
        >
          <p
            className="footer-copyright"
            style={{
              font: 'var(--font-footnote)',
              color: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            © 2024 DocuTrackr. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Safe Area */}
      <div
        className="footer-safe-area"
        style={{
          height: 'env(safe-area-inset-bottom)',
          background: '#F2F2F7',
        }}
      />
    </footer>
  );
}

// Mobile Navigation Component
function MobileNav({ 
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
      <nav className="mobile-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
              <path d="M10 8h12v16H10z" fill="white" opacity="0.9"/>
              <path d="M12 12h8M12 16h8M12 20h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#6D28D9"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">DocuTrackr</span>
          </div>
          <button 
            className="menu-button" 
            aria-label="Menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Menu Modal */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />
        <div className="menu-content">
          <div className="menu-header">
            <div className="nav-logo">
              <svg className="logo-icon" width="32" height="32" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
                <path d="M10 8h12v16H10z" fill="white" opacity="0.9"/>
                <path d="M12 12h8M12 16h8M12 20h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6"/>
                    <stop offset="100%" stopColor="#6D28D9"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="logo-text">DocuTrackr</span>
            </div>
            <button 
              className="close-button" 
              aria-label="Close"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="menu-nav">
            <a href="#features" className="menu-link" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="menu-link" onClick={() => setIsMenuOpen(false)}>How It Works</a>
            <a href="#faq" className="menu-link" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <Link to="/features" className="menu-link" onClick={() => setIsMenuOpen(false)}>About</Link>
          </nav>
          <div className="menu-cta">
            <Link to="/login" className="menu-button-secondary" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            <Link to="/signup" className="menu-button-primary" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Hero Section
function HeroSection({ 
  navigate, 
  onWatchDemo 
}: { 
  navigate: (path: string) => void;
  onWatchDemo: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section 
      ref={ref}
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: `calc(60px + env(safe-area-inset-top)) 16px 80px`,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <div 
        className="hero-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #F2F2F7 0%, #FFFFFF 50%, #F2F2F7 100%)',
          zIndex: -1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(191, 90, 242, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-20%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0, 122, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div 
        className="hero-container"
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            font: 'var(--font-caption-1)',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: '#BF5AF2',
            marginBottom: '16px',
          }}
        >
          DOCUMENT MANAGEMENT
        </motion.p>

        {/* Title */}
        <motion.h1
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            font: 'var(--font-large-title)',
            letterSpacing: '-0.4px',
            color: '#000000',
            marginBottom: '16px',
          }}
        >
          Never miss another<br/>
          <span style={{
            background: 'linear-gradient(135deg, #BF5AF2 0%, #007AFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            expiration date
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          style={{
            font: 'var(--font-body)',
            color: 'rgba(0, 0, 0, 0.7)',
            lineHeight: 1.5,
            marginBottom: '32px',
          }}
        >
          Track every document. Get reminded automatically. Simple, secure, and beautifully designed.
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
            className="hero-button-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '50px',
              padding: '0 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              color: '#FFFFFF',
              font: 'var(--font-headline)',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={onWatchDemo}
            className="hero-button-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '50px',
              padding: '0 24px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              border: '0.33px solid rgba(0, 0, 0, 0.08)',
              color: '#000000',
              font: 'var(--font-headline)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-flex' }}
            >
              <Play className="w-5 h-5" />
            </motion.div>
            Watch Demo
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
            font: 'var(--font-footnote)',
            color: 'rgba(0, 0, 0, 0.6)',
            marginBottom: '48px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check className="w-3 h-3" style={{ color: '#34C759' }} />
            Free forever
          </span>
          <span style={{ color: 'rgba(0, 0, 0, 0.3)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check className="w-3 h-3" style={{ color: '#34C759' }} />
            No credit card
          </span>
          <span style={{ color: 'rgba(0, 0, 0, 0.3)' }}>•</span>
          <span>10,000+ users</span>
        </motion.div>

        {/* Device Showcase Animation */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.8, delay: 0.7 } },
          }}
          style={{
            position: 'relative',
            width: '100%',
            marginTop: '32px',
          }}
        >
          <DeviceShowcase />
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      number: 1,
      icon: '📷',
      title: 'Capture',
      description: 'Snap a photo or upload any document. We\'ll handle the rest.',
    },
    {
      number: 2,
      icon: '📁',
      title: 'Organize',
      description: 'Everything auto-categorized. Find any document instantly.',
    },
    {
      number: 3,
      icon: '🔔',
      title: 'Relax',
      description: 'Smart reminders keep you ahead of every deadline.',
    },
  ];

  return (
    <section
      ref={ref}
      className="how-it-works-section"
      style={{
        padding: '80px 16px',
        background: '#FFFFFF',
      }}
    >
      <div
        className="section-container"
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="section-header"
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <p
            style={{
              font: 'var(--font-caption-1)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#BF5AF2',
              marginBottom: '12px',
            }}
          >
            SIMPLE TO START
          </p>
          <h2
            style={{
              font: 'var(--font-title-1)',
              letterSpacing: '-0.3px',
              color: '#000000',
            }}
          >
            Three steps to organized bliss
          </h2>
        </motion.div>

        {/* Steps */}
        <div
          className="steps-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={{
                ...fadeInUp,
                visible: { ...fadeInUp.visible, transition: { ...fadeInUp.visible.transition, delay: index * 0.1 } },
              }}
              className="step-card liquid-glass"
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Step Number Badge */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #BF5AF2, #007AFF)',
                  color: '#FFFFFF',
                  fontSize: '20px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(191, 90, 242, 0.3)',
                  flexShrink: 0,
                }}
              >
                {step.number}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    font: 'var(--font-title-3)',
                    color: '#000000',
                    marginBottom: '4px',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    font: 'var(--font-callout)',
                    color: 'rgba(0, 0, 0, 0.7)',
                    lineHeight: 1.4,
                  }}
                >
                  {step.description}
                </p>
              </div>
              
              {/* Icon */}
              <div style={{ fontSize: '32px', flexShrink: 0 }}>
                {step.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      title: 'Document Scanning',
      description: 'Capture documents with your camera or upload files. AI-powered text recognition.',
      icon: Camera,
      color: '#007AFF',
    },
    {
      title: 'Expiration Tracking',
      description: 'Track expiration dates for passports, visas, licenses, insurance, and more.',
      icon: Calendar,
      color: '#BF5AF2',
    },
    {
      title: 'Smart Reminders',
      description: 'Get notified 30, 7, and 1 day before anything expires. Customize to your schedule.',
      icon: Bell,
      color: '#FF3B30',
    },
    {
      title: 'Secure Storage',
      description: 'Bank-level encryption keeps your sensitive documents safe and private.',
      icon: Lock,
      color: '#34C759',
    },
    {
      title: 'Family Sharing',
      description: 'Share documents with family members. Manage household documents together.',
      icon: Users,
      color: '#FF9500',
    },
    {
      title: 'Quick Search',
      description: 'Find any document instantly with powerful search. Filter by type, date, or status.',
      icon: Search,
      color: '#5856D6',
    },
  ];

  return (
    <section
      ref={ref}
      id="features"
      className="features-section"
      style={{
        padding: '80px 16px',
        background: '#F2F2F7',
      }}
    >
      <div
        className="section-container"
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="section-header"
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <p
            style={{
              font: 'var(--font-caption-1)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#BF5AF2',
              marginBottom: '12px',
            }}
          >
            POWERFUL FEATURES
          </p>
          <h2
            style={{
              font: 'var(--font-title-1)',
              letterSpacing: '-0.3px',
              color: '#000000',
            }}
          >
            Everything you need.<br/>Nothing you don't.
          </h2>
        </motion.div>

        {/* Feature Cards */}
        <div
          className="features-grid"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={{
                  ...fadeInUp,
                  visible: { ...fadeInUp.visible, transition: { ...fadeInUp.visible.transition, delay: index * 0.1 } },
                }}
                className="feature-card liquid-glass"
                style={{
                  padding: '32px 24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${feature.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'iconFloat 3s ease-in-out infinite',
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                </div>
                <h3
                  style={{
                    font: 'var(--font-title-3)',
                    color: '#000000',
                    marginBottom: '8px',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    font: 'var(--font-callout)',
                    color: 'rgba(0, 0, 0, 0.7)',
                    lineHeight: 1.4,
                  }}
                >
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

// Final CTA Section
function FinalCTASection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="final-cta-section"
      style={{
        padding: '80px 16px',
        background: '#FFFFFF',
      }}
    >
      <div
        className="cta-container"
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="cta-card"
          style={{
            background: 'linear-gradient(135deg, rgba(191, 90, 242, 0.1) 0%, rgba(0, 122, 255, 0.1) 100%)',
            backdropFilter: 'saturate(180%) blur(40px)',
            WebkitBackdropFilter: 'saturate(180%) blur(40px)',
            border: '0.33px solid rgba(191, 90, 242, 0.2)',
            borderRadius: '32px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              marginBottom: '24px',
              animation: 'sparkle 2s ease-in-out infinite',
            }}
          >
            ✨
          </div>
          <h2
            style={{
              font: 'var(--font-title-1)',
              letterSpacing: '-0.3px',
              color: '#000000',
              marginBottom: '12px',
            }}
          >
            Ready to get organized?
          </h2>
          <p
            style={{
              font: 'var(--font-body)',
              color: 'rgba(0, 0, 0, 0.7)',
              marginBottom: '32px',
            }}
          >
            Start tracking for free. No credit card required.
          </p>
          <Link
            to="/signup"
            className="cta-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '56px',
              padding: '0 32px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              color: '#FFFFFF',
              font: 'var(--font-headline)',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(0, 122, 255, 0.4)',
              transition: 'all 0.2s ease',
              marginBottom: '24px',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p
            style={{
              font: 'var(--font-footnote)',
              color: 'rgba(0, 0, 0, 0.5)',
              marginBottom: '16px',
            }}
          >
            Available on iPhone, iPad, Mac, and Web
          </p>
        </motion.div>
      </div>
    </section>
  );
}
