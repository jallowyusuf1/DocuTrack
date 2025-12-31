import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CheckCircle,
  Bell,
  Users,
  Shield,
  Sun,
  Moon,
  Calendar,
  FileText,
  Clock,
  Smartphone,
  Plane,
  Pause,
  Play as PlayIcon,
  HelpCircle,
  MessageCircle,
  Search,
} from 'lucide-react';

interface DemoSlide {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  description: string;
  visual: 'ocr' | 'reminders' | 'family' | 'faq' | 'dates' | 'intro';
  accentColor: string;
}

const slides: DemoSlide[] = [
  {
    id: 1,
    title: 'DocuTrackr',
    subtitle: 'Never miss a deadline again',
    icon: FileText,
    description: 'Your complete document management solution with smart reminders',
    visual: 'intro',
    accentColor: '#3B82F6',
  },
  {
    id: 2,
    title: 'Instant OCR Capture',
    subtitle: 'Scan documents in seconds',
    icon: Camera,
    description: 'Point your camera at any document. Our AI extracts all fields automatically.',
    visual: 'ocr',
    accentColor: '#8B5CF6',
  },
  {
    id: 3,
    title: 'Smart Reminders',
    subtitle: 'Never miss renewals',
    icon: Bell,
    description: 'Get notified 30, 7, and 1 day before expiration. Stay ahead of deadlines.',
    visual: 'reminders',
    accentColor: '#F97316',
  },
  {
    id: 4,
    title: 'Secure Family Sharing',
    subtitle: 'Share documents safely',
    icon: Users,
    description: 'Share important documents with family members across all devices.',
    visual: 'family',
    accentColor: '#10B981',
  },
  {
    id: 5,
    title: 'Help & Support',
    subtitle: '24/7 assistance',
    icon: HelpCircle,
    description: 'Get instant answers to your questions. Comprehensive FAQ and support center.',
    visual: 'faq',
    accentColor: '#EC4899',
  },
  {
    id: 6,
    title: 'Important Dates',
    subtitle: 'Track travel & renewals',
    icon: Calendar,
    description: 'Never miss a flight or expiration. Track important dates across all documents.',
    visual: 'dates',
    accentColor: '#06B6D4',
  },
];

export default function AppDemo({
  onSlideChange,
  currentSlideIndex = 0
}: {
  onSlideChange?: (index: number) => void;
  currentSlideIndex?: number;
}) {
  const [currentSlide, setCurrentSlide] = useState(currentSlideIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  const slide = slides[currentSlide];

  // Notify parent of slide changes
  useEffect(() => {
    onSlideChange?.(currentSlide);
  }, [currentSlide, onSlideChange]);

  // Sync with external control
  useEffect(() => {
    setCurrentSlide(currentSlideIndex);
  }, [currentSlideIndex]);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: '#000000' }}>
      {/* Background - solid black, no transitions */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: '#000000',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
          >
            {/* Left: Text Content */}
            <div className="space-y-4 lg:space-y-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${slide.accentColor}33 0%, ${slide.accentColor}11 100%)`,
                  border: `1px solid ${slide.accentColor}44`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `0 20px 60px ${slide.accentColor}33, inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                <slide.icon className="w-10 h-10" style={{ color: slide.accentColor }} />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-5xl font-bold text-white"
                style={{
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {slide.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-2xl font-medium"
                style={{ color: slide.accentColor }}
              >
                {slide.subtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-base lg:text-lg text-white/70 leading-relaxed max-w-md"
              >
                {slide.description}
              </motion.p>
            </div>

            {/* Right: Visual Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              {slide.visual === 'intro' && <IntroVisual accentColor={slide.accentColor} />}
              {slide.visual === 'ocr' && <OCRVisual accentColor={slide.accentColor} />}
              {slide.visual === 'reminders' && <RemindersVisual accentColor={slide.accentColor} />}
              {slide.visual === 'family' && <FamilyVisual accentColor={slide.accentColor} />}
              {slide.visual === 'faq' && <FAQVisual accentColor={slide.accentColor} />}
              {slide.visual === 'dates' && <ImportantDatesVisual accentColor={slide.accentColor} />}
            </motion.div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

// Export slides for external use
export { slides };

// Visual Components

function IntroVisual({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accentColor}44 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full rounded-3xl flex items-center justify-center"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <FileText className="w-32 h-32" style={{ color: accentColor }} />
      </motion.div>
    </div>
  );
}

function OCRVisual({ accentColor }: { accentColor: string }) {
  return (
    <div className="space-y-4">
      {/* Document Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-6 h-6" style={{ color: accentColor }} />
          <span className="text-white font-medium">Scanning Document...</span>
        </div>

        {/* Scan Line Animation */}
        <div className="relative h-40 rounded-xl overflow-hidden mb-4" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
          <motion.div
            animate={{ y: [0, 140, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-1"
            style={{
              background: accentColor,
              boxShadow: `0 0 20px ${accentColor}`,
            }}
          />
        </div>

        {/* Extracted Fields */}
        <div className="space-y-2">
          {['Passport Number', 'Full Name', 'Expiry Date'].map((field, idx) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.2 }}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <span className="text-white/60 text-sm">{field}</span>
              <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function RemindersVisual({ accentColor }: { accentColor: string }) {
  return (
    <div className="space-y-4">
      {/* Main Container with Purple Gradient */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(88, 86, 214, 0.4) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(59, 130, 246, 0.2) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: '0 20px 60px rgba(88, 86, 214, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <Bell className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Smart reminders</span>
        </div>

        {/* Description */}
        <p className="text-white/80 text-sm mb-5">
          Get notified at 30, 7, and 1 day before expiration - never miss a deadline.
        </p>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Upcoming Reminders */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
            <h4 className="text-white/90 font-medium text-sm mb-3">Upcoming reminders</h4>
            <div className="space-y-2">
              {[
                { icon: '🛂', label: 'Passport expires', days: '30 days', color: '#F59E0B' },
                { icon: '📄', label: 'Insurance renewal', days: '7 days', color: '#F97316' },
                { icon: '✈️', label: 'Visa expires', days: '1 day', color: '#EF4444' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.15 }}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs truncate">{item.label}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: `${item.color}33`, color: item.color }}
                  >
                    {item.days}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
            <h4 className="text-white/90 font-medium text-sm mb-3">Notification settings</h4>
            <div className="space-y-2">
              {[
                { label: '30 days before' },
                { label: '7 days before' },
                { label: '1 day before' },
                { label: 'On expiration day' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.15 }}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <span className="text-white/70 text-xs">{item.label}</span>
                  <div
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(16, 185, 129, 0.3)', color: '#10B981' }}
                  >
                    On
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FamilyVisual({ accentColor }: { accentColor: string }) {
  const members = ['Mom', 'Dad', 'Sarah', 'Jake'];

  return (
    <div className="space-y-6">
      {/* Member Avatars */}
      <div className="flex justify-center gap-4">
        {members.map((member, idx) => (
          <motion.div
            key={member}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="relative"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: accentColor,
              }}
            >
              {member[0]}
            </div>
            {idx < members.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6 + idx * 0.1, duration: 0.3 }}
                className="absolute top-1/2 -right-4 w-4 h-0.5"
                style={{ background: accentColor }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Shared Document */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${accentColor}44`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-6 h-6" style={{ color: accentColor }} />
          <span className="text-white font-medium">Family Passport</span>
        </div>
        <p className="text-white/60 text-sm">Shared with all members • End-to-end encrypted</p>
      </motion.div>
    </div>
  );
}

