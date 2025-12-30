import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Lock,
  Mail,
  Link as LinkIcon,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SECTIONS = [
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use-data', title: 'How We Use Your Data' },
  { id: 'data-storage-security', title: 'Data Storage & Security' },
  { id: 'third-party-services', title: 'Third-Party Services' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'data-deletion', title: 'Data Deletion' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'childrens-privacy', title: "Children's Privacy" },
  { id: 'international-users', title: 'International Users' },
  { id: 'changes-to-policy', title: 'Changes to This Policy' },
  { id: 'contact-us', title: 'Contact Us' },
];

export default function PrivacyPolicy() {
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
          {/* Back Button */}
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

          {/* Center: Page Title (Mobile Only) */}
          {isMobile && (
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Privacy Policy</h1>
          )}

          {/* Right: Theme Toggle */}
          <ThemeToggle />
        </div>
      </motion.nav>

      <div className="flex">
        {/* Sidebar Navigation (Desktop/Tablet Only) */}
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
                Privacy Policy
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
              <Lock className="w-6 h-6 flex-shrink-0" style={{
                color: theme === 'light' ? '#3B82F6' : '#60A5FA',
                marginTop: '2px',
              }} />
              <p className="text-sm md:text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}>
                <strong>TL;DR:</strong> We don't sell your data. Ever. Your documents are encrypted end-to-end. You own your data and can delete it anytime.
              </p>
            </motion.div>

            {/* Mobile Navigation Dropdown */}
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
            {/* Section 1: Information We Collect */}
            <motion.section
              ref={(el) => { sectionRefs.current['information-we-collect'] = el; }}
              id="information-we-collect"
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
                <span>1. Information We Collect</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We collect information you provide directly and information collected automatically.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Information You Provide:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Account Information</strong>: Email, name, password (hashed)</li>
                <li><strong>Document Data</strong>: Photos, extracted text, expiry dates, notes, tags</li>
                <li><strong>Family Sharing</strong>: Names and email addresses of people you share documents with</li>
                <li><strong>Payment Information</strong>: Processed by Stripe (we never see full credit card numbers)</li>
                <li><strong>Support Communications</strong>: Messages, feedback, bug reports</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Information Collected Automatically:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Usage Data</strong>: Pages viewed, features used, time spent</li>
                <li><strong>Device Information</strong>: Browser type, OS, device model, IP address</li>
                <li><strong>Analytics</strong>: Crash reports, performance metrics (via privacy-focused tools)</li>
              </ul>

              <p className="text-base font-semibold" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                We do NOT collect: Social Security Numbers, passwords (stored encrypted), full credit card numbers, or unnecessary personal data.
              </p>
            </motion.section>

            {/* Section 2: How We Use Your Data */}
            <motion.section
              ref={(el) => { sectionRefs.current['how-we-use-data'] = el; }}
              id="how-we-use-data"
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
                <span>2. How We Use Your Data</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
              We use your information to:
            </p>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Provide the Service</strong>: Store documents, send reminders, enable sharing</li>
                <li><strong>Improve DocuTrackr</strong>: Fix bugs, add features, optimize performance</li>
                <li><strong>Communicate</strong>: Send transactional emails (account, reminders, updates)</li>
                <li><strong>Prevent Fraud</strong>: Detect abuse, unauthorized access, security threats</li>
                <li><strong>Comply with Law</strong>: Respond to legal requests (only when legally required)</li>
              </ul>

              <p className="text-base font-semibold mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                We do NOT:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Sell your data to anyone</li>
                <li>Share data with advertisers</li>
                <li>Use your documents for training AI models</li>
                <li>Send marketing emails (unless you opt in)</li>
              </ul>
            </motion.section>

            {/* Section 3: Data Storage & Security */}
            <motion.section
              ref={(el) => { sectionRefs.current['data-storage-security'] = el; }}
              id="data-storage-security"
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
                <span>3. Data Storage & Security</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Encryption:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>In Transit</strong>: All connections use TLS 1.3 (HTTPS)</li>
                <li><strong>At Rest</strong>: Documents encrypted with AES-256</li>
                <li><strong>End-to-End</strong>: Your data is encrypted before leaving your device. We cannot decrypt it without your password.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Storage Location:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Primary</strong>: AWS servers in US-East / EU-West based on your location</li>
                <li><strong>Backups</strong>: Encrypted daily backups stored separately</li>
                <li><strong>Duration</strong>: Data retained until you delete your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Security Measures:
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>SOC 2 Type II certified</li>
                <li>Regular security audits</li>
                <li>Two-factor authentication (2FA) available</li>
                <li>Biometric authentication (Face ID, Touch ID) on mobile</li>
                <li>Automatic logout after inactivity</li>
            </ul>
            </motion.section>

            {/* Section 4: Third-Party Services */}
            <motion.section
              ref={(el) => { sectionRefs.current['third-party-services'] = el; }}
              id="third-party-services"
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
                <span>4. Third-Party Services</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We use trusted third parties for specific functions:
              </p>

              {/* Table - Responsive */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      borderBottom: theme === 'light' 
                        ? '2px solid rgba(0, 0, 0, 0.1)' 
                        : '2px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: textColor }}>Service</th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: textColor }}>Purpose</th>
                      <th className="text-left py-3 px-4 font-semibold hidden md:table-cell" style={{ color: textColor }}>Data Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{
                      borderBottom: theme === 'light' 
                        ? '1px solid rgba(0, 0, 0, 0.05)' 
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      <td className="py-3 px-4 font-medium" style={{ color: textColor }}>AWS</td>
                      <td className="py-3 px-4" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Hosting & storage</td>
                      <td className="py-3 px-4 hidden md:table-cell" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Encrypted documents</td>
                    </tr>
                    <tr style={{
                      borderBottom: theme === 'light' 
                        ? '1px solid rgba(0, 0, 0, 0.05)' 
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      <td className="py-3 px-4 font-medium" style={{ color: textColor }}>Stripe</td>
                      <td className="py-3 px-4" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Payment processing</td>
                      <td className="py-3 px-4 hidden md:table-cell" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Billing info</td>
                    </tr>
                    <tr style={{
                      borderBottom: theme === 'light' 
                        ? '1px solid rgba(0, 0, 0, 0.05)' 
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      <td className="py-3 px-4 font-medium" style={{ color: textColor }}>SendGrid</td>
                      <td className="py-3 px-4" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Transactional emails</td>
                      <td className="py-3 px-4 hidden md:table-cell" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Email address</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium" style={{ color: textColor }}>Plausible Analytics</td>
                      <td className="py-3 px-4" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Privacy-friendly analytics</td>
                      <td className="py-3 px-4 hidden md:table-cell" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>Anonymous usage stats</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-base font-semibold" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                We do NOT use: Google Analytics, Facebook Pixel, or tracking-heavy tools.
              </p>
            </motion.section>

            {/* Section 5: Your Rights */}
            <motion.section
              ref={(el) => { sectionRefs.current['your-rights'] = el; }}
              id="your-rights"
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
                <span>5. Your Rights (GDPR & CCPA Compliant)</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
              You have the right to:
            </p>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>Access</strong>: Download all your data (Settings &gt; Export Data)</li>
                <li><strong>Correct</strong>: Edit any information</li>
                <li><strong>Delete</strong>: Permanently delete your account and all data</li>
                <li><strong>Object</strong>: Opt out of non-essential processing</li>
                <li><strong>Portability</strong>: Export data in standard formats (JSON, CSV)</li>
                <li><strong>Withdraw Consent</strong>: Stop family sharing, disable features</li>
              </ul>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <strong>How to exercise rights</strong>: Contact privacy@docutrackr.com or use in-app settings.
              </p>
            </motion.section>

            {/* Section 6: Data Deletion */}
            <motion.section
              ref={(el) => { sectionRefs.current['data-deletion'] = el; }}
              id="data-deletion"
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
                <span>6. Data Deletion</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Account Deletion:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Go to Settings &gt; Account &gt; Delete Account</li>
                <li>Confirm deletion (irreversible)</li>
                <li>All data deleted within 30 days</li>
                <li>Backups purged after 90 days</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                What Gets Deleted:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>All documents and photos</li>
                <li>Personal information</li>
                <li>Payment history (except records required by law for 7 years)</li>
                <li>Family connections</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                What's Retained:
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Anonymized usage statistics (no personal identifiers)</li>
                <li>Legal/financial records (as required by law)</li>
              </ul>
            </motion.section>

            {/* Section 7: Cookies */}
            <motion.section
              ref={(el) => { sectionRefs.current['cookies'] = el; }}
              id="cookies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>7. Cookies</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We use minimal cookies:
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Essential Cookies (required):
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Authentication token (keeps you logged in)</li>
                <li>Session ID (prevents fraud)</li>
                <li>Theme preference (light/dark mode)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Analytics Cookies (optional, no tracking):
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Plausible Analytics (privacy-friendly, no personal data)</li>
            </ul>

              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                You can disable cookies in browser settings, but some features may not work.
              </p>
            </motion.section>

            {/* Section 8: Children's Privacy */}
            <motion.section
              ref={(el) => { sectionRefs.current['childrens-privacy'] = el; }}
              id="childrens-privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>8. Children's Privacy</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                DocuTrackr is not intended for children under 13 (or 16 in EU). We do not knowingly collect data from children. If we discover a child's account, we delete it immediately.
              </p>
              <p className="text-base mt-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Parents can use DocuTrackr to manage their children's documents (passports, birth certificates, etc.), but the account must belong to an adult.
              </p>
            </motion.section>

            {/* Section 9: International Users */}
            <motion.section
              ref={(el) => { sectionRefs.current['international-users'] = el; }}
              id="international-users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>9. International Users</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                DocuTrackr complies with:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>GDPR</strong> (European Union)</li>
                <li><strong>CCPA</strong> (California)</li>
                <li><strong>PIPEDA</strong> (Canada)</li>
                <li>Other regional privacy laws</li>
              </ul>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Data may be processed in the US or EU depending on your location. We use Standard Contractual Clauses (SCCs) for international transfers.
              </p>
            </motion.section>

            {/* Section 10: Changes to Policy */}
            <motion.section
              ref={(el) => { sectionRefs.current['changes-to-policy'] = el; }}
              id="changes-to-policy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>10. Changes to This Policy</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We may update this Privacy Policy occasionally. Changes are effective immediately upon posting. We'll notify you via:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Email (for significant changes)</li>
                <li>In-app notification</li>
                <li>Banner on website</li>
              </ul>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Last major update: January 1, 2025
              </p>
            </motion.section>

            {/* Section 11: Contact Us */}
            <motion.section
              ref={(el) => { sectionRefs.current['contact-us'] = el; }}
              id="contact-us"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>11. Contact Us</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Questions about privacy?
              </p>
              <div className="space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <p><strong>Email</strong>: <a href="mailto:privacy@docutrackr.com" className="underline hover:opacity-70 transition-opacity" style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }}>privacy@docutrackr.com</a></p>
                <p><strong>Data Protection Officer</strong>: <a href="mailto:dpo@docutrackr.com" className="underline hover:opacity-70 transition-opacity" style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }}>dpo@docutrackr.com</a></p>
                <p className="mt-4">Response time: Within 48 hours for privacy requests.</p>
              </div>
            </motion.section>
          </div>

          {/* Footer CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
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
                Have questions about our privacy practices? We're happy to explain anything.
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
              {['Terms of Service', 'Cookie Policy', 'Data Processing Agreement', 'Security'].map((link) => (
                <a
                  key={link}
                  href="#"
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
