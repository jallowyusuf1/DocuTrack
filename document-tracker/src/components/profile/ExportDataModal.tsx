import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import Button from '../ui/Button';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDataModal({
  isOpen,
  onClose,
}: ExportDataModalProps) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user?.id) return;

    setIsExporting(true);
    try {
      // Fetch all documents
      const documents = await documentService.getDocuments(user.id);

      // Create export data
      const exportData = {
        user: {
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
        },
        documents: documents.map((doc) => ({
          id: doc.id,
          document_type: doc.document_type,
          document_name: doc.document_name,
          document_number: doc.document_number,
          issue_date: doc.issue_date,
          expiration_date: doc.expiration_date,
          category: doc.category,
          notes: doc.notes,
          image_url: doc.image_url,
          created_at: doc.created_at,
        })),
        exported_at: new Date().toISOString(),
      };

      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `docutrack-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
      alert('Data exported successfully!');
    } catch (error: any) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Export All Documents?</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Creates a JSON file with all your documents and data. This file can be
          used to backup or restore your data.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2 inline" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

