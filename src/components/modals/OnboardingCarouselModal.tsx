import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Camera, Folder, Bell, FileText } from 'lucide-react';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';

interface OnboardingCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface Screen {
  id: number;
  icon: typeof Camera;
  title: string;
  description: string;
  features: string[];
  illustration?: React.ReactNode;
}

const SCREENS: Screen[] = [
  {
    id: 1,
    icon: FileText,
    title: 'Welcome to DocuTrack',
    description: 'Your personal document management system',
    features: [
      'Organize all your important documents',
      'Never miss an expiration date',
      'Share securely with family',
      'Access from anywhere',
    ],
  },
  {
    id: 2,
    icon: Camera,
    title: 'Scan Documents',
    description: 'Capture documents instantly with your camera',
    features: [
      'High-quality document scanning',
      'Automatic text recognition',
      'Smart cropping and enhancement',
      'Multiple format support',
    ],
  },
  {
    id: 3,
    icon: Folder,
    title: 'Organize Smartly',
    description: 'Categorize and find documents easily',
    features: [
      'Custom categories and tags',
      'Powerful search functionality',
      'Quick filters and sorting',
      'Visual document grid',
    ],
  },
  {
    id: 4,
    icon: Bell,
    title: 'Never Miss Deadlines',
    description: 'Get reminders before documents expire',
    features: [
      'Customizable reminder settings',
      'Multiple notification channels',
      'Quiet hours support',
      'Family sharing alerts',
    ],
  },
  {
    id: 5,
    icon: FileText,
    title: 'Ready to Get Started?',
    description: 'Start managing your documents today',
    features: [
      'Add your first document',
      'Set up reminders',
      'Invite family members',
      'Explore all features',
    ],
  },
];

export default function OnboardingCarouselModal({
  isOpen,
  onClose,
  onComplete,
}: OnboardingCarouselModalProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentScreen(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentScreen < SCREENS.length - 1) {
      setDirection(1);
      setCurrentScreen((prev) => prev + 1);
      triggerHaptic('light');
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setDirection(-1);
      setCurrentScreen((prev) => prev - 1);
      triggerHaptic('light');
    }
  };

  const handleComplete = () => {
    triggerHaptic('medium');
    onComplete();
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentScreen]);

  const screen = SCREENS[currentScreen];
  const Icon = screen.icon;
  const progress = ((currentScreen + 1) / SCREENS.length) * 100;

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      width="100vw"
      height="100vh"
      className="!rounded-none !max-h-none"
      showCloseButton={false}
    >
      <div className="flex h-full relative">
        {/* Skip Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Illustration */}
        <div className="w-1/2 flex items-center justify-center p-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Icon className="w-32 h-32 text-purple-400" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">{screen.title}</h2>
              <p className="text-xl text-white/70">{screen.description}</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Content */}
        <div className="w-1/2 flex flex-col justify-center p-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-center mb-8">
                <Icon className="w-30 h-30 text-purple-400" style={{ width: '120px', height: '120px' }} />
              </div>

              <h1 className="text-5xl font-bold text-white text-center mb-4">{screen.title}</h1>
              <p className="text-[22px] text-white/70 text-center mb-8">{screen.description}</p>

              <ul className="space-y-4 max-w-md mx-auto">
                {screen.features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 text-lg text-white/80"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentScreen === 0}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Progress Timeline */}
            <div className="flex-1 mx-8">
              <div className="flex items-center justify-between mb-2">
                {SCREENS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 mx-1 rounded-full transition-all ${
                      idx <= currentScreen ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <div className="text-center text-sm text-white/60">
                {currentScreen + 1} of {SCREENS.length}
              </div>
            </div>

            {currentScreen === SCREENS.length - 1 ? (
              <button
                onClick={handleComplete}
                className="px-8 py-4 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
                style={{ width: '320px', height: '64px' }}
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {currentScreen === SCREENS.length - 1 && (
            <button
              onClick={onClose}
              className="text-center text-sm text-white/60 hover:text-white/80 mt-4"
            >
              Skip Tutorial
            </button>
          )}
        </div>
      </div>
    </DesktopModal>
  );
}

