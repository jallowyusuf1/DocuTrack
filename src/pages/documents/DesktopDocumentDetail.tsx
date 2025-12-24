import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { Document } from '../../types';
import DesktopNav from '../../components/layout/DesktopNav';
import DesktopDocumentSidebar from '../../components/documents/DesktopDocumentSidebar';
import DesktopDocumentPreview from '../../components/documents/DesktopDocumentPreview';
import DesktopDocumentInfoPanel from '../../components/documents/DesktopDocumentInfoPanel';
import DeleteConfirmationModal from '../../components/documents/DeleteConfirmationModal';
import PermissionGateModals from '../../components/child/PermissionGateModals';
import { decideChildAction } from '../../utils/childPermissions';

export default function DesktopDocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accountType, childContext } = useAuth();
  const { showToast } = useToast();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateMode, setGateMode] = useState<'permission_denied' | 'approval_required'>('permission_denied');
  const [isEditing, setIsEditing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Check if desktop and redirect if not
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    const checkDesktop = () => {
      if (window.innerWidth < 1024) {
        navigate(`/documents/${id}`);
      }
    };
    checkDesktop();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate, id]);

  // Fetch document and all documents
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [doc, allDocs] = await Promise.all([
          documentService.getDocumentById(id, user.id),
          documentService.getDocuments(user.id),
        ]);
        
        if (!doc) {
          setError('Document not found');
        } else {
          setDocument(doc);
          setAllDocuments(allDocs);
        }
      } catch (err: any) {
        console.error('Failed to fetch document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  // Find previous and next documents
  const currentIndex = allDocuments.findIndex((d) => d.id === id);
  const previousDocument = currentIndex > 0 ? allDocuments[currentIndex - 1] : null;
  const nextDocument = currentIndex < allDocuments.length - 1 ? allDocuments[currentIndex + 1] : null;

  // Get related documents (same category, excluding current)
  const relatedDocuments = allDocuments.filter(
    (d) => d.document_type === document?.document_type && d.id !== document?.id
  ).slice(0, 5);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (previousDocument) {
            navigate(`/documents/${previousDocument.id}`);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (nextDocument) {
            navigate(`/documents/${nextDocument.id}`);
          }
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          setIsEditing(true);
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          setIsDeleteModalOpen(true);
          break;
        case 'Escape':
          if (isEditing) {
            setIsEditing(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousDocument, nextDocument, navigate, isEditing]);

  const handleDelete = async () => {
    if (!document || !user?.id) return;

    try {
      if (accountType === 'child' && childContext) {
        const decision = decideChildAction({
          action: 'delete_document',
          permissions: childContext.permissions,
          oversightLevel: childContext.oversightLevel,
          isFamilyDocument: false,
        });
        if (decision.kind !== 'allow') {
          setGateMode(decision.reason);
          setGateOpen(true);
          setIsDeleteModalOpen(false);
          return;
        }
      }

      await documentService.deleteDocument(document.id, user.id);
      showToast('Document deleted successfully', 'success');
      navigate('/documents');
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      showToast('Failed to delete document', 'error');
    }
  };


  if (!isDesktop) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <DesktopNav />
        <div className="flex-1 flex items-center justify-center" style={{ marginTop: '104px' }}>
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col">
        <DesktopNav />
        <div className="flex-1 flex items-center justify-center" style={{ marginTop: '104px' }}>
          <div className="text-center">
            <p className="text-white text-lg mb-4">{error || 'Document not found'}</p>
            <button
              onClick={() => navigate('/documents')}
              className="px-6 py-3 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - navigate to edit page
  if (isEditing) {
    navigate(`/documents/${id}/edit`);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
      <DesktopNav />

      <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 104px)', marginTop: '104px' }}>
        {/* Sidebar - 280px */}
        <div className="flex-shrink-0 border-r border-white/10" style={{ width: '280px' }}>
          <DesktopDocumentSidebar
            document={document}
            allDocuments={allDocuments}
            previousDocument={previousDocument}
            nextDocument={nextDocument}
            relatedDocuments={relatedDocuments}
            onNavigate={(docId) => navigate(`/documents/${docId}`)}
            onBack={() => navigate('/documents')}
          />
        </div>

        {/* Main Content - Flexible */}
        <div className="flex-1 overflow-auto">
          <DesktopDocumentPreview document={document} />
        </div>

        {/* Info Panel - 380px */}
        <div className="flex-shrink-0 border-l border-white/10" style={{ width: '380px' }}>
          <DesktopDocumentInfoPanel
            document={document}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsDeleteModalOpen(true)}
            onShare={() => {
              // TODO: Open share modal
              showToast('Share functionality coming soon', 'info');
            }}
            onDownload={async () => {
              if (document.image_url) {
                try {
                  const { useImageUrl } = await import('../../hooks/useImageUrl');
                  // Download logic would go here
                  showToast('Download started', 'success');
                } catch (error) {
                  showToast('Failed to download', 'error');
                }
              }
            }}
            onMarkRenewed={() => {
              // TODO: Open renewal modal
              showToast('Mark as renewed functionality coming soon', 'info');
            }}
            onCustomizeReminders={() => {
              // TODO: Open reminders modal
              showToast('Customize reminders functionality coming soon', 'info');
            }}
          />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        documentName={document.document_name}
        document={document}
      />

      {accountType === 'child' && childContext && document && (
        <PermissionGateModals
          open={gateOpen}
          mode={gateMode}
          actionType="delete_document"
          document={document}
          onClose={() => setGateOpen(false)}
          onRequestSent={() => showToast(`Request sent to ${childContext.parentName}!`, 'success')}
        />
      )}
    </div>
  );
}

