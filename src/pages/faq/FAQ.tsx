import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  Mail,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

type Category = 'all' | 'getting-started' | 'features' | 'billing' | 'security' | 'technical';

interface FAQItem {
  id: string;
  category: Category;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    category: 'getting-started',
    question: 'How do I create an account?',
    answer: 'You can create a free account by clicking "Get Started" on our homepage. Just provide your email, create a password, and verify your email address. You\'ll be set up in under 2 minutes!'
  },
  {
    id: 'gs-2',
    category: 'getting-started',
    question: 'Is DocuTrackr free to use?',
    answer: 'Yes! DocuTrackr offers a free tier that includes up to 25 documents, basic OCR, and expiry reminders. We also offer Pro plans with unlimited documents, advanced features, and family sharing starting at $9.99/month.'
  },
  {
    id: 'gs-3',
    category: 'getting-started',
    question: 'How do I add my first document?',
    answer: 'Click the "+ Add" button in the top navigation. You can either scan a document with your camera (automatic OCR extraction) or enter information manually. We support 35+ document types including passports, IDs, visas, insurance cards, and more.'
  },
  // Features
  {
    id: 'feat-1',
    category: 'features',
    question: 'What is OCR and how does it work?',
    answer: 'OCR (Optical Character Recognition) automatically extracts text from your document photos. Simply snap a picture, and DocuTrackr will read and fill in fields like name, document number, issue date, and expiry date. Our accuracy rate is 95%+, and you can always edit the extracted data.'
  },
  {
    id: 'feat-2',
    category: 'features',
    question: 'Can I share documents with my family?',
    answer: 'Absolutely! With Family Sharing, you can securely share documents with household members. You control who sees what, and can set view-only or edit permissions. All shared data is encrypted end-to-end.'
  },
  {
    id: 'feat-3',
    category: 'features',
    question: 'Do you have a mobile app?',
    answer: 'Yes! DocuTrackr is available on iOS (App Store) and Android (Google Play). We also have a web app that works on any device. Your documents sync automatically across all platforms.'
  },
  {
    id: 'feat-4',
    category: 'features',
    question: 'How do reminders work?',
    answer: 'We send smart reminders at 30, 7, and 1 day before expiration (you can customize these). Reminders come via push notification, email, or SMS. You\'ll never miss a renewal deadline again!'
  },
  // Billing
  {
    id: 'bill-1',
    category: 'billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, and Apple Pay. Payments are processed securely through Stripe.'
  },
  {
    id: 'bill-2',
    category: 'billing',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel anytime from your account settings. You\'ll retain Pro access until the end of your current billing period. No questions asked, no cancellation fees.'
  },
  {
    id: 'bill-3',
    category: 'billing',
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied within the first 30 days, contact us for a full refund.'
  },
  {
    id: 'bill-4',
    category: 'billing',
    question: 'Is there a family plan?',
    answer: 'Yes! Our Pro Family plan covers up to 6 family members for $19.99/month. Each member gets their own account with unlimited documents and all Pro features.'
  },
  // Security
  {
    id: 'sec-1',
    category: 'security',
    question: 'How secure is my data?',
    answer: 'Your data is encrypted end-to-end using AES-256 encryption (bank-level). We never have access to your unencrypted data. All connections use HTTPS, and we\'re SOC 2 Type II certified.'
  },
  {
    id: 'sec-2',
    category: 'security',
    question: 'Where is my data stored?',
    answer: 'Your data is stored on secure AWS servers in the US (or EU if you\'re based in Europe). We maintain multiple backups and have 99.9% uptime.'
  },
  {
    id: 'sec-3',
    category: 'security',
    question: 'Do you sell my data?',
    answer: 'Never. We don\'t sell, share, or monetize your personal data in any way. Your documents are yours alone. Read our full Privacy Policy for details.'
  },
  {
    id: 'sec-4',
    category: 'security',
    question: 'Can I delete my account?',
    answer: 'Yes, you can permanently delete your account and all data anytime from Settings > Account > Delete Account. Deletion is immediate and irreversible.'
  },
  // Technical
  {
    id: 'tech-1',
    category: 'technical',
    question: 'Which document types are supported?',
    answer: 'We support 35+ types including: Passports, Driver Licenses, National IDs, Visas, Travel Documents, Birth Certificates, Marriage Certificates, Insurance Cards (health, auto, home), Vaccination Records, Permits, Professional Licenses, Vehicle Registrations, Property Deeds, Contracts, and more. You can also create custom document types!'
  },
  {
    id: 'tech-2',
    category: 'technical',
    question: 'What file formats can I upload?',
    answer: 'We support JPG, PNG, PDF, HEIC (iPhone photos), and WebP. Maximum file size is 25MB per document.'
  },
  {
    id: 'tech-3',
    category: 'technical',
    question: 'Does DocuTrackr work offline?',
    answer: 'Yes! With offline mode enabled, you can view, search, and browse your documents without internet. Any changes sync automatically when you reconnect.'
  },
  {
    id: 'tech-4',
    category: 'technical',
    question: 'I found a bug. How do I report it?',
    answer: 'Email us at support@docutrackr.com with details and screenshots. We typically respond within 24 hours and fix critical bugs within 48 hours.'
  },
];

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { id: 'features', label: 'Features', icon: '✨' },
  { id: 'billing', label: 'Billing', icon: '💳' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'technical', label: 'Technical', icon: '🛠️' },
];

