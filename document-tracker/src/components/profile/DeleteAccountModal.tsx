import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { supabase } from '../../config/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      // Delete all user documents
      const documents = await documentService.getDocuments(user.id);
      for (const doc of documents) {
        await documentService.deleteDocument(doc.id, user.id);
      }

      // Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      // Delete user account (auth) - Note: This requires admin privileges
      // For regular users, you might want to use a different approach
      // await supabase.auth.admin.deleteUser(user.id);
      
      // Alternative: Sign out the user
      await supabase.auth.signOut();

      onConfirm();
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Delete Account?
          </h2>
          <p className="text-sm text-gray-600">
            This will permanently delete all your documents and data. This
            action cannot be undone.
          </p>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <Input
            label="Type DELETE to confirm"
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="h-[52px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleDelete}
            disabled={isDeleting || confirmText !== 'DELETE'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

