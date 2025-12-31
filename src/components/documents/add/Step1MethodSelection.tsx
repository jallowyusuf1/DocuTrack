import { motion } from 'framer-motion';
import { Camera, PenTool, Check, Lock } from 'lucide-react';
import GlassModal from '../../ui/glass/GlassModal';
import GlassTile from '../../ui/glass/GlassTile';
import GlassButton from '../../ui/glass/GlassButton';
import { prefersReducedMotion } from '../../../utils/animations';

interface Step1MethodSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onScanOrUpload: () => void;
  onManualEntry: () => void;
}

export default function Step1MethodSelection({
  isOpen,
  onClose,
  onScanOrUpload,
  onManualEntry,
}: Step1MethodSelectionProps) {
  const reduced = prefersReducedMotion();

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Document"
      subtitle="Choose how you'd like to add your document"
      size="medium"
    >
      <div className="space-y-4">
        {/* Method Card 1 - Camera/Upload */}
        <GlassTile interactive>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.4)',
              }}
            >
              <Camera className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Scan or Upload</h3>
            <p className="text-base text-white/70 mb-4">
              Take a photo or upload from device
            </p>
            <div className="w-full space-y-2 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-green-500" />
                <span>Auto OCR extraction</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-green-500" />
                <span>35+ document types</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-green-500" />
                <span>Smart field detection</span>
              </div>
            </div>
            <GlassButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={onScanOrUpload}
              icon={<Camera className="w-5 h-5" />}
            >
              Continue
            </GlassButton>
          </motion.div>
        </GlassTile>

        {/* Method Card 2 - Manual Entry */}
        <GlassTile interactive>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <PenTool className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Enter Manually</h3>
            <p className="text-base text-white/70 mb-4">
              Type information yourself
            </p>
            <div className="w-full space-y-2 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-white/60" />
                <span>Full control</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-white/60" />
                <span>Custom fields</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-white/60" />
                <span>Works offline</span>
              </div>
            </div>
            <GlassButton
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onManualEntry}
              icon={<PenTool className="w-5 h-5" />}
            >
              Continue
            </GlassButton>
          </motion.div>
        </GlassTile>

        {/* Footer Tile */}
        <GlassTile>
          <div className="flex items-center justify-center gap-2 text-sm text-white/60">
            <Lock className="w-4 h-4" />
            <span>Your data is encrypted end-to-end</span>
          </div>
        </GlassTile>
      </div>
    </GlassModal>
  );
}