const CATEGORY_NAMES: Record<Category, string> = {
  'all': 'All Questions',
  'getting-started': 'Getting Started',
  'features': 'Features',
  'billing': 'Billing & Pricing',
  'security': 'Security & Privacy',
  'technical': 'Technical Support',
};

const CATEGORY_ICONS: Record<Category, string> = {
  'all': '📋',
  'getting-started': '🚀',
  'features': '✨',
  'billing': '💳',
  'security': '🔒',
  'technical': '🛠️',
};

export default function FAQ() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
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

  const filteredFAQs = useMemo(() => {
    let filtered = FAQ_DATA;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const groupedFAQs = useMemo(() => {
    const groups: Record<Category, FAQItem[]> = {
      'all': [],
      'getting-started': [],
      'features': [],
      'billing': [],
      'security': [],
      'technical': [],
    };

    filteredFAQs.forEach(item => {
      if (selectedCategory === 'all') {
        groups[item.category].push(item);
      } else {
        groups[selectedCategory].push(item);
      }
    });

    return groups;
  }, [filteredFAQs, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
            <h1 className="text-lg font-bold" style={{ color: textColor }}>FAQ</h1>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
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
        {/* Header */}
        <div className="text-center mb-8">
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
            Support
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bold mb-4"
            style={{
              fontSize: isMobile ? '24px' : isTablet ? '28px' : '32px',
              color: textColor,
            }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg"
            style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Everything you need to know about DocuTrackr
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative mb-8"
        >
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10"
            style={{ 
              color: theme === 'light' ? '#3B82F6' : '#60A5FA',
            }}
          />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input"
            style={{
              height: isMobile ? '48px' : '52px',
              paddingLeft: '48px',
              paddingRight: '16px',
              fontSize: '16px',
              borderRadius: '14px',
              background: theme === 'light' 
                ? 'rgba(255, 255, 255, 0.85)' 
                : 'rgba(26, 26, 26, 0.85)',
              backdropFilter: 'blur(30px) saturate(110%)',
              WebkitBackdropFilter: 'blur(30px) saturate(110%)',
              border: theme === 'light'
                ? '1px solid rgba(0, 0, 0, 0.08)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: textColor,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme === 'light' ? '#3B82F6' : '#60A5FA';
              e.target.style.boxShadow = theme === 'light'
                ? '0 0 0 4px rgba(59, 130, 246, 0.1)'
                : '0 0 0 4px rgba(96, 165, 250, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme === 'light'
                ? 'rgba(0, 0, 0, 0.08)'
                : 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-3 mb-8"
          style={{ marginTop: '24px', marginBottom: '24px' }}
        >
          {CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className="glass-pill"
              style={{
                padding: '12px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 500,
                background: selectedCategory === category.id
                  ? (theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.3)')
                  : 'transparent',
                border: selectedCategory === category.id
                  ? (theme === 'light' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(96, 165, 250, 0.5)')
                  : (theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)'),
                color: selectedCategory === category.id
                  ? (theme === 'light' ? '#3B82F6' : '#60A5FA')
                  : textColor,
                backdropFilter: 'blur(30px) saturate(110%)',
                WebkitBackdropFilter: 'blur(30px) saturate(110%)',
              }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.section>

      {/* FAQ Content */}
      <div 
        className="max-w-[900px] mx-auto pb-20"
        style={{
          paddingLeft: isMobile ? '16px' : isTablet ? '32px' : '48px',
          paddingRight: isMobile ? '16px' : isTablet ? '32px' : '48px',
        }}
      >
        {selectedCategory === 'all' ? (
          // Show all categories grouped
          Object.entries(groupedFAQs).filter(([cat]) => cat !== 'all').map(([category, items]) => {
            if (items.length === 0) return null;
            const cat = category as Category;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                {/* Section Header */}
                <div className="glass-card mb-4" style={{ padding: '20px 24px', borderRadius: '16px' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: textColor }}>
                      {CATEGORY_NAMES[cat]}
                    </h2>
                  </div>
                </div>

                {/* FAQ Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <FAQAccordion
                      key={item.id}
                      item={item}
                      isOpen={openItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                      searchQuery={searchQuery}
                      theme={theme}
                      textColor={textColor}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })
        ) : (
          // Show single category
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Section Header */}
            <div className="glass-card mb-4" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CATEGORY_ICONS[selectedCategory]}</span>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: textColor }}>
                  {CATEGORY_NAMES[selectedCategory]}
                </h2>
              </div>
            </div>

            {/* FAQ Items */}
            {filteredFAQs.length === 0 ? (
              <div className="glass-card text-center py-12" style={{ padding: '40px' }}>
                <HelpCircle className="w-16 h-16 mx-auto mb-4" style={{ 
                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                }} />
                <p className="text-lg font-medium mb-2" style={{ color: textColor }}>
                  No results found
                </p>
                <p style={{ 
                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                }}>
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFAQs.map((item) => (
                  <FAQAccordion
                    key={item.id}
                    item={item}
                    isOpen={openItems.has(item.id)}
                    onToggle={() => toggleItem(item.id)}
                    searchQuery={searchQuery}
                    theme={theme}
                    textColor={textColor}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Still Have Questions Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-[700px] mx-auto px-4 md:px-6 lg:px-8 pb-20"
      >
        <div className="glass-card text-center" style={{ 
          padding: isMobile ? '32px' : '40px',
          borderRadius: '20px',
        }}>
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
            Still have questions?
          </h3>
          <p className="text-base mb-6" style={{ 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
          }}>
            We're here to help! Our support team typically responds within 24 hours.
          </p>
          <motion.a
            href="mailto:support@docutrackr.com"
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
            <Mail className="w-5 h-5" />
            Email Support
          </motion.a>
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

// Utility function to highlight search query in text
const highlightText = (text: string, query: string, theme: 'light' | 'dark') => {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} style={{
        background: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.3)',
        color: 'inherit',
        padding: '0 2px',
        borderRadius: '4px'
      }}>
        {part}
      </mark>
    ) : part
  );
};

interface FAQAccordionProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  theme: 'light' | 'dark';
  textColor: string;
}

function FAQAccordion({ item, isOpen, onToggle, searchQuery, theme, textColor }: FAQAccordionProps) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      className="glass-card cursor-pointer"
      style={{
        borderRadius: '16px',
        marginBottom: '12px',
        border: isOpen
          ? (theme === 'light' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(96, 165, 250, 0.4)')
          : (theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)'),
        background: isOpen
          ? (theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.9)')
          : (theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.85)'),
      }}
      onClick={onToggle}
      whileHover={{
        scale: isDesktop ? 1.01 : 1,
        borderColor: theme === 'light' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(96, 165, 250, 0.5)',
      }}
    >
      {/* Question */}
      <div 
        className="flex items-center justify-between"
        style={{ padding: '20px 24px' }}
      >
        <h3
          className="text-base md:text-lg font-medium flex-1 pr-4"
          style={{ color: textColor }}
        >
          {highlightText(item.question, searchQuery, theme)}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown 
            className="w-5 h-5 flex-shrink-0"
            style={{ 
              color: theme === 'light' ? '#3B82F6' : '#60A5FA'
            }}
          />
        </motion.div>
      </div>

      {/* Answer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div 
              style={{ 
                padding: '0 24px 20px 24px',
                fontSize: '15px',
                lineHeight: 1.6,
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {highlightText(item.answer, searchQuery, theme)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

