import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Bell,
  Folder,
  Lock,
  Globe,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Edit,
  Lightbulb,
  Search,
  Shield,
  Eye,
  EyeOff,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  List,
  FileText,
  Users,
  Share2,
} from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../utils/animations';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
interface OnboardingTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const TOTAL_PAGES = 4;

export default function OnboardingTutorial({ isOpen, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setShowSkipConfirm(false);
    }
  }, [isOpen]);

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentPage < TOTAL_PAGES) {
      handleNext();
    } else if (isRightSwipe && currentPage > 1) {
      handlePrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleNext = () => {
    if (currentPage < TOTAL_PAGES) {
      triggerHaptic('light');
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      triggerHaptic('light');
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const confirmSkip = async () => {
    triggerHaptic('medium');
    if (user?.id) {
      await supabase
        .from('user_profiles')
        .update({
          tutorial_completed: true,
          tutorial_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }
    onSkip();
  };

  const handleComplete = async () => {
    triggerHaptic('medium');
    if (user?.id) {
      await supabase
        .from('user_profiles')
        .update({
          tutorial_completed: true,
          tutorial_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }
    // Show confetti effect (visual feedback)
    onComplete();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && currentPage < TOTAL_PAGES) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentPage === TOTAL_PAGES) {
          handleComplete();
        } else {
        handleNext();
      }
      } else if (e.key === 'Escape' && showSkipConfirm) {
        e.preventDefault();
        setShowSkipConfirm(false);
      } else if (e.key === 'Escape' && !showSkipConfirm) {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, showSkipConfirm]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={() => {}} // Prevent closing on backdrop click
      />
      
      {/* Modal Container - Minimal Design */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(26, 22, 37, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
      {/* Header - Minimal */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_PAGES }).map((_, index) => {
            const pageNum = index + 1;
            const isCurrent = pageNum === currentPage;
            const isCompleted = pageNum < currentPage;
            
            return (
              <motion.div
                key={pageNum}
                className="rounded-full transition-all"
                style={{
                  width: isCurrent ? '10px' : isCompleted ? '8px' : '8px',
                  height: isCurrent ? '10px' : isCompleted ? '8px' : '8px',
                  background: isCurrent
                    ? '#8B5CF6'
                    : isCompleted
                    ? '#8B5CF6'
                      : 'rgba(255, 255, 255, 0.2)',
                }}
                data-tablet-onboarding-dot="true"
              >
                <style>{`
                  @media (min-width: 768px) {
                    [data-tablet-onboarding-dot="true"] {
                      width: ${isCurrent ? '12px' : isCompleted ? '10px' : '10px'} !important;
                      height: ${isCurrent ? '12px' : isCompleted ? '10px' : '10px'} !important;
                    }
                  }
                `}</style>
              </motion.div>
            );
          })}
        </div>

        {/* Skip Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSkip}
          className="text-xs font-medium transition-colors"
          style={{ color: '#A78BFA' }}
          aria-label="Skip tutorial"
        >
          Skip
        </motion.button>
      </div>

      {/* Content Area - Minimal */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
            {currentPage === 1 && <Page1 key="page1" />}
            {currentPage === 2 && <Page2 key="page2" />}
            {currentPage === 3 && <Page3 key="page3" />}
            {currentPage === 4 && <Page4 key="page4" />}
        </AnimatePresence>
        </div>
      </div>

      {/* Footer - Minimal */}
      <div
        className="px-4 py-3"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Back Button */}
          {currentPage > 1 && (
          <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevious}
              className="h-10 px-4 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        )}

        {/* Page Indicator */}
          <span className="text-xs" style={{ color: '#A78BFA' }} aria-live="polite">
            {currentPage} / {TOTAL_PAGES}
          </span>

          {/* Next/Complete Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
            onClick={currentPage === TOTAL_PAGES ? handleComplete : handleNext}
            className="h-10 px-6 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
          }}
            aria-label={currentPage === TOTAL_PAGES ? 'Complete tutorial and start using app' : 'Go to next page'}
        >
          {currentPage === TOTAL_PAGES ? 'Get Started' : 'Next'}
            {currentPage === TOTAL_PAGES ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
          <ArrowRight className="w-4 h-4" />
            )}
        </motion.button>
        </div>
      </div>
        </motion.div>
      </div>

      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={() => setShowSkipConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full rounded-2xl p-6"
              style={{
                background: 'rgba(42, 38, 64, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(251, 146, 60, 0.2)',
                    border: '1px solid rgba(251, 146, 60, 0.4)',
                  }}
                >
                  <AlertTriangle className="w-8 h-8" style={{ color: '#FB923C' }} />
              </div>
                <h3 className="text-xl font-bold text-white mb-2">Skip Tutorial?</h3>
                <p className="text-sm" style={{ color: '#C7C3D9' }}>
                Are you sure? This tutorial will help you get the most out of DocuTrackr.
              </p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmSkip}
                  className="w-full h-12 rounded-xl font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
                  }}
                >
                  Skip Anyway
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSkipConfirm(false)}
                  className="w-full h-12 rounded-xl font-semibold text-white"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Continue Tutorial
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Page Components
function Page1() {
  const reducedMotion = prefersReducedMotion();
  
  return (
      <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className="flex flex-col items-center text-center"
      role="region"
      aria-label="Page 1 of 4: Welcome"
    >
      <motion.div
        animate={
          reducedMotion
            ? {}
            : {
          y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }
        }
        transition={
          reducedMotion
            ? {}
            : {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
              }
        }
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
        }}
      >
        <Calendar className="w-16 h-16 md:w-20 md:h-20 text-white" data-tablet-onboarding-icon="true" />
        <style>{`
          @media (min-width: 768px) {
            [data-tablet-onboarding-icon="true"] {
              width: 80px !important;
              height: 80px !important;
            }
          }
        `}</style>
      </motion.div>
      
      <h1
        className="text-3xl font-bold mb-3"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
        }}
      >
        Welcome to DocuTrackr!
      </h1>
      <p className="text-lg mb-8" style={{ color: '#A78BFA' }}>
        Never miss an important deadline again
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {['📄 Organize Documents', '🔔 Smart Reminders', '🔒 Secure Storage'].map((pill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="px-5 py-3 rounded-2xl"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="text-sm text-white">{pill}</span>
          </motion.div>
        ))}
    </div>
    </motion.div>
  );
}

function Page2() {
  const reducedMotion = prefersReducedMotion();

  return (
        <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className="space-y-6"
      role="region"
      aria-label="Page 2 of 4: Expiring Soon"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={reducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
          transition={reducedMotion ? {} : { duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
          }}
        >
          <Bell className="w-10 h-10" style={{ color: '#A78BFA' }} />
        </motion.div>
        <h2 className="text-2xl md:text-[40px] font-bold text-white mb-3">Never Miss an Expiry Date</h2>
        <p className="text-base md:text-[20px]" style={{ color: '#C7C3D9', lineHeight: '1.6' }}>
          We track all your documents and send smart reminders before they expire. Stay ahead of renewals!
        </p>
      </div>

      <div className="space-y-4">
        {[
          { days: '30 Days', label: 'Early Warning', color: '#EAB308', icon: Bell },
          { days: '7 Days', label: 'Heads Up', color: '#FB923C', icon: AlertTriangle },
          { days: '1 Day', label: 'Urgent!', color: '#EF4444', icon: AlertTriangle },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
              background: 'rgba(42, 38, 64, 0.5)',
              border: `1px solid ${item.color}40`,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `${item.color}20`,
                border: `2px solid ${item.color}`,
              }}
            >
              <item.icon className="w-6 h-6" style={{ color: item.color }} />
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-white">{item.label}</div>
              <div className="text-sm" style={{ color: '#C7C3D9' }}>
                {item.days} before expiration
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#A78BFA' }} />
        <p className="text-sm" style={{ color: '#C7C3D9' }}>
          Customize reminder times and quiet hours in Settings
          </p>
        </div>
      </motion.div>
  );
}

function Page3() {
  const reducedMotion = prefersReducedMotion();

  return (
        <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className="space-y-6"
      role="region"
      aria-label="Page 3 of 4: Document Sharing"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={reducedMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={reducedMotion ? {} : { duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
          }}
        >
          <Share2 className="w-10 h-10" style={{ color: '#A78BFA' }} />
        </motion.div>
        <h2 className="text-2xl md:text-[40px] font-bold text-white mb-3">Share with Family & Friends</h2>
        <p className="text-base" style={{ color: '#C7C3D9', lineHeight: '1.6' }}>
          Connect with family and share important documents securely. Perfect for household documents!
        </p>
      </div>

      <div className="space-y-4">
        {[
          { icon: Users, title: 'Add Connections', desc: 'Connect with family and friends', color: '#3B82F6' },
          { icon: Share2, title: 'Share Documents', desc: 'Choose view-only or edit permissions', color: '#8B5CF6' },
          { icon: Shield, title: 'Stay Secure', desc: 'Only share with trusted connections', color: '#10B981' },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
              background: 'rgba(42, 38, 64, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `${feature.color}20`,
                border: `1px solid ${feature.color}`,
              }}
            >
              <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-white mb-1">{feature.title}</div>
              <div className="text-sm" style={{ color: '#C7C3D9' }}>
                {feature.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#A78BFA' }} />
        <p className="text-sm" style={{ color: '#C7C3D9' }}>
          Access the Family & Friends page from the bottom navigation
        </p>
    </div>
    </motion.div>
  );
}

function Page4() {
  const reducedMotion = prefersReducedMotion();

  return (
        <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className="space-y-6 relative"
      role="region"
      aria-label="Page 4 of 4: Important Dates & Get Started"
    >
      {/* Confetti Effect */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'][i % 4],
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
              }}
          animate={{
                y: [0, -100, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * 50, 0],
                opacity: [1, 0.5, 0],
                scale: [1, 1.5, 0],
          }}
          transition={{
                duration: 2,
                delay: i * 0.1,
            repeat: Infinity,
                repeatDelay: 3,
              }}
            />
        ))}
      </div>
      )}

      <div className="text-center mb-6 relative z-10">
      <motion.div
          animate={reducedMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={reducedMotion ? {} : { duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
        }}
      >
          <Calendar className="w-10 h-10" style={{ color: '#A78BFA' }} />
      </motion.div>
        <h2 className="text-2xl md:text-[40px] font-bold text-white mb-3">Track Important Dates</h2>
        <p className="text-base" style={{ color: '#C7C3D9', lineHeight: '1.6' }}>
          View all expiration dates in a beautiful calendar view
        </p>
    </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
      <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-2xl"
        style={{
            background: 'rgba(42, 38, 64, 0.5)',
            border: '2px solid rgba(139, 92, 246, 0.5)',
          }}
        >
          <Calendar className="w-8 h-8 mb-2" style={{ color: '#A78BFA' }} />
          <div className="text-sm font-semibold text-white mb-1">Calendar View</div>
          <div className="text-xs" style={{ color: '#C7C3D9' }}>
            Visual overview
          </div>
      </motion.div>
      
          <motion.div
          initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-2xl"
            style={{
              background: 'rgba(42, 38, 64, 0.5)',
            border: '2px solid rgba(139, 92, 246, 0.5)',
          }}
        >
          <List className="w-8 h-8 mb-2" style={{ color: '#A78BFA' }} />
          <div className="text-sm font-semibold text-white mb-1">List View</div>
          <div className="text-xs" style={{ color: '#C7C3D9' }}>
            By month
            </div>
          </motion.div>
      </div>

      {/* Congratulations Section */}
      <div className="text-center relative z-10">
          <motion.div
          animate={reducedMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={reducedMotion ? {} : { duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
            }}
          >
          <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
        <h1
          className="text-3xl font-bold mb-3"
        style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 50%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
          }}
        >
          Congratulations! 🎉
        </h1>
        <p className="text-lg" style={{ color: '#A78BFA' }}>
          You're all set! Let's get started.
        </p>
    </div>
    </motion.div>
  );
}
