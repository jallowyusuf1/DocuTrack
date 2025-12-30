import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText,
  Mail,
  Link as LinkIcon,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SECTIONS = [
  { id: 'acceptance-of-terms', title: 'Acceptance of Terms' },
  { id: 'account-responsibilities', title: 'Account Responsibilities' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'subscription-billing', title: 'Subscription & Billing' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'service-modifications', title: 'Service Modifications' },
  { id: 'termination', title: 'Termination' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'limitation-of-liability', title: 'Limitation of Liability' },
  { id: 'dispute-resolution', title: 'Dispute Resolution' },
  { id: 'contact', title: 'Contact' },
];

export default function TermsOfService() {
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
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Terms of Service</h1>
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
                Terms of Service
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
              <span className="text-2xl flex-shrink-0">📜</span>
              <p className="text-sm md:text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}>
                By using DocuTrackr, you agree to these terms. You're responsible for keeping your account secure. We provide the service 'as is' and can make changes. You can cancel anytime.
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
            {/* Section 1: Acceptance of Terms */}
            <motion.section
              ref={(el) => { sectionRefs.current['acceptance-of-terms'] = el; }}
              id="acceptance-of-terms"
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
                <span>1. Acceptance of Terms</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                By accessing or using DocuTrackr ("the Service"), you agree to these Terms of Service. If you don't agree, you may not use the Service.
              </p>
              <div className="space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <p><strong>Effective Date</strong>: January 1, 2025</p>
                <p><strong>Agreement Between</strong>: You (the "User") and DocuTrackr, Inc. (the "Company")</p>
              </div>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <strong>Changes</strong>: We may update these terms. Continued use after changes means you accept them. We'll notify you of significant changes via email.
              </p>
            </motion.section>

            {/* Section 2: Account Responsibilities */}
            <motion.section
              ref={(el) => { sectionRefs.current['account-responsibilities'] = el; }}
              id="account-responsibilities"
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
                <span>2. Account Responsibilities</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Creating an Account:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>You must be 18+ (or 13+ with parental consent)</li>
                <li>Provide accurate information</li>
                <li>Choose a strong password</li>
                <li>Enable two-factor authentication (recommended)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Your Responsibilities:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Keep your account secure</li>
                <li>Don't share your password</li>
                <li>Report suspicious activity immediately</li>
                <li>You're responsible for all activity on your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Account Suspension:
              </h3>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We may suspend accounts that violate these terms, show signs of fraud or abuse, or remain inactive for 2+ years (with 60-day notice).
              </p>
            </motion.section>

            {/* Section 3: Acceptable Use */}
            <motion.section
              ref={(el) => { sectionRefs.current['acceptable-use'] = el; }}
              id="acceptable-use"
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
                <span>3. Acceptable Use</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <p className="text-base font-semibold mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                You MAY:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Use DocuTrackr for personal or business document management</li>
                <li>Share documents with trusted family/team members</li>
                <li>Access the Service from any device</li>
              </ul>

              <p className="text-base font-semibold mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                You MAY NOT:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Violate laws or regulations</li>
                <li>Upload illegal content (stolen IDs, forged documents, etc.)</li>
                <li>Share accounts (each user needs their own account)</li>
                <li>Reverse-engineer or scrape our software</li>
                <li>Use the Service to spam, phish, or harass</li>
                <li>Attempt to hack, breach, or damage our systems</li>
                <li>Resell or sublicense the Service</li>
            </ul>

              <p className="text-base font-semibold" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                Consequences: Violations may result in immediate account termination without refund.
              </p>
            </motion.section>

            {/* Section 4: Subscription & Billing */}
            <motion.section
              ref={(el) => { sectionRefs.current['subscription-billing'] = el; }}
              id="subscription-billing"
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
                <span>4. Subscription & Billing</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Free Plan:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Up to 25 documents</li>
                <li>Basic features</li>
                <li>No credit card required</li>
                <li>Can upgrade anytime</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Pro Plans:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Billed monthly or annually</li>
                <li>Prices: $9.99/month (Individual), $19.99/month (Family up to 6)</li>
                <li>Auto-renewal unless canceled</li>
                <li>Prorated refunds for annual plans (within 30 days)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Payment:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Processed securely via Stripe</li>
                <li>You authorize recurring charges</li>
                <li>Update payment info to avoid service interruption</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Cancellation:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Cancel anytime (Settings &gt; Subscription &gt; Cancel)</li>
                <li>Access continues until end of billing period</li>
                <li>No refunds for partial months (except 30-day guarantee)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Refund Policy:
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>30-day money-back guarantee (for new subscriptions)</li>
                <li>No refunds after 30 days</li>
                <li>Exceptions for service outages (pro-rated credit)</li>
              </ul>
            </motion.section>

            {/* Section 5: Intellectual Property */}
            <motion.section
              ref={(el) => { sectionRefs.current['intellectual-property'] = el; }}
              id="intellectual-property"
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
                <span>5. Intellectual Property</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Our IP:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>DocuTrackr name, logo, design, and code are our property</li>
                <li>Protected by copyright, trademark, and patent laws</li>
                <li>You may not copy, modify, or distribute without permission</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Your Content:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>You own your documents and data</li>
                <li>You grant us a limited license to store and process your data (to provide the Service)</li>
                <li>We never claim ownership of your documents</li>
                <li>You can export and delete your data anytime</li>
              </ul>
            </motion.section>

            {/* Section 6: Service Modifications */}
            <motion.section
              ref={(el) => { sectionRefs.current['service-modifications'] = el; }}
              id="service-modifications"
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
                <span>6. Service Availability & Modifications</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Uptime:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>We strive for 99.9% uptime</li>
                <li>Planned maintenance announced 24+ hours in advance</li>
                <li>Emergency maintenance may occur without notice</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Service Changes:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>We may add, modify, or discontinue features</li>
                <li>We'll notify users of major changes</li>
                <li>Continued use means acceptance</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                No Guarantees:
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Service provided "as is"</li>
                <li>We don't guarantee uninterrupted or error-free operation</li>
                <li>We're not responsible for data loss (though we maintain backups)</li>
            </ul>
            </motion.section>

            {/* Section 7: Termination */}
            <motion.section
              ref={(el) => { sectionRefs.current['termination'] = el; }}
              id="termination"
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
                <span>7. Account Termination</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                By You:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Delete your account anytime (Settings &gt; Delete Account)</li>
                <li>All data deleted within 30 days</li>
                <li>No refunds for remaining subscription time (except 30-day guarantee)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                By Us:
              </h3>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                We may terminate accounts that violate these terms, engage in illegal activity, or remain inactive for 2+ years (after 60-day notice).
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Upon Termination:
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Your access ends immediately</li>
                <li>You have 30 days to export your data</li>
                <li>After 30 days, all data is permanently deleted</li>
              </ul>
            </motion.section>

            {/* Section 8: Disclaimers */}
            <motion.section
              ref={(el) => { sectionRefs.current['disclaimers'] = el; }}
              id="disclaimers"
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
                <span>8. Disclaimers</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Service "As Is":
              </h3>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                DocuTrackr is provided "as is" without warranties of any kind, express or implied. We don't guarantee the Service will meet your requirements, be uninterrupted or error-free, or that bugs will be corrected.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Not Legal Advice:
              </h3>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                DocuTrackr helps you organize documents but doesn't provide legal, financial, or immigration advice. Consult professionals for these matters.
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                OCR Accuracy:
              </h3>
              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                While our OCR is 95%+ accurate, you should verify all extracted data. We're not liable for errors in OCR extraction.
              </p>
            </motion.section>

            {/* Section 9: Limitation of Liability */}
            <motion.section
              ref={(el) => { sectionRefs.current['limitation-of-liability'] = el; }}
              id="limitation-of-liability"
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
                <span>9. Limitation of Liability</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <p className="text-base font-semibold mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                Maximum Liability:
              </p>
              <p className="text-base mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                Our total liability is limited to the amount you paid us in the past 12 months (or $100, whichever is greater).
              </p>

              <p className="text-base font-semibold mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}>
                Not Liable For:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Lost profits, data, or business opportunities</li>
                <li>Damages from service interruptions</li>
                <li>Third-party actions (stolen documents, identity theft)</li>
                <li>User errors or negligence</li>
              </ul>

              <p className="text-base" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <strong>Exceptions</strong>: Nothing limits liability for gross negligence, fraud, or death/personal injury.
              </p>
            </motion.section>

            {/* Section 10: Dispute Resolution */}
            <motion.section
              ref={(el) => { sectionRefs.current['dispute-resolution'] = el; }}
              id="dispute-resolution"
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
                <span>10. Dispute Resolution</span>
                <LinkIcon className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
              
              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Informal Resolution:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Contact us first: legal@docutrackr.com</li>
                <li>We'll try to resolve within 60 days</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Arbitration:
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>If we can't resolve, disputes go to binding arbitration (not court)</li>
                <li>Arbitrator decision is final</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Class Action Waiver:
              </h3>
              <p className="text-base mb-4" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                You agree to resolve disputes individually (no class actions).
              </p>

              <h3 className="text-xl font-semibold mb-4" style={{ color: textColor }}>
                Exceptions:
              </h3>
              <ul className="list-disc list-inside space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <li>Small claims court (for claims &lt;$10,000)</li>
                <li>Injunctive relief (to stop ongoing harm)</li>
              </ul>
            </motion.section>

            {/* Section 11: Contact */}
            <motion.section
              ref={(el) => { sectionRefs.current['contact'] = el; }}
              id="contact"
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
                Questions about these terms?
              </p>
              <div className="space-y-2" style={{
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
              }}>
                <p><strong>Email</strong>: <a href="mailto:legal@docutrackr.com" className="underline hover:opacity-70 transition-opacity" style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }}>legal@docutrackr.com</a></p>
                <p className="mt-4">Response time: Within 5 business days.</p>
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
                Have questions about these terms? We're happy to explain anything.
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
                }}
              >
                <Mail className="w-5 h-5" />
                Email Legal Team
              </motion.a>
            </div>

            {/* Related Links */}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 justify-center mt-8 flex-wrap`}>
              {['Privacy Policy', 'Acceptable Use', 'Security', 'Cookie Policy'].map((link) => (
                <a
                  key={link}
                  href={link === 'Privacy Policy' ? '/privacy' : link === 'Security' ? '/security' : link === 'Cookie Policy' ? '/cookies' : '#'}
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
