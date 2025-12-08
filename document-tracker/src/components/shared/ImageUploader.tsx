import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, RotateCw } from 'lucide-react';
import { 
  openCamera, 
  selectImageFromGallery, 
  getImagePreview, 
  revokeImagePreview, 
  validateImage, 
  compressImage,
  rotateImage
} from '../../utils/imageHandler';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  currentImage?: string | null;
  onRemove?: () => void;
  maxSize?: number;
}

export default function ImageUploader({
  onImageSelected,
  currentImage,
  onRemove,
  maxSize = 10 * 1024 * 1024, // 10MB default
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<{ size: number; dimensions?: { width: number; height: number } } | null>(null);
  const [rotation, setRotation] = useState(0);
  
  // Touch gesture state for preview
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null);

  useEffect(() => {
    return () => {
      // Clean up preview URL on unmount
      if (previewUrl && previewUrl.startsWith('blob:')) {
        revokeImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const getImageDimensions = async (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setProcessingStep('Validating image...');

    try {
      // Validate
      const validation = await validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setIsProcessing(false);
        return;
      }

      // Check custom max size
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
        setIsProcessing(false);
        return;
      }

      setProcessingStep('Processing image...');
      
      // Get dimensions
      try {
        const dimensions = await getImageDimensions(file);
        setFileInfo({ size: file.size, dimensions });
      } catch {
        setFileInfo({ size: file.size });
      }

      setProcessingStep('Compressing...');
      
      // Compress if needed
      const processedBlob = await compressImage(file, 1920, 1920, 0.85);
      const finalFile = processedBlob instanceof File 
        ? processedBlob 
        : new File([processedBlob], file.name, { type: 'image/jpeg' });

      setSelectedFile(finalFile);
      const preview = getImagePreview(finalFile);
      setPreviewUrl(preview);
      onImageSelected(finalFile);
      setShowOptions(false);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleTakePhoto = async () => {
    try {
      setProcessingStep('Opening camera...');
      const file = await openCamera();
      if (file) {
        await handleFileSelect(file);
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
      setProcessingStep('');
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

  const handleRotate = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingStep('Rotating image...');
    
    try {
      const newRotation = (rotation + 90) % 360;
      const rotatedFile = await rotateImage(selectedFile, 90);
      
      setSelectedFile(rotatedFile);
      setRotation(newRotation);
      
      // Update preview
      if (previewUrl && previewUrl.startsWith('blob:')) {
        revokeImagePreview(previewUrl);
      }
      const newPreview = getImagePreview(rotatedFile);
      setPreviewUrl(newPreview);
      onImageSelected(rotatedFile);
    } catch (err: any) {
      setError(err.message || 'Failed to rotate image');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      revokeImagePreview(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setShowPreview(false);
    setRotation(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFileInfo(null);
    onRemove?.();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Touch gesture handlers for preview
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      touchStartRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = distance / touchStartRef.current.distance;
      setZoom(Math.max(1, Math.min(5, zoom * scale)));
      touchStartRef.current.distance = distance;
    } else if (e.touches.length === 1 && zoom > 1) {
      const touch = e.touches[0];
      setPan({
        x: pan.x + (touch.clientX - (touchStartRef.current?.x || touch.clientX)) * 0.1,
        y: pan.y + (touch.clientY - (touchStartRef.current?.y || touch.clientY)) * 0.1,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleDoubleTap = () => {
    setZoom(zoom === 1 ? 2 : 1);
    if (zoom === 2) {
      setPan({ x: 0, y: 0 });
    }
  };

  return (
    <div className="space-y-3">
      {previewUrl && showPreview ? (
        <div className="relative">
          <div 
            className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleTap}
          >
            <img
              src={previewUrl}
              alt="Document preview"
              className="w-full h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center',
              }}
            />
            {fileInfo && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {formatFileSize(fileInfo.size)}
                {fileInfo.dimensions && (
                  <span className="ml-2">
                    {fileInfo.dimensions.width}×{fileInfo.dimensions.height}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                setShowPreview(false);
                setShowOptions(true);
              }}
            >
              Change Image
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={handleRotate}
              icon={<RotateCw className="w-4 h-4" />}
              disabled={isProcessing}
            >
              Rotate
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
              <p className="text-sm text-gray-600">{processingStep || 'Processing image...'}</p>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
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
            disabled={isProcessing}
            className="
              w-full h-14 rounded-xl
              bg-blue-50 border-2 border-blue-500
              flex items-center gap-4 px-4
              text-blue-700 font-medium
              transition-all duration-200
              active:scale-98
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Camera className="w-6 h-6" />
            <span className="flex-1 text-left">Take Photo</span>
          </button>

          <button
            onClick={handleUploadImage}
            disabled={isProcessing}
            className="
              w-full h-14 rounded-xl
              bg-gray-50 border-2 border-gray-300
              flex items-center gap-4 px-4
              text-gray-700 font-medium
              transition-all duration-200
              active:scale-98
              disabled:opacity-50 disabled:cursor-not-allowed
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
