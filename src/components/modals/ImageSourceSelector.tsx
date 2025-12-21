import React, { useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { DesktopModal } from './DesktopModal';

interface ImageSourceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
}

export const ImageSourceSelector: React.FC<ImageSourceSelectorProps> = ({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectGallery,
}) => {
  const [hoveredOption, setHoveredOption] = useState<'camera' | 'gallery' | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (hoveredOption === 'camera') onSelectCamera();
      else if (hoveredOption === 'gallery') onSelectGallery();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown as any);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [isOpen, hoveredOption]);

  return (
    <DesktopModal isOpen={isOpen} onClose={onClose}>
      <div
        className="bg-white dark:bg-gray-800"
        style={{
          width: '600px',
          height: '400px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h2 className="text-2xl font-semibold mb-12 text-gray-900 dark:text-white">
          Choose Image Source
        </h2>

        <div className="flex gap-8">
          {/* Camera Option */}
          <button
            onMouseEnter={() => setHoveredOption('camera')}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={onSelectCamera}
            className="relative group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-3xl"
            style={{
              width: '260px',
              height: '280px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '24px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoveredOption === 'camera' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: hoveredOption === 'camera'
                ? '0 20px 40px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)'
                : '0 8px 16px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="mb-6 text-purple-500 transition-transform duration-300"
                style={{
                  transform: hoveredOption === 'camera' ? 'translateY(-4px)' : 'translateY(0)',
                }}
              >
                <Camera size={96} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Camera
              </h3>
              <p className="text-[17px] text-gray-600 dark:text-gray-400">
                Take a new photo
              </p>
            </div>
          </button>

          {/* Gallery Option */}
          <button
            onMouseEnter={() => setHoveredOption('gallery')}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={onSelectGallery}
            className="relative group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-3xl"
            style={{
              width: '260px',
              height: '280px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '24px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoveredOption === 'gallery' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: hoveredOption === 'gallery'
                ? '0 20px 40px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)'
                : '0 8px 16px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="mb-6 text-blue-500 transition-transform duration-300"
                style={{
                  transform: hoveredOption === 'gallery' ? 'translateY(-4px)' : 'translateY(0)',
                }}
              >
                <ImageIcon size={96} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Gallery
              </h3>
              <p className="text-[17px] text-gray-600 dark:text-gray-400">
                Choose from library
              </p>
            </div>
          </button>
        </div>
      </div>
    </DesktopModal>
  );
};
