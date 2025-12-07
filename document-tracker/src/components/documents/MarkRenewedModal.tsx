import { useState } from 'react';
import { X } from 'lucide-react';
import type { Document } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface MarkRenewedModalProps {
  document: Document | null;
  onClose: () => void;
  onSave: (documentId: string, newExpirationDate: string) => Promise<void>;
}

export default function MarkRenewedModal({
  document,
  onClose,
  onSave,
}: MarkRenewedModalProps) {
  const [newExpirationDate, setNewExpirationDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!document) return null;

  const handleSave = async () => {
    if (!newExpirationDate) return;

    setIsSaving(true);
    try {
      await onSave(document.id, newExpirationDate);
      onClose();
    } catch (error) {
      console.error('Failed to update document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Set default to 1 year from today
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const defaultDateString = defaultDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mark as Renewed?</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Document Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Document</p>
          <p className="font-semibold text-gray-900">{document.document_name}</p>
        </div>

        {/* New Expiration Date */}
        <div className="mb-6">
          <Input
            type="date"
            label="New Expiration Date"
            value={newExpirationDate || defaultDateString}
            onChange={(e) => setNewExpirationDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="h-12"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isSaving}
            className="h-12"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={isSaving || !newExpirationDate}
            className="h-12"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

