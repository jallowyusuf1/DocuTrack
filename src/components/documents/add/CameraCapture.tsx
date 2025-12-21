import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCw, Check } from 'lucide-react';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageCaptureRef = useRef<ImageCapture | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  // Check if MediaStream Image Capture API is supported
  const isSupported = () => {
    return (
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      typeof ImageCapture !== 'undefined'
    );
  };

  // Start camera stream
  const startCamera = async () => {
    if (!isSupported()) {
      setError('Camera not supported on this device');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Create ImageCapture instance
        const track = stream.getVideoTracks()[0];
        if (track) {
          imageCaptureRef.current = new ImageCapture(track);
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(err.message || 'Failed to access camera. Please check permissions.');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    imageCaptureRef.current = null;
  };

  // Capture photo
  const capturePhoto = async () => {
    if (!imageCaptureRef.current || !videoRef.current) {
      setError('Camera not ready');
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);

      // Use ImageCapture API to grab frame
      const blob = await imageCaptureRef.current.takePhoto();
      
      // Convert blob to File
      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      onCapture(file);
      stopCamera();
      onClose();
    } catch (err: any) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Switch camera (front/back)
  const switchCamera = async () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    // Restart with new facing mode
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Camera View */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-lg font-semibold text-white">Take Photo</h2>
              <button
                onClick={switchCamera}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors"
              >
                <RotateCw className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Video Preview */}
            <div className="flex-1 relative bg-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror effect
              />

              {/* Error Message */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                  <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-2 rounded-xl bg-purple-600 text-white font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Overlay Grid */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-lg" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 bg-black/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-6">
                {/* Capture Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  disabled={isCapturing || !!error}
                  className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isCapturing
                      ? 'rgba(139, 92, 246, 0.5)'
                      : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  }}
                >
                  {isCapturing ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white" />
                  )}
                </motion.button>
              </div>

              <p className="text-center text-white/60 text-sm mt-4">
                {isCapturing ? 'Capturing...' : 'Tap to capture'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
