import { Camera, Upload } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onUploadImage: () => void;
}

export default function ImageSelectionModal({
  isOpen,
  onClose,
  onTakePhoto,
  onUploadImage,
}: ImageSelectionModalProps) {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-hidden transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add Document</h2>

          <div className="space-y-4">
            {/* Take Photo Button */}
            <button
              onClick={onTakePhoto}
              className="
                w-full h-14 rounded-xl
                bg-blue-50 border-2 border-blue-500
                flex items-center gap-4 px-4
                text-blue-700 font-medium
                transition-all duration-200
                active:scale-98
                touch-manipulation
              "
            >
              <Camera className="w-6 h-6" />
              <span className="flex-1 text-left">Take Photo</span>
            </button>

            {/* Upload Image Button */}
            <button
              onClick={onUploadImage}
              className="
                w-full h-14 rounded-xl
                bg-gray-50 border-2 border-gray-300
                flex items-center gap-4 px-4
                text-gray-700 font-medium
                transition-all duration-200
                active:scale-98
                touch-manipulation
              "
            >
              <Upload className="w-6 h-6" />
              <span className="flex-1 text-left">Choose from Gallery</span>
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="
              w-full mt-6 py-3
              text-gray-600 font-medium
              transition-colors duration-200
              active:bg-gray-100 rounded-lg
              touch-manipulation
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

