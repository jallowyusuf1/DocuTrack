import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
  Lock,
  Globe,
  Edit3,
  Zap,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import StarField from '../../components/effects/StarField';
import PortalEffect from '../../components/effects/PortalEffect';
import DocumentUniverse from '../../components/effects/DocumentUniverse';
import AnimatedStats from '../../components/effects/AnimatedStats';

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // ===== REFS MUST BE DECLARED FIRST (BEFORE ANY OTHER CODE) =====
  const morphSectionRef = useRef<HTMLElement>(null);
  const discContainerRef = useRef<HTMLDivElement>(null);
  // ===== END REFS =====
  
  const [isDiscsPaused, setIsDiscsPaused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  useEffect(() => {
    // SAFETY: Capture refs in closure to prevent "not defined" errors
    const morphRef = morphSectionRef;
    const discRef = discContainerRef;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Calculate scroll progress for morphing section
      if (morphRef?.current) {
        const sectionTop = morphRef.current.offsetTop;
        const sectionHeight = morphRef.current.offsetHeight;
        const scrollY = window.scrollY;

        const progress = Math.max(0, Math.min(1,
          (scrollY - sectionTop) / (sectionHeight - window.innerHeight)
        ));

        setScrollProgress(progress * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    // Mouse tracking for disc interaction
    const handleMouseMove = (e: MouseEvent) => {
      // SAFETY: Always check if ref exists before accessing
      if (discRef?.current) {
        const rect = discRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setMousePosition({
          x: (e.clientX - centerX) / (rect.width / 2),
          y: (e.clientY - centerY) / (rect.height / 2),
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  // Helper function for linear interpolation
  const lerp = (start: number, end: number, t: number) => {
    return start + (end - start) * t;
  };

  // Calculate device dimensions based on scroll progress
  const getDeviceDimensions = (progress: number) => {
    if (progress < 50) {
      // Phone to Tablet (0-50%)
      const phase = progress / 50;
      return {
        width: lerp(350, 700, phase),
        height: lerp(700, 900, phase),
        radius: lerp(40, 25, phase),
      };
    } else {
      // Tablet to Laptop (50-100%)
      const phase = (progress - 50) / 50;
      return {
        width: lerp(700, 1100, phase),
        height: lerp(900, 700, phase),
        radius: lerp(25, 15, phase),
      };
    }
  };

  // Calculate device rotation based on scroll progress
  const getDeviceRotation = (progress: number) => {
    if (progress < 25) {
      return {
        rotateY: lerp(0, -5, progress / 25),
        rotateX: 0,
        scale: lerp(1, 1.1, progress / 25),
      };
    } else if (progress < 50) {
      const phase = (progress - 25) / 25;
      return {
        rotateY: lerp(-5, 0, phase),
        rotateX: 0,
        scale: lerp(1.1, 1, phase),
      };
    } else if (progress < 75) {
      const phase = (progress - 50) / 25;
      return {
        rotateY: 0,
        rotateX: lerp(0, -3, phase),
        scale: 1,
      };
    } else {
      const phase = (progress - 75) / 25;
      return {
        rotateY: 0,
        rotateX: lerp(-3, 0, phase),
        scale: 1,
      };
    }
  };

  // Determine active screen content
  const getActiveScreen = (progress: number) => {
    if (progress < 25) return 0;
    if (progress < 50) return 1;
    if (progress < 75) return 2;
    return 3;
  };

  // Determine active text content
  const getActiveText = (progress: number) => {
    return getActiveScreen(progress);
  };

  const features = [
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Get notified 30, 7, and 1 day before documents expire. Customize reminder times to fit your schedule.',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your documents are encrypted and stored securely. Lock sensitive documents with passwords for extra protection.',
    },
    {
      icon: Calendar,
      title: 'Visual Calendar',
      description: 'See all expiration dates at a glance. Plan ahead with monthly and list views showing upcoming deadlines.',
    },
    {
      icon: Smartphone,
      title: 'Access Anywhere',
      description: 'Your documents sync across all devices. Access from phone, tablet, or desktop - always up to date.',
    },
    {
      icon: FolderSearch,
      title: 'Smart Organization',
      description: 'Documents automatically organized by type. Find anything instantly with powerful search and filters.',
    },
    {
      icon: Globe,
      title: 'Your Language',
      description: 'Available in English, Arabic, Spanish, French, and Urdu. Full RTL support for Arabic and Urdu.',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: Camera,
      title: 'Snap or Upload',
      description: 'Take a photo of your document or upload from your device. We support images and PDFs.',
    },
    {
      number: '02',
      icon: Edit3,
      title: 'Add Details',
      description: 'Enter expiration date and other info. Documents are automatically organized by type.',
    },
    {
      number: '03',
      icon: Check,
      title: 'Get Reminded',
      description: 'Sit back and relax. We\'ll notify you before anything expires so you never miss a deadline.',
    },
  ];

  const screenContent = [
    {
      title: 'Dashboard',
      description: 'See all expiring documents at a glance',
    },
    {
      title: 'Add Document',
      description: 'Snap a photo or upload instantly',
    },
    {
      title: 'Calendar View',
      description: 'Visual timeline of all your dates',
    },
    {
      title: 'Settings',
      description: 'Manage from any device, anywhere',
    },
  ];

  const scrollTexts = [
    {
      heading: 'Add documents instantly',
      subheading: 'Snap a photo or upload from your device',
    },
    {
      heading: 'Organize automatically',
      subheading: 'Smart categories and powerful search',
    },
    {
      heading: 'Never miss a date',
      subheading: 'Smart reminders keep you ahead',
    },
    {
      heading: 'Manage from anywhere',
      subheading: 'Phone, tablet, or desktop — always synced',
    },
  ];

  const floatingFeatures = [
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: '30, 7, 1 day alerts',
      trigger: 20,
      position: { top: '15%', left: '10%' },
    },
    {
      icon: Calendar,
      title: 'Calendar View',
      description: 'Visual timeline',
      trigger: 40,
      position: { top: '15%', right: '10%' },
    },
    {
      icon: Lock,
      title: 'Password Lock',
      description: 'Extra security',
      trigger: 60,
      position: { bottom: '20%', left: '10%' },
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: '5 languages, RTL',
      trigger: 80,
      position: { bottom: '20%', right: '10%' },
    },
  ];

  const featureDiscs = [
    {
      id: 1,
      name: 'SMART REMINDERS',
      icon: Bell,
      edgeText: '30 • 7 • 1 Day Alerts',
      color: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      glow: 'rgba(139, 92, 246, 0.6)',
      special: 'pulse',
    },
    {
      id: 2,
      name: 'SCAN & CAPTURE',
      icon: Camera,
      edgeText: 'Photo • Upload • Instant',
      color: 'radial-gradient(circle at center, #3a3a3a 0%, #1a1a1a 100%)',
      glow: 'rgba(0, 0, 0, 0.6)',
      special: 'lens',
    },
    {
      id: 3,
      name: 'CALENDAR VIEW',
      icon: Calendar,
      edgeText: 'Visual • Timeline • Plan',
      color: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)',
      glow: 'rgba(192, 192, 192, 0.4)',
      special: 'grid',
    },
    {
      id: 4,
      name: 'PASSWORD LOCK',
      icon: Lock,
      edgeText: 'Secure • Private • Protected',
      color: 'linear-gradient(135deg, #D4AF37 0%, #C9A961 50%, #B8941F 100%)',
      glow: 'rgba(212, 175, 55, 0.4)',
      special: 'emboss',
    },
    {
      id: 5,
      name: 'AUTO ORGANIZE',
      icon: FolderSearch,
      edgeText: '9 Categories • Smart Sort',
      color: 'linear-gradient(135deg, #CD7F32 0%, #B87333 50%, #A0522D 100%)',
      glow: 'rgba(205, 127, 50, 0.4)',
      special: 'folders',
    },
    {
      id: 6,
      name: 'INSTANT SEARCH',
      icon: FolderSearch,
      edgeText: 'Find Anything • Fast',
      color: 'radial-gradient(circle at 40% 40%, #ffffff 0%, #E5E4E2 50%, #C0C0C0 100%)',
      glow: 'rgba(255, 255, 255, 0.3)',
      special: 'beam',
    },
    {
      id: 7,
      name: 'MULTI-LANGUAGE',
      icon: Globe,
      edgeText: '5 Languages • RTL Support',
      color: 'linear-gradient(135deg, #4A90E2 0%, #5BA3F5 100%)',
      glow: 'rgba(74, 144, 226, 0.5)',
      special: 'glass',
    },
    {
      id: 8,
      name: 'OFFLINE MODE',
      icon: Smartphone,
      edgeText: 'Sync • Cache • Always Ready',
      color: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
      glow: 'rgba(30, 58, 95, 0.5)',
      special: 'waves',
    },
    {
      id: 9,
      name: 'CLOUD SYNC',
      icon: Smartphone,
      edgeText: 'Auto • Multi-Device • Instant',
      color: 'linear-gradient(135deg, rgba(135, 206, 235, 0.8) 0%, rgba(176, 224, 230, 0.8) 100%)',
      glow: 'rgba(135, 206, 235, 0.4)',
      special: 'cloud',
    },
    {
      id: 10,
      name: 'EXPORT DATA',
      icon: ArrowRight,
      edgeText: 'ZIP • Backup • Your Data',
      color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      glow: 'rgba(16, 185, 129, 0.4)',
      special: 'download',
    },
  ];

  const stats = [
    { icon: Users, number: '10,000+', label: 'Active Users' },
    { icon: FileText, number: '50,000+', label: 'Documents Tracked' },
    { icon: TrendingUp, number: '99.9%', label: 'Uptime' },
    { icon: Star, number: '5★', label: 'App Rating' },
  ];

  const trustBadges = [
    { icon: Lock, text: 'Bank-level security' },
    { icon: Zap, text: 'Free forever' },
    { icon: Globe, text: 'Multi-language' },
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
      {/* Animated Star Field Background */}
      <StarField />

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
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
              }}
              whileHover={{ scale: 1.05 }}
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
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
              }}
              whileHover={{ scale: 1.05 }}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={(e) => {
                if (e.currentTarget) {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.7)';
                }
              }}
              onHoverEnd={(e) => {
                if (e.currentTarget) {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.5)';
                }
              }}
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
                    background: 'transparent',
                    backdropFilter: 'blur(25px)',
                    WebkitBackdropFilter: 'blur(25px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
                  }}
                >
                  {/* Close Button */}
                  <motion.button
                    onClick={() => {
                      triggerHaptic('light');
                      setMobileMenuOpen(false);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors z-10"
                    style={{
                      color: '#A78BFA',
                    }}
                    onMouseEnter={(e) => {
                      if (e.currentTarget) {
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (e.currentTarget) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  {/* Modal Content - All Navigation Items */}
                  <div className="flex flex-col gap-3 mt-8">
                    {/* Navigation Links */}
                    {[
                      { name: 'Home', id: 'hero' },
                      { name: 'Features', id: 'features' },
                      { name: 'How It Works', id: 'how-it-works' },
                      { name: 'About', id: 'about' }
                    ].map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          triggerHaptic('light');
                          scrollToSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full h-12 rounded-xl text-white font-medium text-center transition-all"
                        style={{
                          background: 'rgba(42, 38, 64, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        whileHover={{ scale: 1.02, background: 'rgba(42, 38, 64, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.name}
                      </motion.button>
                    ))}

                    {/* Divider */}
                    <div
                      className="h-px my-2"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                      }}
                    />

                    {/* Auth Buttons */}
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

      {/* Hero Section - Revolut Exact Style */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 lg:px-12"
        style={{
          background: 'linear-gradient(135deg, #1A1625 0%, #231D33 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="mb-6">
                <motion.div
                  className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Never miss another
                </motion.div>
                <motion.div
                  className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 50%, #A78BFA 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 3s ease infinite',
                  }}
                >
                  expiration date
                </motion.div>
              </h1>

              <motion.p
                className="text-xl md:text-2xl leading-[1.7] mb-12 max-w-[520px]"
                style={{ color: '#C7C3D9' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Track passports, visas, documents, and subscriptions. Get smart reminders before anything expires — all in one beautiful, secure app.
              </motion.p>

              <motion.button
                onClick={() => {
                  triggerHaptic('medium');
                  navigate('/signup');
                }}
                className="group h-14 px-10 rounded-full text-lg font-bold text-white flex items-center justify-center gap-2 relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.8)',
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 20px 60px rgba(139, 92, 246, 1)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Right Column - 3D Document Universe with Portal */}
            <motion.div
              className="relative hidden lg:flex items-center justify-center h-[600px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Portal Effect Background */}
              <div className="absolute inset-0">
                <PortalEffect />
              </div>

              {/* 3D Document Universe */}
              <div className="relative w-full h-full">
                <DocumentUniverse />
              </div>

              {/* Center Glow */}
              <div
                className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Liquid Glass Tiles */}
      <section id="features" className="relative py-[120px] px-6 lg:px-12" style={{ background: '#231D33' }}>
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <h2
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              To Stay Organized
            </h2>
            <p className="text-lg" style={{ color: '#C7C3D9' }}>
              Powerful features in a beautiful interface
            </p>
          </motion.div>

          {/* Glass Tile Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-10 rounded-[32px] overflow-hidden transition-all duration-[400ms] ease-out cursor-pointer"
                style={{
                  background: 'rgba(42, 38, 64, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  if (e.currentTarget) {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.background = 'rgba(42, 38, 64, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(42, 38, 64, 0.4)';
                }}
              >
                {/* Liquid glass reflection effect */}
                <div
                  className="absolute top-0 -left-full w-full h-full pointer-events-none group-hover:left-full transition-[left] duration-[600ms]"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                  }}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    delay: index * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <feature.icon className="w-9 h-9 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base leading-[1.6] mb-4" style={{ color: '#C7C3D9' }}>
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <div className="flex items-center gap-2 text-sm font-medium group/link">
                  <span style={{ color: '#8B5CF6' }}>Learn more</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                    style={{ color: '#8B5CF6' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-[100px] px-6 lg:px-12" style={{ background: '#1A1625' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg" style={{ color: '#C7C3D9' }}>
              Join the growing community managing their documents better
            </p>
          </motion.div>

          <AnimatedStats
            stats={[
              { value: 50000, label: 'Active Users', suffix: '+' },
              { value: 1000000, label: 'Documents Tracked', suffix: '+' },
              { value: 250000, label: 'Reminders Sent', suffix: '+' },
              { value: 99, label: 'Customer Satisfaction', suffix: '%' },
            ]}
          />
        </div>
      </section>

      {/* How It Works Section - Revolut Style */}
      <section id="how-it-works" className="relative py-[120px] px-6 lg:px-12" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 100%)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              How DocuTrackr Works
            </h2>
            <p className="text-lg" style={{ color: '#C7C3D9' }}>
              Get started in three simple steps
            </p>
          </motion.div>

          {/* Step Cards with Connecting Line */}
          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Flowing Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-1 pointer-events-none">
              <div
                className="w-full h-full relative overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.5) 20%, rgba(139, 92, 246, 0.5) 80%, transparent 100%)',
                }}
              >
                {/* Animated flow */}
                <motion.div
                  className="absolute top-0 left-0 w-20 h-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)',
                  }}
                  animate={{
                    left: ['-10%', '110%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
            </div>

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                {/* Floating Card */}
                <motion.div
                  className="relative"
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 6,
                    delay: index * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div
                    className="relative p-12 rounded-[32px] overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(42, 38, 64, 0.5) 0%, rgba(42, 38, 64, 0.3) 100%)',
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {/* Liquid glass surface effect */}
                    <motion.div
                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 4,
                        delay: index * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Step Number Background */}
                    <div
                      className="absolute top-8 left-8 text-[120px] font-bold leading-none opacity-[0.08] pointer-events-none"
                      style={{ color: '#8B5CF6' }}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <motion.div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 z-10"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                        boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
                      }}
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        delay: index * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <step.icon className="w-12 h-12 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="relative text-3xl font-bold text-white text-center mb-4 z-10">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="relative text-base leading-[1.6] text-center z-10" style={{ color: '#C7C3D9' }}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll-Triggered Device Morphing Section - Revolut Exact */}
      <section
        ref={morphSectionRef}
        className="relative px-6 lg:px-12"
        style={{
          height: '400vh',
          background: '#231D33',
        }}
      >
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
            {/* Dynamic Text Content (Left Side) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 z-20 hidden lg:block">
              {scrollTexts.map((text, index) => {
                const isActive = getActiveText(scrollProgress) === index;
                return (
                  <motion.div
                    key={index}
                    className="absolute top-0 left-0"
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 20,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-5xl font-bold text-white leading-[1.2] mb-4">
                      {text.heading}
                    </h2>
                    <p className="text-xl" style={{ color: '#C7C3D9' }}>
                      {text.subheading}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Morphing Device Container */}
            <div className="relative flex items-center justify-center">
              {(() => {
                const dims = getDeviceDimensions(scrollProgress);
                const rotation = getDeviceRotation(scrollProgress);
                const activeScreen = getActiveScreen(scrollProgress);
                const showKeyboard = scrollProgress >= 75;

                return (
                  <motion.div
                    className="relative"
                    style={{
                      width: `${dims.width}px`,
                      height: `${dims.height}px`,
                      transformStyle: 'preserve-3d',
                      perspective: '1500px',
                    }}
                    animate={{
                      transform: `perspective(1500px) rotateY(${rotation.rotateY}deg) rotateX(${rotation.rotateX}deg) scale(${rotation.scale})`,
                    }}
                    transition={{ duration: 0 }}
                  >
                    {/* Device Frame */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
                        borderRadius: `${dims.radius}px`,
                        boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {/* Screen */}
                      <div
                        className="absolute"
                        style={{
                          top: '5%',
                          left: '5%',
                          width: '90%',
                          height: '90%',
                          background: '#000',
                          borderRadius: `${dims.radius - 10}px`,
                          overflow: 'hidden',
                        }}
                      >
                        {screenContent.map((screen, index) => (
                          <motion.div
                            key={index}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                            style={{
                              background: 'linear-gradient(135deg, #1A1625 0%, #231D33 100%)',
                            }}
                            animate={{
                              opacity: activeScreen === index ? 1 : 0,
                            }}
                            transition={{ duration: 0.6 }}
                          >
                            <Calendar className="w-20 h-20 mb-4" style={{ color: '#8B5CF6' }} />
                            <h3 className="text-white font-bold text-2xl mb-2">{screen.title}</h3>
                            <p className="text-sm" style={{ color: '#C7C3D9' }}>
                              {screen.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Keyboard (Laptop Phase) */}
                    <motion.div
                      className="absolute left-[-50px]"
                      style={{
                        bottom: '-80px',
                        width: `calc(100% + 100px)`,
                        height: '80px',
                        background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
                        borderRadius: '0 0 20px 20px',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                      animate={{
                        opacity: showKeyboard ? 1 : 0,
                        y: showKeyboard ? 0 : 20,
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {/* Trackpad */}
                      <div
                        className="absolute bottom-2 left-1/2 -translate-x-1/2"
                        style={{
                          width: '150px',
                          height: '80px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })()}

              {/* Floating Feature Cards */}
              {floatingFeatures.map((feature, index) => {
                const isVisible = scrollProgress >= feature.trigger && scrollProgress < feature.trigger + 15;
                const isFadingOut = scrollProgress >= feature.trigger + 15;

                return (
                  <motion.div
                    key={index}
                    className="absolute w-72 p-6 rounded-2xl z-30"
                    style={{
                      ...feature.position,
                      background: 'rgba(42, 38, 64, 0.8)',
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
                    }}
                    animate={{
                      opacity: isVisible ? 1 : 0,
                      y: isFadingOut ? -20 : isVisible ? 0 : 20,
                      scale: isVisible ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-12 h-12 mb-3" style={{ color: '#8B5CF6' }} />
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm" style={{ color: '#C7C3D9' }}>
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3D Metallic Coins Section - Revolut Style */}
      <section className="relative py-[140px] px-6 lg:px-12 overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <h2
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              In One Beautiful App
            </h2>
            <p className="text-lg" style={{ color: '#C7C3D9' }}>
              Powerful features working together seamlessly
            </p>
          </motion.div>

          {/* 3D Disc Stack Container */}
          <div className="relative flex items-center justify-center min-h-[700px]">
            <motion.div
              ref={discContainerRef}
              className="relative"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1500px',
              }}
              animate={{
                rotateY: isDiscsPaused ? mousePosition.x * 15 : [0, 360],
                rotateX: isDiscsPaused ? -mousePosition.y * 10 : 5,
              }}
              transition={{
                rotateY: isDiscsPaused ? { duration: 0 } : { duration: 25, repeat: Infinity, ease: 'linear' },
                rotateX: { duration: 0 },
              }}
              onMouseEnter={() => setIsDiscsPaused(true)}
              onMouseLeave={() => setIsDiscsPaused(false)}
            >
              {featureDiscs.map((disc, index) => {
                // Calculate position and scale
                const totalDiscs = featureDiscs.length;
                const centerIndex = Math.floor(totalDiscs / 2);
                const distanceFromCenter = Math.abs(index - centerIndex);

                // Size variation
                let scale = 1.0;
                if (index === centerIndex) scale = 1.15;
                else if (distanceFromCenter === 1) scale = 1.0;
                else scale = 0.9;

                // Depth and horizontal positioning
                const zOffset = (index - centerIndex) * 50;
                const xOffset = (index - centerIndex) * 40;

                // Blur based on distance from center
                let blur = 0;
                let opacity = 1;
                let brightness = 1;
                if (distanceFromCenter > 2) {
                  blur = 2;
                  opacity = 0.6;
                  brightness = 0.7;
                } else if (distanceFromCenter === 2) {
                  blur = 1.5;
                  opacity = 0.75;
                  brightness = 0.8;
                } else if (distanceFromCenter === 1) {
                  blur = 0.5;
                  opacity = 0.95;
                  brightness = 0.95;
                }

                return (
                  <motion.div
                    key={disc.id}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) translateZ(${zOffset}px) translateX(${xOffset}px) scale(${scale})`,
                      transformStyle: 'preserve-3d',
                      willChange: 'transform',
                      filter: `blur(${blur}px) brightness(${brightness})`,
                      opacity: opacity,
                    }}
                    animate={{
                      rotateZ: [0, 1, 0, -1, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: index * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Disc */}
                    <div
                      className="relative w-[280px] h-[280px] rounded-full flex flex-col items-center justify-center overflow-hidden cursor-pointer"
                      style={{
                        background: disc.color,
                        boxShadow: `
                          inset 0 2px 4px rgba(255, 255, 255, 0.3),
                          0 0 0 2px rgba(0, 0, 0, 0.1),
                          0 0 0 4px rgba(255, 255, 255, 0.05),
                          0 8px 32px ${disc.glow},
                          0 0 40px ${disc.glow}
                        `,
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: disc.special === 'glass' || disc.special === 'cloud' ? 'blur(15px)' : 'none',
                      }}
                      onClick={() => {
                        triggerHaptic('medium');
                        // Could show modal with feature details
                      }}
                    >
                      {/* Grooved edge effect */}
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: 'repeating-conic-gradient(from 0deg, rgba(0, 0, 0, 0.1) 0deg, transparent 3.6deg, rgba(0, 0, 0, 0.1) 7.2deg)',
                          transform: 'scale(1.02)',
                          opacity: 0.3,
                        }}
                      />

                      {/* Light sweep animation */}
                      <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)',
                          mixBlendMode: 'overlay',
                        }}
                        animate={{
                          x: ['-200%', '200%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: index * 0.5,
                        }}
                      />

                      {/* Special effects overlay */}
                      {disc.special === 'grid' && (
                        <div
                          className="absolute inset-0 rounded-full pointer-events-none opacity-20"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, transparent 1px, transparent 12px)',
                          }}
                        />
                      )}

                      {disc.special === 'lens' && (
                        <div
                          className="absolute w-[60%] h-[60%] rounded-full border-2 pointer-events-none"
                          style={{ borderColor: 'rgba(100, 200, 255, 0.3)' }}
                        />
                      )}

                      {disc.special === 'pulse' && (
                        <motion.div
                          className="absolute top-8 right-8 w-3 h-3 rounded-full"
                          style={{ background: '#FF4444' }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      {/* Icon */}
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: index * 0.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <disc.icon
                          className="w-12 h-12 mb-4"
                          style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                          }}
                        />
                      </motion.div>

                      {/* Text on face */}
                      <h3
                        className="text-center text-base font-extrabold uppercase tracking-wider px-6"
                        style={{
                          color: '#ffffff',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.4), 0 -1px 1px rgba(255, 255, 255, 0.2)',
                          letterSpacing: '2px',
                        }}
                      >
                        {disc.name}
                      </h3>

                      {/* Edge text */}
                      <p
                        className="text-[10px] font-semibold uppercase mt-2 opacity-70"
                        style={{
                          color: '#ffffff',
                          letterSpacing: '1px',
                        }}
                      >
                        {disc.edgeText}
                      </p>

                      {/* Rim lighting */}
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          boxShadow: `inset 0 0 30px ${disc.glow}`,
                          opacity: 0.3,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Instruction text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm mt-12"
            style={{ color: '#A78BFA' }}
          >
            Hover to explore • Each disc represents a powerful feature
          </motion.p>
        </div>
      </section>

      {/* Stats/Trust Section - Revolut Style */}
      <section className="relative py-20 px-6 lg:px-12">
        <div
          className="w-full py-20"
          style={{
            background: 'rgba(42, 38, 64, 0.3)',
            backdropFilter: 'blur(30px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <stat.icon className="w-8 h-8" style={{ color: '#8B5CF6' }} />
                  </div>

                  {/* Number */}
                  <motion.div
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  >
                    {stat.number}
                  </motion.div>

                  {/* Label */}
                  <p className="text-base" style={{ color: '#C7C3D9' }}>
                    {stat.label}
                  </p>

                  {/* Divider (not on last item on desktop) */}
                  {index < stats.length - 1 && (
                    <div
                      className="hidden md:block absolute top-0 -right-6 w-px h-full"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
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

      {/* Final CTA Section - Premium Liquid Glass */}
      <section className="relative py-[120px] px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-16 md:p-20 rounded-[48px] text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(42, 38, 64, 0.8) 100%)',
              backdropFilter: 'blur(30px)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Animated liquid glass rotating effect */}
            <motion.div
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, transparent 60%)',
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-white mb-2">Ready to Never Miss</div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  A Deadline Again?
                </div>
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl mb-12"
                style={{ color: '#C7C3D9' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Join thousands who trust DocuTrackr
              </motion.p>

              {/* CTA Button */}
              <motion.button
                onClick={() => {
                  triggerHaptic('medium');
                  navigate('/signup');
                }}
                className="group h-16 md:h-20 px-12 md:px-16 rounded-full text-lg md:text-xl font-bold text-white flex items-center justify-center gap-3 mx-auto relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.6)',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: 'spring' }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 16px 50px rgba(139, 92, 246, 0.8)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'linear',
                  }}
                />
                <span className="relative flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Start Free - No Credit Card
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              {/* Trust Line */}
              <motion.p
                className="text-sm mt-6"
                style={{ color: '#A78BFA' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                14-day free trial • Cancel anytime • No hidden fees
              </motion.p>
            </div>
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
                    whileHover={{ scale: 1.1 }}
                    style={{
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                    }}
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
