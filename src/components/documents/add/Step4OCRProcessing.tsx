import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import GlassModal from '../../ui/glass/GlassModal';
import GlassTile from '../../ui/glass/GlassTile';
import GlassButton from '../../ui/glass/GlassButton';
import { prefersReducedMotion } from '../../../utils/animations';

interface Step4OCRProcessingProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  onSuccess: (extractedData: Record<string, any>) => void;
  onError: (error: string) => void;
  onRetry: () => void;
  onUseDifferentPhoto: () => void;
  onEnterManually: () => void;
}

type ProcessingStage =
  | 'connecting'
  | 'uploading'
  | 'reading'
  | 'extracting'
  | 'analyzing'
  | 'finalizing'
  | 'success'
  | 'error';

const STAGES: { stage: ProcessingStage; label: string; progress: number }[] = [
  { stage: 'connecting', label: 'Connecting...', progress: 10 },
  { stage: 'uploading', label: 'Uploading image...', progress: 30 },
  { stage: 'reading', label: 'Reading document...', progress: 60 },
  { stage: 'extracting', label: 'Extracting fields...', progress: 85 },
  { stage: 'analyzing', label: 'Analyzing data...', progress: 95 },
  { stage: 'finalizing', label: 'Finalizing...', progress: 100 },
];

export default function Step4OCRProcessing({
  isOpen,
  onClose,
  imageUrl,
  onSuccess,
  onError,
  onRetry,
  onUseDifferentPhoto,
  onEnterManually,
}: Step4OCRProcessingProps) {
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('connecting');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedCount, setExtractedCount] = useState(0);
  const [totalFields, setTotalFields] = useState(17);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage('connecting');
      setProgress(0);
      setErrorMessage(null);
      return;
    }

    // Simulate OCR processing
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < STAGES.length) {
        const stage = STAGES[currentIndex];
        setCurrentStage(stage.stage);
        setProgress(stage.progress);

        if (stage.stage === 'finalizing') {
          // Simulate success
          setTimeout(() => {
            setCurrentStage('success');
            setExtractedCount(15);
            setTimeout(() => {
              onSuccess({});
            }, 1500);
          }, 500);
          clearInterval(interval);
        } else {
          currentIndex++;
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen, onSuccess]);

  const currentStageData = STAGES.find((s) => s.stage === currentStage);

  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col items-center text-center">
        {/* Background Image (blurred) */}
        {imageUrl && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
            }}
          />
        )}

        {/* Processing State */}
        {currentStage !== 'success' && currentStage !== 'error' && (
          <>
            {/* Spinner */}
            <motion.div
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="w-20 h-20 mb-6 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.4))',
                border: '3px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              </div>
            </motion.div>

            {/* Progress Text */}
            <motion.p
              key={currentStage}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              className="text-xl font-semibold text-white mb-2"
            >
              {currentStageData?.label}
            </motion.p>

            {/* Progress Bar */}
            <div className="w-full mb-4">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 1), rgba(34, 211, 238, 1))',
                  }}
                />
              </div>
              <p className="text-sm text-white/60 mt-2">{progress}%</p>
            </div>

            {/* Time Estimate */}
            <p className="text-sm text-white/60">
              About {Math.max(1, Math.ceil((100 - progress) / 30))} seconds remaining
            </p>

            {/* Powered By */}
            <div className="mt-6 text-xs text-white/40">
              Powered by Microblink BlinkID
            </div>
          </>
        )}

        {/* Success State */}
        {currentStage === 'success' && (
          <motion.div
            initial={reduced ? false : { scale: 0 }}
            animate={reduced ? undefined : { scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="flex flex-col items-center"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '3px solid rgba(16, 185, 129, 0.5)',
              }}
            >
              <Check className="w-12 h-12 text-green-500" strokeWidth={4} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              ✓ Extraction Complete!
            </h3>
            <p className="text-white/70 mb-6">
              {extractedCount} of {totalFields} fields detected
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {currentStage === 'error' && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '3px solid rgba(239, 68, 68, 0.5)',
              }}
            >
              <X className="w-12 h-12 text-red-500" strokeWidth={4} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Couldn't Read Document
            </h3>
            {errorMessage && (
              <p className="text-white/70 mb-6">{errorMessage}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <GlassButton variant="primary" onClick={onRetry} fullWidth>
                Try Again
              </GlassButton>
              <GlassButton variant="secondary" onClick={onUseDifferentPhoto} fullWidth>
                Use Different Photo
              </GlassButton>
              <GlassButton variant="secondary" onClick={onEnterManually} fullWidth>
                Enter Manually
              </GlassButton>
            </div>
          </motion.div>
        )}
      </div>
    </GlassModal>
  );
}




