import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  documentName: string;
  createdAt?: string;
}

export default function NotesModal({ isOpen, onClose, notes, documentName, createdAt }: NotesModalProps) {
  const formattedDate = createdAt 
    ? format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")
    : format(new Date(), "MMMM d, yyyy 'at' h:mm a");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.85)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{documentName || 'Notes'}</h2>
                  <p className="text-sm text-glass-secondary">{formattedDate}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Content */}
              <div 
                className="px-6 py-6 max-h-[70vh] overflow-y-auto"
                style={{
                  background: 'rgba(35, 29, 51, 0.3)',
                }}
              >
                <div className="space-y-4">
                  {notes.split('\n').map((line, index) => {
                    if (!line.trim()) return null;
                    return (
                      <div
                        key={index}
                        className="text-white text-base leading-relaxed"
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {line.trim()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

