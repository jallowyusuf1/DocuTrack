import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreVertical, Edit, Share2, FileText, AlertCircle, Loader2, XCircle, Calendar, Clock, Download, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import { formatDate, getDaysUntil, getUrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import type { Document } from '../../types';
import Button from '../../components/ui/Button';
import RenewalModal from '../../components/documents/RenewalModal';
import DeleteConfirmationModal from '../../components/documents/DeleteConfirmationModal';
import ImageFullscreenModal from '../../components/documents/ImageFullscreenModal';
import NotesModal from '../../components/documents/NotesModal';
import Skeleton from '../../components/ui/Skeleton';
import Toast from '../../components/ui/Toast';
import { triggerHaptic } from '../../utils/animations';

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
  const [isImageFullscreenOpen, setIsImageFullscreenOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
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

  const getUrgencyColor = () => {
    if (isExpired || urgency === 'urgent') return '#EF4444';
    if (urgency === 'soon') return '#F97316';
    if (urgency === 'upcoming') return '#EAB308';
    return '#10B981';
  };

  const getUrgencyBannerStyle = () => {
    const color = getUrgencyColor();
    return {
      background: `${color}33`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${color}4D`,
      color: '#FFFFFF',
    };
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
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Failed to download image:', err);
      showToast('Failed to download image. Please try again.', 'error');
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!document || !imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${document.document_name}.jpg`, { type: blob.type });
      
      if (navigator.share) {
        await navigator.share({
          title: document.document_name,
          text: `Document: ${document.document_name}\nType: ${formatDocumentType(document.document_type)}\nExpires: ${formatDate(document.expiration_date)}`,
          files: [file],
        });
      } else {
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('.menu-dropdown-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  if (loading) {
    return (
      <div className="min-h-screen pb-[140px] relative overflow-hidden">
        {/* Background Gradient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Header Skeleton */}
          <header 
            className="sticky top-0 z-10 h-14 flex items-center px-4"
            style={{
              background: 'rgba(35, 29, 51, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="flex-1 h-6 mx-4 rounded" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </header>

          {/* Image Skeleton */}
          <Skeleton className="w-full aspect-[4/3] rounded-b-[32px]" />

          {/* Details Skeleton */}
          <div className="px-5 py-5 space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen pb-[140px] flex flex-col items-center justify-center px-4">
        <div 
          className="p-8 rounded-3xl text-center"
          style={{
            background: 'rgba(42, 38, 64, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Document Not Found</h2>
          <p className="text-sm text-glass-secondary mb-4">{error || 'The document you are looking for does not exist.'}</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="primary" onClick={() => navigate('/documents')}>
              View All Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[140px] relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
            transform: 'translate(50%, 50%)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header 
          className="sticky top-0 z-20 h-14 flex items-center px-4"
          style={{
            background: 'rgba(35, 29, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('light');
              navigate(-1);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(35, 29, 51, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <h1 className="flex-1 text-lg font-semibold text-white text-center mx-4">
            {formatDocumentType(document.document_type)}
          </h1>
          
          <div className="relative menu-dropdown-container">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                triggerHaptic('light');
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(35, 29, 51, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </motion.button>

            {/* Menu Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-12 right-0 w-[200px] rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(26, 22, 37, 0.95)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <button
                    onClick={handleDownload}
                    className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">Download Image</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRenewalModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
                  >
                    <RefreshCw className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">Mark as Renewed</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full h-12 px-4 flex items-center gap-3 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Delete Document</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="overflow-y-auto">
          {/* Document Image Hero */}
          <div className="relative w-full bg-gray-900">
            {imageUrlLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            )}
            {!imageError && imageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-b-[32px]">
                <img
                  src={imageUrl}
                  alt={document.document_name}
                  className={`w-full h-full object-cover cursor-pointer ${imageUrlLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                  onLoad={() => setImageError(false)}
                  onError={() => setImageError(true)}
                  onClick={() => setIsImageFullscreenOpen(true)}
                  crossOrigin="anonymous"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,22,37,0.9)] via-transparent to-transparent" />
                
                {/* Document Name and Type Badge Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-bold text-white mb-3">{document.document_name}</h2>
                  <div 
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                    style={{
                      background: 'rgba(35, 29, 51, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white">
                      {formatDocumentType(document.document_type)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] flex flex-col items-center justify-center text-gray-400 rounded-b-[32px]">
                <FileText className="w-16 h-16 mb-2" />
                <p className="text-sm mb-2">Failed to load image</p>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setImageError(false);
                    if (imageUrl && document) {
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-4 flex items-center justify-center gap-2"
              style={getUrgencyBannerStyle()}
            >
              {isExpired || urgency === 'urgent' ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertCircle className="w-5 h-5" />
                </motion.div>
              ) : urgency === 'soon' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {isExpired
                  ? `⚠️ Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago - Take action now!`
                  : urgency === 'urgent'
                  ? `⚠️ Expires in ${daysLeft} days - Take action now!`
                  : urgency === 'soon'
                  ? `🔔 Expires in ${daysLeft} days`
                  : `📅 Expires in ${daysLeft} days`}
              </span>
            </motion.div>
          )}

          {/* Document Details Card */}
          <div 
            className="mx-5 mt-5 rounded-3xl p-6"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Days Remaining Special Card */}
            <div 
              className="mb-6 p-4 rounded-2xl"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5" style={{ color: getUrgencyColor() }} />
                <span className="text-sm" style={{ color: '#A78BFA' }}>Days Remaining</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: getUrgencyColor() }}>
                {isExpired ? Math.abs(daysLeft) : daysLeft}
              </div>
              <div className="text-xs mt-1" style={{ color: '#A78BFA' }}>
                {isExpired ? 'days expired' : 'days remaining'}
              </div>
            </div>

            {/* Detail Rows */}
            <div className="space-y-0">
              {document.document_number && (
                <div className="flex items-center justify-between h-12 border-b border-white/5">
                  <span className="text-sm" style={{ color: '#A78BFA' }}>Document Number:</span>
                  <span className="text-sm font-semibold text-white">{document.document_number}</span>
                </div>
              )}
              
              {document.issue_date && (
                <div className="flex items-center justify-between h-12 border-b border-white/5">
                  <span className="text-sm" style={{ color: '#A78BFA' }}>Issue Date:</span>
                  <span className="text-sm font-semibold text-white">{formatDate(document.issue_date)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between h-12 border-b border-white/5">
                <span className="text-sm" style={{ color: '#A78BFA' }}>Expiration Date:</span>
                <span className="text-sm font-semibold" style={{ color: getUrgencyColor() }}>
                  {formatDate(document.expiration_date)}
                </span>
              </div>
              
              <div className="flex items-center justify-between h-12 border-b border-white/5">
                <span className="text-sm" style={{ color: '#A78BFA' }}>Category:</span>
                <span className="text-sm font-semibold text-white">
                  {formatDocumentType(document.category)}
                </span>
              </div>
              
              <div className="flex items-center justify-between h-12">
                <span className="text-sm" style={{ color: '#A78BFA' }}>Added On:</span>
                <span className="text-sm font-semibold text-white">
                  {formatDate(document.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {document.notes && (
            <motion.div 
              className="mx-5 mt-5 rounded-3xl p-6 cursor-pointer"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                triggerHaptic('light');
                setIsNotesModalOpen(true);
              }}
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 className="text-base font-bold mb-3" style={{ color: '#000000', background: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>Notes</h3>
              <div 
                className="rounded-xl p-4 max-h-[200px] overflow-y-auto"
                style={{
                  background: 'rgba(35, 29, 51, 0.5)',
                }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-3" style={{ color: '#A78BFA' }}>
                  {document.notes}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons Fixed at Bottom */}
        <div 
          className="fixed bottom-[88px] left-0 right-0 px-4 py-4 safe-area-bottom z-20"
          style={{
            background: 'rgba(26, 22, 37, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic('light');
                handleEdit();
              }}
              className="flex-1 h-[52px] rounded-xl flex items-center justify-center gap-2 font-medium"
              style={{
                background: 'rgba(35, 29, 51, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
              }}
            >
              <Edit className="w-5 h-5" style={{ color: '#A78BFA' }} />
              <span>Edit</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic('light');
                handleShare();
              }}
              className="flex-1 h-[52px] rounded-xl flex items-center justify-center gap-2 font-medium text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
              }}
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </motion.button>
          </div>
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

      {/* Fullscreen Image Modal */}
      {imageUrl && (
        <ImageFullscreenModal
          isOpen={isImageFullscreenOpen}
          onClose={() => setIsImageFullscreenOpen(false)}
          imageUrl={imageUrl}
          alt={document.document_name}
        />
      )}

      {/* Notes Modal */}
      {document && (
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          notes={document.notes || ''}
          documentName={document.document_name}
          createdAt={document.created_at}
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
