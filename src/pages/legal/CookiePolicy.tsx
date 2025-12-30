import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Cookie,
  Mail,
  Link as LinkIcon,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SECTIONS = [
  { id: 'what-are-cookies', title: 'What Are Cookies?' },
  { id: 'what-cookies-we-use', title: 'What Cookies We Use' },
  { id: 'third-party-cookies', title: 'Third-Party Cookies' },
  { id: 'how-to-control', title: 'How to Control Cookies' },
  { id: 'changes-to-policy', title: 'Changes to Cookie Policy' },
  { id: 'contact-us', title: 'Contact Us' },
];

export default function CookiePolicy() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const section = sectionRefs.current[SECTIONS[i].id];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const bgColor = theme === 'light' ? '#FFFFFF' : '#000000';
  const textColor = theme === 'light' ? '#000000' : '#FFFFFF';

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: bgColor, color: textColor }}>
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: isMobile ? '64px' : isTablet ? '72px' : '80px',
          background: theme === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(50px) saturate(120%)',
          WebkitBackdropFilter: 'blur(50px) saturate(120%)',
          borderBottom: theme === 'light' 
            ? '1px solid rgba(0, 0, 0, 0.08)' 
            : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: theme === 'light'
            ? '0 4px 16px rgba(0, 0, 0, 0.05)'
            : '0 4px 16px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5"
            style={{
              padding: isMobile ? '8px' : '8px 12px',
              borderRadius: '10px',
              width: isMobile ? '36px' : 'auto',
              height: isMobile ? '36px' : 'auto',
              justifyContent: 'center',
              background: theme === 'light' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(26, 26, 26, 0.7)',
              backdropFilter: 'blur(20px) saturate(120%)',
              WebkitBackdropFilter: 'blur(20px) saturate(120%)',
              border: theme === 'light'
                ? '1px solid rgba(0, 0, 0, 0.08)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: theme === 'light'
                ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: textColor }} />
            {!isMobile && (
              <span className="text-xs font-medium" style={{ color: textColor }}>
                Back to Home
              </span>
            )}
          </motion.button>

          {isMobile && (
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Cookie Policy</h1>
          )}

          <ThemeToggle />
        </div>
      </motion.nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        {(isTablet || isDesktop) && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block fixed left-4 top-24 w-[250px] z-40"
            style={{ top: '100px' }}
          >
            <div className="glass-card" style={{
              padding: '24px',
              borderRadius: '16px',
              position: 'sticky',
              top: '100px',
            }}>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              }}>
                Contents
              </h3>
              <nav className="space-y-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left text-sm py-2 px-3 rounded-lg transition-all"
                    style={{
                      color: activeSection === section.id
                        ? (theme === 'light' ? '#3B82F6' : '#60A5FA')
                        : textColor,
                      background: activeSection === section.id
                        ? (theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(96, 165, 250, 0.2)')
                        : 'transparent',
                      borderLeft: activeSection === section.id
                        ? `3px solid ${theme === 'light' ? '#3B82F6' : '#60A5FA'}`
                        : '3px solid transparent',
                      fontWeight: activeSection === section.id ? 600 : 400,
                    }}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${isTablet || isDesktop ? 'md:ml-[270px]' : ''}`}>
          {/* Header Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-[900px] mx-auto"
            style={{
              paddingTop: isMobile ? '88px' : isTablet ? '104px' : '120px',
              paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
              paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
              paddingBottom: isMobile ? '32px' : isTablet ? '48px' : '64px',
            }}
          >
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ 
                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '0.1em'
                }}
              >
                Legal
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-bold mb-3"
                style={{
                  fontSize: isMobile ? '28px' : isTablet ? '36px' : '40px',
                  color: textColor,
                }}
              >
                Cookie Policy
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm"
                style={{ 
                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                }}
              >
                Last updated: January 1, 2025
              </motion.p>
            </div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card flex items-start gap-4 mb-8"
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: theme === 'light'
                  ? 'rgba(59, 130, 246, 0.05)'
                  : 'rgba(96, 165, 250, 0.1)',
                border: theme === 'light'
                  ? '1px solid rgba(59, 130, 246, 0.2)'
                  : '1px solid rgba(96, 165, 250, 0.3)',
              }}
            >
              <Cookie className="w-6 h-6 flex-shrink-0" style={{
                color: theme === 'light' ? '#3B82F6' : '#60A5FA',
                marginTop: '2px',
              }} />
              <p className="text-sm md:text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}>
                We use minimal cookies to keep you logged in and improve our service. No tracking, no third-party advertising cookies.
              </p>
            </motion.div>

            {/* Mobile Navigation */}
            {isMobile && (
              <div className="mb-6">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-full glass-card flex items-center justify-between p-4"
                  style={{ borderRadius: '12px' }}
                >
                  <span className="text-sm font-medium" style={{ color: textColor }}>
                    Jump to section
                  </span>
                  <ChevronDown 
                    className="w-5 h-5 transition-transform"
                    style={{ 
                      color: textColor,
                      transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card mt-2 p-4 space-y-2"
                    style={{ borderRadius: '12px' }}
                  >
                    {SECTIONS.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className="w-full text-left text-sm py-2 px-3 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ color: textColor }}
                      >
                        {section.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </motion.section>

          {/* Content Sections */}
          <div 
            className="max-w-[900px] mx-auto pb-20"
            style={{
              paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
              paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
            }}
          >
            {/* Section 1: What Are Cookies */}
            <motion.section
              ref={(el) => { sectionRefs.current['what-are-cookies'] = el; }}
              id="what-are-cookies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>1. What Are Cookies?</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and improve your experience.
              </p>
            </motion.section>

            {/* Section 2: What Cookies We Use */}
            <motion.section
              ref={(el) => { sectionRefs.current['what-cookies-we-use'] = el; }}
              id="what-cookies-we-use"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>2. What Cookies We Use</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Essential Cookies (required):
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Authentication token</strong>: Keeps you logged in securely</li>
                <li><strong>Session ID</strong>: Prevents fraud and maintains your session</li>
                <li><strong>Theme preference</strong>: Remembers your light/dark mode choice</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Analytics Cookies (optional, no tracking):
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Plausible Analytics</strong>: Privacy-friendly analytics that don't track individuals or collect personal data</li>
              </ul>
            </motion.section>

            {/* Section 3: Third-Party Cookies */}
            <motion.section
              ref={(el) => { sectionRefs.current['third-party-cookies'] = el; }}
              id="third-party-cookies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>3. Third-Party Cookies</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We only use third-party cookies from Stripe for secure payment processing. Stripe's cookies are essential for processing payments and are subject to their privacy policy.
              </p>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We do NOT use cookies from advertising networks, social media platforms, or tracking services.
              </p>
            </motion.section>

            {/* Section 4: How to Control Cookies */}
            <motion.section
              ref={(el) => { sectionRefs.current['how-to-control'] = el; }}
              id="how-to-control"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>4. How to Control Cookies</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Chrome</strong>: Settings &gt; Privacy &gt; Cookies</li>
                <li><strong>Firefox</strong>: Options &gt; Privacy &gt; Cookies</li>
                <li><strong>Safari</strong>: Preferences &gt; Privacy &gt; Cookies</li>
                <li><strong>Edge</strong>: Settings &gt; Privacy &gt; Cookies</li>
              </ul>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <strong>Note</strong>: Disabling essential cookies may prevent some features from working, such as staying logged in or processing payments.
              </p>
            </motion.section>

            {/* Section 5: Changes to Cookie Policy */}
            <motion.section
              ref={(el) => { sectionRefs.current['changes-to-policy'] = el; }}
              id="changes-to-policy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>5. Changes to Cookie Policy</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We may update this Cookie Policy occasionally. Changes are effective immediately upon posting. We'll notify you of significant changes via email or in-app notification.
              </p>
            </motion.section>

            {/* Section 6: Contact Us */}
            <motion.section
              ref={(el) => { sectionRefs.current['contact-us'] = el; }}
              id="contact-us"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>6. Contact Us</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Questions about our cookie usage?
              </p>
              <div className="space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <p><strong>Email</strong>: <a href="mailto:privacy@docutrackr.com" className="underline hover:opacity-70 transition-opacity" style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }}>privacy@docutrackr.com</a></p>
              </div>
            </motion.section>
          </div>

          {/* Footer CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="max-w-[700px] mx-auto mb-20"
            style={{
              paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
              paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
            }}
          >
            <div className="glass-card text-center" style={{ 
              padding: '32px',
              borderRadius: '24px',
            }}>
              <div className="text-5xl mb-4">📧</div>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}>
                Have questions about our cookie usage? We're happy to explain anything.
              </p>
              <motion.a
                href="mailto:privacy@docutrackr.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 glass-btn-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: theme === 'light' ? '#3B82F6' : '#60A5FA',
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                <Mail className="w-5 h-5" />
                Email Privacy Team
              </motion.a>
            </div>

            {/* Related Links */}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 justify-center mt-8 flex-wrap`}>
              {['Privacy Policy', 'Terms of Service', 'Security'].map((link) => (
                <a
                  key={link}
                  href={link === 'Privacy Policy' ? '/privacy' : link === 'Terms of Service' ? '/terms' : link === 'Security' ? '/security' : '#'}
                  className="glass-pill text-sm px-4 py-2"
                  style={{
                    borderRadius: '20px',
                    color: textColor,
                    textDecoration: 'none',
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