function FAQVisual({ accentColor }: { accentColor: string }) {
  const faqs = [
    { question: 'How secure is my data?', category: 'Security' },
    { question: 'Can I share documents?', category: 'Features' },
    { question: 'How do reminders work?', category: 'Notifications' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${accentColor}44`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <Search className="w-5 h-5" style={{ color: accentColor }} />
        <input
          type="text"
          placeholder="Search help articles..."
          disabled
          className="flex-1 bg-transparent text-white/70 text-sm outline-none"
          style={{ caretColor: accentColor }}
        />
      </motion.div>

      {/* FAQ Items */}
      {faqs.map((faq, idx) => (
        <motion.div
          key={faq.question}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + idx * 0.2 }}
          className="rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: idx * 0.5 }}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `${accentColor}22`,
                border: `1px solid ${accentColor}66`,
              }}
            >
              <HelpCircle className="w-5 h-5" style={{ color: accentColor }} />
            </motion.div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm mb-1">{faq.question}</p>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: `${accentColor}22`,
                    color: accentColor,
                  }}
                >
                  {faq.category}
                </span>
                <MessageCircle className="w-4 h-4 text-white/40" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Help Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="rounded-xl p-4 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <p className="text-white/60 text-sm">Need more help?</p>
        <p className="text-white font-medium text-sm" style={{ color: accentColor }}>
          Contact Support 24/7
        </p>
      </motion.div>
    </div>
  );
}

function ImportantDatesVisual({ accentColor }: { accentColor: string }) {
  const flights = [
    { airline: 'Emirates', route: 'DXB → JFK', date: 'Jan 15', color: '#D71920' },
    { airline: 'Saudia', route: 'RUH → LHR', date: 'Feb 23', color: '#00843D' },
    { airline: 'Etihad', route: 'AUH → LAX', date: 'Mar 10', color: '#85662E' },
  ];

  return (
    <div className="space-y-4">
      {/* Flight Cards */}
      {flights.map((flight, idx) => (
        <motion.div
          key={flight.airline}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + idx * 0.2 }}
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${flight.color}44`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Animated Airplane */}
          <motion.div
            animate={{ x: [-40, 400] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: idx * 1,
              ease: 'linear',
            }}
            className="absolute top-3 left-0"
            style={{ opacity: 0.3 }}
          >
            <Plane
              className="w-5 h-5"
              style={{
                color: flight.color,
                transform: 'rotate(-45deg)',
              }}
            />
          </motion.div>

          {/* Flight Info */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `${flight.color}22`,
                    border: `1px solid ${flight.color}66`,
                  }}
                >
                  <Plane
                    className="w-5 h-5"
                    style={{
                      color: flight.color,
                      transform: 'rotate(-45deg)',
                    }}
                  />
                </div>
                <div>
                  <p className="text-white font-semibold">{flight.airline}</p>
                  <p className="text-white/60 text-sm">{flight.route}</p>
                </div>
              </div>
            </div>

            {/* Date Badge */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: idx * 0.3,
              }}
              className="px-4 py-2 rounded-xl font-semibold"
              style={{
                background: `${flight.color}33`,
                color: flight.color,
                border: `1px solid ${flight.color}66`,
              }}
            >
              {flight.date}
            </motion.div>
          </div>

          {/* Flight Path Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5 + idx * 0.2, duration: 0.6 }}
            className="mt-3 h-0.5 origin-left"
            style={{
              background: `linear-gradient(90deg, ${flight.color}88 0%, ${flight.color}22 100%)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
