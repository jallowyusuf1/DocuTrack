import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { DesktopModal } from './DesktopModal';

interface Document {
  id: string;
  name: string;
  category: string;
  expiryDate?: string;
  thumbnail?: string;
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: Document;
  sharedWithCount?: number;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  document,
  sharedWithCount = 0,
}) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleConfirm = () => {
    if (dontAskAgain) {
      sessionStorage.setItem('skipDeleteConfirmation', 'true');
    }
    onConfirm();
  };

  return (
    <DesktopModal isOpen={isOpen} onClose={onClose} preventBackdropClose>
      <div
        className="bg-white dark:bg-gray-800"
        style={{
          width: '560px',
          height: '420px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '96px',
              height: '96px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
            }}
          >
            <Trash2 size={48} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Delete Document?
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          This action cannot be undone
        </p>

        {/* Document Preview */}
        <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 mb-6">
          {/* Thumbnail */}
          <div
            className="flex-shrink-0 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-xl overflow-hidden"
            style={{ width: '160px', height: '213px' }}
          >
            {document.thumbnail ? (
              <img
                src={document.thumbnail}
                alt={document.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Trash2 size={48} className="text-purple-300 dark:text-purple-600" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {document.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Category: {document.category}
            </p>
            {document.expiryDate && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expires: {new Date(document.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Impact Statement */}
        {sharedWithCount > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 mb-6">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              This will also remove this document from {sharedWithCount} family member{sharedWithCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Don't ask again checkbox */}
        <label className="flex items-center gap-2 mb-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            Don't ask again for this session
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold"
            style={{ height: '56px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
            style={{ height: '56px' }}
          >
            Delete
          </button>
        </div>
      </div>
    </DesktopModal>
  );
};
