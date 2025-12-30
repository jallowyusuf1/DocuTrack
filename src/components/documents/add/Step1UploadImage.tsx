import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, ArrowLeft, ArrowRight } from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../../utils/animations';
import { GlassButton } from '../../ui/glass/Glass';

interface Step1UploadImageProps {
  onImageSelected: (file: File) => void;
  onCancel: () => void;
}

export default function Step1UploadImage({ onImageSelected, onCancel }: Step1UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const reduced = prefersReducedMotion();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      triggerHaptic('light');
      onImageSelected(file);
    }
  };

  const handleTakePhoto = () => {
    triggerHaptic('light');
    cameraInputRef.current?.click();
  };

  const handleUploadImage = () => {
    triggerHaptic('light');
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              onCancel();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-xl">Add Document</h1>
            <p className="text-white/70 text-sm mt-0.5">Step 1 of 4</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="flex-1 h-1 rounded-full"
              style={{
                background: step === 1 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div
            className="rounded-3xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 55%, rgba(139,92,246,0.10) 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(34px) saturate(180%)',
              WebkitBackdropFilter: 'blur(34px) saturate(180%)',
              boxShadow: '0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
          >
            <h2 className="text-white font-semibold text-xl mb-6">Upload Document Image</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Take Photo */}
              <motion.button
                whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                onClick={handleTakePhoto}
                className="relative overflow-hidden rounded-2xl p-6 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Take Photo</h3>
                  <p className="text-white/60 text-sm">Use your camera</p>
                </div>
              </motion.button>

              {/* Upload Image */}
              <motion.button
                whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                onClick={handleUploadImage}
                className="relative overflow-hidden rounded-2xl p-6 text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Upload Image</h3>
                  <p className="text-white/60 text-sm">From your device</p>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
    </div>
  );
}

