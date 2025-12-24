import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DocumentFormData } from '../../types';
import AddDocumentFlow from '../../components/documents/add/AddDocumentFlow';
import { isDesktopDevice } from '../../utils/deviceDetection';
import PermissionGateModals from '../../components/child/PermissionGateModals';
import { decideChildAction } from '../../utils/childPermissions';

export default function DesktopAddDocument() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, accountType, childContext } = useAuth();
  const { showToast } = useToast();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateMode, setGateMode] = useState<'permission_denied' | 'approval_required'>('permission_denied');

  const scope = (searchParams.get('scope') === 'expire_soon' ? 'expire_soon' : 'dashboard') as any;

  const handleSubmit = async (data: DocumentFormData) => {
    if (!user?.id) {
      showToast('Please log in to add documents', 'error');
      return;
    }

    try {
      if (accountType === 'child' && childContext) {
        const decision = decideChildAction({
          action: 'add_document',
          permissions: childContext.permissions,
          oversightLevel: childContext.oversightLevel,
          isFamilyDocument: false,
        });
        if (decision.kind !== 'allow') {
          setGateMode(decision.reason);
          setGateOpen(true);
          // Log attempt
          childContext.childAccountId &&
            (await Promise.resolve().then(() =>
              import('../../services/childAccounts').then(({ childAccountsService }) =>
                childAccountsService.logActivity({
                  child_account_id: childContext.childAccountId,
                  action_type: 'document_add_attempt',
                  status: decision.reason === 'approval_required' ? 'pending' : 'denied',
                  details: { scope },
                }).catch(() => {})
              )
            ));
          return;
        }
      }

      await documentService.createDocument(data, user.id, scope);
      showToast('Document added successfully!', 'success');
      if (accountType === 'child' && childContext?.childAccountId) {
        import('../../services/childAccounts').then(({ childAccountsService }) =>
          childAccountsService.logActivity({
            child_account_id: childContext.childAccountId,
            action_type: 'document_added',
            status: 'success',
            details: { scope },
          }).catch(() => {})
        );
      }
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
    <>
      <AddDocumentFlow
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isDesktop={isDesktopDevice()}
        isMobile={false}
      />

      {accountType === 'child' && childContext && (
        <PermissionGateModals
          open={gateOpen}
          mode={gateMode}
          actionType="add_document"
          document={null}
          onClose={() => setGateOpen(false)}
          onRequestSent={() => showToast(`Request sent to ${childContext.parentName}!`, 'success')}
        />
      )}
    </>
  );
}
