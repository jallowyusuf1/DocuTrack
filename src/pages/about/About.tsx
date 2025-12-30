import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail,
  Twitter,
  MessageCircle,
  Target,
  Lock,
  Sparkles,
  Rocket,
  Users,
  Globe,
  FileText,
  Star,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const VALUES = [
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your documents are yours alone. We use end-to-end encryption, never sell your data, and you can delete everything anytime.'
  },
  {
    icon: '✨',
    title: 'Designed for Everyone',
    description: 'Whether you\'re a busy parent, frequent traveler, or small business owner—DocuTrackr works for you. Simple enough for anyone, powerful enough for everything.'
  },
  {
    icon: '🚀',
    title: 'Always Improving',
    description: 'We ship updates every week based on your feedback. New features, better performance, and thoughtful refinements—because your time matters.'
  }
];

const STATS = [
  { icon: Users, label: 'Active users', value: '10k+', color: '#3B82F6' },
  { icon: Globe, label: 'Countries', value: '35+', color: '#10B981' },
  { icon: FileText, label: 'Documents tracked', value: '3M+', color: '#F97316' },
  { icon: Star, label: 'App Store rating', value: '4.8', color: '#EF4444' },
];

const TIMELINE = [
  {
    year: '2019',
    title: 'The Idea',
    description: 'Founder misses passport renewal. Realizes millions face the same problem.'
  },
  {
    year: '2020',
    title: 'First Prototype',
    description: 'Built MVP during lockdown. Tested with family and friends.'
  },
  {
    year: '2021',
    title: 'Public Launch',
    description: 'Released to the App Store. 1,000 users in first month.'
  },
  {
    year: '2022',
    title: 'Going Global',
    description: 'Added multi-language OCR. Expanded to 35+ countries.'
  },
  {
    year: '2023',
    title: 'Family Sharing',
    description: 'Launched secure family features. Hit 10,000 active users.'
  },
  {
    year: '2024',
    title: 'Enterprise Ready',
    description: 'Introduced team plans. SOC 2 certified.'
  },
  {
    year: '2025',
    title: 'What\'s Next?',
    description: 'AI-powered insights, document analysis, and more on the way.'
  },
];

const CONTACTS = [
  {
    icon: Mail,
    label: 'Email us',
    value: 'yusufdiallo11@gmail.com',
    href: 'mailto:yusufdiallo11@gmail.com',
    color: '#3B82F6'
  },
  {
    icon: Twitter,
    label: 'Follow us',
    value: '@docutrackr',
    href: 'https://twitter.com/docutrackr',
    color: '#1DA1F2'
  },
  {
    icon: MessageCircle,
    label: 'Support',
    value: 'muhajireenconnect@gmail.com',
    href: 'mailto:muhajireenconnect@gmail.com',
    color: '#10B981'
  },
];

