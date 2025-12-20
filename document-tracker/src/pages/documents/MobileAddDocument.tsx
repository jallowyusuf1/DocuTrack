import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DocumentFormData } from '../../types';
import AddDocumentFlow from '../../components/documents/add/AddDocumentFlow';
import { isMobileDevice } from '../../utils/deviceDetection';

export default function MobileAddDocument() {
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
      
      // Trigger refresh event for dashboard
      window.dispatchEvent(new CustomEvent('refreshDashboard'));
      
      // Navigation will happen in SuccessAnimation component
    } catch (error: any) {
      console.error('Failed to create document:', error);
      const errorMessage = error.message || 'Failed to add document. Please try again.';
      showToast(errorMessage, 'error');
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
      isDesktop={false}
      isMobile={isMobileDevice()}
    />
  );
}
