import { useState, useRef, useEffect } from 'react';
import { RotateCw, Crop, Sliders, Check, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rotateImage, cropImage } from '../../../utils/imageCompression';
import { triggerHaptic } from '../../../utils/animations';

interface ImagePreviewScreenProps {
  file: File;
  onContinue: (processedFile: File) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImagePreviewScreen({
  file,
  onContinue,
  onCancel,
}: ImagePreviewScreenProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [processedFile, setProcessedFile] = useState<File>(file);
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [filterMode, setFilterMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Create object URL for preview
    const url = URL.createObjectURL(processedFile);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [processedFile]);

  const handleRotate = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    triggerHaptic('medium');

    try {
      const newRotation = (rotation + 90) % 360;
      const rotatedFile = await rotateImage(processedFile, 90);
      setProcessedFile(rotatedFile);
      setRotation(newRotation);
    } catch (error) {
      console.error('Rotation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropMode = () => {
    triggerHaptic('light');
    setCropMode(!cropMode);
    setFilterMode(false);

    if (!cropMode && imageRef.current) {
      // Initialize crop area to center 80% of image
      const img = imageRef.current;
      const width = img.naturalWidth * 0.8;
      const height = img.naturalHeight * 0.8;
      const x = (img.naturalWidth - width) / 2;
      const y = (img.naturalHeight - height) / 2;

      setCropArea({ x, y, width, height });
    }
  };

  const handleApplyCrop = async () => {
    if (!cropArea || isProcessing) return;

    setIsProcessing(true);
    triggerHaptic('medium');

    try {
      const croppedFile = await cropImage(processedFile, cropArea);
      setProcessedFile(croppedFile);
      setCropMode(false);
      setCropArea(null);
    } catch (error) {
      console.error('Crop failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilterMode = () => {
    triggerHaptic('light');
    setFilterMode(!filterMode);
    setCropMode(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleContinue = () => {
    triggerHaptic('success');
    onContinue(processedFile);
  };

  const handleCancel = () => {
    triggerHaptic('medium');
    onCancel();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-[#1a1625] via-[#231d32] to-[#1a1625]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Cancel</span>
        </button>

        <h1 className="text-xl font-semibold text-white">Preview & Edit</h1>

        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-800 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <Check className="w-5 h-5" />
        </button>
      </div>

      {/* Image Preview Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-6">
        <div
          className="relative"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.3s ease',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-[calc(100vh-250px)] object-contain rounded-2xl shadow-2xl"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            }}
          />

          {/* Crop Overlay */}
          {cropMode && cropArea && (
            <div className="absolute inset-0">
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Crop area */}
              <div
                className="absolute border-2 border-blue-600 bg-transparent"
                style={{
                  left: `${(cropArea.x / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                  top: `${(cropArea.y / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                  width: `${(cropArea.width / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                  height: `${(cropArea.height / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                }}
              >
                {/* Corner handles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 rounded-full" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 rounded-full" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 rounded-full" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            className="w-12 h-12 rounded-full bg-[rgba(26,22,37,0.9)] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-blue-600/20 hover:border-blue-600/50 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            className="w-12 h-12 rounded-full bg-[rgba(26,22,37,0.9)] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-blue-600/20 hover:border-blue-600/50 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Tools Bar */}
      <div className="px-6 py-4 border-t border-white/10 bg-[rgba(26,22,37,0.6)] backdrop-blur-xl">
        <div className="flex items-center justify-center gap-4">
          {/* Rotate Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRotate}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              isProcessing
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-blue-600/20 hover:border-blue-600/50'
            } border border-white/10`}
          >
            <RotateCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span className="font-medium">Rotate</span>
          </motion.button>

          {/* Crop Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCropMode}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all border ${
              cropMode
                ? 'bg-blue-600/30 border-blue-600 text-white'
                : isProcessing
                ? 'bg-white/5 text-white/30 cursor-not-allowed border-white/10'
                : 'bg-white/10 text-white hover:bg-blue-600/20 hover:border-blue-600/50 border-white/10'
            }`}
          >
            <Crop className="w-5 h-5" />
            <span className="font-medium">{cropMode ? 'Cancel Crop' : 'Crop'}</span>
          </motion.button>

          {/* Apply Crop Button (only show when in crop mode) */}
          <AnimatePresence>
            {cropMode && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-800 hover:to-blue-800 transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                <span className="font-medium">Apply</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFilterMode}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all border ${
              filterMode
                ? 'bg-blue-600/30 border-blue-600 text-white'
                : isProcessing
                ? 'bg-white/5 text-white/30 cursor-not-allowed border-white/10'
                : 'bg-white/10 text-white hover:bg-blue-600/20 hover:border-blue-600/50 border-white/10'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="font-medium">Adjust</span>
          </motion.button>
        </div>

        {/* Filter Controls */}
        <AnimatePresence>
          {filterMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-4"
            >
              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm font-medium">Brightness</label>
                  <span className="text-white/70 text-sm">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 rounded-full bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm font-medium">Contrast</label>
                  <span className="text-white/70 text-sm">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2 rounded-full bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
