import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { selectImageFromGallery } from '../../../utils/imageHandler';
import CameraCapture from './CameraCapture';

interface SourceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (file: File) => void;
  isMobile: boolean;
}

export default function SourceSelectionModal({
  isOpen,
  onClose,
  onImageSelected,
  isMobile,
}: SourceSelectionModalProps) {
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraClick = () => {
    if (!isMobile) {
      // On desktop, just open file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.pdf';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onImageSelected(file);
          onClose();
        }
      };
      input.click();
      return;
    }

    // On mobile/tablet, open camera capture component
    setShowCamera(true);
  };

  const handleCameraCapture = (file: File) => {
    onImageSelected(file);
    setShowCamera(false);
    onClose();
  };

  const handleGalleryClick = async () => {
    try {
      const file = await selectImageFromGallery();
      if (file) {
        onImageSelected(file);
        onClose();
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-8 z-50 mx-auto max-w-md"
              style={{
                background: 'rgba(42, 38, 64, 0.95)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Select Source</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Options */}
              <div className="p-6 space-y-4">
                {isMobile && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCameraClick}
                    className="w-full p-6 rounded-2xl flex items-center gap-4 text-left transition-all"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      }}
                    >
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">Camera</h3>
                      <p className="text-sm text-white/60">Take a new photo</p>
                    </div>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGalleryClick}
                  className="w-full p-6 rounded-2xl flex items-center gap-4 text-left transition-all"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    }}
                  >
                    <ImageIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">Gallery</h3>
                    <p className="text-sm text-white/60">
                      {isMobile ? 'Choose from photos' : 'Choose from files'}
                    </p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Camera Capture Component */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
}
