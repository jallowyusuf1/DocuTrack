import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, MoreVertical, Download, RefreshCw, Trash2, Eye, AlertCircle } from 'lucide-react';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel, type UrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import { triggerHaptic } from '../../utils/animations';
import { useState, useEffect, useRef } from 'react';
import QuickNotes from './QuickNotes';
import BlurBar from './BlurBar';
import { documentService } from '../../services/documents';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import RenewalModal from './RenewalModal';

interface DocumentGridCardProps {
  document: Document;
}

const DOCUMENT_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  passport: FileText,
  visa: FileText,
  id_card: FileText,
  insurance: FileText,
  subscription: FileText,
  receipt: FileText,
  bill: FileText,
  contract: FileText,
  other: FileText,
};

const getUrgencyColor = (urgency: UrgencyLevel, daysLeft: number): string => {
  if (daysLeft < 0) return '#EF4444';
  switch (urgency) {
    case 'urgent':
      return '#EF4444';
    case 'soon':
      return '#F97316';
    case 'upcoming':
      return '#EAB308';
    default:
      return '#10B981';
  }
};

const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getDocumentTypeColor = (type: string): { bg: string; border: string; text: string } => {
  return {
    bg: 'rgba(139, 92, 246, 0.25)',
    border: 'rgba(167, 139, 250, 0.6)',
    text: '#C4B5FD',
  };
};

export default function DocumentGridCard({ document }: DocumentGridCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [daysLeft, setDaysLeft] = useState(() => getDaysUntil(document.expiration_date));
  const urgency = getUrgencyLevel(document.expiration_date);
  const urgencyColor = getUrgencyColor(urgency, daysLeft);
  const isUrgent = urgency === 'urgent' || daysLeft < 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const Icon = DOCUMENT_TYPE_ICONS[document.document_type] || FileText;
  const typeLabel = formatDocumentType(document.document_type);
  const typeColors = getDocumentTypeColor(document.document_type);

  const { signedUrl: imageUrl, loading: imageLoading } = useImageUrl(document.image_url);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const updateDaysLeft = () => {
      const newDaysLeft = getDaysUntil(document.expiration_date);
      setDaysLeft(newDaysLeft);
    };

    updateDaysLeft();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const initialTimeout = setTimeout(() => {
      updateDaysLeft();
      const interval = setInterval(updateDaysLeft, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilMidnight);

    return () => clearTimeout(initialTimeout);
  }, [document.expiration_date]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleClick = () => {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic('medium');

    if (!imageUrl) {
      showToast('Image not available for download', 'error');
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.document_name}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Document downloaded', 'success');
    } catch (error) {
      showToast('Failed to download document', 'error');
    }
  };

  const handleRenewal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic('medium');
    setIsRenewalModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic('medium');
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user?.id) return;

    try {
      await documentService.deleteDocument(document.id, user.id);
      showToast('Document deleted successfully', 'success');
      window.location.reload();
    } catch (error: any) {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleRenewalSubmit = async (newExpiryDate: string) => {
    if (!user?.id) return;

    try {
      await documentService.updateDocument(document.id, user.id, {
        expiration_date: newExpiryDate,
      });

      showToast('Document renewed successfully', 'success');
      setIsRenewalModalOpen(false);
      window.location.reload();
    } catch (error: any) {
      showToast('Failed to renew document', 'error');
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="rounded-3xl overflow-hidden cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, rgba(42, 38, 64, 0.95) 0%, rgba(35, 29, 51, 1) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isUrgent
            ? `0 8px 32px rgba(239, 68, 68, 0.4), 0 0 40px ${urgencyColor}30`
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="relative h-[220px] overflow-hidden">
          {imageLoading && !imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse">
              <FileText className="w-16 h-16 text-purple-400/50" />
            </div>
          ) : imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={document.document_name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <FileText className="w-16 h-16 text-purple-400/50" />
            </div>
          )}

          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: typeColors.bg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${typeColors.border}`,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: typeColors.text }} />
              <span className="text-[11px] font-semibold" style={{ color: typeColors.text }}>
                {typeLabel}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 rounded-full backdrop-blur-xl"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
          </div>

          <BlurBar
            daysLeft={daysLeft}
            urgencyColor={urgencyColor}
            expirationDate={document.expiration_date}
            isExpired={daysLeft < 0}
          />
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-base font-bold text-white leading-tight line-clamp-1">
              {document.document_name}
            </h3>

            {document.document_number && (
              <p className="text-xs text-white/60 mt-1 font-medium">
                {document.document_number}
              </p>
            )}
          </div>

          <QuickNotes documentId={document.id} initialNotes={document.notes || ''} />
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 right-3 rounded-2xl overflow-hidden z-50 min-w-[180px]"
              style={{
                background: 'rgba(30, 24, 44, 0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                  setIsMenuOpen(false);
                }}
                className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
              >
                <Eye className="w-4 h-4 text-white" />
                <span className="text-sm text-white">View Details</span>
              </button>

              <button
                onClick={handleDownload}
                className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
              >
                <Download className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Download</span>
              </button>

              <button
                onClick={handleRenewal}
                className="w-full h-12 px-4 flex items-center gap-3 hover:bg-purple-500/20 transition-colors border-b border-white/10"
              >
                <RefreshCw className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Mark Renewed</span>
              </button>

              <button
                onClick={handleDelete}
                className="w-full h-12 px-4 flex items-center gap-3 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Delete</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <RenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        onSubmit={handleRenewalSubmit}
        currentExpiryDate={document.expiration_date}
        documentName={document.document_name}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        documentName={document.document_name}
      />
    </div>
  );
}
