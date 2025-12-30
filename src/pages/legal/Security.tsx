import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield,
  Mail,
  Link as LinkIcon,
  ChevronDown,
  Lock,
  Server,
  Key,
  Award,
  AlertTriangle,
  Search,
  Bug,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SECTIONS = [
  { id: 'data-encryption', title: 'Data Encryption' },
  { id: 'infrastructure-security', title: 'Infrastructure Security' },
  { id: 'access-controls', title: 'Access Controls' },
  { id: 'security-certifications', title: 'Security Certifications' },
  { id: 'incident-response', title: 'Incident Response' },
  { id: 'regular-audits', title: 'Regular Audits' },
  { id: 'report-vulnerability', title: 'Report a Vulnerability' },
];

export default function Security() {
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
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Security</h1>
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
                Security
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
                Security & Compliance
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
                  ? 'rgba(16, 185, 129, 0.05)'
                  : 'rgba(52, 211, 153, 0.1)',
                border: theme === 'light'
                  ? '1px solid rgba(16, 185, 129, 0.2)'
                  : '1px solid rgba(52, 211, 153, 0.3)',
              }}
            >
              <Shield className="w-6 h-6 flex-shrink-0" style={{
                color: theme === 'light' ? '#10B981' : '#34D399',
                marginTop: '2px',
              }} />
              <p className="text-sm md:text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}>
                Your security is our top priority. We use bank-level encryption, conduct regular audits, and maintain SOC 2 Type II certification.
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
            {/* Section 1: Data Encryption */}
            <motion.section
              ref={(el) => { sectionRefs.current['data-encryption'] = el; }}
              id="data-encryption"
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
                <span>1. Data Encryption</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <Lock className="w-5 h-5" />
                In Transit:
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                All connections use TLS 1.3 (HTTPS) with perfect forward secrecy. Your data is encrypted before it leaves your device and remains encrypted during transmission.
              </p>

              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <Lock className="w-5 h-5" />
                At Rest:
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Documents are encrypted with AES-256 encryption, the same standard used by banks and government agencies. Encryption keys are managed securely and never stored alongside your data.
              </p>

              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <Key className="w-5 h-5" />
                End-to-End Encryption:
              </h3>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Your data is encrypted before leaving your device. We cannot decrypt it without your password. This means even if our servers were compromised, your documents would remain secure.
              </p>
            </motion.section>

            {/* Section 2: Infrastructure Security */}
            <motion.section
              ref={(el) => { sectionRefs.current['infrastructure-security'] = el; }}
              id="infrastructure-security"
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
                <span>2. Infrastructure Security</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <Server className="w-5 h-5" />
                AWS Hosting:
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We host on Amazon Web Services (AWS), which provides enterprise-grade security, compliance certifications, and 99.99% uptime. Our infrastructure is distributed across multiple availability zones for redundancy.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Firewalls & Intrusion Detection:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Network firewalls block unauthorized access</li>
                <li>Intrusion detection systems monitor for suspicious activity 24/7</li>
                <li>Automated threat response systems block attacks in real-time</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                DDoS Protection:
              </h3>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We use AWS Shield and Cloudflare to protect against distributed denial-of-service (DDoS) attacks, ensuring the service remains available even under attack.
              </p>
            </motion.section>

            {/* Section 3: Access Controls */}
            <motion.section
              ref={(el) => { sectionRefs.current['access-controls'] = el; }}
              id="access-controls"
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
                <span>3. Access Controls</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Role-Based Permissions:
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Our team follows the principle of least privilege. Employees only have access to the minimum data necessary for their role. All access is logged and audited regularly.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Two-Factor Authentication (2FA):
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We strongly recommend enabling 2FA for your account. This adds an extra layer of security by requiring a second verification method (SMS, authenticator app, or email) in addition to your password.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Biometric Authentication (Mobile):
              </h3>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                On mobile devices, you can use Face ID (iOS) or fingerprint authentication (Android) for quick and secure access. Biometric data never leaves your device.
              </p>
            </motion.section>

            {/* Section 4: Security Certifications */}
            <motion.section
              ref={(el) => { sectionRefs.current['security-certifications'] = el; }}
              id="security-certifications"
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
                <span>4. Security Certifications</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 flex-shrink-0 mt-1" style={{
                    color: theme === 'light' ? '#10B981' : '#34D399',
                  }} />
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                      SOC 2 Type II
                    </h3>
                    <p className="text-base" style={{
                      color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.7,
                    }}>
                      We maintain SOC 2 Type II certification, which means an independent auditor has verified our security controls, availability, processing integrity, confidentiality, and privacy practices.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 flex-shrink-0 mt-1" style={{
                    color: theme === 'light' ? '#10B981' : '#34D399',
                  }} />
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                      GDPR Compliant
                    </h3>
                    <p className="text-base" style={{
                      color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.7,
                    }}>
                      We comply with the General Data Protection Regulation (GDPR), ensuring EU users' data is processed lawfully and transparently.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 flex-shrink-0 mt-1" style={{
                    color: theme === 'light' ? '#10B981' : '#34D399',
                  }} />
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                      CCPA Compliant
                    </h3>
                    <p className="text-base" style={{
                      color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.7,
                    }}>
                      We comply with the California Consumer Privacy Act (CCPA), giving California residents control over their personal information.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 5: Incident Response */}
            <motion.section
              ref={(el) => { sectionRefs.current['incident-response'] = el; }}
              id="incident-response"
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
                <span>5. Incident Response</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <Search className="w-5 h-5" />
                24/7 Monitoring:
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Our security team monitors systems 24/7 for suspicious activity, unauthorized access attempts, and potential threats.
              </p>

              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <AlertTriangle className="w-5 h-5" />
                Immediate Notification:
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                In the event of a data breach, we will notify affected users within 72 hours (as required by GDPR) and provide clear information about what happened and what we're doing about it.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Response Protocol:
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Immediate containment of the threat</li>
                <li>Assessment of impact and scope</li>
                <li>Remediation and system hardening</li>
                <li>User notification and support</li>
                <li>Post-incident review and improvements</li>
              </ul>
            </motion.section>

            {/* Section 6: Regular Audits */}
            <motion.section
              ref={(el) => { sectionRefs.current['regular-audits'] = el; }}
              id="regular-audits"
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
                <span>6. Regular Audits</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Quarterly Penetration Testing:
              </h3>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We conduct quarterly penetration tests with independent security firms to identify and fix vulnerabilities before they can be exploited.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Annual Third-Party Security Audits:
              </h3>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Annual comprehensive security audits by certified third-party auditors ensure our security practices meet industry standards and identify areas for improvement.
              </p>
            </motion.section>

            {/* Section 7: Report a Vulnerability */}
            <motion.section
              ref={(el) => { sectionRefs.current['report-vulnerability'] = el; }}
              id="report-vulnerability"
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
                <span>7. Report a Vulnerability</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: textColor }}>
                <Bug className="w-5 h-5" />
                Responsible Disclosure Policy:
              </h3>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We appreciate security researchers who help us keep DocuTrackr secure. If you discover a vulnerability, please:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Email security@docutrackr.com with details</li>
                <li>Give us 90 days to fix before public disclosure</li>
                <li>Do not access or modify user data</li>
                <li>Do not perform denial-of-service attacks</li>
              </ul>
              <p className="text-base font-semibold" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                We recognize responsible disclosures and may offer rewards for significant vulnerabilities.
              </p>
            </motion.section>
          </div>

          {/* Footer CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
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
              <div className="text-5xl mb-4">🛡️</div>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}>
                Found a security issue? We take security seriously and appreciate your help.
              </p>
              <motion.a
                href="mailto:security@docutrackr.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 glass-btn-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: theme === 'light' ? '#10B981' : '#34D399',
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                <Mail className="w-5 h-5" />
                Report Security Issue
              </motion.a>
            </div>

            {/* Related Links */}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 justify-center mt-8 flex-wrap`}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <a
                  key={link}
                  href={link === 'Privacy Policy' ? '/privacy' : link === 'Terms of Service' ? '/terms' : link === 'Cookie Policy' ? '/cookies' : '#'}
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

