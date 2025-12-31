import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Step1UploadImage from './Step1UploadImage';
import Step2SelectType from './Step2SelectType';
import Step3DocumentDetails from './Step3DocumentDetails';
import Step4ReviewSave from './Step4ReviewSave';
import SuccessAnimation from './SuccessAnimation';
import { useOCR } from '../../../hooks/useOCR';
import type { DocumentFormData, DocumentType } from '../../../types';

type FlowStep = 1 | 2 | 3 | 4 | 'success';

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
  const [currentStep, setCurrentStep] = useState<FlowStep>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [selectedDocumentTypeLabel, setSelectedDocumentTypeLabel] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<Partial<DocumentFormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { scanImage, isProcessing: isOCRProcessing, result: ocrResult } = useOCR();

  // Step 1: Handle image selection
  const handleImageSelected = async (file: File) => {
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setCurrentStep(2); // Move to Step 2: Select Type
    };
    reader.readAsDataURL(file);

    // Auto-trigger OCR scanning
    try {
      await scanImage(file);
    } catch (error) {
      console.warn('OCR scanning failed:', error);
      // Don't block the flow if OCR fails
    }
  };

  // Step 2: Handle document type selection
  const handleTypeSelected = (type: DocumentType, label: string, category: string) => {
    setSelectedDocumentType(type);
    setSelectedDocumentTypeLabel(label);
    setSelectedCategory(category);
    setCurrentStep(3); // Move to Step 3: Document Details
  };

  // Step 3: Handle form data
  const handleFormDataContinue = (data: Partial<DocumentFormData>) => {
    setFormData({
      ...data,
      document_type: selectedDocumentType!,
      // Preserve fieldValues if present
      ...(data as any).fieldValues && { fieldValues: (data as any).fieldValues },
    });
    setCurrentStep(4); // Move to Step 4: Review & Save
  };

  // Step 4: Handle final save
  const handleSave = async () => {
    if (!selectedFile || !selectedDocumentType) {
      console.error('Missing required data: file or document type');
      return;
    }

    // Validate required fields
    if (!formData.expiration_date) {
      console.error('Expiration date is required');
      return;
    }

    setIsSaving(true);
    try {
      const finalData: DocumentFormData & { fieldValues?: Record<string, any> } = {
        document_type: selectedDocumentType,
        document_name: formData.document_name || selectedDocumentTypeLabel,
        document_number: formData.document_number,
        issue_date: formData.issue_date,
        expiration_date: formData.expiration_date,
        category: formData.category || selectedCategory || selectedDocumentTypeLabel,
        notes: formData.notes,
        image: selectedFile,
        // Include fieldValues if present
        ...(formData as any).fieldValues && { fieldValues: (formData as any).fieldValues },
      };

      await onSubmit(finalData);
      setCurrentStep('success');
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error saving document:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedFile(null);
      setPreviewUrl(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (selectedFile || selectedDocumentType) {
      // Show confirmation if user has made progress
      if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <Step1UploadImage
            key="step1"
            onImageSelected={handleImageSelected}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 2 && selectedFile && previewUrl && (
          <Step2SelectType
            key="step2"
            onTypeSelected={handleTypeSelected}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && selectedFile && selectedDocumentType && (
          <Step3DocumentDetails
            key="step3"
            documentType={selectedDocumentType}
            documentTypeLabel={selectedDocumentTypeLabel}
            imageFile={selectedFile}
            ocrResult={ocrResult}
            isOCRProcessing={isOCRProcessing}
            onRetryOCR={() => selectedFile && scanImage(selectedFile)}
            onContinue={handleFormDataContinue}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && selectedFile && previewUrl && selectedDocumentType && (
          <Step4ReviewSave
            key="step4"
            imageFile={selectedFile}
            imagePreview={previewUrl}
            formData={formData}
            documentTypeLabel={selectedDocumentTypeLabel}
            onSave={handleSave}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}

        {currentStep === 'success' && (
          <SuccessAnimation
            key="success"
            onComplete={onCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
}
