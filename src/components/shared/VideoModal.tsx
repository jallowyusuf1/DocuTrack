import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useNavigate } from 'react-router-dom';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  videoId?: string; // For YouTube embeds
  useYouTube?: boolean;
}

// Analytics tracking helper
const trackVideoEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Google Analytics gtag (if available)
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, data);
    }
    // Custom analytics event (can be extended)
    window.dispatchEvent(new CustomEvent('videoAnalytics', {
      detail: { eventName, data }
    }));
  }
  // Also log for debugging
  console.log(`[Video Analytics] ${eventName}`, data);
};

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  videoId,
  useYouTube = false,
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showPostVideoCTA, setShowPostVideoCTA] = useState(false);
  const [watchDuration, setWatchDuration] = useState(0);
  const trackedMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowPostVideoCTA(false);
      trackedMilestones.current.clear();
      setWatchDuration(0);
      
      // Track modal opened
      trackVideoEvent('video_demo_opened');
      
      // Auto-play video after animation
      setTimeout(() => {
        if (videoRef.current && !useYouTube) {
          videoRef.current.play().catch(() => {
            // Autoplay blocked, user will need to click play
          });
        }
      }, 400);
    } else {
      document.body.style.overflow = '';
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      // Track modal closed with watch duration
      if (watchDuration > 0) {
        trackVideoEvent('video_demo_closed', { duration: watchDuration });
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, useYouTube, watchDuration]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        triggerHaptic('light');
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Track video events and milestones
  useEffect(() => {
    const video = videoRef.current;
    if (!video || useYouTube) return;

    const milestones = [25, 50, 75, 100];

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      
      const percent = (video.currentTime / video.duration) * 100;
      setWatchDuration(video.currentTime);
      
      // Track milestones
      milestones.forEach((milestone) => {
        if (percent >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone);
          trackVideoEvent('video_progress', { milestone: `${milestone}%` });
        }
      });
    };

    const handleEnded = () => {
      trackVideoEvent('video_completed');
      setShowPostVideoCTA(true);
    };

    const handlePlay = () => {
      trackVideoEvent('video_played');
    };

    const handlePause = () => {
      trackVideoEvent('video_paused');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [useYouTube]);

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setShowPostVideoCTA(false);
      trackedMilestones.current.clear();
      trackVideoEvent('video_replay');
    }
  };

  const handleGetStarted = () => {
    trackVideoEvent('video_cta_clicked', { action: 'get_started' });
    triggerHaptic('medium');
    onClose();
    navigate('/signup');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      triggerHaptic('light');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9998] cursor-pointer"
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
            onClick={handleBackdropClick}
          />

          {/* Video Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative w-full max-w-[1200px] aspect-video pointer-events-auto"
              style={{
                background: 'rgba(26, 22, 37, 0.8)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(37, 99, 235, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(37, 99, 235, 0.3)',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.1,
                  background: 'rgba(37, 99, 235, 0.9)',
                  boxShadow: '0 0 30px rgba(37, 99, 235, 0.6)',
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="absolute -top-14 md:-top-16 right-0 md:right-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: 'rgba(42, 38, 64, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                }}
                aria-label="Close video"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              </motion.button>

              {/* Video Player */}
              {useYouTube && videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                  frameBorder="0"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  className="w-full h-full rounded-[22px]"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-cover rounded-[22px] demo-video"
                    poster="/video-thumbnail.jpg"
                    style={{
                      borderRadius: '22px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {videoUrl && (
                      <>
                        <source src={videoUrl} type="video/mp4" />
                        <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
                      </>
                    )}
                    Your browser does not support the video tag.
                  </video>

                  {/* Post-Video CTA Overlay */}
                  <AnimatePresence>
                    {showPostVideoCTA && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center rounded-[22px] z-10"
                        style={{
                          background: 'rgba(0, 0, 0, 0.85)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 20 }}
                          className="text-center px-6 py-8 max-w-md"
                        >
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Ready to get started?
                          </h3>
                          <p className="text-base text-gray-300 mb-6">
                            Join thousands who never miss a deadline
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleGetStarted}
                              className="px-8 py-3 rounded-xl font-semibold text-white"
                              style={{
                                background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
                                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
                              }}
                            >
                              Create Free Account
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleReplay}
                              className="px-8 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                              style={{
                                background: 'rgba(42, 38, 64, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                              }}
                            >
                              <Play className="w-4 h-4" />
                              Watch Again
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

