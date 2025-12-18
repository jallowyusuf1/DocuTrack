import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Maximize2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import type { Document } from '../../types';
import { useImageUrl } from '../../hooks/useImageUrl';

interface DesktopDocumentPreviewProps {
  document: Document;
}

export default function DesktopDocumentPreview({ document }: DesktopDocumentPreviewProps) {
  const { signedUrl: imageUrl } = useImageUrl(document.image_url);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when document changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [document.id]);

  // Handle zoom levels - Click cycles: 100% → 150% → 200% → 100%
  const handleZoomClick = () => {
    if (scale === 1) {
      setScale(1.5);
    } else if (scale === 1.5) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.25, 0.5);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleFitToScreen = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Mouse drag handlers
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

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => {
      const newScale = Math.max(0.5, Math.min(prev + delta, 3));
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  // Download handler
  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.document_name}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  // Fullscreen mode - Black background, centered image, controls top bar
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: '#000000' }}
        onClick={handleExitFullscreen}
      >
        {/* Controls Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-end gap-2 p-4 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-50"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-50"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFitToScreen}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Minus className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Download className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleExitFullscreen}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            ✕
          </motion.button>
        </div>
        
        {/* Centered Image */}
        <div
          className="relative max-w-[90vw] max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <motion.div
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
          >
            <img
              src={imageUrl || ''}
              alt={document.document_name}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      {/* Image Container with Zoom Controls */}
      <div className="relative" style={{ maxWidth: '900px', maxHeight: '1200px' }}>
        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleZoomClick}
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            maxWidth: '900px',
            maxHeight: '1200px',
          }}
        >
          {/* Zoom Controls - Top-right of image */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-50"
          style={{ background: 'rgba(42, 38, 64, 0.8)' }}
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-50"
          style={{ background: 'rgba(42, 38, 64, 0.8)' }}
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFitToScreen}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all"
          style={{ background: 'rgba(42, 38, 64, 0.8)' }}
        >
          <Minus className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFullscreen}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all"
          style={{ background: 'rgba(42, 38, 64, 0.8)' }}
        >
          <Maximize2 className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDownload}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all"
          style={{ background: 'rgba(42, 38, 64, 0.8)' }}
        >
          <Download className="w-5 h-5" />
        </motion.button>
          </div>

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
          className="relative rounded-lg overflow-hidden shadow-2xl"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            maxWidth: '900px',
            maxHeight: '1200px',
            aspectRatio: '3/4',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={document.document_name}
              className="w-full h-full object-contain select-none"
              draggable={false}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#F5F5F5' }}>
              <span className="text-4xl">📄</span>
            </div>
          )}
          </motion.div>
        </div>

        {/* Zoom Indicator */}
        {scale !== 1 && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm font-semibold"
            style={{ background: 'rgba(42, 38, 64, 0.8)' }}>
            {Math.round(scale * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}

