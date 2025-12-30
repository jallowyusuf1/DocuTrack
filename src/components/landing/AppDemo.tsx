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
} from 'lucide-react';

interface DemoSlide {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  description: string;
  visual: 'ocr' | 'reminders' | 'family' | 'theme' | 'dates' | 'intro';
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
    title: 'Beautiful Themes',
    subtitle: 'Light & dark mode',
    icon: Sun,
    description: 'Premium glass morphism design. Switch themes with a tap.',
    visual: 'theme',
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
    }, 4000); // 4 seconds per slide

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: '#000000',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
              {slide.visual === 'theme' && <ThemeVisual accentColor={slide.accentColor} />}
              {slide.visual === 'dates' && <ImportantDatesVisual accentColor={slide.accentColor} />}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Pause/Play Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="pause"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Pause className="w-5 h-5 text-white fill-white" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.3 }}
              >
                <PlayIcon className="w-5 h-5 text-white fill-white ml-0.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
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
      {/* Notification Cards */}
      {[
        { days: 7, color: '#EF4444', label: 'Passport expires in 7 days' },
        { days: 23, color: '#F97316', label: 'License expires in 23 days' },
        { days: 45, color: '#10B981', label: 'Visa expires in 45 days' },
      ].map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + idx * 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${item.color}44`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: `${item.color}22` }}
            >
              <Bell className="w-6 h-6" style={{ color: item.color }} />
            </motion.div>
            <div className="flex-1">
              <p className="text-white font-medium">{item.label}</p>
              <p className="text-white/60 text-sm">Tap to renew</p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: `${item.color}33`,
                color: item.color,
              }}
            >
              {item.days}d
            </div>
          </div>
        </motion.div>
      ))}
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

function ThemeVisual({ accentColor }: { accentColor: string }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsDark((prev) => !prev);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      animate={{
        background: isDark ? '#000000' : '#FFFFFF',
      }}
      transition={{ duration: 0.8 }}
      className="rounded-3xl p-8"
      style={{
        border: '1px solid rgba(128, 128, 128, 0.2)',
      }}
    >
      {/* Theme Toggle */}
      <div className="flex justify-center mb-6">
        <motion.div
          animate={{
            background: isDark
              ? 'rgba(96, 165, 250, 0.2)'
              : 'rgba(251, 191, 36, 0.2)',
          }}
          className="rounded-full p-3"
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Moon className="w-8 h-8" style={{ color: '#60A5FA' }} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sun className="w-8 h-8" style={{ color: '#FBBF24' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sample Cards */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
            }}
            transition={{ duration: 0.8 }}
            className="rounded-xl p-4"
            style={{
              border: '1px solid',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <motion.div
              animate={{
                color: isDark ? '#FFFFFF' : '#000000',
              }}
              className="font-medium"
            >
              Document {i}
            </motion.div>
            <motion.div
              animate={{
                color: isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(0, 0, 0, 0.6)',
              }}
              className="text-sm mt-1"
            >
              Glass morphism styling
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
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
