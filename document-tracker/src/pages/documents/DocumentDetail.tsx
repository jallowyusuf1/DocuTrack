import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Edit, Share2, FileText, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import { formatDate, getDaysUntil, getUrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import type { Document } from '../../types';
import Button from '../../components/ui/Button';
import MenuDropdown from '../../components/documents/MenuDropdown';
import RenewalModal from '../../components/documents/RenewalModal';
import DeleteConfirmationModal from '../../components/documents/DeleteConfirmationModal';
import NotesModal from '../../components/documents/NotesModal';
import ImageFullscreenModal from '../../components/documents/ImageFullscreenModal';
import Skeleton from '../../components/ui/Skeleton';
import Toast from '../../components/ui/Toast';

const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isImageFullscreenOpen, setIsImageFullscreenOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use hook to get signed URL
  const { signedUrl: imageUrl, loading: imageUrlLoading } = useImageUrl(document?.image_url);

  // Fetch document
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id || !user?.id) return;
      
      setLoading(true);
      setError(null);
      setImageError(false);
      
      try {
        const doc = await documentService.getDocumentById(id, user.id);
        if (!doc) {
          setError('Document not found');
        } else {
          setDocument(doc);
        }
      } catch (err: any) {
        console.error('Failed to fetch document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, user]);

  // Calculate urgency
  const daysLeft = document ? getDaysUntil(document.expiration_date) : 0;
  const urgency = document ? getUrgencyLevel(document.expiration_date) : null;
  const isExpired = daysLeft < 0;
  const showUrgencyBanner = document && daysLeft <= 30;

  const getUrgencyBannerColor = () => {
    if (isExpired || urgency === 'urgent') return 'bg-red-500';
    if (urgency === 'soon') return 'bg-orange-500';
    if (urgency === 'upcoming') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUrgencyTextColor = () => {
    if (isExpired || urgency === 'urgent') return 'text-red-600';
    if (urgency === 'soon') return 'text-orange-600';
    if (urgency === 'upcoming') return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Handle renewal
  const handleRenew = async (documentId: string, newExpirationDate: string) => {
    if (!user?.id) return;
    
    try {
      await documentService.updateDocument(documentId, user.id, {
        expiration_date: newExpirationDate,
      } as any);
      
      // Refresh document
      const updatedDoc = await documentService.getDocumentById(documentId, user.id);
      if (updatedDoc) {
        setDocument(updatedDoc);
      }
      
      showToast('Document renewed successfully!', 'success');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to renew document');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!document || !user?.id) return;
    
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(document.id, user.id);
      showToast('Document deleted', 'success');
      navigate('/documents', { replace: true });
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      showToast('Failed to delete document. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!document || !imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.document_name}.${blob.type.split('/')[1] || 'jpg'}`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      showToast('Image downloaded', 'success');
    } catch (err) {
      console.error('Failed to download image:', err);
      showToast('Failed to download image. Please try again.', 'error');
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!document || !imageUrl) return;
    
    try {
      // Fetch image as blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${document.document_name}.jpg`, { type: blob.type });
      
      // Share using Web Share API
      if (navigator.share) {
        await navigator.share({
          title: document.document_name,
          text: `Document: ${document.document_name}\nType: ${formatDocumentType(document.document_type)}\nExpires: ${formatDate(document.expiration_date)}`,
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard or download
        handleDownload();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share:', err);
        showToast('Failed to share document. Please try again.', 'error');
      }
    }
  };

  // Handle edit
  const handleEdit = () => {
    navigate(`/documents/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-[140px]">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-14 flex items-center px-4">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="flex-1 h-6 mx-4 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </header>
        <Skeleton className="w-full aspect-[4/3] bg-gray-200" />
        <div className="bg-white p-5 space-y-4">
          <Skeleton className="h-8 w-3/4 rounded" />
          <Skeleton className="h-12 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 pb-[140px] flex flex-col items-center justify-center px-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Document Not Found</h2>
        <p className="text-gray-600 mb-4 text-center">{error || 'The document you are looking for does not exist.'}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/documents')}>
            View All Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-[140px]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-14 flex items-center px-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-gray-900 text-center mx-4">
          {formatDocumentType(document.document_type)}
        </h1>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <MoreVertical className="w-6 h-6 text-gray-700" />
          </button>
          <MenuDropdown
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onDownload={handleDownload}
            onRenew={() => setIsRenewalModalOpen(true)}
            onDelete={() => setIsDeleteModalOpen(true)}
          />
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="overflow-y-auto">
        {/* Document Image */}
        <div className="relative w-full bg-gray-100 aspect-[4/3] flex items-center justify-center">
          {imageUrlLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={document.document_name}
              className={`w-full h-full object-contain cursor-pointer ${imageUrlLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onLoad={() => {
                setImageError(false);
              }}
              onError={(e) => {
                console.error('Image load error:', e);
                console.error('Failed image URL:', imageUrl);
                console.error('Stored image_url:', document.image_url);
                setImageError(true);
              }}
              onClick={() => setIsImageFullscreenOpen(true)}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-16 h-16 mb-2" />
              <p className="text-sm">Failed to load image</p>
              <Button
                variant="secondary"
                size="small"
                className="mt-2"
                onClick={() => {
                  // Retry by reloading the image
                  setImageError(false);
                  if (imageUrl && document) {
                    // Force reload by adding timestamp
                    const img = window.document.querySelector(`img[alt="${document.document_name}"]`) as HTMLImageElement;
                    if (img) {
                      img.src = imageUrl + '?t=' + Date.now();
                    }
                  }
                }}
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Urgency Banner */}
        {showUrgencyBanner && (
          <div className={`${getUrgencyBannerColor()} text-white px-4 py-3 flex items-center gap-2`}>
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isExpired
                ? `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago!`
                : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`}
            </span>
          </div>
        )}

        {/* Document Details */}
        <div className="bg-white px-5 py-5">
          {/* Document Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">{document.document_name}</h2>

          {/* Document Type Badge */}
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 mb-6">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">
              {formatDocumentType(document.document_type)}
            </span>
          </div>

          {/* Detail Rows */}
          <div className="space-y-0">
            {document.document_number && (
              <div className="flex items-center justify-between h-11 border-b border-gray-200">
                <span className="text-sm text-gray-600">Document Number:</span>
                <span className="text-sm font-medium text-gray-900">{document.document_number}</span>
              </div>
            )}
            
            {document.issue_date && (
              <div className="flex items-center justify-between h-11 border-b border-gray-200">
                <span className="text-sm text-gray-600">Issue Date:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(document.issue_date)}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between h-11 border-b border-gray-200">
              <span className="text-sm text-gray-600">Expiration Date:</span>
              <span className={`text-sm font-medium ${getUrgencyTextColor()}`}>
                {formatDate(document.expiration_date)}
              </span>
            </div>
            
            <div className="flex items-center justify-between h-11 border-b border-gray-200">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium ${getUrgencyTextColor()}`}>
                {isExpired
                  ? `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`
                  : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
              </span>
            </div>
            
            <div className="flex items-center justify-between h-11 border-b border-gray-200">
              <span className="text-sm text-gray-600">Category:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDocumentType(document.category)}
              </span>
            </div>
            
            <div className="flex items-center justify-between h-11">
              <span className="text-sm text-gray-600">Added On:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(document.created_at)}
              </span>
            </div>
          </div>

          {/* Notes Section */}
          {document.notes && (
            <div className="mt-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">Notes</h3>
              <button
                onClick={() => setIsNotesModalOpen(true)}
                className="w-full bg-gray-50 rounded-xl p-4 max-h-[200px] overflow-y-auto text-left hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                  {document.notes}
                </p>
                {document.notes.length > 200 && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">Tap to view full notes</p>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-area-bottom">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleEdit}
            className="h-[52px] flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleShare}
            className="h-[52px] flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </Button>
        </div>
      </div>

      {/* Renewal Modal */}
      <RenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        document={document}
        onConfirm={handleRenew}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        documentName={document.document_name}
        isLoading={isDeleting}
      />

      {/* Notes Modal */}
      {document.notes && (
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          notes={document.notes}
          documentName={document.document_name}
        />
      )}

      {/* Fullscreen Image Modal */}
      {imageUrl && (
        <ImageFullscreenModal
          isOpen={isImageFullscreenOpen}
          onClose={() => setIsImageFullscreenOpen(false)}
          imageUrl={imageUrl}
          alt={document.document_name}
        />
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

