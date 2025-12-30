import { Upload, FileText } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadImage: () => void;
}

export default function ImageSelectionModal({
  isOpen,
  onClose,
  onUploadImage,
}: ImageSelectionModalProps) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !modalRef.current) return;
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    if (deltaY > 0) {
      modalRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!modalRef.current) return;
    const deltaY = currentY.current - startY.current;
    if (deltaY > 100) {
      onClose();
    } else {
      modalRef.current.style.transform = 'translateY(0)';
    }
    isDragging.current = false;
  };

  const handleAddWithoutImage = () => {
    triggerHaptic('light');
    onClose();
    navigate('/add-document');
  };

  const handleUploadImage = () => {
    triggerHaptic('light');
    onUploadImage();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            ref={modalRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[80vh] overflow-hidden transition-transform duration-300"
            style={{
              background: 'rgba(42, 38, 64, 0.85)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              maxWidth: '100%',
            }}
            data-tablet-image-modal="true"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <style>{`
              @media (min-width: 768px) {
                [data-tablet-image-modal="true"] {
                  max-width: 600px !important;
                  left: 50% !important;
                  transform: translateX(-50%) !important;
                  right: auto !important;
                }
              }
            `}</style>
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div 
                className="h-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  width: '36px',
                }}
                data-tablet-handle="true"
              />
              <style>{`
                @media (min-width: 768px) {
                  [data-tablet-handle="true"] {
                    width: 48px !important;
                  }
                }
              `}</style>
            </div>

            {/* Content */}
            <div className="px-5 md:px-6 pb-6" style={{ paddingLeft: '20px', paddingRight: '20px' }} data-tablet-padding="true">
              <style>{`
                @media (min-width: 768px) {
                  [data-tablet-padding="true"] {
                    padding-left: 24px !important;
                    padding-right: 24px !important;
                  }
                }
              `}</style>
              <h2 className="text-[17px] md:text-[20px] font-bold text-white mb-6">Add Document</h2>

              <div className="space-y-4">
                {/* Upload Image Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadImage}
                  className="
                    w-full rounded-xl
                    flex items-center gap-4 px-4
                    font-medium
                    transition-all duration-200
                    touch-manipulation
                  "
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    color: '#93C5FD',
                    height: '80px',
                  }}
                  data-tablet-image-btn="true"
                >
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-image-btn="true"] {
                        height: 100px !important;
                        width: 280px !important;
                        margin: 0 auto;
                      }
                    }
                  `}</style>
                  <Upload className="w-6 h-6 md:w-16 md:h-16" data-tablet-icon="true" />
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-icon="true"] {
                        width: 64px !important;
                        height: 64px !important;
                      }
                    }
                  `}</style>
                  <span className="flex-1 text-left text-[17px] md:text-[20px]">Choose from Gallery</span>
                </motion.button>

                {/* Add Without Image Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddWithoutImage}
                  className="
                    w-full rounded-xl
                    flex items-center gap-4 px-4
                    font-medium
                    transition-all duration-200
                    touch-manipulation
                  "
                  style={{
                    background: 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    color: '#60A5FA',
                    height: '80px',
                  }}
                  data-tablet-image-btn2="true"
                >
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-image-btn2="true"] {
                        height: 100px !important;
                        width: 280px !important;
                        margin: 0 auto;
                      }
                    }
                  `}</style>
                  <FileText className="w-6 h-6 md:w-16 md:h-16" data-tablet-icon2="true" />
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-icon2="true"] {
                        width: 64px !important;
                        height: 64px !important;
                      }
                    }
                  `}</style>
                  <span className="flex-1 text-left text-[17px] md:text-[20px]">Add Document Details</span>
                </motion.button>
              </div>

              {/* Cancel Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="
                  w-full mt-6 py-3
                  font-medium
                  transition-colors duration-200
                  rounded-xl
                  touch-manipulation
                "
                style={{
                  color: '#60A5FA',
                  background: 'rgba(35, 29, 51, 0.3)',
                }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
