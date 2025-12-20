import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  Trash2,
  RefreshCw,
  Bell,
  Calendar,
  Clock,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import { useImageUrl } from '../../hooks/useImageUrl';
import { getDaysUntil, getUrgencyLevel } from '../../utils/dateUtils';
import type { Document } from '../../types';
import ImageViewer from '../../components/documents/detail/ImageViewer';
import ActivityLog from '../../components/documents/detail/ActivityLog';
import RelatedDocuments from '../../components/documents/detail/RelatedDocuments';
import ShareSheetModal from '../../components/modals/ShareSheetModal';
import RenewalModal from '../../components/documents/RenewalModal';
import DeleteConfirmationModal from '../../components/documents/DeleteConfirmationModal';
import ReminderCustomizationModal from '../../components/documents/detail/ReminderCustomizationModal';
import Skeleton from '../../components/ui/Skeleton';
import { isDesktopDevice } from '../../utils/deviceDetection';

export default function ComprehensiveDocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isDesktop = isDesktopDevice();

  const [document, setDocument] = useState<Document | null>(null);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [sharedCount, setSharedCount] = useState(0);

  const { signedUrl: imageUrl, loading: imageUrlLoading } = useImageUrl(document?.image_url);

  // Fetch document and all documents
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const [doc, allDocs] = await Promise.all([
          documentService.getDocumentById(id, user.id),
          documentService.getAllDocuments(user.id),
        ]);

        if (!doc) {
          setError('Document not found');
        } else {
          setDocument(doc);
          setNotesValue(doc.notes || '');
          setAllDocuments(allDocs);
          // Fetch shared count
          // TODO: Implement shared count fetch
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
    (d) => d.category === document?.category && d.id !== document?.id
  ).slice(0, 5);

  // Calculate stats
  const daysRemaining = document ? getDaysUntil(document.expiration_date) : null;
  const urgencyLevel = document ? getUrgencyLevel(document.expiration_date) : 'upcoming';

  const getUrgencyColor = () => {
    if (!daysRemaining) return '#6B7280';
    if (daysRemaining < 0) return '#EF4444';
    if (daysRemaining <= 7) return '#EF4444';
    if (daysRemaining <= 30) return '#F59E0B';
    return '#10B981';
  };

  // Handle download
  const handleDownload = async () => {
    if (!imageUrl || !document) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document.document_name}.jpg`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast('Document downloaded', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download document', 'error');
    }
  };

  // Handle share
  const handleShare = async (members: string[], permission: 'view' | 'edit') => {
    if (!document || !user?.id) return;

    try {
      // TODO: Implement share functionality
      showToast('Document shared successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to share document', 'error');
    }
  };

  // Handle native share (mobile)
  const handleNativeShare = async () => {
    if (!document || !imageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.document_name,
          text: `Check out this document: ${document.document_name}`,
          url: imageUrl,
        });
      } catch (error) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback to share modal
      setIsShareModalOpen(true);
    }
  };

  // Handle renewal
  const handleRenewal = async (documentId: string, newExpirationDate: string) => {
    if (!user?.id) return;

    try {
      await documentService.updateDocument(documentId, user.id, {
        expiration_date: newExpirationDate,
      });
      setDocument((prev) => prev ? { ...prev, expiration_date: newExpirationDate } : null);
      showToast('Document renewed successfully', 'success');
      setIsRenewalModalOpen(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to renew document', 'error');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!document || !user?.id) return;

    try {
      await documentService.deleteDocument(document.id, user.id);
      showToast('Document deleted successfully', 'success');
      navigate('/documents');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete document', 'error');
    }
  };

  // Handle notes save
  const handleSaveNotes = async () => {
    if (!document || !user?.id) return;

    setIsSavingNotes(true);
    try {
      await documentService.updateDocument(document.id, user.id, {
        notes: notesValue,
      });
      setDocument((prev) => prev ? { ...prev, notes: notesValue } : null);
      setIsEditingNotes(false);
      showToast('Notes saved', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save notes', 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (previousDocument && isDesktop) {
            navigate(`/documents/${previousDocument.id}`);
          }
          break;
        case 'ArrowRight':
          if (nextDocument && isDesktop) {
            navigate(`/documents/${nextDocument.id}`);
          }
          break;
        case 'Escape':
          if (isImageViewerOpen) {
            setIsImageViewerOpen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousDocument, nextDocument, isDesktop, isImageViewerOpen, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#1a1625] p-4">
        <Skeleton className="h-64 w-full rounded-2xl mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#1a1625] flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Document Not Found</h2>
          <p className="text-white/60 mb-6">{error || 'The document you are looking for does not exist.'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/documents')}
            className="px-6 py-3 rounded-xl bg-purple-600 text-white font-medium"
          >
            Back to Documents
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#1a1625] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 border-b border-white/10 backdrop-blur-lg bg-[rgba(26,22,37,0.8)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/documents')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            {isDesktop && previousDocument && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/documents/${previousDocument.id}`)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                title="Previous document"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.button>
            )}
            {isDesktop && nextDocument && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/documents/${nextDocument.id}`)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                title="Next document"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/documents/${document.id}/edit`)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isDesktop ? () => setIsShareModalOpen(true) : handleNativeShare}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className={`grid gap-6 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {/* Main Content */}
          <div className={isDesktop ? 'col-span-2' : ''}>
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              {imageUrlLoading ? (
                <Skeleton className="h-96 w-full rounded-2xl" />
              ) : imageUrl ? (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer bg-black/20"
                  onClick={() => setIsImageViewerOpen(true)}
                >
                  <img
                    src={imageUrl}
                    alt={document.document_name}
                    className="w-full h-96 object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-white text-sm">Tap to view full screen</span>
                  </div>
                </motion.div>
              ) : (
                <div className="h-96 w-full rounded-2xl bg-white/10 flex items-center justify-center">
                  <FileText className="w-24 h-24 text-white/40" />
                </div>
              )}
            </motion.div>

            {/* Document Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{document.document_name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300">
                      {document.category}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${getUrgencyColor()}20`,
                        color: getUrgencyColor(),
                      }}
                    >
                      {urgencyLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-white/60 mb-1">Issue Date</p>
                  <p className="text-sm font-semibold text-white">
                    {document.issue_date ? format(new Date(document.issue_date), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-white/60 mb-1">Expiry Date</p>
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(document.expiration_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-white/60 mb-1">Days Remaining</p>
                  <p className="text-sm font-semibold" style={{ color: getUrgencyColor() }}>
                    {daysRemaining !== null ? (daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-4 rounded-xl bg-white/5 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                <div className="space-y-3">
                  {document.document_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Document Number</span>
                      <span className="text-white font-medium">{document.document_number}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Added</span>
                    <span className="text-white font-medium">
                      {format(new Date(document.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Last Modified</span>
                    <span className="text-white font-medium">
                      {format(new Date(document.updated_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Shared With</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {sharedCount} {sharedCount === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="p-4 rounded-xl bg-white/5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Notes</h3>
                  {!isEditingNotes && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditingNotes(true)}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                    >
                      Edit
                    </motion.button>
                  )}
                </div>
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      className="w-full h-32 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Add notes..."
                    />
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSavingNotes ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditingNotes(false);
                          setNotesValue(document.notes || '');
                        }}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/80 whitespace-pre-wrap">
                    {document.notes || 'No notes added'}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsRenewalModalOpen(true)}
                  className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Mark as Renewed
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsReminderModalOpen(true)}
                className="w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Customize Reminders
              </motion.button>
            </motion.div>
          </div>

          {/* Sidebar (Desktop) */}
          {isDesktop && (
            <div className="space-y-6">
              {/* Related Documents */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Related Documents</h3>
                <RelatedDocuments documents={relatedDocuments} currentDocumentId={document.id} />
              </div>

              {/* Activity Log */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Activity</h3>
                <ActivityLog documentId={document.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImageViewer
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={imageUrl || ''}
        imageName={document.document_name}
        onDownload={handleDownload}
      />

      <ShareSheetModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
        documentName={document.document_name}
        documentImage={imageUrl || undefined}
      />

      <RenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        document={document}
        onConfirm={handleRenewal}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        documentName={document.document_name}
        documentImage={imageUrl || undefined}
      />

      <ReminderCustomizationModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        documentId={document.id}
      />
    </div>
  );
}
