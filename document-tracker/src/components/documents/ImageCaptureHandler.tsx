import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageSelectionModal from './ImageSelectionModal';
import ImagePreview from './ImagePreview';

interface ImageCaptureHandlerProps {
  onClose?: () => void;
}

export default function ImageCaptureHandler({ onClose }: ImageCaptureHandlerProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset inputs when modal closes
    if (!isModalOpen && !imagePreview) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }, [isModalOpen, imagePreview]);

  const handleTakePhoto = () => {
    setIsModalOpen(false);
    // Use camera input
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 100);
  };

  const handleUploadImage = () => {
    setIsModalOpen(false);
    // Use file input
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    setImageFile(null);
    setIsModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleContinue = () => {
    if (imageFile && imagePreview) {
      navigate('/add-document', {
        state: {
          imageFile,
          imagePreview,
        },
      });
      onClose?.();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  return (
    <>
      <ImageSelectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onTakePhoto={handleTakePhoto}
        onUploadImage={handleUploadImage}
      />

      {imagePreview && (
        <ImagePreview
          imageUrl={imagePreview}
          onRetake={handleRetake}
          onContinue={handleContinue}
        />
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}

