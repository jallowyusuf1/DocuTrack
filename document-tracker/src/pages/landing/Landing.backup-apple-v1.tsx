import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Calendar,
  Shield,
  Bell,
  Lock,
  Camera,
  FolderSearch,
  Users,
  Play,
  ChevronRight,
  CheckCircle2,
  Cloud,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';

// WWAD - What Would Apple Do
// Apple-style homepage with frosted glass, minimal design, premium feel

export default function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] overflow-x-hidden" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
      WebkitFontSmoothing: 'antialiased',
      textRendering: 'optimizeLegibility',
    }}>

      {/* NAVIGATION BAR - Fixed Top with Frosted Glass */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/70 backdrop-blur-xl border-b border-black/10 shadow-sm'
            : 'bg-transparent'
        }`}
        style={{
          backdropFilter: isScrolled ? 'saturate(180%) blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[52px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#8B5CF6]" />
            <span className="text-[18px] font-semibold text-[#1D1D1F]">DocuTrackr</span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/login')}
              className="text-[14px] font-medium text-[#1D1D1F] hover:text-[#8B5CF6] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#8B5CF6] text-white px-[18px] py-[8px] rounded-xl text-[14px] font-medium
                       hover:brightness-105 hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200 shadow-lg shadow-[#8B5CF6]/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-[100px] pb-[120px] px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F7] via-[#E5E5EA] to-[#F5F5F7]" />

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#A78BFA]/20 blur-[100px]"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#A78BFA]/15 to-[#8B5CF6]/15 blur-[80px]"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Hero Content */}
        <div className="relative max-w-[800px] mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[12px] font-semibold text-[#8B5CF6] uppercase tracking-[0.5px] mb-3"
          >
            DOCUMENT MANAGEMENT
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[64px] leading-[1.1] font-bold text-[#1D1D1F] mb-4"
          >
            Never miss another<br/>expiration date.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[21px] text-[#1D1D1F]/70 leading-[1.5] mb-8 max-w-[600px] mx-auto"
          >
            Track every document. Get reminded automatically.<br/>
            Simple, secure, and beautifully designed.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-4 mb-5"
          >
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#8B5CF6] text-white px-8 py-4 rounded-xl text-[17px] font-semibold
                       hover:brightness-105 hover:-translate-y-[1px] active:translate-y-0
                       transition-all duration-200 shadow-xl shadow-[#8B5CF6]/40"
            >
              Get Started Free
            </button>
            <button
              className="bg-transparent text-[#8B5CF6] px-8 py-4 rounded-xl text-[17px] font-semibold
                       border-[1.5px] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5
                       transition-all duration-200 flex items-center gap-2"
            >
              Watch how it works
              <Play className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Trust Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[14px] text-[#1D1D1F]/50"
          >
            Free forever • No credit card required • 10,000+ users
          </motion.p>
        </div>

        {/* Hero Visual - Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative max-w-[900px] mx-auto mt-16"
        >
          <div className="relative">
            {/* Phone Mockup */}
            <div className="relative mx-auto w-[300px] h-[600px] bg-[#1D1D1F] rounded-[40px] p-[8px] shadow-2xl
                          border-[8px] border-[#1D1D1F]"
                 style={{
                   boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.1)',
                 }}>
              {/* Screen Content */}
              <div className="w-full h-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] rounded-[32px] overflow-hidden">
                <div className="p-6 text-white">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[12px] opacity-70">Good morning</p>
                      <p className="font-semibold">John Doe</p>
                    </div>
                  </div>

                  {/* Document Cards */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-[14px] font-medium">Passport</span>
                          </div>
                          <span className="text-[12px] opacity-70">{30 - i * 10} days</span>
                        </div>
                        <div className="h-[3px] bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${100 - i * 20}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#8B5CF6]/30 to-transparent blur-3xl" />
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative py-[120px] px-6 bg-[#FBFBFD]">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 fade-on-scroll">
            <p className="text-[12px] font-semibold text-[#8B5CF6] uppercase tracking-[0.5px] mb-3">
              SIMPLE TO START
            </p>
            <h2 className="text-[48px] leading-[1.2] font-bold text-[#1D1D1F]">
              Three steps to organized bliss.
            </h2>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-6">
            {/* Step 1 */}
            <div className="flex-1 max-w-[320px] fade-on-scroll" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white/70 backdrop-blur-[40px] border-[0.5px] border-black/6 rounded-3xl p-12 text-center
                            hover:-translate-y-1 hover:shadow-xl transition-all duration-300
                            shadow-lg shadow-black/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white
                              flex items-center justify-center text-[20px] font-bold mx-auto mb-6">
                  1
                </div>
                <div className="text-[64px] mb-5">📷</div>
                <h3 className="text-[24px] font-semibold text-[#1D1D1F] mb-3">Capture</h3>
                <p className="text-[17px] text-[#1D1D1F]/70 leading-[1.5]">
                  Snap a photo or upload any document. We'll handle the rest.
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-[40px] text-[#8B5CF6]/30 fade-on-scroll" style={{ animationDelay: '0.2s' }}>
              →
            </div>

            {/* Step 2 */}
            <div className="flex-1 max-w-[320px] fade-on-scroll" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white/70 backdrop-blur-[40px] border-[0.5px] border-black/6 rounded-3xl p-12 text-center
                            hover:-translate-y-1 hover:shadow-xl transition-all duration-300
                            shadow-lg shadow-black/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white
                              flex items-center justify-center text-[20px] font-bold mx-auto mb-6">
                  2
                </div>
                <div className="text-[64px] mb-5">📁</div>
                <h3 className="text-[24px] font-semibold text-[#1D1D1F] mb-3">Organize</h3>
                <p className="text-[17px] text-[#1D1D1F]/70 leading-[1.5]">
                  Everything auto-categorized. Find any document instantly.
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-[40px] text-[#8B5CF6]/30 fade-on-scroll" style={{ animationDelay: '0.4s' }}>
              →
            </div>

            {/* Step 3 */}
            <div className="flex-1 max-w-[320px] fade-on-scroll" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white/70 backdrop-blur-[40px] border-[0.5px] border-black/6 rounded-3xl p-12 text-center
                            hover:-translate-y-1 hover:shadow-xl transition-all duration-300
                            shadow-lg shadow-black/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white
                              flex items-center justify-center text-[20px] font-bold mx-auto mb-6">
                  3
                </div>
                <div className="text-[64px] mb-5">🔔</div>
                <h3 className="text-[24px] font-semibold text-[#1D1D1F] mb-3">Relax</h3>
                <p className="text-[17px] text-[#1D1D1F]/70 leading-[1.5]">
                  Smart reminders keep you ahead of every deadline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-[120px] px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 fade-on-scroll">
            <p className="text-[12px] font-semibold text-[#8B5CF6] uppercase tracking-[0.5px] mb-3">
              POWERFUL FEATURES
            </p>
            <h2 className="text-[48px] leading-[1.2] font-bold text-[#1D1D1F]">
              Everything you need.<br/>Nothing you don't.
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Large Feature 1 */}
            <div className="col-span-2 bg-white/70 backdrop-blur-[40px] border-[0.5px] border-black/6 rounded-3xl p-10
                          hover:scale-[1.01] transition-all duration-300 shadow-lg shadow-black/5
                          flex items-center gap-10 fade-on-scroll">
              <div className="flex-1">
                <div className="text-[48px] mb-4">🔔</div>
                <h3 className="text-[28px] font-semibold text-[#1D1D1F] mb-3">Smart Reminders</h3>
                <p className="text-[17px] text-[#1D1D1F]/70 leading-[1.5] mb-4">
                  Get notified 30, 7, and 1 day before anything expires. Customize to your schedule.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#8B5CF6] text-[17px] font-medium
                                       hover:translate-x-1 transition-transform">
                  Learn more <ChevronRight className="w-4 h-4" />
                </a>
              </div>
              <div className="flex-1">
                <div className="w-full h-[300px] bg-gradient-to-br from-[#8B5CF6]/10 to-[#A78BFA]/10 rounded-2xl
                              flex items-center justify-center">
                  <Bell className="w-20 h-20 text-[#8B5CF6]" />
                </div>
              </div>
            </div>

            {/* Small Feature 1 */}
            <div className="bg-white/70 backdrop-blur-[40px] border-[0.5px] border-black/6 rounded-3xl p-10
                          hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/5 fade-on-scroll">
              <div className="text-[48px] mb-4">🔒</div>
              <h3 className="text-[28px] font-semibold text-[#1D1D1F] mb-3">Password Protection</h3>
              <p className="text-[17px] text-[#1D1D1F]/70 leading-[1.5]">
                Lock sensitive documents with Touch ID or Face ID.
              </p>
            </div>

            {/* Small Feature 2 */}
            <div className="bg-white/70 backdrop-blur-[40px] border-[0.5px] border-black/6 rounded-3xl p-10
                          hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/5 fade-on-scroll">
              <div className="text-[48px] mb-4">☁️</div>
              <h3 className="text-[28px] font-semibold text-[#1D1D1F] mb-3">iCloud Sync</h3>
              <p className="text-[17px] text-[#1D1D1F]/70 leading-[1.5]">
                Access from iPhone, iPad, or Mac. Always up to date.
              </p>
            </div>

            {/* Large Feature 2 */}
            <div className="col-span-2 bg-white/70 backdrop-blur-[40px] border-[0.5px] border-black/6 rounded-3xl p-10
                          hover:scale-[1.01] transition-all duration-300 shadow-lg shadow-black/5
                          flex items-center gap-10 fade-on-scroll">
              <div className="flex-1">
                <div className="w-full h-[300px] bg-gradient-to-br from-[#8B5CF6]/10 to-[#A78BFA]/10 rounded-2xl
                              flex items-center justify-center">
                  <Calendar className="w-20 h-20 text-[#8B5CF6]" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[48px] mb-4">📅</div>
                <h3 className="text-[28px] font-semibold text-[#1D1D1F] mb-3">Visual Calendar</h3>
                <p className="text-[17px] text-[#1D1D1F]/70 leading-[1.5] mb-4">
                  See all expiration dates at a glance. Plan ahead with confidence.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#8B5CF6] text-[17px] font-medium
                                       hover:translate-x-1 transition-transform">
                  Learn more <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAMILY SHARING SECTION */}
      <section className="relative py-[120px] px-6 bg-[#F5F5F7]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-16 fade-on-scroll">
            {/* Left Content */}
            <div className="flex-1">
              <div className="text-[80px] mb-6">👨‍👩‍👧‍👦</div>
              <h2 className="text-[48px] leading-[1.2] font-bold text-[#1D1D1F] mb-4">
                Family Sharing
              </h2>
              <p className="text-[21px] text-[#1D1D1F]/70 leading-[1.5] mb-8">
                Share documents with up to six family members.<br/>
                Everyone gets their own private space.
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#8B5CF6] text-white px-8 py-4 rounded-xl text-[17px] font-semibold
                         hover:brightness-105 hover:-translate-y-[1px] active:translate-y-0
                         transition-all duration-200 shadow-xl shadow-[#8B5CF6]/40"
              >
                Set up Family Sharing
              </button>
            </div>

            {/* Right Visual */}
            <div className="flex-1">
              <div className="relative w-full h-[400px] flex items-center justify-center">
                {/* Overlapping Avatars in Circle */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (i * 60) * (Math.PI / 180);
                  const radius = 120;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]
                               border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl"
                      style={{
                        left: `calc(50% + ${x}px - 40px)`,
                        top: `calc(50% + ${y}px - 40px)`,
                      }}
                    >
                      {['👨', '👩', '👧', '👦', '👴', '👵'][i]}
                    </motion.div>
                  );
                })}

                {/* Center Icon */}
                <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#8B5CF6]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-[120px] px-6 bg-white">
        <div className="max-w-[800px] mx-auto text-center fade-on-scroll">
          <h2 className="text-[56px] leading-[1.2] font-bold text-[#1D1D1F] mb-4">
            Ready to get organized?
          </h2>
          <p className="text-[21px] text-[#1D1D1F]/70 leading-[1.5] mb-10">
            Start tracking for free. No credit card required.
          </p>

          <button
            onClick={() => navigate('/signup')}
            className="bg-[#8B5CF6] text-white px-12 py-[18px] rounded-xl text-[19px] font-semibold
                     hover:brightness-105 hover:-translate-y-[2px] active:translate-y-0
                     transition-all duration-200 shadow-2xl shadow-[#8B5CF6]/50 mb-8"
          >
            Get Started Free
          </button>

          <p className="text-[17px] text-[#1D1D1F]/60 mb-6">
            Available on iPhone, iPad, Mac, and Web
          </p>

          {/* Platform Icons */}
          <div className="flex items-center justify-center gap-8 text-[#1D1D1F]/40">
            <Smartphone className="w-8 h-8" />
            <Tablet className="w-8 h-8" />
            <Monitor className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#F5F5F7] border-t-[0.5px] border-black/10 py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Footer Grid */}
          <div className="grid grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Features</a>
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Pricing</a>
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">FAQ</a>
              </div>
            </div>

            <div>
              <h4 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">About</a>
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Blog</a>
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Contact</a>
              </div>
            </div>

            <div>
              <h4 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="/privacy" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Privacy</a>
                <a href="/terms" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Terms</a>
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Security</a>
              </div>
            </div>

            <div>
              <h4 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Download</h4>
              <div className="space-y-2">
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">iPhone</a>
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">iPad</a>
                <a href="#" className="block text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">Mac</a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex items-center justify-between pt-6 border-t-[0.5px] border-black/10">
            <p className="text-[14px] text-[#1D1D1F]/60">
              © 2024 DocuTrackr. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-[14px] text-[#1D1D1F]/60 hover:text-[#1D1D1F] transition-colors">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles for Animations */}
      <style>{`
        .fade-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #F5F5F7;
        }

        ::-webkit-scrollbar-thumb {
          background: #8B5CF6;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #7C3AED;
        }
      `}</style>
    </div>
  );
}

// Helper component for FileText icon (since it's not in lucide-react by default)
function FileText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M16 13H8"/>
      <path d="M16 17H8"/>
      <path d="M10 9H8"/>
    </svg>
  );
}