export default function About() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const bgColor = theme === 'light' ? '#FFFFFF' : '#000000';
  const textColor = theme === 'light' ? '#000000' : '#FFFFFF';

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
            <h1 className="text-lg font-bold" style={{ color: textColor }}>About Us</h1>
          )}

          {/* Right: Theme Toggle */}
          <ThemeToggle />
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-[1000px] mx-auto text-center"
        style={{
          paddingTop: isMobile ? '88px' : isTablet ? '104px' : '120px',
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingBottom: isMobile ? '48px' : isTablet ? '64px' : '80px',
        }}
      >
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
          Our Story
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-bold mb-6"
          style={{
            fontSize: isMobile ? '32px' : isTablet ? '40px' : '48px',
            color: textColor,
            lineHeight: 1.2,
          }}
        >
          Building calm in document chaos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl mx-auto"
          style={{ 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            maxWidth: '700px',
            lineHeight: 1.6,
            marginBottom: '64px',
          }}
        >
          DocuTrackr was born from a simple frustration: missing renewal deadlines shouldn't be this hard.
        </motion.p>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-[900px] mx-auto mb-16"
        style={{
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
        }}
      >
        <div className="glass-card text-center" style={{ 
          padding: isMobile ? '32px' : '40px',
          borderRadius: '24px',
        }}>
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: textColor }}>
            Our Mission
          </h2>
          <p 
            className="text-base md:text-lg mx-auto"
            style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.7,
              maxWidth: '700px',
            }}
          >
            We believe managing important documents should be simple, secure, and stress-free. DocuTrackr helps busy people and families track passports, IDs, insurance, visas, permits, and more—with automatic reminders, instant OCR capture, and bank-level security. No more missed deadlines. No more frantic searching. Just calm, organized control.
          </p>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-[1200px] mx-auto mb-20"
        style={{
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
        }}
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: textColor }}>
            What We Stand For
          </h2>
          <p className="text-base" style={{ 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
          }}>
            The principles that guide everything we build
          </p>
        </div>

        <div className={`grid gap-6 ${
          isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'
        }`}>
          {VALUES.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="glass-card text-center"
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                marginBottom: isMobile ? '24px' : '0',
              }}
            >
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: textColor }}>
                {value.title}
              </h3>
              <p 
                className="text-base"
                style={{ 
                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.6,
                }}
              >
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="max-w-[1000px] mx-auto mb-20"
        style={{
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
        }}
      >
        <div className="glass-card" style={{ 
          padding: isMobile ? '32px' : '48px',
          borderRadius: '24px',
        }}>
          <div className={`grid gap-8 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-4'
          }`}>
            {STATS.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="text-center"
                >
                  <IconComponent 
                    className="w-8 h-8 mx-auto mb-3" 
                    style={{ color: stat.color }}
                  />
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ 
                      color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="max-w-[900px] mx-auto mb-20"
        style={{
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
        }}
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: textColor }}>
            Our Journey
          </h2>
          <p className="text-base" style={{ 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
          }}>
            From idea to reality
          </p>
        </div>

        <div className="space-y-6">
          {TIMELINE.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + index * 0.1 }}
              className={`glass-card ${isMobile ? 'flex-col' : 'flex'} items-start gap-6`}
              style={{
                padding: isMobile ? '24px' : '32px',
                borderRadius: '20px',
                display: 'flex',
              }}
            >
              <div className="glass-pill flex-shrink-0" style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: theme === 'light' 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'rgba(96, 165, 250, 0.2)',
                border: theme === 'light'
                  ? '1px solid rgba(59, 130, 246, 0.3)'
                  : '1px solid rgba(96, 165, 250, 0.4)',
                color: theme === 'light' ? '#3B82F6' : '#60A5FA',
                fontWeight: 600,
                fontSize: '14px',
              }}>
                {milestone.year}
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: textColor }}>
                  {milestone.title}
                </h3>
                <p 
                  className="text-sm md:text-base"
                  style={{ 
                    color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    lineHeight: 1.6,
                  }}
                >
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Careers CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
        className="max-w-[800px] mx-auto mb-20"
        style={{
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
        }}
      >
        <div className="glass-card text-center" style={{ 
          padding: isMobile ? '32px' : '48px',
          borderRadius: '24px',
        }}>
          <div className="text-6xl mb-6">💼</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: textColor }}>
            Join Our Team
          </h2>
          <p 
            className="text-base md:text-lg mb-6"
            style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.6,
            }}
          >
            We're a small team building something people love. If you care about privacy, design, and making software that just works—let's talk.
          </p>
          <motion.a
            href="mailto:yusufdiallo11@gmail.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 glass-btn-primary"
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              marginTop: '24px',
              background: theme === 'light' ? '#3B82F6' : '#60A5FA',
              color: '#FFFFFF',
              border: 'none',
            }}
          >
            <Briefcase className="w-5 h-5" />
            View Open Positions
          </motion.a>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1 }}
        className="max-w-[700px] mx-auto mb-20"
        style={{
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
        }}
      >
        <div className="glass-card text-center" style={{ 
          padding: isMobile ? '32px' : '40px',
          borderRadius: '24px',
        }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
            Get in Touch
          </h2>
          <p 
            className="text-base mb-8"
            style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Questions? Feedback? Partnership inquiries? We'd love to hear from you.
          </p>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {CONTACTS.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <motion.a
                  key={index}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-card text-center"
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                  }}
                >
                  <IconComponent 
                    className="w-8 h-8 mx-auto mb-3" 
                    style={{ color: contact.color }}
                  />
                  <div 
                    className="text-xs font-semibold mb-1 uppercase tracking-wide"
                    style={{ 
                      color: theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    {contact.label}
                  </div>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: textColor }}
                  >
                    {contact.value}
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer 
        className="glass-card mt-20"
        style={{
          padding: '48px 16px 24px',
          maxWidth: '1200px',
          margin: '80px auto 0',
          borderRadius: '20px 20px 0 0',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 justify-center mb-6`}>
            <a href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            }}>
              Product
            </a>
            <a href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            }}>
              Legal
            </a>
            <a href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            }}>
              Support
            </a>
            <a href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            }}>
              Social
            </a>
          </div>
          <p 
            className="text-center text-sm"
            style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
              marginTop: '24px',
            }}
          >
            © 2025 DocuTrackr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

