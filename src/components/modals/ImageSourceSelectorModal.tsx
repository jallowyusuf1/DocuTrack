import { motion } from 'framer-motion';
import { Camera, Upload } from 'lucide-react';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';

interface ImageSourceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCamera: () => void;
  onUpload: () => void;
}

export default function ImageSourceSelectorModal({
  isOpen,
  onClose,
  onCamera,
  onUpload,
}: ImageSourceSelectorModalProps) {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      width={600}
      height={400}
      showCloseButton={false}
    >
      <div className="p-8 flex items-center justify-center gap-6 h-full">
        {/* Camera Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onKeyDown={(e) => handleKeyDown(e, onCamera)}
          onClick={() => {
            triggerHaptic('medium');
            onCamera();
          }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl transition-all"
          style={{
            width: '260px',
            height: '280px',
            background: 'rgba(37, 99, 235, 0.1)',
            border: '2px solid rgba(37, 99, 235, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(37, 99, 235, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)';
          }}
        >
          <Camera className="w-24 h-24 text-blue-400" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Camera</h3>
            <p className="text-[17px] text-white/70">Take a photo</p>
          </div>
        </motion.button>

        {/* Upload Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onKeyDown={(e) => handleKeyDown(e, onUpload)}
          onClick={() => {
            triggerHaptic('medium');
            onUpload();
          }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl transition-all"
          style={{
            width: '260px',
            height: '280px',
            background: 'rgba(37, 99, 235, 0.1)',
            border: '2px solid rgba(37, 99, 235, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(37, 99, 235, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)';
          }}
        >
          <Upload className="w-24 h-24 text-blue-400" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Upload</h3>
            <p className="text-[17px] text-white/70">Choose from files</p>
          </div>
        </motion.button>
      </div>
    </DesktopModal>
  );
}

