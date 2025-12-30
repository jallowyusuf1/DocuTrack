import { Share2, Download, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../../utils/animations';

interface BulkActionsBarProps {
  selectedCount: number;
  onShare: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onShare,
  onExport,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  const handleAction = (action: () => void) => {
    triggerHaptic('medium');
    action();
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className="rounded-2xl px-6 py-4 flex items-center gap-6 min-w-[500px]"
            style={{
              background: 'rgba(26, 22, 37, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(37, 99, 235, 0.3)',
            }}
          >
            {/* Selected Count */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <span className="text-blue-300 font-bold text-sm">{selectedCount}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {selectedCount} {selectedCount === 1 ? 'document' : 'documents'} selected
                </p>
                <p className="text-white/50 text-xs">Choose an action</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-white/10" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction(onShare)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction(onExport)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction(onDelete)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            </div>

            {/* Clear Selection */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAction(onClearSelection)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
