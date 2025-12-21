import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { Document } from '../../types';
import { triggerHaptic } from '../../utils/animations';
import DocumentCard from './DocumentCard';

interface SwipeableCardProps {
  document: Document;
  onDelete: (document: Document) => void;
  onMarkRenewed: (document: Document) => void;
}

export default function SwipeableCard({
  document,
  onDelete,
  onMarkRenewed,
}: SwipeableCardProps) {
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) {
      // Swiped left enough to delete
      triggerHaptic('medium');
      onDelete(document);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete action background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 z-0">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 bg-white"
      >
        <DocumentCard document={document} onMarkRenewed={onMarkRenewed} />
      </motion.div>
    </div>
  );
}

