import { X } from 'lucide-react';

interface ImageFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export default function ImageFullscreenModal({ isOpen, onClose, imageUrl, alt }: ImageFullscreenModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black bg-opacity-95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-[201] p-3 md:p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
        aria-label="Close"
      >
        <X className="w-6 h-6 md:w-8 md:h-8 text-white" />
      </button>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
          onError={(e) => {
            console.error('Failed to load fullscreen image:', imageUrl);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}

