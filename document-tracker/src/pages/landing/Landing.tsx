import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Bell,
  Shield,
  Camera,
  Smartphone,
  Calendar,
  FolderSearch,
  ArrowRight,
  Play,
  Check,
  ChevronDown,
  Menu,
  X,
  Star,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, 50]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Get notified 30, 7, and 1 day before documents expire. Never miss a deadline again.',
    },
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Your documents are encrypted and stored securely. Only you have access to your data.',
    },
    {
      icon: Camera,
      title: 'OCR Scanning',
      description: 'Snap a photo and our AI extracts all the details. No manual typing needed.',
    },
    {
      icon: Smartphone,
      title: 'Multi-Device Sync',
      description: 'Access your documents anywhere. Syncs seamlessly across all your devices.',
    },
    {
      icon: Calendar,
      title: 'Expiration Calendar',
      description: 'Visual calendar showing all expiration dates. Plan ahead with confidence.',
    },
    {
      icon: FolderSearch,
      title: 'Categories & Search',
      description: 'Organize by type and find any document instantly with powerful search.',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: Camera,
      title: 'Scan or Upload',
      description: 'Take a photo of your document or upload from your device',
    },
    {
      number: '02',
      icon: Calendar,
      title: 'Add Details',
      description: 'Enter expiration date and other info. We\'ll extract what we can automatically.',
    },
    {
      number: '03',
      icon: Bell,
      title: 'Get Reminded',
      description: 'Relax and let us notify you before anything expires',
    },
  ];

  const testimonials = [
    {
      text: 'Never missed a passport renewal since using DocuTrackr. The reminders are a lifesaver!',
      name: 'Sarah M.',
      role: 'Frequent Traveler',
      rating: 5,
    },
    {
      text: 'Perfect for managing all my subscriptions. I\'ve saved hundreds by canceling on time.',
      name: 'James K.',
      role: 'Small Business Owner',
      rating: 5,
    },
    {
      text: 'The OCR feature is incredible. Just snap and done. So much time saved!',
      name: 'Priya S.',
      role: 'Busy Professional',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'Is my data secure?',
      answer: 'Yes, absolutely. All your documents are encrypted using industry-standard encryption. We use secure cloud storage and never share your data with third parties. Your privacy is our top priority.',
    },
    {
      question: 'How do reminders work?',
      answer: 'You\'ll receive notifications 30 days, 7 days, and 1 day before any document expires. You can customize these intervals in your settings. Notifications work even when the app is closed.',
    },
    {
      question: 'Can I use it offline?',
      answer: 'Yes! DocuTrackr works offline. You can view your documents and add new ones without an internet connection. Changes will sync when you\'re back online.',
    },
    {
      question: 'What file types are supported?',
      answer: 'We support images (JPG, PNG), PDFs, and all common document formats. You can take photos directly in the app or upload existing files.',
    },
    {
      question: 'How much does it cost?',
      answer: 'DocuTrackr offers a free plan with up to 10 documents. Our Pro plan is $4.99/month with unlimited documents and advanced features. Start with a 14-day free trial, no credit card required.',
    },
    {
      question: 'Can I share documents with others?',
      answer: 'Currently, documents are private to your account. We\'re working on sharing features for teams and families, coming soon!',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact us within 30 days for a full refund.',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(236, 72, 153, 0) 70%)',
          }}
          animate={{
            x: [0, 15, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Navigation Bar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'backdrop-blur-[20px]' : 'backdrop-blur-0'
        }`}
        style={{
          background: isScrolled
            ? 'rgba(26, 22, 37, 0.8)'
            : 'rgba(26, 22, 37, 0)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
              }}
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
              DocuTrackr
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Features', id: 'features' },
              { name: 'How It Works', id: 'how-it-works' },
              { name: 'About', id: 'about' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-[15px] text-white hover:text-purple-300 transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Desktop CTA Buttons - Connected */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={() => {
                triggerHaptic('light');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-xl text-[15px] font-semibold text-white transition-all"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              Home
            </motion.button>
            <motion.button
              onClick={() => {
                triggerHaptic('light');
                navigate('/login');
              }}
              className="px-6 py-2.5 rounded-xl text-[15px] font-semibold text-white transition-all"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => {
                triggerHaptic('light');
                navigate('/signup');
              }}
              className="px-7 py-2.5 rounded-xl text-[15px] font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.7)' }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden w-10 h-10 flex items-center justify-center text-white rounded-lg transition-all"
            onClick={() => {
              triggerHaptic('light');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            style={{
              border: mobileMenuOpen ? '2px solid #000000' : '2px solid transparent',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

          {/* Mobile Menu Modal */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop with blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 z-50"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(10px)',
                }}
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Centered Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="w-full max-w-sm rounded-2xl p-6 relative"
                  style={{
                    background: 'rgba(42, 38, 64, 0.85)',
                    backdropFilter: 'blur(25px)',
                    border: '2px solid #000000',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {/* Close Button */}
                  <motion.button
                    onClick={() => {
                      triggerHaptic('light');
                      setMobileMenuOpen(false);
                    }}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{
                      color: '#A78BFA',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  {/* Modal Content - Only Login and Sign Up */}
                  <div className="flex flex-col gap-4 mt-2">
                    <motion.button
                      onClick={() => {
                        triggerHaptic('light');
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-14 rounded-xl text-white font-semibold text-center transition-all"
                      style={{
                        background: 'rgba(42, 38, 64, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Login
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        triggerHaptic('light');
                        navigate('/signup');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-14 rounded-xl text-white font-semibold text-center transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
                      }}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.7)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign Up
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
      </motion.nav>

      {/* Hero Section */}
      <section 
        id="home"
        className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left Column - 60% */}
            <motion.div
              className="lg:col-span-3"
              style={{ opacity: heroOpacity, y: heroY }}
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs uppercase tracking-widest font-bold mb-4"
                style={{ color: '#A78BFA' }}
              >
                DOCUMENT MANAGEMENT MADE SIMPLE
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Revolutionize Your Document Tracking
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl mb-6"
                style={{ color: '#A78BFA' }}
              >
                Never miss an expiration date again
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg mb-10 leading-relaxed"
                style={{ color: '#C7C3D9' }}
              >
                Keep track of passports, visas, subscriptions, and important documents. Get smart reminders before they expire. All in one beautiful, secure app.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <motion.button
                  onClick={() => {
                    triggerHaptic('medium');
                    navigate('/signup');
                  }}
                  className="h-14 px-10 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.6)',
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(139, 92, 246, 0.8)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={() => scrollToSection('features')}
                  className="h-14 px-10 rounded-2xl text-lg font-semibold text-white flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  whileHover={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm mb-8"
                style={{ color: '#A78BFA' }}
              >
                No credit card required • 14-day free trial • Cancel anytime
              </motion.p>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-purple-500"
                      style={{
                        background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%), hsl(${i * 60 + 30}, 70%, 50%))`,
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Join 10,000+ users</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - 40% */}
            <motion.div
              className="lg:col-span-2 hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.div
                className="relative"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="w-full max-w-md mx-auto rounded-3xl p-8"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <div className="aspect-[9/19] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Calendar className="w-24 h-24 mx-auto mb-4 text-purple-300" />
                      <p className="text-white font-semibold text-lg">DocuTrackr</p>
                      <p className="text-purple-300 text-sm mt-2">Your documents, organized</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-[120px] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            Powerful Features for Document Tracking
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-10 rounded-3xl transition-all duration-300"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                  }}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: '#C7C3D9' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-[120px] px-6 lg:px-12" style={{ background: '#231D33' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How DocuTrackr Works
            </h2>
            <p className="text-xl" style={{ color: '#A78BFA' }}>
              Get started in 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)' }} />

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  <span
                    className="text-5xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                <div
                  className="p-8 rounded-2xl max-w-xs mx-auto"
                  style={{
                    background: 'rgba(42, 38, 64, 0.5)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <step.icon className="w-8 h-8" style={{ color: '#A78BFA' }} />
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-3">{step.title}</h3>
                  <p className="text-center" style={{ color: '#C7C3D9' }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots/Demo Section */}
      <section id="screenshots" className="relative py-[120px] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            Beautiful Design, Powerful Features
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-purple-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-[100px] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            Loved by Users Worldwide
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-base mb-6 leading-relaxed" style={{ color: '#C7C3D9' }}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, hsl(${index * 120}, 70%, 60%), hsl(${index * 120 + 30}, 70%, 50%))`,
                    }}
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm" style={{ color: '#A78BFA' }}>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-[100px] px-6 lg:px-12" style={{ background: '#231D33' }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setExpandedFaq(expandedFaq === index ? null : index);
                  }}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-300 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-base leading-relaxed" style={{ color: '#C7C3D9' }}>
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-[120px] px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-16 rounded-[32px] text-center"
            style={{
              background: 'rgba(42, 38, 64, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)',
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Never Miss a Deadline?
            </h2>
            <p className="text-xl mb-10" style={{ color: '#A78BFA' }}>
              Join thousands of users who trust DocuTrackr
            </p>
            <motion.button
              onClick={() => {
                triggerHaptic('medium');
                navigate('/signup');
              }}
              className="h-16 px-12 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-2 mx-auto"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.6)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(139, 92, 246, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-sm mt-6" style={{ color: '#A78BFA' }}>
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-[100px] px-6 lg:px-12" style={{ background: '#231D33' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            About DocuTrackr
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg leading-relaxed"
            style={{ color: '#C7C3D9' }}
          >
            DocuTrackr was born from a simple need: never miss an important document expiration date again. 
            We've built a beautiful, secure platform that helps thousands of users stay organized and on top of their documents.
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-[60px] px-6 lg:px-12" style={{ background: '#0F0D1A', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                  }}
                >
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">DocuTrackr</h3>
              </div>
              <p className="text-sm mb-6" style={{ color: '#A78BFA' }}>
                Never miss a deadline
              </p>
              <div className="flex gap-4">
                {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'How it Works', 'Download'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-purple-300 transition-colors" style={{ color: '#C7C3D9' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-purple-300 transition-colors" style={{ color: '#C7C3D9' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/privacy');
                    }}
                    className="text-sm hover:text-purple-300 transition-colors"
                    style={{ color: '#C7C3D9' }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/terms');
                    }}
                    className="text-sm hover:text-purple-300 transition-colors"
                    style={{ color: '#C7C3D9' }}
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-purple-300 transition-colors" style={{ color: '#C7C3D9' }}>
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-purple-300 transition-colors" style={{ color: '#C7C3D9' }}>
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-sm" style={{ color: '#A78BFA' }}>
              © 2024 DocuTrackr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
