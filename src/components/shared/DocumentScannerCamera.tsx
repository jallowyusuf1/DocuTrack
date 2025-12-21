import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCw, Check, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { compressImage } from '../../utils/imageHandler';

interface DocumentScannerCameraProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (file: File) => void;
  captureMode?: 'environment' | 'user'; // 'environment' = rear camera, 'user' = front camera
}

export default function DocumentScannerCamera({
  isOpen,
  onClose,
  onImageCapture,
  captureMode = 'environment',
}: DocumentScannerCameraProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCapturedImage(null);
      setCapturedFile(null);
      setError(null);
      setIsProcessing(false);
      setIsCapturing(false);
    }
  }, [isOpen]);

  const handleCameraClick = () => {
    triggerHaptic('medium');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    setError(null);
    setIsProcessing(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);

      // Compress image
      const compressed = await compressImage(file, 1920, 1920, 0.85);
      const finalFile = compressed instanceof File 
        ? compressed 
        : new File([compressed], file.name, { type: 'image/jpeg' });
      
      setCapturedFile(finalFile);
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
      setIsCapturing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    triggerHaptic('light');
    setCapturedImage(null);
    setCapturedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (capturedFile) {
      triggerHaptic('success');
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
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          />

          {/* Camera Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{
              background: 'rgba(26, 22, 37, 0.98)',
              backdropFilter: 'blur(30px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Document Scanner</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
              {!capturedImage ? (
                <>
                  {/* Instructions */}
                  <div className="text-center mb-8 px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <Camera className="w-16 h-16 mx-auto mb-4" style={{ color: '#8B5CF6' }} />
                      <h3 className="text-xl font-bold text-white mb-2">
                        Position Document
                      </h3>
                      <p className="text-sm" style={{ color: '#C7C3D9' }}>
                        Align the document within the frame. Ensure all four corners are visible and the text is clear.
                      </p>
                    </motion.div>
                  </div>

                  {/* Document Frame Overlay */}
                  <div className="relative w-full max-w-md aspect-[3/4] mb-8">
                    {/* Outer darkened area - using multiple divs for proper masking */}
                    <div className="absolute inset-0">
                      {/* Top overlay */}
                      <div 
                        className="absolute top-0 left-0 right-0"
                        style={{ 
                          height: '15%',
                          background: 'rgba(0, 0, 0, 0.75)',
                        }}
                      />
                      {/* Bottom overlay */}
                      <div 
                        className="absolute bottom-0 left-0 right-0"
                        style={{ 
                          height: '15%',
                          background: 'rgba(0, 0, 0, 0.75)',
                        }}
                      />
                      {/* Left overlay */}
                      <div 
                        className="absolute top-[15%] bottom-[15%] left-0"
                        style={{ 
                          width: '8%',
                          background: 'rgba(0, 0, 0, 0.75)',
                        }}
                      />
                      {/* Right overlay */}
                      <div 
                        className="absolute top-[15%] bottom-[15%] right-0"
                        style={{ 
                          width: '8%',
                          background: 'rgba(0, 0, 0, 0.75)',
                        }}
                      />
                    </div>

                    {/* Document frame with corner guides */}
                    <div 
                      className="absolute inset-[15%_8%]"
                      style={{
                        border: '3px solid #8B5CF6',
                        borderRadius: '16px',
                        boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.75)',
                        position: 'relative',
                      }}
                    >
                      {/* Corner indicators - Large and visible */}
                      {/* Top Left */}
                      <div 
                        className="absolute -top-2 -left-2 w-12 h-12"
                        style={{
                          borderTop: '5px solid #8B5CF6',
                          borderLeft: '5px solid #8B5CF6',
                          borderTopLeftRadius: '16px',
                          boxShadow: '0 0 15px rgba(139, 92, 246, 0.8), inset 0 0 10px rgba(139, 92, 246, 0.3)',
                          background: 'rgba(139, 92, 246, 0.1)',
                        }}
                      />
                      {/* Top Right */}
                      <div 
                        className="absolute -top-2 -right-2 w-12 h-12"
                        style={{
                          borderTop: '5px solid #8B5CF6',
                          borderRight: '5px solid #8B5CF6',
                          borderTopRightRadius: '16px',
                          boxShadow: '0 0 15px rgba(139, 92, 246, 0.8), inset 0 0 10px rgba(139, 92, 246, 0.3)',
                          background: 'rgba(139, 92, 246, 0.1)',
                        }}
                      />
                      {/* Bottom Left */}
                      <div 
                        className="absolute -bottom-2 -left-2 w-12 h-12"
                        style={{
                          borderBottom: '5px solid #8B5CF6',
                          borderLeft: '5px solid #8B5CF6',
                          borderBottomLeftRadius: '16px',
                          boxShadow: '0 0 15px rgba(139, 92, 246, 0.8), inset 0 0 10px rgba(139, 92, 246, 0.3)',
                          background: 'rgba(139, 92, 246, 0.1)',
                        }}
                      />
                      {/* Bottom Right */}
                      <div 
                        className="absolute -bottom-2 -right-2 w-12 h-12"
                        style={{
                          borderBottom: '5px solid #8B5CF6',
                          borderRight: '5px solid #8B5CF6',
                          borderBottomRightRadius: '16px',
                          boxShadow: '0 0 15px rgba(139, 92, 246, 0.8), inset 0 0 10px rgba(139, 92, 246, 0.3)',
                          background: 'rgba(139, 92, 246, 0.1)',
                        }}
                      />

                      {/* Center guide text */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center px-4">
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-sm font-semibold mb-1" 
                            style={{ color: '#8B5CF6' }}
                          >
                            Align document edges
                          </motion.p>
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xs" 
                            style={{ color: '#A78BFA' }}
                          >
                            Ensure all corners are visible
                          </motion.p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Camera Input (Hidden) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture={captureMode}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Capture Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCameraClick}
                    disabled={isProcessing || !cameraAvailable}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: cameraAvailable 
                        ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                        : 'rgba(100, 100, 100, 0.5)',
                      boxShadow: cameraAvailable 
                        ? '0 8px 32px rgba(139, 92, 246, 0.5), 0 0 0 4px rgba(139, 92, 246, 0.2)'
                        : 'none',
                      cursor: cameraAvailable ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <RotateCw className="w-10 h-10 text-white" />
                      </motion.div>
                    ) : (
                      <Camera className="w-10 h-10 text-white" />
                    )}
                  </motion.button>

                  {!cameraAvailable && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                      <p className="text-xs" style={{ color: '#EF4444' }}>
                        Camera requires HTTPS connection
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="px-4 py-2 rounded-lg mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Preview Screen */}
                  <div className="w-full max-w-md mb-6">
                    <div className="relative rounded-xl overflow-hidden border-2" style={{ borderColor: '#8B5CF6' }}>
                      <img
                        ref={previewRef}
                        src={capturedImage}
                        alt="Captured document"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  {/* Preview Actions */}
                  <div className="flex gap-4 w-full max-w-md px-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetake}
                      className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-medium"
                      style={{
                        background: 'rgba(42, 38, 64, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                      }}
                    >
                      <RotateCw className="w-5 h-5" />
                      Retake
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      disabled={!capturedFile}
                      className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-medium"
                      style={{
                        background: capturedFile
                          ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                          : 'rgba(100, 100, 100, 0.5)',
                        color: '#FFFFFF',
                        cursor: capturedFile ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Check className="w-5 h-5" />
                      Continue
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

