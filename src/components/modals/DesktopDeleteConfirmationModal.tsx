import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle } from 'lucide-react';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';

interface Document {
  id: string;
  name: string;
  category: string;
  expiryDate?: string;
  imageUrl?: string;
}

interface DesktopDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: Document | null;
  affectedFamilyMembers?: number;
}

export default function DesktopDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  document,
  affectedFamilyMembers = 0,
}: DesktopDeleteConfirmationModalProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleConfirm = () => {
    triggerHaptic('medium');
    if (dontAskAgain) {
      sessionStorage.setItem('skipDeleteConfirmation', 'true');
    }
    onConfirm();
    onClose();
  };

  if (!document) return null;

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      width={560}
      height={420}
      showCloseButton={false}
      allowBackdropClose={false}
    >
      <div className="p-8 flex flex-col h-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[28px] font-bold text-white text-center mb-2">
          Delete Document?
        </h2>
        <p className="text-white/60 text-center mb-6">This cannot be undone</p>

        {/* Document Preview */}
        <div className="flex gap-6 mb-6 p-4 rounded-xl bg-white/5">
          {document.imageUrl ? (
            <img
              src={document.imageUrl}
              alt={document.name}
              className="w-40 h-[213px] rounded-lg object-cover"
            />
          ) : (
            <div className="w-40 h-[213px] rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-white mb-2">{document.name}</h3>
            <p className="text-sm text-white/60 mb-1">Category: {document.category}</p>
            {document.expiryDate && (
              <p className="text-sm text-white/60">Expires: {document.expiryDate}</p>
            )}
          </div>
        </div>

        {/* Impact Statement */}
        {affectedFamilyMembers > 0 && (
          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">
              This will also remove from {affectedFamilyMembers} family member{affectedFamilyMembers !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Don't Ask Again Checkbox */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-sm text-white/70">Don't ask again for this session</span>
        </label>

        {/* Buttons */}
        <div className="flex gap-4 mt-auto">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="flex-1 h-14 rounded-xl border-2 border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-14 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </DesktopModal>
  );
}

