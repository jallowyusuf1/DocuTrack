import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SourceSelectionModal from './SourceSelectionModal';
import PreviewScreen from './PreviewScreen';
import FormScreen from './FormScreen';
import SuccessAnimation from './SuccessAnimation';
import type { DocumentFormData } from '../../../types';

type FlowStep = 'source' | 'preview' | 'form' | 'success';

interface AddDocumentFlowProps {
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
  isDesktop?: boolean;
  isMobile?: boolean;
}

export default function AddDocumentFlow({
  onSubmit,
  onCancel,
  isDesktop = false,
  isMobile = false,
}: AddDocumentFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('source');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(true);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Detect if device is mobile/tablet
  const deviceIsMobile = isMobile || (typeof window !== 'undefined' && window.innerWidth < 768);

  // Handle image selection
  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setProcessedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setShowSourceModal(false);
      setCurrentStep('preview');
    };
    reader.readAsDataURL(file);
  };

  // Handle preview continue
  const handlePreviewContinue = (file: File) => {
    setProcessedFile(file);
    setCurrentStep('form');
  };

  // Handle form submit
  const handleFormSubmit = async (data: DocumentFormData) => {
    try {
      await onSubmit(data);
      setCurrentStep('success');
    } catch (error) {
      // Error handling is done in parent component
      throw error;
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('source');
      setShowSourceModal(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setProcessedFile(null);
    } else if (currentStep === 'form') {
      setCurrentStep('preview');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (selectedFile || processedFile) {
      setShowDiscardConfirm(true);
    } else {
      onCancel();
    }
  };

  // Confirm discard
  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedFile(null);
    onCancel();
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {currentStep === 'source' && (
          <motion.div
            key="source"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#1a1625] flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSourceModal(true)}
              className="px-8 py-4 rounded-2xl font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              }}
            >
              Select Image
            </motion.button>
          </motion.div>
        )}

        {currentStep === 'preview' && selectedFile && previewUrl && (
          <PreviewScreen
            key="preview"
            imageFile={selectedFile}
            imagePreview={previewUrl}
            onContinue={handlePreviewContinue}
            onBack={handleBack}
          />
        )}

        {currentStep === 'form' && processedFile && (
          <FormScreen
            key="form"
            imageFile={processedFile}
            onSubmit={handleFormSubmit}
            onBack={handleBack}
            isDesktop={isDesktop}
          />
        )}

        {currentStep === 'success' && (
          <SuccessAnimation
            key="success"
            onComplete={onCancel}
          />
        )}
      </AnimatePresence>

      {/* Source Selection Modal */}
      <SourceSelectionModal
        isOpen={showSourceModal}
        onClose={() => {
          setShowSourceModal(false);
          if (!selectedFile) {
            handleCancel();
          }
        }}
        onImageSelected={handleImageSelected}
        isMobile={deviceIsMobile}
      />

      {/* Discard Confirmation */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgba(42,38,64,0.95)] rounded-2xl p-6 max-w-md mx-4 border border-white/10"
            style={{
              backdropFilter: 'blur(40px)',
            }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Discard Changes?</h3>
            <p className="text-white/60 mb-6">
              Your progress will be lost. Are you sure you want to continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDiscard}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
