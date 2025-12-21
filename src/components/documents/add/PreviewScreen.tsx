import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, RotateCcw, Crop, Filter, Check, X, ArrowLeft } from 'lucide-react';
import { rotateImage, cropImage } from '../../../utils/imageCompression';

interface PreviewScreenProps {
  imageFile: File;
  imagePreview: string;
  onContinue: (processedFile: File) => void;
  onBack: () => void;
}

export default function PreviewScreen({
  imageFile,
  imagePreview,
  onContinue,
  onBack,
}: PreviewScreenProps) {
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File>(imageFile);
  const [currentPreview, setCurrentPreview] = useState<string>(imagePreview);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<string>('none');

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);

  // Rotate image
  const handleRotate = async (direction: 'left' | 'right') => {
    setIsProcessing(true);
    try {
      const degrees = direction === 'left' ? -90 : 90;
      const newRotation = (rotation + degrees) % 360;
      setRotation(newRotation);

      const rotatedFile = await rotateImage(currentFile, degrees);
      setCurrentFile(rotatedFile);

      // Update preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(rotatedFile);
    } catch (error) {
      console.error('Error rotating image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start crop
  const handleStartCrop = () => {
    setIsCropping(true);
    setCropArea(null);
  };

  // Handle crop area selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropping || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cropStartRef.current = { x, y };
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !cropStartRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = Math.abs(currentX - cropStartRef.current.x);
    const height = Math.abs(currentY - cropStartRef.current.y);

    setCropArea({
      x: Math.min(cropStartRef.current.x, currentX),
      y: Math.min(cropStartRef.current.y, currentY),
      width,
      height,
    });
  };

  const handleMouseUp = () => {
    cropStartRef.current = null;
  };

  // Apply crop
  const handleApplyCrop = async () => {
    if (!cropArea || !imageRef.current) return;

    setIsProcessing(true);
    try {
      // Calculate crop area relative to image
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const scaleX = imageRef.current.naturalWidth / imgRect.width;
      const scaleY = imageRef.current.naturalHeight / imgRect.height;

      const cropData = {
        x: (cropArea.x - (imgRect.left - containerRect.left)) * scaleX,
        y: (cropArea.y - (imgRect.top - containerRect.top)) * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY,
      };

      const croppedFile = await cropImage(currentFile, cropData);
      setCurrentFile(croppedFile);

      // Update preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(croppedFile);

      setIsCropping(false);
      setCropArea(null);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel crop
  const handleCancelCrop = () => {
    setIsCropping(false);
    setCropArea(null);
  };

  // Apply filter
  const getFilterStyle = () => {
    switch (filter) {
      case 'grayscale':
        return { filter: 'grayscale(100%)' };
      case 'sepia':
        return { filter: 'sepia(100%)' };
      case 'brightness':
        return { filter: 'brightness(1.2)' };
      case 'contrast':
        return { filter: 'contrast(1.2)' };
      default:
        return {};
    }
  };

  // Continue to form
  const handleContinue = () => {
    onContinue(currentFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#1a1625] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(42, 38, 64, 0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h2 className="text-lg font-semibold text-white">Preview & Edit</h2>
        <div className="w-10" />
      </div>

      {/* Image Preview */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={currentPreview}
          alt="Preview"
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `rotate(${rotation}deg)`,
            ...getFilterStyle(),
          }}
        />

        {/* Crop Overlay */}
        {isCropping && cropArea && (
          <div
            className="absolute border-2 border-purple-500 bg-purple-500/20"
            style={{
              left: `${cropArea.x}px`,
              top: `${cropArea.y}px`,
              width: `${cropArea.width}px`,
              height: `${cropArea.height}px`,
              pointerEvents: 'none',
            }}
          >
            {/* Crop Handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 rounded-full" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-white/10 space-y-4">
        {/* Rotate Controls */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRotate('left')}
            disabled={isProcessing}
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </motion.button>

          <span className="text-white/60 text-sm">{rotation}°</span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRotate('right')}
            disabled={isProcessing}
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <RotateCw className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Crop Controls */}
        {!isCropping ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartCrop}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <Crop className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Crop</span>
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelCrop}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <X className="w-5 h-5 text-red-400" />
              <span className="text-white font-medium">Cancel</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyCrop}
              disabled={!cropArea || isProcessing}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Apply</span>
            </motion.button>
          </div>
        )}

        {/* Filter Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilter(!showFilter)}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Filter className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Filter</span>
        </motion.button>

        {/* Filter Options */}
        {showFilter && (
          <div className="grid grid-cols-2 gap-2">
            {['none', 'grayscale', 'sepia', 'brightness', 'contrast'].map((f) => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                className={`py-2 rounded-lg text-sm font-medium ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </motion.button>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={isProcessing}
          className="w-full py-4 rounded-xl font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
          }}
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </motion.button>
      </div>
    </div>
  );
}
