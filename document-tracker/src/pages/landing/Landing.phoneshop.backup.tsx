import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Shield,
  Camera,
  FolderSearch,
  Menu,
  X,
  Lock,
  Calendar,
  Globe,
  Check,
  ChevronDown,
  Smartphone,
  Laptop,
  TrendingUp,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Screenshot carousel for phone mockup - Real content that switches
  const screenshots = [
    {
      id: 1,
      title: 'Dashboard',
      color: 'rgba(139, 92, 246, 0.2)',
      content: [
        { type: 'stat', label: 'Upcoming', value: '7 days', icon: Calendar },
        { type: 'card', text: 'US Passport', subtext: 'Expires soon' },
        { type: 'card', text: 'Driver License', subtext: '45 days left' },
      ],
    },
    {
      id: 2,
      title: 'Documents',
      color: 'rgba(59, 130, 246, 0.2)',
      content: [
        { type: 'stat', label: 'Total', value: '12 docs', icon: FolderSearch },
        { type: 'card', text: 'Insurance Policy', subtext: '120 days left' },
        { type: 'card', text: 'Visa Document', subtext: '30 days left' },
      ],
    },
    {
      id: 3,
      title: 'Calendar',
      color: 'rgba(16, 185, 129, 0.2)',
      content: [
        { type: 'stat', label: 'This Month', value: '3 expiring', icon: Bell },
        { type: 'card', text: 'Membership Card', subtext: '15 days left' },
        { type: 'card', text: 'Warranty', subtext: '60 days left' },
      ],
    },
  ];
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [screenshots.length]);

  // How it works tabs
  const tabs = [
    { id: 'scan', label: 'Scan', icon: Camera, description: 'Capture documents instantly' },
    { id: 'organize', label: 'Organize', icon: FolderSearch, description: 'Auto-categorize everything' },
    { id: 'track', label: 'Track', icon: Bell, description: 'Never miss an expiration' },
  ];

  // Features dropdown
  const features = [
    { id: 'scan', label: 'Scan documents', icon: Camera },
    { id: 'reminders', label: 'Get reminders', icon: Bell },
    { id: 'lock', label: 'Lock sensitive files', icon: Lock },
    { id: 'share', label: 'Share with family', icon: Globe },
  ];

  // Brand colors
  const brandColors = [
    { name: 'Primary', color: '#8B5CF6' },
    { name: 'Secondary', color: '#6D28D9' },
    { name: 'Accent', color: '#EC4899' },
    { name: 'Dark', color: '#1A1625' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#1a1625' }}>
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'backdrop-blur-xl bg-black/20' : 'bg-transparent'
        }`}
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DocuTrackr</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/login');
                }}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/signup');
                }}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                }}
              >
                Sign up
              </motion.button>
            </div>

            {/* Mobile Menu Button - Circular */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                triggerHaptic('light');
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-white/10 backdrop-blur-xl"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          >
            <div className="px-4 py-4 space-y-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                }}
              >
                Sign up
              </motion.button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section - Bento Grid */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Large Card - Phone Mockup (Left, Tall) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-1 lg:col-span-1 lg:row-span-3 rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                border: '2px solid rgba(139, 92, 246, 0.5)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
              }}
            >
              {/* Compelling Hook Text Above Phone */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mb-6"
              >
                <motion.h3
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight"
                >
                  Never Lose Track of
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    }}
                  >
                    What Matters Most
                  </span>
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-sm md:text-base text-white/70 mt-2 max-w-md mx-auto"
                >
                  Track passports, licenses, insurance, and more. Get smart reminders before anything expires.
                </motion.p>
              </motion.div>

              {/* Phone Mockup */}
              <div className="relative mx-auto" style={{ width: '280px', maxWidth: '100%' }}>
                {/* Phone Frame */}
                <div
                  className="relative rounded-[3rem] p-3 mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {/* Screen */}
                  <div
                    className="rounded-[2.5rem] overflow-hidden relative"
                    style={{
                      background: 'linear-gradient(135deg, #1A1625 0%, #231D33 100%)',
                      aspectRatio: '9/19.5',
                    }}
                  >
                    {/* Animated Screenshot Carousel */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentScreenshot}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 p-4"
                      >
                        <div
                          className="w-full h-full rounded-2xl p-4 flex flex-col"
                          style={{
                            background: screenshots[currentScreenshot].color,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                                }}
                              >
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-white text-sm font-semibold">DocuTrackr</span>
                            </div>
                          </div>

                          {/* Content - Switching Content */}
                          <div className="flex-1 space-y-3 overflow-y-auto">
                            {/* Stat Card */}
                            {screenshots[currentScreenshot].content[0] && (
                              <div
                                className="h-16 rounded-xl p-3 flex items-center gap-3"
                                style={{ background: 'rgba(255, 255, 255, 0.12)' }}
                              >
                                {screenshots[currentScreenshot].content[0].icon && (
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                      background: 'rgba(139, 92, 246, 0.3)',
                                    }}
                                  >
                                    {(() => {
                                      const Icon = screenshots[currentScreenshot].content[0].icon;
                                      return Icon ? <Icon className="w-5 h-5" style={{ color: '#8B5CF6' }} /> : null;
                                    })()}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="text-xs text-white/60">
                                    {screenshots[currentScreenshot].content[0].label}
                                  </div>
                                  <div className="text-sm font-semibold text-white">
                                    {screenshots[currentScreenshot].content[0].value}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Document Cards */}
                            {screenshots[currentScreenshot].content.slice(1).map((item, index) => (
                              <div
                                key={index}
                                className="h-14 rounded-xl p-3 flex items-center gap-3"
                                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                              >
                                <div className="w-10 h-10 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-white">{item.text}</div>
                                  <div className="text-xs text-white/60">{item.subtext}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Title */}
                          <div className="text-center mt-4">
                            <div className="text-sm font-semibold text-white">
                              {screenshots[currentScreenshot].title}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      triggerHaptic('light');
                      setCurrentScreenshot(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentScreenshot ? 'w-6' : ''
                    }`}
                    style={{
                      background: index === currentScreenshot ? '#8B5CF6' : 'rgba(139, 92, 246, 0.3)',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Top-Right Card - Stats with Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-1 lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-between h-full">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
                  <div className="text-sm text-white/60">Documents Tracked</div>
                </div>
                {/* Circular Progress Chart */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="rgba(139, 92, 246, 0.2)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.85 }}
                      transition={{ duration: 2, delay: 0.5 }}
                      strokeDasharray={`${2 * Math.PI * 40}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">85%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Middle-Right Card - Catchy Hook */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-1 lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                border: '2px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              }}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)`,
                  }}
                />
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-block mb-4"
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                        boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
                      }}
                    >
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Never Miss Another
                    <br />
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      }}
                    >
                      Deadline Again
                    </span>
                  </h3>
                  
                  <p className="text-lg text-white/80 mb-6 max-w-md mx-auto">
                    Join 50,000+ users who never worry about expired documents
                  </p>
                  
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">98.2%</div>
                      <div className="text-white/60">On-Time Rate</div>
                    </div>
                    <div className="w-px h-12 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">$1.2M+</div>
                      <div className="text-white/60">Saved in Fees</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Bottom-Right Card - Mini Laptop */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-1 lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Complete Control</h3>
                <Laptop className="w-6 h-6" style={{ color: '#8B5CF6' }} />
              </div>
              {/* Mini Laptop Mockup */}
              <div className="relative" style={{ width: '200px', maxWidth: '100%' }}>
                <div
                  className="rounded-lg p-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    className="rounded-md overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #1A1625, #231D33)',
                      aspectRatio: '16/10',
                    }}
                  >
                    {/* Settings Page Preview */}
                    <div className="p-3 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-2 rounded" style={{ background: 'rgba(139, 92, 246, 0.3)' }} />
                        <div className="h-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                        <div className="h-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                        <div className="h-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-sm"
                  style={{
                    width: '60%',
                    height: '4px',
                    background: '#1a1a1a',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative py-24 px-4 sm:px-6 lg:px-8"
        style={{
          background: '#1a1625',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            How It Works
          </motion.h2>

          {/* Pills/Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab(tab.id);
                  }}
                  className="px-8 py-4 rounded-full text-base font-semibold flex items-center gap-3 transition-all"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                      : 'rgba(42, 38, 64, 0.6)',
                    border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    boxShadow: isActive ? '0 8px 32px rgba(139, 92, 246, 0.4)' : 'none',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>

          {/* Active Tab Content Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-xl text-white/80">
                {tabs.find((t) => t.id === activeTab)?.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-24 px-4 sm:px-6 lg:px-8"
        style={{
          background: '#1a1625',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            Features
          </motion.h2>

          {/* Dropdown Menu Style */}
          <div className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isExpanded = expandedFeature === feature.id;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('light');
                      setExpandedFeature(isExpanded ? null : feature.id);
                    }}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                      </div>
                      <span className="text-lg font-semibold text-white">{feature.label}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-white/60" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 pt-2">
                          <p className="text-white/70">
                            {feature.id === 'scan' && 'Capture documents instantly with your camera or upload from gallery.'}
                            {feature.id === 'reminders' && 'Get smart alerts 30, 7, and 1 day before documents expire.'}
                            {feature.id === 'lock' && 'Protect sensitive documents with password encryption.'}
                            {feature.id === 'share' && 'Share documents securely with family members.'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer
        className="relative py-12 px-4 sm:px-6 lg:px-8 border-t"
        style={{
          background: '#1a1625',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DocuTrackr</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <span>© 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

