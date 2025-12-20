import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DocumentFormData } from '../../types';
import AddDocumentFlow from '../../components/documents/add/AddDocumentFlow';
import { isDesktopDevice } from '../../utils/deviceDetection';

export default function DesktopAddDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (data: DocumentFormData) => {
    if (!user?.id) {
      showToast('Please log in to add documents', 'error');
      return;
    }

    try {
      await documentService.createDocument(data, user.id);
      showToast('Document added successfully!', 'success');
      // Navigation will happen in SuccessAnimation component
    } catch (error: any) {
      console.error('Error adding document:', error);
      showToast(error.message || 'Failed to add document', 'error');
      throw error; // Re-throw to let flow handle error state
    }
  };

  const handleCancel = () => {
    navigate('/documents');
  };

  return (
    <AddDocumentFlow
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isDesktop={isDesktopDevice()}
      isMobile={false}
    />
  );
}
