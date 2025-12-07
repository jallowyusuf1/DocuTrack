import { useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { openCamera, selectImageFromGallery, getImagePreview, revokeImagePreview, validateImage, compressImage } from '../../utils/imageHandler';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  currentImage?: string | null;
  onRemove?: () => void;
}

export default function ImageUploader({
  onImageSelected,
  currentImage,
  onRemove,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up preview URL on unmount
      if (previewUrl && previewUrl.startsWith('blob:')) {
        revokeImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      // Validate
      const validation = await validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setIsProcessing(false);
        return;
      }

      // Compress if needed
      const processedFile = await compressImage(file, 1920, 1920, 0.85);
      const finalFile = processedFile instanceof File ? processedFile : new File([processedFile], file.name, { type: 'image/jpeg' });

      setSelectedFile(finalFile);
      const preview = getImagePreview(finalFile);
      setPreviewUrl(preview);
      onImageSelected(finalFile);
      setShowOptions(false);
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const file = await openCamera();
      if (file) {
        await handleFileSelect(file);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to open camera');
    }
  };

  const handleUploadImage = async () => {
    try {
      const file = await selectImageFromGallery();
      if (file) {
        await handleFileSelect(file);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select image');
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      revokeImagePreview(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onRemove?.();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Document Image <span className="text-red-500">*</span>
      </label>

      {previewUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={previewUrl}
              alt="Document preview"
              className="w-full h-full object-contain"
            />
            {selectedFile && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {formatFileSize(selectedFile.size)}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowOptions(true)}
            >
              Change Image
            </Button>
            {onRemove && (
              <Button
                variant="ghost"
                size="small"
                onClick={handleRemove}
                icon={<X className="w-4 h-4" />}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="large" />
              <p className="text-sm text-gray-600">Processing image...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <Button
                variant="primary"
                onClick={() => setShowOptions(true)}
                icon={<Upload className="w-5 h-5" />}
              >
                Select Image
              </Button>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Image Selection Modal */}
      <Modal
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        type="bottom"
        title="Select Image"
      >
        <div className="p-6 space-y-4">
          <button
            onClick={handleTakePhoto}
            className="
              w-full h-14 rounded-xl
              bg-blue-50 border-2 border-blue-500
              flex items-center gap-4 px-4
              text-blue-700 font-medium
              transition-all duration-200
              active:scale-98
            "
          >
            <Camera className="w-6 h-6" />
            <span className="flex-1 text-left">Take Photo</span>
          </button>

          <button
            onClick={handleUploadImage}
            className="
              w-full h-14 rounded-xl
              bg-gray-50 border-2 border-gray-300
              flex items-center gap-4 px-4
              text-gray-700 font-medium
              transition-all duration-200
              active:scale-98
            "
          >
            <Upload className="w-6 h-6" />
            <span className="flex-1 text-left">Choose from Gallery</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}

