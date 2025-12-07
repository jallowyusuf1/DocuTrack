import Modal from '../ui/Modal';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  documentName: string;
}

export default function NotesModal({ isOpen, onClose, notes, documentName }: NotesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      type="center"
      size="large"
      showCloseButton={true}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Notes</h2>
        <p className="text-sm text-gray-600 mb-4">{documentName}</p>
        <div className="bg-gray-50 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {notes}
          </p>
        </div>
      </div>
    </Modal>
  );
}

