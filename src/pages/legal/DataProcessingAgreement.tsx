import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText,
  Mail,
  Link as LinkIcon,
  ChevronDown,
  Download,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SECTIONS = [
  { id: 'definitions', title: 'Definitions' },
  { id: 'scope-of-processing', title: 'Scope of Processing' },
  { id: 'data-controller-processor', title: 'Data Controller vs. Data Processor' },
  { id: 'lawful-basis', title: 'Lawful Basis' },
  { id: 'data-subject-rights', title: 'Data Subject Rights' },
  { id: 'sub-processors', title: 'Sub-Processors' },
  { id: 'international-transfers', title: 'International Transfers' },
  { id: 'security-measures', title: 'Security Measures' },
  { id: 'data-breach-notification', title: 'Data Breach Notification' },
  { id: 'audit-rights', title: 'Audit Rights' },
  { id: 'term-termination', title: 'Term and Termination' },
  { id: 'signatures', title: 'Signatures' },
];

export default function DataProcessingAgreement() {
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
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Data Processing Agreement</h1>
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
                Data Processing Agreement
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
              <FileText className="w-6 h-6 flex-shrink-0" style={{
                color: theme === 'light' ? '#3B82F6' : '#60A5FA',
                marginTop: '2px',
              }} />
              <p className="text-sm md:text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}>
                For business customers: Our commitment to GDPR-compliant data processing.
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
            {/* Section 1: Definitions */}
            <motion.section
              ref={(el) => { sectionRefs.current['definitions'] = el; }}
              id="definitions"
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
                <span>1. Definitions</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <div className="space-y-3" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <p><strong>"Controller"</strong>: The entity that determines the purposes and means of processing personal data (you, the customer).</p>
                <p><strong>"Processor"</strong>: The entity that processes personal data on behalf of the Controller (DocuTrackr, Inc.).</p>
                <p><strong>"Personal Data"</strong>: Any information relating to an identified or identifiable natural person.</p>
                <p><strong>"Processing"</strong>: Any operation performed on personal data, including collection, storage, use, and deletion.</p>
                <p><strong>"GDPR"</strong>: General Data Protection Regulation (EU) 2016/679.</p>
              </div>
            </motion.section>

            {/* Section 2: Scope of Processing */}
            <motion.section
              ref={(el) => { sectionRefs.current['scope-of-processing'] = el; }}
              id="scope-of-processing"
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
                <span>2. Scope of Processing</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                DocuTrackr processes personal data on behalf of the Controller for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Storing and organizing documents</li>
                <li>OCR text extraction from document images</li>
                <li>Sending expiry reminders</li>
                <li>Enabling family/team sharing</li>
                <li>Providing customer support</li>
              </ul>
            </motion.section>

            {/* Section 3: Data Controller vs. Data Processor */}
            <motion.section
              ref={(el) => { sectionRefs.current['data-controller-processor'] = el; }}
              id="data-controller-processor"
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
                <span>3. Data Controller vs. Data Processor</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <strong>You (Controller)</strong>: You determine what personal data is processed and for what purposes. You are responsible for ensuring you have a lawful basis for processing.
              </p>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <strong>DocuTrackr (Processor)</strong>: We process personal data only as instructed by you and in accordance with this Agreement. We do not process data for our own purposes.
              </p>
            </motion.section>

            {/* Section 4: Lawful Basis */}
            <motion.section
              ref={(el) => { sectionRefs.current['lawful-basis'] = el; }}
              id="lawful-basis"
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
                <span>4. Lawful Basis</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                The Controller is responsible for establishing a lawful basis for processing personal data under GDPR Article 6. Common lawful bases include:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Consent of the data subject</li>
                <li>Performance of a contract</li>
                <li>Compliance with a legal obligation</li>
                <li>Legitimate interests</li>
              </ul>
            </motion.section>

            {/* Section 5: Data Subject Rights */}
            <motion.section
              ref={(el) => { sectionRefs.current['data-subject-rights'] = el; }}
              id="data-subject-rights"
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
                <span>5. Data Subject Rights</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We assist the Controller in fulfilling data subject rights requests, including:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Right of access</li>
                <li>Right to rectification</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object</li>
              </ul>
            </motion.section>

            {/* Section 6: Sub-Processors */}
            <motion.section
              ref={(el) => { sectionRefs.current['sub-processors'] = el; }}
              id="sub-processors"
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
                <span>6. Sub-Processors</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We may engage sub-processors to provide the Service. All sub-processors are bound by the same data protection obligations. Current sub-processors:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li><strong>AWS</strong>: Cloud hosting and storage (US/EU)</li>
                <li><strong>Stripe</strong>: Payment processing</li>
                <li><strong>SendGrid</strong>: Transactional email delivery</li>
              </ul>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We will notify you of any new sub-processors and give you 30 days to object.
              </p>
            </motion.section>

            {/* Section 7: International Transfers */}
            <motion.section
              ref={(el) => { sectionRefs.current['international-transfers'] = el; }}
              id="international-transfers"
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
                <span>7. International Transfers</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Personal data may be transferred outside the EEA. We ensure adequate protection through:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions (for countries with recognized data protection standards)</li>
                <li>Binding Corporate Rules (where applicable)</li>
              </ul>
            </motion.section>

            {/* Section 8: Security Measures */}
            <motion.section
              ref={(el) => { sectionRefs.current['security-measures'] = el; }}
              id="security-measures"
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
                <span>8. Security Measures</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We implement appropriate technical and organizational measures to protect personal data, including:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>AES-256 encryption at rest</li>
                <li>TLS 1.3 encryption in transit</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication</li>
                <li>Backup and disaster recovery procedures</li>
              </ul>
            </motion.section>

            {/* Section 9: Data Breach Notification */}
            <motion.section
              ref={(el) => { sectionRefs.current['data-breach-notification'] = el; }}
              id="data-breach-notification"
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
                <span>9. Data Breach Notification</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                In the event of a personal data breach, we will:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Notify the Controller without undue delay (within 72 hours)</li>
                <li>Provide details of the breach, affected data, and mitigation measures</li>
                <li>Assist the Controller in notifying data subjects if required</li>
                <li>Assist the Controller in notifying supervisory authorities</li>
              </ul>
            </motion.section>

            {/* Section 10: Audit Rights */}
            <motion.section
              ref={(el) => { sectionRefs.current['audit-rights'] = el; }}
              id="audit-rights"
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
                <span>10. Audit Rights</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                The Controller has the right to audit our compliance with this Agreement. Audits must:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Be scheduled at least 30 days in advance</li>
                <li>Be conducted during business hours</li>
                <li>Not interfere with our operations</li>
                <li>Be limited to information relevant to this Agreement</li>
                <li>Respect confidentiality obligations</li>
              </ul>
            </motion.section>

            {/* Section 11: Term and Termination */}
            <motion.section
              ref={(el) => { sectionRefs.current['term-termination'] = el; }}
              id="term-termination"
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
                <span>11. Term and Termination</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                This Agreement remains in effect while the Controller uses DocuTrackr. Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>We will delete or return all personal data within 30 days</li>
                <li>We will delete existing copies unless storage is required by law</li>
                <li>Confidentiality obligations continue after termination</li>
              </ul>
            </motion.section>

            {/* Section 12: Signatures */}
            <motion.section
              ref={(el) => { sectionRefs.current['signatures'] = el; }}
              id="signatures"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="glass-card mb-6"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group" style={{ color: textColor }}>
                <span>12. Signatures</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                This Agreement is effective when you use DocuTrackr. For a signed PDF version suitable for your records, please contact us.
              </p>
              <motion.a
                href="mailto:legal@docutrackr.com?subject=Request%20DPA%20PDF"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 glass-btn-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: theme === 'light' ? '#3B82F6' : '#60A5FA',
                  color: '#FFFFFF',
                  border: 'none',
                  textDecoration: 'none',
                }}
              >
                <Download className="w-5 h-5" />
                Request PDF Version
              </motion.a>
            </motion.section>
          </div>

          {/* Footer CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
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
                Questions about our data processing practices? We're here to help.
              </p>
              <motion.a
                href="mailto:legal@docutrackr.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 glass-btn-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: theme === 'light' ? '#3B82F6' : '#60A5FA',
                  color: '#FFFFFF',
                  border: 'none',
                  textDecoration: 'none',
                }}
              >
                <Mail className="w-5 h-5" />
                Email Legal Team
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

