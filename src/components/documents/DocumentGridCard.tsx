import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, MoreVertical, Download, RefreshCw, Trash2, Eye, AlertCircle, CreditCard, Shield, Plane, DollarSign, Receipt, FileCheck, Home, Heart, GraduationCap, Briefcase } from 'lucide-react';
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
  passport: Plane,
  visa: Plane,
  national_id: CreditCard,
  driver_license: CreditCard,
  id_card: CreditCard,
  insurance: Shield,
  health_insurance: Heart,
  auto_insurance: Shield,
  home_insurance: Home,
  subscription: Receipt,
  receipt: Receipt,
  bill: FileText,
  contract: FileCheck,
  bank_statement: DollarSign,
  credit_card: CreditCard,
  professional_license: Briefcase,
  academic_transcript: GraduationCap,
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
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    passport: { bg: 'rgba(59, 130, 246, 0.25)', border: 'rgba(96, 165, 250, 0.6)', text: '#60A5FA' },
    visa: { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(52, 211, 153, 0.6)', text: '#34D399' },
    national_id: { bg: 'rgba(139, 92, 246, 0.25)', border: 'rgba(167, 139, 250, 0.6)', text: '#A78BFA' },
    driver_license: { bg: 'rgba(234, 179, 8, 0.25)', border: 'rgba(251, 191, 36, 0.6)', text: '#FBBF24' },
    id_card: { bg: 'rgba(139, 92, 246, 0.25)', border: 'rgba(167, 139, 250, 0.6)', text: '#A78BFA' },
    insurance: { bg: 'rgba(236, 72, 153, 0.25)', border: 'rgba(244, 114, 182, 0.6)', text: '#F472B6' },
    health_insurance: { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(248, 113, 113, 0.6)', text: '#F87171' },
    auto_insurance: { bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(251, 191, 36, 0.6)', text: '#FBBF24' },
    home_insurance: { bg: 'rgba(99, 102, 241, 0.25)', border: 'rgba(129, 140, 248, 0.6)', text: '#818CF8' },
    subscription: { bg: 'rgba(168, 85, 247, 0.25)', border: 'rgba(192, 132, 252, 0.6)', text: '#C084FC' },
    receipt: { bg: 'rgba(34, 197, 94, 0.25)', border: 'rgba(74, 222, 128, 0.6)', text: '#4ADE80' },
    bill: { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(248, 113, 113, 0.6)', text: '#F87171' },
    contract: { bg: 'rgba(99, 102, 241, 0.25)', border: 'rgba(129, 140, 248, 0.6)', text: '#818CF8' },
    bank_statement: { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(52, 211, 153, 0.6)', text: '#34D399' },
    credit_card: { bg: 'rgba(234, 88, 12, 0.25)', border: 'rgba(251, 146, 60, 0.6)', text: '#FB923C' },
    professional_license: { bg: 'rgba(14, 165, 233, 0.25)', border: 'rgba(56, 189, 248, 0.6)', text: '#38BDF8' },
    academic_transcript: { bg: 'rgba(168, 85, 247, 0.25)', border: 'rgba(192, 132, 252, 0.6)', text: '#C084FC' },
  };

  return colors[type] || {
    bg: 'rgba(37, 99, 235, 0.25)',
    border: 'rgba(96, 165, 250, 0.6)',
    text: '#60A5FA',
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
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`rounded-[28px] overflow-hidden cursor-pointer ${
          isUrgent ? 'ring-2 ring-red-400/40' : ''
        }`}
        style={{
          background: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          boxShadow: isUrgent
            ? '0 8px 32px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="relative h-[220px] overflow-hidden">
          {imageLoading && !imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-pink-500/20 animate-pulse">
              <FileText className="w-16 h-16 text-blue-400/50" />
            </div>
          ) : imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={document.document_name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-pink-500/20">
              <FileText className="w-16 h-16 text-blue-400/50" />
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
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
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
                background: 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                  setIsMenuOpen(false);
                }}
                className="w-full h-12 px-4 flex items-center gap-3 hover:bg-blue-600/20 transition-colors border-b border-white/10"
              >
                <Eye className="w-4 h-4 text-white" />
                <span className="text-sm text-white">View Details</span>
              </button>

              <button
                onClick={handleDownload}
                className="w-full h-12 px-4 flex items-center gap-3 hover:bg-blue-600/20 transition-colors border-b border-white/10"
              >
                <Download className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Download</span>
              </button>

              <button
                onClick={handleRenewal}
                className="w-full h-12 px-4 flex items-center gap-3 hover:bg-blue-600/20 transition-colors border-b border-white/10"
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
