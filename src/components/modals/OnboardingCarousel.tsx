import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Camera, FolderOpen, Bell, Sparkles, FileText } from 'lucide-react';

interface OnboardingCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingScreen {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  illustration: string;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens: OnboardingScreen[] = [
    {
      id: 1,
      icon: <FileText size={120} strokeWidth={1.5} />,
      title: 'Welcome to DocuTrack',
      description: 'Your personal document management system that keeps all your important documents organized and accessible.',
      features: [
        'Securely store all your documents',
        'Never miss an expiry date',
        'Access from anywhere',
        'Share with family members',
      ],
      illustration: '📱',
    },
    {
      id: 2,
      icon: <Camera size={120} strokeWidth={1.5} />,
      title: 'Scan Documents',
      description: 'Easily capture and digitize your physical documents with our intelligent scanning technology.',
      features: [
        'Auto-detect document edges',
        'OCR text recognition',
        'Multi-page scanning',
        'High-quality image processing',
      ],
      illustration: '📸',
    },
    {
      id: 3,
      icon: <FolderOpen size={120} strokeWidth={1.5} />,
      title: 'Organize Everything',
      description: 'Keep your documents organized with smart categories, tags, and powerful search capabilities.',
      features: [
        'Custom categories',
        'Smart tagging system',
        'Instant search',
        'Filters and sorting',
      ],
      illustration: '🗂️',
    },
    {
      id: 4,
      icon: <Bell size={120} strokeWidth={1.5} />,
      title: 'Stay Reminded',
      description: 'Never miss important dates with our intelligent reminder system that keeps you notified.',
      features: [
        'Customizable reminders',
        'Multiple notification channels',
        'Quiet hours support',
        'Smart scheduling',
      ],
      illustration: '🔔',
    },
    {
      id: 5,
      icon: <Sparkles size={120} strokeWidth={1.5} />,
      title: 'Ready to Start!',
      description: 'You\'re all set! Start organizing your documents and never lose track of important dates again.',
      features: [
        'Secure cloud storage',
        'Family sharing',
        'Cross-platform sync',
        'Premium support',
      ],
      illustration: '✨',
    },
  ];

  const currentScreenData = screens[currentScreen];
  const isFirstScreen = currentScreen === 0;
  const isLastScreen = currentScreen === screens.length - 1;

  const handleNext = () => {
    if (isLastScreen) {
      onComplete();
    } else {
      setCurrentScreen((prev) => Math.min(prev + 1, screens.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentScreen((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          handleSkip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentScreen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-white dark:bg-gray-900"
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-medium z-10"
      >
        {!isLastScreen && (
          <>
            <span>Skip Tutorial</span>
            <X size={20} />
          </>
        )}
      </button>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Left Side - Illustration */}
        <div
          className="w-1/2 flex items-center justify-center bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 relative overflow-hidden"
          style={{
            animation: `slideInLeft 0.5s ease-out`,
          }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
              style={{
                animation: 'float 8s ease-in-out infinite reverse',
              }}
            />
          </div>

          {/* Icon/Illustration */}
          <div
            className="relative z-10"
            style={{
              animation: `scaleIn 0.5s ease-out ${currentScreen * 0.1}s both`,
            }}
          >
            <div className="text-white mb-8 flex justify-center">
              {currentScreenData.icon}
            </div>
            <div
              className="text-9xl text-center"
              style={{
                animation: 'bounce 2s ease-in-out infinite',
              }}
            >
              {currentScreenData.illustration}
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-1/2 flex flex-col justify-center px-20 py-16">
          <div
            style={{
              animation: `slideInRight 0.5s ease-out`,
            }}
          >
            {/* Title */}
            <h1
              className="font-bold text-gray-900 dark:text-white mb-6"
              style={{
                fontSize: '48px',
                lineHeight: '1.2',
              }}
            >
              {currentScreenData.title}
            </h1>

            {/* Description */}
            <p
              className="text-gray-600 dark:text-gray-400 mb-8"
              style={{
                fontSize: '22px',
                lineHeight: '1.6',
              }}
            >
              {currentScreenData.description}
            </p>

            {/* Features */}
            <div className="space-y-4 mb-12">
              {currentScreenData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4"
                  style={{
                    animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {/* Progress Timeline */}
              <div className="flex gap-3">
                {screens.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreen(index)}
                    className={`transition-all ${
                      index === currentScreen
                        ? 'w-16 h-2 bg-purple-500'
                        : index < currentScreen
                        ? 'w-8 h-2 bg-purple-300 dark:bg-purple-700'
                        : 'w-8 h-2 bg-gray-300 dark:bg-gray-700'
                    } rounded-full`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {!isFirstScreen && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-all font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                  style={{
                    minWidth: isLastScreen ? '320px' : '140px',
                    height: isLastScreen ? '64px' : '48px',
                    fontSize: isLastScreen ? '20px' : '16px',
                  }}
                >
                  {isLastScreen ? (
                    <>
                      Get Started
                      <Sparkles size={24} />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Skip Tutorial Link (Last Screen) */}
            {isLastScreen && (
              <div className="text-center mt-6">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
                >
                  Skip Tutorial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Previous/Next Arrows on Sides */}
      {!isFirstScreen && (
        <button
          onClick={handlePrevious}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-110"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {!isLastScreen && (
        <button
          onClick={handleNext}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-purple-500 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-purple-600 transition-all hover:scale-110"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(20px);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};
