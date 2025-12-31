import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import GlassModal from '../ui/glass/GlassModal';
import GlassButton from '../ui/glass/GlassButton';
import { prefersReducedMotion } from '../../utils/animations';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  documentPreview?: {
    thumbnail?: string;
    name: string;
    type: string;
    expiryCountdown?: string;
  };
  onViewDocument?: () => void;
  onAddAnother?: () => void;
  autoCloseDelay?: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Document Added Successfully!',
  subtitle,
  documentPreview,
  onViewDocument,
  onAddAnother,
  autoCloseDelay = 3000,
}: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (isOpen) {
      // Play PING sound (Apple-like success sound)
      const audio = new Audio();
      // Using a data URI for a simple beep sound (you can replace with actual sound file)
      audio.src =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUBAOUKzn8L1pJAY0j9Xy0oE3CBxsvO3onlEQDlCs5/C9aSQGNI/V8tKBNwgcbbzt6J5REA5QrOfwvWkkBjSP1fLSgTcIHG287eieURAOUKzn8L1pJAY0j9Xy0oE3CBxsvO3onlEQDlCs5/C9aSQGNI/V8tKBNwgcbbzt6J5REA5QrOfwvWkkBjSP1fLSgTcIHG287eieURAOUKzn8L1pJAY0j9Xy0oE3CBxsvO3onlEQDlCs5/C9aSQGNI/V8tKBNwgcbbzt6J5REA5QrOfwvWkkBjSP1fLSgTcIHG287eieURAOUKzn8L1pJAY0j9Xy0oE3CBxsvO3onlEQDlCs5/C9aSQGNI/V8tKBNwgcbbzt6J5REA5QrOfwvWkkBjSP1fLSgTcIHG287eieURAOUKzn8L1pJAY0j9Xy0oE3CBxsvO3onlEQDlCs5/C9aSQGNI/V8tKBNwgcbc=';
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback: Use Web Audio API for a simple ping sound
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
          // Silent fail if audio not supported
        }
      });

      setShowConfetti(true);
      setPlaySound(true);

      // Auto-close after delay
      const timer = setTimeout(() => {
        if (onViewDocument) {
          onViewDocument();
        } else {
          onClose();
        }
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onViewDocument, onClose]);

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col items-center text-center">
        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && !reduced && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    opacity: [1, 0],
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 360,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1,
                    delay: i * 0.05,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][
                      Math.floor(Math.random() * 4)
                    ],
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Success Icon */}
        <motion.div
          initial={reduced ? false : { scale: 0, rotate: -180 }}
          animate={reduced ? undefined : { scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
            border: '3px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)',
          }}
        >
          <motion.div
            initial={reduced ? false : { scale: 0 }}
            animate={reduced ? undefined : { scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.4,
            }}
          >
            <Check className="w-12 h-12 md:w-14 md:h-14 text-green-500" strokeWidth={4} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-[28px] font-bold mb-2"
          style={{ color: '#FFFFFF' }}
        >
          {title}
        </motion.h2>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base mb-6"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Document Preview */}
        {documentPreview && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={reduced ? undefined : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full mb-6 rounded-xl p-4"
            style={{
              background: 'rgba(40, 40, 40, 0.5)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {documentPreview.thumbnail && (
              <img
                src={documentPreview.thumbnail}
                alt={documentPreview.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <div className="text-left">
              <p className="font-semibold text-white mb-1">{documentPreview.name}</p>
              <p className="text-sm text-white/60 mb-1">{documentPreview.type}</p>
              {documentPreview.expiryCountdown && (
                <p className="text-sm text-green-500">{documentPreview.expiryCountdown}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          {onViewDocument && (
            <GlassButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={onViewDocument}
            >
              View Document
            </GlassButton>
          )}
          {onAddAnother && (
            <GlassButton
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onAddAnother}
            >
              Add Another
            </GlassButton>
          )}
        </motion.div>
      </div>
    </GlassModal>
  );
}



