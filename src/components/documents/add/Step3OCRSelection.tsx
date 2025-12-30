import { motion } from 'framer-motion';
import { Search, PenTool, Check, Info } from 'lucide-react';
import GlassModal from '../../ui/glass/GlassModal';
import GlassTile from '../../ui/glass/GlassTile';
import GlassButton from '../../ui/glass/GlassButton';
import { prefersReducedMotion } from '../../../utils/animations';

interface Step3OCRSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSmartOCR: () => void;
  onManualEntry: () => void;
}

export default function Step3OCRSelection({
  isOpen,
  onClose,
  onSmartOCR,
  onManualEntry,
}: Step3OCRSelectionProps) {
  const reduced = prefersReducedMotion();

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="How would you like to extract data?"
      subtitle="We recommend Smart OCR for automatic extraction"
      size="medium"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Smart OCR Tile */}
        <GlassTile interactive>
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.95 }}
            animate={reduced ? undefined : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{
                  background: 'rgba(59, 130, 246, 0.8)',
                }}
              >
                RECOMMENDED
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                <Search className="w-12 h-12 text-blue-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Automatic OCR Extraction
              </h3>

              <div className="space-y-2 mb-6 text-left w-full">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Extracts text automatically</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Fills all fields instantly</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>95%+ accuracy guaranteed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Editable after extraction</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Supports 20+ languages</span>
                </div>
              </div>

              <div className="text-sm text-white/60 mb-4">
                Processing time: <span className="font-semibold">~3-5 seconds</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {['Passports', 'IDs', 'Licenses', 'Visas'].map((doc) => (
                  <span
                    key={doc}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: 'rgba(59, 130, 246, 1)',
                    }}
                  >
                    {doc}
                  </span>
                ))}
              </div>

              <GlassButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={onSmartOCR}
                icon={<Search className="w-5 h-5" />}
              >
                Scan with OCR
              </GlassButton>
            </div>
          </motion.div>
        </GlassTile>

        {/* Manual Entry Tile */}
        <GlassTile interactive>
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.95 }}
            animate={reduced ? undefined : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="flex-1 flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <PenTool className="w-12 h-12 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Type Information Manually
              </h3>

              <div className="space-y-2 mb-6 text-left w-full">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span>Full control over data</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span>Perfect for damaged docs</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span>No waiting time</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span>Works completely offline</span>
                </div>
              </div>

              <div
                className="text-sm text-white/60 mb-6 p-3 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                Best if document is damaged or hard to read
              </div>

              <GlassButton
                variant="secondary"
                size="lg"
                fullWidth
                onClick={onManualEntry}
                icon={<PenTool className="w-5 h-5" />}
              >
                Enter Manually
              </GlassButton>
            </div>
          </motion.div>
        </GlassTile>
      </div>

      {/* Info Tile */}
      <GlassTile>
        <details className="cursor-pointer">
          <summary className="flex items-center gap-2 text-white font-medium">
            <Info className="w-5 h-5" />
            Why use OCR?
          </summary>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>• How it works: AI analyzes your document image</p>
            <p>• Privacy & security: Processing is encrypted</p>
            <p>• Accuracy: 95%+ field detection rate</p>
            <p>• Limitations: Works best with clear, well-lit photos</p>
          </div>
        </details>
      </GlassTile>
    </GlassModal>
  );
}

