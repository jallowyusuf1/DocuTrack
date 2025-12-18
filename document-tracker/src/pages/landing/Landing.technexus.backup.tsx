import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Play,
  ArrowRight,
  Check,
  Users,
  Clock,
  Headphones,
  Zap,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats cards
  const stats = [
    { icon: Users, label: 'Trusted Users', value: '7k+' },
    { icon: Clock, label: 'Uptime', value: '99.9%' },
    { icon: Headphones, label: 'Support', value: '24/7' },
    { icon: Zap, label: 'Features', value: '50+' },
  ];

  // Timeline steps
  const timelineSteps = [
    { step: '01', title: 'Upload', description: 'Add your documents instantly' },
    { step: '02', title: 'Organize', description: 'Auto-categorize everything' },
    { step: '03', title: 'Track', description: 'Monitor expiration dates' },
    { step: '04', title: 'Remind', description: 'Get alerts before expiry' },
  ];

  // Features for hover cards
  const features = [
    { icon: Camera, title: 'Smart Capture', description: 'Scan documents with AI-powered recognition' },
    { icon: Bell, title: 'Smart Reminders', description: 'Get alerts 30, 7, and 1 day before expiration' },
    { icon: Lock, title: 'Bank-Level Security', description: 'End-to-end encryption for all documents' },
    { icon: Globe, title: 'Multi-Device Sync', description: 'Access your documents anywhere, anytime' },
    { icon: Calendar, title: 'Calendar Integration', description: 'Sync with your favorite calendar app' },
    { icon: Shield, title: 'Privacy First', description: 'Your data stays private and secure' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0f0a1e' }}>
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-24">
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Subtle Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          {/* Centered Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Unlocking the{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #8B5CF6, #EC4899, #3B82F6)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite',
                }}
              >
                potential
              </span>
              <br />
              of document tracking
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto">
              Never miss a deadline. Smart reminders keep you ahead of every expiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('medium');
                  navigate('/signup');
                }}
                className="px-10 py-4 rounded-xl text-base font-semibold text-black"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                Let's Start
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('light');
                }}
                className="px-10 py-4 rounded-xl text-base font-semibold text-white flex items-center gap-3"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                <Play className="w-5 h-5" />
                <span>Play Video</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Floating Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 rounded-2xl backdrop-blur-xl"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        background: 'rgba(139, 92, 246, 0.2)',
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: '#8B5CF6' }} />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Timeline */}
      <section
        id="how-it-works"
        className="relative py-24 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(180deg, #0f0a1e 0%, #1a1625 100%)',
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

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div
              className="absolute top-1/2 left-0 right-0 h-1 hidden md:block"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.5) 10%, rgba(139, 92, 246, 0.8) 50%, rgba(139, 92, 246, 0.5) 90%, transparent 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
              }}
            />

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {timelineSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Step Number */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-xl font-bold text-white relative z-20"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '2px solid rgba(139, 92, 246, 0.5)',
                      boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
                    }}
                  >
                    {step.step}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-white/70 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Hover Cards */}
      <section
        id="features"
        className="relative py-24 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(180deg, #1a1625 0%, #0f0a1e 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            Features
          </motion.h2>

          {/* Hover Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-8 rounded-2xl backdrop-blur-xl cursor-pointer"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: '#8B5CF6' }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: '#8B5CF6' }}>
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dark Footer */}
      <footer
        className="relative py-12 px-4 sm:px-6 lg:px-8 border-t"
        style={{
          background: '#0f0a1e',
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
              <a href="#about" className="hover:text-white transition-colors">
                About
              </a>
              <span>© 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

