import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export default function ImageZoomModal({ isOpen, onClose, imageUrl, alt = 'Document Image' }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom and position when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle zoom in
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  // Handle zoom out (restore to original)
  const handleZoomOut = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle double-click zoom on desktop
  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Mouse drag handlers (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for pinch-to-zoom (mobile)
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch drag
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistance > 0) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleChange = distance / lastPinchDistance;
      setScale((prev) => Math.max(1, Math.min(prev * scaleChange, 4)));
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Drag when zoomed
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setLastPinchDistance(0);
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  // Prevent scroll when modal is open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.95)',
          }}
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[101] w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Desktop Zoom Controls */}
          <div className="hidden md:flex absolute top-4 left-4 z-[101] gap-2">
            {/* Zoom In Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>

            {/* Zoom Out Button (Reset) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Minus className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Zoom Scale Indicator */}
          {scale > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[101] px-4 py-2 rounded-full text-white text-sm font-semibold"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {Math.round(scale * 100)}%
            </div>
          )}

          {/* Image Container */}
          <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              touchAction: 'none',
            }}
          >
            <motion.div
              ref={imageRef}
              animate={{
                scale,
                x: position.x,
                y: position.y,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="relative max-w-[90vw] max-h-[90vh]"
            >
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-full object-contain select-none"
                draggable={false}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
