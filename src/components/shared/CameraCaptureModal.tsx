import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, X, RotateCw, Check, Loader2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { openCamera, selectImageFromGallery, compressImage } from '../../utils/imageHandler';
import { compressImage as compressImageUtil } from '../../utils/imageCompression';
import { processAndEnhanceImage } from '../../utils/imageEnhancement';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (file: File) => void;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onImageCapture,
}: CameraCaptureModalProps) {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setCapturedImage(null);
      setCapturedFile(null);
      setError(null);
      setIsProcessing(false);
      setProcessingStep('');
    }
  }, [isOpen]);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      // Adjust UI for landscape/portrait if needed
      const orientation = screen.orientation?.type || 'portrait-primary';
      document.body.classList.toggle('landscape', orientation.includes('landscape'));
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  const handleTakePhoto = async () => {
    triggerHaptic('medium');
    setError(null);
    setIsProcessing(true);
    setProcessingStep('Opening camera...');

    try {
      const file = await openCamera();
      if (file) {
        await processImage(file);
      }
    } catch (err: any) {
      if (err.message?.includes('permission')) {
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.message?.includes('not available')) {
        setError('Camera not available. Please use "Choose from Gallery" instead.');
      } else {
        setError(err.message || 'Failed to open camera');
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleChooseFromGallery = async () => {
    triggerHaptic('medium');
    setError(null);
    setIsProcessing(true);
    setProcessingStep('Opening gallery...');

    try {
      const file = await selectImageFromGallery();
      if (file) {
        await processImage(file);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select image');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const processImage = async (file: File) => {
    try {
      setProcessingStep('Processing image...');
      triggerHaptic('light');

      // Check file size
      if (file.size > 50 * 1024 * 1024) {
        setError('Image size must be less than 50MB');
        setIsProcessing(false);
        return;
      }

      setProcessingStep('Aligning and enhancing image...');

      // Process and enhance image with automatic alignment and 8K quality
      let processedFile: File;
      try {
        processedFile = await processAndEnhanceImage(file, {
          maxWidth: 7680, // 8K width
          maxHeight: 4320, // 8K height
          quality: 0.95, // High quality
          autoAlign: true,
          enhanceQuality: true,
        });
        
        // Verify the processed file is valid
        if (!processedFile || processedFile.size === 0) {
          throw new Error('Processed file is invalid');
        }
      } catch (enhanceError) {
        console.warn('Enhancement failed, using original:', enhanceError);
        // Fallback to original if enhancement fails
        processedFile = file;
      }

      // Create preview from processed image
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(processedFile);

      setCapturedFile(processedFile);
      setStep('preview');
      triggerHaptic('medium');
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleRetake = () => {
    triggerHaptic('light');
    setStep('select');
    setCapturedImage(null);
    setCapturedFile(null);
    setError(null);
  };

  const handleContinue = () => {
    if (capturedFile) {
      triggerHaptic('medium');
      onImageCapture(capturedFile);
      onClose();
    }
  };

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  // Check camera availability
  const isCameraAvailable = () => {
    if (typeof navigator === 'undefined') return false;
    if (!navigator.mediaDevices) return false;
    if (!navigator.mediaDevices.getUserMedia) return false;
    // Check if HTTPS (required for camera on most browsers)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      return false;
    }
    return true;
  };

  const cameraAvailable = isCameraAvailable();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{
              background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden md:max-w-[600px] md:left-1/2 md:-translate-x-1/2 md:rounded-t-[24px]"
            style={{
              background: 'rgba(35, 29, 51, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderTop: '1px solid rgba(37, 99, 235, 0.3)',
              maxHeight: '90vh',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-12 h-1 rounded-full"
                style={{ background: 'rgba(255, 255, 255, 0.3)' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {step === 'select' ? 'Add Document Photo' : 'Preview'}
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {step === 'select' ? (
                <div className="space-y-4 md:flex md:flex-col md:items-center">
                  {/* Camera Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTakePhoto}
                    disabled={isProcessing || !cameraAvailable}
                    className="w-full h-20 md:h-[100px] rounded-2xl flex items-center gap-4 px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: cameraAvailable
                        ? 'rgba(42, 38, 64, 0.6)'
                        : 'rgba(100, 100, 100, 0.3)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(37, 99, 235, 0.4)',
                    }}
                    data-tablet-button="true"
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #2563EB 0%, #EC4899 100%)',
                      }}
                    >
                      <Camera className="w-7 h-7 md:w-16 md:h-16 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-lg md:text-[20px] font-semibold text-white">Take Photo</div>
                      <div className="text-sm md:text-base text-white/60">Use your camera</div>
                    </div>
                    {isProcessing && processingStep.includes('camera') && (
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-white animate-spin" />
                    )}
                  </motion.button>

                  {/* Gallery Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChooseFromGallery}
                    disabled={isProcessing}
                    className="w-full h-20 md:h-[100px] rounded-2xl flex items-center gap-4 px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(37, 99, 235, 0.4)',
                    }}
                    data-tablet-button="true"
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      }}
                    >
                      <ImageIcon className="w-7 h-7 md:w-16 md:h-16 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-lg md:text-[20px] font-semibold text-white">Choose from Gallery</div>
                      <div className="text-sm md:text-base text-white/60">Select existing photo</div>
                    </div>
                    {isProcessing && processingStep.includes('gallery') && (
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-white animate-spin" />
                    )}
                  </motion.button>
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-button="true"] {
                        width: 280px !important;
                        height: 100px !important;
                        margin: 0 auto;
                      }
                    }
                  `}</style>

                  {!cameraAvailable && (
                    <div
                      className="p-4 rounded-xl flex items-center gap-3"
                      style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <p className="text-sm text-red-400">
                        Camera requires HTTPS connection (works on localhost)
                      </p>
                    </div>
                  )}

                  {error && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {isProcessing && processingStep && (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-white/60">{processingStep}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Preview Image */}
                  <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: 'rgba(37, 99, 235, 0.5)' }}>
                    <img
                      src={capturedImage || ''}
                      alt="Document preview"
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Preview Actions */}
                  <div className="flex gap-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetake}
                      className="flex-1 h-14 md:h-[52px] rounded-xl flex items-center justify-center gap-2 font-semibold"
                      style={{
                        background: 'rgba(42, 38, 64, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                      }}
                    >
                      <RotateCw className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                      Retake
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      disabled={!capturedFile}
                      className="flex-1 h-14 md:h-[52px] rounded-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: capturedFile
                          ? 'linear-gradient(135deg, #2563EB 0%, #EC4899 100%)'
                          : 'rgba(100, 100, 100, 0.5)',
                        color: '#FFFFFF',
                        boxShadow: capturedFile
                          ? '0 10px 30px rgba(37, 99, 235, 0.4)'
                          : 'none',
                      }}
                    >
                      <Check className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                      Continue
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
