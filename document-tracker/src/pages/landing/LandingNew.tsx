import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Camera,
  Bell,
  FolderSearch,
  Lock,
  Smartphone,
  Globe,
  ArrowRight,
  Play,
  Menu,
  X,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import FloatingParticles from '../../components/effects/FloatingParticles';

export default function LandingNew() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
              }}
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DocuTrackr</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-white hover:text-purple-300 transition-colors"
            >
              Login
            </button>
            <motion.button
              onClick={() => navigate('/signup')}
              className="px-6 py-2 rounded-full text-white font-semibold"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 30px rgba(139, 92, 246, 0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-black/95 border-t border-purple-500/20"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#features" className="text-gray-300 hover:text-white py-2">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white py-2">
                How It Works
              </a>
              <button onClick={() => navigate('/login')} className="text-left text-gray-300 hover:text-white py-2">
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-full text-white font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                }}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1A1625 50%, #2A2640 100%)',
        }}
      >
        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
                <div className="text-white mb-2">Your Documents,</div>
                <div
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  }}
                >
                  Always On Time
                </div>
              </h1>

              <p className="text-xl text-gray-300 mb-10 max-w-lg">
                Never miss another expiration deadline. Smart tracking, instant alerts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => {
                    triggerHaptic('medium');
                    navigate('/signup');
                  }}
                  className="px-8 py-4 rounded-full text-white font-bold text-lg flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)',
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(139, 92, 246, 0.7)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  className="px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#A78BFA',
                  }}
                  whileHover={{ scale: 1.05, background: 'rgba(139, 92, 246, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>

            {/* Right Side - Floating Phone */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Floating Stats Cards */}
              <motion.div
                className="absolute -top-10 -left-20 px-6 py-3 rounded-full"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-white font-semibold">10K+ Active Users</span>
              </motion.div>

              <motion.div
                className="absolute -top-5 -right-10 px-6 py-3 rounded-full"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="text-white font-semibold">99.9% On-Time</span>
              </motion.div>

              <motion.div
                className="absolute bottom-10 -left-10 px-6 py-3 rounded-full"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <span className="text-white font-semibold">50K Documents Tracked</span>
              </motion.div>

              {/* Phone Mockup */}
              <motion.div
                className="relative mx-auto w-[300px]"
                animate={{
                  y: [0, -20, 0],
                  rotateY: [12, 15, 12],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
              >
                <div
                  className="rounded-[3rem] p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.1))',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 0 80px rgba(139, 92, 246, 0.6), inset 0 0 40px rgba(139, 92, 246, 0.1)',
                  }}
                >
                  <div
                    className="aspect-[9/19] rounded-[2.5rem] overflow-hidden relative"
                    style={{
                      background: 'linear-gradient(135deg, #1A1625 0%, #2A2640 100%)',
                    }}
                  >
                    {/* Phone Screen Content */}
                    <div className="p-6 h-full flex flex-col">
                      {/* Mini Dashboard */}
                      <div className="text-center mb-6">
                        <p className="text-gray-400 text-sm mb-2">Next Expiration</p>
                        <h3 className="text-white text-2xl font-bold">7 Days</h3>
                      </div>

                      {/* Document Cards */}
                      <div className="space-y-3 flex-1">
                        {[
                          { name: 'Passport', days: 7, color: '#8B5CF6' },
                          { name: 'License', days: 45, color: '#EC4899' },
                          { name: 'Insurance', days: 90, color: '#10B981' },
                        ].map((doc, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl"
                            style={{
                              background: 'rgba(139, 92, 246, 0.1)',
                              border: `1px solid ${doc.color}40`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white text-sm font-medium">{doc.name}</span>
                              <span
                                className="text-xs font-semibold px-2 py-1 rounded-full"
                                style={{ background: `${doc.color}30`, color: doc.color }}
                              >
                                {doc.days}d
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow effect below phone */}
                <div
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-60"
                  style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative py-24 px-6"
        style={{
          background: '#0a0a0a',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">Three simple steps to never miss a deadline</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Capture',
                description: 'Snap any document with your camera',
                step: '01',
              },
              {
                icon: FolderSearch,
                title: 'Organize',
                description: 'Auto-categorized and OCR processed',
                step: '02',
              },
              {
                icon: Bell,
                title: 'Get Reminded',
                description: 'Smart alerts 30, 7, and 1 day before',
                step: '03',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative p-8 rounded-3xl group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(109, 40, 217, 0.02))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                }}
                whileHover={{
                  scale: 1.05,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)',
                }}
              >
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-6xl font-bold opacity-10 text-purple-500">
                  {item.step}
                </div>

                {/* Icon */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
                  }}
                >
                  <item.icon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-24 px-6"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1A1625 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400">Everything you need to stay organized</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Bell,
                title: 'Smart Reminders',
                description: '30, 7, 1 day alerts via push, email, and SMS',
              },
              {
                icon: Lock,
                title: 'Password Lock',
                description: 'Bank-level encryption for sensitive documents',
              },
              {
                icon: Smartphone,
                title: 'Multi-Device Sync',
                description: 'Access your documents everywhere, anytime',
              },
              {
                icon: Globe,
                title: 'Multi-Language',
                description: 'Available in 5 languages with RTL support',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(109, 40, 217, 0.03))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                }}
                whileHover={{
                  scale: 1.03,
                  borderColor: 'rgba(139, 92, 246, 0.4)',
                  boxShadow: '0 15px 50px rgba(139, 92, 246, 0.25)',
                }}
              >
                <feature.icon
                  className="w-12 h-12 mb-4 text-purple-400"
                />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-12 px-6"
        style={{
          background: '#0a0a0a',
          borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Tagline */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  }}
                >
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DocuTrackr</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Never miss another expiration deadline. Your documents, always on time.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-3">
                {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <Icon className="w-4 h-4 text-purple-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>© 2024 DocuTrackr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
